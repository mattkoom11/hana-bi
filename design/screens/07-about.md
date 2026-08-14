# 07 — About

**Route:** `src/app/(site)/about/page.tsx`
**Surface:** paper (light), inside `PageShell`

## Purpose

Say what Hana-Bi is in prose. The homepage shows the process; this page tells the story.

## Shell

```jsx
<PageShell
  eyebrow="About"
  title="The Hana-Bi study."
  intro="A sustainable atelier with a focus on denim construction and design."
/>
```

## Body — two columns

```css
display: grid;
gap: 4rem;
grid-template-columns: 1.2fr 0.8fr;
align-items: start;
```

### Left — the founder's prose

`<article style="max-width: var(--hb-max-width-prose)">` (36rem).

1. `InkUnderline width={160} variant="wispy" strokeOpacity={0.4}` at the top
2. Then the paragraph stack: `display: flex; flex-direction: column; gap: 1.5rem; margin-top: 2.5rem`, `font-size: var(--hb-body-lg)` (1.125rem), `line-height: 1.8`, `color: var(--hb-smoke)`, `opacity: 0.85`

Three paragraphs from `ABOUT_PARAGRAPHS`. **This is the founder's own writing — ship it verbatim, do not edit for length or tone.**

1. "Hana-Bi began in the small basement of a Northern Virginia home. There was no drafting table and no fancy sewing machine, but there was a hive of ideas. Each project starts with a hand-made pattern which outlines the DNA of the garment. Ranging from extravagant designs to humble blueprints, there is no end to what Hana-Bi is willing to create."
2. "Hana-Bi only sources fabric from the best international mills and keeps a focus on domestic manufacturing. Hana-Bi's concept of sustainability sprouted from Professor Marcy Linton's class on sustainable fashion, taught at the University of Virginia. Manufacturing is taken north to New York, where the Garment District hosts a web of dreams."
3. "Hana-Bi wants to capture the innovative spirit of New York while also maintaining the wearability of timeless fashion. When it comes to future projects, Hana-Bi hopes to adopt what breaks down the limits of human creativity, and to always pioneer in the fields of elegance and beauty."

`line-height: 1.8` here rather than the usual 1.7 — this is the longest continuous prose on the site and it earns the extra leading.

### Right — three chapters

`display: flex; flex-direction: column; gap: 1.5rem`. Each chapter:

```css
border-top: 1px solid var(--hb-border);
padding-top: 1.25rem;
display: flex; flex-direction: column; gap: 0.75rem;
```

| Element | Spec |
|---|---|
| Number | `01` / `02` / `03` · mono · 0.7rem · uppercase · `letter-spacing: var(--hb-track-catalog)` (0.55em) · `var(--hb-sienna)` |
| Title | display italic 300 · 1.75rem · `line-height: 1.1` · `var(--hb-ink)` |
| Copy | 0.9375rem · `line-height: 1.7` · `var(--hb-smoke)` · `opacity: 0.85` |

**Chapter copy — final:**

**01 Origin** — Hana-Bi began in the small basement of a Northern Virginia home. There was no drafting table and no fancy sewing machine, but there was a hive of ideas.

**02 Process** — We draft silhouettes in pencil, then digitize the sketches while preserving smudges. Fabrics are sourced from regenerative mills and all trims are catalogued for future reference.

**03 Future Drops** — Expect limited runways documented like museum catalogues. Upcoming capsules blend denim tailoring with archival leather findings.

Note chapter 01 deliberately echoes the first prose paragraph. It reads as a refrain rather than a repetition because one is a numbered chapter head and the other is running prose — keep both.

## What was cut

- **`TiltCard`** — the chapters were rotating, lifting cards with dashed borders. Now numbered rules. This is the same move as the cart rows: a rule instead of a card.
- **The duplicated process stage.** About used to run its own copy of the `ScrollStage` process sequence. The homepage owns that story; About says it in prose. Two scroll-driven process stages on one site was the clearest redundancy the subtraction pass found.

## State

None. Pure server component.

## Responsive

Not built. The `1.2fr 0.8fr` grid needs to collapse to one column below ~880px, prose first, chapters below. When it does, drop the chapter column's `gap` to `1.25rem` — full-width rules at 1.5rem gaps read as too loose.
