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
