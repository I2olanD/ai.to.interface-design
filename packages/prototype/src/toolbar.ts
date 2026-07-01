import { announceVariant, bindKeyboardNavigation } from "./accessibility";
import { switchVariant } from "./switcher";
import type { PickerConfig, VariantGroup } from "./types";

export interface ToolbarHandle {
  host: HTMLElement;
  shadow: ShadowRoot;
  liveRegion: HTMLElement;
}

export function getToolbarStyles(config: PickerConfig): string {
  const darkVars = `--bg:rgba(30,30,30,.9);--border:rgba(255,255,255,.12);--text:#eee;--muted:#999;--hover:rgba(255,255,255,.07)`;
  const lightVars = `--bg:rgba(255,255,255,.88);--border:rgba(0,0,0,.1);--text:#111;--muted:#666;--hover:rgba(0,0,0,.05)`;
  const forced =
    config.theme === "dark"
      ? darkVars
      : config.theme === "light"
        ? lightVars
        : "";

  return `.w{${forced || lightVars};display:flex;align-items:center;gap:6px;background:var(--bg);border:1px solid var(--border);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:10px;padding:6px 12px;box-shadow:0 2px 12px rgba(0,0,0,.15);font:12px system-ui,-apple-system,sans-serif;color:var(--text);box-sizing:border-box;user-select:none}${!forced ? `@media(prefers-color-scheme:dark){.w{${darkVars}}}` : ""}.nav-btn{all:unset;cursor:pointer;padding:4px 6px;border-radius:4px;opacity:.6;flex-shrink:0;font-size:14px;line-height:1}.nav-btn:hover{opacity:1;background:var(--hover)}.nav-btn:focus-visible{outline:2px solid var(--text);outline-offset:1px}.nav-btn:disabled{opacity:.2;cursor:default}.label{font-weight:600;white-space:nowrap;max-width:180px;text-overflow:ellipsis;overflow:hidden}.counter{color:var(--muted);font-size:11px;white-space:nowrap}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}.branding{opacity:.4;flex-shrink:0;display:flex;align-items:center}`;
}

const POSITIONS: Record<PickerConfig["position"], string> = {
  "bottom-center": "bottom:16px;left:50%;transform:translateX(-50%)",
  "bottom-left": "bottom:16px;left:16px",
  "bottom-right": "bottom:16px;right:16px",
  "top-center": "top:16px;left:50%;transform:translateX(-50%)"
};

function createHost(config: PickerConfig): HTMLElement {
  const host = document.createElement("div");
  host.setAttribute(
    "style",
    `position:fixed;z-index:2147483640;${POSITIONS[config.position]}`
  );
  return host;
}

function buildBranding(): HTMLElement {
  const span = document.createElement("span");
  span.className = "branding";
  span.setAttribute("aria-hidden", "true");
  span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="16" height="16" role="img" aria-label="ai.to.design"><defs><radialGradient id="aitd-c1" cx="50%" cy="5%" r="75%"><stop offset="0%" stop-color="#00FF9C" stop-opacity="1"/><stop offset="100%" stop-color="#00FF9C" stop-opacity="0"/></radialGradient><radialGradient id="aitd-c2" cx="95%" cy="62%" r="75%"><stop offset="0%" stop-color="#00D9FF" stop-opacity="1"/><stop offset="100%" stop-color="#00D9FF" stop-opacity="0"/></radialGradient><radialGradient id="aitd-c3" cx="72%" cy="97%" r="75%"><stop offset="0%" stop-color="#BF6FFF" stop-opacity="1"/><stop offset="100%" stop-color="#BF6FFF" stop-opacity="0"/></radialGradient><radialGradient id="aitd-c4" cx="28%" cy="97%" r="75%"><stop offset="0%" stop-color="#FF4D1C" stop-opacity="1"/><stop offset="100%" stop-color="#FF4D1C" stop-opacity="0"/></radialGradient><radialGradient id="aitd-c5" cx="5%" cy="62%" r="75%"><stop offset="0%" stop-color="#FF8A75" stop-opacity="1"/><stop offset="100%" stop-color="#FF8A75" stop-opacity="0"/></radialGradient><clipPath id="aitd-clip"><circle cx="200" cy="200" r="200"/></clipPath></defs><circle cx="200" cy="200" r="200" fill="#00FF9C"/><g clip-path="url(#aitd-clip)"><rect x="0" y="0" width="400" height="400" fill="url(#aitd-c1)"/><rect x="0" y="0" width="400" height="400" fill="url(#aitd-c2)"/><rect x="0" y="0" width="400" height="400" fill="url(#aitd-c3)"/><rect x="0" y="0" width="400" height="400" fill="url(#aitd-c4)"/><rect x="0" y="0" width="400" height="400" fill="url(#aitd-c5)"/></g></svg>`;
  return span;
}

function buildNavButton(label: string, ariaLabel: string): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.setAttribute("type", "button");
  btn.setAttribute("aria-label", ariaLabel);
  btn.className = "nav-btn";
  btn.textContent = label;
  return btn;
}

export function updateLabel(shadow: ShadowRoot, group: VariantGroup): void {
  const label = shadow.querySelector(".label");
  const counter = shadow.querySelector(".counter");
  if (label) {
    label.textContent = group.variants[group.activeIndex].label;
  }
  if (counter) {
    counter.textContent = `${group.activeIndex + 1}/${group.variants.length}`;
  }
}

export function createToolbar(group: VariantGroup): ToolbarHandle {
  const host = createHost(group.config);
  const shadow = host.attachShadow({ mode: "closed" });

  const style = document.createElement("style");
  style.textContent = getToolbarStyles(group.config);
  shadow.appendChild(style);

  const toolbar = document.createElement("div");
  toolbar.setAttribute("role", "toolbar");
  toolbar.setAttribute("aria-label", "UI prototype picker");
  toolbar.className = "w";

  if (group.config.branding) toolbar.appendChild(buildBranding());

  const prevBtn = buildNavButton("\u25c0", "Previous variant");
  const nextBtn = buildNavButton("\u25b6", "Next variant");

  const label = document.createElement("span");
  label.className = "label";
  label.textContent = group.variants[group.activeIndex].label;

  const counter = document.createElement("span");
  counter.className = "counter";
  counter.textContent = `${group.activeIndex + 1}/${group.variants.length}`;

  toolbar.appendChild(prevBtn);
  toolbar.appendChild(label);
  toolbar.appendChild(counter);
  toolbar.appendChild(nextBtn);

  shadow.appendChild(toolbar);

  const liveRegion = document.createElement("div");
  liveRegion.setAttribute("aria-live", "polite");
  liveRegion.setAttribute("aria-atomic", "true");
  liveRegion.className = "sr-only";
  shadow.appendChild(liveRegion);

  const performSwitch = (i: number): void => {
    switchVariant(group, i);
    updateLabel(shadow, group);
    announceVariant(
      liveRegion,
      group.variants[group.activeIndex],
      group.variants.length
    );
  };

  prevBtn.addEventListener("click", () => {
    const total = group.variants.length;
    performSwitch((group.activeIndex - 1 + total) % total);
  });

  nextBtn.addEventListener("click", () => {
    const total = group.variants.length;
    performSwitch((group.activeIndex + 1) % total);
  });

  bindKeyboardNavigation(shadow, group, performSwitch);

  document.body.appendChild(host);

  return { host, shadow, liveRegion };
}
