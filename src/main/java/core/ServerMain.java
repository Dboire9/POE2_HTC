package core;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Candidate;
import core.Crafting.Crafting_Item;
import core.Crafting.CraftingExecutor;
import core.Crafting.ProgressTracker;
import core.Crafting.ThresholdConfig;
import core.Crafting.Probabilities.Probability_Analyzer;
import core.Crafting.Utils.ModifierEvent;
import core.Currency.Essence_currency;
import core.Items.Item_base;
import core.Modifier_class.Modifier;
import core.Modifier_class.ModifierTier;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;

public class ServerMain {
    public static void main(String[] args) {
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

            // CORS preflight handler for all routes
            server.createContext("/", exchange -> {
                if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                    exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                    exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                    exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
                    exchange.sendResponseHeaders(204, -1);
                    return;
                }
                // Let other handlers process non-OPTIONS requests
                sendJson(exchange, 404, "{\"error\":\"Not found\"}");
            });

            // Health endpoint
            server.createContext("/health", exchange -> {
                if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                    exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                    exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                    exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
                    exchange.sendResponseHeaders(204, -1);
                    return;
                }
                sendJson(exchange, 200, "{\"status\":\"ok\"}");
            });

            // Items endpoint
            server.createContext("/api/items", new ItemsHandler());

            // Modifiers endpoint
            server.createContext("/api/modifiers", new ModifiersHandler());

            // Currencies endpoint
            server.createContext("/api/currencies", new CurrenciesHandler());

            // Crafting calculation endpoint
            server.createContext("/api/calculate", new CraftingHandler());

            // Progress tracking endpoint
            server.createContext("/api/progress/", new ProgressHandler());

            // Cancellation endpoint
            server.createContext("/api/cancel/", new CancelHandler());

            server.setExecutor(Executors.newCachedThreadPool());
            server.start();
            System.out.println("POE2 backend server started (no UI) on http://localhost:8080");
        } catch (IOException e) {
            System.err.println("Failed to start HTTP server: " + e.getMessage());
            e.printStackTrace();
        }
    }

    static class ItemsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }
            ItemManager manager = new ItemManager();
            List<String> categories = manager.getCategories();
            // Build a simple JSON array of {id,name}
            StringBuilder sb = new StringBuilder();
            sb.append('[');
            for (int i = 0; i < categories.size(); i++) {
                String c = categories.get(i);
                sb.append('{')
                  .append("\"id\":\"").append(escapeJson(c)).append("\",")
                  .append("\"name\":\"").append(escapeJson(c)).append("\"}");
                if (i < categories.size() - 1) sb.append(',');
            }
            sb.append(']');
            sendJson(exchange, 200, sb.toString());
        }
    }

    static class ModifiersHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }

            try {
                // Parse query parameters
                String query = exchange.getRequestURI().getQuery();
                String itemId = null;
                String currencyType = "normal"; // default to normal modifiers
                
                if (query != null) {
                    String[] pairs = query.split("&");
                    for (String pair : pairs) {
                        String[] keyValue = pair.split("=");
                        if (keyValue.length == 2) {
                            String key = java.net.URLDecoder.decode(keyValue[0], "UTF-8");
                            String value = java.net.URLDecoder.decode(keyValue[1], "UTF-8");
                            if ("itemId".equals(key)) {
                                itemId = value;
                            } else if ("currencyType".equals(key)) {
                                currencyType = value; // "normal", "essence", or "desecrated"
                            }
                        }
                    }
                }
                
                if (itemId == null) {
                    sendJson(exchange, 400, "{\"error\":\"Missing itemId parameter\"}");
                    return;
                }
                
                String packagePath = "core.Items." + itemId;
                List<String> subCategories = new ItemManager().getSubCategories(itemId);
                
                // Try to load the class - handle both subcategory and direct class patterns
                String fullClassName;
                if (!subCategories.isEmpty()) {
                    // Has subcategories: core.Items.Body_Armours.AR_Plate.AR_Plate
                    String subCat = subCategories.get(0);
                    fullClassName = packagePath + "." + subCat + "." + subCat;
                } else {
                    // Direct class: core.Items.Bows.Bows
                    fullClassName = packagePath + "." + itemId;
                }
                
                Class<?> itemClass = Class.forName(fullClassName);
                Item_base itemInstance = (Item_base) itemClass.getDeclaredConstructor().newInstance();
                
                // Get modifiers based on currency type
                List<Modifier> prefixes;
                List<Modifier> suffixes;
                
                switch (currencyType.toLowerCase()) {
                    case "essence":
                    case "perfect":
                        // Get all essence modifiers, then filter to only PERFECT_ESSENCE
                        List<Modifier> allEssencePrefixes = itemInstance.getEssencesAllowedPrefixes();
                        List<Modifier> allEssenceSuffixes = itemInstance.getEssencesAllowedSuffixes();
                        
                        prefixes = new ArrayList<>();
                        suffixes = new ArrayList<>();
                        
                        // Filter for PERFECT_ESSENCE only
                        for (Modifier mod : allEssencePrefixes) {
                            if (mod.source == Modifier.ModifierSource.PERFECT_ESSENCE) {
                                prefixes.add(mod);
                            }
                        }
                        for (Modifier mod : allEssenceSuffixes) {
                            if (mod.source == Modifier.ModifierSource.PERFECT_ESSENCE) {
                                suffixes.add(mod);
                            }
                        }
                        break;
                    case "desecrated":
                        prefixes = itemInstance.getDesecratedAllowedPrefixes();
                        suffixes = itemInstance.getDesecratedAllowedSuffixes();
                        break;
                    default:
                        prefixes = itemInstance.getNormalAllowedPrefixes();
                        suffixes = itemInstance.getNormalAllowedSuffixes();
                        break;
                }
                
                // Build JSON response as flat array with type field
                StringBuilder sb = new StringBuilder();
                sb.append("[");
                
                // Add prefixes with unique IDs
                for (int i = 0; i < prefixes.size(); i++) {
                    Modifier mod = prefixes.get(i);
                    // Create unique ID by combining family with index to handle duplicate families
                    String uniqueId = mod.family + "_" + i;
                    sb.append("{")
                      .append("\"id\":\"").append(escapeJson(uniqueId)).append("\",")
                      .append("\"family\":\"").append(escapeJson(mod.family)).append("\",")
                      .append("\"name\":\"").append(escapeJson(mod.text)).append("\",")
                      .append("\"type\":\"PREFIX\",")
                      .append("\"tiers\":").append(mod.tiers.size())
                      .append("}");
                    if (i < prefixes.size() - 1 || suffixes.size() > 0) sb.append(',');
                }
                
                // Add suffixes with unique IDs
                for (int i = 0; i < suffixes.size(); i++) {
                    Modifier mod = suffixes.get(i);
                    // Create unique ID by combining family with index to handle duplicate families
                    String uniqueId = mod.family + "_" + i;
                    sb.append("{")
                      .append("\"id\":\"").append(escapeJson(uniqueId)).append("\",")
                      .append("\"family\":\"").append(escapeJson(mod.family)).append("\",")
                      .append("\"name\":\"").append(escapeJson(mod.text)).append("\",")
                      .append("\"type\":\"SUFFIX\",")
                      .append("\"tiers\":").append(mod.tiers.size())
                      .append("}");
                    if (i < suffixes.size() - 1) sb.append(',');
                }
                
                sb.append("]");
                
                sendJson(exchange, 200, sb.toString());
                
            } catch (Exception e) {
                System.err.println("Error loading modifiers: " + e.getMessage());
                e.printStackTrace();
                sendJson(exchange, 500, "{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    /**
     * Handles GET /api/currencies requests.
     * Returns a list of all available crafting currencies with their categories.
     */
    static class CurrenciesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }

            // Build JSON array of currencies with categories
            StringBuilder sb = new StringBuilder();
            sb.append('[');
            
            // Basic currencies
            sb.append("{\"id\":\"transmutation\",\"name\":\"Orb of Transmutation\",\"category\":\"basic\"},");
            sb.append("{\"id\":\"augmentation\",\"name\":\"Orb of Augmentation\",\"category\":\"basic\"},");
            sb.append("{\"id\":\"regal\",\"name\":\"Regal Orb\",\"category\":\"basic\"},");
            sb.append("{\"id\":\"exalted\",\"name\":\"Exalted Orb\",\"category\":\"basic\"},");
            sb.append("{\"id\":\"annulment\",\"name\":\"Orb of Annulment\",\"category\":\"basic\"},");
            sb.append("{\"id\":\"alchemy\",\"name\":\"Orb of Alchemy\",\"category\":\"basic\"},");
            sb.append("{\"id\":\"chaos\",\"name\":\"Chaos Orb\",\"category\":\"basic\"},");
            sb.append("{\"id\":\"scouring\",\"name\":\"Orb of Scouring\",\"category\":\"basic\"},");
            
            // Essence currencies
            sb.append("{\"id\":\"essence_envy\",\"name\":\"Essence of Envy\",\"category\":\"essence\"},");
            sb.append("{\"id\":\"essence_wrath\",\"name\":\"Essence of Wrath\",\"category\":\"essence\"},");
            sb.append("{\"id\":\"essence_woe\",\"name\":\"Essence of Woe\",\"category\":\"essence\"},");
            sb.append("{\"id\":\"essence_fear\",\"name\":\"Essence of Fear\",\"category\":\"essence\"},");
            sb.append("{\"id\":\"essence_greed\",\"name\":\"Essence of Greed\",\"category\":\"essence\"},");
            
            // Special currencies
            sb.append("{\"id\":\"desecrated\",\"name\":\"Desecrated Orb\",\"category\":\"special\"}");
            
            sb.append(']');
            
            sendJson(exchange, 200, sb.toString());
        }
    }

    static class CraftingHandler implements HttpHandler {
        private static final Gson gson = new Gson();
        
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Handle CORS preflight
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }
            
            // Read request body
            String requestBody;
            try (InputStream is = exchange.getRequestBody()) {
                requestBody = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }
            
            System.out.println("Received crafting request: " + requestBody);
            
            try {
                // Parse JSON with Gson
                JsonObject jsonRequest = gson.fromJson(requestBody, JsonObject.class);
                String sessionId = jsonRequest.has("sessionId") ? jsonRequest.get("sessionId").getAsString() : null;
                String itemId = jsonRequest.get("itemId").getAsString();
                int iterations = jsonRequest.has("iterations") ? jsonRequest.get("iterations").getAsInt() : 100;
                
                // Parse new parameters for frontend revamp
                List<String> allowedCurrencies = new ArrayList<>();
                if (jsonRequest.has("allowedCurrencies") && jsonRequest.get("allowedCurrencies").isJsonArray()) {
                    JsonArray currenciesArray = jsonRequest.getAsJsonArray("allowedCurrencies");
                    for (int i = 0; i < currenciesArray.size(); i++) {
                        allowedCurrencies.add(currenciesArray.get(i).getAsString());
                    }
                }
                
                String strategy = jsonRequest.has("strategy") ? jsonRequest.get("strategy").getAsString() : "balanced";
                int maxSteps = jsonRequest.has("maxSteps") ? jsonRequest.get("maxSteps").getAsInt() : 50;
                
                System.out.println("Strategy: " + strategy + ", MaxSteps: " + maxSteps);
                if (!allowedCurrencies.isEmpty()) {
                    System.out.println("Allowed currencies: " + String.join(", ", allowedCurrencies));
                }
                
                // Parse modifiers
                if (!jsonRequest.has("modifiers")) {
                    sendJson(exchange, 400, "{\"error\":\"No modifiers provided\"}");
                    return;
                }
                
                // Handle modifiers - it's an object with keys like prefixes and suffixes arrays
                JsonObject modifiersObj = jsonRequest.getAsJsonObject("modifiers");
                
                // Load item class dynamically with subcategory resolution
                String packagePath = "core.Items." + itemId;
                List<String> subCategories = new ItemManager().getSubCategories(itemId);
                
                // Try to load the class - handle both subcategory and direct class patterns
                String fullClassName;
                if (!subCategories.isEmpty()) {
                    // Has subcategories: core.Items.Body_Armours.AR_Plate.AR_Plate
                    String subCat = subCategories.get(0);
                    fullClassName = packagePath + "." + subCat + "." + subCat;
                } else {
                    // Direct class: core.Items.Bows.Bows
                    fullClassName = packagePath + "." + itemId;
                }
                
                Class<?> itemClass = Class.forName(fullClassName);
                Item_base itemInstance = (Item_base) itemClass.getDeclaredConstructor().newInstance();
                
                // Get all allowed modifiers (normal, essence, and desecrated)
                List<Modifier> allPrefixes = new ArrayList<>();
                allPrefixes.addAll(itemInstance.getNormalAllowedPrefixes());
                
                // Add essence modifiers (filter to PERFECT_ESSENCE only)
                List<Modifier> essencePrefixes = itemInstance.getEssencesAllowedPrefixes();
                for (Modifier mod : essencePrefixes) {
                    if (mod.source == Modifier.ModifierSource.PERFECT_ESSENCE) {
                        allPrefixes.add(mod);
                    }
                }
                
                // Add desecrated modifiers
                allPrefixes.addAll(itemInstance.getDesecratedAllowedPrefixes());
                
                List<Modifier> allSuffixes = new ArrayList<>();
                allSuffixes.addAll(itemInstance.getNormalAllowedSuffixes());
                
                // Add essence modifiers (filter to PERFECT_ESSENCE only)
                List<Modifier> essenceSuffixes = itemInstance.getEssencesAllowedSuffixes();
                for (Modifier mod : essenceSuffixes) {
                    if (mod.source == Modifier.ModifierSource.PERFECT_ESSENCE) {
                        allSuffixes.add(mod);
                    }
                }
                
                // Add desecrated modifiers
                allSuffixes.addAll(itemInstance.getDesecratedAllowedSuffixes());
                
                // Parse selected modifiers and match with item's allowed modifiers
                List<Modifier> desiredModifiers = new ArrayList<>();
                
                // Handle prefixes array if present
                if (modifiersObj.has("prefixes") && modifiersObj.get("prefixes").isJsonArray()) {
                    JsonArray prefixesArray = modifiersObj.getAsJsonArray("prefixes");
                    for (int i = 0; i < prefixesArray.size(); i++) {
                        JsonObject modJson = prefixesArray.get(i).getAsJsonObject();
                        if (!modJson.has("id") || modJson.get("id").isJsonNull()) continue;
                        
                        String modId = modJson.get("id").getAsString();
                        int tier = modJson.has("tier") ? modJson.get("tier").getAsInt() : 1;
                        
                        // Strip _index suffix if present (e.g., "MartialWeaponGainedDamage_3" -> "MartialWeaponGainedDamage")
                        String familyName = modId;
                        if (modId.matches(".*_\\d+$")) {
                            familyName = modId.replaceFirst("_\\d+$", "");
                        }
                        
                        System.out.println("Looking for prefix: " + modId + " (family: " + familyName + ") tier " + tier);
                        
                        // Find matching modifier
                        // Match by family, source, and type for precise identification
                        boolean found = false;
                        Modifier matchedModifier = null;
                        
                        // Determine expected source based on tier
                        Modifier.ModifierSource expectedSource = null;
                        if (tier == 100) {
                            expectedSource = Modifier.ModifierSource.PERFECT_ESSENCE;
                        } else if (tier == 101) {
                            expectedSource = Modifier.ModifierSource.DESECRATED;
                        }
                        
                        for (Modifier prefix : allPrefixes) {
                            // Match by family first
                            if (!prefix.family.equals(familyName)) continue;
                            
                            // If we expect a specific source (tier 100 or 101), match it exactly
                            if (expectedSource != null) {
                                if (prefix.source == expectedSource && prefix.type == Modifier.ModifierType.PREFIX) {
                                    matchedModifier = prefix;
                                    break; // Found exact match
                                }
                            } else {
                                // For normal modifiers, prefer NORMAL source
                                if (prefix.source == Modifier.ModifierSource.NORMAL && prefix.type == Modifier.ModifierType.PREFIX) {
                                    matchedModifier = prefix;
                                    break;
                                } else if (matchedModifier == null) {
                                    matchedModifier = prefix; // Fallback
                                }
                            }
                        }
                        
                        if (matchedModifier != null) {
                            Modifier matchedMod = new Modifier(matchedModifier);
                            matchedMod.chosenTier = tier;
                            desiredModifiers.add(matchedMod);
                            System.out.println("Added prefix: " + matchedMod.family + " tier " + tier + " source=" + matchedMod.source + " type=" + matchedMod.type + " text='" + matchedMod.text + "'");
                            found = true;
                        }
                        
                        if (!found) {
                            System.out.println("WARNING: Prefix not found: " + familyName + " tier " + tier + " (expected source: " + expectedSource + ")");
                        }
                    }
                }
                
                // Handle suffixes array if present
                if (modifiersObj.has("suffixes") && modifiersObj.get("suffixes").isJsonArray()) {
                    JsonArray suffixesArray = modifiersObj.getAsJsonArray("suffixes");
                    for (int i = 0; i < suffixesArray.size(); i++) {
                        JsonObject modJson = suffixesArray.get(i).getAsJsonObject();
                        if (!modJson.has("id") || modJson.get("id").isJsonNull()) continue;
                        
                        String modId = modJson.get("id").getAsString();
                        int tier = modJson.has("tier") ? modJson.get("tier").getAsInt() : 1;
                        
                        // Strip _index suffix if present (e.g., "CriticalStrikeChanceIncrease_9" -> "CriticalStrikeChanceIncrease")
                        String familyName = modId;
                        if (modId.matches(".*_\\d+$")) {
                            familyName = modId.replaceFirst("_\\d+$", "");
                        }
                        
                        System.out.println("Looking for suffix: " + modId + " (family: " + familyName + ") tier " + tier);
                        
                        // Find matching modifier
                        // Match by family, source, and type for precise identification
                        boolean found = false;
                        Modifier matchedModifier = null;
                        
                        // Determine expected source based on tier
                        Modifier.ModifierSource expectedSource = null;
                        if (tier == 100) {
                            expectedSource = Modifier.ModifierSource.PERFECT_ESSENCE;
                        } else if (tier == 101) {
                            expectedSource = Modifier.ModifierSource.DESECRATED;
                        }
                        
                        for (Modifier suffix : allSuffixes) {
                            // Match by family first
                            if (!suffix.family.equals(familyName)) continue;
                            
                            // If we expect a specific source (tier 100 or 101), match it exactly
                            if (expectedSource != null) {
                                if (suffix.source == expectedSource && suffix.type == Modifier.ModifierType.SUFFIX) {
                                    matchedModifier = suffix;
                                    break; // Found exact match
                                }
                            } else {
                                // For normal modifiers, prefer NORMAL source
                                if (suffix.source == Modifier.ModifierSource.NORMAL && suffix.type == Modifier.ModifierType.SUFFIX) {
                                    matchedModifier = suffix;
                                    break;
                                } else if (matchedModifier == null) {
                                    matchedModifier = suffix; // Fallback
                                }
                            }
                        }
                        
                        if (matchedModifier != null) {
                            Modifier matchedMod = new Modifier(matchedModifier);
                            matchedMod.chosenTier = tier;
                            desiredModifiers.add(matchedMod);
                            System.out.println("Added suffix: " + matchedMod.family + " tier " + tier + " source=" + matchedMod.source + " type=" + matchedMod.type + " text='" + matchedMod.text + "'");
                            found = true;
                        }
                        
                        if (!found) {
                            System.out.println("WARNING: Suffix not found: " + familyName + " tier " + tier + " (expected source: " + expectedSource + ")");
                        }
                    }
                }
                
                if (desiredModifiers.isEmpty()) {
                    sendJson(exchange, 400, "{\"error\":\"No valid modifiers found\"}");
                    return;
                }
                
                // Create Crafting_Item from Item_base
                Crafting_Item craftingItem = new Crafting_Item(itemInstance);
                
                // Run crafting simulation
                System.out.println("Running crafting simulation with " + desiredModifiers.size() + " modifiers, " + iterations + " iterations");
                System.out.println("Desired modifiers:");
                for (Modifier mod : desiredModifiers) {
                    System.out.println("  - " + mod.family + " (tier " + mod.chosenTier + ") - " + mod.text);
                    mod.is_desired_mod = true; // Mark as desired for the algorithm
                }
                
                List<Modifier> undesiredModifiers = new ArrayList<>(); // Empty for now
                
                // Try with ThresholdConfig for progressive threshold relaxation
                List<Probability_Analyzer.CandidateProbability> results = new ArrayList<>();
                int attempt = 0;
                
                System.out.println("Starting crafting attempts with auto-decreasing threshold...");
                
                try {
                    ThresholdConfig config = ThresholdConfig.standard(); // Start at 50%, decrease by 1%
                    CraftingExecutor.CraftingResult craftingResult;
                    
                    if (sessionId != null) {
                        // TODO: Add sessionId support to CraftingExecutor API
                        // For now, manually call algorithm with sessionId
                        craftingResult = CraftingExecutor.runCrafting(
                            craftingItem,
                            desiredModifiers,
                            undesiredModifiers,
                            config
                        );
                    } else {
                        craftingResult = CraftingExecutor.runCrafting(
                            craftingItem,
                            desiredModifiers,
                            undesiredModifiers,
                            config
                        );
                    }
                    
                    results = craftingResult.getPaths();
                    attempt = craftingResult.getIterationCount();
                    System.out.println("Crafting completed after " + attempt + " attempts. Results: " + results.size());
                    
                } catch (Exception e) {
                    System.err.println("Error during crafting: " + e.getMessage());
                    e.printStackTrace();
                }
                
                // Convert results to JSON matching frontend CraftingResult interface
                JsonObject response = new JsonObject();
                response.addProperty("sessionId", sessionId != null ? sessionId : "");
                response.addProperty("success", !results.isEmpty());
                
                if (results.isEmpty()) {
                    sendJson(exchange, 200, "{\"sessionId\":\""+(sessionId!=null?sessionId:"")+"\",\"success\":false,\"error\":\"No valid crafting paths found after " + attempt + " attempts. Try selecting fewer or different modifiers.\"}");
                    return;
                }
                
                // Take the best result (first one, highest probability)
                Probability_Analyzer.CandidateProbability bestResult = results.get(0);
                
                // Build the main path object matching frontend CraftingPath interface
                JsonObject pathObj = new JsonObject();
                JsonArray stepsArray = new JsonArray();
                double totalProbability = 0.0;
                int stepCount = 0;
                
                // Build steps array from bestPath
                if (bestResult.bestPath() != null && !bestResult.bestPath().isEmpty()) {
                    // Convert to list to check next step
                    List<Map.Entry<Crafting_Action, ModifierEvent>> pathList = new ArrayList<>(bestResult.bestPath().entrySet());
                    
                    for (int stepIndex = 0; stepIndex < pathList.size(); stepIndex++) {
                        Map.Entry<Crafting_Action, ModifierEvent> entry = pathList.get(stepIndex);
                        JsonObject stepObj = new JsonObject();
                        Crafting_Action action = entry.getKey();
                        ModifierEvent modEvent = entry.getValue();
                        
                        // Map to frontend CraftingStep interface
                        stepObj.addProperty("currencyId", action.getClass().getSimpleName());
                        stepObj.addProperty("currencyName", action.getClass().getSimpleName().replaceAll("([A-Z])", " $1").trim());
                        
                        // Extract probability for this specific action from the source map
                        double stepProbability = modEvent.source.getOrDefault(action, 0.0);
                        // Sanitize infinity/NaN values for JSON
                        if (Double.isInfinite(stepProbability) || Double.isNaN(stepProbability)) {
                            stepProbability = 1.0;
                        }
                        stepObj.addProperty("probability", stepProbability);
                        
                        // Extract tier information using reflection
                        String tierInfo = null;
                        try {
                            // Try to get tier field (public or protected)
                            var tierField = action.getClass().getDeclaredField("tier");
                            tierField.setAccessible(true); // Allow access to protected/private fields
                            Object tierValue = tierField.get(action);
                            if (tierValue != null) {
                                // Check if it's a ModifierTier object
                                if (tierValue instanceof ModifierTier) {
                                    ModifierTier modTier = (ModifierTier) tierValue;
                                    tierInfo = String.valueOf(modTier.level);
                                } else {
                                    tierInfo = tierValue.toString();
                                }
                            }
                        } catch (NoSuchFieldException e) {
                            // No tier field in this action class, that's okay
                        } catch (Exception e) {
                            System.err.println("Error extracting tier: " + e.getMessage());
                        }
                        if (tierInfo != null) {
                            stepObj.addProperty("tier", tierInfo);
                        }
                        
                        // Extract omen information using reflection
                        JsonArray omensArray = new JsonArray();
                        try {
                            // Try to get omens field (Set<Omen>)
                            var omensField = action.getClass().getField("omens");
                            Object omensValue = omensField.get(action);
                            if (omensValue instanceof java.util.Set) {
                                for (Object omen : (java.util.Set<?>) omensValue) {
                                    if (omen != null && !omen.toString().equals("None")) {
                                        omensArray.add(omen.toString());
                                    }
                                }
                            }
                        } catch (Exception e1) {
                            // Try singular omen field
                            try {
                                var omenField = action.getClass().getField("omen");
                                Object omenValue = omenField.get(action);
                                if (omenValue != null && !omenValue.toString().equals("None")) {
                                    omensArray.add(omenValue.toString());
                                }
                            } catch (Exception e2) {
                                // No omen field
                            }
                        }
                        if (omensArray.size() > 0) {
                            stepObj.add("omens", omensArray);
                        }
                        
                        // Add resulting modifiers
                        JsonArray resultingMods = new JsonArray();
                        if (modEvent.modifier != null) {
                            resultingMods.add(modEvent.modifier.text);
                        }
                        stepObj.add("resultingModifiers", resultingMods);
                        stepObj.addProperty("description", modEvent.modifier != null ? modEvent.modifier.text : "Apply " + action.getClass().getSimpleName());
                        
                        // Check if this modifier will be removed by Perfect Essence in next step
                        boolean willBeRemovedByPerfectEssence = false;
                        if (stepIndex + 1 < pathList.size() && modEvent.modifier != null) {
                            Map.Entry<Crafting_Action, ModifierEvent> nextEntry = pathList.get(stepIndex + 1);
                            Crafting_Action nextAction = nextEntry.getKey();
                            ModifierEvent nextModEvent = nextEntry.getValue();
                            
                            // Check if next action is Perfect Essence CHANGED (replacement)
                            if (nextAction instanceof Essence_currency && 
                                nextModEvent.type == ModifierEvent.ActionType.CHANGED &&
                                nextModEvent.changed_modifier != null) {
                                // Check if the modifier being removed matches current modifier
                                if (nextModEvent.changed_modifier.family.equals(modEvent.modifier.family) &&
                                    nextModEvent.changed_modifier.text.equals(modEvent.modifier.text)) {
                                    willBeRemovedByPerfectEssence = true;
                                }
                            }
                        }
                        stepObj.addProperty("temporaryModifier", willBeRemovedByPerfectEssence);
                        
                        // IMPORTANT: If probability is 1.0 but temporaryModifier is false,
                        // it means the 1.0 was calculated during search when there WAS a Perfect Essence
                        // in the modifier history, but that step is not in the final bestPath.
                        // In this case, we should NOT show 1.0 (100%), but we can't easily recalculate
                        // the real probability here. As a workaround, if stepProbability is 1.0 and
                        // temporaryModifier is false, we'll show it as "unknown" or keep 1.0 with a note.
                        // For now, we'll just keep the probability as-is since recalculation is complex.
                        
                        stepsArray.add(stepObj);
                        if (stepProbability > 0) {
                            totalProbability += stepProbability;
                            stepCount++;
                        }
                    }
                }
                
                pathObj.add("steps", stepsArray);
                double pathProb = bestResult.finalPercentage() / 100.0;
                if (Double.isInfinite(pathProb) || Double.isNaN(pathProb)) {
                    pathProb = 1.0;
                }
                pathObj.addProperty("probability", pathProb);
                
                double successRate = stepCount > 0 ? totalProbability / stepCount : 0.0;
                if (Double.isInfinite(successRate) || Double.isNaN(successRate)) {
                    successRate = 1.0;
                }
                pathObj.addProperty("successRate", successRate);
                pathObj.addProperty("cost", 0); // TODO: Calculate actual cost
                pathObj.addProperty("estimatedCost", 0); // TODO: Calculate estimated cost
                
                double quality = bestResult.finalPercentage();
                if (Double.isInfinite(quality) || Double.isNaN(quality)) {
                    quality = 100.0;
                }
                pathObj.addProperty("quality", quality);
                pathObj.addProperty("label", "Best Path");
                
                response.add("path", pathObj);
                double totalProb = bestResult.finalPercentage() / 100.0;
                if (Double.isInfinite(totalProb) || Double.isNaN(totalProb)) {
                    totalProb = 1.0;
                }
                response.addProperty("totalProbability", totalProb);
                response.addProperty("averageCost", 0); // TODO: Calculate
                
                // Use actual number of attempts from the crafting run
                response.addProperty("estimatedAttempts", attempt);
                response.addProperty("averageSteps", stepsArray.size());
                
                // Add alternatives if there are more results
                if (results.size() > 1) {
                    JsonArray alternativesArray = new JsonArray();
                    for (int i = 1; i < Math.min(results.size(), 4); i++) {
                        // Add up to 3 alternative paths (similar structure to main path)
                        Probability_Analyzer.CandidateProbability altResult = results.get(i);
                        JsonObject altPathObj = new JsonObject();
                        JsonArray altStepsArray = new JsonArray();
                        
                        double altTotalProbability = 0.0;
                        int altStepCount = 0;
                        
                        if (altResult.bestPath() != null) {
                            for (Map.Entry<Crafting_Action, ModifierEvent> entry : altResult.bestPath().entrySet()) {
                                JsonObject altStepObj = new JsonObject();
                                Crafting_Action action = entry.getKey();
                                ModifierEvent modEvent = entry.getValue();
                                
                                altStepObj.addProperty("currencyId", action.getClass().getSimpleName());
                                altStepObj.addProperty("currencyName", action.getClass().getSimpleName().replaceAll("([A-Z])", " $1").trim());
                                
                                // Extract probability for this specific action from the source map
                                double altStepProbability = modEvent.source.getOrDefault(action, 0.0);
                                // Sanitize infinity/NaN values for JSON
                                if (Double.isInfinite(altStepProbability) || Double.isNaN(altStepProbability)) {
                                    altStepProbability = 1.0;
                                }
                                altStepObj.addProperty("probability", altStepProbability);
                                
                                JsonArray altResultingMods = new JsonArray();
                                if (modEvent.modifier != null) {
                                    altResultingMods.add(modEvent.modifier.text);
                                }
                                altStepObj.add("resultingModifiers", altResultingMods);
                                altStepObj.addProperty("description", modEvent.modifier != null ? modEvent.modifier.text : "Apply " + action.getClass().getSimpleName());
                                
                                altStepsArray.add(altStepObj);
                                if (altStepProbability > 0) {
                                    altTotalProbability += altStepProbability;
                                    altStepCount++;
                                }
                            }
                        }
                        
                        altPathObj.add("steps", altStepsArray);
                        double altPathProb = altResult.finalPercentage() / 100.0;
                        if (Double.isInfinite(altPathProb) || Double.isNaN(altPathProb)) {
                            altPathProb = 1.0;
                        }
                        altPathObj.addProperty("probability", altPathProb);
                        
                        double altSuccessRate = altStepCount > 0 ? altTotalProbability / altStepCount : 0.0;
                        if (Double.isInfinite(altSuccessRate) || Double.isNaN(altSuccessRate)) {
                            altSuccessRate = 1.0;
                        }
                        altPathObj.addProperty("successRate", altSuccessRate);
                        altPathObj.addProperty("cost", 0);
                        altPathObj.addProperty("estimatedCost", 0);
                        
                        double altQuality = altResult.finalPercentage();
                        if (Double.isInfinite(altQuality) || Double.isNaN(altQuality)) {
                            altQuality = 100.0;
                        }
                        altPathObj.addProperty("quality", altQuality);
                        altPathObj.addProperty("label", "Alternative " + i);
                        
                        alternativesArray.add(altPathObj);
                    }
                    response.add("alternatives", alternativesArray);
                }
                
                String responseJson = gson.toJson(response);
                System.out.println("Sending response: " + responseJson);
                sendJson(exchange, 200, responseJson);
                
            } catch (ClassNotFoundException e) {
                System.err.println("Item class not found: " + e.getMessage());
                sendJson(exchange, 400, "{\"error\":\"Item not found: " + escapeJson(e.getMessage()) + "\"}");
            } catch (Exception e) {
                System.err.println("Error processing crafting request: " + e.getMessage());
                e.printStackTrace();
                sendJson(exchange, 500, "{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    /**
     * Handles GET /api/progress/{sessionId} requests.
     * Returns JSON with progress data: percent, elapsedMs, estimatedRemainingMs, cancelled.
     * Returns 404 if session not found.
     */
    static class ProgressHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }

            // Extract sessionId from URL path: /api/progress/{sessionId}
            String path = exchange.getRequestURI().getPath();
            String[] segments = path.split("/");
            
            if (segments.length < 4 || segments[3].trim().isEmpty()) {
                sendJson(exchange, 400, "{\"error\":\"sessionId required in path: /api/progress/{sessionId}\"}");
                return;
            }
            
            String sessionId = segments[3];
            
            // Check if session exists
            if (!ProgressTracker.hasSession(sessionId)) {
                sendJson(exchange, 404, "{\"error\":\"Session not found: " + escapeJson(sessionId) + "\"}");
                return;
            }
            
            // Get progress and serialize to JSON
            ProgressTracker.SessionProgress progress = ProgressTracker.getProgress(sessionId);
            if (progress == null) {
                // Race condition: session ended between hasSession and getProgress
                sendJson(exchange, 404, "{\"error\":\"Session not found: " + escapeJson(sessionId) + "\"}");
                return;
            }
            
            String json = progress.toJson();
            sendJson(exchange, 200, json);
        }
    }

    /**
     * Handles POST /api/cancel/{sessionId} requests.
     * Cancels the computation for the given sessionId.
     * Returns 404 if session not found, 200 with success=true if cancelled successfully.
     */
    static class CancelHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }

            // Extract sessionId from URL path: /api/cancel/{sessionId}
            String path = exchange.getRequestURI().getPath();
            String[] segments = path.split("/");
            
            if (segments.length < 4 || segments[3].trim().isEmpty()) {
                sendJson(exchange, 400, "{\"error\":\"sessionId required in path: /api/cancel/{sessionId}\"}");
                return;
            }
            
            String sessionId = segments[3];
            
            // Check if session exists
            if (!ProgressTracker.hasSession(sessionId)) {
                sendJson(exchange, 404, "{\"error\":\"Session not found: " + escapeJson(sessionId) + "\"}");
                return;
            }
            
            // Cancel the session
            try {
                ProgressTracker.cancelSession(sessionId);
                sendJson(exchange, 200, "{\"success\":true,\"sessionId\":\"" + escapeJson(sessionId) + "\"}");
            } catch (IllegalStateException e) {
                // Session was removed between hasSession and cancelSession
                sendJson(exchange, 404, "{\"error\":\"Session not found: " + escapeJson(sessionId) + "\"}");
            }
        }
    }

    private static void sendJson(HttpExchange exchange, int status, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        // Add CORS headers
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            switch (c) {
                case '\\': sb.append("\\\\"); break;
                case '"': sb.append("\\\""); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                default:
                    if (c < 32 || c == 127) {
                        // Escape other control characters
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
            }
        }
        return sb.toString();
    }
}
