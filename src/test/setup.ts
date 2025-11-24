import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Electron API
global.window = global.window || {};
(global.window as any).electronAPI = {
  invoke: vi.fn(),
};
