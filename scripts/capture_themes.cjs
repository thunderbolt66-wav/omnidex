const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const themes = ['kraft', 'sepia', 'dark', 'cyberpunk', 'tokyo-night', 'forest', 'matcha'];
const outDir = path.resolve(__dirname, '../screenshots');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const t of themes) {
  const outFile = path.join(outDir, `theme_${t}_account.png`);
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const url = `http://localhost:5173/?theme=${t}&tab=account`;
  const cmd = `"${edgePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=2500 --window-size=1280,900 --screenshot="${outFile}" "${url}"`;

  try {
    execSync(cmd, { stdio: 'ignore' });
    console.log(`Captured: theme_${t}_account.png`);
  } catch (err) {
    console.error(`Error capturing ${t}:`, err.message);
  }
}
console.log('Batch screenshots complete!');
