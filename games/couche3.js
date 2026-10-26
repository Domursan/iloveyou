(function () {
  const N = 3;

  const CSS = `
    .g3 {
      position: relative;
      width: 100%;
      min-height: 420px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      padding: 16px;
      color: var(--cream);
      font-family: var(--sans);
    }
    .g3 .g3-svg {
      display: block;
      width: 100%;
      max-width: 420px;
      height: auto;
      overflow: visible;
      touch-action: manipulation;
      -webkit-user-select: none;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .g3 .g3-outline {
      fill: none;
      stroke: var(--line);
      stroke-width: 1;
      stroke-dasharray: 2 5;
    }
    .g3 .g3-fill {
      fill-opacity: 0;
      transition: fill-opacity 800ms ease;
    }
    .g3.g3-won .g3-fill {
      fill-opacity: .92;
    }
    .g3 .g3-seg {
      fill: none;
      stroke: var(--red);
      stroke-width: 3;
      stroke-linecap: round;
      transition: stroke-dashoffset 500ms ease;
    }
    .g3 .g3-seg.g3-on {
      stroke-dashoffset: 0 !important;
    }
    .g3 .g3-hit {
      cursor: pointer;
    }
    .g3 .g3-halo {
      fill: none;
      stroke: var(--gold);
      stroke-width: 1.5;
      opacity: 0;
      pointer-events: none;
      transform-box: fill-box;
      transform-origin: center;
    }
    .g3 .g3-pt.g3-next .g3-halo {
      animation: g3-pulse 1.6s ease-in-out infinite;
    }
    .g3 .g3-dot {
      fill: rgba(26, 6, 9, .85);
      stroke: var(--rose);
      stroke-width: 1.5;
      pointer-events: none;
      transition: fill 300ms ease;
    }
    .g3 .g3-hit:focus-visible ~ .g3-dot {
      stroke: var(--gold);
      stroke-width: 2.5;
    }
    .g3 .g3-pt.g3-got .g3-dot {
      fill: var(--wine);
    }
    .g3 .g3-pt.g3-next .g3-dot {
      stroke: var(--gold);
    }
    .g3 .g3-pt.g3-bad .g3-dot {
      animation: g3-blink 500ms ease 2;
    }
    .g3 .g3-num {
      font-family: var(--serif);
      font-size: 11px;
      font-weight: 600;
      fill: var(--cream);
      text-anchor: middle;
      dominant-baseline: central;
      pointer-events: none;
    }
    .g3 .g3-pt.g3-next .g3-num {
      fill: var(--gold);
    }
    .g3 .g3-status {
      margin: 0;
      min-height: 1.3em;
      font: italic 500 20px/1.3 var(--serif);
      color: var(--blush);
      text-align: center;
    }
    .g3 .g3-skip {
      min-height: 44px;
      padding: 10px 14px;
      background: none;
      border: 0;
      color: var(--muted);
      font: 400 15px/1.2 var(--sans);
      text-decoration: underline;
      text-underline-offset: 3px;
      cursor: pointer;
    }
    .g3 .g3-skip:focus-visible {
      outline: 2px solid var(--gold);
      outline-offset: 3px;
      border-radius: 6px;
    }
    @keyframes g3-pulse {
      0%, 100% { opacity: .2; transform: scale(.85); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    @keyframes g3-blink {
      0%, 100% { fill: rgba(26, 6, 9, .85); }
      50% { fill: var(--red); }
    }
    @media (prefers-reduced-motion: reduce) {
      .g3 .g3-pt.g3-next .g3-halo { animation: none; opacity: .9; }
      .g3 .g3-pt.g3-bad .g3-dot { animation: none; }
      .g3 .g3-seg, .g3 .g3-fill, .g3 .g3-dot { transition: none; }
    }
  `;

  const NS = "http://www.w3.org/2000/svg";
  const COUNT = 16;
  const WIN_MS = 800;
  const DEFAULT_SKIP_MS = 60000;

  function svgEl(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    if (attrs) {
      for (const key in attrs) el.setAttribute(key, String(attrs[key]));
    }
    return el;
  }

  // Courbe paramétrique du cœur (coordonnées mathématiques, y vers le haut).
  function heartPoint(t) {
    return {
      x: 16 * Math.pow(Math.sin(t), 3),
      y: 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    };
  }

  function round2(v) {
    return Math.round(v * 100) / 100;
  }

  // Met le cœur à l'échelle et le centre dans le viewBox 300 x 280.
  // Renvoie les 16 points de jeu (départ au creux du cœur) et un contour lissé.
  function layout() {
    const TAU = Math.PI * 2;
    const samples = [];
    for (let k = 0; k < 120; k++) samples.push(heartPoint((TAU * k) / 120));

    let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
    samples.forEach(function (p) {
      if (p.x < xmin) xmin = p.x;
      if (p.x > xmax) xmax = p.x;
      if (p.y < ymin) ymin = p.y;
      if (p.y > ymax) ymax = p.y;
    });

    const W = 300, H = 280, PAD = 38;
    const s = Math.min((W - 2 * PAD) / (xmax - xmin), (H - 2 * PAD) / (ymax - ymin));
    const cx = (xmin + xmax) / 2, cy = (ymin + ymax) / 2;
    const map = function (p) {
      return { x: round2(W / 2 + (p.x - cx) * s), y: round2(H / 2 - (p.y - cy) * s) };
    };

    // Répartition à longueur d'arc égale (évite les points collés près des pointes)
    const fine = [];
    for (let k = 0; k <= 720; k++) fine.push(map(heartPoint((TAU * k) / 720)));
    const cum = [0];
    for (let k = 1; k < fine.length; k++) cum.push(cum[k - 1] + Math.hypot(fine[k].x - fine[k - 1].x, fine[k].y - fine[k - 1].y));
    const total = cum[cum.length - 1];
    const pts = [];
    let j = 0;
    for (let k = 0; k < COUNT; k++) {
      const target = (total * k) / COUNT;
      while (j < cum.length - 1 && cum[j] < target) j++;
      pts.push({ x: round2(fine[j].x), y: round2(fine[j].y) });
    }
    return { pts: pts, outline: samples.map(map) };
  }

  window.LAYERS = window.LAYERS || {};
  window.LAYERS[N] = {
    title: "Le fil rouge",
    hint: "Relie les points dans l'ordre pour tisser notre fil rouge.",
    mount(root, ctx) {
      const cfg = (ctx && ctx.config) || {};
      const SKIP_MS = typeof cfg.skipAfter === "number" ? cfg.skipAfter : DEFAULT_SKIP_MS;
      ctx.css(CSS);

      const uid = "g3-" + Math.random().toString(36).slice(2, 8);
      const layoutData = layout();
      const pts = layoutData.pts;
      const outline = layoutData.outline;

      // ---- DOM ----
      const wrap = document.createElement("div");
      wrap.className = "g3";

      const svg = svgEl("svg", {
        class: "g3-svg",
        viewBox: "0 0 300 280",
        role: "group",
        "aria-label": "Un cœur à relier : touche les points de 1 à 16 dans l'ordre"
      });

      const defs = svgEl("defs");
      const grad = svgEl("linearGradient", { id: uid + "-grad", x1: "0", y1: "0", x2: "0", y2: "1" });
      grad.appendChild(svgEl("stop", { offset: "0", "stop-color": "#e9a3ad" }));
      grad.appendChild(svgEl("stop", { offset: "0.55", "stop-color": "#b3203a" }));
      grad.appendChild(svgEl("stop", { offset: "1", "stop-color": "#6e1423" }));
      defs.appendChild(grad);
      svg.appendChild(defs);

      const heartD = "M " + outline.map(function (p) { return p.x + " " + p.y; }).join(" L ") + " Z";
      svg.appendChild(svgEl("path", { class: "g3-outline", d: heartD }));
      svg.appendChild(svgEl("path", { class: "g3-fill", d: heartD, fill: "url(#" + uid + "-grad)" }));

      // Segments du fil : segs[k] relie le point k-1 au point k (segs[0] = fermeture 16 -> 1).
      const threadG = svgEl("g");
      svg.appendChild(threadG);
      const segs = [];
      for (let k = 0; k < COUNT; k++) {
        const a = pts[(k - 1 + COUNT) % COUNT];
        const b = pts[k];
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        const line = svgEl("line", { class: "g3-seg", x1: a.x, y1: a.y, x2: b.x, y2: b.y });
        line.style.strokeDasharray = len + " " + len;
        line.style.strokeDashoffset = String(len);
        threadG.appendChild(line);
        segs.push(line);
      }

      // Points cliquables : zone de clic invisible (r 22) sous le cercle visible (r 9).
      const pointsG = svgEl("g");
      svg.appendChild(pointsG);
      const pointEls = [];
      pts.forEach(function (p, i) {
        const g = svgEl("g", { class: "g3-pt" });
        const hit = svgEl("circle", {
          class: "g3-hit",
          cx: p.x, cy: p.y, r: 22,
          fill: "transparent",
          tabindex: "0",
          role: "button",
          "aria-label": "Point " + (i + 1)
        });
        const halo = svgEl("circle", { class: "g3-halo", cx: p.x, cy: p.y, r: 14 });
        const dot = svgEl("circle", { class: "g3-dot", cx: p.x, cy: p.y, r: 9 });
        const num = svgEl("text", { class: "g3-num", x: p.x, y: p.y });
        num.textContent = String(i + 1);
        g.appendChild(hit);
        g.appendChild(halo);
        g.appendChild(dot);
        g.appendChild(num);
        pointsG.appendChild(g);
        pointEls.push(g);
      });

      const msg = document.createElement("p");
      msg.className = "g3-status";
      msg.setAttribute("role", "status");
      msg.setAttribute("aria-live", "polite");

      const skip = document.createElement("button");
      skip.type = "button";
      skip.className = "g3-skip";
      skip.textContent = "Je suis bloqué·e";
      skip.hidden = true;

      wrap.appendChild(svg);
      wrap.appendChild(msg);
      wrap.appendChild(skip);
      root.appendChild(wrap);

      // ---- État ----
      let next = 0;
      let won = false;
      let finished = false;
      let alive = true;
      const timers = [];

      function later(fn, ms) {
        const id = setTimeout(fn, ms);
        timers.push(id);
        return id;
      }

      function sfx(name) {
        try { if (ctx.sfx) ctx.sfx(name); } catch (e) { /* son optionnel */ }
      }

      function vib(ms) {
        try { if (ctx.vibrate) ctx.vibrate(ms); } catch (e) { /* vibration optionnelle */ }
      }

      function setNext() {
        pointEls.forEach(function (g, idx) {
          g.classList.toggle("g3-next", idx === next);
        });
      }

      function updateStatus() {
        if (next === 0) {
          msg.textContent = "Le fil commence au creux du cœur. Touche le 1.";
        } else {
          const left = COUNT - next;
          msg.textContent = "Tu as tissé " + next + " point" + (next > 1 ? "s" : "") +
            ". Encore " + left + ", suis la lueur dorée.";
        }
      }

      function win() {
        won = true;
        wrap.classList.add("g3-won");
        segs[0].classList.add("g3-on"); // fermeture du fil : 16 -> 1
        pointEls.forEach(function (g) { g.classList.remove("g3-next"); });
        skip.hidden = true;
        msg.textContent = "Notre fil est bouclé.";
        sfx("win");
        vib(60);
        later(function () {
          if (alive && !finished) {
            finished = true;
            ctx.done();
          }
        }, WIN_MS);
      }

      function wrongTap(g) {
        g.classList.remove("g3-bad");
        void g.getBoundingClientRect(); // redémarre l'animation
        g.classList.add("g3-bad");
        later(function () { g.classList.remove("g3-bad"); }, 1100);
        sfx("bad");
      }

      function press(i) {
        if (won || finished || !alive) return;
        if (i < next) return; // point déjà relié : rien à faire
        const g = pointEls[i];
        if (i !== next) {
          wrongTap(g);
          return;
        }
        g.classList.remove("g3-next");
        g.classList.add("g3-got");
        if (i > 0) segs[i].classList.add("g3-on");
        sfx("tick");
        vib(12);
        next++;
        if (next === COUNT) {
          win();
          return;
        }
        setNext();
        updateStatus();
      }

      pointEls.forEach(function (g, i) {
        const hit = g.firstChild;
        hit.addEventListener("pointerdown", function (e) {
          if (e.button > 0) return;
          press(i);
        });
        hit.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            press(i);
          }
        });
      });

      skip.addEventListener("click", function () {
        if (won || finished || !alive) return;
        finished = true;
        ctx.done();
      });

      later(function () {
        if (alive && !won && !finished) skip.hidden = false;
      }, SKIP_MS);

      setNext();
      updateStatus();

      return function cleanup() {
        alive = false;
        timers.forEach(function (id) { clearTimeout(id); });
      };
    }
  };
})();
