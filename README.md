# Module Federation Demo

A Turborepo monorepo showing Module Federation across two different bundlers: an
**Rspack** host that loads one **Rspack** remote and one **Vite** remote at runtime.

| App                 | Bundler | Port | Role                                          |
| ------------------- | ------- | ---- | --------------------------------------------- |
| `apps/host`         | Rspack  | 3000 | Shell; owns cart state, consumes both remotes |
| `apps/remote-rspack`| Rspack  | 3001 | `catalog` — exposes `./ProductList`, `./products` |
| `apps/remote-vite`  | Vite    | 3002 | `cart` — exposes `./Cart`                     |

Each remote also boots standalone on its own port, so it can be developed in isolation.

## Requirements

Node **22.12+** (Rspack 2 requires 20.19+ or 22.12+). An `.nvmrc` pins 22.18.0:

```bash
nvm use
```

## Getting started

```bash
pnpm install
pnpm dev          # all three dev servers, then open http://localhost:3000
```

Other tasks:

```bash
pnpm build        # production build of all three apps
pnpm preview      # serve the built output on the same ports
pnpm typecheck    # tsc --noEmit across the workspace
```

## What the demo shows

The host renders the catalog on the left and the cart on the right. Both are lazily
imported from separate origins. Clicking **Add** in the Rspack remote updates state
in the host, which flows back down into the Vite remote's cart — so a working cart
is proof that React is genuinely shared as a singleton across all three builds
rather than being duplicated per bundle.

Each remote is wrapped in its own error boundary. Stop one remote's dev server and
reload: that panel degrades to a message while the rest of the page keeps working.

## Notes on making two bundlers interoperate

Most of the interesting configuration exists to reconcile Rspack and Vite. Each of
these was a real failure found by running the demo, not a precaution.

**The Vite remote emits two container entries.** `@module-federation/vite` produces
a `remoteEntry.js` that is a pure ES module, which an Rspack host using script-type
remotes cannot load. The `varFilename` option emits `varRemoteEntry.js` alongside it
— a classic `var cart = ...` global — and the host points at that one.

**The JSX runtime has to be shared explicitly.** The automatic JSX transform imports
`react/jsx-runtime` and `react/jsx-dev-runtime` directly. These are separate entry
points from `react`, so sharing `react` alone does not cover them; each side falls
back to its own copy and the remote dies with `_jsxDEV is not a function`. All three
apps share all four specifiers.

**The Vite remote needs `bundleAllCSS`.** By default the plugin ships an exposed
module's JavaScript but not its styles, so the cart renders unstyled inside the host.

**Rspack's Module Federation plugin is built in.** This uses
`rspack.container.ModuleFederationPlugin` rather than `@module-federation/rspack`,
whose ESM build calls `require.resolve` from an `.mjs` file and throws under an
ESM config.

**The host needs an async boundary.** `src/index.ts` does nothing but
`import("./bootstrap")`, so the federation container can initialise shared scopes
before any module depending on them is evaluated.

## Deploying

The host reads remote URLs from the environment at build time, defaulting to
localhost:

```bash
CATALOG_URL=https://catalog.example.com \
CART_URL=https://cart.example.com \
pnpm build
```

Remote dev servers send `Access-Control-Allow-Origin: *` so the host can fetch their
containers cross-origin; tighten that for anything real.
