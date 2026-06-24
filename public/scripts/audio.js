/**
 * SoundEffect — Web Audio API 音效系统
 * 点击 · 滚动 · 揭晓（纯合成，零外部依赖）
 *
 * 用法：window.soundEffect.playClick() / playRoll() / playReveal()
 * 懒初始化：首次 play 时才创建 AudioContext
 */

class SoundEffect {
  constructor() {
    /** @type {AudioContext|null} */
    this.ctx = null;
    /** @type {boolean} */
    this.ready = false;
    /** @type {ConvolverNode|null} 混响总线 */
    this._revBus = null;
  }

  /* ======================== 初始化 ======================== */

  init() {
    if (this.ready) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      this._buildIR();
      this._initReverbBus();
      this.ready = true;
    } catch (_) {
      console.warn('SoundEffect: Web Audio API 不可用');
    }
  }

  /**
   * 生成 2.5 秒合成混响脉冲响应
   * 双声道指数衰减随机噪声，模拟中等大小房间
   */
  _buildIR() {
    const sr = this.ctx.sampleRate;
    const len = (sr * 2.5) | 0;
    const buf = this.ctx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
      }
    }
    this._ir = buf;
  }

  /** 初始化混响总线（所有音效共用单个 ConvolverNode） */
  _initReverbBus() {
    try {
      this._revBus = this.ctx.createConvolver();
      this._revBus.buffer = this._ir;
      this._revBus.connect(this.ctx.destination);
    } catch (_) {
      this._revBus = null;
    }
  }

  /**
   * 将源节点连接到输出（干声 + 可选混响发送）
   * @param {AudioNode} src  源节点
   * @param {number}    dry  干声增益 0~1
   * @param {number}    wet  混响发送增益 0~1
   */
  _out(src, dry = 1, wet = 0) {
    const dest = this.ctx.destination;
    if (dry > 0) {
      const g = this.ctx.createGain();
      g.gain.value = dry;
      src.connect(g);
      g.connect(dest);
    }
    if (wet > 0 && this._revBus) {
      const g = this.ctx.createGain();
      g.gain.value = wet;
      src.connect(g);
      g.connect(this._revBus);
    }
  }

  /**
   * 创建指定时长的白噪声 BufferSource
   * @param {number} dur 时长（秒）
   * @returns {AudioBufferSourceNode}
   */
  _noise(dur) {
    const len = (this.ctx.sampleRate * dur) | 0;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    return src;
  }

  /* ======================== 点击音效 ======================== *
   * 三层叠加：
   *   ① 带通噪声瞬态 — 物理 "clack" 攻击感
   *   ② 方波频率下扫  — "tok" 音色主体
   *   ③ 高频正弦闪光  — 金属光泽
   * 总时长 ~60ms，无混响
   */

  playClick() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // ① 攻击瞬态：带通滤波噪声
    const nz = this._noise(0.04);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 3500;
    bp.Q.value = 2;
    const nzG = this.ctx.createGain();
    nzG.gain.setValueAtTime(0.18, t);
    nzG.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    nz.connect(bp);
    bp.connect(nzG);
    this._out(nzG);
    nz.start(t);
    nz.stop(t + 0.04);

    // ② 主体：方波快速下扫
    const o1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    o1.type = 'square';
    o1.frequency.setValueAtTime(1700, t);
    o1.frequency.exponentialRampToValueAtTime(600, t + 0.04);
    g1.gain.setValueAtTime(0.12, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
    o1.connect(g1);
    this._out(g1);
    o1.start(t);
    o1.stop(t + 0.06);

    // ③ 高频金属泛音
    const o2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(4200, t);
    o2.frequency.exponentialRampToValueAtTime(2800, t + 0.018);
    g2.gain.setValueAtTime(0.06, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.028);
    o2.connect(g2);
    this._out(g2);
    o2.start(t);
    o2.stop(t + 0.035);
  }

  /* ======================== 滚动音效 ======================== *
   * 三层叠加：
   *   ① 低频正弦脉冲  — 95→60Hz 下扫，"thump" 体感
   *   ② 次谐波        — 48→30Hz，增加胸腔共振感
   *   ③ 三角波 tick   — 400Hz 短瞬态，节奏定义
   * 总时长 ~85ms，无混响
   */

  playRoll() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // ① 主脉冲
    const o1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    o1.type = 'sine';
    o1.frequency.setValueAtTime(95, t);
    o1.frequency.exponentialRampToValueAtTime(60, t + 0.065);
    g1.gain.setValueAtTime(0.25, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    o1.connect(g1);
    this._out(g1);
    o1.start(t);
    o1.stop(t + 0.085);

    // ② 次谐波
    const o2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(48, t);
    o2.frequency.exponentialRampToValueAtTime(30, t + 0.065);
    g2.gain.setValueAtTime(0.15, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    o2.connect(g2);
    this._out(g2);
    o2.start(t);
    o2.stop(t + 0.085);

    // ③ 微弱 tick
    const o3 = this.ctx.createOscillator();
    const g3 = this.ctx.createGain();
    o3.type = 'triangle';
    o3.frequency.value = 400;
    g3.gain.setValueAtTime(0.04, t);
    g3.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
    o3.connect(g3);
    this._out(g3);
    o3.start(t);
    o3.stop(t + 0.025);
  }

  /* ======================== 揭晓音效 ======================== *
   * 四个阶段：
   *   Phase 1 (0.00~0.30s) — 加速上升琶音 C5→E5→G5→C6→E6
   *   Phase 2 (0.30~0.45s) — 期待间隙（静音）
   *   Phase 3 (0.45s~)     — 大和弦爆发（锯齿泛音层 + 正弦主体 + 失谐加厚）
   *   Phase 4 (0.57s~)     — 高频闪光点缀 C7→E7→G7
   * 总时长 ~2.5s（含混响衰减），带大混响
   */

  playReveal() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // ---- Phase 1: 加速上升琶音 ----
    const arpFreqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    const arpTimes = [0.00, 0.08, 0.15, 0.21, 0.26];

    arpFreqs.forEach((freq, i) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      const st = t + arpTimes[i];
      g.gain.setValueAtTime(0, st);
      g.gain.linearRampToValueAtTime(0.22, st + 0.025);
      g.gain.exponentialRampToValueAtTime(0.001, st + 0.18);
      o.connect(g);
      this._out(g, 0.8, 0.25);
      o.start(st);
      o.stop(st + 0.2);
    });

    // ---- Phase 3: 大和弦爆发 ----
    const cT = t + 0.45;

    // A. 锯齿波泛音层（经低通滤波，缓慢关闭）
    const sawFreqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    sawFreqs.forEach((freq) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.value = freq;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(5000, cT);
      lp.frequency.exponentialRampToValueAtTime(800, cT + 1.8);
      g.gain.setValueAtTime(0, cT);
      g.gain.linearRampToValueAtTime(0.03, cT + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, cT + 1.8);
      o.connect(lp);
      lp.connect(g);
      this._out(g, 0.5, 0.5);
      o.start(cT);
      o.stop(cT + 1.9);
    });

    // B. 正弦波主体层（清晰明亮）
    const mainFreqs = [523.25, 659.25, 783.99, 1046.50];
    mainFreqs.forEach((freq) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, cT);
      g.gain.linearRampToValueAtTime(0.15, cT + 0.02);
      g.gain.exponentialRampToValueAtTime(0.008, cT + 0.8);
      g.gain.exponentialRampToValueAtTime(0.001, cT + 2.2);
      o.connect(g);
      this._out(g, 0.6, 0.4);
      o.start(cT);
      o.stop(cT + 2.3);
    });

    // C. 微失谐副本（+0.3%，合唱/加厚效果）
    mainFreqs.forEach((freq) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq * 1.003;
      g.gain.setValueAtTime(0, cT);
      g.gain.linearRampToValueAtTime(0.06, cT + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, cT + 1.5);
      o.connect(g);
      this._out(g, 0.5, 0.5);
      o.start(cT);
      o.stop(cT + 1.6);
    });

    // ---- Phase 4: 高频闪光点缀 ----
    const sT = cT + 0.12;
    [2093.00, 2637.02, 3135.96].forEach((freq, i) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      const st = sT + i * 0.05;
      g.gain.setValueAtTime(0, st);
      g.gain.linearRampToValueAtTime(0.05, st + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, st + 0.5);
      o.connect(g);
      this._out(g, 0.4, 0.6);
      o.start(st);
      o.stop(st + 0.55);
    });
  }

  /** @deprecated 使用 playReveal() 代替 */
  playSuccess() {
    this.playReveal();
  }
}

// 全局单例（懒初始化）
window.soundEffect = new SoundEffect();
