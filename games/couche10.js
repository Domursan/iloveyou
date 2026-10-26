(function () {
  const N = 10;
  const H = 72; // hauteur d'une case de chiffre (px)

  const CSS = `
  .g10 { position: relative; width: 100%; min-height: 420px; box-sizing: border-box; padding: 26px 16px 28px; display: flex; flex-direction: column; align-items: center; gap: 14px; color: var(--cream); font-family: var(--sans); background: radial-gradient(ellipse at 50% 28%, rgba(110, 20, 35, .42), transparent 68%); }
  .g10 *, .g10 *::before, .g10 *::after { box-sizing: border-box; }
  .g10 button { font: inherit; -webkit-tap-highlight-color: transparent; }
  .g10 button:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
  .g10-lockwrap { width: 100%; display: flex; justify-content: center; padding-top: 6px; }
  .g10-lockwrap.g10-shake { animation: g10-shake .5s linear; }
  .g10-heart { width: min(60vw, 200px); height: auto; aspect-ratio: 200 / 240; display: block; overflow: visible; filter: drop-shadow(0 12px 22px rgba(0, 0, 0, .55)); transition: filter .6s ease; }
  .g10-shackle { transform-box: view-box; transform-origin: 60px 58px; transition: transform .9s cubic-bezier(.3, .7, .2, 1); }
  .g10-body { transition: filter .6s ease; }
  .g10-heart.g10-is-open .g10-shackle { transform: translateY(-30px) rotate(-16deg); }
  .g10-heart.g10-lit { animation: g10-glow 1.4s ease-in-out infinite; }
  .g10-heart.g10-lit .g10-body { filter: brightness(1.3) saturate(1.1); }
  @keyframes g10-glow {
    0%, 100% { filter: drop-shadow(0 0 10px rgba(214, 178, 110, .55)) drop-shadow(0 0 22px rgba(233, 163, 173, .35)); }
    50% { filter: drop-shadow(0 0 22px rgba(214, 178, 110, .95)) drop-shadow(0 0 46px rgba(233, 163, 173, .7)); }
  }
  @keyframes g10-shake {
    0%, 100% { transform: translateX(0); }
    15% { transform: translateX(-9px) rotate(-2deg); }
    30% { transform: translateX(8px) rotate(2deg); }
    45% { transform: translateX(-6px); }
    60% { transform: translateX(5px); }
    80% { transform: translateX(-2px); }
  }
  .g10-hint { margin: 0; max-width: 30ch; text-align: center; font-family: var(--serif); font-style: italic; font-size: 1.3rem; line-height: 1.3; color: var(--blush); }
  .g10-dials { display: flex; gap: 10px; justify-content: center; align-items: center; }
  .g10-dial { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .g10-arrow { width: 60px; min-height: 44px; height: 44px; border-radius: 14px; border: 1px solid var(--line); background: linear-gradient(180deg, var(--wine), var(--bg-2)); color: var(--gold); font-size: 18px; line-height: 1; cursor: pointer; touch-action: manipulation; }
  .g10-arrow:disabled { opacity: .35; cursor: default; }
  .g10-win { position: relative; width: 60px; height: 72px; overflow: hidden; border-radius: 14px; border: 1px solid var(--gold); background: linear-gradient(180deg, #1f070c, #3a0d18 50%, #1f070c); box-shadow: inset 0 0 14px rgba(0, 0, 0, .7), 0 0 0 3px var(--bg-2), 0 0 16px rgba(214, 178, 110, .12); touch-action: none; user-select: none; -webkit-user-select: none; cursor: ns-resize; }
  .g10-win::before { content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none; background: linear-gradient(180deg, rgba(0, 0, 0, .6), transparent 34%, transparent 66%, rgba(0, 0, 0, .6)); }
  .g10-strip { will-change: transform; }
  .g10-dg { height: 72px; line-height: 72px; text-align: center; font-family: var(--serif); font-size: 46px; font-weight: 600; color: var(--cream); text-shadow: 0 0 12px rgba(233, 163, 173, .35); }
  .g10-go { margin-top: 6px; min-height: 48px; padding: 0 28px; border-radius: 999px; border: 1px solid var(--gold); background: linear-gradient(135deg, var(--wine), var(--red)); color: var(--cream); letter-spacing: .22em; text-transform: uppercase; font-size: 14px; cursor: pointer; box-shadow: 0 10px 22px rgba(0, 0, 0, .45), 0 0 18px rgba(214, 178, 110, .14); }
  .g10-go:disabled { opacity: .5; cursor: default; }
  .g10-msg { margin: 0; min-height: 1.5em; text-align: center; font-family: var(--serif); font-style: italic; font-size: 1.1rem; color: var(--rose); }
  .g10-clue { margin: 0; min-height: 1.4em; text-align: center; font-family: var(--serif); font-style: italic; font-size: 1.15rem; color: var(--gold); }
  .g10-tries { margin: 0; font-size: 13px; color: var(--muted); letter-spacing: .05em; }
  .g10-stuck { min-height: 44px; padding: 0 14px; background: none; border: 0; color: var(--muted); text-decoration: underline; text-underline-offset: 3px; font-size: 13px; cursor: pointer; opacity: 0; visibility: hidden; transition: opacity .6s ease; }
  .g10-stuck.on { opacity: 1; visibility: visible; }
  @media (prefers-reduced-motion: reduce) {
    .g10 *, .g10 *::before, .g10 *::after { transition: none !important; animation: none !important; }
  }
  `;

  const HEART = "M100 178 C30 125 12 92 12 62 C12 30 36 12 64 12 C82 12 96 22 100 36 C104 22 118 12 136 12 C164 12 188 30 188 62 C188 92 170 125 100 178 Z";
  const mod = (n, m) => ((n % m) + m) % m;

  window.LAYERS = window.LAYERS || {};
  window.LAYERS[N] = {
    title: "La serrure du cœur",
    hint: "Trouve la combinaison qui ouvre mon cœur.",
    mount(root, ctx) {
      ctx.css(CSS);

      const cfg = ctx.config || {};
      const code = String(cfg.code ?? "0102").replace(/\D/g, "").padEnd(4, "0").slice(0, 4);
      const hintText = cfg.hint ?? "Le jour où tout a commencé… (JJMM)";

      const sfx = (name) => { try { ctx.sfx && ctx.sfx(name); } catch (_) {} };
      const vib = (ms) => { try { ctx.vibrate && ctx.vibrate(ms); } catch (_) {} };

      let alive = true;
      let won = false;
      let finished = false;
      let tries = 0;
      const timers = [];
      const later = (fn, ms) => {
        const id = setTimeout(() => { if (alive) fn(); }, ms);
        timers.push(id);
        return id;
      };

      const wrap = document.createElement("div");
      wrap.className = "g10";
      wrap.innerHTML = `
        <div class="g10-lockwrap">
          <svg class="g10-heart" viewBox="0 -44 200 240" role="img" aria-label="Cadenas en forme de cœur">
            <defs>
              <linearGradient id="g10Body" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#8a1d31"/>
                <stop offset=".55" stop-color="#6e1423"/>
                <stop offset="1" stop-color="#3f0a14"/>
              </linearGradient>
              <linearGradient id="g10Gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#f3dca0"/>
                <stop offset=".5" stop-color="#d6b26e"/>
                <stop offset="1" stop-color="#8f6a2c"/>
              </linearGradient>
            </defs>
            <g class="g10-shackle">
              <path d="M60 58 V6 C60 -34 140 -34 140 6 V58" fill="none" stroke="url(#g10Gold)" stroke-width="16" stroke-linecap="round"/>
            </g>
            <path class="g10-body" d="${HEART}" fill="url(#g10Body)"/>
            <path d="${HEART}" fill="none" stroke="url(#g10Gold)" stroke-width="3" opacity=".7"/>
            <path d="M38 52 C40 36 52 28 66 26" fill="none" stroke="#f6d5d9" stroke-width="6" stroke-linecap="round" opacity=".35"/>
            <ellipse cx="150" cy="104" rx="10" ry="5" fill="#f6d5d9" opacity=".12" transform="rotate(-30 150 104)"/>
            <circle cx="100" cy="78" r="13" fill="#2a0b12"/>
            <path d="M94 86 L106 86 L110 118 L90 118 Z" fill="#2a0b12"/>
          </svg>
        </div>
        <p class="g10-hint"></p>
        <div class="g10-dials"></div>
        <button type="button" class="g10-go">Ouvrir</button>
        <p class="g10-tries"></p>
        <p class="g10-msg" aria-live="polite"></p>
        <p class="g10-clue" aria-live="polite"></p>
        <button type="button" class="g10-stuck">Je suis bloqué·e</button>
      `;
      root.appendChild(wrap);

      const heart = wrap.querySelector(".g10-heart");
      const lockwrap = wrap.querySelector(".g10-lockwrap");
      const btnGo = wrap.querySelector(".g10-go");
      const msg = wrap.querySelector(".g10-msg");
      const clueEl = wrap.querySelector(".g10-clue");
      const tryLine = wrap.querySelector(".g10-tries");
      const stuck = wrap.querySelector(".g10-stuck");
      wrap.querySelector(".g10-hint").textContent = hintText;
      tryLine.textContent = "Essais : 0";

      // ---- Molette à chiffres ----
      function makeDial(i, dialsHost) {
        const col = document.createElement("div");
        col.className = "g10-dial";

        const up = document.createElement("button");
        up.type = "button";
        up.className = "g10-arrow";
        up.textContent = "▲";

        const win = document.createElement("div");
        win.className = "g10-win";
        win.setAttribute("aria-hidden", "true");

        const strip = document.createElement("div");
        strip.className = "g10-strip";
        for (let r = 0; r < 3; r++) {
          for (let d = 0; d < 10; d++) {
            const cell = document.createElement("div");
            cell.className = "g10-dg";
            cell.textContent = String(d);
            strip.appendChild(cell);
          }
        }
        win.appendChild(strip);

        const down = document.createElement("button");
        down.type = "button";
        down.className = "g10-arrow";
        down.textContent = "▼";

        col.append(up, win, down);
        dialsHost.appendChild(col);

        // p : position entière dans la bande (5..15 en régime normal) ; chiffre = p mod 10
        let p = 5;
        let frozen = false;
        let normTimer = 0;
        let drag = null;

        const digit = () => mod(p, 10);
        const place = (anim) => {
          strip.style.transition = anim ? "transform .24s cubic-bezier(.2,.8,.2,1)" : "none";
          strip.style.transform = `translateY(${-(p + 10) * H}px)`;
        };
        const label = () => {
          const d = digit();
          up.setAttribute("aria-label", `Chiffre ${i + 1} : ${d}. Augmenter`);
          down.setAttribute("aria-label", `Chiffre ${i + 1} : ${d}. Diminuer`);
        };
        const scheduleNorm = () => {
          clearTimeout(normTimer);
          normTimer = setTimeout(() => {
            if (p < 5 || p > 15) {
              p = mod(p, 10) + 5; // même chiffre, rendu identique sans animation
              place(false);
            }
          }, 260);
        };
        const move = (n) => {
          if (frozen) return;
          p += n;
          place(true);
          label();
          sfx("tick");
          vib(6);
          scheduleNorm();
        };

        up.addEventListener("click", () => move(1));
        down.addEventListener("click", () => move(-1));

        win.addEventListener("pointerdown", (e) => {
          if (frozen) return;
          e.preventDefault();
          try { win.setPointerCapture(e.pointerId); } catch (_) {}
          clearTimeout(normTimer);
          drag = { y0: e.clientY, p0: p, pf: p, last: p };
          place(false);
        });
        win.addEventListener("pointermove", (e) => {
          if (!drag) return;
          let pf = drag.p0 + (drag.y0 - e.clientY) / H; // glisser vers le haut = chiffre suivant
          if (pf < 3 || pf > 17) {
            const k = Math.floor((pf - 5) / 10) * 10; // décalage multiple de 10 : chiffre inchangé
            pf -= k;
            drag.p0 -= k;
            drag.last -= k;
          }
          drag.pf = pf;
          strip.style.transform = `translateY(${-(pf + 10) * H}px)`;
          const r = Math.round(pf);
          if (r !== drag.last) {
            drag.last = r;
            sfx("tick");
            vib(6);
          }
        });
        const endDrag = () => {
          if (!drag) return;
          p = Math.round(drag.pf);
          drag = null;
          place(true);
          label();
          scheduleNorm();
        };
        win.addEventListener("pointerup", endDrag);
        win.addEventListener("pointercancel", endDrag);

        label();
        place(false);

        return {
          digit,
          freeze() {
            frozen = true;
            up.disabled = true;
            down.disabled = true;
          },
          destroy() {
            clearTimeout(normTimer);
          },
        };
      }

      const dialsHost = wrap.querySelector(".g10-dials");
      const dials = [0, 1, 2, 3].map((i) => makeDial(i, dialsHost));

      // ---- Essais, indices, fin ----
      const finish = () => {
        if (finished) return;
        finished = true;
        alive = false;
        ctx.done();
      };

      const shake = () => {
        lockwrap.classList.remove("g10-shake");
        void lockwrap.offsetWidth; // redémarre l'animation
        lockwrap.classList.add("g10-shake");
      };

      const wrongLines = [
        "Pas tout à fait… réessaie, mon cœur.",
        "Ce n'est pas la bonne combinaison, ma belle.",
        "Encore un essai, tu y es presque.",
      ];

      const clueFor = () => {
        if (tries >= 5) return `Les deux premiers sont ${code[0]}${code[1]}`;
        if (tries >= 3) return `Le premier chiffre est ${code[0]}`;
        return "";
      };

      btnGo.addEventListener("click", () => {
        if (won || !alive) return;
        const attempt = dials.map((d) => String(d.digit())).join("");
        if (attempt === code) {
          won = true;
          dials.forEach((d) => d.freeze());
          btnGo.disabled = true;
          stuck.classList.remove("on");
          heart.classList.add("g10-is-open", "g10-lit");
          msg.textContent = "Mon cœur s'ouvre pour toi… je savais que tu y arriverais.";
          clueEl.textContent = "";
          sfx("win");
          vib(60);
          later(finish, 900);
        } else {
          tries++;
          msg.textContent = wrongLines[(tries - 1) % wrongLines.length];
          clueEl.textContent = clueFor();
          tryLine.textContent = `Essais : ${tries}`;
          shake();
          sfx("bad");
          vib(120);
        }
      });

      // Lien d'aide discret après 60 s
      later(() => { if (!won) stuck.classList.add("on"); }, 60000);
      stuck.addEventListener("click", () => {
        if (won) return;
        finish();
      });

      return function cleanup() {
        alive = false;
        timers.forEach((id) => clearTimeout(id));
        dials.forEach((d) => d.destroy());
        wrap.remove();
      };
    },
  };
})();
