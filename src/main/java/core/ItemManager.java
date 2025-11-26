package core;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.stream.Collectors;

/**
 * Manages item-related operations such as retrieving categories and subcategories
 * from the specified items directory.
 */
public class ItemManager {

    private final String itemsPath = "src/main/java/core/Items"; // Path to your Items folder (dev mode)
    private final String itemsPackage = "core/Items"; // Package path for JAR mode

    /**
     * Retrieves all top-level category folder names from the items directory.
     *
     * @return A list of category folder names. Returns an empty list if the directory
     *         does not exist or is not a valid directory.
     */
    public List<String> getCategories() {
        // Try filesystem first (dev mode)
        File folder = new File(itemsPath);
        if (folder.exists() && folder.isDirectory()) {
            String[] categories = folder.list((current, name) -> new File(current, name).isDirectory());
            return categories != null ? Arrays.asList(categories) : new ArrayList<>();
        }

        // Fall back to JAR mode (production)
        return getCategoriesFromJar();
    }

    /**
     * Retrieves all subfolders/files inside a specified category folder.
     *
     * @param category The name of the category folder.
     * @return A list of subfolder names within the specified category. Returns an
     *         empty list if the category folder does not exist or is not a valid directory.
     */
    public List<String> getSubCategories(String category) {
        // Try filesystem first (dev mode)
        File folder = new File(itemsPath + "/" + category);
        if (folder.exists() && folder.isDirectory()) {
            String[] subCategories = folder.list((current, name) -> new File(current, name).isDirectory());
            return subCategories != null ? Arrays.asList(subCategories) : new ArrayList<>();
        }

        // Fall back to JAR mode (production)
        return getSubCategoriesFromJar(category);
    }

    /**
     * Retrieves categories from JAR by scanning the classpath.
     */
    private List<String> getCategoriesFromJar() {
        try {
            String jarPath = getJarPath();
            if (jarPath != null) {
                return scanJarForDirectories(jarPath, itemsPackage, 1);
            }
        } catch (Exception e) {
            System.err.println("Error reading categories from JAR: " + e.getMessage());
            e.printStackTrace();
        }
        return new ArrayList<>();
    }

    /**
     * Retrieves subcategories from JAR for a given category.
     */
    private List<String> getSubCategoriesFromJar(String category) {
        try {
            String jarPath = getJarPath();
            if (jarPath != null) {
                String categoryPath = itemsPackage + "/" + category;
                return scanJarForDirectories(jarPath, categoryPath, 1);
            }
        } catch (Exception e) {
            System.err.println("Error reading subcategories from JAR: " + e.getMessage());
            e.printStackTrace();
        }
        return new ArrayList<>();
    }

    /**
     * Gets the path to the JAR file containing this class.
     */
    private String getJarPath() {
        try {
            String className = ItemManager.class.getName().replace('.', '/') + ".class";
            URL resource = ItemManager.class.getClassLoader().getResource(className);
            if (resource != null) {
                String path = resource.toString();
                if (path.startsWith("jar:file:")) {
                    // Extract JAR path from jar:file:/path/to/file.jar!/package/Class.class
                    return path.substring(9, path.indexOf("!"));
                }
            }
        } catch (Exception e) {
            System.err.println("Error getting JAR path: " + e.getMessage());
        }
        return null;
    }

    /**
     * Scans a JAR file for directories at a specific depth under a base path.
     */
    private List<String> scanJarForDirectories(String jarPath, String basePath, int depth) {
        List<String> directories = new ArrayList<>();
        try (JarFile jar = new JarFile(jarPath)) {
            String normalizedBase = basePath.endsWith("/") ? basePath : basePath + "/";

            directories = jar.stream()
                .map(JarEntry::getName)
                .filter(name -> name.startsWith(normalizedBase) && name.endsWith("/"))
                .map(name -> name.substring(normalizedBase.length()))
                .filter(name -> !name.isEmpty())
                .map(name -> name.split("/")[0])
                .filter(dirName ->
                    !dirName.isEmpty() &&
                    !dirName.contains("..") &&
                    !dirName.contains("/") &&
                    !dirName.contains("\\") &&
                    !dirName.startsWith(".") &&
                    !dirName.startsWith("/") &&
                    !dirName.startsWith("\\")
                )
                .distinct()
                .collect(Collectors.toList());
        } catch (IOException e) {
            System.err.println("Error scanning JAR: " + e.getMessage());
            e.printStackTrace();
        }
        return directories;
    }

}
