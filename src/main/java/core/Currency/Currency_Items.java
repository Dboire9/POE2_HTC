package core.Currency;

import java.util.Currency;
import java.util.List;

import core.Items.CraftingItem;
import core.Items.Item_base;
import core.Items.Item_base.ItemRarity;

public abstract class Currency_Items {
    protected final String name;
    protected final String description;

    public Currency_Items(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public String getName() { return name; }
    public String getDescription() { return description; }

    @Override
    public String toString() {
        return name;
    }

	public class OrbOfTransmutation extends Currency_Items {
    public OrbOfTransmutation() {
        super("Orb of Transmutation", "Upgrades a Normal item to a Magic item with 1 modifier");
    }

		public void applyTo(Item_base item) {
			if (item.rarity == ItemRarity.NORMAL) {
				item.rarity = ItemRarity.MAGIC;
				item.addRandomModifier();
			}
		}
	}
}