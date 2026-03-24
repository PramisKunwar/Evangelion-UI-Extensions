# Evangelion UI Extension
Chrome Extension (Manifest V3) that overlays any webpage with a sci-fi HUD inspired by *Neon Genesis Evangelion*.

---

## Overview
Adds a cinematic HUD over websites. The page stays interactive — overlay is purely visual.

---

| ![Evangelion UI Extension](/Evangelion%20UI%20Extension.png) | ![Evangelion UI Extension](/Evangelion%20UI%20Extension1.png) |
|-------------------------------------------------------------|---------------------------------------------------------------|
| ![Evangelion UI Extension](/Evangelion%20UI%20Extension2.png) | ![Evangelion UI Extension](/Evangelion%20UI%20Extension3.png) |
| ![Evangelion UI Extension](/Evangelion%20UI%20Extension4.png) | ![Evangelion UI Extension](/Evangelion%20UI%20Extension5.png) |


## Features
- **Targeting**: Hover to lock on elements with animated brackets + info  
- **Status Panel**: Sync rate, signal strength, system activity  
- **Alerts**: Periodic warnings with flashing borders  
- **Metrics**: Animated CPU, data flow, latency  
- **Modes**:  
  - *Analysis*: Calm visuals, orange accents  
  - *Combat*: Red palette, faster updates, frequent alerts  
- **Boot Sequence**: Quick startup animation  
- **Scanline**: Subtle sweeping line

---

## File Structure

```
eva-extension/
├── manifest.json      # Manifest V3 configuration
├── content.js         # HUD injection, targeting, data engine
├── styles.css         # All overlay styles and animations
├── popup.html         # Extension popup markup
├── popup.js           # Popup logic (toggle, mode switch)
├── popup.css          # Popup styling
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```
---
## Usage
- Toggle HUD via popup  
- Switch between ANALYSIS and COMBAT  
- Settings saved with `chrome.storage.sync`

---

## License
Made for hack club (carnival ysws).