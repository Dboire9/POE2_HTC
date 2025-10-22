package core.Crafting;

import java.util.List;
import core.Items.Item_base;
import core.Modifier_class.*;


// Crafting_Candidate are used to score the actions we are doing on an item, and retain the actions


public class Crafting_Candidate extends Crafting_Item {
        public double score;
        public List<Crafting_Action> actions;

        public Crafting_Candidate(Item_base base, double score, List<Crafting_Action> actions) 
		{
			super(base);
			this.score = score;
			this.actions = actions;
		}
}
