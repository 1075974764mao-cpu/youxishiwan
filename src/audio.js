const BGM = {
  title: "/audio/bgm-horror.mp3",
  horror: "/audio/bgm-horror.mp3",
  tension: "/audio/bgm-tension.mp3",
  ambient: "/audio/bgm-ambient.mp3",
  sad: "/audio/bgm-sad.mp3",
};

const SFX = {
  click: "/audio/sfx-click.wav",
  door: "/audio/sfx-door.ogg",
  doorOpen: "/audio/sfx-door-open.ogg",
  slam: "/audio/sfx-slam.ogg",
  hit: "/audio/sfx-hit.ogg",
  impact: "/audio/sfx-impact.ogg",
  growl: "/audio/sfx-growl.mp3",
  zombie: "/audio/sfx-zombie.mp3",
  heartbeat: "/audio/sfx-heartbeat.mp3",
  heartbeatFast: "/audio/sfx-heartbeat-fast.mp3",
};

function makeBgmEl() {
  const a = new Audio();
  a.loop = true;
  a.preload = "auto";
  a.volume = 0;
  return a;
}

export class AudioDirector {
  constructor() {
    this.muted = false;
    this.unlocked = false;
    this.desiredBgm = null;
    this.currentBgm = null;
    this.active = makeBgmEl();
    this.idle = makeBgmEl();
    this.heartbeat = null;
    this._fadeRaf = 0;
    this._cache = new Map();
    this._bgmReady = new Map();
  }

  /** Warm decoder cache so scene switches start faster. */
  preload() {
    // Critical path: click + current horror bed.
    this._warm(BGM.horror);
    this._warm(SFX.click);
  }

  /** Full library — call after first user gesture. */
  preloadDeep() {
    for (const src of [...Object.values(BGM), ...Object.values(SFX)]) {
      this._warm(src);
    }
  }

  _warm(src) {
    if (!src || this._cache.has(src)) return this._cache.get(src);
    const a = new Audio();
    a.preload = "auto";
    a.src = src;
    // Nudge network without playing.
    try {
      a.load();
    } catch {
      /* ignore */
    }
    this._cache.set(src, a);
    const ready = new Promise((resolve) => {
      const done = () => resolve();
      if (a.readyState >= 3) {
        done();
        return;
      }
      a.addEventListener("canplaythrough", done, { once: true });
      a.addEventListener("error", done, { once: true });
      setTimeout(done, 4000);
    });
    this._bgmReady.set(src, ready);
    return a;
  }

  async unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    try {
      const silent = new Audio(
        "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
      );
      silent.volume = 0.01;
      await Promise.race([
        silent.play().then(() => {
          silent.pause();
        }),
        new Promise((r) => setTimeout(r, 300)),
      ]).catch(() => {});
    } catch {
      /* ignore */
    }
    this.preloadDeep();
    if (this.desiredBgm) {
      const key = this.desiredBgm;
      this.currentBgm = null;
      this.playBgm(key);
    }
  }

  setMuted(muted) {
    this.muted = muted;
    this.active.muted = muted;
    this.idle.muted = muted;
    if (this.heartbeat) this.heartbeat.muted = muted;
    if (!muted && this.unlocked && this.desiredBgm && this.active.paused) {
      this.active.play().catch(() => {});
    }
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  targetVolume(key) {
    if (key === "sad") return 0.38;
    if (key === "ambient") return 0.28;
    if (key === "tension") return 0.32;
    return 0.3;
  }

  /**
   * Keep ambient bed continuous across scenes.
   * Pass false / "none" / "silence" to fade out for quiet/horror stillness.
   * Never required to be awaited by UI — returns a promise for callers that want it.
   */
  async playBgm(key) {
    if (key === false || key === "none" || key === "silence") {
      this.desiredBgm = null;
      this.fadeOutStop();
      return;
    }
    const src = BGM[key];
    if (!src) return;
    this.desiredBgm = key;
    if (this.currentBgm === key && !this.active.paused) return;

    this._warm(src);
    const next = this.idle;
    const prev = this.active;

    if (!next.src || !String(next.src).includes(src)) {
      next.src = src;
    }

    try {
      next.currentTime = 0;
    } catch {
      /* ignore seek errors while loading */
    }
    next.volume = 0;
    next.muted = this.muted;

    if (!this.muted && this.unlocked) {
      try {
        await next.play();
      } catch {
        /* still blocked until gesture */
      }
    }

    const target = this.targetVolume(key);
    await this.crossfade(prev, next, target, 520);
    this.active = next;
    this.idle = prev;
    this.currentBgm = key;
  }

  crossfade(fromEl, toEl, targetVol, ms = 520) {
    return new Promise((resolve) => {
      if (this._fadeRaf) cancelAnimationFrame(this._fadeRaf);
      const fromStart = fromEl.volume;
      const t0 = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - t0) / ms);
        fromEl.volume = Math.max(0, fromStart * (1 - t));
        toEl.volume = Math.min(targetVol, targetVol * t);
        if (t < 1) {
          this._fadeRaf = requestAnimationFrame(step);
        } else {
          this._fadeRaf = 0;
          fromEl.pause();
          fromEl.volume = 0;
          toEl.volume = targetVol;
          resolve();
        }
      };
      this._fadeRaf = requestAnimationFrame(step);
    });
  }

  fadeOutStop(ms = 420) {
    return new Promise((resolve) => {
      if (this._fadeRaf) cancelAnimationFrame(this._fadeRaf);
      const el = this.active;
      const start = el.volume;
      if (!this.currentBgm && el.paused) {
        this.currentBgm = null;
        resolve();
        return;
      }
      const t0 = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - t0) / ms);
        el.volume = Math.max(0, start * (1 - t));
        if (t < 1) {
          this._fadeRaf = requestAnimationFrame(step);
        } else {
          this._fadeRaf = 0;
          el.pause();
          el.volume = 0;
          this.currentBgm = null;
          resolve();
        }
      };
      this._fadeRaf = requestAnimationFrame(step);
    });
  }

  stopBgm() {
    if (this._fadeRaf) cancelAnimationFrame(this._fadeRaf);
    this.active.pause();
    this.idle.pause();
    this.active.volume = 0;
    this.idle.volume = 0;
    this.currentBgm = null;
    this.desiredBgm = null;
  }

  playSfx(key, { volume = 0.55, loop = false } = {}) {
    if (this.muted || !this.unlocked) return null;
    const src = SFX[key];
    if (!src) return null;
    // Clone from warm cache when available for lower latency.
    const cached = this._cache.get(src);
    const a = cached ? cached.cloneNode() : new Audio(src);
    a.volume = volume;
    a.loop = loop;
    a.play().catch(() => {});
    return a;
  }

  startHeartbeat(fast = false) {
    this.stopHeartbeat();
    if (this.muted || !this.unlocked) return;
    this.heartbeat = this.playSfx(fast ? "heartbeatFast" : "heartbeat", {
      volume: 0.35,
      loop: true,
    });
  }

  stopHeartbeat() {
    if (this.heartbeat) {
      this.heartbeat.pause();
      this.heartbeat = null;
    }
  }
}
