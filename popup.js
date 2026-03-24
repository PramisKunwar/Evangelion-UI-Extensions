document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle-btn');
  const toggleText = document.getElementById('toggle-text');
  const modeAnalysis = document.getElementById('mode-analysis');
  const modeCombat = document.getElementById('mode-combat');

  chrome.storage.sync.get({ enabled: true, mode: 'analysis' }, (settings) => {
    updateToggleUI(settings.enabled);
    updateModeUI(settings.mode);
  });

  toggleBtn.addEventListener('click', () => {
    chrome.storage.sync.get({ enabled: true }, (settings) => {
      const newVal = !settings.enabled;
      chrome.storage.sync.set({ enabled: newVal });
      updateToggleUI(newVal);
    });
  });

  modeAnalysis.addEventListener('click', () => setMode('analysis'));
  modeCombat.addEventListener('click', () => setMode('combat'));

  function setMode(m) {
    chrome.storage.sync.set({ mode: m });
    updateModeUI(m);
  }

  function updateToggleUI(on) {
    toggleBtn.classList.toggle('active', on);
    toggleText.textContent = on ? 'ONLINE' : 'OFFLINE';
  }

  function updateModeUI(m) {
    modeAnalysis.classList.toggle('active', m === 'analysis');
    modeCombat.classList.toggle('active', m === 'combat');
  }
});
