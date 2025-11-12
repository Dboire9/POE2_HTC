package gui.views;

import javafx.collections.FXCollections;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.CheckBox;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;

import java.util.List;

/**
 * A JavaFX view for selecting items and their modifiers in the crafting system.
 * <p>
 * Responsibilities:
 * <ul>
 *     <li>Display category and subcategory selection ComboBoxes.</li>
 *     <li>Display prefix and suffix modifier ComboBoxes along with their tier selectors.</li>
 *     <li>Handle the desecrated modifier checkbox and modifier type selection.</li>
 *     <li>Provide a validate button for confirming selections.</li>
 *     <li>Show messages and output related to the crafting selection.</li>
 * </ul>
 */
public class ItemSelectionView extends VBox {

    /** ComboBox for selecting the item category */
    public final ComboBox<String> categoryComboBox;

    /** ComboBox for selecting the item subcategory (hidden if no subcategories exist) */
    public final ComboBox<String> subCategoryComboBox;

    /** Button to validate the current selection */
    public Button validateButton = new Button("Validate");

    /** ComboBoxes for selecting prefix modifiers */
    public final ComboBox<String> prefix1ComboBox;
    public final ComboBox<String> prefix2ComboBox;
    public final ComboBox<String> prefix3ComboBox;

    /** ComboBoxes for selecting suffix modifiers */
    public final ComboBox<String> suffix1ComboBox;
    public final ComboBox<String> suffix2ComboBox;
    public final ComboBox<String> suffix3ComboBox;

    /** ComboBoxes for selecting prefix tiers */
    public final ComboBox<String> prefix1TierComboBox;
    public final ComboBox<String> prefix2TierComboBox;
    public final ComboBox<String> prefix3TierComboBox;

    /** ComboBoxes for selecting suffix tiers */
    public final ComboBox<String> suffix1TierComboBox;
    public final ComboBox<String> suffix2TierComboBox;
    public final ComboBox<String> suffix3TierComboBox;

    /** CheckBox to indicate a desecrated modifier */
    public final CheckBox desecratedModifierCheckBox;

    /** ComboBox for selecting modifier type (prefix/suffix) when desecrated modifier is selected */
    public final ComboBox<String> modifierTypeComboBox;

    /** Label for showing messages (e.g., validation errors) */
    public final Label messageLabel;

    /** Label for displaying output */
    public final Label displayLabel;

    /** Container for the display label */
    public final HBox displayBox;

    /**
     * Constructs the ItemSelectionView.
     *
     * @param categories a list of item categories to populate the category ComboBox
     */
    public ItemSelectionView(List<String> categories) {
        // Category combo boxes
        categoryComboBox = new ComboBox<>(FXCollections.observableArrayList(categories));
        categoryComboBox.setPromptText("Select Category");

        subCategoryComboBox = new ComboBox<>();
        subCategoryComboBox.setPromptText("Select Subcategory");
        subCategoryComboBox.setVisible(false);

        // Desecrated modifier and type
        desecratedModifierCheckBox = new CheckBox("Desecrated Modifier");
        modifierTypeComboBox = new ComboBox<>();
        modifierTypeComboBox.setPromptText("Select Modifier Type");
        modifierTypeComboBox.setVisible(false);

        desecratedModifierCheckBox.selectedProperty().addListener((obs, oldVal, newVal) -> {
            if (newVal) {
                modifierTypeComboBox.setItems(FXCollections.observableArrayList("Prefix", "Suffix"));
                modifierTypeComboBox.setVisible(true);
            } else {
                modifierTypeComboBox.setVisible(false);
                modifierTypeComboBox.getSelectionModel().clearSelection();
            }
        });

        // Prefix and suffix combo boxes
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

        // Prompt texts
        prefix1ComboBox.setPromptText("Prefix 1");
        prefix2ComboBox.setPromptText("Prefix 2");
        prefix3ComboBox.setPromptText("Prefix 3");
        suffix1ComboBox.setPromptText("Suffix 1");
        suffix2ComboBox.setPromptText("Suffix 2");
        suffix3ComboBox.setPromptText("Suffix 3");

        prefix1TierComboBox.setPromptText("Prefix 1 Tier");
        prefix2TierComboBox.setPromptText("Prefix 2 Tier");
        prefix3TierComboBox.setPromptText("Prefix 3 Tier");
        suffix1TierComboBox.setPromptText("Suffix 1 Tier");
        suffix2TierComboBox.setPromptText("Suffix 2 Tier");
        suffix3TierComboBox.setPromptText("Suffix 3 Tier");

        // Message label
        messageLabel = new Label();
        messageLabel.setText("");
        messageLabel.setStyle("-fx-text-fill: red; -fx-font-size: 12px;");

        // Display box setup
        displayLabel = new Label("Output will appear here...");
        displayLabel.setStyle("-fx-font-size: 12px;");
        displayBox = new HBox(displayLabel);
        displayBox.setAlignment(Pos.CENTER_LEFT);
        displayBox.setStyle(
            "-fx-background-color: transparent;" + 
            "-fx-border-color: transparent;" +
            "-fx-padding: 5;"
        );

        // Layout groups
        VBox categoryBox = new VBox(10, categoryComboBox, subCategoryComboBox);
        categoryBox.setAlignment(Pos.CENTER_LEFT);

        HBox prefixBox = new HBox(10, prefix1ComboBox, prefix2ComboBox, prefix3ComboBox);
        HBox prefixTierBox = new HBox(10, prefix1TierComboBox, prefix2TierComboBox, prefix3TierComboBox);
        HBox suffixBox = new HBox(10, suffix1ComboBox, suffix2ComboBox, suffix3ComboBox);
        HBox suffixTierBox = new HBox(10, suffix1TierComboBox, suffix2TierComboBox, suffix3TierComboBox);

        VBox modifierBox = new VBox(10, prefixBox, prefixTierBox, suffixBox, suffixTierBox, desecratedModifierCheckBox, modifierTypeComboBox);
        modifierBox.setAlignment(Pos.CENTER_LEFT);

        // Validation section
        VBox validationBox = new VBox(10, validateButton, displayBox, messageLabel);
        validationBox.setAlignment(Pos.CENTER);

        // Main layout
        VBox mainLayout = new VBox(20, categoryBox, modifierBox, validationBox);
        mainLayout.setAlignment(Pos.CENTER);

        this.getChildren().add(mainLayout);
        this.setSpacing(10);
    }
}
