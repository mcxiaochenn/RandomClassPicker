# 班级抽人工具

一个基于 Astro 框架开发的班级随机抽人工具，支持本地 HTML 文件直接使用和静态部署。

## ✨ 功能特性

### 核心功能
- 📁 **文件上传**：支持上传 `.txt` 格式的学生名单（每行一个名字）
- ✍️ **手动输入**：可直接在文本框中输入学生名字
- 🎲 **随机抽取**：点击按钮随机抽取一名学生
- 🎬 **多种动画效果**：淡入淡出、弹跳效果、滚动抽奖、大转盘、翻转卡片
- 🔊 **音效支持**：点击音效和成功音效（需添加音频文件）
- 🏫 **班级预设**：支持创建专用班级页面，自动加载预设名单

### 智能算法
- 🔄 **防重复机制**：智能随机算法杜绝连续抽中同一人
- ⏱️ **减速动画**：滚动速度从快到慢，营造紧张感
  - 快速阶段（前 15 次）：60ms/次
  - 中速阶段（15-25 次）：80ms/次
  - 慢速阶段（25-30 次）：120ms/次
  - 极慢阶段（30 次+）：逐渐停止

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
访问 `http://localhost:4321`（端口可能被占用，会自动递增）

### 构建静态文件
```bash
npm run build
```
构建输出目录：`dist/`

### 预览构建结果
```bash
npm run preview
```

## 📁 项目结构

```
RandomClassPicker/
├── src/
│   ├── pages/
│   │   ├── index.astro          # 主页
│   │   └── js2451.astro         # JS2451 班级预设页面
│   └── data/classes/
│       └── js2451.json          # 班级预设数据
├── public/
│   ├── index.html               # 独立 HTML 版本（可直接本地使用）
│   ├── styles/
│   │   └── main.css             # 样式文件
│   ├── scripts/
│   │   ├── main.js              # 主页逻辑
│   │   └── class-page.js        # 预设页面逻辑
│   ├── data/classes/
│   │   └── js2451.json          # 预设数据副本
│   └── audio/                   # 音效目录（需添加音频文件）
├── dist/                        # 构建输出目录
├── package.json
└── README.md
```

## 🎨 使用方式

### 方式一：本地直接使用
直接打开 `public/index.html` 文件即可在浏览器中使用（无需服务器）

### 方式二：Astro 开发模式
```bash
npm run dev
```
访问 `http://localhost:4321`

### 方式三：静态部署
将 `dist` 目录部署到任何静态托管服务：
- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages
- 任意 Web 服务器

## 📝 添加班级预设

### 步骤 1：创建 JSON 数据文件
在 `src/data/classes/` 目录下创建 JSON 文件：

```json
{
  "class_name": "JS2451",
  "students": [
    "小米",
    "张三",
    "李四",
    "王五"
  ]
}
```

### 步骤 2：创建预设页面
在 `src/pages/` 目录下创建对应的 `.astro` 文件（如 `js2451.astro`）：

```astro
---
import classData from '../data/classes/js2451.json';
---
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>{classData.class_name} - 班级抽人工具</title>
  <link rel="stylesheet" href="/styles/main.css" />
</head>
<body>
  <!-- 页面内容参考 js2451.astro -->
  <script set:html={`
  window.CLASS_DATA = ${JSON.stringify(classData)};
  `}></script>
  <script src="/scripts/class-page.js" type="module"></script>
</body>
</html>
```

### 步骤 3：访问预设页面
启动开发服务器后，访问 `http://localhost:4321/js2451` 即可。

## 🔊 添加音效

在 `public/audio/` 目录下添加两个音频文件：
- `click.mp3` - 点击音效
- `success.mp3` - 成功音效

音频文件格式建议：
- 格式：MP3
- 时长：0.5-2 秒
- 文件大小：< 100KB

## 🎯 技术栈

- **框架**：Astro 5.x
- **语言**：TypeScript / JavaScript
- **样式**：原生 CSS（CSS Variables + Animations）
- **构建工具**：Vite
- **部署**：静态 HTML（零 JavaScript 运行时）

## 📱 响应式设计

- 支持桌面端和移动端
- 自适应布局
- 触摸友好的按钮尺寸

## 🎬 动画效果说明

| 动画名称 | 效果描述 |
|---------|---------|
| 淡入淡出 (fadeIn) | 名字从透明到显示，伴随缩放效果 |
| 弹跳效果 (bounce) | 名字上下弹跳出现 |
| 滚动抽奖 (roll) | 名字沿 X 轴旋转出现 |
| 大转盘 (spin) | 名字旋转并放大出现 |
| 翻转卡片 (flip) | 名字沿 Y 轴翻转出现 |

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

感谢使用本工具！如有问题或建议，请随时反馈。
