import { afterEach, describe, expect, it } from "vitest";
import { init } from "./prototype";

afterEach(() => {
  document.body.innerHTML = "";
});

function makeVariantHtml(count: number): string {
  const variants = Array.from(
    { length: count },
    (_, i) =>
      `<div data-aitd-variant="${i + 1}" data-aitd-label="Variant ${i + 1}">Content ${i + 1}</div>`
  ).join("");
  return `<div data-aitd-variants>${variants}</div>`;
}

describe("init", () => {
  it("shows only the first variant and hides the rest", () => {
    document.body.innerHTML = makeVariantHtml(3);
    init();

    const variants = document.querySelectorAll("[data-aitd-variant]");
    expect(variants[0].getAttribute("data-aitd-active")).toBe("");
    expect((variants[1] as HTMLElement).style.display).toBe("none");
    expect((variants[2] as HTMLElement).style.display).toBe("none");
  });

  it("skips groups with fewer than 2 variants", () => {
    document.body.innerHTML = makeVariantHtml(1);
    init();

    const variant = document.querySelector(
      "[data-aitd-variant]"
    ) as HTMLElement;
    expect(variant.hasAttribute("data-aitd-active")).toBe(false);
  });

  it("initializes all groups with 2+ variants", () => {
    document.body.innerHTML = makeVariantHtml(2) + makeVariantHtml(3);
    init();

    const groups = document.querySelectorAll("[data-aitd-variants]");
    const firstOfGroup1 = groups[0].querySelector(
      "[data-aitd-variant]"
    ) as HTMLElement;
    const firstOfGroup2 = groups[1].querySelector(
      "[data-aitd-variant]"
    ) as HTMLElement;

    expect(firstOfGroup1.hasAttribute("data-aitd-active")).toBe(true);
    expect(firstOfGroup2.hasAttribute("data-aitd-active")).toBe(true);
  });

  it("does nothing when no variant containers exist", () => {
    document.body.innerHTML = "<div>Regular content</div>";
    expect(() => init()).not.toThrow();
  });
});
