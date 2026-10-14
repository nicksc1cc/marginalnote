/* Marginal Note — generative ink margin sketch
   Concept: behind the page, a hand is always annotating the margins.
   Faint ink loops, underlines, arrows and stray marks draw themselves
   continuously, like marginalia written in real time. Must be VISIBLE
   at rest or the page reads as flat AI-generated paper. */

p5.disableFriendlyErrors = true;

(function () {
  'use strict';

  const CONFIG = {
    seed: 2091,
    strokeAlpha: 30,
    maxStrokes: 90,
    drawSpeed: 0.0016,
    addEveryMin: 5,
    addEveryMax: 22,
    minLength: 110,
    maxLength: 520,
    weightMin: 1.0,
    weightMax: 2.2,
  };

  let strokes = [];
  let pg;
  let lastAdd = 0;
  let totalDrawn = 0;

  function makeStroke(w, h, rng) {
    const nearLeft = rng() < 0.5;
    const nearRight = !nearLeft && rng() < 0.8;
    const vertical = rng() < 0.45;

    const px = nearLeft
      ? Math.floor(w * (0.02 + rng() * 0.12))
      : nearRight
        ? Math.floor(w * (0.84 + rng() * 0.12))
        : Math.floor(w * (0.2 + rng() * 0.6));
    const py = Math.floor(h * (0.04 + rng() * 0.92));

    const len = CONFIG.minLength + rng() * (CONFIG.maxLength - CONFIG.minLength);
    const wobble = 2 + rng() * 4.5;

    const pts = [];
    const steps = 14 + Math.floor(rng() * 16);
    const baseAngle = vertical
      ? (rng() < 0.5 ? -Math.PI / 2 : Math.PI / 2) + (rng() - 0.5) * 0.7
      : (rng() < 0.5 ? Math.PI : 0) + (rng() - 0.5) * 0.7;

    let x = px, y = py;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const prog = len * t;
      const pxo = Math.cos(baseAngle) * prog + Math.sin(t * 7 + rng() * 6) * wobble;
      const pyo = Math.sin(baseAngle) * prog + Math.cos(t * 5 + rng() * 6) * wobble;
      x = px + pxo;
      y = py + pyo;
      pts.push([x, y]);
    }

    return {
      pts,
      t: 0,
      type: rng() < 0.6 ? 'line' : (rng() < 0.5 ? 'underline' : 'arrow'),
      alpha: CONFIG.strokeAlpha * (0.7 + rng() * 0.6),
      weight: CONFIG.weightMin + rng() * (CONFIG.weightMax - CONFIG.weightMin),
    };
  }

  function drawStroke(ctx, s) {
    const n = Math.max(2, Math.floor(s.pts.length * s.t));
    if (n < 2) return;

    ctx.push();
    ctx.strokeWeight(s.weight);
    ctx.strokeCap('round');
    ctx.stroke(105, 70, 38, s.alpha);

    ctx.beginShape();
    for (let i = 0; i < n; i++) {
      ctx.vertex(s.pts[i][0], s.pts[i][1]);
    }
    ctx.endShape();

    if (s.type === 'arrow' && n >= s.pts.length - 2) {
      const a = s.pts[n - 2], b = s.pts[n - 1];
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      const sz = 9;
      ctx.strokeWeight(1.4);
      ctx.line(b[0], b[1], b[0] - Math.cos(ang - 0.5) * sz, b[1] - Math.sin(ang - 0.5) * sz);
      ctx.line(b[0], b[1], b[0] - Math.cos(ang + 0.5) * sz, b[1] - Math.sin(ang + 0.5) * sz);
    }

    ctx.pop();
  }

  const sketch = (p) => {
    p.setup = function () {
      const host = document.getElementById('ink-canvas');
      const w = window.innerWidth, h = window.innerHeight;
      const c = p.createCanvas(w, h);
      c.parent(host);
      p.pixelDensity(1);
      p.randomSeed(CONFIG.seed);
      p.noiseSeed(CONFIG.seed);
      p.background(0, 0, 0, 0);
      pg = p.createGraphics(w, h);
      pg.clear();
      p.strokeCap('round');
    };

    p.draw = function () {
      const w = p.width, h = p.height;

      if (strokes.length < CONFIG.maxStrokes && p.frameCount - lastAdd > CONFIG.addEveryMin + p.random(0, CONFIG.addEveryMax - CONFIG.addEveryMin)) {
        const rng = () => p.random(1);
        strokes.push(makeStroke(w, h, rng));
        lastAdd = p.frameCount;
      }

      for (const s of strokes) {
        if (s.t >= 1) continue;
        s.t = Math.min(1, s.t + CONFIG.drawSpeed);
        pg.push();
        drawStroke(pg, s);
        pg.pop();
        totalDrawn++;
      }

      // slow fade so the page never fills completely
      if (p.frameCount % 180 === 0) {
        const g = pg.drawingContext;
        g.globalCompositeOperation = 'destination-out';
        g.fillStyle = 'rgba(0,0,0,0.02)';
        g.fillRect(0, 0, w, h);
        g.globalCompositeOperation = 'source-over';
      }

      p.clear();
      p.image(pg, 0, 0);

      // debug hook so an agent can verify rendering
      if (window.__inkStats) {
        window.__inkStats = {
          strokes: strokes.length,
          totalDrawn,
          active: strokes.filter(s => s.t < 1).length,
          w, h,
        };
      }
    };

    p.windowResized = function () {
      p.resizeCanvas(window.innerWidth, window.innerHeight);
      if (pg) pg.resizeCanvas(window.innerWidth, window.innerHeight);
    };
  };

  const canvasEl = document.getElementById('ink-canvas');
  window.__inkStats = { strokes: 0, totalDrawn: 0, active: 0, w: 0, h: 0 };
  if (canvasEl && window.matchMedia('(prefers-reduced-motion: reduce)').matches === false) {
    new p5(sketch, canvasEl);
  }
})();