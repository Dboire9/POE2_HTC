package gui;

import core.ItemManager;
import gui.controllers.CategoryController;
import gui.controllers.SubCategoryController;
import gui.views.CategoryView;
import gui.views.SubCategoryView;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.HBox;
import javafx.stage.Stage;

public class Main extends Application {

    @Override
    public void start(Stage primaryStage) {
        ItemManager manager = new ItemManager();

        CategoryView categoryView = new CategoryView(manager.getCategories());
        SubCategoryView subCategoryView = new SubCategoryView();

        // Pass the ComboBoxes from the views, plus the manager
        new CategoryController(categoryView.getComboBox(), subCategoryView.getComboBox(), manager);
        new SubCategoryController(subCategoryView.getComboBox());

        HBox root = new HBox(20, categoryView, subCategoryView);

        Scene scene = new Scene(root, 800, 400);
        primaryStage.setTitle("POE2 Reverse Crafter");
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
