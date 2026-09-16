import { useAtomValue, useSetAtom } from "jotai";
import { addToCartAtom, cartQuantitiesAtom } from "@mod-fed/shared-state";
import { Badge, Button, Card } from "@mod-fed/ui";
import { products, formatPrice } from "./products";
import "@mod-fed/ui/styles.css";
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
          <Card render={<article />} key={product.id} className="catalog-card">
            <div>
              <h3>{product.name}</h3>
              <p>{product.blurb}</p>
            </div>
            <div className="catalog-actions">
              {qty > 0 && <Badge variant="accent">{qty} in cart</Badge>}
              <span className="catalog-price">{formatPrice(product.price)}</span>
              <Button onClick={() => addToCart(product)}>
                Add
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
