import { defineConfig } from "@rspack/cli";
import { rspack } from "@rspack/core";
import { ReactRefreshRspackPlugin } from "@rspack/plugin-react-refresh";

const PORT = 3000;

const CATALOG_URL = process.env.CATALOG_URL ?? "http://localhost:3001";
const CART_URL = process.env.CART_URL ?? "http://localhost:3002";

export default defineConfig((_env, argv) => {
  // `rspack build` sets NODE_ENV=production and `rspack serve` sets development,
  // but an explicit --mode overrides both — so it has to win here too, or
  // `serve --mode production` emits React Refresh calls with no runtime behind them.
  const mode = argv?.mode ?? process.env.NODE_ENV ?? "development";
  const isDev = mode !== "production";

  return {
    context: import.meta.dirname,
    entry: { main: "./src/index.ts" },
    mode: isDev ? "development" : "production",
    devtool: isDev ? "eval-source-map" : "source-map",
    output: {
      publicPath: "auto",
      uniqueName: "host",
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx$/,
          use: {
            loader: "builtin:swc-loader",
            options: {
              jsc: {
                parser: { syntax: "typescript", tsx: true },
                transform: {
                  react: {
                    runtime: "automatic",
                    development: isDev,
                    refresh: isDev,
                  },
                },
              },
            },
          },
        },
        {
          test: /\.ts$/,
          use: {
            loader: "builtin:swc-loader",
            options: { jsc: { parser: { syntax: "typescript" } } },
          },
        },
        { test: /\.css$/, type: "css" },
      ],
    },
    plugins: [
      new rspack.HtmlRspackPlugin({ template: "./src/index.html" }),
      new rspack.container.ModuleFederationPlugin({
        name: "host",
        remotes: {
          // Rspack remote: standard script-loaded container.
          catalog: `catalog@${CATALOG_URL}/remoteEntry.js`,
          // Vite remote: its default remoteEntry.js is an ES module, so point at
          // the var-style container the plugin emits alongside it.
          cart: `cart@${CART_URL}/varRemoteEntry.js`,
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
      isDev && new ReactRefreshRspackPlugin(),
    ].filter(Boolean),
    devServer: {
      port: PORT,
      hot: isDev,
      historyApiFallback: true,
    },
    optimization: {
      runtimeChunk: false,
    },
    experiments: { css: true },
  };
});
