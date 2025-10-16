package core.Currency;

import core.Crafting.Crafting_Item;
import core.Crafting.Crafting_Item.*;
import core.Crafting.Crafting_Action;
import core.Modifier_class.Modifier;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class AnnulmentOrb implements Crafting_Action {

	private double cost = 1.0;

	private ModType forcedType = ModType.ANY;

	public void setForcedType(ModType type) {
		this.forcedType = type;
	}

	public ModType getForcedType() {
		return forcedType;
	}

	@Override
	public Crafting_Item apply(Crafting_Item item) {
		// Only works on MAGIC or RARE items
		if (item.rarity == Crafting_Item.ItemRarity.NORMAL)
			return item;

		item.removeRandomModifier(forcedType);
		return item;
	}

	@Override
	public double getCost() {
		return cost;
	}

	@Override
	public String getName() {
		return "Orb of Annulment";
	}
}
