import Cart from "./Cart";

// Standalone shell — only used when this remote runs on its own at :3002.
// No Provider, so Cart reads jotai's default store, which main.tsx seeds.
export default function App() {
  return (
    <main style={{ maxWidth: 480, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 20 }}>Cart remote</h1>
      <p style={{ color: "#62708a", fontSize: 14 }}>
        Served standalone by Vite. The Rspack host consumes this same component over Module
        Federation, where it reads the host's Jotai store instead of the default one.
      </p>
      <Cart />
    </main>
  );
}
