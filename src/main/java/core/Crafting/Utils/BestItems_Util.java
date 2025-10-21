package core.Crafting.Utils;

import java.util.*;

import core.Crafting.Crafting_Item;
import core.Modifier_class.*;

public class BestItems_Util {
	  
	// Count total items in the TreeMap
	public static int countTotalItems(TreeMap<Integer, List<Crafting_Item>> map) {
		int count = 0;
		for (List<Crafting_Item> list : map.values()) {
			count += list.size();
		}
		return count;
	}

	// Compare two items by their modifiers
	public static boolean sameModifiers(Crafting_Item a, Crafting_Item b) {
		List<Modifier> modsA = a.getAllModifiers();
		List<Modifier> modsB = b.getAllModifiers();

		if (modsA.size() != modsB.size()) return false;

		int matchCount = 0;
		for (Modifier ma : modsA) {
			for (Modifier mb : modsB) {
				if (ma.text.equals(mb.text)) {
					matchCount++;
					break;
				}
			}
		}

		return matchCount == modsA.size();
	}

	// Add item to top items if unique, keep only top 10
	public static void addToTopItems(TreeMap<Integer, List<Crafting_Item>> topItemsMap, int score, Crafting_Item item) {
		topItemsMap.computeIfAbsent(score, k -> new ArrayList<>());
		List<Crafting_Item> list = topItemsMap.get(score);

		// Check for duplicates
		for (Crafting_Item existing : list) {
			if (sameModifiers(existing, item)) {
				return; // already exists, don’t add
			}
		}

		// Unique — add
		list.add(item.copy());

		// Keep only top 10 items overall
		while (countTotalItems(topItemsMap) > 10) {
			Integer lastKey = topItemsMap.lastKey(); // smallest score
			List<Crafting_Item> l = topItemsMap.get(lastKey);
			if (!l.isEmpty()) {
				l.remove(l.size() - 1);
			}
			if (l.isEmpty()) topItemsMap.remove(lastKey);
		}
	}
}
