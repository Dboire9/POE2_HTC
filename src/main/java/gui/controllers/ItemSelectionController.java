package gui.controllers;

import core.ItemManager;
import core.Modifier_class.*;
import gui.views.ItemSelectionView;
import javafx.collections.FXCollections;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ItemSelectionController {

    private final ItemSelectionView view;
    private final ItemManager manager;

    private String selectedCategory;

    public ItemSelectionController(ItemSelectionView view, ItemManager manager) {
        this.view = view;
        this.manager = manager;
        initialize();
    }

    private void initialize() {
        // When a category is selected
        view.getCategoryComboBox().setOnAction(e -> {
            selectedCategory = view.getCategoryComboBox().getValue();
            if (selectedCategory != null) {
                List<String> subcategories = manager.getSubCategories(selectedCategory);
                if (subcategories == null || subcategories.isEmpty()) {
                    // Handle the case where there are no subcategories
                    view.getSubCategoryComboBox().setVisible(false);
                    List<String> modifiers = manager
                            .getAvailableModifiersFor(selectedCategory, null);
                    updateModifierBoxes(modifiers);
                } else {
                    view.getSubCategoryComboBox().setItems(FXCollections.observableArrayList(subcategories));
                    view.getSubCategoryComboBox().setVisible(true);
                }
            }
        });

        // When a subcategory is selected
        view.getSubCategoryComboBox().setOnAction(e -> {
            String selectedSubCategory = view.getSubCategoryComboBox().getValue();
            if (selectedSubCategory != null) {
                List<String> modifiers = manager.getAvailableModifiersFor(selectedCategory,
                        selectedSubCategory);
                updateModifierBoxes(modifiers);
            } else {
                List<String> modifiers = manager.getAvailableModifiersFor(selectedCategory,
                        null);
                updateModifierBoxes(modifiers);
            }
        });
    }

    private void updateModifierBoxes(List<String> categorizedModifiers) {
        // Check if the input list is null or empty
        if (categorizedModifiers == null || categorizedModifiers.isEmpty()) {
            System.out.println("categorizedModifiers is empty or null");
            return;
        }

        // Create a single list to hold all modifiers
        List<String> allModifiers = new ArrayList<>(categorizedModifiers);

        // Populate all ComboBoxes with the combined list of modifiers
        view.getPrefix1ComboBox().getItems().addAll(allModifiers);
        view.getPrefix2ComboBox().getItems().addAll(allModifiers);
        view.getPrefix3ComboBox().getItems().addAll(allModifiers);
        view.getSuffix1ComboBox().getItems().addAll(allModifiers);
        view.getSuffix2ComboBox().getItems().addAll(allModifiers);
        view.getSuffix3ComboBox().getItems().addAll(allModifiers);

        System.out.println("Modifiers successfully updated");
    }
}
