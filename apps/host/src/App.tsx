import { lazy, useCallback, useState } from "react";
import RemoteBoundary from "./RemoteBoundary";
import type { Product } from "catalog/products";
import type { CartItem } from "cart/Cart";

// Both remotes are code-split: the host bundle contains only their URLs.
const ProductList = lazy(() => import("catalog/ProductList"));
const Cart = lazy(() => import("cart/Cart"));

export default function App() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  return (
    <div className="shell">
      <header className="shell-header">
        <h1>Federated Storefront</h1>
        <p>
          This shell is built with Rspack. The product list comes from an Rspack remote and the
          cart from a Vite remote — both loaded at runtime over Module Federation.
        </p>
      </header>

      <div className="shell-body">
        <section>
          <h2 className="shell-label">
            Catalog <span>rspack · :3001</span>
          </h2>
          <RemoteBoundary name="catalog">
            <ProductList onAddToCart={addToCart} />
          </RemoteBoundary>
        </section>

        <aside>
          <h2 className="shell-label">
            Cart <span>vite · :3002</span>
          </h2>
          <RemoteBoundary name="cart">
            <Cart items={items} onRemove={removeFromCart} onClear={clearCart} />
          </RemoteBoundary>
        </aside>
      </div>
    </div>
  );
}
