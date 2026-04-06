// essence.c
// Essence currencies: Magic item -> Rare, storing the NORMAL Modifier* + normal tier index.
//
// At init time, build a mapping:
//   essence_to_normal[essence_index][essence_tier] -> { normal_mod*, normal_tier_index }
// Matched by: same .name, same .type, same value ranges for each ValueRange slot.
//
// apply_specific_essence then adds the item as if the normal mod was rolled directly,
// making it fully transparent to the rest of the engine (crafting calc, annulment, etc.).

#include <stdlib.h>
#include <string.h>
#include "essence.h"
#include "../items/items.h"
#include "../items/item_mod_lookup.h"
#include "../modifiers/modifiers.h"
#include "../modifiers/modifiers_data.h"
#include "currency.h"

// ── Mapping table ─────────────────────────────────────────────────────────────

typedef struct {
    const Modifier* normal_mod;   // NULL if no match found
    int             normal_tier;  // index into normal_mod->tiers[]
} EssenceNormalMapping;

// [essence_index][essence_tier_index (0/1/2)]
static EssenceNormalMapping essence_map[MODIFIERS_ESSENCE_COUNT][3];
static bool mapping_initialized = false;

// Returns true if the value ranges of two tiers are identical across all slots.
static bool tiers_values_match(const ModifierTierData* a, const ModifierTierData* b)
{
    if (a->value_count != b->value_count) return false;
    for (int v = 0; v < a->value_count; v++) {
        if (a->values[v].min != b->values[v].min) return false;
        if (a->values[v].max != b->values[v].max) return false;
    }
    return true;
}

void init_essence_mapping(void)
{
    if (mapping_initialized) return;
    mapping_initialized = true;

    // Zero-initialise
    memset(essence_map, 0, sizeof(essence_map));

    for (int ei = 0; ei < MODIFIERS_ESSENCE_COUNT; ei++) {
        const Modifier* em = &MODIFIERS_ESSENCE[ei];

        for (int et = 0; et < em->tier_count && et < 3; et++) {
            const ModifierTierData* essence_tier = &em->tiers[et];

            // Search all normal modifiers for same name + type + matching values
            for (int ni = 0; ni < MODIFIERS_NORMAL_COUNT; ni++) {
                const Modifier* nm = &MODIFIERS_NORMAL[ni];
                if (nm->type != em->type) continue;
                if (strcmp(nm->name, em->name) != 0) continue;

                for (int nt = 0; nt < nm->tier_count; nt++) {
                    if (tiers_values_match(essence_tier, &nm->tiers[nt])) {
                        essence_map[ei][et].normal_mod  = nm;
                        essence_map[ei][et].normal_tier = nt;
                        goto next_essence_tier; // found, stop searching
                    }
                }
            }
            // No match found — leave normal_mod = NULL for this slot
            next_essence_tier:;
        }
    }
}

// ── Application ───────────────────────────────────────────────────────────────

// Apply a specific essence identified by (essence_source_index, essence_tier_index).
// On success the item gets the NORMAL Modifier* at the matched normal tier index —
// indistinguishable from a normally crafted item.
// Returns a 1-element array (deterministic), or NULL on failure.
ItemInstance** apply_specific_essence(const ItemInstance* item,
                                      uint16_t essence_source_index,
                                      int essence_tier_index,
                                      int* out_count)
{
    *out_count = 0;
    if (!item || !item->base_item) return NULL;
    if (item->rarity != RARITY_MAGIC) return NULL;
    if (!mapping_initialized) return NULL;

    if (essence_source_index >= MODIFIERS_ESSENCE_COUNT) return NULL;
    if (essence_tier_index < 0 || essence_tier_index > 2) return NULL;

    const EssenceNormalMapping* m = &essence_map[essence_source_index][essence_tier_index];
    if (!m->normal_mod) {
        // No normal equivalent — fall back to storing the essence mod directly
        // (handles edge cases where value ranges differ slightly)
        const Modifier* em = &MODIFIERS_ESSENCE[essence_source_index];
        if (essence_tier_index >= em->tier_count) return NULL;
        uint16_t lr = em->tiers[essence_tier_index].level_req;
        if ((int)lr > item->item_level) return NULL;

        bool is_suffix = (em->type == MOD_SUFFIX);
        int table_count = 0;
        ModifierLookup* table = get_lookup_table(item->base_item->id, SOURCE_ESSENCE, is_suffix, &table_count);
        bool in_table = false;
        for (int i = 0; i < table_count && !in_table; i++)
            if (table[i].index == essence_source_index) in_table = true;
        if (!in_table) return NULL;

        if (!is_suffix && item->prefix_count >= 3) return NULL;
        if ( is_suffix && item->suffix_count >= 3) return NULL;

        ItemInstance* next = copy_item_instance(item);
        if (!next) return NULL;
        next->rarity = RARITY_RARE;
        if (!is_suffix) {
            next->prefixes[next->prefix_count]             = em;
            next->desired_prefix_tiers[next->prefix_count] = essence_tier_index;
            next->prefix_count++;
        } else {
            next->suffixes[next->suffix_count]             = em;
            next->desired_suffix_tiers[next->suffix_count] = essence_tier_index;
            next->suffix_count++;
        }
        ItemInstance** r = malloc(sizeof(ItemInstance*));
        if (!r) { free_item_instance(next); return NULL; }
        r[0] = next; *out_count = 1; return r;
    }

    // We have a normal mod match — verify a few things:
    const Modifier* mod  = m->normal_mod;
    int             ntier = m->normal_tier;
    bool is_suffix = (mod->type == MOD_SUFFIX);

    // Item level must cover the normal tier's level_req
    if ((int)mod->tiers[ntier].level_req > item->item_level) return NULL;

    // The essence must appear in this item type's essence table
    int table_count = 0;
    ModifierLookup* table = get_lookup_table(item->base_item->id, SOURCE_ESSENCE, is_suffix, &table_count);
    bool in_table = false;
    for (int i = 0; i < table_count && !in_table; i++)
        if (table[i].index == essence_source_index) in_table = true;
    if (!in_table) return NULL;

    // Free slot check
    if (!is_suffix && item->prefix_count >= 3) return NULL;
    if ( is_suffix && item->suffix_count >= 3) return NULL;

    // Mod must not already be on the item (check by name to catch both sources)
    if (!is_suffix) {
        for (int s = 0; s < item->prefix_count; s++)
            if (item->prefixes[s] == mod) return NULL;
    } else {
        for (int s = 0; s < item->suffix_count; s++)
            if (item->suffixes[s] == mod) return NULL;
    }

    // Build the single deterministic outcome with the NORMAL modifier
    ItemInstance* next = copy_item_instance(item);
    if (!next) return NULL;
    next->rarity = RARITY_RARE;
    if (!is_suffix) {
        next->prefixes[next->prefix_count]             = mod;
        next->desired_prefix_tiers[next->prefix_count] = ntier;
        next->prefix_count++;
    } else {
        next->suffixes[next->suffix_count]             = mod;
        next->desired_suffix_tiers[next->suffix_count] = ntier;
        next->suffix_count++;
    }

    ItemInstance** results = malloc(sizeof(ItemInstance*));
    if (!results) { free_item_instance(next); return NULL; }
    results[0] = next;
    *out_count = 1;
    return results;
}

// ── Perfect Essence ───────────────────────────────────────────────────────────

// Apply a Perfect Essence to a RARE item.
// See header for the full removal-priority rules.
ItemInstance** apply_perfect_essence(const ItemInstance* item,
                                     uint16_t perfect_source_index,
                                     int* out_count)
{
    *out_count = 0;
    if (!item || !item->base_item) return NULL;
    if (item->rarity != RARITY_RARE) return NULL;
    if (perfect_source_index >= MODIFIERS_PERFECT_ESSENCE_COUNT) return NULL;

    const Modifier* mod = &MODIFIERS_PERFECT_ESSENCE[perfect_source_index];
    bool is_suffix = (mod->type == MOD_SUFFIX);

    // Item level must satisfy the mod's (single) tier requirement
    if ((int)mod->tiers[0].level_req > item->item_level) return NULL;

    // Verify the mod is valid for this item type via the shared essence lookup table.
    // Perfect essence entries are stored inside the SOURCE_ESSENCE tables (mixed),
    // so we query SOURCE_ESSENCE and filter for SOURCE_PERFECT_ESSENCE entries.
    int table_count = 0;
    ModifierLookup* table = get_lookup_table(item->base_item->id,
                                             SOURCE_ESSENCE,
                                             is_suffix,
                                             &table_count);
    bool in_table = false;
    for (int i = 0; i < table_count && !in_table; i++)
        if (table[i].source == SOURCE_PERFECT_ESSENCE &&
            table[i].index  == perfect_source_index) in_table = true;
    if (!in_table) return NULL;

    // Determine which pool(s) are eligible for removal:
    //   full destination slot  -> must remove from that slot only
    //   destination has room   -> any mod is eligible (chaos-like)
    bool dest_prefix_full = (!is_suffix && item->prefix_count >= 3);
    bool dest_suffix_full = ( is_suffix && item->suffix_count >= 3);

    bool remove_from_prefix, remove_from_suffix;
    if (dest_prefix_full) {
        // Guaranteed mod is a prefix and all 3 prefix slots are taken
        remove_from_prefix = true;
        remove_from_suffix = false;
    } else if (dest_suffix_full) {
        // Guaranteed mod is a suffix and all 3 suffix slots are taken
        remove_from_prefix = false;
        remove_from_suffix = true;
    } else {
        // Room exists -> chaos-like, any mod can be removed
        remove_from_prefix = (item->prefix_count > 0);
        remove_from_suffix = (item->suffix_count > 0);
    }

    int eligible = 0;
    if (remove_from_prefix) eligible += item->prefix_count;
    if (remove_from_suffix) eligible += item->suffix_count;
    if (eligible == 0) return NULL;

    ItemInstance** results = malloc(sizeof(ItemInstance*) * eligible);
    if (!results) return NULL;

    int idx = 0;

    // Branch: remove each eligible prefix
    if (remove_from_prefix) {
        for (int i = 0; i < item->prefix_count; i++) {
            ItemInstance* next = copy_item_instance(item);
            if (!next) continue;

            // Shift out prefix[i]
            for (int j = i; j < next->prefix_count - 1; j++) {
                next->prefixes[j]             = next->prefixes[j + 1];
                next->desired_prefix_tiers[j] = next->desired_prefix_tiers[j + 1];
            }
            next->prefixes[next->prefix_count - 1]             = NULL;
            next->desired_prefix_tiers[next->prefix_count - 1] = 0;
            next->prefix_count--;

            // Add the guaranteed mod
            if (!is_suffix) {
                next->prefixes[next->prefix_count]             = mod;
                next->desired_prefix_tiers[next->prefix_count] = 0; // single tier
                next->prefix_count++;
            } else {
                next->suffixes[next->suffix_count]             = mod;
                next->desired_suffix_tiers[next->suffix_count] = 0;
                next->suffix_count++;
            }

            results[idx++] = next;
        }
    }

    // Branch: remove each eligible suffix
    if (remove_from_suffix) {
        for (int i = 0; i < item->suffix_count; i++) {
            ItemInstance* next = copy_item_instance(item);
            if (!next) continue;

            // Shift out suffix[i]
            for (int j = i; j < next->suffix_count - 1; j++) {
                next->suffixes[j]             = next->suffixes[j + 1];
                next->desired_suffix_tiers[j] = next->desired_suffix_tiers[j + 1];
            }
            next->suffixes[next->suffix_count - 1]             = NULL;
            next->desired_suffix_tiers[next->suffix_count - 1] = 0;
            next->suffix_count--;

            // Add the guaranteed mod
            if (!is_suffix) {
                next->prefixes[next->prefix_count]             = mod;
                next->desired_prefix_tiers[next->prefix_count] = 0;
                next->prefix_count++;
            } else {
                next->suffixes[next->suffix_count]             = mod;
                next->desired_suffix_tiers[next->suffix_count] = 0;
                next->suffix_count++;
            }

            results[idx++] = next;
        }
    }

    *out_count = idx;
    return results;
}
