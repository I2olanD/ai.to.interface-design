# Design System Specification Template

Use this as the structure for the design system document — the output of Stage 3.

A design system document is not a list of values. It's a **decision record** — every entry should explain _what_ and _why_. The "why" is what makes the system survive contact with screens you didn't anticipate.

The format below is opinionated. Adapt it; don't fill it in robotically.

---

## Template

```markdown
# [Project Name] — Design System

> Anchored to: [position from the concept brief, in one sentence]
> Lineage: [primary lineage]

## Foundations

### Typography

#### The pairing

[The two faces and why they're paired. Name the foundry / source. Explain the relationship.]

Example: "Display: GT Sectra Display. Body: GT America Mono. The Sectra carries the editorial weight the brief asks for; the Mono provides a counter-rhythm that signals 'tool, not magazine.' Both from Grilli Type, ensuring kinship in proportion even with the contrast."

#### Type scale

[The sizes, weights, line-heights, and tracking — as a system. Specify the role of each step.]

| Role       | Family            | Size | Weight | Line-height | Tracking |
| ---------- | ----------------- | ---- | ------ | ----------- | -------- |
| Display L  | GT Sectra Display | 64   | 400    | 1.05        | -0.03em  |
| Display M  | GT Sectra Display | 48   | 400    | 1.1         | -0.02em  |
| Heading    | GT Sectra Display | 24   | 400    | 1.2         | -0.01em  |
| Body       | GT America Mono   | 16   | 400    | 1.55        | 0        |
| Body Small | GT America Mono   | 14   | 400    | 1.5         | 0.01em   |
| Caption    | GT America Mono   | 12   | 500    | 1.4         | 0.04em   |

#### Type rules

[The non-obvious rules: when to use display vs. heading, italics or no italics, capitals or no capitals, max line length.]

Example:

- Body never exceeds 65 characters per line. The reading rhythm matters more than column fill.
- Italics only for foreign terms and titles. Never for emphasis. (Emphasis is weight or position.)
- All-caps only for category labels. Never for headings or body.

---

### Color

#### The palette

[The full set with hex/oklch, role names, and a one-line reason for each.]

| Role     | Value                  | Reason                                                                     |
| -------- | ---------------------- | -------------------------------------------------------------------------- |
| Page     | `oklch(0.97 0.005 80)` | Warm cream — paper, not white. The brief asks for stationery quality.      |
| Surface  | `oklch(0.99 0.003 80)` | Slightly lifted off page; for any contained content.                       |
| Ink      | `oklch(0.18 0.01 250)` | Near-black with cool bias. Reads softer than true black against the cream. |
| Ink Soft | `oklch(0.45 0.01 250)` | Secondary text. Strong enough to read; quiet enough to recede.             |
| Line     | `oklch(0.85 0.005 80)` | Hairline rules and dividers. Tonally aligned to page.                      |
| Accent   | `oklch(0.50 0.18 25)`  | A single warm red — bookmark ribbon. Used once per screen, never more.     |

#### Color rules

[The rules of use. Most slop comes from undisciplined use, not bad palette.]

Example:

- Accent appears once per screen at maximum. Two accents on one screen is a bug.
- Surface is for contained content; never as a decorative panel.
- Errors use `Ink` plus an underline, not a separate red. (We have one red, and it's the accent.)

#### Dark mode

[Either: a separate set with explanation, or "no dark mode for the following reason..."]

Example: "Dark mode is a separate system, not an inversion. See [link]. Accent value shifts; line value compensates for reduced contrast headroom."

---

### Spacing & rhythm

#### Base unit

[The unit and the scale. Whether it's strict or has named exceptions.]

Example: "Base unit: 4px. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96. We do not use values between scale steps."

#### Rhythm

[The character of the spacing — generous, tight, syncopated. Why.]

Example: "Generous and uneven. Section gaps are 96px. Group gaps are 32px. Internal pads are 16px. The 3:1 ratio between section and internal creates the contemplative breathing pattern the brief calls for."

#### Radius

[Specific values, with semantic meaning if any.]

Example: "Single radius: 2px. Used everywhere except buttons. The slight softness avoids harshness while preserving the precise, paper-like feel of true 90-degree corners. Buttons use 0px — the type does the warming."

---

### Motion

#### Character

[The motion personality — crisp, weighty, springy, mechanical, etc. With reasoning.]

Example: "Mechanical and slow. We do not spring. Easing: cubic-bezier(0.32, 0, 0.67, 0). Duration default: 240ms. Things move with the deliberateness of a turning page."

#### What animates

[Explicit list of what gets motion and what doesn't.]

Example:

- Animated: state changes, page transitions, the timer line, modal entrance.
- Not animated: hover states (use color, not movement), button presses (instant feedback), scroll appearances.

---

### Iconography & imagery

#### Approach

[State the strategy: custom set, curated library subset, pictogram system, photography/illustration, or type-only. Justify the choice from the position.]

Example: "Custom pictogram set, drawn for this product. 12 symbols total, all built on a 16px grid with 1px strokes. The pictogram approach matches the field-guide lineage; the small set forces the system to compose, not enumerate."

#### Specifications

[Whatever is needed to reproduce the system: grid, stroke weight, fill rules, corner treatment, color use, sizing.]

Example:
| Property | Value |
|---|---|
| Grid | 16px, 1px keylines |
| Stroke | 1px, butt cap, miter join |
| Fill | Outline only, no filled icons |
| Color | `Ink` only; never `Accent` |
| Sizing | 16px (inline), 24px (standalone), 48px (display) |

#### Usage rules

[Where icons appear, where they don't. The rules of restraint.]

Example:

- Icons appear inline with labels, never alone. (Icon-only buttons are not part of this system.)
- Maximum one icon per UI region. Icon clusters become decorative.
- Icons never appear in headlines or body type.

#### **No emojis. Ever.**

[This is non-negotiable and lives in every design system this skill produces.]

The rule applies everywhere a designer or developer might place a visual: greetings, empty states, CTAs, success/error toasts, loading messages, tooltips, onboarding, marketing copy, category labels, list bullets, footers. No exceptions. When the temptation arises to drop a `🎉` for warmth or a `✨` for "AI feel," reach for the icon system, an illustration, or restraint — not a vendor's drawing. (User-generated content is exempt; users typing emojis in their own messages is their content.)

If this system uses photography or illustration, specify their treatment here: style, color handling, framing, what subjects qualify, who produces them.

---

### Voice & tone

#### Voice

[The voice in three or four sentences. Use contrasts.]

Example: "We speak briefly and directly. We do not narrate the user's experience back to them. We do not apologize when nothing has gone wrong. Our default register is the tone of a good librarian: knowledgeable, present, never enthusiastic."

#### Examples by surface

[Microcopy for the highest-leverage moments.]

| Surface           | Generic version                                 | Our version                                        |
| ----------------- | ----------------------------------------------- | -------------------------------------------------- |
| First-time empty  | "No sessions yet — start your first one!"       | "Begin."                                           |
| Session complete  | "Great job! You've meditated for 20 minutes 🎉" | "20 minutes. Settled."                             |
| Error: no network | "Oops! Something went wrong. Please try again." | "Offline. The session will save when you're back." |
| Settings          | "Preferences"                                   | "Settings"                                         |
| Sign-out confirm  | "Are you sure you want to sign out?"            | "Sign out." (with cancel)                          |

#### Voice rules

[Specific patterns to follow and avoid.]

Example:

- Never use exclamation marks in chrome copy.
- Never address the user by name.
- Never use "Oops," "Yay," "Great," or other Cheerful Filler.
- Periods, not arrows, end CTAs.
- **No emojis in copy.** (See Iconography & imagery — this rule is total.)

---

## Components

Define the _vocabulary_ that components share, then a few keystone components in detail. Don't enumerate every component upfront — the system should let new ones derive.

### Component vocabulary

[The shared traits across all components. Anatomy, density, treatment.]

Example:

- All interactive elements are typographic — no icon-only buttons.
- All containers use `Surface` on `Page`, with hairline `Line` borders, no shadows.
- All states use color or weight, never animation, to convey condition.

### Keystone components

[3–6 keystone components in detail. The primary button, an input, a list row or card, a navigation pattern, an empty state, and one signature component if any.]

#### Primary button

- Anatomy: typographic label only, no icons. Bottom-aligned underline that thickens on hover.
- States: default (Ink label, Line underline), hover (Ink label, Ink underline), pressed (Accent label), disabled (Ink Soft label, no underline).
- Reason: matches the editorial lineage — a button that reads as a footnote-style action, not a "tap me" marketing element.

#### Input

- Anatomy: 1px Line border on bottom only. Label sits in the input until typed, then moves above to small caption size.
- States: default, focus (Accent border), filled, error (Ink border + caption below).
- Reason: form filling should feel like writing on a page, not filling a database.

#### Session card (signature component)

- Anatomy: full-width container, Surface on Page, hairline border. Title in Display M. Duration as a horizontal line beneath, drawn at the proportional length of the session relative to the longest one in the list.
- Reason: the duration-as-line motif is the unforgettable thing from the brief. It's expressed once in the session timer and again in the list.

---

## Implementation notes

### Tokens

[CSS variables, JSON, or whatever format the developer needs. Generated from the foundation values above.]

### Accessibility

[Contrast ratios, focus states, motion-reduction handling, font-size minimums. Not optional.]

### What a developer must NOT do

[The rules that protect the system from accidental drift. Most violations come from improvisation under deadline.]

Example:

- Don't introduce additional grays. Use the four we have.
- Don't add icon buttons. If a button needs an icon, it isn't a button — it's a different component, and we should design it.
- Don't add a second accent. The single red is the system.

---

## Out of scope (for now)

[Things this system does not yet handle, named explicitly. Naming gaps prevents silent drift.]

Example:

- Data visualization — color and type for charts is not yet defined. To be addressed when the analytics view is designed.
- Marketing site typography — this system is for the product surface only. Marketing has its own treatment.
```

---

## Notes on filling this out

**On the "why" column.** The reasons are not optional. A token without a reason is a setting; a token with a reason is a system.

**On dark mode.** "Just invert the lightness" is not dark mode. Dark mode is a separate design problem with its own contrast headroom and color shifts. If the project doesn't yet need it, write "out of scope" and explain.

**On not enumerating every component.** Component lists go stale fast. Vocabulary survives. Document the principles that let new components be designed in the system's voice; document only the few that _must_ be specified.

**On the rules of use.** This is what separates a design system from a token list. Without rules, every developer will improvise. The rules are what make the system survive at scale.
