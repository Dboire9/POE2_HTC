package gui.controllers;

import javafx.scene.control.ComboBox;

public class SubCategoryController {

    private final ComboBox<String> subCategoryComboBox;

    public SubCategoryController(ComboBox<String> subCategoryComboBox) {
        this.subCategoryComboBox = subCategoryComboBox;

        // You can initialize events here if needed
        subCategoryComboBox.setOnAction(e -> onSubCategorySelected());
    }

    private void onSubCategorySelected() {
        String selectedSubCategory = subCategoryComboBox.getValue();
        if (selectedSubCategory != null) {}
    }
}
