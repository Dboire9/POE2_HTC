package core.Currency.Essences;

import core.Crafting.Crafting_Item;
import core.Currency.Essence_currency;

public class Essences {

	public static class EssenceOfTheBody extends Essence_currency {
		public EssenceOfTheBody(EssenceTier tier) {
			super("Body", tier);
		}
	
		@Override
		public String getName() {
			return switch (tier) {
				case LESSER -> "Lesser Essence of the Body";
				case NORMAL -> "Essence of the Body";
				case GREATER -> "Greater Essence of the Body";
				case PERFECT -> "Perfect Essence of the Body";
			};
		}
		@Override
		public int getCost(){return 1;}
	}

	public static class EssenceOfTheMind extends Essence_currency {
		public EssenceOfTheMind(EssenceTier tier) {
			super("Mind", tier);
		}
	
		@Override
		public String getName() {
			return switch (tier) {
				case LESSER -> "Lesser Essence of the Mind";
				case NORMAL -> "Essence of the Mind";
				case GREATER -> "Greater Essence of the Mind";
				case PERFECT -> "Perfect Essence of the Mind";
			};
		}
		@Override
		public int getCost(){return 1;}
	}

	public static class EssenceOfEnhancement extends Essence_currency {
        public EssenceOfEnhancement(EssenceTier tier) {
            super("Enhancement", tier);
        }

        @Override
        public String getName() {
            return switch (tier) {
                case LESSER -> "Lesser Essence of Enhancement";
                case NORMAL -> "Essence of Enhancement";
                case GREATER -> "Greater Essence of Enhancement";
				case PERFECT -> "Perfect Essence of Enhancement";
            };
        }
		@Override
		public int getCost(){return 1;}
    }

	public static class EssenceOfAbrasion extends Essence_currency {
		public EssenceOfAbrasion(EssenceTier tier) {
			super("Abrasion", tier);
		}
	
		@Override
		public String getName() {
			return switch (tier) {
				case LESSER -> "Lesser Essence of Abrasion";
				case NORMAL -> "Essence of Abrasion";
				case GREATER -> "Greater Essence of Abrasion";
				case PERFECT -> "Perfect Essence of Abrasion";
			};
		}
		@Override
		public int getCost(){return 1;}
	}

	public static class EssenceOfFlames extends Essence_currency {
		public EssenceOfFlames(EssenceTier tier) {
			super("Flames", tier); 
		}
	
		@Override
		public String getName() {
			return switch (tier) {
				case LESSER -> "Lesser Essence of Flames";
				case NORMAL -> "Essence of Flames";
				case GREATER -> "Greater Essence of Flames";
				case PERFECT -> "Perfect Essence of Flames";
			};
		}
		@Override
		public int getCost(){return 1;}
	}

	public static class EssenceOfIce extends Essence_currency {
		public EssenceOfIce(EssenceTier tier) {
			super("Ice", tier); 
		}
	
		@Override
		public String getName() {
			return switch (tier) {
				case LESSER -> "Lesser Essence of Ice";
				case NORMAL -> "Essence of Ice";
				case GREATER -> "Greater Essence of Ice";
				case PERFECT -> "Perfect Essence of Ice";
			};
		}
		@Override
		public int getCost(){return 1;}
	}

	public static class EssenceOfElectricity extends Essence_currency {
		public EssenceOfElectricity(EssenceTier tier) {
			super("Electricity", tier); 
		}
	
		@Override
		public String getName() {
			return switch (tier) {
				case LESSER -> "Lesser Essence of Electricity";
				case NORMAL -> "Essence of Electricity";
				case GREATER -> "Greater Essence of Electricity";
				case PERFECT -> "Perfect Essence of Electricity";
			};
		}
		@Override
		public int getCost(){return 1;}
	}

	public static class EssenceOfRuin extends Essence_currency {
		public EssenceOfRuin(EssenceTier tier) {
			super("Ruin", tier);
		}
	
		@Override
		public String getName() {
			return switch (tier) {
				case LESSER -> "Lesser Essence of Ruin";
				case NORMAL -> "Essence of Ruin";
				case GREATER -> "Greater Essence of Ruin";
				case PERFECT -> "Perfect Essence of Ruin";
			};
		}
		@Override
		public int getCost(){return 1;}
	}

	public static class EssenceOfBattle extends Essence_currency {
		public EssenceOfBattle(EssenceTier tier) {
			super("Battle", tier); 
		}
	
		@Override
		public String getName() {
			return switch (tier) {
				case LESSER -> "Lesser Essence of Battle";
				case NORMAL -> "Essence of Battle";
				case GREATER -> "Greater Essence of Battle";
				case PERFECT -> "Perfect Essence of Battle";
			};
		}
		@Override
		public int getCost(){return 1;}
	}

	public static class EssenceOfSorcery extends Essence_currency {
		public EssenceOfSorcery(EssenceTier tier) {
			super("Sorcery", tier); 
		}
	
		@Override
		public String getName() {
			return switch (tier) {
				case LESSER -> "Lesser Essence of Sorcery";
				case NORMAL -> "Essence of Sorcery";
				case GREATER -> "Greater Essence of Sorcery";
				case PERFECT -> "Perfect Essence of Sorcery";
			};
		}
		@Override
		public int getCost(){return 1;}
	}

	public static class EssenceOfHaste extends Essence_currency {
		public EssenceOfHaste(EssenceTier tier) {
			super("Haste", tier); 
		}
	
		@Override
		public String getName() {
			return switch (tier) {
				case LESSER -> "Lesser Essence of Haste";
				case NORMAL -> "Essence of Haste";
				case GREATER -> "Greater Essence of Haste";
				case PERFECT -> "Perfect Essence of Haste";
			};
		}
		@Override
		public int getCost(){return 1;}
	}

	public static class EssenceOfInfinite extends Essence_currency {
		public EssenceOfInfinite(EssenceTier tier) {
			super("Infinite", tier); 
		}
	
		@Override
		public String getName() {
			return switch (tier) {
				case LESSER -> "Lesser Essence of Infinite";
				case NORMAL -> "Essence of the Infinite";
				case GREATER -> "Greater Essence of Infinite";
				case PERFECT -> "Perfect Essence of Infinite";
			};
		}
		@Override
		public int getCost(){return 1;}
	}

	public static class EssenceOfCommand extends Essence_currency {
		public EssenceOfCommand(EssenceTier tier) {
			super("Command", tier); 
		}
	
		@Override
		public String getName() {
			return switch (tier) {
				case LESSER -> "Lesser Essence of Command";
				case NORMAL -> "Essence of the Command";
				case GREATER -> "Greater Essence of Command";
				case PERFECT -> "Perfect Essence of Command";
			};
		}
		@Override
		public int getCost(){return 1;}
	}

	public static class EssenceOfAlacrity extends Essence_currency {
		public EssenceOfAlacrity(EssenceTier tier) {
			super("Alacrity", tier); 
		}
	
		@Override
		public String getName() {
			return switch (tier) {
				case LESSER -> "Lesser Essence of Alacrity";
				case NORMAL -> "Essence of the Alacrity";
				case GREATER -> "Greater Essence of Alacrity";
				case PERFECT -> "Perfect Essence of Alacrity";
			};
		}
		@Override
		public int getCost(){return 1;}
	}

	public static class EssenceOfSeeking extends Essence_currency {
		public EssenceOfSeeking(EssenceTier tier) {
			super("Seeking", tier); 
		}
	
		@Override
		public String getName() {
			return switch (tier) {
				case LESSER -> "Lesser Essence of Seeking";
				case NORMAL -> "Essence of the Seeking";
				case GREATER -> "Greater Essence of Seeking";
				case PERFECT -> "Perfect Essence of Seeking";
			};
		}
		@Override
		public int getCost(){return 1;}
	}

	public static class EssenceOfOpulence extends Essence_currency {
		public EssenceOfOpulence(EssenceTier tier) {
			super("Opulence", tier); 
		}
	
		@Override
		public String getName() {
			return switch (tier) {
				case LESSER -> "Lesser Essence of Opulence";
				case NORMAL -> "Essence of the Opulence";
				case GREATER -> "Greater Essence of Opulence";
				case PERFECT -> "Perfect Essence of Opulence";
			};
		}
		@Override
		public int getCost(){return 1;}
	}

	public static class EssenceOfGrounding extends Essence_currency {
		public EssenceOfGrounding(EssenceTier tier) {
			super("Grounding", tier); 
		}
	
		@Override
		public String getName() {
			return switch (tier) {
				case LESSER -> "Lesser Essence of Grounding";
				case NORMAL -> "Essence of the Grounding";
				case GREATER -> "Greater Essence of Grounding";
				case PERFECT -> "Perfect Essence of Grounding";
			};
		}
		@Override
		public int getCost(){return 1;}
	}

	public static class EssenceOfInsulation extends Essence_currency {
		public EssenceOfInsulation(EssenceTier tier) {
			super("Insulation", tier); 
		}
	
		@Override
		public String getName() {
			return switch (tier) {
				case LESSER -> "Lesser Essence of Insulation";
				case NORMAL -> "Essence of the Insulation";
				case GREATER -> "Greater Essence of Insulation";
				case PERFECT -> "Perfect Essence of Insulation";
			};
		}
		@Override
		public int getCost(){return 1;}
	}

	public static class EssenceOfThawing extends Essence_currency {
		public EssenceOfThawing(EssenceTier tier) {
			super("Thawing", tier); 
		}
	
		@Override
		public String getName() {
			return switch (tier) {
				case LESSER -> "Lesser Essence of Thawing";
				case NORMAL -> "Essence of the Thawing";
				case GREATER -> "Greater Essence of Thawing";
				case PERFECT -> "Perfect Essence of Thawing";
			};
		}
		@Override
		public int getCost(){return 1;}
	}

	public static class EssenceOfDelirium extends Essence_currency {

		public EssenceOfDelirium() {
			super("Delirium", EssenceTier.PERFECT); // Only perfect essence exists
		}

		@Override
		public String getName() {
			return "Perfect Essence of Delirium";
		}

		@Override
		public int getCost(){return 1;}
	}

	public static class EssenceOfHorror extends Essence_currency {

		public EssenceOfHorror() {
			super("Horror", EssenceTier.PERFECT); // Only perfect essence exists
		}

		@Override
		public String getName() {
			return "Perfect Essence of Horror";
		}

		@Override
		public int getCost(){return 1;}

	}

	public static class EssenceOfHysteria extends Essence_currency {

		public EssenceOfHysteria() {
			super("Hysteria", EssenceTier.PERFECT); // Only perfect essence exists
		}

		@Override
		public String getName() {
			return "Perfect Essence of Hysteria";
		}

		@Override
		public int getCost(){return 1;}

	}

	public static class EssenceOfAbyss extends Essence_currency {

		public EssenceOfAbyss() {
			super("Abyss", EssenceTier.PERFECT); // Only perfect essence exists
		}

		@Override
		public String getName() {
			return "Perfect Essence of the Abyss";
		}

		@Override
		public int getCost(){return 1;}
	}



	
}
