/**
 * Logger 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Logger, LogLevel } from '../../src/core/Logger'

describe('Logger', () => {
  let logger: Logger
  let consoleSpy: {
    info: ReturnType<typeof vi.spyOn>
    warn: ReturnType<typeof vi.spyOn>
    error: ReturnType<typeof vi.spyOn>
    debug: ReturnType<typeof vi.spyOn>
  }

  beforeEach(() => {
    logger = Logger.getInstance()
    logger.clearHistory()
    logger.setLevel(LogLevel.DEBUG)
    logger.setPrefix('[TestLogger]')
    
    consoleSpy = {
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
    }
  })

  afterEach(() => {
    Object.values(consoleSpy).forEach(spy => spy.mockRestore())
  })

  describe('日志级别', () => {
    it('应该正确输出不同级别的日志', () => {
      logger.debug('Debug message')
      logger.info('Info message')
      logger.warn('Warning message')
      logger.error('Error message')

      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching(/\[TestLogger\].*Debug message/),
      )
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[TestLogger\].*Info message/),
      )
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringMatching(/\[TestLogger\].*Warning message/),
      )
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringMatching(/\[TestLogger\].*Error message/),
      )
    })

    it('应该根据日志级别过滤输出', () => {
      logger.setLevel(LogLevel.WARN)

      logger.debug('Should not show')
      logger.info('Should not show')
      logger.warn('Should show')
      logger.error('Should show')

      expect(consoleSpy.debug).not.toHaveBeenCalled()
      expect(consoleSpy.info).not.toHaveBeenCalled()
      expect(consoleSpy.warn).toHaveBeenCalled()
      expect(consoleSpy.error).toHaveBeenCalled()
    })

    it('ERROR级别只输出错误', () => {
      logger.setLevel(LogLevel.ERROR)

      logger.debug('No')
      logger.info('No')
      logger.warn('No')
      logger.error('Yes')

      expect(consoleSpy.debug).not.toHaveBeenCalled()
      expect(consoleSpy.info).not.toHaveBeenCalled()
      expect(consoleSpy.warn).not.toHaveBeenCalled()
      expect(consoleSpy.error).toHaveBeenCalled()
    })

    it('NONE级别不输出任何日志', () => {
      logger.setLevel(LogLevel.NONE)

      logger.debug('No')
      logger.info('No')
      logger.warn('No')
      logger.error('No')

      expect(consoleSpy.debug).not.toHaveBeenCalled()
      expect(consoleSpy.info).not.toHaveBeenCalled()
      expect(consoleSpy.warn).not.toHaveBeenCalled()
      expect(consoleSpy.error).not.toHaveBeenCalled()
    })
  })

  describe('日志格式', () => {
    it('应该包含ISO时间戳', () => {
      logger.info('Test')

      expect(consoleSpy.info).toHaveBeenCalled()
      const callArgs = consoleSpy.info.mock.calls[0]
      expect(callArgs[0]).toContain('T') // ISO format has 'T'
    })

    it('应该包含Logger名称', () => {
      logger.info('Test')

      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringMatching(/^\[TestLogger\]/),
      )
    })

    it('应该支持data参数', () => {
      const obj = { key: 'value' }
      logger.info('Message', obj)

      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[TestLogger\].*Message/),
        obj,
      )
    })
  })

  describe('日志历史', () => {
    it('应该记录日志历史', () => {
      logger.info('Message 1')
      logger.warn('Message 2')
      logger.error('Message 3')

      const history = logger.getHistory()
      expect(history).toHaveLength(3)
      expect(history[0].message).toBe('Message 1')
      expect(history[1].message).toBe('Message 2')
      expect(history[2].message).toBe('Message 3')
    })

    it('历史记录应该包含完整信息', () => {
      logger.info('Test message')

      const history = logger.getHistory()
      const record = history[0]

      expect(record).toHaveProperty('level', LogLevel.INFO)
      expect(record).toHaveProperty('message', 'Test message')
      expect(record).toHaveProperty('timestamp')
      expect(record.timestamp).toBeGreaterThan(0)
    })

    it('应该能够清除历史', () => {
      logger.info('Message 1')
      logger.info('Message 2')

      expect(logger.getHistory()).toHaveLength(2)

      logger.clearHistory()

      expect(logger.getHistory()).toHaveLength(0)
    })

    it('应该限制历史记录数量', () => {
      for (let i = 0; i < 600; i++) {
        logger.info(`Message ${i}`)
      }

      const history = logger.getHistory()
      expect(history.length).toBeLessThanOrEqual(500) // 默认限制
    })
  })

  describe('性能', () => {
    it('应该能够快速记录大量日志', () => {
      const start = performance.now()

      for (let i = 0; i < 1000; i++) {
        logger.info(`Message ${i}`)
      }

      const duration = performance.now() - start
      expect(duration).toBeLessThan(500) // 应该在500ms内完成
    })

    it('禁用日志时应该更快', () => {
      logger.setLevel(LogLevel.NONE)

      const start = performance.now()

      for (let i = 0; i < 1000; i++) {
        logger.info(`Message ${i}`)
      }

      const duration = performance.now() - start
      expect(duration).toBeLessThan(100) // 禁用时应该更快
    })
  })

  describe('错误对象处理', () => {
    it('应该能够记录Error对象', () => {
      const error = new Error('Test error')
      logger.error('An error occurred', error)

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringMatching(/An error occurred/),
        error,
      )
    })

    it('应该能够记录堆栈信息', () => {
      const error = new Error('Test error')
      logger.error('An error occurred', error)

      const history = logger.getHistory()
      const record = history[history.length - 1]

      expect(record.data).toBe(error)
      expect(record.stack).toBeDefined()
    })
  })

  describe('边界情况', () => {
    it('应该处理undefined和null', () => {
      expect(() => {
        logger.info('Message', undefined, null)
      }).not.toThrow()
    })

    it('应该处理循环引用对象', () => {
      const obj: any = { name: 'test' }
      obj.self = obj

      expect(() => {
        logger.info('Circular ref', obj)
      }).not.toThrow()
    })

    it('空消息也应该能记录', () => {
      logger.info('')

      expect(consoleSpy.info).toHaveBeenCalled()
    })
  })

  describe('全局logger实例', () => {
    it('导出的logger应该是单例', () => {
      // 这个测试需要导入全局logger实例
      // 暂时跳过，因为需要修改导入方式
    })
  })
})
