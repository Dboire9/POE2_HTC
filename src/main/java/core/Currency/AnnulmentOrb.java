package core.Currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Item.*;
import core.Crafting.Crafting_Action;
import core.Modifier_class.Modifier;
import core.Modifier_class.Modifier.ModifierSource;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class AnnulmentOrb implements Crafting_Action {

	private int cost = 1;

	private ModType forcedType = ModType.ANY;

	public void setForcedType(ModType type) {
		this.forcedType = type;
	}

	public ModType getForcedType() {
		return forcedType;
	}

	private boolean desecratedOnly = false;

    public void setDesecratedOnly(boolean value) {
        this.desecratedOnly = value;
    }

	@Override
	public Crafting_Item apply(Crafting_Item item) {
		// Only works on MAGIC or RARE items
		if (item.rarity == Crafting_Item.ItemRarity.NORMAL)
			return item;
		
		//If the annul orb has an omen of light (only remove desecration)
		if(this.desecratedOnly)
		{
			// Check if it is desecrated 
			if(item.desecrated)
			{
				// Check for the mod with Desecrated source and remove it
				for (int i = 0; i < item.currentPrefixes.length; i++) {
					Modifier mods = item.currentPrefixes[i];
					if (mods != null && mods.source == Modifier.ModifierSource.DESECRATED) {
						System.out.println("Removing Desecrated Prefix: " + mods.text);
						item.currentPrefixes[i] = null; // remove modifier
						item.currentPrefixTiers[i] = null; // clear tier link
						item.desecrated = false;
						return item;
					}
				}
				for (int i = 0; i < item.currentSuffixes.length; i++) {
					Modifier mods = item.currentSuffixes[i];
					if (mods != null && mods.source == Modifier.ModifierSource.DESECRATED) {
						System.out.println("Removing Desecrated Suffix: " + mods.text);
						item.currentSuffixes[i] = null; // remove modifier
						item.currentPrefixTiers[i] = null; // clear tier link
						item.desecrated = false;
						return item;
					}
				}
			}
			else
				System.out.println("Item is not desecrated");
		}

		item.removeRandomModifier(forcedType);
		return item;
	}

	@Override
	public int getCost() {
		return cost;
	}

	@Override
	public String getName() {
		return "Orb of Annulment";
	}
}
