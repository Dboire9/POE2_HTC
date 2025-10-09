package core;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class ItemManager {

    private final String itemsPath = "src/main/java/core/Items"; // Path to your Items folder

    // Returns all top-level category folder names
    public List<String> getCategories() {
        File folder = new File(itemsPath);
        if (!folder.exists() || !folder.isDirectory()) return new ArrayList<>();

        String[] categories = folder.list((current, name) -> new File(current, name).isDirectory());
        return categories != null ? Arrays.asList(categories) : new ArrayList<>();
    }

    // Returns all subfolders/files inside a category
    public List<String> getSubCategories(String category) {
        File folder = new File(itemsPath + "/" + category);
        if (!folder.exists() || !folder.isDirectory()) return new ArrayList<>();

        String[] subCategories = folder.list((current, name) -> new File(current, name).isDirectory());
        return subCategories != null ? Arrays.asList(subCategories) : new ArrayList<>();
    }

    // Getting the modifiers of the items the user chose
    public Map<String, List<String>> getAvailableModifiersFor(Class<?> itemClass) {
        try {
            Object itemInstance = itemClass.getDeclaredConstructor().newInstance();
            Map<String, List<String>> result = new HashMap<>();
    
            result.put("NormalPrefixes", (List<String>) itemClass.getField("Normal_allowedPrefixes").get(itemInstance));
            result.put("NormalSuffixes", (List<String>) itemClass.getField("Normal_allowedSuffixes").get(itemInstance));
            result.put("DesecratedPrefixes", (List<String>) itemClass.getField("Desecrated_allowedPrefixes").get(itemInstance));
            result.put("DesecratedSuffixes", (List<String>) itemClass.getField("Desecrated_allowedSuffixes").get(itemInstance));
            result.put("EssencePrefixes", (List<String>) itemClass.getField("Essences_allowedPrefixes").get(itemInstance));
            result.put("EssenceSuffixes", (List<String>) itemClass.getField("Essences_allowedSuffixes").get(itemInstance));
    
            return result;
    
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of();
        }
    }
}

