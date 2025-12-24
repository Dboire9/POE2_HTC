#ifndef PROBABILITY_H
#define PROBABILITY_H

#include "items.h"
#include "modifiers.h"

// Calculate probability of rolling specific modifiers
float calculate_roll_probability(
    const Item* item,
    const Modifier** target_mods,
    int num_target_mods
);

// Calculate expected number of attempts
int calculate_expected_attempts(float probability);

// Combine probabilities for multi-step processes
float combine_probabilities(float* probabilities, int count);

#endif // PROBABILITY_H
