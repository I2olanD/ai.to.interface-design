import { afterEach, describe, expect, it } from "vitest";
import { createToolbar, getToolbarStyles, updateLabel } from "./toolbar";
import type { VariantGroup } from "./types";
import { DEFAULT_CONFIG } from "./types";

const NO_TRANSITION = { ...DEFAULT_CONFIG, transition: "none" as const };

function makeGroup(
  count: number,
  overrides: Partial<typeof DEFAULT_CONFIG> = {}
): VariantGroup {
  const container = document.createElement("div");
  const variants = Array.from({ length: count }, (_, i) => ({
    element: document.createElement("div"),
    index: i + 1,
    label: `Variant ${i + 1}`,
    description: null
  }));
  return {
    container,
    id: "test",
    variants,
    activeIndex: 0,
    config: { ...NO_TRANSITION, ...overrides }
  };
}

describe("createToolbar", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("appends host element to document.body", () => {
    createToolbar(makeGroup(2));
    expect(document.body.children.length).toBe(1);
  });

  it("host has position fixed", () => {
    const { host } = createToolbar(makeGroup(2));
    expect(host.style.position).toBe("fixed");
  });

  it("shadow contains role=toolbar", () => {
    const { shadow } = createToolbar(makeGroup(2));
    expect(shadow.querySelector("[role='toolbar']")).not.toBeNull();
  });

  it("shows current variant label", () => {
    const { shadow } = createToolbar(makeGroup(3));
    const label = shadow.querySelector(".label") as HTMLElement;
    expect(label.textContent).toBe("Variant 1");
  });

  it("shows counter as 1/N", () => {
    const { shadow } = createToolbar(makeGroup(4));
    const counter = shadow.querySelector(".counter") as HTMLElement;
    expect(counter.textContent).toBe("1/4");
  });

  it("has prev and next navigation buttons", () => {
    const { shadow } = createToolbar(makeGroup(3));
    const prevBtn = shadow.querySelector("[aria-label='Previous variant']");
    const nextBtn = shadow.querySelector("[aria-label='Next variant']");
    expect(prevBtn).not.toBeNull();
    expect(nextBtn).not.toBeNull();
  });

  it("clicking next updates label and counter", () => {
    const group = makeGroup(3);
    const { shadow } = createToolbar(group);
    const nextBtn = shadow.querySelector(
      "[aria-label='Next variant']"
    ) as HTMLElement;
    nextBtn.click();
    const label = shadow.querySelector(".label") as HTMLElement;
    const counter = shadow.querySelector(".counter") as HTMLElement;
    expect(label.textContent).toBe("Variant 2");
    expect(counter.textContent).toBe("2/3");
    expect(group.activeIndex).toBe(1);
  });

  it("clicking prev wraps to last variant", () => {
    const group = makeGroup(3);
    const { shadow } = createToolbar(group);
    const prevBtn = shadow.querySelector(
      "[aria-label='Previous variant']"
    ) as HTMLElement;
    prevBtn.click();
    const label = shadow.querySelector(".label") as HTMLElement;
    const counter = shadow.querySelector(".counter") as HTMLElement;
    expect(label.textContent).toBe("Variant 3");
    expect(counter.textContent).toBe("3/3");
    expect(group.activeIndex).toBe(2);
  });

  it("clicking next wraps to first variant", () => {
    const group = makeGroup(2);
    const { shadow } = createToolbar(group);
    const nextBtn = shadow.querySelector(
      "[aria-label='Next variant']"
    ) as HTMLElement;
    nextBtn.click();
    nextBtn.click();
    const label = shadow.querySelector(".label") as HTMLElement;
    expect(label.textContent).toBe("Variant 1");
    expect(group.activeIndex).toBe(0);
  });

  it("shadow contains a live region", () => {
    const { shadow } = createToolbar(makeGroup(2));
    expect(shadow.querySelector("[aria-live='polite']")).not.toBeNull();
  });

  it("shows branding when config.branding is true", () => {
    const { shadow } = createToolbar(makeGroup(2, { branding: true }));
    expect(shadow.querySelector(".branding")).not.toBeNull();
  });

  it("hides branding when config.branding is false", () => {
    const { shadow } = createToolbar(makeGroup(2, { branding: false }));
    expect(shadow.querySelector(".branding")).toBeNull();
  });
});

describe("updateLabel", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("updates label and counter text", () => {
    const group = makeGroup(3);
    const { shadow } = createToolbar(group);
    group.activeIndex = 2;
    updateLabel(shadow, group);
    const label = shadow.querySelector(".label") as HTMLElement;
    const counter = shadow.querySelector(".counter") as HTMLElement;
    expect(label.textContent).toBe("Variant 3");
    expect(counter.textContent).toBe("3/3");
  });
});

describe("getToolbarStyles", () => {
  it("returns a non-empty CSS string", () => {
    const css = getToolbarStyles(DEFAULT_CONFIG);
    expect(typeof css).toBe("string");
    expect(css.length).toBeGreaterThan(0);
  });

  it("includes dark mode media query for auto theme", () => {
    const css = getToolbarStyles({ ...DEFAULT_CONFIG, theme: "auto" });
    expect(css).toContain("prefers-color-scheme");
  });

  it("does not include dark media query when theme is forced light", () => {
    const css = getToolbarStyles({ ...DEFAULT_CONFIG, theme: "light" });
    expect(css).not.toContain("prefers-color-scheme");
  });

  it("includes backdrop-filter for frosted glass", () => {
    const css = getToolbarStyles(DEFAULT_CONFIG);
    expect(css).toContain("backdrop-filter");
  });
});
