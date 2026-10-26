(function () {
  const N = 2;

  const CSS = `
    .g2 {
      font-family: var(--sans);
      color: var(--cream);
      text-align: center;
      box-sizing: border-box;
      width: 100%;
      min-height: 420px;
      padding: 12px 16px 16px;
    }
    .g2 [hidden] { display: none !important; }
    .g2 .count {
      margin: 4px 0 18px;
      font-family: var(--serif);
      font-style: italic;
      font-size: 20px;
      color: var(--blush);
    }
    .g2 .count strong {
      font-style: normal;
      font-weight: 600;
      color: var(--gold);
    }
    .g2 .grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      max-width: 460px;
      margin: 0 auto;
    }
    @media (max-width: 479px) {
      .g2 .grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
      }
    }
    .g2 .card {
      position: relative;
      display: block;
      width: 100%;
      aspect-ratio: 3 / 4;
      min-height: 44px;
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: 14px;
      background: none;
      cursor: pointer;
      perspective: 900px;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .g2 .card:focus-visible {
      outline: 2px solid var(--gold);
      outline-offset: 3px;
    }
    .g2 .inner {
      position: absolute;
      inset: 0;
      transform-style: preserve-3d;
      transition: transform 0.55s cubic-bezier(0.2, 0.7, 0.2, 1);
    }
    .g2 .card.up .inner { transform: rotateY(180deg); }
    .g2 .side {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 14px;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    .g2 .dos {
      background: radial-gradient(circle at 50% 30%, #8c1d32 0%, var(--wine) 55%, #460c18 100%);
      box-shadow:
        inset 0 0 0 1px rgba(214, 178, 110, 0.55),
        inset 0 0 0 5px var(--wine),
        inset 0 0 0 6px rgba(214, 178, 110, 0.28),
        0 8px 18px rgba(0, 0, 0, 0.4);
    }
    .g2 .dos::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 14px;
      background-image: radial-gradient(rgba(214, 178, 110, 0.12) 1px, transparent 1.5px);
      background-size: 9px 9px;
    }
    .g2 .card:not(.up):hover .dos { filter: brightness(1.12); }
    .g2 .heart {
      position: relative;
      display: block;
      width: 20px;
      height: 16px;
    }
    .g2 .heart::before,
    .g2 .heart::after {
      content: "";
      position: absolute;
      top: 0;
      left: 10px;
      width: 10px;
      height: 16px;
      border-radius: 10px 10px 0 0;
      background: linear-gradient(135deg, #f3dc9c, var(--gold) 60%, #a8833f);
      transform: rotate(-45deg);
      transform-origin: 0 100%;
    }
    .g2 .heart::after {
      left: 0;
      transform: rotate(45deg);
      transform-origin: 100% 100%;
    }
    .g2 .face {
      transform: rotateY(180deg);
      background: linear-gradient(160deg, #fffaf5 0%, var(--cream) 70%, #ecd9cf 100%);
      color: #2a0b12;
      font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
      font-size: clamp(28px, 8vw, 44px);
      line-height: 1;
      box-shadow:
        inset 0 0 0 1px rgba(214, 178, 110, 0.6),
        0 8px 18px rgba(0, 0, 0, 0.35);
    }
    .g2 .face { overflow: hidden; }
    .g2 .face .pic {
      width: 100%; height: 100%; object-fit: cover; display: block;
      border-radius: inherit; pointer-events: none;
    }
    .g2 .card.ok .face {
      animation: g2-glow 1.6s ease-in-out infinite;
    }
    @keyframes g2-glow {
      0%, 100% {
        box-shadow:
          inset 0 0 0 2px var(--gold),
          0 0 0 2px rgba(214, 178, 110, 0.5),
          0 0 18px 2px rgba(214, 178, 110, 0.35);
      }
      50% {
        box-shadow:
          inset 0 0 0 2px var(--gold),
          0 0 0 2px rgba(214, 178, 110, 0.7),
          0 0 30px 8px rgba(214, 178, 110, 0.6);
      }
    }
    .g2 .card.wave .inner {
      animation: g2-wave 0.45s ease-in-out both;
      animation-delay: calc(var(--i, 0) * 30ms);
    }
    @keyframes g2-wave {
      0%, 100% { transform: translateY(0) rotateY(180deg); }
      50% { transform: translateY(-10px) rotateY(180deg); }
    }
    .g2 .foot { min-height: 44px; }
    .g2 .stuck {
      min-height: 44px;
      margin-top: 18px;
      padding: 10px 16px;
      border: 0;
      background: none;
      color: var(--muted);
      font: inherit;
      font-size: 15px;
      text-decoration: underline;
      text-underline-offset: 4px;
      cursor: pointer;
    }
    .g2 .stuck:focus-visible {
      outline: 2px solid var(--gold);
      outline-offset: 2px;
      border-radius: 8px;
    }
    @media (prefers-reduced-motion: reduce) {
      .g2 .inner { transition-duration: 0.01s; }
      .g2 .card.wave .inner { animation: none; }
      .g2 .card.ok .face { animation: none; }
    }
  `;

  const DEFAULT_SYMBOLS = ["☕", "🎬", "🌙", "🎵", "🌹", "✈️"];

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }

  window.LAYERS = window.LAYERS || {};
  window.LAYERS[N] = {
    title: "Nos souvenirs",
    hint: "Retrouve les paires de nos petits bonheurs.",
    mount(root, ctx) {
      ctx.css(CSS);

      const cfg = (ctx && ctx.config) || {};
      let symbols = Array.isArray(cfg.symbols)
        ? cfg.symbols.filter((s) => typeof s === "string" && s.length > 0)
        : [];
      if (symbols.length < 6) symbols = DEFAULT_SYMBOLS.slice();
      symbols = symbols.slice(0, 6);
      const PAIRS = symbols.length;
      // Photos optionnelles : une par paire ; si une photo manque, l'emoji correspondant reste.
      const photos = Array.isArray(cfg.photos) ? cfg.photos.slice(0, PAIRS) : [];

      const sfx = (name) => {
        try { if (ctx.sfx) ctx.sfx(name); } catch (e) { /* son optionnel */ }
      };
      const vibrate = (ms) => {
        try { if (ctx.vibrate) ctx.vibrate(ms); } catch (e) { /* optionnel */ }
      };

      const wrap = document.createElement("div");
      wrap.className = "g2";
      wrap.innerHTML = `
        <p class="count" aria-live="polite">Paires trouvées : <strong class="n">0</strong>/${PAIRS}</p>
        <div class="grid"></div>
        <div class="foot"><button type="button" class="stuck" hidden>Je suis bloqué·e</button></div>
      `;
      root.appendChild(wrap);

      const grid = wrap.querySelector(".grid");
      const countEl = wrap.querySelector(".n");
      const stuckBtn = wrap.querySelector(".stuck");

      const deck = shuffle(
        symbols.flatMap((sym, k) => [
          { sym, pair: k },
          { sym, pair: k }
        ])
      );

      let first = null;
      let locked = false;
      let found = 0;
      let finished = false;
      let doneCalled = false;
      const timers = [];
      const later = (fn, ms) => {
        const t = setTimeout(fn, ms);
        timers.push(t);
        return t;
      };

      const cards = deck.map((item, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "card";
        btn.setAttribute("aria-label", "Carte cachée " + (idx + 1));
        btn.style.setProperty("--i", idx);
        btn.innerHTML =
          '<span class="inner">' +
            '<span class="side dos" aria-hidden="true"><span class="heart"></span></span>' +
            '<span class="side face" aria-hidden="true"></span>' +
          '</span>';
        const face = btn.querySelector(".face");
        face.textContent = item.sym;
        const photo = photos[item.pair];
        if (photo) {
          const img = new Image();
          img.alt = "";
          img.className = "pic";
          img.onload = () => { face.textContent = ""; face.appendChild(img); };
          img.src = photo;
        }
        grid.appendChild(btn);
        return { el: btn, sym: item.sym, pair: item.pair, idx, up: false, ok: false };
      });

      function setUp(card, up) {
        card.up = up;
        card.el.classList.toggle("up", up);
        card.el.setAttribute(
          "aria-label",
          up ? "Carte " + (card.idx + 1) + " : " + card.sym : "Carte cachée " + (card.idx + 1)
        );
      }

      function finish() {
        if (doneCalled) return;
        doneCalled = true;
        ctx.done();
      }

      function win() {
        finished = true;
        stuckBtn.hidden = true;
        cards.forEach((c, i) => {
          c.el.style.setProperty("--i", i);
          c.el.classList.add("wave");
        });
        sfx("win");
        vibrate(120);
        later(finish, 800);
      }

      function onPick(card) {
        if (finished || locked || card.up || card.ok) return;

        setUp(card, true);
        sfx("tick");

        if (!first) {
          first = card;
          return;
        }

        const a = first;
        const b = card;
        first = null;

        if (a.pair === b.pair) {
          a.ok = true;
          b.ok = true;
          a.el.classList.add("ok");
          b.el.classList.add("ok");
          found++;
          countEl.textContent = String(found);
          sfx("good");
          vibrate(30);
          if (found === PAIRS) win();
        } else {
          locked = true;
          sfx("bad");
          vibrate(20);
          later(() => {
            setUp(a, false);
            setUp(b, false);
            locked = false;
          }, 800);
        }
      }

      cards.forEach((card) => {
        card.el.addEventListener("click", () => onPick(card));
      });

      stuckBtn.addEventListener("click", () => {
        if (finished) return;
        finished = true;
        finish();
      });

      later(() => {
        if (!finished) stuckBtn.hidden = false;
      }, 60000);

      return function cleanup() {
        timers.forEach((t) => clearTimeout(t));
        timers.length = 0;
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
      };
    }
  };
})();
