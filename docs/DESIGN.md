# Design System

## Philosophy
This is a studying tool — the interface's job is to get out of the way of reading, writing, and thinking. The reference feeling is a **well-organized study desk / annotated notebook**, not a generic AI-SaaS dashboard. Every screen should look like it was designed specifically for this product, not assembled from a component-library default theme.

Three rules override everything else below:
1. **Content is the interface.** Uploaded documents, chat text, and quiz questions are the visual focus. Chrome (nav, cards, buttons) stays quiet.
2. **Color is earned, not decorative.** One accent color, used with intent (actionable elements, current state) — never as a background gradient for its own sake.
3. **Flat and bordered, not floating and blurred.** Separation comes from spacing, borders, and subtle background shifts — not drop shadows and blur.

## Explicitly avoid (AI-slop patterns)
Reject these on sight in any generated UI, no matter how "modern" they look in isolation:
- Purple-to-blue (or pink-to-orange) gradient backgrounds/buttons/hero sections. No gradients as decoration, period. (A gradient is acceptable only as a rare, deliberate data-viz device — never as page chrome.)
- Glassmorphism: frosted/blurred translucent panels, `backdrop-blur` everywhere.
- Everything as a `rounded-full` pill with a soft drop shadow — buttons, badges, cards, avatars all looking like the same rounded blob.
- Generic centered hero with a gradient blob/orb behind it and a vague tagline ("Supercharge your studying with AI ✨").
- Emoji used as functional icons in place of a real icon set.
- Default Inter/system-ui everywhere with no typographic personality.
- Heavy neon/saturated accent colors (electric purple, neon violet) that scream "AI product."
- Cards with large, soft, colorful box-shadows floating on a white background.
- Overuse of "AI sparkle" iconography (✨, glowing stars) as a crutch to signal "this is AI-powered."

## Color
A warm, paper-and-ink palette — legible, calm, and distinct from the blue/purple SaaS default.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F7F4EC` (warm paper) | `#15130F` | page background |
| `--surface` | `#FFFFFF` | `#1E1B15` | cards, panels |
| `--border` | `#E4DFD0` | `#332E23` | all separators — replaces shadows |
| `--text` | `#221F17` (near-black, warm) | `#EDE8DA` | primary text |
| `--text-muted` | `#6B6555` | `#A69C86` | secondary text, metadata |
| `--accent` | `#8A3B12` (burnt sienna / ink-red) | `#D97B4A` | links, primary actions, focus states, current selection |
| `--accent-contrast` | `#FFFFFF` | `#1E1B15` | text/icons on accent-filled elements |
| `--success` | `#3F6B3B` | `#7FB876` | correct quiz answers, "processed" status |
| `--warning` | `#946E1E` | `#D6AC57` | "processing" status |
| `--danger` | `#8C2F26` | `#E0796C` | errors, delete actions |

Exactly **one** accent hue exists in the palette. Status colors are muted, not neon, and only appear attached to actual state (a file's processing status, a quiz answer's correctness) — never as ambient decoration.

## Typography
Two typefaces, chosen for a "study material" identity rather than generic UI neutrality:
- **Headings & topic/directory names:** a serif with some character — e.g. `"Source Serif 4", "Georgia", serif`. Reinforces the "reading/book" feel.
- **UI text, chat, body copy:** a humanist sans built for long reading — e.g. `"Inter", "Source Sans 3", system-ui, sans-serif`. (Inter is fine as body text; the rule is "not the only typographic voice," not "never use it.")
- **Code/extracted-document snippets:** a monospace, e.g. `"JetBrains Mono", ui-monospace, monospace`.

Type scale (rem, 16px base): `0.75, 0.875, 1, 1.125, 1.25, 1.5, 1.875, 2.25`. Headings use the serif at 1.25–2.25; body/UI stays sans at 0.875–1.125. Avoid more than 3 sizes on one screen.

## Spacing & layout
4px base grid: `4, 8, 12, 16, 24, 32, 48, 64`. Generous whitespace over decorative dividers. Max reading width for chat/document content: ~72ch — do not stretch text edge-to-edge on wide screens.

## Shape & elevation
- Border radius: small and consistent — `4px` for inputs/buttons, `8px` for cards. Never `9999px`/pill on rectangular containers (badges/tags are the one legitimate pill use).
- Elevation is expressed with a **1px `--border`**, not `box-shadow`. Reserve shadow for genuinely floating elements (a dropdown menu, a modal) at a small, neutral (not colored) shadow — `0 4px 12px rgb(0 0 0 / 0.08)` max.

## Motion
Purposeful only: 150–200ms ease-out for hover/focus state changes, a short fade/slide for panels appearing (chat message arriving, quiz feedback revealing). No parallax, no floating/bobbing decorative elements, no scroll-jacking.

## Iconography
A single consistent line-icon set (e.g. Lucide) at one stroke width throughout. Icons pair with a text label in navigation — never rely on an icon alone to carry meaning for a primary action.

## Component conventions
- **Buttons:** solid `--accent` fill for the primary action per view (one per view, max), outlined/bordered `--border` for secondary, text-only for tertiary. No gradient fills, no glow.
- **Cards (directory tiles, quiz question cards):** `--surface` background, 1px `--border`, 8px radius, no shadow at rest; on hover, border shifts to `--accent` — no lift/scale animation.
- **Inputs:** bordered, flat, `--surface` background; focus state is a `--accent` border + subtle outline, not a glow.
- **Chat bubbles:** user messages right-aligned on `--surface` with a border; assistant messages left-aligned, no bubble background at all (just text in the reading column) so the assistant's answer reads like part of the document, not a chat-app skin.
- **Status badges** (file processing status, quiz score): small rectangular tag, colored text on a tinted (10–15% opacity) background of the matching status color — not a solid saturated fill.
- **Quiz feedback:** correct/incorrect indicated by `--success`/`--danger` text + a left border accent on the option, not by re-coloring the whole card or adding icons/animation.

## Dark mode
Not an inverted theme bolted on — the dark palette above keeps the same warm hue family (dark paper `#15130F`, not pure black/blue-black) so the "notebook" identity survives in both modes.

## Voice & copy
Direct and plain. No exclamation points, no "Supercharge," "Unlock," "Elevate," or sparkle emoji in UI copy. Empty states and errors state what happened and what to do next in one short sentence.
