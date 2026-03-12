// JobSpot Content Script — Keyword Highlighter
// Injected into pages to highlight keywords with whole-word, case-insensitive matching

(function () {
  const MARK_CLASS = 'jobspot-highlight';
  const STYLE_ID = 'jobspot-styles';

  // Inject highlight styles if not present
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .${MARK_CLASS} {
        background: #f0c040 !important;
        color: #0d0f14 !important;
        border-radius: 3px !important;
        padding: 1px 2px !important;
        font-weight: 600 !important;
        box-shadow: 0 0 0 2px rgba(240,192,64,0.35) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Remove all existing highlights
  function clearHighlights() {
    const marks = document.querySelectorAll(`.${MARK_CLASS}`);
    marks.forEach(mark => {
      const parent = mark.parentNode;
      if (!parent) return;
      // Replace mark with its text content
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });
  }

  // Highlight all matching keywords in the page
  function highlightKeywords(keywords) {
    if (!keywords || keywords.length === 0) return 0;

    // Build one regex with all keywords using word boundaries
    // \b ensures whole-word matching; 'i' flag for case-insensitive
    const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');

    let count = 0;

    // Walk text nodes in the document body
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentNode;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
          // Skip script, style, textarea, input, already marked
          if (['script', 'style', 'textarea', 'input', 'select', 'noscript'].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.classList && parent.classList.contains(MARK_CLASS)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    textNodes.forEach(textNode => {
      const text = textNode.textContent;
      if (!pattern.test(text)) return;
      pattern.lastIndex = 0;

      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      let match;

      while ((match = pattern.exec(text)) !== null) {
        // Text before match
        if (match.index > lastIndex) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }

        // Highlighted match
        const mark = document.createElement('mark');
        mark.className = MARK_CLASS;
        mark.textContent = match[0];
        fragment.appendChild(mark);

        count++;
        lastIndex = pattern.lastIndex;
      }

      // Remaining text
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      textNode.parentNode.replaceChild(fragment, textNode);
    });

    return count;
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'highlight') {
      injectStyles();
      clearHighlights();
      const count = highlightKeywords(message.keywords);
      sendResponse({ count });
    } else if (message.action === 'clear') {
      clearHighlights();
      sendResponse({ cleared: true });
    }
    return true;
  });
})();
