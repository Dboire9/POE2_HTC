package gui.views;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Pos;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.Button;
import javafx.scene.control.CheckBox;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import java.util.List;

public class ItemSelectionView extends VBox {

	public final ComboBox<String> categoryComboBox;
	public final ComboBox<String> subCategoryComboBox;

	public Button validateButton = new Button("Validate"); // Add this field

	public final ComboBox<String> prefix1ComboBox;
	public final ComboBox<String> prefix2ComboBox;
	public final ComboBox<String> prefix3ComboBox;
	public final ComboBox<String> suffix1ComboBox;
	public final ComboBox<String> suffix2ComboBox;
	public final ComboBox<String> suffix3ComboBox;

	public final ComboBox<String> prefix1TierComboBox;
	public final ComboBox<String> prefix2TierComboBox;
	public final ComboBox<String> prefix3TierComboBox;
	public final ComboBox<String> suffix1TierComboBox;
	public final ComboBox<String> suffix2TierComboBox;
	public final ComboBox<String> suffix3TierComboBox;

	public final CheckBox desecratedModifierCheckBox;
	public final ComboBox<String> modifierTypeComboBox;

	public final Label messageLabel;

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

		
		// Label for displaying messages
		messageLabel = new Label();
		messageLabel.setText(""); // Default to empty
		messageLabel.setStyle("-fx-text-fill: red; -fx-font-size: 12px;"); // Optional styling


		desecratedModifierCheckBox.selectedProperty().addListener((observable, oldValue, newValue) -> {
			if (newValue) {
				// Show the ComboBox and populate it with options
				modifierTypeComboBox.setItems(FXCollections.observableArrayList("Prefix", "Suffix"));
				modifierTypeComboBox.setVisible(true);
			} else {
				// Hide the ComboBox when the checkbox is unticked
				modifierTypeComboBox.setVisible(false);
				modifierTypeComboBox.getSelectionModel().clearSelection();
			}
		});

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

        // Group category and subcategory components
        VBox categoryBox = new VBox(10, categoryComboBox, subCategoryComboBox);
        categoryBox.setAlignment(Pos.CENTER_LEFT);

        // Group prefix and suffix components
        HBox prefixBox = new HBox(10, prefix1ComboBox, prefix2ComboBox, prefix3ComboBox);
        HBox prefixTierBox = new HBox(10, prefix1TierComboBox, prefix2TierComboBox, prefix3TierComboBox);
        HBox suffixBox = new HBox(10, suffix1ComboBox, suffix2ComboBox, suffix3ComboBox);
        HBox suffixTierBox = new HBox(10, suffix1TierComboBox, suffix2TierComboBox, suffix3TierComboBox);

        VBox modifierBox = new VBox(10, prefixBox, prefixTierBox, suffixBox, suffixTierBox, desecratedModifierCheckBox, modifierTypeComboBox);
        modifierBox.setAlignment(Pos.CENTER_LEFT);

        // Group validation components
        HBox validationBox = new HBox(10, messageLabel, validateButton);
        validationBox.setAlignment(Pos.CENTER);

        // Add all groups to the main layout
        VBox mainLayout = new VBox(20, categoryBox, modifierBox, validationBox);
        mainLayout.setAlignment(Pos.CENTER);

        // Set the main layout as the root
        this.getChildren().add(mainLayout);
        this.setSpacing(10);
    }
}
