#include "modifiers_data.h"
#include <stdlib.h>
#include <string.h>


ModifierTierData* init_tiers(ModifierSource source, uint16_t mod_id, uint8_t tier_count) {
    ModifierTierData* tiers = malloc(sizeof(ModifierTierData) * tier_count);
    if (!tiers) return NULL;

    if (source == SOURCE_DESECRATED) {
        switch (mod_id) {

        case 0: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{86,99},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 1: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 2: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 3: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{86,99},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 4: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{110,154},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 5: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{86,99},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 6: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{1,1},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 7: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 8: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{25,31},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 9: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{5,10},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 10: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{16,23},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 11: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{4,7},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 12: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{8,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 13: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{25,31},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 14: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{25,31},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 15: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{15,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 16: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 17: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 2, {{86,99},{14,23},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 18: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 19: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 2, {{86,99},{14,23},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 20: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 21: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 2, {{86,99},{14,23},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 22: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{5,10},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 23: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{25,40},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 24: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{8,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 25: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{4,6},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 26: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{6,12},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 27: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{15,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 28: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{35,50},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 29: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{91,116},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 30: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{1,2},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 31: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{31,49},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 32: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{25,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 33: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{12,16},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 34: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{25,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 35: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{25,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 36: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{30,40},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 37: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{1,1},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 38: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 2, {{101,121},{20,30},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 39: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 40: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 41: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{1,1},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 42: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 43: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 44: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{5,10},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 45: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{15,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 46: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{17,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 47: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{8,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 48: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{1,1},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 49: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{15,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 50: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{12,23},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 51: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 2, {{40,59},{40,59},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 52: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 53: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{25,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 54: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{30,40},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 55: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 56: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 57: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{40,60},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 58: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{12,18},{12,18},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 59: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{5,10},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 60: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{25,34},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 61: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{8,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 62: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{15,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 63: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{10,18},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 64: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{8,13},{8,13},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 65: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{41,59},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 66: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 67: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 68: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{41,59},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 69: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{110,154},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 70: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{41,59},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 71: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{1,1},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 72: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 73: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 74: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{5,10},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 75: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{10,16},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 76: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{2,4},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 77: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{8,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 78: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{17,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 79: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{17,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 80: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{15,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 81: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{12,23},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 82: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 2, {{40,59},{40,59},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 83: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 84: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{25,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 85: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{60,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 86: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 87: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 88: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{40,60},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 89: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{12,18},{12,18},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 90: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{5,10},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 91: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{25,34},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 92: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{8,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 93: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{15,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 94: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{10,18},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 95: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{8,13},{8,13},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 96: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 2, {{55,64},{55,64},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 97: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{74,89},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 98: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{74,89},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 99: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{27,38},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 100: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 101: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{4,7},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 102: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{4,7},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 103: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{4,7},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 104: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{8,16},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 105: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{5,10},{15,25},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 106: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{26,36},{3,5},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 107: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{31,39},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 108: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{11,18},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 109: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 110: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 111: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{0,0},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 112: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{30,40},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 113: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{1,1},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 114: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 115: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{25,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 116: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 117: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 118: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{6,12},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 119: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{23,31},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 120: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 121: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 122: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{17,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 123: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 124: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{8,15},{30,40},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 125: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{1,2},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 126: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{25,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 127: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{20,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 128: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 129: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 130: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{0,0},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 131: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{30,40},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 132: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{1,1},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 133: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 134: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{25,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 135: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 136: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 137: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{6,12},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 138: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{23,31},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 139: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 140: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 141: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{17,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 142: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 143: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{8,15},{30,40},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 144: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{1,2},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 145: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{25,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 146: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{20,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 147: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{12,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 148: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{8,16},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 149: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 150: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{61,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 151: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{1,1},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 152: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{61,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 153: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 154: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 155: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{1,2},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 156: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 157: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 158: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 159: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 160: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 161: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 162: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 163: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 164: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 165: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 166: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 167: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{25,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 168: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{1,1},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 169: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 170: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 171: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 172: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 173: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{17,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 174: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{1,2},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 175: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{20,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 176: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{20,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 177: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 178: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{10,14},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 179: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{8,12},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 180: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 181: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 182: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 183: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 184: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{12,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 185: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{20,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 186: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 187: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 188: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{20,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 189: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{20,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 190: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{8,12},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 191: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{40,50},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 192: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 193: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{1,1},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 194: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 195: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 196: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 197: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 198: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 199: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{12,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 200: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{20,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 201: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 202: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 203: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{20,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 204: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{20,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 205: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{8,12},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 206: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{40,50},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 207: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 208: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{1,1},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 209: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 210: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 211: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 212: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 213: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{6,12},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 214: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{25,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 215: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 216: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 217: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 218: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 219: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{17,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 220: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{12,18},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 221: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{3,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 222: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 223: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 224: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 225: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 226: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{6,12},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 227: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{25,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 228: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 229: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 230: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 231: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 232: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{17,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 233: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{12,18},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 234: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{3,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 235: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 236: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1000, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 237: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1000, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 238: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1000, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 239: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1000, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 240: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1000, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 241: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1000, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 242: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 243: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1000, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 244: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 245: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1000, 1, {{20,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 246: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1000, 1, {{20,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 247: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1000, 1, {{8,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 248: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1000, 1, {{12,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 249: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1000, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 250: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1000, 1, {{10,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 251: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1000, 1, {{8,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 252: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1000, 1, {{8,12},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 253: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1000, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 254: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1000, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 255: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1000, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 256: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1000, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 257: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1000, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 258: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1000, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 259: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1000, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 260: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 261: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1000, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 262: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 263: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1000, 1, {{20,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 264: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1000, 1, {{20,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 265: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1000, 1, {{8,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 266: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1000, 1, {{12,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 267: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1000, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 268: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1000, 1, {{10,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 269: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1000, 1, {{8,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 270: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1000, 1, {{8,12},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 271: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1000, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 272: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 273: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 274: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 275: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 276: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 277: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{25,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 278: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{6,12},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 279: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 280: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 281: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{23,31},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 282: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 283: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 284: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 285: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{8,12},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 286: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{13,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 287: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 3, 1, {{4,8},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 288: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{20,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 289: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 290: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 291: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 292: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 293: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 294: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{25,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 295: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{6,12},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 296: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 297: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 298: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{23,31},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 299: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 300: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 301: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 302: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{8,12},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 303: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{13,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 304: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 3, 1, {{4,8},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 305: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{20,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 306: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{8,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 307: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{20,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 308: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{20,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 309: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{20,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 310: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 311: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 312: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 313: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 314: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 315: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{8,12},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 316: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 317: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{12,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 318: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 319: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 320: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 321: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{8,12},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 322: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{10,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 323: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{2,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 324: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{12,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 325: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 326: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{2,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 327: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{3,6},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 328: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 329: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{8,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 330: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 331: {
            const ModifierTierData all_tiers[] = {
            { "Amanamu's", 65, 1, 1, {{35,50},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 332: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 333: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 334: {
            const ModifierTierData all_tiers[] = {
            { "Kurgal's", 65, 1, 1, {{35,50},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 335: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{10,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 336: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{35,50},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 337: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 338: {
            const ModifierTierData all_tiers[] = {
            { "Ulaman's", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 339: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 340: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 341: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{8,12},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 342: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{15,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 343: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 344: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{8,16},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 345: {
            const ModifierTierData all_tiers[] = {
            { "of Amanamu", 65, 1, 1, {{10,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 346: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{2,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 347: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{10,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 348: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{8,12},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 349: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 350: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 2, {{9,15},{9,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 351: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{3,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 352: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{8,16},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 353: {
            const ModifierTierData all_tiers[] = {
            { "of Kurgal", 65, 1, 1, {{12,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 354: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{3,6},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 355: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{2,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 356: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 2, {{13,17},{13,17},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 357: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{10,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 358: {
            const ModifierTierData all_tiers[] = {
            { "of Ulaman", 65, 1, 1, {{1,1},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

            default:
                free(tiers);
                return NULL;
        }
    }
    else if (source == SOURCE_ESSENCE) {
        switch (mod_id) {

        case 0: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Abrasion", 8, 0, 2, {{5,8},{10,15},{0,0},{0,0}} },
            { "Essence of Abrasion", 46, 0, 2, {{14,21},{25,37},{0,0},{0,0}} },
            { "Greater Essence of Abrasion", 60, 0, 2, {{23,35},{39,59},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 1: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Flames", 8, 0, 2, {{6,9},{10,16},{0,0},{0,0}} },
            { "Essence of Flames", 46, 0, 2, {{30,37},{45,56},{0,0},{0,0}} },
            { "Greater Essence of Flames", 60, 0, 2, {{56,70},{84,107},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 2: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Ice", 8, 0, 2, {{5,8},{9,14},{0,0},{0,0}} },
            { "Essence of Ice", 46, 0, 2, {{25,30},{38,46},{0,0},{0,0}} },
            { "Greater Essence of Ice", 60, 0, 2, {{46,57},{70,88},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 3: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Electricity", 8, 0, 2, {{1,2},{19,27},{0,0},{0,0}} },
            { "Essence of Electricity", 46, 0, 2, {{1,4},{80,88},{0,0},{0,0}} },
            { "Greater Essence of Electricity", 60, 0, 2, {{1,8},{128,162},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 4: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Battle", 18, 1, 1, {{61,84},{0,0},{0,0},{0,0}} },
            { "Essence of Battle", 36, 1, 1, {{124,167},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Battle", 58, 1, 1, {{237,346},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 5: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Haste", 22, 1, 1, {{11,13},{0,0},{0,0},{0,0}} },
            { "Essence of Haste", 37, 1, 1, {{17,19},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Haste", 60, 1, 1, {{23,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 6: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 7: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 8: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 9: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Seeking", 20, 1, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "Essence of Seeking", 30, 1, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Seeking", 44, 1, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 10: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Abrasion", 8, 0, 2, {{5,8},{10,15},{0,0},{0,0}} },
            { "Essence of Abrasion", 46, 0, 2, {{14,21},{25,37},{0,0},{0,0}} },
            { "Greater Essence of Abrasion", 60, 0, 2, {{23,35},{39,59},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 11: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Flames", 8, 0, 2, {{6,9},{10,16},{0,0},{0,0}} },
            { "Essence of Flames", 46, 0, 2, {{30,37},{45,56},{0,0},{0,0}} },
            { "Greater Essence of Flames", 60, 0, 2, {{56,70},{84,107},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 12: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Ice", 8, 0, 2, {{5,8},{9,14},{0,0},{0,0}} },
            { "Essence of Ice", 46, 0, 2, {{25,30},{38,46},{0,0},{0,0}} },
            { "Greater Essence of Ice", 60, 0, 2, {{46,57},{70,88},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 13: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Electricity", 8, 0, 2, {{1,2},{19,27},{0,0},{0,0}} },
            { "Essence of Electricity", 46, 0, 2, {{1,4},{80,88},{0,0},{0,0}} },
            { "Greater Essence of Electricity", 60, 0, 2, {{1,8},{128,162},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 14: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Battle", 18, 1, 1, {{61,84},{0,0},{0,0},{0,0}} },
            { "Essence of Battle", 36, 1, 1, {{124,167},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Battle", 58, 1, 1, {{237,346},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 15: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Haste", 22, 1, 1, {{11,13},{0,0},{0,0},{0,0}} },
            { "Essence of Haste", 37, 1, 1, {{17,19},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Haste", 60, 1, 1, {{23,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 16: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 17: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 18: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 19: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Seeking", 20, 1, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "Essence of Seeking", 30, 1, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Seeking", 44, 1, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 20: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Sorcery", 8, 1, 1, {{50,64},{0,0},{0,0},{0,0}} },
            { "Essence of Sorcery", 33, 1, 1, {{80,94},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Sorcery", 60, 1, 1, {{110,129},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 21: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 22: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 23: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 24: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Seeking", 21, 1, 1, {{50,59},{0,0},{0,0},{0,0}} },
            { "Essence of Seeking", 28, 1, 1, {{60,69},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Seeking", 41, 1, 1, {{70,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 25: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Alacrity", 15, 1, 1, {{20,25},{0,0},{0,0},{0,0}} },
            { "Essence of Alacrity", 30, 1, 1, {{26,31},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Alacrity", 60, 1, 1, {{38,43},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 26: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Abrasion", 8, 0, 2, {{5,8},{10,15},{0,0},{0,0}} },
            { "Essence of Abrasion", 46, 0, 2, {{14,21},{25,37},{0,0},{0,0}} },
            { "Greater Essence of Abrasion", 60, 0, 2, {{23,35},{39,59},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 27: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Flames", 8, 0, 2, {{6,9},{10,16},{0,0},{0,0}} },
            { "Essence of Flames", 46, 0, 2, {{30,37},{45,56},{0,0},{0,0}} },
            { "Greater Essence of Flames", 60, 0, 2, {{56,70},{84,107},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 28: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Ice", 8, 0, 2, {{5,8},{9,14},{0,0},{0,0}} },
            { "Essence of Ice", 46, 0, 2, {{25,30},{38,46},{0,0},{0,0}} },
            { "Greater Essence of Ice", 60, 0, 2, {{46,57},{70,88},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 29: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Electricity", 8, 0, 2, {{1,2},{19,27},{0,0},{0,0}} },
            { "Essence of Electricity", 46, 0, 2, {{1,4},{80,88},{0,0},{0,0}} },
            { "Greater Essence of Electricity", 60, 0, 2, {{1,8},{128,162},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 30: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Battle", 18, 1, 1, {{61,84},{0,0},{0,0},{0,0}} },
            { "Essence of Battle", 36, 1, 1, {{124,167},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Battle", 58, 1, 1, {{237,346},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 31: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Haste", 22, 1, 1, {{11,13},{0,0},{0,0},{0,0}} },
            { "Essence of Haste", 37, 1, 1, {{17,19},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Haste", 60, 1, 1, {{23,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 32: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 33: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 34: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 35: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Seeking", 20, 1, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "Essence of Seeking", 30, 1, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Seeking", 44, 1, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 36: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Abrasion", 8, 1, 2, {{4,6},{7,11},{0,0},{0,0}} },
            { "Essence of Abrasion", 46, 1, 2, {{10,15},{18,26},{0,0},{0,0}} },
            { "Greater Essence of Abrasion", 60, 1, 2, {{16,24},{28,42},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 37: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Flames", 8, 1, 2, {{4,6},{7,10},{0,0},{0,0}} },
            { "Essence of Flames", 46, 1, 2, {{20,24},{32,37},{0,0},{0,0}} },
            { "Greater Essence of Flames", 60, 1, 2, {{35,44},{56,71},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 38: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Ice", 8, 1, 2, {{3,5},{6,9},{0,0},{0,0}} },
            { "Essence of Ice", 46, 1, 2, {{17,20},{26,32},{0,0},{0,0}} },
            { "Greater Essence of Ice", 60, 1, 2, {{31,38},{47,59},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 39: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Electricity", 8, 1, 2, {{1,1},{13,19},{0,0},{0,0}} },
            { "Essence of Electricity", 46, 1, 2, {{1,3},{55,60},{0,0},{0,0}} },
            { "Greater Essence of Electricity", 60, 1, 2, {{1,6},{85,107},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 40: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Battle", 18, 1, 1, {{61,84},{0,0},{0,0},{0,0}} },
            { "Essence of Battle", 36, 1, 1, {{124,167},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Battle", 58, 1, 1, {{237,346},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 41: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Haste", 22, 1, 1, {{11,13},{0,0},{0,0},{0,0}} },
            { "Essence of Haste", 37, 1, 1, {{17,19},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Haste", 60, 1, 1, {{23,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 42: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 43: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 44: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 45: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Seeking", 20, 1, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "Essence of Seeking", 30, 1, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Seeking", 44, 1, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 46: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Abrasion", 8, 1, 2, {{4,6},{7,11},{0,0},{0,0}} },
            { "Essence of Abrasion", 46, 1, 2, {{10,15},{18,26},{0,0},{0,0}} },
            { "Greater Essence of Abrasion", 60, 1, 2, {{16,24},{28,42},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 47: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Flames", 8, 1, 2, {{4,6},{7,10},{0,0},{0,0}} },
            { "Essence of Flames", 46, 1, 2, {{20,24},{32,37},{0,0},{0,0}} },
            { "Greater Essence of Flames", 60, 1, 2, {{35,44},{56,71},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 48: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Ice", 8, 1, 2, {{3,5},{6,9},{0,0},{0,0}} },
            { "Essence of Ice", 46, 1, 2, {{17,20},{26,32},{0,0},{0,0}} },
            { "Greater Essence of Ice", 60, 1, 2, {{31,38},{47,59},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 49: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Electricity", 8, 1, 2, {{1,1},{13,19},{0,0},{0,0}} },
            { "Essence of Electricity", 46, 1, 2, {{1,3},{55,60},{0,0},{0,0}} },
            { "Greater Essence of Electricity", 60, 1, 2, {{1,6},{85,107},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 50: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Battle", 18, 1, 1, {{61,84},{0,0},{0,0},{0,0}} },
            { "Essence of Battle", 36, 1, 1, {{124,167},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Battle", 58, 1, 1, {{237,346},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 51: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Haste", 22, 1, 1, {{11,13},{0,0},{0,0},{0,0}} },
            { "Essence of Haste", 37, 1, 1, {{17,19},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Haste", 60, 1, 1, {{23,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 52: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 53: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 54: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 55: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Seeking", 20, 1, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "Essence of Seeking", 30, 1, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Seeking", 44, 1, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 56: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Command", 8, 1, 1, {{35,44},{0,0},{0,0},{0,0}} },
            { "Essence of Command", 33, 1, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Command", 60, 1, 1, {{75,89},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 57: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 58: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 59: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 60: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Abrasion", 8, 1, 2, {{4,6},{7,11},{0,0},{0,0}} },
            { "Essence of Abrasion", 46, 1, 2, {{10,15},{18,26},{0,0},{0,0}} },
            { "Greater Essence of Abrasion", 60, 1, 2, {{16,24},{28,42},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 61: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Flames", 8, 1, 2, {{4,6},{7,10},{0,0},{0,0}} },
            { "Essence of Flames", 46, 1, 2, {{20,24},{32,37},{0,0},{0,0}} },
            { "Greater Essence of Flames", 60, 1, 2, {{35,44},{56,71},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 62: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Ice", 8, 1, 2, {{3,5},{6,9},{0,0},{0,0}} },
            { "Essence of Ice", 46, 1, 2, {{17,20},{26,32},{0,0},{0,0}} },
            { "Greater Essence of Ice", 60, 1, 2, {{31,38},{47,59},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 63: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Electricity", 8, 1, 2, {{1,1},{13,19},{0,0},{0,0}} },
            { "Essence of Electricity", 46, 1, 2, {{1,3},{55,60},{0,0},{0,0}} },
            { "Greater Essence of Electricity", 60, 1, 2, {{1,6},{85,107},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 64: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Battle", 18, 1, 1, {{61,84},{0,0},{0,0},{0,0}} },
            { "Essence of Battle", 36, 1, 1, {{124,167},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Battle", 58, 1, 1, {{237,346},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 65: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Haste", 22, 1, 1, {{11,13},{0,0},{0,0},{0,0}} },
            { "Essence of Haste", 37, 1, 1, {{17,19},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Haste", 60, 1, 1, {{23,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 66: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 67: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 68: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 69: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Seeking", 20, 1, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "Essence of Seeking", 30, 1, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Seeking", 44, 1, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 70: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Sorcery", 8, 1, 1, {{35,44},{0,0},{0,0},{0,0}} },
            { "Essence of Sorcery", 33, 1, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Sorcery", 60, 1, 1, {{75,89},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 71: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 72: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 73: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 74: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Seeking", 21, 1, 1, {{34,39},{0,0},{0,0},{0,0}} },
            { "Essence of Seeking", 28, 1, 1, {{40,46},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Seeking", 41, 1, 1, {{47,53},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 75: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Alacrity", 15, 1, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "Essence of Alacrity", 30, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Alacrity", 60, 1, 1, {{25,28},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 76: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Body", 16, 1, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Essence of the Body", 38, 1, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Body", 46, 1, 1, {{100,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 77: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 78: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 79: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 80: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Ruin", 16, 1, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "Essence of Ruin", 30, 1, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Ruin", 56, 1, 1, {{16,19},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 81: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 82: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 83: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 84: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Insulation", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Insulation", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Insulation", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 85: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Thawing", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Thawing", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Thawing", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 86: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Grounding", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Grounding", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Grounding", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 87: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Body", 16, 1, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Essence of the Body", 38, 1, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Body", 46, 1, 1, {{100,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 88: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 89: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 90: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 91: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 2, {{68,79},{68,79},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 92: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 2, {{68,79},{68,79},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 93: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 2, {{68,79},{68,79},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 94: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Ruin", 16, 1, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "Essence of Ruin", 30, 1, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Ruin", 56, 1, 1, {{16,19},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 95: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 96: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 97: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 98: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Insulation", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Insulation", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Insulation", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 99: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Thawing", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Thawing", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Thawing", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 100: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Grounding", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Grounding", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Grounding", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 101: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Body", 16, 1, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Essence of the Body", 38, 1, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Body", 46, 1, 1, {{100,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 102: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 103: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 104: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 105: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Sorcery", 8, 1, 1, {{35,44},{0,0},{0,0},{0,0}} },
            { "Essence of Sorcery", 33, 1, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Sorcery", 60, 1, 1, {{75,89},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 106: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Ruin", 16, 1, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "Essence of Ruin", 30, 1, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Ruin", 56, 1, 1, {{16,19},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 107: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 108: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 109: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 110: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Seeking", 21, 0, 1, {{34,39},{0,0},{0,0},{0,0}} },
            { "Essence of Seeking", 28, 0, 1, {{40,46},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Seeking", 41, 0, 1, {{47,53},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 111: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Insulation", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Insulation", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Insulation", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 112: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Thawing", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Thawing", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Thawing", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 113: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Grounding", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Grounding", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Grounding", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 114: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Alacrity", 15, 0, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "Essence of Alacrity", 30, 0, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Alacrity", 60, 0, 1, {{25,28},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 115: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Body", 16, 1, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Essence of the Body", 38, 1, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Body", 46, 1, 1, {{100,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 116: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 117: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 118: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 119: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Ruin", 16, 1, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "Essence of Ruin", 30, 1, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Ruin", 56, 1, 1, {{16,19},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 120: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 121: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 122: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 123: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Insulation", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Insulation", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Insulation", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 124: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Thawing", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Thawing", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Thawing", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 125: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Grounding", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Grounding", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Grounding", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 126: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Battle", 18, 1, 1, {{61,84},{0,0},{0,0},{0,0}} },
            { "Essence of Battle", 36, 1, 1, {{124,167},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Battle", 58, 1, 1, {{237,346},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 127: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 128: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 129: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 130: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Body", 16, 1, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Essence of the Body", 38, 1, 1, {{70,84},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Body", 46, 1, 1, {{85,99},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 131: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Mind", 16, 1, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Essence of the Mind", 38, 1, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Mind", 46, 1, 1, {{80,89},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 132: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 133: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 134: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 135: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Ruin", 16, 1, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "Essence of Ruin", 30, 1, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Ruin", 56, 1, 1, {{16,19},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 136: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 137: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 138: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 139: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Insulation", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Insulation", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Insulation", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 140: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Thawing", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Thawing", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Thawing", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 141: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Grounding", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Grounding", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Grounding", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 142: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Opulence", 24, 1, 1, {{11,14},{0,0},{0,0},{0,0}} },
            { "Essence of Opulence", 40, 1, 1, {{15,18},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Opulence", 63, 1, 1, {{19,21},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 143: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Body", 16, 1, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Essence of the Body", 38, 1, 1, {{70,84},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Body", 46, 1, 1, {{85,99},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 144: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Mind", 16, 1, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Essence of the Mind", 38, 1, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Mind", 46, 1, 1, {{80,89},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 145: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 146: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 147: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 148: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 2, {{68,79},{68,79},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 149: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 2, {{68,79},{68,79},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 150: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 2, {{68,79},{68,79},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 151: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Ruin", 16, 1, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "Essence of Ruin", 30, 1, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Ruin", 56, 1, 1, {{16,19},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 152: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 153: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 154: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 155: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Insulation", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Insulation", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Insulation", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 156: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Thawing", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Thawing", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Thawing", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 157: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Grounding", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Grounding", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Grounding", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 158: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Opulence", 24, 1, 1, {{11,14},{0,0},{0,0},{0,0}} },
            { "Essence of Opulence", 40, 1, 1, {{15,18},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Opulence", 63, 1, 1, {{19,21},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 159: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Body", 16, 1, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Essence of the Body", 38, 1, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Body", 46, 1, 1, {{100,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 160: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 161: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 162: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 163: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 2, {{68,79},{68,79},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 164: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 2, {{68,79},{68,79},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 165: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 2, {{68,79},{68,79},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 166: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Ruin", 16, 1, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "Essence of Ruin", 30, 1, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Ruin", 56, 1, 1, {{16,19},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 167: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 168: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 169: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 170: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Insulation", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Insulation", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Insulation", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 171: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Thawing", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Thawing", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Thawing", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 172: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Grounding", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Grounding", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Grounding", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 173: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Body", 16, 1, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Essence of the Body", 38, 1, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Body", 46, 1, 1, {{100,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 174: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 175: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 176: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 177: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Ruin", 16, 1, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "Essence of Ruin", 30, 1, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Ruin", 56, 1, 1, {{16,19},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 178: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 179: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 180: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 181: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Insulation", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Insulation", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Insulation", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 182: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Thawing", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Thawing", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Thawing", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 183: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Grounding", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Grounding", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Grounding", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 184: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Body", 16, 1, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Essence of the Body", 38, 1, 1, {{70,84},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Body", 46, 1, 1, {{85,99},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 185: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Mind", 16, 1, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Essence of the Mind", 38, 1, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Mind", 46, 1, 1, {{80,89},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 186: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 187: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 188: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 189: {
            const ModifierTierData all_tiers[] = {
            { "Greater Essence of Battle", 58, 1, 1, {{237,346},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 190: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Ruin", 16, 1, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "Essence of Ruin", 30, 1, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Ruin", 56, 1, 1, {{16,19},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 191: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 192: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 193: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 194: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Insulation", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Insulation", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Insulation", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 195: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Thawing", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Thawing", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Thawing", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 196: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Grounding", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Grounding", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Grounding", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 197: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Opulence", 24, 1, 1, {{11,14},{0,0},{0,0},{0,0}} },
            { "Essence of Opulence", 40, 1, 1, {{15,18},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Opulence", 63, 1, 1, {{19,21},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 198: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Body", 16, 1, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Essence of the Body", 38, 1, 1, {{70,84},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Body", 46, 1, 1, {{85,99},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 199: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Mind", 16, 1, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Essence of the Mind", 38, 1, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Mind", 46, 1, 1, {{80,89},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 200: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 201: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 202: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 203: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 2, {{68,79},{68,79},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 204: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 2, {{68,79},{68,79},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 205: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 2, {{68,79},{68,79},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 206: {
            const ModifierTierData all_tiers[] = {
            { "Greater Essence of Battle", 58, 1, 1, {{237,346},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 207: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Ruin", 16, 1, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "Essence of Ruin", 30, 1, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Ruin", 56, 1, 1, {{16,19},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 208: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 209: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 210: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 211: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Insulation", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Insulation", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Insulation", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 212: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Thawing", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Thawing", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Thawing", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 213: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Grounding", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Grounding", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Grounding", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 214: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Opulence", 24, 1, 1, {{11,14},{0,0},{0,0},{0,0}} },
            { "Essence of Opulence", 40, 1, 1, {{15,18},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Opulence", 63, 1, 1, {{19,21},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 215: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Body", 16, 1, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Essence of the Body", 38, 1, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Body", 46, 1, 1, {{100,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 216: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Mind", 16, 1, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Essence of the Mind", 38, 1, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Mind", 46, 1, 1, {{80,89},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 217: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 218: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 219: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 220: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Ruin", 16, 1, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "Essence of Ruin", 30, 1, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Ruin", 56, 1, 1, {{16,19},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 221: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 222: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 223: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 224: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Insulation", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Insulation", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Insulation", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 225: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Thawing", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Thawing", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Thawing", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 226: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Grounding", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Grounding", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Grounding", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 227: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Opulence", 24, 1, 1, {{11,14},{0,0},{0,0},{0,0}} },
            { "Essence of Opulence", 40, 1, 1, {{15,18},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Opulence", 63, 1, 1, {{19,21},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 228: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Body", 16, 1, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Essence of the Body", 38, 1, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Body", 46, 1, 1, {{100,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 229: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Mind", 16, 1, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Essence of the Mind", 38, 1, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Mind", 46, 1, 1, {{80,89},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 230: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 231: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 232: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 1, {{68,79},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 233: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 2, {{68,79},{68,79},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 234: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 2, {{68,79},{68,79},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 235: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Enhancement", 16, 1, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Essence of Enhancement", 46, 1, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Greater Essence of Enhancement", 54, 1, 2, {{68,79},{68,79},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 236: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Ruin", 16, 1, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "Essence of Ruin", 30, 1, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Ruin", 56, 1, 1, {{16,19},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 237: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 238: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 239: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 240: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Insulation", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Insulation", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Insulation", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 241: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Thawing", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Thawing", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Thawing", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 242: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Grounding", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Grounding", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Grounding", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 243: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Opulence", 24, 1, 1, {{11,14},{0,0},{0,0},{0,0}} },
            { "Essence of Opulence", 40, 1, 1, {{15,18},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Opulence", 63, 1, 1, {{19,21},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 244: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Body", 6, 1, 1, {{20,29},{0,0},{0,0},{0,0}} },
            { "Essence of the Body", 38, 1, 1, {{70,84},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 245: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Mind", 16, 1, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Essence of the Mind", 46, 1, 1, {{80,89},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Mind", 54, 1, 1, {{90,104},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 246: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Ruin", 16, 1, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "Essence of Ruin", 30, 1, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Ruin", 56, 1, 1, {{16,19},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 247: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 248: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 249: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 250: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Insulation", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Insulation", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Insulation", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 251: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Thawing", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Thawing", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Thawing", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 252: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Grounding", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Grounding", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Grounding", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 253: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Opulence", 24, 1, 1, {{11,14},{0,0},{0,0},{0,0}} },
            { "Essence of Opulence", 40, 1, 1, {{15,18},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Opulence", 63, 1, 1, {{19,21},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 254: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Body", 6, 1, 1, {{20,29},{0,0},{0,0},{0,0}} },
            { "Essence of the Body", 38, 1, 1, {{70,84},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Body", 46, 1, 1, {{85,99},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 255: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Mind", 16, 1, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Essence of the Mind", 46, 1, 1, {{80,89},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Mind", 54, 1, 1, {{90,104},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 256: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Ruin", 16, 1, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "Essence of Ruin", 30, 1, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Ruin", 56, 1, 1, {{16,19},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 257: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 258: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 259: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of the Infinite", 11, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "Essence of the Infinite", 33, 1, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "Greater Essence of the Infinite", 55, 1, 1, {{25,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 260: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Insulation", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Insulation", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Insulation", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 261: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Thawing", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Thawing", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Thawing", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 262: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Grounding", 12, 1, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "Essence of Grounding", 36, 1, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Grounding", 60, 1, 1, {{31,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 263: {
            const ModifierTierData all_tiers[] = {
            { "Lesser Essence of Opulence", 24, 1, 1, {{11,14},{0,0},{0,0},{0,0}} },
            { "Essence of Opulence", 40, 1, 1, {{15,18},{0,0},{0,0},{0,0}} },
            { "Greater Essence of Opulence", 63, 1, 1, {{19,21},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

            default:
                free(tiers);
                return NULL;
        }
    }
    else if (source == SOURCE_NORMAL) {
        switch (mod_id) {

        case 0: {
            const ModifierTierData all_tiers[] = {
            { "Glinting", 1, 1000, 2, {{2,3},{5,7},{0,0},{0,0}} },
            { "Burnished", 8, 1000, 2, {{5,8},{10,15},{0,0},{0,0}} },
            { "Polished", 16, 1000, 2, {{8,12},{15,22},{0,0},{0,0}} },
            { "Honed", 33, 1000, 2, {{11,17},{20,30},{0,0},{0,0}} },
            { "Gleaming", 46, 1000, 2, {{14,21},{25,37},{0,0},{0,0}} },
            { "Annealed", 54, 600, 2, {{19,29},{33,49},{0,0},{0,0}} },
            { "Razor-sharp", 60, 400, 2, {{23,35},{39,59},{0,0},{0,0}} },
            { "Tempered", 65, 200, 2, {{29,44},{50,75},{0,0},{0,0}} },
            { "Flaring", 75, 100, 2, {{37,55},{63,94},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 1: {
            const ModifierTierData all_tiers[] = {
            { "Heated", 1, 1200, 2, {{2,4},{5,7},{0,0},{0,0}} },
            { "Smouldering", 8, 1200, 2, {{6,9},{10,16},{0,0},{0,0}} },
            { "Smoking", 16, 1200, 2, {{11,17},{19,28},{0,0},{0,0}} },
            { "Burning", 33, 1200, 2, {{19,27},{30,42},{0,0},{0,0}} },
            { "Flaming", 46, 1200, 2, {{30,37},{45,56},{0,0},{0,0}} },
            { "Scorching", 54, 1200, 2, {{39,53},{59,80},{0,0},{0,0}} },
            { "Incinerating", 60, 720, 2, {{56,70},{84,107},{0,0},{0,0}} },
            { "Blasting", 65, 480, 2, {{73,97},{112,149},{0,0},{0,0}} },
            { "Cremating", 75, 300, 2, {{102,130},{155,198},{0,0},{0,0}} },
            { "Carbonising", 81, 120, 2, {{135,156},{205,236},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 2: {
            const ModifierTierData all_tiers[] = {
            { "Frosted", 1, 800, 2, {{2,3},{4,6},{0,0},{0,0}} },
            { "Chilled", 8, 800, 2, {{5,8},{9,14},{0,0},{0,0}} },
            { "Icy", 16, 800, 2, {{10,14},{15,23},{0,0},{0,0}} },
            { "Frigid", 33, 800, 2, {{16,23},{25,35},{0,0},{0,0}} },
            { "Freezing", 46, 800, 2, {{25,30},{38,46},{0,0},{0,0}} },
            { "Frozen", 54, 800, 2, {{32,43},{49,66},{0,0},{0,0}} },
            { "Glaciated", 60, 480, 2, {{46,57},{70,88},{0,0},{0,0}} },
            { "Polar", 65, 320, 2, {{60,80},{92,121},{0,0},{0,0}} },
            { "Entombing", 75, 200, 2, {{84,107},{126,161},{0,0},{0,0}} },
            { "Crystalising", 81, 80, 2, {{112,124},{168,189},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 3: {
            const ModifierTierData all_tiers[] = {
            { "Humming", 1, 800, 2, {{1,1},{7,10},{0,0},{0,0}} },
            { "Buzzing", 8, 800, 2, {{1,2},{19,27},{0,0},{0,0}} },
            { "Snapping", 16, 800, 2, {{1,3},{31,43},{0,0},{0,0}} },
            { "Crackling", 33, 800, 2, {{1,4},{53,76},{0,0},{0,0}} },
            { "Sparking", 46, 800, 2, {{1,4},{80,88},{0,0},{0,0}} },
            { "Arcing", 54, 800, 2, {{1,6},{93,122},{0,0},{0,0}} },
            { "Shocking", 60, 480, 2, {{1,8},{128,162},{0,0},{0,0}} },
            { "Discharging", 65, 320, 2, {{1,13},{168,231},{0,0},{0,0}} },
            { "Electrocuting", 75, 200, 2, {{1,16},{239,300},{0,0},{0,0}} },
            { "Vapourising", 81, 80, 2, {{1,19},{310,358},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 4: {
            const ModifierTierData all_tiers[] = {
            { "Heavy", 1, 1000, 1, {{40,49},{0,0},{0,0},{0,0}} },
            { "Serrated", 8, 1000, 1, {{50,64},{0,0},{0,0},{0,0}} },
            { "Wicked", 16, 1000, 1, {{65,84},{0,0},{0,0},{0,0}} },
            { "Vicious", 33, 400, 1, {{85,109},{0,0},{0,0},{0,0}} },
            { "Bloodthirsty", 46, 200, 1, {{110,134},{0,0},{0,0},{0,0}} },
            { "Cruel", 60, 100, 1, {{135,154},{0,0},{0,0},{0,0}} },
            { "Tyrannical", 75, 50, 1, {{155,169},{0,0},{0,0},{0,0}} },
            { "Merciless", 82, 25, 1, {{170,179},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 5: {
            const ModifierTierData all_tiers[] = {
            { "Squire's", 1, 1000, 2, {{15,19},{16,20},{0,0},{0,0}} },
            { "Journeyman's", 11, 1000, 2, {{20,24},{21,46},{0,0},{0,0}} },
            { "Reaver's", 23, 1000, 2, {{25,34},{47,72},{0,0},{0,0}} },
            { "Mercenary's", 38, 1000, 2, {{35,44},{73,97},{0,0},{0,0}} },
            { "Champion's", 54, 600, 2, {{45,54},{98,123},{0,0},{0,0}} },
            { "Conqueror's", 65, 400, 2, {{55,64},{124,149},{0,0},{0,0}} },
            { "Emperor's", 70, 200, 2, {{65,74},{150,174},{0,0},{0,0}} },
            { "Dictator's", 81, 100, 2, {{75,79},{175,200},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 6: {
            const ModifierTierData all_tiers[] = {
            { "Squire's", 1, 1000, 2, {{15,19},{16,20},{0,0},{0,0}} },
            { "Journeyman's", 11, 1000, 2, {{20,24},{21,46},{0,0},{0,0}} },
            { "Reaver's", 23, 1000, 2, {{25,34},{47,72},{0,0},{0,0}} },
            { "Mercenary's", 38, 1000, 2, {{35,44},{73,97},{0,0},{0,0}} },
            { "Champion's", 54, 600, 2, {{45,54},{98,123},{0,0},{0,0}} },
            { "Conqueror's", 65, 400, 2, {{55,64},{124,149},{0,0},{0,0}} },
            { "Emperor's", 70, 200, 2, {{65,74},{150,174},{0,0},{0,0}} },
            { "Dictator's", 81, 100, 2, {{75,79},{175,200},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 7: {
            const ModifierTierData all_tiers[] = {
            { "Catalysing", 4, 500, 1, {{34,47},{0,0},{0,0},{0,0}} },
            { "Infusing", 16, 500, 1, {{48,71},{0,0},{0,0},{0,0}} },
            { "Empowering", 33, 500, 1, {{72,85},{0,0},{0,0},{0,0}} },
            { "Unleashed", 46, 500, 1, {{86,99},{0,0},{0,0},{0,0}} },
            { "Overpowering", 60, 500, 1, {{100,119},{0,0},{0,0},{0,0}} },
            { "Devastating", 81, 500, 1, {{120,139},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 8: {
            const ModifierTierData all_tiers[] = {
            { "of the Brute", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Wrestler", 1000, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Bear", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Lion", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Gorilla", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Goliath", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Leviathan", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Titan", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 9: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 1000, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 1000, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 1000, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 1000, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 1000, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 10: {
            const ModifierTierData all_tiers[] = {
            { "of Combat", 2, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Dueling", 18, 750, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Conflict", 36, 500, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of Battle", 55, 250, 1, {{5,6},{0,0},{0,0},{0,0}} },
            { "of War", 81, 100, 1, {{7,7},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 11: {
            const ModifierTierData all_tiers[] = {
            { "of the Parasite", 21, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            { "of the Locust", 38, 1000, 1, {{6,6},{0,0},{0,0},{0,0}} },
            { "of the Remora", 54, 1000, 1, {{7,7},{0,0},{0,0},{0,0}} },
            { "of the Lamprey", 68, 1000, 1, {{8,8},{0,0},{0,0},{0,0}} },
            { "of the Vampire", 81, 1000, 1, {{9,9},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 12: {
            const ModifierTierData all_tiers[] = {
            { "of the Thirsty", 21, 1000, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of the Parched", 38, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            { "of the Arid", 54, 1000, 1, {{6,6},{0,0},{0,0},{0,0}} },
            { "of the Drought", 68, 1000, 1, {{7,7},{0,0},{0,0},{0,0}} },
            { "of the Desperate", 81, 1000, 1, {{8,8},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 13: {
            const ModifierTierData all_tiers[] = {
            { "of Success", 1, 750, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of Victory", 11, 750, 1, {{7,9},{0,0},{0,0},{0,0}} },
            { "of Triumph", 22, 750, 1, {{10,18},{0,0},{0,0},{0,0}} },
            { "of Conquest", 33, 750, 1, {{19,28},{0,0},{0,0},{0,0}} },
            { "of Vanquishing", 44, 750, 1, {{29,40},{0,0},{0,0},{0,0}} },
            { "of Valour", 55, 750, 1, {{41,53},{0,0},{0,0},{0,0}} },
            { "of Glory", 66, 750, 1, {{54,68},{0,0},{0,0},{0,0}} },
            { "of Legend", 77, 750, 1, {{69,84},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 14: {
            const ModifierTierData all_tiers[] = {
            { "of Absorption", 1, 750, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of Osmosis", 12, 750, 1, {{4,5},{0,0},{0,0},{0,0}} },
            { "of Infusion", 23, 750, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of Enveloping", 34, 750, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Consumption", 45, 750, 1, {{15,20},{0,0},{0,0},{0,0}} },
            { "of Siphoning", 56, 750, 1, {{21,27},{0,0},{0,0},{0,0}} },
            { "of Devouring", 67, 750, 1, {{28,35},{0,0},{0,0},{0,0}} },
            { "of Assimilation", 78, 750, 1, {{36,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 15: {
            const ModifierTierData all_tiers[] = {
            { "of Rejuvenation", 8, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Restoration", 20, 1000, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Regrowth", 30, 1000, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of Nourishment", 40, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 16: {
            const ModifierTierData all_tiers[] = {
            { "of Skill", 1, 1000, 1, {{5,7},{0,0},{0,0},{0,0}} },
            { "of Ease", 11, 1000, 1, {{8,10},{0,0},{0,0},{0,0}} },
            { "of Mastery", 22, 1000, 1, {{11,13},{0,0},{0,0},{0,0}} },
            { "of Renown", 30, 1000, 1, {{14,16},{0,0},{0,0},{0,0}} },
            { "of Acclaim", 37, 500, 1, {{17,19},{0,0},{0,0},{0,0}} },
            { "of Fame", 45, 500, 1, {{20,22},{0,0},{0,0},{0,0}} },
            { "of Infamy", 60, 200, 1, {{23,25},{0,0},{0,0},{0,0}} },
            { "of Celebration", 77, 100, 1, {{26,28},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 17: {
            const ModifierTierData all_tiers[] = {
            { "of Menace", 1, 1000, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Havoc", 20, 1000, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "of Disaster", 30, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Calamity", 44, 500, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Ruin", 59, 250, 1, {{3,4},{0,0},{0,0},{0,0}} },
            { "of Unmaking", 73, 125, 1, {{4,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 18: {
            const ModifierTierData all_tiers[] = {
            { "of Ire", 8, 1000, 1, {{10,11},{0,0},{0,0},{0,0}} },
            { "of Anger", 21, 1000, 1, {{12,13},{0,0},{0,0},{0,0}} },
            { "of Rage", 30, 1000, 1, {{14,16},{0,0},{0,0},{0,0}} },
            { "of Fury", 44, 500, 1, {{17,19},{0,0},{0,0},{0,0}} },
            { "of Ferocity", 59, 250, 1, {{20,22},{0,0},{0,0},{0,0}} },
            { "of Destruction", 73, 125, 1, {{23,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 19: {
            const ModifierTierData all_tiers[] = {
            { "of Shining", 8, 1000, 2, {{10,20},{5,5},{0,0},{0,0}} },
            { "of Light", 15, 1000, 2, {{21,40},{10,10},{0,0},{0,0}} },
            { "of Radiance", 30, 1000, 2, {{41,60},{15,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 20: {
            const ModifierTierData all_tiers[] = {
            { "of Impact", 5, 1000, 1, {{11,13},{0,0},{0,0},{0,0}} },
            { "of Dazing", 18, 1000, 1, {{14,16},{0,0},{0,0},{0,0}} },
            { "of Stunning", 30, 1000, 1, {{17,19},{0,0},{0,0},{0,0}} },
            { "of Slamming", 44, 1000, 1, {{20,22},{0,0},{0,0},{0,0}} },
            { "of Staggering", 58, 1000, 1, {{23,26},{0,0},{0,0},{0,0}} },
            { "of the Concussion", 71, 1000, 1, {{27,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 21: {
            const ModifierTierData all_tiers[] = {
            { "of the Pugilist", 5, 1000, 1, {{21,30},{0,0},{0,0},{0,0}} },
            { "of the Brawler", 20, 1000, 1, {{31,40},{0,0},{0,0},{0,0}} },
            { "of the Boxer", 30, 1000, 1, {{41,50},{0,0},{0,0},{0,0}} },
            { "of the Combatant", 44, 1000, 1, {{51,60},{0,0},{0,0},{0,0}} },
            { "of the Gladiator", 58, 1000, 1, {{61,70},{0,0},{0,0},{0,0}} },
            { "of the Champion", 74, 1000, 1, {{71,80},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 22: {
            const ModifierTierData all_tiers[] = {
            { "Glinting", 1, 1000, 2, {{2,3},{5,7},{0,0},{0,0}} },
            { "Burnished", 8, 1000, 2, {{5,8},{10,15},{0,0},{0,0}} },
            { "Polished", 16, 1000, 2, {{8,12},{15,22},{0,0},{0,0}} },
            { "Honed", 33, 1000, 2, {{11,17},{20,30},{0,0},{0,0}} },
            { "Gleaming", 46, 1000, 2, {{14,21},{25,37},{0,0},{0,0}} },
            { "Annealed", 54, 600, 2, {{19,29},{33,49},{0,0},{0,0}} },
            { "Razor-sharp", 60, 400, 2, {{23,35},{39,59},{0,0},{0,0}} },
            { "Tempered", 65, 200, 2, {{29,44},{50,75},{0,0},{0,0}} },
            { "Flaring", 75, 100, 2, {{37,55},{63,94},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 23: {
            const ModifierTierData all_tiers[] = {
            { "Heated", 1, 800, 2, {{2,4},{5,7},{0,0},{0,0}} },
            { "Smouldering", 8, 800, 2, {{6,9},{10,16},{0,0},{0,0}} },
            { "Smoking", 16, 800, 2, {{11,17},{19,28},{0,0},{0,0}} },
            { "Burning", 33, 800, 2, {{19,27},{30,42},{0,0},{0,0}} },
            { "Flaming", 46, 800, 2, {{30,37},{45,56},{0,0},{0,0}} },
            { "Scorching", 54, 800, 2, {{39,53},{59,80},{0,0},{0,0}} },
            { "Incinerating", 60, 480, 2, {{56,70},{84,107},{0,0},{0,0}} },
            { "Blasting", 65, 320, 2, {{73,97},{112,149},{0,0},{0,0}} },
            { "Cremating", 75, 200, 2, {{102,130},{155,198},{0,0},{0,0}} },
            { "Carbonising", 81, 80, 2, {{135,156},{205,236},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 24: {
            const ModifierTierData all_tiers[] = {
            { "Frosted", 1, 900, 2, {{2,3},{4,6},{0,0},{0,0}} },
            { "Chilled", 8, 900, 2, {{5,8},{9,14},{0,0},{0,0}} },
            { "Icy", 16, 900, 2, {{10,14},{15,23},{0,0},{0,0}} },
            { "Frigid", 33, 900, 2, {{16,23},{25,35},{0,0},{0,0}} },
            { "Freezing", 46, 900, 2, {{25,30},{38,46},{0,0},{0,0}} },
            { "Frozen", 54, 900, 2, {{32,43},{49,66},{0,0},{0,0}} },
            { "Glaciated", 60, 540, 2, {{46,57},{70,88},{0,0},{0,0}} },
            { "Polar", 65, 360, 2, {{60,80},{92,121},{0,0},{0,0}} },
            { "Entombing", 75, 225, 2, {{84,107},{126,161},{0,0},{0,0}} },
            { "Crystalising", 81, 90, 2, {{112,124},{168,189},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 25: {
            const ModifierTierData all_tiers[] = {
            { "Humming", 1, 1100, 2, {{1,1},{7,10},{0,0},{0,0}} },
            { "Buzzing", 8, 1100, 2, {{1,2},{19,27},{0,0},{0,0}} },
            { "Snapping", 16, 1100, 2, {{1,3},{31,43},{0,0},{0,0}} },
            { "Crackling", 33, 1100, 2, {{1,4},{53,76},{0,0},{0,0}} },
            { "Sparking", 46, 1100, 2, {{1,4},{80,88},{0,0},{0,0}} },
            { "Arcing", 54, 1100, 2, {{1,6},{93,122},{0,0},{0,0}} },
            { "Shocking", 60, 660, 2, {{1,8},{128,162},{0,0},{0,0}} },
            { "Discharging", 65, 440, 2, {{1,13},{168,231},{0,0},{0,0}} },
            { "Electrocuting", 75, 275, 2, {{1,16},{239,300},{0,0},{0,0}} },
            { "Vapourising", 81, 110, 2, {{1,19},{310,358},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 26: {
            const ModifierTierData all_tiers[] = {
            { "Heavy", 1, 1000, 1, {{40,49},{0,0},{0,0},{0,0}} },
            { "Serrated", 8, 1000, 1, {{50,64},{0,0},{0,0},{0,0}} },
            { "Wicked", 16, 1000, 1, {{65,84},{0,0},{0,0},{0,0}} },
            { "Vicious", 33, 400, 1, {{85,109},{0,0},{0,0},{0,0}} },
            { "Bloodthirsty", 46, 200, 1, {{110,134},{0,0},{0,0},{0,0}} },
            { "Cruel", 60, 100, 1, {{135,154},{0,0},{0,0},{0,0}} },
            { "Tyrannical", 75, 50, 1, {{155,169},{0,0},{0,0},{0,0}} },
            { "Merciless", 82, 25, 1, {{170,179},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 27: {
            const ModifierTierData all_tiers[] = {
            { "Squire's", 1, 1000, 2, {{15,19},{16,20},{0,0},{0,0}} },
            { "Journeyman's", 11, 1000, 2, {{20,24},{21,46},{0,0},{0,0}} },
            { "Reaver's", 23, 1000, 2, {{25,34},{47,72},{0,0},{0,0}} },
            { "Mercenary's", 38, 1000, 2, {{35,44},{73,97},{0,0},{0,0}} },
            { "Champion's", 54, 600, 2, {{45,54},{98,123},{0,0},{0,0}} },
            { "Conqueror's", 65, 400, 2, {{55,64},{124,149},{0,0},{0,0}} },
            { "Emperor's", 70, 200, 2, {{65,74},{150,174},{0,0},{0,0}} },
            { "Dictator's", 81, 100, 2, {{75,79},{175,200},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 28: {
            const ModifierTierData all_tiers[] = {
            { "Squire's", 1, 1000, 2, {{15,19},{16,20},{0,0},{0,0}} },
            { "Journeyman's", 11, 1000, 2, {{20,24},{21,46},{0,0},{0,0}} },
            { "Reaver's", 23, 1000, 2, {{25,34},{47,72},{0,0},{0,0}} },
            { "Mercenary's", 38, 1000, 2, {{35,44},{73,97},{0,0},{0,0}} },
            { "Champion's", 54, 600, 2, {{45,54},{98,123},{0,0},{0,0}} },
            { "Conqueror's", 65, 400, 2, {{55,64},{124,149},{0,0},{0,0}} },
            { "Emperor's", 70, 200, 2, {{65,74},{150,174},{0,0},{0,0}} },
            { "Dictator's", 81, 100, 2, {{75,79},{175,200},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 29: {
            const ModifierTierData all_tiers[] = {
            { "Catalysing", 4, 500, 1, {{34,47},{0,0},{0,0},{0,0}} },
            { "Infusing", 16, 500, 1, {{48,71},{0,0},{0,0},{0,0}} },
            { "Empowering", 33, 500, 1, {{72,85},{0,0},{0,0},{0,0}} },
            { "Unleashed", 46, 500, 1, {{86,99},{0,0},{0,0},{0,0}} },
            { "Overpowering", 60, 500, 1, {{100,119},{0,0},{0,0},{0,0}} },
            { "Devastating", 81, 500, 1, {{120,139},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 30: {
            const ModifierTierData all_tiers[] = {
            { "of the Mongoose", 1, 750, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Lynx", 11, 750, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Fox", 22, 750, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Falcon", 33, 750, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Panther", 44, 750, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Leopard", 55, 750, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Jaguar", 66, 750, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Phantom", 74, 750, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 31: {
            const ModifierTierData all_tiers[] = {
            { "of the Pupil", 1, 250, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Student", 11, 250, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Prodigy", 22, 250, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Augur", 33, 250, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Philosopher", 44, 250, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Sage", 55, 250, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Savant", 66, 250, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Virtuoso", 74, 250, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 32: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 1000, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 1000, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 1000, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 1000, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 1000, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 33: {
            const ModifierTierData all_tiers[] = {
            { "of Combat", 2, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Dueling", 18, 750, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Conflict", 36, 500, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of Battle", 55, 250, 1, {{5,6},{0,0},{0,0},{0,0}} },
            { "of War", 81, 100, 1, {{7,7},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 34: {
            const ModifierTierData all_tiers[] = {
            { "of the Parasite", 21, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            { "of the Locust", 38, 1000, 1, {{6,6},{0,0},{0,0},{0,0}} },
            { "of the Remora", 54, 1000, 1, {{7,7},{0,0},{0,0},{0,0}} },
            { "of the Lamprey", 68, 1000, 1, {{8,8},{0,0},{0,0},{0,0}} },
            { "of the Vampire", 81, 1000, 1, {{9,9},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 35: {
            const ModifierTierData all_tiers[] = {
            { "of the Thirsty", 21, 1000, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of the Parched", 38, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            { "of the Arid", 54, 1000, 1, {{6,6},{0,0},{0,0},{0,0}} },
            { "of the Drought", 68, 1000, 1, {{7,7},{0,0},{0,0},{0,0}} },
            { "of the Desperate", 81, 1000, 1, {{8,8},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 36: {
            const ModifierTierData all_tiers[] = {
            { "of Success", 1, 750, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of Victory", 11, 750, 1, {{7,9},{0,0},{0,0},{0,0}} },
            { "of Triumph", 22, 750, 1, {{10,18},{0,0},{0,0},{0,0}} },
            { "of Conquest", 33, 750, 1, {{19,28},{0,0},{0,0},{0,0}} },
            { "of Vanquishing", 44, 750, 1, {{29,40},{0,0},{0,0},{0,0}} },
            { "of Valour", 55, 750, 1, {{41,53},{0,0},{0,0},{0,0}} },
            { "of Glory", 66, 750, 1, {{54,68},{0,0},{0,0},{0,0}} },
            { "of Legend", 77, 750, 1, {{69,84},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 37: {
            const ModifierTierData all_tiers[] = {
            { "of Absorption", 1, 750, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of Osmosis", 12, 750, 1, {{4,5},{0,0},{0,0},{0,0}} },
            { "of Infusion", 23, 750, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of Enveloping", 34, 750, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Consumption", 45, 750, 1, {{15,20},{0,0},{0,0},{0,0}} },
            { "of Siphoning", 56, 750, 1, {{21,27},{0,0},{0,0},{0,0}} },
            { "of Devouring", 67, 750, 1, {{28,35},{0,0},{0,0},{0,0}} },
            { "of Assimilation", 78, 750, 1, {{36,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 38: {
            const ModifierTierData all_tiers[] = {
            { "of Rejuvenation", 8, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Restoration", 20, 1000, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Regrowth", 30, 1000, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of Nourishment", 40, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 39: {
            const ModifierTierData all_tiers[] = {
            { "of Skill", 1, 1000, 1, {{5,7},{0,0},{0,0},{0,0}} },
            { "of Ease", 11, 1000, 1, {{8,10},{0,0},{0,0},{0,0}} },
            { "of Mastery", 22, 1000, 1, {{11,13},{0,0},{0,0},{0,0}} },
            { "of Renown", 30, 1000, 1, {{14,16},{0,0},{0,0},{0,0}} },
            { "of Acclaim", 37, 500, 1, {{17,19},{0,0},{0,0},{0,0}} },
            { "of Fame", 45, 500, 1, {{20,22},{0,0},{0,0},{0,0}} },
            { "of Infamy", 60, 200, 1, {{23,25},{0,0},{0,0},{0,0}} },
            { "of Celebration", 77, 100, 1, {{26,28},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 40: {
            const ModifierTierData all_tiers[] = {
            { "of Menace", 1, 1000, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Havoc", 20, 1000, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "of Disaster", 30, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Calamity", 44, 500, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Ruin", 59, 250, 1, {{3,4},{0,0},{0,0},{0,0}} },
            { "of Unmaking", 73, 125, 1, {{4,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 41: {
            const ModifierTierData all_tiers[] = {
            { "of Ire", 8, 1000, 1, {{10,11},{0,0},{0,0},{0,0}} },
            { "of Anger", 21, 1000, 1, {{12,13},{0,0},{0,0},{0,0}} },
            { "of Rage", 30, 1000, 1, {{14,16},{0,0},{0,0},{0,0}} },
            { "of Fury", 44, 500, 1, {{17,19},{0,0},{0,0},{0,0}} },
            { "of Ferocity", 59, 250, 1, {{20,22},{0,0},{0,0},{0,0}} },
            { "of Destruction", 73, 125, 1, {{23,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 42: {
            const ModifierTierData all_tiers[] = {
            { "of Shining", 8, 1000, 2, {{10,20},{5,5},{0,0},{0,0}} },
            { "of Light", 15, 1000, 2, {{21,40},{10,10},{0,0},{0,0}} },
            { "of Radiance", 30, 1000, 2, {{41,60},{15,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 43: {
            const ModifierTierData all_tiers[] = {
            { "of Impact", 5, 1000, 1, {{11,13},{0,0},{0,0},{0,0}} },
            { "of Dazing", 18, 1000, 1, {{14,16},{0,0},{0,0},{0,0}} },
            { "of Stunning", 30, 1000, 1, {{17,19},{0,0},{0,0},{0,0}} },
            { "of Slamming", 44, 1000, 1, {{20,22},{0,0},{0,0},{0,0}} },
            { "of Staggering", 58, 1000, 1, {{23,26},{0,0},{0,0},{0,0}} },
            { "of the Concussion", 71, 1000, 1, {{27,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 44: {
            const ModifierTierData all_tiers[] = {
            { "of the Pugilist", 5, 1000, 1, {{21,30},{0,0},{0,0},{0,0}} },
            { "of the Brawler", 20, 1000, 1, {{31,40},{0,0},{0,0},{0,0}} },
            { "of the Boxer", 30, 1000, 1, {{41,50},{0,0},{0,0},{0,0}} },
            { "of the Combatant", 44, 1000, 1, {{51,60},{0,0},{0,0},{0,0}} },
            { "of the Gladiator", 58, 1000, 1, {{61,70},{0,0},{0,0},{0,0}} },
            { "of the Champion", 74, 1000, 1, {{71,80},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 45: {
            const ModifierTierData all_tiers[] = {
            { "Beryl", 1, 1000, 1, {{14,20},{0,0},{0,0},{0,0}} },
            { "Cobalt", 6, 1000, 1, {{21,34},{0,0},{0,0},{0,0}} },
            { "Azure", 16, 1000, 1, {{35,48},{0,0},{0,0},{0,0}} },
            { "Sapphire", 25, 1000, 1, {{49,76},{0,0},{0,0},{0,0}} },
            { "Cerulean", 33, 1000, 1, {{77,90},{0,0},{0,0},{0,0}} },
            { "Aqua", 38, 1000, 1, {{91,111},{0,0},{0,0},{0,0}} },
            { "Opalescent", 46, 1000, 1, {{112,125},{0,0},{0,0},{0,0}} },
            { "Gentian", 54, 1000, 1, {{126,146},{0,0},{0,0},{0,0}} },
            { "Chalybeous", 60, 1000, 1, {{147,174},{0,0},{0,0},{0,0}} },
            { "Mazarine", 65, 1000, 1, {{175,209},{0,0},{0,0},{0,0}} },
            { "Blue", 70, 1000, 1, {{210,230},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 46: {
            const ModifierTierData all_tiers[] = {
            { "Apprentice's", 1, 1000, 1, {{35,49},{0,0},{0,0},{0,0}} },
            { "Adept's", 8, 1000, 1, {{50,64},{0,0},{0,0},{0,0}} },
            { "Scholar's", 16, 1000, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Professor's", 33, 600, 1, {{80,94},{0,0},{0,0},{0,0}} },
            { "Occultist's", 46, 400, 1, {{95,109},{0,0},{0,0},{0,0}} },
            { "Incanter's", 60, 200, 1, {{110,129},{0,0},{0,0},{0,0}} },
            { "Glyphic", 70, 100, 1, {{130,149},{0,0},{0,0},{0,0}} },
            { "Runic", 80, 50, 1, {{150,169},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 47: {
            const ModifierTierData all_tiers[] = {
            { "Caster's", 2, 1000, 2, {{21,27},{26,30},{0,0},{0,0}} },
            { "Conjuror's", 11, 1000, 2, {{28,34},{31,35},{0,0},{0,0}} },
            { "Wizard's", 23, 1000, 2, {{35,41},{36,41},{0,0},{0,0}} },
            { "Warlock's", 38, 600, 2, {{42,48},{42,47},{0,0},{0,0}} },
            { "Mage's", 48, 400, 2, {{49,55},{48,53},{0,0},{0,0}} },
            { "Archmage's", 63, 200, 2, {{56,63},{54,59},{0,0},{0,0}} },
            { "Lich's", 79, 100, 2, {{64,69},{60,64},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 48: {
            const ModifierTierData all_tiers[] = {
            { "Searing", 2, 500, 1, {{35,49},{0,0},{0,0},{0,0}} },
            { "Sizzling", 8, 500, 1, {{50,64},{0,0},{0,0},{0,0}} },
            { "Blistering", 16, 500, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Cauterising", 33, 400, 1, {{80,94},{0,0},{0,0},{0,0}} },
            { "Smoldering", 46, 300, 1, {{95,109},{0,0},{0,0},{0,0}} },
            { "Magmatic", 60, 200, 1, {{110,129},{0,0},{0,0},{0,0}} },
            { "Volcanic", 70, 100, 1, {{130,149},{0,0},{0,0},{0,0}} },
            { "Pyromancer's", 81, 50, 1, {{150,169},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 49: {
            const ModifierTierData all_tiers[] = {
            { "Bitter", 2, 500, 1, {{35,49},{0,0},{0,0},{0,0}} },
            { "Biting", 8, 500, 1, {{50,64},{0,0},{0,0},{0,0}} },
            { "Alpine", 16, 500, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Snowy", 33, 400, 1, {{80,94},{0,0},{0,0},{0,0}} },
            { "Hailing", 46, 300, 1, {{95,109},{0,0},{0,0},{0,0}} },
            { "Arctic", 60, 200, 1, {{110,129},{0,0},{0,0},{0,0}} },
            { "Crystalline", 70, 100, 1, {{130,149},{0,0},{0,0},{0,0}} },
            { "Cryomancer's", 81, 50, 1, {{150,169},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 50: {
            const ModifierTierData all_tiers[] = {
            { "Charged", 2, 500, 1, {{35,49},{0,0},{0,0},{0,0}} },
            { "Hissing", 8, 500, 1, {{50,64},{0,0},{0,0},{0,0}} },
            { "Bolting", 16, 500, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Coursing", 33, 400, 1, {{80,94},{0,0},{0,0},{0,0}} },
            { "Striking", 46, 300, 1, {{95,109},{0,0},{0,0},{0,0}} },
            { "Smiting", 60, 200, 1, {{110,129},{0,0},{0,0},{0,0}} },
            { "Ionising", 70, 100, 1, {{130,149},{0,0},{0,0},{0,0}} },
            { "Electromancer's", 81, 50, 1, {{150,169},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 51: {
            const ModifierTierData all_tiers[] = {
            { "Impure", 2, 500, 1, {{35,49},{0,0},{0,0},{0,0}} },
            { "Tainted", 8, 500, 1, {{50,64},{0,0},{0,0},{0,0}} },
            { "Clouded", 16, 500, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Darkened", 33, 400, 1, {{80,94},{0,0},{0,0},{0,0}} },
            { "Malignant", 46, 300, 1, {{95,109},{0,0},{0,0},{0,0}} },
            { "Vile", 60, 200, 1, {{110,129},{0,0},{0,0},{0,0}} },
            { "Twisted", 70, 100, 1, {{130,149},{0,0},{0,0},{0,0}} },
            { "Malevolent", 81, 50, 1, {{150,169},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 52: {
            const ModifierTierData all_tiers[] = {
            { "Punishing", 2, 500, 1, {{35,49},{0,0},{0,0},{0,0}} },
            { "Unforgiving", 8, 500, 1, {{50,64},{0,0},{0,0},{0,0}} },
            { "Vengeful", 16, 500, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Sadistic", 33, 400, 1, {{80,94},{0,0},{0,0},{0,0}} },
            { "Pitiless", 46, 300, 1, {{95,109},{0,0},{0,0},{0,0}} },
            { "Agonising", 60, 200, 1, {{110,129},{0,0},{0,0},{0,0}} },
            { "Oppressor's", 70, 100, 1, {{130,149},{0,0},{0,0},{0,0}} },
            { "Torturer's", 81, 50, 1, {{150,169},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 53: {
            const ModifierTierData all_tiers[] = {
            { "Fervent", 5, 1000, 1, {{20,23},{0,0},{0,0},{0,0}} },
            { "Ardent", 16, 1000, 1, {{24,28},{0,0},{0,0},{0,0}} },
            { "Fanatic's", 33, 1000, 1, {{29,32},{0,0},{0,0},{0,0}} },
            { "Zealot's", 46, 1000, 1, {{33,37},{0,0},{0,0},{0,0}} },
            { "Infernal", 60, 1000, 1, {{38,41},{0,0},{0,0},{0,0}} },
            { "Flamebound", 80, 1000, 1, {{42,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 54: {
            const ModifierTierData all_tiers[] = {
            { "Malignant", 5, 1000, 1, {{20,23},{0,0},{0,0},{0,0}} },
            { "Pernicious", 16, 1000, 1, {{24,28},{0,0},{0,0},{0,0}} },
            { "Destructive", 33, 1000, 1, {{29,32},{0,0},{0,0},{0,0}} },
            { "Malicious", 46, 1000, 1, {{33,37},{0,0},{0,0},{0,0}} },
            { "Ruthless", 60, 1000, 1, {{38,41},{0,0},{0,0},{0,0}} },
            { "Frostbound", 80, 1000, 1, {{42,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 55: {
            const ModifierTierData all_tiers[] = {
            { "Deadly", 5, 1000, 1, {{20,23},{0,0},{0,0},{0,0}} },
            { "Lethal", 16, 1000, 1, {{24,28},{0,0},{0,0},{0,0}} },
            { "Fatal", 33, 1000, 1, {{29,32},{0,0},{0,0},{0,0}} },
            { "Vorpal", 46, 1000, 1, {{33,37},{0,0},{0,0},{0,0}} },
            { "Electrifying", 60, 1000, 1, {{38,41},{0,0},{0,0},{0,0}} },
            { "Stormbound", 80, 1000, 1, {{42,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 56: {
            const ModifierTierData all_tiers[] = {
            { "of the Pupil", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Student", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Prodigy", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Augur", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Philosopher", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Sage", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Savant", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Virtuoso", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 57: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 1000, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 1000, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 1000, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 1000, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 1000, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 58: {
            const ModifierTierData all_tiers[] = {
            { "of the Mage", 5, 200, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of the Enchanter", 25, 150, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of the Evoker", 55, 100, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of the Sorcerer", 78, 50, 1, {{5,6},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 59: {
            const ModifierTierData all_tiers[] = {
            { "of Coals", 2, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Cinders", 18, 750, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Flames", 36, 500, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of Immolation", 55, 250, 1, {{5,6},{0,0},{0,0},{0,0}} },
            { "of Inferno", 81, 100, 1, {{7,7},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 60: {
            const ModifierTierData all_tiers[] = {
            { "of Snow", 2, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Sleet", 18, 750, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Ice", 36, 500, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of Rime", 55, 250, 1, {{5,6},{0,0},{0,0},{0,0}} },
            { "of Frostbite", 81, 100, 1, {{7,7},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 61: {
            const ModifierTierData all_tiers[] = {
            { "of Sparks", 2, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Static", 18, 750, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Electricity", 36, 500, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of Voltage", 55, 250, 1, {{5,6},{0,0},{0,0},{0,0}} },
            { "of Thunder", 81, 100, 1, {{7,7},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 62: {
            const ModifierTierData all_tiers[] = {
            { "of Anarchy", 2, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Turmoil", 18, 750, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Ruin", 36, 500, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of Havoc", 55, 250, 1, {{5,6},{0,0},{0,0},{0,0}} },
            { "of Armageddon", 81, 100, 1, {{7,7},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 63: {
            const ModifierTierData all_tiers[] = {
            { "of Agony", 2, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Suffering", 18, 750, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Torment", 36, 500, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of Desolation", 55, 250, 1, {{5,6},{0,0},{0,0},{0,0}} },
            { "of Grief", 81, 100, 1, {{7,7},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 64: {
            const ModifierTierData all_tiers[] = {
            { "of Excitement", 1, 1000, 1, {{15,29},{0,0},{0,0},{0,0}} },
            { "of Joy", 18, 1000, 1, {{30,44},{0,0},{0,0},{0,0}} },
            { "of Elation", 29, 1000, 1, {{45,59},{0,0},{0,0},{0,0}} },
            { "of Bliss", 42, 1000, 1, {{60,74},{0,0},{0,0},{0,0}} },
            { "of Euphoria", 55, 1000, 1, {{75,89},{0,0},{0,0},{0,0}} },
            { "of Nirvana", 79, 1000, 1, {{90,104},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 65: {
            const ModifierTierData all_tiers[] = {
            { "of Success", 1, 750, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of Victory", 11, 750, 1, {{7,9},{0,0},{0,0},{0,0}} },
            { "of Triumph", 22, 750, 1, {{10,18},{0,0},{0,0},{0,0}} },
            { "of Conquest", 33, 750, 1, {{19,28},{0,0},{0,0},{0,0}} },
            { "of Vanquishing", 44, 750, 1, {{29,40},{0,0},{0,0},{0,0}} },
            { "of Valour", 55, 750, 1, {{41,53},{0,0},{0,0},{0,0}} },
            { "of Glory", 66, 750, 1, {{54,68},{0,0},{0,0},{0,0}} },
            { "of Legend", 77, 750, 1, {{69,84},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 66: {
            const ModifierTierData all_tiers[] = {
            { "of Absorption", 1, 750, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of Osmosis", 12, 750, 1, {{4,5},{0,0},{0,0},{0,0}} },
            { "of Infusion", 23, 750, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of Enveloping", 34, 750, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Consumption", 45, 750, 1, {{15,20},{0,0},{0,0},{0,0}} },
            { "of Siphoning", 56, 750, 1, {{21,27},{0,0},{0,0},{0,0}} },
            { "of Devouring", 67, 750, 1, {{28,35},{0,0},{0,0},{0,0}} },
            { "of Assimilation", 78, 750, 1, {{36,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 67: {
            const ModifierTierData all_tiers[] = {
            { "of Talent", 1, 1000, 1, {{14,19},{0,0},{0,0},{0,0}} },
            { "of Nimbleness", 15, 1000, 1, {{20,25},{0,0},{0,0},{0,0}} },
            { "of Expertise", 30, 1000, 1, {{26,31},{0,0},{0,0},{0,0}} },
            { "of Sortilege", 45, 1000, 1, {{32,37},{0,0},{0,0},{0,0}} },
            { "of Legerdemain", 60, 1000, 1, {{38,43},{0,0},{0,0},{0,0}} },
            { "of Prestidigitation", 70, 500, 1, {{44,49},{0,0},{0,0},{0,0}} },
            { "of Finesse", 80, 250, 1, {{50,52},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 68: {
            const ModifierTierData all_tiers[] = {
            { "of Menace", 11, 1000, 1, {{40,49},{0,0},{0,0},{0,0}} },
            { "of Havoc", 21, 1000, 1, {{50,59},{0,0},{0,0},{0,0}} },
            { "of Disaster", 28, 1000, 1, {{60,69},{0,0},{0,0},{0,0}} },
            { "of Calamity", 41, 1000, 1, {{70,79},{0,0},{0,0},{0,0}} },
            { "of Ruin", 59, 1000, 1, {{80,89},{0,0},{0,0},{0,0}} },
            { "of Unmaking", 76, 1000, 1, {{90,109},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 69: {
            const ModifierTierData all_tiers[] = {
            { "of Ire", 8, 1000, 1, {{15,21},{0,0},{0,0},{0,0}} },
            { "of Anger", 21, 1000, 1, {{23,29},{0,0},{0,0},{0,0}} },
            { "of Rage", 30, 1000, 1, {{30,36},{0,0},{0,0},{0,0}} },
            { "of Fury", 44, 500, 1, {{38,44},{0,0},{0,0},{0,0}} },
            { "of Ferocity", 59, 250, 1, {{45,51},{0,0},{0,0},{0,0}} },
            { "of Destruction", 73, 125, 1, {{53,59},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 70: {
            const ModifierTierData all_tiers[] = {
            { "of Warmth", 8, 1000, 2, {{8,12},{5,5},{0,0},{0,0}} },
            { "of Kindling", 15, 1000, 2, {{13,17},{10,10},{0,0},{0,0}} },
            { "of the Hearth", 30, 1000, 2, {{18,22},{15,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 71: {
            const ModifierTierData all_tiers[] = {
            { "of Ignition", 15, 1000, 1, {{51,60},{0,0},{0,0},{0,0}} },
            { "of Scorching", 30, 1000, 1, {{61,70},{0,0},{0,0},{0,0}} },
            { "of Incineration", 45, 1000, 1, {{71,80},{0,0},{0,0},{0,0}} },
            { "of Combustion", 60, 500, 1, {{81,90},{0,0},{0,0},{0,0}} },
            { "of Conflagration", 75, 500, 1, {{91,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 72: {
            const ModifierTierData all_tiers[] = {
            { "of Freezing", 15, 1000, 1, {{31,40},{0,0},{0,0},{0,0}} },
            { "of Bleakness", 30, 1000, 1, {{41,50},{0,0},{0,0},{0,0}} },
            { "of the Glacier", 45, 1000, 1, {{51,60},{0,0},{0,0},{0,0}} },
            { "of the Hyperboreal", 60, 500, 1, {{61,70},{0,0},{0,0},{0,0}} },
            { "of the Arctic", 75, 500, 1, {{71,80},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 73: {
            const ModifierTierData all_tiers[] = {
            { "of Shocking", 15, 1000, 1, {{51,60},{0,0},{0,0},{0,0}} },
            { "of Zapping", 30, 1000, 1, {{61,70},{0,0},{0,0},{0,0}} },
            { "of Electrocution", 45, 1000, 1, {{71,80},{0,0},{0,0},{0,0}} },
            { "of Voltages", 60, 500, 1, {{81,90},{0,0},{0,0},{0,0}} },
            { "of the Thunderbolt", 75, 500, 1, {{91,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 74: {
            const ModifierTierData all_tiers[] = {
            { "Glinting", 1, 1000, 2, {{2,3},{5,7},{0,0},{0,0}} },
            { "Burnished", 8, 1000, 2, {{5,8},{10,15},{0,0},{0,0}} },
            { "Polished", 16, 1000, 2, {{8,12},{15,22},{0,0},{0,0}} },
            { "Honed", 33, 1000, 2, {{11,17},{20,30},{0,0},{0,0}} },
            { "Gleaming", 46, 1000, 2, {{14,21},{25,37},{0,0},{0,0}} },
            { "Annealed", 54, 600, 2, {{19,29},{33,49},{0,0},{0,0}} },
            { "Razor-sharp", 60, 400, 2, {{23,35},{39,59},{0,0},{0,0}} },
            { "Tempered", 65, 200, 2, {{29,44},{50,75},{0,0},{0,0}} },
            { "Flaring", 75, 100, 2, {{37,55},{63,94},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 75: {
            const ModifierTierData all_tiers[] = {
            { "Heated", 1, 1000, 2, {{2,4},{5,7},{0,0},{0,0}} },
            { "Smouldering", 8, 1000, 2, {{6,9},{10,16},{0,0},{0,0}} },
            { "Smoking", 16, 1000, 2, {{11,17},{19,28},{0,0},{0,0}} },
            { "Burning", 33, 1000, 2, {{19,27},{30,42},{0,0},{0,0}} },
            { "Flaming", 46, 1000, 2, {{30,37},{45,56},{0,0},{0,0}} },
            { "Scorching", 54, 1000, 2, {{39,53},{59,80},{0,0},{0,0}} },
            { "Incinerating", 60, 600, 2, {{56,70},{84,107},{0,0},{0,0}} },
            { "Blasting", 65, 400, 2, {{73,97},{112,149},{0,0},{0,0}} },
            { "Cremating", 75, 250, 2, {{102,130},{155,198},{0,0},{0,0}} },
            { "Carbonising", 81, 100, 2, {{135,156},{205,236},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 76: {
            const ModifierTierData all_tiers[] = {
            { "Frosted", 1, 800, 2, {{2,3},{4,6},{0,0},{0,0}} },
            { "Chilled", 8, 800, 2, {{5,8},{9,14},{0,0},{0,0}} },
            { "Icy", 16, 800, 2, {{10,14},{15,23},{0,0},{0,0}} },
            { "Frigid", 33, 800, 2, {{16,23},{25,35},{0,0},{0,0}} },
            { "Freezing", 46, 800, 2, {{25,30},{38,46},{0,0},{0,0}} },
            { "Frozen", 54, 800, 2, {{32,43},{49,66},{0,0},{0,0}} },
            { "Glaciated", 60, 480, 2, {{46,57},{70,88},{0,0},{0,0}} },
            { "Polar", 65, 320, 2, {{60,80},{92,121},{0,0},{0,0}} },
            { "Entombing", 75, 200, 2, {{84,107},{126,161},{0,0},{0,0}} },
            { "Crystalising", 81, 80, 2, {{112,124},{168,189},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 77: {
            const ModifierTierData all_tiers[] = {
            { "Humming", 1, 1000, 2, {{1,1},{7,10},{0,0},{0,0}} },
            { "Buzzing", 8, 1000, 2, {{1,2},{19,27},{0,0},{0,0}} },
            { "Snapping", 16, 1000, 2, {{1,3},{31,43},{0,0},{0,0}} },
            { "Crackling", 33, 1000, 2, {{1,4},{53,76},{0,0},{0,0}} },
            { "Sparking", 46, 1000, 2, {{1,4},{80,88},{0,0},{0,0}} },
            { "Arcing", 54, 1000, 2, {{1,6},{93,122},{0,0},{0,0}} },
            { "Shocking", 60, 600, 2, {{1,8},{128,162},{0,0},{0,0}} },
            { "Discharging", 65, 400, 2, {{1,13},{168,231},{0,0},{0,0}} },
            { "Electrocuting", 75, 250, 2, {{1,16},{239,300},{0,0},{0,0}} },
            { "Vapourising", 81, 100, 2, {{1,19},{310,358},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 78: {
            const ModifierTierData all_tiers[] = {
            { "Heavy", 1, 1000, 1, {{40,49},{0,0},{0,0},{0,0}} },
            { "Serrated", 8, 1000, 1, {{50,64},{0,0},{0,0},{0,0}} },
            { "Wicked", 16, 1000, 1, {{65,84},{0,0},{0,0},{0,0}} },
            { "Vicious", 33, 400, 1, {{85,109},{0,0},{0,0},{0,0}} },
            { "Bloodthirsty", 46, 200, 1, {{110,134},{0,0},{0,0},{0,0}} },
            { "Cruel", 60, 100, 1, {{135,154},{0,0},{0,0},{0,0}} },
            { "Tyrannical", 75, 50, 1, {{155,169},{0,0},{0,0},{0,0}} },
            { "Merciless", 82, 25, 1, {{170,179},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 79: {
            const ModifierTierData all_tiers[] = {
            { "Squire's", 1, 1000, 2, {{15,19},{16,20},{0,0},{0,0}} },
            { "Journeyman's", 11, 1000, 2, {{20,24},{21,46},{0,0},{0,0}} },
            { "Reaver's", 23, 1000, 2, {{25,34},{47,72},{0,0},{0,0}} },
            { "Mercenary's", 38, 1000, 2, {{35,44},{73,97},{0,0},{0,0}} },
            { "Champion's", 54, 600, 2, {{45,54},{98,123},{0,0},{0,0}} },
            { "Conqueror's", 65, 400, 2, {{55,64},{124,149},{0,0},{0,0}} },
            { "Emperor's", 70, 200, 2, {{65,74},{150,174},{0,0},{0,0}} },
            { "Dictator's", 81, 100, 2, {{75,79},{175,200},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 80: {
            const ModifierTierData all_tiers[] = {
            { "Squire's", 1, 1000, 2, {{15,19},{16,20},{0,0},{0,0}} },
            { "Journeyman's", 11, 1000, 2, {{20,24},{21,46},{0,0},{0,0}} },
            { "Reaver's", 23, 1000, 2, {{25,34},{47,72},{0,0},{0,0}} },
            { "Mercenary's", 38, 1000, 2, {{35,44},{73,97},{0,0},{0,0}} },
            { "Champion's", 54, 600, 2, {{45,54},{98,123},{0,0},{0,0}} },
            { "Conqueror's", 65, 400, 2, {{55,64},{124,149},{0,0},{0,0}} },
            { "Emperor's", 70, 200, 2, {{65,74},{150,174},{0,0},{0,0}} },
            { "Dictator's", 81, 100, 2, {{75,79},{175,200},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 81: {
            const ModifierTierData all_tiers[] = {
            { "Catalysing", 4, 500, 1, {{34,47},{0,0},{0,0},{0,0}} },
            { "Infusing", 16, 500, 1, {{48,71},{0,0},{0,0},{0,0}} },
            { "Empowering", 33, 500, 1, {{72,85},{0,0},{0,0},{0,0}} },
            { "Unleashed", 46, 500, 1, {{86,99},{0,0},{0,0},{0,0}} },
            { "Overpowering", 60, 500, 1, {{100,119},{0,0},{0,0},{0,0}} },
            { "Devastating", 81, 500, 1, {{120,139},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 82: {
            const ModifierTierData all_tiers[] = {
            { "of the Brute", 1, 500, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Wrestler", 500, 500, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Bear", 22, 500, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Lion", 33, 500, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Gorilla", 44, 500, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Goliath", 55, 500, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Leviathan", 66, 500, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Titan", 74, 500, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 83: {
            const ModifierTierData all_tiers[] = {
            { "of the Mongoose", 1, 500, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Lynx", 11, 500, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Fox", 22, 500, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Falcon", 33, 500, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Panther", 44, 500, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Leopard", 55, 500, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Jaguar", 66, 500, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Phantom", 74, 500, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 84: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 1000, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 1000, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 1000, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 1000, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 1000, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 85: {
            const ModifierTierData all_tiers[] = {
            { "of the Archer", 2, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of the Fletcher", 18, 750, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of the Sharpshooter", 36, 500, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of the Marksman", 55, 250, 1, {{5,6},{0,0},{0,0},{0,0}} },
            { "of the Sniper", 81, 100, 1, {{7,7},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 86: {
            const ModifierTierData all_tiers[] = {
            { "of the Parasite", 21, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            { "of the Locust", 38, 1000, 1, {{6,6},{0,0},{0,0},{0,0}} },
            { "of the Remora", 54, 1000, 1, {{7,7},{0,0},{0,0},{0,0}} },
            { "of the Lamprey", 68, 1000, 1, {{8,8},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 87: {
            const ModifierTierData all_tiers[] = {
            { "of the Thirsty", 21, 1000, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of the Parched", 38, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            { "of the Arid", 54, 1000, 1, {{6,6},{0,0},{0,0},{0,0}} },
            { "of the Drought", 68, 1000, 1, {{7,7},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 88: {
            const ModifierTierData all_tiers[] = {
            { "of Success", 1, 750, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of Victory", 11, 750, 1, {{7,9},{0,0},{0,0},{0,0}} },
            { "of Triumph", 22, 750, 1, {{10,18},{0,0},{0,0},{0,0}} },
            { "of Conquest", 33, 750, 1, {{19,28},{0,0},{0,0},{0,0}} },
            { "of Vanquishing", 44, 750, 1, {{29,40},{0,0},{0,0},{0,0}} },
            { "of Valour", 55, 750, 1, {{41,53},{0,0},{0,0},{0,0}} },
            { "of Glory", 66, 750, 1, {{54,68},{0,0},{0,0},{0,0}} },
            { "of Legend", 77, 750, 1, {{69,84},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 89: {
            const ModifierTierData all_tiers[] = {
            { "of Absorption", 1, 750, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of Osmosis", 12, 750, 1, {{4,5},{0,0},{0,0},{0,0}} },
            { "of Infusion", 23, 750, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of Enveloping", 34, 750, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Consumption", 45, 750, 1, {{15,20},{0,0},{0,0},{0,0}} },
            { "of Siphoning", 56, 750, 1, {{21,27},{0,0},{0,0},{0,0}} },
            { "of Devouring", 67, 750, 1, {{28,35},{0,0},{0,0},{0,0}} },
            { "of Assimilation", 78, 750, 1, {{36,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 90: {
            const ModifierTierData all_tiers[] = {
            { "of Rejuvenation", 8, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Restoration", 20, 1000, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Regrowth", 30, 1000, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of Nourishment", 40, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 91: {
            const ModifierTierData all_tiers[] = {
            { "of Skill", 1, 1000, 1, {{5,7},{0,0},{0,0},{0,0}} },
            { "of Ease", 11, 1000, 1, {{8,10},{0,0},{0,0},{0,0}} },
            { "of Mastery", 22, 1000, 1, {{11,13},{0,0},{0,0},{0,0}} },
            { "of Renown", 30, 500, 1, {{14,16},{0,0},{0,0},{0,0}} },
            { "of Acclaim", 37, 400, 1, {{17,19},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 92: {
            const ModifierTierData all_tiers[] = {
            { "of Menace", 1, 1000, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Havoc", 20, 1000, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "of Disaster", 30, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Calamity", 44, 500, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Ruin", 59, 250, 1, {{3,4},{0,0},{0,0},{0,0}} },
            { "of Unmaking", 73, 125, 1, {{4,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 93: {
            const ModifierTierData all_tiers[] = {
            { "of Ire", 8, 1000, 1, {{10,11},{0,0},{0,0},{0,0}} },
            { "of Anger", 21, 1000, 1, {{12,13},{0,0},{0,0},{0,0}} },
            { "of Rage", 30, 1000, 1, {{14,16},{0,0},{0,0},{0,0}} },
            { "of Fury", 44, 500, 1, {{17,19},{0,0},{0,0},{0,0}} },
            { "of Ferocity", 59, 250, 1, {{20,22},{0,0},{0,0},{0,0}} },
            { "of Destruction", 73, 125, 1, {{23,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 94: {
            const ModifierTierData all_tiers[] = {
            { "of Shining", 8, 1000, 2, {{10,20},{5,5},{0,0},{0,0}} },
            { "of Light", 15, 1000, 2, {{21,40},{10,10},{0,0},{0,0}} },
            { "of Radiance", 30, 1000, 2, {{41,60},{15,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 95: {
            const ModifierTierData all_tiers[] = {
            { "of Shelling", 55, 250, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Bursting", 82, 125, 1, {{2,2},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 96: {
            const ModifierTierData all_tiers[] = {
            { "Glinting", 1, 1000, 2, {{1,2},{4,5},{0,0},{0,0}} },
            { "Burnished", 8, 1000, 2, {{4,6},{7,11},{0,0},{0,0}} },
            { "Polished", 16, 1000, 2, {{6,9},{11,16},{0,0},{0,0}} },
            { "Honed", 33, 1000, 2, {{8,12},{14,21},{0,0},{0,0}} },
            { "Gleaming", 46, 1000, 2, {{10,15},{18,26},{0,0},{0,0}} },
            { "Annealed", 54, 600, 2, {{13,20},{23,35},{0,0},{0,0}} },
            { "Razor-sharp", 60, 400, 2, {{16,24},{28,42},{0,0},{0,0}} },
            { "Tempered", 65, 200, 2, {{21,31},{36,53},{0,0},{0,0}} },
            { "Flaring", 75, 100, 2, {{26,39},{44,66},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 97: {
            const ModifierTierData all_tiers[] = {
            { "Heated", 1, 800, 2, {{1,2},{3,5},{0,0},{0,0}} },
            { "Smouldering", 8, 800, 2, {{4,6},{7,10},{0,0},{0,0}} },
            { "Smoking", 16, 800, 2, {{7,11},{13,19},{0,0},{0,0}} },
            { "Burning", 33, 800, 2, {{13,19},{21,29},{0,0},{0,0}} },
            { "Flaming", 46, 800, 2, {{20,24},{32,37},{0,0},{0,0}} },
            { "Scorching", 54, 800, 2, {{25,33},{38,54},{0,0},{0,0}} },
            { "Incinerating", 60, 480, 2, {{35,44},{56,71},{0,0},{0,0}} },
            { "Blasting", 65, 320, 2, {{47,59},{74,97},{0,0},{0,0}} },
            { "Cremating", 75, 200, 2, {{62,85},{101,129},{0,0},{0,0}} },
            { "Carbonising", 81, 80, 2, {{88,101},{133,154},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 98: {
            const ModifierTierData all_tiers[] = {
            { "Frosted", 1, 800, 2, {{1,2},{3,4},{0,0},{0,0}} },
            { "Chilled", 8, 800, 2, {{3,5},{6,9},{0,0},{0,0}} },
            { "Icy", 16, 800, 2, {{6,9},{10,16},{0,0},{0,0}} },
            { "Frigid", 33, 800, 2, {{11,15},{17,24},{0,0},{0,0}} },
            { "Freezing", 46, 800, 2, {{17,20},{26,32},{0,0},{0,0}} },
            { "Frozen", 54, 800, 2, {{22,29},{34,44},{0,0},{0,0}} },
            { "Glaciated", 60, 480, 2, {{31,38},{47,59},{0,0},{0,0}} },
            { "Polar", 65, 320, 2, {{40,53},{62,80},{0,0},{0,0}} },
            { "Entombing", 75, 200, 2, {{55,69},{83,106},{0,0},{0,0}} },
            { "Crystalising", 81, 80, 2, {{72,81},{110,123},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 99: {
            const ModifierTierData all_tiers[] = {
            { "Humming", 1, 1200, 2, {{1,1},{4,6},{0,0},{0,0}} },
            { "Buzzing", 8, 1200, 2, {{1,1},{13,19},{0,0},{0,0}} },
            { "Snapping", 16, 1200, 2, {{1,2},{20,30},{0,0},{0,0}} },
            { "Crackling", 33, 1200, 2, {{1,2},{36,52},{0,0},{0,0}} },
            { "Sparking", 46, 1200, 2, {{1,3},{55,60},{0,0},{0,0}} },
            { "Arcing", 54, 1200, 2, {{1,4},{63,82},{0,0},{0,0}} },
            { "Shocking", 60, 720, 2, {{1,6},{85,107},{0,0},{0,0}} },
            { "Discharging", 65, 480, 2, {{1,8},{111,152},{0,0},{0,0}} },
            { "Electrocuting", 75, 300, 2, {{1,10},{157,196},{0,0},{0,0}} },
            { "Vapourising", 81, 120, 2, {{1,12},{202,234},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 100: {
            const ModifierTierData all_tiers[] = {
            { "Heavy", 1, 1000, 1, {{40,49},{0,0},{0,0},{0,0}} },
            { "Serrated", 8, 1000, 1, {{50,64},{0,0},{0,0},{0,0}} },
            { "Wicked", 16, 1000, 1, {{65,84},{0,0},{0,0},{0,0}} },
            { "Vicious", 33, 400, 1, {{85,109},{0,0},{0,0},{0,0}} },
            { "Bloodthirsty", 46, 200, 1, {{110,134},{0,0},{0,0},{0,0}} },
            { "Cruel", 60, 100, 1, {{135,154},{0,0},{0,0},{0,0}} },
            { "Tyrannical", 75, 50, 1, {{155,169},{0,0},{0,0},{0,0}} },
            { "Merciless", 82, 25, 1, {{170,179},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 101: {
            const ModifierTierData all_tiers[] = {
            { "Squire's", 1, 1000, 2, {{15,19},{16,20},{0,0},{0,0}} },
            { "Journeyman's", 11, 1000, 2, {{20,24},{21,46},{0,0},{0,0}} },
            { "Reaver's", 23, 1000, 2, {{25,34},{47,72},{0,0},{0,0}} },
            { "Mercenary's", 38, 1000, 2, {{35,44},{73,97},{0,0},{0,0}} },
            { "Champion's", 54, 600, 2, {{45,54},{98,123},{0,0},{0,0}} },
            { "Conqueror's", 65, 400, 2, {{55,64},{124,149},{0,0},{0,0}} },
            { "Emperor's", 70, 200, 2, {{65,74},{150,174},{0,0},{0,0}} },
            { "Dictator's", 81, 100, 2, {{75,79},{175,200},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 102: {
            const ModifierTierData all_tiers[] = {
            { "Squire's", 1, 1000, 2, {{15,19},{16,20},{0,0},{0,0}} },
            { "Journeyman's", 11, 1000, 2, {{20,24},{21,46},{0,0},{0,0}} },
            { "Reaver's", 23, 1000, 2, {{25,34},{47,72},{0,0},{0,0}} },
            { "Mercenary's", 38, 1000, 2, {{35,44},{73,97},{0,0},{0,0}} },
            { "Champion's", 54, 600, 2, {{45,54},{98,123},{0,0},{0,0}} },
            { "Conqueror's", 65, 400, 2, {{55,64},{124,149},{0,0},{0,0}} },
            { "Emperor's", 70, 200, 2, {{65,74},{150,174},{0,0},{0,0}} },
            { "Dictator's", 81, 100, 2, {{75,79},{175,200},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 103: {
            const ModifierTierData all_tiers[] = {
            { "Catalysing", 4, 500, 1, {{19,35},{0,0},{0,0},{0,0}} },
            { "Infusing", 16, 500, 1, {{36,52},{0,0},{0,0},{0,0}} },
            { "Empowering", 33, 500, 1, {{53,62},{0,0},{0,0},{0,0}} },
            { "Unleashed", 46, 500, 1, {{63,72},{0,0},{0,0},{0,0}} },
            { "Overpowering", 60, 500, 1, {{73,86},{0,0},{0,0},{0,0}} },
            { "Devastating", 81, 500, 1, {{87,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 104: {
            const ModifierTierData all_tiers[] = {
            { "of the Mongoose", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Lynx", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Fox", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Falcon", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Panther", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Leopard", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Jaguar", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Phantom", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 105: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 1000, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 1000, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 1000, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 1000, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 1000, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 106: {
            const ModifierTierData all_tiers[] = {
            { "of the Archer", 2, 1000, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of the Fletcher", 18, 750, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of the Sharpshooter", 36, 500, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of the Marksman", 55, 250, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of the Sniper", 81, 100, 1, {{5,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 107: {
            const ModifierTierData all_tiers[] = {
            { "of the Parasite", 21, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            { "of the Locust", 38, 1000, 1, {{6,6},{0,0},{0,0},{0,0}} },
            { "of the Remora", 54, 1000, 1, {{7,7},{0,0},{0,0},{0,0}} },
            { "of the Lamprey", 68, 1000, 1, {{8,8},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 108: {
            const ModifierTierData all_tiers[] = {
            { "of the Thirsty", 21, 1000, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of the Parched", 38, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            { "of the Arid", 54, 1000, 1, {{6,6},{0,0},{0,0},{0,0}} },
            { "of the Drought", 68, 1000, 1, {{7,7},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 109: {
            const ModifierTierData all_tiers[] = {
            { "of Success", 1, 750, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of Victory", 11, 750, 1, {{7,9},{0,0},{0,0},{0,0}} },
            { "of Triumph", 22, 750, 1, {{10,18},{0,0},{0,0},{0,0}} },
            { "of Conquest", 33, 750, 1, {{19,28},{0,0},{0,0},{0,0}} },
            { "of Vanquishing", 44, 750, 1, {{29,40},{0,0},{0,0},{0,0}} },
            { "of Valour", 55, 750, 1, {{41,53},{0,0},{0,0},{0,0}} },
            { "of Glory", 66, 750, 1, {{54,68},{0,0},{0,0},{0,0}} },
            { "of Legend", 77, 750, 1, {{69,84},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 110: {
            const ModifierTierData all_tiers[] = {
            { "of Absorption", 1, 750, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of Osmosis", 12, 750, 1, {{4,5},{0,0},{0,0},{0,0}} },
            { "of Infusion", 23, 750, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of Enveloping", 34, 750, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Consumption", 45, 750, 1, {{15,20},{0,0},{0,0},{0,0}} },
            { "of Siphoning", 56, 750, 1, {{21,27},{0,0},{0,0},{0,0}} },
            { "of Devouring", 67, 750, 1, {{28,35},{0,0},{0,0},{0,0}} },
            { "of Assimilation", 78, 750, 1, {{36,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 111: {
            const ModifierTierData all_tiers[] = {
            { "of Rejuvenation", 8, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Restoration", 20, 1000, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Regrowth", 30, 1000, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of Nourishment", 40, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 112: {
            const ModifierTierData all_tiers[] = {
            { "of Skill", 1, 1000, 1, {{5,7},{0,0},{0,0},{0,0}} },
            { "of Ease", 11, 1000, 1, {{8,10},{0,0},{0,0},{0,0}} },
            { "of Mastery", 22, 1000, 1, {{11,13},{0,0},{0,0},{0,0}} },
            { "of Renown", 30, 1000, 1, {{14,16},{0,0},{0,0},{0,0}} },
            { "of Acclaim", 37, 500, 1, {{17,19},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 113: {
            const ModifierTierData all_tiers[] = {
            { "of Menace", 1, 1000, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Havoc", 20, 1000, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "of Disaster", 30, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Calamity", 44, 500, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Ruin", 59, 250, 1, {{3,4},{0,0},{0,0},{0,0}} },
            { "of Unmaking", 73, 125, 1, {{4,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 114: {
            const ModifierTierData all_tiers[] = {
            { "of Ire", 8, 1000, 1, {{10,11},{0,0},{0,0},{0,0}} },
            { "of Anger", 21, 1000, 1, {{12,13},{0,0},{0,0},{0,0}} },
            { "of Rage", 30, 1000, 1, {{14,16},{0,0},{0,0},{0,0}} },
            { "of Fury", 44, 500, 1, {{17,19},{0,0},{0,0},{0,0}} },
            { "of Ferocity", 59, 250, 1, {{20,22},{0,0},{0,0},{0,0}} },
            { "of Destruction", 73, 125, 1, {{23,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 115: {
            const ModifierTierData all_tiers[] = {
            { "of Shining", 8, 1000, 2, {{10,20},{5,5},{0,0},{0,0}} },
            { "of Light", 15, 1000, 2, {{21,40},{10,10},{0,0},{0,0}} },
            { "of Radiance", 30, 1000, 2, {{41,60},{15,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 116: {
            const ModifierTierData all_tiers[] = {
            { "of Splintering", 55, 250, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Many", 82, 125, 1, {{2,2},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 117: {
            const ModifierTierData all_tiers[] = {
            { "Glinting", 1, 1000, 2, {{1,2},{4,5},{0,0},{0,0}} },
            { "Burnished", 8, 1000, 2, {{4,6},{7,11},{0,0},{0,0}} },
            { "Polished", 16, 1000, 2, {{6,9},{11,16},{0,0},{0,0}} },
            { "Honed", 33, 1000, 2, {{8,12},{14,21},{0,0},{0,0}} },
            { "Gleaming", 46, 1000, 2, {{10,15},{18,26},{0,0},{0,0}} },
            { "Annealed", 54, 600, 2, {{13,20},{23,35},{0,0},{0,0}} },
            { "Razor-sharp", 60, 400, 2, {{16,24},{28,42},{0,0},{0,0}} },
            { "Tempered", 65, 200, 2, {{21,31},{36,53},{0,0},{0,0}} },
            { "Flaring", 75, 100, 2, {{26,39},{44,66},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 118: {
            const ModifierTierData all_tiers[] = {
            { "Heated", 1, 1200, 2, {{1,2},{3,5},{0,0},{0,0}} },
            { "Smouldering", 8, 1200, 2, {{4,6},{7,10},{0,0},{0,0}} },
            { "Smoking", 16, 1200, 2, {{7,11},{13,19},{0,0},{0,0}} },
            { "Burning", 33, 1200, 2, {{13,19},{21,29},{0,0},{0,0}} },
            { "Flaming", 46, 1200, 2, {{20,24},{32,37},{0,0},{0,0}} },
            { "Scorching", 54, 1200, 2, {{25,33},{38,54},{0,0},{0,0}} },
            { "Incinerating", 60, 720, 2, {{35,44},{56,71},{0,0},{0,0}} },
            { "Blasting", 65, 480, 2, {{47,59},{74,97},{0,0},{0,0}} },
            { "Cremating", 75, 300, 2, {{62,85},{101,129},{0,0},{0,0}} },
            { "Carbonising", 81, 120, 2, {{88,101},{133,154},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 119: {
            const ModifierTierData all_tiers[] = {
            { "Frosted", 1, 800, 2, {{1,2},{3,4},{0,0},{0,0}} },
            { "Chilled", 8, 800, 2, {{3,5},{6,9},{0,0},{0,0}} },
            { "Icy", 16, 800, 2, {{6,9},{10,16},{0,0},{0,0}} },
            { "Frigid", 33, 800, 2, {{11,15},{17,24},{0,0},{0,0}} },
            { "Freezing", 46, 800, 2, {{17,20},{26,32},{0,0},{0,0}} },
            { "Frozen", 54, 800, 2, {{22,29},{34,44},{0,0},{0,0}} },
            { "Glaciated", 60, 480, 2, {{31,38},{47,59},{0,0},{0,0}} },
            { "Polar", 65, 320, 2, {{40,53},{62,80},{0,0},{0,0}} },
            { "Entombing", 75, 200, 2, {{55,69},{83,106},{0,0},{0,0}} },
            { "Crystalising", 81, 80, 2, {{72,81},{110,123},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 120: {
            const ModifierTierData all_tiers[] = {
            { "Humming", 1, 800, 2, {{1,1},{4,6},{0,0},{0,0}} },
            { "Buzzing", 8, 800, 2, {{1,1},{13,19},{0,0},{0,0}} },
            { "Snapping", 16, 800, 2, {{1,2},{20,30},{0,0},{0,0}} },
            { "Crackling", 33, 800, 2, {{1,2},{36,52},{0,0},{0,0}} },
            { "Sparking", 46, 800, 2, {{1,3},{55,60},{0,0},{0,0}} },
            { "Arcing", 54, 800, 2, {{1,4},{63,82},{0,0},{0,0}} },
            { "Shocking", 60, 480, 2, {{1,6},{85,107},{0,0},{0,0}} },
            { "Discharging", 65, 320, 2, {{1,8},{111,152},{0,0},{0,0}} },
            { "Electrocuting", 75, 200, 2, {{1,10},{157,196},{0,0},{0,0}} },
            { "Vapourising", 81, 80, 2, {{1,12},{202,234},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 121: {
            const ModifierTierData all_tiers[] = {
            { "Heavy", 1, 1000, 1, {{40,49},{0,0},{0,0},{0,0}} },
            { "Serrated", 8, 1000, 1, {{50,64},{0,0},{0,0},{0,0}} },
            { "Wicked", 16, 1000, 1, {{65,84},{0,0},{0,0},{0,0}} },
            { "Vicious", 33, 400, 1, {{85,109},{0,0},{0,0},{0,0}} },
            { "Bloodthirsty", 46, 200, 1, {{110,134},{0,0},{0,0},{0,0}} },
            { "Cruel", 60, 100, 1, {{135,154},{0,0},{0,0},{0,0}} },
            { "Tyrannical", 75, 50, 1, {{155,169},{0,0},{0,0},{0,0}} },
            { "Merciless", 82, 25, 1, {{170,179},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 122: {
            const ModifierTierData all_tiers[] = {
            { "Squire's", 1, 1000, 2, {{15,19},{16,20},{0,0},{0,0}} },
            { "Journeyman's", 11, 1000, 2, {{20,24},{21,46},{0,0},{0,0}} },
            { "Reaver's", 23, 1000, 2, {{25,34},{47,72},{0,0},{0,0}} },
            { "Mercenary's", 38, 1000, 2, {{35,44},{73,97},{0,0},{0,0}} },
            { "Champion's", 54, 600, 2, {{45,54},{98,123},{0,0},{0,0}} },
            { "Conqueror's", 65, 400, 2, {{55,64},{124,149},{0,0},{0,0}} },
            { "Emperor's", 70, 200, 2, {{65,74},{150,174},{0,0},{0,0}} },
            { "Dictator's", 81, 100, 2, {{75,79},{175,200},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 123: {
            const ModifierTierData all_tiers[] = {
            { "Squire's", 1, 1000, 2, {{15,19},{16,20},{0,0},{0,0}} },
            { "Journeyman's", 11, 1000, 2, {{20,24},{21,46},{0,0},{0,0}} },
            { "Reaver's", 23, 1000, 2, {{25,34},{47,72},{0,0},{0,0}} },
            { "Mercenary's", 38, 1000, 2, {{35,44},{73,97},{0,0},{0,0}} },
            { "Champion's", 54, 600, 2, {{45,54},{98,123},{0,0},{0,0}} },
            { "Conqueror's", 65, 400, 2, {{55,64},{124,149},{0,0},{0,0}} },
            { "Emperor's", 70, 200, 2, {{65,74},{150,174},{0,0},{0,0}} },
            { "Dictator's", 81, 100, 2, {{75,79},{175,200},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 124: {
            const ModifierTierData all_tiers[] = {
            { "Catalysing", 4, 500, 1, {{19,35},{0,0},{0,0},{0,0}} },
            { "Infusing", 16, 500, 1, {{36,52},{0,0},{0,0},{0,0}} },
            { "Empowering", 33, 500, 1, {{53,62},{0,0},{0,0},{0,0}} },
            { "Unleashed", 46, 500, 1, {{63,72},{0,0},{0,0},{0,0}} },
            { "Overpowering", 60, 500, 1, {{73,86},{0,0},{0,0},{0,0}} },
            { "Devastating", 81, 500, 1, {{87,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 125: {
            const ModifierTierData all_tiers[] = {
            { "of the Brute", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Wrestler", 1000, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Bear", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Lion", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Gorilla", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Goliath", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Leviathan", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Titan", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 126: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 1000, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 1000, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 1000, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 1000, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 1000, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 127: {
            const ModifierTierData all_tiers[] = {
            { "of Combat", 2, 1000, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Dueling", 18, 750, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Conflict", 36, 500, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Battle", 55, 250, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of War", 81, 100, 1, {{5,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 128: {
            const ModifierTierData all_tiers[] = {
            { "of the Parasite", 21, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            { "of the Locust", 38, 1000, 1, {{6,6},{0,0},{0,0},{0,0}} },
            { "of the Remora", 54, 1000, 1, {{7,7},{0,0},{0,0},{0,0}} },
            { "of the Lamprey", 68, 1000, 1, {{8,8},{0,0},{0,0},{0,0}} },
            { "of the Vampire", 81, 1000, 1, {{9,9},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 129: {
            const ModifierTierData all_tiers[] = {
            { "of the Thirsty", 21, 1000, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of the Parched", 38, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            { "of the Arid", 54, 1000, 1, {{6,6},{0,0},{0,0},{0,0}} },
            { "of the Drought", 68, 1000, 1, {{7,7},{0,0},{0,0},{0,0}} },
            { "of the Desperate", 81, 1000, 1, {{8,8},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 130: {
            const ModifierTierData all_tiers[] = {
            { "of Success", 1, 750, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of Victory", 11, 750, 1, {{7,9},{0,0},{0,0},{0,0}} },
            { "of Triumph", 22, 750, 1, {{10,18},{0,0},{0,0},{0,0}} },
            { "of Conquest", 33, 750, 1, {{19,28},{0,0},{0,0},{0,0}} },
            { "of Vanquishing", 44, 750, 1, {{29,40},{0,0},{0,0},{0,0}} },
            { "of Valour", 55, 750, 1, {{41,53},{0,0},{0,0},{0,0}} },
            { "of Glory", 66, 750, 1, {{54,68},{0,0},{0,0},{0,0}} },
            { "of Legend", 77, 750, 1, {{69,84},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 131: {
            const ModifierTierData all_tiers[] = {
            { "of Absorption", 1, 750, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of Osmosis", 12, 750, 1, {{4,5},{0,0},{0,0},{0,0}} },
            { "of Infusion", 23, 750, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of Enveloping", 34, 750, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Consumption", 45, 750, 1, {{15,20},{0,0},{0,0},{0,0}} },
            { "of Siphoning", 56, 750, 1, {{21,27},{0,0},{0,0},{0,0}} },
            { "of Devouring", 67, 750, 1, {{28,35},{0,0},{0,0},{0,0}} },
            { "of Assimilation", 78, 750, 1, {{36,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 132: {
            const ModifierTierData all_tiers[] = {
            { "of Rejuvenation", 8, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Restoration", 20, 1000, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Regrowth", 30, 1000, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of Nourishment", 40, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 133: {
            const ModifierTierData all_tiers[] = {
            { "of Skill", 1, 1000, 1, {{5,7},{0,0},{0,0},{0,0}} },
            { "of Ease", 11, 1000, 1, {{8,10},{0,0},{0,0},{0,0}} },
            { "of Mastery", 22, 1000, 1, {{11,13},{0,0},{0,0},{0,0}} },
            { "of Renown", 30, 1000, 1, {{14,16},{0,0},{0,0},{0,0}} },
            { "of Acclaim", 37, 500, 1, {{17,19},{0,0},{0,0},{0,0}} },
            { "of Fame", 45, 500, 1, {{20,22},{0,0},{0,0},{0,0}} },
            { "of Infamy", 60, 200, 1, {{23,25},{0,0},{0,0},{0,0}} },
            { "of Celebration", 77, 100, 1, {{26,28},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 134: {
            const ModifierTierData all_tiers[] = {
            { "of Menace", 1, 1000, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Havoc", 20, 1000, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "of Disaster", 30, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Calamity", 44, 500, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Ruin", 59, 250, 1, {{3,4},{0,0},{0,0},{0,0}} },
            { "of Unmaking", 73, 125, 1, {{4,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 135: {
            const ModifierTierData all_tiers[] = {
            { "of Ire", 8, 1000, 1, {{10,11},{0,0},{0,0},{0,0}} },
            { "of Anger", 21, 1000, 1, {{12,13},{0,0},{0,0},{0,0}} },
            { "of Rage", 30, 1000, 1, {{14,16},{0,0},{0,0},{0,0}} },
            { "of Fury", 44, 500, 1, {{17,19},{0,0},{0,0},{0,0}} },
            { "of Ferocity", 59, 250, 1, {{20,22},{0,0},{0,0},{0,0}} },
            { "of Destruction", 73, 125, 1, {{23,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 136: {
            const ModifierTierData all_tiers[] = {
            { "of Shining", 8, 1000, 2, {{10,20},{5,5},{0,0},{0,0}} },
            { "of Light", 15, 1000, 2, {{21,40},{10,10},{0,0},{0,0}} },
            { "of Radiance", 30, 1000, 2, {{41,60},{15,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 137: {
            const ModifierTierData all_tiers[] = {
            { "of Impact", 5, 1000, 1, {{11,13},{0,0},{0,0},{0,0}} },
            { "of Dazing", 18, 1000, 1, {{14,16},{0,0},{0,0},{0,0}} },
            { "of Stunning", 30, 1000, 1, {{17,19},{0,0},{0,0},{0,0}} },
            { "of Slamming", 44, 1000, 1, {{20,22},{0,0},{0,0},{0,0}} },
            { "of Staggering", 58, 1000, 1, {{23,26},{0,0},{0,0},{0,0}} },
            { "of the Concussion", 71, 1000, 1, {{27,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 138: {
            const ModifierTierData all_tiers[] = {
            { "of the Pugilist", 5, 1000, 1, {{21,30},{0,0},{0,0},{0,0}} },
            { "of the Brawler", 20, 1000, 1, {{31,40},{0,0},{0,0},{0,0}} },
            { "of the Boxer", 30, 1000, 1, {{41,50},{0,0},{0,0},{0,0}} },
            { "of the Combatant", 44, 1000, 1, {{51,60},{0,0},{0,0},{0,0}} },
            { "of the Gladiator", 58, 1000, 1, {{61,70},{0,0},{0,0},{0,0}} },
            { "of the Champion", 74, 1000, 1, {{71,80},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 139: {
            const ModifierTierData all_tiers[] = {
            { "Beryl", 1, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "Cobalt", 6, 1000, 1, {{15,24},{0,0},{0,0},{0,0}} },
            { "Azure", 16, 1000, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Teal", 25, 1000, 1, {{35,54},{0,0},{0,0},{0,0}} },
            { "Cerulean", 33, 1000, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Aqua", 38, 1000, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Opalescent", 46, 1000, 1, {{80,89},{0,0},{0,0},{0,0}} },
            { "Gentian", 54, 1000, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Chalybeous", 60, 1000, 1, {{105,124},{0,0},{0,0},{0,0}} },
            { "Mazarine", 65, 1000, 1, {{125,149},{0,0},{0,0},{0,0}} },
            { "Blue", 70, 1000, 1, {{150,164},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 140: {
            const ModifierTierData all_tiers[] = {
            { "Glinting", 1, 500, 2, {{1,2},{3,4},{0,0},{0,0}} },
            { "Burnished", 8, 500, 2, {{2,3},{4,6},{0,0},{0,0}} },
            { "Polished", 16, 500, 2, {{2,4},{5,8},{0,0},{0,0}} },
            { "Honed", 33, 500, 2, {{4,6},{8,11},{0,0},{0,0}} },
            { "Gleaming", 46, 500, 2, {{5,7},{9,13},{0,0},{0,0}} },
            { "Annealed", 54, 500, 2, {{6,10},{12,17},{0,0},{0,0}} },
            { "Razor-sharp", 60, 400, 2, {{7,11},{14,20},{0,0},{0,0}} },
            { "Tempered", 65, 300, 2, {{10,15},{18,26},{0,0},{0,0}} },
            { "Flaring", 75, 200, 2, {{12,19},{22,32},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 141: {
            const ModifierTierData all_tiers[] = {
            { "Heated", 1, 500, 2, {{1,2},{3,4},{0,0},{0,0}} },
            { "Smouldering", 8, 500, 2, {{3,5},{6,9},{0,0},{0,0}} },
            { "Smoking", 16, 500, 2, {{6,8},{10,13},{0,0},{0,0}} },
            { "Burning", 33, 500, 2, {{9,11},{14,17},{0,0},{0,0}} },
            { "Flaming", 46, 500, 2, {{12,13},{18,20},{0,0},{0,0}} },
            { "Scorching", 54, 500, 2, {{14,16},{21,26},{0,0},{0,0}} },
            { "Incinerating", 60, 400, 2, {{17,19},{27,30},{0,0},{0,0}} },
            { "Blasting", 65, 300, 2, {{20,24},{31,38},{0,0},{0,0}} },
            { "Cremating", 75, 200, 2, {{25,29},{39,45},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 142: {
            const ModifierTierData all_tiers[] = {
            { "Frosted", 1, 500, 2, {{1,2},{3,4},{0,0},{0,0}} },
            { "Chilled", 8, 500, 2, {{3,4},{5,8},{0,0},{0,0}} },
            { "Icy", 16, 500, 2, {{5,6},{9,11},{0,0},{0,0}} },
            { "Frigid", 33, 500, 2, {{7,8},{12,14},{0,0},{0,0}} },
            { "Freezing", 46, 500, 2, {{9,10},{15,17},{0,0},{0,0}} },
            { "Frozen", 54, 500, 2, {{11,13},{18,21},{0,0},{0,0}} },
            { "Glaciated", 60, 400, 2, {{14,15},{22,24},{0,0},{0,0}} },
            { "Polar", 65, 300, 2, {{16,20},{25,31},{0,0},{0,0}} },
            { "Entombing", 75, 200, 2, {{21,24},{32,37},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 143: {
            const ModifierTierData all_tiers[] = {
            { "Humming", 1, 500, 2, {{1,1},{5,7},{0,0},{0,0}} },
            { "Buzzing", 8, 500, 2, {{1,1},{10,15},{0,0},{0,0}} },
            { "Snapping", 16, 500, 2, {{1,1},{16,22},{0,0},{0,0}} },
            { "Crackling", 33, 500, 2, {{1,1},{23,27},{0,0},{0,0}} },
            { "Sparking", 46, 500, 2, {{1,1},{28,32},{0,0},{0,0}} },
            { "Arcing", 54, 400, 2, {{1,2},{33,40},{0,0},{0,0}} },
            { "Shocking", 60, 400, 2, {{1,2},{41,47},{0,0},{0,0}} },
            { "Discharging", 65, 300, 2, {{1,3},{48,59},{0,0},{0,0}} },
            { "Electrocuting", 75, 200, 2, {{1,4},{60,71},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 144: {
            const ModifierTierData all_tiers[] = {
            { "Coercive", 1, 1000, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Agitative", 8, 1000, 1, {{35,44},{0,0},{0,0},{0,0}} },
            { "Instigative", 16, 1000, 1, {{45,54},{0,0},{0,0},{0,0}} },
            { "Provocative", 33, 600, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Persuasive", 46, 400, 1, {{65,74},{0,0},{0,0},{0,0}} },
            { "Motivating", 60, 200, 1, {{75,89},{0,0},{0,0},{0,0}} },
            { "Inspirational", 70, 100, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Empowering", 82, 50, 1, {{105,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 145: {
            const ModifierTierData all_tiers[] = {
            { "Lord's", 1, 1000, 1, {{30,36},{0,0},{0,0},{0,0}} },
            { "Baron's", 8, 1000, 1, {{27,32},{0,0},{0,0},{0,0}} },
            { "Viscount's", 16, 1000, 1, {{33,38},{0,0},{0,0},{0,0}} },
            { "Marquess'", 33, 600, 1, {{39,44},{0,0},{0,0},{0,0}} },
            { "Count's", 46, 400, 1, {{45,50},{0,0},{0,0},{0,0}} },
            { "Duke's", 60, 200, 1, {{51,55},{0,0},{0,0},{0,0}} },
            { "Prince's", 75, 100, 1, {{56,60},{0,0},{0,0},{0,0}} },
            { "King's", 82, 50, 1, {{61,65},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 146: {
            const ModifierTierData all_tiers[] = {
            { "Advisor's", 2, 1000, 2, {{10,14},{17,20},{0,0},{0,0}} },
            { "Counselor's", 11, 1000, 2, {{15,18},{21,24},{0,0},{0,0}} },
            { "Emissary's", 26, 1000, 2, {{19,22},{25,28},{0,0},{0,0}} },
            { "Minister's", 36, 600, 2, {{23,26},{29,33},{0,0},{0,0}} },
            { "Envoy's", 48, 400, 2, {{27,30},{34,37},{0,0},{0,0}} },
            { "Diplomat's", 58, 200, 2, {{31,34},{38,41},{0,0},{0,0}} },
            { "Chancellor's", 70, 100, 2, {{35,38},{42,45},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 147: {
            const ModifierTierData all_tiers[] = {
            { "of the Brute", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Wrestler", 1000, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Bear", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Lion", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Gorilla", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Goliath", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Leviathan", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Titan", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 148: {
            const ModifierTierData all_tiers[] = {
            { "of the Pupil", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Student", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Prodigy", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Augur", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Philosopher", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Sage", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Savant", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Virtuoso", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 149: {
            const ModifierTierData all_tiers[] = {
            { "of Adjustment", 12, 800, 1, {{3,5},{0,0},{0,0},{0,0}} },
            { "of Acclimatisation", 26, 800, 1, {{6,8},{0,0},{0,0},{0,0}} },
            { "of Adaptation", 40, 800, 1, {{9,11},{0,0},{0,0},{0,0}} },
            { "of Evolution", 54, 800, 1, {{12,14},{0,0},{0,0},{0,0}} },
            { "of Progression", 68, 800, 1, {{15,16},{0,0},{0,0},{0,0}} },
            { "of Metamorphosis", 80, 800, 1, {{17,18},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 150: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 1000, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 1000, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 1000, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 1000, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 1000, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 151: {
            const ModifierTierData all_tiers[] = {
            { "of the Taskmaster", 2, 750, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of the Despot", 25, 500, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of the Overseer", 55, 250, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of the Slavedriver", 78, 100, 1, {{4,4},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 152: {
            const ModifierTierData all_tiers[] = {
            { "of the Newt", 1, 1000, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "of the Lizard", 5, 1000, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of the Flatworm", 11, 1000, 1, {{3,4},{0,0},{0,0},{0,0}} },
            { "of the Starfish", 17, 1000, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of the Hydra", 26, 1000, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of the Troll", 35, 1000, 1, {{9,13},{0,0},{0,0},{0,0}} },
            { "of Convalescence", 47, 1000, 1, {{13,18},{0,0},{0,0},{0,0}} },
            { "of Recuperation", 58, 1000, 1, {{18,23},{0,0},{0,0},{0,0}} },
            { "of Resurgence", 68, 1000, 1, {{23,29},{0,0},{0,0},{0,0}} },
            { "of Immortality", 75, 1000, 1, {{29,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 153: {
            const ModifierTierData all_tiers[] = {
            { "of Skill", 5, 1000, 1, {{5,7},{0,0},{0,0},{0,0}} },
            { "of Ease", 20, 1000, 1, {{8,10},{0,0},{0,0},{0,0}} },
            { "of Mastery", 35, 1000, 1, {{11,13},{0,0},{0,0},{0,0}} },
            { "of Renown", 55, 1000, 1, {{14,16},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 154: {
            const ModifierTierData all_tiers[] = {
            { "of Talent", 6, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of Nimbleness", 21, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of Expertise", 36, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of Sortilege", 56, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 155: {
            const ModifierTierData all_tiers[] = {
            { "of Menace", 11, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Havoc", 21, 1000, 1, {{15,19},{0,0},{0,0},{0,0}} },
            { "of Disaster", 28, 1000, 1, {{20,24},{0,0},{0,0},{0,0}} },
            { "of Calamity", 41, 500, 1, {{25,29},{0,0},{0,0},{0,0}} },
            { "of Ruin", 59, 250, 1, {{30,34},{0,0},{0,0},{0,0}} },
            { "of Unmaking", 76, 125, 1, {{35,38},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 156: {
            const ModifierTierData all_tiers[] = {
            { "of Ire", 8, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Anger", 21, 1000, 1, {{15,19},{0,0},{0,0},{0,0}} },
            { "of Rage", 30, 1000, 1, {{20,24},{0,0},{0,0},{0,0}} },
            { "of Fury", 44, 500, 1, {{25,29},{0,0},{0,0},{0,0}} },
            { "of Ferocity", 59, 250, 1, {{30,34},{0,0},{0,0},{0,0}} },
            { "of Destruction", 73, 125, 1, {{35,39},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 157: {
            const ModifierTierData all_tiers[] = {
            { "of Warmth", 8, 1000, 2, {{8,12},{5,5},{0,0},{0,0}} },
            { "of Kindling", 15, 1000, 2, {{13,17},{10,10},{0,0},{0,0}} },
            { "of the Hearth", 30, 1000, 2, {{18,22},{15,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 158: {
            const ModifierTierData all_tiers[] = {
            { "of Direction", 23, 500, 1, {{36,45},{0,0},{0,0},{0,0}} },
            { "of Outreach", 40, 500, 1, {{46,55},{0,0},{0,0},{0,0}} },
            { "of Guidance", 56, 500, 1, {{56,65},{0,0},{0,0},{0,0}} },
            { "of Influence", 72, 500, 1, {{66,80},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 159: {
            const ModifierTierData all_tiers[] = {
            { "of the Mentor", 2, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Tutor", 16, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Director", 32, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Headmaster", 48, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of the Administrator", 64, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            { "of the Rector", 80, 1000, 1, {{46,50},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 160: {
            const ModifierTierData all_tiers[] = {
            { "Glinting", 1, 1000, 2, {{1,2},{4,5},{0,0},{0,0}} },
            { "Burnished", 8, 1000, 2, {{4,6},{7,11},{0,0},{0,0}} },
            { "Polished", 16, 1000, 2, {{6,9},{11,16},{0,0},{0,0}} },
            { "Honed", 33, 1000, 2, {{8,12},{14,21},{0,0},{0,0}} },
            { "Gleaming", 46, 1000, 2, {{10,15},{18,26},{0,0},{0,0}} },
            { "Annealed", 54, 600, 2, {{13,20},{23,35},{0,0},{0,0}} },
            { "Razor-sharp", 60, 400, 2, {{16,24},{28,42},{0,0},{0,0}} },
            { "Tempered", 65, 200, 2, {{21,31},{36,53},{0,0},{0,0}} },
            { "Flaring", 75, 100, 2, {{26,39},{44,66},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 161: {
            const ModifierTierData all_tiers[] = {
            { "Heated", 1, 900, 2, {{1,2},{3,5},{0,0},{0,0}} },
            { "Smouldering", 8, 900, 2, {{4,6},{7,10},{0,0},{0,0}} },
            { "Smoking", 16, 900, 2, {{7,11},{13,19},{0,0},{0,0}} },
            { "Burning", 33, 900, 2, {{13,19},{21,29},{0,0},{0,0}} },
            { "Flaming", 46, 900, 2, {{20,24},{32,37},{0,0},{0,0}} },
            { "Scorching", 54, 900, 2, {{25,33},{38,54},{0,0},{0,0}} },
            { "Incinerating", 60, 540, 2, {{35,44},{56,71},{0,0},{0,0}} },
            { "Blasting", 65, 360, 2, {{47,59},{74,97},{0,0},{0,0}} },
            { "Cremating", 75, 225, 2, {{62,85},{101,129},{0,0},{0,0}} },
            { "Carbonising", 81, 90, 2, {{88,101},{133,154},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 162: {
            const ModifierTierData all_tiers[] = {
            { "Frosted", 1, 800, 2, {{1,2},{3,4},{0,0},{0,0}} },
            { "Chilled", 8, 800, 2, {{3,5},{6,9},{0,0},{0,0}} },
            { "Icy", 16, 800, 2, {{6,9},{10,16},{0,0},{0,0}} },
            { "Frigid", 33, 800, 2, {{11,15},{17,24},{0,0},{0,0}} },
            { "Freezing", 46, 800, 2, {{17,20},{26,32},{0,0},{0,0}} },
            { "Frozen", 54, 800, 2, {{22,29},{34,44},{0,0},{0,0}} },
            { "Glaciated", 60, 480, 2, {{31,38},{47,59},{0,0},{0,0}} },
            { "Polar", 65, 320, 2, {{40,53},{62,80},{0,0},{0,0}} },
            { "Entombing", 75, 200, 2, {{55,69},{83,106},{0,0},{0,0}} },
            { "Crystalising", 81, 80, 2, {{72,81},{110,123},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 163: {
            const ModifierTierData all_tiers[] = {
            { "Humming", 1, 1100, 2, {{1,1},{4,6},{0,0},{0,0}} },
            { "Buzzing", 8, 1100, 2, {{1,1},{13,19},{0,0},{0,0}} },
            { "Snapping", 16, 1100, 2, {{1,2},{20,30},{0,0},{0,0}} },
            { "Crackling", 33, 1100, 2, {{1,2},{36,52},{0,0},{0,0}} },
            { "Sparking", 46, 1100, 2, {{1,3},{55,60},{0,0},{0,0}} },
            { "Arcing", 54, 1100, 2, {{1,4},{63,82},{0,0},{0,0}} },
            { "Shocking", 60, 660, 2, {{1,6},{85,107},{0,0},{0,0}} },
            { "Discharging", 65, 440, 2, {{1,8},{111,152},{0,0},{0,0}} },
            { "Electrocuting", 75, 275, 2, {{1,10},{157,196},{0,0},{0,0}} },
            { "Vapourising", 81, 110, 2, {{1,12},{202,234},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 164: {
            const ModifierTierData all_tiers[] = {
            { "Heavy", 1, 1000, 1, {{40,49},{0,0},{0,0},{0,0}} },
            { "Serrated", 8, 1000, 1, {{50,64},{0,0},{0,0},{0,0}} },
            { "Wicked", 16, 1000, 1, {{65,84},{0,0},{0,0},{0,0}} },
            { "Vicious", 33, 400, 1, {{85,109},{0,0},{0,0},{0,0}} },
            { "Bloodthirsty", 46, 200, 1, {{110,134},{0,0},{0,0},{0,0}} },
            { "Cruel", 60, 100, 1, {{135,154},{0,0},{0,0},{0,0}} },
            { "Tyrannical", 75, 50, 1, {{155,169},{0,0},{0,0},{0,0}} },
            { "Merciless", 82, 25, 1, {{170,179},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 165: {
            const ModifierTierData all_tiers[] = {
            { "Squire's", 1, 1000, 2, {{15,19},{16,20},{0,0},{0,0}} },
            { "Journeyman's", 11, 1000, 2, {{20,24},{21,46},{0,0},{0,0}} },
            { "Reaver's", 23, 1000, 2, {{25,34},{47,72},{0,0},{0,0}} },
            { "Mercenary's", 38, 1000, 2, {{35,44},{73,97},{0,0},{0,0}} },
            { "Champion's", 54, 600, 2, {{45,54},{98,123},{0,0},{0,0}} },
            { "Conqueror's", 65, 400, 2, {{55,64},{124,149},{0,0},{0,0}} },
            { "Emperor's", 70, 200, 2, {{65,74},{150,174},{0,0},{0,0}} },
            { "Dictator's", 81, 100, 2, {{75,79},{175,200},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 166: {
            const ModifierTierData all_tiers[] = {
            { "Squire's", 1, 1000, 2, {{15,19},{16,20},{0,0},{0,0}} },
            { "Journeyman's", 11, 1000, 2, {{20,24},{21,46},{0,0},{0,0}} },
            { "Reaver's", 23, 1000, 2, {{25,34},{47,72},{0,0},{0,0}} },
            { "Mercenary's", 38, 1000, 2, {{35,44},{73,97},{0,0},{0,0}} },
            { "Champion's", 54, 600, 2, {{45,54},{98,123},{0,0},{0,0}} },
            { "Conqueror's", 65, 400, 2, {{55,64},{124,149},{0,0},{0,0}} },
            { "Emperor's", 70, 200, 2, {{65,74},{150,174},{0,0},{0,0}} },
            { "Dictator's", 81, 100, 2, {{75,79},{175,200},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 167: {
            const ModifierTierData all_tiers[] = {
            { "Catalysing", 4, 500, 1, {{19,35},{0,0},{0,0},{0,0}} },
            { "Infusing", 16, 500, 1, {{36,52},{0,0},{0,0},{0,0}} },
            { "Empowering", 33, 500, 1, {{53,62},{0,0},{0,0},{0,0}} },
            { "Unleashed", 46, 500, 1, {{63,72},{0,0},{0,0},{0,0}} },
            { "Overpowering", 60, 500, 1, {{73,86},{0,0},{0,0},{0,0}} },
            { "Devastating", 81, 500, 1, {{87,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 168: {
            const ModifierTierData all_tiers[] = {
            { "of the Brute", 1, 250, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Wrestler", 250, 1, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Bear", 22, 250, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Lion", 33, 250, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Gorilla", 44, 250, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Goliath", 55, 250, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Leviathan", 66, 250, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Titan", 74, 250, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 169: {
            const ModifierTierData all_tiers[] = {
            { "of the Mongoose", 1, 750, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Lynx", 11, 750, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Fox", 22, 750, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Falcon", 33, 750, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Panther", 44, 750, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Leopard", 55, 750, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Jaguar", 66, 750, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Phantom", 74, 750, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 170: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 1000, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 1000, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 1000, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 1000, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 1000, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 171: {
            const ModifierTierData all_tiers[] = {
            { "of Combat", 2, 500, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Dueling", 18, 375, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Conflict", 36, 250, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Battle", 55, 125, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of War", 81, 50, 1, {{5,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 172: {
            const ModifierTierData all_tiers[] = {
            { "of the Archer", 2, 500, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of the Fletcher", 18, 375, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of the Sharpshooter", 36, 250, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of the Marksman", 55, 125, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of the Sniper", 81, 50, 1, {{5,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 173: {
            const ModifierTierData all_tiers[] = {
            { "of the Parasite", 21, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            { "of the Locust", 38, 1000, 1, {{6,6},{0,0},{0,0},{0,0}} },
            { "of the Remora", 54, 1000, 1, {{7,7},{0,0},{0,0},{0,0}} },
            { "of the Lamprey", 68, 1000, 1, {{8,8},{0,0},{0,0},{0,0}} },
            { "of the Vampire", 81, 1000, 1, {{9,9},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 174: {
            const ModifierTierData all_tiers[] = {
            { "of the Thirsty", 21, 1000, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of the Parched", 38, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            { "of the Arid", 54, 1000, 1, {{6,6},{0,0},{0,0},{0,0}} },
            { "of the Drought", 68, 1000, 1, {{7,7},{0,0},{0,0},{0,0}} },
            { "of the Desperate", 81, 1000, 1, {{8,8},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 175: {
            const ModifierTierData all_tiers[] = {
            { "of Success", 1, 750, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of Victory", 11, 750, 1, {{7,9},{0,0},{0,0},{0,0}} },
            { "of Triumph", 22, 750, 1, {{10,18},{0,0},{0,0},{0,0}} },
            { "of Conquest", 33, 750, 1, {{19,28},{0,0},{0,0},{0,0}} },
            { "of Vanquishing", 44, 750, 1, {{29,40},{0,0},{0,0},{0,0}} },
            { "of Valour", 55, 750, 1, {{41,53},{0,0},{0,0},{0,0}} },
            { "of Glory", 66, 750, 1, {{54,68},{0,0},{0,0},{0,0}} },
            { "of Legend", 77, 750, 1, {{69,84},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 176: {
            const ModifierTierData all_tiers[] = {
            { "of Absorption", 1, 750, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of Osmosis", 12, 750, 1, {{4,5},{0,0},{0,0},{0,0}} },
            { "of Infusion", 23, 750, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of Enveloping", 34, 750, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Consumption", 45, 750, 1, {{15,20},{0,0},{0,0},{0,0}} },
            { "of Siphoning", 56, 750, 1, {{21,27},{0,0},{0,0},{0,0}} },
            { "of Devouring", 67, 750, 1, {{28,35},{0,0},{0,0},{0,0}} },
            { "of Assimilation", 78, 750, 1, {{36,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 177: {
            const ModifierTierData all_tiers[] = {
            { "of Rejuvenation", 8, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Restoration", 20, 1000, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Regrowth", 30, 1000, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of Nourishment", 40, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 178: {
            const ModifierTierData all_tiers[] = {
            { "of Skill", 1, 1000, 1, {{5,7},{0,0},{0,0},{0,0}} },
            { "of Ease", 11, 1000, 1, {{8,10},{0,0},{0,0},{0,0}} },
            { "of Mastery", 22, 1000, 1, {{11,13},{0,0},{0,0},{0,0}} },
            { "of Renown", 30, 1000, 1, {{14,16},{0,0},{0,0},{0,0}} },
            { "of Acclaim", 37, 500, 1, {{17,19},{0,0},{0,0},{0,0}} },
            { "of Fame", 45, 500, 1, {{20,22},{0,0},{0,0},{0,0}} },
            { "of Infamy", 60, 200, 1, {{23,25},{0,0},{0,0},{0,0}} },
            { "of Celebration", 77, 100, 1, {{26,28},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 179: {
            const ModifierTierData all_tiers[] = {
            { "of Menace", 1, 1000, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Havoc", 20, 1000, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "of Disaster", 30, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Calamity", 44, 500, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Ruin", 59, 250, 1, {{3,4},{0,0},{0,0},{0,0}} },
            { "of Unmaking", 73, 125, 1, {{4,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 180: {
            const ModifierTierData all_tiers[] = {
            { "of Ire", 8, 1000, 1, {{10,11},{0,0},{0,0},{0,0}} },
            { "of Anger", 21, 1000, 1, {{12,13},{0,0},{0,0},{0,0}} },
            { "of Rage", 30, 1000, 1, {{14,16},{0,0},{0,0},{0,0}} },
            { "of Fury", 44, 500, 1, {{17,19},{0,0},{0,0},{0,0}} },
            { "of Ferocity", 59, 250, 1, {{20,22},{0,0},{0,0},{0,0}} },
            { "of Destruction", 73, 125, 1, {{23,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 181: {
            const ModifierTierData all_tiers[] = {
            { "of Shining", 8, 1000, 2, {{10,20},{5,5},{0,0},{0,0}} },
            { "of Light", 15, 1000, 2, {{21,40},{10,10},{0,0},{0,0}} },
            { "of Radiance", 30, 1000, 2, {{41,60},{15,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 182: {
            const ModifierTierData all_tiers[] = {
            { "of Impact", 5, 1000, 1, {{11,13},{0,0},{0,0},{0,0}} },
            { "of Dazing", 18, 1000, 1, {{14,16},{0,0},{0,0},{0,0}} },
            { "of Stunning", 30, 1000, 1, {{17,19},{0,0},{0,0},{0,0}} },
            { "of Slamming", 44, 1000, 1, {{20,22},{0,0},{0,0},{0,0}} },
            { "of Staggering", 58, 1000, 1, {{23,26},{0,0},{0,0},{0,0}} },
            { "of the Concussion", 71, 1000, 1, {{27,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 183: {
            const ModifierTierData all_tiers[] = {
            { "of the Pugilist", 5, 1000, 1, {{21,30},{0,0},{0,0},{0,0}} },
            { "of the Brawler", 20, 1000, 1, {{31,40},{0,0},{0,0},{0,0}} },
            { "of the Boxer", 30, 1000, 1, {{41,50},{0,0},{0,0},{0,0}} },
            { "of the Combatant", 44, 1000, 1, {{51,60},{0,0},{0,0},{0,0}} },
            { "of the Gladiator", 58, 1000, 1, {{61,70},{0,0},{0,0},{0,0}} },
            { "of the Champion", 74, 1000, 1, {{71,80},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 184: {
            const ModifierTierData all_tiers[] = {
            { "Beryl", 1, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "Cobalt", 6, 1000, 1, {{15,24},{0,0},{0,0},{0,0}} },
            { "Azure", 16, 1000, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Teal", 25, 1000, 1, {{35,54},{0,0},{0,0},{0,0}} },
            { "Cerulean", 33, 1000, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Aqua", 38, 1000, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Opalescent", 46, 1000, 1, {{80,89},{0,0},{0,0},{0,0}} },
            { "Gentian", 54, 1000, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Chalybeous", 60, 1000, 1, {{105,124},{0,0},{0,0},{0,0}} },
            { "Mazarine", 65, 1000, 1, {{125,149},{0,0},{0,0},{0,0}} },
            { "Blue", 70, 1000, 1, {{150,164},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 185: {
            const ModifierTierData all_tiers[] = {
            { "Apprentice's", 1, 1000, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Adept's", 8, 1000, 1, {{35,44},{0,0},{0,0},{0,0}} },
            { "Scholar's", 16, 1000, 1, {{45,54},{0,0},{0,0},{0,0}} },
            { "Professor's", 33, 600, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Occultist's", 46, 400, 1, {{65,74},{0,0},{0,0},{0,0}} },
            { "Incanter's", 60, 200, 1, {{75,89},{0,0},{0,0},{0,0}} },
            { "Glyphic", 70, 100, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Runic", 80, 50, 1, {{105,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 186: {
            const ModifierTierData all_tiers[] = {
            { "Caster's", 2, 1000, 2, {{15,19},{17,20},{0,0},{0,0}} },
            { "Conjuror's", 11, 1000, 2, {{20,24},{21,24},{0,0},{0,0}} },
            { "Wizard's", 23, 1000, 2, {{25,29},{25,28},{0,0},{0,0}} },
            { "Warlock's", 38, 600, 2, {{30,34},{29,33},{0,0},{0,0}} },
            { "Mage's", 46, 400, 2, {{35,39},{34,37},{0,0},{0,0}} },
            { "Archmage's", 60, 200, 2, {{40,44},{38,41},{0,0},{0,0}} },
            { "Lich's", 80, 100, 2, {{45,49},{42,45},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 187: {
            const ModifierTierData all_tiers[] = {
            { "Apprentice's", 1, 500, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Adept's", 8, 500, 1, {{35,44},{0,0},{0,0},{0,0}} },
            { "Scholar's", 16, 500, 1, {{45,54},{0,0},{0,0},{0,0}} },
            { "Professor's", 33, 400, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Occultist's", 46, 300, 1, {{65,74},{0,0},{0,0},{0,0}} },
            { "Incanter's", 60, 200, 1, {{75,89},{0,0},{0,0},{0,0}} },
            { "Glyphic", 70, 100, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Runic", 80, 50, 1, {{105,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 188: {
            const ModifierTierData all_tiers[] = {
            { "Apprentice's", 1, 500, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Adept's", 8, 500, 1, {{35,44},{0,0},{0,0},{0,0}} },
            { "Scholar's", 16, 500, 1, {{45,54},{0,0},{0,0},{0,0}} },
            { "Professor's", 33, 400, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Occultist's", 46, 300, 1, {{65,74},{0,0},{0,0},{0,0}} },
            { "Incanter's", 60, 200, 1, {{75,89},{0,0},{0,0},{0,0}} },
            { "Glyphic", 70, 100, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Runic", 80, 50, 1, {{105,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 189: {
            const ModifierTierData all_tiers[] = {
            { "Apprentice's", 1, 500, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Adept's", 8, 500, 1, {{35,44},{0,0},{0,0},{0,0}} },
            { "Scholar's", 16, 500, 1, {{45,54},{0,0},{0,0},{0,0}} },
            { "Professor's", 33, 400, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Occultist's", 46, 300, 1, {{65,74},{0,0},{0,0},{0,0}} },
            { "Incanter's", 60, 200, 1, {{75,89},{0,0},{0,0},{0,0}} },
            { "Glyphic", 70, 100, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Runic", 80, 50, 1, {{105,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 190: {
            const ModifierTierData all_tiers[] = {
            { "Apprentice's", 1, 500, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Adept's", 8, 500, 1, {{35,44},{0,0},{0,0},{0,0}} },
            { "Scholar's", 16, 500, 1, {{45,54},{0,0},{0,0},{0,0}} },
            { "Professor's", 33, 400, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Occultist's", 46, 300, 1, {{65,74},{0,0},{0,0},{0,0}} },
            { "Incanter's", 60, 200, 1, {{75,89},{0,0},{0,0},{0,0}} },
            { "Glyphic", 70, 100, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Runic", 80, 50, 1, {{105,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 191: {
            const ModifierTierData all_tiers[] = {
            { "Apprentice's", 1, 500, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Adept's", 8, 500, 1, {{35,44},{0,0},{0,0},{0,0}} },
            { "Scholar's", 16, 500, 1, {{45,54},{0,0},{0,0},{0,0}} },
            { "Professor's", 33, 400, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Occultist's", 46, 300, 1, {{65,74},{0,0},{0,0},{0,0}} },
            { "Incanter's", 60, 200, 1, {{75,89},{0,0},{0,0},{0,0}} },
            { "Glyphic", 70, 100, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Runic", 80, 50, 1, {{105,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 192: {
            const ModifierTierData all_tiers[] = {
            { "Fervent", 5, 500, 1, {{13,15},{0,0},{0,0},{0,0}} },
            { "Ardent", 16, 500, 1, {{16,18},{0,0},{0,0},{0,0}} },
            { "Fanatic's", 33, 500, 1, {{19,21},{0,0},{0,0},{0,0}} },
            { "Zealot's", 46, 500, 1, {{22,24},{0,0},{0,0},{0,0}} },
            { "Infernal", 60, 500, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "Flamebound", 80, 500, 1, {{28,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 193: {
            const ModifierTierData all_tiers[] = {
            { "Malignant", 5, 500, 1, {{13,15},{0,0},{0,0},{0,0}} },
            { "Pernicious", 16, 500, 1, {{16,18},{0,0},{0,0},{0,0}} },
            { "Destructive", 33, 500, 1, {{19,21},{0,0},{0,0},{0,0}} },
            { "Malicious", 46, 500, 1, {{22,24},{0,0},{0,0},{0,0}} },
            { "Ruthless", 60, 500, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "Frostbound", 80, 500, 1, {{28,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 194: {
            const ModifierTierData all_tiers[] = {
            { "Deadly", 5, 500, 1, {{13,15},{0,0},{0,0},{0,0}} },
            { "Lethal", 16, 500, 1, {{16,18},{0,0},{0,0},{0,0}} },
            { "Fatal", 33, 500, 1, {{19,21},{0,0},{0,0},{0,0}} },
            { "Vorpal", 46, 500, 1, {{22,24},{0,0},{0,0},{0,0}} },
            { "Electrifying", 60, 500, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "Stormbound", 80, 500, 1, {{28,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 195: {
            const ModifierTierData all_tiers[] = {
            { "of the Pupil", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Student", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Prodigy", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Augur", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Philosopher", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Sage", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Savant", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Virtuoso", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 196: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 1000, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 1000, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 1000, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 1000, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 1000, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 197: {
            const ModifierTierData all_tiers[] = {
            { "of the Mage", 5, 200, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of the Enchanter", 25, 150, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of the Sorcerer", 55, 100, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of the Wizard", 78, 50, 1, {{4,4},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 198: {
            const ModifierTierData all_tiers[] = {
            { "of Coals", 2, 1000, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Cinders", 18, 750, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Flames", 36, 500, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Immolation", 55, 250, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of Inferno", 81, 100, 1, {{5,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 199: {
            const ModifierTierData all_tiers[] = {
            { "of Snow", 2, 1000, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Sleet", 18, 750, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Ice", 36, 500, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Rime", 55, 250, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of Frostbite", 81, 100, 1, {{5,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 200: {
            const ModifierTierData all_tiers[] = {
            { "of Sparks", 2, 1000, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Static", 18, 750, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Electricity", 36, 500, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Voltage", 55, 250, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of Thunder", 81, 100, 1, {{5,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 201: {
            const ModifierTierData all_tiers[] = {
            { "of Anarchy", 2, 1000, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Turmoil", 18, 750, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Ruin", 36, 500, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Havoc", 55, 250, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of Armageddon", 81, 100, 1, {{5,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 202: {
            const ModifierTierData all_tiers[] = {
            { "of Agony", 2, 1000, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Suffering", 18, 750, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Torment", 36, 500, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Desolation", 55, 250, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of Catastrophe", 81, 100, 1, {{5,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 203: {
            const ModifierTierData all_tiers[] = {
            { "of Excitement", 1, 1000, 1, {{10,19},{0,0},{0,0},{0,0}} },
            { "of Joy", 18, 1000, 1, {{20,29},{0,0},{0,0},{0,0}} },
            { "of Elation", 29, 1000, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "of Bliss", 42, 1000, 1, {{40,49},{0,0},{0,0},{0,0}} },
            { "of Euphoria", 55, 1000, 1, {{50,59},{0,0},{0,0},{0,0}} },
            { "of Nirvana", 79, 1000, 1, {{60,69},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 204: {
            const ModifierTierData all_tiers[] = {
            { "of Success", 1, 750, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of Victory", 11, 750, 1, {{7,9},{0,0},{0,0},{0,0}} },
            { "of Triumph", 22, 750, 1, {{10,18},{0,0},{0,0},{0,0}} },
            { "of Conquest", 33, 750, 1, {{19,28},{0,0},{0,0},{0,0}} },
            { "of Vanquishing", 44, 750, 1, {{29,40},{0,0},{0,0},{0,0}} },
            { "of Valour", 55, 750, 1, {{41,53},{0,0},{0,0},{0,0}} },
            { "of Glory", 66, 750, 1, {{54,68},{0,0},{0,0},{0,0}} },
            { "of Legend", 77, 750, 1, {{69,84},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 205: {
            const ModifierTierData all_tiers[] = {
            { "of Absorption", 1, 750, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of Osmosis", 12, 750, 1, {{4,5},{0,0},{0,0},{0,0}} },
            { "of Infusion", 23, 750, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of Enveloping", 34, 750, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Consumption", 45, 750, 1, {{15,20},{0,0},{0,0},{0,0}} },
            { "of Siphoning", 56, 750, 1, {{21,27},{0,0},{0,0},{0,0}} },
            { "of Devouring", 67, 750, 1, {{28,35},{0,0},{0,0},{0,0}} },
            { "of Assimilation", 78, 750, 1, {{36,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 206: {
            const ModifierTierData all_tiers[] = {
            { "of Talent", 1, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of Nimbleness", 15, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of Expertise", 30, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of Sortilege", 45, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of Legerdemain", 60, 1000, 1, {{25,28},{0,0},{0,0},{0,0}} },
            { "of Prestidigitation", 70, 500, 1, {{29,32},{0,0},{0,0},{0,0}} },
            { "of Finesse", 80, 250, 1, {{33,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 207: {
            const ModifierTierData all_tiers[] = {
            { "of Menace", 11, 1000, 1, {{27,33},{0,0},{0,0},{0,0}} },
            { "of Havoc", 21, 1000, 1, {{34,39},{0,0},{0,0},{0,0}} },
            { "of Disaster", 28, 1000, 1, {{40,46},{0,0},{0,0},{0,0}} },
            { "of Calamity", 41, 500, 1, {{47,53},{0,0},{0,0},{0,0}} },
            { "of Ruin", 59, 250, 1, {{54,59},{0,0},{0,0},{0,0}} },
            { "of Unmaking", 76, 125, 1, {{60,73},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 208: {
            const ModifierTierData all_tiers[] = {
            { "of Ire", 8, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Anger", 21, 1000, 1, {{15,19},{0,0},{0,0},{0,0}} },
            { "of Rage", 30, 1000, 1, {{20,24},{0,0},{0,0},{0,0}} },
            { "of Fury", 44, 500, 1, {{25,29},{0,0},{0,0},{0,0}} },
            { "of Ferocity", 59, 250, 1, {{30,34},{0,0},{0,0},{0,0}} },
            { "of Destruction", 73, 125, 1, {{35,39},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 209: {
            const ModifierTierData all_tiers[] = {
            { "of Warmth", 8, 1000, 2, {{8,12},{5,5},{0,0},{0,0}} },
            { "of Kindling", 15, 1000, 2, {{13,17},{10,10},{0,0},{0,0}} },
            { "of the Hearth", 30, 1000, 2, {{18,22},{15,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 210: {
            const ModifierTierData all_tiers[] = {
            { "of Ignition", 15, 1000, 1, {{51,60},{0,0},{0,0},{0,0}} },
            { "of Scorching", 30, 1000, 1, {{61,70},{0,0},{0,0},{0,0}} },
            { "of Incineration", 45, 1000, 1, {{71,80},{0,0},{0,0},{0,0}} },
            { "of Combustion", 60, 500, 1, {{81,90},{0,0},{0,0},{0,0}} },
            { "of Conflagration", 75, 500, 1, {{91,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 211: {
            const ModifierTierData all_tiers[] = {
            { "of Freezing", 15, 1000, 1, {{31,40},{0,0},{0,0},{0,0}} },
            { "of Bleakness", 30, 1000, 1, {{41,50},{0,0},{0,0},{0,0}} },
            { "of the Glacier", 45, 1000, 1, {{51,60},{0,0},{0,0},{0,0}} },
            { "of the Hyperboreal", 60, 500, 1, {{61,70},{0,0},{0,0},{0,0}} },
            { "of the Arctic", 75, 500, 1, {{71,80},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 212: {
            const ModifierTierData all_tiers[] = {
            { "of Shocking", 15, 1000, 1, {{51,60},{0,0},{0,0},{0,0}} },
            { "of Zapping", 30, 1000, 1, {{61,70},{0,0},{0,0},{0,0}} },
            { "of Electrocution", 45, 1000, 1, {{71,80},{0,0},{0,0},{0,0}} },
            { "of Voltages", 60, 500, 1, {{81,90},{0,0},{0,0},{0,0}} },
            { "of the Thunderbolt", 75, 500, 1, {{91,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 213: {
            const ModifierTierData all_tiers[] = {
            { "Hale", 1, 1000, 1, {{10,19},{0,0},{0,0},{0,0}} },
            { "Healthy", 6, 1000, 1, {{20,29},{0,0},{0,0},{0,0}} },
            { "Sanguine", 16, 1000, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Stalwart", 24, 1000, 1, {{40,59},{0,0},{0,0},{0,0}} },
            { "Stout", 33, 1000, 1, {{60,69},{0,0},{0,0},{0,0}} },
            { "Robust", 38, 1000, 1, {{70,84},{0,0},{0,0},{0,0}} },
            { "Rotund", 46, 1000, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Virile", 54, 1000, 1, {{100,119},{0,0},{0,0},{0,0}} },
            { "Athlete's", 60, 1000, 1, {{120,149},{0,0},{0,0},{0,0}} },
            { "Fecund", 65, 1000, 1, {{150,174},{0,0},{0,0},{0,0}} },
            { "Vigorous", 70, 1000, 1, {{175,189},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 214: {
            const ModifierTierData all_tiers[] = {
            { "Lacquered", 1, 1000, 1, {{16,27},{0,0},{0,0},{0,0}} },
            { "Studded", 8, 1000, 1, {{28,50},{0,0},{0,0},{0,0}} },
            { "Ribbed", 16, 1000, 1, {{51,68},{0,0},{0,0},{0,0}} },
            { "Fortified", 25, 1000, 1, {{69,82},{0,0},{0,0},{0,0}} },
            { "Plated", 33, 1000, 1, {{83,102},{0,0},{0,0},{0,0}} },
            { "Carapaced", 46, 1000, 1, {{103,122},{0,0},{0,0},{0,0}} },
            { "Encased", 54, 1000, 1, {{123,160},{0,0},{0,0},{0,0}} },
            { "Enveloped", 60, 1000, 1, {{161,202},{0,0},{0,0},{0,0}} },
            { "Abating", 65, 1000, 1, {{203,225},{0,0},{0,0},{0,0}} },
            { "Unmoving", 75, 1000, 1, {{226,256},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 215: {
            const ModifierTierData all_tiers[] = {
            { "Reinforced", 2, 1000, 1, {{15,26},{0,0},{0,0},{0,0}} },
            { "Layered", 16, 1000, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Lobstered", 35, 1000, 1, {{43,55},{0,0},{0,0},{0,0}} },
            { "Buttressed", 46, 1000, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Thickened", 54, 1000, 1, {{68,79},{0,0},{0,0},{0,0}} },
            { "Girded", 60, 1000, 1, {{80,91},{0,0},{0,0},{0,0}} },
            { "Impregnable", 65, 1000, 1, {{92,100},{0,0},{0,0},{0,0}} },
            { "Impenetrable", 75, 1000, 1, {{101,110},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 216: {
            const ModifierTierData all_tiers[] = {
            { "Beetle's", 10, 1000, 2, {{6,13},{8,13},{0,0},{0,0}} },
            { "Crab's", 19, 1000, 2, {{14,20},{14,24},{0,0},{0,0}} },
            { "Armadillo's", 38, 1000, 2, {{21,26},{25,40},{0,0},{0,0}} },
            { "Rhino's", 48, 1000, 2, {{27,32},{41,63},{0,0},{0,0}} },
            { "Elephant's", 63, 1000, 2, {{33,38},{64,94},{0,0},{0,0}} },
            { "Mammoth's", 74, 1000, 2, {{39,42},{95,136},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 217: {
            const ModifierTierData all_tiers[] = {
            { "Thorny", 1, 1000, 2, {{1,2},{3,4},{0,0},{0,0}} },
            { "Spiny", 10, 1000, 2, {{5,7},{7,10},{0,0},{0,0}} },
            { "Barbed", 19, 1000, 2, {{11,16},{15,23},{0,0},{0,0}} },
            { "Pointed", 38, 1000, 2, {{24,35},{35,53},{0,0},{0,0}} },
            { "Spiked", 48, 1000, 2, {{40,60},{61,92},{0,0},{0,0}} },
            { "Edged", 63, 1000, 2, {{64,97},{97,145},{0,0},{0,0}} },
            { "Jagged", 74, 1000, 2, {{101,151},{146,220},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 218: {
            const ModifierTierData all_tiers[] = {
            { "Steadfast", 1, 1000, 1, {{15,19},{0,0},{0,0},{0,0}} },
            { "Unrelenting", 33, 1000, 1, {{20,24},{0,0},{0,0},{0,0}} },
            { "Adamant", 65, 1000, 1, {{25,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 219: {
            const ModifierTierData all_tiers[] = {
            { "of the Brute", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Wrestler", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Bear", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Lion", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Gorilla", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Goliath", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Leviathan", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Titan", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 220: {
            const ModifierTierData all_tiers[] = {
            { "of the Whelpling", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Salamander", 12, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Drake", 24, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Kiln", 36, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Furnace", 48, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Volcano", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Magma", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Tzteosh", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 221: {
            const ModifierTierData all_tiers[] = {
            { "of the Seal", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Penguin", 14, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Narwhal", 26, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Yeti", 38, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Walrus", 50, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Polar Bear", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Ice", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Haast", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 222: {
            const ModifierTierData all_tiers[] = {
            { "of the Cloud", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Squall", 13, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Storm", 25, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Thunderhead", 37, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Tempest", 49, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Maelstrom", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Lightning", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Ephij", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 223: {
            const ModifierTierData all_tiers[] = {
            { "of the Lost", 16, 250, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "of Banishment", 30, 250, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Eviction", 44, 250, 1, {{12,15},{0,0},{0,0},{0,0}} },
            { "of Expulsion", 56, 250, 1, {{16,19},{0,0},{0,0},{0,0}} },
            { "of Exile", 68, 250, 1, {{20,23},{0,0},{0,0},{0,0}} },
            { "of Bameth", 81, 250, 1, {{24,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 224: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 800, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 800, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 800, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 800, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 800, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 225: {
            const ModifierTierData all_tiers[] = {
            { "of Thick Skin", 1, 800, 1, {{6,11},{0,0},{0,0},{0,0}} },
            { "of Reinforced Skin", 8, 800, 1, {{12,29},{0,0},{0,0},{0,0}} },
            { "of Stone Skin", 15, 800, 1, {{30,49},{0,0},{0,0},{0,0}} },
            { "of Iron Skin", 22, 800, 1, {{50,72},{0,0},{0,0},{0,0}} },
            { "of Steel Skin", 29, 800, 1, {{73,97},{0,0},{0,0},{0,0}} },
            { "of Granite Skin", 36, 800, 1, {{98,124},{0,0},{0,0},{0,0}} },
            { "of Platinum Skin", 45, 800, 1, {{125,163},{0,0},{0,0},{0,0}} },
            { "of Adamantite Skin", 54, 800, 1, {{164,206},{0,0},{0,0},{0,0}} },
            { "of Corundum Skin", 63, 800, 1, {{207,253},{0,0},{0,0},{0,0}} },
            { "of Obsidian Skin", 72, 800, 1, {{254,304},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 226: {
            const ModifierTierData all_tiers[] = {
            { "of the Watchman", 32, 1000, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of the Custodian", 41, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            { "of the Sentry", 53, 1000, 1, {{6,6},{0,0},{0,0},{0,0}} },
            { "of the Protector", 66, 1000, 1, {{7,7},{0,0},{0,0},{0,0}} },
            { "of the Conservator", 77, 1000, 1, {{8,8},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 227: {
            const ModifierTierData all_tiers[] = {
            { "of the Bushfire", 68, 250, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of the Molten Core", 75, 250, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of the Solar Storm", 81, 250, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 228: {
            const ModifierTierData all_tiers[] = {
            { "of Furs", 68, 250, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of the Tundra", 75, 250, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of the Mammoth", 81, 250, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 229: {
            const ModifierTierData all_tiers[] = {
            { "of Impedance", 68, 250, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Shockproofing", 75, 250, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of the Lightning Rod", 81, 250, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 230: {
            const ModifierTierData all_tiers[] = {
            { "of Regularity", 68, 125, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Concord", 75, 125, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Harmony", 81, 125, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 231: {
            const ModifierTierData all_tiers[] = {
            { "of the Deathless", 75, 125, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of the Everlasting", 81, 125, 1, {{2,2},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 232: {
            const ModifierTierData all_tiers[] = {
            { "of Covering", 1, 1000, 1, {{14,19},{0,0},{0,0},{0,0}} },
            { "of Sheathing", 16, 1000, 1, {{20,25},{0,0},{0,0},{0,0}} },
            { "of Lining", 36, 1000, 1, {{26,31},{0,0},{0,0},{0,0}} },
            { "of Padding", 48, 1000, 1, {{32,37},{0,0},{0,0},{0,0}} },
            { "of Furring", 66, 1000, 1, {{38,43},{0,0},{0,0},{0,0}} },
            { "of Thermokryptance", 81, 1000, 1, {{44,50},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 233: {
            const ModifierTierData all_tiers[] = {
            { "Hale", 1, 1000, 1, {{10,19},{0,0},{0,0},{0,0}} },
            { "Healthy", 6, 1000, 1, {{20,29},{0,0},{0,0},{0,0}} },
            { "Sanguine", 16, 1000, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Stalwart", 24, 1000, 1, {{40,59},{0,0},{0,0},{0,0}} },
            { "Stout", 33, 1000, 1, {{60,69},{0,0},{0,0},{0,0}} },
            { "Robust", 38, 1000, 1, {{70,84},{0,0},{0,0},{0,0}} },
            { "Rotund", 46, 1000, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Virile", 54, 1000, 1, {{100,119},{0,0},{0,0},{0,0}} },
            { "Athlete's", 60, 1000, 1, {{120,149},{0,0},{0,0},{0,0}} },
            { "Fecund", 65, 1000, 1, {{150,174},{0,0},{0,0},{0,0}} },
            { "Vigorous", 70, 1000, 1, {{175,189},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 234: {
            const ModifierTierData all_tiers[] = {
            { "Supple", 1, 1000, 2, {{8,14},{6,9},{0,0},{0,0}} },
            { "Pliant", 16, 1000, 2, {{15,35},{10,30},{0,0},{0,0}} },
            { "Flexible", 33, 1000, 2, {{36,53},{31,46},{0,0},{0,0}} },
            { "Durable", 46, 1000, 2, {{54,65},{47,57},{0,0},{0,0}} },
            { "Sturdy", 54, 1000, 2, {{66,78},{58,69},{0,0},{0,0}} },
            { "Resilient", 60, 1000, 2, {{79,98},{70,88},{0,0},{0,0}} },
            { "Adaptable", 65, 1000, 2, {{99,117},{89,107},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 235: {
            const ModifierTierData all_tiers[] = {
            { "Blessed", 1, 1000, 2, {{8,14},{5,8},{0,0},{0,0}} },
            { "Anointed", 16, 1000, 2, {{15,35},{9,15},{0,0},{0,0}} },
            { "Sanctified", 33, 1000, 2, {{36,53},{16,21},{0,0},{0,0}} },
            { "Hallowed", 46, 1000, 2, {{54,65},{22,25},{0,0},{0,0}} },
            { "Beatified", 54, 1000, 2, {{66,78},{26,29},{0,0},{0,0}} },
            { "Consecrated", 60, 1000, 2, {{79,98},{30,36},{0,0},{0,0}} },
            { "Saintly", 65, 1000, 2, {{99,117},{37,42},{0,0},{0,0}} },
            { "Godly", 75, 1000, 2, {{118,138},{43,48},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 236: {
            const ModifierTierData all_tiers[] = {
            { "Scrapper's", 2, 1000, 2, {{15,26},{15,26},{0,0},{0,0}} },
            { "Brawler's", 16, 1000, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Fencer's", 33, 1000, 2, {{43,55},{43,55},{0,0},{0,0}} },
            { "Gladiator's", 46, 1000, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Duelist's", 54, 1000, 2, {{68,79},{68,79},{0,0},{0,0}} },
            { "Hero's", 60, 1000, 2, {{80,91},{80,91},{0,0},{0,0}} },
            { "Legend's", 65, 1000, 2, {{92,100},{92,100},{0,0},{0,0}} },
            { "Victor's", 75, 1000, 2, {{101,110},{101,110},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 237: {
            const ModifierTierData all_tiers[] = {
            { "Infixed", 2, 1000, 2, {{15,26},{15,26},{0,0},{0,0}} },
            { "Ingrained", 16, 1000, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Instilled", 33, 1000, 2, {{43,55},{43,55},{0,0},{0,0}} },
            { "Infused", 46, 1000, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Inculcated", 54, 1000, 2, {{68,79},{68,79},{0,0},{0,0}} },
            { "Interpolated", 60, 1000, 2, {{80,91},{80,91},{0,0},{0,0}} },
            { "Inspired", 65, 1000, 2, {{92,100},{92,100},{0,0},{0,0}} },
            { "Interpermeated", 75, 1000, 2, {{101,110},{101,110},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 238: {
            const ModifierTierData all_tiers[] = {
            { "Captain's", 10, 1000, 3, {{6,13},{6,13},{8,13},{0,0}} },
            { "Commander's", 19, 1000, 3, {{14,20},{14,20},{14,24},{0,0}} },
            { "Magnate's", 38, 1000, 3, {{21,26},{21,26},{25,40},{0,0}} },
            { "Marshal's", 48, 1000, 3, {{27,32},{27,32},{41,63},{0,0}} },
            { "General's", 63, 1000, 3, {{33,38},{33,38},{64,94},{0,0}} },
            { "Warlord's", 74, 1000, 3, {{39,42},{39,42},{95,136},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 239: {
            const ModifierTierData all_tiers[] = {
            { "Defender's", 10, 1000, 3, {{6,13},{6,13},{8,13},{0,0}} },
            { "Protector's", 19, 1000, 3, {{14,20},{14,20},{14,24},{0,0}} },
            { "Keeper's", 38, 1000, 3, {{21,26},{21,26},{25,40},{0,0}} },
            { "Guardian's", 48, 1000, 3, {{27,32},{27,32},{41,63},{0,0}} },
            { "Warden's", 63, 1000, 3, {{33,38},{33,38},{64,94},{0,0}} },
            { "Sentinel's", 74, 1000, 3, {{39,42},{39,42},{95,136},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 240: {
            const ModifierTierData all_tiers[] = {
            { "Thorny", 1, 1000, 2, {{1,2},{3,4},{0,0},{0,0}} },
            { "Spiny", 10, 1000, 2, {{5,7},{7,10},{0,0},{0,0}} },
            { "Barbed", 19, 1000, 2, {{11,16},{15,23},{0,0},{0,0}} },
            { "Pointed", 38, 1000, 2, {{24,35},{35,53},{0,0},{0,0}} },
            { "Spiked", 48, 1000, 2, {{40,60},{61,92},{0,0},{0,0}} },
            { "Edged", 63, 1000, 2, {{64,97},{97,145},{0,0},{0,0}} },
            { "Jagged", 74, 1000, 2, {{101,151},{146,220},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 241: {
            const ModifierTierData all_tiers[] = {
            { "Steadfast", 1, 1000, 1, {{15,19},{0,0},{0,0},{0,0}} },
            { "Unrelenting", 33, 1000, 1, {{20,24},{0,0},{0,0},{0,0}} },
            { "Adamant", 65, 1000, 1, {{25,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 242: {
            const ModifierTierData all_tiers[] = {
            { "of the Brute", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Wrestler", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Bear", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Lion", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Gorilla", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Goliath", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Leviathan", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Titan", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 243: {
            const ModifierTierData all_tiers[] = {
            { "of the Mongoose", 1, 500, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Lynx", 11, 500, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Fox", 22, 500, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Falcon", 33, 500, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Panther", 44, 500, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Leopard", 55, 500, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Jaguar", 66, 500, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Phantom", 74, 500, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 244: {
            const ModifierTierData all_tiers[] = {
            { "of the Pupil", 1, 500, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Student", 11, 500, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Prodigy", 22, 500, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Augur", 33, 500, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Philosopher", 44, 500, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Sage", 55, 500, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Savant", 66, 500, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Virtuoso", 74, 500, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 245: {
            const ModifierTierData all_tiers[] = {
            { "of the Whelpling", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Salamander", 12, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Drake", 24, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Kiln", 36, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Furnace", 48, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Volcano", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Magma", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Tzteosh", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 246: {
            const ModifierTierData all_tiers[] = {
            { "of the Seal", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Penguin", 14, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Narwhal", 26, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Yeti", 38, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Walrus", 50, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Polar Bear", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Ice", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Haast", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 247: {
            const ModifierTierData all_tiers[] = {
            { "of the Cloud", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Squall", 13, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Storm", 25, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Thunderhead", 37, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Tempest", 49, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Maelstrom", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Lightning", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Ephij", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 248: {
            const ModifierTierData all_tiers[] = {
            { "of the Lost", 16, 250, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "of Banishment", 30, 250, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Eviction", 44, 250, 1, {{12,15},{0,0},{0,0},{0,0}} },
            { "of Expulsion", 56, 250, 1, {{16,19},{0,0},{0,0},{0,0}} },
            { "of Exile", 68, 250, 1, {{20,23},{0,0},{0,0},{0,0}} },
            { "of Bameth", 81, 250, 1, {{24,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 249: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 800, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 800, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 800, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 800, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 800, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 250: {
            const ModifierTierData all_tiers[] = {
            { "of Thick Skin", 1, 800, 1, {{6,11},{0,0},{0,0},{0,0}} },
            { "of Reinforced Skin", 8, 800, 1, {{12,29},{0,0},{0,0},{0,0}} },
            { "of Stone Skin", 15, 800, 1, {{30,49},{0,0},{0,0},{0,0}} },
            { "of Iron Skin", 22, 800, 1, {{50,72},{0,0},{0,0},{0,0}} },
            { "of Steel Skin", 29, 800, 1, {{73,97},{0,0},{0,0},{0,0}} },
            { "of Granite Skin", 36, 800, 1, {{98,124},{0,0},{0,0},{0,0}} },
            { "of Platinum Skin", 45, 800, 1, {{125,163},{0,0},{0,0},{0,0}} },
            { "of Adamantite Skin", 54, 800, 1, {{164,206},{0,0},{0,0},{0,0}} },
            { "of Corundum Skin", 63, 800, 1, {{207,253},{0,0},{0,0},{0,0}} },
            { "of Obsidian Skin", 72, 800, 1, {{254,304},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 251: {
            const ModifierTierData all_tiers[] = {
            { "of the Watchman", 32, 1000, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of the Custodian", 41, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            { "of the Sentry", 53, 1000, 1, {{6,6},{0,0},{0,0},{0,0}} },
            { "of the Protector", 66, 1000, 1, {{7,7},{0,0},{0,0},{0,0}} },
            { "of the Conservator", 77, 1000, 1, {{8,8},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 252: {
            const ModifierTierData all_tiers[] = {
            { "of the Bushfire", 68, 250, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of the Molten Core", 75, 250, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of the Solar Storm", 81, 250, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 253: {
            const ModifierTierData all_tiers[] = {
            { "of Furs", 68, 250, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of the Tundra", 75, 250, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of the Mammoth", 81, 250, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 254: {
            const ModifierTierData all_tiers[] = {
            { "of Impedance", 68, 250, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Shockproofing", 75, 250, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of the Lightning Rod", 81, 250, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 255: {
            const ModifierTierData all_tiers[] = {
            { "of Regularity", 68, 125, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Concord", 75, 125, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Harmony", 81, 125, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 256: {
            const ModifierTierData all_tiers[] = {
            { "of the Deathless", 75, 125, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of the Everlasting", 81, 125, 1, {{2,2},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 257: {
            const ModifierTierData all_tiers[] = {
            { "of Covering", 1, 500, 1, {{14,19},{0,0},{0,0},{0,0}} },
            { "of Sheathing", 16, 500, 1, {{20,25},{0,0},{0,0},{0,0}} },
            { "of Lining", 36, 500, 1, {{26,31},{0,0},{0,0},{0,0}} },
            { "of Padding", 48, 500, 1, {{32,37},{0,0},{0,0},{0,0}} },
            { "of Furring", 66, 500, 1, {{38,43},{0,0},{0,0},{0,0}} },
            { "of Thermokryptance", 81, 500, 1, {{44,50},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 258: {
            const ModifierTierData all_tiers[] = {
            { "of Deflecting", 1, 500, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Bending", 16, 500, 1, {{12,14},{0,0},{0,0},{0,0}} },
            { "of Curvation", 36, 500, 1, {{15,17},{0,0},{0,0},{0,0}} },
            { "of Diversion", 48, 500, 1, {{18,20},{0,0},{0,0},{0,0}} },
            { "of Flexure", 66, 500, 1, {{21,23},{0,0},{0,0},{0,0}} },
            { "of Warping", 81, 500, 1, {{24,26},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 259: {
            const ModifierTierData all_tiers[] = {
            { "of Enlivening", 1, 500, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of Diffusion", 16, 500, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Dispersal", 36, 500, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Buffering", 48, 500, 1, {{41,45},{0,0},{0,0},{0,0}} },
            { "of Ardour", 66, 500, 1, {{46,50},{0,0},{0,0},{0,0}} },
            { "of Suffusion", 81, 500, 1, {{51,55},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 260: {
            const ModifierTierData all_tiers[] = {
            { "Beryl", 1, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "Cobalt", 6, 1000, 1, {{15,24},{0,0},{0,0},{0,0}} },
            { "Azure", 16, 1000, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Teal", 25, 1000, 1, {{35,54},{0,0},{0,0},{0,0}} },
            { "Cerulean", 33, 1000, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Aqua", 38, 1000, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Opalescent", 46, 1000, 1, {{80,89},{0,0},{0,0},{0,0}} },
            { "Gentian", 54, 1000, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Chalybeous", 60, 1000, 1, {{105,124},{0,0},{0,0},{0,0}} },
            { "Mazarine", 65, 1000, 1, {{125,149},{0,0},{0,0},{0,0}} },
            { "Blue", 70, 1000, 1, {{150,164},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 261: {
            const ModifierTierData all_tiers[] = {
            { "Shining", 1, 1000, 1, {{10,17},{0,0},{0,0},{0,0}} },
            { "Glimmering", 8, 1000, 1, {{18,24},{0,0},{0,0},{0,0}} },
            { "Glittering", 16, 1000, 1, {{25,30},{0,0},{0,0},{0,0}} },
            { "Glowing", 25, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "Radiating", 33, 1000, 1, {{36,41},{0,0},{0,0},{0,0}} },
            { "Pulsing", 46, 1000, 1, {{42,47},{0,0},{0,0},{0,0}} },
            { "Blazing", 54, 1000, 1, {{48,60},{0,0},{0,0},{0,0}} },
            { "Dazzling", 60, 1000, 1, {{61,73},{0,0},{0,0},{0,0}} },
            { "Scintillating", 65, 1000, 1, {{74,80},{0,0},{0,0},{0,0}} },
            { "Incandescent", 70, 1000, 1, {{81,90},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 262: {
            const ModifierTierData all_tiers[] = {
            { "Protective", 2, 1000, 1, {{15,26},{0,0},{0,0},{0,0}} },
            { "Strong-Willed", 16, 1000, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Resolute", 33, 1000, 1, {{43,55},{0,0},{0,0},{0,0}} },
            { "Fearless", 46, 1000, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Dauntless", 54, 1000, 1, {{68,79},{0,0},{0,0},{0,0}} },
            { "Indomitable", 60, 1000, 1, {{80,91},{0,0},{0,0},{0,0}} },
            { "Unassailable", 65, 1000, 1, {{92,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 263: {
            const ModifierTierData all_tiers[] = {
            { "Imbued", 8, 1000, 2, {{6,13},{6,8},{0,0},{0,0}} },
            { "Serene", 16, 1000, 2, {{14,20},{9,16},{0,0},{0,0}} },
            { "Sacred", 33, 1000, 2, {{21,26},{17,20},{0,0},{0,0}} },
            { "Celestial", 46, 1000, 2, {{27,32},{21,26},{0,0},{0,0}} },
            { "Heavenly", 60, 1000, 2, {{33,38},{27,32},{0,0},{0,0}} },
            { "Angel's", 78, 1000, 2, {{39,42},{33,39},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 264: {
            const ModifierTierData all_tiers[] = {
            { "Apprentice's", 1, 1000, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Adept's", 8, 1000, 1, {{35,44},{0,0},{0,0},{0,0}} },
            { "Scholar's", 16, 1000, 1, {{45,54},{0,0},{0,0},{0,0}} },
            { "Professor's", 33, 600, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Occultist's", 46, 400, 1, {{65,74},{0,0},{0,0},{0,0}} },
            { "Incanter's", 60, 200, 1, {{75,89},{0,0},{0,0},{0,0}} },
            { "Glyphic", 70, 100, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Runic", 80, 50, 1, {{105,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 265: {
            const ModifierTierData all_tiers[] = {
            { "Searing", 2, 500, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Sizzling", 8, 500, 1, {{35,44},{0,0},{0,0},{0,0}} },
            { "Blistering", 16, 500, 1, {{45,54},{0,0},{0,0},{0,0}} },
            { "Cauterising", 33, 400, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Smoldering", 46, 300, 1, {{65,74},{0,0},{0,0},{0,0}} },
            { "Magmatic", 60, 200, 1, {{75,89},{0,0},{0,0},{0,0}} },
            { "Volcanic", 70, 100, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Pyromancer's", 81, 50, 1, {{105,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 266: {
            const ModifierTierData all_tiers[] = {
            { "Bitter", 2, 500, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Biting", 8, 500, 1, {{35,44},{0,0},{0,0},{0,0}} },
            { "Alpine", 16, 500, 1, {{45,54},{0,0},{0,0},{0,0}} },
            { "Snowy", 33, 400, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Hailing", 46, 300, 1, {{65,74},{0,0},{0,0},{0,0}} },
            { "Arctic", 60, 200, 1, {{75,89},{0,0},{0,0},{0,0}} },
            { "Crystalline", 70, 100, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Cryomancer's", 81, 50, 1, {{105,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 267: {
            const ModifierTierData all_tiers[] = {
            { "Charged", 2, 500, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Hissing", 8, 500, 1, {{35,44},{0,0},{0,0},{0,0}} },
            { "Bolting", 16, 500, 1, {{45,54},{0,0},{0,0},{0,0}} },
            { "Coursing", 33, 400, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Striking", 46, 300, 1, {{65,74},{0,0},{0,0},{0,0}} },
            { "Smiting", 60, 200, 1, {{75,89},{0,0},{0,0},{0,0}} },
            { "Ionising", 70, 100, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Electromancer's", 81, 50, 1, {{105,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 268: {
            const ModifierTierData all_tiers[] = {
            { "Impure", 2, 500, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Tainted", 8, 500, 1, {{35,44},{0,0},{0,0},{0,0}} },
            { "Clouded", 16, 500, 1, {{45,54},{0,0},{0,0},{0,0}} },
            { "Darkened", 33, 400, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Malignant", 46, 300, 1, {{65,74},{0,0},{0,0},{0,0}} },
            { "Vile", 60, 200, 1, {{75,89},{0,0},{0,0},{0,0}} },
            { "Twisted", 70, 100, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Malevolent", 81, 50, 1, {{105,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 269: {
            const ModifierTierData all_tiers[] = {
            { "Punishing", 2, 500, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Unforgiving", 8, 500, 1, {{35,44},{0,0},{0,0},{0,0}} },
            { "Vengeful", 16, 500, 1, {{45,54},{0,0},{0,0},{0,0}} },
            { "Sadistic", 33, 400, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Pitiless", 46, 300, 1, {{65,74},{0,0},{0,0},{0,0}} },
            { "Agonising", 60, 200, 1, {{75,89},{0,0},{0,0},{0,0}} },
            { "Oppressor's", 70, 100, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Torturer's", 81, 50, 1, {{105,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 270: {
            const ModifierTierData all_tiers[] = {
            { "of the Pupil", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Student", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Prodigy", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Augur", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Philosopher", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Sage", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Savant", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Virtuoso", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 271: {
            const ModifierTierData all_tiers[] = {
            { "of the Whelpling", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Salamander", 12, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Drake", 24, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Kiln", 36, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Furnace", 48, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Volcano", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Magma", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Tzteosh", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 272: {
            const ModifierTierData all_tiers[] = {
            { "of the Seal", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Penguin", 14, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Narwhal", 26, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Yeti", 38, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Walrus", 50, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Polar Bear", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Ice", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Haast", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 273: {
            const ModifierTierData all_tiers[] = {
            { "of the Cloud", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Squall", 13, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Storm", 25, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Thunderhead", 37, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Tempest", 49, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Maelstrom", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Lightning", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Ephij", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 274: {
            const ModifierTierData all_tiers[] = {
            { "of the Lost", 16, 250, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "of Banishment", 30, 250, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Eviction", 44, 250, 1, {{12,15},{0,0},{0,0},{0,0}} },
            { "of Expulsion", 56, 250, 1, {{16,19},{0,0},{0,0},{0,0}} },
            { "of Exile", 68, 250, 1, {{20,23},{0,0},{0,0},{0,0}} },
            { "of Bameth", 81, 250, 1, {{24,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 275: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 1000, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 1000, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 1000, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 1000, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 1000, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 276: {
            const ModifierTierData all_tiers[] = {
            { "of the Mage", 5, 500, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of the Enchanter", 41, 250, 1, {{2,2},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 277: {
            const ModifierTierData all_tiers[] = {
            { "of Excitement", 1, 1000, 1, {{10,19},{0,0},{0,0},{0,0}} },
            { "of Joy", 18, 1000, 1, {{20,29},{0,0},{0,0},{0,0}} },
            { "of Elation", 29, 1000, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "of Bliss", 42, 1000, 1, {{40,49},{0,0},{0,0},{0,0}} },
            { "of Euphoria", 55, 1000, 1, {{50,59},{0,0},{0,0},{0,0}} },
            { "of Nirvana", 79, 1000, 1, {{60,69},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 278: {
            const ModifierTierData all_tiers[] = {
            { "of Talent", 1, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of Nimbleness", 15, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of Expertise", 30, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of Sortilege", 45, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of Legerdemain", 60, 1000, 1, {{25,28},{0,0},{0,0},{0,0}} },
            { "of Prestidigitation", 70, 500, 1, {{29,32},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 279: {
            const ModifierTierData all_tiers[] = {
            { "of Menace", 11, 1000, 1, {{27,33},{0,0},{0,0},{0,0}} },
            { "of Havoc", 21, 1000, 1, {{34,39},{0,0},{0,0},{0,0}} },
            { "of Disaster", 28, 1000, 1, {{40,46},{0,0},{0,0},{0,0}} },
            { "of Calamity", 41, 500, 1, {{47,53},{0,0},{0,0},{0,0}} },
            { "of Ruin", 59, 250, 1, {{54,59},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 280: {
            const ModifierTierData all_tiers[] = {
            { "of Ire", 8, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Anger", 21, 1000, 1, {{15,19},{0,0},{0,0},{0,0}} },
            { "of Rage", 30, 1000, 1, {{20,24},{0,0},{0,0},{0,0}} },
            { "of Fury", 44, 500, 1, {{25,29},{0,0},{0,0},{0,0}} },
            { "of Ferocity", 59, 250, 1, {{30,34},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 281: {
            const ModifierTierData all_tiers[] = {
            { "of Enlivening", 1, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of Diffusion", 16, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Dispersal", 36, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Buffering", 48, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            { "of Ardour", 66, 1000, 1, {{46,50},{0,0},{0,0},{0,0}} },
            { "of Suffusion", 81, 1000, 1, {{51,55},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 282: {
            const ModifierTierData all_tiers[] = {
            { "of Impatience", 1, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of Restlessness", 16, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Fretfulness", 36, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Motivation", 48, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            { "of Excitement", 66, 1000, 1, {{46,50},{0,0},{0,0},{0,0}} },
            { "of Anticipation", 81, 1000, 1, {{51,55},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 283: {
            const ModifierTierData all_tiers[] = {
            { "Hale", 1, 1000, 1, {{10,19},{0,0},{0,0},{0,0}} },
            { "Healthy", 6, 1000, 1, {{20,29},{0,0},{0,0},{0,0}} },
            { "Sanguine", 16, 1000, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Stalwart", 24, 1000, 1, {{40,59},{0,0},{0,0},{0,0}} },
            { "Stout", 33, 1000, 1, {{60,69},{0,0},{0,0},{0,0}} },
            { "Robust", 38, 1000, 1, {{70,84},{0,0},{0,0},{0,0}} },
            { "Rotund", 46, 1000, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Virile", 54, 1000, 1, {{100,119},{0,0},{0,0},{0,0}} },
            { "Athlete's", 60, 1000, 1, {{120,149},{0,0},{0,0},{0,0}} },
            { "Fecund", 65, 1000, 1, {{150,174},{0,0},{0,0},{0,0}} },
            { "Vigorous", 70, 1000, 1, {{175,189},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 284: {
            const ModifierTierData all_tiers[] = {
            { "Agile", 1, 1000, 1, {{11,18},{0,0},{0,0},{0,0}} },
            { "Dancer's", 8, 1000, 1, {{19,39},{0,0},{0,0},{0,0}} },
            { "Acrobat's", 16, 1000, 1, {{40,56},{0,0},{0,0},{0,0}} },
            { "Fleet", 25, 1000, 1, {{57,70},{0,0},{0,0},{0,0}} },
            { "Blurred", 33, 1000, 1, {{71,88},{0,0},{0,0},{0,0}} },
            { "Phased", 46, 1000, 1, {{89,107},{0,0},{0,0},{0,0}} },
            { "Vaporous", 54, 1000, 1, {{108,142},{0,0},{0,0},{0,0}} },
            { "Elusory", 60, 1000, 1, {{143,181},{0,0},{0,0},{0,0}} },
            { "Adroit", 65, 1000, 1, {{182,204},{0,0},{0,0},{0,0}} },
            { "Lissome", 75, 1000, 1, {{205,232},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 285: {
            const ModifierTierData all_tiers[] = {
            { "Shade's", 2, 1000, 1, {{15,26},{0,0},{0,0},{0,0}} },
            { "Ghost's", 16, 1000, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Spectre's", 33, 1000, 1, {{43,55},{0,0},{0,0},{0,0}} },
            { "Wraith's", 46, 1000, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Phantasm's", 54, 1000, 1, {{68,79},{0,0},{0,0},{0,0}} },
            { "Nightmare's", 60, 1000, 1, {{80,91},{0,0},{0,0},{0,0}} },
            { "Mirage's", 65, 1000, 1, {{92,100},{0,0},{0,0},{0,0}} },
            { "Illusion's", 75, 1000, 1, {{101,110},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 286: {
            const ModifierTierData all_tiers[] = {
            { "Mosquito's", 10, 1000, 2, {{6,13},{8,13},{0,0},{0,0}} },
            { "Moth's", 19, 1000, 2, {{14,20},{14,24},{0,0},{0,0}} },
            { "Butterfly's", 38, 1000, 2, {{21,26},{25,40},{0,0},{0,0}} },
            { "Wasp's", 48, 1000, 2, {{27,32},{41,63},{0,0},{0,0}} },
            { "Dragonfly's", 63, 1000, 2, {{33,38},{64,94},{0,0},{0,0}} },
            { "Hummingbird's", 74, 1000, 2, {{39,42},{95,136},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 287: {
            const ModifierTierData all_tiers[] = {
            { "Thorny", 1, 1000, 2, {{1,2},{3,4},{0,0},{0,0}} },
            { "Spiny", 10, 1000, 2, {{5,7},{7,10},{0,0},{0,0}} },
            { "Barbed", 19, 1000, 2, {{11,16},{15,23},{0,0},{0,0}} },
            { "Pointed", 38, 1000, 2, {{24,35},{35,53},{0,0},{0,0}} },
            { "Spiked", 48, 1000, 2, {{40,60},{61,92},{0,0},{0,0}} },
            { "Edged", 63, 1000, 2, {{64,97},{97,145},{0,0},{0,0}} },
            { "Jagged", 74, 1000, 2, {{101,151},{146,220},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 288: {
            const ModifierTierData all_tiers[] = {
            { "Steadfast", 1, 1000, 1, {{15,19},{0,0},{0,0},{0,0}} },
            { "Unrelenting", 33, 1000, 1, {{20,24},{0,0},{0,0},{0,0}} },
            { "Adamant", 65, 1000, 1, {{25,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 289: {
            const ModifierTierData all_tiers[] = {
            { "of the Mongoose", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Lynx", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Fox", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Falcon", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Panther", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Leopard", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Jaguar", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Phantom", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 290: {
            const ModifierTierData all_tiers[] = {
            { "of the Whelpling", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Salamander", 12, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Drake", 24, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Kiln", 36, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Furnace", 48, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Volcano", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Magma", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Tzteosh", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 291: {
            const ModifierTierData all_tiers[] = {
            { "of the Seal", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Penguin", 14, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Narwhal", 26, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Yeti", 38, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Walrus", 50, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Polar Bear", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Ice", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Haast", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 292: {
            const ModifierTierData all_tiers[] = {
            { "of the Cloud", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Squall", 13, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Storm", 25, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Thunderhead", 37, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Tempest", 49, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Maelstrom", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Lightning", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Ephij", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 293: {
            const ModifierTierData all_tiers[] = {
            { "of the Lost", 16, 250, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "of Banishment", 30, 250, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Eviction", 44, 250, 1, {{12,15},{0,0},{0,0},{0,0}} },
            { "of Expulsion", 56, 250, 1, {{16,19},{0,0},{0,0},{0,0}} },
            { "of Exile", 68, 250, 1, {{20,23},{0,0},{0,0},{0,0}} },
            { "of Bameth", 81, 250, 1, {{24,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 294: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 800, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 800, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 800, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 800, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 800, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 295: {
            const ModifierTierData all_tiers[] = {
            { "of Thick Skin", 1, 800, 1, {{6,11},{0,0},{0,0},{0,0}} },
            { "of Reinforced Skin", 8, 800, 1, {{12,29},{0,0},{0,0},{0,0}} },
            { "of Stone Skin", 15, 800, 1, {{30,49},{0,0},{0,0},{0,0}} },
            { "of Iron Skin", 22, 800, 1, {{50,72},{0,0},{0,0},{0,0}} },
            { "of Steel Skin", 29, 800, 1, {{73,97},{0,0},{0,0},{0,0}} },
            { "of Granite Skin", 36, 800, 1, {{98,124},{0,0},{0,0},{0,0}} },
            { "of Platinum Skin", 45, 800, 1, {{125,163},{0,0},{0,0},{0,0}} },
            { "of Adamantite Skin", 54, 800, 1, {{164,206},{0,0},{0,0},{0,0}} },
            { "of Corundum Skin", 63, 800, 1, {{207,253},{0,0},{0,0},{0,0}} },
            { "of Obsidian Skin", 72, 800, 1, {{254,304},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 296: {
            const ModifierTierData all_tiers[] = {
            { "of the Bushfire", 68, 250, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of the Molten Core", 75, 250, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of the Solar Storm", 81, 250, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 297: {
            const ModifierTierData all_tiers[] = {
            { "of Furs", 68, 250, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of the Tundra", 75, 250, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of the Mammoth", 81, 250, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 298: {
            const ModifierTierData all_tiers[] = {
            { "of Impedance", 68, 250, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Shockproofing", 75, 250, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of the Lightning Rod", 81, 250, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 299: {
            const ModifierTierData all_tiers[] = {
            { "of Regularity", 68, 125, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Concord", 75, 125, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Harmony", 81, 125, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 300: {
            const ModifierTierData all_tiers[] = {
            { "of the Deathless", 75, 125, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of the Everlasting", 81, 125, 1, {{2,2},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 301: {
            const ModifierTierData all_tiers[] = {
            { "of Deflecting", 1, 500, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Bending", 16, 500, 1, {{12,14},{0,0},{0,0},{0,0}} },
            { "of Curvation", 36, 500, 1, {{15,17},{0,0},{0,0},{0,0}} },
            { "of Diversion", 48, 500, 1, {{18,20},{0,0},{0,0},{0,0}} },
            { "of Flexure", 66, 500, 1, {{21,23},{0,0},{0,0},{0,0}} },
            { "of Warping", 81, 500, 1, {{24,26},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 302: {
            const ModifierTierData all_tiers[] = {
            { "Glinting", 1, 1000, 2, {{1,2},{3,3},{0,0},{0,0}} },
            { "Burnished", 8, 1000, 2, {{2,3},{4,6},{0,0},{0,0}} },
            { "Polished", 16, 1000, 2, {{2,4},{5,8},{0,0},{0,0}} },
            { "Honed", 33, 1000, 2, {{4,6},{8,11},{0,0},{0,0}} },
            { "Gleaming", 46, 1000, 2, {{5,7},{9,13},{0,0},{0,0}} },
            { "Annealed", 54, 1000, 2, {{6,10},{12,17},{0,0},{0,0}} },
            { "Razor-sharp", 60, 800, 2, {{7,11},{14,20},{0,0},{0,0}} },
            { "Tempered", 65, 600, 2, {{10,15},{18,26},{0,0},{0,0}} },
            { "Flaring", 75, 400, 2, {{12,19},{22,32},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 303: {
            const ModifierTierData all_tiers[] = {
            { "Heated", 1, 500, 2, {{1,2},{3,3},{0,0},{0,0}} },
            { "Smouldering", 8, 500, 2, {{3,5},{6,9},{0,0},{0,0}} },
            { "Smoking", 16, 500, 2, {{6,8},{10,13},{0,0},{0,0}} },
            { "Burning", 33, 500, 2, {{9,11},{14,17},{0,0},{0,0}} },
            { "Flaming", 46, 500, 2, {{12,13},{18,20},{0,0},{0,0}} },
            { "Scorching", 54, 500, 2, {{11,16},{21,26},{0,0},{0,0}} },
            { "Incinerating", 60, 400, 2, {{13,19},{27,32},{0,0},{0,0}} },
            { "Blasting", 65, 300, 2, {{20,24},{33,36},{0,0},{0,0}} },
            { "Cremating", 75, 200, 2, {{25,29},{37,45},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 304: {
            const ModifierTierData all_tiers[] = {
            { "Frosted", 1, 500, 2, {{1,1},{2,3},{0,0},{0,0}} },
            { "Chilled", 8, 500, 2, {{3,4},{5,8},{0,0},{0,0}} },
            { "Icy", 16, 500, 2, {{5,6},{9,11},{0,0},{0,0}} },
            { "Frigid", 33, 500, 2, {{7,8},{12,14},{0,0},{0,0}} },
            { "Freezing", 46, 500, 2, {{9,10},{15,17},{0,0},{0,0}} },
            { "Frozen", 54, 500, 2, {{11,13},{18,21},{0,0},{0,0}} },
            { "Glaciated", 60, 400, 2, {{14,15},{22,24},{0,0},{0,0}} },
            { "Polar", 65, 300, 2, {{16,20},{25,31},{0,0},{0,0}} },
            { "Entombing", 75, 200, 2, {{21,24},{32,37},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 305: {
            const ModifierTierData all_tiers[] = {
            { "Humming", 1, 500, 2, {{1,1},{4,6},{0,0},{0,0}} },
            { "Buzzing", 8, 500, 2, {{1,1},{10,15},{0,0},{0,0}} },
            { "Snapping", 16, 500, 2, {{1,1},{16,22},{0,0},{0,0}} },
            { "Crackling", 33, 500, 2, {{1,1},{23,27},{0,0},{0,0}} },
            { "Sparking", 46, 500, 2, {{1,1},{28,32},{0,0},{0,0}} },
            { "Arcing", 54, 500, 2, {{1,2},{33,40},{0,0},{0,0}} },
            { "Shocking", 60, 400, 2, {{1,2},{41,47},{0,0},{0,0}} },
            { "Discharging", 65, 300, 2, {{1,3},{48,59},{0,0},{0,0}} },
            { "Electrocuting", 75, 200, 2, {{1,4},{60,71},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 306: {
            const ModifierTierData all_tiers[] = {
            { "Precise", 1, 800, 1, {{11,32},{0,0},{0,0},{0,0}} },
            { "Reliable", 11, 800, 1, {{33,60},{0,0},{0,0},{0,0}} },
            { "Focused", 18, 800, 1, {{61,84},{0,0},{0,0},{0,0}} },
            { "Deliberate", 26, 800, 1, {{85,123},{0,0},{0,0},{0,0}} },
            { "Consistent", 36, 800, 1, {{124,167},{0,0},{0,0},{0,0}} },
            { "Steady", 48, 800, 1, {{168,236},{0,0},{0,0},{0,0}} },
            { "Hunter's", 58, 800, 1, {{237,346},{0,0},{0,0},{0,0}} },
            { "Ranger's", 67, 400, 1, {{347,450},{0,0},{0,0},{0,0}} },
            { "Amazon's", 76, 200, 1, {{451,550},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 307: {
            const ModifierTierData all_tiers[] = {
            { "Darting", 14, 1000, 1, {{10,17},{0,0},{0,0},{0,0}} },
            { "Brisk", 27, 1000, 1, {{18,25},{0,0},{0,0},{0,0}} },
            { "Quick", 41, 1000, 1, {{26,33},{0,0},{0,0},{0,0}} },
            { "Rapid", 55, 1000, 1, {{34,41},{0,0},{0,0},{0,0}} },
            { "Nimble", 82, 1000, 1, {{42,46},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 308: {
            const ModifierTierData all_tiers[] = {
            { "Acute", 1, 500, 1, {{11,20},{0,0},{0,0},{0,0}} },
            { "Trenchant", 16, 500, 1, {{21,30},{0,0},{0,0},{0,0}} },
            { "Perforating", 33, 500, 1, {{31,36},{0,0},{0,0},{0,0}} },
            { "Incisive", 46, 500, 1, {{37,42},{0,0},{0,0},{0,0}} },
            { "Lacerating", 60, 500, 1, {{43,50},{0,0},{0,0},{0,0}} },
            { "Impaling", 81, 500, 1, {{51,59},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 309: {
            const ModifierTierData all_tiers[] = {
            { "of the Mongoose", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Lynx", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Fox", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Falcon", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Panther", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Leopard", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Jaguar", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Phantom", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 310: {
            const ModifierTierData all_tiers[] = {
            { "of the Archer", 5, 500, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of the Fletcher", 41, 250, 1, {{2,2},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 311: {
            const ModifierTierData all_tiers[] = {
            { "of Success", 1, 750, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of Victory", 11, 750, 1, {{7,9},{0,0},{0,0},{0,0}} },
            { "of Triumph", 22, 750, 1, {{10,18},{0,0},{0,0},{0,0}} },
            { "of Conquest", 33, 750, 1, {{19,28},{0,0},{0,0},{0,0}} },
            { "of Vanquishing", 44, 750, 1, {{29,40},{0,0},{0,0},{0,0}} },
            { "of Valour", 55, 750, 1, {{41,53},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 312: {
            const ModifierTierData all_tiers[] = {
            { "of Absorption", 1, 750, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of Osmosis", 12, 750, 1, {{4,5},{0,0},{0,0},{0,0}} },
            { "of Infusion", 23, 750, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of Enveloping", 34, 750, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Consumption", 45, 750, 1, {{15,20},{0,0},{0,0},{0,0}} },
            { "of Siphoning", 56, 750, 1, {{21,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 313: {
            const ModifierTierData all_tiers[] = {
            { "of Skill", 1, 500, 1, {{5,7},{0,0},{0,0},{0,0}} },
            { "of Ease", 11, 500, 1, {{8,10},{0,0},{0,0},{0,0}} },
            { "of Mastery", 22, 500, 1, {{11,13},{0,0},{0,0},{0,0}} },
            { "of Renown", 30, 500, 1, {{14,16},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 314: {
            const ModifierTierData all_tiers[] = {
            { "of Menace", 5, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Havoc", 20, 1000, 1, {{15,19},{0,0},{0,0},{0,0}} },
            { "of Disaster", 30, 1000, 1, {{20,24},{0,0},{0,0},{0,0}} },
            { "of Calamity", 44, 500, 1, {{25,29},{0,0},{0,0},{0,0}} },
            { "of Ruin", 58, 250, 1, {{30,34},{0,0},{0,0},{0,0}} },
            { "of Unmaking", 72, 125, 1, {{35,38},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 315: {
            const ModifierTierData all_tiers[] = {
            { "of Ire", 8, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Anger", 21, 1000, 1, {{15,19},{0,0},{0,0},{0,0}} },
            { "of Rage", 31, 1000, 1, {{20,24},{0,0},{0,0},{0,0}} },
            { "of Fury", 45, 500, 1, {{25,29},{0,0},{0,0},{0,0}} },
            { "of Ferocity", 59, 250, 1, {{30,34},{0,0},{0,0},{0,0}} },
            { "of Destruction", 74, 125, 1, {{35,39},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 316: {
            const ModifierTierData all_tiers[] = {
            { "of Piercing", 11, 500, 1, {{12,14},{0,0},{0,0},{0,0}} },
            { "of Drilling", 26, 500, 1, {{15,17},{0,0},{0,0},{0,0}} },
            { "of Puncturing", 44, 500, 1, {{18,20},{0,0},{0,0},{0,0}} },
            { "of Skewering", 61, 500, 1, {{21,23},{0,0},{0,0},{0,0}} },
            { "of Penetrating", 77, 500, 1, {{24,26},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 317: {
            const ModifierTierData all_tiers[] = {
            { "Hale", 1, 1000, 1, {{10,19},{0,0},{0,0},{0,0}} },
            { "Healthy", 6, 1000, 1, {{20,29},{0,0},{0,0},{0,0}} },
            { "Sanguine", 16, 1000, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Stalwart", 24, 1000, 1, {{40,59},{0,0},{0,0},{0,0}} },
            { "Stout", 33, 1000, 1, {{60,69},{0,0},{0,0},{0,0}} },
            { "Robust", 38, 1000, 1, {{70,84},{0,0},{0,0},{0,0}} },
            { "Rotund", 46, 1000, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Virile", 54, 1000, 1, {{100,119},{0,0},{0,0},{0,0}} },
            { "Athlete's", 60, 1000, 1, {{120,149},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 318: {
            const ModifierTierData all_tiers[] = {
            { "Beryl", 1, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "Cobalt", 6, 1000, 1, {{15,24},{0,0},{0,0},{0,0}} },
            { "Azure", 16, 1000, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Teal", 25, 1000, 1, {{35,54},{0,0},{0,0},{0,0}} },
            { "Cerulean", 33, 1000, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Aqua", 38, 1000, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Opalescent", 46, 1000, 1, {{80,89},{0,0},{0,0},{0,0}} },
            { "Gentian", 54, 1000, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Chalybeous", 60, 1000, 1, {{105,124},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 319: {
            const ModifierTierData all_tiers[] = {
            { "Lacquered", 1, 1000, 1, {{16,27},{0,0},{0,0},{0,0}} },
            { "Studded", 8, 1000, 1, {{28,50},{0,0},{0,0},{0,0}} },
            { "Ribbed", 16, 1000, 1, {{51,68},{0,0},{0,0},{0,0}} },
            { "Fortified", 25, 1000, 1, {{69,82},{0,0},{0,0},{0,0}} },
            { "Plated", 33, 1000, 1, {{83,102},{0,0},{0,0},{0,0}} },
            { "Carapaced", 46, 1000, 1, {{103,122},{0,0},{0,0},{0,0}} },
            { "Encased", 54, 1000, 1, {{123,160},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 320: {
            const ModifierTierData all_tiers[] = {
            { "Agile", 1, 1000, 1, {{11,18},{0,0},{0,0},{0,0}} },
            { "Dancer's", 8, 1000, 1, {{19,39},{0,0},{0,0},{0,0}} },
            { "Acrobat's", 16, 1000, 1, {{40,56},{0,0},{0,0},{0,0}} },
            { "Fleet", 25, 1000, 1, {{57,70},{0,0},{0,0},{0,0}} },
            { "Blurred", 33, 1000, 1, {{71,88},{0,0},{0,0},{0,0}} },
            { "Phased", 46, 1000, 1, {{89,107},{0,0},{0,0},{0,0}} },
            { "Vaporous", 54, 1000, 1, {{108,142},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 321: {
            const ModifierTierData all_tiers[] = {
            { "Shining", 1, 1000, 1, {{10,17},{0,0},{0,0},{0,0}} },
            { "Glimmering", 8, 1000, 1, {{18,24},{0,0},{0,0},{0,0}} },
            { "Glittering", 16, 1000, 1, {{25,30},{0,0},{0,0},{0,0}} },
            { "Glowing", 25, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "Radiating", 33, 1000, 1, {{36,41},{0,0},{0,0},{0,0}} },
            { "Pulsing", 46, 1000, 1, {{42,47},{0,0},{0,0},{0,0}} },
            { "Blazing", 54, 1000, 1, {{48,60},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 322: {
            const ModifierTierData all_tiers[] = {
            { "Reinforced", 2, 1000, 1, {{15,26},{0,0},{0,0},{0,0}} },
            { "Layered", 16, 1000, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Lobstered", 35, 1000, 1, {{43,55},{0,0},{0,0},{0,0}} },
            { "Buttressed", 46, 1000, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Thickened", 54, 1000, 1, {{68,79},{0,0},{0,0},{0,0}} },
            { "Girded", 60, 1000, 1, {{80,91},{0,0},{0,0},{0,0}} },
            { "Impregnable", 65, 1000, 1, {{92,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 323: {
            const ModifierTierData all_tiers[] = {
            { "Shade's", 2, 1000, 1, {{15,26},{0,0},{0,0},{0,0}} },
            { "Ghost's", 16, 1000, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Spectre's", 33, 1000, 1, {{43,55},{0,0},{0,0},{0,0}} },
            { "Wraith's", 46, 1000, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Phantasm's", 54, 1000, 1, {{68,79},{0,0},{0,0},{0,0}} },
            { "Nightmare's", 60, 1000, 1, {{80,91},{0,0},{0,0},{0,0}} },
            { "Mirage's", 65, 1000, 1, {{92,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 324: {
            const ModifierTierData all_tiers[] = {
            { "Protective", 2, 1000, 1, {{15,26},{0,0},{0,0},{0,0}} },
            { "Strong-Willed", 16, 1000, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Resolute", 33, 1000, 1, {{43,55},{0,0},{0,0},{0,0}} },
            { "Fearless", 46, 1000, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Dauntless", 54, 1000, 1, {{68,79},{0,0},{0,0},{0,0}} },
            { "Indomitable", 60, 1000, 1, {{80,91},{0,0},{0,0},{0,0}} },
            { "Unassailable", 65, 1000, 1, {{92,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 325: {
            const ModifierTierData all_tiers[] = {
            { "Beetle's", 10, 1000, 2, {{6,13},{8,13},{0,0},{0,0}} },
            { "Crab's", 19, 1000, 2, {{14,20},{14,24},{0,0},{0,0}} },
            { "Armadillo's", 38, 1000, 2, {{21,26},{25,40},{0,0},{0,0}} },
            { "Rhino's", 48, 1000, 2, {{27,32},{41,63},{0,0},{0,0}} },
            { "Elephant's", 63, 1000, 2, {{33,38},{64,94},{0,0},{0,0}} },
            { "Mammoth's", 74, 1000, 2, {{39,42},{95,136},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 326: {
            const ModifierTierData all_tiers[] = {
            { "Mosquito's", 10, 1000, 2, {{6,13},{8,13},{0,0},{0,0}} },
            { "Moth's", 19, 1000, 2, {{14,20},{14,24},{0,0},{0,0}} },
            { "Butterfly's", 38, 1000, 2, {{21,26},{25,40},{0,0},{0,0}} },
            { "Wasp's", 48, 1000, 2, {{27,32},{41,63},{0,0},{0,0}} },
            { "Dragonfly's", 63, 1000, 2, {{33,38},{64,94},{0,0},{0,0}} },
            { "Hummingbird's", 74, 1000, 2, {{39,42},{95,136},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 327: {
            const ModifierTierData all_tiers[] = {
            { "Pixie's", 10, 1000, 2, {{6,13},{8,13},{0,0},{0,0}} },
            { "Gremlin's", 19, 1000, 2, {{14,20},{14,24},{0,0},{0,0}} },
            { "Boggart's", 38, 1000, 2, {{21,26},{25,40},{0,0},{0,0}} },
            { "Naga's", 48, 1000, 2, {{27,32},{41,63},{0,0},{0,0}} },
            { "Djinn's", 63, 1000, 2, {{33,38},{64,94},{0,0},{0,0}} },
            { "Seraphim's", 74, 1000, 2, {{39,42},{95,136},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 328: {
            const ModifierTierData all_tiers[] = {
            { "Runner's", 1, 1000, 1, {{10,10},{0,0},{0,0},{0,0}} },
            { "Sprinter's", 16, 1000, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "Stallion's", 33, 1000, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "Gazelle's", 46, 1000, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "Cheetah's", 65, 1000, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "Hellion's", 82, 1000, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 329: {
            const ModifierTierData all_tiers[] = {
            { "of the Brute", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Wrestler", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Bear", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Lion", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Gorilla", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Goliath", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Leviathan", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Titan", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 330: {
            const ModifierTierData all_tiers[] = {
            { "of the Mongoose", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Lynx", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Fox", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Falcon", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Panther", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Leopard", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Jaguar", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Phantom", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            { "of the Wind", 81, 1000, 1, {{34,36},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 331: {
            const ModifierTierData all_tiers[] = {
            { "of the Pupil", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Student", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Prodigy", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Augur", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Philosopher", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Sage", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Savant", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Virtuoso", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 332: {
            const ModifierTierData all_tiers[] = {
            { "of the Whelpling", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Salamander", 12, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Drake", 24, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Kiln", 36, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Furnace", 48, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Volcano", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Magma", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Tzteosh", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 333: {
            const ModifierTierData all_tiers[] = {
            { "of the Seal", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Penguin", 14, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Narwhal", 26, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Yeti", 38, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Walrus", 50, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Polar Bear", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Ice", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Haast", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 334: {
            const ModifierTierData all_tiers[] = {
            { "of the Cloud", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Squall", 13, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Storm", 25, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Thunderhead", 37, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Tempest", 49, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Maelstrom", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Lightning", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Ephij", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 335: {
            const ModifierTierData all_tiers[] = {
            { "of the Lost", 16, 250, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "of Banishment", 30, 250, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Eviction", 44, 250, 1, {{12,15},{0,0},{0,0},{0,0}} },
            { "of Expulsion", 56, 250, 1, {{16,19},{0,0},{0,0},{0,0}} },
            { "of Exile", 68, 250, 1, {{20,23},{0,0},{0,0},{0,0}} },
            { "of Bameth", 81, 250, 1, {{24,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 336: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 750, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 750, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 750, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 750, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 750, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 337: {
            const ModifierTierData all_tiers[] = {
            { "of Thick Skin", 1, 800, 1, {{6,11},{0,0},{0,0},{0,0}} },
            { "of Reinforced Skin", 8, 800, 1, {{12,29},{0,0},{0,0},{0,0}} },
            { "of Stone Skin", 15, 800, 1, {{30,49},{0,0},{0,0},{0,0}} },
            { "of Iron Skin", 22, 800, 1, {{50,72},{0,0},{0,0},{0,0}} },
            { "of Steel Skin", 29, 800, 1, {{73,97},{0,0},{0,0},{0,0}} },
            { "of Granite Skin", 36, 800, 1, {{98,124},{0,0},{0,0},{0,0}} },
            { "of Platinum Skin", 45, 800, 1, {{125,163},{0,0},{0,0},{0,0}} },
            { "of Adamantite Skin", 54, 800, 1, {{164,206},{0,0},{0,0},{0,0}} },
            { "of Corundum Skin", 63, 800, 1, {{207,253},{0,0},{0,0},{0,0}} },
            { "of Obsidian Skin", 72, 800, 1, {{254,304},{0,0},{0,0},{0,0}} },
            { "of Titanium Skin", 80, 800, 1, {{305,352},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 338: {
            const ModifierTierData all_tiers[] = {
            { "of the Newt", 1, 1000, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "of the Lizard", 5, 1000, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of the Flatworm", 11, 1000, 1, {{3,4},{0,0},{0,0},{0,0}} },
            { "of the Starfish", 17, 1000, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of the Hydra", 26, 1000, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of the Troll", 35, 1000, 1, {{9,13},{0,0},{0,0},{0,0}} },
            { "of Convalescence", 47, 1000, 1, {{13,18},{0,0},{0,0},{0,0}} },
            { "of Recuperation", 58, 1000, 1, {{18,23},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 339: {
            const ModifierTierData all_tiers[] = {
            { "of Plunder", 3, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of Raiding", 24, 1000, 1, {{11,14},{0,0},{0,0},{0,0}} },
            { "of Archaeology", 40, 1000, 1, {{15,18},{0,0},{0,0},{0,0}} },
            { "of Excavation", 63, 1000, 1, {{19,21},{0,0},{0,0},{0,0}} },
            { "of Windfall", 75, 1000, 1, {{22,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 340: {
            const ModifierTierData all_tiers[] = {
            { "of Earthing", 20, 500, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Insulation", 36, 500, 1, {{41,45},{0,0},{0,0},{0,0}} },
            { "of the Impedance", 49, 500, 1, {{46,50},{0,0},{0,0},{0,0}} },
            { "of the Dielectric", 63, 500, 1, {{51,55},{0,0},{0,0},{0,0}} },
            { "of Grounding", 75, 500, 1, {{56,60},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 341: {
            const ModifierTierData all_tiers[] = {
            { "of Convection", 20, 500, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Fluidity", 36, 500, 1, {{41,45},{0,0},{0,0},{0,0}} },
            { "of Entropy", 49, 500, 1, {{46,50},{0,0},{0,0},{0,0}} },
            { "of Dissipation", 63, 500, 1, {{51,55},{0,0},{0,0},{0,0}} },
            { "of the Reversal", 75, 500, 1, {{56,60},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 342: {
            const ModifierTierData all_tiers[] = {
            { "of Heating", 20, 500, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Unfreezing", 36, 500, 1, {{41,45},{0,0},{0,0},{0,0}} },
            { "of Defrosting", 49, 500, 1, {{46,50},{0,0},{0,0},{0,0}} },
            { "of the Temperate", 63, 500, 1, {{51,55},{0,0},{0,0},{0,0}} },
            { "of Thawing", 75, 500, 1, {{56,60},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 343: {
            const ModifierTierData all_tiers[] = {
            { "of Covering", 1, 1000, 1, {{14,19},{0,0},{0,0},{0,0}} },
            { "of Sheathing", 16, 1000, 1, {{20,25},{0,0},{0,0},{0,0}} },
            { "of Lining", 36, 1000, 1, {{26,31},{0,0},{0,0},{0,0}} },
            { "of Padding", 48, 1000, 1, {{32,37},{0,0},{0,0},{0,0}} },
            { "of Furring", 66, 1000, 1, {{38,43},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 344: {
            const ModifierTierData all_tiers[] = {
            { "of Deflecting", 1, 1000, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Bending", 16, 1000, 1, {{12,14},{0,0},{0,0},{0,0}} },
            { "of Curvation", 36, 1000, 1, {{15,17},{0,0},{0,0},{0,0}} },
            { "of Diversion", 48, 1000, 1, {{18,20},{0,0},{0,0},{0,0}} },
            { "of Flexure", 66, 1000, 1, {{21,23},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 345: {
            const ModifierTierData all_tiers[] = {
            { "of Enlivening", 1, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of Diffusion", 16, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Dispersal", 36, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Buffering", 48, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 346: {
            const ModifierTierData all_tiers[] = {
            { "Hale", 1, 1000, 1, {{10,19},{0,0},{0,0},{0,0}} },
            { "Healthy", 6, 1000, 1, {{20,29},{0,0},{0,0},{0,0}} },
            { "Sanguine", 16, 1000, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Stalwart", 24, 1000, 1, {{40,59},{0,0},{0,0},{0,0}} },
            { "Stout", 33, 1000, 1, {{60,69},{0,0},{0,0},{0,0}} },
            { "Robust", 38, 1000, 1, {{70,84},{0,0},{0,0},{0,0}} },
            { "Rotund", 46, 1000, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Virile", 54, 1000, 1, {{100,119},{0,0},{0,0},{0,0}} },
            { "Athlete's", 60, 1000, 1, {{120,149},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 347: {
            const ModifierTierData all_tiers[] = {
            { "Beryl", 1, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "Cobalt", 6, 1000, 1, {{15,24},{0,0},{0,0},{0,0}} },
            { "Azure", 16, 1000, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Teal", 25, 1000, 1, {{35,54},{0,0},{0,0},{0,0}} },
            { "Cerulean", 33, 1000, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Aqua", 38, 1000, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Opalescent", 46, 1000, 1, {{80,89},{0,0},{0,0},{0,0}} },
            { "Gentian", 54, 1000, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Chalybeous", 60, 1000, 1, {{105,124},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 348: {
            const ModifierTierData all_tiers[] = {
            { "Supple", 1, 1000, 2, {{8,14},{6,9},{0,0},{0,0}} },
            { "Pliant", 16, 1000, 2, {{15,35},{10,30},{0,0},{0,0}} },
            { "Flexible", 33, 1000, 2, {{36,53},{31,46},{0,0},{0,0}} },
            { "Durable", 46, 1000, 2, {{54,65},{47,57},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 349: {
            const ModifierTierData all_tiers[] = {
            { "Blessed", 1, 1000, 2, {{8,14},{5,8},{0,0},{0,0}} },
            { "Anointed", 16, 1000, 2, {{15,35},{9,15},{0,0},{0,0}} },
            { "Sanctified", 33, 1000, 2, {{36,53},{16,21},{0,0},{0,0}} },
            { "Hallowed", 46, 1000, 2, {{54,65},{22,25},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 350: {
            const ModifierTierData all_tiers[] = {
            { "Will-o-wisp's", 1, 1000, 2, {{6,9},{5,8},{0,0},{0,0}} },
            { "Nymph's", 16, 1000, 2, {{10,30},{9,15},{0,0},{0,0}} },
            { "Sylph's", 33, 1000, 2, {{31,46},{16,21},{0,0},{0,0}} },
            { "Cherub's", 46, 1000, 2, {{47,57},{22,25},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 351: {
            const ModifierTierData all_tiers[] = {
            { "Scrapper's", 2, 1000, 2, {{15,26},{15,26},{0,0},{0,0}} },
            { "Brawler's", 16, 1000, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Fencer's", 33, 1000, 2, {{43,55},{43,55},{0,0},{0,0}} },
            { "Gladiator's", 46, 1000, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Duelist's", 54, 1000, 2, {{68,79},{68,79},{0,0},{0,0}} },
            { "Hero's", 60, 1000, 2, {{80,91},{80,91},{0,0},{0,0}} },
            { "Legend's", 65, 1000, 2, {{92,100},{92,100},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 352: {
            const ModifierTierData all_tiers[] = {
            { "Infixed", 2, 1000, 2, {{15,26},{15,26},{0,0},{0,0}} },
            { "Ingrained", 16, 1000, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Instilled", 33, 1000, 2, {{43,55},{43,55},{0,0},{0,0}} },
            { "Infused", 46, 1000, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Inculcated", 54, 1000, 2, {{68,79},{68,79},{0,0},{0,0}} },
            { "Interpolated", 60, 1000, 2, {{80,91},{80,91},{0,0},{0,0}} },
            { "Inspired", 65, 1000, 2, {{92,100},{92,100},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 353: {
            const ModifierTierData all_tiers[] = {
            { "Shadowy", 2, 1000, 2, {{15,26},{15,26},{0,0},{0,0}} },
            { "Ethereal", 16, 1000, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Unworldly", 33, 1000, 2, {{43,55},{43,55},{0,0},{0,0}} },
            { "Ephemeral", 46, 1000, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Evanescent", 54, 1000, 2, {{68,79},{68,79},{0,0},{0,0}} },
            { "Unreal", 60, 1000, 2, {{80,91},{80,91},{0,0},{0,0}} },
            { "Illusory", 65, 1000, 2, {{92,100},{92,100},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 354: {
            const ModifierTierData all_tiers[] = {
            { "Captain's", 10, 1000, 3, {{6,13},{6,13},{8,13},{0,0}} },
            { "Commander's", 19, 1000, 3, {{14,20},{14,20},{14,24},{0,0}} },
            { "Magnate's", 38, 1000, 3, {{21,26},{21,26},{25,40},{0,0}} },
            { "Marshal's", 48, 1000, 3, {{27,32},{27,32},{41,63},{0,0}} },
            { "General's", 63, 1000, 3, {{33,38},{33,38},{64,94},{0,0}} },
            { "Warlord's", 74, 1000, 3, {{39,42},{39,42},{95,136},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 355: {
            const ModifierTierData all_tiers[] = {
            { "Defender's", 10, 1000, 3, {{6,13},{6,13},{8,13},{0,0}} },
            { "Protector's", 19, 1000, 3, {{14,20},{14,20},{14,24},{0,0}} },
            { "Keeper's", 38, 1000, 3, {{21,26},{21,26},{25,40},{0,0}} },
            { "Guardian's", 48, 1000, 3, {{27,32},{27,32},{41,63},{0,0}} },
            { "Warden's", 63, 1000, 3, {{33,38},{33,38},{64,94},{0,0}} },
            { "Sentinel's", 74, 1000, 3, {{39,42},{39,42},{95,136},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 356: {
            const ModifierTierData all_tiers[] = {
            { "Intuitive", 10, 1000, 3, {{6,13},{6,13},{8,13},{0,0}} },
            { "Psychic", 19, 1000, 3, {{14,20},{14,20},{14,24},{0,0}} },
            { "Telepath's", 38, 1000, 3, {{21,26},{21,26},{25,40},{0,0}} },
            { "Illusionist's", 48, 1000, 3, {{27,32},{27,32},{41,63},{0,0}} },
            { "Mentalist's", 63, 1000, 3, {{33,38},{33,38},{64,94},{0,0}} },
            { "Trickster's", 74, 1000, 3, {{39,42},{39,42},{95,136},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 357: {
            const ModifierTierData all_tiers[] = {
            { "Runner's", 1, 1000, 1, {{10,10},{0,0},{0,0},{0,0}} },
            { "Sprinter's", 16, 1000, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "Stallion's", 33, 1000, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "Gazelle's", 46, 1000, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "Cheetah's", 65, 1000, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "Hellion's", 82, 1000, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 358: {
            const ModifierTierData all_tiers[] = {
            { "of the Brute", 1, 500, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Wrestler", 11, 500, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Bear", 22, 500, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Lion", 33, 500, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Gorilla", 44, 500, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Goliath", 55, 500, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Leviathan", 66, 500, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Titan", 74, 500, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 359: {
            const ModifierTierData all_tiers[] = {
            { "of the Mongoose", 1, 500, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Lynx", 11, 500, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Fox", 22, 500, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Falcon", 33, 500, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Panther", 44, 500, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Leopard", 55, 500, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Jaguar", 66, 500, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Phantom", 74, 500, 1, {{31,33},{0,0},{0,0},{0,0}} },
            { "of the Wind", 81, 500, 1, {{34,36},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 360: {
            const ModifierTierData all_tiers[] = {
            { "of the Pupil", 1, 500, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Student", 11, 500, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Prodigy", 22, 500, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Augur", 33, 500, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Philosopher", 44, 500, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Sage", 55, 500, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Savant", 66, 500, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Virtuoso", 74, 500, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 361: {
            const ModifierTierData all_tiers[] = {
            { "of the Whelpling", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Salamander", 12, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Drake", 24, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Kiln", 36, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Furnace", 48, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Volcano", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Magma", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Tzteosh", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 362: {
            const ModifierTierData all_tiers[] = {
            { "of the Seal", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Penguin", 14, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Narwhal", 26, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Yeti", 38, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Walrus", 50, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Polar Bear", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Ice", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Haast", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 363: {
            const ModifierTierData all_tiers[] = {
            { "of the Cloud", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Squall", 13, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Storm", 25, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Thunderhead", 37, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Tempest", 49, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Maelstrom", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Lightning", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Ephij", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 364: {
            const ModifierTierData all_tiers[] = {
            { "of the Lost", 16, 250, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "of Banishment", 30, 250, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Eviction", 44, 250, 1, {{12,15},{0,0},{0,0},{0,0}} },
            { "of Expulsion", 56, 250, 1, {{16,19},{0,0},{0,0},{0,0}} },
            { "of Exile", 68, 250, 1, {{20,23},{0,0},{0,0},{0,0}} },
            { "of Bameth", 81, 250, 1, {{24,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 365: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 750, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 750, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 750, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 750, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 750, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 366: {
            const ModifierTierData all_tiers[] = {
            { "of Thick Skin", 1, 800, 1, {{6,11},{0,0},{0,0},{0,0}} },
            { "of Reinforced Skin", 8, 800, 1, {{12,29},{0,0},{0,0},{0,0}} },
            { "of Stone Skin", 15, 800, 1, {{30,49},{0,0},{0,0},{0,0}} },
            { "of Iron Skin", 22, 800, 1, {{50,72},{0,0},{0,0},{0,0}} },
            { "of Steel Skin", 29, 800, 1, {{73,97},{0,0},{0,0},{0,0}} },
            { "of Granite Skin", 36, 800, 1, {{98,124},{0,0},{0,0},{0,0}} },
            { "of Platinum Skin", 45, 800, 1, {{125,163},{0,0},{0,0},{0,0}} },
            { "of Adamantite Skin", 54, 800, 1, {{164,206},{0,0},{0,0},{0,0}} },
            { "of Corundum Skin", 63, 800, 1, {{207,253},{0,0},{0,0},{0,0}} },
            { "of Obsidian Skin", 72, 800, 1, {{254,304},{0,0},{0,0},{0,0}} },
            { "of Titanium Skin", 80, 800, 1, {{305,352},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 367: {
            const ModifierTierData all_tiers[] = {
            { "of the Newt", 1, 1000, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "of the Lizard", 5, 1000, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of the Flatworm", 11, 1000, 1, {{3,4},{0,0},{0,0},{0,0}} },
            { "of the Starfish", 17, 1000, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of the Hydra", 26, 1000, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of the Troll", 35, 1000, 1, {{9,13},{0,0},{0,0},{0,0}} },
            { "of Convalescence", 47, 1000, 1, {{13,18},{0,0},{0,0},{0,0}} },
            { "of Recuperation", 58, 1000, 1, {{18,23},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 368: {
            const ModifierTierData all_tiers[] = {
            { "of Plunder", 3, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of Raiding", 24, 1000, 1, {{11,14},{0,0},{0,0},{0,0}} },
            { "of Archaeology", 40, 1000, 1, {{15,18},{0,0},{0,0},{0,0}} },
            { "of Excavation", 63, 1000, 1, {{19,21},{0,0},{0,0},{0,0}} },
            { "of Windfall", 75, 1000, 1, {{22,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 369: {
            const ModifierTierData all_tiers[] = {
            { "of Earthing", 20, 500, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Insulation", 36, 500, 1, {{41,45},{0,0},{0,0},{0,0}} },
            { "of the Impedance", 49, 500, 1, {{46,50},{0,0},{0,0},{0,0}} },
            { "of the Dielectric", 63, 500, 1, {{51,55},{0,0},{0,0},{0,0}} },
            { "of Grounding", 75, 500, 1, {{56,60},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 370: {
            const ModifierTierData all_tiers[] = {
            { "of Convection", 20, 500, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Fluidity", 36, 500, 1, {{41,45},{0,0},{0,0},{0,0}} },
            { "of Entropy", 49, 500, 1, {{46,50},{0,0},{0,0},{0,0}} },
            { "of Dissipation", 63, 500, 1, {{51,55},{0,0},{0,0},{0,0}} },
            { "of the Reversal", 75, 500, 1, {{56,60},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 371: {
            const ModifierTierData all_tiers[] = {
            { "of Heating", 20, 500, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Unfreezing", 36, 500, 1, {{41,45},{0,0},{0,0},{0,0}} },
            { "of Defrosting", 49, 500, 1, {{46,50},{0,0},{0,0},{0,0}} },
            { "of the Temperate", 63, 500, 1, {{51,55},{0,0},{0,0},{0,0}} },
            { "of Thawing", 75, 500, 1, {{56,60},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 372: {
            const ModifierTierData all_tiers[] = {
            { "of Covering", 1, 500, 1, {{14,19},{0,0},{0,0},{0,0}} },
            { "of Sheathing", 16, 500, 1, {{20,25},{0,0},{0,0},{0,0}} },
            { "of Lining", 36, 500, 1, {{26,31},{0,0},{0,0},{0,0}} },
            { "of Padding", 48, 500, 1, {{32,37},{0,0},{0,0},{0,0}} },
            { "of Furring", 66, 500, 1, {{38,43},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 373: {
            const ModifierTierData all_tiers[] = {
            { "of Deflecting", 1, 500, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Bending", 16, 500, 1, {{12,14},{0,0},{0,0},{0,0}} },
            { "of Curvation", 36, 500, 1, {{15,17},{0,0},{0,0},{0,0}} },
            { "of Diversion", 48, 500, 1, {{18,20},{0,0},{0,0},{0,0}} },
            { "of Flexure", 66, 500, 1, {{21,23},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 374: {
            const ModifierTierData all_tiers[] = {
            { "of Enlivening", 1, 500, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of Diffusion", 16, 500, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Dispersal", 36, 500, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Buffering", 48, 500, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 375: {
            const ModifierTierData all_tiers[] = {
            { "Hale", 1, 1000, 1, {{10,19},{0,0},{0,0},{0,0}} },
            { "Healthy", 6, 1000, 1, {{20,29},{0,0},{0,0},{0,0}} },
            { "Sanguine", 16, 1000, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Stalwart", 24, 1000, 1, {{40,59},{0,0},{0,0},{0,0}} },
            { "Stout", 33, 1000, 1, {{60,69},{0,0},{0,0},{0,0}} },
            { "Robust", 38, 1000, 1, {{70,84},{0,0},{0,0},{0,0}} },
            { "Rotund", 46, 1000, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Virile", 54, 1000, 1, {{100,119},{0,0},{0,0},{0,0}} },
            { "Athlete's", 60, 1000, 1, {{120,149},{0,0},{0,0},{0,0}} },
            { "Fecund", 65, 1000, 1, {{150,174},{0,0},{0,0},{0,0}} },
            { "Vigorous", 70, 1000, 1, {{175,189},{0,0},{0,0},{0,0}} },
            { "Rapturous", 75, 1000, 1, {{190,199},{0,0},{0,0},{0,0}} },
            { "Prime", 80, 1000, 1, {{200,214},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 376: {
            const ModifierTierData all_tiers[] = {
            { "Supple", 1, 1000, 2, {{8,14},{6,9},{0,0},{0,0}} },
            { "Pliant", 16, 1000, 2, {{15,35},{10,30},{0,0},{0,0}} },
            { "Flexible", 33, 1000, 2, {{36,53},{31,46},{0,0},{0,0}} },
            { "Durable", 46, 1000, 2, {{54,65},{47,57},{0,0},{0,0}} },
            { "Sturdy", 54, 1000, 2, {{66,78},{58,69},{0,0},{0,0}} },
            { "Resilient", 60, 1000, 2, {{79,98},{70,88},{0,0},{0,0}} },
            { "Adaptable", 65, 1000, 2, {{99,117},{89,107},{0,0},{0,0}} },
            { "Versatile", 75, 1000, 2, {{118,138},{108,126},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 377: {
            const ModifierTierData all_tiers[] = {
            { "Blessed", 1, 1000, 2, {{8,14},{5,8},{0,0},{0,0}} },
            { "Anointed", 16, 1000, 2, {{15,35},{9,15},{0,0},{0,0}} },
            { "Sanctified", 33, 1000, 2, {{36,53},{16,21},{0,0},{0,0}} },
            { "Hallowed", 46, 1000, 2, {{54,65},{22,25},{0,0},{0,0}} },
            { "Beatified", 54, 1000, 2, {{66,78},{26,29},{0,0},{0,0}} },
            { "Consecrated", 60, 1000, 2, {{79,98},{30,36},{0,0},{0,0}} },
            { "Saintly", 65, 1000, 2, {{99,117},{37,42},{0,0},{0,0}} },
            { "Godly", 75, 1000, 2, {{118,138},{43,48},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 378: {
            const ModifierTierData all_tiers[] = {
            { "Will-o-wisp's", 1, 1000, 2, {{6,9},{5,8},{0,0},{0,0}} },
            { "Nymph's", 16, 1000, 2, {{10,30},{9,15},{0,0},{0,0}} },
            { "Sylph's", 33, 1000, 2, {{31,46},{16,21},{0,0},{0,0}} },
            { "Cherub's", 46, 1000, 2, {{47,57},{22,25},{0,0},{0,0}} },
            { "Spirit's", 54, 1000, 2, {{58,69},{26,29},{0,0},{0,0}} },
            { "Eidolon's", 60, 1000, 2, {{70,88},{30,36},{0,0},{0,0}} },
            { "Apparition's", 65, 1000, 2, {{89,107},{37,42},{0,0},{0,0}} },
            { "Banshee's", 75, 1000, 2, {{108,126},{43,48},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 379: {
            const ModifierTierData all_tiers[] = {
            { "Scrapper's", 2, 1000, 2, {{15,26},{15,26},{0,0},{0,0}} },
            { "Brawler's", 16, 1000, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Fencer's", 33, 1000, 2, {{43,55},{43,55},{0,0},{0,0}} },
            { "Gladiator's", 46, 1000, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Duelist's", 54, 1000, 2, {{68,79},{68,79},{0,0},{0,0}} },
            { "Hero's", 60, 1000, 2, {{80,91},{80,91},{0,0},{0,0}} },
            { "Legend's", 65, 1000, 2, {{92,100},{92,100},{0,0},{0,0}} },
            { "Victor's", 75, 1000, 2, {{101,110},{101,110},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 380: {
            const ModifierTierData all_tiers[] = {
            { "Infixed", 2, 1000, 2, {{15,26},{15,26},{0,0},{0,0}} },
            { "Ingrained", 16, 1000, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Instilled", 33, 1000, 2, {{43,55},{43,55},{0,0},{0,0}} },
            { "Infused", 46, 1000, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Inculcated", 54, 1000, 2, {{68,79},{68,79},{0,0},{0,0}} },
            { "Interpolated", 60, 1000, 2, {{80,91},{80,91},{0,0},{0,0}} },
            { "Inspired", 65, 1000, 2, {{92,100},{92,100},{0,0},{0,0}} },
            { "Interpermeated", 75, 1000, 2, {{101,110},{101,110},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 381: {
            const ModifierTierData all_tiers[] = {
            { "Shadowy", 2, 1000, 2, {{15,26},{15,26},{0,0},{0,0}} },
            { "Ethereal", 16, 1000, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Unworldly", 33, 1000, 2, {{43,55},{43,55},{0,0},{0,0}} },
            { "Ephemeral", 46, 1000, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Evanescent", 54, 1000, 2, {{68,79},{68,79},{0,0},{0,0}} },
            { "Unreal", 60, 1000, 2, {{80,91},{80,91},{0,0},{0,0}} },
            { "Illusory", 65, 1000, 2, {{92,100},{92,100},{0,0},{0,0}} },
            { "Incorporeal", 75, 1000, 2, {{101,110},{101,110},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 382: {
            const ModifierTierData all_tiers[] = {
            { "Bully's", 8, 1000, 3, {{6,13},{6,13},{7,10},{0,0}} },
            { "Thug's", 16, 1000, 3, {{14,20},{14,20},{11,19},{0,0}} },
            { "Brute's", 33, 1000, 3, {{21,26},{21,26},{20,25},{0,0}} },
            { "Assailant's", 46, 1000, 3, {{27,32},{27,32},{26,32},{0,0}} },
            { "Aggressor's", 60, 1000, 3, {{33,38},{33,38},{33,41},{0,0}} },
            { "Predator's", 78, 1000, 3, {{39,42},{39,42},{42,49},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 383: {
            const ModifierTierData all_tiers[] = {
            { "Augur's", 8, 1000, 3, {{6,13},{6,13},{7,10},{0,0}} },
            { "Auspex's", 16, 1000, 3, {{14,20},{14,20},{11,19},{0,0}} },
            { "Druid's", 33, 1000, 3, {{21,26},{21,26},{20,25},{0,0}} },
            { "Haruspex's", 46, 1000, 3, {{27,32},{27,32},{26,32},{0,0}} },
            { "Visionary's", 60, 1000, 3, {{33,38},{33,38},{33,41},{0,0}} },
            { "Prophet's", 78, 1000, 3, {{39,42},{39,42},{42,49},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 384: {
            const ModifierTierData all_tiers[] = {
            { "Poet's", 8, 1000, 3, {{6,13},{6,13},{7,10},{0,0}} },
            { "Musician's", 16, 1000, 3, {{14,20},{14,20},{11,19},{0,0}} },
            { "Troubadour's", 33, 1000, 3, {{21,26},{21,26},{20,25},{0,0}} },
            { "Bard's", 46, 1000, 3, {{27,32},{27,32},{26,32},{0,0}} },
            { "Minstrel's", 60, 1000, 3, {{33,38},{33,38},{33,41},{0,0}} },
            { "Maestro's", 78, 1000, 3, {{39,42},{39,42},{42,49},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 385: {
            const ModifierTierData all_tiers[] = {
            { "Swordsman's", 8, 1000, 4, {{4,6},{3,5},{6,13},{6,13}} },
            { "Fighter's", 16, 1000, 4, {{7,15},{6,12},{14,20},{14,20}} },
            { "Veteran's", 33, 1000, 4, {{16,20},{13,17},{21,26},{21,26}} },
            { "Warrior's", 46, 1000, 4, {{21,27},{18,24},{27,32},{27,32}} },
            { "Knight's", 60, 1000, 4, {{28,34},{25,31},{33,38},{33,38}} },
            { "Centurion's", 78, 1000, 4, {{35,43},{32,39},{39,42},{39,42}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 386: {
            const ModifierTierData all_tiers[] = {
            { "Faithful", 8, 1000, 4, {{4,6},{2,4},{6,13},{6,13}} },
            { "Noble's", 16, 1000, 4, {{7,15},{5,6},{14,20},{14,20}} },
            { "Inquisitor's", 33, 1000, 4, {{16,20},{7,8},{21,26},{21,26}} },
            { "Crusader's", 46, 1000, 4, {{21,27},{9,10},{27,32},{27,32}} },
            { "Paladin's", 60, 1000, 4, {{28,34},{11,12},{33,38},{33,38}} },
            { "Grand", 78, 1000, 4, {{35,43},{13,15},{39,42},{39,42}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 387: {
            const ModifierTierData all_tiers[] = {
            { "Pursuer's", 8, 1000, 4, {{3,5},{2,4},{6,13},{6,13}} },
            { "Tracker's", 16, 1000, 4, {{6,12},{5,6},{14,20},{14,20}} },
            { "Chaser's", 33, 1000, 4, {{13,17},{7,8},{21,26},{21,26}} },
            { "Phantom's", 46, 1000, 4, {{18,24},{9,10},{27,32},{27,32}} },
            { "Rogue's", 60, 1000, 4, {{25,31},{11,12},{33,38},{33,38}} },
            { "Stalker's", 78, 1000, 4, {{32,39},{13,15},{39,42},{39,42}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 388: {
            const ModifierTierData all_tiers[] = {
            { "Thorny", 1, 1000, 2, {{1,2},{3,4},{0,0},{0,0}} },
            { "Spiny", 10, 1000, 2, {{5,7},{7,10},{0,0},{0,0}} },
            { "Barbed", 19, 1000, 2, {{11,16},{15,23},{0,0},{0,0}} },
            { "Pointed", 38, 1000, 2, {{24,35},{35,53},{0,0},{0,0}} },
            { "Spiked", 48, 1000, 2, {{40,60},{61,92},{0,0},{0,0}} },
            { "Edged", 63, 1000, 2, {{64,97},{97,145},{0,0},{0,0}} },
            { "Jagged", 74, 1000, 2, {{101,151},{146,220},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 389: {
            const ModifierTierData all_tiers[] = {
            { "Lady's", 16, 500, 1, {{30,33},{0,0},{0,0},{0,0}} },
            { "Baronness'", 25, 500, 1, {{34,37},{0,0},{0,0},{0,0}} },
            { "Viscountess'", 33, 500, 1, {{38,42},{0,0},{0,0},{0,0}} },
            { "Marchioness'", 46, 500, 1, {{43,46},{0,0},{0,0},{0,0}} },
            { "Countess'", 54, 400, 1, {{47,50},{0,0},{0,0},{0,0}} },
            { "Duchess'", 60, 300, 1, {{51,53},{0,0},{0,0},{0,0}} },
            { "Princess'", 65, 200, 1, {{54,56},{0,0},{0,0},{0,0}} },
            { "Queen's", 78, 100, 1, {{57,61},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 390: {
            const ModifierTierData all_tiers[] = {
            { "of the Brute", 1, 500, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Wrestler", 11, 500, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Bear", 22, 500, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Lion", 33, 500, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Gorilla", 44, 500, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Goliath", 55, 500, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Leviathan", 66, 500, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Titan", 74, 500, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 391: {
            const ModifierTierData all_tiers[] = {
            { "of the Mongoose", 1, 500, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Lynx", 11, 500, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Fox", 22, 500, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Falcon", 33, 500, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Panther", 44, 500, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Leopard", 55, 500, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Jaguar", 66, 500, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Phantom", 74, 500, 1, {{31,33},{0,0},{0,0},{0,0}} },
            { "of the Wind", 81, 500, 1, {{34,36},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 392: {
            const ModifierTierData all_tiers[] = {
            { "of the Pupil", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Student", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Prodigy", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Augur", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Philosopher", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Sage", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Savant", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Virtuoso", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 393: {
            const ModifierTierData all_tiers[] = {
            { "of the Whelpling", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Salamander", 12, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Drake", 24, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Kiln", 36, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Furnace", 48, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Volcano", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Magma", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Tzteosh", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 394: {
            const ModifierTierData all_tiers[] = {
            { "of the Seal", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Penguin", 14, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Narwhal", 26, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Yeti", 38, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Walrus", 50, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Polar Bear", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Ice", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Haast", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 395: {
            const ModifierTierData all_tiers[] = {
            { "of the Cloud", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Squall", 13, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Storm", 25, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Thunderhead", 37, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Tempest", 49, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Maelstrom", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Lightning", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Ephij", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 396: {
            const ModifierTierData all_tiers[] = {
            { "of the Lost", 16, 250, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "of Banishment", 30, 250, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Eviction", 44, 250, 1, {{12,15},{0,0},{0,0},{0,0}} },
            { "of Expulsion", 56, 250, 1, {{16,19},{0,0},{0,0},{0,0}} },
            { "of Exile", 68, 250, 1, {{20,23},{0,0},{0,0},{0,0}} },
            { "of Bameth", 81, 250, 1, {{24,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 397: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 700, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 700, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 700, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 700, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 700, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 398: {
            const ModifierTierData all_tiers[] = {
            { "of Thick Skin", 1, 800, 1, {{6,11},{0,0},{0,0},{0,0}} },
            { "of Reinforced Skin", 8, 800, 1, {{12,29},{0,0},{0,0},{0,0}} },
            { "of Stone Skin", 15, 800, 1, {{30,49},{0,0},{0,0},{0,0}} },
            { "of Iron Skin", 22, 800, 1, {{50,72},{0,0},{0,0},{0,0}} },
            { "of Steel Skin", 29, 800, 1, {{73,97},{0,0},{0,0},{0,0}} },
            { "of Granite Skin", 36, 800, 1, {{98,124},{0,0},{0,0},{0,0}} },
            { "of Platinum Skin", 45, 800, 1, {{125,163},{0,0},{0,0},{0,0}} },
            { "of Adamantite Skin", 54, 800, 1, {{164,206},{0,0},{0,0},{0,0}} },
            { "of Corundum Skin", 63, 800, 1, {{207,253},{0,0},{0,0},{0,0}} },
            { "of Obsidian Skin", 72, 800, 1, {{254,304},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 399: {
            const ModifierTierData all_tiers[] = {
            { "of the Newt", 1, 1000, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "of the Lizard", 5, 1000, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of the Flatworm", 11, 1000, 1, {{3,4},{0,0},{0,0},{0,0}} },
            { "of the Starfish", 17, 1000, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of the Hydra", 26, 1000, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of the Troll", 35, 1000, 1, {{9,13},{0,0},{0,0},{0,0}} },
            { "of Convalescence", 47, 1000, 1, {{13,18},{0,0},{0,0},{0,0}} },
            { "of Recuperation", 58, 1000, 1, {{18,23},{0,0},{0,0},{0,0}} },
            { "of Resurgence", 68, 1000, 1, {{23,29},{0,0},{0,0},{0,0}} },
            { "of Immortality", 75, 1000, 1, {{29,33},{0,0},{0,0},{0,0}} },
            { "of the Phoenix", 81, 1000, 1, {{33,36},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 400: {
            const ModifierTierData all_tiers[] = {
            { "of Sealing", 21, 500, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Alleviation", 37, 500, 1, {{41,45},{0,0},{0,0},{0,0}} },
            { "of Allaying", 50, 500, 1, {{46,50},{0,0},{0,0},{0,0}} },
            { "of Assuaging", 64, 500, 1, {{51,55},{0,0},{0,0},{0,0}} },
            { "of Staunching", 76, 500, 1, {{56,60},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 401: {
            const ModifierTierData all_tiers[] = {
            { "of the Antitoxin", 21, 500, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of the Remedy", 37, 500, 1, {{41,45},{0,0},{0,0},{0,0}} },
            { "of the Cure", 50, 500, 1, {{46,50},{0,0},{0,0},{0,0}} },
            { "of the Panacea", 64, 500, 1, {{51,55},{0,0},{0,0},{0,0}} },
            { "of the Antidote", 76, 500, 1, {{56,60},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 402: {
            const ModifierTierData all_tiers[] = {
            { "of Damping", 21, 500, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Quashing", 37, 500, 1, {{41,45},{0,0},{0,0},{0,0}} },
            { "of Quelling", 50, 500, 1, {{46,50},{0,0},{0,0},{0,0}} },
            { "of Quenching", 64, 500, 1, {{51,55},{0,0},{0,0},{0,0}} },
            { "of Dousing", 76, 500, 1, {{56,60},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 403: {
            const ModifierTierData all_tiers[] = {
            { "of Covering", 1, 500, 1, {{14,19},{0,0},{0,0},{0,0}} },
            { "of Sheathing", 16, 500, 1, {{20,25},{0,0},{0,0},{0,0}} },
            { "of Lining", 36, 500, 1, {{26,31},{0,0},{0,0},{0,0}} },
            { "of Padding", 48, 500, 1, {{32,37},{0,0},{0,0},{0,0}} },
            { "of Furring", 66, 500, 1, {{38,43},{0,0},{0,0},{0,0}} },
            { "of Thermokryptance", 81, 500, 1, {{44,50},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 404: {
            const ModifierTierData all_tiers[] = {
            { "of Deflecting", 1, 500, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Bending", 16, 500, 1, {{12,14},{0,0},{0,0},{0,0}} },
            { "of Curvation", 36, 500, 1, {{15,17},{0,0},{0,0},{0,0}} },
            { "of Diversion", 48, 500, 1, {{18,20},{0,0},{0,0},{0,0}} },
            { "of Flexure", 66, 500, 1, {{21,23},{0,0},{0,0},{0,0}} },
            { "of Warping", 81, 500, 1, {{24,26},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 405: {
            const ModifierTierData all_tiers[] = {
            { "of Impatience", 1, 500, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of Restlessness", 16, 500, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Fretfulness", 36, 500, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Motivation", 48, 500, 1, {{41,45},{0,0},{0,0},{0,0}} },
            { "of Excitement", 66, 500, 1, {{46,50},{0,0},{0,0},{0,0}} },
            { "of Anticipation", 81, 500, 1, {{51,55},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 406: {
            const ModifierTierData all_tiers[] = {
            { "Hale", 1, 1000, 1, {{10,19},{0,0},{0,0},{0,0}} },
            { "Healthy", 6, 1000, 1, {{20,29},{0,0},{0,0},{0,0}} },
            { "Sanguine", 16, 1000, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Stalwart", 24, 1000, 1, {{40,59},{0,0},{0,0},{0,0}} },
            { "Stout", 33, 1000, 1, {{60,69},{0,0},{0,0},{0,0}} },
            { "Robust", 38, 1000, 1, {{70,84},{0,0},{0,0},{0,0}} },
            { "Rotund", 46, 1000, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Virile", 54, 1000, 1, {{100,119},{0,0},{0,0},{0,0}} },
            { "Athlete's", 60, 1000, 1, {{120,149},{0,0},{0,0},{0,0}} },
            { "Fecund", 65, 1000, 1, {{150,174},{0,0},{0,0},{0,0}} },
            { "Vigorous", 70, 1000, 1, {{175,189},{0,0},{0,0},{0,0}} },
            { "Rapturous", 75, 1000, 1, {{190,199},{0,0},{0,0},{0,0}} },
            { "Prime", 80, 1000, 1, {{200,214},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 407: {
            const ModifierTierData all_tiers[] = {
            { "Lacquered", 1, 1000, 1, {{16,27},{0,0},{0,0},{0,0}} },
            { "Studded", 8, 1000, 1, {{28,50},{0,0},{0,0},{0,0}} },
            { "Ribbed", 16, 1000, 1, {{51,68},{0,0},{0,0},{0,0}} },
            { "Fortified", 25, 1000, 1, {{69,82},{0,0},{0,0},{0,0}} },
            { "Plated", 33, 1000, 1, {{83,102},{0,0},{0,0},{0,0}} },
            { "Carapaced", 46, 1000, 1, {{103,122},{0,0},{0,0},{0,0}} },
            { "Encased", 54, 1000, 1, {{123,160},{0,0},{0,0},{0,0}} },
            { "Enveloped", 60, 1000, 1, {{161,202},{0,0},{0,0},{0,0}} },
            { "Abating", 65, 1000, 1, {{203,225},{0,0},{0,0},{0,0}} },
            { "Unmoving", 75, 1000, 1, {{226,256},{0,0},{0,0},{0,0}} },
            { "Impervious", 79, 1000, 1, {{257,276},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 408: {
            const ModifierTierData all_tiers[] = {
            { "Agile", 1, 1000, 1, {{11,18},{0,0},{0,0},{0,0}} },
            { "Dancer's", 8, 1000, 1, {{19,39},{0,0},{0,0},{0,0}} },
            { "Acrobat's", 16, 1000, 1, {{40,56},{0,0},{0,0},{0,0}} },
            { "Fleet", 25, 1000, 1, {{57,70},{0,0},{0,0},{0,0}} },
            { "Blurred", 33, 1000, 1, {{71,88},{0,0},{0,0},{0,0}} },
            { "Phased", 46, 1000, 1, {{89,107},{0,0},{0,0},{0,0}} },
            { "Vaporous", 54, 1000, 1, {{108,142},{0,0},{0,0},{0,0}} },
            { "Elusory", 60, 1000, 1, {{143,181},{0,0},{0,0},{0,0}} },
            { "Adroit", 65, 1000, 1, {{182,204},{0,0},{0,0},{0,0}} },
            { "Lissome", 75, 1000, 1, {{205,232},{0,0},{0,0},{0,0}} },
            { "Fugitive", 79, 1000, 1, {{233,251},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 409: {
            const ModifierTierData all_tiers[] = {
            { "Shining", 1, 1000, 1, {{10,17},{0,0},{0,0},{0,0}} },
            { "Glimmering", 8, 1000, 1, {{18,24},{0,0},{0,0},{0,0}} },
            { "Glittering", 16, 1000, 1, {{25,30},{0,0},{0,0},{0,0}} },
            { "Glowing", 25, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "Radiating", 33, 1000, 1, {{36,41},{0,0},{0,0},{0,0}} },
            { "Pulsing", 46, 1000, 1, {{42,47},{0,0},{0,0},{0,0}} },
            { "Blazing", 54, 1000, 1, {{48,60},{0,0},{0,0},{0,0}} },
            { "Dazzling", 60, 1000, 1, {{61,73},{0,0},{0,0},{0,0}} },
            { "Scintillating", 65, 1000, 1, {{74,80},{0,0},{0,0},{0,0}} },
            { "Incandescent", 70, 1000, 1, {{81,90},{0,0},{0,0},{0,0}} },
            { "Resplendent", 79, 1000, 1, {{91,96},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 410: {
            const ModifierTierData all_tiers[] = {
            { "Reinforced", 2, 1000, 1, {{15,26},{0,0},{0,0},{0,0}} },
            { "Layered", 16, 1000, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Lobstered", 35, 1000, 1, {{43,55},{0,0},{0,0},{0,0}} },
            { "Buttressed", 46, 1000, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Thickened", 54, 1000, 1, {{68,79},{0,0},{0,0},{0,0}} },
            { "Girded", 60, 1000, 1, {{80,91},{0,0},{0,0},{0,0}} },
            { "Impregnable", 65, 1000, 1, {{92,100},{0,0},{0,0},{0,0}} },
            { "Impenetrable", 75, 1000, 1, {{101,110},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 411: {
            const ModifierTierData all_tiers[] = {
            { "Shade's", 2, 1000, 1, {{15,26},{0,0},{0,0},{0,0}} },
            { "Ghost's", 16, 1000, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Spectre's", 33, 1000, 1, {{43,55},{0,0},{0,0},{0,0}} },
            { "Wraith's", 46, 1000, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Phantasm's", 54, 1000, 1, {{68,79},{0,0},{0,0},{0,0}} },
            { "Nightmare's", 60, 1000, 1, {{80,91},{0,0},{0,0},{0,0}} },
            { "Mirage's", 65, 1000, 1, {{92,100},{0,0},{0,0},{0,0}} },
            { "Illusion's", 75, 1000, 1, {{101,110},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 412: {
            const ModifierTierData all_tiers[] = {
            { "Protective", 2, 1000, 1, {{15,26},{0,0},{0,0},{0,0}} },
            { "Strong-Willed", 16, 1000, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Resolute", 33, 1000, 1, {{43,55},{0,0},{0,0},{0,0}} },
            { "Fearless", 46, 1000, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Dauntless", 54, 1000, 1, {{68,79},{0,0},{0,0},{0,0}} },
            { "Indomitable", 60, 1000, 1, {{80,91},{0,0},{0,0},{0,0}} },
            { "Unassailable", 65, 1000, 1, {{92,100},{0,0},{0,0},{0,0}} },
            { "Unfaltering", 75, 1000, 1, {{101,110},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 413: {
            const ModifierTierData all_tiers[] = {
            { "Oyster's", 8, 1000, 2, {{6,13},{7,10},{0,0},{0,0}} },
            { "Lobster's", 16, 1000, 2, {{14,20},{11,19},{0,0},{0,0}} },
            { "Urchin's", 33, 1000, 2, {{21,26},{20,25},{0,0},{0,0}} },
            { "Nautilus'", 46, 1000, 2, {{27,32},{26,32},{0,0},{0,0}} },
            { "Octopus'", 60, 1000, 2, {{33,38},{33,41},{0,0},{0,0}} },
            { "Crocodile's", 78, 1000, 2, {{39,42},{42,49},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 414: {
            const ModifierTierData all_tiers[] = {
            { "Flea's", 8, 1000, 2, {{6,13},{7,10},{0,0},{0,0}} },
            { "Fawn's", 16, 1000, 2, {{14,20},{11,19},{0,0},{0,0}} },
            { "Mouflon's", 33, 1000, 2, {{21,26},{20,25},{0,0},{0,0}} },
            { "Ram's", 46, 1000, 2, {{27,32},{26,32},{0,0},{0,0}} },
            { "Ibex's", 60, 1000, 2, {{33,38},{33,41},{0,0},{0,0}} },
            { "Stag's", 78, 1000, 2, {{39,42},{42,49},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 415: {
            const ModifierTierData all_tiers[] = {
            { "Monk's", 8, 1000, 2, {{6,13},{7,10},{0,0},{0,0}} },
            { "Prior's", 16, 1000, 2, {{14,20},{11,19},{0,0},{0,0}} },
            { "Abbot's", 33, 1000, 2, {{21,26},{20,25},{0,0},{0,0}} },
            { "Bishop's", 46, 1000, 2, {{27,32},{26,32},{0,0},{0,0}} },
            { "Exarch's", 60, 1000, 2, {{33,38},{33,41},{0,0},{0,0}} },
            { "Pope's", 78, 1000, 2, {{39,42},{42,49},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 416: {
            const ModifierTierData all_tiers[] = {
            { "Abalone's", 8, 1000, 2, {{7,11},{6,13},{0,0},{0,0}} },
            { "Snail's", 16, 1000, 2, {{12,29},{14,20},{0,0},{0,0}} },
            { "Tortoise's", 33, 1000, 2, {{30,39},{21,26},{0,0},{0,0}} },
            { "Pangolin's", 46, 1000, 2, {{40,53},{27,32},{0,0},{0,0}} },
            { "Shelled", 60, 1000, 2, {{54,69},{33,38},{0,0},{0,0}} },
            { "Hardened", 78, 1000, 2, {{70,86},{39,42},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 417: {
            const ModifierTierData all_tiers[] = {
            { "Impala's", 8, 1000, 2, {{5,8},{6,13},{0,0},{0,0}} },
            { "Buck's", 16, 1000, 2, {{9,24},{14,20},{0,0},{0,0}} },
            { "Moose's", 33, 1000, 2, {{25,34},{21,26},{0,0},{0,0}} },
            { "Deer's", 46, 1000, 2, {{35,47},{27,32},{0,0},{0,0}} },
            { "Caribou's", 60, 1000, 2, {{48,62},{33,38},{0,0},{0,0}} },
            { "Antelope's", 78, 1000, 2, {{63,79},{39,42},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 418: {
            const ModifierTierData all_tiers[] = {
            { "Deacon's", 8, 1000, 2, {{4,7},{6,13},{0,0},{0,0}} },
            { "Cardinal's", 16, 1000, 2, {{8,13},{14,20},{0,0},{0,0}} },
            { "Priest's", 33, 1000, 2, {{14,16},{21,26},{0,0},{0,0}} },
            { "High Priest's", 46, 1000, 2, {{17,20},{27,32},{0,0},{0,0}} },
            { "Archon's", 60, 1000, 2, {{21,25},{33,38},{0,0},{0,0}} },
            { "Divine", 78, 1000, 2, {{26,30},{39,42},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 419: {
            const ModifierTierData all_tiers[] = {
            { "Thorny", 1, 1000, 2, {{1,2},{3,4},{0,0},{0,0}} },
            { "Spiny", 10, 1000, 2, {{5,7},{7,10},{0,0},{0,0}} },
            { "Barbed", 19, 1000, 2, {{11,16},{15,23},{0,0},{0,0}} },
            { "Pointed", 38, 1000, 2, {{24,35},{35,53},{0,0},{0,0}} },
            { "Spiked", 48, 1000, 2, {{40,60},{61,92},{0,0},{0,0}} },
            { "Edged", 63, 1000, 2, {{64,97},{97,145},{0,0},{0,0}} },
            { "Jagged", 74, 1000, 2, {{101,151},{146,220},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 420: {
            const ModifierTierData all_tiers[] = {
            { "Lady's", 16, 500, 1, {{30,33},{0,0},{0,0},{0,0}} },
            { "Baronness'", 25, 500, 1, {{34,37},{0,0},{0,0},{0,0}} },
            { "Viscountess'", 33, 500, 1, {{38,42},{0,0},{0,0},{0,0}} },
            { "Marchioness'", 46, 500, 1, {{43,46},{0,0},{0,0},{0,0}} },
            { "Countess'", 54, 400, 1, {{47,50},{0,0},{0,0},{0,0}} },
            { "Duchess'", 60, 300, 1, {{51,53},{0,0},{0,0},{0,0}} },
            { "Princess'", 65, 200, 1, {{54,56},{0,0},{0,0},{0,0}} },
            { "Queen's", 78, 100, 1, {{57,61},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 421: {
            const ModifierTierData all_tiers[] = {
            { "of the Brute", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Wrestler", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Bear", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Lion", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Gorilla", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Goliath", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Leviathan", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Titan", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 422: {
            const ModifierTierData all_tiers[] = {
            { "of the Mongoose", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Lynx", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Fox", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Falcon", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Panther", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Leopard", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Jaguar", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Phantom", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 423: {
            const ModifierTierData all_tiers[] = {
            { "of the Pupil", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Student", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Prodigy", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Augur", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Philosopher", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Sage", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Savant", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Virtuoso", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 424: {
            const ModifierTierData all_tiers[] = {
            { "of the Whelpling", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Salamander", 12, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Drake", 24, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Kiln", 36, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Furnace", 48, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Volcano", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Magma", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Tzteosh", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 425: {
            const ModifierTierData all_tiers[] = {
            { "of the Seal", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Penguin", 14, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Narwhal", 26, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Yeti", 38, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Walrus", 50, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Polar Bear", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Ice", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Haast", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 426: {
            const ModifierTierData all_tiers[] = {
            { "of the Cloud", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Squall", 13, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Storm", 25, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Thunderhead", 37, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Tempest", 49, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Maelstrom", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Lightning", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Ephij", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 427: {
            const ModifierTierData all_tiers[] = {
            { "of the Lost", 16, 250, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "of Banishment", 30, 250, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Eviction", 44, 250, 1, {{12,15},{0,0},{0,0},{0,0}} },
            { "of Expulsion", 56, 250, 1, {{16,19},{0,0},{0,0},{0,0}} },
            { "of Exile", 68, 250, 1, {{20,23},{0,0},{0,0},{0,0}} },
            { "of Bameth", 81, 250, 1, {{24,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 428: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 900, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 900, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 900, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 900, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 900, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 429: {
            const ModifierTierData all_tiers[] = {
            { "of Thick Skin", 1, 800, 1, {{6,11},{0,0},{0,0},{0,0}} },
            { "of Reinforced Skin", 8, 800, 1, {{12,29},{0,0},{0,0},{0,0}} },
            { "of Stone Skin", 15, 800, 1, {{30,49},{0,0},{0,0},{0,0}} },
            { "of Iron Skin", 22, 800, 1, {{50,72},{0,0},{0,0},{0,0}} },
            { "of Steel Skin", 29, 800, 1, {{73,97},{0,0},{0,0},{0,0}} },
            { "of Granite Skin", 36, 800, 1, {{98,124},{0,0},{0,0},{0,0}} },
            { "of Platinum Skin", 45, 800, 1, {{125,163},{0,0},{0,0},{0,0}} },
            { "of Adamantite Skin", 54, 800, 1, {{164,206},{0,0},{0,0},{0,0}} },
            { "of Corundum Skin", 63, 800, 1, {{207,253},{0,0},{0,0},{0,0}} },
            { "of Obsidian Skin", 72, 800, 1, {{254,304},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 430: {
            const ModifierTierData all_tiers[] = {
            { "of the Newt", 1, 1000, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "of the Lizard", 5, 1000, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of the Flatworm", 11, 1000, 1, {{3,4},{0,0},{0,0},{0,0}} },
            { "of the Starfish", 17, 1000, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of the Hydra", 26, 1000, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of the Troll", 35, 1000, 1, {{9,13},{0,0},{0,0},{0,0}} },
            { "of Convalescence", 47, 1000, 1, {{13,18},{0,0},{0,0},{0,0}} },
            { "of Recuperation", 58, 1000, 1, {{18,23},{0,0},{0,0},{0,0}} },
            { "of Resurgence", 68, 1000, 1, {{23,29},{0,0},{0,0},{0,0}} },
            { "of Immortality", 75, 1000, 1, {{29,33},{0,0},{0,0},{0,0}} },
            { "of the Phoenix", 81, 1000, 1, {{33,36},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 431: {
            const ModifierTierData all_tiers[] = {
            { "of Sealing", 21, 500, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Alleviation", 37, 500, 1, {{41,45},{0,0},{0,0},{0,0}} },
            { "of Allaying", 50, 500, 1, {{46,50},{0,0},{0,0},{0,0}} },
            { "of Assuaging", 64, 500, 1, {{51,55},{0,0},{0,0},{0,0}} },
            { "of Staunching", 76, 500, 1, {{56,60},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 432: {
            const ModifierTierData all_tiers[] = {
            { "of the Antitoxin", 21, 500, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of the Remedy", 37, 500, 1, {{41,45},{0,0},{0,0},{0,0}} },
            { "of the Cure", 50, 500, 1, {{46,50},{0,0},{0,0},{0,0}} },
            { "of the Panacea", 64, 500, 1, {{51,55},{0,0},{0,0},{0,0}} },
            { "of the Antidote", 76, 500, 1, {{56,60},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 433: {
            const ModifierTierData all_tiers[] = {
            { "of Damping", 21, 500, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Quashing", 37, 500, 1, {{41,45},{0,0},{0,0},{0,0}} },
            { "of Quelling", 50, 500, 1, {{46,50},{0,0},{0,0},{0,0}} },
            { "of Quenching", 64, 500, 1, {{51,55},{0,0},{0,0},{0,0}} },
            { "of Dousing", 76, 500, 1, {{56,60},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 434: {
            const ModifierTierData all_tiers[] = {
            { "of Covering", 1, 1000, 1, {{14,19},{0,0},{0,0},{0,0}} },
            { "of Sheathing", 16, 1000, 1, {{20,25},{0,0},{0,0},{0,0}} },
            { "of Lining", 36, 1000, 1, {{26,31},{0,0},{0,0},{0,0}} },
            { "of Padding", 48, 1000, 1, {{32,37},{0,0},{0,0},{0,0}} },
            { "of Furring", 66, 1000, 1, {{38,43},{0,0},{0,0},{0,0}} },
            { "of Thermokryptance", 81, 1000, 1, {{44,50},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 435: {
            const ModifierTierData all_tiers[] = {
            { "of Deflecting", 1, 1000, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Bending", 16, 1000, 1, {{12,14},{0,0},{0,0},{0,0}} },
            { "of Curvation", 36, 1000, 1, {{15,17},{0,0},{0,0},{0,0}} },
            { "of Diversion", 48, 1000, 1, {{18,20},{0,0},{0,0},{0,0}} },
            { "of Flexure", 66, 1000, 1, {{21,23},{0,0},{0,0},{0,0}} },
            { "of Warping", 81, 1000, 1, {{24,26},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 436: {
            const ModifierTierData all_tiers[] = {
            { "of Impatience", 1, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of Restlessness", 16, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Fretfulness", 36, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Motivation", 48, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            { "of Excitement", 66, 1000, 1, {{46,50},{0,0},{0,0},{0,0}} },
            { "of Anticipation", 81, 1000, 1, {{51,55},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 437: {
            const ModifierTierData all_tiers[] = {
            { "Hale", 1, 1000, 1, {{10,19},{0,0},{0,0},{0,0}} },
            { "Healthy", 6, 1000, 1, {{20,29},{0,0},{0,0},{0,0}} },
            { "Sanguine", 16, 1000, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Stalwart", 24, 1000, 1, {{40,59},{0,0},{0,0},{0,0}} },
            { "Stout", 33, 1000, 1, {{60,69},{0,0},{0,0},{0,0}} },
            { "Robust", 38, 1000, 1, {{70,84},{0,0},{0,0},{0,0}} },
            { "Rotund", 46, 1000, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Virile", 54, 1000, 1, {{100,119},{0,0},{0,0},{0,0}} },
            { "Athlete's", 60, 1000, 1, {{120,149},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 438: {
            const ModifierTierData all_tiers[] = {
            { "Beryl", 1, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "Cobalt", 6, 1000, 1, {{15,24},{0,0},{0,0},{0,0}} },
            { "Azure", 16, 1000, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Teal", 25, 1000, 1, {{35,54},{0,0},{0,0},{0,0}} },
            { "Cerulean", 33, 1000, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Aqua", 38, 1000, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Opalescent", 46, 1000, 1, {{80,89},{0,0},{0,0},{0,0}} },
            { "Gentian", 54, 1000, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Chalybeous", 60, 1000, 1, {{105,124},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 439: {
            const ModifierTierData all_tiers[] = {
            { "Lacquered", 1, 1000, 1, {{16,27},{0,0},{0,0},{0,0}} },
            { "Studded", 8, 1000, 1, {{28,50},{0,0},{0,0},{0,0}} },
            { "Ribbed", 16, 1000, 1, {{51,68},{0,0},{0,0},{0,0}} },
            { "Fortified", 25, 1000, 1, {{69,82},{0,0},{0,0},{0,0}} },
            { "Plated", 33, 1000, 1, {{83,102},{0,0},{0,0},{0,0}} },
            { "Carapaced", 46, 1000, 1, {{103,122},{0,0},{0,0},{0,0}} },
            { "Encased", 54, 1000, 1, {{123,160},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 440: {
            const ModifierTierData all_tiers[] = {
            { "Agile", 1, 1000, 1, {{11,18},{0,0},{0,0},{0,0}} },
            { "Dancer's", 8, 1000, 1, {{19,39},{0,0},{0,0},{0,0}} },
            { "Acrobat's", 16, 1000, 1, {{40,56},{0,0},{0,0},{0,0}} },
            { "Fleet", 25, 1000, 1, {{57,70},{0,0},{0,0},{0,0}} },
            { "Blurred", 33, 1000, 1, {{71,88},{0,0},{0,0},{0,0}} },
            { "Phased", 46, 1000, 1, {{89,107},{0,0},{0,0},{0,0}} },
            { "Vaporous", 54, 1000, 1, {{108,142},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 441: {
            const ModifierTierData all_tiers[] = {
            { "Shining", 1, 1000, 1, {{10,17},{0,0},{0,0},{0,0}} },
            { "Glimmering", 8, 1000, 1, {{18,24},{0,0},{0,0},{0,0}} },
            { "Glittering", 16, 1000, 1, {{25,30},{0,0},{0,0},{0,0}} },
            { "Glowing", 25, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "Radiating", 33, 1000, 1, {{36,41},{0,0},{0,0},{0,0}} },
            { "Pulsing", 46, 1000, 1, {{42,47},{0,0},{0,0},{0,0}} },
            { "Blazing", 54, 1000, 1, {{48,60},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 442: {
            const ModifierTierData all_tiers[] = {
            { "Reinforced", 2, 1000, 1, {{15,26},{0,0},{0,0},{0,0}} },
            { "Layered", 16, 1000, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Lobstered", 35, 1000, 1, {{43,55},{0,0},{0,0},{0,0}} },
            { "Buttressed", 46, 1000, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Thickened", 54, 1000, 1, {{68,79},{0,0},{0,0},{0,0}} },
            { "Girded", 60, 1000, 1, {{80,91},{0,0},{0,0},{0,0}} },
            { "Impregnable", 65, 1000, 1, {{92,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 443: {
            const ModifierTierData all_tiers[] = {
            { "Shade's", 2, 1000, 1, {{15,26},{0,0},{0,0},{0,0}} },
            { "Ghost's", 16, 1000, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Spectre's", 33, 1000, 1, {{43,55},{0,0},{0,0},{0,0}} },
            { "Wraith's", 46, 1000, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Phantasm's", 54, 1000, 1, {{68,79},{0,0},{0,0},{0,0}} },
            { "Nightmare's", 60, 1000, 1, {{80,91},{0,0},{0,0},{0,0}} },
            { "Mirage's", 65, 1000, 1, {{92,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 444: {
            const ModifierTierData all_tiers[] = {
            { "Protective", 2, 1000, 1, {{15,26},{0,0},{0,0},{0,0}} },
            { "Strong-Willed", 16, 1000, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Resolute", 33, 1000, 1, {{43,55},{0,0},{0,0},{0,0}} },
            { "Fearless", 46, 1000, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Dauntless", 54, 1000, 1, {{68,79},{0,0},{0,0},{0,0}} },
            { "Indomitable", 60, 1000, 1, {{80,91},{0,0},{0,0},{0,0}} },
            { "Unassailable", 65, 1000, 1, {{92,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 445: {
            const ModifierTierData all_tiers[] = {
            { "Oyster's", 8, 1000, 2, {{6,13},{7,10},{0,0},{0,0}} },
            { "Lobster's", 16, 1000, 2, {{14,20},{11,19},{0,0},{0,0}} },
            { "Urchin's", 33, 1000, 2, {{21,26},{20,25},{0,0},{0,0}} },
            { "Nautilus'", 46, 1000, 2, {{27,32},{26,32},{0,0},{0,0}} },
            { "Octopus'", 60, 1000, 2, {{33,38},{33,41},{0,0},{0,0}} },
            { "Crocodile's", 78, 1000, 2, {{39,42},{42,49},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 446: {
            const ModifierTierData all_tiers[] = {
            { "Flea's", 8, 1000, 2, {{6,13},{7,10},{0,0},{0,0}} },
            { "Fawn's", 16, 1000, 2, {{14,20},{11,19},{0,0},{0,0}} },
            { "Mouflon's", 33, 1000, 2, {{21,26},{20,25},{0,0},{0,0}} },
            { "Ram's", 46, 1000, 2, {{27,32},{26,32},{0,0},{0,0}} },
            { "Ibex's", 60, 1000, 2, {{33,38},{33,41},{0,0},{0,0}} },
            { "Stag's", 78, 1000, 2, {{39,42},{42,49},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 447: {
            const ModifierTierData all_tiers[] = {
            { "Monk's", 8, 1000, 2, {{6,13},{7,10},{0,0},{0,0}} },
            { "Prior's", 16, 1000, 2, {{14,20},{11,19},{0,0},{0,0}} },
            { "Abbot's", 33, 1000, 2, {{21,26},{20,25},{0,0},{0,0}} },
            { "Bishop's", 46, 1000, 2, {{27,32},{26,32},{0,0},{0,0}} },
            { "Exarch's", 60, 1000, 2, {{33,38},{33,41},{0,0},{0,0}} },
            { "Pope's", 78, 1000, 2, {{39,42},{42,49},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 448: {
            const ModifierTierData all_tiers[] = {
            { "Glinting", 1, 1000, 2, {{1,2},{3,3},{0,0},{0,0}} },
            { "Burnished", 8, 1000, 2, {{2,3},{4,6},{0,0},{0,0}} },
            { "Polished", 16, 1000, 2, {{2,4},{5,8},{0,0},{0,0}} },
            { "Honed", 33, 1000, 2, {{4,6},{8,11},{0,0},{0,0}} },
            { "Gleaming", 46, 1000, 2, {{5,7},{9,13},{0,0},{0,0}} },
            { "Annealed", 54, 1000, 2, {{6,10},{12,17},{0,0},{0,0}} },
            { "Razor-sharp", 60, 800, 2, {{7,11},{14,20},{0,0},{0,0}} },
            { "Tempered", 65, 600, 2, {{10,15},{18,26},{0,0},{0,0}} },
            { "Flaring", 75, 400, 2, {{12,19},{22,32},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 449: {
            const ModifierTierData all_tiers[] = {
            { "Heated", 1, 500, 2, {{1,2},{3,3},{0,0},{0,0}} },
            { "Smouldering", 8, 500, 2, {{3,5},{6,9},{0,0},{0,0}} },
            { "Smoking", 16, 500, 2, {{6,8},{10,13},{0,0},{0,0}} },
            { "Burning", 33, 500, 2, {{9,11},{14,17},{0,0},{0,0}} },
            { "Flaming", 46, 500, 2, {{12,13},{18,20},{0,0},{0,0}} },
            { "Scorching", 54, 500, 2, {{11,16},{21,26},{0,0},{0,0}} },
            { "Incinerating", 60, 400, 2, {{13,19},{27,32},{0,0},{0,0}} },
            { "Blasting", 65, 300, 2, {{20,24},{33,36},{0,0},{0,0}} },
            { "Cremating", 75, 200, 2, {{25,29},{37,45},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 450: {
            const ModifierTierData all_tiers[] = {
            { "Frosted", 1, 500, 2, {{1,1},{2,3},{0,0},{0,0}} },
            { "Chilled", 8, 500, 2, {{3,4},{5,8},{0,0},{0,0}} },
            { "Icy", 16, 500, 2, {{5,6},{9,11},{0,0},{0,0}} },
            { "Frigid", 33, 500, 2, {{7,8},{12,14},{0,0},{0,0}} },
            { "Freezing", 46, 500, 2, {{9,10},{15,17},{0,0},{0,0}} },
            { "Frozen", 54, 500, 2, {{11,13},{18,21},{0,0},{0,0}} },
            { "Glaciated", 60, 400, 2, {{14,15},{22,24},{0,0},{0,0}} },
            { "Polar", 65, 300, 2, {{16,20},{25,31},{0,0},{0,0}} },
            { "Entombing", 75, 200, 2, {{21,24},{32,37},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 451: {
            const ModifierTierData all_tiers[] = {
            { "Humming", 1, 500, 2, {{1,1},{4,6},{0,0},{0,0}} },
            { "Buzzing", 8, 500, 2, {{1,1},{10,15},{0,0},{0,0}} },
            { "Snapping", 16, 500, 2, {{1,1},{16,22},{0,0},{0,0}} },
            { "Crackling", 33, 500, 2, {{1,1},{23,27},{0,0},{0,0}} },
            { "Sparking", 46, 500, 2, {{1,1},{28,32},{0,0},{0,0}} },
            { "Arcing", 54, 500, 2, {{1,2},{33,40},{0,0},{0,0}} },
            { "Shocking", 60, 400, 2, {{1,2},{41,47},{0,0},{0,0}} },
            { "Discharging", 65, 300, 2, {{1,3},{48,59},{0,0},{0,0}} },
            { "Electrocuting", 75, 200, 2, {{1,4},{60,71},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 452: {
            const ModifierTierData all_tiers[] = {
            { "Precise", 1, 800, 1, {{11,32},{0,0},{0,0},{0,0}} },
            { "Reliable", 11, 800, 1, {{33,60},{0,0},{0,0},{0,0}} },
            { "Focused", 18, 800, 1, {{61,84},{0,0},{0,0},{0,0}} },
            { "Deliberate", 26, 800, 1, {{85,123},{0,0},{0,0},{0,0}} },
            { "Consistent", 36, 800, 1, {{124,167},{0,0},{0,0},{0,0}} },
            { "Steady", 48, 800, 1, {{168,236},{0,0},{0,0},{0,0}} },
            { "Hunter's", 58, 800, 1, {{237,346},{0,0},{0,0},{0,0}} },
            { "Ranger's", 67, 400, 1, {{347,450},{0,0},{0,0},{0,0}} },
            { "Amazon's", 76, 200, 1, {{451,550},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 453: {
            const ModifierTierData all_tiers[] = {
            { "of the Brute", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Wrestler", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Bear", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Lion", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Gorilla", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Goliath", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Leviathan", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Titan", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 454: {
            const ModifierTierData all_tiers[] = {
            { "of the Mongoose", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Lynx", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Fox", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Falcon", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Panther", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Leopard", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Jaguar", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Phantom", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            { "of the Wind", 81, 1000, 1, {{34,36},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 455: {
            const ModifierTierData all_tiers[] = {
            { "of the Pupil", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Student", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Prodigy", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Augur", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Philosopher", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Sage", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Savant", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Virtuoso", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 456: {
            const ModifierTierData all_tiers[] = {
            { "of the Whelpling", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Salamander", 12, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Drake", 24, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Kiln", 36, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Furnace", 48, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Volcano", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Magma", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Tzteosh", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 457: {
            const ModifierTierData all_tiers[] = {
            { "of the Seal", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Penguin", 14, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Narwhal", 26, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Yeti", 38, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Walrus", 50, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Polar Bear", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Ice", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Haast", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 458: {
            const ModifierTierData all_tiers[] = {
            { "of the Cloud", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Squall", 13, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Storm", 25, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Thunderhead", 37, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Tempest", 49, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Maelstrom", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Lightning", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Ephij", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 459: {
            const ModifierTierData all_tiers[] = {
            { "of the Lost", 16, 250, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "of Banishment", 30, 250, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Eviction", 44, 250, 1, {{12,15},{0,0},{0,0},{0,0}} },
            { "of Expulsion", 56, 250, 1, {{16,19},{0,0},{0,0},{0,0}} },
            { "of Exile", 68, 250, 1, {{20,23},{0,0},{0,0},{0,0}} },
            { "of Bameth", 81, 250, 1, {{24,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 460: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 700, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 700, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 700, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 700, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 700, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 461: {
            const ModifierTierData all_tiers[] = {
            { "of Combat", 5, 500, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Dueling", 41, 250, 1, {{2,2},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 462: {
            const ModifierTierData all_tiers[] = {
            { "of the Parasite", 21, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            { "of the Locust", 38, 1000, 1, {{6,6},{0,0},{0,0},{0,0}} },
            { "of the Remora", 54, 1000, 1, {{7,7},{0,0},{0,0},{0,0}} },
            { "of the Lamprey", 68, 1000, 1, {{8,8},{0,0},{0,0},{0,0}} },
            { "of the Vampire", 81, 1000, 1, {{9,9},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 463: {
            const ModifierTierData all_tiers[] = {
            { "of the Thirsty", 21, 1000, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of the Parched", 38, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            { "of the Arid", 54, 1000, 1, {{6,6},{0,0},{0,0},{0,0}} },
            { "of the Drought", 68, 1000, 1, {{7,7},{0,0},{0,0},{0,0}} },
            { "of the Desperate", 81, 1000, 1, {{8,8},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 464: {
            const ModifierTierData all_tiers[] = {
            { "of Success", 1, 750, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of Victory", 11, 750, 1, {{7,9},{0,0},{0,0},{0,0}} },
            { "of Triumph", 22, 750, 1, {{10,18},{0,0},{0,0},{0,0}} },
            { "of Conquest", 33, 750, 1, {{19,28},{0,0},{0,0},{0,0}} },
            { "of Vanquishing", 44, 750, 1, {{29,40},{0,0},{0,0},{0,0}} },
            { "of Valour", 55, 750, 1, {{41,53},{0,0},{0,0},{0,0}} },
            { "of Glory", 66, 750, 1, {{54,68},{0,0},{0,0},{0,0}} },
            { "of Legend", 77, 750, 1, {{69,84},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 465: {
            const ModifierTierData all_tiers[] = {
            { "of Absorption", 1, 750, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of Osmosis", 12, 750, 1, {{4,5},{0,0},{0,0},{0,0}} },
            { "of Infusion", 23, 750, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of Enveloping", 34, 750, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Consumption", 45, 750, 1, {{15,20},{0,0},{0,0},{0,0}} },
            { "of Siphoning", 56, 750, 1, {{21,27},{0,0},{0,0},{0,0}} },
            { "of Devouring", 67, 750, 1, {{28,35},{0,0},{0,0},{0,0}} },
            { "of Assimilation", 78, 750, 1, {{36,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 466: {
            const ModifierTierData all_tiers[] = {
            { "of Rejuvenation", 8, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Restoration", 20, 1000, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Regrowth", 30, 1000, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of Nourishment", 40, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 467: {
            const ModifierTierData all_tiers[] = {
            { "of Skill", 1, 500, 1, {{5,7},{0,0},{0,0},{0,0}} },
            { "of Ease", 22, 500, 1, {{8,10},{0,0},{0,0},{0,0}} },
            { "of Mastery", 37, 500, 1, {{11,13},{0,0},{0,0},{0,0}} },
            { "of Renown", 60, 500, 1, {{14,16},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 468: {
            const ModifierTierData all_tiers[] = {
            { "of Ire", 8, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Anger", 21, 1000, 1, {{15,19},{0,0},{0,0},{0,0}} },
            { "of Rage", 31, 1000, 1, {{20,24},{0,0},{0,0},{0,0}} },
            { "of Fury", 45, 500, 1, {{25,29},{0,0},{0,0},{0,0}} },
            { "of Ferocity", 59, 250, 1, {{30,34},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 469: {
            const ModifierTierData all_tiers[] = {
            { "of Plunder", 3, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of Raiding", 24, 1000, 1, {{11,14},{0,0},{0,0},{0,0}} },
            { "of Archaeology", 40, 1000, 1, {{15,18},{0,0},{0,0},{0,0}} },
            { "of Excavation", 63, 1000, 1, {{19,21},{0,0},{0,0},{0,0}} },
            { "of Windfall", 75, 1000, 1, {{22,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 470: {
            const ModifierTierData all_tiers[] = {
            { "of Covering", 1, 1000, 1, {{14,19},{0,0},{0,0},{0,0}} },
            { "of Sheathing", 16, 1000, 1, {{20,25},{0,0},{0,0},{0,0}} },
            { "of Lining", 36, 1000, 1, {{26,31},{0,0},{0,0},{0,0}} },
            { "of Padding", 48, 1000, 1, {{32,37},{0,0},{0,0},{0,0}} },
            { "of Furring", 66, 1000, 1, {{38,43},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 471: {
            const ModifierTierData all_tiers[] = {
            { "of Deflecting", 1, 1000, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Bending", 16, 1000, 1, {{12,14},{0,0},{0,0},{0,0}} },
            { "of Curvation", 36, 1000, 1, {{15,17},{0,0},{0,0},{0,0}} },
            { "of Diversion", 48, 1000, 1, {{18,20},{0,0},{0,0},{0,0}} },
            { "of Flexure", 66, 1000, 1, {{21,23},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 472: {
            const ModifierTierData all_tiers[] = {
            { "of Enlivening", 1, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of Diffusion", 16, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Dispersal", 36, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Buffering", 48, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 473: {
            const ModifierTierData all_tiers[] = {
            { "Hale", 1, 1000, 1, {{10,19},{0,0},{0,0},{0,0}} },
            { "Healthy", 6, 1000, 1, {{20,29},{0,0},{0,0},{0,0}} },
            { "Sanguine", 16, 1000, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Stalwart", 24, 1000, 1, {{40,59},{0,0},{0,0},{0,0}} },
            { "Stout", 33, 1000, 1, {{60,69},{0,0},{0,0},{0,0}} },
            { "Robust", 38, 1000, 1, {{70,84},{0,0},{0,0},{0,0}} },
            { "Rotund", 46, 1000, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Virile", 54, 1000, 1, {{100,119},{0,0},{0,0},{0,0}} },
            { "Athlete's", 60, 1000, 1, {{120,149},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 474: {
            const ModifierTierData all_tiers[] = {
            { "Beryl", 1, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "Cobalt", 6, 1000, 1, {{15,24},{0,0},{0,0},{0,0}} },
            { "Azure", 16, 1000, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Teal", 25, 1000, 1, {{35,54},{0,0},{0,0},{0,0}} },
            { "Cerulean", 33, 1000, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Aqua", 38, 1000, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Opalescent", 46, 1000, 1, {{80,89},{0,0},{0,0},{0,0}} },
            { "Gentian", 54, 1000, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Chalybeous", 60, 1000, 1, {{105,124},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 475: {
            const ModifierTierData all_tiers[] = {
            { "Supple", 1, 1000, 2, {{8,14},{6,9},{0,0},{0,0}} },
            { "Pliant", 16, 1000, 2, {{15,35},{10,30},{0,0},{0,0}} },
            { "Flexible", 33, 1000, 2, {{36,53},{31,46},{0,0},{0,0}} },
            { "Durable", 46, 1000, 2, {{54,65},{47,57},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 476: {
            const ModifierTierData all_tiers[] = {
            { "Blessed", 1, 1000, 2, {{8,14},{5,8},{0,0},{0,0}} },
            { "Anointed", 16, 1000, 2, {{15,35},{9,15},{0,0},{0,0}} },
            { "Sanctified", 33, 1000, 2, {{36,53},{16,21},{0,0},{0,0}} },
            { "Hallowed", 46, 1000, 2, {{54,65},{22,25},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 477: {
            const ModifierTierData all_tiers[] = {
            { "Will-o-wisp's", 1, 1000, 2, {{6,9},{5,8},{0,0},{0,0}} },
            { "Nymph's", 16, 1000, 2, {{10,30},{9,15},{0,0},{0,0}} },
            { "Sylph's", 33, 1000, 2, {{31,46},{16,21},{0,0},{0,0}} },
            { "Cherub's", 46, 1000, 2, {{47,57},{22,25},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 478: {
            const ModifierTierData all_tiers[] = {
            { "Scrapper's", 2, 1000, 2, {{15,26},{15,26},{0,0},{0,0}} },
            { "Brawler's", 16, 1000, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Fencer's", 33, 1000, 2, {{43,55},{43,55},{0,0},{0,0}} },
            { "Gladiator's", 46, 1000, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Duelist's", 54, 1000, 2, {{68,79},{68,79},{0,0},{0,0}} },
            { "Hero's", 60, 1000, 2, {{80,91},{80,91},{0,0},{0,0}} },
            { "Legend's", 65, 1000, 2, {{92,100},{92,100},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 479: {
            const ModifierTierData all_tiers[] = {
            { "Infixed", 2, 1000, 2, {{15,26},{15,26},{0,0},{0,0}} },
            { "Ingrained", 16, 1000, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Instilled", 33, 1000, 2, {{43,55},{43,55},{0,0},{0,0}} },
            { "Infused", 46, 1000, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Inculcated", 54, 1000, 2, {{68,79},{68,79},{0,0},{0,0}} },
            { "Interpolated", 60, 1000, 2, {{80,91},{80,91},{0,0},{0,0}} },
            { "Inspired", 65, 1000, 2, {{92,100},{92,100},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 480: {
            const ModifierTierData all_tiers[] = {
            { "Shadowy", 2, 1000, 2, {{15,26},{15,26},{0,0},{0,0}} },
            { "Ethereal", 16, 1000, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Unworldly", 33, 1000, 2, {{43,55},{43,55},{0,0},{0,0}} },
            { "Ephemeral", 46, 1000, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Evanescent", 54, 1000, 2, {{68,79},{68,79},{0,0},{0,0}} },
            { "Unreal", 60, 1000, 2, {{80,91},{80,91},{0,0},{0,0}} },
            { "Illusory", 65, 1000, 2, {{92,100},{92,100},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 481: {
            const ModifierTierData all_tiers[] = {
            { "Bully's", 8, 1000, 3, {{6,13},{6,13},{7,10},{0,0}} },
            { "Thug's", 16, 1000, 3, {{14,20},{14,20},{11,19},{0,0}} },
            { "Brute's", 33, 1000, 3, {{21,26},{21,26},{20,25},{0,0}} },
            { "Assailant's", 46, 1000, 3, {{27,32},{27,32},{26,32},{0,0}} },
            { "Aggressor's", 60, 1000, 3, {{33,38},{33,38},{33,41},{0,0}} },
            { "Predator's", 78, 1000, 3, {{39,42},{39,42},{42,49},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 482: {
            const ModifierTierData all_tiers[] = {
            { "Augur's", 8, 1000, 3, {{6,13},{6,13},{7,10},{0,0}} },
            { "Auspex's", 16, 1000, 3, {{14,20},{14,20},{11,19},{0,0}} },
            { "Druid's", 33, 1000, 3, {{21,26},{21,26},{20,25},{0,0}} },
            { "Haruspex's", 46, 1000, 3, {{27,32},{27,32},{26,32},{0,0}} },
            { "Visionary's", 60, 1000, 3, {{33,38},{33,38},{33,41},{0,0}} },
            { "Prophet's", 78, 1000, 3, {{39,42},{39,42},{42,49},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 483: {
            const ModifierTierData all_tiers[] = {
            { "Poet's", 8, 1000, 3, {{6,13},{6,13},{7,10},{0,0}} },
            { "Musician's", 16, 1000, 3, {{14,20},{14,20},{11,19},{0,0}} },
            { "Troubadour's", 33, 1000, 3, {{21,26},{21,26},{20,25},{0,0}} },
            { "Bard's", 46, 1000, 3, {{27,32},{27,32},{26,32},{0,0}} },
            { "Minstrel's", 60, 1000, 3, {{33,38},{33,38},{33,41},{0,0}} },
            { "Maestro's", 78, 1000, 3, {{39,42},{39,42},{42,49},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 484: {
            const ModifierTierData all_tiers[] = {
            { "Glinting", 1, 1000, 2, {{1,2},{3,3},{0,0},{0,0}} },
            { "Burnished", 8, 1000, 2, {{2,3},{4,6},{0,0},{0,0}} },
            { "Polished", 16, 1000, 2, {{2,4},{5,8},{0,0},{0,0}} },
            { "Honed", 33, 1000, 2, {{4,6},{8,11},{0,0},{0,0}} },
            { "Gleaming", 46, 1000, 2, {{5,7},{9,13},{0,0},{0,0}} },
            { "Annealed", 54, 1000, 2, {{6,10},{12,17},{0,0},{0,0}} },
            { "Razor-sharp", 60, 800, 2, {{7,11},{14,20},{0,0},{0,0}} },
            { "Tempered", 65, 600, 2, {{10,15},{18,26},{0,0},{0,0}} },
            { "Flaring", 75, 400, 2, {{12,19},{22,32},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 485: {
            const ModifierTierData all_tiers[] = {
            { "Heated", 1, 500, 2, {{1,2},{3,3},{0,0},{0,0}} },
            { "Smouldering", 8, 500, 2, {{3,5},{6,9},{0,0},{0,0}} },
            { "Smoking", 16, 500, 2, {{6,8},{10,13},{0,0},{0,0}} },
            { "Burning", 33, 500, 2, {{9,11},{14,17},{0,0},{0,0}} },
            { "Flaming", 46, 500, 2, {{12,13},{18,20},{0,0},{0,0}} },
            { "Scorching", 54, 500, 2, {{11,16},{21,26},{0,0},{0,0}} },
            { "Incinerating", 60, 400, 2, {{13,19},{27,32},{0,0},{0,0}} },
            { "Blasting", 65, 300, 2, {{20,24},{33,36},{0,0},{0,0}} },
            { "Cremating", 75, 200, 2, {{25,29},{37,45},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 486: {
            const ModifierTierData all_tiers[] = {
            { "Frosted", 1, 500, 2, {{1,1},{2,3},{0,0},{0,0}} },
            { "Chilled", 8, 500, 2, {{3,4},{5,8},{0,0},{0,0}} },
            { "Icy", 16, 500, 2, {{5,6},{9,11},{0,0},{0,0}} },
            { "Frigid", 33, 500, 2, {{7,8},{12,14},{0,0},{0,0}} },
            { "Freezing", 46, 500, 2, {{9,10},{15,17},{0,0},{0,0}} },
            { "Frozen", 54, 500, 2, {{11,13},{18,21},{0,0},{0,0}} },
            { "Glaciated", 60, 400, 2, {{14,15},{22,24},{0,0},{0,0}} },
            { "Polar", 65, 300, 2, {{16,20},{25,31},{0,0},{0,0}} },
            { "Entombing", 75, 200, 2, {{21,24},{32,37},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 487: {
            const ModifierTierData all_tiers[] = {
            { "Humming", 1, 500, 2, {{1,1},{4,6},{0,0},{0,0}} },
            { "Buzzing", 8, 500, 2, {{1,1},{10,15},{0,0},{0,0}} },
            { "Snapping", 16, 500, 2, {{1,1},{16,22},{0,0},{0,0}} },
            { "Crackling", 33, 500, 2, {{1,1},{23,27},{0,0},{0,0}} },
            { "Sparking", 46, 500, 2, {{1,1},{28,32},{0,0},{0,0}} },
            { "Arcing", 54, 500, 2, {{1,2},{33,40},{0,0},{0,0}} },
            { "Shocking", 60, 400, 2, {{1,2},{41,47},{0,0},{0,0}} },
            { "Discharging", 65, 300, 2, {{1,3},{48,59},{0,0},{0,0}} },
            { "Electrocuting", 75, 200, 2, {{1,4},{60,71},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 488: {
            const ModifierTierData all_tiers[] = {
            { "Precise", 1, 800, 1, {{11,32},{0,0},{0,0},{0,0}} },
            { "Reliable", 11, 800, 1, {{33,60},{0,0},{0,0},{0,0}} },
            { "Focused", 18, 800, 1, {{61,84},{0,0},{0,0},{0,0}} },
            { "Deliberate", 26, 800, 1, {{85,123},{0,0},{0,0},{0,0}} },
            { "Consistent", 36, 800, 1, {{124,167},{0,0},{0,0},{0,0}} },
            { "Steady", 48, 800, 1, {{168,236},{0,0},{0,0},{0,0}} },
            { "Hunter's", 58, 800, 1, {{237,346},{0,0},{0,0},{0,0}} },
            { "Ranger's", 67, 400, 1, {{347,450},{0,0},{0,0},{0,0}} },
            { "Amazon's", 76, 200, 1, {{451,550},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 489: {
            const ModifierTierData all_tiers[] = {
            { "of the Brute", 1, 500, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Wrestler", 11, 500, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Bear", 22, 500, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Lion", 33, 500, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Gorilla", 44, 500, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Goliath", 55, 500, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Leviathan", 66, 500, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Titan", 74, 500, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 490: {
            const ModifierTierData all_tiers[] = {
            { "of the Mongoose", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Lynx", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Fox", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Falcon", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Panther", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Leopard", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Jaguar", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Phantom", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            { "of the Wind", 81, 1000, 1, {{34,36},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 491: {
            const ModifierTierData all_tiers[] = {
            { "of the Pupil", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Student", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Prodigy", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Augur", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Philosopher", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Sage", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Savant", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Virtuoso", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 492: {
            const ModifierTierData all_tiers[] = {
            { "of the Whelpling", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Salamander", 12, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Drake", 24, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Kiln", 36, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Furnace", 48, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Volcano", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Magma", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Tzteosh", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 493: {
            const ModifierTierData all_tiers[] = {
            { "of the Seal", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Penguin", 14, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Narwhal", 26, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Yeti", 38, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Walrus", 50, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Polar Bear", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Ice", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Haast", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 494: {
            const ModifierTierData all_tiers[] = {
            { "of the Cloud", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Squall", 13, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Storm", 25, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Thunderhead", 37, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Tempest", 49, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Maelstrom", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Lightning", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Ephij", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 495: {
            const ModifierTierData all_tiers[] = {
            { "of the Lost", 16, 250, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "of Banishment", 30, 250, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Eviction", 44, 250, 1, {{12,15},{0,0},{0,0},{0,0}} },
            { "of Expulsion", 56, 250, 1, {{16,19},{0,0},{0,0},{0,0}} },
            { "of Exile", 68, 250, 1, {{20,23},{0,0},{0,0},{0,0}} },
            { "of Bameth", 81, 250, 1, {{24,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 496: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 700, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 700, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 700, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 700, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 700, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 497: {
            const ModifierTierData all_tiers[] = {
            { "of Combat", 5, 500, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Dueling", 41, 250, 1, {{2,2},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 498: {
            const ModifierTierData all_tiers[] = {
            { "of the Parasite", 21, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            { "of the Locust", 38, 1000, 1, {{6,6},{0,0},{0,0},{0,0}} },
            { "of the Remora", 54, 1000, 1, {{7,7},{0,0},{0,0},{0,0}} },
            { "of the Lamprey", 68, 1000, 1, {{8,8},{0,0},{0,0},{0,0}} },
            { "of the Vampire", 81, 1000, 1, {{9,9},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 499: {
            const ModifierTierData all_tiers[] = {
            { "of the Thirsty", 21, 1000, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of the Parched", 38, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            { "of the Arid", 54, 1000, 1, {{6,6},{0,0},{0,0},{0,0}} },
            { "of the Drought", 68, 1000, 1, {{7,7},{0,0},{0,0},{0,0}} },
            { "of the Desperate", 81, 1000, 1, {{8,8},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 500: {
            const ModifierTierData all_tiers[] = {
            { "of Success", 1, 750, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of Victory", 11, 750, 1, {{7,9},{0,0},{0,0},{0,0}} },
            { "of Triumph", 22, 750, 1, {{10,18},{0,0},{0,0},{0,0}} },
            { "of Conquest", 33, 750, 1, {{19,28},{0,0},{0,0},{0,0}} },
            { "of Vanquishing", 44, 750, 1, {{29,40},{0,0},{0,0},{0,0}} },
            { "of Valour", 55, 750, 1, {{41,53},{0,0},{0,0},{0,0}} },
            { "of Glory", 66, 750, 1, {{54,68},{0,0},{0,0},{0,0}} },
            { "of Legend", 77, 750, 1, {{69,84},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 501: {
            const ModifierTierData all_tiers[] = {
            { "of Absorption", 1, 750, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of Osmosis", 12, 750, 1, {{4,5},{0,0},{0,0},{0,0}} },
            { "of Infusion", 23, 750, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of Enveloping", 34, 750, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Consumption", 45, 750, 1, {{15,20},{0,0},{0,0},{0,0}} },
            { "of Siphoning", 56, 750, 1, {{21,27},{0,0},{0,0},{0,0}} },
            { "of Devouring", 67, 750, 1, {{28,35},{0,0},{0,0},{0,0}} },
            { "of Assimilation", 78, 750, 1, {{36,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 502: {
            const ModifierTierData all_tiers[] = {
            { "of Rejuvenation", 8, 1000, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Restoration", 20, 1000, 1, {{3,3},{0,0},{0,0},{0,0}} },
            { "of Regrowth", 30, 1000, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of Nourishment", 40, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 503: {
            const ModifierTierData all_tiers[] = {
            { "of Skill", 1, 500, 1, {{5,7},{0,0},{0,0},{0,0}} },
            { "of Ease", 22, 500, 1, {{8,10},{0,0},{0,0},{0,0}} },
            { "of Mastery", 37, 500, 1, {{11,13},{0,0},{0,0},{0,0}} },
            { "of Renown", 60, 500, 1, {{14,16},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 504: {
            const ModifierTierData all_tiers[] = {
            { "of Ire", 8, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Anger", 21, 1000, 1, {{15,19},{0,0},{0,0},{0,0}} },
            { "of Rage", 31, 1000, 1, {{20,24},{0,0},{0,0},{0,0}} },
            { "of Fury", 45, 500, 1, {{25,29},{0,0},{0,0},{0,0}} },
            { "of Ferocity", 59, 250, 1, {{30,34},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 505: {
            const ModifierTierData all_tiers[] = {
            { "of Plunder", 3, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of Raiding", 24, 1000, 1, {{11,14},{0,0},{0,0},{0,0}} },
            { "of Archaeology", 40, 1000, 1, {{15,18},{0,0},{0,0},{0,0}} },
            { "of Excavation", 63, 1000, 1, {{19,21},{0,0},{0,0},{0,0}} },
            { "of Windfall", 75, 1000, 1, {{22,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 506: {
            const ModifierTierData all_tiers[] = {
            { "of Covering", 1, 500, 1, {{14,19},{0,0},{0,0},{0,0}} },
            { "of Sheathing", 16, 500, 1, {{20,25},{0,0},{0,0},{0,0}} },
            { "of Lining", 36, 500, 1, {{26,31},{0,0},{0,0},{0,0}} },
            { "of Padding", 48, 500, 1, {{32,37},{0,0},{0,0},{0,0}} },
            { "of Furring", 66, 500, 1, {{38,43},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 507: {
            const ModifierTierData all_tiers[] = {
            { "of Deflecting", 1, 500, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Bending", 16, 500, 1, {{12,14},{0,0},{0,0},{0,0}} },
            { "of Curvation", 36, 500, 1, {{15,17},{0,0},{0,0},{0,0}} },
            { "of Diversion", 48, 500, 1, {{18,20},{0,0},{0,0},{0,0}} },
            { "of Flexure", 66, 500, 1, {{21,23},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 508: {
            const ModifierTierData all_tiers[] = {
            { "of Enlivening", 1, 500, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of Diffusion", 16, 500, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Dispersal", 36, 500, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Buffering", 48, 500, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 509: {
            const ModifierTierData all_tiers[] = {
            { "Hale", 1, 1000, 1, {{10,19},{0,0},{0,0},{0,0}} },
            { "Healthy", 6, 1000, 1, {{20,29},{0,0},{0,0},{0,0}} },
            { "Sanguine", 16, 1000, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Stalwart", 24, 1000, 1, {{40,59},{0,0},{0,0},{0,0}} },
            { "Stout", 33, 1000, 1, {{60,69},{0,0},{0,0},{0,0}} },
            { "Robust", 38, 1000, 1, {{70,84},{0,0},{0,0},{0,0}} },
            { "Rotund", 46, 1000, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Virile", 54, 1000, 1, {{100,119},{0,0},{0,0},{0,0}} },
            { "Athlete's", 60, 1000, 1, {{120,149},{0,0},{0,0},{0,0}} },
            { "Fecund", 65, 1000, 1, {{150,174},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 510: {
            const ModifierTierData all_tiers[] = {
            { "Beryl", 1, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "Cobalt", 6, 1000, 1, {{15,24},{0,0},{0,0},{0,0}} },
            { "Azure", 16, 1000, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Teal", 25, 1000, 1, {{35,54},{0,0},{0,0},{0,0}} },
            { "Cerulean", 33, 1000, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Aqua", 38, 1000, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Opalescent", 46, 1000, 1, {{80,89},{0,0},{0,0},{0,0}} },
            { "Gentian", 54, 1000, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Chalybeous", 60, 1000, 1, {{105,124},{0,0},{0,0},{0,0}} },
            { "Mazarine", 65, 1000, 1, {{125,149},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 511: {
            const ModifierTierData all_tiers[] = {
            { "Lacquered", 1, 1000, 1, {{16,27},{0,0},{0,0},{0,0}} },
            { "Studded", 8, 1000, 1, {{28,50},{0,0},{0,0},{0,0}} },
            { "Ribbed", 16, 1000, 1, {{51,68},{0,0},{0,0},{0,0}} },
            { "Fortified", 25, 1000, 1, {{69,82},{0,0},{0,0},{0,0}} },
            { "Plated", 33, 1000, 1, {{83,102},{0,0},{0,0},{0,0}} },
            { "Carapaced", 46, 1000, 1, {{103,122},{0,0},{0,0},{0,0}} },
            { "Encased", 54, 1000, 1, {{123,160},{0,0},{0,0},{0,0}} },
            { "Enveloped", 60, 1000, 1, {{161,202},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 512: {
            const ModifierTierData all_tiers[] = {
            { "Agile", 1, 1000, 1, {{11,18},{0,0},{0,0},{0,0}} },
            { "Dancer's", 8, 1000, 1, {{19,39},{0,0},{0,0},{0,0}} },
            { "Acrobat's", 16, 1000, 1, {{40,56},{0,0},{0,0},{0,0}} },
            { "Fleet", 25, 1000, 1, {{57,70},{0,0},{0,0},{0,0}} },
            { "Blurred", 33, 1000, 1, {{71,88},{0,0},{0,0},{0,0}} },
            { "Phased", 46, 1000, 1, {{89,107},{0,0},{0,0},{0,0}} },
            { "Vaporous", 54, 1000, 1, {{108,142},{0,0},{0,0},{0,0}} },
            { "Elusory", 60, 1000, 1, {{143,181},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 513: {
            const ModifierTierData all_tiers[] = {
            { "Shining", 1, 1000, 1, {{10,17},{0,0},{0,0},{0,0}} },
            { "Glimmering", 8, 1000, 1, {{18,24},{0,0},{0,0},{0,0}} },
            { "Glittering", 16, 1000, 1, {{25,30},{0,0},{0,0},{0,0}} },
            { "Glowing", 25, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "Radiating", 33, 1000, 1, {{36,41},{0,0},{0,0},{0,0}} },
            { "Pulsing", 46, 1000, 1, {{42,47},{0,0},{0,0},{0,0}} },
            { "Blazing", 54, 1000, 1, {{48,60},{0,0},{0,0},{0,0}} },
            { "Dazzling", 60, 1000, 1, {{61,73},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 514: {
            const ModifierTierData all_tiers[] = {
            { "Reinforced", 2, 1000, 1, {{15,26},{0,0},{0,0},{0,0}} },
            { "Layered", 16, 1000, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Lobstered", 35, 1000, 1, {{43,55},{0,0},{0,0},{0,0}} },
            { "Buttressed", 46, 1000, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Thickened", 54, 1000, 1, {{68,79},{0,0},{0,0},{0,0}} },
            { "Girded", 60, 1000, 1, {{80,91},{0,0},{0,0},{0,0}} },
            { "Impregnable", 65, 1000, 1, {{92,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 515: {
            const ModifierTierData all_tiers[] = {
            { "Shade's", 2, 1000, 1, {{15,26},{0,0},{0,0},{0,0}} },
            { "Ghost's", 16, 1000, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Spectre's", 33, 1000, 1, {{43,55},{0,0},{0,0},{0,0}} },
            { "Wraith's", 46, 1000, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Phantasm's", 54, 1000, 1, {{68,79},{0,0},{0,0},{0,0}} },
            { "Nightmare's", 60, 1000, 1, {{80,91},{0,0},{0,0},{0,0}} },
            { "Mirage's", 65, 1000, 1, {{92,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 516: {
            const ModifierTierData all_tiers[] = {
            { "Protective", 2, 1000, 1, {{15,26},{0,0},{0,0},{0,0}} },
            { "Strong-Willed", 16, 1000, 1, {{27,42},{0,0},{0,0},{0,0}} },
            { "Resolute", 33, 1000, 1, {{43,55},{0,0},{0,0},{0,0}} },
            { "Fearless", 46, 1000, 1, {{56,67},{0,0},{0,0},{0,0}} },
            { "Dauntless", 54, 1000, 1, {{68,79},{0,0},{0,0},{0,0}} },
            { "Indomitable", 60, 1000, 1, {{80,91},{0,0},{0,0},{0,0}} },
            { "Unassailable", 65, 1000, 1, {{92,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 517: {
            const ModifierTierData all_tiers[] = {
            { "Oyster's", 8, 1000, 2, {{6,13},{7,10},{0,0},{0,0}} },
            { "Lobster's", 16, 1000, 2, {{14,20},{11,19},{0,0},{0,0}} },
            { "Urchin's", 33, 1000, 2, {{21,26},{20,25},{0,0},{0,0}} },
            { "Nautilus'", 46, 1000, 2, {{27,32},{26,32},{0,0},{0,0}} },
            { "Octopus'", 60, 1000, 2, {{33,38},{33,41},{0,0},{0,0}} },
            { "Crocodile's", 78, 1000, 2, {{39,42},{42,49},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 518: {
            const ModifierTierData all_tiers[] = {
            { "Flea's", 8, 1000, 2, {{6,13},{7,10},{0,0},{0,0}} },
            { "Fawn's", 16, 1000, 2, {{14,20},{11,19},{0,0},{0,0}} },
            { "Mouflon's", 33, 1000, 2, {{21,26},{20,25},{0,0},{0,0}} },
            { "Ram's", 46, 1000, 2, {{27,32},{26,32},{0,0},{0,0}} },
            { "Ibex's", 60, 1000, 2, {{33,38},{33,41},{0,0},{0,0}} },
            { "Stag's", 78, 1000, 2, {{39,42},{42,49},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 519: {
            const ModifierTierData all_tiers[] = {
            { "Monk's", 8, 1000, 2, {{6,13},{7,10},{0,0},{0,0}} },
            { "Prior's", 16, 1000, 2, {{14,20},{11,19},{0,0},{0,0}} },
            { "Abbot's", 33, 1000, 2, {{21,26},{20,25},{0,0},{0,0}} },
            { "Bishop's", 46, 1000, 2, {{27,32},{26,32},{0,0},{0,0}} },
            { "Exarch's", 60, 1000, 2, {{33,38},{33,41},{0,0},{0,0}} },
            { "Pope's", 78, 1000, 2, {{39,42},{42,49},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 520: {
            const ModifierTierData all_tiers[] = {
            { "Imposing", 8, 1000, 2, {{6,13},{6,8},{0,0},{0,0}} },
            { "Venerable", 16, 1000, 2, {{14,20},{9,16},{0,0},{0,0}} },
            { "Regal", 33, 1000, 2, {{21,26},{17,20},{0,0},{0,0}} },
            { "Colossal", 46, 1000, 2, {{27,32},{21,26},{0,0},{0,0}} },
            { "Chieftain's", 60, 1000, 2, {{33,38},{27,32},{0,0},{0,0}} },
            { "Ancestral", 78, 1000, 2, {{39,42},{33,39},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 521: {
            const ModifierTierData all_tiers[] = {
            { "Nomad's", 8, 1000, 2, {{6,13},{6,8},{0,0},{0,0}} },
            { "Drifter's", 16, 1000, 2, {{14,20},{9,16},{0,0},{0,0}} },
            { "Traveller's", 33, 1000, 2, {{21,26},{17,20},{0,0},{0,0}} },
            { "Explorer's", 46, 1000, 2, {{27,32},{21,26},{0,0},{0,0}} },
            { "Wayfarer's", 60, 1000, 2, {{33,38},{27,32},{0,0},{0,0}} },
            { "Wanderer's", 78, 1000, 2, {{39,42},{33,39},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 522: {
            const ModifierTierData all_tiers[] = {
            { "Imbued", 8, 1000, 2, {{6,13},{6,8},{0,0},{0,0}} },
            { "Serene", 16, 1000, 2, {{14,20},{9,16},{0,0},{0,0}} },
            { "Sacred", 33, 1000, 2, {{21,26},{17,20},{0,0},{0,0}} },
            { "Celestial", 46, 1000, 2, {{27,32},{21,26},{0,0},{0,0}} },
            { "Heavenly", 60, 1000, 2, {{33,38},{27,32},{0,0},{0,0}} },
            { "Angel's", 78, 1000, 2, {{39,42},{33,39},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 523: {
            const ModifierTierData all_tiers[] = {
            { "Precise", 1, 800, 1, {{11,32},{0,0},{0,0},{0,0}} },
            { "Reliable", 11, 800, 1, {{33,60},{0,0},{0,0},{0,0}} },
            { "Focused", 18, 800, 1, {{61,84},{0,0},{0,0},{0,0}} },
            { "Deliberate", 26, 800, 1, {{85,123},{0,0},{0,0},{0,0}} },
            { "Consistent", 36, 800, 1, {{124,167},{0,0},{0,0},{0,0}} },
            { "Steady", 48, 800, 1, {{168,236},{0,0},{0,0},{0,0}} },
            { "Hunter's", 58, 800, 1, {{237,346},{0,0},{0,0},{0,0}} },
            { "Ranger's", 67, 400, 1, {{347,450},{0,0},{0,0},{0,0}} },
            { "Amazon's", 76, 200, 1, {{451,550},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 524: {
            const ModifierTierData all_tiers[] = {
            { "Magpie's", 10, 1000, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "Collector's", 29, 1000, 1, {{12,15},{0,0},{0,0},{0,0}} },
            { "Hoarder's", 47, 1000, 1, {{16,19},{0,0},{0,0},{0,0}} },
            { "Pirate's", 65, 1000, 1, {{20,22},{0,0},{0,0},{0,0}} },
            { "Dragon's", 81, 1000, 1, {{23,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 525: {
            const ModifierTierData all_tiers[] = {
            { "of the Brute", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Wrestler", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Bear", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Lion", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Gorilla", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Goliath", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Leviathan", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Titan", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 526: {
            const ModifierTierData all_tiers[] = {
            { "of the Mongoose", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Lynx", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Fox", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Falcon", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Panther", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Leopard", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Jaguar", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Phantom", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 527: {
            const ModifierTierData all_tiers[] = {
            { "of the Pupil", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Student", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Prodigy", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Augur", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Philosopher", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Sage", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Savant", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Virtuoso", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            { "of the Genius", 81, 1000, 1, {{34,36},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 528: {
            const ModifierTierData all_tiers[] = {
            { "of the Whelpling", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Salamander", 12, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Drake", 24, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Kiln", 36, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Furnace", 48, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Volcano", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Magma", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Tzteosh", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 529: {
            const ModifierTierData all_tiers[] = {
            { "of the Seal", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Penguin", 14, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Narwhal", 26, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Yeti", 38, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Walrus", 50, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Polar Bear", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Ice", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Haast", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 530: {
            const ModifierTierData all_tiers[] = {
            { "of the Cloud", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Squall", 13, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Storm", 25, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Thunderhead", 37, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Tempest", 49, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Maelstrom", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Lightning", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Ephij", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 531: {
            const ModifierTierData all_tiers[] = {
            { "of the Lost", 16, 250, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "of Banishment", 30, 250, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Eviction", 44, 250, 1, {{12,15},{0,0},{0,0},{0,0}} },
            { "of Expulsion", 56, 250, 1, {{16,19},{0,0},{0,0},{0,0}} },
            { "of Exile", 68, 250, 1, {{20,23},{0,0},{0,0},{0,0}} },
            { "of Bameth", 81, 250, 1, {{24,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 532: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 800, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 800, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 800, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 800, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 800, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 533: {
            const ModifierTierData all_tiers[] = {
            { "of the Taskmaster", 5, 500, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of the Despot", 41, 250, 1, {{2,2},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 534: {
            const ModifierTierData all_tiers[] = {
            { "of the Newt", 1, 1000, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "of the Lizard", 5, 1000, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of the Flatworm", 11, 1000, 1, {{3,4},{0,0},{0,0},{0,0}} },
            { "of the Starfish", 17, 1000, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of the Hydra", 26, 1000, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of the Troll", 35, 1000, 1, {{9,13},{0,0},{0,0},{0,0}} },
            { "of Convalescence", 47, 1000, 1, {{13,18},{0,0},{0,0},{0,0}} },
            { "of Recuperation", 58, 1000, 1, {{18,23},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 535: {
            const ModifierTierData all_tiers[] = {
            { "of Menace", 5, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Havoc", 20, 1000, 1, {{15,19},{0,0},{0,0},{0,0}} },
            { "of Disaster", 30, 1000, 1, {{20,24},{0,0},{0,0},{0,0}} },
            { "of Calamity", 44, 500, 1, {{25,29},{0,0},{0,0},{0,0}} },
            { "of Ruin", 58, 250, 1, {{30,34},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 536: {
            const ModifierTierData all_tiers[] = {
            { "of Plunder", 3, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of Raiding", 24, 1000, 1, {{11,14},{0,0},{0,0},{0,0}} },
            { "of Archaeology", 40, 1000, 1, {{15,18},{0,0},{0,0},{0,0}} },
            { "of Excavation", 63, 1000, 1, {{19,21},{0,0},{0,0},{0,0}} },
            { "of Windfall", 75, 1000, 1, {{22,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 537: {
            const ModifierTierData all_tiers[] = {
            { "of Shining", 8, 1000, 2, {{10,20},{5,5},{0,0},{0,0}} },
            { "of Light", 15, 1000, 2, {{21,40},{10,10},{0,0},{0,0}} },
            { "of Radiance", 30, 1000, 2, {{41,60},{15,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 538: {
            const ModifierTierData all_tiers[] = {
            { "of Covering", 1, 1000, 1, {{14,19},{0,0},{0,0},{0,0}} },
            { "of Sheathing", 16, 1000, 1, {{20,25},{0,0},{0,0},{0,0}} },
            { "of Lining", 36, 1000, 1, {{26,31},{0,0},{0,0},{0,0}} },
            { "of Padding", 48, 1000, 1, {{32,37},{0,0},{0,0},{0,0}} },
            { "of Furring", 66, 1000, 1, {{38,43},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 539: {
            const ModifierTierData all_tiers[] = {
            { "of Deflecting", 1, 1000, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Bending", 16, 1000, 1, {{12,14},{0,0},{0,0},{0,0}} },
            { "of Curvation", 36, 1000, 1, {{15,17},{0,0},{0,0},{0,0}} },
            { "of Diversion", 48, 1000, 1, {{18,20},{0,0},{0,0},{0,0}} },
            { "of Flexure", 66, 1000, 1, {{21,23},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 540: {
            const ModifierTierData all_tiers[] = {
            { "of Enlivening", 1, 500, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of Diffusion", 16, 500, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Dispersal", 36, 500, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Buffering", 48, 500, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 541: {
            const ModifierTierData all_tiers[] = {
            { "Hale", 1, 1000, 1, {{10,19},{0,0},{0,0},{0,0}} },
            { "Healthy", 6, 1000, 1, {{20,29},{0,0},{0,0},{0,0}} },
            { "Sanguine", 16, 1000, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Stalwart", 24, 1000, 1, {{40,59},{0,0},{0,0},{0,0}} },
            { "Stout", 33, 1000, 1, {{60,69},{0,0},{0,0},{0,0}} },
            { "Robust", 38, 1000, 1, {{70,84},{0,0},{0,0},{0,0}} },
            { "Rotund", 46, 1000, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Virile", 54, 1000, 1, {{100,119},{0,0},{0,0},{0,0}} },
            { "Athlete's", 60, 1000, 1, {{120,149},{0,0},{0,0},{0,0}} },
            { "Fecund", 65, 1000, 1, {{150,174},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 542: {
            const ModifierTierData all_tiers[] = {
            { "Beryl", 1, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "Cobalt", 6, 1000, 1, {{15,24},{0,0},{0,0},{0,0}} },
            { "Azure", 16, 1000, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Teal", 25, 1000, 1, {{35,54},{0,0},{0,0},{0,0}} },
            { "Cerulean", 33, 1000, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Aqua", 38, 1000, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Opalescent", 46, 1000, 1, {{80,89},{0,0},{0,0},{0,0}} },
            { "Gentian", 54, 1000, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Chalybeous", 60, 1000, 1, {{105,124},{0,0},{0,0},{0,0}} },
            { "Mazarine", 65, 1000, 1, {{125,149},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 543: {
            const ModifierTierData all_tiers[] = {
            { "Supple", 1, 1000, 2, {{8,14},{6,9},{0,0},{0,0}} },
            { "Pliant", 16, 1000, 2, {{15,35},{10,30},{0,0},{0,0}} },
            { "Flexible", 33, 1000, 2, {{36,53},{31,46},{0,0},{0,0}} },
            { "Durable", 46, 1000, 2, {{54,65},{47,57},{0,0},{0,0}} },
            { "Sturdy", 54, 1000, 2, {{66,78},{58,69},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 544: {
            const ModifierTierData all_tiers[] = {
            { "Blessed", 1, 1000, 2, {{8,14},{5,8},{0,0},{0,0}} },
            { "Anointed", 16, 1000, 2, {{15,35},{9,15},{0,0},{0,0}} },
            { "Sanctified", 33, 1000, 2, {{36,53},{16,21},{0,0},{0,0}} },
            { "Hallowed", 46, 1000, 2, {{54,65},{22,25},{0,0},{0,0}} },
            { "Beatified", 54, 1000, 2, {{66,78},{26,29},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 545: {
            const ModifierTierData all_tiers[] = {
            { "Will-o-wisp's", 1, 1000, 2, {{6,9},{5,8},{0,0},{0,0}} },
            { "Nymph's", 16, 1000, 2, {{10,30},{9,15},{0,0},{0,0}} },
            { "Sylph's", 33, 1000, 2, {{31,46},{16,21},{0,0},{0,0}} },
            { "Cherub's", 46, 1000, 2, {{47,57},{22,25},{0,0},{0,0}} },
            { "Spirit's", 54, 1000, 2, {{58,69},{26,29},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 546: {
            const ModifierTierData all_tiers[] = {
            { "Scrapper's", 2, 1000, 2, {{15,26},{15,26},{0,0},{0,0}} },
            { "Brawler's", 16, 1000, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Fencer's", 33, 1000, 2, {{43,55},{43,55},{0,0},{0,0}} },
            { "Gladiator's", 46, 1000, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Duelist's", 54, 1000, 2, {{68,79},{68,79},{0,0},{0,0}} },
            { "Hero's", 60, 1000, 2, {{80,91},{80,91},{0,0},{0,0}} },
            { "Legend's", 65, 1000, 2, {{92,100},{92,100},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 547: {
            const ModifierTierData all_tiers[] = {
            { "Infixed", 2, 1000, 2, {{15,26},{15,26},{0,0},{0,0}} },
            { "Ingrained", 16, 1000, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Instilled", 33, 1000, 2, {{43,55},{43,55},{0,0},{0,0}} },
            { "Infused", 46, 1000, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Inculcated", 54, 1000, 2, {{68,79},{68,79},{0,0},{0,0}} },
            { "Interpolated", 60, 1000, 2, {{80,91},{80,91},{0,0},{0,0}} },
            { "Inspired", 65, 1000, 2, {{92,100},{92,100},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 548: {
            const ModifierTierData all_tiers[] = {
            { "Shadowy", 2, 1000, 2, {{15,26},{15,26},{0,0},{0,0}} },
            { "Ethereal", 16, 1000, 2, {{27,42},{27,42},{0,0},{0,0}} },
            { "Unworldly", 33, 1000, 2, {{43,55},{43,55},{0,0},{0,0}} },
            { "Ephemeral", 46, 1000, 2, {{56,67},{56,67},{0,0},{0,0}} },
            { "Evanescent", 54, 1000, 2, {{68,79},{68,79},{0,0},{0,0}} },
            { "Unreal", 60, 1000, 2, {{80,91},{80,91},{0,0},{0,0}} },
            { "Illusory", 65, 1000, 2, {{92,100},{92,100},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 549: {
            const ModifierTierData all_tiers[] = {
            { "Bully's", 8, 1000, 3, {{6,13},{6,13},{7,10},{0,0}} },
            { "Thug's", 16, 1000, 3, {{14,20},{14,20},{11,19},{0,0}} },
            { "Brute's", 33, 1000, 3, {{21,26},{21,26},{20,25},{0,0}} },
            { "Assailant's", 46, 1000, 3, {{27,32},{27,32},{26,32},{0,0}} },
            { "Aggressor's", 60, 1000, 3, {{33,38},{33,38},{33,41},{0,0}} },
            { "Predator's", 78, 1000, 3, {{39,42},{39,42},{42,49},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 550: {
            const ModifierTierData all_tiers[] = {
            { "Augur's", 8, 1000, 3, {{6,13},{6,13},{7,10},{0,0}} },
            { "Auspex's", 16, 1000, 3, {{14,20},{14,20},{11,19},{0,0}} },
            { "Druid's", 33, 1000, 3, {{21,26},{21,26},{20,25},{0,0}} },
            { "Haruspex's", 46, 1000, 3, {{27,32},{27,32},{26,32},{0,0}} },
            { "Visionary's", 60, 1000, 3, {{33,38},{33,38},{33,41},{0,0}} },
            { "Prophet's", 78, 1000, 3, {{39,42},{39,42},{42,49},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 551: {
            const ModifierTierData all_tiers[] = {
            { "Poet's", 8, 1000, 3, {{6,13},{6,13},{7,10},{0,0}} },
            { "Musician's", 16, 1000, 3, {{14,20},{14,20},{11,19},{0,0}} },
            { "Troubadour's", 33, 1000, 3, {{21,26},{21,26},{20,25},{0,0}} },
            { "Bard's", 46, 1000, 3, {{27,32},{27,32},{26,32},{0,0}} },
            { "Minstrel's", 60, 1000, 3, {{33,38},{33,38},{33,41},{0,0}} },
            { "Maestro's", 78, 1000, 3, {{39,42},{39,42},{42,49},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 552: {
            const ModifierTierData all_tiers[] = {
            { "Rhoa's", 8, 1000, 3, {{6,13},{6,13},{6,8},{0,0}} },
            { "Rhex's", 16, 1000, 3, {{14,20},{14,20},{9,16},{0,0}} },
            { "Chimeral's", 33, 1000, 3, {{21,26},{21,26},{17,20},{0,0}} },
            { "Bull's", 46, 1000, 3, {{27,32},{27,32},{21,26},{0,0}} },
            { "Minotaur's", 60, 1000, 3, {{33,38},{33,38},{27,32},{0,0}} },
            { "Cerberus'", 78, 1000, 3, {{39,42},{39,42},{33,39},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 553: {
            const ModifierTierData all_tiers[] = {
            { "Coelacanth's", 8, 1000, 3, {{6,13},{6,13},{6,8},{0,0}} },
            { "Swordfish's", 16, 1000, 3, {{14,20},{14,20},{9,16},{0,0}} },
            { "Shark's", 33, 1000, 3, {{21,26},{21,26},{17,20},{0,0}} },
            { "Dolphin's", 46, 1000, 3, {{27,32},{27,32},{21,26},{0,0}} },
            { "Orca's", 60, 1000, 3, {{33,38},{33,38},{27,32},{0,0}} },
            { "Whale's", 78, 1000, 3, {{39,42},{39,42},{33,39},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 554: {
            const ModifierTierData all_tiers[] = {
            { "Vulture's", 8, 1000, 3, {{6,13},{6,13},{6,8},{0,0}} },
            { "Kingfisher's", 16, 1000, 3, {{14,20},{14,20},{9,16},{0,0}} },
            { "Owl's", 33, 1000, 3, {{21,26},{21,26},{17,20},{0,0}} },
            { "Hawk's", 46, 1000, 3, {{27,32},{27,32},{21,26},{0,0}} },
            { "Eagle's", 60, 1000, 3, {{33,38},{33,38},{27,32},{0,0}} },
            { "Falcon's", 78, 1000, 3, {{39,42},{39,42},{33,39},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 555: {
            const ModifierTierData all_tiers[] = {
            { "Precise", 1, 800, 1, {{11,32},{0,0},{0,0},{0,0}} },
            { "Reliable", 11, 800, 1, {{33,60},{0,0},{0,0},{0,0}} },
            { "Focused", 18, 800, 1, {{61,84},{0,0},{0,0},{0,0}} },
            { "Deliberate", 26, 800, 1, {{85,123},{0,0},{0,0},{0,0}} },
            { "Consistent", 36, 800, 1, {{124,167},{0,0},{0,0},{0,0}} },
            { "Steady", 48, 800, 1, {{168,236},{0,0},{0,0},{0,0}} },
            { "Hunter's", 58, 800, 1, {{237,346},{0,0},{0,0},{0,0}} },
            { "Ranger's", 67, 400, 1, {{347,450},{0,0},{0,0},{0,0}} },
            { "Amazon's", 76, 200, 1, {{451,550},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 556: {
            const ModifierTierData all_tiers[] = {
            { "Magpie's", 10, 1000, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "Collector's", 29, 1000, 1, {{12,15},{0,0},{0,0},{0,0}} },
            { "Hoarder's", 47, 1000, 1, {{16,19},{0,0},{0,0},{0,0}} },
            { "Pirate's", 65, 1000, 1, {{20,22},{0,0},{0,0},{0,0}} },
            { "Dragon's", 81, 1000, 1, {{23,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 557: {
            const ModifierTierData all_tiers[] = {
            { "of the Brute", 1, 500, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Wrestler", 11, 500, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Bear", 22, 500, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Lion", 33, 500, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Gorilla", 44, 500, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Goliath", 55, 500, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Leviathan", 66, 500, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Titan", 74, 500, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 558: {
            const ModifierTierData all_tiers[] = {
            { "of the Mongoose", 1, 500, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Lynx", 11, 500, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Fox", 22, 500, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Falcon", 33, 500, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Panther", 44, 500, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Leopard", 55, 500, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Jaguar", 66, 500, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Phantom", 74, 500, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 559: {
            const ModifierTierData all_tiers[] = {
            { "of the Pupil", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Student", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Prodigy", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Augur", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Philosopher", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Sage", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Savant", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Virtuoso", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            { "of the Genius", 81, 1000, 1, {{34,36},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 560: {
            const ModifierTierData all_tiers[] = {
            { "of the Whelpling", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Salamander", 12, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Drake", 24, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Kiln", 36, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Furnace", 48, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Volcano", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Magma", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Tzteosh", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 561: {
            const ModifierTierData all_tiers[] = {
            { "of the Seal", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Penguin", 14, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Narwhal", 26, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Yeti", 38, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Walrus", 50, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Polar Bear", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Ice", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Haast", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 562: {
            const ModifierTierData all_tiers[] = {
            { "of the Cloud", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Squall", 13, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Storm", 25, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Thunderhead", 37, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Tempest", 49, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Maelstrom", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Lightning", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Ephij", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 563: {
            const ModifierTierData all_tiers[] = {
            { "of the Lost", 16, 250, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "of Banishment", 30, 250, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Eviction", 44, 250, 1, {{12,15},{0,0},{0,0},{0,0}} },
            { "of Expulsion", 56, 250, 1, {{16,19},{0,0},{0,0},{0,0}} },
            { "of Exile", 68, 250, 1, {{20,23},{0,0},{0,0},{0,0}} },
            { "of Bameth", 81, 250, 1, {{24,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 564: {
            const ModifierTierData all_tiers[] = {
            { "of the Worthy", 24, 800, 1, {{15,15},{0,0},{0,0},{0,0}} },
            { "of the Apt", 32, 800, 1, {{20,20},{0,0},{0,0},{0,0}} },
            { "of the Talented", 40, 800, 1, {{25,25},{0,0},{0,0},{0,0}} },
            { "of the Skilled", 52, 800, 1, {{30,30},{0,0},{0,0},{0,0}} },
            { "of the Proficient", 60, 800, 1, {{35,35},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 565: {
            const ModifierTierData all_tiers[] = {
            { "of the Taskmaster", 5, 500, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of the Despot", 41, 250, 1, {{2,2},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 566: {
            const ModifierTierData all_tiers[] = {
            { "of the Newt", 1, 1000, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "of the Lizard", 5, 1000, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of the Flatworm", 11, 1000, 1, {{3,4},{0,0},{0,0},{0,0}} },
            { "of the Starfish", 17, 1000, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of the Hydra", 26, 1000, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of the Troll", 35, 1000, 1, {{9,13},{0,0},{0,0},{0,0}} },
            { "of Convalescence", 47, 1000, 1, {{13,18},{0,0},{0,0},{0,0}} },
            { "of Recuperation", 58, 1000, 1, {{18,23},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 567: {
            const ModifierTierData all_tiers[] = {
            { "of Menace", 5, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Havoc", 20, 1000, 1, {{15,19},{0,0},{0,0},{0,0}} },
            { "of Disaster", 30, 1000, 1, {{20,24},{0,0},{0,0},{0,0}} },
            { "of Calamity", 44, 500, 1, {{25,29},{0,0},{0,0},{0,0}} },
            { "of Ruin", 58, 250, 1, {{30,34},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 568: {
            const ModifierTierData all_tiers[] = {
            { "of Plunder", 3, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of Raiding", 24, 1000, 1, {{11,14},{0,0},{0,0},{0,0}} },
            { "of Archaeology", 40, 1000, 1, {{15,18},{0,0},{0,0},{0,0}} },
            { "of Excavation", 63, 1000, 1, {{19,21},{0,0},{0,0},{0,0}} },
            { "of Windfall", 75, 1000, 1, {{22,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 569: {
            const ModifierTierData all_tiers[] = {
            { "of Shining", 8, 1000, 2, {{10,20},{5,5},{0,0},{0,0}} },
            { "of Light", 15, 1000, 2, {{21,40},{10,10},{0,0},{0,0}} },
            { "of Radiance", 30, 1000, 2, {{41,60},{15,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 570: {
            const ModifierTierData all_tiers[] = {
            { "of Covering", 1, 500, 1, {{14,19},{0,0},{0,0},{0,0}} },
            { "of Sheathing", 16, 500, 1, {{20,25},{0,0},{0,0},{0,0}} },
            { "of Lining", 36, 500, 1, {{26,31},{0,0},{0,0},{0,0}} },
            { "of Padding", 48, 500, 1, {{32,37},{0,0},{0,0},{0,0}} },
            { "of Furring", 66, 500, 1, {{38,43},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 571: {
            const ModifierTierData all_tiers[] = {
            { "of Deflecting", 1, 500, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Bending", 16, 500, 1, {{12,14},{0,0},{0,0},{0,0}} },
            { "of Curvation", 36, 500, 1, {{15,17},{0,0},{0,0},{0,0}} },
            { "of Diversion", 48, 500, 1, {{18,20},{0,0},{0,0},{0,0}} },
            { "of Flexure", 66, 500, 1, {{21,23},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 572: {
            const ModifierTierData all_tiers[] = {
            { "of Enlivening", 1, 500, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of Diffusion", 16, 500, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Dispersal", 36, 500, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Buffering", 48, 500, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 573: {
            const ModifierTierData all_tiers[] = {
            { "Hale", 1, 1000, 1, {{10,19},{0,0},{0,0},{0,0}} },
            { "Healthy", 6, 1000, 1, {{20,29},{0,0},{0,0},{0,0}} },
            { "Sanguine", 16, 1000, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Stalwart", 24, 1000, 1, {{40,59},{0,0},{0,0},{0,0}} },
            { "Stout", 33, 1000, 1, {{60,69},{0,0},{0,0},{0,0}} },
            { "Robust", 38, 1000, 1, {{70,84},{0,0},{0,0},{0,0}} },
            { "Rotund", 46, 1000, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Virile", 54, 1000, 1, {{100,119},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 574: {
            const ModifierTierData all_tiers[] = {
            { "Beryl", 1, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "Cobalt", 6, 1000, 1, {{15,24},{0,0},{0,0},{0,0}} },
            { "Azure", 16, 1000, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Teal", 25, 1000, 1, {{35,54},{0,0},{0,0},{0,0}} },
            { "Cerulean", 33, 1000, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Aqua", 38, 1000, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Opalescent", 46, 1000, 1, {{80,89},{0,0},{0,0},{0,0}} },
            { "Gentian", 54, 1000, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Chalybeous", 60, 1000, 1, {{105,124},{0,0},{0,0},{0,0}} },
            { "Mazarine", 65, 1000, 1, {{125,149},{0,0},{0,0},{0,0}} },
            { "Blue", 70, 1000, 1, {{150,164},{0,0},{0,0},{0,0}} },
            { "Zaffre", 75, 1000, 1, {{165,180},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 575: {
            const ModifierTierData all_tiers[] = {
            { "Agile", 1, 1000, 1, {{8,15},{0,0},{0,0},{0,0}} },
            { "Dancer's", 11, 1000, 1, {{16,33},{0,0},{0,0},{0,0}} },
            { "Acrobat's", 16, 1000, 1, {{34,44},{0,0},{0,0},{0,0}} },
            { "Fleet", 25, 1000, 1, {{45,69},{0,0},{0,0},{0,0}} },
            { "Blurred", 33, 1000, 1, {{70,93},{0,0},{0,0},{0,0}} },
            { "Phased", 46, 1000, 1, {{94,123},{0,0},{0,0},{0,0}} },
            { "Vaporous", 54, 1000, 1, {{124,151},{0,0},{0,0},{0,0}} },
            { "Elusory", 65, 1000, 1, {{152,176},{0,0},{0,0},{0,0}} },
            { "Adroit", 70, 1000, 1, {{177,203},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 576: {
            const ModifierTierData all_tiers[] = {
            { "Glinting", 1, 1000, 2, {{1,2},{3,3},{0,0},{0,0}} },
            { "Burnished", 8, 1000, 2, {{2,3},{4,6},{0,0},{0,0}} },
            { "Polished", 16, 1000, 2, {{2,4},{5,8},{0,0},{0,0}} },
            { "Honed", 33, 1000, 2, {{4,6},{8,11},{0,0},{0,0}} },
            { "Gleaming", 46, 1000, 2, {{5,7},{9,13},{0,0},{0,0}} },
            { "Annealed", 54, 1000, 2, {{6,10},{12,17},{0,0},{0,0}} },
            { "Razor-sharp", 60, 800, 2, {{7,11},{14,20},{0,0},{0,0}} },
            { "Tempered", 65, 600, 2, {{10,15},{18,26},{0,0},{0,0}} },
            { "Flaring", 75, 400, 2, {{12,19},{22,32},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 577: {
            const ModifierTierData all_tiers[] = {
            { "Heated", 1, 500, 2, {{1,2},{3,3},{0,0},{0,0}} },
            { "Smouldering", 8, 500, 2, {{3,5},{6,9},{0,0},{0,0}} },
            { "Smoking", 16, 500, 2, {{6,8},{10,13},{0,0},{0,0}} },
            { "Burning", 33, 500, 2, {{9,11},{14,17},{0,0},{0,0}} },
            { "Flaming", 46, 500, 2, {{12,13},{18,20},{0,0},{0,0}} },
            { "Scorching", 54, 500, 2, {{11,16},{21,26},{0,0},{0,0}} },
            { "Incinerating", 60, 400, 2, {{13,19},{27,32},{0,0},{0,0}} },
            { "Blasting", 65, 300, 2, {{20,24},{33,36},{0,0},{0,0}} },
            { "Cremating", 75, 200, 2, {{25,29},{37,45},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 578: {
            const ModifierTierData all_tiers[] = {
            { "Frosted", 1, 500, 2, {{1,1},{2,3},{0,0},{0,0}} },
            { "Chilled", 8, 500, 2, {{3,4},{5,8},{0,0},{0,0}} },
            { "Icy", 16, 500, 2, {{5,6},{9,11},{0,0},{0,0}} },
            { "Frigid", 33, 500, 2, {{7,8},{12,14},{0,0},{0,0}} },
            { "Freezing", 46, 500, 2, {{9,10},{15,17},{0,0},{0,0}} },
            { "Frozen", 54, 500, 2, {{11,13},{18,21},{0,0},{0,0}} },
            { "Glaciated", 60, 400, 2, {{14,15},{22,24},{0,0},{0,0}} },
            { "Polar", 65, 300, 2, {{16,20},{25,31},{0,0},{0,0}} },
            { "Entombing", 75, 200, 2, {{21,24},{32,37},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 579: {
            const ModifierTierData all_tiers[] = {
            { "Humming", 1, 500, 2, {{1,1},{4,6},{0,0},{0,0}} },
            { "Buzzing", 8, 500, 2, {{1,1},{10,15},{0,0},{0,0}} },
            { "Snapping", 16, 500, 2, {{1,1},{16,22},{0,0},{0,0}} },
            { "Crackling", 33, 500, 2, {{1,1},{23,27},{0,0},{0,0}} },
            { "Sparking", 46, 500, 2, {{1,1},{28,32},{0,0},{0,0}} },
            { "Arcing", 54, 500, 2, {{1,2},{33,40},{0,0},{0,0}} },
            { "Shocking", 60, 400, 2, {{1,2},{41,47},{0,0},{0,0}} },
            { "Discharging", 65, 300, 2, {{1,3},{48,59},{0,0},{0,0}} },
            { "Electrocuting", 75, 200, 2, {{1,4},{60,71},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 580: {
            const ModifierTierData all_tiers[] = {
            { "Precise", 1, 800, 1, {{11,32},{0,0},{0,0},{0,0}} },
            { "Reliable", 11, 800, 1, {{33,60},{0,0},{0,0},{0,0}} },
            { "Focused", 18, 800, 1, {{61,84},{0,0},{0,0},{0,0}} },
            { "Deliberate", 26, 800, 1, {{85,123},{0,0},{0,0},{0,0}} },
            { "Consistent", 36, 800, 1, {{124,167},{0,0},{0,0},{0,0}} },
            { "Steady", 48, 800, 1, {{168,236},{0,0},{0,0},{0,0}} },
            { "Hunter's", 58, 800, 1, {{237,346},{0,0},{0,0},{0,0}} },
            { "Ranger's", 67, 400, 1, {{347,450},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 581: {
            const ModifierTierData all_tiers[] = {
            { "Magpie's", 10, 1000, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "Collector's", 29, 1000, 1, {{12,15},{0,0},{0,0},{0,0}} },
            { "Hoarder's", 47, 1000, 1, {{16,19},{0,0},{0,0},{0,0}} },
            { "Pirate's", 65, 1000, 1, {{20,22},{0,0},{0,0},{0,0}} },
            { "Dragon's", 81, 1000, 1, {{23,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 582: {
            const ModifierTierData all_tiers[] = {
            { "Searing", 8, 500, 1, {{3,7},{0,0},{0,0},{0,0}} },
            { "Sizzling", 16, 500, 1, {{8,12},{0,0},{0,0},{0,0}} },
            { "Blistering", 33, 500, 1, {{13,17},{0,0},{0,0},{0,0}} },
            { "Cauterising", 46, 500, 1, {{18,22},{0,0},{0,0},{0,0}} },
            { "Volcanic", 65, 500, 1, {{23,26},{0,0},{0,0},{0,0}} },
            { "Magmatic", 75, 500, 1, {{27,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 583: {
            const ModifierTierData all_tiers[] = {
            { "Bitter", 8, 500, 1, {{3,7},{0,0},{0,0},{0,0}} },
            { "Biting", 16, 500, 1, {{8,12},{0,0},{0,0},{0,0}} },
            { "Alpine", 33, 500, 1, {{13,17},{0,0},{0,0},{0,0}} },
            { "Snowy", 46, 500, 1, {{18,22},{0,0},{0,0},{0,0}} },
            { "Hailing", 65, 500, 1, {{23,26},{0,0},{0,0},{0,0}} },
            { "Crystalline", 75, 500, 1, {{27,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 584: {
            const ModifierTierData all_tiers[] = {
            { "Charged", 8, 500, 1, {{3,7},{0,0},{0,0},{0,0}} },
            { "Hissing", 16, 500, 1, {{8,12},{0,0},{0,0},{0,0}} },
            { "Bolting", 33, 500, 1, {{13,17},{0,0},{0,0},{0,0}} },
            { "Coursing", 46, 500, 1, {{18,22},{0,0},{0,0},{0,0}} },
            { "Striking", 65, 500, 1, {{23,26},{0,0},{0,0},{0,0}} },
            { "Smiting", 75, 500, 1, {{27,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 585: {
            const ModifierTierData all_tiers[] = {
            { "Impure", 8, 500, 1, {{3,7},{0,0},{0,0},{0,0}} },
            { "Tainted", 16, 500, 1, {{8,12},{0,0},{0,0},{0,0}} },
            { "Clouded", 33, 500, 1, {{13,17},{0,0},{0,0},{0,0}} },
            { "Darkened", 46, 500, 1, {{18,22},{0,0},{0,0},{0,0}} },
            { "Malignant", 65, 500, 1, {{23,26},{0,0},{0,0},{0,0}} },
            { "Vile", 75, 500, 1, {{27,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 586: {
            const ModifierTierData all_tiers[] = {
            { "of the Brute", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Wrestler", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Bear", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Lion", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Gorilla", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Goliath", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Leviathan", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Titan", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 587: {
            const ModifierTierData all_tiers[] = {
            { "of the Mongoose", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Lynx", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Fox", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Falcon", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Panther", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Leopard", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Jaguar", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Phantom", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            { "of the Wind", 81, 1000, 1, {{34,36},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 588: {
            const ModifierTierData all_tiers[] = {
            { "of the Pupil", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Student", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Prodigy", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Augur", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Philosopher", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Sage", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Savant", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Virtuoso", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 589: {
            const ModifierTierData all_tiers[] = {
            { "of the Clouds", 1, 400, 3, {{2,4},{2,4},{2,4},{0,0}} },
            { "of the Sky", 11, 400, 3, {{5,7},{5,7},{5,7},{0,0}} },
            { "of the Meteor", 22, 400, 3, {{8,10},{8,10},{8,10},{0,0}} },
            { "of the Comet", 33, 400, 3, {{11,13},{11,13},{11,13},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 590: {
            const ModifierTierData all_tiers[] = {
            { "of the Whelpling", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Salamander", 12, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Drake", 24, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Kiln", 36, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Furnace", 48, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Volcano", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Magma", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Tzteosh", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 591: {
            const ModifierTierData all_tiers[] = {
            { "of the Seal", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Penguin", 14, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Narwhal", 26, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Yeti", 38, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Walrus", 50, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Polar Bear", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Ice", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Haast", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 592: {
            const ModifierTierData all_tiers[] = {
            { "of the Cloud", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Squall", 13, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Storm", 25, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Thunderhead", 37, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Tempest", 49, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Maelstrom", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Lightning", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Ephij", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 593: {
            const ModifierTierData all_tiers[] = {
            { "of the Crystal", 12, 800, 3, {{3,5},{3,5},{3,5},{0,0}} },
            { "of the Prism", 26, 800, 3, {{6,8},{6,8},{6,8},{0,0}} },
            { "of the Kaleidoscope", 40, 800, 3, {{9,11},{9,11},{9,11},{0,0}} },
            { "of Variegation", 54, 800, 3, {{12,14},{12,14},{12,14},{0,0}} },
            { "of the Rainbow", 68, 800, 3, {{15,16},{15,16},{15,16},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 594: {
            const ModifierTierData all_tiers[] = {
            { "of the Lost", 16, 250, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "of Banishment", 30, 250, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Eviction", 44, 250, 1, {{12,15},{0,0},{0,0},{0,0}} },
            { "of Expulsion", 56, 250, 1, {{16,19},{0,0},{0,0},{0,0}} },
            { "of Exile", 68, 250, 1, {{20,23},{0,0},{0,0},{0,0}} },
            { "of Bameth", 81, 250, 1, {{24,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 595: {
            const ModifierTierData all_tiers[] = {
            { "of the Newt", 1, 1000, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "of the Lizard", 5, 1000, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of the Flatworm", 11, 1000, 1, {{3,4},{0,0},{0,0},{0,0}} },
            { "of the Starfish", 17, 1000, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of the Hydra", 26, 1000, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of the Troll", 35, 1000, 1, {{9,13},{0,0},{0,0},{0,0}} },
            { "of Convalescence", 47, 1000, 1, {{13,18},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 596: {
            const ModifierTierData all_tiers[] = {
            { "of Excitement", 1, 1000, 1, {{10,19},{0,0},{0,0},{0,0}} },
            { "of Joy", 18, 1000, 1, {{20,29},{0,0},{0,0},{0,0}} },
            { "of Elation", 29, 1000, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "of Bliss", 42, 1000, 1, {{40,49},{0,0},{0,0},{0,0}} },
            { "of Euphoria", 55, 1000, 1, {{50,59},{0,0},{0,0},{0,0}} },
            { "of Nirvana", 79, 1000, 1, {{60,69},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 597: {
            const ModifierTierData all_tiers[] = {
            { "of the Parasite", 21, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            { "of the Locust", 38, 1000, 1, {{6,6},{0,0},{0,0},{0,0}} },
            { "of the Remora", 54, 1000, 1, {{7,7},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 598: {
            const ModifierTierData all_tiers[] = {
            { "of the Thirsty", 21, 1000, 1, {{4,4},{0,0},{0,0},{0,0}} },
            { "of the Parched", 38, 1000, 1, {{5,5},{0,0},{0,0},{0,0}} },
            { "of the Arid", 54, 1000, 1, {{6,6},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 599: {
            const ModifierTierData all_tiers[] = {
            { "of Success", 1, 750, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of Victory", 11, 750, 1, {{7,9},{0,0},{0,0},{0,0}} },
            { "of Triumph", 22, 750, 1, {{10,18},{0,0},{0,0},{0,0}} },
            { "of Conquest", 33, 750, 1, {{19,28},{0,0},{0,0},{0,0}} },
            { "of Vanquishing", 44, 750, 1, {{29,40},{0,0},{0,0},{0,0}} },
            { "of Valour", 55, 750, 1, {{41,53},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 600: {
            const ModifierTierData all_tiers[] = {
            { "of Absorption", 1, 750, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of Osmosis", 12, 750, 1, {{4,5},{0,0},{0,0},{0,0}} },
            { "of Infusion", 23, 750, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of Enveloping", 34, 750, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Consumption", 45, 750, 1, {{15,20},{0,0},{0,0},{0,0}} },
            { "of Siphoning", 56, 750, 1, {{21,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 601: {
            const ModifierTierData all_tiers[] = {
            { "of Talent", 1, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of Nimbleness", 15, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of Expertise", 30, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of Sortilege", 45, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 602: {
            const ModifierTierData all_tiers[] = {
            { "of Plunder", 3, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of Raiding", 24, 1000, 1, {{11,14},{0,0},{0,0},{0,0}} },
            { "of Archaeology", 40, 1000, 1, {{15,18},{0,0},{0,0},{0,0}} },
            { "of Excavation", 63, 1000, 1, {{19,21},{0,0},{0,0},{0,0}} },
            { "of Windfall", 75, 1000, 1, {{22,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 603: {
            const ModifierTierData all_tiers[] = {
            { "of Warmth", 8, 1000, 2, {{8,12},{5,5},{0,0},{0,0}} },
            { "of Kindling", 15, 1000, 2, {{13,17},{10,10},{0,0},{0,0}} },
            { "of the Hearth", 30, 1000, 2, {{18,22},{15,15},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 604: {
            const ModifierTierData all_tiers[] = {
            { "Hale", 1, 1000, 1, {{10,19},{0,0},{0,0},{0,0}} },
            { "Healthy", 6, 1000, 1, {{20,29},{0,0},{0,0},{0,0}} },
            { "Sanguine", 16, 1000, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "Stalwart", 24, 1000, 1, {{40,59},{0,0},{0,0},{0,0}} },
            { "Stout", 33, 1000, 1, {{60,69},{0,0},{0,0},{0,0}} },
            { "Robust", 38, 1000, 1, {{70,84},{0,0},{0,0},{0,0}} },
            { "Rotund", 46, 1000, 1, {{85,99},{0,0},{0,0},{0,0}} },
            { "Virile", 54, 1000, 1, {{100,119},{0,0},{0,0},{0,0}} },
            { "Athlete's", 60, 1000, 1, {{120,149},{0,0},{0,0},{0,0}} },
            { "Fecund", 65, 1000, 1, {{150,174},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 605: {
            const ModifierTierData all_tiers[] = {
            { "Beryl", 1, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "Cobalt", 6, 1000, 1, {{15,24},{0,0},{0,0},{0,0}} },
            { "Azure", 16, 1000, 1, {{25,34},{0,0},{0,0},{0,0}} },
            { "Teal", 25, 1000, 1, {{35,54},{0,0},{0,0},{0,0}} },
            { "Cerulean", 33, 1000, 1, {{55,64},{0,0},{0,0},{0,0}} },
            { "Aqua", 38, 1000, 1, {{65,79},{0,0},{0,0},{0,0}} },
            { "Opalescent", 46, 1000, 1, {{80,89},{0,0},{0,0},{0,0}} },
            { "Gentian", 54, 1000, 1, {{90,104},{0,0},{0,0},{0,0}} },
            { "Chalybeous", 60, 1000, 1, {{105,124},{0,0},{0,0},{0,0}} },
            { "Mazarine", 65, 1000, 1, {{125,149},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 606: {
            const ModifierTierData all_tiers[] = {
            { "Shining", 1, 1000, 1, {{8,14},{0,0},{0,0},{0,0}} },
            { "Glimmering", 11, 1000, 1, {{15,20},{0,0},{0,0},{0,0}} },
            { "Glittering", 16, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "Glowing", 25, 1000, 1, {{25,33},{0,0},{0,0},{0,0}} },
            { "Radiating", 33, 1000, 1, {{34,41},{0,0},{0,0},{0,0}} },
            { "Pulsing", 46, 1000, 1, {{42,51},{0,0},{0,0},{0,0}} },
            { "Blazing", 54, 1000, 1, {{52,61},{0,0},{0,0},{0,0}} },
            { "Dazzling", 65, 1000, 1, {{62,70},{0,0},{0,0},{0,0}} },
            { "Scintillating", 70, 1000, 1, {{71,79},{0,0},{0,0},{0,0}} },
            { "Incandescent", 80, 1000, 1, {{80,89},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 607: {
            const ModifierTierData all_tiers[] = {
            { "Reinforced", 2, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "Layered", 16, 1000, 1, {{15,20},{0,0},{0,0},{0,0}} },
            { "Lobstered", 33, 1000, 1, {{21,26},{0,0},{0,0},{0,0}} },
            { "Buttressed", 46, 1000, 1, {{27,32},{0,0},{0,0},{0,0}} },
            { "Thickened", 54, 1000, 1, {{33,38},{0,0},{0,0},{0,0}} },
            { "Girded", 65, 1000, 1, {{39,44},{0,0},{0,0},{0,0}} },
            { "Impregnable", 75, 1000, 1, {{45,50},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 608: {
            const ModifierTierData all_tiers[] = {
            { "Shade's", 2, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "Ghost's", 16, 1000, 1, {{15,20},{0,0},{0,0},{0,0}} },
            { "Spectre's", 33, 1000, 1, {{21,26},{0,0},{0,0},{0,0}} },
            { "Wraith's", 46, 1000, 1, {{27,32},{0,0},{0,0},{0,0}} },
            { "Phantasm's", 54, 1000, 1, {{33,38},{0,0},{0,0},{0,0}} },
            { "Nightmare's", 70, 1000, 1, {{39,44},{0,0},{0,0},{0,0}} },
            { "Mirage's", 77, 1000, 1, {{45,50},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 609: {
            const ModifierTierData all_tiers[] = {
            { "Protective", 2, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "Strong-Willed", 16, 1000, 1, {{15,20},{0,0},{0,0},{0,0}} },
            { "Resolute", 33, 1000, 1, {{21,26},{0,0},{0,0},{0,0}} },
            { "Fearless", 46, 1000, 1, {{27,32},{0,0},{0,0},{0,0}} },
            { "Dauntless", 54, 1000, 1, {{33,38},{0,0},{0,0},{0,0}} },
            { "Indomitable", 65, 1000, 1, {{39,44},{0,0},{0,0},{0,0}} },
            { "Unassailable", 75, 1000, 1, {{45,50},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 610: {
            const ModifierTierData all_tiers[] = {
            { "Precise", 1, 800, 1, {{11,32},{0,0},{0,0},{0,0}} },
            { "Reliable", 11, 800, 1, {{33,60},{0,0},{0,0},{0,0}} },
            { "Focused", 18, 800, 1, {{61,84},{0,0},{0,0},{0,0}} },
            { "Deliberate", 26, 800, 1, {{85,123},{0,0},{0,0},{0,0}} },
            { "Consistent", 36, 800, 1, {{124,167},{0,0},{0,0},{0,0}} },
            { "Steady", 48, 800, 1, {{168,236},{0,0},{0,0},{0,0}} },
            { "Hunter's", 58, 800, 1, {{237,346},{0,0},{0,0},{0,0}} },
            { "Ranger's", 67, 400, 1, {{347,450},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 611: {
            const ModifierTierData all_tiers[] = {
            { "Magpie's", 10, 1000, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "Collector's", 29, 1000, 1, {{12,15},{0,0},{0,0},{0,0}} },
            { "Hoarder's", 47, 1000, 1, {{16,19},{0,0},{0,0},{0,0}} },
            { "Pirate's", 65, 1000, 1, {{20,22},{0,0},{0,0},{0,0}} },
            { "Dragon's", 81, 1000, 1, {{23,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 612: {
            const ModifierTierData all_tiers[] = {
            { "Lady's", 16, 500, 1, {{30,33},{0,0},{0,0},{0,0}} },
            { "Baronness'", 25, 500, 1, {{34,37},{0,0},{0,0},{0,0}} },
            { "Viscountess'", 33, 500, 1, {{38,42},{0,0},{0,0},{0,0}} },
            { "Marchioness'", 46, 500, 1, {{43,46},{0,0},{0,0},{0,0}} },
            { "Countess'", 54, 400, 1, {{47,50},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 613: {
            const ModifierTierData all_tiers[] = {
            { "Apprentice's", 1, 1000, 1, {{3,7},{0,0},{0,0},{0,0}} },
            { "Adept's", 16, 1000, 1, {{8,12},{0,0},{0,0},{0,0}} },
            { "Scholar's", 33, 1000, 1, {{13,17},{0,0},{0,0},{0,0}} },
            { "Professor's", 46, 1000, 1, {{18,22},{0,0},{0,0},{0,0}} },
            { "Occultist's", 60, 1000, 1, {{23,26},{0,0},{0,0},{0,0}} },
            { "Incanter's", 75, 1000, 1, {{27,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 614: {
            const ModifierTierData all_tiers[] = {
            { "of the Brute", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Wrestler", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Bear", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Lion", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Gorilla", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Goliath", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Leviathan", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Titan", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 615: {
            const ModifierTierData all_tiers[] = {
            { "of the Mongoose", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Lynx", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Fox", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Falcon", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Panther", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Leopard", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Jaguar", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Phantom", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 616: {
            const ModifierTierData all_tiers[] = {
            { "of the Pupil", 1, 1000, 1, {{5,8},{0,0},{0,0},{0,0}} },
            { "of the Student", 11, 1000, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of the Prodigy", 22, 1000, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of the Augur", 33, 1000, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of the Philosopher", 44, 1000, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of the Sage", 55, 1000, 1, {{25,27},{0,0},{0,0},{0,0}} },
            { "of the Savant", 66, 1000, 1, {{28,30},{0,0},{0,0},{0,0}} },
            { "of the Virtuoso", 74, 1000, 1, {{31,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 617: {
            const ModifierTierData all_tiers[] = {
            { "of the Clouds", 1, 800, 3, {{2,4},{2,4},{2,4},{0,0}} },
            { "of the Sky", 11, 800, 3, {{5,7},{5,7},{5,7},{0,0}} },
            { "of the Meteor", 22, 800, 3, {{8,10},{8,10},{8,10},{0,0}} },
            { "of the Comet", 33, 800, 3, {{11,13},{11,13},{11,13},{0,0}} },
            { "of the Heavens", 44, 800, 3, {{14,16},{14,16},{14,16},{0,0}} },
            { "of the Galaxy", 55, 800, 3, {{17,18},{17,18},{17,18},{0,0}} },
            { "of the Universe", 66, 800, 3, {{19,20},{19,20},{19,20},{0,0}} },
            { "of the Multiverse", 75, 800, 3, {{21,22},{21,22},{21,22},{0,0}} },
            { "of the Infinite", 82, 800, 3, {{23,24},{23,24},{23,24},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 618: {
            const ModifierTierData all_tiers[] = {
            { "of the Whelpling", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Salamander", 12, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Drake", 24, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Kiln", 36, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Furnace", 48, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Volcano", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of Magma", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Tzteosh", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 619: {
            const ModifierTierData all_tiers[] = {
            { "of the Seal", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Penguin", 14, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Narwhal", 26, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Yeti", 38, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Walrus", 50, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Polar Bear", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Ice", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Haast", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 620: {
            const ModifierTierData all_tiers[] = {
            { "of the Cloud", 1, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of the Squall", 13, 1000, 1, {{11,15},{0,0},{0,0},{0,0}} },
            { "of the Storm", 25, 1000, 1, {{16,20},{0,0},{0,0},{0,0}} },
            { "of the Thunderhead", 37, 1000, 1, {{21,25},{0,0},{0,0},{0,0}} },
            { "of the Tempest", 49, 1000, 1, {{26,30},{0,0},{0,0},{0,0}} },
            { "of the Maelstrom", 60, 1000, 1, {{31,35},{0,0},{0,0},{0,0}} },
            { "of the Lightning", 71, 1000, 1, {{36,40},{0,0},{0,0},{0,0}} },
            { "of Ephij", 82, 1000, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 621: {
            const ModifierTierData all_tiers[] = {
            { "of the Crystal", 12, 800, 3, {{3,5},{3,5},{3,5},{0,0}} },
            { "of the Prism", 26, 800, 3, {{6,8},{6,8},{6,8},{0,0}} },
            { "of the Kaleidoscope", 40, 800, 3, {{9,11},{9,11},{9,11},{0,0}} },
            { "of Variegation", 54, 800, 3, {{12,14},{12,14},{12,14},{0,0}} },
            { "of the Rainbow", 68, 800, 3, {{15,16},{15,16},{15,16},{0,0}} },
            { "of the Span", 80, 800, 3, {{17,18},{17,18},{17,18},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 622: {
            const ModifierTierData all_tiers[] = {
            { "of the Lost", 16, 250, 1, {{4,7},{0,0},{0,0},{0,0}} },
            { "of Banishment", 30, 250, 1, {{8,11},{0,0},{0,0},{0,0}} },
            { "of Eviction", 44, 250, 1, {{12,15},{0,0},{0,0},{0,0}} },
            { "of Expulsion", 56, 250, 1, {{16,19},{0,0},{0,0},{0,0}} },
            { "of Exile", 68, 250, 1, {{20,23},{0,0},{0,0},{0,0}} },
            { "of Bameth", 81, 250, 1, {{24,27},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 623: {
            const ModifierTierData all_tiers[] = {
            { "of the Mage", 5, 500, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of the Enchanter", 41, 250, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of the Sorcerer", 75, 100, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 624: {
            const ModifierTierData all_tiers[] = {
            { "of the Taskmaster", 5, 500, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of the Despot", 41, 250, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of the Overseer", 75, 100, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 625: {
            const ModifierTierData all_tiers[] = {
            { "of Combat", 5, 500, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of Dueling", 41, 250, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of Battle", 75, 100, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 626: {
            const ModifierTierData all_tiers[] = {
            { "of the Archer", 5, 500, 1, {{1,1},{0,0},{0,0},{0,0}} },
            { "of the Fletcher", 41, 250, 1, {{2,2},{0,0},{0,0},{0,0}} },
            { "of the Sharpshooter", 75, 100, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 627: {
            const ModifierTierData all_tiers[] = {
            { "of the Newt", 1, 1000, 1, {{1,2},{0,0},{0,0},{0,0}} },
            { "of the Lizard", 5, 1000, 1, {{2,3},{0,0},{0,0},{0,0}} },
            { "of the Flatworm", 11, 1000, 1, {{3,4},{0,0},{0,0},{0,0}} },
            { "of the Starfish", 17, 1000, 1, {{4,6},{0,0},{0,0},{0,0}} },
            { "of the Hydra", 26, 1000, 1, {{6,9},{0,0},{0,0},{0,0}} },
            { "of the Troll", 35, 1000, 1, {{9,13},{0,0},{0,0},{0,0}} },
            { "of Convalescence", 47, 1000, 1, {{13,18},{0,0},{0,0},{0,0}} },
            { "of Recuperation", 58, 1000, 1, {{18,23},{0,0},{0,0},{0,0}} },
            { "of Resurgence", 68, 1000, 1, {{23,29},{0,0},{0,0},{0,0}} },
            { "of Immortality", 75, 1000, 1, {{29,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 628: {
            const ModifierTierData all_tiers[] = {
            { "of Excitement", 1, 1000, 1, {{10,19},{0,0},{0,0},{0,0}} },
            { "of Joy", 18, 1000, 1, {{20,29},{0,0},{0,0},{0,0}} },
            { "of Elation", 29, 1000, 1, {{30,39},{0,0},{0,0},{0,0}} },
            { "of Bliss", 42, 1000, 1, {{40,49},{0,0},{0,0},{0,0}} },
            { "of Euphoria", 55, 1000, 1, {{50,59},{0,0},{0,0},{0,0}} },
            { "of Nirvana", 79, 1000, 1, {{60,69},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 629: {
            const ModifierTierData all_tiers[] = {
            { "of Talent", 1, 800, 1, {{9,12},{0,0},{0,0},{0,0}} },
            { "of Nimbleness", 15, 800, 1, {{13,16},{0,0},{0,0},{0,0}} },
            { "of Expertise", 30, 800, 1, {{17,20},{0,0},{0,0},{0,0}} },
            { "of Sortilege", 45, 800, 1, {{21,24},{0,0},{0,0},{0,0}} },
            { "of Legerdemain", 60, 800, 1, {{25,28},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 630: {
            const ModifierTierData all_tiers[] = {
            { "of Menace", 5, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Havoc", 20, 1000, 1, {{15,19},{0,0},{0,0},{0,0}} },
            { "of Disaster", 30, 1000, 1, {{20,24},{0,0},{0,0},{0,0}} },
            { "of Calamity", 44, 500, 1, {{25,29},{0,0},{0,0},{0,0}} },
            { "of Ruin", 58, 250, 1, {{30,34},{0,0},{0,0},{0,0}} },
            { "of Unmaking", 72, 125, 1, {{35,38},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 631: {
            const ModifierTierData all_tiers[] = {
            { "of Ire", 8, 1000, 1, {{10,14},{0,0},{0,0},{0,0}} },
            { "of Anger", 21, 1000, 1, {{15,19},{0,0},{0,0},{0,0}} },
            { "of Rage", 31, 1000, 1, {{20,24},{0,0},{0,0},{0,0}} },
            { "of Fury", 45, 500, 1, {{25,29},{0,0},{0,0},{0,0}} },
            { "of Ferocity", 59, 250, 1, {{30,34},{0,0},{0,0},{0,0}} },
            { "of Destruction", 74, 125, 1, {{35,39},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 632: {
            const ModifierTierData all_tiers[] = {
            { "of Plunder", 3, 1000, 1, {{6,10},{0,0},{0,0},{0,0}} },
            { "of Raiding", 24, 1000, 1, {{11,14},{0,0},{0,0},{0,0}} },
            { "of Archaeology", 40, 1000, 1, {{15,18},{0,0},{0,0},{0,0}} },
            { "of Excavation", 63, 1000, 1, {{19,21},{0,0},{0,0},{0,0}} },
            { "of Windfall", 75, 1000, 1, {{22,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 633: {
            const ModifierTierData all_tiers[] = {
            { "of Mending", 30, 500, 1, {{10,12},{0,0},{0,0},{0,0}} },
            { "of Bandaging", 44, 500, 1, {{13,15},{0,0},{0,0},{0,0}} },
            { "of Stitching", 56, 500, 1, {{16,18},{0,0},{0,0},{0,0}} },
            { "of Suturing", 68, 500, 1, {{19,21},{0,0},{0,0},{0,0}} },
            { "of Fleshbinding", 79, 500, 1, {{22,24},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 634: {
            const ModifierTierData all_tiers[] = {
            { "of Reprieve", 31, 500, 1, {{10,12},{0,0},{0,0},{0,0}} },
            { "of Solace", 45, 500, 1, {{13,15},{0,0},{0,0},{0,0}} },
            { "of Tranquility", 57, 500, 1, {{16,18},{0,0},{0,0},{0,0}} },
            { "of Serenity", 69, 500, 1, {{19,21},{0,0},{0,0},{0,0}} },
            { "of Zen", 80, 500, 1, {{22,24},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

            default:
                free(tiers);
                return NULL;
        }
    }
    else if (source == SOURCE_PERFECT_ESSENCE) {
        switch (mod_id) {

        case 0: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Abrasion", 72, 1, 1, {{25,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 1: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Flames", 72, 1, 1, {{25,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 2: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Ice", 72, 1, 1, {{25,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 3: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Electricity", 72, 1, 1, {{25,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 4: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Battle", 72, 1, 1, {{6,6},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 5: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Haste", 72, 1, 1, {{20,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 6: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Abrasion", 72, 1, 1, {{25,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 7: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Flames", 72, 1, 1, {{25,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 8: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Ice", 72, 1, 1, {{25,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 9: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Electricity", 72, 1, 1, {{25,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 10: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Battle", 72, 1, 1, {{6,6},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 11: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Haste", 72, 1, 1, {{20,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 12: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Sorcery", 72, 1, 1, {{5,5},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 13: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Alacrity", 72, 1, 1, {{28,32},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 14: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Abrasion", 72, 1, 1, {{25,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 15: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Flames", 72, 1, 1, {{25,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 16: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Ice", 72, 1, 1, {{25,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 17: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Electricity", 72, 1, 1, {{25,33},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 18: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Battle", 72, 1, 1, {{6,6},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 19: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Haste", 72, 1, 1, {{20,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 20: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Abrasion", 72, 1, 1, {{15,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 21: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Flames", 72, 1, 1, {{15,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 22: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Ice", 72, 1, 1, {{15,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 23: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Electricity", 72, 1, 1, {{15,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 24: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Battle", 72, 1, 1, {{4,4},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 25: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Haste", 72, 1, 1, {{20,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 26: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Abrasion", 72, 1, 1, {{15,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 27: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Flames", 72, 1, 1, {{15,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 28: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Ice", 72, 1, 1, {{15,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 29: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Electricity", 72, 1, 1, {{15,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 30: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Battle", 72, 1, 1, {{4,4},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 31: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Haste", 72, 1, 1, {{20,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 32: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Command", 72, 1, 1, {{15,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 33: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Abrasion", 72, 1, 1, {{15,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 34: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Flames", 72, 1, 1, {{15,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 35: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Ice", 72, 1, 1, {{15,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 36: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Electricity", 72, 1, 1, {{15,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 37: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Battle", 72, 1, 1, {{4,4},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 38: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Haste", 72, 1, 1, {{20,25},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 39: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Sorcery", 72, 1, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 40: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Alacrity", 72, 1, 1, {{18,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 41: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Hysteria", 33, 0, 1, {{20,24},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 42: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Hysteria", 33, 0, 1, {{20,24},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 43: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Sorcery", 72, 1, 1, {{3,3},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 44: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Hysteria", 48, 0, 1, {{41,45},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 45: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Alacrity", 72, 1, 1, {{18,20},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 46: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Hysteria", 33, 0, 1, {{20,24},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 47: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Hysteria", 60, 0, 1, {{43,50},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 48: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Hysteria", 65, 1, 1, {{30,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 49: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Horror", 1, 1, 1, {{100,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 50: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Hysteria", 65, 1, 1, {{30,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 51: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Horror", 1, 1, 1, {{100,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 52: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of the Body", 72, 1, 1, {{8,10},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 53: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Ruin", 72, 1, 1, {{10,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 54: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Hysteria", 63, 1, 2, {{64,97},{97,145},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 55: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Seeking", 72, 1, 1, {{40,50},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 56: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of the Body", 72, 1, 1, {{8,10},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 57: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Ruin", 72, 1, 1, {{10,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 58: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Hysteria", 63, 1, 2, {{64,97},{97,145},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 59: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Seeking", 72, 1, 1, {{40,50},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 60: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Hysteria", 45, 1, 1, {{25,29},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 61: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Horror", 1, 1, 1, {{100,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 62: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Grounding", 72, 1, 1, {{26,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 63: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Opulence", 72, 1, 1, {{10,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 64: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Hysteria", 45, 1, 1, {{25,29},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 65: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Horror", 1, 1, 1, {{100,100},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 66: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Grounding", 72, 1, 1, {{26,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 67: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Opulence", 72, 1, 1, {{10,15},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 68: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Hysteria", 5, 1, 1, {{1,1},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 69: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Thawing", 72, 1, 1, {{26,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 70: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Hysteria", 5, 1, 1, {{1,1},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 71: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Thawing", 72, 1, 1, {{26,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 72: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of the Mind", 72, 1, 1, {{4,6},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 73: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Hysteria", 55, 1, 1, {{50,59},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 74: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Enhancement", 72, 1, 1, {{20,30},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 75: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of the Infinite", 72, 1, 1, {{7,10},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 76: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of the Infinite", 72, 1, 1, {{7,10},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 77: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of the Infinite", 72, 1, 1, {{7,10},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

        case 78: {
            const ModifierTierData all_tiers[] = {
            { "Perfect Essence of Hysteria", 68, 1, 1, {{19,21},{0,0},{0,0},{0,0}} },
            };
            memcpy(tiers, all_tiers, sizeof(ModifierTierData) * tier_count);
            break;
        }

            default:
                free(tiers);
                return NULL;
        }
    }

    return tiers;
}