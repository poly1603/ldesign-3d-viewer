<script setup lang="ts">
import { RouterLink } from 'vue-router';

defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="demo-layout">
    <header class="demo-header">
      <RouterLink to="/" class="back-link">← 返回首页</RouterLink>
      <div class="demo-title">
        <h1>{{ title }}</h1>
        <p v-if="description">{{ description }}</p>
      </div>
    </header>

    <main class="demo-main">
      <section class="viewer-section">
        <slot name="viewer" />
      </section>

      <aside class="controls-section">
        <slot name="controls" />
      </aside>
    </main>
  </div>
</template>

<style scoped>
.demo-layout {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  overflow: hidden;
  box-sizing: border-box;
}

.demo-header {
  flex-shrink: 0;
  background: white;
  padding: 8px 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  font-size: 13px;
  transition: color 0.2s;
  white-space: nowrap;
}

.back-link:hover {
  color: #764ba2;
}

.demo-title h1 {
  font-size: 1rem;
  margin: 0;
  color: #333;
}

.demo-title p {
  margin: 2px 0 0;
  color: #888;
  font-size: 12px;
}

.demo-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 16px;
  padding: 16px;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.viewer-section {
  background: white;
  border-radius: 8px;
  padding: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.controls-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow-y: auto;
  min-height: 0;
}

@media (max-width: 900px) {
  .demo-main {
    grid-template-columns: 1fr;
  }
}
</style>
