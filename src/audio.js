const BGM = {
  title: "/audio/bgm-horror.mp3",
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
  heartbeat: "/audio/sfx-heartbeat.wav",
  heartbeatFast: "/audio/sfx-heartbeat-fast.wav",
};

export class AudioDirector {
  constructor() {
    this.muted = false;
    this.unlocked = false;
    this.bgm = new Audio();
    this.bgm.loop = true;
    this.bgm.volume = 0.32;
    this.currentBgm = null;
    this.heartbeat = null;
  }

  async unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    try {
      // Resume audio context via a short silent buffer — avoid awaiting
      // play() on an empty <audio> src (can hang in some headless browsers).
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
  }

  setMuted(muted) {
    this.muted = muted;
    this.bgm.muted = muted;
    if (this.heartbeat) this.heartbeat.muted = muted;
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  async playBgm(key) {
    const src = BGM[key];
    if (!src || this.currentBgm === key) return;
    this.currentBgm = key;
    this.bgm.src = src;
    this.bgm.volume = key === "sad" ? 0.38 : 0.3;
    if (!this.muted && this.unlocked) {
      try {
        await this.bgm.play();
      } catch {
        /* autoplay may still be blocked until gesture */
      }
    }
  }

  stopBgm() {
    this.bgm.pause();
    this.currentBgm = null;
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
