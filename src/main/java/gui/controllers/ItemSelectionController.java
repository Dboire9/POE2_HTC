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
    }

    private void initialize() {
        view.getCategoryComboBox().setOnAction(e -> handleCategorySelection());
        view.getSubCategoryComboBox().setOnAction(e -> handleSubCategorySelection());
    }

    private void handleCategorySelection() {
        selectedCategory = view.getCategoryComboBox().getValue();
        if (selectedCategory == null)
            return;

        List<String> subcategories = manager.getSubCategories(selectedCategory);

        if (subcategories == null || subcategories.isEmpty()) {
            view.getSubCategoryComboBox().setVisible(false);
            selectedItemClass = getItemClass(selectedCategory, null);
            populateModifiers(selectedItemClass);
        } else {
            view.getSubCategoryComboBox().setItems(FXCollections.observableArrayList(subcategories));
            view.getSubCategoryComboBox().setVisible(true);
        }
    }

    private void handleSubCategorySelection() {
        selectedSubCategory = view.getSubCategoryComboBox().getValue();
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

            @SuppressWarnings("unchecked")
            List<Modifier> normalPrefixes = (List<Modifier>) prefixesField.get(itemInstance);
            @SuppressWarnings("unchecked")
            List<Modifier> normalSuffixes = (List<Modifier>) suffixesField.get(itemInstance);

            // Populate prefix combo boxes
            @SuppressWarnings("unchecked")
            ComboBox<String>[] prefixBoxes = (ComboBox<String>[]) new ComboBox[3];
            prefixBoxes[0] = view.getPrefix1ComboBox();
            prefixBoxes[1] = view.getPrefix2ComboBox();
            prefixBoxes[2] = view.getPrefix3ComboBox();
            populateComboBoxes(prefixBoxes, normalPrefixes);

            // Populate suffix combo boxes
            @SuppressWarnings("unchecked")
            ComboBox<String>[] suffixBoxes = (ComboBox<String>[]) new ComboBox[3];
            suffixBoxes[0] = view.getSuffix1ComboBox();
            suffixBoxes[1] = view.getSuffix2ComboBox();
            suffixBoxes[2] = view.getSuffix3ComboBox();
            populateComboBoxes(suffixBoxes, normalSuffixes);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void populateComboBoxes(ComboBox<String>[] boxes, List<Modifier> modifiers) {
        for (ComboBox<String> box : boxes) {
            box.getItems().clear();
            if (modifiers != null) {
                for (Modifier mod : modifiers) {
                    box.getItems().add(mod.text);
                }
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
}
