import type { PickerConfig, VariantGroup } from "./types";

export function initializeVisibility(group: VariantGroup): void {
  for (let i = 0; i < group.variants.length; i++) {
    const variant = group.variants[i];
    if (i === 0) {
      variant.element.style.display = "";
      variant.element.setAttribute("data-aitd-active", "");
    } else {
      variant.element.style.setProperty("display", "none", "important");
    }
  }
}

export function switchVariant(group: VariantGroup, targetIndex: number): void {
  if (targetIndex === group.activeIndex) return;

  const prev = group.variants[group.activeIndex];
  const next = group.variants[targetIndex];

  prev.element.removeAttribute("data-aitd-active");
  next.element.setAttribute("data-aitd-active", "");
  group.activeIndex = targetIndex;

  if (shouldCrossfade(group.config)) {
    startCrossfade(prev.element, next.element);
  } else {
    prev.element.style.setProperty("display", "none", "important");
    next.element.style.display = "";
  }
}

function shouldCrossfade(config: PickerConfig): boolean {
  if (config.transition !== "crossfade") return false;
  try {
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function startCrossfade(prev: HTMLElement, next: HTMLElement): void {
  prev.style.transition = "opacity 150ms ease";
  prev.style.opacity = "0";
  next.style.display = "";
  next.style.opacity = "0";

  const onPrevEnd = (): void => {
    prev.removeEventListener("transitionend", onPrevEnd);
    prev.style.setProperty("display", "none", "important");
    prev.style.removeProperty("transition");
    prev.style.removeProperty("opacity");
    next.style.transition = "opacity 150ms ease";
    next.style.opacity = "1";

    const onNextEnd = (): void => {
      next.removeEventListener("transitionend", onNextEnd);
      next.style.removeProperty("transition");
      next.style.removeProperty("opacity");
    };
    next.addEventListener("transitionend", onNextEnd);
  };
  prev.addEventListener("transitionend", onPrevEnd);
}

export function getNextIndex(current: number, total: number): number {
  return (current + 1) % total;
}

export function getPrevIndex(current: number, total: number): number {
  return (current - 1 + total) % total;
}
