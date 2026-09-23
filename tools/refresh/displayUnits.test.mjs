// The unit a stat is printed in (displayUnits.mjs), on the stats that need it and one that does not.

import { describe, it, expect } from 'vitest';
import { shownRange } from './displayUnits.mjs';

describe('shownRange', () => {
  it('prints Life Regeneration per second, not per minute', () => {
    expect(shownRange('base_life_regeneration_rate_per_minute', [1986, 2160])).toEqual([33.1, 36]);
    expect(shownRange('allies_in_presence_life_regeneration_rate_per_minute', [60, 120])).toEqual([1, 2]);
  });

  it('prints a permyriad as a percentage', () => {
    expect(shownRange('base_life_leech_from_physical_attack_damage_permyriad', [600, 690])).toEqual([6, 6.9]);
    expect(shownRange('map_ritual_offered_rewards_from_rerolls_have_permyriad_chance_to_cost_no_tribute', [300, 600])).toEqual([3, 6]);
  });

  it('leaves every other stat as the game stores it', () => {
    expect(shownRange('chaos_damage_+%', [25, 34])).toEqual([25, 34]);
    expect(shownRange('damage_taken_goes_to_life_over_4_seconds_%', [10, 12])).toEqual([10, 12]);
  });
});
