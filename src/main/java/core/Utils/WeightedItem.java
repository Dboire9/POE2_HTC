package core.Utils;

public class WeightedItem<T> {
    private T item;
    private int weight;

    public WeightedItem(T item, int weight) {
        this.item = item;
        this.weight = weight;
    }

    public T getItem() {
        return item;
    }

    public int getWeight() {
        return weight;
    }
}
