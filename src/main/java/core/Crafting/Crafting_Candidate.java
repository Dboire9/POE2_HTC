package core.Crafting;

import java.util.ArrayList;
import java.util.List;

import core.Crafting.Utils.ModifierEvent;
import core.Items.Item_base;
import core.Modifier_class.*;


// Crafting_Candidate are used to score the actions we are doing on an item, and retain the actions


public class Crafting_Candidate extends Crafting_Item {
        public List<Crafting_Action> actions = new ArrayList<>();
		public double percentage;

		public Crafting_Candidate(){};

		@Override
		public Crafting_Candidate copy() {
			// Call the copy method from the parent class to handle deep copying of inherited fields
			Crafting_Item baseClone = super.copy();
		
			// Create a new Crafting_Candidate instance and cast the baseClone
			Crafting_Candidate copy = new Crafting_Candidate();
			copy.base = baseClone.base;
			copy.rarity = baseClone.rarity;
			copy.desecrated = baseClone.desecrated;
		
			// Deep copy current prefixes and suffixes
			for (int i = 0; i < currentPrefixes.length; i++) {
				if (this.currentPrefixes[i] != null) {
					copy.currentPrefixes[i] = new Modifier(this.currentPrefixes[i]);
				}
				if (this.currentPrefixTiers[i] != null) {
					copy.currentPrefixTiers[i] = new ModifierTier(this.currentPrefixTiers[i]);
				}
				if (this.currentSuffixes[i] != null) {
					copy.currentSuffixes[i] = new Modifier(this.currentSuffixes[i]);
				}
				if (this.currentSuffixTiers[i] != null) {
					copy.currentSuffixTiers[i] = new ModifierTier(this.currentSuffixTiers[i]);
				}
			}
		
			// Copy Crafting_Candidate-specific fields
			copy.score = this.score;
			copy.prev_score = this.prev_score;
			copy.percentage = this.percentage;
		
			// Deep copy actions
			copy.actions = new ArrayList<>();
			for (Crafting_Action action : this.actions) {
				copy.actions.add(action.copy());
			}

			copy.modifierHistory = new ArrayList<>();
			for (ModifierEvent History : this.modifierHistory) {
				copy.modifierHistory.add(History.copy());
			}
		
			return copy;
		}

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
			this.modifierHistory = new_item.modifierHistory;
		}

		public static Crafting_Candidate AddCraftingCandidate(Crafting_Item item, double score, Crafting_Action action)
		{
			Crafting_Candidate new_Crafting_Candidate = new Crafting_Candidate(item, score, action);
			return new_Crafting_Candidate;
		}

		public Crafting_Candidate NewStep(Crafting_Candidate oldCraftingCandidate, Crafting_Item new_item, double score, Crafting_Action action)
		{
			Crafting_Candidate new_Crafting_Candidate = (Crafting_Candidate) new_item.copy();
			new_Crafting_Candidate.score = score;
			new_Crafting_Candidate.currentPrefixes = new_item.currentPrefixes.clone();
			new_Crafting_Candidate.currentPrefixTiers = new_item.currentPrefixTiers.clone();
			new_Crafting_Candidate.currentSuffixes = new_item.currentSuffixes.clone();
			new_Crafting_Candidate.currentSuffixTiers = new_item.currentSuffixTiers.clone();
			return new_Crafting_Candidate;
		}
}
