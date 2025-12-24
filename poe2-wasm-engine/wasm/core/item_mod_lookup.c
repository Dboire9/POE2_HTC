#include "item_mod_lookup.h"

// Lookup tables: item -> (source, per-source index, max_tier) tuples
// max_tier_index limits which tiers can roll (0-based, 255 = no limit)

// Bows - normal_prefixes
ModifierLookup bows_normal_prefixes[8] = {
    {SOURCE_NORMAL, 96, 8},
    {SOURCE_NORMAL, 97, 9},
    {SOURCE_NORMAL, 98, 9},
    {SOURCE_NORMAL, 99, 9},
    {SOURCE_NORMAL, 100, 7},
    {SOURCE_NORMAL, 101, 7},
    {SOURCE_NORMAL, 102, 7},
    {SOURCE_NORMAL, 103, 5}
};

// Bows - normal_suffixes
ModifierLookup bows_normal_suffixes[13] = {
    {SOURCE_NORMAL, 104, 7},
    {SOURCE_NORMAL, 105, 4},
    {SOURCE_NORMAL, 106, 4},
    {SOURCE_NORMAL, 107, 3},
    {SOURCE_NORMAL, 108, 3},
    {SOURCE_NORMAL, 109, 7},
    {SOURCE_NORMAL, 110, 7},
    {SOURCE_NORMAL, 111, 3},
    {SOURCE_NORMAL, 112, 4},
    {SOURCE_NORMAL, 113, 5},
    {SOURCE_NORMAL, 114, 5},
    {SOURCE_NORMAL, 115, 2},
    {SOURCE_NORMAL, 116, 1}
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
    {SOURCE_NORMAL, 74, 8},
    {SOURCE_NORMAL, 75, 9},
    {SOURCE_NORMAL, 76, 9},
    {SOURCE_NORMAL, 77, 9},
    {SOURCE_NORMAL, 78, 7},
    {SOURCE_NORMAL, 79, 7},
    {SOURCE_NORMAL, 80, 7},
    {SOURCE_NORMAL, 81, 5}
};

// Crossbows - normal_suffixes
ModifierLookup crossbows_normal_suffixes[14] = {
    {SOURCE_NORMAL, 82, 7},
    {SOURCE_NORMAL, 83, 7},
    {SOURCE_NORMAL, 84, 4},
    {SOURCE_NORMAL, 85, 4},
    {SOURCE_NORMAL, 86, 3},
    {SOURCE_NORMAL, 87, 3},
    {SOURCE_NORMAL, 88, 7},
    {SOURCE_NORMAL, 89, 7},
    {SOURCE_NORMAL, 90, 3},
    {SOURCE_NORMAL, 91, 4},
    {SOURCE_NORMAL, 92, 5},
    {SOURCE_NORMAL, 93, 5},
    {SOURCE_NORMAL, 94, 2},
    {SOURCE_NORMAL, 95, 1}
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
    {SOURCE_NORMAL, 302, 8},
    {SOURCE_NORMAL, 303, 8},
    {SOURCE_NORMAL, 304, 8},
    {SOURCE_NORMAL, 305, 8},
    {SOURCE_NORMAL, 306, 8},
    {SOURCE_NORMAL, 307, 4},
    {SOURCE_NORMAL, 308, 5}
};

// Quivers - normal_suffixes
ModifierLookup quivers_normal_suffixes[8] = {
    {SOURCE_NORMAL, 309, 7},
    {SOURCE_NORMAL, 310, 1},
    {SOURCE_NORMAL, 311, 5},
    {SOURCE_NORMAL, 312, 5},
    {SOURCE_NORMAL, 313, 3},
    {SOURCE_NORMAL, 314, 5},
    {SOURCE_NORMAL, 315, 5},
    {SOURCE_NORMAL, 316, 4}
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
    {SOURCE_NORMAL, 117, 8},
    {SOURCE_NORMAL, 118, 9},
    {SOURCE_NORMAL, 119, 9},
    {SOURCE_NORMAL, 120, 9},
    {SOURCE_NORMAL, 121, 7},
    {SOURCE_NORMAL, 122, 7},
    {SOURCE_NORMAL, 123, 7},
    {SOURCE_NORMAL, 124, 5}
};

// OneHand_Maces - normal_suffixes
ModifierLookup onehand_maces_normal_suffixes[14] = {
    {SOURCE_NORMAL, 125, 7},
    {SOURCE_NORMAL, 126, 4},
    {SOURCE_NORMAL, 127, 4},
    {SOURCE_NORMAL, 128, 4},
    {SOURCE_NORMAL, 129, 4},
    {SOURCE_NORMAL, 130, 7},
    {SOURCE_NORMAL, 131, 7},
    {SOURCE_NORMAL, 132, 3},
    {SOURCE_NORMAL, 133, 7},
    {SOURCE_NORMAL, 134, 5},
    {SOURCE_NORMAL, 135, 5},
    {SOURCE_NORMAL, 136, 2},
    {SOURCE_NORMAL, 137, 5},
    {SOURCE_NORMAL, 138, 5}
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
    {SOURCE_NORMAL, 604, 9},
    {SOURCE_NORMAL, 605, 9},
    {SOURCE_NORMAL, 606, 9},
    {SOURCE_NORMAL, 607, 6},
    {SOURCE_NORMAL, 608, 6},
    {SOURCE_NORMAL, 609, 6},
    {SOURCE_NORMAL, 610, 7},
    {SOURCE_NORMAL, 611, 4},
    {SOURCE_NORMAL, 612, 4},
    {SOURCE_NORMAL, 613, 5}
};

// Amulets - normal_suffixes
ModifierLookup amulets_normal_suffixes[21] = {
    {SOURCE_NORMAL, 614, 7},
    {SOURCE_NORMAL, 615, 7},
    {SOURCE_NORMAL, 616, 7},
    {SOURCE_NORMAL, 617, 8},
    {SOURCE_NORMAL, 618, 7},
    {SOURCE_NORMAL, 619, 7},
    {SOURCE_NORMAL, 620, 7},
    {SOURCE_NORMAL, 621, 5},
    {SOURCE_NORMAL, 622, 5},
    {SOURCE_NORMAL, 623, 2},
    {SOURCE_NORMAL, 624, 2},
    {SOURCE_NORMAL, 625, 2},
    {SOURCE_NORMAL, 626, 2},
    {SOURCE_NORMAL, 627, 9},
    {SOURCE_NORMAL, 628, 5},
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
    {SOURCE_NORMAL, 160, 8},
    {SOURCE_NORMAL, 161, 9},
    {SOURCE_NORMAL, 162, 9},
    {SOURCE_NORMAL, 163, 9},
    {SOURCE_NORMAL, 164, 7},
    {SOURCE_NORMAL, 165, 7},
    {SOURCE_NORMAL, 166, 7},
    {SOURCE_NORMAL, 167, 5}
};

// Spears - normal_suffixes
ModifierLookup spears_normal_suffixes[16] = {
    {SOURCE_NORMAL, 168, 7},
    {SOURCE_NORMAL, 169, 7},
    {SOURCE_NORMAL, 170, 4},
    {SOURCE_NORMAL, 171, 4},
    {SOURCE_NORMAL, 172, 4},
    {SOURCE_NORMAL, 173, 4},
    {SOURCE_NORMAL, 174, 4},
    {SOURCE_NORMAL, 175, 7},
    {SOURCE_NORMAL, 176, 7},
    {SOURCE_NORMAL, 177, 3},
    {SOURCE_NORMAL, 178, 7},
    {SOURCE_NORMAL, 179, 5},
    {SOURCE_NORMAL, 180, 5},
    {SOURCE_NORMAL, 181, 2},
    {SOURCE_NORMAL, 182, 5},
    {SOURCE_NORMAL, 183, 5}
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
    {SOURCE_NORMAL, 233, 10},
    {SOURCE_NORMAL, 235, 7},
    {SOURCE_NORMAL, 237, 7},
    {SOURCE_NORMAL, 239, 5},
    {SOURCE_NORMAL, 240, 6},
    {SOURCE_NORMAL, 241, 2}
};

// Shields_str_int - normal_suffixes
ModifierLookup shields_str_int_normal_suffixes[16] = {
    {SOURCE_NORMAL, 242, 7},
    {SOURCE_NORMAL, 244, 7},
    {SOURCE_NORMAL, 245, 7},
    {SOURCE_NORMAL, 246, 7},
    {SOURCE_NORMAL, 247, 7},
    {SOURCE_NORMAL, 248, 5},
    {SOURCE_NORMAL, 249, 4},
    {SOURCE_NORMAL, 250, 9},
    {SOURCE_NORMAL, 251, 4},
    {SOURCE_NORMAL, 252, 2},
    {SOURCE_NORMAL, 253, 2},
    {SOURCE_NORMAL, 254, 2},
    {SOURCE_NORMAL, 255, 2},
    {SOURCE_NORMAL, 256, 1},
    {SOURCE_NORMAL, 259, 5},
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
    {SOURCE_NORMAL, 213, 10},
    {SOURCE_NORMAL, 214, 9},
    {SOURCE_NORMAL, 215, 7},
    {SOURCE_NORMAL, 216, 5},
    {SOURCE_NORMAL, 217, 6},
    {SOURCE_NORMAL, 218, 2}
};

// Shields_str - normal_suffixes
ModifierLookup shields_str_normal_suffixes[14] = {
    {SOURCE_NORMAL, 219, 7},
    {SOURCE_NORMAL, 220, 7},
    {SOURCE_NORMAL, 221, 7},
    {SOURCE_NORMAL, 222, 7},
    {SOURCE_NORMAL, 223, 5},
    {SOURCE_NORMAL, 224, 4},
    {SOURCE_NORMAL, 225, 9},
    {SOURCE_NORMAL, 226, 4},
    {SOURCE_NORMAL, 227, 2},
    {SOURCE_NORMAL, 228, 2},
    {SOURCE_NORMAL, 229, 2},
    {SOURCE_NORMAL, 230, 2},
    {SOURCE_NORMAL, 231, 1},
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
    {SOURCE_NORMAL, 233, 10},
    {SOURCE_NORMAL, 234, 6},
    {SOURCE_NORMAL, 236, 7},
    {SOURCE_NORMAL, 238, 5},
    {SOURCE_NORMAL, 240, 6},
    {SOURCE_NORMAL, 241, 2}
};

// Shields_str_dex - normal_suffixes
ModifierLookup shields_str_dex_normal_suffixes[15] = {
    {SOURCE_NORMAL, 242, 7},
    {SOURCE_NORMAL, 243, 7},
    {SOURCE_NORMAL, 245, 7},
    {SOURCE_NORMAL, 246, 7},
    {SOURCE_NORMAL, 247, 7},
    {SOURCE_NORMAL, 248, 5},
    {SOURCE_NORMAL, 249, 4},
    {SOURCE_NORMAL, 250, 9},
    {SOURCE_NORMAL, 251, 4},
    {SOURCE_NORMAL, 252, 2},
    {SOURCE_NORMAL, 253, 2},
    {SOURCE_NORMAL, 254, 2},
    {SOURCE_NORMAL, 255, 2},
    {SOURCE_NORMAL, 256, 1},
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
    {SOURCE_NORMAL, 6, 7},
    {SOURCE_NORMAL, 7, 5}
};

// TwoHand_Maces - normal_suffixes
ModifierLookup twohand_maces_normal_suffixes[14] = {
    {SOURCE_NORMAL, 8, 7},
    {SOURCE_NORMAL, 9, 4},
    {SOURCE_NORMAL, 10, 4},
    {SOURCE_NORMAL, 11, 4},
    {SOURCE_NORMAL, 12, 4},
    {SOURCE_NORMAL, 13, 7},
    {SOURCE_NORMAL, 14, 7},
    {SOURCE_NORMAL, 15, 3},
    {SOURCE_NORMAL, 16, 7},
    {SOURCE_NORMAL, 17, 5},
    {SOURCE_NORMAL, 18, 5},
    {SOURCE_NORMAL, 19, 2},
    {SOURCE_NORMAL, 20, 5},
    {SOURCE_NORMAL, 21, 5}
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
    {SOURCE_NORMAL, 541, 9},
    {SOURCE_NORMAL, 542, 9},
    {SOURCE_NORMAL, 544, 4},
    {SOURCE_NORMAL, 547, 6},
    {SOURCE_NORMAL, 550, 5},
    {SOURCE_NORMAL, 553, 5},
    {SOURCE_NORMAL, 555, 8},
    {SOURCE_NORMAL, 556, 4}
};

// Helmets_str_int - normal_suffixes
ModifierLookup helmets_str_int_normal_suffixes[14] = {
    {SOURCE_NORMAL, 557, 7},
    {SOURCE_NORMAL, 559, 8},
    {SOURCE_NORMAL, 560, 7},
    {SOURCE_NORMAL, 561, 7},
    {SOURCE_NORMAL, 562, 7},
    {SOURCE_NORMAL, 563, 5},
    {SOURCE_NORMAL, 564, 4},
    {SOURCE_NORMAL, 565, 1},
    {SOURCE_NORMAL, 566, 7},
    {SOURCE_NORMAL, 567, 4},
    {SOURCE_NORMAL, 568, 4},
    {SOURCE_NORMAL, 569, 2},
    {SOURCE_NORMAL, 572, 3},
    {SOURCE_NORMAL, 570, 4}
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
ModifierLookup helmets_int_normal_prefixes[8] = {
    {SOURCE_NORMAL, 509, 9},
    {SOURCE_NORMAL, 510, 9},
    {SOURCE_NORMAL, 513, 7},
    {SOURCE_NORMAL, 516, 6},
    {SOURCE_NORMAL, 519, 5},
    {SOURCE_NORMAL, 522, 5},
    {SOURCE_NORMAL, 523, 8},
    {SOURCE_NORMAL, 524, 4}
};

// Helmets_int - normal_suffixes
ModifierLookup helmets_int_normal_suffixes[12] = {
    {SOURCE_NORMAL, 527, 8},
    {SOURCE_NORMAL, 528, 7},
    {SOURCE_NORMAL, 529, 7},
    {SOURCE_NORMAL, 530, 7},
    {SOURCE_NORMAL, 531, 5},
    {SOURCE_NORMAL, 532, 4},
    {SOURCE_NORMAL, 533, 1},
    {SOURCE_NORMAL, 534, 7},
    {SOURCE_NORMAL, 535, 4},
    {SOURCE_NORMAL, 536, 4},
    {SOURCE_NORMAL, 537, 2},
    {SOURCE_NORMAL, 540, 3}
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
    {SOURCE_NORMAL, 541, 9},
    {SOURCE_NORMAL, 542, 9},
    {SOURCE_NORMAL, 545, 4},
    {SOURCE_NORMAL, 548, 6},
    {SOURCE_NORMAL, 551, 5},
    {SOURCE_NORMAL, 554, 5},
    {SOURCE_NORMAL, 555, 8},
    {SOURCE_NORMAL, 556, 4}
};

// Helmets_dex_int - normal_suffixes
ModifierLookup helmets_dex_int_normal_suffixes[14] = {
    {SOURCE_NORMAL, 558, 7},
    {SOURCE_NORMAL, 559, 8},
    {SOURCE_NORMAL, 560, 7},
    {SOURCE_NORMAL, 561, 7},
    {SOURCE_NORMAL, 562, 7},
    {SOURCE_NORMAL, 563, 5},
    {SOURCE_NORMAL, 564, 4},
    {SOURCE_NORMAL, 565, 1},
    {SOURCE_NORMAL, 566, 7},
    {SOURCE_NORMAL, 567, 4},
    {SOURCE_NORMAL, 568, 4},
    {SOURCE_NORMAL, 569, 2},
    {SOURCE_NORMAL, 572, 3},
    {SOURCE_NORMAL, 571, 4}
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
    {SOURCE_NORMAL, 509, 9},
    {SOURCE_NORMAL, 510, 9},
    {SOURCE_NORMAL, 511, 7},
    {SOURCE_NORMAL, 514, 6},
    {SOURCE_NORMAL, 517, 5},
    {SOURCE_NORMAL, 520, 5},
    {SOURCE_NORMAL, 523, 8},
    {SOURCE_NORMAL, 524, 4}
};

// Helmets_str - normal_suffixes
ModifierLookup helmets_str_normal_suffixes[13] = {
    {SOURCE_NORMAL, 525, 7},
    {SOURCE_NORMAL, 526, 7},
    {SOURCE_NORMAL, 528, 7},
    {SOURCE_NORMAL, 529, 7},
    {SOURCE_NORMAL, 530, 7},
    {SOURCE_NORMAL, 531, 5},
    {SOURCE_NORMAL, 532, 4},
    {SOURCE_NORMAL, 533, 1},
    {SOURCE_NORMAL, 534, 7},
    {SOURCE_NORMAL, 535, 4},
    {SOURCE_NORMAL, 536, 4},
    {SOURCE_NORMAL, 537, 2},
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
    {SOURCE_NORMAL, 509, 9},
    {SOURCE_NORMAL, 510, 9},
    {SOURCE_NORMAL, 512, 7},
    {SOURCE_NORMAL, 515, 6},
    {SOURCE_NORMAL, 518, 5},
    {SOURCE_NORMAL, 521, 5},
    {SOURCE_NORMAL, 523, 8},
    {SOURCE_NORMAL, 524, 4}
};

// Helmets_dex - normal_suffixes
ModifierLookup helmets_dex_normal_suffixes[13] = {
    {SOURCE_NORMAL, 526, 7},
    {SOURCE_NORMAL, 527, 8},
    {SOURCE_NORMAL, 528, 7},
    {SOURCE_NORMAL, 529, 7},
    {SOURCE_NORMAL, 530, 7},
    {SOURCE_NORMAL, 531, 5},
    {SOURCE_NORMAL, 532, 4},
    {SOURCE_NORMAL, 533, 1},
    {SOURCE_NORMAL, 534, 7},
    {SOURCE_NORMAL, 535, 4},
    {SOURCE_NORMAL, 536, 4},
    {SOURCE_NORMAL, 537, 2},
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
    {SOURCE_NORMAL, 541, 9},
    {SOURCE_NORMAL, 542, 9},
    {SOURCE_NORMAL, 543, 4},
    {SOURCE_NORMAL, 546, 6},
    {SOURCE_NORMAL, 549, 5},
    {SOURCE_NORMAL, 552, 5},
    {SOURCE_NORMAL, 555, 8},
    {SOURCE_NORMAL, 556, 4}
};

// Helmets_str_dex - normal_suffixes
ModifierLookup helmets_str_dex_normal_suffixes[14] = {
    {SOURCE_NORMAL, 557, 7},
    {SOURCE_NORMAL, 558, 7},
    {SOURCE_NORMAL, 560, 7},
    {SOURCE_NORMAL, 561, 7},
    {SOURCE_NORMAL, 562, 7},
    {SOURCE_NORMAL, 563, 5},
    {SOURCE_NORMAL, 564, 4},
    {SOURCE_NORMAL, 565, 1},
    {SOURCE_NORMAL, 566, 7},
    {SOURCE_NORMAL, 567, 4},
    {SOURCE_NORMAL, 568, 4},
    {SOURCE_NORMAL, 569, 2},
    {SOURCE_NORMAL, 570, 4},
    {SOURCE_NORMAL, 571, 4}
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
    {SOURCE_NORMAL, 139, 10},
    {SOURCE_NORMAL, 140, 8},
    {SOURCE_NORMAL, 141, 8},
    {SOURCE_NORMAL, 142, 8},
    {SOURCE_NORMAL, 143, 8},
    {SOURCE_NORMAL, 144, 7},
    {SOURCE_NORMAL, 145, 7},
    {SOURCE_NORMAL, 146, 6}
};

// Sceptres - normal_suffixes
ModifierLookup sceptres_normal_suffixes[13] = {
    {SOURCE_NORMAL, 147, 7},
    {SOURCE_NORMAL, 148, 7},
    {SOURCE_NORMAL, 149, 5},
    {SOURCE_NORMAL, 150, 4},
    {SOURCE_NORMAL, 151, 3},
    {SOURCE_NORMAL, 152, 9},
    {SOURCE_NORMAL, 153, 3},
    {SOURCE_NORMAL, 154, 3},
    {SOURCE_NORMAL, 155, 5},
    {SOURCE_NORMAL, 156, 5},
    {SOURCE_NORMAL, 157, 2},
    {SOURCE_NORMAL, 158, 3},
    {SOURCE_NORMAL, 159, 5}
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
ModifierLookup boots_str_int_normal_prefixes[6] = {
    {SOURCE_NORMAL, 346, 8},
    {SOURCE_NORMAL, 347, 8},
    {SOURCE_NORMAL, 349, 3},
    {SOURCE_NORMAL, 352, 6},
    {SOURCE_NORMAL, 355, 5},
    {SOURCE_NORMAL, 357, 5}
};

// Boots_str_int - normal_suffixes
ModifierLookup boots_str_int_normal_suffixes[15] = {
    {SOURCE_NORMAL, 358, 7},
    {SOURCE_NORMAL, 360, 7},
    {SOURCE_NORMAL, 361, 7},
    {SOURCE_NORMAL, 362, 7},
    {SOURCE_NORMAL, 363, 7},
    {SOURCE_NORMAL, 364, 5},
    {SOURCE_NORMAL, 365, 4},
    {SOURCE_NORMAL, 366, 10},
    {SOURCE_NORMAL, 367, 7},
    {SOURCE_NORMAL, 368, 4},
    {SOURCE_NORMAL, 369, 4},
    {SOURCE_NORMAL, 370, 4},
    {SOURCE_NORMAL, 371, 4},
    {SOURCE_NORMAL, 372, 4},
    {SOURCE_NORMAL, 374, 3}
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
    {SOURCE_NORMAL, 317, 8},
    {SOURCE_NORMAL, 318, 8},
    {SOURCE_NORMAL, 319, 6},
    {SOURCE_NORMAL, 322, 6},
    {SOURCE_NORMAL, 325, 5},
    {SOURCE_NORMAL, 328, 5}
};

// Boots_str - normal_suffixes
ModifierLookup boots_str_normal_suffixes[13] = {
    {SOURCE_NORMAL, 329, 7},
    {SOURCE_NORMAL, 332, 7},
    {SOURCE_NORMAL, 333, 7},
    {SOURCE_NORMAL, 334, 7},
    {SOURCE_NORMAL, 335, 5},
    {SOURCE_NORMAL, 336, 4},
    {SOURCE_NORMAL, 337, 10},
    {SOURCE_NORMAL, 338, 7},
    {SOURCE_NORMAL, 339, 4},
    {SOURCE_NORMAL, 340, 4},
    {SOURCE_NORMAL, 341, 4},
    {SOURCE_NORMAL, 342, 4},
    {SOURCE_NORMAL, 343, 4}
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
    {SOURCE_NORMAL, 317, 8},
    {SOURCE_NORMAL, 318, 8},
    {SOURCE_NORMAL, 321, 6},
    {SOURCE_NORMAL, 324, 6},
    {SOURCE_NORMAL, 327, 5},
    {SOURCE_NORMAL, 328, 5}
};

// Boots_int - normal_suffixes
ModifierLookup boots_int_normal_suffixes[13] = {
    {SOURCE_NORMAL, 331, 7},
    {SOURCE_NORMAL, 332, 7},
    {SOURCE_NORMAL, 333, 7},
    {SOURCE_NORMAL, 334, 7},
    {SOURCE_NORMAL, 335, 5},
    {SOURCE_NORMAL, 336, 4},
    {SOURCE_NORMAL, 337, 10},
    {SOURCE_NORMAL, 338, 7},
    {SOURCE_NORMAL, 339, 4},
    {SOURCE_NORMAL, 340, 4},
    {SOURCE_NORMAL, 341, 4},
    {SOURCE_NORMAL, 342, 4},
    {SOURCE_NORMAL, 345, 3}
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
    {SOURCE_NORMAL, 317, 8},
    {SOURCE_NORMAL, 318, 8},
    {SOURCE_NORMAL, 320, 6},
    {SOURCE_NORMAL, 323, 6},
    {SOURCE_NORMAL, 326, 5},
    {SOURCE_NORMAL, 328, 5}
};

// Boots_dex - normal_suffixes
ModifierLookup boots_dex_normal_suffixes[13] = {
    {SOURCE_NORMAL, 330, 8},
    {SOURCE_NORMAL, 332, 7},
    {SOURCE_NORMAL, 333, 7},
    {SOURCE_NORMAL, 334, 7},
    {SOURCE_NORMAL, 335, 5},
    {SOURCE_NORMAL, 336, 4},
    {SOURCE_NORMAL, 337, 10},
    {SOURCE_NORMAL, 338, 7},
    {SOURCE_NORMAL, 339, 4},
    {SOURCE_NORMAL, 340, 4},
    {SOURCE_NORMAL, 341, 4},
    {SOURCE_NORMAL, 342, 4},
    {SOURCE_NORMAL, 344, 4}
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
    {SOURCE_NORMAL, 346, 8},
    {SOURCE_NORMAL, 347, 8},
    {SOURCE_NORMAL, 350, 3},
    {SOURCE_NORMAL, 353, 6},
    {SOURCE_NORMAL, 356, 5},
    {SOURCE_NORMAL, 357, 5}
};

// Boots_dex_int - normal_suffixes
ModifierLookup boots_dex_int_normal_suffixes[15] = {
    {SOURCE_NORMAL, 359, 8},
    {SOURCE_NORMAL, 360, 7},
    {SOURCE_NORMAL, 361, 7},
    {SOURCE_NORMAL, 362, 7},
    {SOURCE_NORMAL, 363, 7},
    {SOURCE_NORMAL, 364, 5},
    {SOURCE_NORMAL, 365, 4},
    {SOURCE_NORMAL, 366, 10},
    {SOURCE_NORMAL, 367, 7},
    {SOURCE_NORMAL, 368, 4},
    {SOURCE_NORMAL, 369, 4},
    {SOURCE_NORMAL, 370, 4},
    {SOURCE_NORMAL, 371, 4},
    {SOURCE_NORMAL, 374, 3},
    {SOURCE_NORMAL, 373, 4}
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
    {SOURCE_NORMAL, 346, 8},
    {SOURCE_NORMAL, 347, 8},
    {SOURCE_NORMAL, 348, 3},
    {SOURCE_NORMAL, 351, 6},
    {SOURCE_NORMAL, 354, 5},
    {SOURCE_NORMAL, 357, 5}
};

// Boots_str_dex - normal_suffixes
ModifierLookup boots_str_dex_normal_suffixes[15] = {
    {SOURCE_NORMAL, 358, 7},
    {SOURCE_NORMAL, 359, 8},
    {SOURCE_NORMAL, 361, 7},
    {SOURCE_NORMAL, 362, 7},
    {SOURCE_NORMAL, 363, 7},
    {SOURCE_NORMAL, 364, 5},
    {SOURCE_NORMAL, 365, 4},
    {SOURCE_NORMAL, 366, 10},
    {SOURCE_NORMAL, 367, 7},
    {SOURCE_NORMAL, 368, 4},
    {SOURCE_NORMAL, 369, 4},
    {SOURCE_NORMAL, 370, 4},
    {SOURCE_NORMAL, 371, 4},
    {SOURCE_NORMAL, 372, 4},
    {SOURCE_NORMAL, 373, 4}
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
    {SOURCE_NORMAL, 573, 7},
    {SOURCE_NORMAL, 574, 11},
    {SOURCE_NORMAL, 575, 8},
    {SOURCE_NORMAL, 576, 8},
    {SOURCE_NORMAL, 577, 8},
    {SOURCE_NORMAL, 578, 8},
    {SOURCE_NORMAL, 579, 8},
    {SOURCE_NORMAL, 580, 7},
    {SOURCE_NORMAL, 581, 4},
    {SOURCE_NORMAL, 582, 5},
    {SOURCE_NORMAL, 583, 5},
    {SOURCE_NORMAL, 584, 5},
    {SOURCE_NORMAL, 585, 5}
};

// Rings - normal_suffixes
ModifierLookup rings_normal_suffixes[18] = {
    {SOURCE_NORMAL, 586, 7},
    {SOURCE_NORMAL, 587, 8},
    {SOURCE_NORMAL, 588, 7},
    {SOURCE_NORMAL, 589, 3},
    {SOURCE_NORMAL, 590, 7},
    {SOURCE_NORMAL, 591, 7},
    {SOURCE_NORMAL, 592, 7},
    {SOURCE_NORMAL, 593, 4},
    {SOURCE_NORMAL, 594, 5},
    {SOURCE_NORMAL, 595, 6},
    {SOURCE_NORMAL, 596, 5},
    {SOURCE_NORMAL, 597, 2},
    {SOURCE_NORMAL, 598, 2},
    {SOURCE_NORMAL, 599, 5},
    {SOURCE_NORMAL, 600, 5},
    {SOURCE_NORMAL, 601, 3},
    {SOURCE_NORMAL, 602, 4},
    {SOURCE_NORMAL, 603, 2}
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
    {SOURCE_NORMAL, 437, 8},
    {SOURCE_NORMAL, 438, 8},
    {SOURCE_NORMAL, 440, 6},
    {SOURCE_NORMAL, 443, 6},
    {SOURCE_NORMAL, 446, 5},
    {SOURCE_NORMAL, 448, 8},
    {SOURCE_NORMAL, 449, 8},
    {SOURCE_NORMAL, 450, 8},
    {SOURCE_NORMAL, 451, 8},
    {SOURCE_NORMAL, 452, 8}
};

// Gloves_dex - normal_suffixes
ModifierLookup gloves_dex_normal_suffixes[16] = {
    {SOURCE_NORMAL, 454, 8},
    {SOURCE_NORMAL, 456, 7},
    {SOURCE_NORMAL, 457, 7},
    {SOURCE_NORMAL, 458, 7},
    {SOURCE_NORMAL, 459, 5},
    {SOURCE_NORMAL, 460, 4},
    {SOURCE_NORMAL, 461, 1},
    {SOURCE_NORMAL, 462, 4},
    {SOURCE_NORMAL, 463, 4},
    {SOURCE_NORMAL, 464, 7},
    {SOURCE_NORMAL, 465, 7},
    {SOURCE_NORMAL, 466, 3},
    {SOURCE_NORMAL, 467, 3},
    {SOURCE_NORMAL, 468, 4},
    {SOURCE_NORMAL, 469, 4},
    {SOURCE_NORMAL, 471, 4}
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
    {SOURCE_NORMAL, 473, 8},
    {SOURCE_NORMAL, 474, 8},
    {SOURCE_NORMAL, 477, 3},
    {SOURCE_NORMAL, 480, 6},
    {SOURCE_NORMAL, 483, 5},
    {SOURCE_NORMAL, 484, 8},
    {SOURCE_NORMAL, 485, 8},
    {SOURCE_NORMAL, 486, 8},
    {SOURCE_NORMAL, 487, 8},
    {SOURCE_NORMAL, 488, 8}
};

// Gloves_dex_int - normal_suffixes
ModifierLookup gloves_dex_int_normal_suffixes[18] = {
    {SOURCE_NORMAL, 490, 8},
    {SOURCE_NORMAL, 489, 7},
    {SOURCE_NORMAL, 492, 7},
    {SOURCE_NORMAL, 493, 7},
    {SOURCE_NORMAL, 494, 7},
    {SOURCE_NORMAL, 495, 5},
    {SOURCE_NORMAL, 496, 4},
    {SOURCE_NORMAL, 497, 1},
    {SOURCE_NORMAL, 498, 4},
    {SOURCE_NORMAL, 499, 4},
    {SOURCE_NORMAL, 500, 7},
    {SOURCE_NORMAL, 501, 7},
    {SOURCE_NORMAL, 502, 3},
    {SOURCE_NORMAL, 503, 3},
    {SOURCE_NORMAL, 504, 4},
    {SOURCE_NORMAL, 505, 4},
    {SOURCE_NORMAL, 508, 3},
    {SOURCE_NORMAL, 507, 4}
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
    {SOURCE_NORMAL, 437, 8},
    {SOURCE_NORMAL, 438, 8},
    {SOURCE_NORMAL, 441, 6},
    {SOURCE_NORMAL, 444, 6},
    {SOURCE_NORMAL, 447, 5},
    {SOURCE_NORMAL, 448, 8},
    {SOURCE_NORMAL, 449, 8},
    {SOURCE_NORMAL, 450, 8},
    {SOURCE_NORMAL, 451, 8},
    {SOURCE_NORMAL, 452, 8}
};

// Gloves_int - normal_suffixes
ModifierLookup gloves_int_normal_suffixes[17] = {
    {SOURCE_NORMAL, 454, 8},
    {SOURCE_NORMAL, 455, 7},
    {SOURCE_NORMAL, 456, 7},
    {SOURCE_NORMAL, 457, 7},
    {SOURCE_NORMAL, 458, 7},
    {SOURCE_NORMAL, 459, 5},
    {SOURCE_NORMAL, 460, 4},
    {SOURCE_NORMAL, 461, 1},
    {SOURCE_NORMAL, 462, 4},
    {SOURCE_NORMAL, 463, 4},
    {SOURCE_NORMAL, 464, 7},
    {SOURCE_NORMAL, 465, 7},
    {SOURCE_NORMAL, 466, 3},
    {SOURCE_NORMAL, 467, 3},
    {SOURCE_NORMAL, 468, 4},
    {SOURCE_NORMAL, 469, 4},
    {SOURCE_NORMAL, 472, 3}
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
    {SOURCE_NORMAL, 437, 8},
    {SOURCE_NORMAL, 438, 8},
    {SOURCE_NORMAL, 439, 6},
    {SOURCE_NORMAL, 442, 6},
    {SOURCE_NORMAL, 445, 5},
    {SOURCE_NORMAL, 448, 8},
    {SOURCE_NORMAL, 449, 8},
    {SOURCE_NORMAL, 450, 8},
    {SOURCE_NORMAL, 451, 8},
    {SOURCE_NORMAL, 452, 8}
};

// Gloves_str - normal_suffixes
ModifierLookup gloves_str_normal_suffixes[17] = {
    {SOURCE_NORMAL, 453, 7},
    {SOURCE_NORMAL, 454, 8},
    {SOURCE_NORMAL, 456, 7},
    {SOURCE_NORMAL, 457, 7},
    {SOURCE_NORMAL, 458, 7},
    {SOURCE_NORMAL, 459, 5},
    {SOURCE_NORMAL, 460, 4},
    {SOURCE_NORMAL, 461, 1},
    {SOURCE_NORMAL, 462, 4},
    {SOURCE_NORMAL, 463, 4},
    {SOURCE_NORMAL, 464, 7},
    {SOURCE_NORMAL, 465, 7},
    {SOURCE_NORMAL, 466, 3},
    {SOURCE_NORMAL, 467, 3},
    {SOURCE_NORMAL, 468, 4},
    {SOURCE_NORMAL, 469, 4},
    {SOURCE_NORMAL, 470, 4}
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
    {SOURCE_NORMAL, 473, 8},
    {SOURCE_NORMAL, 474, 8},
    {SOURCE_NORMAL, 476, 3},
    {SOURCE_NORMAL, 479, 6},
    {SOURCE_NORMAL, 482, 5},
    {SOURCE_NORMAL, 484, 8},
    {SOURCE_NORMAL, 485, 8},
    {SOURCE_NORMAL, 486, 8},
    {SOURCE_NORMAL, 487, 8},
    {SOURCE_NORMAL, 488, 8}
};

// Gloves_str_int - normal_suffixes
ModifierLookup gloves_str_int_normal_suffixes[18] = {
    {SOURCE_NORMAL, 489, 7},
    {SOURCE_NORMAL, 490, 8},
    {SOURCE_NORMAL, 492, 7},
    {SOURCE_NORMAL, 493, 7},
    {SOURCE_NORMAL, 494, 7},
    {SOURCE_NORMAL, 495, 5},
    {SOURCE_NORMAL, 496, 4},
    {SOURCE_NORMAL, 497, 1},
    {SOURCE_NORMAL, 498, 4},
    {SOURCE_NORMAL, 499, 4},
    {SOURCE_NORMAL, 500, 7},
    {SOURCE_NORMAL, 501, 7},
    {SOURCE_NORMAL, 502, 3},
    {SOURCE_NORMAL, 503, 3},
    {SOURCE_NORMAL, 504, 4},
    {SOURCE_NORMAL, 505, 4},
    {SOURCE_NORMAL, 508, 3},
    {SOURCE_NORMAL, 506, 4}
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
    {SOURCE_NORMAL, 473, 8},
    {SOURCE_NORMAL, 474, 8},
    {SOURCE_NORMAL, 475, 3},
    {SOURCE_NORMAL, 478, 6},
    {SOURCE_NORMAL, 481, 5},
    {SOURCE_NORMAL, 484, 8},
    {SOURCE_NORMAL, 485, 8},
    {SOURCE_NORMAL, 486, 8},
    {SOURCE_NORMAL, 487, 8},
    {SOURCE_NORMAL, 488, 8}
};

// Gloves_str_dex - normal_suffixes
ModifierLookup gloves_str_dex_normal_suffixes[19] = {
    {SOURCE_NORMAL, 489, 7},
    {SOURCE_NORMAL, 490, 8},
    {SOURCE_NORMAL, 491, 7},
    {SOURCE_NORMAL, 492, 7},
    {SOURCE_NORMAL, 493, 7},
    {SOURCE_NORMAL, 494, 7},
    {SOURCE_NORMAL, 495, 5},
    {SOURCE_NORMAL, 496, 4},
    {SOURCE_NORMAL, 497, 1},
    {SOURCE_NORMAL, 498, 4},
    {SOURCE_NORMAL, 499, 4},
    {SOURCE_NORMAL, 500, 7},
    {SOURCE_NORMAL, 501, 7},
    {SOURCE_NORMAL, 502, 3},
    {SOURCE_NORMAL, 503, 3},
    {SOURCE_NORMAL, 504, 4},
    {SOURCE_NORMAL, 505, 4},
    {SOURCE_NORMAL, 506, 4},
    {SOURCE_NORMAL, 507, 4}
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
    {SOURCE_NORMAL, 406, 12},
    {SOURCE_NORMAL, 407, 10},
    {SOURCE_NORMAL, 410, 7},
    {SOURCE_NORMAL, 413, 5},
    {SOURCE_NORMAL, 416, 5},
    {SOURCE_NORMAL, 419, 6},
    {SOURCE_NORMAL, 420, 7}
};

// Body_Armours_str - normal_suffixes
ModifierLookup body_armours_str_normal_suffixes[12] = {
    {SOURCE_NORMAL, 421, 7},
    {SOURCE_NORMAL, 424, 7},
    {SOURCE_NORMAL, 425, 7},
    {SOURCE_NORMAL, 426, 7},
    {SOURCE_NORMAL, 427, 5},
    {SOURCE_NORMAL, 428, 4},
    {SOURCE_NORMAL, 429, 9},
    {SOURCE_NORMAL, 430, 10},
    {SOURCE_NORMAL, 431, 4},
    {SOURCE_NORMAL, 432, 4},
    {SOURCE_NORMAL, 433, 4},
    {SOURCE_NORMAL, 434, 5}
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
    {SOURCE_NORMAL, 375, 12},
    {SOURCE_NORMAL, 377, 7},
    {SOURCE_NORMAL, 380, 7},
    {SOURCE_NORMAL, 383, 5},
    {SOURCE_NORMAL, 386, 5},
    {SOURCE_NORMAL, 388, 6},
    {SOURCE_NORMAL, 389, 7}
};

// Body_Armours_str_int - normal_suffixes
ModifierLookup body_armours_str_int_normal_suffixes[14] = {
    {SOURCE_NORMAL, 390, 7},
    {SOURCE_NORMAL, 392, 7},
    {SOURCE_NORMAL, 393, 7},
    {SOURCE_NORMAL, 394, 7},
    {SOURCE_NORMAL, 395, 7},
    {SOURCE_NORMAL, 396, 5},
    {SOURCE_NORMAL, 397, 4},
    {SOURCE_NORMAL, 398, 9},
    {SOURCE_NORMAL, 399, 10},
    {SOURCE_NORMAL, 400, 4},
    {SOURCE_NORMAL, 401, 4},
    {SOURCE_NORMAL, 402, 4},
    {SOURCE_NORMAL, 405, 5},
    {SOURCE_NORMAL, 403, 5}
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
    {SOURCE_NORMAL, 375, 12},
    {SOURCE_NORMAL, 376, 7},
    {SOURCE_NORMAL, 379, 7},
    {SOURCE_NORMAL, 382, 5},
    {SOURCE_NORMAL, 385, 5},
    {SOURCE_NORMAL, 388, 6},
    {SOURCE_NORMAL, 389, 7}
};

// Body_Armours_str_dex - normal_suffixes
ModifierLookup body_armours_str_dex_normal_suffixes[14] = {
    {SOURCE_NORMAL, 390, 7},
    {SOURCE_NORMAL, 391, 8},
    {SOURCE_NORMAL, 393, 7},
    {SOURCE_NORMAL, 394, 7},
    {SOURCE_NORMAL, 395, 7},
    {SOURCE_NORMAL, 396, 5},
    {SOURCE_NORMAL, 397, 4},
    {SOURCE_NORMAL, 398, 9},
    {SOURCE_NORMAL, 399, 10},
    {SOURCE_NORMAL, 400, 4},
    {SOURCE_NORMAL, 401, 4},
    {SOURCE_NORMAL, 402, 4},
    {SOURCE_NORMAL, 403, 5},
    {SOURCE_NORMAL, 404, 5}
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
ModifierLookup body_armours_int_normal_prefixes[7] = {
    {SOURCE_NORMAL, 406, 12},
    {SOURCE_NORMAL, 409, 10},
    {SOURCE_NORMAL, 412, 7},
    {SOURCE_NORMAL, 415, 5},
    {SOURCE_NORMAL, 418, 5},
    {SOURCE_NORMAL, 419, 6},
    {SOURCE_NORMAL, 420, 7}
};

// Body_Armours_int - normal_suffixes
ModifierLookup body_armours_int_normal_suffixes[12] = {
    {SOURCE_NORMAL, 423, 7},
    {SOURCE_NORMAL, 424, 7},
    {SOURCE_NORMAL, 425, 7},
    {SOURCE_NORMAL, 426, 7},
    {SOURCE_NORMAL, 427, 5},
    {SOURCE_NORMAL, 428, 4},
    {SOURCE_NORMAL, 429, 9},
    {SOURCE_NORMAL, 430, 10},
    {SOURCE_NORMAL, 431, 4},
    {SOURCE_NORMAL, 432, 4},
    {SOURCE_NORMAL, 433, 4},
    {SOURCE_NORMAL, 436, 5}
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
    {SOURCE_NORMAL, 406, 12},
    {SOURCE_NORMAL, 408, 10},
    {SOURCE_NORMAL, 411, 7},
    {SOURCE_NORMAL, 414, 5},
    {SOURCE_NORMAL, 417, 5},
    {SOURCE_NORMAL, 419, 6},
    {SOURCE_NORMAL, 420, 7}
};

// Body_Armours_dex - normal_suffixes
ModifierLookup body_armours_dex_normal_suffixes[12] = {
    {SOURCE_NORMAL, 422, 7},
    {SOURCE_NORMAL, 424, 7},
    {SOURCE_NORMAL, 425, 7},
    {SOURCE_NORMAL, 426, 7},
    {SOURCE_NORMAL, 427, 5},
    {SOURCE_NORMAL, 428, 4},
    {SOURCE_NORMAL, 429, 9},
    {SOURCE_NORMAL, 430, 10},
    {SOURCE_NORMAL, 431, 4},
    {SOURCE_NORMAL, 432, 4},
    {SOURCE_NORMAL, 433, 4},
    {SOURCE_NORMAL, 435, 5}
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
    {SOURCE_NORMAL, 375, 12},
    {SOURCE_NORMAL, 378, 7},
    {SOURCE_NORMAL, 381, 7},
    {SOURCE_NORMAL, 384, 5},
    {SOURCE_NORMAL, 387, 5},
    {SOURCE_NORMAL, 388, 6},
    {SOURCE_NORMAL, 389, 7}
};

// Body_Armours_dex_int - normal_suffixes
ModifierLookup body_armours_dex_int_normal_suffixes[14] = {
    {SOURCE_NORMAL, 391, 8},
    {SOURCE_NORMAL, 392, 7},
    {SOURCE_NORMAL, 393, 7},
    {SOURCE_NORMAL, 394, 7},
    {SOURCE_NORMAL, 395, 7},
    {SOURCE_NORMAL, 396, 5},
    {SOURCE_NORMAL, 397, 4},
    {SOURCE_NORMAL, 398, 9},
    {SOURCE_NORMAL, 399, 10},
    {SOURCE_NORMAL, 400, 4},
    {SOURCE_NORMAL, 401, 4},
    {SOURCE_NORMAL, 402, 4},
    {SOURCE_NORMAL, 405, 5},
    {SOURCE_NORMAL, 404, 5}
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
    {SOURCE_NORMAL, 184, 10},
    {SOURCE_NORMAL, 185, 7},
    {SOURCE_NORMAL, 186, 6},
    {SOURCE_NORMAL, 187, 7},
    {SOURCE_NORMAL, 188, 7},
    {SOURCE_NORMAL, 189, 7},
    {SOURCE_NORMAL, 190, 7},
    {SOURCE_NORMAL, 191, 7},
    {SOURCE_NORMAL, 192, 5},
    {SOURCE_NORMAL, 193, 5},
    {SOURCE_NORMAL, 194, 5}
};

// Wands - normal_suffixes
ModifierLookup wands_normal_suffixes[18] = {
    {SOURCE_NORMAL, 195, 7},
    {SOURCE_NORMAL, 196, 4},
    {SOURCE_NORMAL, 197, 3},
    {SOURCE_NORMAL, 198, 4},
    {SOURCE_NORMAL, 199, 4},
    {SOURCE_NORMAL, 200, 4},
    {SOURCE_NORMAL, 201, 4},
    {SOURCE_NORMAL, 202, 4},
    {SOURCE_NORMAL, 203, 5},
    {SOURCE_NORMAL, 204, 7},
    {SOURCE_NORMAL, 205, 7},
    {SOURCE_NORMAL, 206, 6},
    {SOURCE_NORMAL, 207, 5},
    {SOURCE_NORMAL, 208, 5},
    {SOURCE_NORMAL, 209, 2},
    {SOURCE_NORMAL, 210, 4},
    {SOURCE_NORMAL, 211, 4},
    {SOURCE_NORMAL, 212, 4}
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
    {SOURCE_NORMAL, 22, 8},
    {SOURCE_NORMAL, 23, 9},
    {SOURCE_NORMAL, 24, 9},
    {SOURCE_NORMAL, 25, 9},
    {SOURCE_NORMAL, 26, 7},
    {SOURCE_NORMAL, 27, 7},
    {SOURCE_NORMAL, 28, 7},
    {SOURCE_NORMAL, 29, 5}
};

// Quarterstaves - normal_suffixes
ModifierLookup quarterstaves_normal_suffixes[15] = {
    {SOURCE_NORMAL, 30, 7},
    {SOURCE_NORMAL, 31, 7},
    {SOURCE_NORMAL, 32, 4},
    {SOURCE_NORMAL, 33, 4},
    {SOURCE_NORMAL, 34, 4},
    {SOURCE_NORMAL, 35, 4},
    {SOURCE_NORMAL, 36, 7},
    {SOURCE_NORMAL, 37, 7},
    {SOURCE_NORMAL, 38, 3},
    {SOURCE_NORMAL, 39, 7},
    {SOURCE_NORMAL, 40, 5},
    {SOURCE_NORMAL, 41, 5},
    {SOURCE_NORMAL, 42, 2},
    {SOURCE_NORMAL, 43, 5},
    {SOURCE_NORMAL, 44, 5}
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
ModifierLookup foci_normal_prefixes[11] = {
    {SOURCE_NORMAL, 260, 10},
    {SOURCE_NORMAL, 264, 7},
    {SOURCE_NORMAL, 263, 5},
    {SOURCE_NORMAL, 265, 7},
    {SOURCE_NORMAL, 266, 7},
    {SOURCE_NORMAL, 267, 7},
    {SOURCE_NORMAL, 268, 7},
    {SOURCE_NORMAL, 269, 7},
    {SOURCE_NORMAL, 262, 6},
    {SOURCE_NORMAL, 261, 9},
    {SOURCE_NORMAL, 263, 5}
};

// Foci - normal_suffixes
ModifierLookup foci_normal_suffixes[13] = {
    {SOURCE_NORMAL, 270, 7},
    {SOURCE_NORMAL, 271, 7},
    {SOURCE_NORMAL, 272, 7},
    {SOURCE_NORMAL, 273, 7},
    {SOURCE_NORMAL, 274, 5},
    {SOURCE_NORMAL, 275, 4},
    {SOURCE_NORMAL, 276, 1},
    {SOURCE_NORMAL, 277, 5},
    {SOURCE_NORMAL, 278, 5},
    {SOURCE_NORMAL, 279, 4},
    {SOURCE_NORMAL, 280, 4},
    {SOURCE_NORMAL, 281, 5},
    {SOURCE_NORMAL, 282, 5}
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
    {SOURCE_NORMAL, 283, 10},
    {SOURCE_NORMAL, 284, 9},
    {SOURCE_NORMAL, 285, 7},
    {SOURCE_NORMAL, 286, 5},
    {SOURCE_NORMAL, 287, 6},
    {SOURCE_NORMAL, 288, 2}
};

// Bucklers - normal_suffixes
ModifierLookup bucklers_normal_suffixes[13] = {
    {SOURCE_NORMAL, 289, 7},
    {SOURCE_NORMAL, 290, 7},
    {SOURCE_NORMAL, 291, 7},
    {SOURCE_NORMAL, 292, 7},
    {SOURCE_NORMAL, 293, 5},
    {SOURCE_NORMAL, 294, 4},
    {SOURCE_NORMAL, 295, 9},
    {SOURCE_NORMAL, 296, 2},
    {SOURCE_NORMAL, 297, 2},
    {SOURCE_NORMAL, 298, 2},
    {SOURCE_NORMAL, 299, 2},
    {SOURCE_NORMAL, 300, 1},
    {SOURCE_NORMAL, 301, 5}
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
    {SOURCE_NORMAL, 45, 10},
    {SOURCE_NORMAL, 46, 7},
    {SOURCE_NORMAL, 47, 6},
    {SOURCE_NORMAL, 48, 7},
    {SOURCE_NORMAL, 49, 7},
    {SOURCE_NORMAL, 50, 7},
    {SOURCE_NORMAL, 51, 7},
    {SOURCE_NORMAL, 52, 7},
    {SOURCE_NORMAL, 53, 5},
    {SOURCE_NORMAL, 54, 5},
    {SOURCE_NORMAL, 55, 5}
};

// Staves - normal_suffixes
ModifierLookup staves_normal_suffixes[18] = {
    {SOURCE_NORMAL, 56, 7},
    {SOURCE_NORMAL, 57, 4},
    {SOURCE_NORMAL, 58, 3},
    {SOURCE_NORMAL, 59, 4},
    {SOURCE_NORMAL, 60, 4},
    {SOURCE_NORMAL, 61, 4},
    {SOURCE_NORMAL, 62, 4},
    {SOURCE_NORMAL, 63, 4},
    {SOURCE_NORMAL, 64, 5},
    {SOURCE_NORMAL, 65, 7},
    {SOURCE_NORMAL, 66, 7},
    {SOURCE_NORMAL, 67, 6},
    {SOURCE_NORMAL, 68, 5},
    {SOURCE_NORMAL, 69, 5},
    {SOURCE_NORMAL, 70, 2},
    {SOURCE_NORMAL, 71, 4},
    {SOURCE_NORMAL, 72, 4},
    {SOURCE_NORMAL, 73, 4}
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

