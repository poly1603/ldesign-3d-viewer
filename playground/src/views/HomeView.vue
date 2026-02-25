<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { Globe, Code2, Layers, ArrowRight, Github, Sparkles, Sun, Moon } from 'lucide-vue-next';
import { useTheme } from '@/composables/useTheme';

const { theme, toggleTheme } = useTheme();
</script>

<template>
  <div class="home" :class="`theme-${theme}`">
    <!-- Theme toggle -->
    <button class="theme-toggle" @click="toggleTheme" :title="theme === 'dark' ? '切换亮色主题' : '切换暗色主题'">
      <Sun v-if="theme === 'dark'" :size="20" />
      <Moon v-else :size="20" />
    </button>

    <!-- Background decoration -->
    <div class="bg-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>

    <header class="home-header">
      <div class="logo">
        <div class="logo-icon">
          <Globe :size="32" :stroke-width="1.5" />
        </div>
        <span>3D Viewer</span>
      </div>
      <h1>360° 全景查看器</h1>
      <p class="subtitle">基于 Three.js 的企业级全景图查看器，支持视频、音频、VR/AR 等高级功能</p>
      <div class="features">
        <span class="feature-tag">
          <Sparkles :size="14" />
          WebGL
        </span>
        <span class="feature-tag">
          <Layers :size="14" />
          插件化
        </span>
        <span class="feature-tag">
          <Code2 :size="14" />
          TypeScript
        </span>
      </div>
    </header>

    <main class="home-content">
      <div class="demo-cards">
        <RouterLink to="/native-demo" class="demo-card">
          <div class="demo-card-header">
            <div class="demo-card-icon native">
              <Code2 :size="28" />
            </div>
            <ArrowRight class="arrow-icon" :size="20" />
          </div>
          <h2>原生 JS 演示</h2>
          <p>使用 @ldesign/3d-viewer 核心库，无框架依赖</p>
          <div class="demo-card-tags">
            <span>Vanilla JS</span>
            <span>Three.js</span>
          </div>
        </RouterLink>

        <RouterLink to="/vue-demo" class="demo-card">
          <div class="demo-card-header">
            <div class="demo-card-icon vue">
              <svg viewBox="0 0 128 128" width="28" height="28">
                <path fill="currentColor" d="M78.8,10L64,35.4L49.2,10H0l64,110l64-110H78.8z"/>
              </svg>
            </div>
            <ArrowRight class="arrow-icon" :size="20" />
          </div>
          <h2>Vue 组件演示</h2>
          <p>使用 @ldesign/3d-viewer-vue 组件，开箱即用</p>
          <div class="demo-card-tags">
            <span>Vue 3</span>
            <span>Composition API</span>
          </div>
        </RouterLink>
      </div>
    </main>

    <footer class="home-footer">
      <a href="https://github.com" target="_blank" class="github-link">
        <Github :size="18" />
        <span>GitHub</span>
      </a>
    </footer>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 24px 40px;
  position: relative;
  overflow: hidden;
  transition: background 0.3s, color 0.3s;
}

/* Dark theme (default) */
.home.theme-dark {
  background: #0f0f0f;
  color: #fff;
}

/* Light theme */
.home.theme-light {
  background: #f5f5f5;
  color: #333;
}

/* Theme toggle button */
.theme-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  transition: all 0.2s;
}

.home.theme-light .theme-toggle {
  background: rgba(0,0,0,0.05);
  border-color: rgba(0,0,0,0.1);
  color: rgba(0,0,0,0.7);
}

.theme-toggle:hover {
  background: rgba(255,255,255,0.15);
  color: #fff;
}

.home.theme-light .theme-toggle:hover {
  background: rgba(0,0,0,0.1);
  color: #000;
}

/* Background decoration */
.bg-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}

.bg-circle-1 {
  width: 600px;
  height: 600px;
  background: #667eea;
  top: -200px;
  left: -100px;
}

.bg-circle-2 {
  width: 400px;
  height: 400px;
  background: #764ba2;
  top: 50%;
  right: -100px;
}

.bg-circle-3 {
  width: 300px;
  height: 300px;
  background: #00d4aa;
  bottom: -100px;
  left: 30%;
}

/* Header */
.home-header {
  text-align: center;
  margin-bottom: 60px;
  position: relative;
  z-index: 1;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px 8px 8px;
  background: rgba(255,255,255,0.08);
  border-radius: 40px;
  margin-bottom: 32px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.home.theme-light .logo {
  background: rgba(0,0,0,0.05);
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
}

.home-header h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 16px;
  letter-spacing: -1px;
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.home.theme-light .home-header h1 {
  background: linear-gradient(135deg, #333 0%, rgba(0,0,0,0.7) 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.subtitle {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.6);
  max-width: 480px;
  margin: 0 auto 24px;
  line-height: 1.6;
}

.home.theme-light .subtitle {
  color: rgba(0,0,0,0.6);
}

.features {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.feature-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  font-size: 13px;
  color: rgba(255,255,255,0.7);
}

.home.theme-light .feature-tag {
  background: rgba(0,0,0,0.04);
  border-color: rgba(0,0,0,0.1);
  color: rgba(0,0,0,0.7);
}

/* Content */
.home-content {
  width: 100%;
  max-width: 720px;
  position: relative;
  z-index: 1;
}

.demo-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 640px) {
  .demo-cards {
    grid-template-columns: 1fr;
  }
}

.demo-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 24px;
  text-decoration: none;
  color: #fff;
  transition: all 0.25s ease;
}

.home.theme-light .demo-card {
  background: #fff;
  border-color: rgba(0,0,0,0.08);
  color: #333;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.demo-card:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.15);
  transform: translateY(-4px);
}

.home.theme-light .demo-card:hover {
  background: #fff;
  border-color: rgba(0,0,0,0.12);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.demo-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.demo-card-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
}

.demo-card-icon.native {
  background: linear-gradient(135deg, #f59e0b, #ef4444);
}

.demo-card-icon.vue {
  background: linear-gradient(135deg, #42b883, #35495e);
}

.arrow-icon {
  color: rgba(255,255,255,0.3);
  transition: all 0.2s;
}

.home.theme-light .arrow-icon {
  color: rgba(0,0,0,0.3);
}

.demo-card:hover .arrow-icon {
  color: rgba(255,255,255,0.7);
  transform: translateX(4px);
}

.home.theme-light .demo-card:hover .arrow-icon {
  color: rgba(0,0,0,0.7);
}

.demo-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.demo-card p {
  color: rgba(255,255,255,0.5);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 16px;
}

.home.theme-light .demo-card p {
  color: rgba(0,0,0,0.5);
}

.demo-card-tags {
  display: flex;
  gap: 8px;
}

.demo-card-tags span {
  padding: 4px 10px;
  background: rgba(255,255,255,0.06);
  border-radius: 6px;
  font-size: 12px;
  color: rgba(255,255,255,0.5);
}

.home.theme-light .demo-card-tags span {
  background: rgba(0,0,0,0.05);
  color: rgba(0,0,0,0.5);
}

/* Footer */
.home-footer {
  margin-top: auto;
  padding-top: 60px;
  position: relative;
  z-index: 1;
}

.github-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  color: rgba(255,255,255,0.5);
  text-decoration: none;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.home.theme-light .github-link {
  color: rgba(0,0,0,0.5);
  border-color: rgba(0,0,0,0.1);
}

.github-link:hover {
  color: #fff;
  border-color: rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.05);
}

.home.theme-light .github-link:hover {
  color: #000;
  border-color: rgba(0,0,0,0.2);
  background: rgba(0,0,0,0.05);
}

/* Light theme background circles */
.home.theme-light .bg-circle {
  opacity: 0.15;
}
</style>
