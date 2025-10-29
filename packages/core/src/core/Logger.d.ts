/**
 * 分级日志系统
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4
}
export interface LogEntry {
    level: LogLevel;
    message: string;
    data?: any;
    timestamp: number;
    stack?: string;
}
export type LogHandler = (entry: LogEntry) => void;
export declare class Logger {
    private static instance;
    private level;
    private handlers;
    private history;
    private maxHistorySize;
    private prefix;
    private constructor();
    static getInstance(): Logger;
    /**
     * 设置日志级别
     */
    setLevel(level: LogLevel): void;
    /**
     * 获取当前日志级别
     */
    getLevel(): LogLevel;
    /**
     * 设置日志前缀
     */
    setPrefix(prefix: string): void;
    /**
     * 添加日志处理器
     */
    addHandler(handler: LogHandler): () => void;
    /**
     * 移除日志处理器
     */
    removeHandler(handler: LogHandler): void;
    /**
     * 记录 DEBUG 级别日志
     */
    debug(message: string, data?: any): void;
    /**
     * 记录 INFO 级别日志
     */
    info(message: string, data?: any): void;
    /**
     * 记录 WARN 级别日志
     */
    warn(message: string, data?: any): void;
    /**
     * 记录 ERROR 级别日志
     */
    error(message: string, error?: any): void;
    /**
     * 核心日志记录方法
     */
    private log;
    /**
     * 控制台输出
     */
    private consoleOutput;
    /**
     * 获取日志历史
     */
    getHistory(level?: LogLevel): LogEntry[];
    /**
     * 清除日志历史
     */
    clearHistory(): void;
    /**
     * 导出日志为 JSON
     */
    exportLogs(): string;
    /**
     * 创建性能测量
     */
    time(label: string): () => void;
    /**
     * 分组日志开始
     */
    group(label: string): void;
    /**
     * 分组日志结束
     */
    groupEnd(): void;
    /**
     * 清除所有处理器和历史
     */
    dispose(): void;
}
export declare const logger: Logger;
//# sourceMappingURL=Logger.d.ts.map