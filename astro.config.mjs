// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  // 输出静态文件
  output: 'static',
  
  // 配置构建选项
  build: {
    format: 'file',
  },
  
  // 配置路径别名
  alias: {
    '@data': './src/data',
  },
});