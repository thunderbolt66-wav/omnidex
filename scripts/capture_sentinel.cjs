const { execSync } = require('child_process');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const brainDir = 'C:\\Users\\ojasp\\.gemini\\antigravity\\brain\\4eb2be42-8c07-43e3-910c-7098cb13d2b4';

// 1. Capture main app (verify no admin UI in main app)
const outMain = path.join(brainDir, 'main_app_clean.png');
const cmd1 = `"${edgePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=3000 --window-size=1280,850 --screenshot="${outMain}" "http://localhost:5173/"`;
try {
  execSync(cmd1, { stdio: 'ignore' });
  console.log('Successfully captured:', outMain);
} catch (e) {
  console.error('Failed 1:', e.message);
}

// 2. Capture standalone admin portal locked
const outAdminLocked = path.join(brainDir, 'standalone_admin_locked.png');
const cmd2 = `"${edgePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=3000 --window-size=1280,850 --screenshot="${outAdminLocked}" "http://localhost:5173/admin.html"`;
try {
  execSync(cmd2, { stdio: 'ignore' });
  console.log('Successfully captured:', outAdminLocked);
} catch (e) {
  console.error('Failed 2:', e.message);
}

// 3. Capture standalone admin portal unlocked
const outAdminUnlocked = path.join(brainDir, 'standalone_admin_unlocked.png');
const cmd3 = `"${edgePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=3500 --window-size=1280,900 --screenshot="${outAdminUnlocked}" "http://localhost:5173/admin.html?key=omnidex-admin-vault-2026"`;
try {
  execSync(cmd3, { stdio: 'ignore' });
  console.log('Successfully captured:', outAdminUnlocked);
} catch (e) {
  console.error('Failed 3:', e.message);
}
