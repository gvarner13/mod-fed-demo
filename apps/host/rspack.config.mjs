import { defineConfig } from "@rspack/cli";
import { rspack } from "@rspack/core";
import ReactRefreshPlugin from "@rspack/plugin-react-refresh";

const PORT = 3000;
const isDev = process.env.NODE_ENV !== "production";

const CATALOG_URL = process.env.CATALOG_URL ?? "http://localhost:3001";
const CART_URL = process.env.CART_URL ?? "http://localhost:3002";

export default defineConfig({
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
      },
    }),
    isDev && new ReactRefreshPlugin(),
  ].filter(Boolean),
  devServer: {
    port: PORT,
    hot: true,
    historyApiFallback: true,
  },
  optimization: {
    runtimeChunk: false,
  },
  experiments: { css: true },
});
