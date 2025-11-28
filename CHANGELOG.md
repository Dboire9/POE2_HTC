# Changelog

## [0.9.3] - 2025-11-28
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
