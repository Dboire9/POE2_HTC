# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
