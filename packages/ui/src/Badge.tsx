import type { ComponentPropsWithRef } from "react";
import { useRender } from "@base-ui-components/react/use-render";

const variants = {
  neutral: "ui:bg-surface-muted ui:text-muted",
  accent: "ui:bg-accent-soft ui:text-accent-text",
  danger: "ui:bg-danger-soft ui:text-danger-text",
};

export type BadgeProps = ComponentPropsWithRef<"span"> & {
  variant?: keyof typeof variants;
};

export function Badge({ variant = "neutral", className, ref, ...props }: BadgeProps) {
  return useRender({
    defaultTagName: "span",
    ref,
    props: {
      ...props,
      className: `ui:inline-flex ui:items-center ui:rounded-pill ui:px-badge-x ui:py-badge-y ui:font-body ui:text-label ui:font-semibold ui:leading-normal ui:whitespace-nowrap ${variants[variant]} ${className ?? ""}`,
    },
  });
}
