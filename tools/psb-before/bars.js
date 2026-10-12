// Shared by fix.html (cashback) and card.html (card data): iOS bars drawn on a 590×1280 canvas
const W = 590,
  H = 1280,
  BAR = 70;
// The longest stretch of rows that are one flat colour, as [from, to) in source rows
function emptyRun(img, y0, y1) {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const k = c.getContext('2d');
  k.drawImage(img, 0, 0);
  const d = k.getImageData(0, 0, W, H).data;
  const flat = (y) => {
    const i0 = (y * W + 8) * 4;
    for (let x = 8; x < W - 8; x += 3) {
      const i = (y * W + x) * 4;
      if (
        Math.abs(d[i] - d[i0]) + Math.abs(d[i + 1] - d[i0 + 1]) + Math.abs(d[i + 2] - d[i0 + 2]) >
        9
      )
        return false;
    }
    return true;
  };
  let best = [y0, y0];
  let start = -1;
  for (let y = y0; y <= y1; y++) {
    if (y < y1 && flat(y)) {
      if (start < 0) start = y;
    } else if (start >= 0) {
      if (y - start > best[1] - best[0]) best = [start, y];
      start = -1;
    }
  }
  return best;
}
const load = (src) =>
  new Promise((r) => {
    const i = new Image();
    i.onload = () => r(i);
    i.src = src;
  });
const lum = ([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b;

function statusBar(ctx, light) {
  const c = light ? '#fff' : '#000';
  ctx.fillStyle = c;
  ctx.strokeStyle = c;
  ctx.font = '600 25px Inter';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('9:41', 95, 47);
  // signal: four bars
  const bx = 418,
    by = 56;
  [6, 9, 12, 15].forEach((h, i) => {
    ctx.beginPath();
    ctx.roundRect(bx + i * 7, by - h, 5, h, 1.5);
    ctx.fill();
  });
  // wifi: three arcs and a dot
  const wx = 467,
    wy = 58;
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  [16, 10.5].forEach((r) => {
    ctx.beginPath();
    ctx.arc(wx, wy, r, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.moveTo(wx, wy);
  ctx.arc(wx, wy, 5.5, -Math.PI * 0.75, -Math.PI * 0.25);
  ctx.closePath();
  ctx.fill();
  // battery
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.roundRect(492, 40, 37, 18, 5);
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(531, 45, 3, 8, 1.5);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.roundRect(495, 43, 31, 12, 3);
  ctx.fill();
}
function homeBar(ctx, light) {
  ctx.fillStyle = light ? '#fff' : '#000';
  ctx.beginPath();
  ctx.roundRect(W / 2 - 98, H - 19, 196, 7, 3.5);
  ctx.fill();
}
const px = (img, x, y) => {
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = 1;
  const k = c.getContext('2d');
  k.drawImage(img, x, y, 1, 1, 0, 0, 1, 1);
  return [...k.getImageData(0, 0, 1, 1).data];
};
// Replaces annotation red (the scenario's highlight boxes) with the nearest non-red pixel in the row
function unRed(ctx, y0, y1) {
  const d = ctx.getImageData(0, y0, W, y1 - y0);
  const a = d.data;
  const red = (i) => a[i] > 170 && a[i + 1] < 110 && a[i + 2] < 110;
  const mask = new Uint8Array(W * (y1 - y0));
  for (let y = 0; y < y1 - y0; y++)
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (red(i))
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const yy = y + dy,
              xx = x + dx;
            if (yy >= 0 && yy < y1 - y0 && xx >= 0 && xx < W) mask[yy * W + xx] = 1;
          }
    }
  for (let y = 0; y < y1 - y0; y++)
    for (let x = 0; x < W; x++) {
      if (!mask[y * W + x]) continue;
      for (let r = 1; r < 12; r++) {
        const cands = [
          [x - r, y],
          [x + r, y],
          [x, y - r],
          [x, y + r],
        ].filter(([xx, yy]) => xx >= 0 && xx < W && yy >= 0 && yy < y1 - y0 && !mask[yy * W + xx]);
        if (cands.length) {
          const [xx, yy] = cands[0];
          const j = (yy * W + xx) * 4,
            i = (y * W + x) * 4;
          a[i] = a[j];
          a[i + 1] = a[j + 1];
          a[i + 2] = a[j + 2];
          a[i + 3] = 255;
          break;
        }
      }
    }
  ctx.putImageData(d, 0, y0);
}
