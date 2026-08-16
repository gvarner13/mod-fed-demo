import { defineConfig } from "@rspack/cli";
import { rspack } from "@rspack/core";
import ReactRefreshPlugin from "@rspack/plugin-react-refresh";

const PORT = 3001;
const isDev = process.env.NODE_ENV !== "production";

export default defineConfig({
  context: import.meta.dirname,
  entry: { main: "./src/index.tsx" },
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
      },
    }),
    isDev && new ReactRefreshPlugin(),
  ].filter(Boolean),
  devServer: {
    port: PORT,
    // The host runs on a different origin, so remoteEntry.js needs CORS.
    headers: { "Access-Control-Allow-Origin": "*" },
    hot: true,
    historyApiFallback: true,
  },
  optimization: {
    // Runtime chunk splitting breaks the MF container entry.
    runtimeChunk: false,
  },
  experiments: { css: true },
});
