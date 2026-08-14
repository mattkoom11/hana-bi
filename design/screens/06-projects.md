# 06 — Projects

**Routes:** `src/app/(site)/projects/page.tsx`, `src/app/(site)/projects/[slug]/page.tsx`
**Surface:** paper (light), inside `PageShell`

## Purpose

Personal builds and pre-retail development — garments that never reached the shop. This is the only screen backed entirely by **real photography**, which makes it the best reference for how the system looks with actual imagery in it.

---

## View A — Gallery

```jsx
<PageShell
  eyebrow="Projects"
  title="Work in progress."
  intro="Personal builds, experiments, and pre-retail development — garments that haven't reached the shop yet. Documented here for reference and study."
>
```

`ProjectFilters` (status: `all` / `completed` / …), then:

```css
margin-top: 2rem;
display: grid;
gap: var(--hb-grid-gap-airy);                                 /* 2rem */
grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
```

Note `20rem` tracks here versus `18rem` on Shop — project cards carry more photography and less commerce metadata, so they run wider.

Empty state, `var(--hb-smoke)` at `opacity: 0.8`, `padding: 3rem 0`:

> No projects to display.

Cards are `ProjectCard`; clicking one opens the detail route.

---

## View B — Detail

**Real route:** `src/app/(site)/projects/[slug]/page.tsx` — linkable, with its own metadata, rather than local state on the gallery page.

```jsx
<PageShell eyebrow="Projects" title={project.name} intro={project.description} />
```

**Back button**, above the content — `background: none`, `border: none`, `border-bottom: 1px dashed var(--hb-border)`, `padding: 0 0 0.25rem`, mono 0.75rem uppercase, `letter-spacing: var(--hb-track-meta)`, `var(--hb-smoke)`, `margin-bottom: 2.5rem`:

> ← All projects

**Two-column grid** — `gap: 3rem`, `grid-template-columns: 1.1fr 0.9fr`, `align-items: start`:

*Left:* `ProjectGallery` with the project, click opens `ImageLightbox` over `[heroImage, ...images]`.

*Right:*

| Element | Spec |
|---|---|
| `Fabric` label | mono · **0.65rem** · uppercase · `letter-spacing: var(--hb-track-nav)` · `var(--hb-smoke)` · `opacity: 0.7` |
| Fabric value | 0.9375rem · `line-height: 1.7` · `var(--hb-smoke)` · `margin: 0.75rem 0 2rem` |
| Divider | `InkUnderline width={140} variant="wispy" strokeOpacity={0.4}` |
| Story | 1rem · `line-height: 1.8` · `var(--hb-smoke)` · `opacity: 0.9` · `margin-top: 1.5rem` |

The fabric line is unusually precise in the data and should stay verbatim — e.g. *"Japanese wool blend herringbone (10 oz) from Yoshiwa Mills. (70%C 25%W 5%N)"*. That specificity is the house voice; do not tidy the notation.

---

## Data & imagery

Two projects, both real:

| Project | Slug | Photos in repo |
|---|---|---|
| Pleated Wool Trousers | `pleated-wool-trousers` | `wool-trousers-hero` + `1`–`5` (6 total) |
| Pleated Denim Shorts | `pleated-denim-shorts` | `pleated-jorts-hero` + `1`–`9` (10 total) |

Repo paths: `public/projects/wool-trousers-media/`, `public/projects/pleated-jorts-media/`.

**Wire the full sets.** The prototype only used hero + 2 per project; all 16 exist. `ProjectGallery` and the lightbox both scale, and this is the one place the site has enough real material to look finished.

Use `next/image` with explicit dimensions; the files are large (up to 600KB) and unoptimised.

## State

| Variable | Notes |
|---|---|
| `status` | gallery filter, default `"all"` |
| `lightboxIndex` | `number \| null`, detail view only |

## Responsive

The `1.1fr 0.9fr` detail grid needs to collapse to one column below ~880px, gallery first. The card grid handles itself via `min(100%, 20rem)`.
