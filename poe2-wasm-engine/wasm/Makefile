# POE2 Crafting Calculator - WASM Build
CC = emcc
CFLAGS = -O3 -pthread \
         -s PTHREAD_POOL_SIZE=8 \
         -s EXPORTED_FUNCTIONS='["_init_module","_calculate","_get_module_info","_free_string"]' \
         -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","UTF8ToString"]' \
         -s ALLOW_MEMORY_GROWTH=1 \
         -s INITIAL_MEMORY=64MB \
         -s MODULARIZE=1 \
         -s EXPORT_NAME='createPOE2Module' \
         -Wall -Wextra

# Source files
CORE_SRC = core/items.c core/modifiers.c core/calculator.c core/probability.c
THREAD_SRC = threading/thread_pool.c
MEMORY_SRC = memory/cache.c memory/allocator.c
API_SRC = api.c

ALL_SRC = $(CORE_SRC) $(THREAD_SRC) $(MEMORY_SRC) $(API_SRC)

# Output directory
OUT_DIR = ../public/wasm

# Targets
.PHONY: all release debug clean test

all: $(OUT_DIR)/poe2-calc.js

$(OUT_DIR)/poe2-calc.js: $(ALL_SRC)
	@mkdir -p $(OUT_DIR)
	$(CC) $(CFLAGS) $(ALL_SRC) -o $@
	@echo "Build complete: $@"

release: CFLAGS += -DNDEBUG -s ASSERTIONS=0 -flto
release: clean $(OUT_DIR)/poe2-calc.js
	@echo "Release build complete"

debug: CFLAGS += -g -DDEBUG -s ASSERTIONS=1 -s SAFE_HEAP=1
debug: clean $(OUT_DIR)/poe2-calc.js
	@echo "Debug build complete"

# Native build for testing (no Emscripten)
test: $(ALL_SRC)
	gcc -g -pthread -DTEST_NATIVE -o test_native $(ALL_SRC) -lm
	./test_native
	@echo "Native test complete"

clean:
	rm -f $(OUT_DIR)/poe2-calc.{js,wasm}
	rm -f test_native
	@echo "Clean complete"

# Help
help:
	@echo "POE2 Crafting Calculator - WASM Build System"
	@echo ""
	@echo "Targets:"
	@echo "  make          - Build development version"
	@echo "  make release  - Build optimized release version"
	@echo "  make debug    - Build with debug symbols and assertions"
	@echo "  make test     - Build and run native tests"
	@echo "  make clean    - Remove build artifacts"
	@echo ""
	@echo "Requirements:"
	@echo "  - Emscripten SDK (emcc)"
	@echo "  - GCC (for native tests)"
