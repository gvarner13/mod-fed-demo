import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { getDefaultStore } from "jotai";
import { cartItemsAtom, type CartItem } from "@mod-fed/shared-state";
import App from "./App";

const demoItems: CartItem[] = [
  { id: "kb-01", name: "Mechanical Keyboard", price: 149, qty: 1 },
  { id: "dk-pd", name: "Standing Desk Pad", price: 39, qty: 2 },
];

// Standalone only: seed jotai's default store so the cart has something to show.
// Under the host this file is never loaded — the catalog remote fills the host's
// store instead.
getDefaultStore().set(cartItemsAtom, demoItems);

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root element");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
