package core.Crafting;

import core.Crafting.Crafting_Item.CraftingActionType;
import core.Currency.Omens_currency.Omen;
import core.Modifier_class.*;

import java.util.*;

public class Crafting_Simulator {

    public static void runCraftingSimulation(Crafting_Item item, int maxSteps, List<ModifierTier>Desired_Mods) {
		
        System.out.println("🧪 Starting crafting simulation for item: " + item.base);
        System.out.println("Initial rarity: " + item.rarity);

        for (int step = 1; step <= maxSteps; step++) {
            System.out.println("\n=== Step " + step + " ===");

            // 1️⃣ Pick the action type
            CraftingActionType action = CraftingActionPicker.pickRandomActionType(item);
            System.out.println("🎯 Picked action: " + action);

            // 3️⃣ Apply the picked action
            switch (action) {
                case ESSENCE -> {
                    Crafting_Action essence = CraftingEssencePicker.pickRandomEssence(item);
                    System.out.println("💎 Applying essence: " + essence.getName());
                    item = essence.apply(item);
                }
                case CURRENCY -> {
                    Crafting_Action currency = CraftingCurrencyPicker.pickRandomCurrency(item);
                    if (currency != null) {
						System.out.println("💰 Applying active omens to the currency: ");
						item.applyAction(item, currency);
                        System.out.println("💰 Applying currency: " + currency.getName());
                        item = currency.apply(item);
                    } else {
                        System.out.println("⚠️ No valid currency found for this item.");
                    }
                }
                case OMEN -> {
					Omen applyingOmen = CraftingOmenPicker.pickRandomOmen(item, Omen.getAllOmens());
                    System.out.println("🧿 Omen effect triggered: " + applyingOmen.getName());
                    applyingOmen.apply(item);
                }
            }

            // 4️⃣ Check if item reached some goal (optional)
            if (Crafting_Item.isFinished(item, Desired_Mods)) {
                System.out.println("🏁 Item crafting completed early!");
                break;
            }
        }

        System.out.println("\n✅ Final item state: " + item);
    }
}
