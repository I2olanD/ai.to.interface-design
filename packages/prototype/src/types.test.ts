import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_CONFIG, parseConfig } from "./types";

function makeContainer(attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement("div");
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

describe("parseConfig", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = makeContainer();
  });

  it("returns defaults when no attributes are set", () => {
    const config = parseConfig(container);
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it("parses data-aitd-transition attribute", () => {
    container.setAttribute("data-aitd-transition", "slide");
    const config = parseConfig(container);
    expect(config.transition).toBe("slide");
  });

  it("parses data-aitd-theme attribute", () => {
    container.setAttribute("data-aitd-theme", "dark");
    const config = parseConfig(container);
    expect(config.theme).toBe("dark");
  });

  it("parses data-aitd-position attribute", () => {
    container.setAttribute("data-aitd-position", "top-center");
    const config = parseConfig(container);
    expect(config.position).toBe("top-center");
  });

  it("parses data-aitd-branding=false to false", () => {
    container.setAttribute("data-aitd-branding", "false");
    const config = parseConfig(container);
    expect(config.branding).toBe(false);
  });

  it("parses data-aitd-branding=true to true", () => {
    container.setAttribute("data-aitd-branding", "true");
    const config = parseConfig(container);
    expect(config.branding).toBe(true);
  });

  it("ignores invalid transition value and falls back to default", () => {
    container.setAttribute("data-aitd-transition", "invalid");
    const config = parseConfig(container);
    expect(config.transition).toBe(DEFAULT_CONFIG.transition);
  });

  it("ignores invalid theme value and falls back to default", () => {
    container.setAttribute("data-aitd-theme", "rainbow");
    const config = parseConfig(container);
    expect(config.theme).toBe(DEFAULT_CONFIG.theme);
  });

  it("ignores invalid position value and falls back to default", () => {
    container.setAttribute("data-aitd-position", "middle");
    const config = parseConfig(container);
    expect(config.position).toBe(DEFAULT_CONFIG.position);
  });
});
