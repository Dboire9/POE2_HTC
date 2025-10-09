package gui.views;

import javafx.scene.control.ComboBox;
import javafx.scene.layout.VBox;

import java.util.List;

public class SubCategoryView extends VBox {
    private final ComboBox<String> comboBox;

    public SubCategoryView() {
        this.comboBox = new ComboBox<>();
        comboBox.setPromptText("Select SubCategory");
        this.getChildren().add(comboBox);
    }

    public ComboBox<String> getComboBox() {
        return comboBox;
    }

    public void setItems(List<String> subCategories) {
        comboBox.getItems().setAll(subCategories);
    }
}
