# Module Federation Demo

A Turborepo monorepo showing Module Federation across two different bundlers: an
**Rspack** host that loads one **Rspack** remote and one **Vite** remote at runtime,
with a single [Jotai](https://jotai.org/docs/core/atom) store shared across all three.

| App                 | Bundler | Port | Role                                             |
| ------------------- | ------- | ---- | ------------------------------------------------ |
| `apps/host`         | Rspack  | 3000 | Shell; owns the Jotai store, consumes both remotes |
| `apps/remote-rspack`| Rspack  | 3001 | `catalog` — exposes `./ProductList`, `./products` |
| `apps/remote-vite`  | Vite    | 3002 | `cart` — exposes `./Cart`                        |

| Package                  | Role                                                      |
| ------------------------ | --------------------------------------------------------- |
| `packages/shared-state`  | The Jotai atoms, shared as a federation singleton by all three |
| `packages/ui`            | Source UI primitives and compiled baseline CSS, bundled normally by each app |

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
pnpm test         # shared UI behavior tests
```

## Shared UI and baseline theme

Following [ADR-0001](docs/adr/0001-workspace-ui-wrappers-and-host-theme.md), every
app bundles `@mod-fed/ui` normally — it is **not** exposed or shared through Module
Federation. React and the existing state layer remain federation singletons.

```tsx
import { Badge, Button, Card } from "@mod-fed/ui";
import "@mod-fed/ui/styles.css";

<Card render={<article />}>
  <Badge variant="accent">Available</Badge>
  <Button onClick={addToCart}>Add</Button>
</Card>
```

The package exports TypeScript source and a compiled Tailwind stylesheet. It owns
`--ui-*` semantic tokens, system-selected light/dark modes, and a small global body
baseline (not Tailwind Preflight). Apps retain layout CSS but use these tokens rather
than hard-coded colors. Remotes import the baseline from their exposed components,
so both standalone and federated rendering carry the same styles. There is no theme
provider, manual mode toggle, or remote-specific theme override.

`pnpm dev` builds the stylesheet before starting apps and runs its watcher;
`pnpm build` orders the library build before all consumers. When running a single
app directly, run `pnpm --filter @mod-fed/ui build` first (or keep
`pnpm --filter @mod-fed/ui dev` running for style changes).

See [the UI package guide](packages/ui/README.md) for the component contract and
verification steps.

## Sharing state

`packages/shared-state` is the whole state layer:

```ts
export const cartItemsAtom = atom<CartItem[]>([]);
export const cartTotalAtom = atom((get) => /* derived from cartItemsAtom */);
export const addToCartAtom = atom(null, (get, set, product) => /* merge logic */);
```

The host creates the store and provides it:

```tsx
export const store = createStore();

createRoot(container).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
```

...and either remote just uses the atoms, with no idea a host exists:

```tsx
const addToCart = useSetAtom(addToCartAtom);
const items = useAtomValue(cartItemsAtom);
```

Exporting write-only action atoms rather than a raw setter keeps the update rules in
one place: a remote can say "add this product" without owning the merge logic.

Run standalone, a remote finds no `<Provider>` above it and falls back to jotai's
default store. The component code is identical either way — only the store above it
changes.

## What the demo shows

The host renders the catalog on the left and the cart on the right. Both are lazily
imported from separate origins, and **neither receives any props**. The host creates
one Jotai store with `createStore()` and renders a `<Provider>`; both remotes call
`useAtom` against it as if they were ordinary local components.

Clicking **Add** in the Rspack remote writes `addToCartAtom`. The Vite remote's cart
and the host's own header badge both re-render from that write. Removing a line in
the Vite remote's cart makes the Rspack remote's "in cart" pill disappear — two
remotes, built by different bundlers, neither importing the other, kept in sync only
by the store their host provides.

That is a stronger check than it looks. Because the host passes an *explicit* store
rather than relying on jotai's implicit default, any build that ended up with its own
copy of `jotai/react` would read a different `StoreContext`, miss the host's
`<Provider>` entirely, and silently fall back to its own empty default store. A cart
that fills up is proof that React *and* jotai *and* the atoms module are all genuinely
one instance across three separate builds.

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

**Jotai has to be shared by all four of its entry points.** `jotai` is not a module
in its own right — it is `export * from 'jotai/vanilla'` plus `export * from
'jotai/react'`, using bare specifiers. Sharing only `jotai` therefore dedupes
nothing: each build still resolves those sub-paths itself and ends up with its own
`StoreContext` (created in `jotai/react`) and its own store internals (`jotai/vanilla`
and `jotai/vanilla/internals`). The remotes then quietly read their own default
stores and the cart never fills. All three configs share all four specifiers, exactly
as they already do for the JSX runtime. Adding `jotai/utils` later means sharing
`jotai/vanilla/utils` and `jotai/react/utils` alongside it, for the same reason.

**The atoms live in a workspace package, not in the host.** A Jotai atom *is* its own
key — `useAtomValue(cartItemsAtom)` matches on object identity, not on name. If the
host and a remote each bundled their own copy of the atom definitions they would hold
two different objects and address two different slots of the same store. So the atoms
sit in `packages/shared-state` and every build declares it a federation singleton. The
*store* is still owned by the host; the package only declares the keys.

**Rspack's Module Federation plugin is built in.** This uses
`rspack.container.ModuleFederationPlugin` rather than `@module-federation/rspack`,
whose ESM build calls `require.resolve` from an `.mjs` file and throws under an
ESM config.

**Every entry needs an async boundary — not just the host's.** Each app's entry file
does nothing but `import("./bootstrap")`, so the federation container can initialise
the shared scopes before any module depending on them is evaluated. This is easy to
get away with until an entry reaches a shared module *synchronously*; the failure is
loud in Rspack (`Invalid loadShareSync function call #RUNTIME-006`) and completely
silent in Vite, where the standalone page just renders blank with no console error.
Both remotes gained a boundary when their standalone shells started touching jotai.

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
