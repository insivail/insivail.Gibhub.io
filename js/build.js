/* =========================================================================
   CANON EOS 6D — PROCEDURAL MODEL
   Every part is generated from primitives. No external mesh or image files.
   ========================================================================= */
(function () {
  'use strict';

  const CAM = (window.CAM = window.CAM || {});
  const DATA = window.CAM6D_DATA;

  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const deg = (d) => (d * Math.PI) / 180;

  CAM.util = { clamp, lerp, deg, TAU };

  /* -----------------------------------------------------------------------
     CANVAS TEXTURES
     ----------------------------------------------------------------------- */

  function canvasTexture(w, h, draw, options = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    draw(ctx, w, h);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = options.srgb === false ? THREE.NoColorSpace : THREE.SRGBColorSpace;
    texture.anisotropy = options.anisotropy || 4;
    if (options.repeat) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(options.repeat[0], options.repeat[1]);
    }
    texture.needsUpdate = true;
    return texture;
  }

  function speckle(ctx, w, h, count, min, max, alpha, light) {
    for (let i = 0; i < count; i += 1) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = min + Math.random() * (max - min);
      const lum = light ? 150 + Math.random() * 105 : Math.random() * 55;
      ctx.fillStyle = `rgba(${lum},${lum},${lum},${alpha * (0.35 + Math.random() * 0.65)})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    }
  }

  function makeShellColorTexture(size = 1024) {
    return canvasTexture(size, size, (ctx, w, h) => {
      ctx.fillStyle = '#0d0e10';
      ctx.fillRect(0, 0, w, h);

      // Large, low-contrast anodized mottling.
      for (let i = 0; i < 70; i += 1) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 6 + Math.random() * 24;
        const warm = Math.random() > 0.45;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, warm ? 'rgba(44,46,48,0.025)' : 'rgba(2,2,2,0.04)');
        g.addColorStop(0.55, warm ? 'rgba(32,34,36,0.012)' : 'rgba(3,3,3,0.018)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
      }

      // Fine pigment grain and a few warm metallic flecks.
      for (let i = 0; i < 34000; i += 1) {
        const v = 9 + Math.random() * 15;
        ctx.fillStyle = `rgba(${v + 8},${v + 5},${v},${0.12 + Math.random() * 0.2})`;
        const s = Math.random() > 0.9 ? 1.4 : 0.7;
        ctx.fillRect(Math.random() * w, Math.random() * h, s, s);
      }
      for (let i = 0; i < 360; i += 1) {
        ctx.fillStyle = `rgba(${150 + Math.random() * 60},${112 + Math.random() * 42},${46 + Math.random() * 26},${0.04 + Math.random() * 0.08})`;
        ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
      }

      // Very subtle micro-scuffs, isotropic rather than brushed.
      ctx.lineWidth = 0.55;
      for (let i = 0; i < 70; i += 1) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const a = Math.random() * TAU;
        const len = 3 + Math.random() * 22;
        ctx.strokeStyle = `rgba(120,100,72,${0.025 + Math.random() * 0.05})`;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
        ctx.stroke();
      }
    }, { repeat: [7, 7], anisotropy: 8 });
  }

  function makeShellRoughTexture(size = 1024) {
    return canvasTexture(size, size, (ctx, w, h) => {
      ctx.fillStyle = '#c8c8c8';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 160; i += 1) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 22 + Math.random() * 110;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        const v = 155 + Math.random() * 55;
        g.addColorStop(0, `rgba(${v},${v},${v},0.28)`);
        g.addColorStop(1, 'rgba(190,190,190,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
      }
      speckle(ctx, w, h, 14000, 0.4, 1.3, 0.18, true);
      speckle(ctx, w, h, 5000, 0.5, 1.8, 0.12, false);
    }, { srgb: false, repeat: [6, 6], anisotropy: 8 });
  }

  function makeShellNormalTexture(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    // Build a fine height field, then derive normals with a wrapped Sobel pass.
    for (let i = 0; i < 9000; i += 1) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 0.45 + Math.random() * 1.8;
      const v = Math.random() > 0.5 ? 255 : 0;
      ctx.fillStyle = `rgba(${v},${v},${v},${0.16 + Math.random() * 0.2})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    }
    for (let i = 0; i < 90; i += 1) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 8 + Math.random() * 34;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(255,255,255,0.12)');
      g.addColorStop(1, 'rgba(128,128,128,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    }

    const src = ctx.getImageData(0, 0, size, size);
    const out = ctx.createImageData(size, size);
    const height = (x, y) => src.data[((((y % size) + size) % size) * size + (((x % size) + size) % size)) * 4] / 255;
    const strength = 0.9;
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const dx = height(x + 1, y) - height(x - 1, y);
        const dy = height(x, y + 1) - height(x, y - 1);
        let nx = -dx * strength;
        let ny = -dy * strength;
        let nz = 1;
        const len = Math.hypot(nx, ny, nz) || 1;
        nx /= len; ny /= len; nz /= len;
        const o = (y * size + x) * 4;
        out.data[o] = (nx * 0.5 + 0.5) * 255;
        out.data[o + 1] = (ny * 0.5 + 0.5) * 255;
        out.data[o + 2] = (nz * 0.5 + 0.5) * 255;
        out.data[o + 3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.NoColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }

  function makeGrainTexture(size = 512) {
    return canvasTexture(size, size, (ctx, w, h) => {
      ctx.fillStyle = '#7c7c7c';
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 1) {
        const v = 118 + Math.random() * 22;
        ctx.fillStyle = `rgba(${v},${v},${v},0.07)`;
        ctx.fillRect(0, y, w, 1);
      }
      speckle(ctx, w, h, 19000, 0.35, 1.1, 0.16, true);
      speckle(ctx, w, h, 6000, 0.5, 1.8, 0.13, false);
    }, { srgb: false, repeat: [3, 3] });
  }

  function makeBrushedTexture(size = 512) {
    return canvasTexture(size, size, (ctx, w, h) => {
      ctx.fillStyle = '#8b8b8b';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 2200; i += 1) {
        const y = Math.random() * h;
        const v = 95 + Math.random() * 90;
        ctx.strokeStyle = `rgba(${v},${v},${v},${0.04 + Math.random() * 0.12})`;
        ctx.lineWidth = 0.5 + Math.random() * 1.4;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y + (Math.random() - 0.5) * 3);
        ctx.stroke();
      }
      speckle(ctx, w, h, 1200, 0.4, 1.4, 0.1, true);
    }, { srgb: false, repeat: [2, 2] });
  }

  function makeRubberTexture(size = 512) {
    return canvasTexture(size, size, (ctx, w, h) => {
      ctx.fillStyle = '#6f6f6f';
      ctx.fillRect(0, 0, w, h);
      const step = 9;
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const ox = (Math.floor(y / step) % 2) * (step / 2);
          const v = 90 + Math.random() * 70;
          ctx.fillStyle = `rgba(${v},${v},${v},0.35)`;
          ctx.beginPath();
          ctx.arc(x + ox, y, 2.4 + Math.random(), 0, TAU);
          ctx.fill();
        }
      }
      speckle(ctx, w, h, 6000, 0.4, 1.2, 0.1, false);
    }, { srgb: false, repeat: [2, 2] });
  }

  function makePcbTexture(w = 1024, h = 768) {
    return canvasTexture(w, h, (ctx) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#0d5a3d');
      g.addColorStop(0.55, '#083d2b');
      g.addColorStop(1, '#0b4a34');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Copper pours and ground grid.
      ctx.strokeStyle = 'rgba(34,120,82,0.38)';
      ctx.lineWidth = 1;
      for (let x = 16; x < w; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 14; y < h; y += 18) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Traces.
      let seed = 7;
      const rnd = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
      for (let i = 0; i < 170; i += 1) {
        let x = 20 + rnd() * (w - 40);
        let y = 20 + rnd() * (h - 40);
        ctx.strokeStyle = rnd() > 0.65 ? 'rgba(36,150,102,0.75)' : 'rgba(16,88,60,0.9)';
        ctx.lineWidth = rnd() > 0.8 ? 3 : 1.2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        const segs = 2 + Math.floor(rnd() * 5);
        for (let s = 0; s < segs; s += 1) {
          if (rnd() > 0.5) x += (rnd() - 0.5) * 190;
          else y += (rnd() - 0.5) * 150;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        if (rnd() > 0.55) {
          ctx.fillStyle = '#c9a24a';
          ctx.beginPath();
          ctx.arc(x, y, 2.6, 0, TAU);
          ctx.fill();
          ctx.fillStyle = '#0b3c2a';
          ctx.beginPath();
          ctx.arc(x, y, 1.25, 0, TAU);
          ctx.fill();
        }
      }

      // Pads and vias.
      for (let i = 0; i < 70; i += 1) {
        const x = 16 + rnd() * (w - 32);
        const y = 16 + rnd() * (h - 32);
        ctx.fillStyle = rnd() > 0.3 ? '#d6b05b' : '#b88932';
        ctx.beginPath();
        ctx.arc(x, y, 1.8 + rnd() * 2.2, 0, TAU);
        ctx.fill();
      }

      // Component outlines / silkscreen.
      ctx.strokeStyle = 'rgba(220,238,228,0.72)';
      ctx.fillStyle = 'rgba(225,240,232,0.82)';
      ctx.lineWidth = 1.2;
      ctx.font = '600 13px "Segoe UI", Arial, sans-serif';
      const labels = [
        ['DIGIC 5+', 610, 205],
        ['DDR3', 155, 160],
        ['AF CTRL', 120, 470],
        ['Wi-Fi / GPS', 150, 650],
        ['SD CARD', 760, 640],
        ['J1 FLEX', 420, 70],
        ['J2 TOP', 360, 700],
        ['CMOS', 500, 450],
        ['CANON EOS 6D MAIN PCB', 360, 725]
      ];
      labels.forEach(([text, x, y]) => ctx.fillText(text, x, y));
      [[520, 150, 180, 120], [90, 90, 130, 100], [640, 540, 160, 80], [260, 560, 130, 120]]
        .forEach(([x, y, ww, hh]) => {
          ctx.strokeRect(x, y, ww, hh);
          ctx.strokeStyle = 'rgba(220,238,228,0.28)';
          ctx.strokeRect(x + 5, y + 5, ww - 10, hh - 10);
          ctx.strokeStyle = 'rgba(220,238,228,0.72)';
        });

      // Board edge keep-out.
      ctx.strokeStyle = 'rgba(212,186,102,0.7)';
      ctx.lineWidth = 6;
      ctx.strokeRect(8, 8, w - 16, h - 16);
    });
  }

  function makeLcdTexture() {
    return canvasTexture(768, 512, (ctx, w, h) => {
      ctx.fillStyle = '#0a0805';
      ctx.fillRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w * 0.45, h * 0.4, 10, w * 0.45, h * 0.4, w * 0.7);
      g.addColorStop(0, 'rgba(46,110,150,0.18)');
      g.addColorStop(1, 'rgba(2,8,14,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Image preview area.
      const px = 26;
      const py = 30;
      const pw = 716;
      const ph = 360;
      ctx.fillStyle = '#15110b';
      ctx.fillRect(px, py, pw, ph);
      const sky = ctx.createLinearGradient(0, py, 0, py + ph);
      sky.addColorStop(0, '#1a3d55');
      sky.addColorStop(0.48, '#3d6f7d');
      sky.addColorStop(0.52, '#162b2b');
      sky.addColorStop(1, '#071014');
      ctx.fillStyle = sky;
      ctx.fillRect(px, py, pw, ph);
      ctx.fillStyle = 'rgba(166,226,255,0.16)';
      ctx.beginPath();
      ctx.moveTo(px, py + 240);
      ctx.lineTo(px + 180, py + 160);
      ctx.lineTo(px + 280, py + 250);
      ctx.lineTo(px + 400, py + 150);
      ctx.lineTo(px + 560, py + 250);
      ctx.lineTo(px + 716, py + 190);
      ctx.lineTo(px + 716, py + 360);
      ctx.lineTo(px, py + 360);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(120,225,255,0.25)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i += 1) {
        ctx.strokeRect(px + 60 + i * 200, py + 70 + i * 35, 140, 90);
      }
      // Focus points.
      ctx.strokeStyle = 'rgba(240,206,110,0.55)';
      const pts = [
        [0.28, 0.35], [0.5, 0.32], [0.72, 0.38], [0.2, 0.5], [0.4, 0.5],
        [0.6, 0.5], [0.8, 0.52], [0.33, 0.65], [0.5, 0.66], [0.67, 0.64], [0.5, 0.2]
      ];
      pts.forEach(([fx, fy], i) => {
        ctx.strokeStyle = i === 4 ? 'rgba(255,227,164,0.95)' : 'rgba(240,206,110,0.45)';
        ctx.strokeRect(px + fx * pw - 12, py + fy * ph - 8, 24, 16);
      });

      // Header / footer.
      ctx.fillStyle = '#f0e8d8';
      ctx.font = '600 22px "Segoe UI", Arial, sans-serif';
      ctx.fillText('EOS 6D', 26, 22);
      ctx.font = '500 16px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#e8c76f';
      ctx.fillText('RAW  20.2MP', 560, 22);
      ctx.fillStyle = '#f0e8d8';
      ctx.font = '600 20px "Segoe UI", Arial, sans-serif';
      ctx.fillText('1/125', 34, 438);
      ctx.fillText('F4.0', 150, 438);
      ctx.fillText('ISO 400', 250, 438);
      ctx.fillStyle = '#f0ce6e';
      ctx.fillText('AF', 420, 438);
      ctx.fillStyle = '#f0e8d8';
      ctx.fillText('WB  5200K', 500, 438);
      ctx.fillText('+0.3', 660, 438);

      // Histogram.
      ctx.fillStyle = 'rgba(5,15,22,0.72)';
      ctx.fillRect(520, 400, 210, 76);
      ctx.strokeStyle = 'rgba(110,220,255,0.7)';
      ctx.beginPath();
      for (let i = 0; i < 70; i += 1) {
        const x = 526 + i * 2.9;
        const v = Math.max(3, 58 * Math.exp(-Math.pow((i - 34) / 20, 2)) + Math.random() * 18);
        if (i === 0) ctx.moveTo(x, 470);
        ctx.lineTo(x, 470 - v);
      }
      ctx.lineTo(726, 470);
      ctx.stroke();
      ctx.fillStyle = '#e8c76f';
      ctx.font = '11px "Segoe UI", Arial, sans-serif';
      ctx.fillText('HISTOGRAM', 526, 414);
      ctx.fillStyle = '#a08f73';
      ctx.font = '12px "Segoe UI", Arial, sans-serif';
      ctx.fillText('6D  /  35.8 × 23.9 mm  /  DIGIC 5+', 26, 492);
      ctx.strokeStyle = 'rgba(112,213,255,0.35)';
      ctx.strokeRect(1, 1, w - 2, h - 2);
    });
  }

  function makeTopLcdTexture() {
    return canvasTexture(512, 220, (ctx, w, h) => {
      ctx.fillStyle = '#9db49a';
      ctx.fillRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(30,50,32,0.18)');
      g.addColorStop(0.5, 'rgba(255,255,255,0.02)');
      g.addColorStop(1, 'rgba(25,40,28,0.22)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#162116';
      ctx.font = '700 30px "Segoe UI", Arial, sans-serif';
      ctx.fillText('M', 22, 42);
      ctx.font = '700 26px "Segoe UI", Arial, sans-serif';
      ctx.fillText('1/125', 64, 42);
      ctx.fillText('F4.0', 180, 42);
      ctx.fillText('400', 292, 42);
      ctx.font = '500 18px "Segoe UI", Arial, sans-serif';
      ctx.fillText('RAW', 22, 76);
      ctx.fillText('AF  ONE SHOT', 95, 76);
      ctx.fillText('WB  AWB', 300, 76);
      // exposure scale
      ctx.strokeStyle = '#162116';
      ctx.lineWidth = 2;
      for (let i = 0; i < 13; i += 1) {
        const x = 30 + i * 34;
        const tall = i % 2 === 0;
        ctx.beginPath();
        ctx.moveTo(x, 132);
        ctx.lineTo(x, 132 + (tall ? 18 : 10));
        ctx.stroke();
      }
      ctx.fillStyle = '#162116';
      ctx.beginPath();
      ctx.moveTo(30 + 8 * 34 - 7, 128);
      ctx.lineTo(30 + 8 * 34 + 7, 128);
      ctx.lineTo(30 + 8 * 34, 118);
      ctx.closePath();
      ctx.fill();
      ctx.font = '500 17px "Segoe UI", Arial, sans-serif';
      ctx.fillText('55', 30, 190);
      ctx.fillText('CH', 160, 190);
      ctx.fillText('Wi-Fi', 250, 190);
      ctx.fillText('GPS', 330, 190);
      ctx.fillText('100%', 420, 190);
      ctx.strokeStyle = 'rgba(22,33,22,0.55)';
      ctx.strokeRect(8, 8, w - 16, h - 16);
    });
  }

  function makeSensorTexture() {
    return canvasTexture(1024, 683, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#3a2a10');
      g.addColorStop(0.35, '#1a1208');
      g.addColorStop(0.7, '#5a4218');
      g.addColorStop(1, '#0d0904');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // Pixel / microlens grid.
      for (let y = 6; y < h; y += 7) {
        for (let x = 6; x < w; x += 7) {
          const v = 40 + Math.random() * 80;
          ctx.fillStyle = `rgba(${v + 55},${v + 38},${v + 10},${0.24 + Math.random() * 0.25})`;
          ctx.beginPath();
          ctx.arc(x, y, 2.1, 0, TAU);
          ctx.fill();
          if ((x + y) % 11 === 0) {
            ctx.fillStyle = 'rgba(255,220,150,0.32)';
            ctx.fillRect(x - 2, y - 2, 4, 4);
          }
        }
      }
      const shine = ctx.createLinearGradient(0, 0, w, h);
      shine.addColorStop(0.05, 'rgba(255,255,255,0.16)');
      shine.addColorStop(0.2, 'rgba(255,255,255,0)');
      shine.addColorStop(0.62, 'rgba(130,180,255,0.06)');
      shine.addColorStop(0.82, 'rgba(255,255,255,0.12)');
      shine.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = shine;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(240,206,110,0.6)';
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, w - 20, h - 20);
      ctx.strokeStyle = 'rgba(154,116,34,0.42)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i += 1) {
        ctx.beginPath();
        ctx.moveTo(10, 80 + i * 72);
        ctx.lineTo(w - 10, 80 + i * 72);
        ctx.stroke();
      }
    });
  }

  function makeFocusScreenTexture() {
    return canvasTexture(768, 512, (ctx, w, h) => {
      ctx.fillStyle = '#c7d0d4';
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 3) {
        for (let x = 0; x < w; x += 3) {
          const v = 120 + Math.random() * 70;
          ctx.fillStyle = `rgba(${v},${v + 2},${v + 4},0.14)`;
          ctx.fillRect(x, y, 2, 2);
        }
      }
      // Fresnel rings.
      ctx.strokeStyle = 'rgba(90,108,116,0.18)';
      for (let r = 40; r < 420; r += 34) {
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, r, 0, TAU);
        ctx.stroke();
      }
      // 11 AF points.
      const pts = [
        [0.5, 0.5], [0.38, 0.5], [0.62, 0.5], [0.26, 0.5], [0.74, 0.5],
        [0.5, 0.38], [0.5, 0.62], [0.34, 0.3], [0.66, 0.3], [0.34, 0.7], [0.66, 0.7]
      ];
      pts.forEach(([fx, fy], i) => {
        ctx.strokeStyle = i === 0 ? 'rgba(120,60,40,0.8)' : 'rgba(75,80,84,0.66)';
        ctx.lineWidth = i === 0 ? 3 : 2;
        ctx.strokeRect(fx * w - 23, fy * h - 15, 46, 30);
        ctx.fillStyle = 'rgba(60,66,70,0.82)';
        ctx.font = '600 12px "Segoe UI", Arial, sans-serif';
        ctx.fillText(i === 0 ? 'CROSS' : '', fx * w - 17, fy * h + 4);
      });
      // Central microprism.
      ctx.strokeStyle = 'rgba(70,76,80,0.5)';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 52, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(70,76,80,0.3)';
      for (let i = 0; i < 40; i += 1) {
        const a = (i / 40) * TAU;
        ctx.beginPath();
        ctx.moveTo(w / 2 + Math.cos(a) * 14, h / 2 + Math.sin(a) * 14);
        ctx.lineTo(w / 2 + Math.cos(a) * 48, h / 2 + Math.sin(a) * 48);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(40,48,52,0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(8, 8, w - 16, h - 16);
    });
  }

  function makeDialTexture() {
    return canvasTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#1a1f25';
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      ctx.strokeStyle = '#d8e2ec';
      ctx.fillStyle = '#d8e2ec';
      for (let i = 0; i < 48; i += 1) {
        const a = (i / 48) * TAU - Math.PI / 2;
        const r1 = 205;
        const r2 = i % 4 === 0 ? 235 : 222;
        ctx.lineWidth = i % 4 === 0 ? 3 : 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
        ctx.stroke();
      }
      const modes = ['M', 'Av', 'Tv', 'P', 'A+', 'SCN', 'CA', 'B'];
      ctx.font = '700 24px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      modes.forEach((m, i) => {
        const a = (i / modes.length) * TAU - Math.PI / 2;
        ctx.fillText(m, cx + Math.cos(a) * 165, cy + Math.sin(a) * 165);
      });
      ctx.strokeStyle = '#7f8b97';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 120, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = '#d8e2ec';
      ctx.font = '600 18px "Segoe UI", Arial, sans-serif';
      ctx.fillText('EOS 6D', cx, cy + 8);
      ctx.fillStyle = '#ff5d5d';
      ctx.beginPath();
      ctx.arc(cx, cy - 140, 11, 0, TAU);
      ctx.fill();
    });
  }

  function makeMirrorTexture() {
    return canvasTexture(512, 512, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#fff6dd');
      g.addColorStop(0.22, '#f2d998');
      g.addColorStop(0.5, '#c9a24a');
      g.addColorStop(0.72, '#8a641f');
      g.addColorStop(1, '#f6e3b0');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      const sheen = ctx.createLinearGradient(0, 0, w, h);
      sheen.addColorStop(0.05, 'rgba(255,255,255,0.55)');
      sheen.addColorStop(0.18, 'rgba(255,255,255,0)');
      sheen.addColorStop(0.48, 'rgba(255,220,140,0.2)');
      sheen.addColorStop(0.56, 'rgba(255,255,255,0)');
      sheen.addColorStop(0.8, 'rgba(240,200,110,0.3)');
      sheen.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sheen;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 0.13;
      for (let i = -w; i < w * 2; i += 46) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + w * 0.7, h);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      const edge = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.72);
      edge.addColorStop(0, 'rgba(0,0,0,0)');
      edge.addColorStop(1, 'rgba(8,10,35,0.5)');
      ctx.fillStyle = edge;
      ctx.fillRect(0, 0, w, h);
    });
  }

  function makeTextTexture(text, options = {}) {
    const w = options.width || 512;
    const h = options.height || 128;
    return canvasTexture(w, h, (ctx) => {
      ctx.clearRect(0, 0, w, h);
      if (options.bg) {
        ctx.fillStyle = options.bg;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.fillStyle = options.color || '#dfe8f2';
      ctx.font = `${options.weight || 700} ${options.size || 64}px ${options.font || '"Segoe UI", Arial, sans-serif'}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, w / 2, h / 2 + (options.dy || 0));
    });
  }

  function makeEnvironmentTexture() {
    return canvasTexture(1024, 512, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#020201');
      g.addColorStop(0.3, '#1d1408');
      g.addColorStop(0.48, '#4a3512');
      g.addColorStop(0.52, '#2a1d0b');
      g.addColorStop(0.75, '#0d0904');
      g.addColorStop(1, '#010101');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const softbox = (x, y, sw, sh, color, alpha) => {
        const rg = ctx.createRadialGradient(x, y, 0, x, y, Math.max(sw, sh));
        rg.addColorStop(0, color);
        rg.addColorStop(0.45, color);
        rg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = alpha;
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.ellipse(x, y, sw, sh, 0, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
      };
      softbox(210, 155, 150, 90, '#fff3d2', 0.95);
      softbox(760, 130, 120, 70, '#ffe0a0', 0.82);
      softbox(80, 300, 100, 55, '#d4af37', 0.36);
      softbox(920, 300, 130, 70, '#b5892f', 0.34);
      softbox(520, 80, 240, 50, '#ffffff', 0.55);
      softbox(520, 142, 44, 210, '#fff2ce', 0.76);
      softbox(315, 250, 58, 26, '#ffd89a', 0.42);
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = '#e8c76f';
      ctx.fillRect(0, 356, w, 2);
      ctx.fillStyle = '#b5892f';
      ctx.fillRect(0, 388, w, 2);
      ctx.globalAlpha = 1;
      // Subtle star points.
      for (let i = 0; i < 90; i += 1) {
        const x = Math.random() * w;
        const y = Math.random() * 260;
        ctx.fillStyle = `rgba(255,225,160,${0.08 + Math.random() * 0.25})`;
        ctx.fillRect(x, y, 1.4, 1.4);
      }
    });
  }

  CAM.textures = {
    grain: makeGrainTexture(),
    shellColor: makeShellColorTexture(),
    shellRough: makeShellRoughTexture(),
    shellNormal: makeShellNormalTexture(),
    brushed: makeBrushedTexture(),
    rubber: makeRubberTexture(),
    pcb: makePcbTexture(),
    lcd: makeLcdTexture(),
    topLcd: makeTopLcdTexture(),
    sensor: makeSensorTexture(),
    focusScreen: makeFocusScreenTexture(),
    mirror: makeMirrorTexture(),
    dial: makeDialTexture(),
    environment: makeEnvironmentTexture()
  };

  /* -----------------------------------------------------------------------
     MATERIAL LIBRARY
     ----------------------------------------------------------------------- */

  function baseMaterials() {
    const T = CAM.textures;
    const physical = (opts) => new THREE.MeshPhysicalMaterial(opts);
    const standard = (opts) => new THREE.MeshStandardMaterial(opts);

    const mats = {
      shell: physical({
        color: 0xffffff,
        map: T.shellColor,
        roughness: 0.52,
        metalness: 0.18,
        clearcoat: 0.42,
        clearcoatRoughness: 0.22,
        roughnessMap: T.shellRough,
        normalMap: T.shellNormal,
        normalScale: new THREE.Vector2(0.16, 0.16),
        envMapIntensity: 1.0
      }),
      rubber: standard({
        color: 0x0b0e11,
        roughness: 0.96,
        metalness: 0.02,
        bumpMap: T.rubber,
        bumpScale: 0.035,
        envMapIntensity: 0.35
      }),
      magnesium: physical({
        color: 0xb8c1cb,
        metalness: 0.92,
        roughness: 0.38,
        roughnessMap: T.brushed,
        bumpMap: T.brushed,
        bumpScale: 0.008,
        clearcoat: 0.15,
        clearcoatRoughness: 0.5,
        envMapIntensity: 1.0
      }),
      steel: physical({
        color: 0xd3dbe4,
        metalness: 1.0,
        roughness: 0.23,
        roughnessMap: T.brushed,
        bumpMap: T.brushed,
        bumpScale: 0.006,
        envMapIntensity: 1.8
      }),
      darkSteel: physical({
        color: 0x414a55,
        metalness: 0.88,
        roughness: 0.42,
        roughnessMap: T.brushed,
        envMapIntensity: 1.1
      }),
      optical: physical({
        color: 0xe6cf95,
        metalness: 0.12,
        roughness: 0.035,
        transmission: 0.68,
        thickness: 0.55,
        ior: 1.62,
        transparent: true,
        opacity: 0.92,
        iridescence: 1.0,
        iridescenceIOR: 1.75,
        iridescenceThicknessRange: [120, 620],
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        side: THREE.DoubleSide,
        envMapIntensity: 2.4,
        attenuationColor: new THREE.Color(0x8a6a2a),
        attenuationDistance: 2.6
      }),
      mirror: physical({
        color: 0xf2dfae,
        map: T.mirror,
        emissive: 0x4a3812,
        emissiveIntensity: 1.05,
        metalness: 0.45,
        roughness: 0.08,
        iridescence: 0.9,
        iridescenceIOR: 2.0,
        iridescenceThicknessRange: [160, 560],
        envMapIntensity: 1.55,
        side: THREE.DoubleSide
      }),
      shutter: physical({
        color: 0x3c444e,
        metalness: 0.78,
        roughness: 0.36,
        roughnessMap: T.brushed,
        clearcoat: 0.1,
        clearcoatRoughness: 0.4,
        envMapIntensity: 1.2
      }),
      pcb: standard({
        color: 0xffffff,
        map: T.pcb,
        roughness: 0.6,
        metalness: 0.14,
        envMapIntensity: 0.8
      }),
      silicon: physical({
        color: 0x171c22,
        roughness: 0.52,
        metalness: 0.12,
        clearcoat: 0.18,
        clearcoatRoughness: 0.6
      }),
      copper: physical({
        color: 0xd4a94e,
        metalness: 1.0,
        roughness: 0.22,
        envMapIntensity: 2.0
      }),
      cmos: physical({
        color: 0xffffff,
        map: T.sensor,
        emissive: 0x3a2a08,
        emissiveIntensity: 0.42,
        metalness: 0.45,
        roughness: 0.18,
        iridescence: 0.45,
        iridescenceIOR: 1.8,
        envMapIntensity: 1.8
      }),
      glass: physical({
        color: 0xf6e6bd,
        metalness: 0.04,
        roughness: 0.04,
        transmission: 0.84,
        thickness: 0.2,
        ior: 1.52,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
        envMapIntensity: 1.6
      })
    };
    return mats;
  }

  const BASE_MATS = baseMaterials();

  function materialFor(part, key, overrides = {}) {
    const cacheKey = `${part.id}:${key}`;
    if (!overrides || Object.keys(overrides).length === 0) {
      if (part._matCache[cacheKey]) return part._matCache[cacheKey];
    }
    const base = BASE_MATS[key];
    if (!base) throw new Error(`Unknown material: ${key}`);
    const mat = base.clone();
    const normalized = Object.assign({}, overrides);
    if (normalized.color != null && !(normalized.color instanceof THREE.Color)) normalized.color = new THREE.Color(normalized.color);
    if (normalized.emissive != null && !(normalized.emissive instanceof THREE.Color)) normalized.emissive = new THREE.Color(normalized.emissive);
    Object.assign(mat, normalized);
    if (['shell', 'magnesium', 'darkSteel', 'shutter', 'pcb', 'silicon', 'rubber', 'steel'].includes(key)) mat.side = THREE.DoubleSide;
    if (mat.emissive) {
      mat.userData.baseEmissive = mat.emissive.clone();
      mat.userData.baseEmissiveIntensity = mat.emissiveIntensity || 0;
    }
    if (mat.color) mat.userData.baseColor = mat.color.clone();
    part._matCache[cacheKey] = mat;
    part.materials.push(mat);
    return mat;
  }

  function addEdges(part, mesh, options = {}) {
    if (!mesh.geometry || options.edges === false) return null;
    const count = mesh.geometry.attributes.position ? mesh.geometry.attributes.position.count : 0;
    if (count > 90000) return null;
    try {
      const geo = new THREE.EdgesGeometry(mesh.geometry, options.threshold || 32);
      const mat = new THREE.LineBasicMaterial({
        color: options.color || part.groupColor || 0x63ddff,
        transparent: true,
        opacity: options.opacity == null ? 0.075 : options.opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const line = new THREE.LineSegments(geo, mat);
      line.scale.setScalar(1.002);
      line.renderOrder = 3;
      mesh.add(line);
      part.edges.push({ line, mat, base: mat.opacity });
      return line;
    } catch (error) {
      return null;
    }
  }

  function addMesh(part, geometry, material, position, rotation = [0, 0, 0], options = {}) {
    const holder = options.holder || part.holder || part.inner;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position[0], position[1], position[2]).sub(part.center);
    mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    mesh.castShadow = options.cast !== false;
    mesh.receiveShadow = options.receive !== false;
    mesh.renderOrder = options.renderOrder || 0;
    mesh.userData.partId = part.id;
    holder.add(mesh);
    part.meshes.push(mesh);
    if (options.pick !== false) part.pickMeshes.push(mesh);
    if (options.edges !== false) addEdges(part, mesh, options);
    return mesh;
  }

  function addPlane(part, width, height, material, position, rotation = [0, 0, 0], options = {}) {
    const geo = new THREE.PlaneGeometry(width, height, options.segments || 1, options.segments || 1);
    const mesh = new THREE.Mesh(geo, material);
    const holder = options.holder || part.holder || part.inner;
    mesh.position.set(position[0], position[1], position[2]).sub(part.center);
    mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.renderOrder = options.renderOrder || 2;
    mesh.userData.partId = part.id;
    holder.add(mesh);
    part.meshes.push(mesh);
    if (options.pick !== false) part.pickMeshes.push(mesh);
    return mesh;
  }

  function addTextPlane(part, text, width, height, position, rotation, options = {}) {
    const texture = makeTextTexture(text, options);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: options.opacity == null ? 1 : options.opacity,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false
    });
    part.materials.push(material);
    return addPlane(part, width, height, material, position, rotation, {
      pick: false,
      renderOrder: 4,
      holder: options.holder
    });
  }

  function roundedBoxGeometry(width, height, depth, radius = 0.14, segments = 4) {
    const geometry = new THREE.BoxGeometry(width, height, depth, segments, segments, segments);
    const position = geometry.attributes.position;
    const half = new THREE.Vector3(width / 2, height / 2, depth / 2);
    const inner = new THREE.Vector3(
      Math.max(0.001, half.x - radius),
      Math.max(0.001, half.y - radius),
      Math.max(0.001, half.z - radius)
    );
    const vertex = new THREE.Vector3();
    const normal = new THREE.Vector3();
    for (let i = 0; i < position.count; i += 1) {
      vertex.fromBufferAttribute(position, i);
      normal.set(vertex.x / half.x, vertex.y / half.y, vertex.z / half.z).normalize();
      vertex.x = clamp(vertex.x, -inner.x, inner.x) + normal.x * radius;
      vertex.y = clamp(vertex.y, -inner.y, inner.y) + normal.y * radius;
      vertex.z = clamp(vertex.z, -inner.z, inner.z) + normal.z * radius;
      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    return geometry;
  }

  const cylY = (rt, rb, h, seg = 32, open = false) => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open);
  const cylZ = (rt, rb, h, seg = 48, open = false) => {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg, 1, open);
    g.rotateX(Math.PI / 2);
    return g;
  };
  const cylX = (rt, rb, h, seg = 40, open = false) => {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg, 1, open);
    g.rotateZ(Math.PI / 2);
    return g;
  };

  function roundedRectShape(w, h, r, cx = 0, cy = 0) {
    const shape = new THREE.Shape();
    const x = cx - w / 2;
    const y = cy - h / 2;
    const rr = Math.min(r, w / 2, h / 2);
    shape.moveTo(x + rr, y);
    shape.lineTo(x + w - rr, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + rr);
    shape.lineTo(x + w, y + h - rr);
    shape.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    shape.lineTo(x + rr, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - rr);
    shape.lineTo(x, y + rr);
    shape.quadraticCurveTo(x, y, x + rr, y);
    return shape;
  }

  function roundedRectPath(w, h, r, cx = 0, cy = 0) {
    const path = new THREE.Path();
    const x = cx - w / 2;
    const y = cy - h / 2;
    const rr = Math.min(r, w / 2, h / 2);
    path.moveTo(x + rr, y);
    path.lineTo(x + w - rr, y);
    path.quadraticCurveTo(x + w, y, x + w, y + rr);
    path.lineTo(x + w, y + h - rr);
    path.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    path.lineTo(x + rr, y + h);
    path.quadraticCurveTo(x, y + h, x, y + h - rr);
    path.lineTo(x, y + rr);
    path.quadraticCurveTo(x, y, x + rr, y);
    path.closePath();
    return path;
  }

  function circlePath(r, cx = 0, cy = 0) {
    const path = new THREE.Path();
    path.absarc(cx, cy, r, 0, TAU, false);
    return path;
  }

  function extrudeShape(shape, depth, bevel = 0.03, curveSegments = 20) {
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      steps: 1,
      curveSegments,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2
    });
    geo.translate(0, 0, -depth / 2);
    return geo;
  }

  function profileExtrudeZY(pointsZY, width, bevel = 0.06) {
    const shape = new THREE.Shape();
    pointsZY.forEach(([z, y], i) => {
      const u = -z;
      if (i === 0) shape.moveTo(u, y);
      else shape.lineTo(u, y);
    });
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: width,
      steps: 1,
      curveSegments: 12,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3
    });
    geo.rotateY(Math.PI / 2);
    geo.translate(-width / 2, 0, 0);
    geo.computeVertexNormals();
    return geo;
  }

  function profilePrism(pointsZY, width) {
    const v2 = pointsZY.map(([z, y]) => new THREE.Vector2(z, y));
    const faces = THREE.ShapeUtils.triangulateShape(v2, []);
    const half = width / 2;
    const positions = [];
    const push = (a, b, c, x) => {
      positions.push(x, a[1], a[0], x, b[1], b[0], x, c[1], c[0]);
    };
    faces.forEach(([a, b, c]) => {
      const A = pointsZY[a];
      const B = pointsZY[b];
      const C = pointsZY[c];
      push(A, C, B, -half);
      push(A, B, C, half);
    });
    for (let i = 0; i < pointsZY.length; i += 1) {
      const j = (i + 1) % pointsZY.length;
      const a = pointsZY[i];
      const b = pointsZY[j];
      positions.push(-half, a[1], a[0], -half, b[1], b[0], half, b[1], b[0]);
      positions.push(-half, a[1], a[0], half, b[1], b[0], half, a[1], a[0]);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    return geo;
  }

  function addScrew(part, position, axis, options = {}) {
    const group = new THREE.Group();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.clone().normalize());
    group.quaternion.copy(q);
    group.position.set(position[0], position[1], position[2]).sub(part.center);
    const mat = materialFor(part, 'steel');
    const dark = materialFor(part, 'darkSteel');
    const head = new THREE.Mesh(cylY(0.19, 0.2, 0.07, 18), mat);
    head.castShadow = true;
    head.receiveShadow = true;
    head.userData.partId = part.id;
    group.add(head);
    const shaft = new THREE.Mesh(cylY(0.1, 0.1, options.length || 0.38, 12), mat);
    shaft.position.y = -(options.length || 0.38) / 2;
    shaft.userData.partId = part.id;
    group.add(shaft);
    const slotA = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.022, 0.055), dark);
    slotA.position.y = 0.04;
    slotA.userData.partId = part.id;
    group.add(slotA);
    const slotB = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.022, 0.24), dark);
    slotB.position.y = 0.04;
    slotB.userData.partId = part.id;
    group.add(slotB);
    part.inner.add(group);
    part.meshes.push(head, shaft, slotA, slotB);
    part.pickMeshes.push(head, shaft, slotA, slotB);
    part.screws.push({
      group,
      base: group.position.clone(),
      baseQuat: group.quaternion.clone(),
      dir: axis.clone().normalize(),
      spin: options.spin == null ? 1 : options.spin
    });
    return group;
  }

  function addGear(part, center, radius, thickness, teeth, matKey, rotationSpeed = 1) {
    const group = new THREE.Group();
    group.position.set(center[0], center[1], center[2]).sub(part.center);
    const mat = materialFor(part, matKey);
    const hubMat = materialFor(part, 'darkSteel');
    const wheel = new THREE.Mesh(cylX(radius * 0.94, radius * 0.94, thickness, 32), mat);
    wheel.castShadow = true;
    wheel.receiveShadow = true;
    wheel.userData.partId = part.id;
    group.add(wheel);
    const teethCount = teeth;
    for (let i = 0; i < teethCount; i += 1) {
      const a = (i / teethCount) * TAU;
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(thickness * 1.04, radius * 0.16, radius * 0.13), mat);
      tooth.position.set(0, Math.cos(a) * (radius + radius * 0.055), Math.sin(a) * (radius + radius * 0.055));
      tooth.rotation.x = -a;
      tooth.castShadow = true;
      tooth.userData.partId = part.id;
      group.add(tooth);
    }
    const hub = new THREE.Mesh(cylX(radius * 0.26, radius * 0.26, thickness * 1.15, 20), hubMat);
    hub.userData.partId = part.id;
    group.add(hub);
    const axle = new THREE.Mesh(cylX(radius * 0.1, radius * 0.1, thickness * 1.5, 12), materialFor(part, 'steel'));
    axle.userData.partId = part.id;
    group.add(axle);
    for (let i = 0; i < 3; i += 1) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(thickness * 0.5, radius * 1.25, radius * 0.11), mat);
      spoke.rotation.x = (i / 3) * Math.PI;
      spoke.userData.partId = part.id;
      group.add(spoke);
    }
    part.inner.add(group);
    part.meshes.push(wheel, hub, axle);
    part.pickMeshes.push(wheel);
    part.gears.push({ group, speed: rotationSpeed, base: group.rotation.clone() });
    return group;
  }

  function addSpring(part, center, radius, height, turns, matKey) {
    const points = [];
    const steps = 140;
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const a = t * TAU * turns;
      points.push(new THREE.Vector3(Math.cos(a) * radius, -height / 2 + t * height, Math.sin(a) * radius));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.TubeGeometry(curve, steps, 0.014, 5, false);
    const mesh = new THREE.Mesh(geo, materialFor(part, matKey));
    mesh.position.set(center[0], center[1], center[2]).sub(part.center);
    mesh.castShadow = true;
    mesh.userData.partId = part.id;
    part.inner.add(mesh);
    part.meshes.push(mesh);
    part.pickMeshes.push(mesh);
    return mesh;
  }

  function addKnurl(part, center, axis, radius, height, count, matKey, toothSize = 0.045) {
    const mat = materialFor(part, matKey);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.clone().normalize());
    for (let i = 0; i < count; i += 1) {
      const a = (i / count) * TAU;
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(toothSize, height, toothSize * 1.1), mat);
      const local = new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius).applyQuaternion(q);
      tooth.position.set(center[0] + local.x, center[1] + local.y, center[2] + local.z).sub(part.center);
      tooth.quaternion.copy(q);
      tooth.rotateY(-a);
      tooth.castShadow = true;
      tooth.userData.partId = part.id;
      part.inner.add(tooth);
      part.meshes.push(tooth);
    }
  }

  /* -----------------------------------------------------------------------
     PART FACTORY
     ----------------------------------------------------------------------- */

  function createPart(def) {
    const groups = DATA.GROUPS;
    const group = groups.find((g) => g.id === def.group) || groups[0];
    const root = new THREE.Group();
    root.name = def.id;
    root.position.set(def.center[0], def.center[1], def.center[2]);
    root.rotation.set(def.baseRot[0], def.baseRot[1], def.baseRot[2]);
    const inner = new THREE.Group();
    root.add(inner);
    const part = {
      id: def.id,
      no: def.no,
      def,
      group,
      groupColor: parseInt(group.color.replace('#', '0x'), 16),
      center: new THREE.Vector3(def.center[0], def.center[1], def.center[2]),
      root,
      inner,
      holder: null,
      baseRot: new THREE.Euler(def.baseRot[0], def.baseRot[1], def.baseRot[2]),
      explode: new THREE.Vector3(def.explode[0], def.explode[1], def.explode[2]),
      explodeRot: new THREE.Euler(def.explodeRot[0], def.explodeRot[1], def.explodeRot[2]),
      stage: def.stage.slice(),
      e: 0,
      meshes: [],
      pickMeshes: [],
      materials: [],
      edges: [],
      screws: [],
      gears: [],
      curtains: null,
      _matCache: {},
      visible: true,
      hidden: false,
      isolated: false
    };
    return part;
  }

  function addPanelXY(part, width, height, radius, holes, depth, position, material, options = {}) {
    const shape = roundedRectShape(width, height, radius, options.cx || 0, options.cy || 0);
    holes.forEach((h) => {
      if (h.type === 'rect') shape.holes.push(roundedRectPath(h.w, h.h, h.r, h.cx, h.cy));
      else shape.holes.push(circlePath(h.r, h.cx, h.cy));
    });
    const geo = extrudeShape(shape, depth, options.bevel == null ? 0.035 : options.bevel, 24);
    if (options.rotate) geo.rotateY(options.rotate[0] || 0);
    return addMesh(part, geo, material, position, options.rotation || [0, 0, 0], {
      edges: options.edges,
      cast: options.cast,
      receive: options.receive
    });
  }

  function addPanelZY(part, wallX, zMin, zMax, yMin, yMax, radius, holes, depth, material, options = {}) {
    const w = zMax - zMin;
    const h = yMax - yMin;
    const shape = roundedRectShape(w, h, radius, 0, 0);
    holes.forEach((hle) => {
      const cx = -((hle.z || 0) - (zMin + zMax) / 2);
      const cy = (hle.y || 0) - (yMin + yMax) / 2;
      if (hle.type === 'rect') shape.holes.push(roundedRectPath(hle.w, hle.h, hle.r || 0.2, cx, cy));
      else shape.holes.push(circlePath(hle.r, cx, cy));
    });
    const geo = extrudeShape(shape, depth, options.bevel == null ? 0.035 : options.bevel, 22);
    geo.rotateY(Math.PI / 2);
    geo.translate(-depth / 2, 0, 0);
    // Extrusion is now along X; geometry z equals world z, y equals world y.
    return addMesh(part, geo, material, [wallX, (yMin + yMax) / 2, (zMin + zMax) / 2], [0, 0, 0], {
      edges: options.edges,
      cast: options.cast,
      receive: options.receive
    });
  }

  function addPanelXZ(part, y, xMin, xMax, zMin, zMax, radius, holes, depth, material, options = {}) {
    const w = xMax - xMin;
    const d = zMax - zMin;
    const shape = roundedRectShape(w, d, radius, 0, 0);
    holes.forEach((hle) => {
      const cx = (hle.x || 0) - (xMin + xMax) / 2;
      const cy = -((hle.z || 0) - (zMin + zMax) / 2);
      if (hle.type === 'rect') shape.holes.push(roundedRectPath(hle.w, hle.h, hle.r || 0.2, cx, cy));
      else shape.holes.push(circlePath(hle.r, cx, cy));
    });
    const geo = extrudeShape(shape, depth, options.bevel == null ? 0.03 : options.bevel, 22);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, -depth / 2, 0);
    return addMesh(part, geo, material, [(xMin + xMax) / 2, y, (zMin + zMax) / 2], [0, 0, 0], {
      edges: options.edges,
      cast: options.cast,
      receive: options.receive
    });
  }

  /* -----------------------------------------------------------------------
     PART BUILDERS
     ----------------------------------------------------------------------- */

  function buildMount(part) {
    const steel = materialFor(part, 'steel');
    const dark = materialFor(part, 'darkSteel');
    const gold = materialFor(part, 'copper');

    // Outer barrel and inner throat.
    addMesh(part, cylZ(3.27, 3.27, 0.78, 72, true), steel, [0.9, 0.25, 4.0], [0, 0, 0], { edges: false });
    addMesh(part, cylZ(3.06, 3.06, 0.7, 72, true), dark, [0.9, 0.25, 4.03], [0, 0, 0], { edges: false });
    addMesh(part, cylZ(2.72, 2.72, 0.86, 64, true), steel, [0.9, 0.25, 4.0], [0, 0, 0], { edges: false });

    // Front and rear flat rings.
    addMesh(part, new THREE.RingGeometry(2.74, 3.28, 72), steel, [0.9, 0.25, 4.41], [0, 0, 0], { edges: false });
    addMesh(part, new THREE.RingGeometry(2.74, 3.28, 72), steel, [0.9, 0.25, 3.61], [0, 0, 0], { edges: false });
    addMesh(part, new THREE.TorusGeometry(3.28, 0.045, 10, 80), steel, [0.9, 0.25, 4.4], [0, 0, 0], { edges: false });
    addMesh(part, new THREE.TorusGeometry(3.34, 0.026, 10, 96), gold, [0.9, 0.25, 4.43], [0, 0, 0], { edges: false });
    addMesh(part, new THREE.RingGeometry(3.2, 3.26, 72), gold, [0.9, 0.25, 4.445], [0, 0, 0], { edges: false });
    addMesh(part, new THREE.TorusGeometry(3.28, 0.035, 8, 80), dark, [0.9, 0.25, 3.62], [0, 0, 0], { edges: false });

    // Three stainless bayonet claws.
    [0.35, 2.45, 4.55].forEach((start) => {
      addMesh(part, new THREE.RingGeometry(2.53, 2.95, 28, 1, start, 0.62), steel, [0.9, 0.25, 4.43], [0, 0, 0], { edges: false });
      addMesh(part, new THREE.RingGeometry(2.53, 2.95, 28, 1, start + 0.03, 0.56), dark, [0.9, 0.25, 4.40], [0, 0, 0], { edges: false });
    });

    // Contact block and eight gold pins.
    for (let i = 0; i < 8; i += 1) {
      const a = deg(205 + i * 13);
      const x = 0.9 + Math.cos(a) * 2.86;
      const y = 0.25 + Math.sin(a) * 2.86;
      const pin = addMesh(part, new THREE.BoxGeometry(0.2, 0.1, 0.1), gold, [x, y, 4.34], [0, 0, -a + Math.PI / 2], { edges: false });
      pin.castShadow = false;
    }
    addMesh(part, roundedBoxGeometry(0.95, 0.4, 0.12, 0.05), dark, [1.75, -1.62, 4.36], [0, 0, 0], { edges: false });

    // Red alignment index.
    const red = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.65, emissive: 0x3a2a08, emissiveIntensity: 0.5 });
    part.materials.push(red);
    addMesh(part, cylZ(0.075, 0.075, 0.035, 20), red, [0.9, 3.16, 4.45], [0, 0, 0], { edges: false, cast: false });

    // Screw bosses / dark holes (actual screws live in the fastener part).
    for (let i = 0; i < 6; i += 1) {
      const a = deg(30 + i * 60);
      addMesh(part, cylZ(0.14, 0.14, 0.03, 18), dark, [0.9 + Math.cos(a) * 3.12, 0.25 + Math.sin(a) * 3.12, 4.44], [0, 0, 0], { edges: false, cast: false });
    }

    // Lens lock pin.
    addMesh(part, cylZ(0.1, 0.1, 0.14, 16), steel, [3.68, -0.43, 4.28], [0, 0, 0], { edges: false });

    // Engraved EF mark.
    addTextPlane(part, 'EF', 0.72, 0.26, [0.9, 3.02, 3.64], [0, 0, 0], {
      color: '#e8c76f', size: 96, width: 256, height: 96, opacity: 0.9
    });
  }

  function buildFrontShell(part) {
    const shell = materialFor(part, 'shell');
    const dark = materialFor(part, 'darkSteel');
    const steel = materialFor(part, 'steel');
    const gold = materialFor(part, 'copper');

    addPanelXY(part, 14.2, 10.9, 1.15, [{ type: 'circle', cx: 0.9, cy: 0.25, r: 3.17 }], 0.94, [0, 0, 3.1], shell, {
      bevel: 0.11,
      edges: true,
      receive: true
    });

    // Inner stiffening / light baffle.
    addPanelXY(part, 13.4, 10.2, 1.0, [{ type: 'circle', cx: 0.9, cy: 0.25, r: 3.2 }], 0.08, [0, 0, 3.16], dark, {
      bevel: 0.02,
      edges: false
    });

    // Side skins close the body between the front and rear shells.
    addMesh(part, roundedBoxGeometry(0.3, 9.35, 5.75, 0.22), shell, [-7.02, 0, 0.12], [0, 0, 0], { edges: true });
    addMesh(part, roundedBoxGeometry(0.3, 9.35, 5.75, 0.22), shell, [7.02, 0, 0.12], [0, 0, 0], { edges: true });
    addMesh(part, roundedBoxGeometry(0.34, 9.55, 0.34, 0.12), shell, [-7.02, 0, -2.72], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(0.34, 9.55, 0.34, 0.12), shell, [7.02, 0, -2.72], [0, 0, 0], { edges: false });
    // Interior side shields block stray PCB light from leaking through the grip seams.
    addMesh(part, roundedBoxGeometry(0.14, 10.0, 5.95, 0.05), dark, [-6.55, 0, 0.12], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(0.14, 10.0, 5.95, 0.05), dark, [6.55, 0, 0.12], [0, 0, 0], { edges: false });

    addMesh(part, new THREE.TorusGeometry(3.34, 0.11, 12, 80), shell, [0.9, 0.25, 3.56], [0, 0, 0], { edges: false });
    addMesh(part, new THREE.TorusGeometry(3.46, 0.022, 8, 96), gold, [0.9, 0.25, 3.6], [0, 0, 0], { edges: false });
    addMesh(part, new THREE.TorusGeometry(3.2, 0.05, 8, 72), dark, [0.9, 0.25, 3.57], [0, 0, 0], { edges: false });

    // Lens release.
    addMesh(part, cylZ(0.22, 0.22, 0.09, 24), dark, [4.14, 0.3, 3.57], [0, 0, 0], { edges: false });
    addMesh(part, cylZ(0.15, 0.15, 0.15, 22), steel, [4.14, 0.3, 3.63], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(0.5, 0.32, 0.16, 0.08), dark, [4.14, -0.06, 3.6], [0, 0, 0], { edges: false });

    // AF assist lamp.
    addMesh(part, cylZ(0.22, 0.22, 0.08, 24), dark, [-3.55, 1.2, 3.58], [0, 0, 0], { edges: false });
    const afLed = new THREE.MeshStandardMaterial({ color: 0x401414, emissive: 0xff4b36, emissiveIntensity: 0.75, roughness: 0.25, metalness: 0.2 });
    part.materials.push(afLed);
    addMesh(part, cylZ(0.11, 0.11, 0.035, 20), afLed, [-3.55, 1.2, 3.66], [0, 0, 0], { edges: false, cast: false });

    // Badges.
    addTextPlane(part, 'CANON', 3.0, 0.62, [-3.1, 4.05, 3.66], [0, 0, 0], {
      color: '#f0ce6e', size: 92, width: 512, height: 116, opacity: 0.92
    });
    addTextPlane(part, 'EOS 6D', 2.1, 0.56, [1.65, -4.2, 3.66], [0, 0, 0], {
      color: '#d6b35d', size: 72, width: 384, height: 112, opacity: 0.95
    });
    addTextPlane(part, 'FULL FRAME', 1.7, 0.22, [1.65, -4.56, 3.66], [0, 0, 0], {
      color: '#9ba7b4', size: 62, width: 384, height: 64, opacity: 0.85
    });

    // Microphone perforations.
    for (let i = 0; i < 6; i += 1) {
      addMesh(part, cylZ(0.035, 0.035, 0.018, 10), dark, [-2.7 + i * 0.2, 4.42, 3.57], [0, 0, 0], { edges: false, cast: false });
    }

    // Fastener holes.
    [[-5.9, 4.55], [5.9, 4.55], [-5.9, -4.55], [5.9, -4.55], [2.0, -4.1]].forEach(([x, y]) => {
      addMesh(part, cylZ(0.135, 0.135, 0.03, 16), dark, [x, y, 3.56], [0, 0, 0], { edges: false, cast: false });
    });

    // Grip transition seam.
    addMesh(part, roundedBoxGeometry(0.18, 9.8, 0.24, 0.08), dark, [4.72, -0.2, 3.5], [0, 0, 0], { edges: false });
  }

  function buildBackShell(part) {
    const shell = materialFor(part, 'shell');
    const dark = materialFor(part, 'darkSteel');
    const rubber = materialFor(part, 'rubber');

    addPanelXY(part, 14.2, 10.9, 1.15, [
      { type: 'rect', cx: 0.45, cy: -0.45, w: 6.0, h: 4.35, r: 0.12 },
      { type: 'rect', cx: 0.9, cy: 3.62, w: 1.7, h: 1.1, r: 0.12 }
    ], 0.88, [0, 0, -3.12], shell, { bevel: 0.1, edges: true });

    // LCD bezel and panel.
    addMesh(part, roundedBoxGeometry(6.3, 4.6, 0.24, 0.18), dark, [0.45, -0.45, -3.6], [0, 0, 0], { edges: false });
    const lcdMat = new THREE.MeshBasicMaterial({ map: CAM.textures.lcd, toneMapped: false });
    part.materials.push(lcdMat);
    addPlane(part, 5.82, 4.02, lcdMat, [0.45, -0.45, -3.795], [0, Math.PI, 0], { pick: false, renderOrder: 4 });
    const lcdSheen = new THREE.MeshBasicMaterial({
      color: 0x9fdcff,
      transparent: true,
      opacity: 0.055,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    part.materials.push(lcdSheen);
    addPlane(part, 6.02, 4.2, lcdSheen, [0.45, -0.45, -3.805], [0, Math.PI, 0], { pick: false, renderOrder: 5 });
    addTextPlane(part, '3.0"  1.04M-DOT', 1.8, 0.22, [0.45, -2.72, -3.79], [0, Math.PI, 0], {
      color: '#768594', size: 52, width: 384, height: 64, opacity: 0.75
    });

    // Viewfinder eyepiece.
    addMesh(part, roundedBoxGeometry(2.05, 1.35, 0.34, 0.16), dark, [0.9, 3.62, -3.6], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(1.9, 1.2, 0.22, 0.14), rubber, [0.9, 3.62, -3.79], [0, 0, 0], { edges: false });
    const eyeglass = materialFor(part, 'glass', { opacity: 0.35, transmission: 0.65 });
    addPlane(part, 1.42, 0.9, eyeglass, [0.9, 3.62, -3.92], [0, Math.PI, 0], { pick: false, renderOrder: 5 });
    addMesh(part, cylZ(0.34, 0.34, 0.18, 24), dark, [2.55, 3.62, -3.56], [0, 0, 0], { edges: false });
    addKnurl(part, [2.55, 3.62, -3.5], new THREE.Vector3(0, 0, 1), 0.33, 0.16, 26, 'darkSteel', 0.035);

    // Rear control cluster.
    const buttons = [
      [4.75, 1.72, 0x9aa5b2, 'MENU'],
      [5.55, 1.25, 0x9aa5b2, 'INFO'],
      [4.7, 0.85, 0x9aa5b2, 'PLAY'],
      [5.55, 0.35, 0xa8b3c0, 'Q'],
      [4.7, -0.1, 0x9aa5b2, 'SET'],
      [5.55, -0.62, 0xa8b3c0, 'DEL'],
      [4.72, -1.55, 0x9aa5b2, 'AF'],
      [5.52, -1.95, 0xc7a45a, 'LOCK']
    ];
    buttons.forEach(([x, y, color, label]) => {
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.25 });
      part.materials.push(mat);
      addMesh(part, cylZ(0.2, 0.21, 0.11, 20), mat, [x, y, -3.58], [0, 0, 0], { edges: false });
      addTextPlane(part, label, 0.62, 0.16, [x, y - 0.32, -3.63], [0, Math.PI, 0], {
        color: '#71808f', size: 42, width: 192, height: 48, opacity: 0.75
      });
    });

    // Rear main dial.
    addMesh(part, cylZ(0.59, 0.59, 0.24, 32), dark, [5.35, 2.55, -3.56], [0, 0, 0], { edges: false });
    addKnurl(part, [5.35, 2.55, -3.52], new THREE.Vector3(0, 0, 1), 0.57, 0.22, 34, 'darkSteel', 0.05);
    addMesh(part, cylZ(0.3, 0.3, 0.06, 24), materialFor(part, 'steel'), [5.35, 2.55, -3.66], [0, 0, 0], { edges: false });

    // Multi-controller.
    addMesh(part, cylZ(0.36, 0.36, 0.1, 24), dark, [4.18, -0.65, -3.57], [0, 0, 0], { edges: false });
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * TAU;
      addMesh(part, roundedBoxGeometry(0.1, 0.06, 0.08, 0.02), dark, [4.18 + Math.cos(a) * 0.24, -0.65 + Math.sin(a) * 0.24, -3.64], [0, 0, 0], { edges: false, cast: false });
    }

    // Thumb rest and card door seam.
    addMesh(part, roundedBoxGeometry(1.15, 2.2, 0.36, 0.2), rubber, [6.35, -1.15, -3.55], [0.06, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(0.16, 4.6, 0.18, 0.06), dark, [6.9, -0.6, -3.42], [0, 0, 0], { edges: false });

    // Fastener holes / strap lug.
    [[-5.8, 4.35], [5.8, 4.35], [-5.8, -4.35], [5.8, -4.35]].forEach(([x, y]) => {
      addMesh(part, cylZ(0.135, 0.135, 0.03, 16), dark, [x, y, -3.57], [0, 0, 0], { edges: false, cast: false });
    });
    addMesh(part, new THREE.TorusGeometry(0.32, 0.09, 10, 24), materialFor(part, 'steel'), [-7.0, 4.55, -3.2], [0, Math.PI / 2, 0], { edges: false });
  }

  function buildTopShell(part) {
    const shell = materialFor(part, 'shell');
    const dark = materialFor(part, 'darkSteel');
    const steel = materialFor(part, 'steel');
    const rubber = materialFor(part, 'rubber');
    const gold = materialFor(part, 'copper');

    addMesh(part, roundedBoxGeometry(14.0, 0.42, 6.35, 0.26), shell, [0.6, 5.26, -0.12], [0, 0, 0], { edges: true });

    const cy = 5.95;
    const cz = -0.2;
    const profile = [
      [-3.0, 5.08], [2.5, 5.08], [2.42, 5.62], [1.02, 6.62],
      [-0.9, 6.98], [-2.7, 6.55], [-3.14, 5.84]
    ].map(([z, y]) => [z - cz, y - cy]);
    const humpGeo = profileExtrudeZY(profile, 5.9, 0.16);
    addMesh(part, humpGeo, shell, [0.9, cy, cz], [0, 0, 0], { edges: true });

    // A thin gasket line where the top cover meets the chassis.
    addMesh(part, roundedBoxGeometry(13.8, 0.07, 6.15, 0.08), dark, [0.6, 5.02, -0.1], [0, 0, 0], { edges: false });

    // Mode dial.
    addMesh(part, cylY(0.74, 0.74, 0.24, 40), dark, [6.0, 5.54, -0.55], [0, 0, 0], { edges: false });
    addMesh(part, new THREE.TorusGeometry(0.76, 0.022, 8, 48), gold, [6.0, 5.67, -0.55], [-Math.PI / 2, 0, 0], { edges: false });
    addKnurl(part, [6.0, 5.59, -0.55], new THREE.Vector3(0, 1, 0), 0.73, 0.2, 40, 'darkSteel', 0.055);
    const dialMat = new THREE.MeshStandardMaterial({ map: CAM.textures.dial, roughness: 0.5, metalness: 0.2 });
    part.materials.push(dialMat);
    addPlane(part, 1.43, 1.43, dialMat, [6.0, 5.78, -0.55], [-Math.PI / 2, 0, 0], { pick: false, renderOrder: 4 });

    // Main command dial.
    addMesh(part, cylY(0.56, 0.56, 0.2, 32), dark, [4.65, 5.5, 1.92], [0, 0, 0], { edges: false });
    addMesh(part, new THREE.TorusGeometry(0.58, 0.018, 8, 42), gold, [4.65, 5.61, 1.92], [-Math.PI / 2, 0, 0], { edges: false });
    addKnurl(part, [4.65, 5.54, 1.92], new THREE.Vector3(0, 1, 0), 0.55, 0.17, 28, 'steel', 0.045);

    // Shutter release and power collar.
    addMesh(part, cylY(0.38, 0.38, 0.06, 28), dark, [4.02, 5.49, 1.17], [0, 0, 0], { edges: false });
    addMesh(part, new THREE.TorusGeometry(0.31, 0.055, 10, 28), gold, [4.02, 5.53, 1.17], [-Math.PI / 2, 0, 0], { edges: false });
    addMesh(part, cylY(0.28, 0.28, 0.14, 26), rubber, [4.02, 5.57, 1.17], [0, 0, 0], { edges: false });

    // Top monochrome LCD.
    const topLcd = new THREE.MeshBasicMaterial({ map: CAM.textures.topLcd, toneMapped: false });
    part.materials.push(topLcd);
    addMesh(part, roundedBoxGeometry(2.62, 0.08, 1.2, 0.06), dark, [-1.72, 5.5, 0.2], [0, 0, 0], { edges: false });
    addPlane(part, 2.48, 1.08, topLcd, [-1.72, 5.56, 0.2], [-Math.PI / 2, 0, 0], { pick: false, renderOrder: 4 });

    // Top buttons.
    [
      [-3.85, 0.88, 0.2], [-3.85, -0.28, 0.2], [-3.28, 2.06, 0.18],
      [1.55, -1.98, 0.18], [2.72, -1.86, 0.18], [3.45, -1.7, 0.17]
    ].forEach(([x, z, r]) => {
      addMesh(part, cylY(r, r, 0.1, 20), dark, [x, 5.47, z], [0, 0, 0], { edges: false });
      addMesh(part, cylY(r * 0.72, r * 0.72, 0.07, 18), rubber, [x, 5.54, z], [0, 0, 0], { edges: false });
    });

    // Hot shoe.
    addMesh(part, roundedBoxGeometry(2.5, 0.1, 1.65, 0.08), dark, [0.9, 6.98, -0.15], [0, 0, 0], { edges: false });
    addMesh(part, new THREE.BoxGeometry(2.28, 0.08, 0.18), steel, [0.9, 7.08, 0.54], [0, 0, 0], { edges: false });
    addMesh(part, new THREE.BoxGeometry(2.28, 0.08, 0.18), steel, [0.9, 7.08, -0.84], [0, 0, 0], { edges: false });
    addMesh(part, new THREE.BoxGeometry(0.18, 0.08, 1.46), steel, [-0.18, 7.08, -0.15], [0, 0, 0], { edges: false });
    addMesh(part, new THREE.BoxGeometry(0.18, 0.08, 1.46), steel, [1.98, 7.08, -0.15], [0, 0, 0], { edges: false });
    addMesh(part, new THREE.BoxGeometry(0.52, 0.04, 1.18), dark, [0.9, 7.055, -0.15], [0, 0, 0], { edges: false });
    addMesh(part, cylY(0.09, 0.09, 0.04, 16), materialFor(part, 'copper'), [0.9, 7.09, 0.16], [0, 0, 0], { edges: false, cast: false });

    // Strap lugs.
    [-7.02, 7.02].forEach((x) => {
      addMesh(part, new THREE.TorusGeometry(0.3, 0.085, 10, 24), steel, [x, 4.88, 0.2], [0, Math.PI / 2, 0], { edges: false });
      addMesh(part, roundedBoxGeometry(0.18, 0.55, 0.5, 0.06), dark, [x * 0.985, 4.7, 0.2], [0, 0, 0], { edges: false });
    });

    // Microphone perforations on the front of the prism hump.
    for (let i = 0; i < 7; i += 1) {
      addMesh(part, cylZ(0.035, 0.035, 0.018, 10), dark, [-0.55 + i * 0.18, 5.9, 2.52], [0, 0, 0], { edges: false, cast: false });
    }

    addTextPlane(part, 'EOS 6D', 1.22, 0.3, [0.9, 5.48, 2.6], [0, 0, 0], {
      color: '#e8c76f', size: 70, width: 320, height: 80, opacity: 0.9
    });
    addTextPlane(part, 'CANON', 1.25, 0.24, [0.9, 5.24, 2.6], [0, 0, 0], {
      color: '#c9a24a', size: 60, width: 320, height: 64, opacity: 0.8
    });

    // Fastener holes.
    [[-5.75, 5.46, 2.2], [5.75, 5.46, 2.2], [-5.75, 5.46, -2.1], [5.75, 5.46, -2.1]].forEach(([x, y, z]) => {
      addMesh(part, cylY(0.135, 0.135, 0.03, 16), dark, [x, y, z], [0, 0, 0], { edges: false, cast: false });
    });

    // Concept pop-up flash module (the original EOS 6D has no built-in flash;
    // this optional module is added for the interactive lab's flash control).
    const flashGroup = new THREE.Group();
    const flashWorld = [0.9, 6.58, -1.28];
    flashGroup.position.set(
      flashWorld[0] - part.center.x,
      flashWorld[1] - part.center.y,
      flashWorld[2] - part.center.z
    );
    part.inner.add(flashGroup);
    const flashGlass = new THREE.MeshStandardMaterial({
      color: 0xffe7b3,
      emissive: 0xffb43c,
      emissiveIntensity: 0.22,
      roughness: 0.12,
      metalness: 0.15
    });
    part.materials.push(flashGlass);
    const addFlashMesh = (geo, mat, offset, options = {}) => {
      const mesh = addMesh(
        part,
        geo,
        mat,
        [part.center.x + offset[0], part.center.y + offset[1], part.center.z + offset[2]],
        options.rotation || [0, 0, 0],
        { holder: flashGroup, edges: options.edges, cast: options.cast }
      );
      return mesh;
    };
    addFlashMesh(roundedBoxGeometry(2.45, 0.55, 0.82, 0.12), shell, [0, 0, 0], { edges: true });
    addFlashMesh(roundedBoxGeometry(2.16, 0.34, 0.06, 0.04), flashGlass, [0, 0, 0.43], { edges: false });
    addFlashMesh(new THREE.BoxGeometry(2.55, 0.055, 0.9), gold, [0, 0.3, 0], { edges: false });
    addFlashMesh(new THREE.BoxGeometry(2.34, 0.05, 0.12), gold, [0, -0.3, 0.38], { edges: false });
    addFlashMesh(roundedBoxGeometry(0.42, 0.18, 0.6, 0.05), gold, [-1.18, -0.15, -0.05], { edges: false });
    addFlashMesh(roundedBoxGeometry(0.42, 0.18, 0.6, 0.05), gold, [1.18, -0.15, -0.05], { edges: false });
    addFlashMesh(new THREE.BoxGeometry(2.5, 0.05, 0.05), gold, [0, 0.29, -0.42], { edges: false });
    flashGroup.visible = false;
    part.flash = {
      group: flashGroup,
      baseY: flashGroup.position.y,
      upY: flashGroup.position.y + 0.92,
      glassMat: flashGlass,
      shellMat: shell
    };
  }

  function buildBottomShell(part) {
    const shell = materialFor(part, 'shell');
    const dark = materialFor(part, 'darkSteel');
    const steel = materialFor(part, 'steel');
    const rubber = materialFor(part, 'rubber');

    addMesh(part, roundedBoxGeometry(14.0, 0.38, 6.4, 0.22), shell, [0.4, -5.35, 0.1], [0, 0, 0], { edges: true });
    addMesh(part, roundedBoxGeometry(12.9, 0.08, 5.6, 0.2), dark, [0.4, -5.12, 0.1], [0, 0, 0], { edges: false });

    // Tripod socket.
    addMesh(part, roundedBoxGeometry(2.1, 0.1, 2.1, 0.16), steel, [0.9, -5.54, 0.2], [0, 0, 0], { edges: false });
    addMesh(part, new THREE.TorusGeometry(0.54, 0.075, 12, 32), steel, [0.9, -5.58, 0.2], [-Math.PI / 2, 0, 0], { edges: false });
    addMesh(part, cylY(0.43, 0.43, 0.18, 28), dark, [0.9, -5.58, 0.2], [0, 0, 0], { edges: false });
    for (let i = 0; i < 3; i += 1) {
      addMesh(part, new THREE.TorusGeometry(0.3, 0.028, 6, 24), dark, [0.9, -5.64 - i * 0.035, 0.2], [-Math.PI / 2, 0, 0], { edges: false });
    }

    // Battery door under the grip.
    addMesh(part, roundedBoxGeometry(2.65, 0.14, 3.3, 0.18), shell, [5.55, -5.55, 1.55], [0, 0, 0], { edges: true });
    addMesh(part, roundedBoxGeometry(2.35, 0.08, 3.0, 0.16), dark, [5.55, -5.49, 1.55], [0, 0, 0], { edges: false });
    addMesh(part, cylX(0.1, 0.1, 0.4, 16), dark, [5.55, -5.56, -0.16], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(0.3, 0.1, 0.52, 0.06), steel, [5.55, -5.6, 3.12], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(0.55, 0.1, 0.34, 0.06), dark, [5.55, -5.6, 2.82], [0, 0, 0], { edges: false });

    // Rubber feet.
    [[-5.5, -5.6, -2.3], [5.5, -5.6, -2.3], [-5.5, -5.6, 2.35], [5.5, -5.6, 2.35]].forEach(([x, y, z]) => {
      addMesh(part, cylY(0.2, 0.22, 0.1, 16), rubber, [x, y, z], [0, 0, 0], { edges: false });
    });

    // Screw holes.
    [[-4.9, 2.5], [4.9, 2.5], [-4.9, -2.2], [4.9, -2.2]].forEach(([x, z]) => {
      addMesh(part, cylY(0.135, 0.135, 0.03, 16), dark, [x, -5.56, z], [0, 0, 0], { edges: false, cast: false });
    });

    addTextPlane(part, '1/4"-20', 0.95, 0.18, [0.9, -5.62, 1.3], [-Math.PI / 2, 0, 0], {
      color: '#7d8a98', size: 40, width: 256, height: 48, opacity: 0.8
    });
  }

  function buildGrip(part) {
    const shell = materialFor(part, 'shell');
    const rubber = materialFor(part, 'rubber');
    const dark = materialFor(part, 'darkSteel');

    addMesh(part, roundedBoxGeometry(2.65, 6.55, 3.05, 1.05, 6), shell, [6.02, -1.2, 2.35], [0, 0, 0], { edges: true });
    addMesh(part, roundedBoxGeometry(3.0, 5.95, 1.7, 1.18, 6), shell, [5.55, -1.2, 3.9], [0.03, 0, 0], { edges: true });
    addMesh(part, roundedBoxGeometry(3.15, 1.3, 2.8, 0.55, 5), shell, [5.55, 2.22, 2.72], [-0.12, 0, 0], { edges: true });
    addMesh(part, roundedBoxGeometry(3.1, 2.6, 2.3, 0.7, 5), shell, [5.55, 3.15, 2.9], [-0.04, 0, 0], { edges: true });
    addMesh(part, roundedBoxGeometry(2.8, 1.05, 2.6, 0.5, 5), shell, [5.62, -4.52, 2.7], [0.1, 0, 0], { edges: true });
    addMesh(part, roundedBoxGeometry(0.25, 5.9, 2.6, 0.22), shell, [7.2, -1.2, 2.25], [0, 0, 0], { edges: true });
    addMesh(part, roundedBoxGeometry(1.5, 4.9, 0.38, 0.34, 5), rubber, [5.55, -1.25, 4.78], [0.04, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(0.9, 5.2, 0.3, 0.22, 4), rubber, [7.3, -1.2, 2.25], [0, 0, 0], { edges: false });

    // Soft finger ridges on the front face.
    [-2.55, -1.35, -0.15].forEach((y) => {
      addMesh(part, roundedBoxGeometry(2.42, 0.36, 0.28, 0.15), rubber, [5.55, y, 4.92], [0.1, 0, 0], { edges: false });
    });

    // Thumb rest on the rear shoulder.
    addMesh(part, roundedBoxGeometry(1.05, 2.1, 0.58, 0.24), rubber, [6.96, 0.58, 0.62], [0.12, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(0.76, 0.9, 0.34, 0.14), dark, [6.98, -2.02, 0.68], [0.12, 0, 0], { edges: false });

    // Seam and screws.
    addMesh(part, roundedBoxGeometry(0.1, 4.9, 2.0, 0.04), dark, [4.88, -1.2, 2.2], [0, 0, 0], { edges: false });
    [[7.24, 1.6, 1.3], [7.24, -3.0, 1.3], [7.24, -1.15, 3.1]].forEach(([x, y, z]) => {
      addMesh(part, cylX(0.14, 0.14, 0.03, 16), dark, [x, y, z], [0, 0, 0], { edges: false, cast: false });
    });

    // Subtle stippled pad on the outer face (no ladder-like ribs).
    addMesh(part, roundedBoxGeometry(0.06, 3.0, 1.7, 0.04), rubber, [7.34, -1.2, 2.2], [0, 0, 0], { edges: false, cast: false });
  }

  function buildChassis(part) {
    const mag = materialFor(part, 'magnesium');
    const dark = materialFor(part, 'darkSteel');
    const steel = materialFor(part, 'steel');
    const copper = materialFor(part, 'copper');

    const sideHoles = [
      { type: 'circle', z: -1.05, y: 1.65, r: 0.86 },
      { type: 'circle', z: 1.15, y: 1.1, r: 0.68 },
      { type: 'circle', z: -1.15, y: -1.75, r: 0.74 },
      { type: 'circle', z: 1.2, y: -1.8, r: 0.56 },
      { type: 'rect', z: 0.2, y: 3.15, w: 1.7, h: 0.52, r: 0.18 },
      { type: 'rect', z: 0.1, y: -3.35, w: 1.5, h: 0.46, r: 0.16 }
    ];
    addPanelZY(part, -6.02, -2.8, 2.7, -4.5, 4.42, 0.26, sideHoles, 0.22, mag, { edges: true });
    addPanelZY(part, 6.02, -2.8, 2.7, -4.5, 4.42, 0.26, sideHoles, 0.22, mag, { edges: true });

    addPanelXZ(part, 4.45, -6.1, 6.12, -2.75, 2.7, 0.3, [
      { type: 'rect', x: 0.9, z: 0.25, w: 4.5, h: 4.35, r: 0.38 },
      { type: 'circle', x: -4.4, z: 1.5, r: 0.6 },
      { type: 'circle', x: 4.8, z: -1.4, r: 0.5 }
    ], 0.22, mag, { edges: true });

    addPanelXZ(part, -4.45, -6.1, 6.12, -2.75, 2.7, 0.3, [
      { type: 'rect', x: -3.7, z: 0.1, w: 1.4, h: 2.8, r: 0.24 },
      { type: 'circle', x: 0.9, z: 0.15, r: 0.82 },
      { type: 'circle', x: 4.8, z: -1.3, r: 0.46 }
    ], 0.22, mag, { edges: true });

    addPanelXY(part, 11.9, 8.65, 0.26, [
      { type: 'rect', cx: 0.9, cy: 0.25, w: 4.85, h: 3.6, r: 0.18 },
      { type: 'circle', cx: -4.5, cy: 2.5, r: 0.45 },
      { type: 'circle', cx: 4.85, cy: -2.6, r: 0.45 }
    ], 0.24, [0, 0, -2.76], mag, { edges: true });

    // Front lens-mount support plate.
    addPanelXY(part, 11.7, 8.6, 0.3, [
      { type: 'circle', cx: 0.9, cy: 0.25, r: 3.42 },
      { type: 'circle', cx: -4.5, cy: 2.6, r: 0.45 },
      { type: 'circle', cx: 4.8, cy: -2.7, r: 0.45 }
    ], 0.26, [0, 0, 2.7], mag, { edges: true });

    // Mirror box: a light-tight black tunnel behind the mount.
    const mx0 = -1.35;
    const mx1 = 3.15;
    const my0 = -1.58;
    const my1 = 2.98;
    addMesh(part, roundedBoxGeometry(mx1 - mx0, 0.13, 2.92, 0.03), dark, [(mx0 + mx1) / 2, my1, 1.48], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(mx1 - mx0, 0.13, 2.92, 0.03), dark, [(mx0 + mx1) / 2, my0, 1.48], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(0.13, my1 - my0, 2.92, 0.03), dark, [mx0, (my0 + my1) / 2, 1.48], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(0.13, my1 - my0, 2.92, 0.03), dark, [mx1, (my0 + my1) / 2, 1.48], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(mx1 - mx0 + 0.2, my1 - my0 + 0.2, 0.12, 0.03), dark, [(mx0 + mx1) / 2, (my0 + my1) / 2, 2.92], [0, 0, 0], { edges: false });

    // Light seal foam at the mount opening.
    const foam = new THREE.MeshStandardMaterial({ color: 0x050607, roughness: 0.98, metalness: 0.0 });
    part.materials.push(foam);
    addMesh(part, roundedBoxGeometry(4.6, 0.17, 0.08, 0.02), foam, [0.9, 2.86, 2.86], [0, 0, 0], { edges: false, cast: false });
    addMesh(part, roundedBoxGeometry(4.6, 0.17, 0.08, 0.02), foam, [0.9, -1.46, 2.86], [0, 0, 0], { edges: false, cast: false });

    // Black light baffles: keep the PCB from showing through the mount throat.
    addMesh(part, new THREE.RingGeometry(2.32, 3.16, 64), foam, [0.9, 0.25, 2.95], [0, 0, 0], { edges: false, cast: false });
    addPanelXY(part, 6.4, 4.9, 0.2, [{ type: 'rect', cx: 0, cy: 0, w: 4.05, h: 2.85, r: 0.1 }], 0.1, [0.9, 0.25, -0.72], dark, {
      bevel: 0.02,
      edges: false,
      receive: false
    });

    // Mount support ring.
    addMesh(part, cylZ(3.55, 3.55, 0.42, 64, true), mag, [0.9, 0.25, 2.72], [0, 0, 0], { edges: true });
    addMesh(part, new THREE.TorusGeometry(3.52, 0.09, 10, 64), mag, [0.9, 0.25, 2.93], [0, 0, 0], { edges: false });

    // Four mount arms to the frame.
    [[-3.6, 2.8, 0.85, 0.24, 0.28], [3.6, 2.8, 0.85, 0.24, 0.28], [-3.6, -2.4, 0.85, 0.24, 0.28], [3.6, -2.4, 0.85, 0.24, 0.28]].forEach(([x, y]) => {
      addMesh(part, roundedBoxGeometry(2.8, 0.38, 0.34, 0.08), mag, [x * 0.7, y, 2.62], [0, 0, x > 0 ? -0.5 : 0.5], { edges: false });
    });

    // Structural ribs on both side walls.
    const ribPositions = [
      [-5.95, 2.6, 2.2, -0.58], [-5.95, -2.7, 2.2, 0.58], [5.95, 2.6, 2.2, 0.58], [5.95, -2.7, 2.2, -0.58],
      [-5.95, 0.1, 2.55, 0.9], [5.95, 0.1, 2.55, -0.9]
    ];
    ribPositions.forEach(([x, y, z, rot]) => {
      addMesh(part, roundedBoxGeometry(0.22, 0.17, 2.2, 0.04), mag, [x, y, z], [rot, 0, 0], { edges: false });
    });

    // AF sub-module beneath the mirror box.
    addMesh(part, roundedBoxGeometry(2.0, 0.42, 0.78, 0.08), dark, [0.9, -2.12, 1.12], [0, 0, 0], { edges: false });
    addMesh(part, cylY(0.18, 0.18, 0.12, 20), steel, [0.9, -1.88, 1.12], [0, 0, 0], { edges: false });

    // Battery / card bay frame inside the grip side.
    addMesh(part, roundedBoxGeometry(0.2, 5.9, 2.7, 0.08), mag, [4.62, -1.2, 2.3], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(1.9, 0.2, 2.7, 0.08), mag, [5.55, 1.72, 2.3], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(1.9, 0.2, 2.7, 0.08), mag, [5.55, -4.12, 2.3], [0, 0, 0], { edges: false });

    // Tripod boss and copper grounding straps.
    addMesh(part, cylY(0.76, 0.76, 0.35, 32), mag, [0.9, -4.55, 0.2], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(0.16, 0.05, 2.0, 0.02), copper, [-2.6, 3.3, 2.2], [0.2, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(0.16, 0.05, 2.0, 0.02), copper, [3.6, 3.3, 2.2], [-0.2, 0, 0], { edges: false });

    // Screw bosses.
    [[-5.78, 3.2, 0], [5.78, 3.2, 0], [-5.78, -3.2, 0], [5.78, -3.2, 0]].forEach(([x, y, z]) => {
      addMesh(part, cylX(0.2, 0.2, 0.18, 16), steel, [x, y, z], [0, 0, 0], { edges: false });
    });

    addTextPlane(part, 'MAGNESIUM', 2.1, 0.3, [-6.13, 0.9, 0.3], [0, -Math.PI / 2, 0], {
      color: '#75818e', size: 64, width: 512, height: 96, opacity: 0.7
    });
  }

  function buildMirror(part) {
    part.holder = new THREE.Group();
    part.inner.add(part.holder);
    const mirror = materialFor(part, 'mirror');
    const glass = materialFor(part, 'optical', { transmission: 0.25, opacity: 0.85, roughness: 0.02 });
    const dark = materialFor(part, 'darkSteel');
    const steel = materialFor(part, 'steel');

    const cx = 0.9;
    const cy = 0.25;
    const cz = 1.8;
    addPlane(part, 3.16, 2.88, mirror, [cx, cy, cz + 0.025], [0, 0, 0], { renderOrder: 3 });
    addPlane(part, 3.16, 2.88, glass, [cx, cy, cz + 0.05], [0, 0, 0], { pick: false, renderOrder: 4 });
    addMesh(part, roundedBoxGeometry(3.34, 3.04, 0.06, 0.03), dark, [cx, cy, cz - 0.03], [0, 0, 0], { edges: false });

    // Mirror frame.
    addMesh(part, roundedBoxGeometry(3.44, 0.08, 0.1, 0.025), dark, [cx, cy + 1.53, cz - 0.01], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(3.44, 0.08, 0.1, 0.025), dark, [cx, cy - 1.53, cz - 0.01], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(0.08, 3.04, 0.1, 0.025), dark, [cx - 1.7, cy, cz - 0.01], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(0.08, 3.04, 0.1, 0.025), dark, [cx + 1.7, cy, cz - 0.01], [0, 0, 0], { edges: false });

    // Hinge and quick-return arms.
    addMesh(part, cylX(0.075, 0.075, 3.55, 18), steel, [cx, cy - 1.6, cz - 0.02], [0, 0, 0], { edges: false });
    [-1.72, 1.72].forEach((x) => {
      addMesh(part, cylX(0.14, 0.14, 0.16, 18), steel, [cx + x, cy - 1.6, cz - 0.02], [0, 0, 0], { edges: false });
      addMesh(part, roundedBoxGeometry(0.14, 0.62, 0.18, 0.04), dark, [cx + x, cy - 1.92, cz - 0.02], [0, 0, 0], { edges: false });
    });
    addMesh(part, roundedBoxGeometry(0.22, 1.1, 0.14, 0.04), dark, [cx + 1.88, cy - 0.95, cz - 0.04], [0, 0, 0], { edges: false });

    // Small AF sub-mirror.
    addPlane(part, 1.32, 0.72, mirror, [cx, cy - 1.42, cz - 0.12], [-0.32, 0, 0], { renderOrder: 3 });
    addMesh(part, roundedBoxGeometry(1.5, 0.05, 0.05, 0.02), dark, [cx, cy - 1.04, cz - 0.12], [0, 0, 0], { edges: false });

    // Bumper pads.
    addMesh(part, roundedBoxGeometry(0.16, 0.12, 0.12, 0.03), materialFor(part, 'rubber'), [cx - 1.5, cy - 1.43, cz + 0.03], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(0.16, 0.12, 0.12, 0.03), materialFor(part, 'rubber'), [cx + 1.5, cy - 1.43, cz + 0.03], [0, 0, 0], { edges: false });
  }

  function buildPentaprism(part) {
    const optical = materialFor(part, 'optical');
    const mirror = materialFor(part, 'mirror');
    const mag = materialFor(part, 'magnesium');
    const dark = materialFor(part, 'darkSteel');

    const cy = 4.35;
    const cz = -0.55;
    const profile = [
      [-2.62, 3.02], [1.12, 3.02], [1.54, 4.12], [0.46, 5.56], [-1.16, 5.92], [-2.56, 4.62]
    ].map(([z, y]) => [z - cz, y - cy]);
    const prism = addMesh(part, profileExtrudeZY(profile, 3.8, 0.06), optical, [0.9, cy, cz], [0, 0, 0], { edges: true, opacity: 0.3, color: 0xb7a8ff });
    prism.renderOrder = 2;

    // Thin reflective coating plates on two internal faces.
    const facetA = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.3), mirror);
    facetA.position.set(0.2, 0.04, 0.32);
    facetA.rotation.set(0.82, 0, 0.18);
    facetA.userData.partId = part.id;
    part.inner.add(facetA);
    part.meshes.push(facetA);
    const facetB = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.5), mirror);
    facetB.position.set(0.25, 0.35, -0.55);
    facetB.rotation.set(-0.62, 0, -0.1);
    facetB.userData.partId = part.id;
    part.inner.add(facetB);
    part.meshes.push(facetB);

    // Magnesium cage and top shield.
    addMesh(part, roundedBoxGeometry(4.2, 0.12, 0.36, 0.05), mag, [0.9, 3.12, 1.0], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(4.2, 0.12, 0.36, 0.05), mag, [0.9, 3.12, -2.1], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(0.16, 2.7, 2.9, 0.05), mag, [-1.04, 4.35, -0.55], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(0.16, 2.7, 2.9, 0.05), mag, [2.84, 4.35, -0.55], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(4.24, 0.16, 3.4, 0.08), dark, [0.9, 5.82, -0.55], [0, 0, 0], { edges: false });

    // Rear eyepiece optical block.
    addMesh(part, cylZ(0.58, 0.58, 0.18, 32), dark, [0.9, 4.2, -2.42], [0, 0, 0], { edges: false });
    addPlane(part, 0.8, 0.62, materialFor(part, 'glass', { opacity: 0.45 }), [0.9, 4.2, -2.52], [0, Math.PI, 0], { pick: false, renderOrder: 4 });
    addMesh(part, new THREE.TorusGeometry(0.43, 0.06, 8, 28), mag, [0.9, 4.2, -2.35], [0, 0, 0], { edges: false });

    // Roof ridge highlight.
    addMesh(part, new THREE.BoxGeometry(3.7, 0.035, 0.035), materialFor(part, 'steel'), [0.9, 5.51, -0.66], [0.2, 0, 0], { edges: false, cast: false });

    addTextPlane(part, 'ROOF PENTAPRISM', 2.0, 0.24, [0.9, 3.18, 1.19], [0, 0, 0], {
      color: '#7f8b99', size: 46, width: 512, height: 72, opacity: 0.7
    });
  }

  function buildFocusingScreen(part) {
    const glass = materialFor(part, 'glass', { opacity: 0.92, transmission: 0.35, roughness: 0.5 });
    const dark = materialFor(part, 'darkSteel');
    const steel = materialFor(part, 'steel');

    // Outer carrier frame.
    addMesh(part, roundedBoxGeometry(4.25, 0.18, 3.42, 0.08), dark, [0.9, 2.9, 1.65], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(3.72, 0.1, 2.88, 0.05), materialFor(part, 'shell'), [0.9, 2.93, 1.65], [0, 0, 0], { edges: false });

    const screenMat = new THREE.MeshStandardMaterial({
      map: CAM.textures.focusScreen,
      color: 0xffffff,
      roughness: 0.55,
      metalness: 0.08,
      emissive: 0x121b22,
      emissiveIntensity: 0.35
    });
    part.materials.push(screenMat);
    addPlane(part, 3.55, 2.7, screenMat, [0.9, 2.99, 1.65], [-Math.PI / 2, 0, 0], { pick: false, renderOrder: 4 });

    // Spring clips.
    [-1.55, 1.55].forEach((x) => {
      addMesh(part, roundedBoxGeometry(0.16, 0.06, 0.65, 0.03), steel, [0.9 + x, 2.86, 1.65], [0, 0, 0], { edges: false });
    });
    addMesh(part, roundedBoxGeometry(3.9, 0.05, 0.1, 0.02), steel, [0.9, 2.86, 0.17], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(3.9, 0.05, 0.1, 0.02), steel, [0.9, 2.86, 3.13], [0, 0, 0], { edges: false });
  }

  function buildShutterCurtains(part) {
    const dark = materialFor(part, 'darkSteel');
    const shutter = materialFor(part, 'shutter');
    const steel = materialFor(part, 'steel');

    // Frame with a 36 x 24 mm opening.
    addPanelXY(part, 4.45, 3.62, 0.14, [{ type: 'rect', cx: 0, cy: 0, w: 3.64, h: 2.48, r: 0.05 }], 0.14, [0.9, 0.25, 0.24], dark, {
      bevel: 0.02,
      edges: false
    });

    // Curtain groups.
    part.curtains = {};
    const makeCurtain = (name, y, h) => {
      const g = new THREE.Group();
      g.position.y = y;
      part.inner.add(g);
      const cx = 0.9;
      const cy = 0.25;
      const cz = 0.24;
      addMesh(part, roundedBoxGeometry(3.58, h, 0.035, 0.012), shutter, [cx, cy, cz + 0.02], [0, 0, 0], { holder: g, edges: false });
      for (let i = 0; i < 8; i += 1) {
        addMesh(part, new THREE.BoxGeometry(3.58, 0.018, 0.045), dark, [cx, cy - h / 2 + 0.08 + i * (h / 8), cz + 0.045], [0, 0, 0], { holder: g, edges: false, cast: false });
      }
      addMesh(part, new THREE.BoxGeometry(3.6, 0.035, 0.05), steel, [cx, cy + h / 2 - 0.025, cz + 0.02], [0, 0, 0], { holder: g, edges: false });
      part.curtains[name] = { group: g, base: y };
      return g;
    };
    makeCurtain('upper', 0.64, 1.05);
    makeCurtain('lower', -0.64, 1.05);

    // Guide rails and springs.
    [-1.91, 1.91].forEach((x) => {
      addMesh(part, roundedBoxGeometry(0.08, 3.3, 0.1, 0.02), steel, [0.9 + x, 0.25, 0.18], [0, 0, 0], { edges: false });
    });
    addSpring(part, [2.85, -0.35, 0.16], 0.13, 2.1, 7, 'steel');
    addSpring(part, [-1.05, -0.35, 0.16], 0.13, 2.1, 7, 'steel');

    addTextPlane(part, 'FOCAL PLANE', 1.8, 0.22, [0.9, 2.02, 0.33], [0, 0, 0], {
      color: '#6b7784', size: 42, width: 512, height: 64, opacity: 0.75
    });
  }

  function buildShutterDrive(part) {
    const steel = materialFor(part, 'steel');
    const dark = materialFor(part, 'darkSteel');
    const copper = materialFor(part, 'copper');
    const mag = materialFor(part, 'magnesium');

    addMesh(part, roundedBoxGeometry(0.22, 3.0, 2.2, 0.08), dark, [4.35, -0.45, 0.82], [0, 0, 0], { edges: true });
    addMesh(part, roundedBoxGeometry(0.16, 2.3, 1.8, 0.06), mag, [4.22, -0.45, 0.82], [0, 0, 0], { edges: false });

    // Coreless motor.
    addMesh(part, cylX(0.31, 0.31, 0.92, 28), dark, [4.13, 0.55, 0.55], [0, 0, 0], { edges: false });
    addMesh(part, cylX(0.32, 0.32, 0.08, 24), steel, [3.66, 0.55, 0.55], [0, 0, 0], { edges: false });
    addMesh(part, cylX(0.32, 0.32, 0.08, 24), steel, [4.6, 0.55, 0.55], [0, 0, 0], { edges: false });
    [-0.28, 0, 0.28].forEach((oz) => {
      addMesh(part, new THREE.TorusGeometry(0.265, 0.032, 8, 26), copper, [4.13, 0.55, 0.55 + oz], [0, Math.PI / 2, 0], { edges: false });
    });

    // Reduction gear train.
    addGear(part, [4.68, 0.12, 0.5], 0.46, 0.09, 18, 'steel', 1.5);
    addGear(part, [4.68, -0.38, 0.82], 0.31, 0.08, 13, 'steel', -2.2);
    addGear(part, [4.68, -0.76, 0.5], 0.22, 0.07, 10, 'steel', 3.1);
    addGear(part, [4.68, -1.08, 0.76], 0.15, 0.06, 8, 'copper', -4.2);

    // Cam lever and release arm.
    addMesh(part, roundedBoxGeometry(0.08, 0.92, 0.1, 0.03), steel, [4.76, -0.24, 1.16], [0, 0, -0.28], { edges: false });
    addMesh(part, roundedBoxGeometry(0.08, 0.72, 0.1, 0.03), steel, [4.76, -0.88, 1.05], [0, 0, 0.4], { edges: false });
    addSpring(part, [4.45, -1.62, 0.48], 0.17, 0.8, 5, 'steel');
    addMesh(part, roundedBoxGeometry(0.14, 0.55, 0.14, 0.04), copper, [4.82, -1.48, 0.64], [0, 0, 0], { edges: false });

    // Timing sensor PCB.
    const pcbMat = materialFor(part, 'pcb');
    addMesh(part, roundedBoxGeometry(0.08, 0.78, 0.62, 0.03), pcbMat, [4.42, 1.12, 0.45], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(0.11, 0.22, 0.2, 0.02), materialFor(part, 'silicon'), [4.36, 1.26, 0.45], [0, 0, 0], { edges: false });

    addTextPlane(part, 'SHUTTER DRIVE', 1.45, 0.18, [4.24, 0.15, 1.94], [0, 0, 0], {
      color: '#75818e', size: 38, width: 512, height: 64, opacity: 0.7
    });
  }

  function buildMainboard(part) {
    const pcb = materialFor(part, 'pcb');
    const silicon = materialFor(part, 'silicon');
    const steel = materialFor(part, 'steel');
    const copper = materialFor(part, 'copper');

    addMesh(part, roundedBoxGeometry(9.8, 7.2, 0.13, 0.08), pcb, [0.5, -0.35, -2.35], [0, 0, 0], { edges: true });
    addPlane(part, 9.5, 6.9, pcb, [0.5, -0.35, -2.425], [0, Math.PI, 0], { pick: false, renderOrder: 3 });
    addPlane(part, 9.5, 6.9, pcb, [0.5, -0.35, -2.275], [0, 0, 0], { pick: false, renderOrder: 3 });

    const addChip = (x, y, w, h, label, color) => {
      addMesh(part, roundedBoxGeometry(w, h, 0.16, 0.035), silicon, [x, y, -2.47], [0, 0, 0], { edges: false });
      addMesh(part, roundedBoxGeometry(w * 0.36, h * 0.36, 0.035, 0.01), color, [x, y, -2.555], [0, 0, 0], { edges: false, cast: false });
      if (label) {
        addTextPlane(part, label, Math.min(w * 1.4, 1.6), 0.18, [x, y + h * 0.28, -2.58], [0, Math.PI, 0], {
          color: '#c9d6e3', size: 44, width: 320, height: 64, opacity: 0.9
        });
      }
    };

    // DIGIC 5+ with heat spreader.
    addMesh(part, roundedBoxGeometry(1.55, 1.55, 0.18, 0.06), silicon, [2.9, 1.5, -2.48], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(1.42, 1.42, 0.035, 0.04), steel, [2.9, 1.5, -2.585], [0, 0, 0], { edges: false });
    addTextPlane(part, 'DIGIC 5+', 1.05, 0.2, [2.9, 1.5, -2.61], [0, Math.PI, 0], {
      color: '#dbe5ef', size: 58, width: 320, height: 72, opacity: 0.95
    });

    addChip(-1.5, 1.75, 0.95, 0.62, 'DDR3', copper);
    addChip(-1.5, 0.88, 0.95, 0.62, 'DDR3', copper);
    addChip(-3.35, 1.42, 0.9, 0.9, 'AF', silicon);
    addChip(0.9, 2.45, 0.75, 0.55, 'SDR', silicon);
    addChip(-3.55, -1.75, 0.7, 0.55, 'GPS', silicon);
    addChip(-2.4, -2.55, 1.05, 0.5, 'PWR', silicon);

    // Wi-Fi shield can.
    addMesh(part, roundedBoxGeometry(1.72, 1.08, 0.2, 0.05), steel, [3.35, -1.95, -2.49], [0, 0, 0], { edges: true });
    addTextPlane(part, 'Wi-Fi / GPS', 1.25, 0.16, [3.35, -1.95, -2.61], [0, Math.PI, 0], {
      color: '#7f8b98', size: 36, width: 320, height: 48, opacity: 0.85
    });

    // SD slot.
    addMesh(part, roundedBoxGeometry(1.5, 0.42, 0.52, 0.04), steel, [3.55, -3.0, -2.3], [0, 0, 0], { edges: false });
    addMesh(part, new THREE.BoxGeometry(1.3, 0.16, 0.1), silicon, [3.55, -3.0, -2.57], [0, 0, 0], { edges: false });

    // Connectors and capacitors.
    [[-2.8, 2.55, 0.5, 0.26], [0.1, 2.55, 0.42, 0.22], [4.2, 2.45, 0.35, 0.2], [-4.1, 0.3, 0.55, 0.3]].forEach(([x, y, w, h]) => {
      addMesh(part, roundedBoxGeometry(w, h, 0.18, 0.03), materialFor(part, 'shell'), [x, y, -2.46], [0, 0, 0], { edges: false });
      addMesh(part, new THREE.BoxGeometry(w * 0.7, 0.03, 0.05), copper, [x, y + h * 0.18, -2.56], [0, 0, 0], { edges: false, cast: false });
    });
    [[-4.35, -0.6], [-4.35, -1.05], [-4.25, -2.9], [1.8, -2.85], [2.4, -2.85]].forEach(([x, y]) => {
      addMesh(part, cylZ(0.12, 0.12, 0.3, 14), steel, [x, y, -2.5], [0, 0, 0], { edges: false });
      addMesh(part, cylZ(0.125, 0.125, 0.02, 14), copper, [x, y, -2.66], [0, 0, 0], { edges: false, cast: false });
    });

    // Flex cables toward the top and sensor.
    const flexMat = new THREE.MeshStandardMaterial({ color: 0x4b3320, roughness: 0.72, metalness: 0.2 });
    part.materials.push(flexMat);
    addMesh(part, new THREE.BoxGeometry(1.55, 0.05, 0.34), flexMat, [-2.6, 3.35, -2.32], [0.15, 0, 0], { edges: false });
    addMesh(part, new THREE.BoxGeometry(0.34, 2.3, 0.05), flexMat, [4.62, 1.0, -2.32], [0, 0, 0], { edges: false });
    addMesh(part, new THREE.BoxGeometry(2.5, 0.05, 0.3), flexMat, [1.4, -3.42, -2.3], [0.08, 0, 0], { edges: false });

    // Board stiffener and mounting screws.
    addMesh(part, roundedBoxGeometry(9.9, 0.16, 0.12, 0.04), steel, [0.5, 3.42, -2.38], [0, 0, 0], { edges: false });
    addMesh(part, roundedBoxGeometry(9.9, 0.16, 0.12, 0.04), steel, [0.5, -4.12, -2.38], [0, 0, 0], { edges: false });
    [[-4.1, 3.0], [4.3, 3.0], [-4.1, -3.65], [4.3, -3.65]].forEach(([x, y]) => {
      addMesh(part, cylZ(0.16, 0.16, 0.03, 16), copper, [x, y, -2.44], [0, 0, 0], { edges: false, cast: false });
    });
  }

  function buildSensor(part) {
    const silicon = materialFor(part, 'silicon');
    const steel = materialFor(part, 'steel');
    const copper = materialFor(part, 'copper');
    const cmos = materialFor(part, 'cmos');
    part.cmosMat = cmos;
    const glass = materialFor(part, 'glass', { opacity: 0.45, transmission: 0.7, roughness: 0.025 });

    // Sensor carrier plate with an opening.
    addPanelXY(part, 5.0, 3.9, 0.18, [{ type: 'rect', cx: 0, cy: 0, w: 3.9, h: 2.72, r: 0.08 }], 0.14, [0.9, 0.25, -0.56], steel, {
      bevel: 0.02,
      edges: true
    });
    addMesh(part, roundedBoxGeometry(4.55, 3.25, 0.22, 0.06), silicon, [0.9, 0.25, -0.38], [0, 0, 0], { edges: false });

    // The imaging die and cover glass face the lens (+Z).
    addPlane(part, 3.6, 2.42, cmos, [0.9, 0.25, -0.2], [0, 0, 0], { pick: false, renderOrder: 3 });
    addPlane(part, 3.72, 2.54, glass, [0.9, 0.25, -0.12], [0, 0, 0], { pick: false, renderOrder: 4 });

    // Gold bond strip and package rim.
    addMesh(part, roundedBoxGeometry(4.2, 0.08, 0.05, 0.02), copper, [0.9, 1.53, -0.24], [0, 0, 0], { edges: false, cast: false });
    addMesh(part, roundedBoxGeometry(4.2, 0.08, 0.05, 0.02), copper, [0.9, -1.03, -0.24], [0, 0, 0], { edges: false, cast: false });
    addMesh(part, roundedBoxGeometry(0.08, 2.56, 0.05, 0.02), copper, [-1.16, 0.25, -0.24], [0, 0, 0], { edges: false, cast: false });
    addMesh(part, roundedBoxGeometry(0.08, 2.56, 0.05, 0.02), copper, [2.96, 0.25, -0.24], [0, 0, 0], { edges: false, cast: false });

    // Piezo dust-reduction ring.
    [[0.9, 1.48, 3.8, 0.06], [0.9, -1.0, 3.8, 0.06], [-1.0, 0.25, 0.06, 2.4], [2.8, 0.25, 0.06, 2.4]].forEach(([x, y, w, h]) => {
      addMesh(part, roundedBoxGeometry(w, h, 0.04, 0.01), steel, [x, y, -0.28], [0, 0, 0], { edges: false, cast: false });
    });

    // Ribbon cable to the main board.
    const flex = new THREE.MeshStandardMaterial({ color: 0x5a3b24, roughness: 0.65, metalness: 0.25 });
    part.materials.push(flex);
    addMesh(part, new THREE.BoxGeometry(2.8, 0.05, 0.55), flex, [0.9, -1.45, -0.48], [0.45, 0, 0], { edges: false });
    addMesh(part, new THREE.BoxGeometry(2.8, 1.1, 0.05), flex, [0.9, -2.02, -0.85], [0, 0, 0], { edges: false });

    // Sensor mounting screws are part of the fastener set, but the seats are modeled.
    [[-1.85, 1.3], [3.65, 1.3], [-1.85, -0.8], [3.65, -0.8]].forEach(([x, y]) => {
      addMesh(part, cylZ(0.14, 0.14, 0.03, 16), copper, [x, y, -0.09], [0, 0, 0], { edges: false, cast: false });
    });

    addTextPlane(part, 'CMOS  35.8 × 23.9 mm', 2.2, 0.2, [0.9, -0.92, -0.09], [0, 0, 0], {
      color: '#8e9aa8', size: 42, width: 512, height: 64, opacity: 0.8
    });
  }

  function buildScrews(part) {
    const screws = [];
    const zAxis = new THREE.Vector3(0, 0, 1);
    const nzAxis = new THREE.Vector3(0, 0, -1);
    const yAxis = new THREE.Vector3(0, 1, 0);
    const nyAxis = new THREE.Vector3(0, -1, 0);
    const xAxis = new THREE.Vector3(1, 0, 0);
    const nxAxis = new THREE.Vector3(-1, 0, 0);

    for (let i = 0; i < 6; i += 1) {
      const a = deg(30 + i * 60);
      screws.push([0.9 + Math.cos(a) * 3.12, 0.25 + Math.sin(a) * 3.12, 4.44, zAxis, 0.34]);
    }
    [[-5.75, 5.46, 2.2], [5.75, 5.46, 2.2], [-5.75, 5.46, -2.1], [5.75, 5.46, -2.1]].forEach(([x, y, z]) => {
      screws.push([x, y, z, yAxis, 0.42]);
    });
    [[-4.9, -5.56, 2.5], [4.9, -5.56, 2.5], [-4.9, -5.56, -2.2], [4.9, -5.56, -2.2]].forEach(([x, y, z]) => {
      screws.push([x, y, z, nyAxis, 0.38]);
    });
    [[-5.8, 4.35, -3.57], [5.8, 4.35, -3.57], [-5.8, -4.35, -3.57], [5.8, -4.35, -3.57]].forEach(([x, y, z]) => {
      screws.push([x, y, z, nzAxis, 0.36]);
    });
    [[-6.0, 3.2, 0], [6.0, 3.2, 0], [-6.0, -3.2, 0], [6.0, -3.2, 0]].forEach(([x, y, z]) => {
      screws.push([x, y, z, x > 0 ? xAxis : nxAxis, 0.34]);
    });
    [[-4.1, 3.0, -2.44], [4.3, 3.0, -2.44], [-4.1, -3.65, -2.44], [4.3, -3.65, -2.44]].forEach(([x, y, z]) => {
      screws.push([x, y, z, nzAxis, 0.3]);
    });

    screws.forEach(([x, y, z, axis, length]) => {
      addScrew(part, [x, y, z], axis, { length, spin: 0.6 + Math.random() * 0.8 });
    });
  }

  const BUILDERS = {
    mount: buildMount,
    frontShell: buildFrontShell,
    backShell: buildBackShell,
    topShell: buildTopShell,
    bottomShell: buildBottomShell,
    grip: buildGrip,
    chassis: buildChassis,
    mirror: buildMirror,
    pentaprism: buildPentaprism,
    focusingScreen: buildFocusingScreen,
    shutterCurtains: buildShutterCurtains,
    shutterDrive: buildShutterDrive,
    mainboard: buildMainboard,
    sensor: buildSensor,
    screws: buildScrews
  };

  /* -----------------------------------------------------------------------
     MODEL ASSEMBLY
     ----------------------------------------------------------------------- */

  CAM.buildModel = function buildModel() {
    const modelGroup = new THREE.Group();
    modelGroup.name = 'EOS_6D_MODEL';
    const parts = [];
    const byId = {};
    const pickMeshes = [];

    DATA.PARTS.forEach((def) => {
      const part = createPart(def);
      if (!BUILDERS[def.id]) throw new Error(`Missing builder for ${def.id}`);
      BUILDERS[def.id](part);
      part.root.traverse((obj) => {
        if (obj.isMesh) {
          obj.userData.partId = part.id;
          if (obj.material) {
            if (!part.materials.includes(obj.material)) {
              part.materials.push(obj.material);
              if (obj.material.emissive && !obj.material.userData.baseEmissive) {
                obj.material.userData.baseEmissive = obj.material.emissive.clone();
                obj.material.userData.baseEmissiveIntensity = obj.material.emissiveIntensity || 0;
              }
            }
          }
        }
      });
      part.pickMeshes = part.pickMeshes.filter((m) => m && m.isMesh);
      modelGroup.add(part.root);
      parts.push(part);
      byId[part.id] = part;
      pickMeshes.push(...part.pickMeshes);
    });

    // Optical anchors follow the animated parts.
    const anchor = (parent, pos) => {
      const obj = new THREE.Object3D();
      obj.position.set(pos[0], pos[1], pos[2]);
      parent.add(obj);
      return obj;
    };
    const anchors = {
      entry: anchor(byId.mount.root, [0, 0, 0.5]),
      mirror: anchor(byId.mirror.root, [0, 0, 0.02]),
      screen: anchor(byId.focusingScreen.root, [0, 0, 0]),
      prism: anchor(byId.pentaprism.root, [0, 0.4, 0]),
      eyepiece: anchor(byId.backShell.root, [0, 3.62, -0.56]),
      sensor: anchor(byId.sensor.root, [0, 0, 0.04]),
      shutter: anchor(byId.shutterCurtains.root, [0, 0, 0.02])
    };

    return { modelGroup, parts, byId, pickMeshes, anchors };
  };

  /* -----------------------------------------------------------------------
     DISPLAY RIG / PARTICLES
     ----------------------------------------------------------------------- */

  CAM.buildDisplayRig = function buildDisplayRig() {
    const rig = new THREE.Group();
    rig.name = 'DISPLAY_RIG';

    const deckMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a0703,
      metalness: 0.86,
      roughness: 0.24,
      transparent: true,
      opacity: 0.84,
      clearcoat: 0.5,
      clearcoatRoughness: 0.3,
      envMapIntensity: 1.2
    });
    const deck = new THREE.Mesh(new THREE.CircleGeometry(12.2, 96), deckMat);
    deck.rotation.x = -Math.PI / 2;
    deck.receiveShadow = true;
    rig.add(deck);

    // Soft contact shadow grounds the floating camera and adds depth.
    const shadowTexture = canvasTexture(512, 512, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 8, w / 2, h / 2, w * 0.48);
      g.addColorStop(0, 'rgba(0,0,0,0.82)');
      g.addColorStop(0.42, 'rgba(0,0,0,0.46)');
      g.addColorStop(0.78, 'rgba(0,0,0,0.12)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
    const contact = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 10),
      new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, opacity: 0.75, depthWrite: false })
    );
    contact.rotation.x = -Math.PI / 2;
    contact.position.set(0, 0.015, 0.2);
    contact.renderOrder = 2;
    rig.add(contact);

    // Warm volumetric halo behind the model.
    const auraTexture = canvasTexture(512, 512, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(255,224,160,0.52)');
      g.addColorStop(0.22, 'rgba(212,175,55,0.24)');
      g.addColorStop(0.55, 'rgba(154,116,34,0.08)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
    const aura = new THREE.Sprite(new THREE.SpriteMaterial({
      map: auraTexture,
      color: 0xffd37a,
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true
    }));
    aura.position.set(0, 8.5, -9.5);
    aura.scale.set(28, 19, 1);
    rig.add(aura);

    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const violetMat = new THREE.MeshBasicMaterial({
      color: 0xb5892f,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const dimMat = new THREE.MeshBasicMaterial({
      color: 0x6b4f18,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const ring = (radius, tube, y, mat) => {
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 6, 160), mat);
      mesh.rotation.x = Math.PI / 2;
      mesh.position.y = y;
      rig.add(mesh);
      return mesh;
    };
    const outerRing = ring(11.25, 0.035, 0.01, ringMat);
    const midRing = ring(10.35, 0.02, 0.02, dimMat);
    const innerRing = ring(9.3, 0.025, 0.03, violetMat);
    ring(6.7, 0.012, 0.02, dimMat);
    ring(4.9, 0.01, 0.02, dimMat);

    const rotating = new THREE.Group();
    rig.add(rotating);
    const arc = new THREE.Mesh(
      new THREE.RingGeometry(10.6, 10.78, 160, 1, 0.4, 1.9),
      new THREE.MeshBasicMaterial({
        color: 0xf0ce6e,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    arc.rotation.x = -Math.PI / 2;
    arc.position.y = 0.04;
    rotating.add(arc);

    const arc2 = new THREE.Mesh(
      new THREE.RingGeometry(11.5, 11.56, 160, 1, 2.8, 0.65),
      new THREE.MeshBasicMaterial({
        color: 0xb5892f,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    arc2.rotation.x = -Math.PI / 2;
    arc2.position.y = 0.045;
    rotating.add(arc2);

    // Tick marks around the rim.
    const tickGroup = new THREE.Group();
    for (let i = 0; i < 70; i += 1) {
      const a = (i / 120) * TAU;
      const h = i % 5 === 0 ? 0.26 : 0.12;
      const tick = new THREE.Mesh(
        new THREE.BoxGeometry(0.022, 0.012, h),
        i % 5 === 0 ? ringMat : dimMat
      );
      tick.position.set(Math.cos(a) * 10.9, 0.035, Math.sin(a) * 10.9);
      tick.rotation.y = -a;
      tickGroup.add(tick);
    }
    rig.add(tickGroup);

    // Label ring marks (N/E/S/W).
    const markMat = new THREE.MeshBasicMaterial({ color: 0x7fe9ff, transparent: true, opacity: 0.55, depthWrite: false });
    for (let i = 0; i < 4; i += 1) {
      const a = (i / 4) * TAU + Math.PI / 4;
      const mark = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.08), markMat);
      mark.position.set(Math.cos(a) * 11.7, 0.04, Math.sin(a) * 11.7);
      mark.rotation.y = -a;
      rig.add(mark);
    }

    // Vertical holo pillars.
    const pillarMat = new THREE.MeshBasicMaterial({
      color: 0xb5892f,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * TAU + 0.25;
      const geo = new THREE.CylinderGeometry(0.012, 0.012, 5.6, 6, 1, true);
      const p = new THREE.Mesh(geo, pillarMat);
      p.position.set(Math.cos(a) * 11.9, 2.8, Math.sin(a) * 11.9);
      rig.add(p);
    }

    // Concentric rings and radial ticks only: no square coordinate grid.

    // Scanning ring for the model (kept outside the rig so it can travel up).
    const scanGroup = new THREE.Group();
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0xf0ce6e,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const scanRing = new THREE.Mesh(new THREE.TorusGeometry(8.0, 0.012, 5, 128), scanMat);
    scanRing.rotation.x = Math.PI / 2;
    scanGroup.add(scanRing);
    const scanDisc = new THREE.Mesh(
      new THREE.CircleGeometry(8.0, 96),
      new THREE.MeshBasicMaterial({
        color: 0xd4af37,
        transparent: true,
        opacity: 0.025,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    scanDisc.rotation.x = -Math.PI / 2;
    scanGroup.add(scanDisc);

    // Floating particles.
    const particleCount = 680;
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    const seeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i += 1) {
      const a = Math.random() * TAU;
      const r = 7.5 + Math.random() * 15;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = -7 + Math.random() * 25;
      positions[i * 3 + 2] = Math.sin(a) * r;
      speeds[i] = 0.12 + Math.random() * 0.6;
      seeds[i] = Math.random() * 100;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffd37a,
      size: 0.055,
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    particles.frustumCulled = false;

    const violetCount = 260;
    const vPositions = new Float32Array(violetCount * 3);
    for (let i = 0; i < violetCount; i += 1) {
      const a = Math.random() * TAU;
      const r = 10 + Math.random() * 13;
      vPositions[i * 3] = Math.cos(a) * r;
      vPositions[i * 3 + 1] = -4 + Math.random() * 20;
      vPositions[i * 3 + 2] = Math.sin(a) * r;
    }
    const violetGeo = new THREE.BufferGeometry();
    violetGeo.setAttribute('position', new THREE.BufferAttribute(vPositions, 3));
    const violetParticles = new THREE.Points(violetGeo, new THREE.PointsMaterial({
      color: 0xc9a24a,
      size: 0.075,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    }));
    violetParticles.frustumCulled = false;

    return {
      group: rig,
      rotating,
      outerRing,
      midRing,
      innerRing,
      scanGroup,
      scanRing,
      scanDisc,
      particles,
      violetParticles,
      aura,
      contact,
      particleData: { positions, speeds, seeds, count: particleCount },
      materials: { ringMat, violetMat, dimMat, scanMat, particleMat }
    };
  };

  CAM.modelUtils = {
    canvasTexture,
    materialFor,
    addMesh,
    addPlane,
    addTextPlane,
    addScrew,
    addGear,
    addSpring,
    addKnurl,
    roundedBoxGeometry,
    roundedRectShape,
    roundedRectPath,
    circlePath,
    extrudeShape,
    profilePrism,
    profileExtrudeZY,
    addPanelXY,
    addPanelZY,
    addPanelXZ,
    cylX,
    cylY,
    cylZ,
    createPart,
    addEdges
  };
})();



























