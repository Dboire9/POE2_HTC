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
import core.Crafting.Probabilities.Probability_Analyzer;
import core.Crafting.Utils.ModifierEvent;
import core.Items.Item_base;
import core.Modifier_class.Modifier;

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

            // Health endpoint
            server.createContext("/health", exchange -> {
                sendJson(exchange, 200, "{\"status\":\"ok\"}");
            });

            // Items endpoint
            server.createContext("/api/items", new ItemsHandler());

            // Modifiers endpoint
            server.createContext("/api/modifiers", new ModifiersHandler());

            // Crafting endpoint (stub)
            server.createContext("/api/crafting", new CraftingHandler());

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
            
            // Parse query parameters: ?itemId=Helmets&subcategory=...
            String query = exchange.getRequestURI().getQuery();
            String itemId = "";
            if (query != null) {
                for (String param : query.split("&")) {
                    String[] kv = param.split("=");
                    if (kv.length == 2 && "itemId".equals(kv[0])) {
                        itemId = kv[1];
                    }
                }
            }
            
            if (itemId.isEmpty()) {
                sendJson(exchange, 400, "{\"error\":\"itemId parameter required\"}");
                return;
            }
            
            try {
                // Load the item class dynamically
                String packagePath = "core.Items." + itemId;
                List<String> subCategories = new ItemManager().getSubCategories(itemId);
                
                if (subCategories.isEmpty()) {
                    sendJson(exchange, 404, "{\"error\":\"No subcategories found for item\"}");
                    return;
                }
                
                // Use the first subcategory for now (or we could require it as a parameter)
                String subCat = subCategories.get(0);
                String fullClassName = packagePath + "." + subCat + "." + subCat;
                
                Class<?> itemClass = Class.forName(fullClassName);
                Item_base itemInstance = (Item_base) itemClass.getDeclaredConstructor().newInstance();
                
                // Get modifiers
                List<Modifier> prefixes = itemInstance.getNormalAllowedPrefixes();
                List<Modifier> suffixes = itemInstance.getNormalAllowedSuffixes();
                
                // Build JSON response
                StringBuilder sb = new StringBuilder();
                sb.append("{\"prefixes\":[");
                for (int i = 0; i < prefixes.size(); i++) {
                    Modifier mod = prefixes.get(i);
                    sb.append("{")
                      .append("\"id\":\"").append(escapeJson(mod.family)).append("\",")
                      .append("\"name\":\"").append(escapeJson(mod.text)).append("\",")
                      .append("\"tiers\":").append(mod.tiers.size())
                      .append("}");
                    if (i < prefixes.size() - 1) sb.append(',');
                }
                sb.append("],\"suffixes\":[");
                for (int i = 0; i < suffixes.size(); i++) {
                    Modifier mod = suffixes.get(i);
                    sb.append("{")
                      .append("\"id\":\"").append(escapeJson(mod.family)).append("\",")
                      .append("\"name\":\"").append(escapeJson(mod.text)).append("\",")
                      .append("\"tiers\":").append(mod.tiers.size())
                      .append("}");
                    if (i < suffixes.size() - 1) sb.append(',');
                }
                sb.append("]}");
                
                sendJson(exchange, 200, sb.toString());
                
            } catch (Exception e) {
                System.err.println("Error loading modifiers: " + e.getMessage());
                e.printStackTrace();
                sendJson(exchange, 500, "{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    static class CraftingHandler implements HttpHandler {
        private static final Gson gson = new Gson();
        
        @Override
        public void handle(HttpExchange exchange) throws IOException {
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
                String itemId = jsonRequest.get("itemId").getAsString();
                int iterations = jsonRequest.has("iterations") ? jsonRequest.get("iterations").getAsInt() : 100;
                
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
                
                if (subCategories.isEmpty()) {
                    sendJson(exchange, 404, "{\"error\":\"No subcategories found for item: " + itemId + "\"}");
                    return;
                }
                
                // Use the first subcategory
                String subCat = subCategories.get(0);
                String fullClassName = packagePath + "." + subCat + "." + subCat;
                
                Class<?> itemClass = Class.forName(fullClassName);
                Item_base itemInstance = (Item_base) itemClass.getDeclaredConstructor().newInstance();
                
                // Get allowed modifiers
                List<Modifier> allPrefixes = itemInstance.getNormalAllowedPrefixes();
                List<Modifier> allSuffixes = itemInstance.getNormalAllowedSuffixes();
                
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
                        
                        // Find matching modifier
                        for (Modifier prefix : allPrefixes) {
                            if (prefix.family.equals(modId)) {
                                Modifier matchedMod = new Modifier(prefix);
                                matchedMod.chosenTier = tier;
                                desiredModifiers.add(matchedMod);
                                System.out.println("Added prefix: " + matchedMod.family + " tier " + tier);
                                break;
                            }
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
                        
                        // Find matching modifier
                        for (Modifier suffix : allSuffixes) {
                            if (suffix.family.equals(modId)) {
                                Modifier matchedMod = new Modifier(suffix);
                                matchedMod.chosenTier = tier;
                                desiredModifiers.add(matchedMod);
                                System.out.println("Added suffix: " + matchedMod.family + " tier " + tier);
                                break;
                            }
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
                
                // Try with decreasing threshold like JavaFX does
                List<Probability_Analyzer.CandidateProbability> results = new ArrayList<>();
                double threshold = 0.25; // Start at 25% (will be divided by 100 = 0.25)
                int maxRetries = 25;
                int attempt = 0;
                
                System.out.println("Starting crafting attempts with auto-decreasing threshold...");
                
                while (results.isEmpty() && attempt < maxRetries) {
                    System.out.println("Attempt " + (attempt + 1) + "/" + maxRetries + " with threshold: " + (threshold / 100.0));
                    
                    try {
                        results = CraftingExecutor.runCrafting(
                            craftingItem,
                            desiredModifiers,
                            undesiredModifiers,
                            threshold / 100.0
                        );
                    } catch (Exception e) {
                        System.err.println("Error during crafting attempt: " + e.getMessage());
                        e.printStackTrace();
                    }
                    
                    if (results.isEmpty()) {
                        craftingItem.reset();
                        undesiredModifiers.clear();
                        threshold--;
                        attempt++;
                    }
                }
                
                System.out.println("Crafting completed after " + attempt + " attempts. Results: " + results.size());
                
                // Convert results to JSON
                JsonObject response = new JsonObject();
                response.addProperty("itemId", itemId);
                response.addProperty("iterations", iterations);
                response.addProperty("modifierCount", desiredModifiers.size());
                response.addProperty("attempts", attempt);
                
                if (results.isEmpty()) {
                    response.addProperty("status", "no_results");
                    response.addProperty("message", "No valid crafting paths found after " + attempt + " attempts. Try selecting fewer or different modifiers.");
                } else {
                    response.addProperty("status", "ok");
                }
                
                JsonArray resultsArray = new JsonArray();
                for (Probability_Analyzer.CandidateProbability result : results) {
                    JsonObject resultObj = new JsonObject();
                    resultObj.addProperty("probability", result.finalPercentage() / 100.0); // Convert to 0-1 range
                    
                    // Add best path info if available
                    if (result.bestPath() != null && !result.bestPath().isEmpty()) {
                        JsonObject pathObj = new JsonObject();
                        
                        // Calculate average success rate from individual action probabilities
                        double totalProbability = 0.0;
                        int actionCount = 0;
                        for (Map.Entry<Crafting_Action, ModifierEvent> entry : result.bestPath().entrySet()) {
                            double probability = entry.getValue().source.values().stream().findFirst().orElse(0.0);
                            if (probability > 0) { // Only count non-zero probabilities
                                totalProbability += probability;
                                actionCount++;
                            }
                        }
                        double avgSuccessRate = actionCount > 0 ? totalProbability / actionCount : 0.0;
                        resultObj.addProperty("avgSuccessRate", avgSuccessRate);
                        
                        JsonArray actionsArray = new JsonArray();
                        for (Map.Entry<Crafting_Action, ModifierEvent> entry : result.bestPath().entrySet()) {
                            JsonObject actionObj = new JsonObject();
                            
                            Crafting_Action action = entry.getKey();
                            
                            // Get clean action name
                            String actionClassName = action.getClass().getSimpleName();
                            actionObj.addProperty("action", actionClassName);
                            actionObj.addProperty("actionFull", action.getClass().getName());
                            
                            // Get probability from source
                            double probability = entry.getValue().source.values().stream().findFirst().orElse(0.0);
                            actionObj.addProperty("probability", probability);
                            
                            // Add modifier info if available
                            if (entry.getValue().modifier != null) {
                                actionObj.addProperty("modifier", entry.getValue().modifier.text);
                                actionObj.addProperty("modifierFamily", entry.getValue().modifier.family);
                            }
                            
                            // Extract action-specific details (tier, omens, etc.)
                            if (action instanceof core.Currency.ExaltedOrb exalted) {
                                if (exalted.tier != null) {
                                    actionObj.addProperty("tier", exalted.tier.toString());
                                }
                                if (exalted.omens != null && !exalted.omens.isEmpty()) {
                                    JsonArray omensArray = new JsonArray();
                                    for (core.Currency.ExaltedOrb.Omen omen : exalted.omens) {
                                        omensArray.add(omen.toString());
                                    }
                                    actionObj.add("omens", omensArray);
                                }
                            } else if (action instanceof core.Currency.RegalOrb regal) {
                                if (regal.tier != null) {
                                    actionObj.addProperty("tier", regal.tier.toString());
                                }
                                if (regal.omen != null) {
                                    actionObj.addProperty("omen", regal.omen.toString());
                                }
                            } else if (action instanceof core.Currency.AnnulmentOrb annulment) {
                                if (annulment.omen != null) {
                                    actionObj.addProperty("omen", annulment.omen.toString());
                                }
                            } else if (action instanceof core.Currency.Desecrated_currency desecrated) {
                                if (desecrated.omens != null) {
                                    actionObj.addProperty("omen", desecrated.omens.toString());
                                }
                            } else if (action instanceof core.Currency.Essence_currency essence) {
                                if (essence.omen != null) {
                                    actionObj.addProperty("omen", essence.omen.toString());
                                }
                            }
                            
                            actionsArray.add(actionObj);
                        }
                        pathObj.add("actions", actionsArray);
                        
                        resultObj.add("bestPath", pathObj);
                    }
                    
                    resultsArray.add(resultObj);
                }
                response.add("results", resultsArray);
                
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

    private static void sendJson(HttpExchange exchange, int status, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
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
