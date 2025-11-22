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
import core.Currency.Desecrated_currency;
import core.Currency.Essence_currency;
import core.Items.Item_base;
import core.Modifier_class.Modifier;
import core.DebugLogger;
import core.DebugLogger.DebugLevel;

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
        // Set debug level from environment variable or default to INFO
        String debugLevel = System.getenv("DEBUG_LEVEL");
        if (debugLevel != null) {
            try {
                DebugLogger.setLevel(DebugLevel.valueOf(debugLevel.toUpperCase()));
            } catch (IllegalArgumentException e) {
                DebugLogger.setLevel(DebugLevel.INFO);
            }
        } else {
            DebugLogger.setLevel(DebugLevel.INFO);
        }
        
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

            // Use single-threaded executor for deterministic crafting results
            server.setExecutor(Executors.newSingleThreadExecutor());
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
            // Handle CORS preflight
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 204, "");
                return;
            }
            
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }
            ItemManager manager = new ItemManager();
            List<String> categories = manager.getCategories();
            // Build a simple JSON array of {id,name,type,baseStats}
            StringBuilder sb = new StringBuilder();
            sb.append('[');
            for (int i = 0; i < categories.size(); i++) {
                String c = categories.get(i);
                // Convert category name to type format (e.g., "Body_Armours" -> "body_armour")
                String type = c.toLowerCase().replace("_", "_").replaceAll("s$", "");
                sb.append('{')
                  .append("\"id\":\"").append(escapeJson(c)).append("\",")
                  .append("\"name\":\"").append(escapeJson(c)).append("\",")
                  .append("\"type\":\"").append(escapeJson(type)).append("\",")
                  .append("\"baseStats\":{}") // Empty for now
                  .append("}");
                if (i < categories.size() - 1) sb.append(',');
            }
            sb.append(']');
            sendJson(exchange, 200, sb.toString());
        }
    }

    static class ModifiersHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Handle CORS preflight
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 204, "");
                return;
            }
            
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
                
                String fullClassName;
                
                if (subCategories.isEmpty()) {
                    // No subcategories - the class is directly in the category folder
                    // e.g., core.Items.Bows.Bows
                    fullClassName = packagePath + "." + itemId;
                } else {
                    // Has subcategories - use the first one
                    // e.g., core.Items.Body_Armours.Body_Armours_str.Body_Armours_str
                    String subCat = subCategories.get(0);
                    fullClassName = packagePath + "." + subCat + "." + subCat;
                }
                
                Class<?> itemClass = Class.forName(fullClassName);
                Item_base itemInstance = (Item_base) itemClass.getDeclaredConstructor().newInstance();
                
                // Get modifiers from all sources
                List<Modifier> normalPrefixes = itemInstance.getNormalAllowedPrefixes();
                List<Modifier> normalSuffixes = itemInstance.getNormalAllowedSuffixes();
                List<Modifier> desecratedPrefixes = itemInstance.getDesecratedAllowedPrefixes();
                List<Modifier> desecratedSuffixes = itemInstance.getDesecratedAllowedSuffixes();
                List<Modifier> essencePrefixes = itemInstance.getEssencesAllowedPrefixes();
                List<Modifier> essenceSuffixes = itemInstance.getEssencesAllowedSuffixes();
                
                // Combine all prefixes and suffixes with deduplication
                // Use a map to track unique modifiers by their text (which is unique)
                java.util.Map<String, Modifier> prefixMap = new java.util.LinkedHashMap<>();
                if (normalPrefixes != null) {
                    for (Modifier m : normalPrefixes) {
                        String key = m.text + "-" + (m.source != null ? m.source : "NORMAL");
                        prefixMap.putIfAbsent(key, m);
                    }
                }
                if (desecratedPrefixes != null) {
                    for (Modifier m : desecratedPrefixes) {
                        String key = m.text + "-" + (m.source != null ? m.source : "NORMAL");
                        prefixMap.putIfAbsent(key, m);
                    }
                }
                if (essencePrefixes != null) {
                    for (Modifier m : essencePrefixes) {
                        String key = m.text + "-" + (m.source != null ? m.source : "NORMAL");
                        prefixMap.putIfAbsent(key, m);
                    }
                }
                List<Modifier> allPrefixes = new ArrayList<>(prefixMap.values());
                
                java.util.Map<String, Modifier> suffixMap = new java.util.LinkedHashMap<>();
                if (normalSuffixes != null) {
                    for (Modifier m : normalSuffixes) {
                        String key = m.text + "-" + (m.source != null ? m.source : "NORMAL");
                        suffixMap.putIfAbsent(key, m);
                    }
                }
                if (desecratedSuffixes != null) {
                    for (Modifier m : desecratedSuffixes) {
                        String key = m.text + "-" + (m.source != null ? m.source : "NORMAL");
                        suffixMap.putIfAbsent(key, m);
                    }
                }
                if (essenceSuffixes != null) {
                    for (Modifier m : essenceSuffixes) {
                        String key = m.text + "-" + (m.source != null ? m.source : "NORMAL");
                        suffixMap.putIfAbsent(key, m);
                    }
                }
                List<Modifier> allSuffixes = new ArrayList<>(suffixMap.values());
                
                // Build JSON response with source field
                StringBuilder sb = new StringBuilder();
                sb.append("{\"prefixes\":[");
                for (int i = 0; i < allPrefixes.size(); i++) {
                    Modifier mod = allPrefixes.get(i);
                    String sourceStr = getSourceString(mod.source);
                    sb.append("{")
                      .append("\"id\":\"").append(escapeJson(mod.family)).append("\",")
                      .append("\"name\":\"").append(escapeJson(mod.text)).append("\",")
                      .append("\"tiers\":").append(mod.tiers.size()).append(",")
                      .append("\"source\":\"").append(sourceStr).append("\"")
                      .append("}");
                    if (i < allPrefixes.size() - 1) sb.append(',');
                }
                sb.append("],\"suffixes\":[");
                for (int i = 0; i < allSuffixes.size(); i++) {
                    Modifier mod = allSuffixes.get(i);
                    String sourceStr = getSourceString(mod.source);
                    sb.append("{")
                      .append("\"id\":\"").append(escapeJson(mod.family)).append("\",")
                      .append("\"name\":\"").append(escapeJson(mod.text)).append("\",")
                      .append("\"tiers\":").append(mod.tiers.size()).append(",")
                      .append("\"source\":\"").append(sourceStr).append("\"")
                      .append("}");
                    if (i < allSuffixes.size() - 1) sb.append(',');
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
            // Handle CORS preflight
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 204, "");
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
            
            DebugLogger.debug("=== CRAFTING REQUEST START ===");
            DebugLogger.info("Full request body: " + requestBody);
            long requestStartTime = System.currentTimeMillis();
            
            try {
                // Parse JSON with Gson
                JsonObject jsonRequest = gson.fromJson(requestBody, JsonObject.class);
                String itemId = jsonRequest.get("itemId").getAsString();
                DebugLogger.info("Parsed itemId: " + itemId);
                int iterations = jsonRequest.has("iterations") ? jsonRequest.get("iterations").getAsInt() : 100;
                
                // Read global_threshold from request (default 0.33 = 33%)
                double globalThreshold = jsonRequest.has("global_threshold") 
                    ? jsonRequest.get("global_threshold").getAsDouble() 
                    : 0.33;
                
                DebugLogger.info("★★★ CRAFTING REQUEST ★★★");
                DebugLogger.info("  Item: " + itemId);
                DebugLogger.info("  Iterations: " + iterations);
                DebugLogger.info("  Threshold: " + globalThreshold + " (" + (globalThreshold * 100) + "%)");
                DebugLogger.info("  Has modifiers: " + jsonRequest.has("modifiers"));
                
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
                
                String fullClassName;
                
                if (subCategories.isEmpty()) {
                    // No subcategories - the class is directly in the category folder
                    fullClassName = packagePath + "." + itemId;
                } else {
                    // Has subcategories - use the first one
                    String subCat = subCategories.get(0);
                    fullClassName = packagePath + "." + subCat + "." + subCat;
                }
                
                Class<?> itemClass = Class.forName(fullClassName);
                Item_base itemInstance = (Item_base) itemClass.getDeclaredConstructor().newInstance();
                DebugLogger.debug("Created NEW item instance: " + itemInstance.getClass().getSimpleName() + "@" + System.identityHashCode(itemInstance));
                
                // Get allowed modifiers from all sources
                List<Modifier> normalPrefixes = itemInstance.getNormalAllowedPrefixes();
                List<Modifier> normalSuffixes = itemInstance.getNormalAllowedSuffixes();
                List<Modifier> desecratedPrefixes = itemInstance.getDesecratedAllowedPrefixes();
                List<Modifier> desecratedSuffixes = itemInstance.getDesecratedAllowedSuffixes();
                List<Modifier> essencePrefixes = itemInstance.getEssencesAllowedPrefixes();
                List<Modifier> essenceSuffixes = itemInstance.getEssencesAllowedSuffixes();
                
                // Combine all modifiers into a single lookup list
                List<Modifier> allPrefixes = new ArrayList<>();
                if (normalPrefixes != null) allPrefixes.addAll(normalPrefixes);
                if (desecratedPrefixes != null) allPrefixes.addAll(desecratedPrefixes);
                if (essencePrefixes != null) allPrefixes.addAll(essencePrefixes);
                
                List<Modifier> allSuffixes = new ArrayList<>();
                if (normalSuffixes != null) allSuffixes.addAll(normalSuffixes);
                if (desecratedSuffixes != null) allSuffixes.addAll(desecratedSuffixes);
                if (essenceSuffixes != null) allSuffixes.addAll(essenceSuffixes);
                
                // Parse selected modifiers and match with item's allowed modifiers
                List<Modifier> desiredModifiers = new ArrayList<>();
                DebugLogger.info("★ Parsing modifiers from request...");
                DebugLogger.debug("Available prefixes: " + allPrefixes.size() + ", suffixes: " + allSuffixes.size());
                
                // Handle prefixes array if present
                if (modifiersObj.has("prefixes") && modifiersObj.get("prefixes").isJsonArray()) {
                    JsonArray prefixesArray = modifiersObj.getAsJsonArray("prefixes");
                    DebugLogger.info("★ Processing " + prefixesArray.size() + " prefixes from request");
                    for (int i = 0; i < prefixesArray.size(); i++) {
                        JsonObject modJson = prefixesArray.get(i).getAsJsonObject();
                        
                        String modText = modJson.has("text") && !modJson.get("text").isJsonNull() 
                            ? modJson.get("text").getAsString() : null;
                        String modId = modJson.has("id") && !modJson.get("id").isJsonNull() 
                            ? modJson.get("id").getAsString() : null;
                        
                        if (modText == null && modId == null) continue;
                        
                        int tier = modJson.has("tier") ? modJson.get("tier").getAsInt() : 0;
                        
                        String searchKey = modText != null ? modText : modId;
                        DebugLogger.trace("Looking for prefix: " + searchKey + " (tier " + tier + ")");
                        
                        // Determine which list to search based on tier
                        // Tier 0 usually indicates Essence or Desecrated
                        List<Modifier> searchList = (tier == 0) ? essencePrefixes : allPrefixes;
                        
                        // Find matching modifier
                        boolean found = false;
                        for (Modifier prefix : searchList) {
                            boolean matches = false;
                            if (modText != null) {
                                matches = prefix.text.equals(modText);
                            } else if (modId != null) {
                                matches = prefix.family.equals(modId);
                            }
                            
                            if (matches) {
                                // CRITICAL: Set tier and is_desired_mod on original, then add original
                                // This matches TestAlgo's behavior exactly
                                prefix.chosenTier = tier;
                                prefix.is_desired_mod = true;
                                desiredModifiers.add(prefix);
                                DebugLogger.debug("✓ Prefix: " + prefix.text + " (tier=" + tier + ")");
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            DebugLogger.warn("Prefix not found: " + searchKey);
                        }
                    }
                }
                
                // Handle suffixes array if present
                if (modifiersObj.has("suffixes") && modifiersObj.get("suffixes").isJsonArray()) {
                    JsonArray suffixesArray = modifiersObj.getAsJsonArray("suffixes");
                    for (int i = 0; i < suffixesArray.size(); i++) {
                        JsonObject modJson = suffixesArray.get(i).getAsJsonObject();
                        
                        String modText = modJson.has("text") && !modJson.get("text").isJsonNull() 
                            ? modJson.get("text").getAsString() : null;
                        String modId = modJson.has("id") && !modJson.get("id").isJsonNull() 
                            ? modJson.get("id").getAsString() : null;
                        
                        if (modText == null && modId == null) continue;
                        
                        int tier = modJson.has("tier") ? modJson.get("tier").getAsInt() : 0;
                        
                        String searchKey = modText != null ? modText : modId;
                        DebugLogger.trace("Looking for suffix: " + searchKey + " (tier " + tier + ")");
                        
                        // Determine which list to search:
                        // Tier 0 could be Essence or Desecrated - check both
                        List<Modifier> searchList;
                        if (tier == 0) {
                            // First try essence list, then desecrated
                            searchList = new ArrayList<>();
                            if (essenceSuffixes != null) searchList.addAll(essenceSuffixes);
                            if (desecratedSuffixes != null) searchList.addAll(desecratedSuffixes);
                        } else {
                            searchList = allSuffixes;
                        }
                        
                        // Find matching modifier
                        boolean found = false;
                        for (Modifier suffix : searchList) {
                            boolean matches = false;
                            if (modText != null) {
                                matches = suffix.text.equals(modText);
                            } else if (modId != null) {
                                matches = suffix.family.equals(modId);
                            }
                            
                            if (matches) {
                                // CRITICAL: Set tier and is_desired_mod on original, then add original
                                // This matches TestAlgo's behavior exactly
                                suffix.chosenTier = tier;
                                suffix.is_desired_mod = true;
                                desiredModifiers.add(suffix);
                                DebugLogger.debug("✓ Suffix: " + suffix.text + " (tier=" + tier + ")");
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            DebugLogger.warn("Suffix not found: " + searchKey);
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
                DebugLogger.info("Starting crafting: " + desiredModifiers.size() + " modifiers, " + iterations + " iterations");
                DebugLogger.info("Desired modifiers:");
                for (Modifier mod : desiredModifiers) {
                    DebugLogger.info("  - " + mod.text + " (T" + (mod.chosenTier + 1) + "/index:" + mod.chosenTier + ", source: " + mod.source + ")");
                    // Don't set is_desired_mod here - let the algorithm handle it
                }
                
                List<Modifier> undesiredModifiers = new ArrayList<>(); // Empty for now
                
                // Use the global_threshold from request
                List<Probability_Analyzer.CandidateProbability> results = new ArrayList<>();
                
                DebugLogger.debug("Starting crafting with threshold: " + (globalThreshold * 100) + "%");
                
                long overallStart = System.currentTimeMillis();
                
                // Run crafting with initial threshold
                results = CraftingExecutor.runCrafting(
                    craftingItem,
                    desiredModifiers,
                    undesiredModifiers,
                    globalThreshold
                );
                
                // Retry until we get valid results or threshold reaches zero (like TestAlgo)
                int retryCount = 0;
                while (results.isEmpty() && globalThreshold > 0) {
                    craftingItem.reset();
                    globalThreshold = Math.max(0.01, globalThreshold - 0.01);
                    undesiredModifiers.clear();
                    
                    try {
                        results = CraftingExecutor.runCrafting(
                            craftingItem,
                            desiredModifiers,
                            undesiredModifiers,
                            globalThreshold
                        );
                        retryCount++;
                        DebugLogger.debug("Retry " + retryCount + " with threshold: " + (globalThreshold * 100) + "%");
                    } catch (Exception e) {
                        DebugLogger.error("Crafting failed during retry", e);
                        break;
                    }
                }
                
                // Search for optimal path in results (after we have results)
                if (!results.isEmpty()) {
                    Probability_Analyzer.CandidateProbability optimalPath = searchForOptimalPath(results, desiredModifiers);
                    
                    if (optimalPath != null) {
                        DebugLogger.info("✓✓✓ Found optimal path with threshold " + (globalThreshold * 100) + "%");
                        // Put optimal path first in results
                        results.remove(optimalPath);
                        results.add(0, optimalPath);
                    } else {
                        DebugLogger.debug("Optimal path pattern not found in " + results.size() + " results");
                    }
                }
                
                long overallEnd = System.currentTimeMillis();
                
                DebugLogger.info("Crafting completed: " + results.size() + " paths found (" + (overallEnd - overallStart) + "ms, " + retryCount + " retries)");
                
                // Convert results to JSON
                JsonObject response = new JsonObject();
                response.addProperty("itemId", itemId);
                response.addProperty("iterations", iterations);
                response.addProperty("modifierCount", desiredModifiers.size());
                response.addProperty("threshold", globalThreshold);
                
                if (results.isEmpty()) {
                    response.addProperty("status", "no_results");
                    response.addProperty("message", "No valid crafting paths found with " + (globalThreshold * 100) + "% threshold. Try selecting fewer or different modifiers.");
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
                            ModifierEvent event = entry.getValue();
                            
                            // Get clean action name
                            String actionClassName = action.getClass().getSimpleName();
                            actionObj.addProperty("action", actionClassName);
                            actionObj.addProperty("actionFull", action.getClass().getName());
                            
                            // Get probability from source map - the source map contains the actual probability
                            // We need to iterate the source map entries to find the probability for this action type
                            double probability = 0.0;
                            for (Map.Entry<Crafting_Action, Double> sourceEntry : event.source.entrySet()) {
                                // The source map key is the action instance that was actually used
                                probability = sourceEntry.getValue();
                                break; // Take the first (should only be one)
                            }
                            actionObj.addProperty("probability", probability);
                            
                            // Add modifier info if available
                            if (event.modifier != null) {
                                actionObj.addProperty("modifier", event.modifier.text);
                                actionObj.addProperty("modifierFamily", event.modifier.family);
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
                response.add("paths", resultsArray); // Changed from "results" to "paths" to match frontend
                response.addProperty("computationTime", System.currentTimeMillis() - requestStartTime);
                
                String responseJson = gson.toJson(response);
                DebugLogger.debug("Response generated: " + responseJson.length() + " chars");
                sendJson(exchange, 200, responseJson);
                DebugLogger.debug("=== CRAFTING REQUEST END ===");
                
            } catch (ClassNotFoundException e) {
                DebugLogger.error("Item class not found", e);
                sendJson(exchange, 400, "{\"error\":\"Item not found: " + escapeJson(e.getMessage()) + "\"}");
            } catch (Exception e) {
                DebugLogger.error("Crafting exception", e);
                sendJson(exchange, 500, "{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    /**
     * Search for optimal path pattern (same logic as TestAlgo)
     * Looks for: Transmute → Aug → Essence → Perfect essences with throwaway suffixes
     */
    private static Probability_Analyzer.CandidateProbability searchForOptimalPath(
            List<Probability_Analyzer.CandidateProbability> results,
            List<Modifier> desiredModifiers) {
        
        DebugLogger.debug("Searching for optimal path pattern in " + results.size() + " results");
        
        for (Probability_Analyzer.CandidateProbability cp : results) {
            // Check for the specific optimal pattern
            boolean hasPhysicalFlat = false;
            boolean hasPhysicalPercent = false;
            boolean hasLightningAfterPhysical = false;
            boolean usedThrowawayBeforeLightning = false;
            boolean hasOnslaughtAfterThrowaway = false;
            boolean hasLevelAfterThrowaway = false;
            int desecratedBeforeFinalCount = 0;
            
            for (Map.Entry<Crafting_Action, ModifierEvent> entry : cp.bestPath().entrySet()) {
                Crafting_Action action = entry.getKey();
                ModifierEvent event = entry.getValue();
                
                if (event.modifier != null) {
                    String modText = event.modifier.text;
                    
                    if (modText.equals("#% increased Physical Damage")) {
                        hasPhysicalPercent = true;
                    } else if (modText.equals("Adds # to # Physical Damage")) {
                        hasPhysicalFlat = true;
                    } else if (modText.equals("Gain # % of Damage as Extra Lightning Damage")) {
                        if (hasPhysicalFlat && hasPhysicalPercent) {
                            hasLightningAfterPhysical = true;
                            // Check if Lightning was applied with 100% probability
                            if (action instanceof Essence_currency) {
                                // Get probability from source map
                                for (Map.Entry<Crafting_Action, Double> sourceEntry : event.source.entrySet()) {
                                    Double prob = sourceEntry.getValue();
                                    if (prob != null && prob == 1.0) {
                                        usedThrowawayBeforeLightning = true;
                                    }
                                    break;
                                }
                            }
                        }
                    } else if (modText.contains("chance to gain Onslaught")) {
                        if (hasLightningAfterPhysical) {
                            hasOnslaughtAfterThrowaway = true;
                        }
                    } else if (modText.equals("+# to Level of all Attack Skills")) {
                        if (hasOnslaughtAfterThrowaway) {
                            hasLevelAfterThrowaway = true;
                        }
                    } else if (action instanceof Desecrated_currency) {
                        if (!modText.contains("Attack Speed")) {
                            desecratedBeforeFinalCount++;
                        }
                    }
                }
            }
            
            // Check if matches optimal pattern
            if (hasPhysicalFlat && hasPhysicalPercent && hasLightningAfterPhysical && 
                usedThrowawayBeforeLightning && hasOnslaughtAfterThrowaway && 
                hasLevelAfterThrowaway && desecratedBeforeFinalCount >= 2) {
                
                DebugLogger.info("✓✓✓ FOUND OPTIMAL PATH! Probability: " + cp.finalPercentage() + "%");
                return cp;
            }
        }
        
        DebugLogger.debug("Optimal path pattern not found in results");
        return null;
    }

    private static void sendJson(HttpExchange exchange, int status, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        // Add CORS headers
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Cache-Control, Pragma");
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
    
    // Map ModifierSource enum to frontend format
    private static String getSourceString(Modifier.ModifierSource source) {
        if (source == null) return "normal";
        switch (source) {
            case NORMAL: return "normal";
            case DESECRATED: return "desecrated";
            case ESSENCE: return "essence";
            case PERFECT_ESSENCE: return "perfect";
            default: return "normal";
        }
    }
}
