/**
 * WASM Module Loader
 * Minimal TypeScript wrapper for POE2 Crafting Calculator WASM module
 */

type POE2Module = {
  ccall: (
    funcName: string,
    returnType: string | null,
    argTypes: string[],
    args: any[]
  ) => any;
  cwrap: (
    funcName: string,
    returnType: string | null,
    argTypes: string[]
  ) => (...args: any[]) => any;
};

let wasmInstance: POE2Module | null = null;

/**
 * Initialize WASM module (call once at app startup)
 */
export async function initWasm(): Promise<void> {
  if (wasmInstance) {
    return; // Already initialized
  }

  // Dynamic import to avoid bundling issues
  const createModule = await import('/wasm/poe2-calc.js');
  wasmInstance = await createModule.default();

  // Initialize the module
  wasmInstance.ccall('init_module', null, [], []);
  
  console.log('WASM module initialized');
}

/**
 * Get module info (version, item count, etc.)
 */
export function getModuleInfo(): { version: string; items: number; modifiers: number } {
  if (!wasmInstance) {
    throw new Error('WASM module not initialized. Call initWasm() first.');
  }

  const infoPtr = wasmInstance.ccall('get_module_info', 'string', [], []);
  return JSON.parse(infoPtr);
}

/**
 * Calculate crafting paths
 */
export interface CalcRequest {
  item_id: number;
  desired_mods: number[];
  num_threads?: number;
  max_iterations?: number;
}

export interface CalcResult {
  probability: number;
  currency_cost: number;
  attempts_needed: number;
  method_path: string;
}

export function calculate(request: CalcRequest): CalcResult[] {
  if (!wasmInstance) {
    throw new Error('WASM module not initialized. Call initWasm() first.');
  }

  // Set defaults
  const fullRequest = {
    ...request,
    num_threads: request.num_threads || navigator.hardwareConcurrency || 4,
    max_iterations: request.max_iterations || 10000,
  };

  // Call WASM function
  const jsonRequest = JSON.stringify(fullRequest);
  const resultPtr = wasmInstance.ccall('calculate', 'string', ['string'], [jsonRequest]);
  const response = JSON.parse(resultPtr);

  // Free WASM memory
  wasmInstance.ccall('free_string', null, ['number'], [resultPtr]);

  return response.results;
}

/**
 * Check if WASM is initialized
 */
export function isWasmReady(): boolean {
  return wasmInstance !== null;
}
