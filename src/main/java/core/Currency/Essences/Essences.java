package core.Currency.Essences;

import core.Currency.Essence_currency;

public class Essences {

	public static class EssenceOfTheBody extends Essence_currency {
		public EssenceOfTheBody(EssenceTier tier) {
			super("+# to maximum Life", tier);
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
	}

	public static class EssenceOfTheMind extends Essence_currency {
        public EssenceOfTheMind(EssenceTier tier) {
            super("+# to maximum Mana", tier);
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
    }

	public static class EssenceOfEnhancement extends Essence_currency {
        public EssenceOfEnhancement(EssenceTier tier) {
            super("% increased Armour, Evasion or Energy Shield", tier);
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
    }

	public static class EssenceOfAbrasion extends Essence_currency {
		public EssenceOfAbrasion(EssenceTier tier) {
			super("Adds # to # Physical Damage", tier); // Replace with your Modifier text used in your system
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
	}

	public static class EssenceOfFlames extends Essence_currency {
		public EssenceOfFlames(EssenceTier tier) {
			super("Adds # to # Fire Damage", tier); // Replace with the exact Modifier text from your system
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
	}

	public static class EssenceOfIce extends Essence_currency {
		public EssenceOfIce(EssenceTier tier) {
			super("Adds # to # Cold Damage", tier); // Replace with the exact Modifier text from your system
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
	}

	public static class EssenceOfElectricity extends Essence_currency {
		public EssenceOfElectricity(EssenceTier tier) {
			super("Adds # to # Lightning Damage", tier); // Replace with the exact Modifier text from your system
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
	}

	public static class EssenceOfRuin extends Essence_currency {
		public EssenceOfRuin(EssenceTier tier) {
			super("+# to Chaos Resistance", tier); // Replace with exact Modifier text if different
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
	}

	public static class EssenceOfBattle extends Essence_currency {
		public EssenceOfBattle(EssenceTier tier) {
			super("+# to Accuracy Rating", tier); // Replace with the exact Modifier text from your system
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
	}

	public static class EssenceOfSorcery extends Essence_currency {
		public EssenceOfSorcery(EssenceTier tier) {
			super("#% increased Spell Damage", tier); // Replace with the exact Modifier text from your system
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
	}

	public static class EssenceOfHaste extends Essence_currency {
		public EssenceOfHaste(EssenceTier tier) {
			super("#% increased Attack Speed", tier); // Replace with the exact Modifier text from your system
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
	}

	public static class EssenceOfInfinite extends Essence_currency {
		public EssenceOfInfinite(EssenceTier tier) {
			super("Strength, Dexterity or Intelligence", tier); // Replace with the exact Modifier text from your system
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
	}
	
}
