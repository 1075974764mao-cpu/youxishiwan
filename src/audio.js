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
    this._fadeTimer = null;
    this._cache = new Map();
  }

  /** Warm decoder cache so scene switches start faster. */
  preload() {
    for (const src of [...Object.values(BGM), ...Object.values(SFX)]) {
      if (this._cache.has(src)) continue;
      const a = new Audio();
      a.preload = "auto";
      a.src = src;
      this._cache.set(src, a);
    }
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
    // Replay desired BGM now that a gesture unlocked audio.
    if (this.desiredBgm) {
      const key = this.desiredBgm;
      this.currentBgm = null;
      await this.playBgm(key);
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
   */
  async playBgm(key) {
    if (key === false || key === "none" || key === "silence") {
      this.desiredBgm = null;
      await this.fadeOutStop();
      return;
    }
    const src = BGM[key];
    if (!src) return;
    this.desiredBgm = key;
    if (this.currentBgm === key && !this.active.paused) return;

    const next = this.idle;
    const prev = this.active;
    next.src = src;
    next.currentTime = 0;
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
    await this.crossfade(prev, next, target);
    this.active = next;
    this.idle = prev;
    this.currentBgm = key;
  }

  crossfade(fromEl, toEl, targetVol, ms = 900) {
    return new Promise((resolve) => {
      if (this._fadeTimer) clearInterval(this._fadeTimer);
      const steps = 18;
      const fromStart = fromEl.volume;
      let i = 0;
      this._fadeTimer = setInterval(() => {
        i += 1;
        const t = i / steps;
        fromEl.volume = Math.max(0, fromStart * (1 - t));
        toEl.volume = Math.min(targetVol, targetVol * t);
        if (i >= steps) {
          clearInterval(this._fadeTimer);
          this._fadeTimer = null;
          fromEl.pause();
          fromEl.volume = 0;
          toEl.volume = targetVol;
          resolve();
        }
      }, ms / steps);
    });
  }

  fadeOutStop(ms = 700) {
    return new Promise((resolve) => {
      if (this._fadeTimer) clearInterval(this._fadeTimer);
      const el = this.active;
      const start = el.volume;
      if (!this.currentBgm && el.paused) {
        this.currentBgm = null;
        resolve();
        return;
      }
      const steps = 14;
      let i = 0;
      this._fadeTimer = setInterval(() => {
        i += 1;
        el.volume = Math.max(0, start * (1 - i / steps));
        if (i >= steps) {
          clearInterval(this._fadeTimer);
          this._fadeTimer = null;
          el.pause();
          el.volume = 0;
          this.currentBgm = null;
          resolve();
        }
      }, ms / steps);
    });
  }

  stopBgm() {
    if (this._fadeTimer) clearInterval(this._fadeTimer);
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
    const a = new Audio(src);
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
