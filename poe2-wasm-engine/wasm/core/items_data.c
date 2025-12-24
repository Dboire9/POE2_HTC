#include "items_data.h"
#include <string.h>

Item ITEMS_DB[41];

void init_items_data(void) {
    // Bows
    ITEMS_DB[0] = (Item){
        .id = 0,
        .item_class = CLASS_WEAPON_BOW,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Bows",
        .tags = 0
    };

    // Crossbows
    ITEMS_DB[1] = (Item){
        .id = 1,
        .item_class = CLASS_WEAPON_BOW,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Crossbows",
        .tags = 0
    };

    // Quivers
    ITEMS_DB[2] = (Item){
        .id = 2,
        .item_class = CLASS_QUIVER,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Quivers",
        .tags = 0
    };

    // OneHand_Maces
    ITEMS_DB[3] = (Item){
        .id = 3,
        .item_class = CLASS_WEAPON_MACE_1H,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "OneHand_Maces",
        .tags = 0
    };

    // Amulets
    ITEMS_DB[4] = (Item){
        .id = 4,
        .item_class = CLASS_AMULET,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Amulets",
        .tags = 0
    };

    // Spears
    ITEMS_DB[5] = (Item){
        .id = 5,
        .item_class = CLASS_WEAPON_SPEAR,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Spears",
        .tags = 0
    };

    // Shields_str_int
    ITEMS_DB[6] = (Item){
        .id = 6,
        .item_class = CLASS_SHIELD,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Shields_str_int",
        .tags = 0
    };

    // Shields_str
    ITEMS_DB[7] = (Item){
        .id = 7,
        .item_class = CLASS_SHIELD,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Shields_str",
        .tags = 0
    };

    // Shields_str_dex
    ITEMS_DB[8] = (Item){
        .id = 8,
        .item_class = CLASS_SHIELD,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Shields_str_dex",
        .tags = 0
    };

    // TwoHand_Maces
    ITEMS_DB[9] = (Item){
        .id = 9,
        .item_class = CLASS_WEAPON_MACE_2H,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "TwoHand_Maces",
        .tags = 0
    };

    // Helmets_str_int
    ITEMS_DB[10] = (Item){
        .id = 10,
        .item_class = CLASS_HELMET,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Helmets_str_int",
        .tags = 0
    };

    // Helmets_int
    ITEMS_DB[11] = (Item){
        .id = 11,
        .item_class = CLASS_HELMET,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Helmets_int",
        .tags = 0
    };

    // Helmets_dex_int
    ITEMS_DB[12] = (Item){
        .id = 12,
        .item_class = CLASS_HELMET,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Helmets_dex_int",
        .tags = 0
    };

    // Helmets_str
    ITEMS_DB[13] = (Item){
        .id = 13,
        .item_class = CLASS_HELMET,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Helmets_str",
        .tags = 0
    };

    // Helmets_dex
    ITEMS_DB[14] = (Item){
        .id = 14,
        .item_class = CLASS_HELMET,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Helmets_dex",
        .tags = 0
    };

    // Helmets_str_dex
    ITEMS_DB[15] = (Item){
        .id = 15,
        .item_class = CLASS_HELMET,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Helmets_str_dex",
        .tags = 0
    };

    // Sceptres
    ITEMS_DB[16] = (Item){
        .id = 16,
        .item_class = CLASS_WEAPON_SCEPTRE,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Sceptres",
        .tags = 0
    };

    // Boots_str_int
    ITEMS_DB[17] = (Item){
        .id = 17,
        .item_class = CLASS_BOOTS,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Boots_str_int",
        .tags = 0
    };

    // Boots_str
    ITEMS_DB[18] = (Item){
        .id = 18,
        .item_class = CLASS_BOOTS,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Boots_str",
        .tags = 0
    };

    // Boots_int
    ITEMS_DB[19] = (Item){
        .id = 19,
        .item_class = CLASS_BOOTS,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Boots_int",
        .tags = 0
    };

    // Boots_dex
    ITEMS_DB[20] = (Item){
        .id = 20,
        .item_class = CLASS_BOOTS,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Boots_dex",
        .tags = 0
    };

    // Boots_dex_int
    ITEMS_DB[21] = (Item){
        .id = 21,
        .item_class = CLASS_BOOTS,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Boots_dex_int",
        .tags = 0
    };

    // Boots_str_dex
    ITEMS_DB[22] = (Item){
        .id = 22,
        .item_class = CLASS_BOOTS,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Boots_str_dex",
        .tags = 0
    };

    // Rings
    ITEMS_DB[23] = (Item){
        .id = 23,
        .item_class = CLASS_RING,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Rings",
        .tags = 0
    };

    // Gloves_dex
    ITEMS_DB[24] = (Item){
        .id = 24,
        .item_class = CLASS_GLOVES,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Gloves_dex",
        .tags = 0
    };

    // Gloves_dex_int
    ITEMS_DB[25] = (Item){
        .id = 25,
        .item_class = CLASS_GLOVES,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Gloves_dex_int",
        .tags = 0
    };

    // Gloves_int
    ITEMS_DB[26] = (Item){
        .id = 26,
        .item_class = CLASS_GLOVES,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Gloves_int",
        .tags = 0
    };

    // Gloves_str
    ITEMS_DB[27] = (Item){
        .id = 27,
        .item_class = CLASS_GLOVES,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Gloves_str",
        .tags = 0
    };

    // Gloves_str_int
    ITEMS_DB[28] = (Item){
        .id = 28,
        .item_class = CLASS_GLOVES,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Gloves_str_int",
        .tags = 0
    };

    // Gloves_str_dex
    ITEMS_DB[29] = (Item){
        .id = 29,
        .item_class = CLASS_GLOVES,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Gloves_str_dex",
        .tags = 0
    };

    // Body_Armours_str
    ITEMS_DB[30] = (Item){
        .id = 30,
        .item_class = CLASS_BODY_ARMOUR,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Body_Armours_str",
        .tags = 0
    };

    // Body_Armours_str_int
    ITEMS_DB[31] = (Item){
        .id = 31,
        .item_class = CLASS_BODY_ARMOUR,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Body_Armours_str_int",
        .tags = 0
    };

    // Body_Armours_str_dex
    ITEMS_DB[32] = (Item){
        .id = 32,
        .item_class = CLASS_BODY_ARMOUR,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Body_Armours_str_dex",
        .tags = 0
    };

    // Body_Armours_int
    ITEMS_DB[33] = (Item){
        .id = 33,
        .item_class = CLASS_BODY_ARMOUR,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Body_Armours_int",
        .tags = 0
    };

    // Body_Armours_dex
    ITEMS_DB[34] = (Item){
        .id = 34,
        .item_class = CLASS_BODY_ARMOUR,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Body_Armours_dex",
        .tags = 0
    };

    // Body_Armours_dex_int
    ITEMS_DB[35] = (Item){
        .id = 35,
        .item_class = CLASS_BODY_ARMOUR,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Body_Armours_dex_int",
        .tags = 0
    };

    // Wands
    ITEMS_DB[36] = (Item){
        .id = 36,
        .item_class = CLASS_WEAPON_WAND,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Wands",
        .tags = 0
    };

    // Quarterstaves
    ITEMS_DB[37] = (Item){
        .id = 37,
        .item_class = CLASS_WEAPON_QUARTERSTAFF,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Quarterstaves",
        .tags = 0
    };

    // Foci
    ITEMS_DB[38] = (Item){
        .id = 38,
        .item_class = CLASS_FOCUS,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Foci",
        .tags = 0
    };

    // Bucklers
    ITEMS_DB[39] = (Item){
        .id = 39,
        .item_class = CLASS_BUCKLER,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Bucklers",
        .tags = 0
    };

    // Staves
    ITEMS_DB[40] = (Item){
        .id = 40,
        .item_class = CLASS_WEAPON_STAFF,
        .rarity = RARITY_NORMAL,
        .level = 1,
        .item_level = 85,
        .name = "Staves",
        .tags = 0
    };
}
