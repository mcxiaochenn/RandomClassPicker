// 班级抽人工具 - 主逻辑

class RandomPicker {
  constructor() {
    this.students = [];
    this.isRolling = false;
    this.lastWinnerIndex= -1; // 记录上次中奖者索引
    
    // DOM 元素
    this.fileInput = document.getElementById('fileInput');
    this.fileName = document.getElementById('fileName');
    this.manualInput = document.getElementById('manualInput');
    this.loadBtn = document.getElementById('loadBtn');
    this.studentCount = document.getElementById('studentCount');
    this.uploadSection = document.getElementById('uploadSection');
    this.pickSection = document.getElementById('pickSection');
    this.pickBtn = document.getElementById('pickBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.backBtn = document.getElementById('backBtn');
    this.resultContainer = document.getElementById('resultContainer');
    this.animationSelect = document.getElementById('animationSelect');
    this.clickSound = document.getElementById('clickSound');
    this.successSound = document.getElementById('successSound');
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkUrlForClass();
  }

  bindEvents() {
    // 文件选择
    this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    
    // 加载名单
    this.loadBtn.addEventListener('click', () => this.loadStudents());
    
    // 抽人按钮
    this.pickBtn.addEventListener('click', () => this.pickStudent());
    
    // 重置按钮
    this.resetBtn.addEventListener('click', () => this.resetPick());
    
    // 返回按钮
    this.backBtn.addEventListener('click', () => this.backToUpload());
  }

  // 检查 URL 是否包含班级预设
  async checkUrlForClass() {
   const path = window.location.pathname;
   const classMatch = path.match(/^\/js(\d+)$/);
    
   if (classMatch) {
     const classId = classMatch[0];
      try {
       const response = await fetch(`/data/classes${classId}.json`);
       if (response.ok) {
         const data = await response.json();
          this.students = data.students;
          this.showPickSection();
          this.updateStudentCount();
          this.resultContainer.innerHTML = `
            <p class="result-placeholder">已加载 ${data.class_name} 班级名单，共 ${this.students.length} 人</p>
          `;
        }
      } catch (error) {
       console.log('未找到预设班级数据');
      }
    }
  }

  // 处理文件选择
  handleFileSelect(e) {
   const file = e.target.files[0];
   if (file) {
      this.fileName.textContent = file.name;
    } else {
      this.fileName.textContent = '未选择文件';
    }
  }

  // 加载学生名单
  async loadStudents() {
   const file = this.fileInput.files[0];
   const manualText = this.manualInput.value.trim();
    
    let names = [];
    
   if (file) {
      // 从文件读取
      try {
       const text = await this.readFile(file);
        names = this.parseNames(text);
      } catch (error) {
        alert('读取文件失败，请重试');
        return;
      }
    } else if (manualText) {
      // 从手动输入读取
      names = this.parseNames(manualText);
    } else {
      alert('请选择文件或者输入学生名字');
      return;
    }
    
   if (names.length === 0) {
      alert('未找到有效的学生名字');
      return;
    }
    
    this.students = names;
    this.lastWinnerIndex = -1; // 重置历史记录
    this.showPickSection();
    this.updateStudentCount();
    this.playClickSound();
  }

  // 读取文件
  readFile(file) {
    return new Promise((resolve, reject) => {
     const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('读取失败'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  // 解析名字列表
  parseNames(text) {
    return text
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);
  }

  // 更新学生数量显示
  updateStudentCount() {
    this.studentCount.innerHTML = `✅ 已加载 ${this.students.length} 名学生`;
    this.studentCount.style.display = 'block';
  }

  // 显示抽人区域
  showPickSection() {
    this.uploadSection.style.display = 'none';
    this.pickSection.style.display = 'block';
  }

  // 返回上传区域
  backToUpload() {
    this.uploadSection.style.display = 'block';
    this.pickSection.style.display = 'none';
    this.resultContainer.innerHTML = '<p class="result-placeholder">准备好了吗？点击按钮开始抽人！</p>';
    this.playClickSound();
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
      alert('请先加载学生名单');
      return;
    }
    
    this.isRolling= true;
    this.pickBtn.disabled = true;
    this.resetBtn.disabled = true;
    
   const animationType = this.animationSelect.value;
    
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
   const minRolls = 25; // 最少滚动次数
   const maxRolls = 35; // 最多滚动次数
   const targetRolls = Math.floor(Math.random() * (maxRolls - minRolls + 1)) + minRolls;
    
    // 减速函数 - 让滚动逐渐变慢
   const getDelay = (count) => {
     if (count < 15) return 60;           // 快速阶段
     if (count < 25) return 80;           // 中速阶段
     if (count < 30) return 120;          // 慢速阶段
      return 150 + (count - 30) * 20;      // 极慢阶段，逐渐停止
    };
    
    // 滚动函数
   const roll = () => {
     if (rollCount >= targetRolls) {
        // 滚动结束，显示最终结果
        this.finalizePick(finalWinnerName, animationType);
        return;
      }
      
      // 显示随机名字（滚动过程）
     const randomIndex = Math.floor(Math.random() * this.students.length);
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
    this.lastWinnerIndex = this.students.indexOf(winnerName);
    
    // 播放成功音效
    this.playSuccessSound();
    
    // 显示最终结果，应用过程动画
    this.resultContainer.innerHTML = `<div class="result-name animate-${animationType}">${winnerName}</div>`;
    
    // 动画结束后移除类（允许重复触发动画）
   const resultElement = this.resultContainer.querySelector('.result-name');
   const animationDuration = parseInt(getComputedStyle(resultElement).animationDuration) * 1000 || 1000;
    
    setTimeout(() => {
      resultElement.classList.remove(`animate-${animationType}`);
      // 强制重绘，允许动画重新触发
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
    try {
      this.clickSound.currentTime = 0;
      this.clickSound.volume = 0.3;
      this.clickSound.play().catch(() => {
        // 忽略自动播放策略限制
      });
    } catch (error) {
      // 静音失败也忽略
    }
  }

  // 播放成功音效
  playSuccessSound() {
    try {
      this.successSound.currentTime = 0;
      this.successSound.volume = 0.5;
      this.successSound.play().catch(() => {
        // 忽略自动播放策略限制
      });
    } catch (error) {
      // 静音失败也忽略
    }
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  new RandomPicker();
});
