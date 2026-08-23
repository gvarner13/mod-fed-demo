import { atom } from "jotai";

/**
 * The cart state every app in the demo talks to.
 *
 * These atoms live in a workspace package rather than inside the host because a
 * Jotai atom *is* its own key — `useAtomValue(cartItemsAtom)` matches on object
 * identity, not on name. If the host and a remote each bundled their own copy of
 * this file they would hold two different objects and read two different slots of
 * the same store. Every build therefore declares `@mod-fed/shared-state` as a
 * Module Federation singleton, so all three resolve to one instance of this
 * module and one set of atoms.
 *
 * The *store* is still owned by the host: it calls `createStore()` and renders the
 * `<Provider>`. The remotes only name atoms; whichever store is above them in the
 * tree is the one they read and write.
 */

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

/** The one piece of writable state. Everything below is derived from it. */
export const cartItemsAtom = atom<CartItem[]>([]);

/** Order total in whole currency units. */
export const cartTotalAtom = atom((get) =>
  get(cartItemsAtom).reduce((sum, item) => sum + item.price * item.qty, 0),
);

/** Total number of units across all lines, for the header badge. */
export const cartCountAtom = atom((get) =>
  get(cartItemsAtom).reduce((count, item) => count + item.qty, 0),
);

/** Quantity per product id, so the catalog can show what is already in the cart. */
export const cartQuantitiesAtom = atom((get) =>
  Object.fromEntries(get(cartItemsAtom).map((item) => [item.id, item.qty])),
);

/** What `addToCartAtom` needs to know about a product — a `Product` satisfies it. */
export type AddToCartPayload = {
  id: string;
  name: string;
  price: number;
};

/**
 * Write-only action atoms. Exporting these instead of exporting a setter for
 * `cartItemsAtom` keeps the update rules in one place: a remote can express
 * "add this product" without owning the merge logic.
 */
export const addToCartAtom = atom(null, (get, set, product: AddToCartPayload) => {
  const items = get(cartItemsAtom);
  const existing = items.find((item) => item.id === product.id);

  set(
    cartItemsAtom,
    existing
      ? items.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item))
      : [...items, { id: product.id, name: product.name, price: product.price, qty: 1 }],
  );
});

export const removeFromCartAtom = atom(null, (get, set, id: string) => {
  set(
    cartItemsAtom,
    get(cartItemsAtom).filter((item) => item.id !== id),
  );
});

export const clearCartAtom = atom(null, (_get, set) => {
  set(cartItemsAtom, []);
});
