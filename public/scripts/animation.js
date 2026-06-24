// ============================================================
// 班级抽人工具 - 高级动画系统
// 纯 CSS + 少量 JS 实现，无第三方依赖
// ============================================================

class AnimationSystem {
  constructor() {
    // 滚动动画状态
    this.rollingPhase = 'fast'; // fast | medium | slow
    this.rollStartTime = 0;
    this.dynamicStyleEl = null;
    this.particleContainer = null;

    // 初始化
    this._injectDynamicStyles();
  }

  // ----------------------------------------------------------
  // 内部：注入动态 CSS（粒子容器、滚动增强等）
  // ----------------------------------------------------------
  _injectDynamicStyles() {
    if (document.getElementById('animation-system-styles')) return;

    const style = document.createElement('style');
    style.id = 'animation-system-styles';
    style.textContent = `
      /* ======== 粒子容器 ======== */
      .particle-container {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
        z-index: 10;
      }
      .particle {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        will-change: transform, opacity;
      }

      /* ======== 闪光层 ======== */
      .flash-overlay {
        position: absolute;
        inset: -50%;
        pointer-events: none;
        z-index: 5;
        border-radius: 50%;
        will-change: transform, opacity;
      }

      /* ======== 光环 ======== */
      .ring-burst {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        border-radius: 50%;
        border: 3px solid;
        pointer-events: none;
        z-index: 4;
        will-change: transform, opacity;
      }

      /* ======== 滚动名字增强 ======== */
      .rolling-name-enhanced {
        position: relative;
        will-change: filter, transform, opacity;
        transition: filter 0.05s linear, text-shadow 0.05s linear;
      }

      /* ======== 结果容器相对定位（给粒子用） ======== */
      .result-display {
        position: relative;
      }

      /* ======== 揭晓动画：名字元素基础 ======== */
      .reveal-name {
        position: relative;
        display: inline-block;
        z-index: 2;
      }

      /* ======== 5 种揭晓动画 @keyframes ======== */

      /* --- 1. 闪光扩散 (flash) --- */
      @keyframes revealFlash {
        0% {
          opacity: 0;
          transform: scale(0.3);
          filter: blur(20px) brightness(3);
          text-shadow:
            0 0 40px rgba(255, 255, 255, 0.9),
            0 0 80px rgba(0, 212, 255, 0.6),
            0 0 120px rgba(168, 85, 247, 0.4);
        }
        15% {
          opacity: 1;
          filter: blur(0) brightness(4);
          text-shadow:
            0 0 60px rgba(255, 255, 255, 1),
            0 0 120px rgba(0, 212, 255, 0.8),
            0 0 200px rgba(168, 85, 247, 0.5);
        }
        30% {
          filter: blur(0) brightness(1.5);
          text-shadow:
            0 0 20px rgba(0, 212, 255, 0.6),
            0 0 50px rgba(0, 212, 255, 0.3);
        }
        100% {
          opacity: 1;
          transform: scale(1);
          filter: blur(0) brightness(1);
          text-shadow:
            0 0 10px rgba(0, 212, 255, 0.5),
            0 0 30px rgba(0, 212, 255, 0.25),
            0 0 60px rgba(0, 212, 255, 0.1);
        }
      }

      @keyframes flashRingExpand {
        0% {
          transform: translate(-50%, -50%) scale(0);
          opacity: 1;
          border-width: 4px;
        }
        100% {
          transform: translate(-50%, -50%) scale(4);
          opacity: 0;
          border-width: 1px;
        }
      }

      @keyframes flashOverlayBurst {
        0% {
          transform: scale(0);
          opacity: 0.8;
        }
        40% {
          opacity: 0.3;
        }
        100% {
          transform: scale(3);
          opacity: 0;
        }
      }

      /* --- 2. 粒子爆炸 (particle) --- */
      @keyframes revealParticle {
        0% {
          opacity: 0;
          transform: scale(0.5) translateY(30px);
          filter: blur(8px);
        }
        30% {
          opacity: 1;
          transform: scale(1.15) translateY(-5px);
          filter: blur(0);
        }
        50% {
          transform: scale(0.95) translateY(2px);
        }
        70% {
          transform: scale(1.03) translateY(-1px);
        }
        100% {
          opacity: 1;
          transform: scale(1) translateY(0);
          filter: blur(0);
        }
      }

      @keyframes particleFly {
        0% {
          transform: translate(0, 0) scale(1);
          opacity: 1;
        }
        100% {
          transform: translate(var(--px), var(--py)) scale(0);
          opacity: 0;
        }
      }

      /* --- 3. 弹性缩放 (elastic) --- */
      @keyframes revealElastic {
        0% {
          opacity: 0;
          transform: scale(0);
          filter: blur(12px);
        }
        20% {
          opacity: 1;
          filter: blur(0);
        }
        40% {
          transform: scale(1.35);
        }
        55% {
          transform: scale(0.85);
        }
        70% {
          transform: scale(1.12);
        }
        82% {
          transform: scale(0.95);
        }
        92% {
          transform: scale(1.04);
        }
        100% {
          opacity: 1;
          transform: scale(1);
          filter: blur(0);
        }
      }

      @keyframes elasticGlow {
        0% {
          box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.6);
        }
        30% {
          box-shadow: 0 0 40px 20px rgba(0, 212, 255, 0.3),
                      0 0 80px 40px rgba(168, 85, 247, 0.15);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(0, 212, 255, 0);
        }
      }

      /* --- 4. 故障闪烁 (glitch) --- */
      @keyframes revealGlitch {
        0% {
          opacity: 0;
          transform: translate(0, 0) skewX(0);
          filter: blur(4px);
        }
        5% {
          opacity: 1;
          transform: translate(-8px, 3px) skewX(-8deg);
          filter: blur(0);
          clip-path: inset(10% 0 60% 0);
        }
        10% {
          transform: translate(6px, -2px) skewX(5deg);
          clip-path: inset(40% 0 20% 0);
        }
        15% {
          transform: translate(-4px, 1px) skewX(-3deg);
          clip-path: inset(70% 0 5% 0);
        }
        20% {
          transform: translate(3px, -1px) skewX(2deg);
          clip-path: inset(0 0 0 0);
        }
        25% {
          transform: translate(-2px, 0) skewX(-1deg);
          clip-path: inset(20% 0 50% 0);
        }
        30% {
          transform: translate(0, 0) skewX(0);
          clip-path: inset(0 0 0 0);
        }
        35% {
          transform: translate(5px, -2px) skewX(4deg);
          clip-path: inset(50% 0 10% 0);
        }
        40% {
          transform: translate(-3px, 1px) skewX(-2deg);
          clip-path: inset(0 0 0 0);
        }
        50% {
          transform: translate(0, 0) skewX(0);
          clip-path: inset(0 0 0 0);
          opacity: 1;
        }
        55% {
          transform: translate(2px, 0) skewX(1deg);
          clip-path: inset(30% 0 40% 0);
        }
        60% {
          transform: translate(0, 0) skewX(0);
          clip-path: inset(0 0 0 0);
        }
        100% {
          opacity: 1;
          transform: translate(0, 0) skewX(0);
          filter: blur(0);
          clip-path: inset(0 0 0 0);
        }
      }

      @keyframes glitchShadow {
        0%, 100% {
          text-shadow:
            2px 0 rgba(255, 45, 120, 0.7),
            -2px 0 rgba(0, 212, 255, 0.7);
        }
        25% {
          text-shadow:
            -3px 1px rgba(255, 45, 120, 0.5),
            3px -1px rgba(0, 212, 255, 0.5);
        }
        50% {
          text-shadow:
            1px -2px rgba(255, 45, 120, 0.6),
            -1px 2px rgba(0, 212, 255, 0.6);
        }
        75% {
          text-shadow:
            -2px 0 rgba(255, 45, 120, 0.4),
            2px 0 rgba(0, 212, 255, 0.4);
        }
      }

      /* --- 5. 极光环绕 (aurora) --- */
      @keyframes revealAurora {
        0% {
          opacity: 0;
          transform: scale(0.6) rotate(-5deg);
          filter: blur(10px) hue-rotate(0deg);
        }
        25% {
          opacity: 1;
          transform: scale(1.1) rotate(2deg);
          filter: blur(0) hue-rotate(60deg);
        }
        45% {
          transform: scale(0.95) rotate(-1deg);
          filter: blur(0) hue-rotate(120deg);
        }
        65% {
          transform: scale(1.05) rotate(0.5deg);
          filter: blur(0) hue-rotate(180deg);
        }
        85% {
          transform: scale(0.98) rotate(0);
          filter: blur(0) hue-rotate(300deg);
        }
        100% {
          opacity: 1;
          transform: scale(1) rotate(0);
          filter: blur(0) hue-rotate(360deg);
        }
      }

      @keyframes auroraOrbit {
        0% {
          transform: translate(-50%, -50%) rotate(0deg) scale(0);
          opacity: 0;
        }
        20% {
          opacity: 0.8;
          transform: translate(-50%, -50%) rotate(72deg) scale(1);
        }
        80% {
          opacity: 0.6;
        }
        100% {
          transform: translate(-50%, -50%) rotate(360deg) scale(1.5);
          opacity: 0;
        }
      }

      @keyframes auroraRing {
        0% {
          transform: translate(-50%, -50%) scale(0);
          opacity: 0.6;
          border-width: 3px;
        }
        100% {
          transform: translate(-50%, -50%) scale(3.5);
          opacity: 0;
          border-width: 1px;
        }
      }

      /* ======== 应用揭晓动画的类 ======== */
      .animate-flash {
        animation: revealFlash 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .animate-particle {
        animation: revealParticle 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }

      .animate-elastic {
        animation: revealElastic 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }

      .animate-glitch {
        animation: revealGlitch 1s steps(1) forwards,
                   glitchShadow 1s steps(1) forwards;
      }

      .animate-aurora {
        animation: revealAurora 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      /* ======== 滚动阶段视觉反馈 ======== */
      .rolling-fast {
        filter: blur(2px) brightness(1.3);
        text-shadow:
          0 0 15px rgba(255, 45, 120, 0.7),
          0 0 40px rgba(255, 45, 120, 0.3);
        transform: scale(1.08);
      }

      .rolling-medium {
        filter: blur(1px) brightness(1.15);
        text-shadow:
          0 0 10px rgba(168, 85, 247, 0.6),
          0 0 30px rgba(168, 85, 247, 0.25);
        transform: scale(1.04);
      }

      .rolling-slow {
        filter: blur(0.5px) brightness(1.05);
        text-shadow:
          0 0 8px rgba(0, 212, 255, 0.5),
          0 0 20px rgba(0, 212, 255, 0.2);
        transform: scale(1.01);
      }

      .rolling-stop {
        filter: blur(0) brightness(1);
        text-shadow:
          0 0 10px rgba(0, 212, 255, 0.5),
          0 0 30px rgba(0, 212, 255, 0.25),
          0 0 60px rgba(0, 212, 255, 0.1);
        transform: scale(1);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* ======== 页面切换过渡 ======== */
      @keyframes sectionFadeOut {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-20px);
        }
      }

      @keyframes sectionFadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .section-exit {
        animation: sectionFadeOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .section-enter {
        animation: sectionFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      /* ======== Reduce motion ======== */
      @media (prefers-reduced-motion: reduce) {
        .particle-container,
        .flash-overlay,
        .ring-burst {
          display: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // ----------------------------------------------------------
  // 滚动动画：获取名字切换延迟
  // 先快后慢的减速曲线
  // ----------------------------------------------------------
  getRollDelay(rollCount, targetRolls) {
    const progress = rollCount / targetRolls;

    if (progress < 0.4) {
      // 快速阶段：50-70ms
      return 50 + progress * 50;
    } else if (progress < 0.7) {
      // 中速阶段：70-150ms
      const t = (progress - 0.4) / 0.3;
      return 70 + t * 80;
    } else if (progress < 0.9) {
      // 减速阶段：150-300ms
      const t = (progress - 0.7) / 0.2;
      return 150 + t * 150;
    } else {
      // 最终慢速：300-500ms（弹性缓动）
      const t = (progress - 0.9) / 0.1;
      return 300 + t * t * 200;
    }
  }

  // ----------------------------------------------------------
  // 滚动动画：根据进度更新视觉效果
  // ----------------------------------------------------------
  updateRollingVisual(element, rollCount, targetRolls) {
    const progress = rollCount / targetRolls;

    // 移除旧的阶段类
    element.classList.remove('rolling-fast', 'rolling-medium', 'rolling-slow', 'rolling-stop');

    if (progress < 0.4) {
      element.classList.add('rolling-fast');
    } else if (progress < 0.7) {
      element.classList.add('rolling-medium');
    } else if (progress < 0.95) {
      element.classList.add('rolling-slow');
    } else {
      element.classList.add('rolling-stop');
    }
  }

  // ----------------------------------------------------------
  // 滚动动画：名称切换时的微动画
  // ----------------------------------------------------------
  onNameChange(element, rollCount, targetRolls) {
    const progress = rollCount / targetRolls;

    // 快速阶段：随机方向的微位移
    if (progress < 0.5) {
      const offsetX = (Math.random() - 0.5) * 6 * (1 - progress);
      const offsetY = (Math.random() - 0.5) * 3 * (1 - progress);
      element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    } else {
      element.style.transform = '';
    }
  }

  // ----------------------------------------------------------
  // 揭晓动画：闪光扩散
  // ----------------------------------------------------------
  revealFlash(container, element) {
    const display = container.closest('.result-display') || container.parentElement;

    // 创建闪光层
    const flash = document.createElement('div');
    flash.className = 'flash-overlay';
    flash.style.cssText = `
      left: 50%; top: 50%;
      width: 200px; height: 200px;
      transform: translate(-50%, -50%) scale(0);
      background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(0,212,255,0.3) 40%, transparent 70%);
      animation: flashOverlayBurst 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    `;
    display.appendChild(flash);

    // 创建光环
    const colors = [
      'rgba(0, 212, 255, 0.6)',
      'rgba(168, 85, 247, 0.4)',
      'rgba(255, 45, 120, 0.3)'
    ];
    colors.forEach((color, i) => {
      const ring = document.createElement('div');
      ring.className = 'ring-burst';
      ring.style.cssText = `
        width: 100px; height: 100px;
        border-color: ${color};
        animation: flashRingExpand ${0.6 + i * 0.15}s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.08}s forwards;
      `;
      display.appendChild(ring);
    });

    // 应用动画到名字
    element.classList.add('animate-flash');

    // 清理
    setTimeout(() => {
      flash.remove();
      display.querySelectorAll('.ring-burst').forEach(r => r.remove());
      element.classList.remove('animate-flash');
      void element.offsetWidth;
    }, 1200);
  }

  // ----------------------------------------------------------
  // 揭晓动画：粒子爆炸
  // ----------------------------------------------------------
  revealParticle(container, element) {
    const display = container.closest('.result-display') || container.parentElement;

    // 创建粒子容器
    let pContainer = display.querySelector('.particle-container');
    if (!pContainer) {
      pContainer = document.createElement('div');
      pContainer.className = 'particle-container';
      display.appendChild(pContainer);
    }

    // 生成粒子
    const particleCount = 40;
    const colors = [
      '#00d4ff', '#a855f7', '#ff2d78',
      '#ffd700', '#00ff88', '#ff6b35'
    ];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';

      const size = 4 + Math.random() * 8;
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const distance = 80 + Math.random() * 160;
      const px = Math.cos(angle) * distance;
      const py = Math.sin(angle) * distance;
      const duration = 0.6 + Math.random() * 0.5;
      const delay = Math.random() * 0.15;
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: 50%; top: 50%;
        background: ${color};
        box-shadow: 0 0 ${size * 2}px ${color};
        --px: ${px}px; --py: ${py}px;
        animation: particleFly ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards;
      `;

      pContainer.appendChild(particle);
    }

    // 应用动画到名字
    element.classList.add('animate-particle');

    // 清理
    setTimeout(() => {
      pContainer.innerHTML = '';
      element.classList.remove('animate-particle');
      void element.offsetWidth;
    }, 1500);
  }

  // ----------------------------------------------------------
  // 揭晓动画：弹性缩放
  // ----------------------------------------------------------
  revealElastic(container, element) {
    const display = container.closest('.result-display') || container.parentElement;

    // 创建光晕背景
    const glow = document.createElement('div');
    glow.className = 'flash-overlay';
    glow.style.cssText = `
      left: 50%; top: 50%;
      width: 300px; height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0,212,255,0.15) 0%, rgba(168,85,247,0.08) 50%, transparent 70%);
      transform: translate(-50%, -50%) scale(0);
      animation: flashOverlayBurst 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    `;
    display.appendChild(glow);

    // 应用弹性动画
    element.classList.add('animate-elastic');

    // 清理
    setTimeout(() => {
      glow.remove();
      element.classList.remove('animate-elastic');
      void element.offsetWidth;
    }, 1500);
  }

  // ----------------------------------------------------------
  // 揭晓动画：故障闪烁
  // ----------------------------------------------------------
  revealGlitch(container, element) {
    // 应用故障动画
    element.classList.add('animate-glitch');

    // 创建伪故障条纹
    const display = container.closest('.result-display') || container.parentElement;
    const stripeCount = 6;
    for (let i = 0; i < stripeCount; i++) {
      const stripe = document.createElement('div');
      const top = Math.random() * 100;
      const height = 2 + Math.random() * 8;
      const offset = (Math.random() - 0.5) * 20;
      const delay = Math.random() * 0.3;

      stripe.style.cssText = `
        position: absolute;
        top: ${top}%; left: 0; right: 0;
        height: ${height}px;
        background: rgba(0, 212, 255, 0.15);
        transform: translateX(${offset}px);
        pointer-events: none;
        z-index: 3;
        opacity: 0;
        animation: glitchStripeFade 0.4s ${delay}s forwards;
      `;
      display.appendChild(stripe);

      setTimeout(() => stripe.remove(), 800);
    }

    // 注入条纹动画（如果不存在）
    if (!document.getElementById('glitch-stripe-keyframes')) {
      const s = document.createElement('style');
      s.id = 'glitch-stripe-keyframes';
      s.textContent = `
        @keyframes glitchStripeFade {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0; }
        }
      `;
      document.head.appendChild(s);
    }

    // 清理
    setTimeout(() => {
      element.classList.remove('animate-glitch');
      void element.offsetWidth;
    }, 1200);
  }

  // ----------------------------------------------------------
  // 揭晓动画：极光环绕
  // ----------------------------------------------------------
  revealAurora(container, element) {
    const display = container.closest('.result-display') || container.parentElement;

    // 创建极光轨道光点
    const orbCount = 5;
    const orbColors = [
      '#00d4ff', '#a855f7', '#ff2d78', '#ffd700', '#00ff88'
    ];

    for (let i = 0; i < orbCount; i++) {
      const orb = document.createElement('div');
      const size = 8 + Math.random() * 12;
      const color = orbColors[i];
      const duration = 1 + Math.random() * 0.5;
      const delay = i * 0.12;

      orb.style.cssText = `
        position: absolute;
        top: 50%; left: 50%;
        width: ${size}px; height: ${size}px;
        border-radius: 50%;
        background: ${color};
        box-shadow: 0 0 ${size * 3}px ${color}, 0 0 ${size * 6}px ${color};
        pointer-events: none;
        z-index: 4;
        animation: auroraOrbit ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards;
      `;
      display.appendChild(orb);
    }

    // 创建扩散光环
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement('div');
      ring.className = 'ring-burst';
      const color = orbColors[i];
      ring.style.cssText = `
        width: 80px; height: 80px;
        border-color: ${color};
        animation: auroraRing ${0.8 + i * 0.2}s cubic-bezier(0.16, 1, 0.3, 1) ${0.2 + i * 0.1}s forwards;
      `;
      display.appendChild(ring);
    }

    // 应用极光动画到名字
    element.classList.add('animate-aurora');

    // 清理
    setTimeout(() => {
      display.querySelectorAll('.ring-burst').forEach(r => r.remove());
      element.classList.remove('animate-aurora');
      void element.offsetWidth;
    }, 2000);
  }

  // ----------------------------------------------------------
  // 入口：播放揭晓动画
  // ----------------------------------------------------------
  playReveal(container, element, animationType) {
    switch (animationType) {
      case 'flash':
        this.revealFlash(container, element);
        break;
      case 'particle':
        this.revealParticle(container, element);
        break;
      case 'elastic':
        this.revealElastic(container, element);
        break;
      case 'glitch':
        this.revealGlitch(container, element);
        break;
      case 'aurora':
        this.revealAurora(container, element);
        break;
      default:
        this.revealFlash(container, element);
    }
  }

  // ----------------------------------------------------------
  // 页面切换：带过渡效果的区域切换
  // ----------------------------------------------------------
  transitionSection(fromEl, toEl, callback) {
    if (!fromEl || !toEl) {
      if (callback) callback();
      return;
    }

    fromEl.classList.add('section-exit');

    setTimeout(() => {
      fromEl.style.display = 'none';
      fromEl.classList.remove('section-exit');

      toEl.style.display = 'block';
      toEl.classList.add('section-enter');

      setTimeout(() => {
        toEl.classList.remove('section-enter');
        if (callback) callback();
      }, 400);
    }, 300);
  }

  // ----------------------------------------------------------
  // 获取动画持续时间（用于 finalizePick 的 setTimeout）
  // ----------------------------------------------------------
  getAnimationDuration(animationType) {
    const durations = {
      flash: 1200,
      particle: 1500,
      elastic: 1500,
      glitch: 1200,
      aurora: 2000
    };
    return durations[animationType] || 1200;
  }
}

// 创建全局实例
window.animationSystem = new AnimationSystem();
