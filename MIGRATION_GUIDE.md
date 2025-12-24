# Migration Guide - Java Backend → C/WASM

## Étape actuelle : Base de données convertie ✅

### Fichiers générés dans `wasm/`

```
wasm/
├── core/
│   ├── modifiers_data.c (440KB)  - 1337 modifiers, 5264 tiers
│   ├── items_data.c (9.6KB)      - 41 item types
│   ├── item_mod_lookup.c (30KB)  - Mappings item→mods
│   └── *.h                        - Headers
├── threading/
│   └── thread_pool.c             - pthread pool ready
├── memory/
│   ├── cache.c                   - Thread-safe cache
│   └── allocator.c               - Memory pool
├── api.c                          - WASM entry points
├── Makefile                       - Build system
└── README.md

Total: ~480KB compiled data
```

### Statistiques de conversion

- ✅ 1337 modifiers extraits (Java → C structs)
- ✅ 1299 avec tiers (5264 tiers parsés)
- ✅ 41 items avec mods autorisés
- ✅ Lookups item→modifier mappés

## Prochaines étapes

### 1. Déplacer le dossier WASM (optionnel)

Si tu veux séparer complètement frontend et backend :

```bash
# Créer un nouveau dossier pour le projet C/WASM
mkdir -p ~/POE2_WASM
mv wasm/* ~/POE2_WASM/
```

### 2. Compléter l'algorithme de calcul

Porter `Crafting_Algorithm.java` vers `calculator.c` :
- Logique de recherche de path de crafting
- Calcul de probabilités
- Multi-threading avec le pool déjà prêt

### 3. Build WASM

```bash
# Installer Emscripten
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh

# Build
cd wasm
make
# Résultat : public/wasm/poe2-calc.{js,wasm}
```

### 4. Intégrer au frontend

```typescript
import { initWasm, calculate } from './lib/wasm-loader';

await initWasm();
const results = calculate({
  item_id: 23, // Rings
  desired_mods: [45, 67, 89],
  num_threads: 8
});
```

### 5. Configurer les headers (pthreads)

**Vite config :**
```javascript
server: {
  headers: {
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin'
  }
}
```

**Nginx (production) :**
```nginx
add_header Cross-Origin-Embedder-Policy "require-corp";
add_header Cross-Origin-Opener-Policy "same-origin";
```

## Avantages de la migration

- ✅ **Client-side** : $0 server costs
- ✅ **Scaling** : Infinite (chaque user = leur CPU)
- ✅ **Performance** : 8+ cores client vs 2 cores server
- ✅ **Latency** : 0ms (local) vs 50-500ms (network)
- ✅ **Threading** : pthreads ready, 2-4x speedup potential

## Notes

- Les 38 modifiers sans tiers sont probablement des modifiers spéciaux/uniques
- Le parsing est optimisé pour les constructeurs `new ModifierTier(name, level, weight, Pair<>()...)`
- Les lookups utilisent des arrays d'IDs pour accès O(1)

## Fichiers à garder

Si tu veux garder le backend Java en parallèle pendant la transition :
- Garde `src/main/java/` intact
- Les fichiers `wasm/` sont indépendants
- Tu peux tester les deux en parallèle

## Outils disponibles

- `scripts/java_to_c_converter.py` : Regenerate data anytime
- `wasm/Makefile` : Build system ready
- `wasm/CMakeLists.txt` : Alternative build (CMake)
