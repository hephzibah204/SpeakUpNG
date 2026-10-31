# Design: EVOTE.NG (SpeakUpNG)

The locked system. Every Hallmark run reads this first and pages share it. Change it on purpose; the file is the rule.

## System
- Genre: editorial
- Shape of the first page: Civic Intelligence Ledger
- Theme: Brand (EVOTE.NG Civic Trust)
- Axes: dark/grotesk-heavy/chromatic-green · posture: Settled

## Tokens
`app/tokens.css` is the source of truth. The roles:
```css
:root {
  --color-paper: oklch(18% 0.01 145);  --color-paper-2: oklch(22% 0.012 145);  --color-paper-3: oklch(26% 0.015 145);
  --color-ink: oklch(96% 0.008 100);  --color-ink-2: oklch(82% 0.01 120);  --color-muted: oklch(56% 0.02 135);  --color-rule: oklch(28% 0.01 140);
  --color-accent: oklch(51% 0.14 148);  --color-accent-ink: oklch(98% 0.005 148);  --color-focus: oklch(66% 0.18 150);
  --font-display: 'Syne', sans-serif;  --font-body: 'DM Sans', sans-serif;  --font-outlier: var(--font-body);
  --radius-card: 12px;  --radius-pill: 999px;  --rule-hair: 1px;  --shadow-card: 0 8px 32px -8px rgba(0, 0, 0, 0.45);
}
```
The spacing scale, the type scale, the easings and the durations are the scaffold's and live in `app/tokens.css`.

## Controls
- Primary: var(--color-accent) fill · var(--radius-card) · 44px height · focus-visible outline
- Secondary: outline in var(--color-rule), text in var(--color-ink) · same radius and height

## Motion
- Character: calm; one reveal at most; under reduced motion everything ends at once. Never `transition: all`.

## Exports
`app/tokens.css` in this project.
