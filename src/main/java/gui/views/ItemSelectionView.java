package gui.views;

import javafx.collections.FXCollections;
import javafx.scene.control.ComboBox;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import java.util.List;

public class ItemSelectionView extends VBox {

    private final ComboBox<String> categoryComboBox;
    private final ComboBox<String> subCategoryComboBox;

    private final ComboBox<String> prefix1ComboBox;
    private final ComboBox<String> prefix2ComboBox;
    private final ComboBox<String> prefix3ComboBox;
    private final ComboBox<String> suffix1ComboBox;
    private final ComboBox<String> suffix2ComboBox;
    private final ComboBox<String> suffix3ComboBox;

    public ItemSelectionView(List<String> categories) {
        categoryComboBox = new ComboBox<>(FXCollections.observableArrayList(categories));
        categoryComboBox.setPromptText("Select Category");

        subCategoryComboBox = new ComboBox<>();
        subCategoryComboBox.setPromptText("Select Subcategory");
        subCategoryComboBox.setVisible(false);

        prefix1ComboBox = new ComboBox<>();
        prefix2ComboBox = new ComboBox<>();
        prefix3ComboBox = new ComboBox<>();
        suffix1ComboBox = new ComboBox<>();
        suffix2ComboBox = new ComboBox<>();
        suffix3ComboBox = new ComboBox<>();

        prefix1ComboBox.setPromptText("Prefix 1");
        prefix2ComboBox.setPromptText("Prefix 2");
        prefix3ComboBox.setPromptText("Prefix 3");
        suffix1ComboBox.setPromptText("Suffix 1");
        suffix2ComboBox.setPromptText("Suffix 2");
        suffix3ComboBox.setPromptText("Suffix 3");

        HBox prefixBox = new HBox(10, prefix1ComboBox, prefix2ComboBox, prefix3ComboBox);
        HBox suffixBox = new HBox(10, suffix1ComboBox, suffix2ComboBox, suffix3ComboBox);

        this.getChildren().addAll(categoryComboBox, subCategoryComboBox, prefixBox, suffixBox);
        this.setSpacing(10);
    }

    public ComboBox<String> getCategoryComboBox() { return categoryComboBox; }
    public ComboBox<String> getSubCategoryComboBox() { return subCategoryComboBox; }

    public ComboBox<String> getPrefix1ComboBox() { return prefix1ComboBox; }
    public ComboBox<String> getPrefix2ComboBox() { return prefix2ComboBox; }
    public ComboBox<String> getPrefix3ComboBox() { return prefix3ComboBox; }
    public ComboBox<String> getSuffix1ComboBox() { return suffix1ComboBox; }
    public ComboBox<String> getSuffix2ComboBox() { return suffix2ComboBox; }
    public ComboBox<String> getSuffix3ComboBox() { return suffix3ComboBox; }
}
