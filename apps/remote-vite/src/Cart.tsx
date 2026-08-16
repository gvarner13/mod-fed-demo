import "./cart.css";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export type CartProps = {
  items: CartItem[];
  onRemove?: (id: string) => void;
  onClear?: () => void;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Cart({ items, onRemove, onClear }: CartProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <section className="cart">
      <div className="cart-header">
        <h3>Cart</h3>
        {items.length > 0 && (
          <button className="cart-clear" onClick={() => onClear?.()}>
            clear
          </button>
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
                <span className="cart-qty">x{item.qty}</span>
                <span>{currency.format(item.price * item.qty)}</span>
                <button
                  className="cart-remove"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => onRemove?.(item.id)}
                >
                  x
                </button>
              </li>
            ))}
          </ul>
          <div className="cart-total">
            <span>Total</span>
            <span>{currency.format(total)}</span>
          </div>
        </>
      )}
    </section>
  );
}
