# Anti-Slop Checklist

Concrete tells of AI-generated design and what to do instead. Walk this list during Stage 4 (Audit). Each item is a tell — either remove it or justify it in writing as part of the position.

Slop is not the same as bad. Slop is _averaged_: it's what you get when you sample the middle of every design trend at once. The tells below are the markers of that averaging.

---

## Typography tells

**Default fonts.** Inter, Roboto, Arial, Helvetica Neue, Open Sans, Space Grotesk, SF Pro. Not bad fonts — exhausted ones. They are the fonts a model reaches for because they're statistically safe.
→ Reach for something with a face: a humanist sans (Söhne, GT America, ABC Diatype, Söhne Mono), a serif with a real personality (Tiempos, GT Sectra, PP Editorial New, Söhne Breit), a mono with character (JetBrains Mono is fine, but consider PP Fraktion, Berkeley Mono, IBM Plex Mono). If using Google Fonts: try Fraunces, Instrument Serif, Newsreader, Bricolage Grotesque, DM Mono.

**Single weight everywhere.** A page set in one weight of one font reads as software default, not design.
→ Use weight contrast as a hierarchy tool. A 300 paired with an 800 says something. A 400 paired with a 500 says nothing.

**Tracking left at 0.** Tight tracking on display sizes is almost always wrong; loose tracking on small caps almost always reads better.
→ Tune tracking per size. Display headlines often want -0.02em to -0.04em. Small caps and labels want +0.05em to +0.1em.

**Line-height set once globally.** Body text and headlines have different optical needs.
→ Body around 1.5–1.65. Display around 1.0–1.15. Tighten as size increases.

---

## Color tells

**Purple-to-blue gradient.** The single most slop-coded gesture in software design.
→ If you use a gradient, justify it: what does it represent? Where does it appear? Why this direction? Most designs are better with no gradient at all.

**Glassmorphism with no reason.** Frosted backgrounds applied to floating cards because the model has seen a thousand Dribbble shots.
→ Glass is a material. Use it when you need depth and translucency to convey something (a layered nav over content, a modal over a working state). Don't apply it as decoration.

**Fifteen grays.** Undisciplined neutral palettes with too many close shades.
→ Pick 4–6 grays at most. Name their roles (page, surface, surface-raised, ink, ink-soft, line). If you can't tell two grays apart at a glance, you have one too many.

**The "brand purple."** A purple, often #6366F1 or close, that signals "tech startup."
→ Either commit to purple as a real position (and make it weird purple, deep purple, dusty purple) or pick a different anchor color.

**No black, no white.** Off-blacks (#0A0A0A, #111) and off-whites (#FAFAFA) used for "softness" without intent.
→ Sometimes you want true black for impact. Sometimes you want a warm cream for paper. Decide intentionally.

**Equal-saturation palette.** Five colors all at the same saturation level read as a swatch wall, not a system.
→ Real palettes have hierarchy: one or two saturated colors against several neutrals, or several muted colors with one electric accent.

---

## Layout tells

**Three-card grid.** Hero, then three cards in a row, then a CTA. Could be any product. Means nothing.
→ Break the grid. Use asymmetry. Use vertical rhythm. Use a list. Use one big thing. The "three cards" structure is a tell because it requires no decision.

**Centered everything.** Hero copy centered, subhead centered, button centered, three cards centered.
→ Asymmetry is a tool. Off-center hangs, baseline alignments, justified rags, and intentional left-bias all carry character.

**Uniform border-radius.** Every box, button, image, and card with the same 12px radius.
→ Either commit to one radius across the whole system (and make it specific — 2px, 24px, 999px), or use radius semantically (pill for actions, square for content, soft for friendly surfaces). Random uniformity is slop.

**Drop shadow under everything.** Soft 0 4 12 rgba(0,0,0,0.08) on every card.
→ Shadows imply elevation. If everything is elevated, nothing is. Use shadow on the one or two surfaces that genuinely float.

**Padding everywhere is 24px.** A grid where every gap and every internal pad is the same number.
→ Hierarchy comes from spacing variation. Section gaps, group gaps, internal pads, and tight clusters should differ.

---

## Component tells

**The pill button with arrow icon.** "Get started →" with a chevron, sitting in a rounded-full button on a gradient background.
→ Buttons are a place to express the system. Square buttons read different from pill buttons read different from underlined links read different from drawn underlines. Pick deliberately.

**Lucide icons everywhere, single-stroke, identical weight.** A standard icon set applied without curation.
→ Icon style is part of the system. Filled vs. outlined vs. duotone vs. custom-drawn carry different weight. Pick a style and stick to it. If using a library, curate aggressively — don't use 30 icons when 8 will do.

**Avatar circles with dot status indicators.** Pulled-from-template list rows.
→ List rows are character-rich. Try square avatars, no avatars (initials in colored squares), photo-realistic faces, illustrated faces, or no faces at all. Status can be color, type, position, or absent.

**Modal with X in the corner, OK and Cancel at the bottom.** The Bootstrap modal that lives in 80% of AI output.
→ Modals are interruptions. Treat them as such. Sometimes a sheet is better. Sometimes inline is better. Sometimes you don't need confirmation at all.

---

## Motion tells

**Fade-up on scroll.** Every element appearing with the same translate-Y and opacity transition as you scroll.
→ Motion should be earned. Use it for state changes, important reveals, and orientation. Don't use it as wallpaper.

**Spring on hover-everything.** Every interactive element bouncing when you mouse over it.
→ Hover states should communicate affordance, not perform. A subtle color shift often says more than a wiggle.

**1-second-plus animations.** Long durations applied because they "feel premium."
→ Most UI motion should be 150–300ms. Longer durations are for moments of orientation (page transitions, complex reveals). Premium isn't slow.

---

## Voice tells

**"Welcome back, [Name] 👋"** The wave emoji greeting that lives at the top of a thousand AI-built dashboards.
→ Voice is character. A grief support app and a tax software cannot greet the user the same way. Pick a register and hold it.

**"Oops! Something went wrong."** The default Cheerful Error.
→ Errors are a chance to be specific and human. "We couldn't reach the server" is more honest than "Oops!" Or commit to a tone — terse, technical, apologetic, dry. Pick one.

**"Get started for free →"** The default CTA.
→ The CTA is the most-read piece of copy. Earn it. What is the user actually doing? "Make my first list" is more specific than "Get started." "Pay my rent" is more specific than "Continue."

**"Built with love by ..."** ✨🚀💜
→ The unironic emoji-laden tagline.
→ If you use emoji, make it deliberate and rare. Most products are better without them in chrome copy.

**Generic empty states.** "No results yet" with a magnifying-glass illustration.
→ Empty states are character-rich opportunities. They appear precisely when the user is most attentive (because nothing else is). Treat them as small editorial moments.

---

## Conceptual tells

**"Modern. Minimalist. Clean."** The triple-positioning that commits to nothing.
→ Pick a real position. "Editorial gravity." "Mid-century industrial." "Terminal severity." "Stationery warmth." Specifics differentiate.

**"Inspired by Stripe / Linear / Apple."** Naming a tech company instead of a design tradition.
→ Reach further back. Linear is inspired by something. What? Trace the lineage. Swiss editorial, mid-century print, technical documentation — those are the actual sources. Cite the source, not the imitator.

**Symmetric perfection.** A composition where everything aligns to a perfect grid with no deliberate breaks.
→ Asymmetry, hangs, intentional misalignment, off-axis elements — these are the signs of a designer. Perfection is the sign of a template.

**No restraint.** Every cool effect applied at once: gradient mesh background, glassmorphism cards, particle effects, custom cursor, scroll-jacking, and 3D tilts.
→ Pick one or two atmospheric moves. Restraint is the hallmark of craft.

**No commitment.** A design that hedges between two aesthetics — sort of minimal but sort of maximalist, sort of corporate but sort of playful.
→ The fence sits in the middle. Pick a side.

---

## Self-check before declaring done

After walking the list, answer in writing:

1. Which tells did I find? List them.
2. For each: did I remove it, or did I justify it as deliberate? (Justifying means writing the _why_ — "I used a purple gradient because the brief is about cosmic events" is justified; "I used a purple gradient because it looked good" is not.)
3. Is there at least one choice that would make a generic AI design tool refuse to make it? If not, the work is still in slop range.

If any of these answers is uncomfortable, return to the position and tighten it. The position is what protects against slop.
