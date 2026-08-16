declare module "catalog/products" {
  export type Product = {
    id: string;
    name: string;
    price: number;
    blurb: string;
  };
  export const products: Product[];
  export function formatPrice(amount: number): string;
}

declare module "catalog/ProductList" {
  import type { ComponentType } from "react";
  import type { Product } from "catalog/products";

  export type ProductListProps = {
    onAddToCart?: (product: Product) => void;
  };

  const ProductList: ComponentType<ProductListProps>;
  export default ProductList;
}

declare module "cart/Cart" {
  import type { ComponentType } from "react";

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

  const Cart: ComponentType<CartProps>;
  export default Cart;
}

declare module "*.css";
