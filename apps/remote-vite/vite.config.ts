import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

const PORT = 3002;

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "cart",
      filename: "remoteEntry.js",
      // The Rspack host loads remotes as classic scripts, not ES modules,
      // so also emit a "var"-style container it can consume.
      varFilename: "varRemoteEntry.js",
      // Attach the bundle's CSS to the exposed modules. Without this the host
      // loads Cart's JS but none of its styles, so it renders unstyled.
      bundleAllCSS: true,
      exposes: {
        "./Cart": "./src/Cart.tsx",
      },
      shared: {
        react: { singleton: true, requiredVersion: "^19.0.0" },
        "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
        // The automatic JSX transform imports these directly. They are separate
        // entry points from "react", so sharing "react" alone does not cover
        // them and each side would fall back to its own copy.
        "react/jsx-runtime": { singleton: true, requiredVersion: "^19.0.0" },
        "react/jsx-dev-runtime": { singleton: true, requiredVersion: "^19.0.0" },
        // Jotai's entry points are bare re-exports of one another — "jotai" is
        // nothing but `export * from 'jotai/vanilla'` plus `'jotai/react'`. Sharing
        // "jotai" alone therefore dedupes nothing: each build still resolves those
        // sub-paths for itself and ends up with its own StoreContext (jotai/react)
        // and its own store internals (jotai/vanilla/internals). All four have to be
        // singletons before the host's store is the store the remotes read.
        // Reaching for `jotai/utils` later means adding `jotai/vanilla/utils` and
        // `jotai/react/utils` here for the same reason.
        jotai: { singleton: true, requiredVersion: "^2.20.0" },
        "jotai/vanilla": { singleton: true, requiredVersion: "^2.20.0" },
        "jotai/vanilla/internals": { singleton: true, requiredVersion: "^2.20.0" },
        "jotai/react": { singleton: true, requiredVersion: "^2.20.0" },
        // The atoms themselves. An atom is its own lookup key in the store, so a
        // second copy of this module would read a second, always-empty slot.
        "@mod-fed/shared-state": { singleton: true, requiredVersion: false },
      },
    }),
  ],
  server: {
    port: PORT,
    strictPort: true,
    // Absolute asset URLs, so chunks resolve when loaded from the host origin.
    origin: `http://localhost:${PORT}`,
    // The host lives on another origin and must be able to fetch remoteEntry.js.
    cors: true,
  },
  preview: {
    port: PORT,
    strictPort: true,
    cors: true,
  },
  build: {
    // Module Federation containers rely on top-level await and ESM output.
    target: "esnext",
    // A single CSS file keeps the exposed component's styles self-contained.
    cssCodeSplit: false,
    minify: false,
  },
});
