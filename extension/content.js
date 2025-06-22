document.addEventListener("mouseup", async () => {
  const selectedText = window.getSelection().toString().trim();

  if (selectedText.length < 10 || selectedText.length > 500) return;

  console.log("Selected:", selectedText);

  try {
    const res = await fetch("http://localhost:8000/api/analyze/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: selectedText })
    });

    const data = await res.json();
    console.log("Backend response:", data);

    // ✅ Pass original selected text for history
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

  // 🔽 Save the result in history
  saveClaimToHistory(originalText, score, verdict, reasons);
}
function saveClaimToHistory(text, score, verdict, reasons) {
  const timestamp = new Date().toLocaleString();
  const newEntry = { text, score, verdict, reasons, timestamp };

  chrome.storage.local.get(["realitycheck_history"], (result) => {
    const history = result.realitycheck_history || [];
    history.push(newEntry);
    chrome.storage.local.set({ realitycheck_history: history }, () => {
      console.log("✅ Claim saved (via chrome.storage):", newEntry);
    });
  });
}


async function scanPage() {
  const paragraphs = Array.from(document.querySelectorAll("p, li, blockquote"));
  const textChunks = [];

  for (const el of paragraphs) {
    const sentences = el.innerText.split(/[.?!]\s/).filter(s => s.length > 10);
    for (const sentence of sentences) {
      textChunks.push({ sentence, el });
    }
  }

  for (const { sentence, el } of textChunks) {
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
      console.error("Auto-scan error:", err);
    }
  }

  console.log("✅ Page scan complete");
}


function highlightSentence(element, sentence, data) {
  const cleanText = sentence.trim();

  if (!element.innerText.includes(cleanText)) {
    console.warn("🟡 Not found in DOM:", cleanText);
    return;
  }

  const safeSentence = cleanText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(safeSentence, "i");

  const newHTML = element.innerHTML.replace(
    regex,
    `<mark class="rc-low-score" title="${data.verdict} (${Math.round(data.score * 100)}%) - ${data.reasons[0] || ''}">$&</mark>`
  );

  if (newHTML !== element.innerHTML) {
    element.innerHTML = newHTML;
    console.log("🔴 Highlighted:", cleanText);
  }
}


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

window.addEventListener("load", () => {
  setTimeout(scanPage, 1000); // slight delay after DOM ready
});


window.addEventListener("triggerScanFromBackground", () => {
  console.log("🔁 Scan triggered by extension icon");
  scanPage();
});