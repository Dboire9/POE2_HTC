// annulment_orb.c
#include <stdlib.h>

#include "currency.h"
#include "../items/items.h"

// Annulment orb: removes one modifier, item keeps its rarity.
// Returns all possible outcomes (one per mod that could be removed).
ItemInstance** apply_annulment(const ItemInstance* item, int* out_count)
{
    *out_count = 0;
    if (!item) return NULL;

    int total = item->prefix_count + item->suffix_count;
    if (total == 0) return NULL;

    ItemInstance** results = malloc(sizeof(ItemInstance*) * total);
    if (!results) return NULL;

    int idx = 0;

    // Each prefix removal is one possible outcome
    for (int i = 0; i < item->prefix_count; i++)
    {
        ItemInstance* next = copy_item_instance(item);
        if (!next) continue;

        for (int j = i; j < next->prefix_count - 1; j++) {
            next->prefixes[j]             = next->prefixes[j + 1];
            next->desired_prefix_tiers[j] = next->desired_prefix_tiers[j + 1];
        }
        next->prefixes[next->prefix_count - 1]             = NULL;
        next->desired_prefix_tiers[next->prefix_count - 1] = 0;
        next->prefix_count--;

        results[idx++] = next;
    }

    // Each suffix removal is one possible outcome
    for (int i = 0; i < item->suffix_count; i++)
    {
        ItemInstance* next = copy_item_instance(item);
        if (!next) continue;

        for (int j = i; j < next->suffix_count - 1; j++) {
            next->suffixes[j]             = next->suffixes[j + 1];
            next->desired_suffix_tiers[j] = next->desired_suffix_tiers[j + 1];
        }
        next->suffixes[next->suffix_count - 1]             = NULL;
        next->desired_suffix_tiers[next->suffix_count - 1] = 0;
        next->suffix_count--;

        results[idx++] = next;
    }

    *out_count = idx;
    return results;
}
