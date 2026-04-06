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

#endif // ESSENCE_H