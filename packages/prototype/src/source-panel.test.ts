import { describe, expect, it } from "vitest";
import { extractCleanHtml } from "./source-panel";

describe("extractCleanHtml", () => {
  it("returns innerHTML of the element", () => {
    const el = document.createElement("div");
    el.innerHTML = "<p>Hello</p>";
    expect(extractCleanHtml(el)).toContain("Hello");
  });

  it("strips data-aitd-* attributes from the element itself", () => {
    const el = document.createElement("div");
    el.setAttribute("data-aitd-variant", "1");
    el.setAttribute("data-aitd-label", "Test");
    el.innerHTML = "<p>Content</p>";
    const result = extractCleanHtml(el);
    expect(result).not.toContain("data-aitd-");
  });

  it("strips data-aitd-* attributes recursively from children", () => {
    const el = document.createElement("div");
    el.innerHTML = `<div data-aitd-active="" class="inner"><p data-aitd-variant="1">Text</p></div>`;
    const result = extractCleanHtml(el);
    expect(result).not.toContain("data-aitd-");
    expect(result).toContain('class="inner"');
    expect(result).toContain("Text");
  });

  it("does not mutate the original element", () => {
    const el = document.createElement("div");
    el.setAttribute("data-aitd-variant", "1");
    extractCleanHtml(el);
    expect(el.getAttribute("data-aitd-variant")).toBe("1");
  });
});
