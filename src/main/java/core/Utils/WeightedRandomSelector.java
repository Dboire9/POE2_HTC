package core.Utils;

import java.util.List;
import java.util.Random;

public class WeightedRandomSelector<T> {

    public static <T> T select(List<WeightedItem<T>> items) {
        int totalWeight = items.stream().mapToInt(WeightedItem::getWeight).sum();
        Random rng = new Random();
        int r = rng.nextInt(totalWeight);

        int sum = 0;
        for (WeightedItem<T> item : items) {
            sum += item.getWeight();
            if (r < sum) 
				return item.getItem();
        }
        return null; // fallback
    }
}
