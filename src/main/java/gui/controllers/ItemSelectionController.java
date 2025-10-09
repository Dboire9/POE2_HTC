package gui.controllers;

import core.ItemManager;
import core.Modifier_class.*;
import gui.views.ItemSelectionView;
import javafx.collections.FXCollections;

import java.util.ArrayList;
import java.util.HashMap;
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
                    Map<String, List<String>> modifiers = manager
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
                Map<String, List<String>> modifiers = manager.getAvailableModifiersFor(selectedCategory,
                        selectedSubCategory);
                updateModifierBoxes(modifiers);
            } else {
                Map<String, List<String>> modifiers = manager.getAvailableModifiersFor(selectedCategory,
                        null);
                updateModifierBoxes(modifiers);
            }
        });
    }

    private void updateModifierBoxes(Map<String, List<String>> categorizedModifiers) {
        // Check if the input list is null or empty
        if (categorizedModifiers == null || categorizedModifiers.isEmpty()) {
            System.out.println("categorizedModifiers is empty or null");
            return;
        }

        Map<String, List<String>> prefixModifiers = new HashMap<>();
        Map<String, List<String>> suffixModifiers = new HashMap<>();

        for (Map.Entry<String, List<String>> entry : categorizedModifiers.entrySet()) {
            String key = entry.getKey().toLowerCase(); // Normalize key for case-insensitive comparison
            if (key.contains("prefix")) {
                prefixModifiers.put(entry.getKey(), entry.getValue());
            } else if (key.contains("suffix")) {
                suffixModifiers.put(entry.getKey(), entry.getValue());
            }
        }

        // Flatten the prefix and suffix modifiers into single lists
        List<String> flattenedPrefixes = new ArrayList<>();
        for (List<String> values : prefixModifiers.values()) {
            flattenedPrefixes.addAll(values);
        }

        List<String> flattenedSuffixes = new ArrayList<>();
        for (List<String> values : suffixModifiers.values()) {
            flattenedSuffixes.addAll(values);
        }

        // Populate all ComboBoxes with the flattened lists of modifiers
        view.getPrefix1ComboBox().getItems().addAll(flattenedPrefixes);
        view.getPrefix2ComboBox().getItems().addAll(flattenedPrefixes);
        view.getPrefix3ComboBox().getItems().addAll(flattenedPrefixes);
        view.getSuffix1ComboBox().getItems().addAll(flattenedSuffixes);
        view.getSuffix2ComboBox().getItems().addAll(flattenedSuffixes);
        view.getSuffix3ComboBox().getItems().addAll(flattenedSuffixes);

        System.out.println("Modifiers successfully updated");
    }
}
