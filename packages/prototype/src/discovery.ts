import type { Variant, VariantGroup } from "./types";
import { parseConfig } from "./types";

let idCounter = 0;

function generateId(): string {
  idCounter += 1;
  return `aitd-group-${idCounter}`;
}

function parseVariant(element: HTMLElement): Variant | null {
  const raw = element.getAttribute("data-aitd-variant");
  if (raw === null) return null;

  const index = parseInt(raw, 10);
  if (Number.isNaN(index)) return null;

  const label = element.getAttribute("data-aitd-label") ?? `Variant ${index}`;
  const description = element.getAttribute("data-aitd-description");

  return { element, index, label, description };
}

function parseVariantGroup(container: HTMLElement): VariantGroup {
  const rawId = container.getAttribute("data-aitd-variants");
  const id = rawId !== null && rawId.length > 0 ? rawId : generateId();

  const variants: Variant[] = [];
  for (const child of Array.from(container.children)) {
    if (child instanceof HTMLElement) {
      const variant = parseVariant(child);
      if (variant !== null) variants.push(variant);
    }
  }

  variants.sort((a, b) => a.index - b.index);

  return {
    container,
    id,
    variants,
    activeIndex: 0,
    config: parseConfig(container)
  };
}

export function discoverVariantGroups(): VariantGroup[] {
  const containers = document.querySelectorAll<HTMLElement>(
    "[data-aitd-variants]"
  );
  return Array.from(containers).map(parseVariantGroup);
}

export { parseVariantGroup };
