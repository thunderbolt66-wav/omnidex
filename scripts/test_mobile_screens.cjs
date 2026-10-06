const { execSync } = require('child_process');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const brainDir = 'C:/Users/ojasp/.gemini/antigravity/brain/4eb2be42-8c07-43e3-910c-7098cb13d2b4';

const screens = [
  { name: 'mobile_390_home', url: 'http://localhost:4173/?tab=home', width: 390, height: 844 },
  { name: 'mobile_360_insights', url: 'http://localhost:4173/?tab=insights', width: 360, height: 800 },
  { name: 'mobile_412_add', url: 'http://localhost:4173/?tab=add', width: 412, height: 915 },
  { name: 'mobile_390_settings', url: 'http://localhost:4173/?tab=settings', width: 390, height: 844 },
  { name: 'mobile_390_account', url: 'http://localhost:4173/?tab=account', width: 390, height: 844 },
];

for (const s of screens) {
  const outFile = path.join(brainDir, `${s.name}.png`);
  const cmd = `"${edgePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=3500 --window-size=${s.width},${s.height} --screenshot="${outFile}" "${s.url}"`;
  try {
    execSync(cmd, { stdio: 'ignore' });
    console.log(`Captured ${s.name}: ${outFile}`);
  } catch (err) {
    console.error(`Error on ${s.name}:`, err.message);
  }
}
