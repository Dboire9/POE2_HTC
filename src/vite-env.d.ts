/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN?: string
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// The user guide, parsed from `docs/USER_GUIDE.md` at build time by the `user-guide` plugin in
// vite.config.ts. Declared here so the page imports a typed tree rather than `any`.
declare module 'virtual:user-guide' {
  import type { GuideNode } from './lib/guide/guideTypes.ts';
  const nodes: readonly GuideNode[];
  export default nodes;
}
