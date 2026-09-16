# Workspace UI wrappers and shared baseline theme

The host and remotes will consume a normal workspace-based shared UI library of thin, Tailwind-styled Base UI wrappers rather than a federated UI remote. The library owns a compiled global baseline stylesheet with system-selected light and dark modes, which every application imports so standalone remotes remain styled; remote-specific overrides are deferred. This keeps the UI foundation direct, consistently accessible, and independent of Module Federation runtime sharing. Base UI is pinned to `1.0.0-rc.0` so upgrades are deliberate.

## Consequences

- This release uses the `@base-ui-components/react` package name. Button wraps its native-button primitive; Badge and Card use its `useRender` utility because Base UI has no corresponding primitives.
- The stylesheet must be built before consumers start or build. Applications need no Tailwind compiler of their own.
- Each application bundles the UI code and baseline CSS independently. Identical copies are safe to load together, but deployments with different baseline versions can compete in the global cascade; coordinating baseline upgrades is required until theme isolation is explicitly designed. React and shared-state federation singletons are unchanged.