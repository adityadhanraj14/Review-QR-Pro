/**
 * Print-style review poster: neutral paper look, venue-focused copy,
 * multicolor Google “G” (inline SVG) + wordmark — reads like in-store signage, not app marketing.
 */

function wrapLines(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function fillRoundRect(ctx, x, y, w, h, r) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fill();
}

function strokeRoundRect(ctx, x, y, w, h, r) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.stroke();
}

/** Multicolor Google G — geometry widely used for the icon; fills use Google brand palette. */
function googleGIconDataUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
<path fill="#FBBC05" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12 0-6.627 5.373-12 12-12 3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24c0 11.045 8.955 20 20 20 11.045 0 20-8.955 20-20 0-1.341-.138-2.65-.389-3.917z"/>
<path fill="#EA4335" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
<path fill="#34A853" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.612-3.284-11.284-7.917l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
<path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error('Failed to load image'));
    im.src = src;
  });
}

function subtlePaperTexture(ctx, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.035;
  for (let i = 0; i < 1200; i += 1) {
    const x = ((i * 7919) % w) + (i % 3);
    const y = ((i * 6151) % h) + ((i >> 2) % 3);
    ctx.fillStyle = i % 2 === 0 ? '#2c2c2c' : '#5c5c5c';
    ctx.fillRect(x % w, y % h, 1, 1);
  }
  ctx.restore();
}

export function generateReviewPosterPng({ businessName, qrDataUrl }) {
  const W = 720;
  const H = 1240;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    }

    const paper = '#e8e4de';
    const card = '#fdfcf9';
    const ink = '#202124';
    const muted = '#5f6368';
    const border = '#dadce0';

    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, W, H);
    subtlePaperTexture(ctx, W, H);

    const margin = 40;
    const cardX = margin;
    const cardY = margin;
    const cardW = W - margin * 2;
    const cardH = H - margin * 2;
    const cardR = 20;

    ctx.save();
    ctx.shadowColor = 'rgba(60, 64, 67, 0.18)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#c8c4be';
    fillRoundRect(ctx, cardX + 3, cardY + 5, cardW, cardH, cardR);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.restore();

    ctx.fillStyle = card;
    fillRoundRect(ctx, cardX, cardY, cardW, cardH, cardR);
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    strokeRoundRect(ctx, cardX, cardY, cardW, cardH, cardR);

    const innerPad = 48;
    let y = cardY + innerPad + 8;
    const innerW = cardW - innerPad * 2;
    const cx = cardX + cardW / 2;

    Promise.all([loadImage(googleGIconDataUrl()), loadImage(qrDataUrl)])
      .then(([gIcon, qrImg]) => {
        const gSize = 52;
        const word = 'Google';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = '500 26px "Segoe UI", Roboto, "Helvetica Neue", system-ui, sans-serif';
        const wordW = ctx.measureText(word).width;
        const gap = 14;
        const rowW = gSize + gap + wordW;
        const rowLeft = cx - rowW / 2;
        const gY = y + gSize / 2;
        ctx.drawImage(gIcon, rowLeft, gY - gSize / 2, gSize, gSize);
        ctx.fillStyle = ink;
        ctx.fillText(word, rowLeft + gSize + gap, gY);

        y += gSize + 10;
        ctx.textAlign = 'center';
        ctx.font = '400 15px "Segoe UI", Roboto, "Helvetica Neue", system-ui, sans-serif';
        ctx.fillStyle = muted;
        ctx.fillText('Reviews', cx, y);
        y += 36;

        ctx.font = '400 16px "Segoe UI", Roboto, "Helvetica Neue", system-ui, sans-serif';
        ctx.fillStyle = muted;
        ctx.fillText('Thank you for visiting', cx, y);
        y += 40;

        const venue = businessName || 'Our place';
        ctx.font = 'bold 32px Georgia, "Times New Roman", serif';
        ctx.fillStyle = ink;
        const titleLines = wrapLines(ctx, venue, innerW - 16);
        titleLines.forEach((ln) => {
          ctx.fillText(ln, cx, y);
          y += 40;
        });

        y += 12;
        ctx.font = '28px Georgia, serif';
        ctx.fillStyle = '#f9ab00';
        ctx.fillText('★ ★ ★ ★ ★', cx, y);
        y += 28;
        ctx.font = '400 15px "Segoe UI", Roboto, system-ui, sans-serif';
        ctx.fillStyle = muted;
        ctx.fillText('We would love your feedback', cx, y);
        y += 48;

        const qrSize = 260;
        const qPad = 18;
        const boxW = qrSize + qPad * 2;
        const boxH = qrSize + qPad * 2;
        const bx = cx - boxW / 2;
        const by = y;

        ctx.fillStyle = '#ffffff';
        fillRoundRect(ctx, bx, by, boxW, boxH, 12);
        ctx.strokeStyle = border;
        ctx.lineWidth = 1.5;
        strokeRoundRect(ctx, bx, by, boxW, boxH, 12);

        ctx.drawImage(qrImg, bx + qPad, by + qPad, qrSize, qrSize);

        y = by + boxH + 36;
        ctx.font = '400 15px "Segoe UI", Roboto, system-ui, sans-serif';
        ctx.fillStyle = muted;
        const hint = 'Open your phone camera and point it at the code. Follow the link to leave a review on Google.';
        wrapLines(ctx, hint, innerW - 8).forEach((ln) => {
          ctx.fillText(ln, cx, y);
          y += 24;
        });

        y += 20;
        ctx.font = '400 13px "Segoe UI", Roboto, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(95, 99, 104, 0.85)';
        ctx.fillText('Reviews help others discover great local businesses.', cx, y);

        y = cardY + cardH - innerPad + 8;
        ctx.font = '400 12px "Segoe UI", Roboto, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(95, 99, 104, 0.7)';
        ctx.fillText('Google and the Google logo are trademarks of Google LLC.', cx, y);

        resolve(canvas.toDataURL('image/png'));
      })
      .catch((e) => reject(e instanceof Error ? e : new Error(String(e))));
  });
}
