package core;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

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
}
