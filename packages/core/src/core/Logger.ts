/**
 * 分级日志系统
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface LogEntry {
  level: LogLevel
  message: string
  data?: any
  timestamp: number
  stack?: string
}

export type LogHandler = (entry: LogEntry) => void

export class Logger {
  private static instance: Logger
  private level: LogLevel = LogLevel.INFO
  private handlers: Set<LogHandler> = new Set()
  private history: LogEntry[] = []
  private maxHistorySize: number = 500
  private prefix: string = '[PanoramaViewer]'

  private constructor() { }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  /**
   * 设置日志级别
   */
  public setLevel(level: LogLevel): void {
    this.level = level
  }

  /**
   * 获取当前日志级别
   */
  public getLevel(): LogLevel {
    return this.level
  }

  /**
   * 设置日志前缀
   */
  public setPrefix(prefix: string): void {
    this.prefix = prefix
  }

  /**
   * 添加日志处理器
   */
  public addHandler(handler: LogHandler): () => void {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }

  /**
   * 移除日志处理器
   */
  public removeHandler(handler: LogHandler): void {
    this.handlers.delete(handler)
  }

  /**
   * 记录 DEBUG 级别日志
   */
  public debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data)
  }

  /**
   * 记录 INFO 级别日志
   */
  public info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data)
  }

  /**
   * 记录 WARN 级别日志
   */
  public warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data)
  }

  /**
   * 记录 ERROR 级别日志
   */
  public error(message: string, error?: any): void {
    const stack = error instanceof Error ? error.stack : undefined
    this.log(LogLevel.ERROR, message, error, stack)
  }

  /**
   * 核心日志记录方法
   */
  private log(level: LogLevel, message: string, data?: any, stack?: string): void {
    if (level < this.level) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: Date.now(),
      stack,
    }

    // 添加到历史记录
    this.history.push(entry)
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
    }

    // 调用自定义处理器
    this.handlers.forEach((handler) => {
      try {
        handler(entry)
      }
      catch (error) {
        // 避免处理器错误导致崩溃

        console.error('Error in log handler:', error)
      }
    })

    // 默认控制台输出
    this.consoleOutput(entry)
  }

  /**
   * 控制台输出
   */
  private consoleOutput(entry: LogEntry): void {
    const { level, message, data, timestamp, stack } = entry
    const time = new Date(timestamp).toISOString()
    const formattedMessage = `${this.prefix} ${time} ${message}`

    switch (level) {
      case LogLevel.DEBUG:
        if (data !== undefined) {
          // eslint-disable-next-line no-console
          console.debug(formattedMessage, data)
        }
        else {
          // eslint-disable-next-line no-console
          console.debug(formattedMessage)
        }
        break

      case LogLevel.INFO:
        if (data !== undefined) {
          // eslint-disable-next-line no-console
          console.info(formattedMessage, data)
        }
        else {
          // eslint-disable-next-line no-console
          console.info(formattedMessage)
        }
        break

      case LogLevel.WARN:
        if (data !== undefined) {
          console.warn(formattedMessage, data)
        }
        else {
          console.warn(formattedMessage)
        }
        break

      case LogLevel.ERROR:
        if (data !== undefined) {
          console.error(formattedMessage, data)
        }
        else {
          console.error(formattedMessage)
        }
        if (stack) {
          console.error(stack)
        }
        break
    }
  }

  /**
   * 获取日志历史
   */
  public getHistory(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.history.filter(entry => entry.level === level)
    }
    return [...this.history]
  }

  /**
   * 清除日志历史
   */
  public clearHistory(): void {
    this.history = []
  }

  /**
   * 导出日志为 JSON
   */
  public exportLogs(): string {
    return JSON.stringify(this.history, null, 2)
  }

  /**
   * 创建性能测量
   */
  public time(label: string): () => void {
    const startTime = performance.now()
    return () => {
      const duration = performance.now() - startTime
      this.debug(`${label} took ${duration.toFixed(2)}ms`)
    }
  }

  /**
   * 分组日志开始
   */
  public group(label: string): void {
    // eslint-disable-next-line no-console
    console.group(`${this.prefix} ${label}`)
  }

  /**
   * 分组日志结束
   */
  public groupEnd(): void {
    // eslint-disable-next-line no-console
    console.groupEnd()
  }

  /**
   * 清除所有处理器和历史
   */
  public dispose(): void {
    this.handlers.clear()
    this.clearHistory()
  }
}

// 导出单例
export const logger = Logger.getInstance()
