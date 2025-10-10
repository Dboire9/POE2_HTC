package gui.controllers;

import core.ItemManager;
import core.Modifier_class.*;
import gui.views.ItemSelectionView;
import javafx.collections.FXCollections;
import javafx.scene.control.ComboBox;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
		view.categoryComboBox.setOnAction(e -> handleCategorySelection());
		view.subCategoryComboBox.setOnAction(e -> handleSubCategorySelection());
		view.desecratedModifierCheckBox.selectedProperty().addListener((obs, oldValue, newValue) -> {
			resetAllModifiers();
		});
		view.modifierTypeComboBox.valueProperty().addListener((obs, oldValue, newValue) -> {
			resetAllModifiers();
		});
		setupModifierSelectionListener(view.prefix1ComboBox, view.prefix1TierComboBox);
		setupModifierSelectionListener(view.prefix2ComboBox, view.prefix2TierComboBox);
		setupModifierSelectionListener(view.prefix3ComboBox, view.prefix3TierComboBox);
		setupModifierSelectionListener(view.suffix1ComboBox, view.suffix1TierComboBox);
		setupModifierSelectionListener(view.suffix2ComboBox, view.suffix2TierComboBox);
		setupModifierSelectionListener(view.suffix3ComboBox, view.suffix3TierComboBox);
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
			Field EssenceprefixesField = itemClass.getSuperclass().getDeclaredField("Essences_allowedPrefixes");
			EssenceprefixesField.setAccessible(true);
			Field EssencesuffixesField = itemClass.getSuperclass().getDeclaredField("Essences_allowedSuffixes");
			EssencesuffixesField.setAccessible(true);

			@SuppressWarnings("unchecked")
			List<Modifier> normalPrefixes = (List<Modifier>) prefixesField.get(itemInstance);
			@SuppressWarnings("unchecked")
			List<Modifier> normalSuffixes = (List<Modifier>) suffixesField.get(itemInstance);
			@SuppressWarnings("unchecked")
			List<Modifier> DesecratednormalPrefixes = (List<Modifier>) DesecratedprefixesField.get(itemInstance);
			@SuppressWarnings("unchecked")
			List<Modifier> DesecratednormalSuffixes = (List<Modifier>) DesecratedsuffixesField.get(itemInstance);
			@SuppressWarnings("unchecked")
			List<Modifier> EssencenormalPrefixes = (List<Modifier>) EssenceprefixesField.get(itemInstance);
			@SuppressWarnings("unchecked")
			List<Modifier> EssencenormalSuffixes = (List<Modifier>) EssencesuffixesField.get(itemInstance);

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
				essencepopulateComboBoxes(suffixBoxes[0], EssencenormalSuffixes);

			} else if (view.desecratedModifierCheckBox.isSelected()
					&& view.modifierTypeComboBox.getValue() == "Suffix") {
				populateComboBoxes(suffixBoxes[0], DesecratednormalSuffixes);
				populateComboBoxes(prefixBoxes[0], normalPrefixes);
				essencepopulateComboBoxes(prefixBoxes[0], EssencenormalPrefixes);

			} else {
				populateComboBoxes(prefixBoxes[0], normalPrefixes);
				populateComboBoxes(suffixBoxes[0], normalSuffixes);
				essencepopulateComboBoxes(prefixBoxes[0], EssencenormalPrefixes);
				essencepopulateComboBoxes(suffixBoxes[0], EssencenormalSuffixes);

			}

			populateComboBoxes(prefixBoxes[1], normalPrefixes);
			essencepopulateComboBoxes(prefixBoxes[1], EssencenormalPrefixes);
			populateComboBoxes(prefixBoxes[2], normalPrefixes);
			essencepopulateComboBoxes(prefixBoxes[2], EssencenormalPrefixes);
			setupUniqueSelection(prefixBoxes);

			populateComboBoxes(suffixBoxes[1], normalSuffixes);
			essencepopulateComboBoxes(suffixBoxes[1], EssencenormalSuffixes);
			populateComboBoxes(suffixBoxes[2], normalSuffixes);
			essencepopulateComboBoxes(suffixBoxes[2], EssencenormalSuffixes);
			setupUniqueSelection(suffixBoxes);

		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private void setupUniqueSelection(ComboBox<String>[] boxes) {
		for (ComboBox<String> box : boxes) {
			final String[] previousSelection = { null };

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

				previousSelection[0] = selected; // Update previous selection
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

	private void essencepopulateComboBoxes(ComboBox<String> box, List<Modifier> modifiers) {
		if (modifiers != null) {
			for (Modifier mod : modifiers) {
				System.out.println("Modifiers: " + mod.text);
				if (!box.getItems().contains(mod.text)) { // Check if the item is not already in the ComboBox
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

	private void setupModifierSelectionListener(ComboBox<String> comboBox, ComboBox<String> comboBoxTier) {
		comboBox.valueProperty().addListener((obs, oldVal, newVal) -> {
			if (newVal != null) {
				Modifier mod = getModifierFromValue(selectedItemClass, newVal);
				if (mod.tiers != null && !mod.tiers.isEmpty()) {
					System.out.println("✅ Selected Modifier Tiers:");

					// Clear the ModifierTierBox before populating
					comboBoxTier.getItems().clear();

					int totalTiers = mod.tiers.size(); // Get the total number of tiers
					int currentTier = totalTiers; // Start with the highest tier number

					for (ModifierTier tier : mod.tiers) {
						StringBuilder tierDisplayBuilder = new StringBuilder();

						// Add the tier number at the beginning
						tierDisplayBuilder.append("Tier ").append(currentTier).append(": ");

						// Dynamically check each minMax field
						if (tier.minMax1 != null) {
							tierDisplayBuilder.append(tier.minMax1.first()).append(" - ").append(tier.minMax1.second());
						}
						if (tier.minMax2 != null) {
							tierDisplayBuilder.append(" / ").append(tier.minMax2.first()).append(" - ")
									.append(tier.minMax2.second());
						}
						if (tier.minMax3 != null) {
							tierDisplayBuilder.append(" / ").append(tier.minMax3.first()).append(" - ")
									.append(tier.minMax3.second());
						}
						if (tier.minMax4 != null) {
							tierDisplayBuilder.append(" / ").append(tier.minMax4.first()).append(" - ")
									.append(tier.minMax4.second());
						}

						String tierDisplay = tierDisplayBuilder.toString();
						comboBoxTier.getItems().add(tierDisplay);
						System.out.println(" - " + tierDisplay);

						currentTier--; // Decrement the tier number for the next iteration
					}
				} else {
					System.out.println("⚠️ No tiers available for the selected modifier.");
					comboBoxTier.getItems().clear(); // Clear if no tiers are available
				}
			}
			printSelectedModifiers();
		});
	}

	private Modifier getModifierFromValue(Class<?> itemClass, String value) {
		if (value == null || itemClass == null)
			return null;

		try {
			Object itemInstance = itemClass.getDeclaredConstructor().newInstance();

			Field[] fields = {
					itemClass.getSuperclass().getDeclaredField("Normal_allowedPrefixes"),
					itemClass.getSuperclass().getDeclaredField("Normal_allowedSuffixes"),
					itemClass.getSuperclass().getDeclaredField("Desecrated_allowedPrefixes"),
					itemClass.getSuperclass().getDeclaredField("Desecrated_allowedSuffixes")
			};

			for (Field field : fields) {
				field.setAccessible(true);
				@SuppressWarnings("unchecked")
				List<Modifier> mods = (List<Modifier>) field.get(itemInstance);
				for (Modifier mod : mods) {
					if (mod.text.equals(value)) {
						return mod;
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	private void printSelectedModifiers() {
		String p1 = view.prefix1ComboBox.getValue();
		String p2 = view.prefix2ComboBox.getValue();
		String p3 = view.prefix3ComboBox.getValue();
		String s1 = view.suffix1ComboBox.getValue();
		String s2 = view.suffix2ComboBox.getValue();
		String s3 = view.suffix3ComboBox.getValue();

		System.out.println("Selected Modifiers:");
		System.out.println("Prefixes: " + p1 + ", " + p2 + ", " + p3);
		System.out.println("Suffixes: " + s1 + ", " + s2 + ", " + s3);
	}

}
