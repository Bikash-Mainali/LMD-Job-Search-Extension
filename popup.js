// --- State ---
let keywords = [];

// --- DOM ---
const input = document.getElementById('keywordInput');
const addBtn = document.getElementById('addBtn');
const tagsContainer = document.getElementById('tagsContainer');
const emptyMsg = document.getElementById('emptyMsg');
const saveBtn = document.getElementById('saveBtn');
const highlightBtn = document.getElementById('highlightBtn');
const clearBtn = document.getElementById('clearBtn');
const keywordCount = document.getElementById('keywordCount');
const statusDot = document.getElementById('statusDot');
const matchInfo = document.getElementById('matchInfo');
const toast = document.getElementById('toast');

// --- Toast ---
let toastTimer;
function showToast(msg, type = 'info') {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  toastTimer = setTimeout(() => {
    toast.className = 'toast';
  }, 2200);
}

// --- Render Tags ---
function renderTags() {
  // Remove all tags except emptyMsg
  Array.from(tagsContainer.children).forEach(child => {
    if (child.id !== 'emptyMsg') child.remove();
  });

  if (keywords.length === 0) {
    emptyMsg.style.display = 'flex';
    keywordCount.textContent = '0 saved';
    return;
  }

  emptyMsg.style.display = 'none';
  keywordCount.textContent = `${keywords.length} keyword${keywords.length !== 1 ? 's' : ''}`;

  keywords.forEach((kw, idx) => {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML = `
      <span>${escapeHtml(kw)}</span>
      <button class="tag-remove" title="Remove" data-idx="${idx}">✕</button>
    `;
    tagsContainer.appendChild(tag);
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// --- Add keyword ---
function addKeyword() {
  const val = input.value.trim();
  if (!val) return;

  // Check duplicate (case-insensitive)
  if (keywords.some(k => k.toLowerCase() === val.toLowerCase())) {
    showToast('Keyword already exists', 'error');
    input.select();
    return;
  }

  keywords.push(val);
  input.value = '';
  renderTags();
}

// --- Remove keyword ---
tagsContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('.tag-remove');
  if (!btn) return;
  const idx = parseInt(btn.dataset.idx);
  keywords.splice(idx, 1);
  renderTags();
});

// --- Save keywords ---
function saveKeywords() {
  chrome.storage.local.set({ jobKeywords: keywords }, () => {
    showToast(`✓ ${keywords.length} keyword${keywords.length !== 1 ? 's' : ''} saved`, 'success');
    statusDot.classList.add('active');
  });
}

// --- Load saved keywords ---
function loadKeywords() {
  chrome.storage.local.get(['jobKeywords', 'highlightActive'], (result) => {
    if (result.jobKeywords && Array.isArray(result.jobKeywords)) {
      keywords = result.jobKeywords;
      renderTags();
    }
    if (result.highlightActive) {
      statusDot.classList.add('active');
    }
  });
}

// --- Highlight on active tab ---
function runHighlight() {
  if (keywords.length === 0) {
    showToast('Add some keywords first!', 'error');
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    // First inject content script, then send message
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    }, () => {
      chrome.tabs.sendMessage(tabId, {
        action: 'highlight',
        keywords: keywords
      }, (response) => {
        if (chrome.runtime.lastError) {
          showToast('Cannot highlight this page', 'error');
          return;
        }
        if (response && response.count !== undefined) {
          const c = response.count;
          if (c > 0) {
            matchInfo.textContent = `✓ ${c} match${c !== 1 ? 'es' : ''} found`;
            matchInfo.className = 'match-info found';
            showToast(`${c} match${c !== 1 ? 'es' : ''} highlighted!`, 'success');
            statusDot.classList.add('active');
            chrome.storage.local.set({ highlightActive: true });
          } else {
            matchInfo.textContent = 'No matches found on this page';
            matchInfo.className = 'match-info';
            showToast('No matches on this page', 'info');
          }
        }
      });
    });
  });
}

// --- Clear highlights ---
function clearHighlights() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    }, () => {
      chrome.tabs.sendMessage(tabId, { action: 'clear' }, (response) => {
        if (chrome.runtime.lastError) return;
        matchInfo.textContent = '';
        matchInfo.className = 'match-info';
        statusDot.classList.remove('active');
        chrome.storage.local.set({ highlightActive: false });
        showToast('Highlights cleared', 'info');
      });
    });
  });
}

// --- Event Listeners ---
addBtn.addEventListener('click', addKeyword);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addKeyword();
});
saveBtn.addEventListener('click', saveKeywords);
highlightBtn.addEventListener('click', runHighlight);
clearBtn.addEventListener('click', clearHighlights);

// --- Init ---
loadKeywords();
