import { discoverVariantGroups, parseVariantGroup } from "./discovery";
import { initializeVisibility } from "./switcher";
import { createToolbar } from "./toolbar";

export function init(): void {
  const groups = discoverVariantGroups();
  for (const group of groups) {
    if (group.variants.length < 2) continue;
    initializeVisibility(group);
    createToolbar(group);
  }
}

function handleMutation(mutations: MutationRecord[]): void {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (
        node instanceof HTMLElement &&
        node.hasAttribute("data-aitd-variants")
      ) {
        const group = parseVariantGroup(node);
        if (group.variants.length >= 2) {
          initializeVisibility(group);
          createToolbar(group);
        }
      }
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

const observer = new MutationObserver(handleMutation);
observer.observe(document.body, { childList: true, subtree: true });
