/**
 * Keys and Code: intro animation shown before the page.
 * Author: LouisNeval
 *
 * Timeline (seconds):
 *   0.0 - 0.9   a star flares up in the dark
 *   0.5 - 1.7   a glowing orbit appears around it
 *   1.5 - 1.9   the orbit collapses into a terminal prompt
 *   1.8 - 2.9   boot lines are typed: Initializing, Loading, Preparing, Ready
 *   2.9 - 3.75  glitch streaks, the intro fades, the page blurs in
 *
 * Click or press any key to skip. Runs once per page load.
 * Loaded before app.js so that its key listener can swallow the skip key.
 */
'use strict';

(() => {
  const TOTAL = 3.75; // when the intro is removed
  const SKIP_TO = 3.0; // skipping jumps to here, then the fade plays
  const FADE_START = 3.1;
  const FADE_LENGTH = 0.65;
  const TYPE_SPEED = 130; // characters per second
  const TAU = Math.PI * 2;

  const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  /* ------------------------------------------------------------------ helpers */

  const clamp = (x, low = 0, high = 1) => Math.min(high, Math.max(low, x));
  const smooth = (x) => {
    const v = clamp(x);
    return v * v * (3 - 2 * v);
  };
  const easeOut = (x) => 1 - (1 - clamp(x)) ** 3;
  const lerp = (a, b, k) => a + (b - a) * k;

  /** Small seeded random generator, so the stars look the same on every load. */
  const seededRandom = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let n = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    n = (n + Math.imul(n ^ (n >>> 7), 61 | n)) ^ n;
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
  const random = seededRandom(2026);

  /* ----------------------------------------------------------------- elements */

  const overlay = document.createElement('div');
  overlay.className = 'intro';
  overlay.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  const terminal = document.createElement('div');
  terminal.className = 'intro-term';
  overlay.append(canvas, terminal);
  document.body.append(overlay);
  document.body.classList.add('intro-on');

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    overlay.style.setProperty('--fs', `${clamp(width * 0.028, 15, 40)}px`);
  };
  resize();
  window.addEventListener('resize', resize);

  /* -------------------------------------------------------------------- scene */

  const stars = Array.from({ length: 150 }, () => ({
    x: random(),
    y: random(),
    radius: 0.3 + random() * 1.1,
    alpha: 0.25 + random() * 0.6,
    speed: 0.6 + random() * 1.8,
    phase: random() * TAU,
  }));

  const orbitParticles = Array.from({ length: 48 }, () => ({
    behind: 0.05 + random() * 3.6, // how far behind the bright head, in radians
    drift: (random() - 0.5) * 14, // distance from the orbit line, in px
    radius: 0.5 + random() * 1.3,
  }));

  const streaks = Array.from({ length: 9 }, () => ({
    y: 0.3 + random() * 0.6,
    thickness: 3 + random() * 12,
    length: 0.12 + random() * 0.3,
    delay: random() * 0.25,
  }));

  const BOOT_LINES = [
    { text: 'Initializing...', show: 1.8, type: 2.0 },
    { text: 'Loading modules...', show: 2.2, type: 2.2 },
    { text: 'Preparing workspace...', show: 2.35, type: 2.35 },
    { text: 'Ready.', show: 2.65, type: 2.65, final: true },
  ];

  const drawBackground = (t) => {
    ctx.fillStyle = '#03050d';
    ctx.fillRect(0, 0, width, height);
    for (const star of stars) {
      const twinkle = 0.65 + 0.35 * Math.sin(t * star.speed + star.phase);
      ctx.fillStyle = `rgba(170, 195, 255, ${star.alpha * twinkle})`;
      ctx.beginPath();
      ctx.arc(star.x * width, star.y * height, star.radius, 0, TAU);
      ctx.fill();
    }
  };

  /** A thin, pointed light ray (the arms of the star). */
  const drawSpike = (cx, cy, length, thickness, angle, strength) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    const gradient = ctx.createLinearGradient(-length, 0, length, 0);
    gradient.addColorStop(0, 'rgba(120, 160, 255, 0)');
    gradient.addColorStop(0.5, `rgba(225, 235, 255, ${0.95 * strength})`);
    gradient.addColorStop(1, 'rgba(120, 160, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(-length, 0);
    ctx.quadraticCurveTo(0, -thickness, length, 0);
    ctx.quadraticCurveTo(0, thickness, -length, 0);
    ctx.fill();
    ctx.restore();
  };

  const drawStar = (cx, cy, size, strength) => {
    if (strength <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 1.15);
    glow.addColorStop(0, `rgba(200, 218, 255, ${0.9 * strength})`);
    glow.addColorStop(0.18, `rgba(110, 150, 255, ${0.45 * strength})`);
    glow.addColorStop(1, 'rgba(60, 90, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 1.15, 0, TAU);
    ctx.fill();

    drawSpike(cx, cy, size * 2.7, size * 0.06, 0, strength);
    drawSpike(cx, cy, size * 1.8, size * 0.07, Math.PI / 2, strength);

    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.16);
    core.addColorStop(0, `rgba(255, 255, 255, ${strength})`);
    core.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.16, 0, TAU);
    ctx.fill();
    ctx.restore();
  };

  /** A tilted ellipse around the star: the orbit. */
  const makeOrbit = (cx, cy, scale) => {
    const a = Math.min(width * 0.34, height * 0.62) * scale;
    const b = a * 0.36;
    const tilt = -0.32;
    const point = (angle, extra = 0) => {
      const px = (a + extra) * Math.cos(angle);
      const py = (b + extra * 0.34) * Math.sin(angle);
      return {
        x: cx + px * Math.cos(tilt) - py * Math.sin(tilt),
        y: cy + px * Math.sin(tilt) + py * Math.cos(tilt),
      };
    };
    return { point };
  };

  /** A bright comet-like arc that runs along the orbit and fades behind itself. */
  const drawTrail = (orbit, head, length, alpha) => {
    const steps = 48;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(90, 130, 255, 0.9)';
    ctx.shadowBlur = 12;
    for (let i = 0; i < steps; i++) {
      const from = orbit.point(head - length * ((steps - i) / steps));
      const to = orbit.point(head - length * ((steps - i - 1) / steps));
      const f = i / steps;
      ctx.strokeStyle = `rgba(${Math.round(110 + 120 * f)}, ${Math.round(150 + 90 * f)}, 255, ${Math.min(1, alpha * 1.25 * f ** 1.4)})`;
      ctx.lineWidth = 1.2 + 3.8 * f;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawOrbit = (t, cx, cy) => {
    const alpha = smooth((t - 0.45) / 0.4) * (1 - smooth((t - 1.6) / 0.3));
    if (alpha <= 0) return null;
    const scale = 1 - smooth((t - 1.55) / 0.35);
    const orbit = makeOrbit(cx, cy, scale);
    const head = 2.2 + t * 5.2;

    ctx.save();
    ctx.strokeStyle = `rgba(110, 150, 255, ${0.3 * alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const p = orbit.point((i / 120) * TAU);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();

    drawTrail(orbit, head, 2.1, alpha);
    drawTrail(orbit, head + Math.PI, 1.0, alpha * 0.7);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const particle of orbitParticles) {
      const p = orbit.point(head - particle.behind, particle.drift);
      const fade = alpha * (1 - particle.behind / 4.2);
      ctx.fillStyle = `rgba(170, 200, 255, ${fade})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, particle.radius, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    return { orbit, head };
  };

  /** The ">_" symbol rides the orbit, then slides to where the terminal prompt will be. */
  const drawPromptGlyph = (t, orbitInfo) => {
    if (!orbitInfo || t < 1.4 || t > 1.85) return;
    const from = orbitInfo.orbit.point(orbitInfo.head - 0.9);
    const toX = width * 0.115;
    const toY = height * 0.5;
    const k = smooth((t - 1.55) / 0.25);
    const alpha = smooth((t - 1.4) / 0.12) * (1 - smooth((t - 1.68) / 0.09));
    const size = clamp(width * 0.028, 15, 40);
    ctx.save();
    ctx.font = `500 ${lerp(size * 0.55, size, k)}px "JetBrains Mono", monospace`;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = `rgba(200, 215, 255, ${alpha})`;
    ctx.shadowColor = 'rgba(110, 150, 255, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillText('>_', lerp(from.x, toX, k), lerp(from.y, toY, k));
    ctx.restore();
  };

  /** A thin line that shoots out from the prompt to the right. */
  const drawPromptLine = (t) => {
    const alpha = smooth((t - 1.8) / 0.12) * (1 - smooth((t - 2.15) / 0.3));
    if (alpha <= 0) return;
    const y = height * 0.5;
    const startX = width * 0.2;
    const gradient = ctx.createLinearGradient(startX, 0, width * 0.95, 0);
    gradient.addColorStop(0, `rgba(120, 155, 255, ${0.55 * alpha})`);
    gradient.addColorStop(1, 'rgba(120, 155, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(startX, y - 0.5, width * 0.95 - startX, 1);
  };

  /** Blue horizontal streaks that sweep in from the right while the intro leaves. */
  const drawStreaks = (t) => {
    const progress = (t - 2.9) / 0.65;
    if (progress <= 0 || progress >= 1) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const streak of streaks) {
      const k = clamp((progress - streak.delay) / 0.6);
      if (k <= 0) continue;
      const length = width * streak.length * (0.4 + k);
      const x = width - length * Math.min(1, k * 1.4) * 0.9;
      const gradient = ctx.createLinearGradient(x, 0, width, 0);
      gradient.addColorStop(0, 'rgba(80, 120, 255, 0)');
      gradient.addColorStop(1, `rgba(90, 135, 255, ${0.5 * Math.sin(k * Math.PI)})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(x, streak.y * height, width - x, streak.thickness);
    }
    ctx.restore();
  };

  /* ----------------------------------------------------------------- terminal */

  let lastMarkup = '';

  const renderTerminal = (t) => {
    const visible = BOOT_LINES.filter((line) => t >= line.show);
    const markup = visible
      .map((line, index) => {
        const isLast = index === visible.length - 1;
        const typedCount = clamp(Math.floor((t - line.type) * TYPE_SPEED), 0, line.text.length);
        const text = line.text.slice(0, typedCount);
        const finished = typedCount >= line.text.length && t >= line.type + line.text.length / TYPE_SPEED + 0.05;
        const tick = finished && !line.final ? ' <span class="tick">✓</span>' : '';
        const prompt = '<span class="pr">&gt;_</span>';

        if (isLast && t < 2.0) return `<div class="intro-line">${prompt}<span class="caret thin"></span></div>`;
        if (isLast && index === 0 && t < 2.3) {
          return `<div class="intro-line">${prompt}<span class="caret"></span>${text}</div>`;
        }
        const caret = isLast && !tick ? ' <span class="caret"></span>' : isLast && line.final ? ' <span class="caret"></span>' : '';
        return `<div class="intro-line">${prompt} ${text}${tick}${caret}</div>`;
      })
      .join('');

    if (markup !== lastMarkup) {
      terminal.innerHTML = markup;
      lastMarkup = markup;
    }
    overlay.style.setProperty('--shift', String((3 - Math.min(visible.length, 3)) / 2));

    const glitch = t > 2.9 && t < 3.5 ? Math.sin(t * 90) * 6 * (t - 2.9) : 0;
    overlay.style.setProperty('--gx', `${glitch}px`);
    terminal.style.opacity = String(1 - smooth((t - 2.85) / 0.4));
  };

  /* -------------------------------------------------------------------- frame */

  let pageRevealed = false;

  const render = (t) => {
    const cx = width / 2;
    const cy = height / 2;

    drawBackground(t);
    const starSize = 14 + 96 * easeOut(t / 1.0);
    const starStrength = (0.75 + 0.25 * clamp(t / 0.3)) * (1 - smooth((t - 1.55) / 0.35));
    drawStar(cx, cy, starSize, starStrength);
    const orbitInfo = drawOrbit(t, cx, cy);
    drawPromptGlyph(t, orbitInfo);
    drawPromptLine(t);
    drawStreaks(t);
    renderTerminal(t);

    overlay.style.opacity = String(1 - smooth((t - FADE_START) / FADE_LENGTH));
    if (!pageRevealed && t >= FADE_START) {
      pageRevealed = true;
      document.body.classList.remove('intro-on'); // the CSS transition un-blurs the page
    }
  };

  /* ------------------------------------------------------------ run and skip */

  let startedAt = performance.now();
  let frameId = 0;

  const end = () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener('keydown', skip, true);
    window.removeEventListener('resize', resize);
    document.body.classList.remove('intro-on');
    overlay.remove();
  };

  function skip(event) {
    // Keys only skip the intro: stop them from reaching the trainer underneath.
    if (event.type === 'keydown') event.stopImmediatePropagation();
    const t = (performance.now() - startedAt) / 1000;
    if (t < SKIP_TO) startedAt -= (SKIP_TO - t) * 1000;
  }

  const tick = (now) => {
    const t = (now - startedAt) / 1000;
    if (t >= TOTAL) {
      end();
      return;
    }
    render(Math.max(0, t));
    frameId = requestAnimationFrame(tick);
  };

  window.addEventListener('keydown', skip, true);
  overlay.addEventListener('pointerdown', skip);
  frameId = requestAnimationFrame(tick);
})();
