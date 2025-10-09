package gui.controllers;

import core.ItemManager;
import gui.views.ItemSelectionView;
import javafx.collections.FXCollections;

import java.util.List;
import java.util.Map;

public class ItemSelectionController {

    private final ItemSelectionView view;
    private final ItemManager manager;

    public ItemSelectionController(ItemSelectionView view, ItemManager manager) {
        this.view = view;
        this.manager = manager;
        initialize();
    }

    private void initialize() {
        // When a category is selected
        view.getCategoryComboBox().setOnAction(e -> {
            String selectedCategory = view.getCategoryComboBox().getValue();
            if (selectedCategory != null) {
                List<String> subcategories = manager.getSubCategories(selectedCategory);
                view.getSubCategoryComboBox().setItems(FXCollections.observableArrayList(subcategories));
                view.getSubCategoryComboBox().setVisible(true);
            }
        });

        // When a subcategory is selected
        view.getSubCategoryComboBox().setOnAction(e -> {
            String selectedSubCategory = view.getSubCategoryComboBox().getValue();
            if (selectedSubCategory != null) {
                Map<String, List<String>> modifiers = manager.getAvailableModifiersFor(selectedSubCategory);
                updateModifierBoxes(modifiers);
            }
        });
    }

    private void updateModifierBoxes(Map<String, List<String>> modifiers) {
        List<String> prefixes = modifiers.getOrDefault("prefixes", List.of());
        List<String> suffixes = modifiers.getOrDefault("suffixes", List.of());

        view.getPrefix1ComboBox().setItems(FXCollections.observableArrayList(prefixes));
        view.getPrefix2ComboBox().setItems(FXCollections.observableArrayList(prefixes));
        view.getPrefix3ComboBox().setItems(FXCollections.observableArrayList(prefixes));

        view.getSuffix1ComboBox().setItems(FXCollections.observableArrayList(suffixes));
        view.getSuffix2ComboBox().setItems(FXCollections.observableArrayList(suffixes));
        view.getSuffix3ComboBox().setItems(FXCollections.observableArrayList(suffixes));
    }
}
