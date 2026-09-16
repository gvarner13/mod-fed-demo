import ProductList from "./ProductList";

// Standalone shell — only used when this remote runs on its own at :3001.
// There is no Provider here, so the atoms resolve against jotai's default store.
// The component code is identical either way; only the store above it changes.
export default function App() {
  return (
    <main className="catalog-standalone">
      <h1>Catalog remote</h1>
      <p className="catalog-intro">
        Served standalone by Rspack. The host consumes this same component over Module Federation,
        where its writes land in the host's Jotai store instead of the default one.
      </p>
      <ProductList />
    </main>
  );
}
