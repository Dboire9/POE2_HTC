package gui.views;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.scene.control.ComboBox;
import javafx.scene.control.CheckBox;
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

    private final ComboBox<String> prefix1TierComboBox;
    private final ComboBox<String> prefix2TierComboBox;
    private final ComboBox<String> prefix3TierComboBox;
    private final ComboBox<String> suffix1TierComboBox;
    private final ComboBox<String> suffix2TierComboBox;
    private final ComboBox<String> suffix3TierComboBox;

    private final CheckBox desecratedModifierCheckBox;
    private final ComboBox<String> modifierTypeComboBox;

    public ItemSelectionView(List<String> categories) {
        categoryComboBox = new ComboBox<>(FXCollections.observableArrayList(categories));
        categoryComboBox.setPromptText("Select Category");

        subCategoryComboBox = new ComboBox<>();
        subCategoryComboBox.setPromptText("Select Subcategory");
        subCategoryComboBox.setVisible(false);

        desecratedModifierCheckBox = new CheckBox("Desecrated Modifier");
        modifierTypeComboBox = new ComboBox<>();
        modifierTypeComboBox.setPromptText("Select Modifier Type");
        modifierTypeComboBox.setVisible(false);

        prefix1ComboBox = new ComboBox<>();
        prefix2ComboBox = new ComboBox<>();
        prefix3ComboBox = new ComboBox<>();
        suffix1ComboBox = new ComboBox<>();
        suffix2ComboBox = new ComboBox<>();
        suffix3ComboBox = new ComboBox<>();

        prefix1TierComboBox = new ComboBox<>();
        prefix2TierComboBox = new ComboBox<>();
        prefix3TierComboBox = new ComboBox<>();
        suffix1TierComboBox = new ComboBox<>();
        suffix2TierComboBox = new ComboBox<>();
        suffix3TierComboBox = new ComboBox<>();

        prefix1TierComboBox.setPromptText("Tier 1");
        prefix2TierComboBox.setPromptText("Tier 2");
        prefix3TierComboBox.setPromptText("Tier 3");
        suffix1TierComboBox.setPromptText("Tier 1");
        suffix2TierComboBox.setPromptText("Tier 2");
        suffix3TierComboBox.setPromptText("Tier 3");

        prefix1TierComboBox.setVisible(false);
        prefix2TierComboBox.setVisible(false);
        prefix3TierComboBox.setVisible(false);
        suffix1TierComboBox.setVisible(false);
        suffix2TierComboBox.setVisible(false);
        suffix3TierComboBox.setVisible(false);

        ObservableList<String> tierOptions = FXCollections.observableArrayList("Tier 1", "Tier 2", "Tier 3", "Tier 4");

        prefix1ComboBox.setPromptText("Prefix 1");
        prefix2ComboBox.setPromptText("Prefix 2");
        prefix3ComboBox.setPromptText("Prefix 3");
        suffix1ComboBox.setPromptText("Suffix 1");
        suffix2ComboBox.setPromptText("Suffix 2");
        suffix3ComboBox.setPromptText("Suffix 3");

        prefix1ComboBox.valueProperty().addListener((observable, oldValue, newValue) -> {
            prefix1TierComboBox.setVisible(newValue != null);
            if (newValue != null) {
                prefix1TierComboBox.setItems(tierOptions);
            }
        });

        prefix2ComboBox.valueProperty().addListener((observable, oldValue, newValue) -> {
            prefix2TierComboBox.setVisible(newValue != null);
            if (newValue != null) {
                prefix2TierComboBox.setItems(tierOptions);
            }
        });

        prefix3ComboBox.valueProperty().addListener((observable, oldValue, newValue) -> {
            prefix3TierComboBox.setVisible(newValue != null);
            if (newValue != null) {
                prefix3TierComboBox.setItems(tierOptions);
            }
        });

        suffix1ComboBox.valueProperty().addListener((observable, oldValue, newValue) -> {
            suffix1TierComboBox.setVisible(newValue != null);
            if (newValue != null) {
                suffix1TierComboBox.setItems(tierOptions);
            }
        });

        suffix2ComboBox.valueProperty().addListener((observable, oldValue, newValue) -> {
            suffix2TierComboBox.setVisible(newValue != null);
            if (newValue != null) {
                suffix2TierComboBox.setItems(tierOptions);
            }
        });

        suffix3ComboBox.valueProperty().addListener((observable, oldValue, newValue) -> {
            suffix3TierComboBox.setVisible(newValue != null);
            if (newValue != null) {
                suffix3TierComboBox.setItems(tierOptions);
            }
        });

        HBox prefixBox = new HBox(10, prefix1ComboBox, prefix1TierComboBox, prefix2ComboBox, prefix2TierComboBox,
                prefix3ComboBox, prefix3TierComboBox);
        HBox suffixBox = new HBox(10, suffix1ComboBox, suffix1TierComboBox, suffix2ComboBox, suffix2TierComboBox,
                suffix3ComboBox, suffix3TierComboBox);

        this.getChildren().addAll(categoryComboBox, subCategoryComboBox, prefixBox, suffixBox,
                desecratedModifierCheckBox, modifierTypeComboBox);
        this.setSpacing(10);
    }

    public ComboBox<String> getCategoryComboBox() {
        return categoryComboBox;
    }

    public ComboBox<String> getSubCategoryComboBox() {
        return subCategoryComboBox;
    }

    public ComboBox<String> getPrefix1ComboBox() {
        return prefix1ComboBox;
    }

    public ComboBox<String> getPrefix2ComboBox() {
        return prefix2ComboBox;
    }

    public ComboBox<String> getPrefix3ComboBox() {
        return prefix3ComboBox;
    }

    public ComboBox<String> getSuffix1ComboBox() {
        return suffix1ComboBox;
    }

    public ComboBox<String> getSuffix2ComboBox() {
        return suffix2ComboBox;
    }

    public ComboBox<String> getSuffix3ComboBox() {
        return suffix3ComboBox;
    }

    public boolean isDesecratedModifierSelected() {
        return desecratedModifierCheckBox.isSelected();
    }

    public CheckBox getDesecratedModifierCheckBox() {
        return desecratedModifierCheckBox;
    }

    public String getSelectedmodifierTypeComboBoxvalue() {
        return modifierTypeComboBox.getValue();
    }

    public ComboBox<String> getModifierTypeComboBox() {
        return modifierTypeComboBox;
    }
}
