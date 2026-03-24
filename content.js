(() => {
  'use strict';

  if (document.getElementById('eva-hud-overlay')) return;

  let enabled = true;
  let mode = 'analysis';
  let intervals = [];
  let targetRAF = null;

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randf = (min, max) => +(Math.random() * (max - min) + min).toFixed(1);


  function buildHUD() {
    const overlay = document.createElement('div');
    overlay.id = 'eva-hud-overlay';

    overlay.innerHTML = `
      <!-- Edge decoration -->
      <div class="eva-edge-line top"></div>
      <div class="eva-edge-line bottom"></div>
      <div class="eva-edge-line left-line"></div>
      <div class="eva-edge-line right-line"></div>

      <!-- Status Panel (top-left) -->
      <div id="eva-status-panel" class="eva-panel">
        <div class="eva-panel-title">NERV SYSTEM MONITOR</div>
        <div class="eva-status-row">
          <span class="eva-status-label">SYSTEM STATUS</span>
          <span class="eva-status-value active" id="eva-sys-status">ACTIVE</span>
        </div>
        <div class="eva-status-row">
          <span class="eva-status-label">SYNC RATE</span>
          <span class="eva-status-value warn" id="eva-sync-rate">87.3%</span>
        </div>
        <div class="eva-status-row">
          <span class="eva-status-label">SIGNAL</span>
          <span class="eva-status-value active" id="eva-signal">STABLE</span>
        </div>
        <div class="eva-status-row">
          <span class="eva-status-label">MODE</span>
          <span class="eva-status-value" id="eva-mode-label" style="color:var(--eva-orange)">ANALYSIS</span>
        </div>
      </div>

      <!-- Metrics Panel (bottom-right) -->
      <div id="eva-metrics-panel" class="eva-panel">
        <div class="eva-panel-title">DIAGNOSTICS</div>
        <div class="eva-status-row">
          <span class="eva-status-label">CPU LOAD</span>
          <span class="eva-status-value warn" id="eva-cpu">42%</span>
        </div>
        <div class="eva-metric-bar-track"><div class="eva-metric-bar-fill" id="eva-cpu-bar" style="width:42%"></div></div>
        <div class="eva-status-row">
          <span class="eva-status-label">DATA FLOW</span>
          <span class="eva-status-value warn" id="eva-data">1.2 GB/s</span>
        </div>
        <div class="eva-metric-bar-track"><div class="eva-metric-bar-fill" id="eva-data-bar" style="width:60%"></div></div>
        <div class="eva-status-row">
          <span class="eva-status-label">LATENCY</span>
          <span class="eva-status-value" id="eva-latency" style="color:var(--eva-green)">12ms</span>
        </div>
        <div class="eva-metric-bar-track"><div class="eva-metric-bar-fill low" id="eva-latency-bar" style="width:12%"></div></div>
      </div>

      <!-- Crosshair (center) -->
      <div id="eva-crosshair">
        <div class="eva-crosshair-line h"></div>
        <div class="eva-crosshair-line v"></div>
        <div class="eva-crosshair-ring"></div>
      </div>

      <!-- Alert container -->
      <div id="eva-alert-container"></div>
    `;

    document.documentElement.appendChild(overlay);

    const targetBox = document.createElement('div');
    targetBox.id = 'eva-target-box';
    targetBox.innerHTML = `
      <div class="eva-corner tl"></div>
      <div class="eva-corner tr"></div>
      <div class="eva-corner bl"></div>
      <div class="eva-corner br"></div>
      <div id="eva-target-label">TARGET LOCKED</div>
      <div id="eva-target-info"></div>
    `;
    document.documentElement.appendChild(targetBox);

    const scanLine = document.createElement('div');
    scanLine.id = 'eva-scan-line';
    document.documentElement.appendChild(scanLine);

    return overlay;
  }

  function playBootSequence(callback) {
    const boot = document.createElement('div');
    boot.id = 'eva-boot-overlay';

    const lines = [
      'INITIALIZING EVA SYSTEM...',
      'LOADING HUD MODULES...',
      'CALIBRATING SENSORS...',
      'SYSTEM ONLINE'
    ];

    lines.forEach((text, i) => {
      const el = document.createElement('div');
      el.className = 'eva-boot-line' + (i === lines.length - 1 ? ' eva-final' : '');
      el.textContent = text;
      boot.appendChild(el);
    });

    document.documentElement.appendChild(boot);

    const bootLines = boot.querySelectorAll('.eva-boot-line');
    bootLines.forEach((line, i) => {
      setTimeout(() => line.classList.add('eva-show'), 300 + i * 350);
    });

    setTimeout(() => {
      boot.classList.add('eva-fade-out');
      setTimeout(() => {
        boot.remove();
        callback();
      }, 500);
    }, 300 + lines.length * 350 + 400);
  }

  let currentTarget = null;

  function initTargeting() {
    document.addEventListener('mouseover', onMouseOver, true);
    document.addEventListener('mouseout', onMouseOut, true);
  }

  function destroyTargeting() {
    document.removeEventListener('mouseover', onMouseOver, true);
    document.removeEventListener('mouseout', onMouseOut, true);
    hideTarget();
  }

  function onMouseOver(e) {
    const el = e.target;
    if (el.closest('#eva-hud-overlay, #eva-target-box, #eva-scan-line, #eva-boot-overlay')) return;
    if (el === document.documentElement || el === document.body) return;
    currentTarget = el;
    updateTarget();
  }

  function onMouseOut(e) {
    if (e.target === currentTarget) {
      currentTarget = null;
      hideTarget();
    }
  }

  function updateTarget() {
    if (!currentTarget || !enabled) return;
    const box = document.getElementById('eva-target-box');
    if (!box) return;

    const rect = currentTarget.getBoundingClientRect();
    box.style.top = rect.top + 'px';
    box.style.left = rect.left + 'px';
    box.style.width = rect.width + 'px';
    box.style.height = rect.height + 'px';
    box.classList.add('eva-locked');

    const info = document.getElementById('eva-target-info');
    if (info) {
      const tag = currentTarget.tagName.toLowerCase();
      const cls = currentTarget.className && typeof currentTarget.className === 'string'
        ? '.' + currentTarget.className.split(' ')[0]
        : '';
      info.textContent = `<${tag}${cls}> ${Math.round(rect.width)}×${Math.round(rect.height)}`;
    }

    targetRAF = requestAnimationFrame(updateTarget);
  }

  function hideTarget() {
    if (targetRAF) cancelAnimationFrame(targetRAF);
    const box = document.getElementById('eva-target-box');
    if (box) box.classList.remove('eva-locked');
  }

  function startDataEngine() {
    intervals.push(setInterval(() => {
      const syncEl = document.getElementById('eva-sync-rate');
      const signalEl = document.getElementById('eva-signal');
      if (syncEl) syncEl.textContent = randf(72, 99) + '%';

      if (signalEl) {
        const r = Math.random();
        if (r < 0.7) {
          signalEl.textContent = 'STABLE';
          signalEl.className = 'eva-status-value active';
        } else if (r < 0.92) {
          signalEl.textContent = 'WEAK';
          signalEl.className = 'eva-status-value warn';
        } else {
          signalEl.textContent = 'LOST';
          signalEl.style.color = 'var(--eva-red)';
          signalEl.className = 'eva-status-value';
        }
      }
    }, 2500));

    intervals.push(setInterval(() => {
      const cpu = rand(25, 85);
      const data = randf(0.4, 4.8);
      const latency = rand(5, 120);

      const cpuEl = document.getElementById('eva-cpu');
      const cpuBar = document.getElementById('eva-cpu-bar');
      const dataEl = document.getElementById('eva-data');
      const dataBar = document.getElementById('eva-data-bar');
      const latEl = document.getElementById('eva-latency');
      const latBar = document.getElementById('eva-latency-bar');

      if (cpuEl) cpuEl.textContent = cpu + '%';
      if (cpuBar) {
        cpuBar.style.width = cpu + '%';
        cpuBar.className = 'eva-metric-bar-fill' + (cpu > 70 ? ' high' : cpu < 35 ? ' low' : '');
      }
      if (dataEl) dataEl.textContent = data + ' GB/s';
      if (dataBar) dataBar.style.width = Math.min(data / 5 * 100, 100) + '%';
      if (latEl) {
        latEl.textContent = latency + 'ms';
        latEl.style.color = latency > 80 ? 'var(--eva-red)' : latency > 40 ? 'var(--eva-orange)' : 'var(--eva-green)';
      }
      if (latBar) {
        latBar.style.width = Math.min(latency / 150 * 100, 100) + '%';
        latBar.className = 'eva-metric-bar-fill' + (latency > 80 ? ' high' : ' low');
      }
    }, 2000));
  }

  const ALERTS_ANALYSIS = ['DATA STREAM ACTIVE', 'PATTERN DETECTED', 'SCAN COMPLETE'];
  const ALERTS_COMBAT = ['WARNING', 'SIGNAL INTERRUPT', 'THREAT DETECTED', 'EVASION PROTOCOL', 'A.T. FIELD DETECTED'];

  function startAlerts() {
    const fire = () => {
      if (!enabled) return;
      const container = document.getElementById('eva-alert-container');
      if (!container) return;

      const alerts = mode === 'combat' ? ALERTS_COMBAT : ALERTS_ANALYSIS;
      const text = alerts[rand(0, alerts.length - 1)];

      const alert = document.createElement('div');
      alert.className = 'eva-alert';
      alert.textContent = text;
      container.appendChild(alert);

      setTimeout(() => alert.remove(), 3000);
    };

    const scheduleNext = () => {
      const delay = mode === 'combat' ? rand(3000, 6000) : rand(6000, 12000);
      const id = setTimeout(() => {
        fire();
        scheduleNext();
      }, delay);
      intervals.push(id);
    };
    scheduleNext();
  }

  function applyMode(newMode) {
    mode = newMode;
    const overlay = document.getElementById('eva-hud-overlay');
    const modeLabel = document.getElementById('eva-mode-label');

    if (overlay) {
      overlay.classList.toggle('eva-combat', mode === 'combat');
    }
    if (modeLabel) {
      modeLabel.textContent = mode === 'combat' ? 'COMBAT' : 'ANALYSIS';
      modeLabel.style.color = mode === 'combat' ? 'var(--eva-red)' : 'var(--eva-orange)';
    }
xt
    document.documentElement.classList.toggle('eva-combat', mode === 'combat');
  }

  function showHUD() {
    const overlay = document.getElementById('eva-hud-overlay');
    if (!overlay) buildHUD();

    setTimeout(() => {
      document.getElementById('eva-status-panel')?.classList.add('eva-visible');
      document.getElementById('eva-metrics-panel')?.classList.add('eva-visible');
      document.getElementById('eva-crosshair')?.classList.add('eva-visible');
      document.getElementById('eva-scan-line')?.classList.add('eva-visible');
    }, 50);

    applyMode(mode);
    initTargeting();
    startDataEngine();
    startAlerts();
  }

  function hideHUD() {
    destroyTargeting();
    intervals.forEach(id => clearTimeout(id));
    intervals = [];

    document.getElementById('eva-hud-overlay')?.remove();
    document.getElementById('eva-target-box')?.remove();
    document.getElementById('eva-scan-line')?.remove();
    document.getElementById('eva-boot-overlay')?.remove();
    document.documentElement.classList.remove('eva-combat');
  }

  function init() {
    chrome.storage.sync.get({ enabled: true, mode: 'analysis' }, (settings) => {
      enabled = settings.enabled;
      mode = settings.mode;

      if (enabled) {
        playBootSequence(() => showHUD());
      }
    });
  }

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) {
      enabled = changes.enabled.newValue;
      if (enabled) {
        playBootSequence(() => showHUD());
      } else {
        hideHUD();
      }
    }
    if (changes.mode) {
      mode = changes.mode.newValue;
      applyMode(mode);
    }
  });

  init();

})();