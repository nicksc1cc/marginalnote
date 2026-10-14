/* Marginal Note — generative ink margin sketch
   Concept: behind the page, a hand is always annotating the margins
   with a pen. Strokes must be visible at rest: warm dark-brown ink,
   targeted at the left margin + right edge where a reader's eye goes,
   drawn continuously. Some strokes pre-spawned so the page is never bare. */

p5.disableFriendlyErrors = true;

(function () {
  'use strict';

  const CONFIG = {
    seed: 2091,
    strokeAlpha: 58,          // visible pen ink, not a ghost
    maxStrokes: 46,
    drawSpeed: 0.0022,
    addEveryMin: 12,          // slow steady drip after the initial burst
    addEveryMax: 40,
    initialBurst: 12,         // strokes already on page at load
    minLength: 90,
    maxLength: 480,
    weightMin: 1.2,
    weightMax: 2.6,
    marginBias: 0.75,         // 75% of strokes live in the margins
  };

  let strokes = [];
  let pg;
  let lastAdd = 0;
  let totalDrawn = 0;
  let burstDone = false;

  function makeStroke(w, h, rng) {
    // margins: left 18%, right 14%; occasionally wander into the text gutters
    const inMargin = rng() < CONFIG.marginBias;
    const nearLeft = inMargin ? (rng() < 0.62) : (rng() < 0.3);
    const vertical = rng() < 0.5;

    let px;
    if (nearLeft) px = Math.floor(w * (0.055 + rng() * 0.10));   // left margin
    else if (inMargin) px = Math.floor(w * (0.87 + rng() * 0.09)); // right margin
    else px = Math.floor(w * (0.18 + rng() * 0.6));               // mid-page, rare

    const py = Math.floor(h * (0.03 + rng() * 0.9) * (nearLeft ? 1 : 1));

    const len = CONFIG.minLength + rng() * (CONFIG.maxLength - CONFIG.minLength);
    const wobble = 2.4 + rng() * 4.5;

    const pts = [];
    const steps = 14 + Math.floor(rng() * 16);
    const baseAngle = vertical
      ? (rng() < 0.5 ? -Math.PI / 2 : Math.PI / 2) + (rng() - 0.5) * 0.75
      : (rng() < 0.5 ? Math.PI : 0) + (rng() - 0.5) * 0.75;

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
      type: rng() < 0.62 ? 'line' : (rng() < 0.5 ? 'underline' : 'arrow'),
      alpha: CONFIG.strokeAlpha * (0.65 + rng() * 0.5),
      weight: CONFIG.weightMin + rng() * (CONFIG.weightMax - CONFIG.weightMin),
    };
  }

  function drawStroke(ctx, s) {
    const n = Math.max(2, Math.floor(s.pts.length * s.t));
    if (n < 2) return;

    ctx.push();
    ctx.strokeWeight(s.weight);
    ctx.strokeCap('round');
    ctx.stroke(120, 82, 44, s.alpha);

    ctx.beginShape();
    for (let i = 0; i < n; i++) {
      ctx.vertex(s.pts[i][0], s.pts[i][1]);
    }
    ctx.endShape();

    if (s.type === 'arrow' && n >= s.pts.length - 2) {
      const a = s.pts[n - 2], b = s.pts[n - 1];
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      const sz = 11;
      ctx.strokeWeight(1.6);
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

      // Pre-spawn a burst so the page has ink immediately
      const rng = () => p.random(1);
      for (let i = 0; i < CONFIG.initialBurst; i++) {
        strokes.push(makeStroke(w, h, rng));
      }
    };

    p.draw = function () {
      const w = p.width, h = p.height;

      if (!burstDone && strokes.length) {
        burstDone = true;
      }

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

      // gentle fade: alpha-erode towards transparent so the page never fills
      if (p.frameCount % 300 === 0) {
        const g = pg.drawingContext;
        g.globalCompositeOperation = 'destination-out';
        g.fillStyle = 'rgba(0,0,0,0.025)';
        g.fillRect(0, 0, w, h);
        g.globalCompositeOperation = 'source-over';
      }

      p.clear();
      p.image(pg, 0, 0);

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