import * as THREE from 'three';

// Cache generated textures so they are created once
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates high-detail procedural ashlar masonry stone texture
 */
export function getStoneTexture(): THREE.CanvasTexture {
  if (textureCache.has('stone')) return textureCache.get('stone')!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base stone tone
  ctx.fillStyle = '#6e675f';
  ctx.fillRect(0, 0, 512, 512);

  // Noise stippling for porous limestone/granite
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 45;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Ashlar block mortar joints
  ctx.strokeStyle = '#322d28';
  ctx.lineWidth = 4;
  const rows = 8;
  const rowH = 512 / rows;

  for (let r = 0; r <= rows; r++) {
    const y = r * rowH;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();

    if (r < rows) {
      const cols = 4;
      const colW = 512 / cols;
      const offset = (r % 2) * (colW / 2);
      for (let c = 0; c <= cols + 1; c++) {
        const x = c * colW + offset;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + rowH);
        ctx.stroke();
      }
    }
  }

  // Stone edge highlights
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 2;
  for (let r = 0; r < rows; r++) {
    const y = r * rowH + 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache.set('stone', texture);
  return texture;
}

/**
 * Creates realistic medieval cobblestone texture for roads and courtyards
 */
export function getCobblestoneTexture(): THREE.CanvasTexture {
  if (textureCache.has('cobblestone')) return textureCache.get('cobblestone')!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark soil / mud mortar bed
  ctx.fillStyle = '#3a322a';
  ctx.fillRect(0, 0, 512, 512);

  // Irregular river cobbles
  const stoneColors = ['#91877b', '#7e756b', '#a49a8d', '#6e665d', '#8a8074'];
  const countX = 14;
  const countY = 14;
  const stepX = 512 / countX;
  const stepY = 512 / countY;

  for (let y = 0; y < countY; y++) {
    const rowOffset = (y % 2) * (stepX * 0.5);
    for (let x = 0; x < countX; x++) {
      const cx = x * stepX + stepX * 0.5 + rowOffset + (Math.random() - 0.5) * 6;
      const cy = y * stepY + stepY * 0.5 + (Math.random() - 0.5) * 6;
      const rx = (stepX * 0.42) + (Math.random() - 0.5) * 4;
      const ry = (stepY * 0.42) + (Math.random() - 0.5) * 4;

      const grad = ctx.createRadialGradient(cx - rx * 0.25, cy - ry * 0.25, 2, cx, cy, rx);
      const baseColor = stoneColors[Math.floor(Math.random() * stoneColors.length)];
      grad.addColorStop(0, '#d2c8bc');
      grad.addColorStop(0.4, baseColor);
      grad.addColorStop(1, '#453e37');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();

      // Stone rim shadow
      ctx.strokeStyle = '#221c17';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache.set('cobblestone', texture);
  return texture;
}

/**
 * Creates realistic terracotta barrel roof tile texture
 */
export function getRoofTileTexture(isSlate: boolean = false): THREE.CanvasTexture {
  const key = isSlate ? 'roof_slate' : 'roof_terracotta';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const baseHue = isSlate ? '#333b48' : '#a8472f';
  ctx.fillStyle = baseHue;
  ctx.fillRect(0, 0, 512, 512);

  const rows = 16;
  const cols = 12;
  const rH = 512 / rows;
  const cW = 512 / cols;

  for (let r = 0; r < rows; r++) {
    const y = r * rH;
    const offset = (r % 2) * (cW * 0.5);
    for (let c = -1; c <= cols; c++) {
      const x = c * cW + offset;

      const grad = ctx.createLinearGradient(x, y, x + cW, y);
      if (isSlate) {
        grad.addColorStop(0, '#222730');
        grad.addColorStop(0.5, '#444e60');
        grad.addColorStop(1, '#1b2028');
      } else {
        grad.addColorStop(0, '#7c2e1b');
        grad.addColorStop(0.4, '#c2583d');
        grad.addColorStop(0.8, '#a8472f');
        grad.addColorStop(1, '#5a1f11');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, y, cW - 2, rH);

      // Shadow under overlap
      ctx.fillStyle = 'rgba(10, 8, 6, 0.45)';
      ctx.fillRect(x, y + rH - 3, cW, 3);

      // Light catch top
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(x, y, cW, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Creates rich carved walnut/oak wood grain texture for tabletop & follower figures
 */
export function getWoodGrainTexture(isDarkTable: boolean = false): THREE.CanvasTexture {
  const key = isDarkTable ? 'wood_table' : 'wood_meeple';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const baseCol = isDarkTable ? '#221913' : '#b2804d';
  ctx.fillStyle = baseCol;
  ctx.fillRect(0, 0, 512, 512);

  // Draw natural grain rings & streaks
  const grainCol = isDarkTable ? 'rgba(10, 7, 5, 0.35)' : 'rgba(84, 50, 24, 0.28)';
  ctx.strokeStyle = grainCol;

  for (let i = 0; i < 90; i++) {
    const x = Math.random() * 512;
    ctx.lineWidth = 1 + Math.random() * 3.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(
      x + (Math.random() - 0.5) * 50,
      170,
      x + (Math.random() - 0.5) * 50,
      340,
      x + (Math.random() - 0.5) * 30,
      512
    );
    ctx.stroke();
  }

  // Wood pore stippling
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (Math.random() > 0.85) {
      const v = (Math.random() - 0.5) * 20;
      data[i] = Math.max(0, Math.min(255, data[i] + v));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + v));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + v));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Creates lush procedural meadow grass texture
 */
export function getMeadowGrassTexture(): THREE.CanvasTexture {
  if (textureCache.has('grass')) return textureCache.get('grass')!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Rich layered green
  ctx.fillStyle = '#4a7531';
  ctx.fillRect(0, 0, 512, 512);

  // Fine grass tuft blades
  const greens = ['#5e933e', '#3c6225', '#6ba347', '#426829', '#7bb851'];
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const len = 3 + Math.random() * 5;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;

    ctx.strokeStyle = greens[Math.floor(Math.random() * greens.length)];
    ctx.lineWidth = 1 + Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  // Tiny meadow wildflowers (poppies, daisies, cornflowers)
  const flowerCols = ['#dc2626', '#fef08a', '#60a5fa', '#ffffff'];
  for (let i = 0; i < 180; i++) {
    const fx = Math.random() * 512;
    const fy = Math.random() * 512;
    ctx.fillStyle = flowerCols[Math.floor(Math.random() * flowerCols.length)];
    ctx.beginPath();
    ctx.arc(fx, fy, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache.set('grass', texture);
  return texture;
}

/**
 * Creates heraldic crest texture for knight shields and fortress banners
 */
export function getHeraldryTexture(isPlayer: boolean): THREE.CanvasTexture {
  const key = isPlayer ? 'heraldry_player' : 'heraldry_reeve';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Shield field: Azure blue or Imperial Crimson
  ctx.fillStyle = isPlayer ? '#1d4ed8' : '#b91c1c';
  ctx.fillRect(0, 0, 256, 256);

  // Gold or Silver medieval chevron / cross
  ctx.fillStyle = '#fbbf24';
  ctx.lineWidth = 20;

  if (isPlayer) {
    // Golden Cross Flory
    ctx.fillRect(116, 20, 24, 216);
    ctx.fillRect(20, 116, 216, 24);
    // Gold border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 242, 242);
  } else {
    // Imperial Chevron & Cross
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(128, 140);
    ctx.lineTo(236, 20);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 24;
    ctx.stroke();
    // Gold border
    ctx.strokeRect(7, 7, 242, 242);
  }

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(key, texture);
  return texture;
}
