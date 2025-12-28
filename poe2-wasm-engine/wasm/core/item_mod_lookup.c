#include "item_mod_lookup.h"

// Lookup tables: item -> (source, per-source index, max_tier) tuples
// max_tier_index limits which tiers can roll (0-based, 255 = no limit)

// Bows - normal_prefixes
ModifierLookup bows_normal_prefixes[8] = {
    {SOURCE_NORMAL, 96, 9},
    {SOURCE_NORMAL, 97, 7},
    {SOURCE_NORMAL, 98, 7},
    {SOURCE_NORMAL, 99, 5},
    {SOURCE_NORMAL, 100, 7},
    {SOURCE_NORMAL, 101, 4},
    {SOURCE_NORMAL, 102, 4},
    {SOURCE_NORMAL, 103, 3}
};

// Bows - normal_suffixes
ModifierLookup bows_normal_suffixes[13] = {
    {SOURCE_NORMAL, 104, 3},
    {SOURCE_NORMAL, 105, 7},
    {SOURCE_NORMAL, 106, 7},
    {SOURCE_NORMAL, 107, 3},
    {SOURCE_NORMAL, 108, 4},
    {SOURCE_NORMAL, 109, 5},
    {SOURCE_NORMAL, 110, 5},
    {SOURCE_NORMAL, 111, 2},
    {SOURCE_NORMAL, 112, 1},
    {SOURCE_NORMAL, 113, 8},
    {SOURCE_NORMAL, 114, 9},
    {SOURCE_NORMAL, 115, 9},
    {SOURCE_NORMAL, 116, 9}
};

// Bows - desecrated_prefixes
ModifierLookup bows_desecrated_prefixes[7] = {
    {SOURCE_DESECRATED, 50, 0},
    {SOURCE_DESECRATED, 51, 0},
    {SOURCE_DESECRATED, 52, 0},
    {SOURCE_DESECRATED, 53, 0},
    {SOURCE_DESECRATED, 54, 0},
    {SOURCE_DESECRATED, 55, 0},
    {SOURCE_DESECRATED, 56, 0}
};

// Bows - desecrated_suffixes
ModifierLookup bows_desecrated_suffixes[8] = {
    {SOURCE_DESECRATED, 57, 0},
    {SOURCE_DESECRATED, 58, 0},
    {SOURCE_DESECRATED, 59, 0},
    {SOURCE_DESECRATED, 60, 0},
    {SOURCE_DESECRATED, 61, 0},
    {SOURCE_DESECRATED, 62, 0},
    {SOURCE_DESECRATED, 63, 0},
    {SOURCE_DESECRATED, 58, 0}
};

// Bows - essence_prefixes
ModifierLookup bows_essence_prefixes[9] = {
    {SOURCE_ESSENCE, 36, 2},
    {SOURCE_ESSENCE, 37, 2},
    {SOURCE_ESSENCE, 38, 2},
    {SOURCE_ESSENCE, 39, 2},
    {SOURCE_ESSENCE, 40, 2},
    {SOURCE_PERFECT_ESSENCE, 20, 0},
    {SOURCE_PERFECT_ESSENCE, 21, 0},
    {SOURCE_PERFECT_ESSENCE, 22, 0},
    {SOURCE_PERFECT_ESSENCE, 23, 0}
};

// Bows - essence_suffixes
ModifierLookup bows_essence_suffixes[7] = {
    {SOURCE_ESSENCE, 41, 2},
    {SOURCE_ESSENCE, 42, 2},
    {SOURCE_ESSENCE, 43, 2},
    {SOURCE_ESSENCE, 44, 2},
    {SOURCE_PERFECT_ESSENCE, 24, 0},
    {SOURCE_PERFECT_ESSENCE, 25, 0},
    {SOURCE_ESSENCE, 45, 2}
};

// Crossbows - normal_prefixes
ModifierLookup crossbows_normal_prefixes[8] = {
    {SOURCE_NORMAL, 74, 9},
    {SOURCE_NORMAL, 75, 9},
    {SOURCE_NORMAL, 76, 7},
    {SOURCE_NORMAL, 77, 7},
    {SOURCE_NORMAL, 78, 5},
    {SOURCE_NORMAL, 79, 7},
    {SOURCE_NORMAL, 80, 7},
    {SOURCE_NORMAL, 81, 4}
};

// Crossbows - normal_suffixes
ModifierLookup crossbows_normal_suffixes[14] = {
    {SOURCE_NORMAL, 82, 4},
    {SOURCE_NORMAL, 83, 3},
    {SOURCE_NORMAL, 84, 3},
    {SOURCE_NORMAL, 85, 7},
    {SOURCE_NORMAL, 86, 7},
    {SOURCE_NORMAL, 87, 3},
    {SOURCE_NORMAL, 88, 4},
    {SOURCE_NORMAL, 89, 5},
    {SOURCE_NORMAL, 90, 5},
    {SOURCE_NORMAL, 91, 2},
    {SOURCE_NORMAL, 92, 1},
    {SOURCE_NORMAL, 93, 8},
    {SOURCE_NORMAL, 94, 9},
    {SOURCE_NORMAL, 95, 9}
};

// Crossbows - desecrated_prefixes
ModifierLookup crossbows_desecrated_prefixes[6] = {
    {SOURCE_DESECRATED, 37, 0},
    {SOURCE_DESECRATED, 38, 0},
    {SOURCE_DESECRATED, 39, 0},
    {SOURCE_DESECRATED, 40, 0},
    {SOURCE_DESECRATED, 42, 0},
    {SOURCE_DESECRATED, 41, 0}
};

// Crossbows - desecrated_suffixes
ModifierLookup crossbows_desecrated_suffixes[7] = {
    {SOURCE_DESECRATED, 43, 0},
    {SOURCE_DESECRATED, 44, 0},
    {SOURCE_DESECRATED, 45, 0},
    {SOURCE_DESECRATED, 46, 0},
    {SOURCE_DESECRATED, 47, 0},
    {SOURCE_DESECRATED, 48, 0},
    {SOURCE_DESECRATED, 49, 0}
};

// Crossbows - essence_prefixes
ModifierLookup crossbows_essence_prefixes[9] = {
    {SOURCE_ESSENCE, 26, 2},
    {SOURCE_ESSENCE, 27, 2},
    {SOURCE_ESSENCE, 28, 2},
    {SOURCE_ESSENCE, 29, 2},
    {SOURCE_ESSENCE, 30, 2},
    {SOURCE_PERFECT_ESSENCE, 14, 0},
    {SOURCE_PERFECT_ESSENCE, 15, 0},
    {SOURCE_PERFECT_ESSENCE, 16, 0},
    {SOURCE_PERFECT_ESSENCE, 17, 0}
};

// Crossbows - essence_suffixes
ModifierLookup crossbows_essence_suffixes[7] = {
    {SOURCE_ESSENCE, 31, 2},
    {SOURCE_ESSENCE, 32, 2},
    {SOURCE_ESSENCE, 33, 2},
    {SOURCE_ESSENCE, 34, 2},
    {SOURCE_PERFECT_ESSENCE, 18, 0},
    {SOURCE_PERFECT_ESSENCE, 19, 0},
    {SOURCE_ESSENCE, 35, 2}
};

// Quivers - normal_prefixes
ModifierLookup quivers_normal_prefixes[7] = {
    {SOURCE_NORMAL, 302, 5},
    {SOURCE_NORMAL, 303, 7},
    {SOURCE_NORMAL, 304, 1},
    {SOURCE_NORMAL, 305, 5},
    {SOURCE_NORMAL, 306, 5},
    {SOURCE_NORMAL, 307, 3},
    {SOURCE_NORMAL, 308, 5}
};

// Quivers - normal_suffixes
ModifierLookup quivers_normal_suffixes[8] = {
    {SOURCE_NORMAL, 309, 5},
    {SOURCE_NORMAL, 310, 4},
    {SOURCE_NORMAL, 311, 8},
    {SOURCE_NORMAL, 312, 8},
    {SOURCE_NORMAL, 313, 6},
    {SOURCE_NORMAL, 314, 6},
    {SOURCE_NORMAL, 315, 6},
    {SOURCE_NORMAL, 316, 6}
};

// Quivers - desecrated_prefixes
ModifierLookup quivers_desecrated_prefixes[1] = {
    {SOURCE_DESECRATED, 176, 0}
};

// Quivers - desecrated_suffixes
ModifierLookup quivers_desecrated_suffixes[3] = {
    {SOURCE_DESECRATED, 177, 0},
    {SOURCE_DESECRATED, 178, 0},
    {SOURCE_DESECRATED, 179, 0}
};

// Quivers - essence_prefixes
ModifierLookup quivers_essence_prefixes[2] = {
    {SOURCE_ESSENCE, 126, 2},
    {SOURCE_PERFECT_ESSENCE, 47, 0}
};

// Quivers - essence_suffixes
ModifierLookup quivers_essence_suffixes[1] = {
    {SOURCE_ESSENCE, 128, 2}
};

// OneHand_Maces - normal_prefixes
ModifierLookup onehand_maces_normal_prefixes[8] = {
    {SOURCE_NORMAL, 117, 7},
    {SOURCE_NORMAL, 118, 7},
    {SOURCE_NORMAL, 119, 5},
    {SOURCE_NORMAL, 120, 7},
    {SOURCE_NORMAL, 121, 4},
    {SOURCE_NORMAL, 122, 4},
    {SOURCE_NORMAL, 123, 4},
    {SOURCE_NORMAL, 124, 4}
};

// OneHand_Maces - normal_suffixes
ModifierLookup onehand_maces_normal_suffixes[14] = {
    {SOURCE_NORMAL, 125, 7},
    {SOURCE_NORMAL, 126, 7},
    {SOURCE_NORMAL, 127, 3},
    {SOURCE_NORMAL, 128, 7},
    {SOURCE_NORMAL, 129, 5},
    {SOURCE_NORMAL, 130, 5},
    {SOURCE_NORMAL, 131, 2},
    {SOURCE_NORMAL, 132, 5},
    {SOURCE_NORMAL, 133, 5},
    {SOURCE_NORMAL, 134, 10},
    {SOURCE_NORMAL, 135, 8},
    {SOURCE_NORMAL, 136, 8},
    {SOURCE_NORMAL, 137, 8},
    {SOURCE_NORMAL, 138, 8}
};

// OneHand_Maces - desecrated_prefixes
ModifierLookup onehand_maces_desecrated_prefixes[8] = {
    {SOURCE_DESECRATED, 65, 0},
    {SOURCE_DESECRATED, 66, 0},
    {SOURCE_DESECRATED, 67, 0},
    {SOURCE_DESECRATED, 68, 0},
    {SOURCE_DESECRATED, 69, 0},
    {SOURCE_DESECRATED, 70, 0},
    {SOURCE_DESECRATED, 71, 0},
    {SOURCE_DESECRATED, 72, 0}
};

// OneHand_Maces - desecrated_suffixes
ModifierLookup onehand_maces_desecrated_suffixes[8] = {
    {SOURCE_DESECRATED, 73, 0},
    {SOURCE_DESECRATED, 74, 0},
    {SOURCE_DESECRATED, 75, 0},
    {SOURCE_DESECRATED, 76, 0},
    {SOURCE_DESECRATED, 77, 0},
    {SOURCE_DESECRATED, 78, 0},
    {SOURCE_DESECRATED, 79, 0},
    {SOURCE_DESECRATED, 80, 0}
};

// OneHand_Maces - essence_prefixes
ModifierLookup onehand_maces_essence_prefixes[9] = {
    {SOURCE_ESSENCE, 46, 2},
    {SOURCE_ESSENCE, 47, 2},
    {SOURCE_ESSENCE, 48, 2},
    {SOURCE_ESSENCE, 49, 2},
    {SOURCE_ESSENCE, 50, 2},
    {SOURCE_PERFECT_ESSENCE, 26, 0},
    {SOURCE_PERFECT_ESSENCE, 27, 0},
    {SOURCE_PERFECT_ESSENCE, 28, 0},
    {SOURCE_PERFECT_ESSENCE, 29, 0}
};

// OneHand_Maces - essence_suffixes
ModifierLookup onehand_maces_essence_suffixes[7] = {
    {SOURCE_ESSENCE, 51, 2},
    {SOURCE_ESSENCE, 52, 2},
    {SOURCE_ESSENCE, 53, 2},
    {SOURCE_ESSENCE, 54, 2},
    {SOURCE_PERFECT_ESSENCE, 30, 0},
    {SOURCE_PERFECT_ESSENCE, 31, 0},
    {SOURCE_ESSENCE, 55, 2}
};

// Amulets - normal_prefixes
ModifierLookup amulets_normal_prefixes[10] = {
    {SOURCE_NORMAL, 604, 7},
    {SOURCE_NORMAL, 605, 4},
    {SOURCE_NORMAL, 606, 4},
    {SOURCE_NORMAL, 607, 5},
    {SOURCE_NORMAL, 608, 7},
    {SOURCE_NORMAL, 609, 7},
    {SOURCE_NORMAL, 610, 7},
    {SOURCE_NORMAL, 611, 8},
    {SOURCE_NORMAL, 612, 7},
    {SOURCE_NORMAL, 613, 7}
};

// Amulets - normal_suffixes
ModifierLookup amulets_normal_suffixes[21] = {
    {SOURCE_NORMAL, 614, 7},
    {SOURCE_NORMAL, 615, 5},
    {SOURCE_NORMAL, 616, 5},
    {SOURCE_NORMAL, 617, 2},
    {SOURCE_NORMAL, 618, 2},
    {SOURCE_NORMAL, 619, 2},
    {SOURCE_NORMAL, 620, 2},
    {SOURCE_NORMAL, 621, 9},
    {SOURCE_NORMAL, 622, 5},
    {SOURCE_NORMAL, 623, 4},
    {SOURCE_NORMAL, 624, 5},
    {SOURCE_NORMAL, 625, 5},
    {SOURCE_NORMAL, 626, 4},
    {SOURCE_NORMAL, 627, 4},
    {SOURCE_NORMAL, 628, 4},
    {SOURCE_NORMAL, 629, 4},
    {SOURCE_NORMAL, 630, 5},
    {SOURCE_NORMAL, 631, 5},
    {SOURCE_NORMAL, 632, 4},
    {SOURCE_NORMAL, 633, 4},
    {SOURCE_NORMAL, 634, 4}
};

// Amulets - desecrated_prefixes
ModifierLookup amulets_desecrated_prefixes[11] = {
    {SOURCE_DESECRATED, 328, 0},
    {SOURCE_DESECRATED, 329, 0},
    {SOURCE_DESECRATED, 330, 0},
    {SOURCE_DESECRATED, 331, 0},
    {SOURCE_DESECRATED, 332, 0},
    {SOURCE_DESECRATED, 333, 0},
    {SOURCE_DESECRATED, 334, 0},
    {SOURCE_DESECRATED, 335, 0},
    {SOURCE_DESECRATED, 336, 0},
    {SOURCE_DESECRATED, 337, 0},
    {SOURCE_DESECRATED, 338, 0}
};

// Amulets - desecrated_suffixes
ModifierLookup amulets_desecrated_suffixes[19] = {
    {SOURCE_DESECRATED, 339, 0},
    {SOURCE_DESECRATED, 340, 0},
    {SOURCE_DESECRATED, 341, 0},
    {SOURCE_DESECRATED, 342, 0},
    {SOURCE_DESECRATED, 343, 0},
    {SOURCE_DESECRATED, 344, 0},
    {SOURCE_DESECRATED, 345, 0},
    {SOURCE_DESECRATED, 346, 0},
    {SOURCE_DESECRATED, 347, 0},
    {SOURCE_DESECRATED, 348, 0},
    {SOURCE_DESECRATED, 349, 0},
    {SOURCE_DESECRATED, 351, 0},
    {SOURCE_DESECRATED, 352, 0},
    {SOURCE_DESECRATED, 353, 0},
    {SOURCE_DESECRATED, 354, 0},
    {SOURCE_DESECRATED, 355, 0},
    {SOURCE_DESECRATED, 356, 0},
    {SOURCE_DESECRATED, 357, 0},
    {SOURCE_DESECRATED, 358, 0}
};

// Amulets - essence_prefixes
ModifierLookup amulets_essence_prefixes[3] = {
    {SOURCE_ESSENCE, 254, 2},
    {SOURCE_ESSENCE, 255, 2},
    {SOURCE_PERFECT_ESSENCE, 74, 0}
};

// Amulets - essence_suffixes
ModifierLookup amulets_essence_suffixes[12] = {
    {SOURCE_ESSENCE, 256, 2},
    {SOURCE_ESSENCE, 257, 2},
    {SOURCE_ESSENCE, 258, 2},
    {SOURCE_ESSENCE, 259, 2},
    {SOURCE_PERFECT_ESSENCE, 75, 0},
    {SOURCE_PERFECT_ESSENCE, 76, 0},
    {SOURCE_PERFECT_ESSENCE, 77, 0},
    {SOURCE_PERFECT_ESSENCE, 78, 0},
    {SOURCE_ESSENCE, 260, 2},
    {SOURCE_ESSENCE, 261, 2},
    {SOURCE_ESSENCE, 262, 2},
    {SOURCE_ESSENCE, 263, 2}
};

// Spears - normal_prefixes
ModifierLookup spears_normal_prefixes[8] = {
    {SOURCE_NORMAL, 160, 7},
    {SOURCE_NORMAL, 161, 5},
    {SOURCE_NORMAL, 162, 7},
    {SOURCE_NORMAL, 163, 7},
    {SOURCE_NORMAL, 164, 4},
    {SOURCE_NORMAL, 165, 4},
    {SOURCE_NORMAL, 166, 4},
    {SOURCE_NORMAL, 167, 4}
};

// Spears - normal_suffixes
ModifierLookup spears_normal_suffixes[16] = {
    {SOURCE_NORMAL, 168, 4},
    {SOURCE_NORMAL, 169, 7},
    {SOURCE_NORMAL, 170, 7},
    {SOURCE_NORMAL, 171, 3},
    {SOURCE_NORMAL, 172, 7},
    {SOURCE_NORMAL, 173, 5},
    {SOURCE_NORMAL, 174, 5},
    {SOURCE_NORMAL, 175, 2},
    {SOURCE_NORMAL, 176, 5},
    {SOURCE_NORMAL, 177, 5},
    {SOURCE_NORMAL, 178, 10},
    {SOURCE_NORMAL, 179, 7},
    {SOURCE_NORMAL, 180, 6},
    {SOURCE_NORMAL, 181, 7},
    {SOURCE_NORMAL, 182, 7},
    {SOURCE_NORMAL, 183, 7}
};

// Spears - desecrated_prefixes
ModifierLookup spears_desecrated_prefixes[6] = {
    {SOURCE_DESECRATED, 81, 0},
    {SOURCE_DESECRATED, 82, 0},
    {SOURCE_DESECRATED, 83, 0},
    {SOURCE_DESECRATED, 84, 0},
    {SOURCE_DESECRATED, 86, 0},
    {SOURCE_DESECRATED, 87, 0}
};

// Spears - desecrated_suffixes
ModifierLookup spears_desecrated_suffixes[8] = {
    {SOURCE_DESECRATED, 88, 0},
    {SOURCE_DESECRATED, 89, 0},
    {SOURCE_DESECRATED, 90, 0},
    {SOURCE_DESECRATED, 91, 0},
    {SOURCE_DESECRATED, 92, 0},
    {SOURCE_DESECRATED, 93, 0},
    {SOURCE_DESECRATED, 94, 0},
    {SOURCE_DESECRATED, 89, 0}
};

// Spears - essence_prefixes
ModifierLookup spears_essence_prefixes[9] = {
    {SOURCE_ESSENCE, 60, 2},
    {SOURCE_ESSENCE, 61, 2},
    {SOURCE_ESSENCE, 62, 2},
    {SOURCE_ESSENCE, 63, 2},
    {SOURCE_ESSENCE, 64, 2},
    {SOURCE_PERFECT_ESSENCE, 33, 0},
    {SOURCE_PERFECT_ESSENCE, 34, 0},
    {SOURCE_PERFECT_ESSENCE, 35, 0},
    {SOURCE_PERFECT_ESSENCE, 36, 0}
};

// Spears - essence_suffixes
ModifierLookup spears_essence_suffixes[7] = {
    {SOURCE_ESSENCE, 65, 2},
    {SOURCE_ESSENCE, 66, 2},
    {SOURCE_ESSENCE, 67, 2},
    {SOURCE_ESSENCE, 68, 2},
    {SOURCE_PERFECT_ESSENCE, 37, 0},
    {SOURCE_PERFECT_ESSENCE, 38, 0},
    {SOURCE_ESSENCE, 69, 2}
};

// Shields_str_int - normal_prefixes
ModifierLookup shields_str_int_normal_prefixes[6] = {
    {SOURCE_NORMAL, 233, 5},
    {SOURCE_NORMAL, 235, 2},
    {SOURCE_NORMAL, 237, 7},
    {SOURCE_NORMAL, 239, 7},
    {SOURCE_NORMAL, 240, 7},
    {SOURCE_NORMAL, 241, 7}
};

// Shields_str_int - normal_suffixes
ModifierLookup shields_str_int_normal_suffixes[16] = {
    {SOURCE_NORMAL, 242, 5},
    {SOURCE_NORMAL, 244, 9},
    {SOURCE_NORMAL, 245, 4},
    {SOURCE_NORMAL, 246, 2},
    {SOURCE_NORMAL, 247, 2},
    {SOURCE_NORMAL, 248, 2},
    {SOURCE_NORMAL, 249, 2},
    {SOURCE_NORMAL, 250, 1},
    {SOURCE_NORMAL, 251, 5},
    {SOURCE_NORMAL, 252, 5},
    {SOURCE_NORMAL, 253, 5},
    {SOURCE_NORMAL, 254, 10},
    {SOURCE_NORMAL, 255, 9},
    {SOURCE_NORMAL, 256, 6},
    {SOURCE_NORMAL, 259, 7},
    {SOURCE_NORMAL, 257, 5}
};

// Shields_str_int - desecrated_suffixes
ModifierLookup shields_str_int_desecrated_suffixes[19] = {
    {SOURCE_DESECRATED, 128, 0},
    {SOURCE_DESECRATED, 129, 0},
    {SOURCE_DESECRATED, 130, 0},
    {SOURCE_DESECRATED, 131, 0},
    {SOURCE_DESECRATED, 132, 0},
    {SOURCE_DESECRATED, 133, 0},
    {SOURCE_DESECRATED, 134, 0},
    {SOURCE_DESECRATED, 135, 0},
    {SOURCE_DESECRATED, 136, 0},
    {SOURCE_DESECRATED, 137, 0},
    {SOURCE_DESECRATED, 138, 0},
    {SOURCE_DESECRATED, 139, 0},
    {SOURCE_DESECRATED, 140, 0},
    {SOURCE_DESECRATED, 141, 0},
    {SOURCE_DESECRATED, 142, 0},
    {SOURCE_DESECRATED, 143, 0},
    {SOURCE_DESECRATED, 144, 0},
    {SOURCE_DESECRATED, 145, 0},
    {SOURCE_DESECRATED, 146, 0}
};

// Shields_str_int - essence_prefixes
ModifierLookup shields_str_int_essence_prefixes[3] = {
    {SOURCE_ESSENCE, 87, 2},
    {SOURCE_ESSENCE, 92, 2},
    {SOURCE_PERFECT_ESSENCE, 42, 0}
};

// Shields_str_int - essence_suffixes
ModifierLookup shields_str_int_essence_suffixes[6] = {
    {SOURCE_ESSENCE, 94, 2},
    {SOURCE_ESSENCE, 95, 2},
    {SOURCE_ESSENCE, 97, 2},
    {SOURCE_ESSENCE, 98, 2},
    {SOURCE_ESSENCE, 99, 2},
    {SOURCE_ESSENCE, 100, 2}
};

// Shields_str - normal_prefixes
ModifierLookup shields_str_normal_prefixes[6] = {
    {SOURCE_NORMAL, 213, 7},
    {SOURCE_NORMAL, 214, 7},
    {SOURCE_NORMAL, 215, 7},
    {SOURCE_NORMAL, 216, 7},
    {SOURCE_NORMAL, 217, 5},
    {SOURCE_NORMAL, 218, 4}
};

// Shields_str - normal_suffixes
ModifierLookup shields_str_normal_suffixes[14] = {
    {SOURCE_NORMAL, 219, 9},
    {SOURCE_NORMAL, 220, 4},
    {SOURCE_NORMAL, 221, 2},
    {SOURCE_NORMAL, 222, 2},
    {SOURCE_NORMAL, 223, 2},
    {SOURCE_NORMAL, 224, 2},
    {SOURCE_NORMAL, 225, 1},
    {SOURCE_NORMAL, 226, 5},
    {SOURCE_NORMAL, 227, 10},
    {SOURCE_NORMAL, 228, 6},
    {SOURCE_NORMAL, 229, 7},
    {SOURCE_NORMAL, 230, 7},
    {SOURCE_NORMAL, 231, 7},
    {SOURCE_NORMAL, 232, 5}
};

// Shields_str - desecrated_suffixes
ModifierLookup shields_str_desecrated_suffixes[19] = {
    {SOURCE_DESECRATED, 109, 0},
    {SOURCE_DESECRATED, 110, 0},
    {SOURCE_DESECRATED, 111, 0},
    {SOURCE_DESECRATED, 112, 0},
    {SOURCE_DESECRATED, 113, 0},
    {SOURCE_DESECRATED, 114, 0},
    {SOURCE_DESECRATED, 115, 0},
    {SOURCE_DESECRATED, 116, 0},
    {SOURCE_DESECRATED, 117, 0},
    {SOURCE_DESECRATED, 118, 0},
    {SOURCE_DESECRATED, 119, 0},
    {SOURCE_DESECRATED, 120, 0},
    {SOURCE_DESECRATED, 121, 0},
    {SOURCE_DESECRATED, 122, 0},
    {SOURCE_DESECRATED, 123, 0},
    {SOURCE_DESECRATED, 124, 0},
    {SOURCE_DESECRATED, 125, 0},
    {SOURCE_DESECRATED, 126, 0},
    {SOURCE_DESECRATED, 127, 0}
};

// Shields_str - essence_prefixes
ModifierLookup shields_str_essence_prefixes[3] = {
    {SOURCE_ESSENCE, 76, 2},
    {SOURCE_ESSENCE, 77, 2},
    {SOURCE_PERFECT_ESSENCE, 41, 0}
};

// Shields_str - essence_suffixes
ModifierLookup shields_str_essence_suffixes[5] = {
    {SOURCE_ESSENCE, 80, 2},
    {SOURCE_ESSENCE, 81, 2},
    {SOURCE_ESSENCE, 84, 2},
    {SOURCE_ESSENCE, 85, 2},
    {SOURCE_ESSENCE, 86, 2}
};

// Shields_str_dex - normal_prefixes
ModifierLookup shields_str_dex_normal_prefixes[6] = {
    {SOURCE_NORMAL, 233, 5},
    {SOURCE_NORMAL, 234, 6},
    {SOURCE_NORMAL, 236, 7},
    {SOURCE_NORMAL, 238, 7},
    {SOURCE_NORMAL, 240, 7},
    {SOURCE_NORMAL, 241, 7}
};

// Shields_str_dex - normal_suffixes
ModifierLookup shields_str_dex_normal_suffixes[15] = {
    {SOURCE_NORMAL, 242, 5},
    {SOURCE_NORMAL, 243, 4},
    {SOURCE_NORMAL, 245, 4},
    {SOURCE_NORMAL, 246, 2},
    {SOURCE_NORMAL, 247, 2},
    {SOURCE_NORMAL, 248, 2},
    {SOURCE_NORMAL, 249, 2},
    {SOURCE_NORMAL, 250, 1},
    {SOURCE_NORMAL, 251, 5},
    {SOURCE_NORMAL, 252, 5},
    {SOURCE_NORMAL, 253, 5},
    {SOURCE_NORMAL, 254, 10},
    {SOURCE_NORMAL, 255, 9},
    {SOURCE_NORMAL, 256, 6},
    {SOURCE_NORMAL, 257, 5}
};

// Shields_str_dex - desecrated_suffixes
ModifierLookup shields_str_dex_desecrated_suffixes[19] = {
    {SOURCE_DESECRATED, 128, 0},
    {SOURCE_DESECRATED, 129, 0},
    {SOURCE_DESECRATED, 130, 0},
    {SOURCE_DESECRATED, 131, 0},
    {SOURCE_DESECRATED, 132, 0},
    {SOURCE_DESECRATED, 133, 0},
    {SOURCE_DESECRATED, 134, 0},
    {SOURCE_DESECRATED, 135, 0},
    {SOURCE_DESECRATED, 136, 0},
    {SOURCE_DESECRATED, 137, 0},
    {SOURCE_DESECRATED, 138, 0},
    {SOURCE_DESECRATED, 139, 0},
    {SOURCE_DESECRATED, 140, 0},
    {SOURCE_DESECRATED, 141, 0},
    {SOURCE_DESECRATED, 142, 0},
    {SOURCE_DESECRATED, 143, 0},
    {SOURCE_DESECRATED, 144, 0},
    {SOURCE_DESECRATED, 145, 0},
    {SOURCE_DESECRATED, 146, 0}
};

// Shields_str_dex - essence_prefixes
ModifierLookup shields_str_dex_essence_prefixes[3] = {
    {SOURCE_ESSENCE, 87, 2},
    {SOURCE_ESSENCE, 91, 2},
    {SOURCE_PERFECT_ESSENCE, 42, 0}
};

// Shields_str_dex - essence_suffixes
ModifierLookup shields_str_dex_essence_suffixes[6] = {
    {SOURCE_ESSENCE, 94, 2},
    {SOURCE_ESSENCE, 95, 2},
    {SOURCE_ESSENCE, 96, 2},
    {SOURCE_ESSENCE, 98, 2},
    {SOURCE_ESSENCE, 99, 2},
    {SOURCE_ESSENCE, 100, 2}
};

// TwoHand_Maces - normal_prefixes
ModifierLookup twohand_maces_normal_prefixes[8] = {
    {SOURCE_NORMAL, 0, 8},
    {SOURCE_NORMAL, 1, 9},
    {SOURCE_NORMAL, 2, 9},
    {SOURCE_NORMAL, 3, 9},
    {SOURCE_NORMAL, 4, 7},
    {SOURCE_NORMAL, 5, 7},
    {SOURCE_NORMAL, 6, 5},
    {SOURCE_NORMAL, 7, 7}
};

// TwoHand_Maces - normal_suffixes
ModifierLookup twohand_maces_normal_suffixes[14] = {
    {SOURCE_NORMAL, 8, 4},
    {SOURCE_NORMAL, 9, 4},
    {SOURCE_NORMAL, 10, 4},
    {SOURCE_NORMAL, 11, 4},
    {SOURCE_NORMAL, 12, 7},
    {SOURCE_NORMAL, 13, 7},
    {SOURCE_NORMAL, 14, 3},
    {SOURCE_NORMAL, 15, 7},
    {SOURCE_NORMAL, 16, 5},
    {SOURCE_NORMAL, 17, 5},
    {SOURCE_NORMAL, 18, 2},
    {SOURCE_NORMAL, 19, 5},
    {SOURCE_NORMAL, 20, 5},
    {SOURCE_NORMAL, 21, 8}
};

// TwoHand_Maces - desecrated_prefixes
ModifierLookup twohand_maces_desecrated_prefixes[8] = {
    {SOURCE_DESECRATED, 0, 0},
    {SOURCE_DESECRATED, 1, 0},
    {SOURCE_DESECRATED, 2, 0},
    {SOURCE_DESECRATED, 3, 0},
    {SOURCE_DESECRATED, 4, 0},
    {SOURCE_DESECRATED, 5, 0},
    {SOURCE_DESECRATED, 6, 0},
    {SOURCE_DESECRATED, 7, 0}
};

// TwoHand_Maces - desecrated_suffixes
ModifierLookup twohand_maces_desecrated_suffixes[8] = {
    {SOURCE_DESECRATED, 8, 0},
    {SOURCE_DESECRATED, 9, 0},
    {SOURCE_DESECRATED, 10, 0},
    {SOURCE_DESECRATED, 11, 0},
    {SOURCE_DESECRATED, 12, 0},
    {SOURCE_DESECRATED, 13, 0},
    {SOURCE_DESECRATED, 14, 0},
    {SOURCE_DESECRATED, 15, 0}
};

// TwoHand_Maces - essence_prefixes
ModifierLookup twohand_maces_essence_prefixes[9] = {
    {SOURCE_ESSENCE, 0, 2},
    {SOURCE_ESSENCE, 1, 2},
    {SOURCE_ESSENCE, 2, 2},
    {SOURCE_ESSENCE, 3, 2},
    {SOURCE_ESSENCE, 4, 2},
    {SOURCE_PERFECT_ESSENCE, 0, 0},
    {SOURCE_PERFECT_ESSENCE, 1, 0},
    {SOURCE_PERFECT_ESSENCE, 2, 0},
    {SOURCE_PERFECT_ESSENCE, 3, 0}
};

// TwoHand_Maces - essence_suffixes
ModifierLookup twohand_maces_essence_suffixes[7] = {
    {SOURCE_ESSENCE, 5, 2},
    {SOURCE_ESSENCE, 6, 2},
    {SOURCE_ESSENCE, 7, 2},
    {SOURCE_ESSENCE, 8, 2},
    {SOURCE_PERFECT_ESSENCE, 4, 0},
    {SOURCE_PERFECT_ESSENCE, 5, 0},
    {SOURCE_ESSENCE, 9, 2}
};

// Helmets_str_int - normal_prefixes
ModifierLookup helmets_str_int_normal_prefixes[8] = {
    {SOURCE_NORMAL, 541, 6},
    {SOURCE_NORMAL, 542, 6},
    {SOURCE_NORMAL, 544, 5},
    {SOURCE_NORMAL, 547, 5},
    {SOURCE_NORMAL, 550, 4},
    {SOURCE_NORMAL, 553, 8},
    {SOURCE_NORMAL, 555, 7},
    {SOURCE_NORMAL, 556, 7}
};

// Helmets_str_int - normal_suffixes
ModifierLookup helmets_str_int_normal_suffixes[14] = {
    {SOURCE_NORMAL, 557, 5},
    {SOURCE_NORMAL, 559, 1},
    {SOURCE_NORMAL, 560, 7},
    {SOURCE_NORMAL, 561, 4},
    {SOURCE_NORMAL, 562, 4},
    {SOURCE_NORMAL, 563, 2},
    {SOURCE_NORMAL, 564, 4},
    {SOURCE_NORMAL, 565, 4},
    {SOURCE_NORMAL, 566, 3},
    {SOURCE_NORMAL, 567, 7},
    {SOURCE_NORMAL, 568, 11},
    {SOURCE_NORMAL, 569, 8},
    {SOURCE_NORMAL, 572, 8},
    {SOURCE_NORMAL, 570, 8}
};

// Helmets_str_int - desecrated_suffixes
ModifierLookup helmets_str_int_desecrated_suffixes[15] = {
    {SOURCE_DESECRATED, 289, 0},
    {SOURCE_DESECRATED, 290, 0},
    {SOURCE_DESECRATED, 291, 0},
    {SOURCE_DESECRATED, 292, 0},
    {SOURCE_DESECRATED, 293, 0},
    {SOURCE_DESECRATED, 294, 0},
    {SOURCE_DESECRATED, 295, 0},
    {SOURCE_DESECRATED, 296, 0},
    {SOURCE_DESECRATED, 297, 0},
    {SOURCE_DESECRATED, 298, 0},
    {SOURCE_DESECRATED, 299, 0},
    {SOURCE_DESECRATED, 300, 0},
    {SOURCE_DESECRATED, 305, 0},
    {SOURCE_DESECRATED, 301, 0},
    {SOURCE_DESECRATED, 302, 0}
};

// Helmets_str_int - essence_prefixes
ModifierLookup helmets_str_int_essence_prefixes[3] = {
    {SOURCE_ESSENCE, 228, 2},
    {SOURCE_ESSENCE, 229, 2},
    {SOURCE_ESSENCE, 234, 2}
};

// Helmets_str_int - essence_suffixes
ModifierLookup helmets_str_int_essence_suffixes[9] = {
    {SOURCE_ESSENCE, 236, 2},
    {SOURCE_ESSENCE, 237, 2},
    {SOURCE_ESSENCE, 239, 2},
    {SOURCE_PERFECT_ESSENCE, 70, 0},
    {SOURCE_ESSENCE, 240, 2},
    {SOURCE_ESSENCE, 241, 2},
    {SOURCE_PERFECT_ESSENCE, 71, 0},
    {SOURCE_ESSENCE, 242, 2},
    {SOURCE_ESSENCE, 243, 2}
};

// Helmets_int - normal_prefixes
ModifierLookup helmets_int_normal_prefixes[11] = {
    {SOURCE_NORMAL, 509, 6},
    {SOURCE_NORMAL, 510, 6},
    {SOURCE_NORMAL, 513, 5},  // ES%/Life - "Ancestral" at index 5
    {SOURCE_NORMAL, 516, 5},  // ES%/Mana - "Angel's" at index 5
    {SOURCE_NORMAL, 519, 7},
    {SOURCE_NORMAL, 522, 7},
    {SOURCE_NORMAL, 523, 7},
    {SOURCE_NORMAL, 524, 7},
    {SOURCE_NORMAL, 257, 5},  // ES%/Mana (duplicate - remove if not needed)
    {SOURCE_NORMAL, 409, 5},  // ES%/Life (duplicate - remove if not needed)
    {SOURCE_NORMAL, 605, 4}   // Item Rarity PREFIX - "Hoarder's" at index 2 (Helmets only have tiers 0-2)
};

// Helmets_int - normal_suffixes
ModifierLookup helmets_int_normal_suffixes[14] = {
    {SOURCE_NORMAL, 527, 1},
    {SOURCE_NORMAL, 528, 7},
    {SOURCE_NORMAL, 529, 4},
    {SOURCE_NORMAL, 530, 4},
    {SOURCE_NORMAL, 531, 2},
    {SOURCE_NORMAL, 214, 7},  // Fire Resistance
    {SOURCE_NORMAL, 215, 7},  // Cold Resistance
    {SOURCE_NORMAL, 532, 4},
    {SOURCE_NORMAL, 533, 4},
    {SOURCE_NORMAL, 534, 3},
    {SOURCE_NORMAL, 535, 9},
    {SOURCE_NORMAL, 536, 9},
    {SOURCE_NORMAL, 537, 4},
    {SOURCE_NORMAL, 540, 6}
};

// Helmets_int - desecrated_suffixes
ModifierLookup helmets_int_desecrated_suffixes[12] = {
    {SOURCE_DESECRATED, 272, 0},
    {SOURCE_DESECRATED, 273, 0},
    {SOURCE_DESECRATED, 274, 0},
    {SOURCE_DESECRATED, 277, 0},
    {SOURCE_DESECRATED, 278, 0},
    {SOURCE_DESECRATED, 279, 0},
    {SOURCE_DESECRATED, 280, 0},
    {SOURCE_DESECRATED, 282, 0},
    {SOURCE_DESECRATED, 283, 0},
    {SOURCE_DESECRATED, 288, 0},
    {SOURCE_DESECRATED, 284, 0},
    {SOURCE_DESECRATED, 285, 0}
};

// Helmets_int - essence_prefixes
ModifierLookup helmets_int_essence_prefixes[3] = {
    {SOURCE_ESSENCE, 215, 2},
    {SOURCE_ESSENCE, 216, 2},
    {SOURCE_ESSENCE, 219, 2}
};

// Helmets_int - essence_suffixes
ModifierLookup helmets_int_essence_suffixes[8] = {
    {SOURCE_ESSENCE, 220, 2},
    {SOURCE_ESSENCE, 223, 2},
    {SOURCE_PERFECT_ESSENCE, 68, 0},
    {SOURCE_ESSENCE, 224, 2},
    {SOURCE_ESSENCE, 225, 2},
    {SOURCE_PERFECT_ESSENCE, 69, 0},
    {SOURCE_ESSENCE, 226, 2},
    {SOURCE_ESSENCE, 227, 2}
};

// Helmets_dex_int - normal_prefixes
ModifierLookup helmets_dex_int_normal_prefixes[8] = {
    {SOURCE_NORMAL, 541, 6},
    {SOURCE_NORMAL, 542, 6},
    {SOURCE_NORMAL, 545, 5},
    {SOURCE_NORMAL, 548, 5},
    {SOURCE_NORMAL, 551, 7},
    {SOURCE_NORMAL, 554, 7},
    {SOURCE_NORMAL, 555, 7},
    {SOURCE_NORMAL, 556, 7}
};

// Helmets_dex_int - normal_suffixes
ModifierLookup helmets_dex_int_normal_suffixes[14] = {
    {SOURCE_NORMAL, 558, 4},
    {SOURCE_NORMAL, 559, 1},
    {SOURCE_NORMAL, 560, 7},
    {SOURCE_NORMAL, 561, 4},
    {SOURCE_NORMAL, 562, 4},
    {SOURCE_NORMAL, 563, 2},
    {SOURCE_NORMAL, 564, 4},
    {SOURCE_NORMAL, 565, 4},
    {SOURCE_NORMAL, 566, 3},
    {SOURCE_NORMAL, 567, 7},
    {SOURCE_NORMAL, 568, 11},
    {SOURCE_NORMAL, 569, 8},
    {SOURCE_NORMAL, 572, 8},
    {SOURCE_NORMAL, 571, 8}
};

// Helmets_dex_int - desecrated_suffixes
ModifierLookup helmets_dex_int_desecrated_suffixes[14] = {
    {SOURCE_DESECRATED, 289, 0},
    {SOURCE_DESECRATED, 290, 0},
    {SOURCE_DESECRATED, 291, 0},
    {SOURCE_DESECRATED, 294, 0},
    {SOURCE_DESECRATED, 295, 0},
    {SOURCE_DESECRATED, 296, 0},
    {SOURCE_DESECRATED, 297, 0},
    {SOURCE_DESECRATED, 299, 0},
    {SOURCE_DESECRATED, 300, 0},
    {SOURCE_DESECRATED, 305, 0},
    {SOURCE_DESECRATED, 301, 0},
    {SOURCE_DESECRATED, 303, 0},
    {SOURCE_DESECRATED, 302, 0},
    {SOURCE_DESECRATED, 304, 0}
};

// Helmets_dex_int - essence_prefixes
ModifierLookup helmets_dex_int_essence_prefixes[3] = {
    {SOURCE_ESSENCE, 228, 2},
    {SOURCE_ESSENCE, 229, 2},
    {SOURCE_ESSENCE, 235, 2}
};

// Helmets_dex_int - essence_suffixes
ModifierLookup helmets_dex_int_essence_suffixes[9] = {
    {SOURCE_ESSENCE, 236, 2},
    {SOURCE_ESSENCE, 238, 2},
    {SOURCE_ESSENCE, 239, 2},
    {SOURCE_PERFECT_ESSENCE, 70, 0},
    {SOURCE_ESSENCE, 240, 2},
    {SOURCE_ESSENCE, 241, 2},
    {SOURCE_PERFECT_ESSENCE, 71, 0},
    {SOURCE_ESSENCE, 242, 2},
    {SOURCE_ESSENCE, 243, 2}
};

// Helmets_str - normal_prefixes
ModifierLookup helmets_str_normal_prefixes[8] = {
    {SOURCE_NORMAL, 509, 6},
    {SOURCE_NORMAL, 510, 6},  // ES% - 7 tiers (0-6)
    {SOURCE_NORMAL, 511, 5},  // Armour%/Life - 6 tiers (0-5)
    {SOURCE_NORMAL, 514, 5},
    {SOURCE_NORMAL, 517, 8},
    {SOURCE_NORMAL, 520, 7},
    {SOURCE_NORMAL, 523, 7},
    {SOURCE_NORMAL, 524, 7}
};

// Helmets_str - normal_suffixes
ModifierLookup helmets_str_normal_suffixes[13] = {
    {SOURCE_NORMAL, 525, 5},
    {SOURCE_NORMAL, 526, 4},
    {SOURCE_NORMAL, 528, 7},
    {SOURCE_NORMAL, 529, 4},
    {SOURCE_NORMAL, 530, 4},
    {SOURCE_NORMAL, 531, 2},
    {SOURCE_NORMAL, 532, 4},
    {SOURCE_NORMAL, 533, 4},
    {SOURCE_NORMAL, 534, 3},
    {SOURCE_NORMAL, 535, 9},
    {SOURCE_NORMAL, 536, 9},
    {SOURCE_NORMAL, 537, 4},
    {SOURCE_NORMAL, 538, 4}
};

// Helmets_str - desecrated_suffixes
ModifierLookup helmets_str_desecrated_suffixes[14] = {
    {SOURCE_DESECRATED, 272, 0},
    {SOURCE_DESECRATED, 273, 0},
    {SOURCE_DESECRATED, 274, 0},
    {SOURCE_DESECRATED, 275, 0},
    {SOURCE_DESECRATED, 276, 0},
    {SOURCE_DESECRATED, 277, 0},
    {SOURCE_DESECRATED, 278, 0},
    {SOURCE_DESECRATED, 279, 0},
    {SOURCE_DESECRATED, 280, 0},
    {SOURCE_DESECRATED, 281, 0},
    {SOURCE_DESECRATED, 282, 0},
    {SOURCE_DESECRATED, 283, 0},
    {SOURCE_DESECRATED, 284, 0},
    {SOURCE_DESECRATED, 285, 0}
};

// Helmets_str - essence_prefixes
ModifierLookup helmets_str_essence_prefixes[3] = {
    {SOURCE_ESSENCE, 215, 2},
    {SOURCE_ESSENCE, 216, 2},
    {SOURCE_ESSENCE, 217, 2}
};

// Helmets_str - essence_suffixes
ModifierLookup helmets_str_essence_suffixes[9] = {
    {SOURCE_ESSENCE, 220, 2},
    {SOURCE_ESSENCE, 221, 2},
    {SOURCE_ESSENCE, 223, 2},
    {SOURCE_PERFECT_ESSENCE, 68, 0},
    {SOURCE_ESSENCE, 224, 2},
    {SOURCE_ESSENCE, 225, 2},
    {SOURCE_PERFECT_ESSENCE, 69, 0},
    {SOURCE_ESSENCE, 226, 2},
    {SOURCE_ESSENCE, 227, 2}
};

// Helmets_dex - normal_prefixes
ModifierLookup helmets_dex_normal_prefixes[8] = {
    {SOURCE_NORMAL, 509, 6},
    {SOURCE_NORMAL, 510, 6},
    {SOURCE_NORMAL, 512, 5},
    {SOURCE_NORMAL, 515, 5},
    {SOURCE_NORMAL, 518, 4},
    {SOURCE_NORMAL, 521, 8},
    {SOURCE_NORMAL, 523, 7},
    {SOURCE_NORMAL, 524, 7}
};

// Helmets_dex - normal_suffixes
ModifierLookup helmets_dex_normal_suffixes[13] = {
    {SOURCE_NORMAL, 526, 4},
    {SOURCE_NORMAL, 527, 1},
    {SOURCE_NORMAL, 528, 7},
    {SOURCE_NORMAL, 529, 4},
    {SOURCE_NORMAL, 530, 4},
    {SOURCE_NORMAL, 531, 2},
    {SOURCE_NORMAL, 532, 4},
    {SOURCE_NORMAL, 533, 4},
    {SOURCE_NORMAL, 534, 3},
    {SOURCE_NORMAL, 535, 9},
    {SOURCE_NORMAL, 536, 9},
    {SOURCE_NORMAL, 537, 4},
    {SOURCE_NORMAL, 539, 4}
};

// Helmets_dex - desecrated_suffixes
ModifierLookup helmets_dex_desecrated_suffixes[13] = {
    {SOURCE_DESECRATED, 272, 0},
    {SOURCE_DESECRATED, 273, 0},
    {SOURCE_DESECRATED, 274, 0},
    {SOURCE_DESECRATED, 277, 0},
    {SOURCE_DESECRATED, 278, 0},
    {SOURCE_DESECRATED, 279, 0},
    {SOURCE_DESECRATED, 280, 0},
    {SOURCE_DESECRATED, 282, 0},
    {SOURCE_DESECRATED, 283, 0},
    {SOURCE_DESECRATED, 284, 0},
    {SOURCE_DESECRATED, 286, 0},
    {SOURCE_DESECRATED, 285, 0},
    {SOURCE_DESECRATED, 287, 0}
};

// Helmets_dex - essence_prefixes
ModifierLookup helmets_dex_essence_prefixes[3] = {
    {SOURCE_ESSENCE, 215, 2},
    {SOURCE_ESSENCE, 216, 2},
    {SOURCE_ESSENCE, 218, 2}
};

// Helmets_dex - essence_suffixes
ModifierLookup helmets_dex_essence_suffixes[9] = {
    {SOURCE_ESSENCE, 220, 2},
    {SOURCE_ESSENCE, 222, 2},
    {SOURCE_ESSENCE, 223, 2},
    {SOURCE_PERFECT_ESSENCE, 68, 0},
    {SOURCE_ESSENCE, 224, 2},
    {SOURCE_ESSENCE, 225, 2},
    {SOURCE_PERFECT_ESSENCE, 69, 0},
    {SOURCE_ESSENCE, 226, 2},
    {SOURCE_ESSENCE, 227, 2}
};

// Helmets_str_dex - normal_prefixes
ModifierLookup helmets_str_dex_normal_prefixes[8] = {
    {SOURCE_NORMAL, 541, 6},
    {SOURCE_NORMAL, 542, 6},
    {SOURCE_NORMAL, 543, 5},
    {SOURCE_NORMAL, 546, 5},
    {SOURCE_NORMAL, 549, 8},
    {SOURCE_NORMAL, 552, 7},
    {SOURCE_NORMAL, 555, 7},
    {SOURCE_NORMAL, 556, 7}
};

// Helmets_str_dex - normal_suffixes
ModifierLookup helmets_str_dex_normal_suffixes[14] = {
    {SOURCE_NORMAL, 557, 5},
    {SOURCE_NORMAL, 558, 4},
    {SOURCE_NORMAL, 560, 7},
    {SOURCE_NORMAL, 561, 4},
    {SOURCE_NORMAL, 562, 4},
    {SOURCE_NORMAL, 563, 2},
    {SOURCE_NORMAL, 564, 4},
    {SOURCE_NORMAL, 565, 4},
    {SOURCE_NORMAL, 566, 3},
    {SOURCE_NORMAL, 567, 7},
    {SOURCE_NORMAL, 568, 11},
    {SOURCE_NORMAL, 569, 8},
    {SOURCE_NORMAL, 570, 8},
    {SOURCE_NORMAL, 571, 8}
};

// Helmets_str_dex - desecrated_suffixes
ModifierLookup helmets_str_dex_desecrated_suffixes[16] = {
    {SOURCE_DESECRATED, 289, 0},
    {SOURCE_DESECRATED, 290, 0},
    {SOURCE_DESECRATED, 291, 0},
    {SOURCE_DESECRATED, 292, 0},
    {SOURCE_DESECRATED, 293, 0},
    {SOURCE_DESECRATED, 294, 0},
    {SOURCE_DESECRATED, 295, 0},
    {SOURCE_DESECRATED, 296, 0},
    {SOURCE_DESECRATED, 297, 0},
    {SOURCE_DESECRATED, 298, 0},
    {SOURCE_DESECRATED, 299, 0},
    {SOURCE_DESECRATED, 300, 0},
    {SOURCE_DESECRATED, 301, 0},
    {SOURCE_DESECRATED, 303, 0},
    {SOURCE_DESECRATED, 302, 0},
    {SOURCE_DESECRATED, 304, 0}
};

// Helmets_str_dex - essence_prefixes
ModifierLookup helmets_str_dex_essence_prefixes[3] = {
    {SOURCE_ESSENCE, 228, 2},
    {SOURCE_ESSENCE, 229, 2},
    {SOURCE_ESSENCE, 233, 2}
};

// Helmets_str_dex - essence_suffixes
ModifierLookup helmets_str_dex_essence_suffixes[10] = {
    {SOURCE_ESSENCE, 236, 2},
    {SOURCE_ESSENCE, 237, 2},
    {SOURCE_ESSENCE, 238, 2},
    {SOURCE_ESSENCE, 239, 2},
    {SOURCE_PERFECT_ESSENCE, 70, 0},
    {SOURCE_ESSENCE, 240, 2},
    {SOURCE_ESSENCE, 241, 2},
    {SOURCE_PERFECT_ESSENCE, 71, 0},
    {SOURCE_ESSENCE, 242, 2},
    {SOURCE_ESSENCE, 243, 2}
};

// Sceptres - normal_prefixes
ModifierLookup sceptres_normal_prefixes[8] = {
    {SOURCE_NORMAL, 139, 7},
    {SOURCE_NORMAL, 140, 7},
    {SOURCE_NORMAL, 141, 6},
    {SOURCE_NORMAL, 142, 7},
    {SOURCE_NORMAL, 143, 7},
    {SOURCE_NORMAL, 144, 5},
    {SOURCE_NORMAL, 145, 4},
    {SOURCE_NORMAL, 146, 3}
};

// Sceptres - normal_suffixes
ModifierLookup sceptres_normal_suffixes[13] = {
    {SOURCE_NORMAL, 147, 9},
    {SOURCE_NORMAL, 148, 3},
    {SOURCE_NORMAL, 149, 3},
    {SOURCE_NORMAL, 150, 5},
    {SOURCE_NORMAL, 151, 5},
    {SOURCE_NORMAL, 152, 2},
    {SOURCE_NORMAL, 153, 3},
    {SOURCE_NORMAL, 154, 5},
    {SOURCE_NORMAL, 155, 8},
    {SOURCE_NORMAL, 156, 9},
    {SOURCE_NORMAL, 157, 9},
    {SOURCE_NORMAL, 158, 9},
    {SOURCE_NORMAL, 159, 7}
};

// Sceptres - essence_prefixes
ModifierLookup sceptres_essence_prefixes[1] = {
    {SOURCE_ESSENCE, 56, 2}
};

// Sceptres - essence_suffixes
ModifierLookup sceptres_essence_suffixes[4] = {
    {SOURCE_ESSENCE, 57, 2},
    {SOURCE_ESSENCE, 58, 2},
    {SOURCE_ESSENCE, 59, 2},
    {SOURCE_PERFECT_ESSENCE, 32, 0}
};

// Boots_str_int - normal_prefixes
ModifierLookup boots_str_int_normal_prefixes[10] = {
    {SOURCE_NORMAL, 318, 5},   // ES%
    {SOURCE_NORMAL, 346, 6},
    {SOURCE_NORMAL, 347, 6},
    {SOURCE_NORMAL, 349, 5},
    {SOURCE_NORMAL, 352, 7},
    {SOURCE_NORMAL, 355, 7},
    {SOURCE_NORMAL, 357, 7},
    {SOURCE_NORMAL, 322, 5},  // Movement Speed
    {SOURCE_NORMAL, 43, 10},   // +Mana - "Chalybeous" T1 at index 8
    {SOURCE_NORMAL, 207, 10}   // +Life - "Athlete's" T1 at index 8
};

// Boots_str_int - normal_suffixes
ModifierLookup boots_str_int_normal_suffixes[18] = {
    {SOURCE_NORMAL, 358, 5},
    {SOURCE_NORMAL, 360, 10},
    {SOURCE_NORMAL, 361, 7},
    {SOURCE_NORMAL, 362, 4},
    {SOURCE_NORMAL, 363, 4},
    {SOURCE_NORMAL, 364, 4},
    {SOURCE_NORMAL, 365, 4},
    {SOURCE_NORMAL, 366, 4},
    {SOURCE_NORMAL, 367, 4},
    {SOURCE_NORMAL, 368, 3},
    {SOURCE_NORMAL, 369, 12},
    {SOURCE_NORMAL, 370, 7},
    {SOURCE_NORMAL, 371, 7},
    {SOURCE_NORMAL, 372, 7},
    {SOURCE_NORMAL, 374, 7},
    {SOURCE_NORMAL, 214, 7},  // Fire Resistance
    {SOURCE_NORMAL, 216, 7},  // Lightning Resistance
    {SOURCE_NORMAL, 323, 7}   // Strength
};

// Boots_str_int - desecrated_suffixes
ModifierLookup boots_str_int_desecrated_suffixes[15] = {
    {SOURCE_DESECRATED, 195, 0},
    {SOURCE_DESECRATED, 196, 0},
    {SOURCE_DESECRATED, 197, 0},
    {SOURCE_DESECRATED, 198, 0},
    {SOURCE_DESECRATED, 199, 0},
    {SOURCE_DESECRATED, 200, 0},
    {SOURCE_DESECRATED, 201, 0},
    {SOURCE_DESECRATED, 202, 0},
    {SOURCE_DESECRATED, 203, 0},
    {SOURCE_DESECRATED, 204, 0},
    {SOURCE_DESECRATED, 205, 0},
    {SOURCE_DESECRATED, 206, 0},
    {SOURCE_DESECRATED, 207, 0},
    {SOURCE_DESECRATED, 208, 0},
    {SOURCE_DESECRATED, 209, 0}
};

// Boots_str_int - essence_prefixes
ModifierLookup boots_str_int_essence_prefixes[4] = {
    {SOURCE_ESSENCE, 143, 2},
    {SOURCE_ESSENCE, 144, 2},
    {SOURCE_ESSENCE, 149, 2},
    {SOURCE_PERFECT_ESSENCE, 50, 0}
};

// Boots_str_int - essence_suffixes
ModifierLookup boots_str_int_essence_suffixes[8] = {
    {SOURCE_ESSENCE, 151, 2},
    {SOURCE_ESSENCE, 152, 2},
    {SOURCE_ESSENCE, 154, 2},
    {SOURCE_PERFECT_ESSENCE, 51, 0},
    {SOURCE_ESSENCE, 155, 2},
    {SOURCE_ESSENCE, 156, 2},
    {SOURCE_ESSENCE, 157, 2},
    {SOURCE_ESSENCE, 158, 2}
};

// Boots_str - normal_prefixes
ModifierLookup boots_str_normal_prefixes[6] = {
    {SOURCE_NORMAL, 317, 6},
    {SOURCE_NORMAL, 318, 5},
    {SOURCE_NORMAL, 319, 5},
    {SOURCE_NORMAL, 322, 5},
    {SOURCE_NORMAL, 325, 7},
    {SOURCE_NORMAL, 328, 7}
};

// Boots_str - normal_suffixes
ModifierLookup boots_str_normal_suffixes[13] = {
    {SOURCE_NORMAL, 329, 5},
    {SOURCE_NORMAL, 332, 7},
    {SOURCE_NORMAL, 333, 4},
    {SOURCE_NORMAL, 334, 4},
    {SOURCE_NORMAL, 335, 4},
    {SOURCE_NORMAL, 336, 4},
    {SOURCE_NORMAL, 337, 4},
    {SOURCE_NORMAL, 338, 4},
    {SOURCE_NORMAL, 339, 3},
    {SOURCE_NORMAL, 340, 8},
    {SOURCE_NORMAL, 341, 8},
    {SOURCE_NORMAL, 342, 3},
    {SOURCE_NORMAL, 343, 3}
};

// Boots_str - desecrated_suffixes
ModifierLookup boots_str_desecrated_suffixes[15] = {
    {SOURCE_DESECRATED, 180, 0},
    {SOURCE_DESECRATED, 181, 0},
    {SOURCE_DESECRATED, 182, 0},
    {SOURCE_DESECRATED, 183, 0},
    {SOURCE_DESECRATED, 184, 0},
    {SOURCE_DESECRATED, 185, 0},
    {SOURCE_DESECRATED, 186, 0},
    {SOURCE_DESECRATED, 187, 0},
    {SOURCE_DESECRATED, 188, 0},
    {SOURCE_DESECRATED, 189, 0},
    {SOURCE_DESECRATED, 190, 0},
    {SOURCE_DESECRATED, 191, 0},
    {SOURCE_DESECRATED, 192, 0},
    {SOURCE_DESECRATED, 193, 0},
    {SOURCE_DESECRATED, 194, 0}
};

// Boots_str - essence_prefixes
ModifierLookup boots_str_essence_prefixes[4] = {
    {SOURCE_ESSENCE, 130, 2},
    {SOURCE_ESSENCE, 131, 2},
    {SOURCE_ESSENCE, 132, 2},
    {SOURCE_PERFECT_ESSENCE, 48, 0}
};

// Boots_str - essence_suffixes
ModifierLookup boots_str_essence_suffixes[7] = {
    {SOURCE_ESSENCE, 135, 2},
    {SOURCE_ESSENCE, 136, 2},
    {SOURCE_PERFECT_ESSENCE, 49, 0},
    {SOURCE_ESSENCE, 139, 2},
    {SOURCE_ESSENCE, 140, 2},
    {SOURCE_ESSENCE, 141, 2},
    {SOURCE_ESSENCE, 142, 2}
};

// Boots_int - normal_prefixes
ModifierLookup boots_int_normal_prefixes[6] = {
    {SOURCE_NORMAL, 317, 6},
    {SOURCE_NORMAL, 318, 5},
    {SOURCE_NORMAL, 321, 5},
    {SOURCE_NORMAL, 324, 8},
    {SOURCE_NORMAL, 327, 7},
    {SOURCE_NORMAL, 328, 7}
};

// Boots_int - normal_suffixes
ModifierLookup boots_int_normal_suffixes[13] = {
    {SOURCE_NORMAL, 331, 10},
    {SOURCE_NORMAL, 332, 7},
    {SOURCE_NORMAL, 333, 4},
    {SOURCE_NORMAL, 334, 4},
    {SOURCE_NORMAL, 335, 4},
    {SOURCE_NORMAL, 336, 4},
    {SOURCE_NORMAL, 337, 4},
    {SOURCE_NORMAL, 338, 4},
    {SOURCE_NORMAL, 339, 3},
    {SOURCE_NORMAL, 340, 8},
    {SOURCE_NORMAL, 341, 8},
    {SOURCE_NORMAL, 342, 3},
    {SOURCE_NORMAL, 345, 6}
};

// Boots_int - desecrated_suffixes
ModifierLookup boots_int_desecrated_suffixes[15] = {
    {SOURCE_DESECRATED, 180, 0},
    {SOURCE_DESECRATED, 181, 0},
    {SOURCE_DESECRATED, 182, 0},
    {SOURCE_DESECRATED, 183, 0},
    {SOURCE_DESECRATED, 184, 0},
    {SOURCE_DESECRATED, 185, 0},
    {SOURCE_DESECRATED, 186, 0},
    {SOURCE_DESECRATED, 187, 0},
    {SOURCE_DESECRATED, 188, 0},
    {SOURCE_DESECRATED, 189, 0},
    {SOURCE_DESECRATED, 190, 0},
    {SOURCE_DESECRATED, 191, 0},
    {SOURCE_DESECRATED, 192, 0},
    {SOURCE_DESECRATED, 193, 0},
    {SOURCE_DESECRATED, 194, 0}
};

// Boots_int - essence_prefixes
ModifierLookup boots_int_essence_prefixes[4] = {
    {SOURCE_ESSENCE, 130, 2},
    {SOURCE_ESSENCE, 131, 2},
    {SOURCE_ESSENCE, 134, 2},
    {SOURCE_PERFECT_ESSENCE, 48, 0}
};

// Boots_int - essence_suffixes
ModifierLookup boots_int_essence_suffixes[7] = {
    {SOURCE_ESSENCE, 135, 2},
    {SOURCE_ESSENCE, 138, 2},
    {SOURCE_PERFECT_ESSENCE, 49, 0},
    {SOURCE_ESSENCE, 139, 2},
    {SOURCE_ESSENCE, 140, 2},
    {SOURCE_ESSENCE, 141, 2},
    {SOURCE_ESSENCE, 142, 2}
};

// Boots_dex - normal_prefixes
ModifierLookup boots_dex_normal_prefixes[6] = {
    {SOURCE_NORMAL, 317, 6},
    {SOURCE_NORMAL, 318, 5},  // ES% - 6 tiers (0-5)
    {SOURCE_NORMAL, 320, 5},  // Evasion%/Stun Threshold - 6 tiers (0-5)
    {SOURCE_NORMAL, 323, 7},
    {SOURCE_NORMAL, 326, 7},
    {SOURCE_NORMAL, 328, 7}
};

// Boots_dex - normal_suffixes
ModifierLookup boots_dex_normal_suffixes[13] = {
    {SOURCE_NORMAL, 330, 4},
    {SOURCE_NORMAL, 332, 7},
    {SOURCE_NORMAL, 333, 4},  // Item Rarity - 5 tiers (0-4)
    {SOURCE_NORMAL, 334, 4},
    {SOURCE_NORMAL, 335, 4},
    {SOURCE_NORMAL, 336, 4},
    {SOURCE_NORMAL, 337, 4},
    {SOURCE_NORMAL, 338, 4},
    {SOURCE_NORMAL, 339, 3},
    {SOURCE_NORMAL, 340, 8},
    {SOURCE_NORMAL, 341, 8},
    {SOURCE_NORMAL, 342, 3},
    {SOURCE_NORMAL, 344, 3}
};

// Boots_dex - desecrated_suffixes
ModifierLookup boots_dex_desecrated_suffixes[15] = {
    {SOURCE_DESECRATED, 180, 0},
    {SOURCE_DESECRATED, 181, 0},
    {SOURCE_DESECRATED, 182, 0},
    {SOURCE_DESECRATED, 183, 0},
    {SOURCE_DESECRATED, 184, 0},
    {SOURCE_DESECRATED, 185, 0},
    {SOURCE_DESECRATED, 186, 0},
    {SOURCE_DESECRATED, 187, 0},
    {SOURCE_DESECRATED, 188, 0},
    {SOURCE_DESECRATED, 189, 0},
    {SOURCE_DESECRATED, 190, 0},
    {SOURCE_DESECRATED, 191, 0},
    {SOURCE_DESECRATED, 192, 0},
    {SOURCE_DESECRATED, 193, 0},
    {SOURCE_DESECRATED, 194, 0}
};

// Boots_dex - essence_prefixes
ModifierLookup boots_dex_essence_prefixes[4] = {
    {SOURCE_ESSENCE, 130, 2},
    {SOURCE_ESSENCE, 131, 2},
    {SOURCE_ESSENCE, 133, 2},
    {SOURCE_PERFECT_ESSENCE, 48, 0}
};

// Boots_dex - essence_suffixes
ModifierLookup boots_dex_essence_suffixes[7] = {
    {SOURCE_ESSENCE, 135, 2},
    {SOURCE_ESSENCE, 137, 2},
    {SOURCE_PERFECT_ESSENCE, 49, 0},
    {SOURCE_ESSENCE, 139, 2},
    {SOURCE_ESSENCE, 140, 2},
    {SOURCE_ESSENCE, 141, 2},
    {SOURCE_ESSENCE, 142, 2}
};

// Boots_dex_int - normal_prefixes
ModifierLookup boots_dex_int_normal_prefixes[6] = {
    {SOURCE_NORMAL, 346, 6},
    {SOURCE_NORMAL, 347, 6},
    {SOURCE_NORMAL, 350, 5},
    {SOURCE_NORMAL, 353, 8},
    {SOURCE_NORMAL, 356, 7},
    {SOURCE_NORMAL, 357, 7}
};

// Boots_dex_int - normal_suffixes
ModifierLookup boots_dex_int_normal_suffixes[15] = {
    {SOURCE_NORMAL, 359, 4},
    {SOURCE_NORMAL, 360, 10},
    {SOURCE_NORMAL, 361, 7},
    {SOURCE_NORMAL, 362, 4},
    {SOURCE_NORMAL, 363, 4},
    {SOURCE_NORMAL, 364, 4},
    {SOURCE_NORMAL, 365, 4},
    {SOURCE_NORMAL, 366, 4},
    {SOURCE_NORMAL, 367, 4},
    {SOURCE_NORMAL, 368, 3},
    {SOURCE_NORMAL, 369, 12},
    {SOURCE_NORMAL, 370, 7},
    {SOURCE_NORMAL, 371, 7},
    {SOURCE_NORMAL, 374, 7},
    {SOURCE_NORMAL, 373, 7}
};

// Boots_dex_int - desecrated_suffixes
ModifierLookup boots_dex_int_desecrated_suffixes[15] = {
    {SOURCE_DESECRATED, 195, 0},
    {SOURCE_DESECRATED, 196, 0},
    {SOURCE_DESECRATED, 197, 0},
    {SOURCE_DESECRATED, 198, 0},
    {SOURCE_DESECRATED, 199, 0},
    {SOURCE_DESECRATED, 200, 0},
    {SOURCE_DESECRATED, 201, 0},
    {SOURCE_DESECRATED, 202, 0},
    {SOURCE_DESECRATED, 203, 0},
    {SOURCE_DESECRATED, 204, 0},
    {SOURCE_DESECRATED, 205, 0},
    {SOURCE_DESECRATED, 206, 0},
    {SOURCE_DESECRATED, 207, 0},
    {SOURCE_DESECRATED, 208, 0},
    {SOURCE_DESECRATED, 209, 0}
};

// Boots_dex_int - essence_prefixes
ModifierLookup boots_dex_int_essence_prefixes[4] = {
    {SOURCE_ESSENCE, 143, 2},
    {SOURCE_ESSENCE, 144, 2},
    {SOURCE_ESSENCE, 150, 2},
    {SOURCE_PERFECT_ESSENCE, 50, 0}
};

// Boots_dex_int - essence_suffixes
ModifierLookup boots_dex_int_essence_suffixes[8] = {
    {SOURCE_ESSENCE, 151, 2},
    {SOURCE_ESSENCE, 153, 2},
    {SOURCE_ESSENCE, 154, 2},
    {SOURCE_PERFECT_ESSENCE, 51, 0},
    {SOURCE_ESSENCE, 155, 2},
    {SOURCE_ESSENCE, 156, 2},
    {SOURCE_ESSENCE, 157, 2},
    {SOURCE_ESSENCE, 158, 2}
};

// Boots_str_dex - normal_prefixes
ModifierLookup boots_str_dex_normal_prefixes[6] = {
    {SOURCE_NORMAL, 346, 6},
    {SOURCE_NORMAL, 347, 6},
    {SOURCE_NORMAL, 348, 5},
    {SOURCE_NORMAL, 351, 5},
    {SOURCE_NORMAL, 354, 7},
    {SOURCE_NORMAL, 357, 7}
};

// Boots_str_dex - normal_suffixes
ModifierLookup boots_str_dex_normal_suffixes[15] = {
    {SOURCE_NORMAL, 358, 5},
    {SOURCE_NORMAL, 359, 4},
    {SOURCE_NORMAL, 361, 7},
    {SOURCE_NORMAL, 362, 4},
    {SOURCE_NORMAL, 363, 4},
    {SOURCE_NORMAL, 364, 4},
    {SOURCE_NORMAL, 365, 4},
    {SOURCE_NORMAL, 366, 4},
    {SOURCE_NORMAL, 367, 4},
    {SOURCE_NORMAL, 368, 3},
    {SOURCE_NORMAL, 369, 12},
    {SOURCE_NORMAL, 370, 7},
    {SOURCE_NORMAL, 371, 7},
    {SOURCE_NORMAL, 372, 7},
    {SOURCE_NORMAL, 373, 7}
};

// Boots_str_dex - desecrated_suffixes
ModifierLookup boots_str_dex_desecrated_suffixes[15] = {
    {SOURCE_DESECRATED, 195, 0},
    {SOURCE_DESECRATED, 196, 0},
    {SOURCE_DESECRATED, 197, 0},
    {SOURCE_DESECRATED, 198, 0},
    {SOURCE_DESECRATED, 199, 0},
    {SOURCE_DESECRATED, 200, 0},
    {SOURCE_DESECRATED, 201, 0},
    {SOURCE_DESECRATED, 202, 0},
    {SOURCE_DESECRATED, 203, 0},
    {SOURCE_DESECRATED, 204, 0},
    {SOURCE_DESECRATED, 205, 0},
    {SOURCE_DESECRATED, 206, 0},
    {SOURCE_DESECRATED, 207, 0},
    {SOURCE_DESECRATED, 208, 0},
    {SOURCE_DESECRATED, 209, 0}
};

// Boots_str_dex - essence_prefixes
ModifierLookup boots_str_dex_essence_prefixes[4] = {
    {SOURCE_ESSENCE, 143, 2},
    {SOURCE_ESSENCE, 144, 2},
    {SOURCE_ESSENCE, 148, 2},
    {SOURCE_PERFECT_ESSENCE, 50, 0}
};

// Boots_str_dex - essence_suffixes
ModifierLookup boots_str_dex_essence_suffixes[8] = {
    {SOURCE_ESSENCE, 151, 2},
    {SOURCE_ESSENCE, 152, 2},
    {SOURCE_ESSENCE, 153, 2},
    {SOURCE_PERFECT_ESSENCE, 51, 0},
    {SOURCE_ESSENCE, 155, 2},
    {SOURCE_ESSENCE, 156, 2},
    {SOURCE_ESSENCE, 157, 2},
    {SOURCE_ESSENCE, 158, 2}
};

// Rings - normal_prefixes
ModifierLookup rings_normal_prefixes[13] = {
    {SOURCE_NORMAL, 573, 8},
    {SOURCE_NORMAL, 574, 7},
    {SOURCE_NORMAL, 575, 4},
    {SOURCE_NORMAL, 576, 5},
    {SOURCE_NORMAL, 577, 5},
    {SOURCE_NORMAL, 578, 5},
    {SOURCE_NORMAL, 579, 5},
    {SOURCE_NORMAL, 580, 7},
    {SOURCE_NORMAL, 581, 8},
    {SOURCE_NORMAL, 582, 7},
    {SOURCE_NORMAL, 583, 3},
    {SOURCE_NORMAL, 584, 7},
    {SOURCE_NORMAL, 585, 7}
};

// Rings - normal_suffixes
ModifierLookup rings_normal_suffixes[18] = {
    {SOURCE_NORMAL, 586, 7},
    {SOURCE_NORMAL, 587, 4},
    {SOURCE_NORMAL, 588, 5},
    {SOURCE_NORMAL, 589, 6},
    {SOURCE_NORMAL, 590, 5},
    {SOURCE_NORMAL, 591, 2},
    {SOURCE_NORMAL, 592, 2},
    {SOURCE_NORMAL, 593, 5},
    {SOURCE_NORMAL, 594, 5},
    {SOURCE_NORMAL, 595, 3},
    {SOURCE_NORMAL, 596, 4},
    {SOURCE_NORMAL, 597, 2},
    {SOURCE_NORMAL, 598, 9},
    {SOURCE_NORMAL, 599, 9},
    {SOURCE_NORMAL, 600, 9},
    {SOURCE_NORMAL, 601, 6},
    {SOURCE_NORMAL, 602, 6},
    {SOURCE_NORMAL, 603, 6}
};

// Rings - desecrated_prefixes
ModifierLookup rings_desecrated_prefixes[7] = {
    {SOURCE_DESECRATED, 306, 0},
    {SOURCE_DESECRATED, 307, 0},
    {SOURCE_DESECRATED, 308, 0},
    {SOURCE_DESECRATED, 309, 0},
    {SOURCE_DESECRATED, 310, 0},
    {SOURCE_DESECRATED, 311, 0},
    {SOURCE_DESECRATED, 312, 0}
};

// Rings - desecrated_suffixes
ModifierLookup rings_desecrated_suffixes[15] = {
    {SOURCE_DESECRATED, 313, 0},
    {SOURCE_DESECRATED, 314, 0},
    {SOURCE_DESECRATED, 315, 0},
    {SOURCE_DESECRATED, 316, 0},
    {SOURCE_DESECRATED, 317, 0},
    {SOURCE_DESECRATED, 318, 0},
    {SOURCE_DESECRATED, 319, 0},
    {SOURCE_DESECRATED, 320, 0},
    {SOURCE_DESECRATED, 321, 0},
    {SOURCE_DESECRATED, 322, 0},
    {SOURCE_DESECRATED, 323, 0},
    {SOURCE_DESECRATED, 324, 0},
    {SOURCE_DESECRATED, 325, 0},
    {SOURCE_DESECRATED, 326, 0},
    {SOURCE_DESECRATED, 327, 0}
};

// Rings - essence_prefixes
ModifierLookup rings_essence_prefixes[3] = {
    {SOURCE_ESSENCE, 244, 1},
    {SOURCE_ESSENCE, 245, 2},
    {SOURCE_PERFECT_ESSENCE, 72, 0}
};

// Rings - essence_suffixes
ModifierLookup rings_essence_suffixes[9] = {
    {SOURCE_ESSENCE, 246, 2},
    {SOURCE_ESSENCE, 247, 2},
    {SOURCE_ESSENCE, 248, 2},
    {SOURCE_ESSENCE, 249, 2},
    {SOURCE_PERFECT_ESSENCE, 73, 0},
    {SOURCE_ESSENCE, 250, 2},
    {SOURCE_ESSENCE, 251, 2},
    {SOURCE_ESSENCE, 252, 2},
    {SOURCE_ESSENCE, 253, 2}
};

// Gloves_dex - normal_prefixes
ModifierLookup gloves_dex_normal_prefixes[10] = {
    {SOURCE_NORMAL, 437, 6},  // Evasion%
    {SOURCE_NORMAL, 440, 5},  // Evasion%/Life
    {SOURCE_NORMAL, 443, 8},
    {SOURCE_NORMAL, 446, 8},
    {SOURCE_NORMAL, 448, 8},
    {SOURCE_NORMAL, 449, 7},
    {SOURCE_NORMAL, 450, 7},
    {SOURCE_NORMAL, 451, 7},
    {SOURCE_NORMAL, 452, 7}
};

// Gloves_dex - normal_suffixes
ModifierLookup gloves_dex_normal_suffixes[16] = {
    {SOURCE_NORMAL, 454, 4},
    {SOURCE_NORMAL, 456, 4},
    {SOURCE_NORMAL, 457, 4},
    {SOURCE_NORMAL, 458, 7},
    {SOURCE_NORMAL, 459, 7},
    {SOURCE_NORMAL, 460, 3},
    {SOURCE_NORMAL, 461, 3},
    {SOURCE_NORMAL, 462, 4},
    {SOURCE_NORMAL, 463, 4},
    {SOURCE_NORMAL, 464, 4},
    {SOURCE_NORMAL, 465, 4},
    {SOURCE_NORMAL, 466, 3},
    {SOURCE_NORMAL, 467, 8},
    {SOURCE_NORMAL, 468, 8},
    {SOURCE_NORMAL, 469, 3},
    {SOURCE_NORMAL, 471, 3}
};

// Gloves_dex - desecrated_suffixes
ModifierLookup gloves_dex_desecrated_suffixes[13] = {
    {SOURCE_DESECRATED, 236, 0},
    {SOURCE_DESECRATED, 237, 0},
    {SOURCE_DESECRATED, 238, 0},
    {SOURCE_DESECRATED, 248, 0},
    {SOURCE_DESECRATED, 239, 0},
    {SOURCE_DESECRATED, 249, 0},
    {SOURCE_DESECRATED, 240, 0},
    {SOURCE_DESECRATED, 241, 0},
    {SOURCE_DESECRATED, 242, 0},
    {SOURCE_DESECRATED, 243, 0},
    {SOURCE_DESECRATED, 244, 0},
    {SOURCE_DESECRATED, 245, 0},
    {SOURCE_DESECRATED, 246, 0}
};

// Gloves_dex - essence_prefixes
ModifierLookup gloves_dex_essence_prefixes[3] = {
    {SOURCE_ESSENCE, 184, 2},
    {SOURCE_ESSENCE, 185, 2},
    {SOURCE_ESSENCE, 189, 0}
};

// Gloves_dex - essence_suffixes
ModifierLookup gloves_dex_essence_suffixes[11] = {
    {SOURCE_ESSENCE, 190, 2},
    {SOURCE_ESSENCE, 191, 2},
    {SOURCE_ESSENCE, 192, 2},
    {SOURCE_PERFECT_ESSENCE, 60, 0},
    {SOURCE_PERFECT_ESSENCE, 61, 0},
    {SOURCE_ESSENCE, 194, 2},
    {SOURCE_ESSENCE, 195, 2},
    {SOURCE_ESSENCE, 196, 2},
    {SOURCE_PERFECT_ESSENCE, 62, 0},
    {SOURCE_ESSENCE, 197, 2},
    {SOURCE_PERFECT_ESSENCE, 63, 0}
};

// Gloves_dex_int - normal_prefixes
ModifierLookup gloves_dex_int_normal_prefixes[10] = {
    {SOURCE_NORMAL, 473, 6},
    {SOURCE_NORMAL, 474, 6},
    {SOURCE_NORMAL, 477, 5},
    {SOURCE_NORMAL, 480, 8},
    {SOURCE_NORMAL, 483, 7},
    {SOURCE_NORMAL, 484, 8},
    {SOURCE_NORMAL, 485, 7},
    {SOURCE_NORMAL, 486, 7},
    {SOURCE_NORMAL, 487, 7},
    {SOURCE_NORMAL, 488, 7}
};

// Gloves_dex_int - normal_suffixes
ModifierLookup gloves_dex_int_normal_suffixes[18] = {
    {SOURCE_NORMAL, 490, 4},
    {SOURCE_NORMAL, 489, 5},
    {SOURCE_NORMAL, 492, 4},
    {SOURCE_NORMAL, 493, 4},
    {SOURCE_NORMAL, 494, 7},
    {SOURCE_NORMAL, 495, 7},
    {SOURCE_NORMAL, 496, 3},
    {SOURCE_NORMAL, 497, 3},
    {SOURCE_NORMAL, 498, 4},
    {SOURCE_NORMAL, 499, 4},
    {SOURCE_NORMAL, 500, 4},
    {SOURCE_NORMAL, 501, 4},
    {SOURCE_NORMAL, 502, 3},
    {SOURCE_NORMAL, 503, 9},
    {SOURCE_NORMAL, 504, 9},
    {SOURCE_NORMAL, 505, 7},
    {SOURCE_NORMAL, 508, 6},
    {SOURCE_NORMAL, 507, 7}
};

// Gloves_dex_int - desecrated_suffixes
ModifierLookup gloves_dex_int_desecrated_suffixes[16] = {
    {SOURCE_DESECRATED, 255, 0},
    {SOURCE_DESECRATED, 256, 0},
    {SOURCE_DESECRATED, 267, 0},
    {SOURCE_DESECRATED, 257, 0},
    {SOURCE_DESECRATED, 254, 0},
    {SOURCE_DESECRATED, 260, 0},
    {SOURCE_DESECRATED, 259, 0},
    {SOURCE_DESECRATED, 258, 0},
    {SOURCE_DESECRATED, 268, 0},
    {SOURCE_DESECRATED, 269, 0},
    {SOURCE_DESECRATED, 261, 0},
    {SOURCE_DESECRATED, 262, 0},
    {SOURCE_DESECRATED, 263, 0},
    {SOURCE_DESECRATED, 270, 0},
    {SOURCE_DESECRATED, 271, 0},
    {SOURCE_DESECRATED, 264, 0}
};

// Gloves_dex_int - essence_prefixes
ModifierLookup gloves_dex_int_essence_prefixes[4] = {
    {SOURCE_ESSENCE, 198, 2},
    {SOURCE_ESSENCE, 199, 2},
    {SOURCE_ESSENCE, 205, 2},
    {SOURCE_ESSENCE, 206, 0}
};

// Gloves_dex_int - essence_suffixes
ModifierLookup gloves_dex_int_essence_suffixes[11] = {
    {SOURCE_ESSENCE, 207, 2},
    {SOURCE_ESSENCE, 209, 2},
    {SOURCE_ESSENCE, 210, 2},
    {SOURCE_PERFECT_ESSENCE, 64, 0},
    {SOURCE_PERFECT_ESSENCE, 65, 0},
    {SOURCE_ESSENCE, 211, 2},
    {SOURCE_ESSENCE, 212, 2},
    {SOURCE_ESSENCE, 213, 2},
    {SOURCE_PERFECT_ESSENCE, 66, 0},
    {SOURCE_ESSENCE, 214, 2},
    {SOURCE_PERFECT_ESSENCE, 67, 0}
};

// Gloves_int - normal_prefixes
ModifierLookup gloves_int_normal_prefixes[10] = {
    {SOURCE_NORMAL, 438, 6},  // ES%
    {SOURCE_NORMAL, 441, 5},  // ES%/Life
    {SOURCE_NORMAL, 444, 8},
    {SOURCE_NORMAL, 447, 7},
    {SOURCE_NORMAL, 448, 8},
    {SOURCE_NORMAL, 449, 7},
    {SOURCE_NORMAL, 450, 7},
    {SOURCE_NORMAL, 451, 7},
    {SOURCE_NORMAL, 452, 7}
};

// Gloves_int - normal_suffixes
ModifierLookup gloves_int_normal_suffixes[17] = {
    {SOURCE_NORMAL, 454, 4},
    {SOURCE_NORMAL, 455, 1},
    {SOURCE_NORMAL, 456, 4},
    {SOURCE_NORMAL, 457, 4},
    {SOURCE_NORMAL, 458, 7},
    {SOURCE_NORMAL, 459, 7},
    {SOURCE_NORMAL, 460, 3},
    {SOURCE_NORMAL, 461, 3},
    {SOURCE_NORMAL, 462, 4},
    {SOURCE_NORMAL, 463, 4},
    {SOURCE_NORMAL, 464, 4},
    {SOURCE_NORMAL, 465, 4},
    {SOURCE_NORMAL, 466, 3},
    {SOURCE_NORMAL, 467, 8},
    {SOURCE_NORMAL, 468, 8},
    {SOURCE_NORMAL, 469, 3},
    {SOURCE_NORMAL, 472, 6}
};

// Gloves_int - desecrated_suffixes
ModifierLookup gloves_int_desecrated_suffixes[15] = {
    {SOURCE_DESECRATED, 236, 0},
    {SOURCE_DESECRATED, 237, 0},
    {SOURCE_DESECRATED, 238, 0},
    {SOURCE_DESECRATED, 239, 0},
    {SOURCE_DESECRATED, 240, 0},
    {SOURCE_DESECRATED, 241, 0},
    {SOURCE_DESECRATED, 242, 0},
    {SOURCE_DESECRATED, 250, 0},
    {SOURCE_DESECRATED, 251, 0},
    {SOURCE_DESECRATED, 243, 0},
    {SOURCE_DESECRATED, 244, 0},
    {SOURCE_DESECRATED, 245, 0},
    {SOURCE_DESECRATED, 252, 0},
    {SOURCE_DESECRATED, 253, 0},
    {SOURCE_DESECRATED, 246, 0}
};

// Gloves_int - essence_prefixes
ModifierLookup gloves_int_essence_prefixes[4] = {
    {SOURCE_ESSENCE, 184, 2},
    {SOURCE_ESSENCE, 185, 2},
    {SOURCE_ESSENCE, 188, 2},
    {SOURCE_ESSENCE, 189, 0}
};

// Gloves_int - essence_suffixes
ModifierLookup gloves_int_essence_suffixes[11] = {
    {SOURCE_ESSENCE, 190, 2},
    {SOURCE_ESSENCE, 192, 2},
    {SOURCE_ESSENCE, 193, 2},
    {SOURCE_PERFECT_ESSENCE, 60, 0},
    {SOURCE_PERFECT_ESSENCE, 61, 0},
    {SOURCE_ESSENCE, 194, 2},
    {SOURCE_ESSENCE, 195, 2},
    {SOURCE_ESSENCE, 196, 2},
    {SOURCE_PERFECT_ESSENCE, 62, 0},
    {SOURCE_ESSENCE, 197, 2},
    {SOURCE_PERFECT_ESSENCE, 63, 0}
};

// Gloves_str - normal_prefixes
ModifierLookup gloves_str_normal_prefixes[10] = {
    {SOURCE_NORMAL, 316, 6},  // Armour%
    {SOURCE_NORMAL, 407, 5},  // Armour%/Life
    {SOURCE_NORMAL, 439, 5},
    {SOURCE_NORMAL, 442, 8},
    {SOURCE_NORMAL, 445, 8},
    {SOURCE_NORMAL, 448, 8},
    {SOURCE_NORMAL, 449, 7},
    {SOURCE_NORMAL, 450, 7},
    {SOURCE_NORMAL, 451, 7},
    {SOURCE_NORMAL, 452, 7}
};

// Gloves_str - normal_suffixes
ModifierLookup gloves_str_normal_suffixes[17] = {
    {SOURCE_NORMAL, 453, 5},
    {SOURCE_NORMAL, 454, 4},
    {SOURCE_NORMAL, 456, 4},
    {SOURCE_NORMAL, 457, 4},
    {SOURCE_NORMAL, 458, 7},
    {SOURCE_NORMAL, 459, 7},
    {SOURCE_NORMAL, 460, 3},
    {SOURCE_NORMAL, 461, 3},
    {SOURCE_NORMAL, 462, 4},
    {SOURCE_NORMAL, 463, 4},
    {SOURCE_NORMAL, 464, 4},
    {SOURCE_NORMAL, 465, 4},
    {SOURCE_NORMAL, 466, 3},
    {SOURCE_NORMAL, 467, 8},
    {SOURCE_NORMAL, 468, 8},
    {SOURCE_NORMAL, 469, 3},
    {SOURCE_NORMAL, 470, 3}
};

// Gloves_str - desecrated_suffixes
ModifierLookup gloves_str_desecrated_suffixes[12] = {
    {SOURCE_DESECRATED, 236, 0},
    {SOURCE_DESECRATED, 237, 0},
    {SOURCE_DESECRATED, 238, 0},
    {SOURCE_DESECRATED, 239, 0},
    {SOURCE_DESECRATED, 247, 0},
    {SOURCE_DESECRATED, 240, 0},
    {SOURCE_DESECRATED, 241, 0},
    {SOURCE_DESECRATED, 242, 0},
    {SOURCE_DESECRATED, 243, 0},
    {SOURCE_DESECRATED, 244, 0},
    {SOURCE_DESECRATED, 245, 0},
    {SOURCE_DESECRATED, 246, 0}
};

// Gloves_str - essence_prefixes
ModifierLookup gloves_str_essence_prefixes[4] = {
    {SOURCE_ESSENCE, 184, 2},
    {SOURCE_ESSENCE, 185, 2},
    {SOURCE_ESSENCE, 186, 2},
    {SOURCE_ESSENCE, 189, 0}
};

// Gloves_str - essence_suffixes
ModifierLookup gloves_str_essence_suffixes[11] = {
    {SOURCE_ESSENCE, 190, 2},
    {SOURCE_ESSENCE, 191, 2},
    {SOURCE_ESSENCE, 192, 2},
    {SOURCE_PERFECT_ESSENCE, 60, 0},
    {SOURCE_PERFECT_ESSENCE, 61, 0},
    {SOURCE_ESSENCE, 194, 2},
    {SOURCE_ESSENCE, 195, 2},
    {SOURCE_ESSENCE, 196, 2},
    {SOURCE_PERFECT_ESSENCE, 62, 0},
    {SOURCE_ESSENCE, 197, 2},
    {SOURCE_PERFECT_ESSENCE, 63, 0}
};

// Gloves_str_int - normal_prefixes
ModifierLookup gloves_str_int_normal_prefixes[10] = {
    {SOURCE_NORMAL, 473, 6},
    {SOURCE_NORMAL, 474, 6},
    {SOURCE_NORMAL, 476, 5},
    {SOURCE_NORMAL, 479, 8},
    {SOURCE_NORMAL, 482, 8},
    {SOURCE_NORMAL, 484, 8},
    {SOURCE_NORMAL, 485, 7},
    {SOURCE_NORMAL, 486, 7},
    {SOURCE_NORMAL, 487, 7},
    {SOURCE_NORMAL, 488, 7}
};

// Gloves_str_int - normal_suffixes
ModifierLookup gloves_str_int_normal_suffixes[18] = {
    {SOURCE_NORMAL, 489, 5},
    {SOURCE_NORMAL, 490, 4},
    {SOURCE_NORMAL, 492, 4},
    {SOURCE_NORMAL, 493, 4},
    {SOURCE_NORMAL, 494, 7},
    {SOURCE_NORMAL, 495, 7},
    {SOURCE_NORMAL, 496, 3},
    {SOURCE_NORMAL, 497, 3},
    {SOURCE_NORMAL, 498, 4},
    {SOURCE_NORMAL, 499, 4},
    {SOURCE_NORMAL, 500, 4},
    {SOURCE_NORMAL, 501, 4},
    {SOURCE_NORMAL, 502, 3},
    {SOURCE_NORMAL, 503, 9},
    {SOURCE_NORMAL, 504, 9},
    {SOURCE_NORMAL, 505, 7},
    {SOURCE_NORMAL, 508, 6},
    {SOURCE_NORMAL, 506, 7}
};

// Gloves_str_int - desecrated_suffixes
ModifierLookup gloves_str_int_desecrated_suffixes[16] = {
    {SOURCE_DESECRATED, 254, 0},
    {SOURCE_DESECRATED, 255, 0},
    {SOURCE_DESECRATED, 256, 0},
    {SOURCE_DESECRATED, 257, 0},
    {SOURCE_DESECRATED, 265, 0},
    {SOURCE_DESECRATED, 258, 0},
    {SOURCE_DESECRATED, 259, 0},
    {SOURCE_DESECRATED, 260, 0},
    {SOURCE_DESECRATED, 268, 0},
    {SOURCE_DESECRATED, 269, 0},
    {SOURCE_DESECRATED, 261, 0},
    {SOURCE_DESECRATED, 262, 0},
    {SOURCE_DESECRATED, 263, 0},
    {SOURCE_DESECRATED, 270, 0},
    {SOURCE_DESECRATED, 271, 0},
    {SOURCE_DESECRATED, 264, 0}
};

// Gloves_str_int - essence_prefixes
ModifierLookup gloves_str_int_essence_prefixes[4] = {
    {SOURCE_ESSENCE, 198, 2},
    {SOURCE_ESSENCE, 199, 2},
    {SOURCE_ESSENCE, 204, 2},
    {SOURCE_ESSENCE, 206, 0}
};

// Gloves_str_int - essence_suffixes
ModifierLookup gloves_str_int_essence_suffixes[12] = {
    {SOURCE_ESSENCE, 207, 2},
    {SOURCE_ESSENCE, 208, 2},
    {SOURCE_ESSENCE, 209, 2},
    {SOURCE_ESSENCE, 210, 2},
    {SOURCE_PERFECT_ESSENCE, 64, 0},
    {SOURCE_PERFECT_ESSENCE, 65, 0},
    {SOURCE_ESSENCE, 211, 2},
    {SOURCE_ESSENCE, 212, 2},
    {SOURCE_ESSENCE, 213, 2},
    {SOURCE_PERFECT_ESSENCE, 66, 0},
    {SOURCE_ESSENCE, 214, 2},
    {SOURCE_PERFECT_ESSENCE, 67, 0}
};

// Gloves_str_dex - normal_prefixes
ModifierLookup gloves_str_dex_normal_prefixes[10] = {
    {SOURCE_NORMAL, 345, 6},  // Armour/Evasion%
    {SOURCE_NORMAL, 475, 5},  // Armour/Evasion%/Life
    {SOURCE_NORMAL, 478, 8},
    {SOURCE_NORMAL, 481, 8},
    {SOURCE_NORMAL, 484, 8},
    {SOURCE_NORMAL, 485, 7},
    {SOURCE_NORMAL, 486, 7},
    {SOURCE_NORMAL, 487, 7},
    {SOURCE_NORMAL, 488, 7}
};

// Gloves_str_dex - normal_suffixes
ModifierLookup gloves_str_dex_normal_suffixes[19] = {
    {SOURCE_NORMAL, 489, 5},
    {SOURCE_NORMAL, 490, 4},
    {SOURCE_NORMAL, 491, 1},
    {SOURCE_NORMAL, 492, 4},
    {SOURCE_NORMAL, 493, 4},
    {SOURCE_NORMAL, 494, 7},
    {SOURCE_NORMAL, 495, 7},
    {SOURCE_NORMAL, 496, 3},
    {SOURCE_NORMAL, 497, 3},
    {SOURCE_NORMAL, 498, 4},
    {SOURCE_NORMAL, 499, 4},
    {SOURCE_NORMAL, 500, 4},
    {SOURCE_NORMAL, 501, 4},
    {SOURCE_NORMAL, 502, 3},
    {SOURCE_NORMAL, 503, 9},
    {SOURCE_NORMAL, 504, 9},
    {SOURCE_NORMAL, 505, 7},
    {SOURCE_NORMAL, 506, 7},
    {SOURCE_NORMAL, 507, 7}
};

// Gloves_str_dex - desecrated_suffixes
ModifierLookup gloves_str_dex_desecrated_suffixes[14] = {
    {SOURCE_DESECRATED, 254, 0},
    {SOURCE_DESECRATED, 255, 0},
    {SOURCE_DESECRATED, 256, 0},
    {SOURCE_DESECRATED, 266, 0},
    {SOURCE_DESECRATED, 257, 0},
    {SOURCE_DESECRATED, 267, 0},
    {SOURCE_DESECRATED, 265, 0},
    {SOURCE_DESECRATED, 258, 0},
    {SOURCE_DESECRATED, 259, 0},
    {SOURCE_DESECRATED, 260, 0},
    {SOURCE_DESECRATED, 261, 0},
    {SOURCE_DESECRATED, 262, 0},
    {SOURCE_DESECRATED, 263, 0},
    {SOURCE_DESECRATED, 264, 0}
};

// Gloves_str_dex - essence_prefixes
ModifierLookup gloves_str_dex_essence_prefixes[4] = {
    {SOURCE_ESSENCE, 198, 2},
    {SOURCE_ESSENCE, 199, 2},
    {SOURCE_ESSENCE, 203, 2},
    {SOURCE_ESSENCE, 206, 0}
};

// Gloves_str_dex - essence_suffixes
ModifierLookup gloves_str_dex_essence_suffixes[11] = {
    {SOURCE_ESSENCE, 207, 2},
    {SOURCE_ESSENCE, 208, 2},
    {SOURCE_ESSENCE, 209, 2},
    {SOURCE_PERFECT_ESSENCE, 64, 0},
    {SOURCE_PERFECT_ESSENCE, 65, 0},
    {SOURCE_ESSENCE, 211, 2},
    {SOURCE_ESSENCE, 212, 2},
    {SOURCE_ESSENCE, 213, 2},
    {SOURCE_PERFECT_ESSENCE, 66, 0},
    {SOURCE_ESSENCE, 214, 2},
    {SOURCE_PERFECT_ESSENCE, 67, 0}
};

// Body_Armours_str - normal_prefixes
ModifierLookup body_armours_str_normal_prefixes[7] = {
    {SOURCE_NORMAL, 406, 7},
    {SOURCE_NORMAL, 407, 5},
    {SOURCE_NORMAL, 410, 5},
    {SOURCE_NORMAL, 413, 6},
    {SOURCE_NORMAL, 416, 7},
    {SOURCE_NORMAL, 419, 7},
    {SOURCE_NORMAL, 420, 7}
};

// Body_Armours_str - normal_suffixes
ModifierLookup body_armours_str_normal_suffixes[12] = {
    {SOURCE_NORMAL, 421, 5},
    {SOURCE_NORMAL, 424, 10},
    {SOURCE_NORMAL, 425, 4},
    {SOURCE_NORMAL, 426, 4},
    {SOURCE_NORMAL, 427, 4},
    {SOURCE_NORMAL, 428, 5},
    {SOURCE_NORMAL, 429, 5},
    {SOURCE_NORMAL, 430, 5},
    {SOURCE_NORMAL, 431, 8},
    {SOURCE_NORMAL, 432, 8},
    {SOURCE_NORMAL, 433, 6},
    {SOURCE_NORMAL, 434, 6}
};

// Body_Armours_str - desecrated_suffixes
ModifierLookup body_armours_str_desecrated_suffixes[10] = {
    {SOURCE_DESECRATED, 223, 0},
    {SOURCE_DESECRATED, 224, 0},
    {SOURCE_DESECRATED, 225, 0},
    {SOURCE_DESECRATED, 226, 0},
    {SOURCE_DESECRATED, 227, 0},
    {SOURCE_DESECRATED, 228, 0},
    {SOURCE_DESECRATED, 229, 0},
    {SOURCE_DESECRATED, 231, 0},
    {SOURCE_DESECRATED, 230, 0},
    {SOURCE_DESECRATED, 232, 0}
};

// Body_Armours_str - essence_prefixes
ModifierLookup body_armours_str_essence_prefixes[5] = {
    {SOURCE_ESSENCE, 173, 2},
    {SOURCE_ESSENCE, 174, 2},
    {SOURCE_PERFECT_ESSENCE, 56, 0},
    {SOURCE_PERFECT_ESSENCE, 57, 0},
    {SOURCE_PERFECT_ESSENCE, 58, 0}
};

// Body_Armours_str - essence_suffixes
ModifierLookup body_armours_str_essence_suffixes[6] = {
    {SOURCE_ESSENCE, 177, 2},
    {SOURCE_ESSENCE, 178, 2},
    {SOURCE_PERFECT_ESSENCE, 59, 0},
    {SOURCE_ESSENCE, 181, 2},
    {SOURCE_ESSENCE, 182, 2},
    {SOURCE_ESSENCE, 183, 2}
};

// Body_Armours_str_int - normal_prefixes
ModifierLookup body_armours_str_int_normal_prefixes[7] = {
    {SOURCE_NORMAL, 375, 7},
    {SOURCE_NORMAL, 377, 5},
    {SOURCE_NORMAL, 380, 5},
    {SOURCE_NORMAL, 383, 7},
    {SOURCE_NORMAL, 386, 7},
    {SOURCE_NORMAL, 388, 7},
    {SOURCE_NORMAL, 389, 7}
};

// Body_Armours_str_int - normal_suffixes
ModifierLookup body_armours_str_int_normal_suffixes[14] = {
    {SOURCE_NORMAL, 390, 5},
    {SOURCE_NORMAL, 392, 9},
    {SOURCE_NORMAL, 393, 10},
    {SOURCE_NORMAL, 394, 4},
    {SOURCE_NORMAL, 395, 4},
    {SOURCE_NORMAL, 396, 4},
    {SOURCE_NORMAL, 397, 5},
    {SOURCE_NORMAL, 398, 5},
    {SOURCE_NORMAL, 399, 5},
    {SOURCE_NORMAL, 400, 12},
    {SOURCE_NORMAL, 401, 10},
    {SOURCE_NORMAL, 402, 10},
    {SOURCE_NORMAL, 405, 7},
    {SOURCE_NORMAL, 403, 10}
};

// Body_Armours_str_int - desecrated_suffixes
ModifierLookup body_armours_str_int_desecrated_suffixes[11] = {
    {SOURCE_DESECRATED, 210, 0},
    {SOURCE_DESECRATED, 211, 0},
    {SOURCE_DESECRATED, 212, 0},
    {SOURCE_DESECRATED, 213, 0},
    {SOURCE_DESECRATED, 214, 0},
    {SOURCE_DESECRATED, 215, 0},
    {SOURCE_DESECRATED, 216, 0},
    {SOURCE_DESECRATED, 222, 0},
    {SOURCE_DESECRATED, 218, 0},
    {SOURCE_DESECRATED, 217, 0},
    {SOURCE_DESECRATED, 219, 0}
};

// Body_Armours_str_int - essence_prefixes
ModifierLookup body_armours_str_int_essence_prefixes[5] = {
    {SOURCE_ESSENCE, 159, 2},
    {SOURCE_ESSENCE, 164, 2},
    {SOURCE_PERFECT_ESSENCE, 52, 0},
    {SOURCE_PERFECT_ESSENCE, 53, 0},
    {SOURCE_PERFECT_ESSENCE, 54, 0}
};

// Body_Armours_str_int - essence_suffixes
ModifierLookup body_armours_str_int_essence_suffixes[7] = {
    {SOURCE_ESSENCE, 166, 2},
    {SOURCE_ESSENCE, 167, 2},
    {SOURCE_ESSENCE, 169, 2},
    {SOURCE_PERFECT_ESSENCE, 55, 0},
    {SOURCE_ESSENCE, 170, 2},
    {SOURCE_ESSENCE, 171, 2},
    {SOURCE_ESSENCE, 172, 2}
};

// Body_Armours_str_dex - normal_prefixes
ModifierLookup body_armours_str_dex_normal_prefixes[7] = {
    {SOURCE_NORMAL, 375, 7},
    {SOURCE_NORMAL, 376, 5},
    {SOURCE_NORMAL, 379, 5},
    {SOURCE_NORMAL, 382, 6},
    {SOURCE_NORMAL, 385, 8},
    {SOURCE_NORMAL, 388, 7},
    {SOURCE_NORMAL, 389, 7}
};

// Body_Armours_str_dex - normal_suffixes
ModifierLookup body_armours_str_dex_normal_suffixes[14] = {
    {SOURCE_NORMAL, 390, 5},
    {SOURCE_NORMAL, 391, 4},
    {SOURCE_NORMAL, 393, 10},
    {SOURCE_NORMAL, 394, 4},
    {SOURCE_NORMAL, 395, 4},
    {SOURCE_NORMAL, 396, 4},
    {SOURCE_NORMAL, 397, 5},
    {SOURCE_NORMAL, 398, 5},
    {SOURCE_NORMAL, 399, 5},
    {SOURCE_NORMAL, 400, 12},
    {SOURCE_NORMAL, 401, 10},
    {SOURCE_NORMAL, 402, 10},
    {SOURCE_NORMAL, 403, 10},
    {SOURCE_NORMAL, 404, 7}
};

// Body_Armours_str_dex - desecrated_suffixes
ModifierLookup body_armours_str_dex_desecrated_suffixes[12] = {
    {SOURCE_DESECRATED, 210, 0},
    {SOURCE_DESECRATED, 211, 0},
    {SOURCE_DESECRATED, 212, 0},
    {SOURCE_DESECRATED, 213, 0},
    {SOURCE_DESECRATED, 214, 0},
    {SOURCE_DESECRATED, 215, 0},
    {SOURCE_DESECRATED, 216, 0},
    {SOURCE_DESECRATED, 218, 0},
    {SOURCE_DESECRATED, 217, 0},
    {SOURCE_DESECRATED, 220, 0},
    {SOURCE_DESECRATED, 221, 0},
    {SOURCE_DESECRATED, 219, 0}
};

// Body_Armours_str_dex - essence_prefixes
ModifierLookup body_armours_str_dex_essence_prefixes[5] = {
    {SOURCE_ESSENCE, 159, 2},
    {SOURCE_ESSENCE, 163, 2},
    {SOURCE_PERFECT_ESSENCE, 52, 0},
    {SOURCE_PERFECT_ESSENCE, 53, 0},
    {SOURCE_PERFECT_ESSENCE, 54, 0}
};

// Body_Armours_str_dex - essence_suffixes
ModifierLookup body_armours_str_dex_essence_suffixes[7] = {
    {SOURCE_ESSENCE, 166, 2},
    {SOURCE_ESSENCE, 167, 2},
    {SOURCE_ESSENCE, 168, 2},
    {SOURCE_PERFECT_ESSENCE, 55, 0},
    {SOURCE_ESSENCE, 170, 2},
    {SOURCE_ESSENCE, 171, 2},
    {SOURCE_ESSENCE, 172, 2}
};

// Body_Armours_int - normal_prefixes
ModifierLookup body_armours_int_normal_prefixes[8] = {
    {SOURCE_NORMAL, 383, 7},
    {SOURCE_NORMAL, 406, 7},
    {SOURCE_NORMAL, 409, 5},
    {SOURCE_NORMAL, 412, 5},
    {SOURCE_NORMAL, 415, 7},
    {SOURCE_NORMAL, 418, 7},
    {SOURCE_NORMAL, 419, 7},
    {SOURCE_NORMAL, 420, 7}
};

// Body_Armours_int - normal_suffixes
ModifierLookup body_armours_int_normal_suffixes[12] = {
    {SOURCE_NORMAL, 423, 9},
    {SOURCE_NORMAL, 424, 10},
    {SOURCE_NORMAL, 425, 4},
    {SOURCE_NORMAL, 426, 4},
    {SOURCE_NORMAL, 427, 4},
    {SOURCE_NORMAL, 428, 5},
    {SOURCE_NORMAL, 429, 5},
    {SOURCE_NORMAL, 430, 5},
    {SOURCE_NORMAL, 431, 8},
    {SOURCE_NORMAL, 432, 8},
    {SOURCE_NORMAL, 433, 6},
    {SOURCE_NORMAL, 436, 6}
};

// Body_Armours_int - desecrated_suffixes
ModifierLookup body_armours_int_desecrated_suffixes[11] = {
    {SOURCE_DESECRATED, 223, 0},
    {SOURCE_DESECRATED, 224, 0},
    {SOURCE_DESECRATED, 225, 0},
    {SOURCE_DESECRATED, 226, 0},
    {SOURCE_DESECRATED, 227, 0},
    {SOURCE_DESECRATED, 228, 0},
    {SOURCE_DESECRATED, 229, 0},
    {SOURCE_DESECRATED, 235, 0},
    {SOURCE_DESECRATED, 231, 0},
    {SOURCE_DESECRATED, 230, 0},
    {SOURCE_DESECRATED, 232, 0}
};

// Body_Armours_int - essence_prefixes
ModifierLookup body_armours_int_essence_prefixes[5] = {
    {SOURCE_ESSENCE, 173, 2},
    {SOURCE_ESSENCE, 176, 2},
    {SOURCE_PERFECT_ESSENCE, 56, 0},
    {SOURCE_PERFECT_ESSENCE, 57, 0},
    {SOURCE_PERFECT_ESSENCE, 58, 0}
};

// Body_Armours_int - essence_suffixes
ModifierLookup body_armours_int_essence_suffixes[6] = {
    {SOURCE_ESSENCE, 177, 2},
    {SOURCE_ESSENCE, 180, 2},
    {SOURCE_PERFECT_ESSENCE, 59, 0},
    {SOURCE_ESSENCE, 181, 2},
    {SOURCE_ESSENCE, 182, 2},
    {SOURCE_ESSENCE, 183, 2}
};

// Body_Armours_dex - normal_prefixes
ModifierLookup body_armours_dex_normal_prefixes[7] = {
    {SOURCE_NORMAL, 406, 7},
    {SOURCE_NORMAL, 408, 5},
    {SOURCE_NORMAL, 411, 5},
    {SOURCE_NORMAL, 414, 7},
    {SOURCE_NORMAL, 417, 7},
    {SOURCE_NORMAL, 419, 7},
    {SOURCE_NORMAL, 420, 7}
};

// Body_Armours_dex - normal_suffixes
ModifierLookup body_armours_dex_normal_suffixes[12] = {
    {SOURCE_NORMAL, 422, 4},
    {SOURCE_NORMAL, 424, 10},
    {SOURCE_NORMAL, 425, 4},
    {SOURCE_NORMAL, 426, 4},
    {SOURCE_NORMAL, 427, 4},
    {SOURCE_NORMAL, 428, 5},
    {SOURCE_NORMAL, 429, 5},
    {SOURCE_NORMAL, 430, 5},
    {SOURCE_NORMAL, 431, 8},
    {SOURCE_NORMAL, 432, 8},
    {SOURCE_NORMAL, 433, 6},
    {SOURCE_NORMAL, 435, 6}
};

// Body_Armours_dex - desecrated_suffixes
ModifierLookup body_armours_dex_desecrated_suffixes[12] = {
    {SOURCE_DESECRATED, 223, 0},
    {SOURCE_DESECRATED, 224, 0},
    {SOURCE_DESECRATED, 225, 0},
    {SOURCE_DESECRATED, 226, 0},
    {SOURCE_DESECRATED, 227, 0},
    {SOURCE_DESECRATED, 228, 0},
    {SOURCE_DESECRATED, 229, 0},
    {SOURCE_DESECRATED, 231, 0},
    {SOURCE_DESECRATED, 230, 0},
    {SOURCE_DESECRATED, 233, 0},
    {SOURCE_DESECRATED, 234, 0},
    {SOURCE_DESECRATED, 232, 0}
};

// Body_Armours_dex - essence_prefixes
ModifierLookup body_armours_dex_essence_prefixes[5] = {
    {SOURCE_ESSENCE, 173, 2},
    {SOURCE_ESSENCE, 175, 2},
    {SOURCE_PERFECT_ESSENCE, 56, 0},
    {SOURCE_PERFECT_ESSENCE, 57, 0},
    {SOURCE_PERFECT_ESSENCE, 58, 0}
};

// Body_Armours_dex - essence_suffixes
ModifierLookup body_armours_dex_essence_suffixes[6] = {
    {SOURCE_ESSENCE, 177, 2},
    {SOURCE_ESSENCE, 179, 2},
    {SOURCE_PERFECT_ESSENCE, 59, 0},
    {SOURCE_ESSENCE, 181, 2},
    {SOURCE_ESSENCE, 182, 2},
    {SOURCE_ESSENCE, 183, 2}
};

// Body_Armours_dex_int - normal_prefixes
ModifierLookup body_armours_dex_int_normal_prefixes[7] = {
    {SOURCE_NORMAL, 375, 7},
    {SOURCE_NORMAL, 378, 5},
    {SOURCE_NORMAL, 381, 5},
    {SOURCE_NORMAL, 384, 7},
    {SOURCE_NORMAL, 387, 7},
    {SOURCE_NORMAL, 388, 7},
    {SOURCE_NORMAL, 389, 7}
};

// Body_Armours_dex_int - normal_suffixes
ModifierLookup body_armours_dex_int_normal_suffixes[14] = {
    {SOURCE_NORMAL, 391, 4},
    {SOURCE_NORMAL, 392, 9},
    {SOURCE_NORMAL, 393, 10},
    {SOURCE_NORMAL, 394, 4},
    {SOURCE_NORMAL, 395, 4},
    {SOURCE_NORMAL, 396, 4},
    {SOURCE_NORMAL, 397, 5},
    {SOURCE_NORMAL, 398, 5},
    {SOURCE_NORMAL, 399, 5},
    {SOURCE_NORMAL, 400, 12},
    {SOURCE_NORMAL, 401, 10},
    {SOURCE_NORMAL, 402, 10},
    {SOURCE_NORMAL, 405, 7},
    {SOURCE_NORMAL, 404, 7}
};

// Body_Armours_dex_int - desecrated_suffixes
ModifierLookup body_armours_dex_int_desecrated_suffixes[13] = {
    {SOURCE_DESECRATED, 210, 0},
    {SOURCE_DESECRATED, 211, 0},
    {SOURCE_DESECRATED, 212, 0},
    {SOURCE_DESECRATED, 213, 0},
    {SOURCE_DESECRATED, 214, 0},
    {SOURCE_DESECRATED, 215, 0},
    {SOURCE_DESECRATED, 216, 0},
    {SOURCE_DESECRATED, 222, 0},
    {SOURCE_DESECRATED, 218, 0},
    {SOURCE_DESECRATED, 217, 0},
    {SOURCE_DESECRATED, 220, 0},
    {SOURCE_DESECRATED, 221, 0},
    {SOURCE_DESECRATED, 219, 0}
};

// Body_Armours_dex_int - essence_prefixes
ModifierLookup body_armours_dex_int_essence_prefixes[5] = {
    {SOURCE_ESSENCE, 159, 2},
    {SOURCE_ESSENCE, 165, 2},
    {SOURCE_PERFECT_ESSENCE, 52, 0},
    {SOURCE_PERFECT_ESSENCE, 53, 0},
    {SOURCE_PERFECT_ESSENCE, 54, 0}
};

// Body_Armours_dex_int - essence_suffixes
ModifierLookup body_armours_dex_int_essence_suffixes[7] = {
    {SOURCE_ESSENCE, 166, 2},
    {SOURCE_ESSENCE, 168, 2},
    {SOURCE_ESSENCE, 169, 2},
    {SOURCE_PERFECT_ESSENCE, 55, 0},
    {SOURCE_ESSENCE, 170, 2},
    {SOURCE_ESSENCE, 171, 2},
    {SOURCE_ESSENCE, 172, 2}
};

// Wands - normal_prefixes
ModifierLookup wands_normal_prefixes[11] = {
    {SOURCE_NORMAL, 184, 7},
    {SOURCE_NORMAL, 185, 7},
    {SOURCE_NORMAL, 186, 5},
    {SOURCE_NORMAL, 187, 5},
    {SOURCE_NORMAL, 188, 5},
    {SOURCE_NORMAL, 189, 7},
    {SOURCE_NORMAL, 190, 4},
    {SOURCE_NORMAL, 191, 3},
    {SOURCE_NORMAL, 192, 4},
    {SOURCE_NORMAL, 193, 4},
    {SOURCE_NORMAL, 194, 4}
};

// Wands - normal_suffixes
ModifierLookup wands_normal_suffixes[18] = {
    {SOURCE_NORMAL, 195, 4},
    {SOURCE_NORMAL, 196, 4},
    {SOURCE_NORMAL, 197, 5},
    {SOURCE_NORMAL, 198, 7},
    {SOURCE_NORMAL, 199, 7},
    {SOURCE_NORMAL, 200, 6},
    {SOURCE_NORMAL, 201, 5},
    {SOURCE_NORMAL, 202, 5},
    {SOURCE_NORMAL, 203, 2},
    {SOURCE_NORMAL, 204, 4},
    {SOURCE_NORMAL, 205, 4},
    {SOURCE_NORMAL, 206, 4},
    {SOURCE_NORMAL, 207, 10},
    {SOURCE_NORMAL, 208, 9},
    {SOURCE_NORMAL, 209, 7},
    {SOURCE_NORMAL, 210, 5},
    {SOURCE_NORMAL, 211, 6},
    {SOURCE_NORMAL, 212, 2}
};

// Wands - desecrated_prefixes
ModifierLookup wands_desecrated_prefixes[5] = {
    {SOURCE_DESECRATED, 96, 0},
    {SOURCE_DESECRATED, 97, 0},
    {SOURCE_DESECRATED, 98, 0},
    {SOURCE_DESECRATED, 99, 0},
    {SOURCE_DESECRATED, 100, 0}
};

// Wands - desecrated_suffixes
ModifierLookup wands_desecrated_suffixes[8] = {
    {SOURCE_DESECRATED, 101, 0},
    {SOURCE_DESECRATED, 102, 0},
    {SOURCE_DESECRATED, 103, 0},
    {SOURCE_DESECRATED, 104, 0},
    {SOURCE_DESECRATED, 105, 0},
    {SOURCE_DESECRATED, 106, 0},
    {SOURCE_DESECRATED, 107, 0},
    {SOURCE_DESECRATED, 108, 0}
};

// Wands - essence_prefixes
ModifierLookup wands_essence_prefixes[1] = {
    {SOURCE_ESSENCE, 70, 2}
};

// Wands - essence_suffixes
ModifierLookup wands_essence_suffixes[7] = {
    {SOURCE_ESSENCE, 71, 2},
    {SOURCE_ESSENCE, 72, 2},
    {SOURCE_ESSENCE, 73, 2},
    {SOURCE_PERFECT_ESSENCE, 39, 0},
    {SOURCE_ESSENCE, 74, 2},
    {SOURCE_ESSENCE, 75, 2},
    {SOURCE_PERFECT_ESSENCE, 40, 0}
};

// Quarterstaves - normal_prefixes
ModifierLookup quarterstaves_normal_prefixes[8] = {
    {SOURCE_NORMAL, 22, 9},
    {SOURCE_NORMAL, 23, 9},
    {SOURCE_NORMAL, 24, 9},
    {SOURCE_NORMAL, 25, 7},
    {SOURCE_NORMAL, 26, 7},
    {SOURCE_NORMAL, 27, 5},
    {SOURCE_NORMAL, 28, 7},
    {SOURCE_NORMAL, 29, 7}
};

// Quarterstaves - normal_suffixes
ModifierLookup quarterstaves_normal_suffixes[15] = {
    {SOURCE_NORMAL, 30, 4},
    {SOURCE_NORMAL, 31, 4},
    {SOURCE_NORMAL, 32, 4},
    {SOURCE_NORMAL, 33, 4},
    {SOURCE_NORMAL, 34, 7},
    {SOURCE_NORMAL, 35, 7},
    {SOURCE_NORMAL, 36, 3},
    {SOURCE_NORMAL, 37, 7},
    {SOURCE_NORMAL, 38, 5},
    {SOURCE_NORMAL, 39, 5},
    {SOURCE_NORMAL, 40, 2},
    {SOURCE_NORMAL, 41, 5},
    {SOURCE_NORMAL, 42, 5},
    {SOURCE_NORMAL, 43, 10},
    {SOURCE_NORMAL, 44, 7}
};

// Quarterstaves - desecrated_prefixes
ModifierLookup quarterstaves_desecrated_prefixes[6] = {
    {SOURCE_DESECRATED, 16, 0},
    {SOURCE_DESECRATED, 17, 0},
    {SOURCE_DESECRATED, 18, 0},
    {SOURCE_DESECRATED, 19, 0},
    {SOURCE_DESECRATED, 20, 0},
    {SOURCE_DESECRATED, 21, 0}
};

// Quarterstaves - desecrated_suffixes
ModifierLookup quarterstaves_desecrated_suffixes[6] = {
    {SOURCE_DESECRATED, 22, 0},
    {SOURCE_DESECRATED, 23, 0},
    {SOURCE_DESECRATED, 24, 0},
    {SOURCE_DESECRATED, 25, 0},
    {SOURCE_DESECRATED, 26, 0},
    {SOURCE_DESECRATED, 27, 0}
};

// Quarterstaves - essence_prefixes
ModifierLookup quarterstaves_essence_prefixes[9] = {
    {SOURCE_ESSENCE, 10, 2},
    {SOURCE_ESSENCE, 11, 2},
    {SOURCE_ESSENCE, 12, 2},
    {SOURCE_ESSENCE, 13, 2},
    {SOURCE_ESSENCE, 14, 2},
    {SOURCE_PERFECT_ESSENCE, 6, 0},
    {SOURCE_PERFECT_ESSENCE, 7, 0},
    {SOURCE_PERFECT_ESSENCE, 8, 0},
    {SOURCE_PERFECT_ESSENCE, 9, 0}
};

// Quarterstaves - essence_suffixes
ModifierLookup quarterstaves_essence_suffixes[7] = {
    {SOURCE_ESSENCE, 15, 2},
    {SOURCE_ESSENCE, 16, 2},
    {SOURCE_ESSENCE, 17, 2},
    {SOURCE_ESSENCE, 18, 2},
    {SOURCE_PERFECT_ESSENCE, 10, 0},
    {SOURCE_PERFECT_ESSENCE, 11, 0},
    {SOURCE_ESSENCE, 19, 2}
};

// Foci - normal_prefixes
ModifierLookup foci_normal_prefixes[17] = {
    {SOURCE_NORMAL, 403, 10},   // +# to maximum Energy Shield (flat ES) - 10 tiers for Foci (not 11) - "Incandescent" T1 at tier 9
    {SOURCE_NORMAL, 406, 7},   // #% increased Energy Shield - 8 tiers - "Shade's, Ghost's, etc."
    {SOURCE_NORMAL, 603, 6},   // #% increased Energy Shield - 7 tiers - "Indomitable" at tier 5, etc.
    {SOURCE_NORMAL, 409, 5},   // #% increased ES + # to Life (hybrid) - 6 tiers
    {SOURCE_NORMAL, 412, 5},   // +# to ES + #% increased ES (hybrid) - 6 tiers
    {SOURCE_NORMAL, 257, 5},   // #% increased ES + # to Mana (hybrid) - 6 tiers - "Celestial" at tier 3
    {SOURCE_NORMAL, 260, 7},
    {SOURCE_NORMAL, 264, 7},
    {SOURCE_NORMAL, 263, 7},
    {SOURCE_NORMAL, 265, 7},
    {SOURCE_NORMAL, 266, 7},
    {SOURCE_NORMAL, 267, 7},
    {SOURCE_NORMAL, 268, 5},
    {SOURCE_NORMAL, 269, 4},
    {SOURCE_NORMAL, 262, 7},
    {SOURCE_NORMAL, 261, 7},
    {SOURCE_NORMAL, 263, 7}
};

// Foci - normal_suffixes
ModifierLookup foci_normal_suffixes[15] = {
    {SOURCE_NORMAL, 270, 1},   // +# to Level of all Spell Skills
    {SOURCE_NORMAL, 271, 5},   // #% increased Mana Regeneration Rate
    {SOURCE_NORMAL, 272, 5},   // #% increased Cast Speed
    {SOURCE_NORMAL, 273, 4},   // #% increased Critical Hit Chance for Spells
    {SOURCE_NORMAL, 274, 4},   // #% increased Critical Spell Damage Bonus
    {SOURCE_NORMAL, 275, 5},   // #% increased Energy Shield Recharge Rate
    {SOURCE_NORMAL, 276, 5},   // #% faster start of Energy Shield Recharge
    {SOURCE_NORMAL, 277, 10},   // +# to maximum Life
    {SOURCE_NORMAL, 278, 9},   // +# to Evasion Rating
    {SOURCE_NORMAL, 279, 7},   // #% increased Evasion Rating
    {SOURCE_NORMAL, 280, 5},   // #% increased Evasion Rating + # to Stun Threshold
    {SOURCE_NORMAL, 281, 6},   // # to # Physical Thorns damage
    {SOURCE_NORMAL, 282, 2},   // (#–#)% increased Block chance
    {SOURCE_NORMAL, 214, 7},   // +#% to Fire Resistance (ADDED)
    {SOURCE_NORMAL, 217, 5}    // +#% to Chaos Resistance (ADDED)
};

// Foci - desecrated_prefixes
ModifierLookup foci_desecrated_prefixes[6] = {
    {SOURCE_DESECRATED, 147, 0},
    {SOURCE_DESECRATED, 148, 0},
    {SOURCE_DESECRATED, 149, 0},
    {SOURCE_DESECRATED, 150, 0},
    {SOURCE_DESECRATED, 151, 0},
    {SOURCE_DESECRATED, 152, 0}
};

// Foci - desecrated_suffixes
ModifierLookup foci_desecrated_suffixes[11] = {
    {SOURCE_DESECRATED, 153, 0},
    {SOURCE_DESECRATED, 154, 0},
    {SOURCE_DESECRATED, 155, 0},
    {SOURCE_DESECRATED, 156, 0},
    {SOURCE_DESECRATED, 157, 0},
    {SOURCE_DESECRATED, 158, 0},
    {SOURCE_DESECRATED, 159, 0},
    {SOURCE_DESECRATED, 160, 0},
    {SOURCE_DESECRATED, 161, 0},
    {SOURCE_DESECRATED, 162, 0},
    {SOURCE_DESECRATED, 163, 0}
};

// Foci - essence_prefixes
ModifierLookup foci_essence_prefixes[5] = {
    {SOURCE_ESSENCE, 101, 2},
    {SOURCE_ESSENCE, 102, 2},
    {SOURCE_ESSENCE, 103, 2},
    {SOURCE_ESSENCE, 104, 2},
    {SOURCE_ESSENCE, 105, 2}
};

// Foci - essence_suffixes
ModifierLookup foci_essence_suffixes[12] = {
    {SOURCE_ESSENCE, 106, 2},
    {SOURCE_ESSENCE, 107, 2},
    {SOURCE_ESSENCE, 108, 2},
    {SOURCE_ESSENCE, 109, 2},
    {SOURCE_PERFECT_ESSENCE, 43, 0},
    {SOURCE_PERFECT_ESSENCE, 44, 0},
    {SOURCE_ESSENCE, 110, 2},
    {SOURCE_ESSENCE, 111, 2},
    {SOURCE_ESSENCE, 112, 2},
    {SOURCE_ESSENCE, 113, 2},
    {SOURCE_ESSENCE, 114, 2},
    {SOURCE_PERFECT_ESSENCE, 45, 0}
};

// Bucklers - normal_prefixes
ModifierLookup bucklers_normal_prefixes[6] = {
    {SOURCE_NORMAL, 283, 7},
    {SOURCE_NORMAL, 284, 7},
    {SOURCE_NORMAL, 285, 7},
    {SOURCE_NORMAL, 286, 7},
    {SOURCE_NORMAL, 287, 5},
    {SOURCE_NORMAL, 288, 4}
};

// Bucklers - normal_suffixes
ModifierLookup bucklers_normal_suffixes[13] = {
    {SOURCE_NORMAL, 289, 9},
    {SOURCE_NORMAL, 290, 2},
    {SOURCE_NORMAL, 291, 2},
    {SOURCE_NORMAL, 292, 2},
    {SOURCE_NORMAL, 293, 2},
    {SOURCE_NORMAL, 294, 1},
    {SOURCE_NORMAL, 295, 5},
    {SOURCE_NORMAL, 296, 8},
    {SOURCE_NORMAL, 297, 8},
    {SOURCE_NORMAL, 298, 8},
    {SOURCE_NORMAL, 299, 8},
    {SOURCE_NORMAL, 300, 8},
    {SOURCE_NORMAL, 301, 4}
};

// Bucklers - desecrated_suffixes
ModifierLookup bucklers_desecrated_suffixes[12] = {
    {SOURCE_DESECRATED, 165, 0},
    {SOURCE_DESECRATED, 166, 0},
    {SOURCE_DESECRATED, 168, 0},
    {SOURCE_DESECRATED, 167, 0},
    {SOURCE_DESECRATED, 164, 0},
    {SOURCE_DESECRATED, 171, 0},
    {SOURCE_DESECRATED, 170, 0},
    {SOURCE_DESECRATED, 169, 0},
    {SOURCE_DESECRATED, 173, 0},
    {SOURCE_DESECRATED, 172, 0},
    {SOURCE_DESECRATED, 174, 0},
    {SOURCE_DESECRATED, 175, 0}
};

// Bucklers - essence_prefixes
ModifierLookup bucklers_essence_prefixes[5] = {
    {SOURCE_ESSENCE, 115, 2},
    {SOURCE_ESSENCE, 116, 2},
    {SOURCE_ESSENCE, 117, 2},
    {SOURCE_ESSENCE, 118, 2},
    {SOURCE_PERFECT_ESSENCE, 46, 0}
};

// Bucklers - essence_suffixes
ModifierLookup bucklers_essence_suffixes[7] = {
    {SOURCE_ESSENCE, 119, 2},
    {SOURCE_ESSENCE, 120, 2},
    {SOURCE_ESSENCE, 121, 2},
    {SOURCE_ESSENCE, 122, 2},
    {SOURCE_ESSENCE, 123, 2},
    {SOURCE_ESSENCE, 124, 2},
    {SOURCE_ESSENCE, 125, 2}
};

// Staves - normal_prefixes
ModifierLookup staves_normal_prefixes[11] = {
    {SOURCE_NORMAL, 45, 6},
    {SOURCE_NORMAL, 46, 7},
    {SOURCE_NORMAL, 47, 7},
    {SOURCE_NORMAL, 48, 7},
    {SOURCE_NORMAL, 49, 7},
    {SOURCE_NORMAL, 50, 7},
    {SOURCE_NORMAL, 51, 5},
    {SOURCE_NORMAL, 52, 5},
    {SOURCE_NORMAL, 53, 5},
    {SOURCE_NORMAL, 54, 7},
    {SOURCE_NORMAL, 55, 4}
};

// Staves - normal_suffixes
ModifierLookup staves_normal_suffixes[18] = {
    {SOURCE_NORMAL, 56, 3},
    {SOURCE_NORMAL, 57, 4},
    {SOURCE_NORMAL, 58, 4},
    {SOURCE_NORMAL, 59, 4},
    {SOURCE_NORMAL, 60, 4},
    {SOURCE_NORMAL, 61, 4},
    {SOURCE_NORMAL, 62, 5},
    {SOURCE_NORMAL, 63, 7},
    {SOURCE_NORMAL, 64, 7},
    {SOURCE_NORMAL, 65, 6},
    {SOURCE_NORMAL, 66, 5},
    {SOURCE_NORMAL, 67, 5},
    {SOURCE_NORMAL, 68, 2},
    {SOURCE_NORMAL, 69, 4},
    {SOURCE_NORMAL, 70, 4},
    {SOURCE_NORMAL, 71, 4},
    {SOURCE_NORMAL, 72, 8},
    {SOURCE_NORMAL, 73, 9}
};

// Staves - desecrated_prefixes
ModifierLookup staves_desecrated_prefixes[4] = {
    {SOURCE_DESECRATED, 28, 0},
    {SOURCE_DESECRATED, 29, 0},
    {SOURCE_DESECRATED, 30, 0},
    {SOURCE_DESECRATED, 31, 0}
};

// Staves - desecrated_suffixes
ModifierLookup staves_desecrated_suffixes[5] = {
    {SOURCE_DESECRATED, 32, 0},
    {SOURCE_DESECRATED, 33, 0},
    {SOURCE_DESECRATED, 34, 0},
    {SOURCE_DESECRATED, 35, 0},
    {SOURCE_DESECRATED, 36, 0}
};

// Staves - essence_prefixes
ModifierLookup staves_essence_prefixes[1] = {
    {SOURCE_ESSENCE, 20, 2}
};

// Staves - essence_suffixes
ModifierLookup staves_essence_suffixes[7] = {
    {SOURCE_ESSENCE, 21, 2},
    {SOURCE_ESSENCE, 22, 2},
    {SOURCE_ESSENCE, 23, 2},
    {SOURCE_PERFECT_ESSENCE, 12, 0},
    {SOURCE_ESSENCE, 24, 2},
    {SOURCE_ESSENCE, 25, 2},
    {SOURCE_PERFECT_ESSENCE, 13, 0}
};

// =============================================================================
// LOOKUP RETRIEVAL FUNCTION
// =============================================================================

// Get modifier lookups for an item by item_id and source
// Returns NULL arrays if item doesn't support that source
ItemModLookupResult get_item_mod_lookup(int item_id, ModifierSource source) {
    ItemModLookupResult result = {0};
    
    switch (item_id) {
        case 0: // Bows
            if (source == SOURCE_NORMAL) { result.prefixes = bows_normal_prefixes; result.prefix_count = 8; result.suffixes = bows_normal_suffixes; result.suffix_count = 13; }
            else if (source == SOURCE_DESECRATED) { result.prefixes = bows_desecrated_prefixes; result.prefix_count = 7; result.suffixes = bows_desecrated_suffixes; result.suffix_count = 8; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = bows_essence_prefixes; result.prefix_count = 9; result.suffixes = bows_essence_suffixes; result.suffix_count = 7; }
            break;
        case 1: // Crossbows
            if (source == SOURCE_NORMAL) { result.prefixes = crossbows_normal_prefixes; result.prefix_count = 8; result.suffixes = crossbows_normal_suffixes; result.suffix_count = 14; }
            else if (source == SOURCE_DESECRATED) { result.prefixes = crossbows_desecrated_prefixes; result.prefix_count = 6; result.suffixes = crossbows_desecrated_suffixes; result.suffix_count = 7; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = crossbows_essence_prefixes; result.prefix_count = 9; result.suffixes = crossbows_essence_suffixes; result.suffix_count = 7; }
            break;
        case 2: // Quivers
            if (source == SOURCE_NORMAL) { result.prefixes = quivers_normal_prefixes; result.prefix_count = 7; result.suffixes = quivers_normal_suffixes; result.suffix_count = 8; }
            else if (source == SOURCE_DESECRATED) { result.prefixes = quivers_desecrated_prefixes; result.prefix_count = 1; result.suffixes = quivers_desecrated_suffixes; result.suffix_count = 3; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = quivers_essence_prefixes; result.prefix_count = 2; result.suffixes = quivers_essence_suffixes; result.suffix_count = 1; }
            break;
        case 3: // OneHand_Maces
            if (source == SOURCE_NORMAL) { result.prefixes = onehand_maces_normal_prefixes; result.prefix_count = 8; result.suffixes = onehand_maces_normal_suffixes; result.suffix_count = 14; }
            else if (source == SOURCE_DESECRATED) { result.prefixes = onehand_maces_desecrated_prefixes; result.prefix_count = 8; result.suffixes = onehand_maces_desecrated_suffixes; result.suffix_count = 8; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = onehand_maces_essence_prefixes; result.prefix_count = 9; result.suffixes = onehand_maces_essence_suffixes; result.suffix_count = 7; }
            break;
        case 4: // Amulets
            if (source == SOURCE_NORMAL) { result.prefixes = amulets_normal_prefixes; result.prefix_count = 10; result.suffixes = amulets_normal_suffixes; result.suffix_count = 21; }
            else if (source == SOURCE_DESECRATED) { result.prefixes = amulets_desecrated_prefixes; result.prefix_count = 11; result.suffixes = amulets_desecrated_suffixes; result.suffix_count = 19; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = amulets_essence_prefixes; result.prefix_count = 3; result.suffixes = amulets_essence_suffixes; result.suffix_count = 12; }
            break;
        case 5: // Spears
            if (source == SOURCE_NORMAL) { result.prefixes = spears_normal_prefixes; result.prefix_count = 8; result.suffixes = spears_normal_suffixes; result.suffix_count = 16; }
            else if (source == SOURCE_DESECRATED) { result.prefixes = spears_desecrated_prefixes; result.prefix_count = 6; result.suffixes = spears_desecrated_suffixes; result.suffix_count = 8; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = spears_essence_prefixes; result.prefix_count = 9; result.suffixes = spears_essence_suffixes; result.suffix_count = 7; }
            break;
        case 6: // Shields_str_int
            if (source == SOURCE_NORMAL) { result.prefixes = shields_str_int_normal_prefixes; result.prefix_count = 6; result.suffixes = shields_str_int_normal_suffixes; result.suffix_count = 16; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = shields_str_int_desecrated_suffixes; result.suffix_count = 19; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = shields_str_int_essence_prefixes; result.prefix_count = 3; result.suffixes = shields_str_int_essence_suffixes; result.suffix_count = 6; }
            break;
        case 7: // Shields_str
            if (source == SOURCE_NORMAL) { result.prefixes = shields_str_normal_prefixes; result.prefix_count = 6; result.suffixes = shields_str_normal_suffixes; result.suffix_count = 14; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = shields_str_desecrated_suffixes; result.suffix_count = 19; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = shields_str_essence_prefixes; result.prefix_count = 3; result.suffixes = shields_str_essence_suffixes; result.suffix_count = 5; }
            break;
        case 8: // Shields_str_dex
            if (source == SOURCE_NORMAL) { result.prefixes = shields_str_dex_normal_prefixes; result.prefix_count = 6; result.suffixes = shields_str_dex_normal_suffixes; result.suffix_count = 15; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = shields_str_dex_desecrated_suffixes; result.suffix_count = 19; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = shields_str_dex_essence_prefixes; result.prefix_count = 3; result.suffixes = shields_str_dex_essence_suffixes; result.suffix_count = 6; }
            break;
        case 9: // TwoHand_Maces
            if (source == SOURCE_NORMAL) { result.prefixes = twohand_maces_normal_prefixes; result.prefix_count = 8; result.suffixes = twohand_maces_normal_suffixes; result.suffix_count = 14; }
            else if (source == SOURCE_DESECRATED) { result.prefixes = twohand_maces_desecrated_prefixes; result.prefix_count = 8; result.suffixes = twohand_maces_desecrated_suffixes; result.suffix_count = 8; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = twohand_maces_essence_prefixes; result.prefix_count = 9; result.suffixes = twohand_maces_essence_suffixes; result.suffix_count = 7; }
            break;
        case 10: // Helmets_str_int
            if (source == SOURCE_NORMAL) { result.prefixes = helmets_str_int_normal_prefixes; result.prefix_count = 8; result.suffixes = helmets_str_int_normal_suffixes; result.suffix_count = 14; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = helmets_str_int_desecrated_suffixes; result.suffix_count = 15; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = helmets_str_int_essence_prefixes; result.prefix_count = 3; result.suffixes = helmets_str_int_essence_suffixes; result.suffix_count = 9; }
            break;
        case 11: // Helmets_int
            if (source == SOURCE_NORMAL) { result.prefixes = helmets_int_normal_prefixes; result.prefix_count = 11; result.suffixes = helmets_int_normal_suffixes; result.suffix_count = 14; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = helmets_int_desecrated_suffixes; result.suffix_count = 12; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = helmets_int_essence_prefixes; result.prefix_count = 3; result.suffixes = helmets_int_essence_suffixes; result.suffix_count = 8; }
            break;
        case 12: // Helmets_dex_int
            if (source == SOURCE_NORMAL) { result.prefixes = helmets_dex_int_normal_prefixes; result.prefix_count = 8; result.suffixes = helmets_dex_int_normal_suffixes; result.suffix_count = 14; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = helmets_dex_int_desecrated_suffixes; result.suffix_count = 14; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = helmets_dex_int_essence_prefixes; result.prefix_count = 3; result.suffixes = helmets_dex_int_essence_suffixes; result.suffix_count = 9; }
            break;
        case 13: // Helmets_str
            if (source == SOURCE_NORMAL) { result.prefixes = helmets_str_normal_prefixes; result.prefix_count = 8; result.suffixes = helmets_str_normal_suffixes; result.suffix_count = 13; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = helmets_str_desecrated_suffixes; result.suffix_count = 14; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = helmets_str_essence_prefixes; result.prefix_count = 3; result.suffixes = helmets_str_essence_suffixes; result.suffix_count = 9; }
            break;
        case 14: // Helmets_dex
            if (source == SOURCE_NORMAL) { result.prefixes = helmets_dex_normal_prefixes; result.prefix_count = 8; result.suffixes = helmets_dex_normal_suffixes; result.suffix_count = 13; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = helmets_dex_desecrated_suffixes; result.suffix_count = 13; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = helmets_dex_essence_prefixes; result.prefix_count = 3; result.suffixes = helmets_dex_essence_suffixes; result.suffix_count = 9; }
            break;
        case 15: // Helmets_str_dex
            if (source == SOURCE_NORMAL) { result.prefixes = helmets_str_dex_normal_prefixes; result.prefix_count = 8; result.suffixes = helmets_str_dex_normal_suffixes; result.suffix_count = 14; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = helmets_str_dex_desecrated_suffixes; result.suffix_count = 16; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = helmets_str_dex_essence_prefixes; result.prefix_count = 3; result.suffixes = helmets_str_dex_essence_suffixes; result.suffix_count = 10; }
            break;
        case 16: // Sceptres
            if (source == SOURCE_NORMAL) { result.prefixes = sceptres_normal_prefixes; result.prefix_count = 8; result.suffixes = sceptres_normal_suffixes; result.suffix_count = 13; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = sceptres_essence_prefixes; result.prefix_count = 1; result.suffixes = sceptres_essence_suffixes; result.suffix_count = 4; }
            break;
        case 17: // Boots_str_int
            if (source == SOURCE_NORMAL) { result.prefixes = boots_str_int_normal_prefixes; result.prefix_count = 10; result.suffixes = boots_str_int_normal_suffixes; result.suffix_count = 18; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = boots_str_int_desecrated_suffixes; result.suffix_count = 15; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = boots_str_int_essence_prefixes; result.prefix_count = 4; result.suffixes = boots_str_int_essence_suffixes; result.suffix_count = 8; }
            break;
        case 18: // Boots_str
            if (source == SOURCE_NORMAL) { result.prefixes = boots_str_normal_prefixes; result.prefix_count = 6; result.suffixes = boots_str_normal_suffixes; result.suffix_count = 13; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = boots_str_desecrated_suffixes; result.suffix_count = 15; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = boots_str_essence_prefixes; result.prefix_count = 4; result.suffixes = boots_str_essence_suffixes; result.suffix_count = 7; }
            break;
        case 19: // Boots_int
            if (source == SOURCE_NORMAL) { result.prefixes = boots_int_normal_prefixes; result.prefix_count = 6; result.suffixes = boots_int_normal_suffixes; result.suffix_count = 13; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = boots_int_desecrated_suffixes; result.suffix_count = 15; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = boots_int_essence_prefixes; result.prefix_count = 4; result.suffixes = boots_int_essence_suffixes; result.suffix_count = 7; }
            break;
        case 20: // Boots_dex
            if (source == SOURCE_NORMAL) { result.prefixes = boots_dex_normal_prefixes; result.prefix_count = 6; result.suffixes = boots_dex_normal_suffixes; result.suffix_count = 13; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = boots_dex_desecrated_suffixes; result.suffix_count = 15; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = boots_dex_essence_prefixes; result.prefix_count = 4; result.suffixes = boots_dex_essence_suffixes; result.suffix_count = 7; }
            break;
        case 21: // Boots_dex_int
            if (source == SOURCE_NORMAL) { result.prefixes = boots_dex_int_normal_prefixes; result.prefix_count = 6; result.suffixes = boots_dex_int_normal_suffixes; result.suffix_count = 15; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = boots_dex_int_desecrated_suffixes; result.suffix_count = 15; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = boots_dex_int_essence_prefixes; result.prefix_count = 4; result.suffixes = boots_dex_int_essence_suffixes; result.suffix_count = 8; }
            break;
        case 22: // Boots_str_dex
            if (source == SOURCE_NORMAL) { result.prefixes = boots_str_dex_normal_prefixes; result.prefix_count = 6; result.suffixes = boots_str_dex_normal_suffixes; result.suffix_count = 15; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = boots_str_dex_desecrated_suffixes; result.suffix_count = 15; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = boots_str_dex_essence_prefixes; result.prefix_count = 4; result.suffixes = boots_str_dex_essence_suffixes; result.suffix_count = 8; }
            break;
        case 23: // Bucklers
            if (source == SOURCE_NORMAL) { result.prefixes = bucklers_normal_prefixes; result.prefix_count = 6; result.suffixes = bucklers_normal_suffixes; result.suffix_count = 13; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = bucklers_desecrated_suffixes; result.suffix_count = 12; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = bucklers_essence_prefixes; result.prefix_count = 5; result.suffixes = bucklers_essence_suffixes; result.suffix_count = 7; }
            break;
        case 24: // Rings
            if (source == SOURCE_NORMAL) { result.prefixes = rings_normal_prefixes; result.prefix_count = 13; result.suffixes = rings_normal_suffixes; result.suffix_count = 18; }
            else if (source == SOURCE_DESECRATED) { result.prefixes = rings_desecrated_prefixes; result.prefix_count = 7; result.suffixes = rings_desecrated_suffixes; result.suffix_count = 15; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = rings_essence_prefixes; result.prefix_count = 3; result.suffixes = rings_essence_suffixes; result.suffix_count = 9; }
            break;
        case 25: // Gloves_dex
            if (source == SOURCE_NORMAL) { result.prefixes = gloves_dex_normal_prefixes; result.prefix_count = 10; result.suffixes = gloves_dex_normal_suffixes; result.suffix_count = 16; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = gloves_dex_desecrated_suffixes; result.suffix_count = 13; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = gloves_dex_essence_prefixes; result.prefix_count = 3; result.suffixes = gloves_dex_essence_suffixes; result.suffix_count = 11; }
            break;
        case 26: // Gloves_dex_int
            if (source == SOURCE_NORMAL) { result.prefixes = gloves_dex_int_normal_prefixes; result.prefix_count = 10; result.suffixes = gloves_dex_int_normal_suffixes; result.suffix_count = 18; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = gloves_dex_int_desecrated_suffixes; result.suffix_count = 16; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = gloves_dex_int_essence_prefixes; result.prefix_count = 4; result.suffixes = gloves_dex_int_essence_suffixes; result.suffix_count = 11; }
            break;
        case 27: // Gloves_int
            if (source == SOURCE_NORMAL) { result.prefixes = gloves_int_normal_prefixes; result.prefix_count = 10; result.suffixes = gloves_int_normal_suffixes; result.suffix_count = 17; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = gloves_int_desecrated_suffixes; result.suffix_count = 15; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = gloves_int_essence_prefixes; result.prefix_count = 4; result.suffixes = gloves_int_essence_suffixes; result.suffix_count = 11; }
            break;
        case 28: // Gloves_str
            if (source == SOURCE_NORMAL) { result.prefixes = gloves_str_normal_prefixes; result.prefix_count = 10; result.suffixes = gloves_str_normal_suffixes; result.suffix_count = 17; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = gloves_str_desecrated_suffixes; result.suffix_count = 12; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = gloves_str_essence_prefixes; result.prefix_count = 4; result.suffixes = gloves_str_essence_suffixes; result.suffix_count = 11; }
            break;
        case 29: // Gloves_str_int
            if (source == SOURCE_NORMAL) { result.prefixes = gloves_str_int_normal_prefixes; result.prefix_count = 10; result.suffixes = gloves_str_int_normal_suffixes; result.suffix_count = 18; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = gloves_str_int_desecrated_suffixes; result.suffix_count = 16; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = gloves_str_int_essence_prefixes; result.prefix_count = 4; result.suffixes = gloves_str_int_essence_suffixes; result.suffix_count = 12; }
            break;
        case 30: // Gloves_str_dex
            if (source == SOURCE_NORMAL) { result.prefixes = gloves_str_dex_normal_prefixes; result.prefix_count = 10; result.suffixes = gloves_str_dex_normal_suffixes; result.suffix_count = 19; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = gloves_str_dex_desecrated_suffixes; result.suffix_count = 14; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = gloves_str_dex_essence_prefixes; result.prefix_count = 4; result.suffixes = gloves_str_dex_essence_suffixes; result.suffix_count = 11; }
            break;
        case 31: // Body_Armours_str
            if (source == SOURCE_NORMAL) { result.prefixes = body_armours_str_normal_prefixes; result.prefix_count = 7; result.suffixes = body_armours_str_normal_suffixes; result.suffix_count = 12; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = body_armours_str_desecrated_suffixes; result.suffix_count = 10; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = body_armours_str_essence_prefixes; result.prefix_count = 5; result.suffixes = body_armours_str_essence_suffixes; result.suffix_count = 6; }
            break;
        case 32: // Body_Armours_str_int
            if (source == SOURCE_NORMAL) { result.prefixes = body_armours_str_int_normal_prefixes; result.prefix_count = 7; result.suffixes = body_armours_str_int_normal_suffixes; result.suffix_count = 14; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = body_armours_str_int_desecrated_suffixes; result.suffix_count = 11; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = body_armours_str_int_essence_prefixes; result.prefix_count = 5; result.suffixes = body_armours_str_int_essence_suffixes; result.suffix_count = 7; }
            break;
        case 33: // Body_Armours_str_dex
            if (source == SOURCE_NORMAL) { result.prefixes = body_armours_str_dex_normal_prefixes; result.prefix_count = 7; result.suffixes = body_armours_str_dex_normal_suffixes; result.suffix_count = 14; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = body_armours_str_dex_desecrated_suffixes; result.suffix_count = 12; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = body_armours_str_dex_essence_prefixes; result.prefix_count = 5; result.suffixes = body_armours_str_dex_essence_suffixes; result.suffix_count = 7; }
            break;
        case 34: // Body_Armours_int
            if (source == SOURCE_NORMAL) { result.prefixes = body_armours_int_normal_prefixes; result.prefix_count = 8; result.suffixes = body_armours_int_normal_suffixes; result.suffix_count = 12; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = body_armours_int_desecrated_suffixes; result.suffix_count = 11; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = body_armours_int_essence_prefixes; result.prefix_count = 5; result.suffixes = body_armours_int_essence_suffixes; result.suffix_count = 6; }
            break;
        case 35: // Body_Armours_dex
            if (source == SOURCE_NORMAL) { result.prefixes = body_armours_dex_normal_prefixes; result.prefix_count = 7; result.suffixes = body_armours_dex_normal_suffixes; result.suffix_count = 12; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = body_armours_dex_desecrated_suffixes; result.suffix_count = 12; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = body_armours_dex_essence_prefixes; result.prefix_count = 5; result.suffixes = body_armours_dex_essence_suffixes; result.suffix_count = 6; }
            break;
        case 36: // Body_Armours_dex_int
            if (source == SOURCE_NORMAL) { result.prefixes = body_armours_dex_int_normal_prefixes; result.prefix_count = 7; result.suffixes = body_armours_dex_int_normal_suffixes; result.suffix_count = 14; }
            else if (source == SOURCE_DESECRATED) { result.suffixes = body_armours_dex_int_desecrated_suffixes; result.suffix_count = 13; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = body_armours_dex_int_essence_prefixes; result.prefix_count = 5; result.suffixes = body_armours_dex_int_essence_suffixes; result.suffix_count = 7; }
            break;
        case 37: // Wands
            if (source == SOURCE_NORMAL) { result.prefixes = wands_normal_prefixes; result.prefix_count = 11; result.suffixes = wands_normal_suffixes; result.suffix_count = 18; }
            else if (source == SOURCE_DESECRATED) { result.prefixes = wands_desecrated_prefixes; result.prefix_count = 5; result.suffixes = wands_desecrated_suffixes; result.suffix_count = 8; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = wands_essence_prefixes; result.prefix_count = 1; result.suffixes = wands_essence_suffixes; result.suffix_count = 7; }
            break;
        case 38: // Quarterstaves
            if (source == SOURCE_NORMAL) { result.prefixes = quarterstaves_normal_prefixes; result.prefix_count = 8; result.suffixes = quarterstaves_normal_suffixes; result.suffix_count = 15; }
            else if (source == SOURCE_DESECRATED) { result.prefixes = quarterstaves_desecrated_prefixes; result.prefix_count = 6; result.suffixes = quarterstaves_desecrated_suffixes; result.suffix_count = 6; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = quarterstaves_essence_prefixes; result.prefix_count = 9; result.suffixes = quarterstaves_essence_suffixes; result.suffix_count = 7; }
            break;
        case 39: // Foci
            if (source == SOURCE_NORMAL) { result.prefixes = foci_normal_prefixes; result.prefix_count = 17; result.suffixes = foci_normal_suffixes; result.suffix_count = 15; }
            else if (source == SOURCE_DESECRATED) { result.prefixes = foci_desecrated_prefixes; result.prefix_count = 6; result.suffixes = foci_desecrated_suffixes; result.suffix_count = 11; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = foci_essence_prefixes; result.prefix_count = 5; result.suffixes = foci_essence_suffixes; result.suffix_count = 12; }
            break;
        case 40: // Staves
            if (source == SOURCE_NORMAL) { result.prefixes = staves_normal_prefixes; result.prefix_count = 11; result.suffixes = staves_normal_suffixes; result.suffix_count = 18; }
            else if (source == SOURCE_DESECRATED) { result.prefixes = staves_desecrated_prefixes; result.prefix_count = 4; result.suffixes = staves_desecrated_suffixes; result.suffix_count = 5; }
            else if (source == SOURCE_ESSENCE) { result.prefixes = staves_essence_prefixes; result.prefix_count = 1; result.suffixes = staves_essence_suffixes; result.suffix_count = 7; }
            break;
    }
    
    return result;
}
