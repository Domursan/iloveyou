(function () {
  const CSS = `
    .g4 {
      box-sizing: border-box;
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
      padding: 14px 16px 24px;
      color: var(--cream);
      font-family: var(--sans);
      text-align: center;
    }
    .g4 [hidden] { display: none !important; }

    .g4-count {
      margin: 0;
      font-size: 12px;
      letter-spacing: .22em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .g4-board { margin-top: 10px; }

    .g4-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 4px;
      margin: 16px auto;
    }
    .g4-slots { --n: 1; min-height: 44px; }
    .g4-pool { --n: 1; min-height: 44px; }

    .g4-slot,
    .g4-tile {
      box-sizing: border-box;
      flex: 0 0 clamp(22px, calc((100% - (var(--n) - 1) * 4px) / var(--n)), 34px);
      height: 44px;
      margin: 0;
    }

    .g4-slot {
      border: 1px dashed var(--line);
      border-radius: 12px;
      background: rgba(42, 11, 18, .55);
    }

    .g4-tile {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border-radius: 12px;
      border: 1px solid rgba(214, 178, 110, .4);
      background: linear-gradient(180deg, #7d1a2b, var(--wine));
      color: var(--cream);
      font-family: var(--serif);
      font-size: 22px;
      font-weight: 700;
      line-height: 1;
      cursor: pointer;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      box-shadow: 0 6px 14px rgba(0, 0, 0, .35), inset 0 1px 0 rgba(255, 255, 255, .08);
      transition: transform .15s ease, border-color .2s ease, box-shadow .2s ease;
    }
    .g4-tile:hover { transform: translateY(-2px); border-color: var(--gold); }
    .g4-tile:active { transform: scale(.95); }
    .g4-placed { background: linear-gradient(180deg, var(--red), var(--wine)); }

    .g4-tile:focus-visible,
    .g4-hintbtn:focus-visible,
    .g4-stuck:focus-visible {
      outline: 2px solid var(--gold);
      outline-offset: 3px;
    }

    .g4-slots.g4-win .g4-slot,
    .g4-slots.g4-win .g4-tile {
      background: linear-gradient(180deg, #f6dc9f, var(--gold));
      border: 1px solid var(--gold);
      color: #2a0b12;
      box-shadow: 0 0 18px rgba(214, 178, 110, .65);
      transform: none;
    }
    .g4-slots.g4-bad { animation: g4-shake .5s ease; }
    .g4-slots.g4-bad .g4-tile { border-color: var(--red); }

    @keyframes g4-shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(8px); }
      60% { transform: translateX(-6px); }
      80% { transform: translateX(4px); }
    }

    .g4-actions {
      display: flex;
      justify-content: center;
      margin-top: 4px;
    }
    .g4-hintbtn {
      min-width: 44px;
      min-height: 44px;
      padding: 0 20px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: transparent;
      color: var(--muted);
      font-family: var(--sans);
      font-size: 14px;
      letter-spacing: .12em;
      text-transform: uppercase;
      cursor: pointer;
      touch-action: manipulation;
    }
    .g4-hintbtn:hover {
      color: var(--rose);
      border-color: rgba(233, 163, 173, .45);
    }

    .g4-msg {
      min-height: 26px;
      margin: 14px 0 0;
      font-family: var(--serif);
      font-style: italic;
      font-size: 20px;
      color: var(--rose);
    }

    .g4-final {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 260px;
    }
    .g4-word {
      margin: 0;
      font-family: var(--serif);
      font-style: italic;
      font-weight: 800;
      font-size: 30px;
      color: var(--blush);
      text-shadow: 0 0 18px rgba(214, 178, 110, .35);
      animation: g4-in .6s ease both;
    }
    .g4-word:nth-child(2) { animation-delay: .1s; }
    .g4-word:nth-child(3) { animation-delay: .2s; }

    @keyframes g4-in {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: none; }
    }

    .g4-stuck {
      display: block;
      margin: 22px auto 0;
      min-height: 44px;
      padding: 0 12px;
      background: none;
      border: none;
      color: var(--muted);
      font-family: var(--sans);
      font-size: 13px;
      text-decoration: underline;
      text-underline-offset: 4px;
      cursor: pointer;
    }

    @media (prefers-reduced-motion: reduce) {
      .g4, .g4 * { animation: none !important; transition: none !important; }
    }
  `;

  const DEFAULT_WORDS = ["NOUS", "TOUJOURS", "TENDRESSE"];

  window.LAYERS = window.LAYERS || {};
  window.LAYERS[4] = {
    title: "Les mots doux",
    hint: "Remets les lettres dans l'ordre.",
    mount(root, ctx) {
      ctx.css(CSS);

      const cfg = ctx.config || {};
      const given = Array.isArray(cfg.words)
        ? cfg.words.map((w) => String(w).trim()).filter(Boolean)
        : [];
      const words = given.length ? given : DEFAULT_WORDS.slice();

      const norm = (s) =>
        String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
      const same = (a, b) => norm(a) === norm(b);
      const lettersOf = (w) => Array.from(w.replace(/\s+/g, "").toUpperCase());

      let alive = true;
      let busy = false;
      let finished = false;
      let doneSent = false;
      let idx = 0;
      let target = [];
      let slots = [];
      let pool = [];
      const timers = [];

      const later = (fn, ms) => {
        timers.push(setTimeout(() => { if (alive) fn(); }, ms));
      };
      const sfx = (name) => { try { if (ctx.sfx) ctx.sfx(name); } catch (e) { /* son optionnel */ } };
      const buzz = (ms) => { try { if (ctx.vibrate) ctx.vibrate(ms); } catch (e) { /* vibration optionnelle */ } };
      const mk = (tag, cls) => {
        const el = document.createElement(tag);
        el.className = cls;
        return el;
      };

      root.innerHTML = `
        <div class="g4">
          <p class="g4-count" aria-live="polite"></p>
          <div class="g4-board">
            <div class="g4-row g4-slots" role="group" aria-label="Cases du mot"></div>
            <div class="g4-row g4-pool" role="group" aria-label="Lettres mélangées"></div>
            <div class="g4-actions">
              <button type="button" class="g4-hintbtn">Indice</button>
            </div>
            <p class="g4-msg" aria-live="polite"></p>
          </div>
          <div class="g4-final" hidden></div>
          <button type="button" class="g4-stuck" hidden>Je suis bloqué·e</button>
        </div>
      `;

      const countEl = root.querySelector(".g4-count");
      const board = root.querySelector(".g4-board");
      const slotsEl = root.querySelector(".g4-slots");
      const poolEl = root.querySelector(".g4-pool");
      const hintBtn = root.querySelector(".g4-hintbtn");
      const msgEl = root.querySelector(".g4-msg");
      const finalEl = root.querySelector(".g4-final");
      const stuckBtn = root.querySelector(".g4-stuck");

      const setMsg = (t) => { msgEl.textContent = t || ""; };

      // Mélange garanti différent du mot (si c'est possible).
      function shuffled(chars) {
        const key = norm(chars.join(""));
        for (let t = 0; t < 40; t++) {
          const a = chars.slice();
          for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
          }
          if (norm(a.join("")) !== key) return a;
        }
        const rot = chars.slice(1).concat(chars.slice(0, 1));
        if (norm(rot.join("")) !== key) return rot;
        return chars.slice(); // toutes les lettres identiques : rien à mélanger
      }

      function render() {
        const n = String(target.length);
        slotsEl.style.setProperty("--n", n);
        poolEl.style.setProperty("--n", n);
        slotsEl.textContent = "";
        poolEl.textContent = "";

        slots.forEach((tile, i) => {
          if (tile) {
            const b = mk("button", "g4-tile g4-placed");
            b.type = "button";
            b.textContent = tile.ch;
            b.setAttribute("aria-label", `Lettre ${tile.ch}, toucher pour la renvoyer`);
            b.addEventListener("click", () => unplace(i));
            slotsEl.appendChild(b);
          } else {
            slotsEl.appendChild(mk("span", "g4-slot"));
          }
        });

        pool.forEach((tile) => {
          const b = mk("button", "g4-tile");
          b.type = "button";
          b.textContent = tile.ch;
          b.setAttribute("aria-label", `Lettre ${tile.ch}`);
          b.addEventListener("click", () => placeTile(tile.id));
          poolEl.appendChild(b);
        });
      }

      // Renvoie la lettre de la case i dans le tas.
      function giveBack(i) {
        const t = slots[i];
        if (!t) return;
        slots[i] = null;
        pool.push(t);
        pool.sort((a, b) => a.pos - b.pos);
      }

      function placeTile(id) {
        if (!alive || busy || finished) return;
        const i = slots.indexOf(null);
        const k = pool.findIndex((t) => t.id === id);
        if (i < 0 || k < 0) return;
        slots[i] = pool.splice(k, 1)[0];
        sfx("tick");
        render();
        check();
      }

      function unplace(i) {
        if (!alive || busy || finished || !slots[i]) return;
        giveBack(i);
        sfx("tick");
        render();
      }

      function complete() {
        if (doneSent) return;
        doneSent = true;
        finished = true;
        ctx.done();
      }

      function finish() {
        finished = true;
        board.hidden = true;
        stuckBtn.hidden = true;
        countEl.textContent = `Mot ${words.length}/${words.length}`;
        finalEl.textContent = "";
        words.forEach((w) => {
          const p = mk("p", "g4-word");
          p.textContent = w;
          finalEl.appendChild(p);
        });
        finalEl.hidden = false;
        later(complete, 800);
      }

      function nextWord() {
        idx += 1;
        if (idx < words.length) setupWord(idx);
        else finish();
      }

      function check() {
        if (slots.some((t) => !t)) return;
        busy = true;
        const ok = slots.every((t, i) => same(t.ch, target[i]));
        if (ok) {
          slotsEl.classList.add("g4-win");
          setMsg("Oui… c'est exactement ça.");
          sfx("good");
          buzz(30);
          later(nextWord, 700);
        } else {
          slotsEl.classList.add("g4-bad");
          setMsg("Presque… laisse-les retrouver leur place.");
          sfx("bad");
          buzz(60);
          later(() => {
            slotsEl.classList.remove("g4-bad");
            slots.forEach((_, i) => giveBack(i));
            setMsg("");
            busy = false;
            render();
          }, 600);
        }
      }

      // Indice : place la bonne première lettre qui manque ou est mal placée.
      function hint() {
        if (!alive || busy || finished) return;
        const i = target.findIndex((c, k) => !slots[k] || !same(slots[k].ch, c));
        if (i < 0) return;
        giveBack(i);
        const want = target[i];
        let k = pool.findIndex((t) => t.ch === want);
        if (k < 0) k = pool.findIndex((t) => same(t.ch, want));
        if (k < 0) {
          const j = slots.findIndex(
            (t, x) => x !== i && t && same(t.ch, want) && !same(t.ch, target[x])
          );
          if (j >= 0) {
            giveBack(j);
            k = pool.findIndex((t) => same(t.ch, want));
          }
        }
        if (k >= 0) slots[i] = pool.splice(k, 1)[0];
        sfx("tick");
        setMsg("Une lettre retrouve sa place…");
        render();
        check();
      }

      function setupWord(k) {
        target = lettersOf(words[k]);
        slots = target.map(() => null);
        pool = shuffled(target).map((ch, pos) => ({ id: pos, ch, pos }));
        busy = false;
        slotsEl.classList.remove("g4-win", "g4-bad");
        countEl.textContent = `Mot ${k + 1}/${words.length}`;
        setMsg("");
        render();
      }

      hintBtn.addEventListener("click", hint);
      stuckBtn.addEventListener("click", () => {
        if (!finished && !doneSent) complete();
      });
      later(() => { if (!finished) stuckBtn.hidden = false; }, 60000);

      setupWord(0);

      return function cleanup() {
        alive = false;
        timers.forEach((t) => clearTimeout(t));
        timers.length = 0;
        root.textContent = "";
      };
    }
  };
})();
