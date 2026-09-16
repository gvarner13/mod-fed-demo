import Cart from "./Cart";

// Standalone shell — only used when this remote runs on its own at :3002.
// No Provider, so Cart reads jotai's default store, which bootstrap.tsx seeds.
export default function App() {
  return (
    <main className="cart-standalone">
      <h1>Cart remote</h1>
      <p className="cart-intro">
        Served standalone by Vite. The Rspack host consumes this same component over Module
        Federation, where it reads the host's Jotai store instead of the default one.
      </p>
      <Cart />
    </main>
  );
}
