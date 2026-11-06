import "./style.css";
import { AudioDirector } from "./audio.js";
import { GAME, nodes, BG } from "./story.js";

const stage = document.getElementById("stage");
const bgEl = document.getElementById("bg");
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
};

const FLAG_LABELS = {
  flashlight: "手电",
  medkit: "医药包",
  water: "饮水",
  keys: "车钥匙",
  scratched: "擦伤",
};

const imageCache = new Map();

function preloadImages() {
  const urls = [...new Set(Object.values(BG))];
  urls.forEach((url) => {
    if (imageCache.has(url)) return;
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    imageCache.set(url, img);
  });
}

function warmBackground(key) {
  const url = BG[key];
  if (!url || imageCache.has(url)) return;
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  imageCache.set(url, img);
}

function setBackground(key, { death = false } = {}) {
  const url = BG[key];
  if (!url) {
    bgEl.classList.remove("has-image");
    bgEl.style.backgroundImage = "";
    return;
  }
  warmBackground(key);
  const layers = [
    death
      ? `linear-gradient(180deg, rgba(40,0,0,0.55), rgba(8,4,4,0.78)), url("${url}")`
      : `linear-gradient(180deg, rgba(8,6,5,0.35), rgba(8,6,5,0.72)), url("${url}")`,
  ];
  if (death) {
    layers.unshift(`url("${BG.deathOverlay}")`);
  }
  bgEl.classList.add("has-image");
  bgEl.style.backgroundImage = layers.join(", ");
  bgEl.style.backgroundBlendMode = death ? "multiply, normal, normal" : "normal";
  bgEl.style.backgroundSize = "cover";
  bgEl.style.backgroundPosition = "center";
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
  (node.choices || []).forEach((c) => {
    const next = nodes[c.next] || nodes[c.fallback];
    if (next?.bg) warmBackground(next.bg);
  });
}

async function go(nodeId) {
  const node = nodes[nodeId];
  if (!node) {
    console.error("Missing node", nodeId);
    return;
  }
  state.nodeId = nodeId;

  if (node.set) applySets(node.set);

  if (node.type === "title") {
    topbar.hidden = true;
    setBackground("city");
    await audio.playBgm("horror");
    audio.stopHeartbeat();
    renderTitle();
    return;
  }

  topbar.hidden = false;
  updateStatus();

  if (node.bg) setBackground(node.bg, { death: node.ending === "death" });

  // Continuous bed: change with environment; false = intentional silence.
  if (Object.prototype.hasOwnProperty.call(node, "bgm")) {
    await audio.playBgm(node.bgm);
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
        i * 180
      );
    });
  }

  prefetchChoiceBackgrounds(node);

  if (node.type === "ending") {
    if (node.ending === "death") fireDeathFlash();
    renderEnding(node);
    return;
  }

  renderScene(node);
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

// Boot: warm assets, then title
audio.preload();
preloadImages();
go("title");
