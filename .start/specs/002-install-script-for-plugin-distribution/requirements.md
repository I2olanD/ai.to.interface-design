---
title: "Unified Install Script for Plugin Distribution"
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

| Field | Value |
|-------|-------|
| specId | 002-install-script-for-plugin-distribution |
| title | Unified Install Script for Plugin Distribution |
| status | COMPLETE |
| clarificationsRemaining | 0 |
| acceptanceCriteria | 14 |
| openQuestions | None |

### Section Status

| Section | Status |
|---------|--------|
| Product Overview | COMPLETE |
| User Personas | COMPLETE |
| User Journey Maps | COMPLETE |
| Feature Requirements | COMPLETE |
| Detailed Feature Specifications | COMPLETE |
| Success Metrics | COMPLETE |
| Constraints and Assumptions | COMPLETE |
| Risks and Mitigations | COMPLETE |
| Supporting Research | COMPLETE |

---

## Product Overview

### Vision

A single command that installs the ai.to.prototype plugin for every AI coding tool on the user's machine — no tool-specific knowledge required.

### Problem Statement

Today, installing the ai.to.prototype plugin requires users to know which AI coding tool they use (Claude Code or OpenCode), look up the tool-specific installation commands, and run them manually. The README documents two separate installation flows with different syntax. Users who have both tools must repeat the process twice. This friction reduces adoption — users who discover the plugin via a recommendation or link must first figure out their tool, then find the right section of the README, then copy-paste commands. Each step is a drop-off point.

### Value Proposition

One `curl | bash` command that auto-detects installed tools and installs the plugin for all of them. Zero decisions required from the user. Works whether they have Claude Code, OpenCode, or both. The command can be shared in blog posts, READMEs, Slack messages, and tweets without needing per-tool variations.

## User Personas

### Primary Persona: Developer discovering the plugin

- **Demographics:** Software developer, any experience level, using Claude Code and/or OpenCode as their AI coding assistant.
- **Goals:** Get the prototype skill working in their AI tool as fast as possible so they can start generating UI variants.
- **Pain Points:** Doesn't want to read installation docs for each tool. May not know the difference between Claude Code marketplace commands and OpenCode skill directories. Just wants it to work.

### Secondary Persona: Developer sharing the plugin

- **Demographics:** Developer or advocate who already uses the plugin and wants to recommend it to others.
- **Goals:** Share a single install command that works for anyone regardless of their tool setup.
- **Pain Points:** Currently must explain two different install flows depending on the recipient's tool. Cannot share a single onboarding link.

## User Journey Maps

### Primary User Journey: First-time installation

1. **Awareness:** User sees the plugin mentioned in a blog post, tweet, or colleague's message along with a one-line install command.
2. **Consideration:** The command is a single curl | bash line — no alternatives to evaluate, no tool-specific branching.
3. **Adoption:** User runs the command in their terminal. The script auto-detects their tools and installs the plugin.
4. **Usage:** User opens their AI coding tool and runs `/prototype "hero section"` immediately.
5. **Retention:** The plugin is installed globally — it's available in every project from that point on.

### Secondary User Journey: Sharing the plugin

1. **Awareness:** User discovers a colleague is building UI components manually or hasn't heard of the plugin.
2. **Consideration:** User recalls the single install command from the README or their shell history.
3. **Adoption:** User shares the one-liner. Recipient runs it without needing to know which tools are on their machine.
4. **Usage:** Recipient starts prototyping immediately.
5. **Retention:** Both users now share a common workflow for UI prototyping.

## Feature Requirements

### Must Have Features

#### Feature 1: Environment detection

- **User Story:** As a developer, I want the script to automatically detect which AI coding tools I have installed so that I don't need to specify my environment manually.
- **Acceptance Criteria:**
  - [x] Given the `claude` CLI is in PATH, When the script runs, Then it identifies Claude Code as an installation target
  - [x] Given `~/.config/opencode/` exists, When the script runs, Then it identifies OpenCode as an installation target
  - [x] Given neither tool is detected, When the script runs, Then it prints an error message with manual install instructions and exits with a non-zero code

#### Feature 2: Claude Code installation

- **User Story:** As a developer with Claude Code, I want the script to install the plugin using the official CLI commands so that the plugin is properly registered in the marketplace system.
- **Acceptance Criteria:**
  - [x] Given Claude Code is detected, When the script installs, Then it runs `claude plugin marketplace add I2olanD/ai.to.prototype`
  - [x] Given the marketplace is added, When the script continues, Then it runs `claude plugin install ai-to-prototype@ai-to-prototype`
  - [x] Given the Claude Code installation fails, When the error occurs, Then the script reports the failure but continues to install for other detected tools

#### Feature 3: OpenCode installation

- **User Story:** As a developer with OpenCode, I want the script to install the plugin files to the correct global skill directory so that the `/prototype` command becomes available in all my projects.
- **Acceptance Criteria:**
  - [x] Given OpenCode is detected, When the script installs, Then it downloads `SKILL.md` and `references/dom-contract-v1.md` from the GitHub repository
  - [x] Given files are downloaded, When the script writes them, Then they are placed in `~/.config/opencode/skills/prototype/` with the correct directory structure
  - [x] Given the OpenCode installation fails, When the error occurs, Then the script reports the failure but continues for other detected tools

#### Feature 4: Idempotent execution

- **User Story:** As a developer, I want to safely re-run the install script without breaking my existing installation so that I can update or verify my setup.
- **Acceptance Criteria:**
  - [x] Given the plugin is already installed for Claude Code, When the script runs again, Then it either updates or skips without error
  - [x] Given the plugin files already exist for OpenCode, When the script runs again, Then it overwrites them with the latest version without corrupting the directory

### Should Have Features

#### Feature 5: Result summary

- **User Story:** As a developer, I want a clear summary of what was installed and what failed so that I know the current state of my setup.
- **Acceptance Criteria:**
  - [x] Given the script completes, When results are printed, Then each detected tool shows either a success or failure status with actionable context

### Could Have Features

#### Feature 6: Uninstall support

- A `--uninstall` flag that reverses the installation for both tools. Deferred to a future version to keep the initial script focused.

### Won't Have (This Phase)

- **Project-local installation** — Only user-global installation is in scope. Project-local (`.opencode/skills/` or project `.claude/` config) is a future enhancement.
- **Interactive prompts** — The script is fully automatic. No menus, no tool selection prompts.
- **Version pinning** — The script installs the latest version. Pinning to a specific release is out of scope.
- **Windows support** — The script targets Unix-like systems (macOS, Linux) where bash is available.

## Detailed Feature Specifications

### Feature: Environment detection + dual installation

**Description:** The script detects all AI coding tools on the user's machine and installs the plugin for each one using the tool's native mechanism. Claude Code uses its CLI marketplace commands. OpenCode receives a direct file copy to its global skills directory.

**User Flow:**
1. User runs `curl -fsSL <raw-github-url>/install.sh | bash`
2. Script checks for `claude` CLI in PATH and `~/.config/opencode/` directory
3. Script installs for each detected tool (in sequence, not parallel)
4. Script prints per-tool result summary

**Business Rules:**
- Rule 1: When both tools are detected, install for both — do not ask the user to choose.
- Rule 2: When one tool's installation fails, continue installing for remaining tools — do not abort.
- Rule 3: When no tools are detected, exit with a non-zero code and print manual instructions for both tools.

**Edge Cases:**
- `claude` CLI exists but is not authenticated → Expected: Claude CLI command may fail; script reports failure and continues.
- `~/.config/opencode/` exists but is not a valid OpenCode installation → Expected: Script creates the skills directory and copies files; OpenCode will discover them if/when properly configured.
- Network failure during GitHub file download → Expected: Script reports download failure and continues to next tool.
- Script is run as root → Expected: Script warns but does not block execution. Files are created with the invoking user's permissions.

## Success Metrics

### Key Performance Indicators

- **Adoption:** Number of times the install script is fetched (GitHub raw URL hit count via repository traffic insights).
- **Engagement:** Ratio of successful installs to script fetches (measured by user reports and issue tracker).
- **Quality:** Zero reported broken installations in the first 30 days.
- **Business Impact:** Reduction in installation-related GitHub issues compared to the manual-instruction period.

### Tracking Requirements

| Event | Properties | Purpose |
|-------|------------|---------|
| Script fetched | GitHub traffic insights (daily unique cloners/visitors) | Measures awareness and intent |
| Installation issue opened | GitHub issue label: `install` | Tracks failure rate and edge cases |
| README install section visits | GitHub traffic insights (file views) | Compares manual vs script adoption |

---

## Constraints and Assumptions

### Constraints
- The script must work with `curl` and `bash` — no additional dependencies (no `jq`, `python`, etc.).
- Claude Code CLI commands may change in future versions — the script depends on `claude plugin marketplace add` and `claude plugin install` remaining stable.
- OpenCode skill directory convention (`~/.config/opencode/skills/`) must remain the global skill path.

### Assumptions
- Users running `curl | bash` have network access to both GitHub (raw file download) and the Claude plugin marketplace.
- The `claude` CLI being in PATH implies Claude Code is installed and minimally configured.
- The presence of `~/.config/opencode/` implies OpenCode is installed.
- GitHub raw URLs for the plugin files (`SKILL.md`, `references/dom-contract-v1.md`) will remain accessible at the repository's main branch.

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Claude CLI commands change in a future release | High | Low | Pin script to known-working CLI syntax; version-check Claude CLI before running commands |
| OpenCode changes its skill directory structure | High | Low | Check for the expected directory; print manual instructions if structure doesn't match |
| GitHub raw URL rate-limiting blocks downloads | Medium | Low | Use a single `git clone --depth 1` as fallback if raw download fails |
| User runs script without network access | Medium | Low | Detect network failure early and print clear error |
| `curl | bash` raises security concerns for some users | Low | Medium | Provide alternative: `git clone` + `./install.sh` in README |

## Open Questions

No open questions remain. All design decisions have been resolved through the brainstorm phase.

---

## Supporting Research

### Competitive Analysis

Most AI coding tool plugins rely on tool-specific installation commands. The Cursor ecosystem uses a VS Code extension marketplace. Claude Code introduced its own marketplace system with CLI commands. OpenCode uses a file-based skill discovery system. No competitor offers a unified cross-tool installer — each tool's plugin ecosystem is siloed.

### User Research

Based on the project's existing README structure: users currently face two separate installation sections with different syntax. The OpenCode path requires manual file copying, which is error-prone (users may miss the `references/` subdirectory). The brainstorm phase confirmed that unified onboarding is the primary value driver.

### Market Data

The AI coding assistant market is fragmenting across Claude Code, OpenCode, Cursor, Windsurf, and others. Developers increasingly use multiple tools. A cross-tool installation mechanism positions the plugin for broader reach as the ecosystem evolves.
