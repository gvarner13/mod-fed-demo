import { lazy } from "react";
import { useAtomValue } from "jotai";
import { cartCountAtom, cartTotalAtom } from "@mod-fed/shared-state";
import RemoteBoundary from "./RemoteBoundary";

// Both remotes are code-split: the host bundle contains only their URLs.
const ProductList = lazy(() => import("catalog/ProductList"));
const Cart = lazy(() => import("cart/Cart"));

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function App() {
  // No props flow into either remote any more. The host reads the same atoms the
  // remotes write, out of the store it provides in bootstrap.tsx.
  const count = useAtomValue(cartCountAtom);
  const total = useAtomValue(cartTotalAtom);

  return (
    <div className="shell">
      <header className="shell-header">
        <div className="shell-title">
          <h1>Federated Storefront</h1>
          <span className="shell-badge">
            {count === 0 ? "cart empty" : `${count} item${count === 1 ? "" : "s"} · ${currency.format(total)}`}
          </span>
        </div>
        <p>
          This shell is built with Rspack. The product list comes from an Rspack remote and the
          cart from a Vite remote — both loaded at runtime over Module Federation, both reading
          and writing this shell's Jotai store.
        </p>
      </header>

      <div className="shell-body">
        <section>
          <h2 className="shell-label">
            Catalog <span>rspack · :3001</span>
          </h2>
          <RemoteBoundary name="catalog">
            <ProductList />
          </RemoteBoundary>
        </section>

        <aside>
          <h2 className="shell-label">
            Cart <span>vite · :3002</span>
          </h2>
          <RemoteBoundary name="cart">
            <Cart />
          </RemoteBoundary>
        </aside>
      </div>
    </div>
  );
}
