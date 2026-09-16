# @mod-fed/ui

A normal workspace dependency, not a federated remote or singleton. Applications
bundle its TypeScript source and import `@mod-fed/ui/styles.css` once in their
rendering entry graph. The exposed remote components import it too, so they do not
rely on standalone bootstraps executing inside the host.

## Primitives

| Component | Default element | Variants (default first) |
| --- | --- | --- |
| `Button` | `button` | `primary`, `secondary`, `danger` |
| `Badge` | `span` | `neutral`, `accent`, `danger` |
| `Card` | `div` | — |

All forward native attributes, children, `className`, and refs. Button wraps Base UI
Button and defaults to `type="button"`; pass `type="submit"` explicitly for form
submission. It exposes only native button props, not `render`, `nativeButton`, or
anchor attributes. Disabled buttons use native disabled behavior. Keyboard focus
has a visible outline.

Badge and Card use Base UI's `useRender` utility, not nonexistent Badge/Card
primitives. Badge is noninteractive. Card accepts Base UI's `render` composition
prop, e.g. `<Card render={<article />} />` or `<Card render={<section />} />`.
Use the appropriate accessible name and heading structure for the chosen element.

## Styling

`src/styles.css` owns the global baseline. Semantic CSS variables use `--ui-*`;
light mode is the default and `prefers-color-scheme: dark` switches the color and
elevation assignments. Dark surfaces are slate/navy with a high-contrast blue
accent. Typography, spacing, radii, and elevation tokens are available to app CSS.
There are no per-remote overrides or runtime theme provider.

Tailwind generates only the library's utilities, prefixed `ui:` to avoid collisions.
Consumers do not install Tailwind or scan library source. Consumer `className` is
preserved for layout/integration CSS; class string order is not a utility conflict
resolution API. Adding arbitrary Tailwind classes in app code will not generate CSS.
The library's utility rules are layered; ordinary app CSS can style layouts without
being scanned. Global baseline copies must stay version-aligned across deployments.

The exact Base UI dependency is `@base-ui-components/react@1.0.0-rc.0`, as required
by ADR-0001. The registry marks this old package deprecated; switching to the renamed
package or a newer release is a separate, deliberate upgrade.

## Development and verification

From the repository root:

```sh
pnpm dev        # builds CSS first, then watches library and apps
pnpm build      # compiles CSS before application bundles
pnpm typecheck  # includes positive/negative prop-contract checks
pnpm test       # keyboard, disabled, form, variant, ref, and composition tests
```

For a directly launched single app, first run `pnpm --filter @mod-fed/ui build`.
For continuous CSS updates, also run `pnpm --filter @mod-fed/ui dev`.

Browser smoke checks (dev and production preview):

1. Open `:3000`, `:3001`, and `:3002`. Verify styled cards, buttons, badges, and
   body backgrounds independently in light and dark system modes.
2. In the host, add a product. The catalog badge, host count, and Vite cart should
   update together. Remove it and clear the cart; all three views must agree.
3. Tab to a button, verify the focus outline, then activate with Enter/Space.
4. At a 375px viewport, verify wrapping without horizontal overflow.
5. Check browser errors and run an accessibility audit in both modes.
