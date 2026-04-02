#include <stdlib.h>

#include "currency.h"
#include "../crafting/craft_utils.h"

// Magic item (0 or 1 mod) -> adds 1 mod. min_tier_level filters rollable tiers.
static ItemInstance** apply_augmentation_internal(const ItemInstance* item, int min_tier_level, int* out_count)
{
    *out_count = 0;
    if (!item || item->rarity != RARITY_MAGIC) return NULL;

    int total = item->prefix_count + item->suffix_count;
    if (total > 1) return NULL;

    if (total == 1) {
        bool add_suffix = item->prefix_count == 1;
        return get_all_possible_additions_with_min_tier(item, SOURCE_NORMAL, add_suffix, min_tier_level, out_count);
    }

    // 0 mods: can add either prefix or suffix
    int prefix_count = 0, suffix_count = 0;
    ItemInstance** prefix_results = get_all_possible_additions_with_min_tier(item, SOURCE_NORMAL, false, min_tier_level, &prefix_count);
    ItemInstance** suffix_results = get_all_possible_additions_with_min_tier(item, SOURCE_NORMAL, true,  min_tier_level, &suffix_count);

    int combined = prefix_count + suffix_count;
    if (combined == 0) { free(prefix_results); free(suffix_results); return NULL; }

    ItemInstance** results = malloc(sizeof(ItemInstance*) * combined);
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
    *out_count = combined;
    return results;
}

ItemInstance** apply_augmentation(const ItemInstance* item, int* out_count)
{ return apply_augmentation_internal(item, 0, out_count); }

ItemInstance** apply_augmentation_greater(const ItemInstance* item, int* out_count)
{ return apply_augmentation_internal(item, 55, out_count); }

ItemInstance** apply_augmentation_perfect(const ItemInstance* item, int* out_count)
{ return apply_augmentation_internal(item, 70, out_count); }