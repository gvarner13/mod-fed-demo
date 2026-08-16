import { products, formatPrice, type Product } from "./products";
import "./styles.css";

export type ProductListProps = {
  onAddToCart?: (product: Product) => void;
};

export default function ProductList({ onAddToCart }: ProductListProps) {
  return (
    <div className="catalog">
      {products.map((product) => (
        <article key={product.id} className="catalog-card">
          <div>
            <h3>{product.name}</h3>
            <p>{product.blurb}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="catalog-price">{formatPrice(product.price)}</span>
            <button className="catalog-add" onClick={() => onAddToCart?.(product)}>
              Add
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
