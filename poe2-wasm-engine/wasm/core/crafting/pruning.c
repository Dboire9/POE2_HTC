#include "pruning.h"
#include "heuristic.h"
#include "node_operations.h"

int get_max_children_for_depth(int depth) {
    if (depth <= 3) {
        return MAX_CHILDREN_PER_NODE_EARLY;
    } else if (depth <= 6) {
        return MAX_CHILDREN_PER_NODE_MID;
    } else {
        return MAX_CHILDREN_PER_NODE_LATE;
    }
}

bool should_stop_exploring(const CraftingNode* node, const CraftingContext* context) {
    // Max depth reached
    if (node->depth >= context->max_depth) {
        return true;
    }
    
    // Probability too low
    if (node->cumulative_probability < MIN_PROBABILITY_THRESHOLD) {
        return true;
    }
    
    // Perfect match found
    if (matches_target(&node->state, context)) {
        return true;
    }
    
    // Item has 6 mods (maximum)
    int total_mods = node->state.prefix_count + node->state.suffix_count;
    if (total_mods >= 6) {
        // Only stop if we're not improving
        if (node->score <= node->prev_score) {
            return true;
        }
    }
    
    return false;
}

void evaluate_and_prune_node(CraftingNode* node, const CraftingContext* context) {
    if (!node || node->children_count == 0) return;
    
    bool has_valid_child = false;
    double best_child_score = 0.0;
    
    // Calculate scores for all children
    for (int i = 0; i < node->children_count; i++) {
        CraftingNode* child = node->children[i];
        
        // Calculate score
        child->score = calculate_heuristic(&child->state, context);
        
        // Check if valid (score improved)
        if (child->score > node->score) {
            has_valid_child = true;
            if (child->score > best_child_score) {
                best_child_score = child->score;
            }
        }
        
        // Mark as solution if matches target
        if (matches_target(&child->state, context)) {
            child->is_solution = true;
            has_valid_child = true;
        }
    }
    
    // If no valid children, prune this node
    if (!has_valid_child) {
        node->is_pruned = true;
        node->has_valid_children = false;
        free_node_children(node);
        
        // Propagate to parent
        if (node->parent) {
            propagate_pruning_to_parent(node->parent, context);
        }
        return;
    }
    
    node->has_valid_children = true;
    
    // Sort children by score
    sort_children_by_score(node);
    
    // Keep only top N children based on depth
    int max_children = get_max_children_for_depth(node->depth);
    keep_top_n_children(node, max_children);
    
    // Additional pruning: remove children with score < threshold
    double score_threshold = best_child_score * PRUNING_SCORE_RATIO;
    int valid_count = 0;
    
    for (int i = 0; i < node->children_count; i++) {
        if (node->children[i]->score >= score_threshold || node->children[i]->is_solution) {
            valid_count++;
        } else {
            node->children[i]->is_pruned = true;
        }
    }
    
    node->children_count = valid_count;
}

void propagate_pruning_to_parent(CraftingNode* parent, const CraftingContext* context) {
    if (!parent) return;
    
    // Check if ALL children are pruned
    bool all_children_pruned = true;
    
    for (int i = 0; i < parent->children_count; i++) {
        if (!parent->children[i]->is_pruned) {
            all_children_pruned = false;
            break;
        }
    }
    
    // If all pruned, prune parent too
    if (all_children_pruned && parent->children_count > 0) {
        parent->is_pruned = true;
        parent->has_valid_children = false;
        free_node_children(parent);
        
        // Continue propagation
        if (parent->parent) {
            propagate_pruning_to_parent(parent->parent, context);
        }
    }
}
