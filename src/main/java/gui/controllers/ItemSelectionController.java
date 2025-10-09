package gui.controllers;

import core.ItemManager;
import javafx.collections.FXCollections;
import javafx.scene.control.ComboBox;


import java.util.Arrays;
import java.util.List;

public class ItemSelectionController {

    private final ItemManager itemManager;
    private final ComboBox<String> categoryComboBox;
    private final ComboBox<String> subCategoryComboBox;

    private String selectedCategory;
    private String selectedSubCategory;

    // Categories that have subcategories
    private final List<String> categoriesWithSub = Arrays.asList(
            "Body_Armours", "Shields", "Boots", "Gloves", "Helmets"
    );

    public ItemSelectionController(ComboBox<String> categoryComboBox, ComboBox<String> subCategoryComboBox, ItemManager itemManager) {
        this.itemManager = itemManager;
        this.categoryComboBox = categoryComboBox;
        this.subCategoryComboBox = subCategoryComboBox;

        // Initialize categories
        categoryComboBox.setItems(FXCollections.observableArrayList(itemManager.getCategories()));
        subCategoryComboBox.setVisible(false);

        // Listeners
        categoryComboBox.setOnAction(e -> onCategorySelected());
        subCategoryComboBox.setOnAction(e -> selectedSubCategory = subCategoryComboBox.getValue());
    }

    private void onCategorySelected() {
        selectedCategory = categoryComboBox.getValue();
        if (categoriesWithSub.contains(selectedCategory)) {
            List<String> subCategories = itemManager.getSubCategories(selectedCategory);
            subCategoryComboBox.setItems(FXCollections.observableArrayList(subCategories));
            subCategoryComboBox.setVisible(true);
        } else {
            subCategoryComboBox.setVisible(false);
            subCategoryComboBox.getItems().clear();
            selectedSubCategory = null;
        }
    }

    // Getters
    public String getSelectedCategory() {
        return selectedCategory;
    }

    public String getSelectedSubCategory() {
        return selectedSubCategory;
    }
}
