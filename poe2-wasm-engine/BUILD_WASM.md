# Comment Recompiler le WASM

Le WASM doit être recompilé après modification de `wasm/api.c` pour initialiser les modifiers.

## Option 1: Avec Emscripten installé localement

```bash
npm run build:wasm
```

## Option 2: Avec Docker (si daemon running)

```bash
cd wasm
docker run --rm -v "$(pwd)":/src emscripten/emsdk:latest emcc \
  -O3 -s WASM=1 \
  -s EXPORTED_FUNCTIONS='["_malloc","_free","_get_modifiers_normal_count","_get_modifiers_desecrated_count","_get_modifiers_essence_count","_get_modifiers_perfect_essence_count","_get_items_count","_get_item_name","_get_item_class","_get_modifier_name","_get_modifier_group","_get_modifier_tier_count","_get_modifier_tier_name","_get_modifier_tier_level_req","_get_modifier_tier_weight"]' \
  -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","UTF8ToString"]' \
  -I. core/*.c memory/*.c api.c -o ../public/poe2.js
```

## Option 3: Installer Emscripten

```bash
# Clone emsdk
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk

# Install latest
./emsdk install latest
./emsdk activate latest

# Add to PATH
source ./emsdk_env.sh

# Build
cd /home/dorian/POE2_HTC/poe2-wasm-engine
npm run build:wasm
```

## Ce qui a été modifié

Dans `wasm/api.c`, j'ai ajouté l'appel à `init_modifiers_data()`:

```c
__attribute__((constructor))
void init_database() {
    init_items_data();
    init_modifiers_data();  // ← NOUVEAU
}
```

Sans cet appel, les arrays `MODIFIERS_NORMAL[]`, `MODIFIERS_DESECRATED[]`, etc. restent vides, donc `get_modifier_name(0, 1)` retourne NULL.

## Tester après compilation

Recharger `direct.html` dans le navigateur et tester:
- Source: NORMAL
- Index: 1
- Devrait afficher: "FireDamage" avec 10 tiers
