// transmute.c
#include <stdlib.h>

#include "currency.h"
#include "../crafting/craft_utils.h"

// Normal->Magic, adds 1 mod. min_tier_level filters which tiers can roll.
static ItemInstance** apply_transmute_internal(const ItemInstance* item, int min_tier_level, int* out_count)
{
    *out_count = 0;
    if (!item || item->rarity != RARITY_NORMAL) return NULL;

    int prefix_count = 0, suffix_count = 0;
    ItemInstance** prefixes = get_all_possible_additions_with_min_tier(item, SOURCE_NORMAL, false, min_tier_level, &prefix_count);
    ItemInstance** suffixes = get_all_possible_additions_with_min_tier(item, SOURCE_NORMAL, true,  min_tier_level, &suffix_count);

    int total = prefix_count + suffix_count;
    if (total == 0) { free(prefixes); free(suffixes); return NULL; }

    ItemInstance** results = malloc(sizeof(ItemInstance*) * total);
    if (!results) {
        for (int i = 0; i < prefix_count; i++) free_item_instance(prefixes[i]);
        for (int i = 0; i < suffix_count; i++) free_item_instance(suffixes[i]);
        free(prefixes); free(suffixes);
        return NULL;
    }

    int idx = 0;
    for (int i = 0; i < prefix_count; i++) { results[idx] = prefixes[i]; results[idx]->rarity = RARITY_MAGIC; idx++; }
    for (int i = 0; i < suffix_count; i++) { results[idx] = suffixes[i]; results[idx]->rarity = RARITY_MAGIC; idx++; }

    free(prefixes); free(suffixes);
    *out_count = total;
    return results;
}

// Normal transmute: any tier
ItemInstance** apply_transmute(const ItemInstance* item, int* out_count)
{ return apply_transmute_internal(item, 0, out_count); }

// Greater transmute: only tiers with level_req >= 55
ItemInstance** apply_transmute_greater(const ItemInstance* item, int* out_count)
{ return apply_transmute_internal(item, 55, out_count); }

// Perfect transmute: only tiers with level_req >= 70
ItemInstance** apply_transmute_perfect(const ItemInstance* item, int* out_count)
{ return apply_transmute_internal(item, 70, out_count); }