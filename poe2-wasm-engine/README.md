# POE2 WASM Crafting Engine

High-performance crafting simulation engine for Path of Exile 2, written in C and compiled to WebAssembly.

## Structure

```
poe2-wasm-engine/
├── wasm/               # C source code for WASM engine
│   ├── core/          # Core crafting logic and data structures
│   │   ├── modifiers.c/h         # Modifier types and structures
│   │   ├── modifiers_data.c/h    # Generated modifier database (1337 modifiers, 5471 tiers)
│   │   ├── items.c/h             # Item types and structures
│   │   ├── items_data.c/h        # Generated item database (41 items)
│   │   ├── item_mod_lookup.c/h   # Item→Modifier mappings with tier limits
│   │   ├── tags.h                # 26 tag bitflags for filtering
│   │   ├── calculator.c/h        # Crafting probability calculations
│   │   └── probability.c/h       # Probability math utilities
│   ├── memory/        # Memory management
│   │   ├── allocator.c/h         # Custom memory allocator
│   │   └── cache.c/h             # Result caching
│   ├── threading/     # Multi-threading support
│   │   └── thread_pool.c/h       # Thread pool for parallel simulation
│   ├── api.c          # WASM API entry points
│   ├── CMakeLists.txt # CMake build configuration
│   ├── Makefile       # Build automation
│   └── README.md      # WASM module documentation
├── scripts/           # Python tools
│   └── java_to_c_converter.py   # Converts Java database to C
└── src/main/java/    # Source Java database (for conversion)
    └── core/
        ├── Item_modifiers/       # Modifier definitions by item type
        └── Items/                # Item definitions

```

## Database Structure

### Modifiers
- **1337 modifiers** separated by source:
  - NORMAL: 635 modifiers
  - DESECRATED: 359 modifiers
  - ESSENCE: 264 modifiers
  - PERFECT_ESSENCE: 79 modifiers
- **5471 tiers** total across all modifiers
- **Static arrays** - no heap allocation, ~80KB embedded data
- **26 tag bitflags** for filtering (Amanamu, Kurgal, Fire, Cold, Lightning, etc.)

### Items
- **41 item types** with class detection
- Each item has lookup arrays for allowed modifiers
- **Per-item tier limits**: max_tier_index restricts which tiers can roll
  - Example: Body Armour can have 13 tiers of IncreasedLife
  - Example: Boots limited to 9 tiers of IncreasedLife

### Lookup Tables
- Structure: `{ModifierSource, index, max_tier_index}`
- Resolves Java imports to map items to correct modifier variants
- Supports PERFECT_ESSENCE modifiers in ESSENCE arrays

## Building

### Prerequisites
- Emscripten SDK (for WASM compilation)
- CMake 3.15+
- Python 3.8+ (for database conversion)

### Database Generation
```bash
cd poe2-wasm-engine
python3 scripts/java_to_c_converter.py
```

This converts Java modifiers/items to C static arrays.

### WASM Compilation
```bash
cd wasm
make
```

Outputs: `calculator.wasm` and `calculator.js`

## Features

- ✅ Static memory allocation (no malloc/free overhead)
- ✅ Cache-optimized data layout (separated by source)
- ✅ Multi-threading support via pthread
- ✅ Per-item tier limits for accurate simulation
- ✅ Tag-based modifier filtering
- ✅ Support for decimal values in tiers (converted to int)
- ✅ Import resolution for correct modifier variants

## Recent Updates

### December 24, 2025
- Added `max_tier_index` to ModifierLookup for per-item tier limits
- Fixed decimal value parsing (5.0, 5.9 → 5, 5)
- Resolved Java imports to map items to correct modifier files
- Increased tier count from 5264 to 5471 (decimal support)
- Fixed lookup table indexing to use per-source indices

## License

See parent project LICENSE
