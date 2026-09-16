import { useRender } from "@base-ui-components/react/use-render";

export type CardProps = useRender.ComponentProps<"div">;

// Base UI has no Card primitive. useRender supplies prop/ref composition and
// allows semantic containers such as render={<article />} or <section />.
export function Card({ render, className, ref, ...props }: CardProps) {
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      ...props,
      className: `ui:rounded-card ui:border ui:border-solid ui:border-border ui:bg-surface ui:p-panel ui:text-text ui:shadow-card ${className ?? ""}`,
    },
  });
}
