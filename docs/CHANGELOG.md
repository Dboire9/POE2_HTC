# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-02

The release that retires the backend. **0.9.7 was a Java service** — a beam search behind an HTTP API,
with a thread pool sized down to stop it saturating a 2-core box and a connection leak fixed the week
before. **1.0.0 is a pure client-side TypeScript engine** that computes exact analytic probabilities,
prices every plan against live market data, and solves the craft as a Markov decision process that
ends on a proof of optimality rather than a tolerance. No server, no account, nothing to install.

It also says what it does not know. Where a number rests on an assumption the app labels it; where a
solve ran out of time it prints a bound with the inequality the right way round; where a route exists
that the planner does not search, the copy says so rather than calling it impossible.

### Added

- **A true expected cost, and the policy that achieves it.** The craft is modelled as an MDP over
  `(present, blocked, junk prefixes, junk suffixes, desecration flag, rarity)` and solved by policy
  iteration, so a converged answer is exact rather than within a tolerance. Measured over 18 realistic
  crafts and 108 solves, policy iteration resolved every craft it could start, and produced a ceiling
  **zero** times where value iteration produced one on up to 6. The optimal policy is drawn as a graph
  you can click through.
- **A cost ↔ probability frontier**, priced in Exalted-Orb equivalents: the cheapest route, the surest
  route, and the real trades between them, with per-step odds.
- **"I already have this item"** — per-currency odds for the item in your stash, and a planner that
  keeps the mods you started with instead of costing a craft from a blank base.
- **Budget mode.** "I have 200ex — what is the closest thing I can actually finish?", answered with the
  probability of finishing inside the budget rather than an expected cost that busts half the time.
- **Orb strengths on both planners.** Basic, Greater and Perfect are searched for every add currency,
  decided per step by a backward dynamic program rather than enumerated — which is what made the axis
  affordable at all (see *Changed*).
- **Currency exclusions.** Tick what you do not own and the search prunes it, so an excluded currency
  can never reach the frontier.
- **Interchangeable target slots** — "increased Cold **or** Lightning damage, either one" — with the
  state-space reduction that makes them cost about what one mod costs.
- **Desecration**, in full: the bone that matches your gear, the three boss omens (Weapon or Jewellery
  only, as the game has it), the untargeted draw that armour is limited to, and the rule that a bone
  **offers three modifiers and you keep one**, which is worth about 3x and is evaluated inside value
  iteration rather than folded into a distribution in advance.
- **Essences**, both grades. A regular Essence needs a Magic item and converts it; a Perfect Essence
  works on a Rare and swaps. Which level to buy is chosen by price, not by tier index — the sheet is
  not monotone in level for 83% of essences, and choosing by price moved the quoted cost of the 317
  essence targets from 8,595.8 ex to 646.6 ex.
- **Omen of Whittling** — the Chaos Orb that removes your lowest-**level** modifier. It appears as its
  own row beside the plain Chaos route.
- **Omen of Greater Exaltation** — one Exalted Orb landing two modifiers. Worth 42% off the cheapest
  route on a 6-target T1 Wand craft. The true-cost model deliberately does not use it: that model
  re-decides after every orb, and this omen is a promise not to.
- **Belts**, so every equipment slot is now supported. One base, because all 20 of the game's belt
  bases carry a byte-identical craftable pool.
- **Every solve runs in a Web Worker**, with a real progress bar and a working Cancel.
- **Share links and workspace persistence** — a craft survives a reload and travels as a URL.
- **Search effort presets** (Quick / Standard / Exhaustive), rendered on every tab that obeys them.
- **A self-refreshing price sheet.** `refresh-prices.yml` pulls poe.ninja daily and **merges its own
  pull request** when the data passes a market-depth check; a failed check leaves the PR open, titled
  `REVIEW NEEDED`. Depth is units traded per day, not the raw volume field, which is divine-denominated
  and ranks liquidity backwards.
- **Five browser tests**, the first this project has had: a cold load with zero console errors, a Lab
  compute, an Item compute, a share-link round trip and a mobile pass, run against the built site with
  its real security headers.
- **A linter in CI** (ESLint, type-checked rules), and three separate type-checks rather than one.
- **Error reporting worth reading** — source maps, and worker errors carried to the main thread so a
  crash in the hardest code in the app is no longer just a progress bar that stopped.

### Changed

- **The engine is analytic, not a search.** Probabilities come from exact weight-pool math anchored to
  frozen golden fixtures from the retired Java engine; Monte-Carlo is used to validate, not to answer.
- **Orb strength is decomposed, not enumerated.** A step's strength and omens change its price and its
  odds and nothing else, so the item trajectory is fixed by the sequence alone. That rewrites the cost
  as a suffix product and turns a `3^m` product into a backward DP whose pruning is exact. The result
  searched **192x more assignments while running 3.3–3.5x faster**, and from a white base 19–66x
  faster. It also changed answers: the old throttle deleted the cheap end of the frontier, and a
  6-target T1 craft's cheapest plan went from 42.7 billion ex to the real 2.47 billion.
- **A fixed policy is costed in closed form** rather than iterated to. A 3-target T1 craft fell from
  60.1s to 2.3s, and a 6-target T2 craft that used to run ~1,000s to a ceiling now returns an exact
  answer in 292s.
- **The solver never sees two spellings of one move**, which recovered 23–31% of its work.
- **The budget search screens before it settles** — 3.4–3.7x, with byte-identical rows.
- **Prices are live poe.ninja data**, including omens (which are served under Ritual, not Omens) and
  1,288 per-essence entries. Costs display on a unit ladder chosen per view, with the exact figure
  always in a tooltip.
- **The patch data the browser downloads is derived from the repo's copy, not identical to it** —
  minified and projected onto exactly the fields the app reads. 137,701 → 65,013 bytes over the wire
  (−52.8%), and first load −26.6%.
- **Sentry loads lazily**, keeping 90 kB gzip off the critical path.
- The header no longer says BETA, and its version number is read from the manifest instead of being
  restated in the source.

### Removed

- **The Java backend** (`src/main/java/`, `pom.xml`) and with it the HTTP API, the thread pool and the
  connection lifecycle. Its validation legacy survives as frozen golden fixtures the engine is still
  differentially tested against.
- **The Electron desktop build.** Chromium blocks module Workers from the `file://` origin a packaged
  app loads from, so the desktop wrapper and the solver could not coexist; the wrapper was the part
  not worth keeping.
- The orb-strength throttle and its `CurrencyDepth` badge, which described a ladder rung rather than
  what was searched, and a `maxPlans` dial that no longer moved anything.

### Fixed

- **A Chaos Orb's strengths were free.** `chaos_greater` and `chaos_perfect` are real listings and the
  engine had always honoured their ilvl floor, but the pricing key did not — a tiered Chaos billed at
  33.39 ex instead of 2,058, a 62x underquote, and "I don't own Perfect Chaos" did nothing.
- **A mid-plan add was placed at the worst tier a mod has**, regardless of what the step asked for.
  Invisible until a placed tier became an input to a probability.
- **Boss-omened Desecration was reported as impossible for 342 of 527 desecrated mods**, because the
  unomened draw was missing from one planner.
- **A malformed share link white-screened the app**, and a well-formed one with a wrong type escaped
  into app state and threw on Compute.
- **A league rollover would have priced essences at zero**, which the optimizer reads as free.
- The desecrated spawn weight was refitted on modifiers rather than offers — the earlier reading
  overstated it by 50%.

### Security

- A Content-Security-Policy served as a real response header, pinned by a test that fails if a `<meta>`
  tag reappears to shadow it.
- `npm audit` clean; the release workflow's third-party action is pinned to a commit rather than a
  mutable tag.

## [0.9.4] - 2025-11-28

### Added
- Web application deployment at poe2htc.com
- Buy Me a Coffee support button
- Desktop app download button
- BETA badge on title
- SEO optimization (meta tags, Open Graph, Twitter Cards)
- robots.txt and sitemap.xml for search engines

### Changed
- Increased header button sizes for better visibility
- Improved social media sharing previews

### Removed
- Check Updates button (replaced with Desktop App download)

### Security
- Added security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- Implemented path traversal protection
- Added Nginx rate limiting (10 req/s)
- SSL/TLS configuration with ZeroSSL

## [0.9.0] - 2025-01-15

### Added
- Comprehensive documentation suite:
  - USER_GUIDE.md - Complete step-by-step usage instructions
  - DEVELOPMENT.md - Full development setup and contribution guide
  - ALGORITHM.md - In-depth explanation of Beam Search implementation
  - ABOUT.md - Project story, motivation, and developer background
  - CODE_OF_CONDUCT.md - Community guidelines
  - SECURITY.md - Security policy and reporting
- Report Bug button in header with GitHub Issues link
- Discord community link for support
- External link support in Electron with WSL fallback
- Tier value display in modifier selection dropdown
- Direct value display for single-tier modifiers
- Support for perfect essence modifiers (Hysteria, Horror)

### Changed
- Restructured README with summary+detailed-docs pattern
- Condensed README sections with links to comprehensive docs
- Improved "About Me & the Project" section
- Enhanced installation instructions with code signing notice

### Fixed
- Tier ordering to match PoE convention (T1 = best)
- Modifier selection logic for essence vs normal variants with same display text
- React key uniqueness warnings in modifier lists
- External URL opening in Electron on WSL environments
- Java code quality warnings (unused imports, variables)
- TypeScript compilation errors in SimulationContext and Sentry

### Documentation
- Complete algorithm deep-dive with examples and complexity analysis
- Step-by-step user guide with screenshots and troubleshooting
- Comprehensive development guide for contributors
- Personal story and project philosophy

## [0.5.9] - 2024-11-24

### Added
- Bundled JRE 21 with application for Java-free operation
- Auto-detection of bundled vs system Java
- Windows installer with all dependencies included

### Fixed
- Java not found errors on systems without Java installed
- Backend startup issues on fresh Windows installations

## [0.5.8] - 2024-11-24

### Added
- Comprehensive error logging to poe2htc.log file
- User-facing error dialogs with log file paths
- Detailed logging for backend startup process
- Timestamp-based logging for debugging

### Changed
- Improved error handling during application startup
- Better error messages for users

## [0.5.7] - 2024-11-20

### Added
- Auto-update functionality for Windows and Linux
- GitHub Actions workflow for automated releases
- Version checking and update notifications

### Changed
- Improved release build process
- Better artifact handling for distributions

## [0.5.0] - 2024-11-15

### Added
- Electron desktop application wrapper
- Modern React 19 UI with shadcn/ui components
- Real-time modifier selection with live updates
- Support for all crafting currencies and essences
- Omen support in crafting paths
- Probability calculations for each crafting step

### Changed
- Migrated from JavaFX GUI to Electron + React
- Redesigned user interface for better usability
- Improved performance with multithreaded backend

## [0.4.0] - 2024-11-01

### Added
- Desecrated currency support
- Essence modifier system
- Family conflict detection
- Global probability threshold system

### Fixed
- Probability calculation accuracy
- Memory leaks in beam search algorithm

## [0.3.0] - 2024-10-15

### Added
- Beam search algorithm for crafting path optimization
- Support for all Path of Exile 2 item types
- Modifier tier system
- Regal and Exalted orb probability calculations

### Changed
- Improved algorithm performance by 300%
- Refactored modifier class structure

## [0.2.0] - 2024-09-20

### Added
- Basic crafting path calculation
- Simple probability model
- JavaFX-based GUI

### Fixed
- Modifier weight calculation errors

## [0.1.0] - 2024-09-01

### Added
- Initial project setup
- Core modifier system
- Basic item class definitions
- Maven project structure
- Command-line interface for testing

---

## Release Notes Template

```markdown
## [X.X.X] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Vulnerability fixes
```
