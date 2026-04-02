// chaos_orb.c
#include <stdlib.h>

#include "currency.h"
#include "../crafting/craft_utils.h"

// Chaos orb: Rare item -> removes 1 random mod, then adds 1 random mod.
// Rarity stays RARE.
// Returns all possible (remove 1 mod, add 1 mod) outcome pairs.

// Helper: build a copy of item with the i-th prefix removed.
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

// Helper: build a copy of item with the i-th suffix removed.
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

// Count how many additions are possible after removing one mod (without allocating results).
static int count_additions(const ItemInstance* removed)
{
    int n = 0;
    if (removed->prefix_count < 3) {
        int c = 0;
        ItemInstance** tmp = get_all_possible_additions(removed, SOURCE_NORMAL, false, &c);
        if (tmp) { for (int i = 0; i < c; i++) free_item_instance(tmp[i]); free(tmp); }
        n += c;
    }
    if (removed->suffix_count < 3) {
        int c = 0;
        ItemInstance** tmp = get_all_possible_additions(removed, SOURCE_NORMAL, true, &c);
        if (tmp) { for (int i = 0; i < c; i++) free_item_instance(tmp[i]); free(tmp); }
        n += c;
    }
    return n;
}

ItemInstance** apply_chaos(const ItemInstance* item, int* out_count)
{
    *out_count = 0;
    if (!item || item->rarity != RARITY_RARE) return NULL;

    int total_mods = item->prefix_count + item->suffix_count;
    if (total_mods == 0) return NULL;

    // ── Pass 1: pre-calculate exact total so we allocate once ──
    int exact_total = 0;
    for (int i = 0; i < item->prefix_count; i++) {
        ItemInstance* r = remove_prefix(item, i);
        if (r) { exact_total += count_additions(r); free_item_instance(r); }
    }
    for (int i = 0; i < item->suffix_count; i++) {
        ItemInstance* r = remove_suffix(item, i);
        if (r) { exact_total += count_additions(r); free_item_instance(r); }
    }

    if (exact_total == 0) return NULL;

    ItemInstance** results = malloc(sizeof(ItemInstance*) * exact_total);
    if (!results) return NULL;

    // ── Pass 2: fill results ──
    int idx = 0;

    for (int i = 0; i < item->prefix_count; i++) {
        ItemInstance* removed = remove_prefix(item, i);
        if (!removed) continue;

        if (removed->prefix_count < 3) {
            int c = 0;
            ItemInstance** added = get_all_possible_additions(removed, SOURCE_NORMAL, false, &c);
            if (added) { for (int k = 0; k < c; k++) results[idx++] = added[k]; free(added); }
        }
        if (removed->suffix_count < 3) {
            int c = 0;
            ItemInstance** added = get_all_possible_additions(removed, SOURCE_NORMAL, true, &c);
            if (added) { for (int k = 0; k < c; k++) results[idx++] = added[k]; free(added); }
        }
        free_item_instance(removed);
    }

    for (int i = 0; i < item->suffix_count; i++) {
        ItemInstance* removed = remove_suffix(item, i);
        if (!removed) continue;

        if (removed->prefix_count < 3) {
            int c = 0;
            ItemInstance** added = get_all_possible_additions(removed, SOURCE_NORMAL, false, &c);
            if (added) { for (int k = 0; k < c; k++) results[idx++] = added[k]; free(added); }
        }
        if (removed->suffix_count < 3) {
            int c = 0;
            ItemInstance** added = get_all_possible_additions(removed, SOURCE_NORMAL, true, &c);
            if (added) { for (int k = 0; k < c; k++) results[idx++] = added[k]; free(added); }
        }
        free_item_instance(removed);
    }

    *out_count = idx;
    return results;
}
