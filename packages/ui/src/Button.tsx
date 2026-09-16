import type { ComponentPropsWithRef } from "react";
import { Button as BaseButton } from "@base-ui-components/react/button";

const variants = {
  primary: "ui:bg-accent ui:text-on-accent ui:hover:bg-accent-hover",
  secondary: "ui:bg-surface-muted ui:text-text ui:hover:bg-border",
  danger: "ui:bg-danger ui:text-on-danger ui:hover:bg-danger-hover",
};

// Deliberately omit Base UI's render/nativeButton escape hatches: this API
// guarantees native button semantics, attributes, and an HTMLButtonElement ref.
export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: keyof typeof variants;
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <BaseButton
      {...props}
      nativeButton
      className={`ui:inline-flex ui:items-center ui:justify-center ui:gap-control-y ui:rounded-control ui:border-0 ui:px-control-x ui:py-control-y ui:font-body ui:text-control ui:font-semibold ui:leading-normal ui:cursor-pointer ui:focus-visible:outline-2 ui:focus-visible:outline-offset-2 ui:focus-visible:outline-focus ui:disabled:cursor-not-allowed ui:disabled:opacity-50 ${variants[variant]} ${className ?? ""}`}
    />
  );
}
