// --- State ---
let keywords = [];

const STORAGE_KEY = "sponsorshipKeywords";

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

// Sponsorship modal
const addSponsorshipBtn = document.getElementById("addSponsorship");
const modal = document.getElementById("sponsorshipModal");
const closeModalBtn = document.getElementById("closeModal");
const positiveInput = document.getElementById("positiveInput");
const addPositiveBtn = document.getElementById("addPositiveBtn");
const negativeInput = document.getElementById("negativeInput");
const addNegativeBtn = document.getElementById("addNegativeBtn");
const positiveList = document.getElementById("positiveList");
const negativeList = document.getElementById("negativeList");

// --- Sponsorship storage (chrome.storage.local) ---
function getSponsorshipPhrases(callback) {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
        const data = result[STORAGE_KEY] || { positive: [], negative: [] };
        callback(data);
    });
}

function saveSponsorshipPhrases(data, callback) {
    chrome.storage.local.set({ [STORAGE_KEY]: data }, callback);
}

// --- Add positive keyword ---
function addPositiveKeyword() {
    const val = positiveInput.value.trim();
    if (!val) return;

    getSponsorshipPhrases((data) => {
        let kws = data.positive || [];
        const exists = kws.some(k => k.toLowerCase() === val.toLowerCase());
        if (exists) {
            showToast('Phrase already exists', 'error');
            return;
        }
        kws.unshift(val);
        data.positive = kws;
        saveSponsorshipPhrases(data, () => {
            positiveInput.value = "";
            renderPositiveTags();
        });
    });
}

// --- Add negative keyword ---
function addNegativeKeyword() {
    const val = negativeInput.value.trim();
    if (!val) return;

    getSponsorshipPhrases((data) => {
        let kws = data.negative || [];
        const exists = kws.some(k => k.toLowerCase() === val.toLowerCase());
        if (exists) {
            showToast('Phrase already exists', 'error');
            return;
        }
        kws.unshift(val);
        data.negative = kws;
        saveSponsorshipPhrases(data, () => {
            negativeInput.value = "";
            renderNegativeTags();
        });
    });
}

// --- Render positive list ---
function renderPositiveTags() {
    getSponsorshipPhrases((data) => {
        positiveList.innerHTML = "";
        (data.positive || []).forEach((kw, idx) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span>${escapeHtml(kw)}</span>
                <button class="tag-remove" data-type="positive" data-idx="${idx}">✕</button>
            `;
            positiveList.appendChild(li);
        });
    });
}

// --- Render negative list ---
function renderNegativeTags() {
    getSponsorshipPhrases((data) => {
        negativeList.innerHTML = "";
        (data.negative || []).forEach((kw, idx) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span>${escapeHtml(kw)}</span>
                <button class="tag-remove" data-type="negative" data-idx="${idx}">✕</button>
            `;
            negativeList.appendChild(li);
        });
    });
}

// --- Remove from sponsorship lists ---
document.addEventListener("click", function (e) {
    if (!e.target.classList.contains("tag-remove")) return;

    // Only handle sponsorship list removes (have data-type attribute)
    const type = e.target.dataset.type;
    if (!type) return;

    const idx = parseInt(e.target.dataset.idx);

    getSponsorshipPhrases((data) => {
        data[type].splice(idx, 1);
        saveSponsorshipPhrases(data, () => {
            renderPositiveTags();
            renderNegativeTags();
        });
    });
});

// --- Default sponsorship phrases ---
function storeDefaultSponsorshipPhrases(callback) {
    const negative = [
        "sponsorship not available", "visa sponsorship not available",
        "no visa sponsorship", "no sponsorship available",
        "sponsorship is not provided", "visa sponsorship is not provided",
        "this role does not offer sponsorship", "this position does not offer sponsorship",
        "this role is not eligible for visa sponsorship",
        "this position is not eligible for sponsorship",
        "not eligible for visa sponsorship", "unable to sponsor",
        "will not sponsor", "cannot sponsor",
        "we do not sponsor visas", "we do not provide visa sponsorship",
        "company will not sponsor visa", "cannot provide immigration sponsorship",
        "must be authorized to work in the united states",
        "must be legally authorized to work in the us",
        "must be legally authorized to work in the united states",
        "must have authorization to work in the us",
        "must have valid work authorization", "must have unrestricted work authorization",
        "must have permanent work authorization", "must already be authorized to work",
        "must be eligible to work in the us",
        "must have the legal right to work in the us",
        "must be authorized to work for any employer in the us",
        "must be authorized to work in the us without sponsorship",
        "without sponsorship", "without visa sponsorship",
        "authorized to work without sponsorship",
        "authorized to work without visa sponsorship",
        "authorized to work in the us without sponsorship",
        "authorized to work in the us without visa sponsorship",
        "no h1b sponsorship", "no h1b sponsorship available",
        "h1b sponsorship not available", "h1b sponsorship unavailable",
        "no h1b visa sponsorship", "unable to provide H1B visa sponsorship",
        "h1b visa sponsorship not provided", "h1b transfer not supported",
        "no visa transfer", "visa transfer not supported",
        "no opt", "no opt candidates", "no cpt", "opt not supported",
        "cpt not supported", "no stem opt", "opt candidates not accepted",
        "cpt candidates not accepted", "f1 visa not supported",
        "green card required", "green card holders only",
        "gc required", "gc ead required", "permanent resident required",
        "must be permanent resident", "must be green card holder",
        "us permanent resident only", "us citizens only",
        "us citizens or green card holders only", "must be us citizen",
        "must be a us citizen", "us citizenship required", "citizenship required",
        "requires us citizenship", "must be us citizen or permanent resident",
        "due to government contract must be us citizen",
        "must be us citizen due to government contract",
        "security clearance required", "must be eligible for security clearance",
        "requires active security clearance"
    ];

    const positive = [
        "visa sponsorship available", "sponsorship available",
        "sponsorship provided", "visa sponsorship provided",
        "visa sponsorship offered", "sponsorship offered",
        "h1b sponsorship available", "h1b visa sponsorship available",
        "offer h1b visa sponsorship", "offers h1b visa sponsorship",
        "we sponsor h1b", "we sponsor h1b visas",
        "h1b transfer supported", "h1b transfer available",
        "h1b visa transfer supported", "immigration sponsorship available",
        "immigration sponsorship provided", "employment visa sponsorship available",
        "green card sponsorship available", "green card sponsorship provided",
        "gc sponsorship available", "opt accepted", "opt candidates welcome",
        "cpt accepted", "stem opt accepted", "f1 visa candidates welcome",
        "visa support available", "relocation and visa sponsorship available",
        "company will sponsor visa", "employer will sponsor visa",
        "visa assistance provided"
    ];

    getSponsorshipPhrases((existing) => {
        const merged = {
            positive: [...(existing.positive || []), ...positive],
            negative: [...(existing.negative || []), ...negative]
        };
        // Remove duplicates (case-insensitive)
        merged.positive = [...new Map(merged.positive.map(k => [k.toLowerCase(), k])).values()];
        merged.negative = [...new Map(merged.negative.map(k => [k.toLowerCase(), k])).values()];

        saveSponsorshipPhrases(merged, callback);
    });
}

// --- Show / Hide modal ---
addSponsorshipBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    storeDefaultSponsorshipPhrases(() => {
        renderPositiveTags();
        renderNegativeTags();
    });
    setTimeout(() => modal.classList.add("show"), 10);
});

closeModalBtn.addEventListener("click", () => {
    modal.classList.remove("show");
    setTimeout(() => modal.classList.add("hidden"), 300);
});

// --- Sponsorship input listeners ---
addPositiveBtn.addEventListener("click", addPositiveKeyword);
positiveInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addPositiveKeyword(); });

addNegativeBtn.addEventListener("click", addNegativeKeyword);
negativeInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addNegativeKeyword(); });

// --- Toast ---
let toastTimer;
function showToast(msg, type = 'info') {
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.className = `toast ${type} show`;
    toastTimer = setTimeout(() => { toast.className = 'toast'; }, 2200);
}

// --- Render keyword tags ---
function renderTags() {
    Array.from(tagsContainer.children).forEach(child => {
        if (child.id !== 'emptyMsg') child.remove();
    });

    if (keywords.length === 0) {
        emptyMsg.style.display = 'flex';
        keywordCount.textContent = '0 saved';
        return;
    }

    emptyMsg.style.display = 'none';
    keywordCount.textContent = `${keywords.length}`;

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

    if (keywords.some(k => k.toLowerCase() === val.toLowerCase())) {
        showToast('Keyword already exists', 'error');
        input.select();
        return;
    }

    keywords.push(val);
    input.value = '';
    renderTags();
}

// --- Remove keyword tag (only tags without data-type) ---
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

    getSponsorshipPhrases((sponsorshipData) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0].id;

            chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] }, () => {
                chrome.tabs.sendMessage(tabId, {
                    action: 'highlight',
                    keywords: keywords,
                    sponsorshipPhrases: sponsorshipData
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        showToast('Cannot highlight this page', 'error');
                        return;
                    }

                    // Clear previous sponsorship results
                    const existingInfo = document.getElementById('sponsorshipInfo');
                    if (existingInfo) existingInfo.remove();

                    const sponsorship = response.sponsorship || {};
                    const positive = sponsorship.positive || [];
                    const negative = sponsorship.negative || [];

                    if (positive.length > 0 || negative.length > 0) {
                        const infoContainer = document.createElement('div');
                        infoContainer.id = 'sponsorshipInfo';
                        infoContainer.className = 'sponsorship-info';

                        if (positive.length > 0) {
                            const posDiv = document.createElement("div");
                            posDiv.className = "sponsorship-positive";
                            const title = document.createElement("div");
                            title.className = "sponsorship-title";
                            title.textContent = "🟢 Sponsorship Available";
                            const list = document.createElement("ul");
                            positive.forEach(p => {
                                const li = document.createElement("li");
                                li.textContent = p;
                                list.appendChild(li);
                            });
                            posDiv.appendChild(title);
                            posDiv.appendChild(list);
                            infoContainer.appendChild(posDiv);
                        }

                        if (negative.length > 0) {
                            const negDiv = document.createElement("div");
                            negDiv.className = "sponsorship-negative";
                            const title = document.createElement("div");
                            title.className = "sponsorship-title";
                            title.textContent = "🔴 Sponsorship Restrictions";
                            const list = document.createElement("ul");
                            negative.forEach(p => {
                                const li = document.createElement("li");
                                li.textContent = p;
                                list.appendChild(li);
                            });
                            negDiv.appendChild(title);
                            negDiv.appendChild(list);
                            infoContainer.appendChild(negDiv);
                        }

                        // Insert after match-info
                        matchInfo.insertAdjacentElement('afterend', infoContainer);
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
                            matchInfo.textContent = 'No keyword matches found on this page';
                            matchInfo.className = 'match-info';
                            showToast('No keyword matches on this page', 'info');
                        }
                    }
                });
            });
        });
    });
}

// --- Clear highlights ---
function clearHighlights() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
        chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] }, () => {
            chrome.tabs.sendMessage(tabId, { action: 'clear' }, (response) => {
                if (chrome.runtime.lastError) return;
                matchInfo.textContent = '';
                matchInfo.className = 'match-info';
                const existingInfo = document.getElementById('sponsorshipInfo');
                if (existingInfo) existingInfo.remove();
                statusDot.classList.remove('active');
                chrome.storage.local.set({ highlightActive: false });
                showToast('Highlights cleared', 'info');
            });
        });
    });
}

// --- Event Listeners ---
addBtn.addEventListener('click', addKeyword);
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') addKeyword(); });
saveBtn.addEventListener('click', saveKeywords);
highlightBtn.addEventListener('click', runHighlight);
clearBtn.addEventListener('click', clearHighlights);

// --- Init ---
loadKeywords();
