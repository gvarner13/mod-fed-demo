import { createRef } from "react";
import { Badge, Button, Card } from "../src";

// These contracts are checked by pnpm typecheck, not rendered at runtime.
<Button ref={createRef<HTMLButtonElement>()} type="submit" form="checkout" />;
<Badge ref={createRef<HTMLSpanElement>()} variant="danger" />;
<Card ref={createRef<HTMLDivElement>()} render={<section />} />;

// @ts-expect-error Button deliberately does not expose Base UI polymorphism.
<Button render={<a href="/" />} />;
// @ts-expect-error Button is always native.
<Button nativeButton={false} />;
// @ts-expect-error Anchor attributes are not button attributes.
<Button href="/" />;
// @ts-expect-error Refs point to HTMLButtonElement, not anchors.
<Button ref={createRef<HTMLAnchorElement>()} />;
// @ts-expect-error Only the documented button variants are supported.
<Button variant="accent" />;
// @ts-expect-error Only the documented badge variants are supported.
<Badge variant="primary" />;
