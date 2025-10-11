package gui.utils;

import core.Modifier_class.*;
import gui.views.ItemSelectionView;
import javafx.scene.control.ComboBox;

public class ValidateButton {
    private ItemSelectionView view;

    public ValidateButton(ItemSelectionView view) {
        this.view = view;
    }

    public void handleValidateButtonClick() {
        if (areAllModifiersAndTiersSelected()) {
            System.out.println("All modifiers and tiers are selected!");
            // Proceed with further validation or actions
        } else {
            System.out.println("Please select all modifiers and tiers.");
        }
    }

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

    private boolean isComboBoxSelected(ComboBox<?> comboBox) {
        return comboBox.getValue() != null;
    }
}