(function () {
  const CSS = `
    .g8 {
      box-sizing: border-box;
      position: relative;
      width: 100%;
      min-height: 420px;
      padding: 18px 16px 24px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      overflow: hidden;
      border-radius: 18px;
      font-family: var(--sans, "Jost", system-ui, sans-serif);
      color: var(--cream, #f7ece4);
      background:
        radial-gradient(ellipse 80% 60% at 50% 0%, rgba(214, 178, 110, .12), transparent 60%),
        radial-gradient(ellipse at 50% 30%, var(--wine, #6e1423) 0%, var(--bg-2, #2a0b12) 55%, var(--bg, #1a0609) 100%);
    }
    .g8 *, .g8 *::before, .g8 *::after { box-sizing: border-box; }

    .g8-top { display: flex; flex-direction: column; gap: 8px; }
    .g8-count {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 13px; letter-spacing: .14em; text-transform: uppercase;
      color: var(--muted, #b58a90);
    }
    .g8-bar {
      position: relative; height: 6px; border-radius: 999px;
      background: var(--line, rgba(246, 213, 217, .18)); overflow: hidden;
    }
    .g8-fill {
      height: 100%; width: 0; border-radius: inherit;
      background: linear-gradient(90deg, var(--rose, #e9a3ad), var(--gold, #d6b26e));
      box-shadow: 0 0 12px rgba(214, 178, 110, .5);
      transition: width .5s ease;
    }

    .g8-stage {
      flex: 1; min-height: 280px; position: relative;
      display: flex; align-items: center; justify-content: center;
    }
    .g8-card {
      width: 100%; max-width: 440px;
      padding: 24px 18px 20px;
      border-radius: 18px;
      background: var(--cream, #f7ece4);
      color: var(--wine, #6e1423);
      box-shadow: 0 18px 40px rgba(0, 0, 0, .45), 0 0 0 1px rgba(214, 178, 110, .45), 0 0 28px rgba(233, 163, 173, .22);
      transition: transform .26s ease, opacity .26s ease;
    }
    .g8-card.g8-out { opacity: 0; transform: translateX(-40px); }
    .g8-card.g8-from { opacity: 0; transform: translateX(40px); transition: none; }

    .g8-q {
      margin: 0 0 18px;
      font-family: var(--serif, "Cormorant Garamond", Georgia, serif);
      font-style: italic; font-weight: 600;
      font-size: clamp(24px, 7vw, 32px); line-height: 1.2;
      text-align: center; color: var(--wine, #6e1423);
    }
    .g8-choices { display: flex; flex-direction: column; gap: 10px; }
    .g8-choice {
      appearance: none; width: 100%; min-height: 48px;
      padding: 12px 16px; border-radius: 14px;
      border: 1px solid rgba(110, 20, 35, .22);
      background: #fbf1ea; color: var(--bg, #1a0609);
      font-family: var(--sans, "Jost", system-ui, sans-serif);
      font-size: 16px; line-height: 1.3; text-align: center;
      cursor: pointer; touch-action: manipulation;
      transition: background .25s ease, color .25s ease, box-shadow .25s ease, transform .15s ease, filter .25s ease;
    }
    .g8-choice:hover:not([aria-disabled="true"]) { background: var(--blush, #f6d5d9); }
    .g8-choice:active:not([aria-disabled="true"]) { transform: scale(.98); }
    .g8-choice:focus-visible { outline: 3px solid var(--gold, #d6b26e); outline-offset: 3px; }
    .g8-choice.g8-correct {
      background: linear-gradient(135deg, #ecd39a, var(--gold, #d6b26e));
      color: var(--bg, #1a0609); border-color: var(--gold, #d6b26e);
      box-shadow: 0 0 18px rgba(214, 178, 110, .65); font-weight: 600;
    }
    .g8-choice.g8-wrong {
      background: #bdb2b4; color: #5b4b4e; border-color: transparent;
      filter: grayscale(.85); cursor: not-allowed;
      animation: g8-shake .45s ease;
    }

    .g8-reply {
      min-height: 26px; margin: 14px 0 0; text-align: center;
      font-family: var(--serif, "Cormorant Garamond", Georgia, serif);
      font-style: italic; font-size: 19px; color: var(--blush, #f6d5d9);
    }
    .g8-end {
      padding: 36px 8px; text-align: center;
      font-family: var(--serif, "Cormorant Garamond", Georgia, serif);
      font-style: italic; font-size: clamp(26px, 8vw, 36px); line-height: 1.25;
      color: var(--gold, #d6b26e); text-shadow: 0 0 22px rgba(214, 178, 110, .4);
      animation: g8-pop .5s ease both;
    }
    .g8-stuck {
      align-self: center; min-height: 44px; padding: 8px 14px;
      background: none; border: 0; color: var(--muted, #b58a90);
      font-family: var(--sans, "Jost", system-ui, sans-serif); font-size: 14px;
      text-decoration: underline; text-underline-offset: 3px; cursor: pointer;
      animation: g8-fade .8s ease both;
    }
    .g8-stuck[hidden] { display: none; }
    .g8-stuck:focus-visible { outline: 3px solid var(--gold, #d6b26e); outline-offset: 2px; border-radius: 8px; }

    @keyframes g8-shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-7px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(3px); }
    }
    @keyframes g8-pop { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: none; } }
    @keyframes g8-fade { from { opacity: 0; } to { opacity: 1; } }

    @media (prefers-reduced-motion: reduce) {
      .g8, .g8 * { animation: none !important; transition: none !important; }
    }
  `;

  const DEFAULT_QUESTIONS = [
    { q: "Qu'est-ce que je préfère chez toi ?", choices: ["Ton sourire", "Tes yeux", "Ton rire", "Tout"], answer: 3 },
    { q: "Combien je t'aime ?", choices: ["Un peu", "Beaucoup", "Passionnément", "Infiniment"], answer: 3 },
    { q: "Quel est mon moment préféré de la journée ?", choices: ["Le matin, à tes côtés", "Le midi, en riant", "Le soir, blottis l'un contre l'autre", "Quand tu m'envoies un message"], answer: 2 },
    { q: "Que fait mon cœur quand tu arrives ?", choices: ["Il s'arrête", "Il danse", "Il bat la chamade", "Tout ça à la fois"], answer: 3 }
  ];

  const REPLIES = [
    "Presque…",
    "Essaie encore, mon cœur",
    "Tu me fais douter là 😏",
    "Hmm, pas tout à fait, mon amour",
    "Réfléchis bien, je te fais confiance",
    "Aïe, mon cœur a trébuché"
  ];

  // Valide la config ; renvoie null si rien d'exploitable (on retombe sur les défauts).
  function sanitize(list) {
    if (!Array.isArray(list)) return null;
    const out = [];
    list.forEach(function (item) {
      if (!item || typeof item.q !== "string" || !item.q.trim()) return;
      if (!Array.isArray(item.choices)) return;
      const choices = item.choices.map(function (c) { return String(c); });
      if (choices.length < 2 || choices.some(function (c) { return !c.trim(); })) return;
      const a = item.answer;
      if (!Number.isInteger(a) || a < 0 || a >= choices.length) return;
      out.push({ q: item.q.trim(), choices: choices, answer: a });
    });
    return out.length ? out : null;
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  window.LAYERS = window.LAYERS || {};
  window.LAYERS[8] = {
    title: "Le quiz de nous",
    hint: "Réponds aux questions sur notre histoire.",
    mount(root, ctx) {
      ctx.css(CSS);
      root.classList.add("g8");

      const cfg = (ctx && ctx.config) || {};
      const questions = sanitize(cfg.questions) || DEFAULT_QUESTIONS;
      const total = questions.length;

      const timers = [];
      let alive = true;
      let idx = 0;
      let locked = false;     // bonne réponse trouvée, transition en cours
      let finished = false;   // quiz terminé (ou abandon)
      let doneSent = false;
      let wrong = new Set();  // index des mauvais choix pour la question courante

      function later(fn, ms) {
        const t = setTimeout(function () { if (alive) fn(); }, ms);
        timers.push(t);
        return t;
      }
      function sfx(name) { try { if (ctx.sfx) ctx.sfx(name); } catch (e) {} }
      function vib(ms) { try { if (ctx.vibrate) ctx.vibrate(ms); } catch (e) {} }

      function complete() {
        if (doneSent || !alive) return;
        doneSent = true;
        ctx.done();
      }

      // --- DOM ---
      const top = el("div", "g8-top");
      const count = el("div", "g8-count");
      const countLabel = el("span", "", "");
      count.appendChild(countLabel);
      const bar = el("div", "g8-bar");
      bar.setAttribute("role", "progressbar");
      bar.setAttribute("aria-valuemin", "0");
      bar.setAttribute("aria-valuemax", String(total));
      bar.setAttribute("aria-valuenow", "0");
      const fill = el("div", "g8-fill");
      bar.appendChild(fill);
      top.append(count, bar);

      const stage = el("div", "g8-stage");
      const reply = el("p", "g8-reply");
      reply.setAttribute("aria-live", "polite");
      const stuck = el("button", "g8-stuck", "Je suis bloqué·e");
      stuck.type = "button";
      stuck.hidden = true;

      root.append(top, stage, reply, stuck);

      function updateProgress() {
        const shown = Math.min(idx + 1, total);
        countLabel.textContent = "Question " + shown + " / " + total;
        fill.style.width = (idx / total * 100) + "%";
        bar.setAttribute("aria-valuenow", String(idx));
      }

      function renderQuestion(fromRight) {
        const item = questions[idx];
        const card = el("div", "g8-card");
        const title = el("h2", "g8-q", item.q);
        const list = el("div", "g8-choices");

        item.choices.forEach(function (text, i) {
          const b = el("button", "g8-choice", text);
          b.type = "button";
          b.addEventListener("click", function () { choose(i, b, list); });
          list.appendChild(b);
        });

        card.append(title, list);
        stage.replaceChildren(card);

        if (fromRight) {
          // Entrée glissée : on pose la carte décalée, puis on la laisse glisser en place.
          card.classList.add("g8-from");
          void card.offsetWidth;
          card.classList.remove("g8-from");
        }
        updateProgress();
      }

      function next() {
        const cur = stage.firstElementChild;
        if (cur) cur.classList.add("g8-out");
        later(function () {
          idx++;
          wrong = new Set();
          locked = false;
          reply.textContent = "";
          renderQuestion(true);
        }, 260);
      }

      function finish() {
        finished = true;
        stuck.hidden = true;
        fill.style.width = "100%";
        bar.setAttribute("aria-valuenow", String(total));
        countLabel.textContent = "Question " + total + " / " + total;
        reply.textContent = "";
        sfx("win");
        stage.replaceChildren(el("div", "g8-end", "Sans faute. Enfin… presque 😉"));
        later(complete, 900);
      }

      function choose(i, btn, list) {
        if (!alive || locked || finished) return;
        if (wrong.has(i)) return;
        if (btn.getAttribute("aria-disabled") === "true") return;

        const item = questions[idx];
        if (i === item.answer) {
          locked = true;
          btn.classList.add("g8-correct");
          list.querySelectorAll("button").forEach(function (b) {
            b.setAttribute("aria-disabled", "true");
          });
          reply.textContent = "";
          sfx("good");
          vib(30);
          later(function () {
            if (idx + 1 >= total) finish();
            else next();
          }, 900);
        } else {
          wrong.add(i);
          btn.classList.add("g8-wrong");
          btn.setAttribute("aria-disabled", "true");
          reply.textContent = pick(REPLIES);
          sfx("bad");
          vib(80);
        }
      }

      stuck.addEventListener("click", function () {
        if (finished || doneSent) return;
        finished = true;
        stuck.hidden = true;
        complete();
      });

      // Lien d'aide après 60 s, seulement si le quiz n'est pas gagné.
      later(function () {
        if (!finished) stuck.hidden = false;
      }, 60000);

      renderQuestion(false);

      return function cleanup() {
        alive = false;
        timers.forEach(function (t) { clearTimeout(t); });
        timers.length = 0;
      };
    }
  };
})();
