(function () {
  const N = 6;
  const PREFIX = "g6";
  const SIDE = 3;
  const TOTAL = SIDE * SIDE;
  const MIN_MISPLACED = 6;
  const STUCK_MS = 60000;
  const WIN_MS = 800;

  const CSS = `
    .g6, .g6 * { box-sizing: border-box; }
    .g6 {
      display: flex; flex-direction: column; align-items: center; gap: 16px;
      min-height: 420px; padding: 16px; color: var(--cream); font-family: var(--sans);
      -webkit-user-select: none; user-select: none; -webkit-touch-callout: none;
    }
    .g6 [hidden] { display: none !important; }
    .g6-status {
      margin: 0; min-height: 1.4em; font-size: 15px; line-height: 1.4;
      color: var(--muted); text-align: center;
    }
    .g6-stage {
      position: relative; width: min(100%, 360px); border-radius: 16px;
      box-shadow: 0 14px 36px rgba(0, 0, 0, .5), 0 0 0 1px var(--line);
    }
    .g6-board {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
      width: 100%; border-radius: 16px; overflow: hidden;
      transition: gap .6s ease;
    }
    .g6-piece {
      appearance: none; -webkit-appearance: none; margin: 0; padding: 0; border: 0;
      width: 100%; aspect-ratio: 1 / 1; min-height: 44px;
      background-color: var(--wine); background-repeat: no-repeat; background-size: 300% 300%;
      border-radius: 12px; cursor: pointer; position: relative;
      transition: box-shadow .2s ease, border-radius .6s ease;
      touch-action: manipulation; -webkit-tap-highlight-color: transparent;
    }
    .g6-piece.g6-ok { box-shadow: inset 0 0 0 2px rgba(246, 213, 217, .35); }
    .g6-piece.g6-sel {
      outline: 3px solid var(--gold); outline-offset: -3px;
      box-shadow: 0 0 18px rgba(214, 178, 110, .5);
    }
    .g6-piece:focus-visible { outline: 3px solid var(--gold); outline-offset: 2px; }
    .g6-piece.g6-swap { animation: g6-pop .4s ease; }
    .g6-preview {
      position: absolute; inset: 0; z-index: 2; border-radius: 16px;
      background-size: cover; background-position: center; background-repeat: no-repeat;
      box-shadow: inset 0 0 0 2px var(--gold);
      opacity: 0; pointer-events: none; transition: opacity .2s ease;
    }
    .g6-preview.g6-on { opacity: 1; }
    .g6-actions {
      display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; align-items: center;
    }
    .g6-btn {
      min-height: 44px; padding: 10px 20px; border-radius: 16px;
      border: 1px solid var(--line); background: var(--bg-2); color: var(--blush);
      font-family: var(--sans); font-size: 15px; letter-spacing: .04em;
      cursor: pointer; touch-action: none; -webkit-tap-highlight-color: transparent;
      box-shadow: 0 6px 18px rgba(0, 0, 0, .35);
    }
    .g6-btn:active { background: var(--wine); }
    .g6-btn:focus-visible, .g6-stuck:focus-visible {
      outline: 3px solid var(--gold); outline-offset: 2px;
    }
    .g6-stuck {
      min-height: 44px; padding: 8px 12px; border: 0; background: none;
      font-family: var(--sans); font-size: 14px; color: var(--muted);
      text-decoration: underline; text-underline-offset: 3px; cursor: pointer;
      animation: g6-fade .6s ease both;
    }
    .g6-stage.g6-done { animation: g6-glow .8s ease-out both; }
    .g6-stage.g6-done .g6-board { gap: 0; }
    .g6-stage.g6-done .g6-piece {
      border-radius: 0; box-shadow: none !important; outline: none !important;
    }
    @keyframes g6-pop {
      0% { transform: scale(.92); opacity: .55; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes g6-glow {
      0% { box-shadow: 0 0 0 0 rgba(214, 178, 110, 0), 0 14px 36px rgba(0, 0, 0, .5); }
      50% { box-shadow: 0 0 46px 10px rgba(214, 178, 110, .75), 0 14px 36px rgba(0, 0, 0, .5); }
      100% { box-shadow: 0 0 26px 4px rgba(214, 178, 110, .4), 0 14px 36px rgba(0, 0, 0, .5); }
    }
    @keyframes g6-fade { from { opacity: 0; } to { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) {
      .g6, .g6 * { animation: none !important; transition: none !important; }
    }
  `;

  // Image de secours : dégradé bordeaux -> rose, grand cœur doré, « toi & moi ».
  const FALLBACK_SVG =
    "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'>" +
    "<defs>" +
    "<linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>" +
    "<stop offset='0' stop-color='#6e1423'/><stop offset='1' stop-color='#e9a3ad'/>" +
    "</linearGradient>" +
    "<linearGradient id='gd' x1='0' y1='0' x2='1' y2='1'>" +
    "<stop offset='0' stop-color='#f3d98f'/><stop offset='1' stop-color='#d6b26e'/>" +
    "</linearGradient>" +
    "</defs>" +
    "<rect width='300' height='300' fill='url(#bg)'/>" +
    "<path d='M150 232 C 62 172 38 128 38 98 C 38 62 66 40 98 40 C 122 40 140 54 150 72 " +
    "C 160 54 178 40 202 40 C 234 40 262 62 262 98 C 262 128 238 172 150 232 Z' " +
    "fill='url(#gd)' stroke='#f7ece4' stroke-opacity='.5' stroke-width='3'/>" +
    "<text x='150' y='150' text-anchor='middle' font-family='Georgia, serif' font-style='italic' " +
    "font-size='34' fill='#6e1423'>toi &amp; moi</text>" +
    "</svg>";
  const FALLBACK_URL = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(FALLBACK_SVG);

  // Mélange aléatoire, avec au moins MIN_MISPLACED pièces mal placées (donc jamais résolu).
  function shuffledOrder() {
    const ids = [];
    for (let i = 0; i < TOTAL; i++) ids.push(i);
    for (let attempt = 0; attempt < 500; attempt++) {
      for (let i = TOTAL - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = ids[i]; ids[i] = ids[j]; ids[j] = t;
      }
      const misplaced = ids.filter(function (v, i) { return v !== i; }).length;
      if (misplaced >= MIN_MISPLACED) return ids.slice();
    }
    return ids.slice().reverse();
  }

  function isSolved(order) {
    for (let i = 0; i < order.length; i++) {
      if (order[i] !== i) return false;
    }
    return true;
  }

  window.LAYERS = window.LAYERS || {};
  window.LAYERS[N] = {
    title: "Le puzzle",
    hint: "Échange les pièces pour reconstituer l'image.",
    mount(root, ctx) {
      const cfg = ctx.config || {};
      const imageSrc = cfg.image || "images/puzzle.jpg";

      ctx.css(CSS);

      let alive = true;
      let finished = false;
      let selected = -1;
      let order = [];
      let pieces = [];
      const timers = [];

      function sfx(name) {
        try { if (ctx.sfx) ctx.sfx(name); } catch (e) { /* son optionnel */ }
      }

      root.innerHTML =
        '<div class="' + PREFIX + '">' +
          '<p class="' + PREFIX + '-status" aria-live="polite">Chargement de l\'image…</p>' +
          '<div class="' + PREFIX + '-stage">' +
            '<div class="' + PREFIX + '-board"></div>' +
            '<div class="' + PREFIX + '-preview" aria-hidden="true"></div>' +
          '</div>' +
          '<div class="' + PREFIX + '-actions">' +
            '<button type="button" class="' + PREFIX + '-btn ' + PREFIX + '-peek">Voir le modèle</button>' +
          '</div>' +
          '<button type="button" class="' + PREFIX + '-stuck" hidden>Je suis bloqué·e</button>' +
        '</div>';

      const wrap = root.querySelector("." + PREFIX);
      const stage = root.querySelector("." + PREFIX + "-stage");
      const board = root.querySelector("." + PREFIX + "-board");
      const preview = root.querySelector("." + PREFIX + "-preview");
      const status = root.querySelector("." + PREFIX + "-status");
      const peekBtn = root.querySelector("." + PREFIX + "-peek");
      const stuckBtn = root.querySelector("." + PREFIX + "-stuck");

      function render() {
        pieces.forEach(function (b, s) {
          const p = order[s];
          const col = p % SIDE;
          const row = Math.floor(p / SIDE);
          b.style.backgroundPosition = (col * 50) + "% " + (row * 50) + "%";
          b.classList.toggle(PREFIX + "-ok", p === s && !finished);
          b.classList.toggle(PREFIX + "-sel", s === selected);
        });
      }

      function animateSlot(s) {
        const el = pieces[s];
        el.classList.remove(PREFIX + "-swap");
        void el.offsetWidth; // relance l'animation
        el.classList.add(PREFIX + "-swap");
      }

      function win() {
        finished = true;
        selected = -1;
        render();
        stage.classList.add(PREFIX + "-done");
        stuckBtn.hidden = true;
        status.textContent = "Parfait, l'image est reconstituée.";
        sfx("win");
        try { if (ctx.vibrate) ctx.vibrate(120); } catch (e) { /* optionnel */ }
        timers.push(setTimeout(function () {
          if (alive) ctx.done();
        }, WIN_MS));
      }

      function swap(a, b) {
        const t = order[a]; order[a] = order[b]; order[b] = t;
        sfx("tick");
        animateSlot(a);
        animateSlot(b);
        render();
        if (isSolved(order)) win();
      }

      function tap(s) {
        if (!alive || finished || pieces.length === 0) return;
        if (selected < 0) {
          selected = s;
          render();
        } else if (selected === s) {
          selected = -1;
          render();
        } else {
          const a = selected;
          selected = -1;
          swap(a, s);
        }
      }

      function build(url) {
        if (!alive || pieces.length) return;
        order = shuffledOrder();
        preview.style.backgroundImage = 'url("' + url + '")';
        for (let s = 0; s < TOTAL; s++) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = PREFIX + "-piece";
          b.style.backgroundImage = 'url("' + url + '")';
          b.setAttribute("aria-label", "Pièce, ligne " + (Math.floor(s / SIDE) + 1) +
            ", colonne " + ((s % SIDE) + 1));
          b.addEventListener("click", (function (slot) {
            return function () { tap(slot); };
          })(s));
          board.appendChild(b);
          pieces.push(b);
        }
        status.textContent = "Touche une pièce, puis une autre pour les échanger.";
        render();
      }

      // Test de l'image principale ; repli sur l'image générée si absente ou en erreur.
      const probe = new Image();
      probe.onload = function () { if (alive) build(imageSrc); };
      probe.onerror = function () { if (alive) build(FALLBACK_URL); };
      probe.src = imageSrc;

      // Aperçu tant que le bouton est maintenu.
      const showPreview = function () { if (alive) preview.classList.add(PREFIX + "-on"); };
      const hidePreview = function () { preview.classList.remove(PREFIX + "-on"); };
      peekBtn.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        showPreview();
      });
      peekBtn.addEventListener("pointerup", hidePreview);
      peekBtn.addEventListener("pointerleave", hidePreview);
      peekBtn.addEventListener("pointercancel", hidePreview);
      peekBtn.addEventListener("keydown", function (e) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          showPreview();
        }
      });
      peekBtn.addEventListener("keyup", hidePreview);
      peekBtn.addEventListener("contextmenu", function (e) { e.preventDefault(); });

      // Lien de secours après 60 s.
      timers.push(setTimeout(function () {
        if (alive && !finished) stuckBtn.hidden = false;
      }, STUCK_MS));
      stuckBtn.addEventListener("click", function () {
        if (!alive || finished) return;
        finished = true;
        stuckBtn.hidden = true;
        ctx.done();
      });

      return function cleanup() {
        alive = false;
        timers.forEach(function (t) { clearTimeout(t); });
        timers.length = 0;
      };
    }
  };
})();
