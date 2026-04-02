#ifndef CURRENCY_H
#define CURRENCY_H

#include "../items/items.h"

// Transmute (Normal -> Magic, 1 mod)
ItemInstance** apply_transmute(const ItemInstance* item, int* out_count);
ItemInstance** apply_transmute_greater(const ItemInstance* item, int* out_count);  // tier >= 55
ItemInstance** apply_transmute_perfect(const ItemInstance* item, int* out_count);  // tier >= 70

// Augmentation (Magic 0-1 mods -> adds 1)
ItemInstance** apply_augmentation(const ItemInstance* item, int* out_count);
ItemInstance** apply_augmentation_greater(const ItemInstance* item, int* out_count); // tier >= 55
ItemInstance** apply_augmentation_perfect(const ItemInstance* item, int* out_count); // tier >= 70

// Regal (Magic -> Rare, adds 1)
ItemInstance** apply_regal(const ItemInstance* item, int* out_count);
ItemInstance** apply_regal_greater(const ItemInstance* item, int* out_count);       // tier >= 35
ItemInstance** apply_regal_perfect(const ItemInstance* item, int* out_count);       // tier >= 50

// Annulment (removes 1 mod, rarity unchanged)
ItemInstance** apply_annulment(const ItemInstance* item, int* out_count);

// Exalt (Rare, adds 1 mod)
ItemInstance** apply_exalt(const ItemInstance* item, int* out_count);
ItemInstance** apply_exalt_greater(const ItemInstance* item, int* out_count);       // tier >= 35
ItemInstance** apply_exalt_perfect(const ItemInstance* item, int* out_count);       // tier >= 50

// Chaos (Rare, remove 1 + add 1)
ItemInstance** apply_chaos(const ItemInstance* item, int* out_count);
ItemInstance** apply_chaos_greater(const ItemInstance* item, int* out_count);       // added tier >= 35
ItemInstance** apply_chaos_perfect(const ItemInstance* item, int* out_count);       // added tier >= 50

// Desecrated (adds 1, NORMAL+DESECRATED pool)
ItemInstance** apply_desecrated_preserved(const ItemInstance* item, int* out_count);
ItemInstance** apply_desecrated_ancient(const ItemInstance* item, int* out_count);  // tier >= 40
ItemInstance** apply_desecrated_gnawed(const ItemInstance* item, int* out_count);   // tier >= 64

#endif // CURRENCY_H