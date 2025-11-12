package gui.controllers;

import core.ItemManager;
import core.Crafting.Crafting_Action;
import core.Crafting.Crafting_Item;
import core.Crafting.Proba.Probability_Analyzer;
import core.Crafting.Utils.ModifierEvent;
import core.Currency.AnnulmentOrb;
import core.Currency.Desecrated_currency;
import core.Currency.Essence_currency;
import core.Currency.ExaltedOrb;
import core.Currency.RegalOrb;
import core.Items.Item_base;
import core.Modifier_class.*;
import gui.views.ItemSelectionView;
import javafx.collections.FXCollections;
import javafx.concurrent.Task;
import javafx.scene.control.ComboBox;

import gui.utils.*;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutionException;

import core.Crafting.CraftingExecutor;


/**
 * Controller class for the Item Selection view in the POE2 Reverse Crafter GUI.
 * 
 * Responsibilities:
 * - Handle category and subcategory selection
 * - Populate modifier combo boxes based on the selected item class
 * - Track modifier and tier selections
 * - Run crafting calculations when the validate button is pressed
 * - Display crafting results in the GUI instead of the console
 * 
 * This class uses reflection to dynamically load item classes and their modifiers.
 */

public class ItemSelectionController {

	private final ItemSelectionView view;
	private final ItemManager manager;

	private String selectedCategory;
	private String selectedSubCategory;
	private Class<?> selectedItemClass;

	private final ValidateButton validateButton;

	private Modifier prefix1store;
	private Modifier prefix2store;
	private Modifier prefix3store;
	private Modifier suffix1store;
	private Modifier suffix2store;
	private Modifier suffix3store;


	    /**
     * Constructor for the ItemSelectionController.
     * Initializes event listeners and sets up the validate button logic.
     *
     * @param view The ItemSelectionView associated with this controller
     * @param manager The ItemManager responsible for providing item and modifier data
     */

	public ItemSelectionController(ItemSelectionView view, ItemManager manager) {
		this.view = view;
		this.manager = manager;
		this.validateButton = new ValidateButton(view);

		initialize(); // entry point
	}

	
    /**
     * Initializes event listeners for category, subcategory, modifier selection, and the validate button.
     */
	private void initialize() {
		// Setup combo box listeners
		view.categoryComboBox.setOnAction(e -> handleCategorySelection());
		view.subCategoryComboBox.setOnAction(e -> handleSubCategorySelection());
		view.desecratedModifierCheckBox.selectedProperty().addListener((obs, oldValue, newValue) -> resetAllModifiers());
		view.modifierTypeComboBox.valueProperty().addListener((obs, oldValue, newValue) -> resetAllModifiers());

		// Setup modifier selection listeners
		setupModifierSelectionListener(view.prefix1ComboBox, view.prefix1TierComboBox);
		setupModifierSelectionListener(view.prefix2ComboBox, view.prefix2TierComboBox);
		setupModifierSelectionListener(view.prefix3ComboBox, view.prefix3TierComboBox);
		setupModifierSelectionListener(view.suffix1ComboBox, view.suffix1TierComboBox);
		setupModifierSelectionListener(view.suffix2ComboBox, view.suffix2TierComboBox);
		setupModifierSelectionListener(view.suffix3ComboBox, view.suffix3TierComboBox);

		setupModifierComboBoxListener(view.prefix1ComboBox, "prefix1");
		setupModifierComboBoxListener(view.prefix2ComboBox, "prefix2");
		setupModifierComboBoxListener(view.prefix3ComboBox, "prefix3");
		setupModifierComboBoxListener(view.suffix1ComboBox, "suffix1");
		setupModifierComboBoxListener(view.suffix2ComboBox, "suffix2");
		setupModifierComboBoxListener(view.suffix3ComboBox, "suffix3");

		view.clearButton.setOnAction(e -> {
			// Reset all combo boxes
			view.prefix1ComboBox.getSelectionModel().clearSelection();
			view.prefix2ComboBox.getSelectionModel().clearSelection();
			view.prefix3ComboBox.getSelectionModel().clearSelection();
			view.suffix1ComboBox.getSelectionModel().clearSelection();
			view.suffix2ComboBox.getSelectionModel().clearSelection();
			view.suffix3ComboBox.getSelectionModel().clearSelection();
			view.prefix1TierComboBox.getSelectionModel().clearSelection();
			view.prefix2TierComboBox.getSelectionModel().clearSelection();
			view.prefix3TierComboBox.getSelectionModel().clearSelection();
			view.suffix1TierComboBox.getSelectionModel().clearSelection();
			view.suffix2TierComboBox.getSelectionModel().clearSelection();
			view.suffix3TierComboBox.getSelectionModel().clearSelection();
		
			// Reset checkboxes
			view.desecratedModifierCheckBox.setSelected(false);
			view.modifierTypeComboBox.getSelectionModel().clearSelection();
		
			// Reset progress bar
			view.progressBar.progressProperty().unbind();
			view.progressBar.setVisible(false);
			view.progressBar.setProgress(0);
		
			// Reset labels
			view.displayLabel.setText("Output will appear here...");
			view.messageLabel.setText("");
		});

		// Validate button with background task
		view.validateButton.setOnAction(validateEvent -> {
			view.messageLabel.setText("");
			view.progressBar.setVisible(true);
			view.progressBar.setProgress(0);

			Task<String> craftingTask = new Task<>() {
				@Override
				protected String call() throws Exception {
					StringBuilder output = new StringBuilder();

					if (!validateButton.areAllModifiersAndTiersSelected()) {
						return "Please select all six modifiers and their tiers\n";
					}

					// Collect tiers
					int prefix1Tier = Integer.parseInt(view.prefix1TierComboBox.getValue().split(" ")[1].split(":")[0]) - 1;
					int prefix2Tier = Integer.parseInt(view.prefix2TierComboBox.getValue().split(" ")[1].split(":")[0]) - 1;
					int prefix3Tier = Integer.parseInt(view.prefix3TierComboBox.getValue().split(" ")[1].split(":")[0]) - 1;
					int suffix1Tier = Integer.parseInt(view.suffix1TierComboBox.getValue().split(" ")[1].split(":")[0]) - 1;
					int suffix2Tier = Integer.parseInt(view.suffix2TierComboBox.getValue().split(" ")[1].split(":")[0]) - 1;
					int suffix3Tier = Integer.parseInt(view.suffix3TierComboBox.getValue().split(" ")[1].split(":")[0]) - 1;

					// Instantiate item
					Item_base itemBase;
					Crafting_Item item;
					try {
						selectedItemClass = getItemClass(selectedCategory, selectedSubCategory);
						Object selectedItemInstance = selectedItemClass.getDeclaredConstructor().newInstance();
						itemBase = (Item_base) selectedItemInstance;
						item = new Crafting_Item(itemBase);
					} catch (Exception e) {
						e.printStackTrace();
						return "Error creating item: " + e.getMessage();
					}

					output.append("Item: ").append(item).append("\n");
					output.append("ItemBase: ").append(itemBase).append("\n");

					// Collect modifiers
					List<Modifier> desiredModifiers = Arrays.asList(prefix1store, prefix2store, prefix3store,
																	suffix1store, suffix2store, suffix3store);

					// Set chosen tiers
					prefix1store.chosenTier = prefix1Tier;
					prefix2store.chosenTier = prefix2Tier;
					prefix3store.chosenTier = prefix3Tier;
					suffix1store.chosenTier = suffix1Tier;
					suffix2store.chosenTier = suffix2Tier;
					suffix3store.chosenTier = suffix3Tier;

					// Run crafting attempts
					double maxRetries = 25;
					double attempt = 0;
					double GLOBALTHRESHOLD = 25;
					List<Modifier> undesiredModifiers = new ArrayList<>();
					List<Probability_Analyzer.CandidateProbability> results = new ArrayList<>();

					while ((results = CraftingExecutor.runCrafting(item, desiredModifiers, undesiredModifiers, GLOBALTHRESHOLD / 100)).isEmpty() && attempt < maxRetries) {
						item.reset();
						undesiredModifiers.clear();
						GLOBALTHRESHOLD--;
						attempt++;
						updateProgress(attempt, maxRetries); // update progress bar
					}

					if (results.isEmpty()) {
						output.append("No valid results after ").append((int) attempt).append(" attempts.\n");
					} else {
						for (int i = 0; i < Math.min(1, results.size()); i++) {
							Probability_Analyzer.CandidateProbability cp = results.get(i);
							output.append("Result #").append(i + 1).append(" — Final %: ").append(cp.finalPercentage()).append("\n");
							output.append("Best Path:\n");

							for (var entry : cp.bestPath().entrySet()) {
								Crafting_Action action = entry.getKey();
								ModifierEvent modifierEvent = entry.getValue();
								Double probability = modifierEvent.source.get(action);

								output.append("Action: ").append(action).append("\n");
								output.append("  → Probability: ").append(probability != null ? (probability * 100) : 0).append("%\n");

								if (modifierEvent.modifier != null)
									output.append("  → Modifier: ").append(modifierEvent.modifier.text).append("\n");

								if (action instanceof ExaltedOrb currency) {
									output.append("  Tier: ").append(currency.tier).append("\n");
									if (currency.omens != null) output.append("  Omen: ").append(currency.omens).append("\n");
								} else if (action instanceof RegalOrb currency) {
									output.append("  Tier: ").append(currency.tier).append("\n");
									if (currency.omen != null) output.append("  Omen: ").append(currency.omen).append("\n");
								} else if (action instanceof AnnulmentOrb currency && currency.omen != null) {
									output.append("  Omen: ").append(currency.omen).append("\n");
								} else if (action instanceof Desecrated_currency currency && currency.omens != null) {
									output.append("  Omen: ").append(currency.omens).append("\n");
								} else if (action instanceof Essence_currency currency && currency.omen != null) {
									output.append("  Omen: ").append(currency.omen).append("\n");
								}

								output.append("\n");
							}
						}
					}

					return output.toString();
				}
			};

			// Bind progress bar
			view.progressBar.progressProperty().bind(craftingTask.progressProperty());

			craftingTask.setOnSucceeded(workerStateEvent -> {
				view.displayLabel.setText(craftingTask.getValue());
				view.progressBar.setVisible(false);
			});

			craftingTask.setOnFailed(workerStateEvent -> {
				view.displayLabel.setText("Error during crafting.");
				view.progressBar.setVisible(false);
			});

			new Thread(craftingTask).start();
			view.progressBar.progressProperty().unbind();
		});
	}

	/** Handles selection changes in the category combo box */
	private void handleCategorySelection() {
		resetAllModifiers();
		selectedCategory = view.categoryComboBox.getValue();

		List<String> subcategories = manager.getSubCategories(selectedCategory);

		if (subcategories == null || subcategories.isEmpty()) {
			view.subCategoryComboBox.setVisible(false);
			selectedItemClass = getItemClass(selectedCategory, null);
			populateModifiers(selectedItemClass);
		} else {
			view.subCategoryComboBox.setItems(FXCollections.observableArrayList(subcategories));
			view.subCategoryComboBox.setVisible(true);
			// Automatically select the first subcategory
			selectedSubCategory = subcategories.get(0);
			view.subCategoryComboBox.getSelectionModel().select(0);

			// Update the selected item class and populate modifiers
			selectedItemClass = getItemClass(selectedCategory, selectedSubCategory);
			populateModifiers(selectedItemClass);
		}
	}

	/** Handles selection changes in the subcategory combo box */
	private void handleSubCategorySelection() {
		resetAllModifiers();
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

	/**
	 * Populates the prefix and suffix combo boxes in the GUI based on the selected item class.
	 * 
	 * Responsibilities:
	 * - Dynamically loads the selected item class using reflection.
	 * - Retrieves normal, desecrated, and essence modifiers from the item's superclass.
	 * - Populates each prefix and suffix combo box with the appropriate modifiers.
	 * - Applies desecrated or essence modifiers based on the state of the checkboxes.
	 * - Ensures uniqueness of selections across all prefix and suffix boxes.
	 * 
	 * @param itemClass The class of the item for which to populate modifiers. If null, the method returns immediately.
	 */
	private void populateModifiers(Class<?> itemClass) {
		if (itemClass == null)
			return;
		view.messageLabel.setText("");
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

			populateComboBoxes(suffixBoxes[1], normalSuffixes);
			essencepopulateComboBoxes(suffixBoxes[1], EssencenormalSuffixes);
			populateComboBoxes(suffixBoxes[2], normalSuffixes);
			essencepopulateComboBoxes(suffixBoxes[2], EssencenormalSuffixes);
			setupUniqueSelection(prefixBoxes, suffixBoxes);

		} catch (Exception e) {
			e.printStackTrace();
		}
	}


	/**
	 * Ensures that each selected modifier in the prefix and suffix combo boxes
	 * is unique across all boxes. When a selection changes:
	 *  - The previous selection is restored to other boxes.
	 *  - The newly selected value is removed from all other boxes.
	 * 
	 * @param prefixboxes Array of ComboBoxes for prefix modifiers.
	 * @param suffixboxes Array of ComboBoxes for suffix modifiers.
	 */
	private void setupUniqueSelection(ComboBox<String>[] prefixboxes, ComboBox<String>[] suffixboxes) {
		for (ComboBox<String> box : prefixboxes) {
			final String[] previousSelection = { null };

			box.setOnAction(e -> {
				String selected = box.getValue();

				// If there was a previous selection, add it back to other boxes
				if (previousSelection[0] != null) {
					for (ComboBox<String> otherBox : prefixboxes) {
						if (otherBox != box && !otherBox.getItems().contains(previousSelection[0])) {
							otherBox.getItems().add(previousSelection[0]);
						}
					}
					for (ComboBox<String> otherBox : suffixboxes) {
						if (!otherBox.getItems().contains(previousSelection[0])) {
							otherBox.getItems().add(previousSelection[0]);
						}
					}
				}

				// Remove the newly selected value from other boxes
				if (selected != null) {
					for (ComboBox<String> otherBox : prefixboxes) {
						if (otherBox != box) {
							otherBox.getItems().remove(selected);
						}
					}
					for (ComboBox<String> otherBox : suffixboxes) {
						otherBox.getItems().remove(selected);
					}
				}
				previousSelection[0] = selected; // Update previous selection
			});
		}

		for (ComboBox<String> box : suffixboxes) {
			final String[] previousSelection = { null };

			box.setOnAction(e -> {
				String selected = box.getValue();

				// If there was a previous selection, add it back to other boxes
				if (previousSelection[0] != null) {
					for (ComboBox<String> otherBox : suffixboxes) {
						if (otherBox != box && !otherBox.getItems().contains(previousSelection[0])) {
							otherBox.getItems().add(previousSelection[0]);
						}
					}
					for (ComboBox<String> otherBox : prefixboxes) {
						if (!otherBox.getItems().contains(previousSelection[0])) {
							otherBox.getItems().add(previousSelection[0]);
						}
					}
				}

				// Remove the newly selected value from other boxes
				if (selected != null) {
					for (ComboBox<String> otherBox : suffixboxes) {
						if (otherBox != box) {
							otherBox.getItems().remove(selected);
						}
					}
					for (ComboBox<String> otherBox : prefixboxes) {
						otherBox.getItems().remove(selected);
					}
				}

				previousSelection[0] = selected; // Update previous selection
			});
		}
	}

	/**
	 * Populates a single ComboBox with a list of modifiers.
	 * Clears any previous items first. If no modifiers are provided,
	 * a message is displayed to the user.
	 * 
	 * @param box The ComboBox to populate.
	 * @param modifiers List of Modifier objects to display.
	 */
	private void populateComboBoxes(ComboBox<String> box, List<Modifier> modifiers) {
		if (modifiers != null && !modifiers.isEmpty()) {
			box.getItems().clear();
			for (Modifier mod : modifiers) {
				box.getItems().add(mod.text);
			}
		} else {
			view.messageLabel.setText("No modifiers available.");
		}
	}

	/**
	 * Populates a ComboBox with essence modifiers. Each modifier is prefixed
	 * with "Essence : " to differentiate it from normal modifiers. Ensures
	 * that duplicate entries are not added.
	 * 
	 * @param box The ComboBox to populate with essence modifiers.
	 * @param modifiers List of Modifier objects representing essence modifiers.
	 */
	private void essencepopulateComboBoxes(ComboBox<String> box, List<Modifier> modifiers) {
		if (modifiers != null) {
			for (Modifier mod : modifiers) {
				if (!box.getItems().contains(mod.text)) {
					String Essencetxt = "Essence : " + mod.text;
					box.getItems().add(Essencetxt);
				}
			}
		}
	}

	/**
	 * Dynamically loads the class of an item based on its category and optional subcategory.
	 * The class name is constructed following the convention:
	 * - If subcategory is null or empty: "core.Items.<Category>.<Category>"
	 * - Otherwise: "core.Items.<Category>.<Subcategory>.<Subcategory>"
	 * 
	 * @param category The main category of the item.
	 * @param subcategory The optional subcategory of the item.
	 * @return The Class object corresponding to the item, or null if loading fails.
	 */
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

	/**
	 * Resets all modifier and tier selections for prefixes and suffixes.
	 * Clears the ComboBox selections and items, then repopulates them
	 * based on the currently selected item class and desecrated state.
	 */
	private void resetAllModifiers() {
		// Clear selections and items for all prefixes and suffixes
		view.prefix1ComboBox.getSelectionModel().clearSelection();
		view.prefix1ComboBox.getItems().clear();
		view.prefix2ComboBox.getSelectionModel().clearSelection();
		view.prefix2ComboBox.getItems().clear();
		view.prefix3ComboBox.getSelectionModel().clearSelection();
		view.prefix3ComboBox.getItems().clear();

		view.suffix1ComboBox.getSelectionModel().clearSelection();
		view.suffix1ComboBox.getItems().clear();
		view.suffix2ComboBox.getSelectionModel().clearSelection();
		view.suffix2ComboBox.getItems().clear();
		view.suffix3ComboBox.getSelectionModel().clearSelection();
		view.suffix3ComboBox.getItems().clear();

		view.prefix1TierComboBox.getSelectionModel().clearSelection();
		view.prefix1TierComboBox.getItems().clear();
		view.prefix2TierComboBox.getSelectionModel().clearSelection();
		view.prefix2TierComboBox.getItems().clear();
		view.prefix3TierComboBox.getSelectionModel().clearSelection();
		view.prefix3TierComboBox.getItems().clear();

		view.suffix1TierComboBox.getSelectionModel().clearSelection();
		view.suffix1TierComboBox.getItems().clear();
		view.suffix2TierComboBox.getSelectionModel().clearSelection();
		view.suffix2TierComboBox.getItems().clear();
		view.suffix3TierComboBox.getSelectionModel().clearSelection();
		view.suffix3TierComboBox.getItems().clear();

		// Refresh the combo boxes with the current item class and desecrated state
		populateModifiers(selectedItemClass);
	}

	/**
	 * Sets up a listener for a modifier ComboBox and its corresponding tier ComboBox.
	 * When a modifier is selected, the corresponding tiers are populated dynamically.
	 * 
	 * @param comboBox The ComboBox for selecting a modifier.
	 * @param comboBoxTier The ComboBox for selecting the tier of the chosen modifier.
	 */
	private void setupModifierSelectionListener(ComboBox<String> comboBox, ComboBox<String> comboBoxTier) {
		comboBox.valueProperty().addListener((obs, oldVal, newVal) -> {
			if (newVal != null) {
				Modifier mod = getModifiersFromValue(selectedItemClass, newVal);
				// System.out.println("Debug: mod = " + mod);
				if (mod != null && mod.tiers != null && !mod.tiers.isEmpty()) {
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

						currentTier--;
					}
				} else {
					System.out.println("⚠️ No tiers available for the selected modifier.");
					comboBoxTier.getItems().clear(); // Clear if no tiers are available
				}
			}
		});
	}

	/**
	 * Sets up a listener for a modifier ComboBox to update the stored Modifier
	 * object corresponding to the given slot (prefix1, prefix2, suffix1, etc.).
	 * 
	 * @param comboBox The ComboBox for selecting a modifier.
	 * @param modifierSlot The identifier for which modifier slot this ComboBox represents.
	 */
	private void setupModifierComboBoxListener(ComboBox<String> comboBox, String modifierSlot) {
		comboBox.valueProperty().addListener((obs, oldVal, newVal) -> {
			if (newVal != null) {
				if(getModifiersFromValue(selectedItemClass, newVal) != null)
				{
					Modifier modifier = getModifiersFromValue(selectedItemClass, newVal);
					switch (modifierSlot) {
						case "prefix1" -> this.prefix1store = modifier;
						case "prefix2" -> this.prefix2store = modifier;
						case "prefix3" -> this.prefix3store = modifier;
						case "suffix1" -> this.suffix1store = modifier;
						case "suffix2" -> this.suffix2store = modifier;
						case "suffix3" -> this.suffix3store = modifier;
					}
				}
			}
		});
	}

	/**
	 * Retrieves a Modifier object corresponding to a given display value from the
	 * item class. Handles both normal and essence-prefixed modifiers.
	 * 
	 * @param itemClass The class of the item being modified.
	 * @param value The text value of the modifier selected in the ComboBox.
	 * @return The Modifier object matching the value, or null if not found.
	 */
	private Modifier getModifiersFromValue(Class<?> itemClass, String value) {
		if (value == null || itemClass == null) {
			System.out.println("[DEBUG] getModifiersFromValue: itemClass or value is null");
			return null;
		}
		if (value.startsWith("Essence : ")) {
			value = value.substring("Essence : ".length());
		}

		try {
			Object itemInstance = itemClass.getDeclaredConstructor().newInstance();

			Field[] fields = {
					itemClass.getSuperclass().getDeclaredField("Normal_allowedPrefixes"),
					itemClass.getSuperclass().getDeclaredField("Normal_allowedSuffixes"),
					itemClass.getSuperclass().getDeclaredField("Desecrated_allowedPrefixes"),
					itemClass.getSuperclass().getDeclaredField("Desecrated_allowedSuffixes"),
					itemClass.getSuperclass().getDeclaredField("Essences_allowedPrefixes"),
					itemClass.getSuperclass().getDeclaredField("Essences_allowedSuffixes")
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
}
