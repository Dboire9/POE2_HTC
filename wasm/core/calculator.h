#ifndef CALCULATOR_H
#define CALCULATOR_H

#include "items.h"
#include "modifiers.h"
#include <stdint.h>

// Calculation request
typedef struct {
    Item* item;
    Modifier** desired_mods;
    int num_desired_mods;
    int num_threads;
    int max_iterations;
} CalcRequest;

// Calculation result
typedef struct {
    float probability;
    int currency_cost;
    int attempts_needed;
    char method_path[512];  // e.g., "chaos -> exalt -> divine"
} CalcResult;

// Results array
typedef struct {
    CalcResult* results;
    int count;
    int capacity;
} ResultsArray;

// Main calculation function (entry point for threading)
ResultsArray* calculate_crafting_paths(const CalcRequest* request);

// Single-threaded calculation (for testing)
CalcResult calculate_single_path(const Item* item, Modifier** mods, int num_mods);

// Free results memory
void free_results(ResultsArray* results);

#endif // CALCULATOR_H
