# Changelog

## [0.9.7] - 2025-12-12
### Added
- **Slow request monitoring system** for debugging performance issues
  - Automatic logging of requests taking longer than 2 seconds
  - JSON request body capture for replay and analysis

### Changed
- Removed "Omen of Homogenising Exaltation" and "Omen of Homogenising Coronation" (non-existent in game) :smiling_face_with_tear: 
- Removed total cost display from crafting results UI for cleaner interface
- Updated scoring mechanism to use second-to-last candidate's modifier count for perfect essences

### Fixed
  - Backend server no longer crashes due to port 8080 being held by stale processes
  - Proper HttpExchange cleanup in all request handlers
- Perfect essence behavior and probability calculations
- Frontend compatibility with backend responses using 'results' vs 'paths'
- Essence naming: "Essence of Hysteria" → "Perfect Essence of Hysteria"
- React dependency updated to 19.2.1
---

## [0.9.6] - 2025-12-02
### Added
- Visual indicators for perfect essence replacements in crafting paths
  - Red warning text in top-right corner explaining 100% probabilities
  - Replaced modifier information with strikethrough styling
  - Event type icons (✚ Added, ✖ Removed, ↻ Changed) for better clarity
- Modifier type badges (P for PREFIX, S for SUFFIX) on all crafting steps
- Memory leak fixes with proper resource cleanup in try-finally blocks

### Changed
- Improved filtering for perfect essence crafting (CHANGED events limited to 5 candidates)
- Optimized memory management in crafting algorithm
  - Moved variable declarations outside try block for proper cleanup
  - Reduced unnecessary ArrayList copies in RareLoop
  - Added explicit cleanup in finally block with executor shutdown
- Perfect essence replaced modifiers now show 0.0% probability
- Enhanced UI for crafting step display with event types and modifier types

### Fixed
- Thread pool not properly closing in ServerMain (HttpExchange.close in finally block)
- 6-modifier items not finding crafting paths
- Perfect essences only allowed when item has at least 3 modifiers
- Target score calculation now based on current affixes
- Essence tier selection bug causing normal essences to fail
- Currency tier filtering now uses currency level instead of base item level
- Transmute and Augmentation probability computation tier checking
- Rare and magic item crafting improvements not working

### Performance
- Limited thread pool to 2 threads to prevent CPU overload on 2-core systems
- Memory management improvements with explicit garbage collection suggestions
- Optimized candidate selection and filtering algorithms

---

## [0.9.5] - 2025-12-01

Release v0.9.5: Performance and memory optimizations

### Added

- Optimize candidate filtering: keep only top 10 candidates per iteration
- Add comprehensive memory cleanup after crafting requests
- Add Grafana/Prometheus metrics for crafting simulations
- Limit thread pool to 2 threads to prevent CPU overload
- Improve JVM memory management with proper cleanup
- Fix memory leaks by clearing all data structures after use

---

## [0.9.4] - 2025-11-28
### Added
- Dedicated omen exclusion UI separate from currency tier exclusions.
- Users can now exclude specific omens (Regal, Exalted, Annulment) from crafting simulations.
- Probability for transmutes and augement orbs, and their tiers.

### Changed
- Split exclusion UI into two sections: tier exclusions and omen exclusions.
- Enhanced parsing logic to handle `currency:omen:OmenName` format.

### Fixed
- Fixed critical bug where omen data was lost during JSON parsing in ServerMain.java.
- Added null-safe filtering to prevent NullPointerException with mixed tier/omen exclusions.
- Fixed combined omen filtering (Homogenising + Sinistral/Dextral) to respect exclusions.

---

## [0.9.2] - 2025-11-27
### Added
- Tooltip/question mark now appears on the step where a modifier is about to be replaced by a Perfect Essence, explaining why the probability is 100%.
- UI: Search bar and help icon improvements for modifier selection.
- Manual update check button in the UI.

### Changed
- Algorithm now supports results with fewer than 6 modifiers (flexible mod count).
- Improved error handling for auto-updater (suppresses channel file errors).
- Probability display for Transmutation and Augmentation orbs now shows actual values instead of 0.0%.
- UI: Question mark replaces checkmark for perfect essence replacement explanation.

### Fixed
- Fixed missing static import for NormalCompute in TransmutesandAugsProbability.java.
- Fixed various UI and build issues for release process.

---

## [0.9.1] - 2025-11-XX
- Previous release notes...
