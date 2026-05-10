# Game Theory of the 2026 Iran War

A game-theoretic analysis of the 2026 US–Israel war on Iran, presented as a modular Quarto site with a primer on the underlying tools, per-actor timelines, twelve case-specific analyses, and a section on disagreements over which events are key.

## Reader paths

Each chapter supports three reader paths, exercised independently:

- **Quick read** — land on the dashboard, see the figures and the bottom line. ~2 minutes per chapter.
- **Engaged read** — scroll through the guided walkthrough next to the data viz. ~7 minutes per chapter.
- **Deep / academic** — toggle "Deep mode" at the top to expand methodological detail, source-confidence tiers, Bayesian posteriors, and footnoted citations. ~20 minutes per chapter.

## Structure

```
primer/         — the game-theory tools (bargaining model, audience costs, hierarchy, etc.)
timelines/      — per-actor histories (Iran, Israel, US, Gulf states, Russia, China, ...)
analyses/       — the twelve case questions (why bargaining failed, what ends it, etc.)
disagreements/  — comparative views: how different models carve up the same events
data/           — CSVs and JSON underlying the figures
assets/         — JS and SVG assets
```

## Build locally

```
quarto preview
```

## Deploy

GitHub Actions builds and publishes to GitHub Pages on every push to `main`.
