package core.Currency.Essences;

import core.Currency.Essence_currency;

public class EssenceOfTheBody extends Essence_currency {

    public EssenceOfTheBody(EssenceTier tier) {
        super("+# to maximum Life", tier); // guaranteed modifier
    }

    @Override
    public String getName() {
        return "Essence of the Body";
    }
}
