package core;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Item;
import core.Crafting.CraftingExecutor;
import core.Crafting.Probabilities.Probability_Analyzer;
import core.Crafting.Utils.ModifierEvent;
import core.Currency.Desecrated_currency;
import core.Currency.Essence_currency;
import core.Items.Item_base;
import core.Modifier_class.Modifier;
import core.Modifier_class.ModifierTier;
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

			// Subcategories endpoint (for items with hybrid bases)
			server.createContext("/api/subcategories", new SubcategoriesHandler());

			// Modifiers endpoint
			server.createContext("/api/modifiers", new ModifiersHandler());

			// Crafting endpoint (stub)
			server.createContext("/api/crafting", new CraftingHandler());

			// Use thread pool for concurrent request handling
			server.setExecutor(Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors()));
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
			// Build a simple JSON array of {id,name,type,baseStats,hasSubcategories}
			StringBuilder sb = new StringBuilder();
			sb.append('[');
			for (int i = 0; i < categories.size(); i++) {
				String c = categories.get(i);
				List<String> subCats = manager.getSubCategories(c);
				boolean hasSubcategories = !subCats.isEmpty();

				// Convert category name to type format (e.g., "Body_Armours" -> "body_armour")
				String type = c.toLowerCase().replace("_", "_").replaceAll("s$", "");
				sb.append('{')
						.append("\"id\":\"").append(escapeJson(c)).append("\",")
						.append("\"name\":\"").append(escapeJson(c)).append("\",")
						.append("\"type\":\"").append(escapeJson(type)).append("\",")
						.append("\"hasSubcategories\":").append(hasSubcategories).append(",")
						.append("\"baseStats\":{}") // Empty for now
						.append("}");
				if (i < categories.size() - 1)
					sb.append(',');
			}
			sb.append(']');
			sendJson(exchange, 200, sb.toString());
		}
	}

	static class SubcategoriesHandler implements HttpHandler {
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

			// Parse query parameters: ?category=Body_Armours
			String query = exchange.getRequestURI().getQuery();
			String category = "";
			if (query != null) {
				for (String param : query.split("&")) {
					String[] kv = param.split("=");
					if (kv.length == 2 && "category".equals(kv[0])) {
						category = kv[1];
					}
				}
			}

			if (category.isEmpty()) {
				sendJson(exchange, 400, "{\"error\":\"category parameter required\"}");
				return;
			}

			ItemManager manager = new ItemManager();
			List<String> subCategories = manager.getSubCategories(category);

			// Build JSON array
			StringBuilder sb = new StringBuilder();
			sb.append('[');
			for (int i = 0; i < subCategories.size(); i++) {
				String subCat = subCategories.get(i);
				sb.append('{')
						.append("\"id\":\"").append(escapeJson(subCat)).append("\",")
						.append("\"name\":\"").append(escapeJson(subCat)).append("\"")
						.append("}");
				if (i < subCategories.size() - 1)
					sb.append(',');
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

			// Parse query parameters: ?itemId=Helmets&subcategory=Body_Armours_str
			String query = exchange.getRequestURI().getQuery();
			String itemId = "";
			String subcategory = "";
			if (query != null) {
				for (String param : query.split("&")) {
					String[] kv = param.split("=");
					if (kv.length == 2) {
						if ("itemId".equals(kv[0])) {
							itemId = kv[1];
						} else if ("subcategory".equals(kv[0])) {
							subcategory = kv[1];
						}
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
					// Has subcategories - use provided subcategory or first one
					// e.g., core.Items.Body_Armours.Body_Armours_str.Body_Armours_str
					String subCat = subcategory.isEmpty() ? subCategories.get(0) : subcategory;
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

				// Build JSON response with source field and tier details
				StringBuilder sb = new StringBuilder();
				sb.append("{\"prefixes\":[");
				for (int i = 0; i < allPrefixes.size(); i++) {
					Modifier mod = allPrefixes.get(i);
					String sourceStr = getSourceString(mod.source);
					sb.append("{")
							.append("\"id\":\"").append(escapeJson(mod.family)).append("\",")
							.append("\"name\":\"").append(escapeJson(mod.text)).append("\",")
							.append("\"tiers\":").append(mod.tiers.size()).append(",")
							.append("\"tierDetails\":[");
					for (int j = 0; j < mod.tiers.size(); j++) {
						ModifierTier tier = mod.tiers.get(j);
						sb.append("{")
								.append("\"name\":\"").append(escapeJson(tier.name)).append("\",")
								.append("\"level\":").append(tier.level).append(",")
								.append("\"minMax1\":{\"min\":").append(tier.minMax1.first()).append(",\"max\":")
								.append(tier.minMax1.second()).append("}");
						if (tier.minMax2 != null) {
							sb.append(",\"minMax2\":{\"min\":").append(tier.minMax2.first()).append(",\"max\":")
									.append(tier.minMax2.second()).append("}");
						}
						if (tier.minMax3 != null) {
							sb.append(",\"minMax3\":{\"min\":").append(tier.minMax3.first()).append(",\"max\":")
									.append(tier.minMax3.second()).append("}");
						}
						if (tier.minMax4 != null) {
							sb.append(",\"minMax4\":{\"min\":").append(tier.minMax4.first()).append(",\"max\":")
									.append(tier.minMax4.second()).append("}");
						}
						sb.append("}");
						if (j < mod.tiers.size() - 1)
							sb.append(',');
					}
					sb.append("],")
							.append("\"source\":\"").append(sourceStr).append("\"")
							.append("}");
					if (i < allPrefixes.size() - 1)
						sb.append(',');
				}
				sb.append("],\"suffixes\":[");
				for (int i = 0; i < allSuffixes.size(); i++) {
					Modifier mod = allSuffixes.get(i);
					String sourceStr = getSourceString(mod.source);
					sb.append("{")
							.append("\"id\":\"").append(escapeJson(mod.family)).append("\",")
							.append("\"name\":\"").append(escapeJson(mod.text)).append("\",")
							.append("\"tiers\":").append(mod.tiers.size()).append(",")
							.append("\"tierDetails\":[");
					for (int j = 0; j < mod.tiers.size(); j++) {
						ModifierTier tier = mod.tiers.get(j);
						sb.append("{")
								.append("\"name\":\"").append(escapeJson(tier.name)).append("\",")
								.append("\"level\":").append(tier.level).append(",")
								.append("\"minMax1\":{\"min\":").append(tier.minMax1.first()).append(",\"max\":")
								.append(tier.minMax1.second()).append("}");
						if (tier.minMax2 != null) {
							sb.append(",\"minMax2\":{\"min\":").append(tier.minMax2.first()).append(",\"max\":")
									.append(tier.minMax2.second()).append("}");
						}
						if (tier.minMax3 != null) {
							sb.append(",\"minMax3\":{\"min\":").append(tier.minMax3.first()).append(",\"max\":")
									.append(tier.minMax3.second()).append("}");
						}
						if (tier.minMax4 != null) {
							sb.append(",\"minMax4\":{\"min\":").append(tier.minMax4.first()).append(",\"max\":")
									.append(tier.minMax4.second()).append("}");
						}
						sb.append("}");
						if (j < mod.tiers.size() - 1)
							sb.append(',');
					}
					sb.append("],")
							.append("\"source\":\"").append(sourceStr).append("\"")
							.append("}");
					if (i < allSuffixes.size() - 1)
						sb.append(',');
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

				// Input validation
				if (jsonRequest == null || !jsonRequest.has("itemId")) {
					sendJson(exchange, 400, "{\"error\":\"Missing required field: itemId\"}");
					return;
				}

				String itemId = jsonRequest.get("itemId").getAsString();
				if (itemId == null || itemId.trim().isEmpty()) {
					sendJson(exchange, 400, "{\"error\":\"itemId cannot be empty\"}");
					return;
				}

				DebugLogger.info("Parsed itemId: " + itemId);

				int iterations = jsonRequest.has("iterations") ? jsonRequest.get("iterations").getAsInt() : 100;

				// Validate iterations
				if (iterations < 1 || iterations > 10000) {
					sendJson(exchange, 400, "{\"error\":\"iterations must be between 1 and 10000\"}");
					return;
				}

				// Read global_threshold from request (default 0.33 = 33%)
				double globalThreshold = jsonRequest.has("global_threshold")
						? jsonRequest.get("global_threshold").getAsDouble()
						: 0.33;

				// Validate threshold
				if (globalThreshold < 0.0 || globalThreshold > 1.0) {
					sendJson(exchange, 400, "{\"error\":\"global_threshold must be between 0.0 and 1.0\"}");
					return;
				}

				// Parse excluded currencies
				List<Map<String, String>> excludedCurrencies = new ArrayList<>();
				if (jsonRequest.has("excludedCurrencies") && jsonRequest.get("excludedCurrencies").isJsonArray()) {
					JsonArray excludedArray = jsonRequest.getAsJsonArray("excludedCurrencies");
					for (int i = 0; i < excludedArray.size(); i++) {
						JsonObject currencyObj = excludedArray.get(i).getAsJsonObject();
						Map<String, String> exclusion = new java.util.HashMap<>();
						if (currencyObj.has("currency")) {
							exclusion.put("currency", currencyObj.get("currency").getAsString());
						}
						if (currencyObj.has("tier")) {
							exclusion.put("tier", currencyObj.get("tier").getAsString());
						}
						excludedCurrencies.add(exclusion);
					}
				}

				// Parse modifiers
				if (!jsonRequest.has("modifiers")) {
					sendJson(exchange, 400, "{\"error\":\"No modifiers provided\"}");
					return;
				}

				// Handle modifiers - it's an object with keys like prefixes and suffixes arrays
				JsonObject modifiersObj = jsonRequest.getAsJsonObject("modifiers");

				// Validate modifiers object
				if (modifiersObj == null) {
					sendJson(exchange, 400, "{\"error\":\"Missing required field: modifiers\"}");
					return;
				}

				// Load item class dynamically with subcategory resolution
				// itemId could be "Boots" or "Boots/Boots_int" format
				String category = itemId;
				String specificSubCat = null;

				// Check if itemId contains a slash (e.g., "Boots/Boots_int")
				if (itemId.contains("/")) {
					String[] parts = itemId.split("/");
					category = parts[0];
					specificSubCat = parts[1];
					DebugLogger.info("Parsed itemId: category=" + category + ", subcat=" + specificSubCat);
				}

				String packagePath = "core.Items." + category;
				List<String> subCategories = new ItemManager().getSubCategories(category);

				String fullClassName;

				if (subCategories.isEmpty()) {
					// No subcategories - the class is directly in the category folder
					fullClassName = packagePath + "." + category;
				} else {
					// Has subcategories - use specific one if provided, otherwise use first
					String subCat = specificSubCat != null ? specificSubCat : subCategories.get(0);
					fullClassName = packagePath + "." + subCat + "." + subCat;
					DebugLogger.info("Using subcategory: " + subCat + " -> " + fullClassName);
				}

				Class<?> itemClass = Class.forName(fullClassName);
				Item_base itemInstance = (Item_base) itemClass.getDeclaredConstructor().newInstance();
				DebugLogger.debug("Created NEW item instance: " + itemInstance.getClass().getSimpleName() + "@"
						+ System.identityHashCode(itemInstance));

				// Get allowed modifiers from all sources
				List<Modifier> normalPrefixes = itemInstance.getNormalAllowedPrefixes();
				List<Modifier> normalSuffixes = itemInstance.getNormalAllowedSuffixes();
				List<Modifier> desecratedPrefixes = itemInstance.getDesecratedAllowedPrefixes();
				List<Modifier> desecratedSuffixes = itemInstance.getDesecratedAllowedSuffixes();
				List<Modifier> essencePrefixes = itemInstance.getEssencesAllowedPrefixes();
				List<Modifier> essenceSuffixes = itemInstance.getEssencesAllowedSuffixes();

				// Combine all modifiers into a single lookup list
				List<Modifier> allPrefixes = new ArrayList<>();
				if (normalPrefixes != null)
					allPrefixes.addAll(normalPrefixes);
				if (desecratedPrefixes != null)
					allPrefixes.addAll(desecratedPrefixes);
				if (essencePrefixes != null)
					allPrefixes.addAll(essencePrefixes);

				List<Modifier> allSuffixes = new ArrayList<>();
				if (normalSuffixes != null)
					allSuffixes.addAll(normalSuffixes);
				if (desecratedSuffixes != null)
					allSuffixes.addAll(desecratedSuffixes);
				if (essenceSuffixes != null)
					allSuffixes.addAll(essenceSuffixes);

				// Parse selected modifiers and match with item's allowed modifiers
				List<Modifier> desiredModifiers = new ArrayList<>();
				List<Modifier> existingMods = new ArrayList<>();
				DebugLogger.info("★ Parsing modifiers from request...");
				DebugLogger.debug("Available prefixes: " + allPrefixes.size() + ", suffixes: " + allSuffixes.size());

				// ===== PARSE EXISTING MODIFIERS (if present) =====
				boolean isMagicRarity = false; // Track if user selected magic rarity
				if (jsonRequest.has("existingModifiers") && !jsonRequest.get("existingModifiers").isJsonNull()) {
					JsonObject existingModsObj = jsonRequest.getAsJsonObject("existingModifiers");
					DebugLogger.info("★ EXISTING MODIFIERS DETECTED - Starting from an item with existing mods");

					// Parse itemRarity if present (frontend sends 'magic' or 'rare')
					if (jsonRequest.has("itemRarity") && !jsonRequest.get("itemRarity").isJsonNull()) {
						String rarityStr = jsonRequest.get("itemRarity").getAsString();
						isMagicRarity = "magic".equalsIgnoreCase(rarityStr);
						DebugLogger
								.info("★ Item rarity from request: " + rarityStr + " (isMagic=" + isMagicRarity + ")");
					}

					// Handle existing prefixes
					if (existingModsObj.has("prefixes") && existingModsObj.get("prefixes").isJsonArray()) {
						JsonArray existingPrefixesArray = existingModsObj.getAsJsonArray("prefixes");
						DebugLogger.info("★ Processing " + existingPrefixesArray.size() + " existing prefixes");
						for (int i = 0; i < existingPrefixesArray.size(); i++) {
							JsonObject modJson = existingPrefixesArray.get(i).getAsJsonObject();

							String modText = modJson.has("text") && !modJson.get("text").isJsonNull()
									? modJson.get("text").getAsString()
									: null;
							String modId = modJson.has("id") && !modJson.get("id").isJsonNull()
									? modJson.get("id").getAsString()
									: null;

							if (modText == null && modId == null)
								continue;

							int tier = modJson.has("tier") ? modJson.get("tier").getAsInt() : 0;

							String searchKey = modText != null ? modText : modId;
							DebugLogger.trace("Looking for existing prefix: " + searchKey + " (tier " + tier + ")");

							// Find matching modifier
							boolean found = false;
							for (Modifier prefix : allPrefixes) {
								boolean matches = false;
								if (modText != null) {
									String normalizedPrefixText = prefix.text.replaceAll("\\n", " ")
											.replaceAll("\\s+", " ").trim();
									String normalizedModText = modText.replaceAll("\\n", " ").replaceAll("\\s+", " ")
											.trim();
									matches = normalizedPrefixText.equals(normalizedModText);
								} else if (modId != null) {
									matches = prefix.family.equals(modId);
								}

								if (matches) {
									prefix.chosenTier = tier;
									// Mark as existing, NOT as desired
									existingMods.add(prefix);
									DebugLogger.debug("✓ Existing Prefix: " + prefix.text + " (tier=" + tier + ")");
									found = true;
									break;
								}
							}
							if (!found) {
								DebugLogger.warn("Existing prefix not found: " + searchKey);
							}
						}
					}

					// Handle existing suffixes
					if (existingModsObj.has("suffixes") && existingModsObj.get("suffixes").isJsonArray()) {
						JsonArray existingSuffixesArray = existingModsObj.getAsJsonArray("suffixes");
						DebugLogger.info("★ Processing " + existingSuffixesArray.size() + " existing suffixes");
						for (int i = 0; i < existingSuffixesArray.size(); i++) {
							JsonObject modJson = existingSuffixesArray.get(i).getAsJsonObject();

							String modText = modJson.has("text") && !modJson.get("text").isJsonNull()
									? modJson.get("text").getAsString()
									: null;
							String modId = modJson.has("id") && !modJson.get("id").isJsonNull()
									? modJson.get("id").getAsString()
									: null;

							if (modText == null && modId == null)
								continue;

							int tier = modJson.has("tier") ? modJson.get("tier").getAsInt() : 0;

							String searchKey = modText != null ? modText : modId;
							DebugLogger.trace("Looking for existing suffix: " + searchKey + " (tier " + tier + ")");

							// Find matching modifier
							boolean found = false;
							for (Modifier suffix : allSuffixes) {
								boolean matches = false;
								if (modText != null) {
									String normalizedSuffixText = suffix.text.replaceAll("\\n", " ")
											.replaceAll("\\s+", " ").trim();
									String normalizedModText = modText.replaceAll("\\n", " ").replaceAll("\\s+", " ")
											.trim();
									matches = normalizedSuffixText.equals(normalizedModText);
								} else if (modId != null) {
									matches = suffix.family.equals(modId);
								}

								if (matches) {
									suffix.chosenTier = tier;
									// Mark as existing, NOT as desired
									existingMods.add(suffix);
									DebugLogger.debug("✓ Existing Suffix: " + suffix.text + " (tier=" + tier + ")");
									found = true;
									break;
								}
							}
							if (!found) {
								DebugLogger.warn("Existing suffix not found: " + searchKey);
							}
						}
					}
				}

				// ===== PARSE DESIRED/TARGET MODIFIERS =====

				// Handle prefixes array if present
				if (modifiersObj.has("prefixes") && modifiersObj.get("prefixes").isJsonArray()) {
					JsonArray prefixesArray = modifiersObj.getAsJsonArray("prefixes");
					DebugLogger.info("★ Processing " + prefixesArray.size() + " prefixes from request");
					for (int i = 0; i < prefixesArray.size(); i++) {
						JsonObject modJson = prefixesArray.get(i).getAsJsonObject();

						String modText = modJson.has("text") && !modJson.get("text").isJsonNull()
								? modJson.get("text").getAsString()
								: null;
						String modId = modJson.has("id") && !modJson.get("id").isJsonNull()
								? modJson.get("id").getAsString()
								: null;

						if (modText == null && modId == null)
							continue;

						int tier = modJson.has("tier") ? modJson.get("tier").getAsInt() : 0;

						String searchKey = modText != null ? modText : modId;
						DebugLogger.trace("Looking for prefix: " + searchKey + " (tier " + tier + ")");

						// Search in all prefixes (normal, essence, desecrated)
						// We'll match based on text/id, then use the modifier's actual source

						// Find matching modifier
						boolean found = false;
						for (Modifier prefix : allPrefixes) {
							boolean matches = false;
							if (modText != null) {
								// Normalize both texts: replace newlines with spaces and trim extra whitespace
								String normalizedPrefixText = prefix.text.replaceAll("\\n", " ").replaceAll("\\s+", " ")
										.trim();
								String normalizedModText = modText.replaceAll("\\n", " ").replaceAll("\\s+", " ")
										.trim();
								matches = normalizedPrefixText.equals(normalizedModText);
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
								? modJson.get("text").getAsString()
								: null;
						String modId = modJson.has("id") && !modJson.get("id").isJsonNull()
								? modJson.get("id").getAsString()
								: null;

						if (modText == null && modId == null)
							continue;

						int tier = modJson.has("tier") ? modJson.get("tier").getAsInt() : 0;

						String searchKey = modText != null ? modText : modId;
						DebugLogger.trace("Looking for suffix: " + searchKey + " (tier " + tier + ")");

						// Search in all suffixes (normal, essence, desecrated)
						// We'll match based on text/id, then use the modifier's actual source

						// Find matching modifier
						boolean found = false;
						for (Modifier suffix : allSuffixes) {
							boolean matches = false;
							if (modText != null) {
								// Normalize both texts: replace newlines with spaces and trim extra whitespace
								String normalizedSuffixText = suffix.text.replaceAll("\\n", " ").replaceAll("\\s+", " ")
										.trim();
								String normalizedModText = modText.replaceAll("\\n", " ").replaceAll("\\s+", " ")
										.trim();
								matches = normalizedSuffixText.equals(normalizedModText);
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

				// Check for family conflicts within prefixes and suffixes
				List<String> prefixConflicts = new ArrayList<>();
				List<String> suffixConflicts = new ArrayList<>();

				for (int i = 0; i < desiredModifiers.size(); i++) {
					Modifier mod1 = desiredModifiers.get(i);

					for (int j = i + 1; j < desiredModifiers.size(); j++) {
						Modifier mod2 = desiredModifiers.get(j);

						// Only check conflicts within the same type (prefix vs prefix, suffix vs
						// suffix)
						if (mod1.type != mod2.type)
							continue;

						// Check if they share the same family
						if (mod1.family != null && mod1.family.equals(mod2.family)) {
							String conflictMsg = "• \"" + mod1.text.replaceAll("\\n", " ") + "\" and \"" +
									mod2.text.replaceAll("\\n", " ") + "\" (family: " + mod1.family + ")";

							if (mod1.type == Modifier.ModifierType.PREFIX) {
								prefixConflicts.add(conflictMsg);
							} else {
								suffixConflicts.add(conflictMsg);
							}
						}
					}
				}

				// If conflicts found, return error with detailed message
				if (!prefixConflicts.isEmpty() || !suffixConflicts.isEmpty()) {
					StringBuilder conflictMessage = new StringBuilder();
					conflictMessage.append(
							"Cannot craft: Selected modifiers share the same family and cannot coexist on one item.\\n\\n");

					if (!prefixConflicts.isEmpty()) {
						conflictMessage.append("Conflicting Prefixes:\\n");
						for (String conflict : prefixConflicts) {
							conflictMessage.append(conflict).append("\\n");
						}
					}

					if (!suffixConflicts.isEmpty()) {
						if (!prefixConflicts.isEmpty())
							conflictMessage.append("\\n");
						conflictMessage.append("Conflicting Suffixes:\\n");
						for (String conflict : suffixConflicts) {
							conflictMessage.append(conflict).append("\\n");
						}
					}

					conflictMessage.append("\\nPlease remove or replace one of the conflicting modifiers.");

					DebugLogger.warn("Family conflicts detected:");
					DebugLogger.warn(conflictMessage.toString().replaceAll("\\\\n", "\n"));

					JsonObject errorResponse = new JsonObject();
					errorResponse.addProperty("error", "family_conflict");
					errorResponse.addProperty("message", conflictMessage.toString());
					sendJson(exchange, 400, new Gson().toJson(errorResponse));
					return;
				}

				// Create Crafting_Item from Item_base
				Crafting_Item craftingItem = new Crafting_Item(itemInstance);

				// Set item rarity based on user selection (for existing mods workflow)
				if (!existingMods.isEmpty()) {
					if (isMagicRarity) {
						craftingItem.rarity = Crafting_Item.ItemRarity.MAGIC;
						DebugLogger.info("★ Set item rarity to MAGIC (1 prefix + 1 suffix max)");
					} else {
						craftingItem.rarity = Crafting_Item.ItemRarity.RARE;
						DebugLogger.info("★ Set item rarity to RARE (3 prefix + 3 suffix max)");
					}
				}

				// ===== APPLY EXISTING MODIFIERS TO THE ITEM =====
				if (!existingMods.isEmpty()) {
					DebugLogger.info("★★★ APPLYING " + existingMods.size() + " EXISTING MODIFIERS TO ITEM ★★★");
					for (Modifier existingMod : existingMods) {
						// Get the tier object from the modifier's tiers list
						ModifierTier tierToApply = existingMod.tiers.get(existingMod.chosenTier);

						// Apply the existing modifier to the crafting item
						if (existingMod.type == Modifier.ModifierType.PREFIX) {
							craftingItem.addPrefix(existingMod, tierToApply);
						} else {
							craftingItem.addSuffix(existingMod, tierToApply);
						}
						DebugLogger
								.info("  ✓ Applied: " + existingMod.text + " (T" + (existingMod.chosenTier + 1) + ")");
					}
					DebugLogger.info("Item now has " + craftingItem.getAllCurrentModifiers().size()
							+ " modifiers before crafting");
				}

				// Run crafting simulation
				DebugLogger.info("Starting crafting: " + desiredModifiers.size() + " desired modifiers, " + iterations
						+ " iterations");
				boolean hasExistingMods = !existingMods.isEmpty();
				if (hasExistingMods) {
					DebugLogger.info("Starting from item with " + existingMods.size() + " existing modifiers:");
					for (Modifier mod : existingMods) {
						DebugLogger.info("  - [EXISTING] " + mod.text + " (T" + (mod.chosenTier + 1) + ")");
					}
				}
				DebugLogger.info("Target modifiers to add:");
				for (Modifier mod : desiredModifiers) {
					DebugLogger.info("  - [TARGET] " + mod.text + " (T" + (mod.chosenTier + 1) + "/index:"
							+ mod.chosenTier + ", source: " + mod.source + ")");
				}

				List<Modifier> undesiredModifiers = new ArrayList<>(); // Empty for now

				// Use the global_threshold from request
				List<Probability_Analyzer.CandidateProbability> results = new ArrayList<>();

				DebugLogger.debug("Starting crafting with threshold: " + (globalThreshold * 100) + "%");

				long overallStart = System.currentTimeMillis();

				// Run crafting with initial threshold
				// Use different method based on whether item has existing mods
				if (hasExistingMods) {
					results = CraftingExecutor.runCraftingWithExistingMods(
							craftingItem,
							desiredModifiers,
							undesiredModifiers,
							globalThreshold,
							existingMods,
							excludedCurrencies);
				} else {
					results = CraftingExecutor.runCrafting(
							craftingItem,
							desiredModifiers,
							undesiredModifiers,
							globalThreshold,
							excludedCurrencies);
				}

				// Retry until we get valid results or threshold reaches minimum or max retries
				int retryCount = 0;
				int maxRetries = 33; // Maximum 33 retries (from 0.33 down to 0.00)
				while (results.isEmpty() && globalThreshold > 0 && retryCount < maxRetries) {
					craftingItem.reset();
					globalThreshold = globalThreshold - 0.01;
					if (globalThreshold < 0)
						globalThreshold = 0;
					undesiredModifiers.clear();

					try {
						if (hasExistingMods) {
							results = CraftingExecutor.runCraftingWithExistingMods(
									craftingItem,
									desiredModifiers,
									undesiredModifiers,
									globalThreshold,
									existingMods,
									excludedCurrencies);
						} else {
							results = CraftingExecutor.runCrafting(
									craftingItem,
									desiredModifiers,
									undesiredModifiers,
									globalThreshold,
									excludedCurrencies);
						}
						retryCount++;
						DebugLogger.debug("Retry " + retryCount + " with threshold: " + (globalThreshold * 100) + "%");
					} catch (Exception e) {
						DebugLogger.error("Crafting failed during retry", e);
						break;
					}
				}

				// Search for optimal path in results (after we have results)
				if (!results.isEmpty()) {
					Probability_Analyzer.CandidateProbability optimalPath = searchForOptimalPath(results,
							desiredModifiers);

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

				DebugLogger.info("Crafting completed: " + results.size() + " paths found ("
						+ (overallEnd - overallStart) + "ms, " + retryCount + " retries)");

				// Convert results to JSON
				JsonObject response = new JsonObject();
				response.addProperty("itemId", itemId);
				response.addProperty("iterations", iterations);
				response.addProperty("modifierCount", desiredModifiers.size());
				response.addProperty("threshold", globalThreshold);

				if (results.isEmpty()) {
					response.addProperty("status", "no_results");
					response.addProperty("message", "No valid crafting paths found with " + (globalThreshold * 100)
							+ "% threshold. Try selecting fewer or different modifiers.");
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

							// Get probability from source map - the source map contains the actual
							// probability
							// For actions like Desecrated_currency with multiple omens, the source map has
							// multiple entries
							// We need to get the probability for the specific action instance used in the
							// best path
							Double probability = event.source.get(action);
							if (probability == null) {
								probability = 0.0;
							}
						actionObj.addProperty("probability", probability);

						// Add modifier info if available
						if (event.modifier != null) {
							actionObj.addProperty("modifier", event.modifier.text);
							actionObj.addProperty("modifierFamily", event.modifier.family);
						}

						// Check if this is a perfect essence replacement (100% probability due to throwaway)
						if (probability >= 0.99 && event.changed_modifier != null) {
							actionObj.addProperty("isPerfectEssenceReplacement", true);
							actionObj.addProperty("replacedModifier", event.changed_modifier.text);
						}							// Extract action-specific details (tier, omens, etc.)
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
				DebugLogger
						.info("✓✓✓ RESPONSE READY: " + results.size() + " paths, " + responseJson.length() + " chars");
				DebugLogger.info("   First path probability: "
						+ (results.isEmpty() ? "N/A" : results.get(0).finalPercentage() + "%"));
				sendJson(exchange, 200, responseJson);
				DebugLogger.info("=== CRAFTING REQUEST END ===");

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
	 * Looks for: Transmute → Aug → Essence → Perfect essences with throwaway
	 * suffixes
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
		if (s == null)
			return "";
		StringBuilder sb = new StringBuilder();
		for (char c : s.toCharArray()) {
			switch (c) {
				case '\\':
					sb.append("\\\\");
					break;
				case '"':
					sb.append("\\\"");
					break;
				case '\n':
					sb.append("\\n");
					break;
				case '\r':
					sb.append("\\r");
					break;
				case '\t':
					sb.append("\\t");
					break;
				case '\b':
					sb.append("\\b");
					break;
				case '\f':
					sb.append("\\f");
					break;
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
		if (source == null)
			return "normal";
		switch (source) {
			case NORMAL:
				return "normal";
			case DESECRATED:
				return "desecrated";
			case ESSENCE:
				return "essence";
			case PERFECT_ESSENCE:
				return "perfect";
			default:
				return "normal";
		}
	}
}
