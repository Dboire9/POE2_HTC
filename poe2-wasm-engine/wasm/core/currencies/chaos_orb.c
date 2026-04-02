// chaos_orb.c
#include <stdlib.h>

#include "currency.h"
#include "../crafting/craft_utils.h"

// Chaos orb: Rare item -> removes 1 random mod, then adds 1 random mod.
// Rarity stays RARE. min_tier_level applies only to the addition pool.
// Returns all possible (remove 1 mod, add 1 mod) outcome pairs.

static ItemInstance* remove_prefix(const ItemInstance* item, int i)
{
    ItemInstance* r = copy_item_instance(item);
    if (!r) return NULL;
    for (int j = i; j < r->prefix_count - 1; j++) {
        r->prefixes[j]             = r->prefixes[j + 1];
        r->desired_prefix_tiers[j] = r->desired_prefix_tiers[j + 1];
    }
    r->prefix_count--;
    return r;
}

static ItemInstance* remove_suffix(const ItemInstance* item, int i)
{
    ItemInstance* r = copy_item_instance(item);
    if (!r) return NULL;
    for (int j = i; j < r->suffix_count - 1; j++) {
        r->suffixes[j]             = r->suffixes[j + 1];
        r->desired_suffix_tiers[j] = r->desired_suffix_tiers[j + 1];
    }
    r->suffix_count--;
    return r;
}

static int count_additions_with_min(const ItemInstance* removed, int min_tier_level)
{
    int n = 0;
    if (removed->prefix_count < 3) {
        int c = 0;
        ItemInstance** tmp = get_all_possible_additions_with_min_tier(removed, SOURCE_NORMAL, false, min_tier_level, &c);
        if (tmp) { for (int i = 0; i < c; i++) free_item_instance(tmp[i]); free(tmp); }
        n += c;
    }
    if (removed->suffix_count < 3) {
        int c = 0;
        ItemInstance** tmp = get_all_possible_additions_with_min_tier(removed, SOURCE_NORMAL, true, min_tier_level, &c);
        if (tmp) { for (int i = 0; i < c; i++) free_item_instance(tmp[i]); free(tmp); }
        n += c;
    }
    return n;
}

static ItemInstance** apply_chaos_internal(const ItemInstance* item, int min_tier_level, int* out_count)
{
    *out_count = 0;
    if (!item || item->rarity != RARITY_RARE) return NULL;

    int total_mods = item->prefix_count + item->suffix_count;
    if (total_mods == 0) return NULL;

    // Pass 1: pre-calculate exact total
    int exact_total = 0;
    for (int i = 0; i < item->prefix_count; i++) {
        ItemInstance* r = remove_prefix(item, i);
        if (r) { exact_total += count_additions_with_min(r, min_tier_level); free_item_instance(r); }
    }
    for (int i = 0; i < item->suffix_count; i++) {
        ItemInstance* r = remove_suffix(item, i);
        if (r) { exact_total += count_additions_with_min(r, min_tier_level); free_item_instance(r); }
    }

    if (exact_total == 0) return NULL;

    ItemInstance** results = malloc(sizeof(ItemInstance*) * exact_total);
    if (!results) return NULL;

    // Pass 2: fill results
    int idx = 0;

    for (int i = 0; i < item->prefix_count; i++) {
        ItemInstance* removed = remove_prefix(item, i);
        if (!removed) continue;
        if (removed->prefix_count < 3) {
            int c = 0;
            ItemInstance** added = get_all_possible_additions_with_min_tier(removed, SOURCE_NORMAL, false, min_tier_level, &c);
            if (added) { for (int k = 0; k < c; k++) results[idx++] = added[k]; free(added); }
        }
        if (removed->suffix_count < 3) {
            int c = 0;
            ItemInstance** added = get_all_possible_additions_with_min_tier(removed, SOURCE_NORMAL, true, min_tier_level, &c);
            if (added) { for (int k = 0; k < c; k++) results[idx++] = added[k]; free(added); }
        }
        free_item_instance(removed);
    }

    for (int i = 0; i < item->suffix_count; i++) {
        ItemInstance* removed = remove_suffix(item, i);
        if (!removed) continue;
        if (removed->prefix_count < 3) {
            int c = 0;
            ItemInstance** added = get_all_possible_additions_with_min_tier(removed, SOURCE_NORMAL, false, min_tier_level, &c);
            if (added) { for (int k = 0; k < c; k++) results[idx++] = added[k]; free(added); }
        }
        if (removed->suffix_count < 3) {
            int c = 0;
            ItemInstance** added = get_all_possible_additions_with_min_tier(removed, SOURCE_NORMAL, true, min_tier_level, &c);
            if (added) { for (int k = 0; k < c; k++) results[idx++] = added[k]; free(added); }
        }
        free_item_instance(removed);
    }

    *out_count = idx;
    return results;
}

ItemInstance** apply_chaos(const ItemInstance* item, int* out_count)
{ return apply_chaos_internal(item, 0, out_count); }

// Greater chaos: added mod must have a tier with level_req >= 35
ItemInstance** apply_chaos_greater(const ItemInstance* item, int* out_count)
{ return apply_chaos_internal(item, 35, out_count); }

// Perfect chaos: added mod must have a tier with level_req >= 50
ItemInstance** apply_chaos_perfect(const ItemInstance* item, int* out_count)
{ return apply_chaos_internal(item, 50, out_count); }
