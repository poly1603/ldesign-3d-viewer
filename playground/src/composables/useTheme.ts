import { ref, watch } from 'vue';

export type Theme = 'light' | 'dark';

const theme = ref<Theme>('dark');

// 初始化主题
const initTheme = () => {
  // 从 localStorage 读取主题设置
  const savedTheme = localStorage.getItem('3d-viewer-theme') as Theme;
  if (savedTheme) {
    theme.value = savedTheme;
  } else {
    // 检测系统主题偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme.value = prefersDark ? 'dark' : 'light';
  }
};

// 初始化
initTheme();

// 监听主题变化，保存到 localStorage
watch(theme, (newTheme) => {
  localStorage.setItem('3d-viewer-theme', newTheme);
});

export function useTheme() {
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
  };

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
  };

  return {
    theme,
    toggleTheme,
    setTheme,
  };
}
