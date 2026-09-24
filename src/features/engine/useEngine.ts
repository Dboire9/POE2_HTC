import { useCallback, useEffect, useState } from 'react';
import { listBases, loadEngine, type Engine } from '../../lib/engine';
import { prewarm } from '../../lib/engineClient';
import { useField } from '../../lib/workspace';

/**
 * The patch data and price sheet, for a screen that needs them — and the solver worker started
 * alongside the load, so the first Compute does not also pay for spinning one up and fetching the
 * snapshot into it.
 *
 * `onLoad` runs once the engine is there (the gear tabs default their base from it). Pass a STABLE
 * function: the load re-runs when it changes.
 */
export function useEngine(onLoad?: (eng: Engine) => void): { readonly engine: Engine | null; readonly loadErr: string | null } {
  const [engine, setEngine] = useState<Engine | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  useEffect(() => {
    prewarm();
    loadEngine()
      .then((eng) => { setEngine(eng); onLoad?.(eng); })
      .catch((e: unknown) => setLoadErr(e instanceof Error ? e.message : String(e)));
  }, [onLoad]);
  return { engine, loadErr };
}

/**
 * An `onLoad` for `useEngine` that gives a tab its default base, Wands.
 *
 * Only DEFAULT the base — never overwrite one restored from the workspace, or a reload would silently
 * drag the user back to Wands.
 */
export function useDefaultBase(section: 'lab' | 'item'): (eng: Engine) => void {
  const [, setBaseId] = useField(section, 'baseId');
  return useCallback((eng: Engine) => {
    const bases = listBases(eng.data);
    setBaseId((b) => b || bases.find((x) => x.id === 'Wands')?.id || bases[0]?.id || '');
  }, [setBaseId]);
}
