---
name: Study Assistant
description: A study-tool PWA for chatting and quizzing over your own uploaded course material.
colors:
  accent: "#8A3B12"
  accent-contrast: "#FFFFFF"
  bg: "#F7F4EC"
  surface: "#FFFFFF"
  border: "#E4DFD0"
  text: "#221F17"
  text-muted: "#6B6555"
  success: "#3F6B3B"
  warning: "#83611B"
  danger: "#8C2F26"
typography:
  display:
    fontFamily: "Source Serif 4 Variable, Georgia, serif"
  body:
    fontFamily: "Inter Variable, Source Sans 3, system-ui, sans-serif"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
rounded:
  btn: "4px"
  card: "8px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
  "16": "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-contrast}"
    rounded: "{rounded.btn}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.btn}"
    padding: "8px 16px"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.btn}"
    padding: "8px 16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.btn}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "16px"
---

# Design System: Study Assistant

## Overview

**Creative North Star: "The Study Desk"**

This is a studying tool — the interface's job is to get out of the way of reading, writing, and thinking. The reference feeling is a well-organized study desk and an annotated notebook, not a generic AI-SaaS dashboard. Every screen should look like it was designed specifically for this product, never assembled from a component-library default theme.

Confirmed visual rejections: purple-to-blue or pink-to-orange gradients, glassmorphism, pill-everything, a generic centered hero with a gradient blob, emoji standing in for icons, and "AI sparkle" iconography. The full list lives in Do's and Don'ts.

**Key Characteristics:**
- Content is the interface — uploaded documents, chat text, and quiz questions are the visual focus; chrome (nav, cards, buttons) stays quiet.
- Color is earned, not decorative — one accent color, used with intent, never as a background gradient for its own sake.
- Flat and bordered, not floating and blurred — separation comes from spacing, borders, and subtle background shifts, not drop shadows and blur.

## Colors

A warm, paper-and-ink palette — legible, calm, and distinct from the blue/purple SaaS default.

### Primary
- **Accent** (#8A3B12): burnt sienna / ink-red — links, primary actions, focus states, current selection. Dark mode: `#D97B4A`.

### Neutral
- **Paper** (#F7F4EC): page background. Dark mode: `#15130F`.
- **Surface** (#FFFFFF): cards and panels. Dark mode: `#1E1B15`.
- **Border** (#E4DFD0): all separators — replaces shadows. Dark mode: `#332E23`.
- **Text** (#221F17): near-black, warm — primary text. Dark mode: `#EDE8DA`.
- **Text Muted** (#6B6555): secondary text, metadata. Dark mode: `#A69C86`.
- **Accent Contrast** (#FFFFFF): text and icons on accent-filled elements. Dark mode: `#1E1B15`.

### Status
- **Success** (#3F6B3B): correct quiz answers, "processed" file status. Dark mode: `#7FB876`.
- **Warning** (#83611B): "processing" file status — darkened from a straight amber/olive hue to clear 4.5:1 text contrast on its tinted badge background. Dark mode: `#D6AC57`.
- **Danger** (#8C2F26): errors, delete actions. Dark mode: `#E0796C`.

### Dark Mode
Not an inverted theme bolted on — the dark values above keep the same warm hue family (dark paper `#15130F`, not pure black or blue-black) so the "study desk" identity survives in both modes.

### Named Rules
**The Single Accent Rule.** Exactly one accent hue exists in the palette. Status colors are muted, not neon, and only appear attached to actual state — a file's processing status, a quiz answer's correctness — never as ambient decoration.

## Typography

**Display Font:** Source Serif 4 Variable (with Georgia, serif)
**Body Font:** Inter Variable (with Source Sans 3, system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, monospace)

**Character:** A serif with some character carries headings and topic/directory names, reinforcing the "reading/book" feel; a humanist sans built for long reading carries UI text, chat, and body copy. Inter is fine as body text — the rule is "not the only typographic voice," not "never use it."

### Hierarchy
- **Display** (1.25–2.25rem, serif): headings, topic and directory names.
- **Body** (0.875–1.125rem, sans): UI text, chat, body copy.
- **Label/Mono** (0.75–0.875rem, mono): code and extracted-document snippets.

Full scale (rem, 16px base): `0.75, 0.875, 1, 1.125, 1.25, 1.5, 1.875, 2.25`.

### Named Rules
**The Three-Size Rule.** Avoid more than 3 sizes on one screen.

**The Eyebrow Convention.** A small mono, uppercase, letter-spaced label (e.g. "DIRECTORY", "QUESTION 4", "ASSISTANT"/"YOU") sits directly above a serif headline or a chat message to categorize it without adding another type size. It never appears alone as a heading substitute.

## Layout

4px base grid: `4, 8, 12, 16, 24, 32, 48, 64`. Generous whitespace does the work that decorative dividers would otherwise do. Max reading width for chat and document content is ~72ch — text never stretches edge-to-edge on wide screens. Page containers narrow by purpose: auth forms sit in a ~24rem centered column, the landing page's hero and steps sit in a ~48rem column, and the two-panel directory workspace (directory list beside its file list) uses a wider ~64rem container that collapses to a single stacked column below the `sm` breakpoint.

### App Shell (signature layout)
Every authenticated view (Directories, Chat, Quiz) shares one shell: a slim top bar (product name, theme toggle, log out) plus a fixed-width (16rem) left sidebar docked for the session — not a per-page nav bar. The sidebar carries, top to bottom: the current topic switcher (eyebrow "Current topic" + serif directory name, once a directory is selected), a primary "New topic" action, then the three section links (Directories/Chat/Quiz) as text+icon rows. The active link gets accent text, a bold weight, and a right-side accent border — never a filled pill. Chat and Quiz links are only live once a directory is selected; otherwise they render muted and inert rather than linking somewhere that has nothing to show. Below `md` the sidebar collapses and its links move into the top bar.

### Topic Switcher
The current-topic block in the sidebar is a dropdown button, not a static label: it truncates a long directory name with an ellipsis and exposes the full name via the browser's native title tooltip on hover, and opens a flat bordered menu (the sidebar's one legitimate use of the small floating-element shadow from Elevation & Depth) listing every directory, each truncated the same way. The selection is app-wide and persisted (not per-page state) — picking a topic from any screen carries it to Chat and Quiz, survives navigation and reload, and is what "New topic"-adjacent Chat/Quiz links point at.

## Elevation & Depth

Elevation is expressed with a 1px border, not `box-shadow`. Surfaces are flat at rest; shadow is reserved for genuinely floating elements (a dropdown menu, a modal) at a small, neutral shadow (`0 4px 12px rgb(0 0 0 / 0.08)` max) — never a colored or oversized shadow.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. A card or input signals interactivity or focus by shifting its border to the accent color, not by lifting, scaling, or gaining a shadow.

## Shapes

Border radius is small and consistent: 4px for inputs and buttons, 8px for cards. Never `rounded-full`/pill on a rectangular container — badges and tags are the one legitimate pill use.

## Components

Motion across every component is purposeful only: 150–200ms ease-out for hover and focus state changes, a short fade/slide for panels appearing (a chat message arriving, quiz feedback revealing). No parallax, no floating or bobbing decorative elements, no scroll-jacking. Icons come from a single consistent line-icon set (Lucide) at one stroke width throughout, and pair with a text label in navigation — never rely on an icon alone to carry meaning for a primary action.

### Buttons
- **Shape:** 4px radius, no pill.
- **Primary:** solid accent fill (accent background, accent-contrast text), one per view at most. No gradient fills, no glow.
- **Secondary:** outlined/bordered, transparent background.
- **Tertiary:** text-only, no border.
- **Hover / Focus:** primary dims to 90% opacity; secondary and tertiary shift border or text toward the accent color. No glow.

### Cards / Containers
- **Corner Style:** 8px radius.
- **Background:** surface color.
- **Shadow Strategy:** none at rest (see Elevation & Depth) — a 1px border only.
- **Border:** 1px border; on hover, border shifts to accent. No lift or scale animation.
- **Internal Padding:** 12–24px depending on density — directory and file rows use the tighter end, landing feature cards the wider end.

### Inputs / Fields
- **Style:** bordered, flat, surface background.
- **Focus:** accent border plus a subtle outline — never a glow.
- **Error / Disabled:** disabled inputs and buttons drop to reduced opacity and stop responding to hover; errors surface as danger-colored text near the field, not a red border.

### Status Badges
Small rectangular tag, colored text on a tinted (10–15% opacity) background of the matching status color — never a solid saturated fill. Used for file processing status (pending/processing/processed/failed) and quiz results.

### Upload Dropzone
A dashed 1px border, 8px radius container with a centered icon-in-circle, a short serif prompt ("Drop your material here"), a muted caption stating accepted types/size, and a "Browse files" text link as the click fallback. Background shifts from surface to a faint accent-tinted surface on drag-over and hover — the only place in the system a container's fill (not just its border) responds to interaction, because the whole zone is the target.

### Chat Bubbles (signature component)
Each message is preceded by its own eyebrow row (small icon + "ASSISTANT"/"YOU" label, mono, uppercase). User messages are right-aligned on the surface color with a border, in a max ~75% column; assistant messages are left-aligned with no bubble background at all — just text in the reading column, max ~85% width — so the assistant's answer reads like part of the document, not a chat-app skin.

### Quiz Feedback (signature component)
Once an option is chosen, every option becomes a flat statement rather than a live control: the chosen option gets a 2px border and a matching tinted (15-20% opacity) background in success or danger, plus a small filled circular check/× glyph — this is the one place status color is allowed to tint an entire container, because the question is answered and the card is no longer interactive chrome. The correct option always resolves to the success treatment even if not chosen, so the answer is never left ambiguous. Untouched options simply dim to reduced opacity. A one-line explanation in the matching status color sits under the chosen and/or correct option.

## Do's and Don'ts

### Do:
- **Do** keep copy direct and plain — no exclamation points, no "Supercharge," "Unlock," or "Elevate," no sparkle emoji in UI copy.
- **Do** state what happened and what to do next in one short sentence for empty states and errors.
- **Do** use a single consistent line-icon set (Lucide) at one stroke width, always paired with a text label for primary actions.
- **Do** express elevation with a 1px border; reserve shadow for genuinely floating elements only.

### Don't:
- **Don't** use purple-to-blue or pink-to-orange gradient backgrounds, buttons, or hero sections. No gradients as page chrome, period — a gradient is acceptable only as a rare, deliberate data-viz device.
- **Don't** use glassmorphism: frosted/blurred translucent panels, `backdrop-blur` everywhere.
- **Don't** make everything a `rounded-full` pill with a soft drop shadow — buttons, badges, cards, and avatars should not all look like the same rounded blob.
- **Don't** ship a generic centered hero with a gradient blob/orb behind it and a vague tagline ("Supercharge your studying with AI ✨").
- **Don't** use emoji as functional icons in place of a real icon set.
- **Don't** rely on default Inter/system-ui everywhere with no typographic personality.
- **Don't** use heavy neon/saturated accent colors (electric purple, neon violet) that scream "AI product."
- **Don't** put cards on large, soft, colorful box-shadows floating on a white background.
- **Don't** overuse "AI sparkle" iconography (✨, glowing stars) as a crutch to signal "this is AI-powered."
