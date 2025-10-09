package gui.controllers;

import core.ItemManager;
import javafx.collections.FXCollections;
import javafx.scene.control.ComboBox;

import java.util.Arrays;
import java.util.List;

public class CategoryController {

    private final ItemManager itemManager;
    private final ComboBox<String> categoryComboBox;
    private final ComboBox<String> subCategoryComboBox;

    private final List<String> categoriesWithSub = Arrays.asList(
            "Body_Armours", "Shields", "Boots", "Gloves", "Helmets"
    );

    public CategoryController(ComboBox<String> categoryComboBox, ComboBox<String> subCategoryComboBox, ItemManager itemManager) {
        this.itemManager = itemManager; // Use the passed manager
        this.categoryComboBox = categoryComboBox;
        this.subCategoryComboBox = subCategoryComboBox;

        // Initialize categories
        categoryComboBox.setItems(FXCollections.observableArrayList(itemManager.getCategories()));

        // Hide subCategory initially
        subCategoryComboBox.setVisible(false);

        categoryComboBox.setOnAction(e -> onCategorySelected());
    }

    private void onCategorySelected() {
        String selectedCategory = categoryComboBox.getValue();
        if (selectedCategory == null) return;

        if (categoriesWithSub.contains(selectedCategory)) {
            List<String> subCategories = itemManager.getSubCategories(selectedCategory);
            subCategoryComboBox.setItems(FXCollections.observableArrayList(subCategories));
            subCategoryComboBox.setVisible(true);
        } else {
            subCategoryComboBox.setVisible(false);
            subCategoryComboBox.getItems().clear();
        }
    }
}
