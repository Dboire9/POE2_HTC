#ifndef CRAFTING_TYPES_H
#define CRAFTING_TYPES_H

#include <stdbool.h>
#include <stdint.h>

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

#define MAX_CHILDREN_PER_NODE_EARLY  20   // Depth 0-3
#define MAX_CHILDREN_PER_NODE_MID    15   // Depth 4-6
#define MAX_CHILDREN_PER_NODE_LATE   10   // Depth 7+
#define MAX_DEPTH                    15   // Stop after 15 actions
#define MIN_PROBABILITY_THRESHOLD    0.00001  // 0.001%
#define PRUNING_SCORE_RATIO          0.6  // 60% of best score
#define NODE_POOL_INITIAL_SIZE       100000  // 100K nodes pre-allocated

// ============================================================================
// ITEM STATE
// ============================================================================

// Single applied modifier
typedef struct {
    int modifier_id;      // Index in modifier array
    int tier;             // Tier index (0 = T1 = best)
    int values[4];        // Rolled values for this modifier
} AppliedModifier;

// Complete item state at a given point
typedef struct {
    int item_id;
    int item_level;
    int rarity;  // 0=normal, 1=magic, 2=rare
    
    AppliedModifier prefixes[3];
    int prefix_count;
    
    AppliedModifier suffixes[3];
    int suffix_count;
} ItemState;

// ============================================================================
// MODIFIER EVENT (ONE EVENT PER NODE)
// ============================================================================

typedef enum {
    ACTION_ADDED = 0,
    ACTION_REMOVED = 1,
    ACTION_REROLLED = 2,
    ACTION_RARITY_CHANGE = 3
} ActionType;

// Single crafting event (stored in each node)
typedef struct {
    int modifier_id;       // -1 if just rarity change
    int tier;
    ActionType action_type;
    const char* currency_name;
    double probability;    // Probability of THIS event only
} ModifierEvent;

// ============================================================================
// CRAFTING NODE (TREE NODE)
// ============================================================================

typedef struct CraftingNode {
    // Item state at this node
    ItemState state;
    
    // THIS NODE'S EVENT ONLY (not full history)
    ModifierEvent event;
    
    // Scoring & probability
    double cumulative_probability;  // Parent's prob × this event's prob
    double score;
    double prev_score;  // Score before this action
    int depth;
    
    // Tree links
    struct CraftingNode* parent;
    struct CraftingNode** children;
    int children_count;
    int children_capacity;
    
    // Pruning flags
    bool is_pruned;
    bool has_valid_children;
    
    // Optional: mark leaf nodes that match target
    bool is_solution;
} CraftingNode;

// ============================================================================
// MEMORY POOL (EFFICIENT ALLOCATION)
// ============================================================================

typedef struct {
    CraftingNode* nodes;
    int used;
    int capacity;
} NodePool;

// ============================================================================
// CRAFTING CONTEXT (USER INPUT)
// ============================================================================

typedef struct {
    // Item info
    int item_id;
    int item_level;
    int starting_rarity;
    
    // Target modifiers
    int target_prefix_ids[3];
    int target_prefix_tiers[3];
    int target_prefix_count;
    
    int target_suffix_ids[3];
    int target_suffix_tiers[3];
    int target_suffix_count;
    
    // Undesired modifiers (for filtering)
    int undesired_mod_ids[20];
    int undesired_mod_count;
    
    // Currency settings
    uint32_t selected_omens;
    
    // Currency availability (user can disable unwanted currencies)
    bool transmutation_allowed;
    bool augmentation_allowed;
    bool regal_allowed;
    bool exalted_allowed;
    bool annulment_allowed;
    bool essence_allowed;
    bool desecrated_allowed;
    
    const char* essence_type;  // NULL if not using essence
    
    // Thresholds
    double global_threshold;
    int max_depth;
} CraftingContext;

// ============================================================================
// RESULT PATH (RECONSTRUCTED FROM TREE)
// ============================================================================

// Complete crafting path (reconstructed by backtracking)
typedef struct {
    ModifierEvent* steps;
    int step_count;
    double final_probability;
    double final_score;
    ItemState final_state;
} CraftingPath;

// Array of solutions
typedef struct {
    CraftingPath* paths;
    int count;
    int capacity;
} CraftingResult;

// ============================================================================
// FUNCTION DECLARATIONS
// ============================================================================

// Node pool management
NodePool* create_node_pool(int initial_capacity);
CraftingNode* allocate_node(NodePool* pool);
void free_node_pool(NodePool* pool);

// Node operations
void add_child_to_node(CraftingNode* parent, CraftingNode* child);
void free_node_children(CraftingNode* node);
void free_subtree(CraftingNode* root);

// Path reconstruction
CraftingPath* reconstruct_path(const CraftingNode* leaf_node);
void free_crafting_path(CraftingPath* path);

// Result management
CraftingResult* create_result();
void add_path_to_result(CraftingResult* result, CraftingPath* path);
void free_crafting_result(CraftingResult* result);

#endif // CRAFTING_TYPES_H
