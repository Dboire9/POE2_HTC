package core.Crafting;

import java.util.ArrayList;
import java.util.List;
import core.Items.Item_base;
import core.Modifier_class.*;


// Crafting_Candidate are used to score the actions we are doing on an item, and retain the actions


public class Crafting_Candidate extends Crafting_Item {
        public double score;
        public List<Crafting_Action> actions = new ArrayList<>();
		public double percentage;

        public Crafting_Candidate(Crafting_Item new_item, double score, Crafting_Action actions) 
		{
			super(new_item.base);
			this.score = score;
			this.actions.add(actions);
			this.currentPrefixes = new_item.currentPrefixes;
			this.currentPrefixTiers = new_item.currentPrefixTiers;
			this.currentSuffixes = new_item.currentSuffixes;
			this.currentSuffixTiers = new_item.currentSuffixTiers;
			this.rarity = new_item.rarity;
		}

		public static Crafting_Candidate AddCraftingCandidate(Crafting_Item item, double score, Crafting_Action action)
		{
			Crafting_Candidate new_Crafting_Candidate = new Crafting_Candidate(item, score, action);
			return new_Crafting_Candidate;
		}

		public Crafting_Candidate NewStep(Crafting_Item new_item, double score, Crafting_Action action)
		{
			this.score += score;
			this.actions.add(action);
			return this;
		}
}
