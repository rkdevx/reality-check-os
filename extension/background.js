chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: triggerScan
  });
});

function triggerScan() {
  if (typeof scanPage === "function") {
    scanPage();
  } else {
    console.warn("RealityCheck scanPage() not found.");
  }
}
