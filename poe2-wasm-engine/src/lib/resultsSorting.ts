import { CraftingPath } from '../types';

/**
 * Sort crafting paths by success probability (descending)
 * Higher probability paths appear first (FR-014, Clarification Q3)
 * @param paths - Array of crafting paths to sort
 * @returns New array sorted by probability (highest first)
 */
export function sortPathsByProbability(
  paths: CraftingPath[]
): CraftingPath[] {
  return [...paths].sort((a, b) => b.probability - a.probability);
}
