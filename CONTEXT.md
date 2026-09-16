# Federated Storefront UI

The visual vocabulary shared by the host and independently deployable Module Federation remotes.

## Language

**Shared UI library**:
A workspace package of reusable visual primitives that wrap Base UI and are bundled normally by every application in the monorepo. It exports TypeScript source and a compiled stylesheet.
_Avoid_: federated UI remote, component remote

**Baseline theme**:
The single global Tailwind theme, owned by the shared UI library and imported by every application, that assigns common `ui-` semantic design-token values for light and dark modes selected by the user's system preference. Its dark mode uses slate/navy surfaces with a contrast-tuned blue accent.
_Avoid_: default remote theme, remote override

**Theme mode**:
A complete light or dark assignment of the baseline theme's semantic design tokens.
_Avoid_: remote theme, branded theme

**Base UI wrapper**:
A shared UI-library primitive that supplies Tailwind styling around Base UI's accessible behavior and semantics. The initial wrappers are Button (`primary`, `secondary`, `danger`), Badge (`neutral`, `accent`, `danger`), and Card, built against the workspace's pinned Base UI release. They forward suitable native attributes, refs, and `className`; Button is native-button-only.
_Avoid_: direct Base UI use, styled Base UI dependency

**Semantic design token**:
A named visual role, such as accent, surface, or text, whose value may differ by theme without changing component code. The first set covers colors, typography, spacing, radii, and elevation.
_Avoid_: raw token, component color
