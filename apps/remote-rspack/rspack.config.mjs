import { defineConfig } from "@rspack/cli";
import { rspack } from "@rspack/core";
import { ReactRefreshRspackPlugin } from "@rspack/plugin-react-refresh";

const PORT = 3001;

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
      // Absolute publicPath so the host can resolve this remote's chunks.
      publicPath: `http://localhost:${PORT}/`,
      uniqueName: "catalog",
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
        name: "catalog",
        filename: "remoteEntry.js",
        exposes: {
          "./ProductList": "./src/ProductList.tsx",
          "./products": "./src/products.ts",
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
      // The host runs on a different origin, so remoteEntry.js needs CORS.
      headers: { "Access-Control-Allow-Origin": "*" },
      hot: isDev,
      historyApiFallback: true,
    },
    optimization: {
      // Runtime chunk splitting breaks the MF container entry.
      runtimeChunk: false,
    },
    experiments: { css: true },
  };
});
