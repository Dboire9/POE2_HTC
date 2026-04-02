// exalted_orb.c
#include <stdlib.h>

#include "currency.h"
#include "../crafting/craft_utils.h"

// Rare item -> adds 1 mod, stays RARE. min_tier_level filters rollable tiers.
static ItemInstance** apply_exalt_internal(const ItemInstance* item, int min_tier_level, int* out_count)
{
    *out_count = 0;
    if (!item || item->rarity != RARITY_RARE) return NULL;

    int total_affixes = item->prefix_count + item->suffix_count;
    if (total_affixes >= 6) return NULL;

    int prefix_count = 0, suffix_count = 0;
    ItemInstance** prefix_results = NULL;
    ItemInstance** suffix_results = NULL;

    if (item->prefix_count < 3)
        prefix_results = get_all_possible_additions_with_min_tier(item, SOURCE_NORMAL, false, min_tier_level, &prefix_count);
    if (item->suffix_count < 3)
        suffix_results = get_all_possible_additions_with_min_tier(item, SOURCE_NORMAL, true,  min_tier_level, &suffix_count);

    int total = prefix_count + suffix_count;
    if (total == 0) { free(prefix_results); free(suffix_results); return NULL; }

    ItemInstance** results = malloc(sizeof(ItemInstance*) * total);
    if (!results) {
        for (int i = 0; i < prefix_count; i++) free_item_instance(prefix_results[i]);
        for (int i = 0; i < suffix_count; i++) free_item_instance(suffix_results[i]);
        free(prefix_results); free(suffix_results);
        return NULL;
    }

    int idx = 0;
    for (int i = 0; i < prefix_count; i++) results[idx++] = prefix_results[i];
    for (int i = 0; i < suffix_count; i++) results[idx++] = suffix_results[i];

    free(prefix_results); free(suffix_results);
    *out_count = total;
    return results;
}

ItemInstance** apply_exalt(const ItemInstance* item, int* out_count)
{ return apply_exalt_internal(item, 0, out_count); }

// Greater exalt: only tiers with level_req >= 35
ItemInstance** apply_exalt_greater(const ItemInstance* item, int* out_count)
{ return apply_exalt_internal(item, 35, out_count); }

// Perfect exalt: only tiers with level_req >= 50
ItemInstance** apply_exalt_perfect(const ItemInstance* item, int* out_count)
{ return apply_exalt_internal(item, 50, out_count); }
