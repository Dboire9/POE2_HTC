# ─────────────────────────────────────────
# Compiler & flags
# ─────────────────────────────────────────

CC      = gcc
CFLAGS  = -Wall -Wextra -g -pthread
INCLUDE = -I./core

# ─────────────────────────────────────────
# Directories
# ─────────────────────────────────────────

CORE_DIR  = core
BUILD_DIR = build
TEST_DIR  = test

# ─────────────────────────────────────────
# Core sources
# ─────────────────────────────────────────

CORE_SRCS = \
	$(CORE_DIR)/crafting/computation.c        \
	$(CORE_DIR)/crafting/craft_utils.c        \
	$(CORE_DIR)/threads/threads.c             \
	$(CORE_DIR)/items/items.c                 \
	$(CORE_DIR)/items/items_data.c            \
	$(CORE_DIR)/items/item_lookup_impl.c      \
	$(CORE_DIR)/items/item_mod_lookup.c       \
	$(CORE_DIR)/modifiers/modifiers.c         \
	$(CORE_DIR)/modifiers/modifiers_data.c    \
	$(CORE_DIR)/currencies/transmute.c        \
	$(CORE_DIR)/currencies/augmentation.c     \
	$(CORE_DIR)/currencies/regal.c            \
	$(CORE_DIR)/currencies/annulment_orb.c    \
	$(CORE_DIR)/currencies/exalted_orb.c      \

CORE_OBJS = $(patsubst $(CORE_DIR)/%.c, $(BUILD_DIR)/%.o, $(CORE_SRCS))

# ─────────────────────────────────────────
# Test binaries
# ─────────────────────────────────────────

TEST_CHOOSE      = $(TEST_DIR)/choose
TEST_CURRENCIES  = $(TEST_DIR)/test_currencies

# ─────────────────────────────────────────
# Default target
# ─────────────────────────────────────────

all: $(TEST_CHOOSE) $(TEST_CURRENCIES)

# ─────────────────────────────────────────
# Test binaries linking
# ─────────────────────────────────────────

$(TEST_CHOOSE): $(TEST_DIR)/choose.c $(TEST_DIR)/item_modifiers_check.c $(CORE_OBJS)
	$(CC) $(CFLAGS) $(INCLUDE) $^ -o $@

$(TEST_CURRENCIES): $(TEST_DIR)/test_currencies.c $(CORE_OBJS)
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
	rm -rf $(BUILD_DIR) $(TEST_CHOOSE) $(TEST_CURRENCIES)

rebuild: clean all

re: clean all

.PHONY: all clean rebuild re