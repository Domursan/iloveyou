/* ==========================================================================
   RÉGLAGES — tout ce qui se personnalise est ici.
   Chaque couche cache un « fragment » : à la fin, les 10 fragments
   s'assemblent pour former la déclaration complète.
   Astuce test : ajoute ?couche=7 à l'adresse pour sauter à la couche 7
   (?couche=11 pour aller directement à la finale).
   ========================================================================== */
const CONFIG = {
  prenom: "toi",                  // écran d'accueil : « Pour toi » (mets son prénom si tu veux)
  surnom: "Mon amour",            // début de la lettre finale : « Mon amour, »
  deQui: "Ethan",                 // signature de la lettre
  intro: "Il y a dix couches entre toi et ce que j'ai à te dire. Chacune cache un jeu… et un petit morceau de mon cœur.",

  // Musique de fond (optionnelle) : démarre au premier clic. Laisse "" pour aucune.
  musique: "musiques/notre-chanson.mp3",
  // Musique jouée à la finale (optionnelle). "" = garde la musique de fond.
  musiqueFinale: "",

  layers: {
    1:  { fragment: "Depuis toi, mon cœur a appris un nouveau rythme.",
          bpm: 72, hits: 8 },
    2:  { fragment: "Chaque souvenir avec toi est une petite pièce d'or que je garde précieusement.",
          // Une photo par paire (dossier images/). Tant qu'une photo manque, l'emoji du même rang s'affiche.
          photos: ["images/souvenir1.jpg", "images/souvenir2.jpg", "images/souvenir3.jpg",
                   "images/souvenir4.jpg", "images/souvenir5.jpg", "images/souvenir6.jpg"],
          symbols: ["☕", "🎬", "🌙", "🎵", "🌹", "✈️"] },
    3:  { fragment: "Je crois qu'un fil invisible nous reliait bien avant qu'on se rencontre." },
    4:  { fragment: "Il y a des mots que je ne te dis pas assez souvent. Alors je les écris ici.",
          words: ["NOUS", "TOUJOURS", "TENDRESSE"] },
    5:  { fragment: "Tu as fait pleuvoir du bonheur sur des jours qui n'en attendaient plus.",
          goal: 15 },
    6:  { fragment: "Avec toi, toutes les pièces de ma vie ont trouvé leur place.",
          image: "images/puzzle.jpg" },
    7:  { fragment: "Si je devais dessiner mon ciel, chaque étoile porterait ton prénom.",
          rounds: [3, 4, 5] },   // les étoiles forment un « T »
    8:  { fragment: "Tu me connais par cœur, et pourtant tu trouves encore le moyen de me surprendre.",
          questions: [
            { q: "Qu'est-ce que je préfère chez toi ?", choices: ["Ton sourire", "Tes yeux", "Ton rire", "Tout, évidemment"], answer: 3 },
            { q: "Combien je t'aime ?", choices: ["Un peu", "Beaucoup", "Passionnément", "Infiniment"], answer: 3 },
            { q: "Mon moment préféré avec toi ?", choices: ["Le matin", "Le soir", "Les fous rires", "Tous, sans exception"], answer: 3 },
            { q: "Qui a le plus de chance des deux ?", choices: ["Toi", "Moi", "Le chat", "Moi, clairement"], answer: 3 }
          ] },
    9:  { fragment: "Ce que j'écris sur toi, aucune gomme ne pourra jamais l'effacer.",
          text: "Tu es ma plus belle évidence." },
    10: { fragment: "Tu as toujours eu la clé. Il te suffisait d'ouvrir.",
          code: "0102", hint: "Le jour où tout a commencé… (JJMM)" }
  },

  finale: {
    titre: "Le cœur du cadeau",
    consigne: "Maintiens le cœur appuyé pour l'ouvrir.",
    dernierMot: "Sous les dix couches, il n'y avait qu'une seule chose : je t'aime.",
    // Photos optionnelles (dossier images/). Celles qui n'existent pas sont ignorées.
    photos: ["images/photo1.jpg", "images/photo2.jpg", "images/photo3.jpg"],
    question: "Tu veux bien continuer à écrire notre histoire avec moi ?",
    oui: "Oui",
    non: "Non",
    reponse: "Alors c'est promis. Pour toutes les couches à venir. ♥"
  }
};

/* ==========================================================================
   MOTEUR — pas besoin de modifier ce qui suit.
   ========================================================================== */
(function () {
  const TOTAL = 10;
  const PAPERS = ["#8d1a2c", "#a3354a", "#6e1423", "#b8556a", "#7d2240", "#9c2a2a", "#5d1431", "#c0405a", "#82303e", "#a8873f"];
  const stage = document.getElementById("stage");
  const progress = document.getElementById("progress");
  const musicBtn = document.getElementById("musicBtn");
  let cleanup = null;
  let audio = null;
  let actx = null;

  /* ---------- Sons (synthèse WebAudio, aucun fichier) ---------- */
  function sfx(name) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = { tick: [880], good: [660, 990], bad: [220, 180], win: [523, 659, 784, 1047] }[name] || [660];
      notes.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        const t = actx.currentTime + i * 0.09;
        o.type = name === "bad" ? "triangle" : "sine";
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(name === "tick" ? 0.05 : 0.09, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (name === "tick" ? 0.08 : 0.35));
        o.connect(g).connect(actx.destination);
        o.start(t); o.stop(t + 0.4);
      });
    } catch (e) { /* son indisponible : on continue sans */ }
  }
  const vibrate = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  const injected = new Set();
  function css(text) {
    if (injected.has(text)) return;
    injected.add(text);
    const s = document.createElement("style");
    s.textContent = text;
    document.head.appendChild(s);
  }

  /* ---------- Musique ---------- */
  function startMusic(src) {
    if (!src) return;
    if (audio && audio.dataset.src === src) return;
    if (audio) audio.pause();
    audio = new Audio(src);
    audio.dataset.src = src;
    audio.loop = true;
    audio.volume = 0.45;
    audio.addEventListener("canplay", () => musicBtn.classList.add("show"), { once: true });
    audio.play().catch(() => {});
  }
  musicBtn.addEventListener("click", () => {
    if (!audio) return;
    if (audio.paused) { audio.play().catch(() => {}); musicBtn.classList.remove("off"); }
    else { audio.pause(); musicBtn.classList.add("off"); }
  });

  /* ---------- Ambiance ---------- */
  const amb = document.getElementById("ambient");
  for (let i = 0; i < 26; i++) {
    const p = document.createElement("i");
    p.style.left = Math.random() * 100 + "%";
    p.style.animationDuration = 10 + Math.random() * 14 + "s";
    p.style.animationDelay = -Math.random() * 20 + "s";
    const s = 2 + Math.random() * 3;
    p.style.width = p.style.height = s + "px";
    amb.appendChild(p);
  }

  /* ---------- Progression ---------- */
  for (let i = 1; i <= TOTAL; i++) {
    const s = document.createElement("span");
    s.textContent = "♥";
    s.title = "Couche " + i;
    progress.appendChild(s);
  }
  function setProgress(current) {
    progress.classList.toggle("show", current >= 1);
    [...progress.children].forEach((s, i) => {
      s.classList.toggle("on", i + 1 < current);
      s.classList.toggle("now", i + 1 === current);
    });
  }

  /* ---------- Utilitaires ---------- */
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function swap(build) {
    const old = stage.firstElementChild;
    const go = () => {
      stage.innerHTML = "";
      const sc = build();
      stage.appendChild(sc);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    if (old) { old.classList.add("out"); setTimeout(go, 420); } else go();
  }

  function tear(color, then) {
    const t = el("div", "tear", '<div class="l"></div><div class="r"></div><div class="ribbon"></div>');
    t.style.setProperty("--paper", color);
    document.body.appendChild(t);
    then();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setTimeout(() => { t.classList.add("open"); sfx("tick"); }, 350);
    }));
    setTimeout(() => t.remove(), 1600);
  }

  /* ---------- Accueil ---------- */
  function intro() {
    setProgress(0);
    swap(() => {
      const s = el("section", "scene");
      s.innerHTML = `
        <p class="eyebrow">Un cadeau t'attend</p>
        <h1 class="title hero">Pour ${esc(CONFIG.prenom)}</h1>
        <div class="giftbox" aria-hidden="true">
          <div class="box"></div><div class="lid"></div><div class="rib-v"></div><div class="bow"></div><div class="knot"></div>
          <div class="tag">10 couches</div>
        </div>
        <p class="lead">${esc(CONFIG.intro)}</p>`;
      const b = el("button", "btn solid", "Commencer à déballer");
      b.addEventListener("click", () => { sfx("good"); startMusic(CONFIG.musique); openLayer(1); });
      s.appendChild(b);
      return s;
    });
  }

  /* ---------- Une couche ---------- */
  function openLayer(n) {
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    if (n > TOTAL) return tear(PAPERS[9], finale);
    const L = (window.LAYERS || {})[n];
    const cfg = CONFIG.layers[n] || {};
    document.documentElement.style.setProperty("--paper", PAPERS[n - 1]);
    tear(PAPERS[n - 1], () => {
      setProgress(n);
      stage.innerHTML = "";
      const s = el("section", "scene");
      s.innerHTML = `
        <div class="layer-head">
          <div class="layer-num"><b></b>Couche ${n} / ${TOTAL}</div>
          <h2 class="title">${esc(L ? L.title : "Couche " + n)}</h2>
          <p class="hint">${esc(L ? L.hint : "")}</p>
        </div>`;
      const frame = el("div", "game-frame");
      const root = el("div", "game-root");
      frame.appendChild(root);
      s.appendChild(frame);
      stage.appendChild(s);
      window.scrollTo(0, 0);

      let finished = false;
      const done = () => {
        if (finished) return;
        finished = true;
        sfx("win"); vibrate(60);
        setTimeout(() => reveal(n), 250);
      };
      if (!L) { root.innerHTML = '<p class="hint">Mini-jeu introuvable.</p>'; const b = el("button", "btn", "Continuer"); b.onclick = done; root.appendChild(b); return; }
      try {
        cleanup = L.mount(root, { config: cfg, done, sfx, vibrate, css }) || null;
      } catch (e) {
        console.error("Couche " + n, e);
        root.innerHTML = '<p class="hint">Oups, ce jeu a eu un souci.</p>';
        const b = el("button", "btn", "Passer à la suite"); b.onclick = done; root.appendChild(b);
      }
    });
  }

  /* ---------- Fragment révélé ---------- */
  function reveal(n) {
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    const cfg = CONFIG.layers[n] || {};
    swap(() => {
      const s = el("section", "scene");
      s.innerHTML = `<p class="eyebrow">Couche ${n} déballée</p>`;
      const note = el("div", "note");
      note.innerHTML = `
        <p class="eyebrow">Ce que cette couche cachait</p>
        <p class="frag">« ${esc(cfg.fragment || "")} »</p>`;
      const b = el("button", "btn", n < TOTAL ? "Déchirer la couche suivante" : "Ouvrir le cœur du cadeau");
      b.addEventListener("click", () => { sfx("good"); openLayer(n + 1); });
      note.appendChild(b);
      note.appendChild(el("div", "seal", "♥"));
      s.appendChild(note);
      return s;
    });
  }

  /* ---------- Finale ---------- */
  function finale() {
    setProgress(TOTAL + 1);
    [...progress.children].forEach((s) => s.classList.add("on"));
    if (CONFIG.musiqueFinale) startMusic(CONFIG.musiqueFinale);
    const F = CONFIG.finale;
    stage.innerHTML = "";
    const s = el("section", "scene");
    s.innerHTML = `
      <p class="eyebrow">Tout est déballé</p>
      <h2 class="title">${esc(F.titre)}</h2>
      <p class="hint">${esc(F.consigne)}</p>`;
    const heart = el("button", "core-heart");
    heart.setAttribute("aria-label", "Maintenir pour ouvrir le cœur");
    const R = 113, C = 2 * Math.PI * R;
    heart.innerHTML = `
      <svg class="ring" viewBox="0 0 250 250" aria-hidden="true"><circle class="track" cx="125" cy="125" r="${R}"/><circle class="fill" cx="125" cy="125" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>
      <svg class="h" viewBox="0 0 100 90" aria-hidden="true">
        <defs><radialGradient id="hg" cx="35%" cy="30%"><stop offset="0" stop-color="#e5506a"/><stop offset=".6" stop-color="#b3203a"/><stop offset="1" stop-color="#6e1423"/></radialGradient></defs>
        <path d="M50 86 C20 64 4 48 4 28 C4 14 15 4 28 4 C38 4 46 10 50 18 C54 10 62 4 72 4 C85 4 96 14 96 28 C96 48 80 64 50 86Z" fill="url(#hg)" stroke="#d6b26e" stroke-width="1.5"/>
      </svg>`;
    s.appendChild(heart);
    stage.appendChild(s);

    const fill = heart.querySelector(".fill");
    let t0 = 0, raf = 0, opened = false;
    const HOLD = 1800;
    const step = () => {
      const p = Math.min(1, (performance.now() - t0) / HOLD);
      fill.setAttribute("stroke-dashoffset", C * (1 - p));
      if (p >= 1) { open(); return; }
      raf = requestAnimationFrame(step);
    };
    const down = (e) => { if (opened) return; e.preventDefault(); t0 = performance.now(); vibrate(20); raf = requestAnimationFrame(step); };
    const up = () => { if (opened) return; cancelAnimationFrame(raf); fill.setAttribute("stroke-dashoffset", C); };
    heart.addEventListener("pointerdown", down);
    heart.addEventListener("pointerup", up);
    heart.addEventListener("pointerleave", up);
    heart.addEventListener("pointercancel", up);
    heart.addEventListener("keydown", (e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) down(e); });
    heart.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") up(); });
    heart.addEventListener("contextmenu", (e) => e.preventDefault());

    function open() {
      opened = true;
      sfx("win"); vibrate([40, 60, 120]);
      heart.classList.add("burst");
      rain(60);
      setTimeout(() => letter(s), 900);
    }
  }

  function rain(count) {
    const box = el("div", "heart-rain");
    const glyphs = ["♥", "❤", "♡", "✦"];
    const colors = ["#e9a3ad", "#b3203a", "#d6b26e", "#f6d5d9"];
    for (let i = 0; i < count; i++) {
      const h = el("i", null, glyphs[i % glyphs.length]);
      h.style.left = Math.random() * 100 + "%";
      h.style.fontSize = 14 + Math.random() * 26 + "px";
      h.style.color = colors[i % colors.length];
      h.style.animationDuration = 3 + Math.random() * 3 + "s";
      h.style.animationDelay = Math.random() * 1.6 + "s";
      h.style.setProperty("--rot", (Math.random() * 360 - 180) + "deg");
      box.appendChild(h);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 8000);
  }

  function letter(s) {
    const F = CONFIG.finale;
    s.innerHTML = `<p class="eyebrow">Les dix fragments, réunis</p>`;
    const L = el("article", "letter");
    L.appendChild(el("h2", null, esc(CONFIG.surnom) + ","));
    const paras = [];
    for (let n = 1; n <= TOTAL; n++) {
      const f = (CONFIG.layers[n] || {}).fragment;
      if (!f) continue;
      const p = el("p", null, `<span class="n">${String(n).padStart(2, "0")}</span>${esc(f)}`);
      L.appendChild(p); paras.push(p);
    }
    const last = el("p", "final", esc(F.dernierMot));
    const sign = el("p", "sign", "— " + esc(CONFIG.deQui));
    L.appendChild(last); L.appendChild(sign);
    paras.push(last, sign);
    s.appendChild(L);
    paras.forEach((p, i) => setTimeout(() => { p.classList.add("in"); if (i === paras.length - 2) sfx("good"); }, 500 + i * 1100));
    const after = 500 + paras.length * 1100;

    // Galerie : n'affiche que les photos qui existent
    const photos = (F.photos || []).filter(Boolean);
    if (photos.length) {
      const g = el("div", "gallery");
      let shown = 0;
      photos.forEach((src, i) => {
        const img = new Image();
        img.onload = () => {
          const fig = el("figure");
          fig.style.setProperty("--r", (i % 2 ? 2 : -2) + "deg");
          img.alt = "";
          fig.appendChild(img);
          g.appendChild(fig);
          if (!shown++) setTimeout(() => s.insertBefore(g, s.querySelector(".question")), Math.max(0, after - 600));
        };
        img.src = src;
      });
    }

    setTimeout(() => {
      const q = el("div", "question");
      q.innerHTML = `<h3 class="title">${esc(F.question)}</h3>`;
      const a = el("div", "answers");
      const yes = el("button", "btn solid", esc(F.oui));
      const no = el("button", "btn runaway", esc(F.non));
      let dodges = 0;
      const flee = () => {
        dodges++;
        if (dodges >= 6) { no.textContent = F.oui + " aussi"; no.classList.add("solid"); no.style.transform = ""; return; }
        const w = a.clientWidth || 300;
        no.style.transform = `translate(${(Math.random() - .5) * w * .8}px, ${(Math.random() - .5) * 90}px)`;
        sfx("tick");
      };
      no.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") flee(); });
      no.addEventListener("click", (e) => { if (dodges >= 6) return say(); e.preventDefault(); flee(); });
      const say = () => {
        a.innerHTML = "";
        a.appendChild(el("p", "yes-msg", esc(F.reponse)));
        sfx("win"); vibrate([60, 80, 60, 80, 200]); rain(90);
      };
      yes.addEventListener("click", say);
      a.append(yes, no);
      q.appendChild(a);
      s.appendChild(q);
      q.scrollIntoView({ behavior: "smooth", block: "center" });
    }, after + 400);
  }

  /* ---------- Démarrage ---------- */
  const jump = parseInt(new URLSearchParams(location.search).get("couche"), 10);
  if (jump >= 1 && jump <= TOTAL) openLayer(jump);
  else if (jump === TOTAL + 1) finale();
  else intro();
})();
