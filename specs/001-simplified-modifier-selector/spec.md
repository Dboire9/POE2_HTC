# Feature Specification: Simplified Modifier Selector

**Feature Branch**: `001-simplified-modifier-selector`  
**Created**: 2025-11-21  
**Status**: Draft  
**Input**: User description: "Redo entirely the front end, i want like the current front end, but not currencies picker, i want just that you select the prefixes and the suffixes and launch the crafting simulator"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Item Selection (Priority: P1)

A user opens the application and needs to select which item type they want to craft. They browse through available items (e.g., bows, helmets, body armours) and select one to proceed to modifier selection.

**Why this priority**: Item selection is the foundational step - without selecting an item, no modifiers can be chosen. This is the absolute minimum viable product that enables any crafting workflow.

**Independent Test**: Can be fully tested by launching the application, viewing the item list, selecting an item, and confirming the selection persists and displays correctly. Delivers value by allowing users to identify what they want to craft.

**Acceptance Scenarios**:

1. **Given** the application is launched, **When** the user views the item selector, **Then** all available item types are displayed with clear names and icons
2. **Given** multiple item types are available, **When** the user clicks on an item, **Then** that item is selected and visually highlighted
3. **Given** an item is selected, **When** the user proceeds, **Then** the modifier selection interface loads with modifiers appropriate for the selected item type

---

### User Story 2 - Modifier Selection (Priority: P1)

A user who has selected an item now needs to choose which modifiers (prefixes and suffixes) they want on their crafted item. They can select multiple prefixes and multiple suffixes independently, seeing clear categorization and descriptions for each modifier.

**Why this priority**: Modifier selection is equally critical as item selection - the entire purpose of the application is to determine how to craft items with specific modifiers. Without this, the application has no purpose.

**Independent Test**: Can be fully tested by selecting an item (from US1), viewing the modifier lists, selecting desired prefixes and suffixes, and confirming selections are stored correctly. Delivers value by allowing users to define their crafting goals.

**Acceptance Scenarios**:

1. **Given** an item is selected, **When** the modifier selector loads, **Then** prefixes and suffixes are displayed in separate, clearly labeled sections
2. **Given** modifier lists are displayed, **When** the user views each modifier, **Then** modifier names, tier levels, and stat ranges are clearly visible
3. **Given** the user wants multiple prefixes, **When** they select up to 3 prefixes, **Then** each selection is highlighted and a counter shows X/3 selected
4. **Given** the user wants multiple suffixes, **When** they select up to 3 suffixes, **Then** each selection is highlighted and a counter shows X/3 selected
5. **Given** modifiers are selected, **When** the user deselects a modifier, **Then** it is removed from the selection and the counter updates accordingly
6. **Given** 3 prefixes are already selected, **When** the user attempts to select a 4th prefix, **Then** the system prevents the selection and displays a warning toast indicating the limit has been reached
7. **Given** a prefix is selected that conflicts with another modifier, **When** the modifier selector updates, **Then** incompatible modifiers are visually disabled with a tooltip explaining the conflict

---

### User Story 3 - Launch Crafting Simulation (Priority: P1)

A user who has selected an item and desired modifiers can now launch the crafting simulation to see optimal crafting paths. The simulation runs, provides progress feedback, and displays results showing the best strategies to achieve the desired modifiers.

**Why this priority**: This is the core value proposition - determining optimal crafting paths. Without this, the previous selections have no purpose. All three P1 stories form the complete minimum viable product.

**Independent Test**: Can be fully tested by selecting an item (US1), choosing modifiers (US2), clicking "Start Simulation", waiting for results, and viewing the optimal crafting paths. Delivers complete value by answering "how do I craft this item?"

**Acceptance Scenarios**:

1. **Given** item and modifiers are selected, **When** the user clicks "Start Crafting Simulation", **Then** the simulation begins and a loading indicator appears
2. **Given** the simulation is running, **When** computation is in progress, **Then** the user sees clear feedback (spinner, progress bar, or status text) indicating the system is working
3. **Given** the simulation completes successfully, **When** results are available, **Then** optimal crafting paths are displayed with step-by-step currency usage and probability percentages
4. **Given** results are displayed, **When** the user reviews multiple crafting paths, **Then** paths are ranked by success probability (descending) with the most reliable method shown first
5. **Given** the user wants to try different modifiers, **When** they return to modifier selection, **Then** previous selections are cleared and they can start fresh

---

### User Story 4 - Error Handling and Validation (Priority: P2)

Users receive clear feedback when errors occur or invalid selections are made. The system validates selections and provides helpful guidance to resolve issues before simulation.

**Why this priority**: While not blocking the core functionality, good error handling significantly improves user experience and reduces frustration. This can be added after core MVP is working.

**Independent Test**: Can be fully tested by attempting invalid actions (no item selected, no modifiers selected, backend unavailable) and confirming appropriate error messages appear.

**Acceptance Scenarios**:

1. **Given** no item is selected, **When** the user tries to proceed to modifier selection, **Then** a clear message prompts them to select an item first
2. **Given** an item is selected but no modifiers chosen, **When** the user clicks "Start Crafting Simulation", **Then** a message indicates at least one modifier must be selected
3. **Given** the backend is unavailable, **When** the user attempts any operation requiring backend communication, **Then** a friendly error message explains the issue and suggests checking connection or restarting
4. **Given** the simulation takes unusually long, **When** computation exceeds expected duration, **Then** the user receives progress updates or a timeout warning

---

### Edge Cases

- What happens when a user selects modifiers that are mutually exclusive or impossible to obtain together? **CLARIFIED**: Frontend will disable incompatible modifiers when one is selected, providing immediate feedback.
- How does the system handle very rare modifier combinations with extremely low probabilities (e.g., < 0.001%)? System will display all paths regardless of probability, with clear warning indicators for extremely rare combinations.
- What happens if the backend crashes mid-simulation? Error boundary will catch the failure and display recovery options (retry, reset selections).
- How does the system respond when no valid crafting path exists for the selected modifiers? Clear message explaining no path exists, with suggestions to try different modifier combinations.
- What happens if the user rapidly changes selections multiple times before simulation completes? Previous simulation is cancelled, new simulation queued with debouncing to prevent request spam.

## Clarifications

### Session 2025-11-21

- Q: When 3 prefixes are already selected and user attempts to select a 4th prefix, what should happen? → A: Prevent selection and show a warning toast message. User must manually deselect before adding new modifier.
- Q: Should the frontend proactively prevent selecting incompatible modifiers, or allow selection and let backend validate? → A: Frontend prevents by disabling incompatible modifiers when one is selected, providing immediate visual feedback and better UX.
- Q: What is the primary sorting criterion for displaying multiple crafting paths - highest success probability or lowest cost/effort? → A: Highest probability first. Paths sorted by success chance (descending) so users see the most reliable methods at the top.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all available item types from the backend in a browsable list
- **FR-002**: System MUST allow users to select exactly one item type at a time
- **FR-003**: System MUST load and display prefixes available for the selected item type
- **FR-004**: System MUST load and display suffixes available for the selected item type
- **FR-005**: System MUST allow users to select between 1 and 3 prefixes
- **FR-006**: System MUST allow users to select between 1 and 3 suffixes
- **FR-007**: System MUST visually distinguish between selected and unselected modifiers
- **FR-008**: System MUST prevent selection of more than 3 prefixes or 3 suffixes and display a warning toast when limit is reached
- **FR-009**: System MUST allow users to deselect previously selected modifiers
- **FR-017**: System MUST disable incompatible modifiers when a conflicting modifier is selected
- **FR-018**: System MUST provide tooltip explanations for why modifiers are disabled due to conflicts
- **FR-010**: System MUST provide a clear action button to start the crafting simulation
- **FR-011**: System MUST disable the simulation button when no modifiers are selected
- **FR-012**: System MUST communicate selected item and modifiers to the backend when simulation starts
- **FR-013**: System MUST display loading feedback while simulation is running
- **FR-014**: System MUST display simulation results including crafting steps and probabilities, sorted by success probability (descending)
- **FR-015**: System MUST handle backend errors gracefully with user-friendly error messages
- **FR-016**: System MUST allow users to reset selections and start a new simulation

### Assumptions

- **A-001**: The Java backend already provides endpoints for fetching items and modifiers (as seen in the existing codebase)
- **A-002**: The backend crafting simulation API accepts item ID and list of desired modifiers as input
- **A-003**: Users understand Path of Exile 2 crafting terminology (prefixes, suffixes, tiers)
- **A-004**: The application runs as an Electron desktop app with IPC communication (per constitution)
- **A-005**: The backend simulation typically completes within 30 seconds for most modifier combinations
- **A-006**: Users will primarily craft one item at a time (no batch crafting)
- **A-007**: Backend provides modifier incompatibility/exclusion rules that frontend can use to disable conflicting selections

### Key Entities

- **Item**: Represents a craftable item type (e.g., Bow, Helmet, Body Armour) with properties including name, type, and allowed modifiers
- **Modifier**: Represents a stat that can be rolled on an item, with properties including text description, tier level, stat ranges, and type (prefix or suffix)
- **Crafting Path**: The result entity representing a sequence of crafting steps with associated probabilities and currency costs
- **Simulation Request**: Data package sent to backend containing selected item ID and list of desired modifier IDs

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the full workflow (item selection → modifier selection → simulation launch → view results) in under 2 minutes for their first attempt
- **SC-002**: The interface responds to user interactions (clicks, selections) in under 100ms providing immediate visual feedback
- **SC-003**: 90% of users can successfully select their desired item and modifiers without requiring external help or documentation
- **SC-004**: Simulation results are displayed within 30 seconds for 95% of crafting requests
- **SC-005**: The application successfully handles at least 100 consecutive simulations without crashing or degrading performance
- **SC-006**: Users can distinguish between prefixes and suffixes at a glance within 3 seconds of viewing the modifier selector
- **SC-007**: Error messages, when they occur, enable users to resolve the issue and proceed successfully in at least 80% of cases
  
- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005**: System MUST [behavior, e.g., "log all security events"]

*Example of marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]
