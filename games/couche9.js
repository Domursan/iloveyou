(function () {
  const N = 9;

  const CSS = `
    .g9 {
      box-sizing: border-box;
      width: 100%;
      min-height: 420px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      padding: 20px 16px;
      color: var(--cream);
      font-family: var(--sans);
    }
    .g9 .g9-cap {
      margin: 0;
      font-family: var(--serif);
      font-style: italic;
      font-size: 18px;
      color: var(--rose);
      text-align: center;
    }
    .g9 .g9-stage {
      position: relative;
      width: min(100%, 380px);
    }
    .g9 .g9-card {
      position: relative;
      width: 100%;
      height: 260px;
      border-radius: 16px;
      overflow: hidden;
      background: var(--cream);
      box-shadow: 0 18px 40px rgba(0, 0, 0, .45), 0 0 0 1px var(--line), 0 0 34px rgba(214, 178, 110, .16);
      animation: g9-in .6s ease both;
    }
    .g9 .g9-under {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding: 24px;
      background: radial-gradient(circle at 30% 20%, #fffaf3 0%, var(--cream) 60%, #ecd9cf 100%);
    }
    .g9 .g9-text {
      margin: 0;
      font-family: var(--serif);
      font-style: italic;
      font-weight: 500;
      font-size: clamp(24px, 6.4vw, 34px);
      line-height: 1.25;
      color: var(--wine);
      text-align: center;
      white-space: pre-line;
      overflow-wrap: anywhere;
    }
    .g9 .g9-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      border-radius: 16px;
      touch-action: none;
      cursor: crosshair;
      user-select: none;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent;
      transition: opacity 700ms ease;
    }
    .g9 .g9-fx {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 0;
      height: 0;
      pointer-events: none;
      z-index: 2;
    }
    .g9 .g9-spark {
      position: absolute;
      left: -3px;
      top: -3px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: radial-gradient(circle, #fff6d6 0%, var(--gold) 60%, transparent 100%);
      box-shadow: 0 0 8px rgba(214, 178, 110, .9);
      animation: g9-spark .9s ease-out both;
    }
    .g9 .g9-gauge {
      width: min(100%, 380px);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .g9 .g9-track {
      position: relative;
      flex: 1;
      height: 8px;
      border-radius: 99px;
      background: var(--line);
      overflow: hidden;
    }
    .g9 .g9-fill {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 0%;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--gold), var(--blush));
      box-shadow: 0 0 10px rgba(214, 178, 110, .6);
      transition: width .2s ease;
    }
    .g9 .g9-pct {
      min-width: 3.2em;
      text-align: right;
      font-size: 13px;
      color: var(--muted);
      letter-spacing: .04em;
      font-variant-numeric: tabular-nums;
    }
    .g9 .g9-stuck {
      min-height: 44px;
      padding: 10px 16px;
      margin-top: 2px;
      background: none;
      border: 0;
      color: var(--muted);
      font: inherit;
      font-family: var(--sans);
      font-size: 14px;
      text-decoration: underline;
      text-underline-offset: 4px;
      cursor: pointer;
      animation: g9-in .4s ease both;
    }
    .g9 .g9-stuck[hidden] {
      display: none;
    }
    .g9 .g9-stuck:focus-visible {
      outline: 2px solid var(--gold);
      outline-offset: 3px;
      border-radius: 6px;
    }
    @keyframes g9-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: none; }
    }
    @keyframes g9-spark {
      from { opacity: 1; transform: translate(0, 0) scale(1); }
      to { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(.3); }
    }
  `;

  const DEFAULT_TEXT = "Tu es ma plus belle évidence.";
  const THRESHOLD = 60;     // % gratté pour réussir
  const BRUSH = 22;         // rayon du pinceau (CSS px)
  const STEP = 8;           // espacement de la grille d'échantillonnage (CSS px)
  const SAMPLE_MS = 150;
  const TICK_MS = 120;
  const STUCK_MS = 60000;
  const DONE_DELAY_MS = 700 + 800;

  // Dessine la surface dorée métallisée (coordonnées CSS px, transform déjà réglé)
  function paintGold(g, w, h, sans) {
    g.save();

    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#7a5a26");
    grad.addColorStop(0.25, "#d6b26e");
    grad.addColorStop(0.5, "#f7e7bd");
    grad.addColorStop(0.7, "#b98e45");
    grad.addColorStop(0.85, "#e3c27f");
    grad.addColorStop(1, "#8a6530");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);

    const shine = g.createRadialGradient(w * 0.3, h * 0.25, 4, w * 0.3, h * 0.25, w * 0.75);
    shine.addColorStop(0, "rgba(255,250,235,.55)");
    shine.addColorStop(1, "rgba(255,250,235,0)");
    g.fillStyle = shine;
    g.fillRect(0, 0, w, h);

    // fines stries métalliques
    g.lineWidth = 0.6;
    for (let x = -h, i = 0; x < w + h; x += 5, i++) {
      g.strokeStyle = i % 3 === 0 ? "rgba(255,248,225,.16)" : "rgba(80,50,15,.10)";
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + h, h);
      g.stroke();
    }

    // grain
    for (let i = 0; i < 700; i++) {
      g.fillStyle = Math.random() < 0.5 ? "rgba(255,255,255,.12)" : "rgba(60,35,10,.12)";
      g.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }

    // inscription
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = "600 16px " + sans;
    if ("letterSpacing" in g) g.letterSpacing = "2px";
    g.fillStyle = "rgba(255,248,225,.5)";
    g.fillText("grattez ici ♥", w / 2, h / 2 + 1);
    g.fillStyle = "#4a2a0c";
    g.fillText("grattez ici ♥", w / 2, h / 2);

    g.restore();
  }

  function mount(root, ctx) {
    ctx.css(CSS);

    const text = (ctx.config && ctx.config.text) || DEFAULT_TEXT;

    root.innerHTML = `
      <div class="g9">
        <p class="g9-cap">Gratte doucement, ta lettre attend d'être lue.</p>
        <div class="g9-stage">
          <div class="g9-card">
            <div class="g9-under"><p class="g9-text"></p></div>
            <canvas class="g9-canvas" role="img" aria-label="Lettre recouverte de cire dorée à gratter"></canvas>
          </div>
          <div class="g9-fx"></div>
        </div>
        <div class="g9-gauge">
          <div class="g9-track" role="progressbar" aria-label="Lettre révélée" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
            <div class="g9-fill"></div>
          </div>
          <span class="g9-pct">0 %</span>
        </div>
        <button type="button" class="g9-stuck" hidden>Je suis bloqué·e</button>
      </div>
    `;

    const q = (sel) => root.querySelector(sel);
    q(".g9-text").textContent = text;

    const card = q(".g9-card");
    const canvas = q(".g9-canvas");
    const fx = q(".g9-fx");
    const track = q(".g9-track");
    const fill = q(".g9-fill");
    const pctEl = q(".g9-pct");
    const stuckBtn = q(".g9-stuck");

    // Canvas : résolution réelle = taille CSS x devicePixelRatio (plafonné à 2 pour les perfs)
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = card.clientWidth || 328;
    const cssH = card.clientHeight || 260;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const g = canvas.getContext("2d", { willReadFrequently: true });
    g.setTransform(dpr, 0, 0, dpr, 0, 0);

    const sans = (getComputedStyle(root).getPropertyValue("--sans") || "").trim() || "Jost, sans-serif";
    paintGold(g, cssW, cssH, sans);

    let drawing = false;
    let finished = false;
    let doneCalled = false;
    let last = null;
    let lastTick = 0;
    let pct = 0;
    let sampleTimer = 0;
    let stuckTimer = 0;
    let doneTimer = 0;

    function callDone() {
      if (doneCalled) return;
      doneCalled = true;
      ctx.done();
    }

    function setPct(v) {
      pct = Math.max(pct, v);
      fill.style.width = pct + "%";
      pctEl.textContent = pct + " %";
      track.setAttribute("aria-valuenow", String(pct));
    }

    function pos(e) {
      const r = canvas.getBoundingClientRect();
      const sx = r.width ? cssW / r.width : 1;
      const sy = r.height ? cssH / r.height : 1;
      return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
    }

    function scratch(a, b) {
      g.save();
      g.globalCompositeOperation = "destination-out";
      g.strokeStyle = "#000";
      g.fillStyle = "#000";
      g.lineWidth = BRUSH * 2;
      g.lineCap = "round";
      g.lineJoin = "round";
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.stroke();
      g.beginPath();
      g.arc(b.x, b.y, BRUSH, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }

    function tickSound(now) {
      if (now - lastTick >= TICK_MS) {
        lastTick = now;
        ctx.sfx("tick");
      }
    }

    function stopSampling() {
      if (sampleTimer) {
        clearInterval(sampleTimer);
        sampleTimer = 0;
      }
    }

    // Échantillonne une grille espacée de STEP px et calcule le % de pixels grattés
    function sample() {
      if (finished) return;
      const W = canvas.width;
      const H = canvas.height;
      const data = g.getImageData(0, 0, W, H).data;
      const step = STEP * dpr;
      let total = 0;
      let cleared = 0;
      for (let y = step / 2; y < H; y += step) {
        for (let x = step / 2; x < W; x += step) {
          total++;
          const idx = (Math.floor(y) * W + Math.floor(x)) * 4 + 3;
          if (data[idx] < 128) cleared++;
        }
      }
      const value = total ? Math.round((cleared / total) * 100) : 0;
      setPct(value);
      if (pct >= THRESHOLD) win();
    }

    function sparkle() {
      const n = 18;
      for (let i = 0; i < n; i++) {
        const s = document.createElement("span");
        s.className = "g9-spark";
        const a = Math.random() * Math.PI * 2;
        const d = 70 + Math.random() * 110;
        s.style.setProperty("--dx", (Math.cos(a) * d).toFixed(1) + "px");
        s.style.setProperty("--dy", (Math.sin(a) * d).toFixed(1) + "px");
        s.style.animationDelay = Math.round(Math.random() * 180) + "ms";
        fx.appendChild(s);
      }
    }

    function win() {
      if (finished) return;
      finished = true;
      drawing = false;
      last = null;
      stopSampling();
      clearTimeout(stuckTimer);
      stuckBtn.hidden = true;
      setPct(100);
      canvas.style.opacity = "0";
      void canvas.offsetWidth; // force le démarrage de la transition
      ctx.sfx("win");
      sparkle();
      doneTimer = setTimeout(callDone, DONE_DELAY_MS);
    }

    function onDown(e) {
      if (finished) return;
      e.preventDefault();
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (_) {}
      drawing = true;
      last = pos(e);
      scratch(last, last);
      if (!sampleTimer) sampleTimer = setInterval(sample, SAMPLE_MS);
      tickSound(performance.now());
    }

    function onMove(e) {
      if (!drawing || finished) return;
      const p = pos(e);
      scratch(last, p);
      last = p;
      tickSound(performance.now());
    }

    function onUp() {
      if (!drawing) return;
      drawing = false;
      last = null;
      stopSampling();
      sample();
    }

    function onStuck() {
      if (finished) return;
      finished = true;
      drawing = false;
      stopSampling();
      clearTimeout(stuckTimer);
      stuckBtn.hidden = true;
      callDone();
    }

    stuckTimer = setTimeout(function () {
      if (!finished) stuckBtn.hidden = false;
    }, STUCK_MS);

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    stuckBtn.addEventListener("click", onStuck);

    return function cleanup() {
      finished = true;
      stopSampling();
      clearTimeout(stuckTimer);
      clearTimeout(doneTimer);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      stuckBtn.removeEventListener("click", onStuck);
    };
  }

  window.LAYERS = window.LAYERS || {};
  window.LAYERS[N] = {
    title: "La lettre effacée",
    hint: "Gratte la cire dorée pour révéler les mots cachés.",
    mount: mount
  };
})();
