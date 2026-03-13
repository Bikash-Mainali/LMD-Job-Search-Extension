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
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });
  }

  // Highlight all matching keywords in the page
  function highlightKeywords(keywords) {
    if (!keywords || keywords.length === 0) return { count: 0, sponsorship: null };

    const bodyText = document.body.innerText.toLowerCase();

    // Detect sponsorship phrases
    const sponsorshipPatterns = {

      negative: [

        // Direct sponsorship denial
        "sponsorship not available",
        "visa sponsorship not available",
        "no visa sponsorship",
        "no sponsorship available",
        "sponsorship is not provided",
        "visa sponsorship is not provided",
        "this role does not offer sponsorship",
        "this position does not offer sponsorship",
        "this role is not eligible for visa sponsorship",
        "this position is not eligible for sponsorship",
        "not eligible for visa sponsorship",
        "unable to sponsor",
        "will not sponsor",
        "cannot sponsor",
        "we do not sponsor visas",
        "we do not provide visa sponsorship",
        "company will not sponsor visa",
        "cannot provide immigration sponsorship",

        // Work authorization wording
        "must be authorized to work in the united states",
        "must be legally authorized to work in the us",
        "must be legally authorized to work in the united states",
        "must have authorization to work in the us",
        "must have valid work authorization",
        "must have unrestricted work authorization",
        "must have permanent work authorization",
        "must already be authorized to work",
        "must be eligible to work in the us",
        "must have the legal right to work in the us",
        "must be authorized to work for any employer in the us",
        "must be authorized to work in the us without sponsorship",

        // Without sponsorship
        "without sponsorship",
        "without visa sponsorship",
        "authorized to work without sponsorship",
        "authorized to work without visa sponsorship",
        "authorized to work in the us without sponsorship",
        "authorized to work in the us without visa sponsorship",

        // H1B related
        "no h1b sponsorship",
        "no h1b sponsorship available",
        "h1b sponsorship not available",
        "h1b sponsorship unavailable",
        "no h1b visa sponsorship",
        "unable to provide H1B visa sponsorship",
        "h1b visa sponsorship not provided",
        "h1b transfer not supported",
        "no visa transfer",
        "visa transfer not supported",

        // OPT / CPT restrictions
        "no opt",
        "no opt candidates",
        "no cpt",
        "opt not supported",
        "cpt not supported",
        "no stem opt",
        "opt candidates not accepted",
        "cpt candidates not accepted",
        "f1 visa not supported",

        // Green Card / GC EAD
        "green card required",
        "green card holders only",
        "gc required",
        "gc ead required",
        "permanent resident required",
        "must be permanent resident",
        "must be green card holder",
        "us permanent resident only",

        // Citizenship requirements
        "us citizens only",
        "us citizens or green card holders only",
        "must be us citizen",
        "must be a us citizen",
        "us citizenship required",
        "citizenship required",
        "requires us citizenship",
        "must be us citizen or permanent resident",

        // Government / clearance roles
        "due to government contract must be us citizen",
        "must be us citizen due to government contract",
        "security clearance required",
        "must be eligible for security clearance",
        "requires active security clearance"
      ],

      positive: [

        // General sponsorship
        "visa sponsorship available",
        "sponsorship available",
        "sponsorship provided",
        "visa sponsorship provided",
        "visa sponsorship offered",
        "sponsorship offered",

        // H1B sponsorship
        "h1b sponsorship available",
        "h1b visa sponsorship available",
        "offer h1b visa sponsorship",
        "offers h1b visa sponsorship",
        "we sponsor h1b",
        "we sponsor h1b visas",
        "h1b transfer supported",
        "h1b transfer available",
        "h1b visa transfer supported",

        // Immigration support
        "immigration sponsorship available",
        "immigration sponsorship provided",
        "employment visa sponsorship available",

        // Green card sponsorship
        "green card sponsorship available",
        "green card sponsorship provided",
        "gc sponsorship available",

        // OPT / CPT support
        "opt accepted",
        "opt candidates welcome",
        "cpt accepted",
        "stem opt accepted",
        "f1 visa candidates welcome",

        // Other positive wording
        "visa support available",
        "relocation and visa sponsorship available",
        "company will sponsor visa",
        "employer will sponsor visa",
        "visa assistance provided"
      ]

    };
    let positiveSponsorship = [];
    let negativeSponsorship = [];

    for (const phrase of sponsorshipPatterns.positive) {

      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const regex = new RegExp(`\\b${escaped}\\b`, "i");

      if (regex.test(bodyText)) {
        positiveSponsorship.push(phrase);
      }
    }

    for (const phrase of sponsorshipPatterns.negative) {

      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const regex = new RegExp(`\\b${escaped}\\b`, "i");

      if (regex.test(bodyText)) {
        negativeSponsorship.push(phrase);
      }
    }



    // Build regex for keywords
    const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');

    let count = 0;

    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            const parent = node.parentNode;
            if (!parent) return NodeFilter.FILTER_REJECT;

            const tag = parent.tagName ? parent.tagName.toLowerCase() : '';

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

        if (match.index > lastIndex) {
          fragment.appendChild(
              document.createTextNode(text.slice(lastIndex, match.index))
          );
        }

        const mark = document.createElement('mark');
        mark.className = MARK_CLASS;
        mark.textContent = match[0];
        fragment.appendChild(mark);

        count++;
        lastIndex = pattern.lastIndex;
      }

      if (lastIndex < text.length) {
        fragment.appendChild(
            document.createTextNode(text.slice(lastIndex))
        );
      }

      textNode.parentNode.replaceChild(fragment, textNode);
    });

    return { count, sponsorship: {positive:positiveSponsorship, negative:negativeSponsorship} };
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === 'highlight') {
      injectStyles();
      clearHighlights();

      const result = highlightKeywords(message.keywords);

      sendResponse({
        count: result.count,
        sponsorship: result.sponsorship
      });
    }

    else if (message.action === 'clear') {
      clearHighlights();
      sendResponse({ cleared: true });
    }

    return true;
  });

})();
