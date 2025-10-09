package core;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.lang.reflect.Field;

import core.Modifier_class.*;
import core.Items.*;


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
    public Map<String, List<Modifier>> getAvailableModifiersFor(String CategoryPath, String SubCategoryPath) {
        try {
            String className;
            if (SubCategoryPath == null || SubCategoryPath.isEmpty()) {
                className = "core.Items." + CategoryPath;  // only category for single-base items
            } else {
                className = "core.Items." + CategoryPath + "." + SubCategoryPath;  // both for multi-base items
            }

            System.out.println(className);

            

            // Load the class and instantiate it
            Class<?> itemClass = Class.forName(className);
            Object itemInstance = itemClass.getDeclaredConstructor().newInstance();

            Map<String, List<Modifier>> result = new HashMap<>();

            // List of protected fields to retrieve
            String[] fields = {
                "Normal_allowedPrefixes",
                "Normal_allowedSuffixes",
                "Desecrated_allowedPrefixes",
                "Desecrated_allowedSuffixes",
                "Essences_allowedPrefixes",
                "Essences_allowedSuffixes"
            };

            // Access each field dynamically
            for (String fieldName : fields) {
                Field field = itemClass.getDeclaredField(fieldName);
                field.setAccessible(true); // allow access to protected
                @SuppressWarnings("unchecked") // Suppress unchecked cast warning
                List<Modifier> list = (List<Modifier>) field.get(itemInstance);
                result.put(fieldName, list != null ? list : new ArrayList<>());
            }

            return result;

        } catch (Exception e) {
            e.printStackTrace();
            return Map.of();
        }
    }

}

