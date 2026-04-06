#ifndef ESSENCE_H
#define ESSENCE_H

#include <stdint.h>
#include <stdbool.h>
#include "../items/items.h"

// Build the essence -> normal modifier mapping table.
// Must be called once after init_modifiers_data().
void init_essence_mapping(void);

// Apply a specific essence to a magic item, upgrading it to rare.
//
// essence_source_index : index into MODIFIERS_ESSENCE[] identifying the mod family
// essence_tier_index   : 0 = Lesser Essence, 1 = Essence, 2 = Greater Essence
//
// The resulting item stores the NORMAL Modifier* + normal tier index directly,
// making it fully transparent to the crafting engine.
// Returns a 1-element array on success, NULL on failure.
ItemInstance** apply_specific_essence(const ItemInstance* item,
                                      uint16_t essence_source_index,
                                      int essence_tier_index,
                                      int* out_count);

// Apply a Perfect Essence to a RARE item.
//
// perfect_source_index : index into MODIFIERS_PERFECT_ESSENCE[]
//
// The perfect essence guarantees one specific mod.  Before adding it the
// currency removes exactly one existing mod to make room, following these rules:
//
//   - If the guaranteed mod is a PREFIX and the item already has 3 prefixes
//     -> only a prefix can be removed  (must free that slot)
//   - If the guaranteed mod is a SUFFIX and the item already has 3 suffixes
//     -> only a suffix can be removed  (must free that slot)
//   - Otherwise (room already exists in the destination slot)
//     -> any mod can be removed  (chaos-like)
//
// Each possible removal yields one outcome, so the returned array has
// (eligible_removals) elements, each with the guaranteed mod already added.
// Returns NULL / out_count=0 on failure.
ItemInstance** apply_perfect_essence(const ItemInstance* item,
                                     uint16_t perfect_source_index,
                                     int* out_count);

#endif // ESSENCE_H