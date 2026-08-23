import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider, createStore } from "jotai";
import App from "./App";
import "./app.css";

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root element");

/**
 * The host owns the store. Both remotes call `useAtom` against whatever store is
 * above them in the tree, which — because they render inside this Provider and
 * because jotai is a federation singleton — is this one.
 *
 * An explicit store rather than jotai's implicit default makes the sharing
 * testable: if any build ended up with its own copy of `jotai/react`, its
 * components would read a *different* StoreContext, miss this Provider, and
 * silently fall back to their own default store. The cart would then look empty
 * no matter what the catalog did.
 */
export const store = createStore();

createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
