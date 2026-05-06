# SnugCode Portfolio Style Guide

This document records the visual and interaction rules followed while building the SnugCode developer portfolio.

## Design Direction

The portfolio should feel minimal, technical, and focused. The interface uses strong contrast, restrained surfaces, and small interaction details instead of heavy decoration. Content should be easy to scan, with each section treated as its own full-screen moment on the public portfolio.

The admin dashboard follows the same visual language, but it is more functional: compact panels, clear controls, and direct editing workflows.

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

- Main dashboards use `width: min(1180px, calc(100% - 3rem))`.
- Public content generally stays centered within a constrained max width.
- Editor pages in the dashboard use full available dashboard width.

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
- Minimum interactive height in dashboard controls: `42px`

### Cards and Panels

- Border radius: `8px` for dashboard panels and most content cards.
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
- Admin pages link back to the dashboard.

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
- Uploaded dashboard icons may be data URLs; static icons live in `assets/icons`.

### Education

- Education entries appear as animated carousel tiles.
- Each entry needs a logo, institution name, years, and short context.
- Logos should be clean, centered, and readable.

### Blog and Thoughts

- Blog pages live under `pages/`.
- Thought pages live under `pages/thoughts/`.
- Writing pages should keep a quiet article layout with a clear back link.

## Dashboard Patterns

Dashboard pages live under `pages/admin/`.

Header rules:

- Header title is always `Dashboard`.
- Auth/status box sits on the right side of the same header row.
- Do not use `Direct URL only` or extra header kicker copy.

Editor page rules:

- Editor content spans the full dashboard width.
- Forms use clear labels, inputs, and grouped action buttons.
- Add, update, remove, reset, and publish actions should be obvious.
- Publish buttons stay disabled until authentication allows publishing.

Data editing:

- Intro, projects, stack, and education use local drafts first.
- Firebase publishing writes to the shared portfolio content document.
- Uploaded icons/logos are stored as data URLs for dashboard-managed entries.

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

- Dashboard grids collapse to one column below `860px`.
- Education carousel becomes a vertical stack below `760px`.
- Footer columns stack below `700px`.
- Text and controls should never overflow their container.
- Buttons should stretch on narrow dashboard layouts.

## File Organization

Current structure:

```text
index.html
pages/
  blog.html
  thoughts/
  admin/
assets/
css/
data/
js/
storage/
```

Rules:

- Only `index.html` stays in the root.
- Non-admin pages live in `pages/`.
- Dashboard/admin HTML lives in `pages/admin/`.
- Firebase config, rules, and helpers live in `storage/`.
- Static JSON content lives in `data/`.

## Content Voice

The site should sound straightforward and personal. Copy should avoid sounding like a marketing landing page. Prefer plain descriptions of what was built, why it matters, and what state it is in.
