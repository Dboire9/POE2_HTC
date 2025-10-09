package gui.views;

import javafx.scene.control.ComboBox;
import javafx.scene.layout.VBox;

import java.util.List;

public class CategoryView extends VBox {
    private final ComboBox<String> comboBox;

    public CategoryView(List<String> categories) {
        this.comboBox = new ComboBox<>();
        comboBox.getItems().addAll(categories);
        comboBox.setPromptText("Select Category");
        this.getChildren().add(comboBox);
    }

    public ComboBox<String> getComboBox() {
        return comboBox;
    }
}
