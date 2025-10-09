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
        if (!folder.exists() || !folder.isDirectory())
            return new ArrayList<>();

        String[] categories = folder.list((current, name) -> new File(current, name).isDirectory());
        return categories != null ? Arrays.asList(categories) : new ArrayList<>();
    }

    // Returns all subfolders/files inside a category
    public List<String> getSubCategories(String category) {
        File folder = new File(itemsPath + "/" + category);
        if (!folder.exists() || !folder.isDirectory())
            return new ArrayList<>();

        String[] subCategories = folder.list((current, name) -> new File(current, name).isDirectory());
        return subCategories != null ? Arrays.asList(subCategories) : new ArrayList<>();
    }

    // Getting the modifiers of the items the user chose
    public Map<String, List<String>> getAvailableModifiersFor(String CategoryPath, String SubCategoryPath) {
        try {
            String className;
            if (SubCategoryPath == null || SubCategoryPath.isEmpty()) {
                className = "core.Items." + CategoryPath + "." + CategoryPath; // single-base
            } else {
                className = "core.Items." + CategoryPath + "." + SubCategoryPath + "." + SubCategoryPath; // multi-base
            }

            System.out.println("Loading item class: " + className);

            Class<?> itemClass = Class.forName(className);
            Object itemInstance = itemClass.getDeclaredConstructor().newInstance();

            // Get protected field from superclass
            Field normalPrefixesField = itemClass.getSuperclass().getDeclaredField("Normal_allowedPrefixes");
            normalPrefixesField.setAccessible(true);

            @SuppressWarnings("unchecked")
            List<Modifier> normalPrefixes = (List<Modifier>) normalPrefixesField.get(itemInstance);

            List<String> normalPrefixTexts = new ArrayList<>();
            for (Modifier mod : normalPrefixes) {
                normalPrefixTexts.add(mod.text);
                System.out.println(mod.text);
            }

            Map<String, List<String>> result = new HashMap<>();
            result.put("NormalPrefixes", normalPrefixTexts);
            return result;

        } catch (Exception e) {
            e.printStackTrace();
            return Map.of();
        }
    }

}
