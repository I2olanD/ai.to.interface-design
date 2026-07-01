---
title: "OpenCode Compatibility for Prototype Skill"
status: draft
version: "1.0"
---

# Product Requirements Document

## Validation Checklist

### CRITICAL GATES (Must Pass)

- [x] All required sections are complete
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Problem statement is specific and measurable
- [x] Every feature has testable acceptance criteria (Gherkin format)
- [x] No contradictions between sections

### QUALITY CHECKS (Should Pass)

- [x] Problem is validated by evidence (not assumptions)
- [x] Context → Problem → Solution flow makes sense
- [x] Every persona has at least one user journey
- [x] All MoSCoW categories addressed (Must/Should/Could/Won't)
- [x] Every metric has corresponding tracking events
- [x] No feature redundancy (check for duplicates)
- [x] No technical implementation details included
- [x] A new team member could understand this PRD

---

## Output Schema

### PRD Status Report

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| specId | string | Yes | Spec identifier (NNN-name format) |
| title | string | Yes | Feature title |
| status | enum: `DRAFT`, `IN_REVIEW`, `COMPLETE` | Yes | Document readiness |
| sections | SectionStatus[] | Yes | Status of each PRD section |
| clarificationsRemaining | number | Yes | Count of `[NEEDS CLARIFICATION]` markers |
| acceptanceCriteria | number | Yes | Total testable acceptance criteria defined |
| openQuestions | string[] | No | Unresolved items requiring stakeholder input |

### SectionStatus

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Section name |
| status | enum: `COMPLETE`, `NEEDS_CLARIFICATION`, `IN_PROGRESS` | Yes | Current state |
| detail | string | No | What clarification is needed or what's in progress |

---

## Product Overview

### Vision

Any developer using an AI coding assistant can generate multi-variant UI prototypes with `/prototype`, regardless of whether they use Claude Code or OpenCode.

### Problem Statement

The `ai.to.prototype` prototype skill currently only works in Claude Code, distributed via the Claude Code marketplace. OpenCode — an open-source AI coding agent with growing adoption — supports the same SKILL.md format and skill discovery mechanism, but there is no installation path for OpenCode users. This means OpenCode users cannot access the prototype skill, limiting the plugin's reach to a single tool's ecosystem. The SKILL.md format is cross-compatible today, so this is purely a distribution and packaging gap — not a technical incompatibility.

### Value Proposition

By adding npm distribution alongside the existing Claude marketplace, the prototype skill becomes available to both Claude Code and OpenCode users with zero changes to the core skill logic. OpenCode users get a one-line config addition (`"plugin": ["ai-to-prototype"]`), Claude Code users keep their existing `claude plugin add --marketplace` workflow unchanged. One shared SKILL.md, two distribution channels, same prototyping experience.

## User Personas

### Primary Persona: OpenCode Developer
- **Demographics:** Frontend or full-stack developer, age 25-45, comfortable with terminal-based tools, has chosen OpenCode as their AI coding assistant. Configures tools via JSON config files. Uses npm daily.
- **Goals:** Rapidly prototype UI components with structural variety. Compare layout options visually in the browser. Work within their existing OpenCode workflow without switching tools.
- **Pain Points:** Cannot use the prototype skill because it's only distributed via the Claude Code marketplace. Must manually copy SKILL.md files from GitHub or go without. No standardized installation path for third-party skills in OpenCode beyond npm plugins.

### Secondary Personas

**Existing Claude Code User**
- **Demographics:** Current user of the prototype skill via Claude marketplace. Same developer profile as above but uses Claude Code.
- **Goals:** Continue using `/prototype` exactly as they do today. No disruption from the OpenCode compatibility changes.
- **Pain Points:** None — this persona's experience must remain unchanged. Any regression is a blocker.

**Multi-Tool Developer**
- **Demographics:** Developer who uses both Claude Code and OpenCode across different projects or machines.
- **Goals:** Have the prototype skill available in both tools without maintaining separate installations or configurations.
- **Pain Points:** Currently must install via marketplace for Claude Code but has no equivalent for OpenCode. Wants a single source of truth for the skill.

## User Journey Maps

### Primary User Journey: OpenCode Developer Installs and Uses Prototype Skill

1. **Awareness:** Developer discovers the prototype skill through npm, GitHub, or community recommendation. Sees it supports OpenCode.
2. **Consideration:** Checks the README for OpenCode installation instructions. Evaluates that installation is a one-line config change — no complex setup.
3. **Adoption:** Adds `"ai-to-prototype"` to the `plugin` array in their `opencode.json`. OpenCode auto-installs the package at next startup.
4. **Usage:** Types `/prototype "hero section"` or the agent invokes the skill automatically. The skill scans the project, generates multi-variant prototypes with the variant picker, and outputs them in the project's framework. Same experience as Claude Code users.
5. **Retention:** Uses the skill across projects. Updates happen via npm version bumps, auto-installed by OpenCode.

### Secondary User Journeys

**Claude Code User — No Change Journey**
1. User continues to install via `claude plugin add --marketplace github:I2olanD/ai.to.prototype`.
2. Invokes `/prototype` as before.
3. The experience is identical — no new steps, no regressions.

**Multi-Tool Developer — Dual Install Journey**
1. Installs via Claude marketplace for Claude Code projects.
2. Adds npm plugin to `opencode.json` for OpenCode projects.
3. Both tools use the same SKILL.md source, so behavior is consistent across tools.

## Feature Requirements

### Must Have Features

#### Feature 1: npm Package Distribution
- **User Story:** As an OpenCode developer, I want to install the prototype skill via npm so that I can use it within my OpenCode workflow.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given `"ai-to-prototype"` is added to the `plugin` array in `opencode.json`, When OpenCode starts, Then the package is auto-installed and the prototype skill is available.
  - [x] Given the npm package is installed, When the user types `/prototype "hero section"` in OpenCode, Then the skill loads and generates multi-variant prototypes following the same rules as in Claude Code.
  - [x] Given the npm package is installed, When the agent encounters a UI prototyping task, Then it can discover and invoke the prototype skill automatically via the `skill` tool.

#### Feature 2: Cross-Compatible SKILL.md
- **User Story:** As a plugin maintainer, I want a single SKILL.md that works in both Claude Code and OpenCode so that I don't maintain two versions of the skill definition.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given the SKILL.md contains frontmatter fields from both tools (e.g., `argument-hint` for Claude Code, `compatibility` for OpenCode), When Claude Code loads the skill, Then it works correctly and ignores unknown OpenCode-specific fields.
  - [x] Given the same SKILL.md, When OpenCode loads the skill, Then it works correctly and ignores unknown Claude Code-specific fields.
  - [x] Given the SKILL.md references `references/dom-contract-v1.md` via a relative link, When either tool loads the skill, Then the reference document is accessible.

#### Feature 3: Preserved Claude Marketplace Distribution
- **User Story:** As an existing Claude Code user, I want my current installation and usage workflow to remain unchanged so that the OpenCode addition causes zero disruption.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given the plugin is published with npm support, When a Claude Code user runs `claude plugin add --marketplace github:I2olanD/ai.to.prototype`, Then the plugin installs and works identically to before.
  - [x] Given the plugin is already installed in Claude Code, When the repository is updated with npm packaging files, Then the existing Claude Code installation is unaffected.
  - [x] Given a Claude Code user invokes `/prototype`, When the skill runs, Then the output (variants, picker script, DOM contract) is identical to the current behavior.

### Should Have Features

#### Feature 4: Unified README with Dual Install Instructions
- **User Story:** As a developer discovering the plugin, I want clear installation instructions for both Claude Code and OpenCode so that I can set it up in my preferred tool.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given a developer visits the GitHub repository, When they read the README, Then they see installation instructions for both Claude Code (marketplace) and OpenCode (npm plugin).
  - [x] Given the README, When a developer follows the OpenCode instructions, Then the skill is functional after adding one line to `opencode.json`.

### Could Have Features

#### Feature 5: OpenCode Command Wrapper
- **User Story:** As an OpenCode user, I want a `/prototype` command (not just agent-discoverable skill) so that I can invoke it directly like a slash command.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given the npm plugin is installed, When the user types `/prototype "pricing table"` in OpenCode's TUI, Then the skill is invoked with the arguments passed through.

### Won't Have (This Phase)

- **OpenCode marketplace/registry listing** — OpenCode does not have a centralized skill marketplace. Distribution is via npm only.
- **New skills or features** — No new prototyping capabilities, variant types, or picker enhancements.
- **Changes to prototype generation logic** — The SKILL.md body, DOM contract, and variant picker script remain unchanged.
- **Changes to the variant picker script** (`prototype.min.js`) — The client-side script is out of scope.
- **Automated cross-tool testing** — Testing that the skill works in OpenCode is manual for this phase.

## Detailed Feature Specifications

### Feature: npm Package Distribution

**Description:** The existing git repository gains npm package publishing capability. The npm package includes the OpenCode plugin entry point, the SKILL.md, and the DOM contract reference. When an OpenCode user adds the package name to their `opencode.json` plugin array, OpenCode installs it via Bun and loads the plugin at startup, making the prototype skill discoverable.

**User Flow:**
1. User adds `"ai-to-prototype"` to the `"plugin"` array in their project's `opencode.json` (or global config at `~/.config/opencode/opencode.json`).
2. OpenCode starts and auto-installs the npm package via Bun (cached in `~/.cache/opencode/node_modules/`).
3. The plugin initializes and registers the prototype skill.
4. User types `/prototype "hero section"` or the agent discovers the skill via the `skill` tool.
5. The SKILL.md instructions load into the agent context. The agent follows the generation rules, scans the project, and outputs multi-variant prototypes with the variant picker.

**Business Rules:**
- Rule 1: The npm package name must match the plugin name: `ai-to-prototype`.
- Rule 2: The SKILL.md must be the single source of truth — no duplicated or divergent copies for different tools.
- Rule 3: Claude Code marketplace installation must continue to work without requiring npm.
- Rule 4: OpenCode installation must work without requiring the Claude Code marketplace.

**Edge Cases:**
- User has both Claude Code and OpenCode installed and adds both distributions → Expected: Both work independently, no conflict.
- User installs npm package but doesn't have OpenCode → Expected: Package installs harmlessly, no side effects.
- OpenCode user's project already has a skill named `prototype` locally → Expected: Local skill takes precedence per OpenCode's skill resolution order (workspace > global > plugin).

## Success Metrics

### Key Performance Indicators

- **Adoption:** npm package reaches 100 weekly downloads within 3 months of publishing.
- **Engagement:** OpenCode users invoke the prototype skill at least once per project where the plugin is installed.
- **Quality:** Zero regressions reported by existing Claude Code users after the change. The prototype skill produces identical output in both tools.
- **Business Impact:** 2x increase in total prototype skill usage (combined Claude Code + OpenCode) within 6 months.

### Tracking Requirements

| Event | Properties | Purpose |
|-------|------------|---------|
| npm package downloads | weekly count, version | Measure OpenCode adoption rate |
| GitHub stars/forks | count, source | Measure awareness and interest |
| GitHub issues | tool (Claude/OpenCode), type (bug/feature) | Identify tool-specific problems |
| prototype.min.js loads | referrer, user-agent | Measure actual prototype usage across tools (variant picker is shared) |

---

## Constraints and Assumptions

### Constraints
- The npm package must use the `@opencode-ai/plugin` type system for OpenCode compatibility.
- The Claude Code marketplace structure (`.claude-plugin/` directories) must remain untouched.
- OpenCode auto-installs npm plugins via Bun — the package must be Bun-compatible.
- The SKILL.md body must not contain tool-specific instructions that break in the other tool. Both tools support the same core constructs: `$ARGUMENTS`, relative markdown links, YAML frontmatter.

### Assumptions
- **Assumption:** OpenCode's `skill` tool correctly loads SKILL.md files shipped within npm plugin packages, or the plugin can register skills programmatically. This needs verification during SDD.
- **Assumption:** Both tools ignore unknown YAML frontmatter fields (confirmed by OpenCode docs: "Unknown frontmatter fields are ignored").
- **Assumption:** The `@opencode-ai/plugin` npm package API is stable and the plugin hook system supports skill registration.
- **Assumption:** OpenCode's npm plugin auto-install (via Bun) handles the package without issues.

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| OpenCode npm plugin system doesn't support SKILL.md registration from packages | High | Medium | Verify during SDD. Fallback: provide manual copy instructions or use OpenCode command wrapper instead. |
| SKILL.md frontmatter incompatibility between tools | Medium | Low | Both tools document that unknown fields are ignored. Test with both tools before release. |
| Claude Code marketplace update breaks npm-related files | Medium | Low | Keep npm files (`package.json`, `src/`) outside the `plugin/` directory that Claude Code reads. Clean separation. |
| OpenCode plugin API changes break the integration | Medium | Medium | Pin `@opencode-ai/plugin` version. Monitor OpenCode releases. |
| Name collision — another npm package named `ai-to-prototype` | High | Low | Check npm registry availability before publishing. Reserve the name early. |

## Open Questions

- [x] How should OpenCode users install? → Resolved: npm plugin via `opencode.json` config.
- [x] What repository structure? → Resolved: single repo with dual entry points (marketplace + npm).
- [ ] Does OpenCode's plugin system support SKILL.md registration from npm packages, or does the plugin need to register a custom tool/command instead? → Verify during SDD.
- [ ] What is the npm package name availability for `ai-to-prototype`? → Check before publishing.

---

## Supporting Research

### Competitive Analysis

No direct competitors offer a dual-distribution AI coding skill for UI prototyping across Claude Code and OpenCode. The `oh-my-opencode` npm package (v3.14.0, 700+ dependents) demonstrates that npm plugin distribution for OpenCode is a proven pattern. The `opencode-skillful` package shows community interest in skill distribution via npm.

### User Research

OpenCode's skill system was designed with Claude Code compatibility in mind — it explicitly searches `.claude/skills/` directories for SKILL.md files, uses the same `user-invocable` frontmatter field, and documents that unknown frontmatter fields are ignored. This signals intentional cross-tool compatibility at the format level, even though distribution mechanisms differ.

### Market Data

OpenCode supports 75+ AI providers and is growing as the primary open-source alternative to Claude Code. The `@opencode-ai/plugin` npm package has 700+ dependent projects, indicating an active plugin ecosystem. The AI coding assistant market is fragmenting across multiple tools, making cross-tool compatibility increasingly valuable for skill authors.
