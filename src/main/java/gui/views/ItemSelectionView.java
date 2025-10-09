package gui.views;

import javafx.scene.control.ComboBox;
import javafx.scene.layout.VBox;

import java.util.List;

public class ItemSelectionView extends VBox {
    private final ComboBox<String> categoryComboBox;
    private final ComboBox<String> subCategoryComboBox;

    public ItemSelectionView(List<String> categories) {
        categoryComboBox = new ComboBox<>();
        categoryComboBox.getItems().addAll(categories);
        categoryComboBox.setPromptText("Select Category");

        subCategoryComboBox = new ComboBox<>();
        subCategoryComboBox.setPromptText("Select SubCategory");
        subCategoryComboBox.setVisible(false);

        this.getChildren().addAll(categoryComboBox, subCategoryComboBox);
    }

    public ComboBox<String> getCategoryComboBox() { return categoryComboBox; }
    public ComboBox<String> getSubCategoryComboBox() { return subCategoryComboBox; }
}
