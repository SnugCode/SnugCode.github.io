# Style Guide

This document records the visual and interaction rules followed while building the SnugCode developer portfolio.

## Typography

- Primary font: `Poppins`
- Body weight: `400`
- Heading weight: `700`
- Base size: `100%`

Type scale:

- `h1`: `4.210rem`
- `h2`: `3.158rem`
- `h3`: `2.369rem`
- `h4`: `1.777rem`
- `h5`: `1.333rem`
- `small`: `0.750rem`

Guidelines:

- Use bold headings for section titles and panel titles.
- Keep body copy short and direct.
- Use muted text for descriptions and secondary metadata.
- Avoid decorative text treatments beyond weight, color, and spacing.

## Color System

Dark theme is the default.

Core tokens:

- Text: `#ffffff`
- Background: `#000000`
- Primary: `#1a00df`
- Accent: `#e45000`
- Secondary surface: `#0d0d0d`
- Card surface: `#0f0f0f`
- Muted text: `#d6d6d6`
- Subtle text: `#777777`

Light theme swaps the surfaces and text while keeping the primary/accent relationship intact.

Guidelines:

- Use primary blue for main actions and links.
- Use orange only for hover/accent states.
- Use card and secondary surfaces to separate content without making the page feel busy.
- Borders should stay subtle: use tokenized transparent borders instead of hard outlines.

## Layout

Public portfolio sections use full-screen rhythm:

- `section` elements use `min-height: 100vh`.
- Scroll snapping is enabled with `scroll-snap-type: y proximity`.
- Major sections are separated with subtle top borders.

Content width:

- Public content generally stays centered within a constrained max width.

Guidelines:

- Keep sections focused on one purpose.
- Avoid nesting cards inside cards.
- Keep repeated item grids consistent and evenly spaced.
- Use responsive grid behavior rather than fixed desktop-only layouts.

## Components

### Buttons

- Border radius: `6px`
- Primary background: `var(--primary)`
- Hover background: `var(--accent)`
- Font weight: `600` or `700`

### Cards and Panels

- Border radius: `8px` for most content cards.
- Use `var(--card)` for panel backgrounds.
- Use soft shadows from `--shadow` and `--shadow-strong`.
- Borders should use `--border` or `--border-strong`.

### Theme Toggle

- Circular button, `44px` by `44px`.
- Fixed at top right.
- Uses light/dark logo switching through `.theme-logo`.

### Logo

- Site logo sits at the top left.
- Public pages link back to `index.html#intro`.

## Public Page Patterns

### Intro

- Large typing text.
- Minimal supporting UI.
- Keep the introduction personal and direct.

### Projects

- Project cards should include a visual media area when available.
- Missing images fall back to a simple initial placeholder.
- Project actions use icon buttons and tooltips.
- Status text should stay short: examples include `Ongoing` and `Completed`.

### Stack

- Stack items are grouped by category.
- Icons are centered and consistent in size.
- Labels stay short.
- Static icons live in `assets/icons`.

### Education

- Education entries appear as animated carousel tiles.
- Each entry needs a logo, institution name, years, and short context.
- Logos should be clean, centered, and readable.

### Blog and Thoughts

- Blog pages live under `pages/`.
- Thought pages live under `pages/thoughts/`.
- Writing pages should keep a quiet article layout with a clear back link.

## Motion

Motion should feel useful rather than decorative.

Used patterns:

- Smooth theme transitions.
- Card hover lift.
- Typing animation in the intro and education carousel.
- Carousel movement for education tiles.

Guidelines:

- Keep transitions short and predictable.
- Use hover movement sparingly.
- Avoid motion that changes layout unexpectedly.

## Responsive Rules

- Education carousel becomes a vertical stack below `760px`.
- Footer columns stack below `700px`.
- Text and controls should never overflow their container.

## File Organization

Current structure:

```text
index.html
pages/
  blog.html
  thoughts/
assets/
css/
data/
js/
```

Rules:

- Only `index.html` stays in the root.
- Supporting pages live in `pages/`.
- Static JSON content lives in `data/`.
