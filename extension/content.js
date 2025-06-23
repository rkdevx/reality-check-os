console.log("🧠 RealityCheck OS Loaded");

const scannedElements = new WeakSet();

document.addEventListener("mouseup", async () => {
  const selectedText = window.getSelection().toString().trim();

  if (selectedText.length < 10 || selectedText.length > 500) return;

  console.log("📌 Selected:", selectedText);

  try {
    const res = await fetch("http://localhost:8000/api/analyze/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: selectedText })
    });

    const data = await res.json();
    console.log("📬 Backend response:", data);

    showOverlay(data.score, data.verdict, data.reasons, selectedText);
  } catch (err) {
    console.error("❌ Extension fetch error:", err);
  }
});


function showOverlay(score, verdict, reasons = [], originalText = "") {
  const existing = document.getElementById("realitycheck-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "realitycheck-overlay";

  overlay.innerHTML = `
    <strong>🧠 RealityCheck</strong><br/>
    Score: <strong>${Math.round(score * 100)}%</strong><br/>
    Verdict: <em>${verdict}</em><br/>
    ${reasons.length ? `<ul style="margin-top: 8px; padding-left: 20px;">
      ${reasons.slice(0, 3).map(r => `<li>${r}</li>`).join("")}
    </ul>` : ""}
  `;

  Object.assign(overlay.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    background: "#1e1e1e",
    color: "#f5f5f5",
    padding: "12px 16px",
    borderRadius: "10px",
    zIndex: 999999,
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
    maxWidth: "320px",
    lineHeight: "1.4"
  });

  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 7000);

  saveClaimToHistory(originalText, score, verdict, reasons);
}

// ✅ Save history in chrome storage
function saveClaimToHistory(text, score, verdict, reasons) {
  const timestamp = new Date().toLocaleString();
  const newEntry = { text, score, verdict, reasons, timestamp };

  chrome.storage.local.get(["realitycheck_history"], (result) => {
    const history = result.realitycheck_history || [];
    history.push(newEntry);
    chrome.storage.local.set({ realitycheck_history: history }, () => {
      console.log("💾 Saved to history:", newEntry);
    });
  });
}

// ✅ Full page scan on load
async function scanPage() {
  const elements = Array.from(document.querySelectorAll("p, li, blockquote"));

  for (const el of elements) {
    if (scannedElements.has(el)) continue;
    scannedElements.add(el);

    const sentences = el.innerText.split(/[.?!]\s/).filter(s => s.length > 10);
    for (const sentence of sentences) {
      try {
        const res = await fetch("http://localhost:8000/api/analyze/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: sentence })
        });

        const data = await res.json();
        if (data.score < 0.5) {
          highlightSentence(el, sentence, data);
        }
      } catch (err) {
        console.error("Scan error:", err);
      }
    }
  }

  console.log("✅ Page scan complete");
  console.log("📊 Sentence:", sentence, "| Score:", data.score);
}

// ✅ Highlight sentence using Range API
function highlightSentence(element, sentence, data) {
  const cleanText = sentence.trim();
  const range = findRangeInElement(element, cleanText);

  if (!range) {
    console.warn("⚠️ Could not find range for:", cleanText);
    return;
  }

  const mark = document.createElement("mark");
  mark.className = "rc-low-score";
  mark.title = `${data.verdict} (${Math.round(data.score * 100)}%) - ${data.reasons[0] || ""}`;
  mark.style.backgroundColor = "rgba(255,0,0,0.2)";
  mark.style.borderRadius = "4px";
  mark.style.padding = "2px 4px";

  try {
    range.surroundContents(mark);
    console.log("🔴 Highlighted with Range:", cleanText);
  } catch (e) {
    console.warn("⛔ Failed to highlight (bad structure):", cleanText, e);
  }
}

// ✅ Find range even if text spans multiple tags
function findRangeInElement(el, targetText) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node;

  while ((node = walker.nextNode())) {
    if (node.textContent.includes(targetText)) {
      console.log("✅ Found match in node:", node.textContent);
      const index = node.textContent.indexOf(targetText);
      const range = document.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + targetText.length);
      return range;
    }
  }

  console.warn("❌ Could not match text in DOM:", targetText);
  return null;
}


// ✅ Inject highlight style
const style = document.createElement("style");
style.innerHTML = `
  mark.rc-low-score {
    background-color: rgba(255, 0, 0, 0.2);
    color: black;
    padding: 2px 4px;
    border-radius: 4px;
    cursor: help;
  }
`;
document.head.appendChild(style);

// ✅ Auto scan new dynamic content
function observeNewContent() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) {
          const newElements = node.querySelectorAll?.("p, li, blockquote") || [];
          newElements.forEach(scanElement);
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log("👁️ MutationObserver started");
}

// ✅ Scan newly added element
function scanElement(el) {
  if (scannedElements.has(el)) return;
  scannedElements.add(el);

  const sentences = el.innerText.split(/[.?!]\s/).filter(s => s.length > 10);
  sentences.forEach(async sentence => {
    try {
      const res = await fetch("http://localhost:8000/api/analyze/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sentence })
      });

      const data = await res.json();
      if (data.score < 0.5) {
        highlightSentence(el, sentence, data);
      }
    } catch (err) {
      console.error("👁️ Live scan error:", err);
    }
    console.log("📊 Sentence:", sentence, "| Score:", data.score);
  });
}

// ✅ Initial trigger after DOM ready
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    scanPage();
    observeNewContent();
  }, 1000);
});

// ✅ Triggered by background
window.addEventListener("triggerScanFromBackground", () => {
  console.log("🔁 Manual scan triggered");
  scanPage();
});
