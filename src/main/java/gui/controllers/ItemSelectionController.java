package gui.controllers;

import core.ItemManager;
import core.Modifier_class.Modifier;
import gui.views.ItemSelectionView;
import javafx.collections.FXCollections;
import javafx.scene.control.ComboBox;

import java.lang.reflect.Field;
import java.util.List;

public class ItemSelectionController {

    private final ItemSelectionView view;
    private final ItemManager manager;

    private String selectedCategory;
    private String selectedSubCategory;
    private Class<?> selectedItemClass;

    public ItemSelectionController(ItemSelectionView view, ItemManager manager) {
        this.view = view;
        this.manager = manager;
        initialize(); // entry point
        view.desecratedModifierCheckBox.selectedProperty().addListener((obs, oldValue, newValue) -> {
            resetAllModifiers();
        });
        view.modifierTypeComboBox.valueProperty().addListener((obs, oldValue, newValue) -> {
            resetAllModifiers();
        });
    }

    private void initialize() {
        view.categoryComboBox.setOnAction(e -> handleCategorySelection());
        view.subCategoryComboBox.setOnAction(e -> handleSubCategorySelection());
    }

    private void handleCategorySelection() {
        selectedCategory = view.categoryComboBox.getValue();
        if (selectedCategory == null)
            return;

        List<String> subcategories = manager.getSubCategories(selectedCategory);

        if (subcategories == null || subcategories.isEmpty()) {
            view.subCategoryComboBox.setVisible(false);
            selectedItemClass = getItemClass(selectedCategory, null);
            populateModifiers(selectedItemClass);
        } else {
            view.subCategoryComboBox.setItems(FXCollections.observableArrayList(subcategories));
            view.subCategoryComboBox.setVisible(true);
        }
    }

    private void handleSubCategorySelection() {
        selectedSubCategory = view.subCategoryComboBox.getValue();
        if (selectedCategory == null || selectedSubCategory == null)
            return;

        selectedItemClass = getItemClass(selectedCategory, selectedSubCategory);
        populateModifiers(selectedItemClass);
    }

    private Class<?> getItemClass(String category, String subcategory) {
        try {
            Class<?> itemClass = loadItemClass(category, subcategory);
            if (itemClass == null) {
                System.out.println("❌ Item class not found for: " + category +
                        (subcategory != null ? " / " + subcategory : ""));
                return null;
            }
            System.out.println("✅ Loaded item class: " + itemClass.getName());
            return itemClass;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private void populateModifiers(Class<?> itemClass) {
        if (itemClass == null)
            return;

        try {
            Object itemInstance = itemClass.getDeclaredConstructor().newInstance();

            Field prefixesField = itemClass.getSuperclass().getDeclaredField("Normal_allowedPrefixes");
            prefixesField.setAccessible(true);
            Field suffixesField = itemClass.getSuperclass().getDeclaredField("Normal_allowedSuffixes");
            suffixesField.setAccessible(true);
            Field DesecratedprefixesField = itemClass.getSuperclass().getDeclaredField("Desecrated_allowedPrefixes");
            DesecratedprefixesField.setAccessible(true);
            Field DesecratedsuffixesField = itemClass.getSuperclass().getDeclaredField("Desecrated_allowedSuffixes");
            DesecratedsuffixesField.setAccessible(true);

            @SuppressWarnings("unchecked")
            List<Modifier> normalPrefixes = (List<Modifier>) prefixesField.get(itemInstance);
            @SuppressWarnings("unchecked")
            List<Modifier> normalSuffixes = (List<Modifier>) suffixesField.get(itemInstance);
            @SuppressWarnings("unchecked")
            List<Modifier> DesecratednormalPrefixes = (List<Modifier>) DesecratedprefixesField.get(itemInstance);
            @SuppressWarnings("unchecked")
            List<Modifier> DesecratednormalSuffixes = (List<Modifier>) DesecratedsuffixesField.get(itemInstance);

            // Prefix combo boxes
            @SuppressWarnings("unchecked")
            ComboBox<String>[] prefixBoxes = new ComboBox[] {
                    view.prefix1ComboBox,
                    view.prefix2ComboBox,
                    view.prefix3ComboBox
            };

            // Suffix combo boxes
            @SuppressWarnings("unchecked")
            ComboBox<String>[] suffixBoxes = new ComboBox[] {
                    view.suffix1ComboBox,
                    view.suffix2ComboBox,
                    view.suffix3ComboBox
            };
            if (view.desecratedModifierCheckBox.isSelected()
                    && view.modifierTypeComboBox.getValue() == "Prefix") {
                populateComboBoxes(prefixBoxes[0], DesecratednormalPrefixes);
                populateComboBoxes(suffixBoxes[0], normalSuffixes);

            } else if (view.desecratedModifierCheckBox.isSelected()
                    && view.modifierTypeComboBox.getValue() == "Suffix") {
                populateComboBoxes(suffixBoxes[0], DesecratednormalSuffixes);
                populateComboBoxes(prefixBoxes[0], normalPrefixes);

            } else {
                populateComboBoxes(prefixBoxes[0], normalPrefixes);
                populateComboBoxes(suffixBoxes[0], normalSuffixes);

            }

            populateComboBoxes(prefixBoxes[1], normalPrefixes);
            populateComboBoxes(prefixBoxes[2], normalPrefixes);
            setupUniqueSelection(prefixBoxes);

            populateComboBoxes(suffixBoxes[1], normalSuffixes);
            populateComboBoxes(suffixBoxes[2], normalSuffixes);
            setupUniqueSelection(suffixBoxes);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void setupUniqueSelection(ComboBox<String>[] boxes) {
        for (ComboBox<String> box : boxes) {
            final String[] previousSelection = { null }; // track previous selection for this box

            box.setOnAction(e -> {
                String selected = box.getValue();

                // If there was a previous selection, add it back to other boxes
                if (previousSelection[0] != null) {
                    for (ComboBox<String> otherBox : boxes) {
                        if (otherBox != box && !otherBox.getItems().contains(previousSelection[0])) {
                            otherBox.getItems().add(previousSelection[0]);
                        }
                    }
                }

                // Remove the newly selected value from other boxes
                if (selected != null) {
                    for (ComboBox<String> otherBox : boxes) {
                        if (otherBox != box) {
                            otherBox.getItems().remove(selected);
                        }
                    }
                }

                previousSelection[0] = selected; // update previous selection
            });
        }
    }

    private void populateComboBoxes(ComboBox<String> box, List<Modifier> modifiers) {
        box.getItems().clear();
        if (modifiers != null) {
            for (Modifier mod : modifiers) {
                box.getItems().add(mod.text);
            }
        }
    }

    private Class<?> loadItemClass(String category, String subcategory) {
        try {
            String className = (subcategory == null || subcategory.isEmpty())
                    ? "core.Items." + category + "." + category
                    : "core.Items." + category + "." + subcategory + "." + subcategory;

            return Class.forName(className);
        } catch (Exception e) {
            System.out.println("❌ Failed to load class for: " + category +
                    (subcategory != null ? " / " + subcategory : ""));
            e.printStackTrace();
            return null;
        }
    }

    private void resetAllModifiers() {
        // Clear selections for all prefixes and suffixes
        view.prefix1ComboBox.getSelectionModel().clearSelection();
        view.prefix2ComboBox.getSelectionModel().clearSelection();
        view.prefix3ComboBox.getSelectionModel().clearSelection();

        view.suffix1ComboBox.getSelectionModel().clearSelection();
        view.suffix2ComboBox.getSelectionModel().clearSelection();
        view.suffix3ComboBox.getSelectionModel().clearSelection();

        // Refresh the combo boxes with the current item class and desecrated state
        populateModifiers(selectedItemClass);
    }
}
