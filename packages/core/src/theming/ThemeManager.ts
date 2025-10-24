/**
 * 主题管理器
 * 支持白标定制、主题切换、品牌定制
 */

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    size: {
      small: number;
      medium: number;
      large: number;
    };
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
  logo?: string;
  favicon?: string;
  customCSS?: string;
}

export type BuiltInTheme = 'light' | 'dark' | 'blue' | 'green';

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: Theme | null = null;
  private themes: Map<string, Theme> = new Map();
  private styleElement: HTMLStyleElement;
  private listeners: Array<(theme: Theme) => void> = [];

  // 内置主题
  private builtInThemes: Record<BuiltInTheme, Theme> = {
    light: {
      id: 'light',
      name: '明亮主题',
      colors: {
        primary: '#2196F3',
        secondary: '#FFC107',
        accent: '#FF5722',
        background: '#ffffff',
        text: '#333333',
        border: '#e0e0e0',
      },
      fonts: {
        primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        secondary: 'Georgia, serif',
        size: { small: 12, medium: 14, large: 18 },
      },
      spacing: { small: 8, medium: 16, large: 24 },
      borderRadius: { small: 4, medium: 8, large: 12 },
    },
    dark: {
      id: 'dark',
      name: '暗黑主题',
      colors: {
        primary: '#42A5F5',
        secondary: '#FFD54F',
        accent: '#FF7043',
        background: '#1e1e1e',
        text: '#e0e0e0',
        border: '#333333',
      },
      fonts: {
        primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        secondary: 'Georgia, serif',
        size: { small: 12, medium: 14, large: 18 },
      },
      spacing: { small: 8, medium: 16, large: 24 },
      borderRadius: { small: 4, medium: 8, large: 12 },
    },
    blue: {
      id: 'blue',
      name: '蓝色主题',
      colors: {
        primary: '#1976D2',
        secondary: '#0097A7',
        accent: '#00BCD4',
        background: '#f5f5f5',
        text: '#263238',
        border: '#B0BEC5',
      },
      fonts: {
        primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        secondary: 'Georgia, serif',
        size: { small: 12, medium: 14, large: 18 },
      },
      spacing: { small: 8, medium: 16, large: 24 },
      borderRadius: { small: 4, medium: 8, large: 12 },
    },
    green: {
      id: 'green',
      name: '绿色主题',
      colors: {
        primary: '#4CAF50',
        secondary: '#8BC34A',
        accent: '#CDDC39',
        background: '#fafafa',
        text: '#1B5E20',
        border: '#C8E6C9',
      },
      fonts: {
        primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        secondary: 'Georgia, serif',
        size: { small: 12, medium: 14, large: 18 },
      },
      spacing: { small: 8, medium: 16, large: 24 },
      borderRadius: { small: 4, medium: 8, large: 12 },
    },
  };

  private constructor() {
    // 创建 style 元素
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'panorama-viewer-theme';
    document.head.appendChild(this.styleElement);

    // 注册内置主题
    Object.values(this.builtInThemes).forEach(theme => {
      this.themes.set(theme.id, theme);
    });

    // 恢复保存的主题
    this.restoreTheme();
  }

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
   * 注册主题
   */
  public registerTheme(theme: Theme): void {
    this.themes.set(theme.id, theme);
  }

  /**
   * 应用主题
   */
  public applyTheme(themeId: string): void {
    const theme = this.themes.get(themeId);
    if (!theme) {
      console.error(`Theme not found: ${themeId}`);
      return;
    }

    this.currentTheme = theme;
    this.generateCSS(theme);
    this.notifyListeners();

    // 保存主题偏好
    localStorage.setItem('panorama-viewer-theme', themeId);
  }

  /**
   * 生成 CSS
   */
  private generateCSS(theme: Theme): void {
    let css = ':root {\n';

    // 颜色变量
    css += `  --pv-color-primary: ${theme.colors.primary};\n`;
    css += `  --pv-color-secondary: ${theme.colors.secondary};\n`;
    css += `  --pv-color-accent: ${theme.colors.accent};\n`;
    css += `  --pv-color-background: ${theme.colors.background};\n`;
    css += `  --pv-color-text: ${theme.colors.text};\n`;
    css += `  --pv-color-border: ${theme.colors.border};\n`;

    // 字体变量
    css += `  --pv-font-primary: ${theme.fonts.primary};\n`;
    css += `  --pv-font-secondary: ${theme.fonts.secondary};\n`;
    css += `  --pv-font-size-small: ${theme.fonts.size.small}px;\n`;
    css += `  --pv-font-size-medium: ${theme.fonts.size.medium}px;\n`;
    css += `  --pv-font-size-large: ${theme.fonts.size.large}px;\n`;

    // 间距变量
    css += `  --pv-spacing-small: ${theme.spacing.small}px;\n`;
    css += `  --pv-spacing-medium: ${theme.spacing.medium}px;\n`;
    css += `  --pv-spacing-large: ${theme.spacing.large}px;\n`;

    // 圆角变量
    css += `  --pv-radius-small: ${theme.borderRadius.small}px;\n`;
    css += `  --pv-radius-medium: ${theme.borderRadius.medium}px;\n`;
    css += `  --pv-radius-large: ${theme.borderRadius.large}px;\n`;

    css += '}\n';

    // 自定义 CSS
    if (theme.customCSS) {
      css += '\n' + theme.customCSS;
    }

    this.styleElement.textContent = css;

    // 更新 favicon
    if (theme.favicon) {
      this.updateFavicon(theme.favicon);
    }
  }

  /**
   * 更新 favicon
   */
  private updateFavicon(url: string): void {
    let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;

    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    link.href = url;
  }

  /**
   * 获取当前主题
   */
  public getCurrentTheme(): Theme | null {
    return this.currentTheme;
  }

  /**
   * 获取所有主题
   */
  public getAllThemes(): Theme[] {
    return Array.from(this.themes.values());
  }

  /**
   * 检查主题是否存在
   */
  public hasTheme(themeId: string): boolean {
    return this.themes.has(themeId);
  }

  /**
   * 恢复保存的主题
   */
  private restoreTheme(): void {
    const saved = localStorage.getItem('panorama-viewer-theme');
    if (saved && this.themes.has(saved)) {
      this.applyTheme(saved);
    } else {
      // 默认使用明亮主题
      this.applyTheme('light');
    }
  }

  /**
   * 切换明暗主题
   */
  public toggleDarkMode(): void {
    const currentId = this.currentTheme?.id;

    if (currentId === 'light') {
      this.applyTheme('dark');
    } else {
      this.applyTheme('light');
    }
  }

  /**
   * 监听主题变化
   */
  public onChange(callback: (theme: Theme) => void): () => void {
    this.listeners.push(callback);

    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 通知监听器
   */
  private notifyListeners(): void {
    if (!this.currentTheme) return;

    this.listeners.forEach(callback => {
      try {
        callback(this.currentTheme!);
      } catch (error) {
        console.error('ThemeManager listener error:', error);
      }
    });
  }

  /**
   * 导出主题
   */
  public exportTheme(themeId: string): Theme | null {
    return this.themes.get(themeId) || null;
  }

  /**
   * 导入主题
   */
  public importTheme(theme: Theme): void {
    this.registerTheme(theme);
  }

  /**
   * 创建自定义主题
   */
  public createCustomTheme(baseThemeId: BuiltInTheme, overrides: Partial<Theme>): Theme {
    const baseTheme = this.builtInThemes[baseThemeId];

    return {
      ...baseTheme,
      ...overrides,
      id: overrides.id || `custom-${Date.now()}`,
      colors: { ...baseTheme.colors, ...overrides.colors },
      fonts: {
        ...baseTheme.fonts,
        ...overrides.fonts,
        size: { ...baseTheme.fonts.size, ...overrides.fonts?.size },
      },
      spacing: { ...baseTheme.spacing, ...overrides.spacing },
      borderRadius: { ...baseTheme.borderRadius, ...overrides.borderRadius },
    };
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    this.styleElement.remove();
    this.listeners = [];
  }
}

// 导出单例
export const themeManager = ThemeManager.getInstance();

