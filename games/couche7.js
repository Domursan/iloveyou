(function () {
  const N = 7;
  const CSS = `
    .g7 {
      position: relative;
      width: 100%;
      min-height: 420px;
      box-sizing: border-box;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      font-family: var(--sans, 'Jost', sans-serif);
      color: var(--cream, #f7ece4);
    }
    .g7 *, .g7 *::before, .g7 *::after { box-sizing: border-box; }

    .g7 .sky {
      position: relative;
      width: min(100%, 340px);
      aspect-ratio: 1 / 1;
      border-radius: 18px;
      overflow: hidden;
      border: 1px solid var(--line, rgba(246,213,217,.18));
      background: radial-gradient(ellipse at 40% 30%, #1d2445 0%, #120a1c 40%, #1f0609 72%, #0b0305 100%);
      box-shadow: 0 18px 40px rgba(0,0,0,.45), inset 0 0 60px rgba(0,0,0,.6), 0 0 30px rgba(214,178,110,.08);
    }

    .g7 .dust {
      position: absolute;
      border-radius: 50%;
      background: var(--blush, #f6d5d9);
      box-shadow: 0 0 4px rgba(246,213,217,.8);
      opacity: .3;
      pointer-events: none;
      animation: g7tw 3s ease-in-out infinite;
    }
    @keyframes g7tw {
      0%, 100% { opacity: .15; transform: scale(.7); }
      50% { opacity: .9; transform: scale(1.2); }
    }

    .g7 .lines {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: visible;
    }
    .g7 .lines polyline {
      fill: none;
      stroke: var(--gold, #d6b26e);
      stroke-width: .5;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 100;
      stroke-dashoffset: 100;
      filter: drop-shadow(0 0 3px rgba(214,178,110,.85));
      transition: stroke-dashoffset .8s ease;
    }
    .g7 .lines.on polyline { stroke-dashoffset: 0; }

    .g7 .star {
      position: absolute;
      width: 56px;
      height: 56px;
      margin: 0;
      padding: 0;
      border: 0;
      background: none;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      cursor: pointer;
      display: grid;
      place-items: center;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .g7 .star:focus-visible {
      outline: 2px solid var(--gold, #d6b26e);
      outline-offset: 3px;
    }
    .g7 .star::before {
      content: "";
      position: absolute;
      inset: -10px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,214,120,.55) 0%, rgba(214,178,110,.18) 45%, transparent 70%);
      opacity: 0;
      transform: scale(.6);
      transition: opacity .25s ease, transform .25s ease;
      pointer-events: none;
    }
    .g7 .star svg {
      width: 40px;
      height: 40px;
      display: block;
      overflow: visible;
      transition: transform .2s ease, filter .2s ease;
    }
    .g7 .star path {
      fill: rgba(246,213,217,.18);
      stroke: var(--rose, #e9a3ad);
      stroke-width: 1;
      stroke-linejoin: round;
      transition: fill .2s ease, stroke .2s ease;
    }
    .g7 .star.on::before { opacity: 1; transform: scale(1); }
    .g7 .star.on path { fill: #ffe39a; stroke: var(--gold, #d6b26e); }
    .g7 .star.on svg { transform: scale(1.08); filter: drop-shadow(0 0 8px rgba(255,214,120,.95)); }
    .g7 .star.press svg { transform: scale(.88); }
    .g7 .star.press path { fill: var(--gold, #d6b26e); }
    .g7 .star.bad::before {
      background: radial-gradient(circle, rgba(255,80,100,.55) 0%, rgba(179,32,58,.2) 45%, transparent 70%);
      opacity: 1;
      transform: scale(1);
    }
    .g7 .star.bad path { fill: var(--red, #b3203a); stroke: #ff6b7f; }
    .g7 .star.bad svg {
      filter: drop-shadow(0 0 8px rgba(255,80,100,.9));
      animation: g7blink .3s ease-in-out 3;
    }
    @keyframes g7blink {
      0%, 100% { opacity: 1; }
      50% { opacity: .25; }
    }

    .g7 .info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      text-align: center;
      min-height: 64px;
    }
    .g7 .round {
      font-family: var(--serif, 'Cormorant Garamond', serif);
      font-style: italic;
      font-size: 20px;
      color: var(--gold, #d6b26e);
      letter-spacing: .02em;
    }
    .g7 .status {
      font-size: 15px;
      color: var(--blush, #f6d5d9);
      min-height: 1.5em;
    }
    .g7 .stuck {
      margin-top: 2px;
      min-height: 44px;
      padding: 10px 18px;
      background: none;
      border: 1px solid var(--line, rgba(246,213,217,.18));
      border-radius: 999px;
      color: var(--muted, #b58a90);
      font: inherit;
      font-size: 14px;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transform: translateY(4px);
      transition: opacity .4s ease, transform .4s ease, visibility .4s;
    }
    .g7 .stuck.show {
      opacity: 1;
      visibility: visible;
      transform: none;
    }
    .g7 .stuck:focus-visible {
      outline: 2px solid var(--gold, #d6b26e);
      outline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      .g7 .dust, .g7 .star svg, .g7 .star.bad svg { animation: none !important; }
      .g7 .star svg, .g7 .star path, .g7 .star::before, .g7 .lines polyline, .g7 .stuck {
        transition: none !important;
      }
    }
  `;

  const DEFAULT_ROUNDS = [3, 4, 5];
  // Les 5 étoiles dessinent un « T » : barre du haut (gauche, centre, droite) puis la tige.
  const POS = [[18, 24], [50, 24], [82, 24], [50, 52], [50, 80]];
  const LINE_ORDER = [0, 1, 2, 1, 3, 4];
  const STEP_ON = 500;
  const STEP_GAP = 200;
  const STUCK_MS = 60000;
  const STAR_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6-4.9-4.6 6.6-.8z"/></svg>';

  window.LAYERS = window.LAYERS || {};
  window.LAYERS[N] = {
    title: "Notre constellation",
    hint: "Regarde les étoiles s'allumer, puis rejoue la séquence.",
    mount(root, ctx) {
      ctx.css(CSS);
      root.classList.add("g7");

      const cfg = ctx.config || {};
      let rounds = Array.isArray(cfg.rounds)
        ? cfg.rounds.map((n) => Math.floor(Number(n))).filter((n) => n > 0 && n < 50)
        : [];
      if (!rounds.length) rounds = DEFAULT_ROUNDS.slice();

      const timers = new Set();
      let alive = true;
      let won = false;
      let locked = true;
      let roundIdx = 0;
      let seq = [];
      let pos = 0;

      const later = (fn, ms) => {
        const id = setTimeout(() => {
          timers.delete(id);
          if (alive) fn();
        }, ms);
        timers.add(id);
        return id;
      };
      const clearAll = () => {
        timers.forEach((id) => clearTimeout(id));
        timers.clear();
      };
      const sfx = (name) => {
        try {
          if (typeof ctx.sfx === "function") ctx.sfx(name);
        } catch (e) { /* son optionnel */ }
      };

      // Décor : points scintillants à positions fixes (générateur pseudo-aléatoire déterministe)
      let seed = 4242;
      const rnd = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };
      const dots = Array.from({ length: 26 }, () => {
        const x = (rnd() * 100).toFixed(1);
        const y = (rnd() * 100).toFixed(1);
        const d = (rnd() * 3).toFixed(2);
        const s = (1 + rnd() * 1.8).toFixed(1);
        return `<span class="dust" aria-hidden="true" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-delay:-${d}s"></span>`;
      }).join("");

      const stars = POS.map(
        ([x, y], k) =>
          `<button type="button" class="star" data-k="${k}" style="left:${x}%;top:${y}%" aria-label="Étoile ${k + 1} sur ${POS.length}">${STAR_SVG}</button>`
      ).join("");
      const linePts = LINE_ORDER.map((k) => POS[k].join(",")).join(" ");

      root.innerHTML = `
        <div class="sky">
          ${dots}
          <svg class="lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline pathLength="100" points="${linePts}"></polyline>
          </svg>
          ${stars}
        </div>
        <div class="info">
          <div class="round"></div>
          <div class="status" role="status" aria-live="polite"></div>
          <button type="button" class="stuck">Je suis bloqué·e</button>
        </div>
      `;

      const starEls = Array.from(root.querySelectorAll(".star"));
      const linesEl = root.querySelector(".lines");
      const roundEl = root.querySelector(".round");
      const statusEl = root.querySelector(".status");
      const stuckBtn = root.querySelector(".stuck");

      const setStatus = (t) => { statusEl.textContent = t; };
      const setRound = () => { roundEl.textContent = `Manche ${roundIdx + 1}/${rounds.length}`; };
      const clearLit = () => starEls.forEach((s) => s.classList.remove("on", "bad", "press"));

      const newSeq = (len) => {
        const out = [];
        for (let i = 0; i < len; i++) {
          const last = out.length ? out[out.length - 1] : -1;
          let k;
          do {
            k = Math.floor(Math.random() * POS.length);
          } while (k === last);
          out.push(k);
        }
        return out;
      };

      const playSeq = () => {
        locked = true;
        pos = 0;
        clearLit();
        setStatus("Observe…");
        seq.forEach((k, i) => {
          const t0 = 600 + i * (STEP_ON + STEP_GAP);
          later(() => {
            starEls[k].classList.add("on");
            sfx("tick");
          }, t0);
          later(() => starEls[k].classList.remove("on"), t0 + STEP_ON);
        });
        later(() => {
          locked = false;
          setStatus("À toi");
        }, 600 + seq.length * (STEP_ON + STEP_GAP));
      };

      const finishWin = () => {
        won = true;
        locked = true;
        stuckBtn.classList.remove("show");
        setStatus("Notre constellation est complète.");
        starEls.forEach((s) => s.classList.add("on"));
        linesEl.classList.add("on");
        later(() => ctx.done(), 800);
      };

      const onRoundWon = () => {
        locked = true;
        sfx("good");
        if (roundIdx + 1 < rounds.length) {
          setStatus("Tu as retenu la séquence.");
          later(() => {
            roundIdx++;
            setRound();
            seq = newSeq(rounds[roundIdx]);
            playSeq();
          }, 900);
        } else {
          finishWin();
        }
      };

      const onWrong = () => {
        locked = true;
        sfx("bad");
        setStatus("Presque… on reprend ensemble.");
        starEls.forEach((s) => {
          s.classList.remove("on", "press");
          s.classList.add("bad");
        });
        later(() => playSeq(), 1100);
      };

      const onPick = (k) => {
        if (locked || won) return;
        const star = starEls[k];
        star.classList.add("press");
        later(() => star.classList.remove("press"), 180);

        if (k === seq[pos]) {
          pos++;
          if (pos >= seq.length) onRoundWon();
        } else {
          onWrong();
        }
      };

      starEls.forEach((btn, k) => btn.addEventListener("click", () => onPick(k)));

      stuckBtn.addEventListener("click", () => {
        if (won) return;
        won = true;
        locked = true;
        clearAll();
        stuckBtn.classList.remove("show");
        ctx.done();
      });

      later(() => {
        if (!won) stuckBtn.classList.add("show");
      }, STUCK_MS);

      setRound();
      seq = newSeq(rounds[0]);
      playSeq();

      return function cleanup() {
        alive = false;
        clearAll();
      };
    }
  };
})();
