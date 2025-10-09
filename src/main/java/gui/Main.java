package gui;

import core.ItemManager;
import gui.controllers.ItemSelectionController;
import gui.views.ItemSelectionView;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.HBox;
import javafx.stage.Stage;

public class Main extends Application {

    @Override
    public void start(Stage primaryStage) {
        ItemManager manager = new ItemManager();

        ItemSelectionView view = new ItemSelectionView(manager.getCategories());
        new ItemSelectionController(view, manager);
        

        HBox root = new HBox(20, view); // Add the view, not the controller

        Scene scene = new Scene(root, 800, 400);
        primaryStage.setTitle("POE2 Reverse Crafter");
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
