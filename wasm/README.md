# POE2 Crafting Calculator - WASM Core

C/WebAssembly implementation of the crafting calculation engine.

## Architecture

```
wasm/
├── core/           - Core calculation logic
│   ├── items       - Item definitions (replaces 42 Java classes)
│   ├── modifiers   - Modifier definitions and probability logic
│   ├── calculator  - Main calculation algorithm
│   └── probability - Probability calculation utilities
├── threading/      - Multi-threading support (pthreads)
│   └── thread_pool - Reusable thread pool for parallel calculations
├── memory/         - Memory management
│   ├── cache       - Thread-safe caching for intermediate results
│   └── allocator   - Memory pool allocator
└── api.c          - WASM API entry points (Emscripten)
```

## Building

### Requirements
- Emscripten SDK: https://emscripten.org/docs/getting_started/downloads.html

### Development Build
```bash
make
```

### Release Build (optimized)
```bash
make release
```

### Debug Build (with assertions)
```bash
make debug
```

### Native Testing (without Emscripten)
```bash
make test
```

## Output

Compiled files are placed in `../public/wasm/`:
- `poe2-calc.js` - JavaScript glue code
- `poe2-calc.wasm` - WebAssembly binary

## Usage from TypeScript

```typescript
import createPOE2Module from './wasm/poe2-calc.js';

// Initialize module
const module = await createPOE2Module();
module.ccall('init_module', null, [], []);

// Run calculation
const request = JSON.stringify({
  item_id: 123,
  desired_mods: [45, 67, 89],
  num_threads: 8,
  max_iterations: 10000
});

const resultPtr = module.ccall('calculate', 'string', ['string'], [request]);
const results = JSON.parse(resultPtr);

// Free memory
module.ccall('free_string', null, ['number'], [resultPtr]);
```

## Server Configuration

For pthreads support, configure headers:

**Nginx:**
```nginx
add_header Cross-Origin-Embedder-Policy "require-corp";
add_header Cross-Origin-Opener-Policy "same-origin";
```

**Vite (dev):**
```javascript
// vite.config.ts
server: {
  headers: {
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin'
  }
}
```

## Migration Plan

1. **Phase 1**: Convert Java item classes to C structs ✅ (placeholder structure ready)
2. **Phase 2**: Port modifier logic and probability calculations
3. **Phase 3**: Implement core calculation algorithm (single-threaded)
4. **Phase 4**: Add multi-threading with pthreads
5. **Phase 5**: Optimize with caching and memory pools
6. **Phase 6**: Integrate with TypeScript frontend
7. **Phase 7**: Testing and benchmarking vs Java backend

## Performance Goals

- Target: 250ms calculation time on 8-core client machines
- Current Java backend: ~1000-2000ms on 2-core server
- Expected speedup: 2-4x with client-side parallelization

## License

Same as main project.
