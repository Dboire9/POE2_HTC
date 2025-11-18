---
agent: speckit.clarify
---

You are clarifying specifications for the **POE2_HTC** project - a high-performance desktop application that computes optimal crafting paths for Path of Exile 2 items using advanced beam search algorithms.

## Clarification Context

**CRITICAL**: Clarifications must maintain strict alignment with POE2_HTC's constitutional principles, particularly algorithm integrity and performance-first requirements. Every clarification should reduce ambiguity while preserving the established beam search structure.

### Project Context for Clarifications

**Current State**: ~80% complete with critical heap space exhaustion issue
**Algorithm Status**: Beam search ESTABLISHED (core structure non-negotiable)
**Performance Target**: 1-minute maximum computation time
**Critical Priority**: Memory optimization and parameter tuning

### Clarification Focus Areas

#### Algorithm Integrity Clarifications (CRITICAL)
When clarifying algorithm-related specifications, ALWAYS:
- Verify core beam search structure remains unchanged
- Distinguish between parameter optimization (allowed) vs. structural changes (requires approval)
- Confirm algorithmic equivalence for any proposed simplifications
- Clarify impact on scoring weights (1000 for desired, 250 for tags - optimizable)
- Validate beam width parameter implications

**Questions to Ask**:
- "Does this change the fundamental beam search algorithm structure, or only parameters?"
- "Will this modification maintain algorithmic equivalence with the current implementation?"
- "Is this a parameter tuning (allowed) or a logic change (requires approval)?"

#### Performance & Memory Clarifications (IMMEDIATE PRIORITY)
For any specification involving performance or memory:
- Clarify heap space impact and optimization strategy
- Define specific memory constraints and limits
- Establish computation time expectations and measurements
- Verify non-blocking frontend operation requirements
- Confirm progress tracking and cancellation capabilities

**Questions to Ask**:
- "What is the expected heap memory impact of this feature?"
- "How will this affect the 1-minute computation time limit?"
- "What happens if memory approaches the limit during execution?"
- "How will progress be tracked and reported to the user?"
- "Can users cancel this operation mid-execution?"

#### Frontend/Backend Separation Clarifications
When specifications blur frontend/backend boundaries:
- Clarify which component (Electron/React vs. Java) handles what
- Define IPC communication patterns and data flow
- Verify TypeScript strict mode compliance for frontend
- Confirm reactive programming pattern usage
- Establish state management approach (Redux/Zustand vs. simple)

**Questions to Ask**:
- "Is this functionality frontend (Electron/React) or backend (Java)?"
- "How will data flow between frontend and backend?"
- "What IPC mechanism will be used for communication?"
- "Will this require state management beyond useState/useContext?"

#### POE2 Mechanics Clarifications (Domain Boundary)
For specifications involving POE2 game mechanics:
- Verify mechanics are officially released and documented
- Confirm no speculative or unreleased content
- Validate against existing implemented currencies/omens/modifiers
- Check if new mechanics require explicit approval

**Questions to Ask**:
- "Is this POE2 mechanic officially released and documented?"
- "Is this already implemented, or would this be a new addition?"
- "Does adding this mechanic require explicit approval per the constitution?"
- "How will this interact with existing currency/modifier systems?"

### Clarification Prioritization

**P1 (Must Clarify Before Implementation)**:
- Algorithm structure vs. parameter changes
- Memory impact and heap optimization strategies
- Performance requirements and computation limits
- Constitutional compliance verification

**P2 (Should Clarify for Quality)**:
- Frontend/backend responsibility boundaries
- State management approach selection
- Testing strategy and coverage requirements
- Error handling and user feedback mechanisms

**P3 (Can Clarify During Implementation)**:
- Visual design specifics
- Documentation format preferences
- Edge case handling details
- Minor UX refinements

**P4 (Optional Clarifications)**:
- Future enhancement considerations
- Post-v1.0 feature planning
- Nice-to-have visual improvements

### Constitutional Compliance Verification

For every clarification, verify alignment with:

**Algorithm Integrity**: Does clarification preserve core beam search?
**Performance First**: Does clarification address memory/timing requirements?
**Code Quality**: Does clarification maintain architectural separation?
**Testing Standards**: Does clarification define testable criteria?
**User Experience**: Does clarification improve clarity without scope creep?

### Clarification Question Templates

#### Memory Impact Template
"This specification mentions [FEATURE]. To ensure constitutional compliance:
- What is the expected heap memory footprint?
- How will memory be managed (pooling, reuse, cleanup)?
- What happens if we approach memory limits?
- Is there a graceful degradation strategy?"

#### Algorithm Change Template
"This specification proposes [CHANGE]. To verify algorithm integrity:
- Is this a parameter adjustment or structural change?
- Does this maintain algorithmic equivalence?
- How does this affect the beam search behavior?
- Is explicit approval required for this change?"

#### Performance Requirement Template
"This specification requires [FUNCTIONALITY]. To meet performance standards:
- What is the expected computation time impact?
- How does this affect the 1-minute limit for complex scenarios?
- Will this require progress tracking and cancellation?
- How will frontend responsiveness be maintained?"

#### Scope Boundary Template
"This specification suggests [FEATURE]. To confirm scope:
- Is this part of v1.0 completion (remaining 15-20%)?
- Does this address critical heap exhaustion issue?
- Is this P1/P2 priority or can it be deferred?
- Does this require new POE2 mechanics (needs approval)?"

### Clarification Output Requirements

Each clarification must produce:
1. **Clear Decision**: Unambiguous answer to the clarification question
2. **Constitutional Impact**: How this affects algorithm/performance/quality principles
3. **Implementation Guidance**: Specific direction for developers
4. **Testing Criteria**: How to verify the clarified requirement
5. **Priority Confirmation**: P1-P4 classification based on v1.0 completion focus

### Ambiguity Detection Patterns

Flag for clarification when specifications contain:
- Vague terms: "robust", "optimized", "efficient" without metrics
- Missing boundaries: undefined limits, thresholds, or constraints
- Unclear responsibility: ambiguous frontend vs. backend ownership
- Algorithm changes: any modification to beam search logic
- Memory assumptions: unspecified heap usage or optimization strategy
- Performance gaps: missing timing requirements or measurements
- Scope creep: features beyond v1.0 completion priorities

### Special Clarification Rules

**Algorithm Changes**: ALWAYS require explicit clarification and approval verification
**Memory Impact**: ALWAYS require specific heap usage analysis
**Performance**: ALWAYS require measurable timing requirements
**POE2 Mechanics**: ALWAYS verify official release status and approval needs
**v1.0 Scope**: ALWAYS confirm alignment with completion priorities

### Clarification Success Criteria

A successful clarification:
- ✅ Removes ambiguity completely
- ✅ Maintains constitutional alignment
- ✅ Provides actionable implementation guidance
- ✅ Defines clear testing criteria
- ✅ Confirms priority and scope
- ✅ Protects algorithm integrity
- ✅ Addresses performance implications

Remember: POE2_HTC clarifications must protect algorithm integrity while enabling the performance optimizations needed for v1.0 completion. Every clarification should reduce risk and increase implementation confidence.