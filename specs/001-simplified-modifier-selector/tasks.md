# Tasks: Simplified Modifier Selector

**Input**: Design documents from `/specs/001-simplified-modifier-selector/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅, quickstart.md ✅

**Tests**: Tests are OPTIONAL and NOT included in this task list as the specification does not explicitly request TDD approach.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **Checkbox**: Always starts with `- [ ]` (markdown checkbox)
- **[ID]**: Sequential task number (T001, T002, T003...) in execution order
- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3) - only for user story phases
- **Description**: Clear action with exact file path

## Path Conventions

Single project structure at repository root:
- `src/` - All source code
- `src/features/` - Feature-based organization
- `src/contexts/` - React Context providers
- `src/types/` - TypeScript type definitions
- `src/lib/` - Utility functions
- `src/components/ui/` - shadcn/ui components

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and TypeScript type foundation

**Duration**: ~1 hour

- [ ] T001 Create complete TypeScript type definitions in src/types/index.ts
- [ ] T002 [P] Install shadcn/ui Toast component with Sonner library for notifications
- [ ] T003 [P] Verify tsconfig.json has strict mode enabled with noImplicitAny and strictNullChecks

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utility functions and shared infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

**Duration**: ~1 hour

- [ ] T004 [P] Create modifier validation utilities in src/lib/modifierValidation.ts
- [ ] T005 [P] Create results sorting utility in src/lib/resultsSorting.ts
- [ ] T006 [P] Create error message mapping in src/lib/errorMessages.ts
- [ ] T007 [P] Add Spinner loading component in src/components/ui/spinner.tsx
- [ ] T008 Verify window.electronAPI types are defined in src/global.d.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Item Selection (Priority: P1) 🎯 MVP

**Goal**: Users can view and select an item type to craft, which is the foundational step enabling all subsequent workflows.

**Independent Test**: Launch application → View item list → Select an item → Confirm selection persists and displays correctly

**Duration**: ~1.5 hours

### Implementation for User Story 1

- [ ] T009 [US1] Create ItemsContext provider in src/contexts/ItemsContext.tsx
- [ ] T010 [US1] Implement loadItems() function calling window.electronAPI.invoke('api:items')
- [ ] T011 [US1] Implement selectItem() and clearSelection() actions in ItemsContext
- [ ] T012 [US1] Export useItems() custom hook from ItemsContext
- [ ] T013 [P] [US1] Create ItemCard component in src/features/items/ItemCard.tsx
- [ ] T014 [P] [US1] Create ItemList component in src/features/items/ItemList.tsx
- [ ] T015 [US1] Create ItemSelector main component in src/features/items/ItemSelector.tsx
- [ ] T016 [US1] Wrap ItemCard component with React.memo() for performance optimization
- [ ] T017 [US1] Wrap ItemList component with React.memo() for performance optimization
- [ ] T018 [US1] Add ItemsProvider to App.tsx context hierarchy
- [ ] T019 [US1] Integrate ItemSelector into App.tsx layout

**Checkpoint**: At this point, User Story 1 should be fully functional - users can select items and see visual feedback

---

## Phase 4: User Story 2 - Modifier Selection (Priority: P1) 🎯 MVP

**Goal**: Users can select desired prefixes (1-3) and suffixes (1-3) with incompatibility checking and selection limit enforcement.

**Independent Test**: Select an item (from US1) → View modifier lists → Select prefixes and suffixes → Confirm selections stored correctly and incompatible modifiers are disabled

**Duration**: ~2 hours

### Implementation for User Story 2

- [ ] T020 [US2] Create ModifiersContext provider in src/contexts/ModifiersContext.tsx
- [ ] T021 [US2] Implement loadModifiers(itemId) calling window.electronAPI.invoke('api:modifiers')
- [ ] T022 [US2] Build exclusion map using buildExclusionMap() from modifierValidation.ts
- [ ] T023 [US2] Implement selectModifier() with 3-item limit checking and toast notification
- [ ] T024 [US2] Implement deselectModifier() action in ModifiersContext
- [ ] T025 [US2] Implement isModifierDisabled() using exclusion map logic
- [ ] T026 [US2] Implement clearSelections() action in ModifiersContext
- [ ] T027 [US2] Export useModifiers() custom hook from ModifiersContext
- [ ] T028 [P] [US2] Create SelectionCounter badge component in src/features/modifiers/SelectionCounter.tsx
- [ ] T029 [P] [US2] Create ModifierCard component in src/features/modifiers/ModifierCard.tsx
- [ ] T030 [US2] Add Tooltip to ModifierCard explaining why modifiers are disabled
- [ ] T031 [US2] Create ModifierList component in src/features/modifiers/ModifierList.tsx
- [ ] T032 [US2] Create ModifierSelector main component in src/features/modifiers/ModifierSelector.tsx
- [ ] T033 [US2] Wrap ModifierCard with React.memo() using custom equality for complex props
- [ ] T034 [US2] Wrap ModifierList with React.memo() for performance optimization
- [ ] T035 [US2] Add ModifiersProvider to App.tsx context hierarchy (after ItemsProvider)
- [ ] T036 [US2] Integrate ModifierSelector into App.tsx layout
- [ ] T037 [US2] Add Toaster component to App.tsx for toast notifications

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - full item and modifier selection workflow functional

---

## Phase 5: User Story 3 - Launch Crafting Simulation (Priority: P1) 🎯 MVP

**Goal**: Users can launch crafting simulation and see optimal crafting paths ranked by success probability.

**Independent Test**: Select item (US1) → Choose modifiers (US2) → Click "Start Simulation" → Wait for results → View optimal crafting paths sorted by probability

**Duration**: ~2 hours

### Implementation for User Story 3

- [ ] T038 [US3] Create SimulationContext provider in src/contexts/SimulationContext.tsx
- [ ] T039 [US3] Implement startSimulation() with AbortController for cancellation support
- [ ] T040 [US3] Add 500ms debouncing to startSimulation() to prevent request spam
- [ ] T041 [US3] Call window.electronAPI.invoke('api:crafting') with SimulationRequest payload
- [ ] T042 [US3] Sort results using sortPathsByProbability() from resultsSorting.ts
- [ ] T043 [US3] Implement cancelSimulation() action in SimulationContext
- [ ] T044 [US3] Implement clearResults() action in SimulationContext
- [ ] T045 [US3] Export useSimulation() custom hook from SimulationContext
- [ ] T046 [P] [US3] Create SimulationTrigger button component in src/features/simulation/SimulationTrigger.tsx
- [ ] T047 [P] [US3] Create SimulationProgress loading component in src/features/simulation/SimulationProgress.tsx
- [ ] T048 [P] [US3] Create CraftingPathCard component in src/features/simulation/CraftingPathCard.tsx
- [ ] T049 [US3] Create ResultsDisplay main component in src/features/simulation/ResultsDisplay.tsx
- [ ] T050 [US3] Add validation to SimulationTrigger (disable if no modifiers selected)
- [ ] T051 [US3] Wrap CraftingPathCard with React.memo() for performance optimization
- [ ] T052 [US3] Wrap ResultsDisplay with React.memo() for performance optimization
- [ ] T053 [US3] Add SimulationProvider to App.tsx context hierarchy (after ModifiersProvider)
- [ ] T054 [US3] Integrate SimulationTrigger and ResultsDisplay into App.tsx layout

**Checkpoint**: All P1 user stories complete - Full MVP is now functional (Item → Modifier → Simulate → Results)

---

## Phase 6: User Story 4 - Error Handling and Validation (Priority: P2)

**Goal**: Users receive clear feedback when errors occur or invalid selections are made.

**Independent Test**: Attempt invalid actions (no item selected, no modifiers, backend unavailable) and confirm appropriate error messages appear

**Duration**: ~1 hour

### Implementation for User Story 4

- [ ] T055 [US4] Add error state handling to ItemsContext for backend unavailability
- [ ] T056 [US4] Add error state handling to ModifiersContext for invalid item ID
- [ ] T057 [US4] Add error state handling to SimulationContext for crafting failures
- [ ] T058 [US4] Map backend error codes to user-friendly messages using errorMessages.ts
- [ ] T059 [P] [US4] Add validation check to prevent proceeding without item selection
- [ ] T060 [P] [US4] Add validation check to prevent simulation without modifiers
- [ ] T061 [US4] Display error messages with recovery actions (retry, reset) in UI
- [ ] T062 [US4] Add timeout warning for simulations exceeding 30 seconds
- [ ] T063 [US4] Test error handling with backend unavailable scenario
- [ ] T064 [US4] Test error handling with incompatible modifiers scenario

**Checkpoint**: All user stories complete with robust error handling and validation

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

**Duration**: ~30 minutes

- [ ] T065 [P] Add useCallback to all event handlers across all contexts
- [ ] T066 [P] Add useMemo to expensive calculations (exclusion map, sorted results)
- [ ] T067 Verify all components are wrapped with React.memo() per constitution
- [ ] T068 Remove any console.log statements from production code
- [ ] T069 Run ESLint and resolve all warnings
- [ ] T070 Run npm run type-check and verify no TypeScript errors
- [ ] T071 Validate all 8 constitution principles are satisfied
- [ ] T072 Execute manual testing checklist from quickstart.md
- [ ] T073 Performance validation: verify < 16ms re-renders using React DevTools Profiler
- [ ] T074 Performance validation: verify < 100ms UI response time for interactions
- [ ] T075 [P] Update README.md with feature documentation
- [ ] T076 Commit all changes with descriptive commit message

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) completion - Can run in parallel with US1 if staffed
- **User Story 3 (Phase 5)**: Depends on US1 and US2 completion (needs item and modifier selection)
- **User Story 4 (Phase 6)**: Depends on US1, US2, US3 completion (adds error handling to all)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent after Foundational - Item selection foundation
- **User Story 2 (P1)**: Requires US1 context integration but implementation can start after Foundational
- **User Story 3 (P1)**: Requires US1 and US2 (needs both item and modifiers selected)
- **User Story 4 (P2)**: Requires US1, US2, US3 (adds error handling to all workflows)

### Within Each User Story

1. Context creation and state management first
2. API integration and data fetching
3. UI components (cards before lists, lists before main components)
4. React.memo() optimization
5. Integration into App.tsx
6. Validation and testing

### Parallel Opportunities Within Phases

**Phase 1 (Setup)**:
- T002 and T003 can run in parallel (different concerns)

**Phase 2 (Foundational)**:
- T004, T005, T006, T007 can all run in parallel (different files, no dependencies)

**Phase 3 (User Story 1)**:
- T013 and T014 can run in parallel (ItemCard and ItemList are independent)

**Phase 4 (User Story 2)**:
- T028 and T029 can run in parallel (SelectionCounter and ModifierCard are independent)

**Phase 5 (User Story 3)**:
- T046, T047, T048 can run in parallel (SimulationTrigger, SimulationProgress, CraftingPathCard are independent)

**Phase 6 (User Story 4)**:
- T059 and T060 can run in parallel (different validation checks)

**Phase 7 (Polish)**:
- T065 and T066 can run in parallel (different optimization types)
- T075 documentation work can run in parallel with performance validation

---

## Parallel Example: Foundational Phase

```bash
# Launch all foundational utilities in parallel:
Task T004: "Create modifier validation utilities in src/lib/modifierValidation.ts"
Task T005: "Create results sorting utility in src/lib/resultsSorting.ts"
Task T006: "Create error message mapping in src/lib/errorMessages.ts"
Task T007: "Add Spinner loading component in src/components/ui/spinner.tsx"
```

---

## Parallel Example: User Story 3

```bash
# Launch all independent UI components in parallel:
Task T046: "Create SimulationTrigger button component in src/features/simulation/SimulationTrigger.tsx"
Task T047: "Create SimulationProgress loading component in src/features/simulation/SimulationProgress.tsx"
Task T048: "Create CraftingPathCard component in src/features/simulation/CraftingPathCard.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 Only)

1. **Complete Phase 1: Setup** (~1 hour)
   - Type definitions ready
   - shadcn/ui Toast installed
   
2. **Complete Phase 2: Foundational** (~1 hour)
   - All utility functions ready
   - **CRITICAL GATE**: This MUST be complete before ANY user story work

3. **Complete Phase 3: User Story 1** (~1.5 hours)
   - Item selection working independently
   - **STOP and VALIDATE**: Test item selection workflow

4. **Complete Phase 4: User Story 2** (~2 hours)
   - Modifier selection working independently
   - **STOP and VALIDATE**: Test modifier selection workflow with US1

5. **Complete Phase 5: User Story 3** (~2 hours)
   - Simulation working end-to-end
   - **STOP and VALIDATE**: Test complete workflow (Item → Modifier → Simulate → Results)
   - **🎉 MVP COMPLETE**: Ready for demo/deployment

6. **Optional Phase 6: User Story 4** (~1 hour)
   - Enhanced error handling (nice-to-have, not blocking)

7. **Complete Phase 7: Polish** (~30 minutes)
   - Final optimization and validation

**Total Estimated Time**: 7-8 hours for experienced React + TypeScript developer

### Incremental Delivery Checkpoints

- **After Phase 2**: Foundation validated, ready for feature work
- **After Phase 3**: Item selection demoed independently
- **After Phase 4**: Item + Modifier selection demoed together
- **After Phase 5**: **FULL MVP READY** - Complete end-to-end workflow functional
- **After Phase 6**: Production-ready with robust error handling
- **After Phase 7**: Polished and optimized for deployment

### Parallel Team Strategy

With 2-3 developers working simultaneously:

1. **Together**: Complete Phase 1 (Setup) and Phase 2 (Foundational) - ~2 hours
2. **Split after Foundational complete**:
   - Developer A: Phase 3 (User Story 1 - Item Selection)
   - Developer B: Phase 4 (User Story 2 - Modifier Selection) *can start components in parallel*
3. **Integrate**: Developer A + B merge and test together
4. **Together**: Phase 5 (User Story 3 - Simulation) requires both US1 and US2
5. **Split again**:
   - Developer A: Phase 6 (User Story 4 - Error Handling)
   - Developer B: Phase 7 (Polish & Optimization)

**Team Time Savings**: ~4-5 hours with 2 developers (vs 7-8 hours solo)

---

## Constitution Compliance Checklist

All tasks designed to satisfy the 8 core principles:

- ✅ **Principle I - Type-Safe TypeScript**: Task T001 creates all type definitions, T070 validates no TypeScript errors
- ✅ **Principle II - Context-Based State Management**: Tasks T009-T012 (ItemsContext), T020-T027 (ModifiersContext), T038-T045 (SimulationContext)
- ✅ **Principle III - Feature-Based Organization**: Tasks organized in src/features/items/, src/features/modifiers/, src/features/simulation/
- ✅ **Principle IV - Performance Optimization**: Tasks T016-T017, T033-T034, T051-T052 wrap components with React.memo(), Tasks T065-T066 add useCallback/useMemo
- ✅ **Principle V - Electron-Desktop Integration**: Tasks T010, T021, T041 use window.electronAPI.invoke()
- ✅ **Principle VI - Modern UI with Tailwind & shadcn/ui**: Task T002 installs shadcn/ui Toast, all components use Tailwind classes
- ✅ **Principle VII - Real-Time User Feedback**: Tasks T023 (toast notifications), T030 (tooltips), T047 (loading indicators), T055-T061 (error messages)
- ✅ **Principle VIII - Separation of Concerns**: Contexts (state), Components (presentation), Lib (utilities) clearly separated

---

## Notes

- **[P] tasks**: Different files, can be executed in parallel if team capacity allows
- **[Story] label**: Maps task to specific user story (US1, US2, US3, US4) for traceability
- **File paths**: All paths are exact and match the structure defined in plan.md
- **Checkpoints**: Stop and validate after each phase to ensure independent story functionality
- **MVP scope**: Phases 1-5 constitute the complete MVP (User Stories 1, 2, 3)
- **Tests omitted**: Specification does not explicitly request TDD, so no test tasks included
- **Commit frequency**: Commit after completing each phase or logical group of tasks
- **Performance targets**: < 16ms re-renders, < 100ms UI response, < 2s TTI, validated in Phase 7
