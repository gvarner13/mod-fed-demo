import { useAtomValue, useSetAtom } from "jotai";
import { addToCartAtom, cartQuantitiesAtom } from "@mod-fed/shared-state";
import { products, formatPrice } from "./products";
import "./styles.css";

export default function ProductList() {
  // Writes land in the host's store — no callback prop, no knowledge of the host.
  const addToCart = useSetAtom(addToCartAtom);
  // ...and this remote can read back what the *other* remote's removals did to it.
  const quantities = useAtomValue(cartQuantitiesAtom);

  return (
    <div className="catalog">
      {products.map((product) => {
        const qty = quantities[product.id] ?? 0;

        return (
          <article key={product.id} className="catalog-card">
            <div>
              <h3>{product.name}</h3>
              <p>{product.blurb}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {qty > 0 && <span className="catalog-in-cart">{qty} in cart</span>}
              <span className="catalog-price">{formatPrice(product.price)}</span>
              <button className="catalog-add" onClick={() => addToCart(product)}>
                Add
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
