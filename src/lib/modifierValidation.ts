import { Modifier, ModifierExclusion, ExclusionMap } from '../types';

/**
 * Build exclusion map from modifier exclusion rules for O(1) lookup
 * Used in ModifiersContext for incompatibility checking (FR-017, FR-018)
 */
export function buildExclusionMap(
  exclusions: ModifierExclusion[]
): ExclusionMap {
  const map = new Map<string, Set<string>>();
  exclusions.forEach((rule) => {
    map.set(rule.modifierId, new Set(rule.excludes));
  });
  return map;
}

/**
 * Check if a modifier should be disabled due to incompatibility with selected modifiers
 * @param modifierId - The modifier ID to check
 * @param selectedModifiers - Currently selected modifiers
 * @param exclusionMap - Pre-built exclusion map for fast lookup
 * @returns true if modifier should be disabled
 */
export function isModifierDisabled(
  modifierId: string,
  selectedModifiers: Modifier[],
  exclusionMap: ExclusionMap
): boolean {
  return selectedModifiers.some((selected) =>
    exclusionMap.get(selected.id)?.has(modifierId)
  );
}
