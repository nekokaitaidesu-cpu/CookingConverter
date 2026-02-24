const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  // Background gradient
  const bg = ctx.createRadialGradient(cx, cy * 0.8, 0, cx, cy, r);
  bg.addColorStop(0, '#1E1E35');
  bg.addColorStop(1, '#0A0A18');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.22);
  ctx.fill();

  // Microwave body
  const mw = size * 0.68;
  const mh = size * 0.46;
  const mx = cx - mw / 2;
  const my = cy - mh / 2 - size * 0.04;
  const mRad = size * 0.07;

  // Microwave outer shell
  ctx.fillStyle = '#2A2A45';
  ctx.strokeStyle = '#FF6B35';
  ctx.lineWidth = size * 0.025;
  ctx.beginPath();
  ctx.roundRect(mx, my, mw, mh, mRad);
  ctx.fill();
  ctx.stroke();

  // Door window (circle)
  const winX = mx + mw * 0.12;
  const winY = my + mh * 0.1;
  const winW = mw * 0.56;
  const winH = mh * 0.78;
  ctx.fillStyle = '#151525';
  ctx.strokeStyle = '#444466';
  ctx.lineWidth = size * 0.018;
  ctx.beginPath();
  ctx.roundRect(winX, winY, winW, winH, size * 0.05);
  ctx.fill();
  ctx.stroke();

  // Lightning bolt inside window
  const boltCx = winX + winW / 2;
  const boltCy = winY + winH / 2;
  const bs = size * 0.12;
  ctx.fillStyle = '#FF6B35';
  ctx.beginPath();
  ctx.moveTo(boltCx + bs * 0.2, boltCy - bs);
  ctx.lineTo(boltCx - bs * 0.3, boltCy + bs * 0.1);
  ctx.lineTo(boltCx + bs * 0.05, boltCy + bs * 0.1);
  ctx.lineTo(boltCx - bs * 0.2, boltCy + bs);
  ctx.lineTo(boltCx + bs * 0.3, boltCy - bs * 0.1);
  ctx.lineTo(boltCx - bs * 0.05, boltCy - bs * 0.1);
  ctx.closePath();
  ctx.fill();

  // Control panel on right
  const panelX = mx + mw * 0.72;
  const panelY = my + mh * 0.1;
  const panelW = mw * 0.24;
  const panelH = mh * 0.78;
  ctx.fillStyle = '#1A1A30';
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelW, panelH, size * 0.03);
  ctx.fill();

  // Panel dots
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      ctx.fillStyle = row === 0 && col === 0 ? '#FF6B35' : '#333355';
      ctx.beginPath();
      ctx.arc(
        panelX + panelW * (0.3 + col * 0.4),
        panelY + panelH * (0.2 + row * 0.3),
        size * 0.02,
        0, Math.PI * 2
      );
      ctx.fill();
    }
  }

  // Spoon icon bottom
  const spoonY = my + mh + size * 0.07;
  const spoonColor = '#4ECDC4';
  // spoon circle
  ctx.fillStyle = spoonColor;
  ctx.beginPath();
  ctx.arc(cx - size * 0.12, spoonY + size * 0.04, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // spoon handle
  ctx.strokeStyle = spoonColor;
  ctx.lineWidth = size * 0.022;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.12, spoonY + size * 0.08);
  ctx.lineTo(cx - size * 0.08, spoonY + size * 0.17);
  ctx.stroke();

  // fork
  ctx.strokeStyle = spoonColor;
  ctx.lineWidth = size * 0.018;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + size * 0.08 + i * size * 0.025, spoonY);
    ctx.lineTo(cx + size * 0.08 + i * size * 0.025, spoonY + size * 0.1);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.08, spoonY + size * 0.1);
  ctx.lineTo(cx + size * 0.08, spoonY + size * 0.17);
  ctx.stroke();

  return canvas;
}

// Generate sizes
const sizes = [
  { name: 'icon.png', size: 1024 },
  { name: 'adaptive-icon.png', size: 1024 },
  { name: 'splash-icon.png', size: 200 },
  { name: 'favicon.png', size: 48 },
];

const assetsDir = path.join(__dirname, 'assets');
for (const { name, size } of sizes) {
  const canvas = drawIcon(size);
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, name), buf);
  console.log(`✅ Generated ${name} (${size}x${size})`);
}
