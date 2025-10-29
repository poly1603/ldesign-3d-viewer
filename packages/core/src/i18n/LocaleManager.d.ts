/**
 * 多语言国际化管理器
 * 支持多语言切换、RTL布局、日期/数字格式化
 */
export type Locale = string;
export interface Translation {
    [key: string]: string | Translation;
}
export interface LocaleConfig {
    locale: Locale;
    fallbackLocale: Locale;
    translations: Record<Locale, Translation>;
    rtlLocales?: Locale[];
}
export declare class LocaleManager {
    private static instance;
    private currentLocale;
    private fallbackLocale;
    private translations;
    private rtlLocales;
    private listeners;
    private constructor();
    static getInstance(config?: Partial<LocaleConfig>): LocaleManager;
    /**
     * 检测浏览器语言
     */
    private detectBrowserLocale;
    /**
     * 设置当前语言
     */
    setLocale(locale: Locale): void;
    /**
     * 获取当前语言
     */
    getLocale(): Locale;
    /**
     * 添加翻译
     */
    addTranslations(locale: Locale, translations: Translation): void;
    /**
     * 深度合并对象
     */
    private mergeDeep;
    /**
     * 翻译文本
     */
    t(key: string, params?: Record<string, string | number>): string;
    /**
     * 获取翻译
     */
    private getTranslation;
    /**
     * 插值替换
     */
    private interpolate;
    /**
     * 是否为 RTL 语言
     */
    isRTL(locale?: Locale): boolean;
    /**
     * 应用文本方向
     */
    private applyDirection;
    /**
     * 格式化日期
     */
    formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string;
    /**
     * 格式化数字
     */
    formatNumber(num: number, options?: Intl.NumberFormatOptions): string;
    /**
     * 格式化货币
     */
    formatCurrency(amount: number, currency: string, options?: Intl.NumberFormatOptions): string;
    /**
     * 格式化相对时间
     */
    formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string;
    /**
     * 复数处理
     */
    plural(count: number, options: {
        zero?: string;
        one?: string;
        few?: string;
        many?: string;
        other: string;
    }): string;
    /**
     * 获取所有可用语言
     */
    getAvailableLocales(): Locale[];
    /**
     * 检查语言是否可用
     */
    isLocaleAvailable(locale: Locale): boolean;
    /**
     * 监听语言变化
     */
    onChange(callback: (locale: Locale) => void): () => void;
    /**
     * 通知监听器
     */
    private notifyListeners;
    /**
     * 从 localStorage 恢复偏好
     */
    restorePreference(): void;
    /**
     * 导出翻译
     */
    exportTranslations(locale?: Locale): Translation | Record<Locale, Translation>;
    /**
     * 导入翻译
     */
    importTranslations(data: Record<Locale, Translation>): void;
    /**
     * 获取语言名称
     */
    getLocaleName(locale?: Locale, displayLocale?: Locale): string;
    /**
     * 生成报告
     */
    generateReport(): string;
    /**
     * 清理资源
     */
    dispose(): void;
}
//# sourceMappingURL=LocaleManager.d.ts.map