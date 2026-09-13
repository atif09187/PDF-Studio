// Unicode bidirectional text utilities for PDF Studio editor

// Arabic and Urdu character ranges:
// - Arabic (0600-06FF)
// - Arabic Supplement (0750-077F)
// - Arabic Extended-A (08A0-08FF)
// - Arabic Presentation Forms-A (FB50-FDFF)
// - Arabic Presentation Forms-B (FE70-FEFF)
export const RTL_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

// Latin, English, digits, and Western scripts:
export const LTR_REGEX = /[A-Za-z0-9\u00C0-\u024F\u0370-\u052F]/;

/**
 * Returns 'rtl' if first strong directional character is Arabic/Urdu,
 * otherwise returns 'ltr'.
 */
export function getFirstStrongDirection(text: string): 'rtl' | 'ltr' {
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (RTL_REGEX.test(char)) return 'rtl';
    if (LTR_REGEX.test(char)) return 'ltr';
  }
  return 'ltr';
}

/**
 * Ensures any paragraph/heading/list item in the container has its `dir` attribute
 * matched to its content direction (RTL for Arabic/Urdu, LTR for English/empty).
 */
export function syncBlockDirections(container: HTMLElement) {
  const blocks = container.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div, li, blockquote');
  blocks.forEach((el) => {
    const block = el as HTMLElement;
    // Skip image wrappers or control elements
    if (block.classList.contains('doc-image-wrapper')) return;

    const text = (block.textContent || '').trim();
    if (!text) {
      if (!block.hasAttribute('dir')) {
        block.setAttribute('dir', 'ltr');
      }
      return;
    }
    const dir = getFirstStrongDirection(text);
    if (block.getAttribute('dir') !== dir) {
      block.setAttribute('dir', dir);
    }
  });
}

/**
 * Checks the block under the current selection anchor and updates its direction
 * smoothly without interrupting the cursor or typing flow.
 */
export function updateActiveBlockDirection(container: HTMLElement) {
  const selection = window.getSelection();
  if (!selection || !selection.anchorNode) return;

  let node: Node | null = selection.anchorNode;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentNode;
  }

  while (node && node !== container) {
    const el = node as HTMLElement;
    const tagName = el.tagName?.toLowerCase();
    if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'li', 'blockquote'].includes(tagName)) {
      if (el.classList.contains('doc-image-wrapper')) return;
      const text = (el.textContent || '').trim();
      const dir = text ? getFirstStrongDirection(text) : 'ltr';
      if (el.getAttribute('dir') !== dir) {
        el.setAttribute('dir', dir);
      }
      break;
    }
    node = node.parentNode;
  }
}
