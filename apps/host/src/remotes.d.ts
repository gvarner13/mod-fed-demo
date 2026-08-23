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

// Both remotes now take their state from the shared Jotai store rather than from
// props, so their public surface is just "render me somewhere under the host's
// Provider".
declare module "catalog/ProductList" {
  import type { ComponentType } from "react";

  const ProductList: ComponentType;
  export default ProductList;
}

declare module "cart/Cart" {
  import type { ComponentType } from "react";

  const Cart: ComponentType;
  export default Cart;
}

declare module "*.css";
