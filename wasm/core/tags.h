#ifndef TAGS_H
#define TAGS_H

#include <stdint.h>

// Tag bitflags (uint32_t = 32 bits max)
#define TAG_NONE             0x00000000
#define TAG_AMANAMU          0x00000001
#define TAG_KURGAL           0x00000002
#define TAG_ULAMAN           0x00000004
#define TAG_GEM              0x00000008
#define TAG_CASTER           0x00000010
#define TAG_FIRE             0x00000020
#define TAG_COLD             0x00000040
#define TAG_LIGHTNING        0x00000080
#define TAG_CHAOS            0x00000100
#define TAG_PHYSICAL         0x00000200
#define TAG_LIFE             0x00000400
#define TAG_DEFENCES         0x00000800
#define TAG_ELEMENTAL        0x00001000
#define TAG_ATTACK           0x00002000
#define TAG_MINION           0x00004000
#define TAG_AURA             0x00008000
#define TAG_MANA             0x00010000
#define TAG_SPEED            0x00020000
#define TAG_CRITICAL         0x00040000
#define TAG_DAMAGE           0x00080000
#define TAG_RESISTANCE       0x00100000
#define TAG_ATTRIBUTE        0x00200000
#define TAG_AILMENT          0x00400000
#define TAG_CURSE            0x00800000
#define TAG_CHARM            0x01000000

// Helper function to convert tag string to bitflag
uint32_t tag_string_to_flag(const char* tag);

// Helper to combine multiple tags
uint32_t combine_tags(const char** tags, int count);

#endif
