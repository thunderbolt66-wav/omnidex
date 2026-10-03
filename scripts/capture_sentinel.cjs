const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const brainDir = 'C:\\Users\\ojasp\\.gemini\\antigravity\\brain\\4eb2be42-8c07-43e3-910c-7098cb13d2b4';

// 1. Capture locked gatekeeper modal
const outLocked = path.join(brainDir, 'sentinel_gate_locked.png');
const cmd1 = `"${edgePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=3000 --window-size=1280,850 --screenshot="${outLocked}" "http://localhost:5173/?admin=true"`;
try {
  execSync(cmd1, { stdio: 'ignore' });
  console.log('Successfully captured:', outLocked);
} catch (e) {
  console.error('Failed 1:', e.message);
}

// 2. Capture unlocked dashboard modal
const outUnlocked = path.join(brainDir, 'sentinel_dashboard_unlocked.png');
const cmd2 = `"${edgePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=3500 --window-size=1280,900 --screenshot="${outUnlocked}" "http://localhost:5173/?admin=true&key=omnidex-admin-vault-2026"`;
try {
  execSync(cmd2, { stdio: 'ignore' });
  console.log('Successfully captured:', outUnlocked);
} catch (e) {
  console.error('Failed 2:', e.message);
}

