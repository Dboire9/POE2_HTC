// The true-cost solve, phase 1 of 4: the PROBLEM. Read the item and the targets into the positions the
// lattice indexes, and refuse by name anything the model cannot or the game would not do — before a
// single state exists. Split out of markovFromItem.ts unchanged (2026-11-12); see that file's header.

import type { ItemBase, ItemState, PatchData } from '../../engine/src/types.ts';
import { excluded, familiesOf, modTierWeight, resolveMod } from '../../engine/src/pool.ts';
import { isEssenceMod } from '../../engine/src/probability.ts';
import { limitsOf } from '../../engine/src/item.ts';
import type { Prices } from './cost.ts';
import { pricesForBase } from './cost.ts';
import type { TierTarget } from './optimize.ts';
import { NO_SPARE, slotIndexGroups } from './slots.ts';
import type { ResolvedCandidate } from './markovSymmetry.ts';
import {
  canonicalFilterFor, encoderFor, familiesOfTarget, mergeSlots, permutationClasses, slotMasksOf,
} from './markovSymmetry.ts';
import type { McRarity, McState, McTarget } from './markovState.ts';
import { bit, classifyStart, has, isAccepting, popcount, prefUsed, representative, sideIndexOf, sufUsed } from './markovState.ts';
import { flagFieldsOf } from './markovRoute.ts';
import { resolveSiblings } from './markovSiblings.ts';
import { MAX_POSITIONS, fitTwins } from './essenceTwins.ts';
import type { MarkovOptions, MarkovResult } from './markovFromItem.ts';

/** A phase that answers outright: a refusal, or an item that is already finished. */
export interface Answer { readonly answer: MarkovResult }
/** A refusal, carrying what every answer carries (`bones`) — built by the caller. */
export type Refuse = (reason: string, why?: { stoppedEarly?: true }) => Answer;
const answered = (answer: MarkovResult): Answer => ({ answer });

/**
 * Most CANDIDATE mods the lattice is enumerated for.
 *
 * Six used to be both the cap and the reason for it — "6 is the item's own slot cap". Slot
 * alternatives separate those two things: an item still holds six mods, but you may name more than six
 * candidates to fill them. The item's own limit is now enforced where it belongs, as at most
 * MAX_PER_SIDE *slots* per side; this number is only ever about what the state space can afford.
 *
 * The lattice runs ~2,916 states at 6 candidates and ~20,952 at 9 (3p/3s and 5p/4s, before the
 * desecration flag axis multiplies it), against measured solve times of 264s at 3,963 states. Past
 * nine it stops being a wait anybody sits through.
 */
const MAX_CANDIDATES = MAX_POSITIONS;

export function resolveProblem(
  data: PatchData, rawPrices: Prices, start: ItemState, targets: readonly TierTarget[], opts: MarkovOptions,
  bones: MarkovResult['bones'], fail: Refuse,
) {
  const prices = pricesForBase(rawPrices, start.base);

  const level = start.level;
  // What the item itself can hold. A socketed rune may have raised one of these, so every cap reads them
  // rather than a constant. The CRAFT's caps (`limits`, below) are these less any locked mod.
  const baseLimits = limitsOf(start.base);
  // Positions the player said they don't care about. A free slot the side has no room for is inert
  // rather than an error: `enumerateStates` never emits a state past the cap, so the widened accepting
  // set simply has nothing extra to accept. That is why nothing validates `spare` against `limits`.
  const askedSpare = opts.spare ?? NO_SPARE;
  const fracturedIds = new Set([...start.prefixes, ...start.suffixes].filter((p) => p.fractured).map((p) => p.modId));

  /*
   * A FRACTURED MOD NOBODY ASKED FOR is part of the base now, not junk (TODO 28).
   *
   * The game never removes a fractured mod. `classifyStart` used to count it as ordinary junk, so the
   * model's Annulments and Chaos Orbs could take it off — wrong odds whenever one was on the item, and a
   * price for crafts the game cannot finish. It is instead folded into the craft itself, exactly:
   *   • it fills its slot for good, so that side holds one fewer mod for the whole craft (`limits`);
   *   • the finished item keeps it, so it uses one of the side's free slots (`spare`) — and with none,
   *     the target is impossible, which is said by name rather than left to "no legal item";
   *   • its family can never roll again, so it comes out of every pool (`pools`) — known exactly, where
   *     the junk the lattice counts is only known on average;
   *   • sharing a family with a target, it blocks that target forever.
   * `classifyStart` then leaves it out of the state, so the replay, which classifies every real item
   * through the same function, agrees with the lattice by construction.
   */
  const targetIds = new Set(targets.map((t) => t.modId));
  const locked = [
    ...start.prefixes.map((p) => ({ p, side: 'prefix' as const })),
    ...start.suffixes.map((p) => ({ p, side: 'suffix' as const })),
  ].filter(({ p }) => p.fractured === true && !targetIds.has(p.modId)).map(({ p, side }) => {
    const mod = resolveMod(data, p.modId);
    return { mod, side, carved: p.desecrated === true || mod.source === 'desecrated' };
  });
  // A locked mod a bone placed can never come off, and an item takes a bone only while it carries no
  // bone-placed mod — so this item can never be desecrated again.
  const lockedCarved = locked.find((l) => l.carved);
  if (lockedCarved) {
    const needsBone = targets.find((t) => resolveMod(data, t.modId).source === 'desecrated');
    if (needsBone) {
      return fail(`${lockedCarved.mod.id} is fractured and was placed by a Desecration, so this item can never be `
        + `desecrated again — and ${needsBone.modId} can only arrive by bone`);
    }
  }
  const lockedFamilies = new Set(locked.flatMap(({ mod }) => familiesOf(mod)));
  for (const t of targets) {
    const want = resolveMod(data, t.modId);
    const by = locked.find(({ mod }) => familiesOf(mod).some((f) => familiesOf(want).includes(f)));
    if (by) {
      return fail(`${by.mod.id} is fractured, so it can never be removed — and it shares a family with ${want.id}, `
        + 'which can therefore never be added to this item');
    }
  }
  // A held fractured TARGET below its wanted tier is the same dead end: the roll that blocks it is locked.
  for (const t of targets) {
    const held = [...start.prefixes, ...start.suffixes].find((p) => p.modId === t.modId && p.fractured === true);
    if (!held) continue;
    const mod = resolveMod(data, t.modId);
    const tierIdx = mod.tiers.findIndex((tt) => tt.name === held.tierName);
    if (tierIdx >= 0 && tierIdx < (t.minTierIndex ?? 0)) {
      return fail(`${t.modId} is fractured below the tier asked for, and a fractured mod can never be removed or rerolled`);
    }
  }
  const lockedOn = (side: 'prefix' | 'suffix'): number => locked.filter((l) => l.side === side).length;
  for (const side of ['prefix', 'suffix'] as const) {
    const free = side === 'prefix' ? askedSpare.prefixes : askedSpare.suffixes;
    if (lockedOn(side) > free) {
      const ids = locked.filter((l) => l.side === side).map((l) => l.mod.id).join(', ');
      return fail(`${ids} is fractured, so the finished item keeps it — leave a ${side} free for it ("Any ${side}")`
        + ' or include it in the target');
    }
  }
  const limits = { ...baseLimits, prefixes: baseLimits.prefixes - lockedOn('prefix'), suffixes: baseLimits.suffixes - lockedOn('suffix') };
  const spare = locked.length === 0 ? askedSpare
    : { prefixes: askedSpare.prefixes - lockedOn('prefix'), suffixes: askedSpare.suffixes - lockedOn('suffix') };
  const unlocked = (ids: readonly string[]): string[] => ids.filter((id) => !excluded(resolveMod(data, id), lockedFamilies));
  const pools: ItemBase['pools'] = locked.length === 0 ? start.base.pools : {
    normal: { prefixes: unlocked(start.base.pools.normal.prefixes), suffixes: unlocked(start.base.pools.normal.suffixes) },
    desecrated: { prefixes: unlocked(start.base.pools.desecrated.prefixes), suffixes: unlocked(start.base.pools.desecrated.suffixes) },
    essence: { prefixes: unlocked(start.base.pools.essence.prefixes), suffixes: unlocked(start.base.pools.essence.suffixes) },
  };

  // Resolve targets into the ordered list the bitmasks index: rollable normal mods, desecrated mods
  // (added by a Desecration with the boss omen that selects them), perfect-essence mods (forced on by a
  // Perfect Essence, which eats one existing mod as it adds), and regular-essence mods (forced on by an
  // Essence, which converts Magic → Rare and removes nothing). The last of those needs a MAGIC item,
  // which the state has been able to represent since it gained a rarity axis.
  const cands: ResolvedCandidate[] = [];
  for (const t of targets) {
    const mod = resolveMod(data, t.modId);
    // `ModSource` currently has exactly these four members, so TypeScript proves this branch dead
    // and the rule says so. It stays because the check is on DATA, not on the type: `mods.json` is
    // regenerated from poe2db by `tools/refresh/`, and a fifth source appearing there would arrive as
    // a string the loader happily carries. Better a named refusal than a mod silently resolving into
    // a bitmask position it does not belong in.
    if (mod.source !== 'normal' && mod.source !== 'desecrated'
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      && mod.source !== 'perfect_essence' && mod.source !== 'essence') {
      return fail(`${t.modId} is not a rollable, desecrated or essence mod (the MDP handles those)`);
    }
    if (mod.source === 'desecrated') {
      const inPool = pools.desecrated.prefixes.includes(mod.id) || pools.desecrated.suffixes.includes(mod.id);
      if (!inPool) return fail(`${t.modId} isn't in ${start.base.id}'s desecrated pool`);
      // Being in the pool is the whole requirement. A boss tag only decides whether the draw can be
      // NARROWED (and those omens are Weapon-or-Jewellery only) — the untargeted draw reaches every
      // mod in the pool regardless, so neither a missing tag nor an armour base makes the target
      // unreachable. Rejecting on either used to report `feasible: false` for 342 of the 527
      // desecrated mods, all of them craftable.
    }
    // Both essence grades draw from `pools.essence`, and they are disjoint id sets inside it (317
    // `essence` against 363 `perfect_essence`, zero overlap) — so one membership check serves both.
    if (mod.source === 'perfect_essence' || mod.source === 'essence') {
      const inPool = pools.essence.prefixes.includes(mod.id) || pools.essence.suffixes.includes(mod.id);
      if (!inPool) return fail(`${t.modId} isn't in ${start.base.id}'s essence pool`);
    }
    cands.push({
      mod, minIndex: t.minTierIndex ?? 0, fractured: fracturedIds.has(mod.id), ...(t.essenceTwin ? { twin: true as const } : {}),
    });
  }
  // Is Desecration in play at all — see `boneRole`.
  // …and never with a locked bone-placed mod on board (above): the craft then runs without bones.
  const desecratable = bones !== undefined && lockedCarved === undefined;
  /*
   * ESSENCE TWINS are offered, not asked for (essenceTwins.ts). Each costs a position, and a craft whose
   * named targets and their siblings already fill the model must not be refused for an offer the player
   * never made — so twins are kept only while they fit, the one on the RAREST roll first: that is where
   * forcing the mod saves the most rolls. With none to drop this is the list as given.
   */
  const fitted = fitTwins(data, pools, level, targets, cands, desecratable);
  const kept = fitted.targets;
  cands.length = 0;
  cands.push(...fitted.cands);
  if (cands.length === 0) return fail('no target mods');
  if (cands.length > MAX_CANDIDATES) {
    return fail(`target names more than ${MAX_CANDIDATES} candidate mods`);
  }

  /*
   * Group the candidates into SLOTS — the number of slots, not the number of candidates, is what the
   * item has to hold. `slotIndexGroups` is shared with the linear planners so the two can never
   * disagree about which candidates are alternatives; see slots.ts for why they then do opposite
   * things with the answer.
   *
   * Then MERGE, within each slot, the alternatives that share a family. Only one of them can ever be
   * on the item and they behave identically once one is, so they become a single POSITION holding a
   * single bit — which is what stops a three-way sibling slot costing three times the lattice of a
   * plain mod. `list` is the merged positions from here on, and `n` counts positions, not candidates;
   * the cap above deliberately still counts candidates, since that is the limit the player set.
   */
  const merged = mergeSlots(cands, slotIndexGroups(kept));
  const slots = merged.slots;
  /*
   * Then every OTHER mod the base can roll into a target's family (markovSiblings.ts). A same-side one
   * lands its target as blocked, as an off-tier roll does; anything else becomes an OBSTACLE position,
   * appended after the targets so that every target keeps its index — and every state its key.
   */
  const siblings = resolveSiblings(data, pools, merged.targets, desecratable);
  const list = siblings.list;
  const n = list.length;
  if (n > MAX_CANDIDATES) {
    return fail(`these targets share a family with ${n - merged.targets.length} other mods this base can roll, `
      + `which puts the model past the ${MAX_CANDIDATES} it can afford — drop a target and try again`);
  }
  const slotMasks = slotMasksOf(slots);
  const idsOf = (t: McTarget): string[] => t.mods.map((m) => m.mod.id);
  const desecratedBit = (i: number): boolean => representative(list[i]!).source === 'desecrated';
  const slotSides: ('prefix' | 'suffix')[] = [];
  for (const mask of slotMasks) {
    const members = list.filter((_, i) => has(mask, i));
    const type = members[0]!.type;
    // A slot spanning both sides would make the 3-per-side accounting meaningless — the same slot
    // would consume a prefix on one route and a suffix on another. Merged positions can still differ:
    // side is part of the merge condition, so a prefix and a suffix never merge into one.
    if (members.some((m) => m.type !== type)) {
      return fail(`alternatives for one slot must be all prefixes or all suffixes (${members.flatMap(idsOf).join(', ')})`);
    }
    slotSides.push(type);
  }
  for (const sideName of ['prefix', 'suffix'] as const) {
    const used = slotSides.filter((t) => t === sideName).length;
    const cap = sideName === 'prefix' ? limits.prefixes : limits.suffixes;
    if (used > cap) return fail(`target needs ${used} ${sideName}es, and an item holds ${cap}`);
  }
  /*
   * Two SLOTS may not want the same family, because only one of them could ever be filled — the goal
   * would be unreachable and the solve would say so in a way that names neither mod. Two members of
   * ONE slot sharing a family is the ordinary case and must stay legal: that is exactly the
   * mutually-exclusive group (`#% increased Fire / Cold / Lightning Damage` are one family), where the
   * alternatives are really a union of weights on a single roll.
   *
   * This check is new. The header's "validated out upstream" was true of the app but not of the
   * package, so a direct caller got `no policy reaches the target` and no clue which pair caused it.
   */
  const famSlot = new Map<string, number>();
  const famBits = new Map<string, number>();
  for (let k = 0; k < slotMasks.length; k++) {
    for (let i = 0; i < n; i++) {
      if (!has(slotMasks[k]!, i)) continue;
      for (const fam of familiesOfTarget(list[i]!)) {
        const owner = famSlot.get(fam);
        if (owner !== undefined && owner !== k) {
          return fail(`two different slots both want family "${fam}" — an item holds one mod per family`);
        }
        famSlot.set(fam, k);
        famBits.set(fam, (famBits.get(fam) ?? 0) | bit(i));
      }
    }
  }
  /*
   * Which targets are mutually exclusive, for the lattice to skip.
   *
   * After the check above, any family held by two targets is held by two members of ONE slot — the
   * sibling case, where the alternatives are a union of weights on a single roll rather than two
   * independent chances. Only one of them can ever be on the item, so the states where several are
   * do not exist and enumerating them buys nothing but `actionsOf` calls.
   *
   * Every family with a single target filters out here, which is why this is empty for every craft
   * that predates slots and their state space is untouched.
   */
  // An obstacle is in no slot, so the loop above never met it — but it shares a family with whatever it
  // blocks, and the lattice must never hold both.
  for (let i = 0; i < n; i++) {
    if (!list[i]!.obstacle) continue;
    for (const fam of familiesOfTarget(list[i]!)) famBits.set(fam, (famBits.get(fam) ?? 0) | bit(i));
  }
  const conflicts = [...famBits.values()].filter((m) => popcount(m) > 1);
  /*
   * The one-carved-mod rule is deliberately NOT added to `conflicts`.
   *
   * It looks like the same shape and it is not. `conflicts` excludes states by `present | blocked`,
   * which is right for a family: `blocked` means that family is occupied by SOMETHING, so a sibling
   * cannot also be on the item. But a blocked carved target means its family is held by a different
   * mod — the carved one is not on the item at all — so pruning on `blocked` removes states a
   * Desecration can genuinely reach. It did, and the lattice-closure assertion in the compile step
   * caught it: `desecrate from 0:1:0:0:0:2 leads to 2:1:0:0:4:2, which is not in the lattice`.
   *
   * Nothing is needed in its place. The ACTION space already enforces the rule at its source: a bone
   * requires an item carrying no bone-placed mod (`hasDesecrated`), and a desecrated-pool mod can only
   * arrive by bone — so no reachable state holds two, and `never finishes on an item holding two
   * carved mods` in markovEssenceDesecrate.test.ts is what checks that rather than assuming it.
   */
  /*
   * At most one desecrated mod on the FINISHED ITEM — which is not the same as at most one in the
   * candidate list, once slots exist.
   *
   * "Carved Cast Speed, or failing that a normal one" in two different slots is a perfectly ordinary
   * ask: whichever way it resolves, only one carved mod ends up on the item. Rejecting the list
   * outright refused a craft the game allows. What is genuinely impossible is a target where the rule
   * cannot be satisfied at all — two slots offering NOTHING BUT carved mods, so every way of filling
   * them lands two.
   *
   * Enforcement of the rest is the action space's, not the lattice's: a bone needs an item with no
   * bone-placed mod (`hasDesecrated`), and a desecrated-pool mod only arrives by bone, so no ROUTE
   * reaches a state holding two. The lattice still carries such states — see the note above on why
   * they are not in `conflicts` — which is why anything reading cells directly has to skip them itself
   * (`startCandidates`).
   */
  const forcedCarved = slotMasks.filter((m) => {
    let any = false;
    for (let i = 0; i < n; i++) if (has(m, i)) { if (!desecratedBit(i)) return false; any = true; }
    return any;
  }).length;
  if (forcedCarved > 1) {
    return fail('an item holds at most one desecrated mod, and this target needs two');
  }
  // …and at most ONE CRAFTED modifier — Essence, Perfect Essence and Alloy together (see
  // `isEssenceMod`) — unless a socketed Astrid's Creativity raised `limits.crafted`. Without a cap here
  // `actionsOf` builds a perfect-essence action per crafted target and the policy stacks them happily,
  // producing a route to an item the game cannot hold.
  // Essence TWINS do not count (essenceTwins.ts): each is an alternative to a rolled member of its slot,
  // so "Fire Resistance, or its Greater Essence" asks for no crafted mod, and at most one twin ever lands
  // (a regular Essence needs a Magic item and leaves it Rare). Every position the player NAMED still
  // counts as before — two Perfect Essences named in one slot could both be stacked on a Rare.
  const craftedTargets = list.filter((t) => !t.twin && isEssenceMod(representative(t))).length;
  if (craftedTargets > limits.crafted) {
    return fail(limits.crafted === 1
      ? 'an item can hold at most one crafted modifier (Essence, Perfect Essence or Alloy) — pick one, '
        + 'or socket Astrid’s Creativity for a second'
      : `an item can hold at most ${limits.crafted} crafted modifiers (Essence, Perfect Essence or Alloy)`);
  }
  // Every member of a merged position answers to that position, so a placed mod finds its bit by id
  // whichever alternative it happens to be.
  const idxOf = new Map<string, number>();
  list.forEach((t, i) => { for (const m of t.mods) idxOf.set(m.mod.id, i); });

  /*
   * …and the item you already HOLD counts toward that same cap.
   *
   * The check above counts TARGETS. A held essence modifier that is not itself a target lands in
   * `jp`/`js`, and junk is a bare count with no marker — so the model cannot tell it from any other
   * junk and will offer a Perfect Essence on an item that already carries one. Measured on a real
   * craft (a held `PerfectEssence_EssenceAbyss`, a `PerfectEssence_FireDamage` target): four states
   * played a Perfect Essence with junk still on the item. The finished item is safe either way — the
   * refusal below counts held crafted mods against the same cap, so no route can END past it, whether
   * or not a free slot lets the stray ride along — but the ROUTE can be one the game refuses, and it is
   * the cheap one, because the essence's own swap does some of the annulling for free. So the quoted
   * cost comes in low.
   *
   * Only refused when an essence target is asked. With none, no perfect-essence action is ever built
   * (`perfectTargets` is empty), the held mod is ordinary junk, and the model is already right — a
   * blanket refusal would decline a craft it handles correctly.
   *
   * REFUSING rather than modelling, deliberately. Fixing it properly needs a state axis of its own
   * (the desecration flag cannot be reused: it means "a bone placed this"), and this is unreachable
   * from the UI — the item builder offers only rollable and desecrated mods, so a crafted share link
   * is the only way in. The linear planner has no such gap: it plans a fixed sequence over concrete
   * mods, so it annuls the held essence before applying the new one, and `ItemActions` renders this
   * reason beside those routes exactly as it already does for a Magic start.
   */
  if (craftedTargets > 0) {
    const strays = [...start.prefixes, ...start.suffixes]
      .map((p) => data.mods.get(p.modId))
      .filter((m) => m !== undefined && isEssenceMod(m) && !idxOf.has(m.id));
    // Held crafted modifiers count toward the same cap as the targets. Under the cap there is nothing
    // to refuse: every route the model can build still ends within `limits.crafted`.
    const stray = craftedTargets + strays.length > limits.crafted ? strays[0] : undefined;
    if (stray) {
      return fail(`${stray.id} is already on the item, and an item holds ${limits.crafted} crafted `
        + 'modifier(s) — Essence, Perfect Essence or Alloy — so remove it, or make it the target');
    }
  }

  // A rollable target that can never roll (weight 0 even at base strength, the most permissive) is
  // impossible. Desecrated targets don't roll from the normal pool, so the pool check above covers them.
  const ungettable = cands.find((c) => c.mod.source === 'normal' && modTierWeight(c.mod, 0, level, c.minIndex) === 0);
  if (ungettable) return fail(`${ungettable.mod.id} can't roll at item level ${level}`);

  const side = sideIndexOf(list);
  /** What finishing in `s` still costs: nothing, or with `fillOnFinish` one Exalt per empty slot. */
  const exaltPrice = prices.currency['exalt'];
  if (opts.fillOnFinish && !(exaltPrice !== undefined && Number.isFinite(exaltPrice) && exaltPrice >= 0)) {
    return fail('filling the finished item needs an Exalted Orb price, and the sheet has none');
  }
  const fillCostOf = (s: McState): number => (opts.fillOnFinish
    ? ((limits.prefixes - prefUsed(s, side)) + (limits.suffixes - sufUsed(s, side))) * exaltPrice!
    : 0);

  /*
   * …and the OTHER half of the same idea: positions that cannot merge, because their families differ,
   * but that nothing downstream can tell apart anyway.
   *
   * `Gain % as Extra Cold` and `… Lightning` each occupy their own family, so they can sit on the item
   * together and the pool loses a different mod depending on which lands — they must keep separate
   * bits. But if the data says those two mods are the same size in every pool at every floor (and on
   * 0.5.0 Wands it does: sole members of their families, identical tier tables), then "Cold present,
   * Lightning blocked" and "Cold blocked, Lightning present" are one situation spelt two ways. The
   * encoder below picks one spelling and the lattice carries only that, which is worth ~2.7x on a
   * three-way group.
   *
   * `encode` is `encodeState` itself when nothing qualifies, so every craft that predates this pays
   * nothing — not even a branch.
   */
  const classes = permutationClasses({ data, pools, level, sameSide: siblings.sameSide }, list, slots);
  const encode = encoderFor(classes);
  /*
   * …and an essence twin's position is never blocked (only its own Essence can occupy a crafted family)
   * and at most one is ever present, on a Rare (an Essence needs a Magic item, and leaves it Rare). The
   * states that break those rules are unreachable, and `actionsOf` is the cost of every state built. Only
   * twins are pruned, so a craft without them keeps its lattice exactly.
   */
  const twinMask = list.reduce((m, t, i) => (t.twin ? m | bit(i) : m), 0);
  const canonical = canonicalFilterFor(classes);
  const onlyCanonical = twinMask === 0 ? canonical
    : (present: number, blocked: number, rarity: McRarity): boolean =>
      (blocked & twinMask) === 0 && popcount(present & twinMask) <= (rarity === 'rare' ? 1 : 0)
      && (canonical ? canonical(present, blocked) : true);

  const s0 = classifyStart(data, start, list, idxOf, siblings.blocks);

  /**
   * A regular Essence needs a MAGIC item, so a held Rare can never apply one.
   *
   * `enumerateStates` gives a Rare start the single `['rare']` rung, so no Magic state exists and the
   * essence action is never built — the craft is genuinely unreachable rather than merely dear. Without
   * this the solve dies as the generic "no policy reaches the target", which tells the reader nothing
   * they can act on. Named here instead, with the rule that causes it.
   *
   * Only when the target is NOT already satisfied: an essence mod sitting on the Rare at or above its
   * wanted tier is simply `present` in `s0`, and that craft needs no Essence at all.
   */
  if (start.rarity === 'rare') {
    const stuck = list.findIndex((t, i) => representative(t).source === 'essence' && !has(s0.present, i));
    if (stuck >= 0) {
      const mod = representative(list[stuck]!);
      return fail(`${mod.id} can only be added by a regular Essence, which needs a Magic item — `
        + 'this one is already Rare, so no route reaches it (a Perfect Essence works on a Rare, '
        + 'a regular one does not)');
    }
  }
  // Where "start over" lands: the item you began with, which for a from-white craft is the bare base.
  // Built here rather than later because the action space closes over it.
  const restartKey = encode(s0.present, s0.blocked, s0.jp, s0.js, s0.flagged, s0.rarity);

  /**
   * The item already IS the target. Answer here, before a lattice exists.
   *
   * Not a micro-optimisation — it is reachable in two clicks and it was costing real time. The Item
   * tab's **Copy my current mods** sets every target to `tiers.length`, the WORST tier, so whatever
   * you hold satisfies it by construction; Compute then solved the whole state space to reach zero.
   * Measured on a finished 6-mod Wand: **16.3 s on Standard and 71.1 s on Exhaustive**, and Standard
   * ran out of clock on the way, so it came back `bound: 'lower'` on a cost of zero and the panel
   * rendered "≥ 0 ex" under the heading `True expected cost`. The step planner beside it has always
   * short-circuited this (`fromItem.ts`, the `steps: []` frontier) — only the MDP did the work.
   *
   * `isAccepting` is the same predicate `goalKeys` is built from below — same `spare` and all — so this
   * cannot disagree with the solver about what "finished" means: zero blocked, Rare, and no more junk
   * than the free slots allow.
   *
   * The node is built exactly as the graph BFS builds one, from `s0` rather than from constants. That
   * mattered before as a way to keep one construction instead of two that could drift apart, and it
   * matters more now: with a free slot the finished item may genuinely carry junk, so `junkPrefixes`
   * and `junkSuffixes` are read off `s0` rather than assumed empty. Start and goal are the same square, so there
   * is nothing to walk: no edges, and an empty policy (which is also what a test can assert on to
   * prove the lattice was never built, without timing anything).
   */
  if (isAccepting(s0, slotMasks, spare, siblings.obstacles)) {
    return answered({
      expectedCost: fillCostOf(s0),
      feasible: true,
      converged: true,
      bound: 'exact',
      nodes: [{
        key: restartKey,
        present: list.filter((t, i) => !t.obstacle && has(s0.present, i)).map(idsOf),
        blocked: list.filter((_, i) => has(s0.blocked, i)).map(idsOf),
        ...(list.some((t, i) => t.obstacle && has(s0.present, i))
          ? { obstacles: list.filter((t, i) => t.obstacle && has(s0.present, i)).map(idsOf) } : {}),
        junkPrefixes: s0.jp,
        junkSuffixes: s0.js,
        rarity: s0.rarity,
        ...flagFieldsOf(s0, list.map(idsOf), siblings.obstacles),
        isStart: true,
        isGoal: true,
        depth: 0,
        expectedCost: fillCostOf(s0),
        visitRate: 1,
      }],
      edges: [],
      policy: new Map(),
    });
  }

  return {
    data, start, prices, level, baseLimits, limits, spare, pools, locked, list, n, slots, slotMasks, siblings,
    idsOf, desecratedBit, conflicts, idxOf, side, exaltPrice, fillCostOf, classes, encode, onlyCanonical, s0,
    restartKey, desecratable,
  };
}

/** What the later phases read: everything `resolveProblem` settled. */
export type McProblem = Exclude<ReturnType<typeof resolveProblem>, Answer>;
