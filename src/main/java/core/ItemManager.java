package core;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Manages item-related operations such as retrieving categories and subcategories
 * from the specified items directory.
 */
public class ItemManager {

    private final String itemsPath = "src/main/java/core/Items"; // Path to your Items folder

    /**
     * Retrieves all top-level category folder names from the items directory.
     *
     * @return A list of category folder names. Returns an empty list if the directory
     *         does not exist or is not a valid directory.
     */
    public List<String> getCategories() {
        File folder = new File(itemsPath);
        if (!folder.exists() || !folder.isDirectory())
            return new ArrayList<>();

        String[] categories = folder.list((current, name) -> new File(current, name).isDirectory());
        return categories != null ? Arrays.asList(categories) : new ArrayList<>();
    }

    /**
     * Retrieves all subfolders/files inside a specified category folder.
     *
     * @param category The name of the category folder.
     * @return A list of subfolder names within the specified category. Returns an
     *         empty list if the category folder does not exist or is not a valid directory.
     */
    public List<String> getSubCategories(String category) {
        File folder = new File(itemsPath + "/" + category);
        if (!folder.exists() || !folder.isDirectory())
            return new ArrayList<>();

        String[] subCategories = folder.list((current, name) -> new File(current, name).isDirectory());
        return subCategories != null ? Arrays.asList(subCategories) : new ArrayList<>();
    }

}
