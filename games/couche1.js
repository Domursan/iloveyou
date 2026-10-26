(function () {
  const CSS = `
    .g1 {
      position: relative;
      width: 100%;
      min-height: 420px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      padding: 24px 16px 28px;
      box-sizing: border-box;
      color: var(--cream);
      font-family: var(--sans);
      text-align: center;
      overflow: hidden;
      -webkit-user-select: none;
      user-select: none;
    }
    .g1 *, .g1 *::before, .g1 *::after { box-sizing: border-box; }

    .g1-stage {
      position: relative;
      width: min(240px, 66vw);
      height: min(240px, 66vw);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .g1-stage.g1-shake { animation: g1-shake 0.42s ease; }
    @keyframes g1-shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-10px); }
      40% { transform: translateX(9px); }
      60% { transform: translateX(-6px); }
      80% { transform: translateX(4px); }
    }

    .g1-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(233, 163, 173, 0.55) 0%, rgba(233, 163, 173, 0.18) 45%, rgba(233, 163, 173, 0) 70%);
      pointer-events: none;
      opacity: 0;
    }

    .g1-heart-btn {
      position: relative;
      z-index: 1;
      width: min(200px, 56vw);
      height: min(200px, 56vw);
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: none;
      cursor: pointer;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      transform-origin: 50% 50%;
      will-change: transform;
    }
    .g1-heart-btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 8px; }

    .g1-heart {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
      filter: drop-shadow(0 10px 30px rgba(179, 32, 58, 0.55)) drop-shadow(0 0 18px rgba(233, 163, 173, 0.35));
    }
    .g1-heart path {
      fill: var(--red);
      stroke: rgba(233, 163, 173, 0.35);
      stroke-width: 0.4;
      transition: fill 0.8s ease, stroke 0.8s ease;
    }
    .g1-won .g1-heart path { fill: var(--gold); stroke: rgba(247, 236, 228, 0.7); }
    .g1-won .g1-heart {
      filter: drop-shadow(0 0 26px rgba(214, 178, 110, 0.85)) drop-shadow(0 0 60px rgba(214, 178, 110, 0.5));
      transition: filter 0.8s ease;
    }

    .g1-spark {
      position: absolute;
      left: 0;
      top: 0;
      width: 8px;
      height: 8px;
      margin: -4px 0 0 -4px;
      border-radius: 50%;
      background: var(--gold);
      box-shadow: 0 0 10px var(--gold);
      pointer-events: none;
      z-index: 2;
      animation: g1-spark 0.7s ease-out forwards;
    }
    @keyframes g1-spark {
      from { transform: translate(0, 0) scale(1); opacity: 1; }
      to { transform: translate(var(--dx), var(--dy)) scale(0.2); opacity: 0; }
    }

    .g1-feedback {
      min-height: 1.8em;
      margin: 0;
      font-family: var(--serif);
      font-style: italic;
      font-size: clamp(20px, 5vw, 26px);
      color: var(--blush);
    }
    .g1-feedback.g1-bad { color: var(--muted); }
    .g1-feedback.g1-pop { animation: g1-pop 0.35s ease; }
    @keyframes g1-pop {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: none; }
    }

    .g1-dots {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .g1-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 1px solid rgba(233, 163, 173, 0.5);
      background: transparent;
      transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
    }
    .g1-dot.g1-on {
      background: var(--rose);
      border-color: var(--rose);
      box-shadow: 0 0 12px rgba(233, 163, 173, 0.7);
      transform: scale(1.12);
    }

    .g1-count, .g1-help {
      margin: 0;
      font-size: 14px;
      color: var(--muted);
      letter-spacing: 0.04em;
    }

    .g1-stuck {
      min-height: 44px;
      margin-top: 8px;
      padding: 10px 18px;
      border: 0;
      background: none;
      color: var(--muted);
      font: inherit;
      font-size: 14px;
      text-decoration: underline;
      text-underline-offset: 4px;
      cursor: pointer;
    }
    .g1-stuck[hidden] { display: none; }
    .g1-stuck.g1-show { animation: g1-pop 0.6s ease; }
    .g1-stuck:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; border-radius: 6px; }

    @media (prefers-reduced-motion: reduce) {
      .g1 .g1-stage.g1-shake, .g1 .g1-feedback.g1-pop, .g1 .g1-spark { animation: none; }
    }
  `;

  window.LAYERS = window.LAYERS || {};
  window.LAYERS[1] = {
    title: "Le cœur qui bat",
    hint: "Touche le cœur pile au moment où il bat.",
    mount(root, ctx) {
      ctx.css(CSS);

      const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
      const cfg = ctx.config || {};
      const BPM = clamp(Number(cfg.bpm) || 72, 30, 200);
      const HITS = clamp(Math.round(Number(cfg.hits) || 8), 1, 20);
      const PERIOD = 60000 / BPM;
      const WIN = 200;          // tolérance en ms de part et d'autre d'un battement
      const LEAD = 1200;        // délai avant le premier battement
      const T0 = performance.now() + LEAD;

      const timers = new Set();
      let raf = 0;
      let dead = false;
      let finished = false;
      let won = false;
      let streak = 0;
      let lastOk = -1;          // index du dernier battement déjà réussi

      const dotsHtml = Array.from({ length: HITS }, () => '<li class="g1-dot"></li>').join("");
      const wrap = document.createElement("div");
      wrap.className = "g1";
      wrap.innerHTML =
        '<div class="g1-stage">' +
          '<div class="g1-ring"></div>' +
          '<button type="button" class="g1-heart-btn" aria-label="Le cœur. Touche-le au moment où il bat.">' +
            '<svg class="g1-heart" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
              '<path d="M12 21s-7.5-4.6-9.6-9.1C.9 8.6 2.6 4.5 6.4 4.5c2.1 0 3.4 1.1 4.1 2.2h3c.7-1.1 2-2.2 4.1-2.2 3.8 0 5.5 4.1 4 7.4C19.5 16.4 12 21 12 21z"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +
        '<p class="g1-feedback" aria-live="polite"></p>' +
        '<ul class="g1-dots" aria-label="Réussites d\'affilée">' + dotsHtml + '</ul>' +
        '<p class="g1-count"></p>' +
        '<p class="g1-help">Touche le cœur ou appuie sur la barre espace.</p>' +
        '<button type="button" class="g1-stuck" hidden>Je suis bloqué·e</button>';
      root.appendChild(wrap);

      const stage = wrap.querySelector(".g1-stage");
      const heart = wrap.querySelector(".g1-heart-btn");
      const ring = wrap.querySelector(".g1-ring");
      const fb = wrap.querySelector(".g1-feedback");
      const dots = wrap.querySelectorAll(".g1-dot");
      const countEl = wrap.querySelector(".g1-count");
      const stuck = wrap.querySelector(".g1-stuck");

      const later = (fn, ms) => {
        const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
        timers.add(id);
        return id;
      };
      const sfx = (name) => { try { if (ctx.sfx) ctx.sfx(name); } catch (_) { /* son optionnel */ } };
      const buzz = (ms) => { try { if (ctx.vibrate) ctx.vibrate(ms); } catch (_) { /* vibration optionnelle */ } };

      const updateCount = () => { countEl.textContent = "Série : " + streak + " / " + HITS; };
      updateCount();

      const setFeedback = (text, bad) => {
        fb.textContent = text;
        fb.classList.toggle("g1-bad", !!bad);
        fb.classList.remove("g1-pop");
        void fb.offsetWidth;
        fb.classList.add("g1-pop");
      };

      const spark = (cx, cy) => {
        const r = stage.getBoundingClientRect();
        const x = cx - r.left;
        const y = cy - r.top;
        for (let i = 0; i < 8; i++) {
          const s = document.createElement("span");
          s.className = "g1-spark";
          const a = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
          const dist = 40 + Math.random() * 30;
          s.style.left = x + "px";
          s.style.top = y + "px";
          s.style.setProperty("--dx", (Math.cos(a) * dist).toFixed(1) + "px");
          s.style.setProperty("--dy", (Math.sin(a) * dist).toFixed(1) + "px");
          stage.appendChild(s);
          later(() => s.remove(), 750);
        }
      };

      const shake = () => {
        stage.classList.remove("g1-shake");
        void stage.offsetWidth;
        stage.classList.add("g1-shake");
        later(() => stage.classList.remove("g1-shake"), 450);
      };

      const finish = () => {
        if (finished) return;
        finished = true;
        ctx.done();
      };

      const win = () => {
        won = true;
        wrap.classList.add("g1-won");
        setFeedback("Il bat pour toi.", false);
        sfx("win");
        buzz(120);
        later(finish, 800);
      };

      // Rythme : le battement k tombe sur T0 + k * PERIOD.
      // Animation pilotée par requestAnimationFrame à partir de performance.now().
      const frame = () => {
        if (dead) return;
        const since = performance.now() - T0;
        if (since >= 0) {
          const k = Math.floor(since / PERIOD);
          const e = since - k * PERIOD;           // ms écoulées depuis le dernier battement
          const pulse = Math.max(0, 1 - e / 300);
          heart.style.transform = "scale(" + (1 + 0.18 * pulse * pulse).toFixed(4) + ")";
          const rl = Math.min(700, PERIOD);
          const rp = e / rl;
          ring.style.opacity = rp < 1 ? (0.85 * (1 - rp)).toFixed(3) : "0";
          ring.style.transform = "scale(" + (1 + 0.6 * Math.min(1, rp)).toFixed(3) + ")";
        }
        raf = requestAnimationFrame(frame);
      };

      // Un tap (souris, tactile, clavier) : jugé contre le battement le plus proche.
      const tap = (now, cx, cy) => {
        if (dead || finished || won) return;
        const since = now - T0;
        let k = Math.round(since / PERIOD);
        if (k < 0) k = 0;
        const d = since - k * PERIOD;             // < 0 : tap avant le battement
        if (k === lastOk) return;                 // déjà réussi sur ce battement (double tap)

        if (Math.abs(d) <= WIN) {
          lastOk = k;
          streak += 1;
          dots[streak - 1].classList.add("g1-on");
          updateCount();
          setFeedback("Parfait", false);
          sfx("good");
          buzz(15);
          if (cx === undefined) {
            const hr = heart.getBoundingClientRect();
            cx = hr.left + hr.width / 2;
            cy = hr.top + hr.height / 2;
          }
          spark(cx, cy);
          if (streak >= HITS) win();
        } else {
          streak = 0;
          dots.forEach((dot) => dot.classList.remove("g1-on"));
          updateCount();
          setFeedback(d < 0 ? "Un peu tôt" : "Un peu tard", true);
          sfx("bad");
          buzz(40);
          shake();
        }
      };

      const onPointer = (e) => tap(performance.now(), e.clientX, e.clientY);
      const onHeartKey = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (!e.repeat) tap(performance.now());
        }
      };
      const onKey = (e) => {
        if (e.code !== "Space" && e.key !== " ") return;
        if (e.target && e.target.closest && e.target.closest(".g1-stuck")) return;
        e.preventDefault();
        if (e.repeat) return;
        tap(performance.now());
      };

      heart.addEventListener("pointerdown", onPointer);
      heart.addEventListener("keydown", onHeartKey);
      window.addEventListener("keydown", onKey);

      stuck.addEventListener("click", () => {
        if (finished || won) return;
        won = true;
        finish();
      });
      later(() => {
        if (finished || won) return;
        stuck.hidden = false;
        stuck.classList.add("g1-show");
      }, 60000);

      raf = requestAnimationFrame(frame);

      return function cleanup() {
        dead = true;
        cancelAnimationFrame(raf);
        window.removeEventListener("keydown", onKey);
        timers.forEach((id) => clearTimeout(id));
        timers.clear();
      };
    }
  };
})();
