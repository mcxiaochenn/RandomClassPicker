// 音频效果生成器 - 使用 Web Audio API

class SoundEffect {
  constructor() {
    this.audioContext = null;
    this.initialized = false;
  }

  // 初始化音频上下文
  init() {
   if (!this.initialized) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.initialized = true;
      } catch (error) {
       console.warn('Web Audio API 不支持');
      }
    }
  }

  // 播放点击音效（短促的"滴"声）
  playClick() {
    this.init();
   if (!this.audioContext) return;

   const oscillator = this.audioContext.createOscillator();
   const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 设置音调（高频短音）
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    // 设置音量包络
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    // 播放
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // 播放成功音效（欢快的 ascending 音效）
  playSuccess() {
    this.init();
   if (!this.audioContext) return;

   const now = this.audioContext.currentTime;
    
    // 播放三个音符的和弦效果
    [523.25, 659.25, 783.99].forEach((freq, index) => {
     const oscillator = this.audioContext.createOscillator();
     const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      // 错开时间播放，形成 ascending 效果
     const startTime = now + index * 0.1;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });

    // 添加一个高音结尾
    setTimeout(() => {
     const oscillator = this.audioContext.createOscillator();
     const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = 1046.50; // C6
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.4);
    }, 300);
  }

  // 播放滚动音效（低频嗡嗡声）
  playRoll() {
    this.init();
   if (!this.audioContext) return;

   const oscillator = this.audioContext.createOscillator();
   const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = 200;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }
}

// 创建全局实例
window.soundEffect = new SoundEffect();
