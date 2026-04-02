// craft_utils.c
#include <stdlib.h>
#include <string.h>

#include "craft_utils.h"
#include "../items/item_mod_lookup.h"
#include "../modifiers/modifiers.h"

// ────────────────────────────────────────────────────────
// Get all valid modifiers for item + source + affix type
// ────────────────────────────────────────────────────────

ModifierEntry* get_valid_modifiers(const ItemInstance* item, ModifierSource source, bool is_suffix, int* out_count)
{
    *out_count = 0;
    if (!item || !item->base_item) return NULL;

    int table_count = 0;
    ModifierLookup* table = get_lookup_table(item->base_item->id, source, is_suffix, &table_count);
    if (!table || table_count == 0) return NULL;

    // Allocate worst case — we'll trim at the end
    ModifierEntry* entries = malloc(sizeof(ModifierEntry) * table_count);
    if (!entries) return NULL;

    int count = 0;
    for (int i = 0; i < table_count; i++)
    {
        const Modifier* mod = get_modifier_by_source_index(source, table[i].index);
        if (!mod) continue;

        // Check item level against highest accessible tier
        // table[i].max_tier_index caps which tiers can roll
        // tier 0 = highest tier, so we check the level req of the lowest accessible tier
        uint8_t max_tier = table[i].max_tier_index;
        if (max_tier >= mod->tier_count) max_tier = mod->tier_count - 1;

        // At least one tier must be accessible given item level
        bool any_tier_valid = false;
        for (int t = 0; t <= max_tier; t++) {
            if (mod->tiers[t].level_req <= (uint16_t)item->item_level) {
                any_tier_valid = true;
                break;
            }
        }
        if (!any_tier_valid) continue;

        // Check modifier is not already on the item
        bool already_on_item = false;
        if (!is_suffix) {
            for (int s = 0; s < 3; s++)
                if (item->prefixes[s] == mod) { already_on_item = true; break; }
        } else {
            for (int s = 0; s < 3; s++)
                if (item->suffixes[s] == mod) { already_on_item = true; break; }
        }
        if (already_on_item) continue;

        entries[count].modifier = mod;
        entries[count].lookup   = &table[i];
        count++;
    }

    *out_count = count;
    if (count == 0) { free(entries); return NULL; }
    return entries;
}

// ───────────────────────────────────────────────────────────────────────
// Add a modifier to an item copy — returns new malloc'd ItemInstance
// ───────────────────────────────────────────────────────────────────────

static ItemInstance* add_modifier_to_item(const ItemInstance* item, const Modifier* mod, bool is_suffix)
{
    ItemInstance* next = copy_item_instance(item);
    if (!next) return NULL;

    if (!is_suffix)
    {
        if (next->prefix_count >= 3) { free_item_instance(next); return NULL; }
        next->prefixes[next->prefix_count] = mod;
        next->desired_prefix_tiers[next->prefix_count] = 0; // default tier 0
        next->prefix_count++;
    }
    else
    {
        if (next->suffix_count >= 3) { free_item_instance(next); return NULL; }
        next->suffixes[next->suffix_count] = mod;
        next->desired_suffix_tiers[next->suffix_count] = 0;
        next->suffix_count++;
    }

    return next;
}

// ───────────────────────────────────────────────────
// Get all possible items after adding one modifier
// ───────────────────────────────────────────────────

ItemInstance** get_all_possible_additions(const ItemInstance* item, ModifierSource source, bool is_suffix, int* out_count)
{
    *out_count = 0;

    int mod_count = 0;
    ModifierEntry* entries = get_valid_modifiers(item, source, is_suffix, &mod_count);
    if (!entries || mod_count == 0) return NULL;

    ItemInstance** results = malloc(sizeof(ItemInstance*) * mod_count);
    if (!results) { free(entries); return NULL; }

    int count = 0;
    for (int i = 0; i < mod_count; i++)
    {
        ItemInstance* next = add_modifier_to_item(item, entries[i].modifier, is_suffix);
        if (!next) continue;
        results[count++] = next;
    }

    free(entries);

    *out_count = count;
    if (count == 0) { free(results); return NULL; }
    return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tiered normal-source helpers (Normal/Greater/Perfect orb variants)
// Only includes mods with a tier in [min_tier_level, item_level]
// ─────────────────────────────────────────────────────────────────────────────

ModifierEntry* get_valid_modifiers_with_min_tier(const ItemInstance* item, ModifierSource source, bool is_suffix, int min_tier_level, int* out_count)
{
    *out_count = 0;
    if (!item || !item->base_item) return NULL;

    int table_count = 0;
    ModifierLookup* table = get_lookup_table(item->base_item->id, source, is_suffix, &table_count);
    if (!table || table_count == 0) return NULL;

    ModifierEntry* entries = malloc(sizeof(ModifierEntry) * table_count);
    if (!entries) return NULL;

    int count = 0;
    for (int i = 0; i < table_count; i++)
    {
        const Modifier* mod = get_modifier_by_source_index(source, table[i].index);
        if (!mod) continue;

        uint8_t max_tier = table[i].max_tier_index;
        if (max_tier >= mod->tier_count) max_tier = mod->tier_count - 1;

        // Must have at least one tier in [min_tier_level, item_level]
        bool any_tier_in_window = false;
        for (int t = 0; t <= max_tier; t++) {
            uint16_t lr = mod->tiers[t].level_req;
            if ((int)lr >= min_tier_level && lr <= (uint16_t)item->item_level) {
                any_tier_in_window = true;
                break;
            }
        }
        if (!any_tier_in_window) continue;

        // Not already on the item
        bool already_on_item = false;
        if (!is_suffix) {
            for (int s = 0; s < 3; s++)
                if (item->prefixes[s] == mod) { already_on_item = true; break; }
        } else {
            for (int s = 0; s < 3; s++)
                if (item->suffixes[s] == mod) { already_on_item = true; break; }
        }
        if (already_on_item) continue;

        entries[count].modifier = mod;
        entries[count].lookup   = &table[i];
        count++;
    }

    *out_count = count;
    if (count == 0) { free(entries); return NULL; }
    return entries;
}

ItemInstance** get_all_possible_additions_with_min_tier(const ItemInstance* item, ModifierSource source, bool is_suffix, int min_tier_level, int* out_count)
{
    *out_count = 0;

    int mod_count = 0;
    ModifierEntry* entries = get_valid_modifiers_with_min_tier(item, source, is_suffix, min_tier_level, &mod_count);
    if (!entries || mod_count == 0) return NULL;

    ItemInstance** results = malloc(sizeof(ItemInstance*) * mod_count);
    if (!results) { free(entries); return NULL; }

    int count = 0;
    for (int i = 0; i < mod_count; i++)
    {
        ItemInstance* next = add_modifier_to_item(item, entries[i].modifier, is_suffix);
        if (!next) continue;
        results[count++] = next;
    }

    free(entries);
    *out_count = count;
    if (count == 0) { free(results); return NULL; }
    return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Desecrated helpers: merge SOURCE_NORMAL + SOURCE_DESECRATED into one pool,
// filtered by a minimum tier level_req (0 = Preserved, 40 = Ancient, 64 = Gnawed)
// ─────────────────────────────────────────────────────────────────────────────

ModifierEntry* get_valid_modifiers_desecrated(const ItemInstance* item, bool is_suffix, int min_tier_level, int* out_count)
{
    *out_count = 0;
    if (!item || !item->base_item) return NULL;

    // Fetch both source tables
    int normal_count = 0, desec_count = 0;
    ModifierLookup* normal_table = get_lookup_table(item->base_item->id, SOURCE_NORMAL,     is_suffix, &normal_count);
    ModifierLookup* desec_table  = get_lookup_table(item->base_item->id, SOURCE_DESECRATED, is_suffix, &desec_count);

    int worst_case = normal_count + desec_count;
    if (worst_case == 0) return NULL;

    ModifierEntry* entries = malloc(sizeof(ModifierEntry) * worst_case);
    if (!entries) return NULL;

    int count = 0;

    // Helper lambda equivalent — process one table entry
    // We'll use a small inline block repeated for each source
    ModifierSource sources[2]    = { SOURCE_NORMAL,       SOURCE_DESECRATED };
    ModifierLookup* tables[2]    = { normal_table,        desec_table       };
    int             counts[2]    = { normal_count,        desec_count       };

    for (int s = 0; s < 2; s++)
    {
        if (!tables[s] || counts[s] == 0) continue;

        for (int i = 0; i < counts[s]; i++)
        {
            const Modifier* mod = get_modifier_by_source_index(sources[s], tables[s][i].index);
            if (!mod) continue;

            uint8_t max_tier = tables[s][i].max_tier_index;
            if (max_tier >= mod->tier_count) max_tier = mod->tier_count - 1;

            // Must have at least one tier whose level_req falls within
            // [min_tier_level, item_level] — that is the rollable window.
            // Tiers below min_tier_level are excluded by the orb type (Ancient/Gnawed).
            // Tiers above item_level are excluded because the item isn't high enough level.
            bool any_tier_in_window = false;
            for (int t = 0; t <= max_tier; t++) {
                uint16_t lr = mod->tiers[t].level_req;
                if ((int)lr >= min_tier_level && lr <= (uint16_t)item->item_level) {
                    any_tier_in_window = true;
                    break;
                }
            }
            if (!any_tier_in_window) continue;

            // Not already on the item
            bool already_on_item = false;
            if (!is_suffix) {
                for (int k = 0; k < 3; k++)
                    if (item->prefixes[k] == mod) { already_on_item = true; break; }
            } else {
                for (int k = 0; k < 3; k++)
                    if (item->suffixes[k] == mod) { already_on_item = true; break; }
            }
            if (already_on_item) continue;

            entries[count].modifier = mod;
            entries[count].lookup   = &tables[s][i];
            count++;
        }
    }

    *out_count = count;
    if (count == 0) { free(entries); return NULL; }
    return entries;
}

ItemInstance** get_all_possible_additions_desecrated(const ItemInstance* item, bool is_suffix, int min_tier_level, int* out_count)
{
    *out_count = 0;

    int mod_count = 0;
    ModifierEntry* entries = get_valid_modifiers_desecrated(item, is_suffix, min_tier_level, &mod_count);
    if (!entries || mod_count == 0) return NULL;

    ItemInstance** results = malloc(sizeof(ItemInstance*) * mod_count);
    if (!results) { free(entries); return NULL; }

    int count = 0;
    for (int i = 0; i < mod_count; i++)
    {
        ItemInstance* next = add_modifier_to_item(item, entries[i].modifier, is_suffix);
        if (!next) continue;
        results[count++] = next;
    }

    free(entries);

    *out_count = count;
    if (count == 0) { free(results); return NULL; }
    return results;
}