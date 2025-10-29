/**
 * 分级日志系统
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["NONE"] = 4] = "NONE";
})(LogLevel || (LogLevel = {}));
export class Logger {
    constructor() {
        this.level = LogLevel.INFO;
        this.handlers = new Set();
        this.history = [];
        this.maxHistorySize = 500;
        this.prefix = '[PanoramaViewer]';
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    /**
     * 设置日志级别
     */
    setLevel(level) {
        this.level = level;
    }
    /**
     * 获取当前日志级别
     */
    getLevel() {
        return this.level;
    }
    /**
     * 设置日志前缀
     */
    setPrefix(prefix) {
        this.prefix = prefix;
    }
    /**
     * 添加日志处理器
     */
    addHandler(handler) {
        this.handlers.add(handler);
        return () => this.handlers.delete(handler);
    }
    /**
     * 移除日志处理器
     */
    removeHandler(handler) {
        this.handlers.delete(handler);
    }
    /**
     * 记录 DEBUG 级别日志
     */
    debug(message, data) {
        this.log(LogLevel.DEBUG, message, data);
    }
    /**
     * 记录 INFO 级别日志
     */
    info(message, data) {
        this.log(LogLevel.INFO, message, data);
    }
    /**
     * 记录 WARN 级别日志
     */
    warn(message, data) {
        this.log(LogLevel.WARN, message, data);
    }
    /**
     * 记录 ERROR 级别日志
     */
    error(message, error) {
        const stack = error instanceof Error ? error.stack : undefined;
        this.log(LogLevel.ERROR, message, error, stack);
    }
    /**
     * 核心日志记录方法
     */
    log(level, message, data, stack) {
        if (level < this.level) {
            return;
        }
        const entry = {
            level,
            message,
            data,
            timestamp: Date.now(),
            stack,
        };
        // 添加到历史记录
        this.history.push(entry);
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
        // 调用自定义处理器
        this.handlers.forEach((handler) => {
            try {
                handler(entry);
            }
            catch (error) {
                // 避免处理器错误导致崩溃
                console.error('Error in log handler:', error);
            }
        });
        // 默认控制台输出
        this.consoleOutput(entry);
    }
    /**
     * 控制台输出
     */
    consoleOutput(entry) {
        const { level, message, data, timestamp, stack } = entry;
        const time = new Date(timestamp).toISOString();
        const formattedMessage = `${this.prefix} ${time} ${message}`;
        switch (level) {
            case LogLevel.DEBUG:
                if (data !== undefined) {
                    // eslint-disable-next-line no-console
                    console.debug(formattedMessage, data);
                }
                else {
                    // eslint-disable-next-line no-console
                    console.debug(formattedMessage);
                }
                break;
            case LogLevel.INFO:
                if (data !== undefined) {
                    // eslint-disable-next-line no-console
                    console.info(formattedMessage, data);
                }
                else {
                    // eslint-disable-next-line no-console
                    console.info(formattedMessage);
                }
                break;
            case LogLevel.WARN:
                if (data !== undefined) {
                    console.warn(formattedMessage, data);
                }
                else {
                    console.warn(formattedMessage);
                }
                break;
            case LogLevel.ERROR:
                if (data !== undefined) {
                    console.error(formattedMessage, data);
                }
                else {
                    console.error(formattedMessage);
                }
                if (stack) {
                    console.error(stack);
                }
                break;
        }
    }
    /**
     * 获取日志历史
     */
    getHistory(level) {
        if (level !== undefined) {
            return this.history.filter(entry => entry.level === level);
        }
        return [...this.history];
    }
    /**
     * 清除日志历史
     */
    clearHistory() {
        this.history = [];
    }
    /**
     * 导出日志为 JSON
     */
    exportLogs() {
        return JSON.stringify(this.history, null, 2);
    }
    /**
     * 创建性能测量
     */
    time(label) {
        const startTime = performance.now();
        return () => {
            const duration = performance.now() - startTime;
            this.debug(`${label} took ${duration.toFixed(2)}ms`);
        };
    }
    /**
     * 分组日志开始
     */
    group(label) {
        // eslint-disable-next-line no-console
        console.group(`${this.prefix} ${label}`);
    }
    /**
     * 分组日志结束
     */
    groupEnd() {
        // eslint-disable-next-line no-console
        console.groupEnd();
    }
    /**
     * 清除所有处理器和历史
     */
    dispose() {
        this.handlers.clear();
        this.clearHistory();
    }
}
// 导出单例
export const logger = Logger.getInstance();
//# sourceMappingURL=Logger.js.map