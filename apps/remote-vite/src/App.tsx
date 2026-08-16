import { useState } from "react";
import Cart, { type CartItem } from "./Cart";

const demoItems: CartItem[] = [
  { id: "kb-01", name: "Mechanical Keyboard", price: 149, qty: 1 },
  { id: "dk-pd", name: "Standing Desk Pad", price: 39, qty: 2 },
];

// Standalone shell — only used when this remote runs on its own at :3002.
export default function App() {
  const [items, setItems] = useState(demoItems);

  return (
    <main style={{ maxWidth: 480, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 20 }}>Cart remote</h1>
      <p style={{ color: "#62708a", fontSize: 14 }}>
        Served standalone by Vite. The Rspack host consumes this same component over Module
        Federation.
      </p>
      <Cart
        items={items}
        onRemove={(id) => setItems((prev) => prev.filter((item) => item.id !== id))}
        onClear={() => setItems([])}
      />
    </main>
  );
}
