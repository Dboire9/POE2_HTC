package core.Items;

import core.Crafting.*;
import core.Items.Amulets.*;
import core.Modifier_class.*;

import java.util.List;
import java.util.ArrayList;
import java.util.Random;

public class Test_Modifiers {
    public static void main(String[] args) {
        // Create a new amulet item
        Amulets testItem = new Amulets();

		Crafting_Item Crafting_test_Item = new Crafting_Item(testItem);

        // For simplicity, pick normal allowed modifiers
        List<Modifier> availablePrefixes = testItem.Normal_allowedPrefixes;
        List<Modifier> availableSuffixes = testItem.Normal_allowedSuffixes;

        // Print all allowed modifiers
        System.out.println("Available Prefixes:");
        for (Modifier m : availablePrefixes) {
            System.out.println(" - " + m.text);
        }
        System.out.println("Available Suffixes:");
        for (Modifier m : availableSuffixes) {
            System.out.println(" - " + m.text);
        }

        // Add random modifiers 6 times
        for (int i = 0; i < 6; i++) {
            // Crafting_test_Item.addRandomModifier(availablePrefixes, availableSuffixes);
        }

        // Print results
        System.out.println("\nSelected Prefixes:");
        for (Modifier m : Crafting_test_Item.currentPrefixes) {
            System.out.println(" - " + (m != null ? m.text : "empty"));
        }

        System.out.println("\nSelected Suffixes:");
        for (Modifier m : Crafting_test_Item.currentSuffixes) {
            System.out.println(" - " + (m != null ? m.text : "empty"));
        }
    }
}

