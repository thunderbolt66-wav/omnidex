const { execSync } = require('child_process');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const brainDir = 'C:\\Users\\ojasp\\.gemini\\antigravity\\brain\\4eb2be42-8c07-43e3-910c-7098cb13d2b4';

// 1. Capture cloaked 404 facade when someone tries /admin.html directly without the secret gate
const outCloaked = path.join(brainDir, 'admin_cloaked_404.png');
const cmd1 = `"${edgePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=3000 --window-size=1280,850 --screenshot="${outCloaked}" "http://localhost:5173/admin.html"`;
try {
  execSync(cmd1, { stdio: 'ignore' });
  console.log('Successfully captured:', outCloaked);
} catch (e) {
  console.error('Failed 1:', e.message);
}

// 2. Capture owner-authenticated dashboard when accessed with secret gate parameter
const outUncloaked = path.join(brainDir, 'admin_uncloaked_owner.png');
const cmd2 = `"${edgePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=3500 --window-size=1280,900 --screenshot="${outUncloaked}" "http://localhost:5173/admin.html?gate=omnidex-admin-vault-2026"`;
try {
  execSync(cmd2, { stdio: 'ignore' });
  console.log('Successfully captured:', outUncloaked);
} catch (e) {
  console.error('Failed 2:', e.message);
}
