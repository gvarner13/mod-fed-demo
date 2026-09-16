import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Badge, Button, Card } from "../src";

afterEach(cleanup);

describe("Button", () => {
  it("forwards native attributes, children, className, and a button ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} className="consumer-button" name="action" value="add" aria-label="Add item">
        Add
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Add item" });
    expect(ref.current).toBe(button);
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("name")).toBe("action");
    expect(button.getAttribute("value")).toBe("add");
    expect(button.textContent).toBe("Add");
    expect(button.classList.contains("consumer-button")).toBe(true);
    expect(button.classList.contains("ui:bg-accent")).toBe(true);
  });

  it("activates once per click, Enter, and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Add</Button>);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button"));
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("does not activate or take keyboard focus when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Unavailable</Button>);
    const button = screen.getByRole("button");
    expect(button.hasAttribute("disabled")).toBe(true);
    await user.click(button);
    await user.tab();
    expect(document.activeElement).not.toBe(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not submit by default, but forwards explicit submit behavior", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button>Safe action</Button>
        <Button type="submit">Submit</Button>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Safe action" }));
    expect(onSubmit).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["primary", "ui:bg-accent"],
    ["secondary", "ui:bg-surface-muted"],
    ["danger", "ui:bg-danger"],
  ] as const)("styles the %s variant", (variant, className) => {
    render(<Button variant={variant}>Action</Button>);
    expect(screen.getByRole("button").classList.contains(className)).toBe(true);
  });
});

describe("Badge", () => {
  it("renders a noninteractive span and forwards native attributes and ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref} className="count" title="Item count" aria-live="polite">2 items</Badge>);
    const badge = screen.getByTitle("Item count");
    expect(badge.tagName).toBe("SPAN");
    expect(badge.getAttribute("aria-live")).toBe("polite");
    expect(badge.hasAttribute("tabindex")).toBe(false);
    expect(badge.classList.contains("count")).toBe(true);
    expect(ref.current).toBe(badge);
  });

  it.each([
    ["neutral", "ui:bg-surface-muted"],
    ["accent", "ui:bg-accent-soft"],
    ["danger", "ui:bg-danger-soft"],
  ] as const)("styles the %s variant", (variant, className) => {
    render(<Badge variant={variant}>Status</Badge>);
    expect(screen.getByText("Status").classList.contains(className)).toBe(true);
  });
});

describe("Card", () => {
  it("forwards native attributes, events, className, children, and ref", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();
    const onClick = vi.fn();
    render(<Card ref={ref} className="panel" title="Panel" onClick={onClick}>Contents</Card>);
    const card = screen.getByTitle("Panel");
    expect(card.tagName).toBe("DIV");
    expect(card.textContent).toBe("Contents");
    expect(card.classList.contains("panel")).toBe(true);
    expect(card.classList.contains("ui:bg-surface")).toBe(true);
    expect(ref.current).toBe(card);
    await user.click(card);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("composes semantic HTML without losing library or consumer classes", () => {
    render(<Card render={<article className="article" />} className="panel" aria-label="Product">Keyboard</Card>);
    const card = screen.getByRole("article", { name: "Product" });
    expect(card.classList.contains("ui:bg-surface")).toBe(true);
    expect(card.classList.contains("panel")).toBe(true);
    expect(card.classList.contains("article")).toBe(true);
    expect(card.textContent).toBe("Keyboard");
  });
});
