export type Product = {
  id: string;
  name: string;
  price: number;
  blurb: string;
};

export const products: Product[] = [
  { id: "kb-01", name: "Mechanical Keyboard", price: 149, blurb: "Hot-swappable, 75% layout" },
  { id: "mn-27", name: "27\" 4K Monitor", price: 429, blurb: "Factory-calibrated IPS panel" },
  { id: "hp-ax", name: "Studio Headphones", price: 219, blurb: "Open-back, 250 ohm" },
  { id: "dk-pd", name: "Standing Desk Pad", price: 39, blurb: "Cork-backed, 900x400mm" },
];

export const formatPrice = (amount: number): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
