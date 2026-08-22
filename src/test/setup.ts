import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

/**
 * jsdom has no `Worker`, and the app now runs every solve in one (the from-item planner blocks for
 * seconds, which used to freeze the tab). Without a stand-in, merely MOUNTING EngineLab or ItemActions
 * throws, because both prewarm the worker on load.
 *
 * So: a Worker that isn't one. It speaks the same message protocol as `engine.worker.ts` but runs the
 * solve in-process. That keeps the component tests exercising the real path — `runSolve`, the request
 * shapes, the progress messages, the id-keyed replies — rather than mocking the whole thing away, and
 * it lets `vi.mock('../../lib/engine')` in those tests still reach the planners, since this resolves
 * the same module specifier they do.
 *
 * The imports are dynamic and deliberately deferred to postMessage time: at module scope they would
 * load before a test file's `vi.mock` factories are registered, and the tests' engine stubs would be
 * bypassed.
 */
class InProcessWorker implements Partial<Worker> {
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: ErrorEvent) => void) | null = null;
  private alive = true;

  async postMessage(msg: { id: number; req: unknown }): Promise<void> {
    const emit = (data: unknown): void => {
      // A terminated worker is silent — that is what makes cancellation work in the real client.
      if (this.alive) this.onmessage?.({ data } as MessageEvent);
    };
    try {
      const [{ runSolve }, { loadEngine }] = await Promise.all([
        import('../lib/solve'),
        import('../lib/engine'),
      ]);
      const eng = await loadEngine();
      const result = runSolve(eng, msg.req as never, (progress) => emit({ id: msg.id, type: 'progress', progress }));
      emit({ id: msg.id, type: 'done', result });
    } catch (err) {
      emit({ id: msg.id, type: 'error', message: err instanceof Error ? err.message : String(err) });
    }
  }

  terminate(): void { this.alive = false; }
  addEventListener(): void {}
  removeEventListener(): void {}
}

(global as any).Worker = InProcessWorker;
