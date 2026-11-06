import "./style.css";
import { AudioDirector } from "./audio.js";
import { GAME, nodes, BG } from "./story.js";

const stage = document.getElementById("stage");
const bgA = document.getElementById("bgA");
const bgB = document.getElementById("bgB");
const topbar = document.getElementById("topbar");
const statusEl = document.getElementById("status");
const muteBtn = document.getElementById("muteBtn");
const flashEl = document.getElementById("flash");

const audio = new AudioDirector();

const state = {
  nodeId: "title",
  flags: {
    flashlight: false,
    medkit: false,
    water: false,
    keys: false,
    quiet: false,
    scratched: false,
  },
  bgFrontIsA: true,
  bgKey: null,
  transitioning: false,
};

const FLAG_LABELS = {
  flashlight: "手电",
  medkit: "医药包",
  water: "饮水",
  keys: "车钥匙",
  scratched: "擦伤",
};

/** url -> { img, ready: Promise } */
const imageCache = new Map();

function ensureImage(url) {
  if (!url) return null;
  let entry = imageCache.get(url);
  if (entry) return entry;
  const img = new Image();
  img.decoding = "async";
  img.fetchPriority = "low";
  const ready = new Promise((resolve) => {
    const done = () => {
      if (img.decode) {
        img.decode().then(resolve).catch(resolve);
      } else {
        resolve();
      }
    };
    if (img.complete && img.naturalWidth) {
      done();
      return;
    }
    img.onload = done;
    img.onerror = () => resolve();
  });
  img.src = url;
  entry = { img, ready };
  imageCache.set(url, entry);
  return entry;
}

async function waitImage(url, timeoutMs = 1800) {
  const entry = ensureImage(url);
  if (!entry) return;
  await Promise.race([
    entry.ready,
    new Promise((r) => setTimeout(r, timeoutMs)),
  ]);
}

function preloadPriority(urls, priority = "low") {
  [...new Set(urls.filter(Boolean))].forEach((url) => {
    const entry = ensureImage(url);
    if (entry?.img) entry.img.fetchPriority = priority;
  });
}

function preloadAllImages() {
  const critical = [BG.city, BG.room, BG.hallway, BG.alley, BG.corridor];
  preloadPriority(critical, "high");
  // Remaining art after first paint.
  requestIdleCallbackSafe(() => {
    preloadPriority(Object.values(BG), "low");
  }, 400);
}

function requestIdleCallbackSafe(fn, timeout = 800) {
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(() => fn(), { timeout });
  } else {
    setTimeout(fn, Math.min(timeout, 200));
  }
}

function paintLayer(el, key, { death = false } = {}) {
  const url = BG[key];
  if (!url) {
    el.style.backgroundImage = "";
    return;
  }
  const wash = death
    ? `linear-gradient(180deg, rgba(30,0,0,0.18) 0%, rgba(8,4,4,0.12) 42%, rgba(8,4,4,0.72) 100%)`
    : `linear-gradient(180deg, rgba(8,6,5,0.12) 0%, rgba(8,6,5,0.08) 45%, rgba(8,6,5,0.62) 100%)`;
  const layers = [`${wash}, url("${url}")`];
  if (death) {
    layers.unshift(
      `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.12) 70%, rgba(20,0,0,0.4) 100%), url("${BG.deathOverlay}")`
    );
  }
  el.style.backgroundImage = layers.join(", ");
  el.style.backgroundBlendMode = death ? "soft-light, normal, normal" : "normal";
  el.style.backgroundSize = death ? "cover, cover, cover" : "cover";
  el.style.backgroundPosition = death ? "center bottom, center, center" : "center";
}

async function setBackground(key, { death = false, instant = false } = {}) {
  if (!key || !BG[key]) return;
  if (state.bgKey === key && !instant) return;

  const url = BG[key];
  ensureImage(url);
  if (death) ensureImage(BG.deathOverlay);
  // Prefer decoded frame before swapping to avoid flash/stutter.
  await waitImage(url, instant ? 120 : 900);

  const front = state.bgFrontIsA ? bgA : bgB;
  const back = state.bgFrontIsA ? bgB : bgA;

  if (instant || !state.bgKey) {
    paintLayer(front, key, { death });
    front.classList.add("is-active");
    back.classList.remove("is-active");
    state.bgKey = key;
    return;
  }

  paintLayer(back, key, { death });
  // Force style flush then crossfade via opacity (composited).
  void back.offsetWidth;
  back.classList.add("is-active");
  front.classList.remove("is-active");
  state.bgFrontIsA = !state.bgFrontIsA;
  state.bgKey = key;
}

function setAppMode(mode) {
  const app = document.getElementById("app");
  app.classList.remove("mode-title", "mode-scene", "mode-death", "mode-survive");
  if (mode) app.classList.add(`mode-${mode}`);
}

function updateStatus() {
  const bits = Object.entries(FLAG_LABELS)
    .filter(([k]) => state.flags[k])
    .map(([k, label]) => {
      const cls = k === "scratched" ? "warn" : "";
      return `<span class="${cls}">${label}</span>`;
    });
  statusEl.innerHTML = bits.length ? bits.join("") : `<span>空身</span>`;
}

function applySets(set) {
  if (!set) return;
  Object.assign(state.flags, set);
  updateStatus();
}

function fireDeathFlash() {
  flashEl.classList.remove("fire");
  void flashEl.offsetWidth;
  flashEl.classList.add("fire");
}

function prefetchChoiceBackgrounds(node) {
  const urls = [];
  (node.choices || []).forEach((c) => {
    const next = nodes[c.next];
    const fb = nodes[c.fallback];
    if (next?.bg) urls.push(BG[next.bg]);
    if (fb?.bg) urls.push(BG[fb.bg]);
    // One hop further for smoother chains.
    (next?.choices || []).forEach((cc) => {
      const n2 = nodes[cc.next];
      if (n2?.bg) urls.push(BG[n2.bg]);
    });
  });
  preloadPriority(urls, "high");
}

async function go(nodeId) {
  const node = nodes[nodeId];
  if (!node) {
    console.error("Missing node", nodeId);
    return;
  }
  if (state.transitioning) return;
  state.transitioning = true;
  state.nodeId = nodeId;

  try {
    if (node.set) applySets(node.set);

    // Warm next art ASAP (non-blocking).
    if (node.bg) ensureImage(BG[node.bg]);
    prefetchChoiceBackgrounds(node);

    if (node.type === "title") {
      topbar.hidden = true;
      setAppMode("title");
      await setBackground("city", { instant: !state.bgKey });
      audio.playBgm("horror"); // do not block UI
      audio.stopHeartbeat();
      renderTitle();
      return;
    }

    topbar.hidden = false;
    updateStatus();

    if (node.type === "ending") {
      setAppMode(node.ending === "death" ? "death" : "survive");
    } else {
      setAppMode("scene");
    }

    // Background first (await decode briefly), BGM never blocks paint.
    if (node.bg) {
      await setBackground(node.bg, { death: node.ending === "death" });
    }
    if (Object.prototype.hasOwnProperty.call(node, "bgm")) {
      audio.playBgm(node.bgm);
    }

    if (node.stopHeartbeat) audio.stopHeartbeat();
    if (node.heartbeat === "fast") audio.startHeartbeat(true);
    else if (node.heartbeat) audio.startHeartbeat(false);

    if (node.sfx) {
      const list = Array.isArray(node.sfx) ? node.sfx : [node.sfx];
      list.forEach((s, i) => {
        setTimeout(
          () =>
            audio.playSfx(s, {
              volume: s.includes("zombie") || s === "growl" ? 0.7 : 0.55,
            }),
          i * 120
        );
      });
    }

    if (node.type === "ending") {
      if (node.ending === "death") fireDeathFlash();
      renderEnding(node);
      return;
    }

    renderScene(node);
  } finally {
    state.transitioning = false;
  }
}

function renderTitle() {
  stage.innerHTML = `
    <section class="screen title-screen" aria-label="标题">
      <h1 class="brand">${GAME.title}</h1>
      <p class="subtitle">${GAME.subtitle}</p>
      <p class="tagline">${GAME.tagline}</p>
      <p class="warning">
        <strong>内容警告：</strong>本作为写实丧尸生存文字冒险，含血腥描写、丧尸形象、死亡结局与惊吓音效。面向年满十八岁玩家。可随时静音。
      </p>
      <div class="cta-row">
        <button type="button" class="btn primary" data-action="start">开始序章</button>
        <button type="button" class="btn" data-action="mute">${audio.muted ? "开启声音" : "静音"}</button>
      </div>
    </section>
  `;

  stage.querySelector('[data-action="start"]').addEventListener("click", async () => {
    audio.playSfx("click");
    await audio.unlock();
    // Kick remaining preloads on first gesture.
    preloadPriority(Object.values(BG), "high");
    audio.preloadDeep();
    await go("intro");
  });
  stage.querySelector('[data-action="mute"]').addEventListener("click", async () => {
    await audio.unlock();
    const muted = audio.toggleMute();
    stage.querySelector('[data-action="mute"]').textContent = muted ? "开启声音" : "静音";
    muteBtn.textContent = muted ? "已静音" : "音量";
  });
}

function choiceAvailable(choice) {
  if (choice.require && !state.flags[choice.require]) {
    return { ok: false, reason: choice.hint || "缺少物品" };
  }
  return { ok: true };
}

function renderScene(node) {
  const paragraphs = node.text.map((t) => `<p>${t}</p>`).join("");
  const choices = (node.choices || [])
    .map((c, i) => {
      const avail = choiceAvailable(c);
      const locked = !avail.ok && !c.fallback;
      const hint = !avail.ok
        ? `<span class="hint">${avail.reason}</span>`
        : c.hint && c.require
          ? `<span class="hint">${c.hint}</span>`
          : "";
      return `
        <button type="button" class="choice" data-idx="${i}" ${locked ? "disabled" : ""}>
          <span class="key">${i + 1}</span>${c.text}
          ${hint}
        </button>
      `;
    })
    .join("");

  stage.innerHTML = `
    <section class="screen scene" aria-live="polite">
      <p class="scene-label">${node.label || ""}</p>
      <div class="prose">${paragraphs}</div>
      <div class="choices">${choices}</div>
    </section>
  `;

  stage.querySelectorAll(".choice").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.idx);
      const choice = node.choices[idx];
      const avail = choiceAvailable(choice);
      audio.playSfx("click");
      if (choice.set) applySets(choice.set);
      if (!avail.ok && choice.fallback) {
        go(choice.fallback);
        return;
      }
      if (!avail.ok) return;
      go(choice.next);
    });
  });
}

function renderEnding(node) {
  const paragraphs = node.text.map((t) => `<p>${t}</p>`).join("");
  const isDeath = node.ending === "death";
  stage.innerHTML = `
    <section class="screen ending ${isDeath ? "death" : "survive"}" aria-live="assertive">
      <p class="ending-kicker">${isDeath ? "死亡结局" : "序章通关"}</p>
      <h2>${node.title}</h2>
      <div class="prose ${isDeath ? "danger-text" : ""}">${paragraphs}</div>
      <div class="cta-row">
        <button type="button" class="btn primary" data-action="restart">返回标题</button>
        ${isDeath ? `<button type="button" class="btn danger" data-action="retry">从这一夜再试</button>` : ""}
      </div>
    </section>
  `;

  stage.querySelector('[data-action="restart"]').addEventListener("click", () => {
    audio.playSfx("click");
    resetGame();
    go("title");
  });
  const retry = stage.querySelector('[data-action="retry"]');
  if (retry) {
    retry.addEventListener("click", () => {
      audio.playSfx("click");
      resetGame();
      go("intro");
    });
  }
}

function resetGame() {
  state.flags = {
    flashlight: false,
    medkit: false,
    water: false,
    keys: false,
    quiet: false,
    scratched: false,
  };
  audio.stopHeartbeat();
  updateStatus();
}

muteBtn.addEventListener("click", async () => {
  await audio.unlock();
  const muted = audio.toggleMute();
  muteBtn.textContent = muted ? "已静音" : "音量";
});

// Boot
audio.preload();
preloadAllImages();
go("title");
