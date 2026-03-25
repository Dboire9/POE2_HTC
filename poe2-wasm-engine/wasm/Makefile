# ─────────────────────────────────────────
# Compiler & flags
# ─────────────────────────────────────────

CC      = gcc
CFLAGS  = -Wall -Wextra -g -pthread
INCLUDE = -I./core

# ─────────────────────────────────────────
# Directories
# ─────────────────────────────────────────

CORE_DIR       = core
BUILD_DIR      = build
TEST_DIR       = test

# ─────────────────────────────────────────
# Core sources
# ─────────────────────────────────────────

CORE_SRCS = \
	$(CORE_DIR)/crafting/computation.c        \
	$(CORE_DIR)/threads/threads.c             \
	$(CORE_DIR)/items/items.c                 \
	$(CORE_DIR)/items/items_data.c            \
	$(CORE_DIR)/items/item_lookup_impl.c      \
	$(CORE_DIR)/items/item_mod_lookup.c       \
	$(CORE_DIR)/modifiers/modifiers.c         \
	$(CORE_DIR)/modifiers/modifiers_data.c    \

CORE_OBJS = $(patsubst $(CORE_DIR)/%.c, $(BUILD_DIR)/%.o, $(CORE_SRCS))

# ─────────────────────────────────────────
# Test binaries
# ─────────────────────────────────────────

TEST_CHOOSE   = $(TEST_DIR)/choose
TEST_ITEM_MOD = $(TEST_DIR)/item_modifiers_check

# ─────────────────────────────────────────
# Default target — build all tests
# ─────────────────────────────────────────

all: $(TEST_CHOOSE)

# ─────────────────────────────────────────
# Test binaries linking
# ─────────────────────────────────────────

$(TEST_CHOOSE): $(TEST_DIR)/choose.c $(TEST_DIR)/item_modifiers_check.c $(CORE_OBJS)
	$(CC) $(CFLAGS) $(INCLUDE) $^ -o $@

# ─────────────────────────────────────────
# Compile core object files
# ─────────────────────────────────────────

$(BUILD_DIR)/%.o: $(CORE_DIR)/%.c
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) $(INCLUDE) -c $< -o $@

# ─────────────────────────────────────────
# Targets
# ─────────────────────────────────────────

clean:
	rm -rf $(BUILD_DIR) $(TEST_CHOOSE) $(TEST_ITEM_MOD)

rebuild: clean all

.PHONY: all clean rebuild