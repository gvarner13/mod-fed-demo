import { useAtomValue, useSetAtom } from "jotai";
import { cartItemsAtom, cartTotalAtom, clearCartAtom, removeFromCartAtom } from "@mod-fed/shared-state";
import { Badge, Button, Card } from "@mod-fed/ui";
import "@mod-fed/ui/styles.css";
import "./cart.css";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Cart() {
  // Reads and writes the same atoms the Rspack remote writes, through the store
  // the host provides. Neither remote imports the other, or the host.
  const items = useAtomValue(cartItemsAtom);
  const total = useAtomValue(cartTotalAtom);
  const removeFromCart = useSetAtom(removeFromCartAtom);
  const clearCart = useSetAtom(clearCartAtom);

  return (
    <Card render={<section />} className="cart" aria-label="Shopping cart">
      <div className="cart-header">
        <h3>Cart</h3>
        {items.length > 0 && (
          <Button variant="secondary" onClick={() => clearCart()}>
            clear
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="cart-empty">Nothing here yet.</p>
      ) : (
        <>
          <ul className="cart-list">
            {items.map((item) => (
              <li key={item.id} className="cart-item">
                <span className="cart-item-name">{item.name}</span>
                <Badge className="cart-qty">x{item.qty}</Badge>
                <span>{currency.format(item.price * item.qty)}</span>
                <Button
                  variant="danger"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => removeFromCart(item.id)}
                >
                  x
                </Button>
              </li>
            ))}
          </ul>
          <div className="cart-total">
            <span>Total</span>
            <span>{currency.format(total)}</span>
          </div>
        </>
      )}
    </Card>
  );
}
