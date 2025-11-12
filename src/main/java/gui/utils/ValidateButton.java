package gui.utils;

import core.Modifier_class.*;
import gui.views.ItemSelectionView;
import javafx.scene.control.ComboBox;

/**
 * Utility class to handle validation of modifier and tier selections in the ItemSelectionView.
 * <p>
 * Responsibilities:
 * <ul>
 *     <li>Check whether all prefix and suffix modifiers and their corresponding tiers have been selected.</li>
 *     <li>Provide a method to handle the validate button click, performing checks and optionally triggering further actions.</li>
 * </ul>
 */
public class ValidateButton {

    private final ItemSelectionView view;

    /**
     * Constructs a ValidateButton utility for a given ItemSelectionView.
     *
     * @param view The ItemSelectionView containing the modifier and tier ComboBoxes
     */
    public ValidateButton(ItemSelectionView view) {
        this.view = view;
    }

    /**
     * Handles the action of clicking the validate button.
     * <p>
     * Checks if all modifier and tier ComboBoxes have a selected value.
     * Prints a message to the console indicating whether validation passed or failed.
     * In a full application, this method could trigger further validation or crafting actions.
     */
    public void handleValidateButtonClick() {
        if (areAllModifiersAndTiersSelected()) {
            System.out.println("All modifiers and tiers are selected!");
            // Proceed with further validation or actions
        } else {
            System.out.println("Please select all modifiers and tiers.");
        }
    }

    /**
     * Checks whether all modifier and tier ComboBoxes in the view have a selected value.
     *
     * @return true if all ComboBoxes have a selection; false otherwise
     */
    public boolean areAllModifiersAndTiersSelected() {
        return isComboBoxSelected(view.prefix1ComboBox) &&
               isComboBoxSelected(view.prefix1TierComboBox) &&
               isComboBoxSelected(view.prefix2ComboBox) &&
               isComboBoxSelected(view.prefix2TierComboBox) &&
               isComboBoxSelected(view.prefix3ComboBox) &&
               isComboBoxSelected(view.prefix3TierComboBox) &&
               isComboBoxSelected(view.suffix1ComboBox) &&
               isComboBoxSelected(view.suffix1TierComboBox) &&
               isComboBoxSelected(view.suffix2ComboBox) &&
               isComboBoxSelected(view.suffix2TierComboBox) &&
               isComboBoxSelected(view.suffix3ComboBox) &&
               isComboBoxSelected(view.suffix3TierComboBox);
    }

    /**
     * Utility method to check if a single ComboBox has a selected value.
     *
     * @param comboBox The ComboBox to check
     * @return true if a value is selected; false otherwise
     */
    private boolean isComboBoxSelected(ComboBox<?> comboBox) {
        return comboBox.getValue() != null;
    }
}
