// 班级预设页面逻辑

class ClassPicker {
  constructor() {
    // 检查 CLASS_DATA 是否已加载
  if (typeof window.CLASS_DATA === 'undefined') {
    console.error('CLASS_DATA not found!');
     this.students = [];
    } else {
     this.students = window.CLASS_DATA.students;
    }
    
  this.isRolling = false;
  this.lastWinnerIndex = -1;
    
    // DOM 元素
  this.pickBtn = document.getElementById('pickBtn');
  this.resetBtn = document.getElementById('resetBtn');
  this.resultContainer= document.getElementById('resultContainer');
  this.animationSelect = document.getElementById('animationSelect');
    
  this.init();
  }

  init() {
  if (this.students.length === 0) {
    console.error('No students data available');
      return;
    }
  this.bindEvents();
  }

  bindEvents() {
    // 抽人按钮
  this.pickBtn.addEventListener('click', () => this.pickStudent());
    
    // 重置按钮
  this.resetBtn.addEventListener('click', () => this.resetPick());
  }

  // 智能随机算法 - 避免连续抽中同一人
  getSmartRandomIndex() {
  if (this.students.length <= 1) {
      return 0;
    }
    
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.students.length);
    } while (newIndex === this.lastWinnerIndex && this.students.length > 1);
    
    return newIndex;
  }

  // 抽取学生
  pickStudent() {
  if (this.isRolling) return;
  if (this.students.length === 0) {
      alert('没有学生名单');
      return;
    }
    
  this.isRolling= true;
  this.pickBtn.disabled = true;
  this.resetBtn.disabled = true;
    
  const animationType= this.animationSelect.value;
    
    // 创建滚动显示元素
  const rollingElement = document.createElement('div');
  rollingElement.className = 'rolling-name';
  this.resultContainer.innerHTML = '';
  this.resultContainer.appendChild(rollingElement);
    
    // 预先确定最终获奖者（智能算法）
  const finalWinnerIndex= this.getSmartRandomIndex();
  const finalWinnerName = this.students[finalWinnerIndex];
    
    // 滚动动画参数
    let rollCount = 0;
  const minRolls = 25;
  const maxRolls = 35;
  const targetRolls = Math.floor(Math.random() * (maxRolls - minRolls + 1)) + minRolls;
    
    // 减速函数 - 让滚动逐渐变慢
  const getDelay = (count) => {
   if (count < 15) return 60;
   if (count < 25) return 80;
   if (count < 30) return 120;
      return 150 + (count - 30) * 20;
    };
    
    // 滚动函数
  const roll = () => {
   if (rollCount >= targetRolls) {
      this.finalizePick(finalWinnerName, animationType);
        return;
      }
      
      // 显示随机名字（滚动过程）
   const randomIndex= Math.floor(Math.random() * this.students.length);
   rollingElement.textContent = this.students[randomIndex];
      
   rollCount++;
      
      // 继续滚动
      setTimeout(roll, getDelay(rollCount));
    };
    
    // 开始滚动
  roll();
  }

  // 确定最终结果
  finalizePick(winnerName, animationType) {
    // 更新最后中奖者索引
  this.lastWinnerIndex= this.students.indexOf(winnerName);
    
    // 播放成功音效
  this.playSuccessSound();
    
    // 显示最终结果，应用过程动画
  this.resultContainer.innerHTML = `<div class="result-name animate-${animationType}">${winnerName}</div>`;
    
  const resultElement = this.resultContainer.querySelector('.result-name');
  const animationDuration = parseInt(getComputedStyle(resultElement).animationDuration) * 1000 || 1000;
    
    setTimeout(() => {
      resultElement.classList.remove(`animate-${animationType}`);
      void resultElement.offsetWidth;
    }, animationDuration);
    
  this.isRolling = false;
  this.pickBtn.disabled = false;
  this.resetBtn.disabled = false;
  }

  // 重置抽取
  resetPick() {
  this.resultContainer.innerHTML = '<p class="result-placeholder">准备好了吗？点击按钮开始抽人！</p>';
  this.playClickSound();
  }

  // 播放点击音效
  playClickSound() {
  if (window.soundEffect) {
    window.soundEffect.playClick();
    }
  }

  // 播放成功音效
  playSuccessSound() {
  if (window.soundEffect) {
    window.soundEffect.playSuccess();
    }
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  new ClassPicker();
});
