/**
 * 多语言国际化管理器
 * 支持多语言切换、RTL布局、日期/数字格式化
 */

export type Locale = string // 如: 'en-US', 'zh-CN', 'ar-SA'

export interface Translation {
  [key: string]: string | Translation
}

export interface LocaleConfig {
  locale: Locale
  fallbackLocale: Locale
  translations: Record<Locale, Translation>
  rtlLocales?: Locale[]
}

export class LocaleManager {
  private static instance: LocaleManager
  private currentLocale: Locale
  private fallbackLocale: Locale
  private translations: Map<Locale, Translation> = new Map()
  private rtlLocales: Set<Locale> = new Set()
  private listeners: Array<(locale: Locale) => void> = []

  private constructor(config?: Partial<LocaleConfig>) {
    this.currentLocale = config?.locale || this.detectBrowserLocale()
    this.fallbackLocale = config?.fallbackLocale || 'en-US'

    if (config?.translations) {
      Object.entries(config.translations).forEach(([locale, translation]) => {
        this.translations.set(locale, translation)
      })
    }

    if (config?.rtlLocales) {
      config.rtlLocales.forEach(locale => this.rtlLocales.add(locale))
    }
    else {
      // 默认 RTL 语言
      ['ar', 'ar-SA', 'he', 'he-IL', 'fa', 'fa-IR', 'ur', 'ur-PK'].forEach(locale =>
        this.rtlLocales.add(locale),
      )
    }

    this.applyDirection()
  }

  public static getInstance(config?: Partial<LocaleConfig>): LocaleManager {
    if (!LocaleManager.instance) {
      LocaleManager.instance = new LocaleManager(config)
    }
    return LocaleManager.instance
  }

  /**
   * 检测浏览器语言
   */
  private detectBrowserLocale(): Locale {
    if (navigator.languages && navigator.languages.length) {
      return navigator.languages[0]
    }
    return navigator.language || 'en-US'
  }

  /**
   * 设置当前语言
   */
  public setLocale(locale: Locale): void {
    if (this.currentLocale === locale)
      return

    this.currentLocale = locale
    this.applyDirection()
    this.notifyListeners()

    // 保存到 localStorage
    localStorage.setItem('preferred-locale', locale)
  }

  /**
   * 获取当前语言
   */
  public getLocale(): Locale {
    return this.currentLocale
  }

  /**
   * 添加翻译
   */
  public addTranslations(locale: Locale, translations: Translation): void {
    const existing = this.translations.get(locale) || {}
    this.translations.set(locale, this.mergeDeep(existing, translations))
  }

  /**
   * 深度合并对象
   */
  private mergeDeep(target: Translation, source: Translation): Translation {
    const output = { ...target }

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = this.mergeDeep(
          (target[key] as Translation) || {},
          source[key] as Translation,
        )
      }
      else {
        output[key] = source[key]
      }
    }

    return output
  }

  /**
   * 翻译文本
   */
  public t(key: string, params?: Record<string, string | number>): string {
    const translation = this.getTranslation(key, this.currentLocale)
      || this.getTranslation(key, this.fallbackLocale)
      || key

    // 替换参数
    if (params) {
      return this.interpolate(translation, params)
    }

    return translation
  }

  /**
   * 获取翻译
   */
  private getTranslation(key: string, locale: Locale): string | null {
    const translations = this.translations.get(locale)
    if (!translations)
      return null

    const keys = key.split('.')
    let current: any = translations

    for (const k of keys) {
      if (current[k] === undefined)
        return null
      current = current[k]
    }

    return typeof current === 'string' ? current : null
  }

  /**
   * 插值替换
   */
  private interpolate(text: string, params: Record<string, string | number>): string {
    let result = text

    for (const [key, value] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
    }

    return result
  }

  /**
   * 是否为 RTL 语言
   */
  public isRTL(locale?: Locale): boolean {
    const checkLocale = locale || this.currentLocale

    // 检查完整locale
    if (this.rtlLocales.has(checkLocale))
      return true

    // 检查语言代码（如 'ar-SA' -> 'ar'）
    const langCode = checkLocale.split('-')[0]
    return this.rtlLocales.has(langCode)
  }

  /**
   * 应用文本方向
   */
  private applyDirection(): void {
    const dir = this.isRTL() ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', this.currentLocale)
  }

  /**
   * 格式化日期
   */
  public formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.currentLocale, options).format(date)
  }

  /**
   * 格式化数字
   */
  public formatNumber(
    num: number,
    options?: Intl.NumberFormatOptions,
  ): string {
    return new Intl.NumberFormat(this.currentLocale, options).format(num)
  }

  /**
   * 格式化货币
   */
  public formatCurrency(
    amount: number,
    currency: string,
    options?: Intl.NumberFormatOptions,
  ): string {
    return new Intl.NumberFormat(this.currentLocale, {
      style: 'currency',
      currency,
      ...options,
    }).format(amount)
  }

  /**
   * 格式化相对时间
   */
  public formatRelativeTime(
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
  ): string {
    const rtf = new Intl.RelativeTimeFormat(this.currentLocale, { numeric: 'auto' })
    return rtf.format(value, unit)
  }

  /**
   * 复数处理
   */
  public plural(count: number, options: {
    zero?: string
    one?: string
    few?: string
    many?: string
    other: string
  }): string {
    const pr = new Intl.PluralRules(this.currentLocale)
    const rule = pr.select(count)

    switch (rule) {
      case 'zero':
        return options.zero || options.other
      case 'one':
        return options.one || options.other
      case 'few':
        return options.few || options.other
      case 'many':
        return options.many || options.other
      default:
        return options.other
    }
  }

  /**
   * 获取所有可用语言
   */
  public getAvailableLocales(): Locale[] {
    return Array.from(this.translations.keys())
  }

  /**
   * 检查语言是否可用
   */
  public isLocaleAvailable(locale: Locale): boolean {
    return this.translations.has(locale)
  }

  /**
   * 监听语言变化
   */
  public onChange(callback: (locale: Locale) => void): () => void {
    this.listeners.push(callback)

    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * 通知监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach((callback) => {
      try {
        callback(this.currentLocale)
      }
      catch (error) {
        console.error('LocaleManager listener error:', error)
      }
    })
  }

  /**
   * 从 localStorage 恢复偏好
   */
  public restorePreference(): void {
    const saved = localStorage.getItem('preferred-locale')
    if (saved && this.isLocaleAvailable(saved)) {
      this.setLocale(saved)
    }
  }

  /**
   * 导出翻译
   */
  public exportTranslations(locale?: Locale): Translation | Record<Locale, Translation> {
    if (locale) {
      return this.translations.get(locale) || {}
    }

    const all: Record<Locale, Translation> = {}
    this.translations.forEach((translation, loc) => {
      all[loc] = translation
    })
    return all
  }

  /**
   * 导入翻译
   */
  public importTranslations(data: Record<Locale, Translation>): void {
    Object.entries(data).forEach(([locale, translation]) => {
      this.addTranslations(locale, translation)
    })
  }

  /**
   * 获取语言名称
   */
  public getLocaleName(locale?: Locale, displayLocale?: Locale): string {
    const targetLocale = locale || this.currentLocale
    const inLocale = displayLocale || this.currentLocale

    try {
      const names = new Intl.DisplayNames([inLocale], { type: 'language' })
      return names.of(targetLocale) || targetLocale
    }
    catch {
      return targetLocale
    }
  }

  /**
   * 生成报告
   */
  public generateReport(): string {
    const available = this.getAvailableLocales()
    const currentName = this.getLocaleName()

    const report = `
Locale Manager Report
====================

Current Locale: ${this.currentLocale} (${currentName})
Fallback Locale: ${this.fallbackLocale}
Text Direction: ${this.isRTL() ? 'RTL' : 'LTR'}

Available Locales: ${available.length}
${available.map(loc => `  - ${loc} (${this.getLocaleName(loc)})`).join('\n')}

RTL Locales: ${Array.from(this.rtlLocales).join(', ')}

Sample Formatting:
- Date: ${this.formatDate(new Date())}
- Number: ${this.formatNumber(123456.789)}
- Currency: ${this.formatCurrency(1234.56, 'USD')}
- Relative Time: ${this.formatRelativeTime(-1, 'day')}
    `.trim()

    return report
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    this.listeners = []
  }
}

// 使用示例：
// const localeManager = LocaleManager.getInstance({
//   locale: 'zh-CN',
//   fallbackLocale: 'en-US',
//   translations: {
//     'en-US': {
//       welcome: 'Welcome',
//       greeting: 'Hello, {name}!',
//     },
//     'zh-CN': {
//       welcome: '欢迎',
//       greeting: '你好，{name}！',
//     },
//   },
// });
