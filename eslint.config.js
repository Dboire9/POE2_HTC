// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

/**
 * Flat ESLint config.
 *
 * `tsc` catches type errors and nothing else — not an unused import, not an `any` that crept into a
 * test, not a `console.log` left in a source file, not a floating promise. With nearly every commit
 * here AI-assisted, that is precisely the drift this codebase accumulates, and until 2026-09-01 it was
 * being removed by hand after each edit because nothing else would have.
 *
 * TWO STRICTNESS TIERS, matching the tsconfigs rather than inventing a third opinion:
 *
 *   packages/**  →  strictTypeChecked. These already compile under `noUncheckedIndexedAccess` and
 *                   `exactOptionalPropertyTypes`; they are pure, dependency-free, and the place where
 *                   a silent numeric or nullability slip would corrupt a probability rather than
 *                   break a render. They get the strictest rules available.
 *   src/**       →  recommendedTypeChecked, plus the React Hooks rules. The root tsconfig is looser,
 *                   and JSX code legitimately does things (event handlers returning promises, `any`
 *                   from third-party component props) that strictTypeChecked would flag by the
 *                   hundred without finding a real defect.
 *
 * `projectService` rather than an explicit `project` list: each package carries its own tsconfig with
 * its own strictness, and the service resolves the nearest one per file. Naming them by hand would go
 * stale the first time a package is added.
 */
export default tseslint.config(
  {
    // Generated, vendored, or not ours. `target/` is the retired Java build output still on disk.
    ignores: ['dist/**', 'node_modules/**', 'target/**', 'coverage/**', 'data/**', 'public/**'],
  },

  js.configs.recommended,

  // The TypeScript parser, and the project service that types it. Applied to every .ts/.tsx file
  // before the tier blocks below, so a file outside `src/` and `packages/` (vite.config.ts, say) is
  // still PARSED as TypeScript even though no tier claims it — otherwise espree chokes on the first
  // type annotation and reports it as a syntax error.
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: {
          // Config files sit outside every tsconfig `include`. Lint them, but untyped — pulling them
          // into a project would mean editing tsconfigs to satisfy a linter, which is the tail
          // wagging the dog.
          allowDefaultProject: [
            'vitest.config.ts', 'vite.config.ts',
            // Measurement and cross-check scripts, run ad hoc with `node --experimental-strip-types`.
            // They belong to no build, so no tsconfig includes them.
            'scripts/*.mts',
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // ---- packages/: the engine and the optimizer -------------------------------------------------
  {
    files: ['packages/**/*.ts'],
    extends: [...tseslint.configs.strictTypeChecked],
    rules: {
      // The engine's hot loops are written for speed and read like maths. `for (let i = 0; ...)` over
      // a preallocated array is deliberate there, and a rule that pushed it toward `.map()` would cost
      // measured time in `planCostCdf` and value iteration.
      '@typescript-eslint/prefer-for-of': 'off',
      // A non-null assertion in this codebase is nearly always a bounds fact the type system cannot
      // see (`tiers[0]!` after a `length === 0` guard). `noUncheckedIndexedAccess` is what makes them
      // necessary; banning them would push the code toward `?? throw` noise on every array read.
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      // `${count} states`, `${ilvl}` — a number in a template is this codebase's normal way of
      // building a diagnostic message, and there is no coercion hazard in it. The rule's real catch
      // (an object stringifying to "[object Object]") stays on.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },

  // ---- src/: the React app ---------------------------------------------------------------------
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      globals: { ...globals.browser },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },

  // ---- tests -----------------------------------------------------------------------------------
  {
    files: ['**/*.test.{ts,tsx}', '**/*.differential.test.ts', 'src/setupTests.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // A test may reach past a public boundary on purpose — casting an internal shape to probe a
      // guard, or building a deliberately malformed input to prove it is rejected. That is the test
      // doing its job, not a type-safety lapse in shipped code.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      // Measurement harnesses print their numbers; that is the point of them.
      'no-console': 'off',
    },
  },

  // ---- Node scripts and config files -----------------------------------------------------------
  // These run under node, not in a browser, and are not part of any tsconfig project. The
  // `disableTypeChecked` spread comes FIRST: it carries its own `languageOptions`, so spreading it
  // after the globals below would silently replace them and every `console` would read as undefined.
  {
    files: [
      'tools/**/*.{mjs,js}', 'scripts/**/*.{mjs,js,mts}', '*.config.{js,ts}', 'eslint.config.js',
    ],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      ...tseslint.configs.disableTypeChecked.languageOptions,
      globals: { ...globals.node },
    },
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      // A refresh script's console output IS its interface — the price-refresh workflow pipes it
      // straight into the pull-request body.
      'no-console': 'off',
    },
  },
);
