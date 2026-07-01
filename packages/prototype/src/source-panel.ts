import type { VariantGroup } from "./types";

export function extractCleanHtml(element: HTMLElement): string {
  const clone = element.cloneNode(true) as HTMLElement;
  for (const el of [clone, ...clone.querySelectorAll<HTMLElement>("*")]) {
    for (const attr of [...el.attributes]) {
      if (attr.name.startsWith("data-aitd-")) el.removeAttribute(attr.name);
    }
  }
  return clone.innerHTML;
}

function buildPanel(html: string, config: VariantGroup["config"]): HTMLElement {
  const panel = document.createElement("div");
  panel.className = "source-panel";

  const pre = document.createElement("pre");
  pre.className = "source-pre";
  pre.textContent = html;
  panel.appendChild(pre);

  const footer = document.createElement("div");
  footer.className = "source-footer";

  const copyBtn = document.createElement("button");
  copyBtn.setAttribute("type", "button");
  copyBtn.className = "copy-btn";
  copyBtn.textContent = "Copy";
  copyBtn.addEventListener("click", () => copyToClipboard(html, copyBtn));
  footer.appendChild(copyBtn);

  if (config.branding) {
    const brand = document.createElement("span");
    brand.className = "source-branding";
    brand.textContent = "Generated with ai.to.design";
    footer.appendChild(brand);
  }

  panel.appendChild(footer);
  return panel;
}

function copyToClipboard(text: string, btn: HTMLButtonElement): void {
  const showConfirm = (): void => {
    btn.textContent = "Copied!";
    setTimeout(() => {
      btn.textContent = "Copy";
    }, 2000);
  };

  if (navigator.clipboard?.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(showConfirm)
      .catch(() => fallbackCopy(text, btn));
  } else {
    fallbackCopy(text, btn);
  }
}

function fallbackCopy(text: string, btn: HTMLButtonElement): void {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;opacity:0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    btn.textContent = "Copied!";
    setTimeout(() => {
      btn.textContent = "Copy";
    }, 2000);
  } finally {
    document.body.removeChild(ta);
  }
}

export function createSourcePanel(
  shadow: ShadowRoot,
  group: VariantGroup,
  host: HTMLElement
): void {
  const sourceBtn = shadow.querySelector(".source-btn");
  if (!sourceBtn) return;

  sourceBtn.addEventListener("click", () => {
    const existing = shadow.querySelector(".source-panel");
    if (existing) {
      existing.remove();
      host.style.removeProperty("bottom");
      return;
    }
    const html = extractCleanHtml(group.variants[group.activeIndex].element);
    shadow.appendChild(buildPanel(html, group.config));
  });
}
