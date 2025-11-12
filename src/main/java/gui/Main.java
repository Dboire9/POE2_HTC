package gui;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.HBox;
import javafx.stage.Stage;
import core.ItemManager;
import gui.controllers.ItemSelectionController;
import gui.views.ItemSelectionView;

/**
 * Entry point for the POE2 How To Craft JavaFX application.
 * <p>
 * Responsibilities:
 * <ul>
 *     <li>Initialize the item manager to provide item categories.</li>
 *     <li>Create and configure the main ItemSelectionView.</li>
 *     <li>Instantiate the ItemSelectionController to wire UI interactions to services.</li>
 *     <li>Set up the main JavaFX scene and display the application window.</li>
 * </ul>
 * <p>
 * This class extends {@link javafx.application.Application} and overrides the {@link #start(Stage)} method
 * to configure the GUI and launch the JavaFX application.
 */
public class Main extends Application {

    /**
     * Initializes and displays the primary stage of the JavaFX application.
     * <p>
     * This method performs the following:
     * <ul>
     *     <li>Creates an {@link ItemManager} to manage item data.</li>
     *     <li>Initializes {@link ItemSelectionView} with available item categories.</li>
     *     <li>Creates an {@link ItemSelectionController} to handle user interactions.</li>
     *     <li>Places the view in an {@link javafx.scene.layout.HBox} and sets up the {@link Scene}.</li>
     *     <li>Displays the primary stage with a title and size of 1800x1000.</li>
     * </ul>
     *
     * @param primaryStage the primary stage provided by the JavaFX runtime
     */
    @Override
    public void start(Stage primaryStage) {
        ItemManager manager = new ItemManager();

        ItemSelectionView view = new ItemSelectionView(manager.getCategories());
        new ItemSelectionController(view, manager);

		// Initialize progress bar state
		view.progressBar.setVisible(false);
		view.progressBar.setProgress(0);

		new ItemSelectionController(view, manager);

        HBox root = new HBox(20, view); // Add the view, not the controller

        Scene scene = new Scene(root, 1800, 1000);
        primaryStage.setTitle("POE2 How To Craft");
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    /**
     * Main method to launch the JavaFX application.
     *
     * @param args command-line arguments (not used)
     */
    public static void main(String[] args) {
        launch(args);
    }
}
