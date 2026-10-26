(function () {
  const N = 5;

  const CSS = `
    .g5 {
      font-family: var(--sans);
      color: var(--cream);
      text-align: center;
      box-sizing: border-box;
      width: 100%;
      min-height: 420px;
      padding: 12px 16px 16px;
    }
    .g5 [hidden] { display: none !important; }
    .g5 .hud {
      max-width: 480px;
      margin: 0 auto 12px;
    }
    .g5 .count {
      margin: 0 0 10px;
      font-family: var(--serif);
      font-style: italic;
      font-size: 20px;
      color: var(--blush);
    }
    .g5 .count strong {
      font-style: normal;
      font-weight: 600;
      color: var(--gold);
    }
    .g5 .bar {
      position: relative;
      height: 10px;
      border-radius: 999px;
      background: var(--bg-2);
      border: 1px solid var(--line);
      overflow: hidden;
    }
    .g5 .fill {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 0%;
      border-radius: 999px;
      background: linear-gradient(90deg, var(--red), var(--rose), var(--gold));
      box-shadow: 0 0 12px rgba(233, 163, 173, .45);
      transition: width .35s ease;
    }
    .g5 .stage {
      position: relative;
      max-width: 480px;
      margin: 0 auto;
      border-radius: 18px;
      overflow: hidden;
      border: 1px solid var(--line);
      background: radial-gradient(120% 90% at 50% 0%, var(--wine) 0%, var(--bg-2) 55%, var(--bg) 100%);
      box-shadow: 0 12px 32px rgba(0, 0, 0, .35), inset 0 0 40px rgba(233, 163, 173, .06);
    }
    .g5 .canvas {
      display: block;
      margin: 0 auto;
      max-width: 100%;
      touch-action: none;
      -webkit-user-select: none;
      user-select: none;
      cursor: pointer;
    }
    .g5 .help {
      margin: 12px 0 0;
      font-size: 14px;
      line-height: 1.5;
      color: var(--muted);
    }
    .g5 .foot {
      min-height: 44px;
      margin-top: 6px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .g5 .stuck {
      min-height: 44px;
      padding: 0 18px;
      border: 1px dashed var(--line);
      border-radius: 999px;
      background: transparent;
      color: var(--rose);
      font: inherit;
      font-size: 15px;
      cursor: pointer;
    }
    .g5 .stuck:hover { border-color: var(--rose); }
    .g5 .stuck:focus-visible {
      outline: 2px solid var(--gold);
      outline-offset: 3px;
    }
  `;

  const TAU = Math.PI * 2;
  const CANVAS_H = 420;
  const MAX_W = 480;
  const MIN_W = 200;
  const STUCK_DELAY = 60000;
  const WIN_HOLD = 0.8;
  const SHAKE_TIME = 0.36;
  const BROKEN_CHANCE = 0.2;
  const BASKET_H = 44;
  const BY = CANVAS_H - BASKET_H - 18; // haut du corps de la coupe
  const CATCH_Y = BY - 6;              // ligne où le cœur est attrapé (bord de la coupe)

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  // Cœur centré sur (x, y), s = échelle (demi-largeur ~ 0.83 s)
  function heartPath(c, x, y, s) {
    c.beginPath();
    c.moveTo(x, y + s * 0.9);
    c.bezierCurveTo(x - s * 1.3, y + s * 0.2, x - s * 0.9, y - s * 0.9, x, y - s * 0.35);
    c.bezierCurveTo(x + s * 0.9, y - s * 0.9, x + s * 1.3, y + s * 0.2, x, y + s * 0.9);
    c.closePath();
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function drawHeart(c, x, y, s, broken, rot) {
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    if (broken) {
      heartPath(c, 0, 0, s);
      const g = c.createLinearGradient(0, -s, 0, s);
      g.addColorStop(0, "#8a7896");
      g.addColorStop(1, "#3d3049");
      c.fillStyle = g;
      c.fill();
      c.lineWidth = 1.2;
      c.strokeStyle = "rgba(200, 185, 215, .55)";
      c.stroke();
      // fissure
      c.beginPath();
      c.moveTo(-s * 0.12, -s * 0.55);
      c.lineTo(s * 0.14, -s * 0.18);
      c.lineTo(-s * 0.06, s * 0.08);
      c.lineTo(s * 0.2, s * 0.5);
      c.strokeStyle = "rgba(246, 213, 217, .8)";
      c.lineWidth = 1.5;
      c.stroke();
    } else {
      heartPath(c, 0, 0, s);
      const g = c.createLinearGradient(0, -s, 0, s);
      g.addColorStop(0, "#f2a7b3");
      g.addColorStop(0.55, "#d13a55");
      g.addColorStop(1, "#8e1429");
      c.shadowColor = "rgba(233, 163, 173, .6)";
      c.shadowBlur = 14;
      c.fillStyle = g;
      c.fill();
      c.shadowBlur = 0;
      c.beginPath();
      c.ellipse(-s * 0.4, -s * 0.25, s * 0.16, s * 0.1, -0.5, 0, TAU);
      c.fillStyle = "rgba(255, 255, 255, .55)";
      c.fill();
    }
    c.restore();
  }

  // Coupe dorée : x = centre, y = haut du corps, w = largeur, h = hauteur du corps
  function drawBasket(c, x, y, w, h, glow) {
    const hw = w / 2;
    c.save();
    c.shadowColor = "rgba(214, 178, 110, " + (0.35 + 0.6 * glow).toFixed(3) + ")";
    c.shadowBlur = 12 + 30 * glow;

    c.beginPath();
    c.moveTo(x - hw, y);
    c.lineTo(x + hw, y);
    c.quadraticCurveTo(x + hw * 0.85, y + h * 0.9, x + hw * 0.4, y + h);
    c.lineTo(x - hw * 0.4, y + h);
    c.quadraticCurveTo(x - hw * 0.85, y + h * 0.9, x - hw, y);
    c.closePath();
    const g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, "#f6dc9c");
    g.addColorStop(0.5, "#d6b26e");
    g.addColorStop(1, "#8c6a31");
    c.fillStyle = g;
    c.fill();
    c.shadowBlur = 0;

    // rebord
    roundRect(c, x - hw - 4, y - 7, w + 8, 10, 5);
    c.fillStyle = "#f3d58f";
    c.fill();

    // reflet
    c.beginPath();
    c.moveTo(x - hw * 0.55, y + 8);
    c.lineTo(x - hw * 0.35, y + h * 0.7);
    c.strokeStyle = "rgba(255, 246, 220, .45)";
    c.lineWidth = 2;
    c.lineCap = "round";
    c.stroke();
    c.restore();
  }

  window.LAYERS = window.LAYERS || {};
  window.LAYERS[N] = {
    title: "Pluie de cœurs",
    hint: "Attrape les cœurs, évite les cœurs brisés.",
    mount(root, ctx) {
      ctx.css(CSS);

      const cfg = (ctx && ctx.config) || {};
      let goal = Math.floor(Number(cfg.goal));
      if (!(goal > 0)) goal = 15;

      const sfx = (name) => {
        try { if (ctx.sfx) ctx.sfx(name); } catch (e) { /* son optionnel */ }
      };
      const vibrate = (ms) => {
        try { if (ctx.vibrate) ctx.vibrate(ms); } catch (e) { /* optionnel */ }
      };

      const wrap = document.createElement("div");
      wrap.className = "g5";
      wrap.innerHTML = `
        <div class="hud">
          <p class="count" aria-live="polite">Cœurs recueillis : <strong class="n">0</strong>/${goal}</p>
          <div class="bar" role="progressbar" aria-label="Progression" aria-valuemin="0" aria-valuemax="${goal}" aria-valuenow="0">
            <div class="fill"></div>
          </div>
        </div>
        <div class="stage">
          <canvas class="canvas" role="img" aria-label="Scène de pluie de cœurs : fais glisser la coupe dorée pour attraper les cœurs"></canvas>
        </div>
        <p class="help">Glisse le doigt sur la scène, ou utilise les flèches ← →. Un cœur raté ne compte pas contre toi.</p>
        <div class="foot"><button type="button" class="stuck" hidden>Je suis bloqué·e</button></div>
      `;
      root.appendChild(wrap);

      const stage = wrap.querySelector(".stage");
      const canvas = wrap.querySelector(".canvas");
      const countEl = wrap.querySelector(".n");
      const bar = wrap.querySelector(".bar");
      const fill = wrap.querySelector(".fill");
      const stuckBtn = wrap.querySelector(".stuck");
      const cx = canvas.getContext("2d");

      let W = 360;
      let dpr = 1;
      let bw = 80;
      let basketX = 180;
      let targetX = 180;
      let score = 0;
      let elapsed = 0;
      let spawnTimer = 0.6;
      let hearts = [];
      let parts = [];
      let floats = [];
      let shakeT = 0;
      let won = false;
      let winT = 0;
      let doneCalled = false;
      let running = true;
      let raf = 0;
      let last = 0;
      let stuckTimer = 0;

      function fit() {
        W = clamp(stage.clientWidth || 360, MIN_W, MAX_W);
        dpr = Math.min(window.devicePixelRatio || 1, 3);
        canvas.style.width = W + "px";
        canvas.style.height = CANVAS_H + "px";
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(CANVAS_H * dpr);
        bw = clamp(W * 0.24, 72, 104);
        basketX = clamp(basketX, bw / 2, W - bw / 2);
        targetX = clamp(targetX, bw / 2, W - bw / 2);
        for (const h of hearts) h.x = clamp(h.x, h.s, W - h.s);
      }

      function finish() {
        if (doneCalled) return;
        doneCalled = true;
        ctx.done();
      }

      function updateHud() {
        countEl.textContent = String(score);
        fill.style.width = Math.min(100, (score / goal) * 100) + "%";
        bar.setAttribute("aria-valuenow", String(score));
      }

      function sparkle(x, y, good) {
        const n = good ? 14 : 8;
        for (let i = 0; i < n; i++) {
          const a = Math.random() * TAU;
          const sp = 60 + Math.random() * 140;
          parts.push({
            x,
            y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp - 80,
            t: 0,
            life: 0.5 + Math.random() * 0.35,
            r: 1.5 + Math.random() * 2.2,
            col: good ? (i % 2 ? "246, 213, 150" : "233, 163, 173") : "150, 130, 165"
          });
        }
      }

      function addFloat(txt, x, y, col) {
        floats.push({ txt, x, y, t: 0, life: 0.8, col });
      }

      function spawn() {
        const s = 16 + Math.random() * 4;
        const speed = Math.min(165, 88 + elapsed * 1.6);
        hearts.push({
          x: s + Math.random() * Math.max(1, W - s * 2),
          y: -s * 1.2,
          s,
          broken: Math.random() < BROKEN_CHANCE,
          vy: speed * (0.9 + Math.random() * 0.2),
          rot: 0,
          ph: Math.random() * TAU
        });
      }

      function spawnGap() {
        return Math.max(0.6, 1.05 - elapsed * 0.012) * (0.85 + Math.random() * 0.3);
      }

      function startWin() {
        won = true;
        winT = 0;
        hearts = [];
        stuckBtn.hidden = true;
        sfx("win");
        vibrate(120);
      }

      function onCatch(h) {
        if (h.broken) {
          score = Math.max(0, score - 2);
          shakeT = SHAKE_TIME;
          sparkle(h.x, BY, false);
          addFloat("−2", h.x, BY - 20, "#e0738a");
          sfx("bad");
          vibrate(40);
        } else {
          score += 1;
          sparkle(h.x, BY, true);
          addFloat("+1", h.x, BY - 20, "#d6b26e");
          sfx("good");
          vibrate(15);
        }
        updateHud();
        if (!won && score >= goal) startWin();
      }

      function update(dt) {
        elapsed += dt;
        basketX += (targetX - basketX) * (1 - Math.exp(-12 * dt));

        if (won) {
          winT += dt;
          if (winT >= WIN_HOLD) {
            finish();
            return;
          }
        } else {
          spawnTimer -= dt;
          if (spawnTimer <= 0) {
            spawn();
            spawnTimer = spawnGap();
          }
        }

        for (let i = hearts.length - 1; i >= 0; i--) {
          const h = hearts[i];
          h.y += h.vy * dt;
          h.rot = Math.sin(elapsed * 2.2 + h.ph) * (h.broken ? 0.3 : 0.14);
          const hitR = h.s * 0.9;
          if (
            h.y + hitR >= CATCH_Y &&
            h.y - hitR <= BY + BASKET_H &&
            Math.abs(h.x - basketX) <= bw / 2 + hitR * 0.4
          ) {
            hearts.splice(i, 1);
            onCatch(h);
            if (won) break;
          } else if (h.y - hitR > BY + BASKET_H) {
            hearts.splice(i, 1); // raté : aucune pénalité
          }
        }

        for (const p of parts) {
          p.t += dt;
          p.vy += 420 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }
        parts = parts.filter((p) => p.t < p.life);

        for (const f of floats) {
          f.t += dt;
          f.y -= 36 * dt;
        }
        floats = floats.filter((f) => f.t < f.life);

        if (shakeT > 0) shakeT = Math.max(0, shakeT - dt);
      }

      function render() {
        cx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cx.clearRect(0, 0, W, CANVAS_H);
        cx.save();

        if (shakeT > 0) {
          const amp = 7 * (shakeT / SHAKE_TIME);
          cx.translate((Math.random() * 2 - 1) * amp, 0);
        }

        const glow = won ? Math.min(1, winT / WIN_HOLD) : 0;

        // lueur au sol autour de la coupe
        const haloA = won ? 0.35 + 0.5 * glow : 0.12;
        const halo = cx.createRadialGradient(basketX, BY + BASKET_H, 4, basketX, BY + BASKET_H, bw * 1.1);
        halo.addColorStop(0, "rgba(214, 178, 110, " + haloA.toFixed(3) + ")");
        halo.addColorStop(1, "rgba(214, 178, 110, 0)");
        cx.fillStyle = halo;
        cx.fillRect(0, 0, W, CANVAS_H);

        for (const h of hearts) drawHeart(cx, h.x, h.y, h.s, h.broken, h.rot);

        for (const p of parts) {
          const a = Math.max(0, 1 - p.t / p.life);
          cx.fillStyle = "rgba(" + p.col + ", " + a.toFixed(3) + ")";
          cx.beginPath();
          cx.arc(p.x, p.y, p.r, 0, TAU);
          cx.fill();
        }

        drawBasket(cx, basketX, BY, bw, BASKET_H, glow);

        cx.font = "600 17px Jost, system-ui, sans-serif";
        cx.textAlign = "center";
        for (const f of floats) {
          cx.globalAlpha = Math.max(0, 1 - f.t / f.life);
          cx.fillStyle = f.col;
          cx.fillText(f.txt, f.x, f.y);
        }
        cx.globalAlpha = 1;

        cx.restore();
      }

      function frame(now) {
        raf = 0;
        if (!running) return;
        const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
        last = now;
        update(dt);
        render();
        if (!doneCalled && running) raf = requestAnimationFrame(frame);
      }

      function onPointer(e) {
        if (doneCalled) return;
        const rect = canvas.getBoundingClientRect();
        if (!rect.width) return;
        const x = (e.clientX - rect.left) * (W / rect.width);
        targetX = clamp(x, bw / 2, W - bw / 2);
      }

      function onKey(e) {
        if (doneCalled) return;
        const step = W * 0.07;
        if (e.key === "ArrowLeft") targetX -= step;
        else if (e.key === "ArrowRight") targetX += step;
        else return;
        e.preventDefault();
        targetX = clamp(targetX, bw / 2, W - bw / 2);
      }

      function onResize() {
        fit();
        render();
      }

      stuckBtn.addEventListener("click", () => {
        if (won || doneCalled) return;
        finish();
      });
      stuckTimer = setTimeout(() => {
        if (!won && !doneCalled) stuckBtn.hidden = false;
      }, STUCK_DELAY);

      fit();
      basketX = W / 2;
      targetX = W / 2;
      updateHud();

      canvas.addEventListener("pointerdown", onPointer);
      canvas.addEventListener("pointermove", onPointer);
      window.addEventListener("keydown", onKey);
      window.addEventListener("resize", onResize);

      last = performance.now();
      raf = requestAnimationFrame(frame);

      return function cleanup() {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        clearTimeout(stuckTimer);
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("resize", onResize);
        canvas.removeEventListener("pointerdown", onPointer);
        canvas.removeEventListener("pointermove", onPointer);
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
      };
    }
  };
})();
