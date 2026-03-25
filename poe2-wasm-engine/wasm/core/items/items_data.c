#include "items_data.h"
#include <string.h>

Item ITEMS_DB[41];

void init_items_data(void) {
    // Bows
    ITEMS_DB[0] = (Item){
        .id = 0,
        .item_class = CLASS_WEAPON_BOW,
        .name = "Bows",
    };

    // Crossbows
    ITEMS_DB[1] = (Item){
        .id = 1,
        .item_class = CLASS_WEAPON_CROSSBOW,
        .name = "Crossbows",
    };

    // Quivers
    ITEMS_DB[2] = (Item){
        .id = 2,
        .item_class = CLASS_QUIVER,
        .name = "Quivers",
    };

    // OneHand_Maces
    ITEMS_DB[3] = (Item){
        .id = 3,
        .item_class = CLASS_WEAPON_MACE_1H,
        .name = "OneHand_Maces",
    };

    // Amulets
    ITEMS_DB[4] = (Item){
        .id = 4,
        .item_class = CLASS_AMULET,
        .name = "Amulets",
    };

    // Spears
    ITEMS_DB[5] = (Item){
        .id = 5,
        .item_class = CLASS_WEAPON_SPEAR,
        .name = "Spears",
    };

    // Shields_str_int
    ITEMS_DB[6] = (Item){
        .id = 6,
        .item_class = CLASS_SHIELD,
        .name = "Shields_str_int",
    };

    // Shields_str
    ITEMS_DB[7] = (Item){
        .id = 7,
        .item_class = CLASS_SHIELD,
        .name = "Shields_str",
    };

    // Shields_str_dex
    ITEMS_DB[8] = (Item){
        .id = 8,
        .item_class = CLASS_SHIELD,
        .name = "Shields_str_dex",
    };

    // TwoHand_Maces
    ITEMS_DB[9] = (Item){
        .id = 9,
        .item_class = CLASS_WEAPON_MACE_2H,
        .name = "TwoHand_Maces",
    };

    // Helmets_str_int
    ITEMS_DB[10] = (Item){
        .id = 10,
        .item_class = CLASS_HELMET,
        .name = "Helmets_str_int",
    };

    // Helmets_int
    ITEMS_DB[11] = (Item){
        .id = 11,
        .item_class = CLASS_HELMET,
        .name = "Helmets_int",
    };

    // Helmets_dex_int
    ITEMS_DB[12] = (Item){
        .id = 12,
        .item_class = CLASS_HELMET,
        .name = "Helmets_dex_int",
    };

    // Helmets_str
    ITEMS_DB[13] = (Item){
        .id = 13,
        .item_class = CLASS_HELMET,
        .name = "Helmets_str",
    };

    // Helmets_dex
    ITEMS_DB[14] = (Item){
        .id = 14,
        .item_class = CLASS_HELMET,
        .name = "Helmets_dex",
    };

    // Helmets_str_dex
    ITEMS_DB[15] = (Item){
        .id = 15,
        .item_class = CLASS_HELMET,
        .name = "Helmets_str_dex",
    };

    // Sceptres
    ITEMS_DB[16] = (Item){
        .id = 16,
        .item_class = CLASS_WEAPON_SCEPTRE,
        .name = "Sceptres",
    };

    // Boots_str_int
    ITEMS_DB[17] = (Item){
        .id = 17,
        .item_class = CLASS_BOOTS,
        .name = "Boots_str_int",
    };

    // Boots_str
    ITEMS_DB[18] = (Item){
        .id = 18,
        .item_class = CLASS_BOOTS,
        .name = "Boots_str",
    };

    // Boots_int
    ITEMS_DB[19] = (Item){
        .id = 19,
        .item_class = CLASS_BOOTS,
        .name = "Boots_int",
    };

    // Boots_dex
    ITEMS_DB[20] = (Item){
        .id = 20,
        .item_class = CLASS_BOOTS,
        .name = "Boots_dex",
    };

    // Boots_dex_int
    ITEMS_DB[21] = (Item){
        .id = 21,
        .item_class = CLASS_BOOTS,
        .name = "Boots_dex_int",
    };

    // Boots_str_dex
    ITEMS_DB[22] = (Item){
        .id = 22,
        .item_class = CLASS_BOOTS,
        .name = "Boots_str_dex",
    };

    // Rings
    ITEMS_DB[23] = (Item){
        .id = 23,
        .item_class = CLASS_RING,
        .name = "Rings",
    };

    // Gloves_dex
    ITEMS_DB[24] = (Item){
        .id = 24,
        .item_class = CLASS_GLOVES,
        .name = "Gloves_dex",
    };

    // Gloves_dex_int
    ITEMS_DB[25] = (Item){
        .id = 25,
        .item_class = CLASS_GLOVES,
        .name = "Gloves_dex_int",
    };

    // Gloves_int
    ITEMS_DB[26] = (Item){
        .id = 26,
        .item_class = CLASS_GLOVES,
        .name = "Gloves_int",
    };

    // Gloves_str
    ITEMS_DB[27] = (Item){
        .id = 27,
        .item_class = CLASS_GLOVES,
        .name = "Gloves_str",
    };

    // Gloves_str_int
    ITEMS_DB[28] = (Item){
        .id = 28,
        .item_class = CLASS_GLOVES,
        .name = "Gloves_str_int",
    };

    // Gloves_str_dex
    ITEMS_DB[29] = (Item){
        .id = 29,
        .item_class = CLASS_GLOVES,
        .name = "Gloves_str_dex",
    };

    // Body_Armours_str
    ITEMS_DB[30] = (Item){
        .id = 30,
        .item_class = CLASS_BODY_ARMOUR,
        .name = "Body_Armours_str",
    };

    // Body_Armours_str_int
    ITEMS_DB[31] = (Item){
        .id = 31,
        .item_class = CLASS_BODY_ARMOUR,
        .name = "Body_Armours_str_int",
    };

    // Body_Armours_str_dex
    ITEMS_DB[32] = (Item){
        .id = 32,
        .item_class = CLASS_BODY_ARMOUR,
        .name = "Body_Armours_str_dex",
    };

    // Body_Armours_int
    ITEMS_DB[33] = (Item){
        .id = 33,
        .item_class = CLASS_BODY_ARMOUR,
        .name = "Body_Armours_int",
    };

    // Body_Armours_dex
    ITEMS_DB[34] = (Item){
        .id = 34,
        .item_class = CLASS_BODY_ARMOUR,
        .name = "Body_Armours_dex",
    };

    // Body_Armours_dex_int
    ITEMS_DB[35] = (Item){
        .id = 35,
        .item_class = CLASS_BODY_ARMOUR,
        .name = "Body_Armours_dex_int",
    };

    // Wands
    ITEMS_DB[36] = (Item){
        .id = 36,
        .item_class = CLASS_WEAPON_WAND,
        .name = "Wands",
    };

    // Quarterstaves
    ITEMS_DB[37] = (Item){
        .id = 37,
        .item_class = CLASS_WEAPON_QUARTERSTAFF,
        .name = "Quarterstaves",
    };

    // Foci
    ITEMS_DB[38] = (Item){
        .id = 38,
        .item_class = CLASS_FOCUS,
        .name = "Foci",
    };

    // Bucklers
    ITEMS_DB[39] = (Item){
        .id = 39,
        .item_class = CLASS_BUCKLER,
        .name = "Bucklers",
    };

    // Staves
    ITEMS_DB[40] = (Item){
        .id = 40,
        .item_class = CLASS_WEAPON_STAFF,
        .name = "Staves",
    };
}
