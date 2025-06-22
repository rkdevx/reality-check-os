document.addEventListener("DOMContentLoaded", () => {
  const historyContainer = document.getElementById("history");
  const clearBtn = document.getElementById("clear");
  const exportBtn = document.getElementById("export");
  const searchInput = document.getElementById("search");
  const lowScoreOnly = document.getElementById("lowScoreOnly");

  let historyData = [];

  function renderHistory(data) {
    historyContainer.innerHTML = "";
    if (data.length === 0) {
      historyContainer.innerHTML = "<p>No matching claims found.</p>";
      return;
    }

    data.forEach(entry => {
      const el = document.createElement("div");
      el.className = "claim";
      el.innerHTML = `
        <div><strong>Text:</strong> ${entry.text}</div>
        <div><strong>Score:</strong> ${Math.round(entry.score * 100)}%</div>
        <div><strong>Verdict:</strong> ${entry.verdict}</div>
        <div><strong>Time:</strong> ${entry.timestamp}</div>
        ${entry.reasons.length ? `<ul>${entry.reasons.map(r => `<li>${r}</li>`).join("")}</ul>` : ""}
      `;
      historyContainer.appendChild(el);
    });
  }

  function filterAndRender() {
    const query = searchInput.value.toLowerCase();
    const showLow = lowScoreOnly.checked;

    const filtered = historyData.filter(entry => {
      const matchText = entry.text.toLowerCase().includes(query);
      const matchScore = showLow ? entry.score < 0.5 : true;
      return matchText && matchScore;
    });

    renderHistory(filtered);
  }

  chrome.storage.local.get(["realitycheck_history"], (result) => {
    historyData = (result.realitycheck_history || []).reverse();
    filterAndRender();
  });

  searchInput.addEventListener("input", filterAndRender);
  lowScoreOnly.addEventListener("change", filterAndRender);

  clearBtn.addEventListener("click", () => {
    chrome.storage.local.remove("realitycheck_history", () => {
      location.reload();
    });
  });

  exportBtn.addEventListener("click", () => {
    const rows = [
      ["Text", "Score", "Verdict", "Time", "Reasons"]
    ];
    historyData.forEach(entry => {
      rows.push([
        entry.text,
        Math.round(entry.score * 100) + "%",
        entry.verdict,
        entry.timestamp,
        entry.reasons.join("; ")
      ]);
    });

    const csvContent = rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute("download", "realitycheck_history.csv");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});
