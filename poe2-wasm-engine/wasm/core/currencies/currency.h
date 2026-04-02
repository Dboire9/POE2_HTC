#ifndef CURRENCY_H
#define CURRENCY_H

#include "../items/items.h"

ItemInstance** apply_transmute(const ItemInstance* item, int* out_count);
ItemInstance** apply_augmentation(const ItemInstance* item, int* out_count);
ItemInstance** apply_regal(const ItemInstance* item, int* out_count);
ItemInstance** apply_annulment(const ItemInstance* item, int* out_count);
ItemInstance** apply_exalt(const ItemInstance* item, int* out_count);
ItemInstance** apply_chaos(const ItemInstance* item, int* out_count);
ItemInstance** apply_desecrated_preserved(const ItemInstance* item, int* out_count);
ItemInstance** apply_desecrated_ancient(const ItemInstance* item, int* out_count);
ItemInstance** apply_desecrated_gnawed(const ItemInstance* item, int* out_count);

#endif // CURRENCY_H