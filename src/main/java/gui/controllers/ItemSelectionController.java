package gui.controllers;

import core.ItemManager;
import core.Modifier_class.*;
import gui.views.ItemSelectionView;
import javafx.collections.FXCollections;

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
                    Map<String, List<String>> modifiers = manager.getAvailableModifiersFor(selectedCategory, null);
                    // updateModifierBoxes(modifiers); // Uncomment if needed
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
                // updateModifierBoxes(modifiers); // Uncomment if needed
            } else {
                Map<String, List<String>> modifiers = manager.getAvailableModifiersFor(selectedCategory, null);
                // updateModifierBoxes(modifiers); // Uncomment if needed
            }
        });
    }

    // private void updateModifierBoxes(Map<String, List<Modifier>> modifiers) {
    // // Extract text from the modifiers
    // List<String> normalPrefixes = modifiers.getOrDefault("NormalPrefixes",
    // List.of())
    // .stream()
    // .map(mod -> mod.getText()) // assuming you have a getText() method
    // .toList();

    // List<String> normalSuffixes = modifiers.getOrDefault("NormalSuffixes",
    // List.of())
    // .stream()
    // .map(Modifier::getText)
    // .toList();

    // List<String> desecratedPrefixes =
    // modifiers.getOrDefault("DesecratedPrefixes", List.of())
    // .stream()
    // .map(Modifier::getText)
    // .toList();

    // List<String> desecratedSuffixes =
    // modifiers.getOrDefault("DesecratedSuffixes", List.of())
    // .stream()
    // .map(Modifier::getText)
    // .toList();

    // List<String> essencePrefixes = modifiers.getOrDefault("EssencePrefixes",
    // List.of())
    // .stream()
    // .map(Modifier::getText)
    // .toList();

    // List<String> essenceSuffixes = modifiers.getOrDefault("EssenceSuffixes",
    // List.of())
    // .stream()
    // .map(Modifier::getText)
    // .toList();

    // // Then set the ComboBoxes
    // view.getPrefix1ComboBox().setItems(FXCollections.observableArrayList(normalPrefixes));
    // view.getPrefix2ComboBox().setItems(FXCollections.observableArrayList(normalPrefixes));
    // view.getPrefix3ComboBox().setItems(FXCollections.observableArrayList(normalPrefixes));

    // view.getSuffix1ComboBox().setItems(FXCollections.observableArrayList(normalSuffixes));
    // view.getSuffix2ComboBox().setItems(FXCollections.observableArrayList(normalSuffixes));
    // view.getSuffix3ComboBox().setItems(FXCollections.observableArrayList(normalSuffixes));
    // }
}
