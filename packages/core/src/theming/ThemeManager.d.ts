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
export declare class ThemeManager {
    private static instance;
    private currentTheme;
    private themes;
    private styleElement;
    private listeners;
    private builtInThemes;
    private constructor();
    static getInstance(): ThemeManager;
    /**
     * 注册主题
     */
    registerTheme(theme: Theme): void;
    /**
     * 应用主题
     */
    applyTheme(themeId: string): void;
    /**
     * 生成 CSS
     */
    private generateCSS;
    /**
     * 更新 favicon
     */
    private updateFavicon;
    /**
     * 获取当前主题
     */
    getCurrentTheme(): Theme | null;
    /**
     * 获取所有主题
     */
    getAllThemes(): Theme[];
    /**
     * 检查主题是否存在
     */
    hasTheme(themeId: string): boolean;
    /**
     * 恢复保存的主题
     */
    private restoreTheme;
    /**
     * 切换明暗主题
     */
    toggleDarkMode(): void;
    /**
     * 监听主题变化
     */
    onChange(callback: (theme: Theme) => void): () => void;
    /**
     * 通知监听器
     */
    private notifyListeners;
    /**
     * 导出主题
     */
    exportTheme(themeId: string): Theme | null;
    /**
     * 导入主题
     */
    importTheme(theme: Theme): void;
    /**
     * 创建自定义主题
     */
    createCustomTheme(baseThemeId: BuiltInTheme, overrides: Partial<Theme>): Theme;
    /**
     * 清理资源
     */
    dispose(): void;
}
export declare const themeManager: ThemeManager;
//# sourceMappingURL=ThemeManager.d.ts.map