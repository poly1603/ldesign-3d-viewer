/**
 * CDN管理器
 * 自动CDN路径重写、多CDN容错、智能加速
 */

export interface CDNConfig {
  primary: string;
  fallbacks?: string[];
  pathPrefix?: string;
  enableAutoSwitch?: boolean;
  timeout?: number;
}

export interface CDNStats {
  cdn: string;
  successCount: number;
  failureCount: number;
  averageLatency: number;
  lastUsed: number;
}

export class CDNManager {
  private static instance: CDNManager;
  private config: Required<CDNConfig>;
  private cdnStats: Map<string, CDNStats> = new Map();
  private currentCDN: string;
  private failedUrls: Set<string> = new Set();

  private constructor(config?: CDNConfig) {
    this.config = {
      primary: config?.primary || '',
      fallbacks: config?.fallbacks || [],
      pathPrefix: config?.pathPrefix || '',
      enableAutoSwitch: config?.enableAutoSwitch ?? true,
      timeout: config?.timeout || 10000,
    };

    this.currentCDN = this.config.primary;
    this.initStats();
  }

  public static getInstance(config?: CDNConfig): CDNManager {
    if (!CDNManager.instance) {
      CDNManager.instance = new CDNManager(config);
    }
    return CDNManager.instance;
  }

  /**
   * 初始化统计
   */
  private initStats(): void {
    const allCDNs = [this.config.primary, ...this.config.fallbacks];
    allCDNs.forEach(cdn => {
      if (!this.cdnStats.has(cdn)) {
        this.cdnStats.set(cdn, {
          cdn,
          successCount: 0,
          failureCount: 0,
          averageLatency: 0,
          lastUsed: 0,
        });
      }
    });
  }

  /**
   * 获取完整URL
   */
  public getUrl(path: string, useFallback: boolean = false): string {
    // 如果已经是完整URL，直接返回
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
      return path;
    }

    // 移除开头的斜杠
    const cleanPath = path.replace(/^\/+/, '');

    // 添加路径前缀
    const fullPath = this.config.pathPrefix ?
      `${this.config.pathPrefix}/${cleanPath}` : cleanPath;

    // 选择CDN
    const cdn = useFallback ? this.selectBestFallback() : this.currentCDN;

    // 组合URL
    return this.combineCDNPath(cdn, fullPath);
  }

  /**
   * 组合CDN路径
   */
  private combineCDNPath(cdn: string, path: string): string {
    // 确保CDN末尾没有斜杠，路径开头没有斜杠
    const cleanCDN = cdn.replace(/\/+$/, '');
    const cleanPath = path.replace(/^\/+/, '');

    return `${cleanCDN}/${cleanPath}`;
  }

  /**
   * 选择最佳备用CDN
   */
  private selectBestFallback(): string {
    const fallbacks = this.config.fallbacks;
    if (fallbacks.length === 0) {
      return this.config.primary;
    }

    // 按成功率和延迟排序
    const sortedCDNs = fallbacks
      .map(cdn => ({
        cdn,
        stats: this.cdnStats.get(cdn)!,
      }))
      .sort((a, b) => {
        const aSuccessRate = a.stats.successCount / (a.stats.successCount + a.stats.failureCount || 1);
        const bSuccessRate = b.stats.successCount / (b.stats.successCount + b.stats.failureCount || 1);

        // 优先考虑成功率
        if (Math.abs(aSuccessRate - bSuccessRate) > 0.1) {
          return bSuccessRate - aSuccessRate;
        }

        // 其次考虑延迟
        return a.stats.averageLatency - b.stats.averageLatency;
      });

    return sortedCDNs[0]?.cdn || fallbacks[0];
  }

  /**
   * 加载资源（带容错）
   */
  public async loadWithFallback(path: string): Promise<string> {
    const allCDNs = [this.config.primary, ...this.config.fallbacks];
    let lastError: Error | null = null;

    for (const cdn of allCDNs) {
      try {
        const url = this.combineCDNPath(cdn, path);

        // 如果之前失败过，跳过
        if (this.failedUrls.has(url)) {
          continue;
        }

        const startTime = performance.now();
        await this.testUrl(url);
        const latency = performance.now() - startTime;

        // 更新统计
        this.updateStats(cdn, true, latency);

        // 切换到成功的CDN
        if (this.config.enableAutoSwitch) {
          this.currentCDN = cdn;
        }

        return url;
      } catch (error) {
        lastError = error as Error;
        this.updateStats(cdn, false, 0);
        continue;
      }
    }

    throw new Error(`Failed to load ${path} from all CDNs: ${lastError?.message}`);
  }

  /**
   * 测试URL是否可访问
   */
  private async testUrl(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timer = setTimeout(() => {
        img.src = '';
        this.failedUrls.add(url);
        reject(new Error('Timeout'));
      }, this.config.timeout);

      img.onload = () => {
        clearTimeout(timer);
        resolve();
      };

      img.onerror = () => {
        clearTimeout(timer);
        this.failedUrls.add(url);
        reject(new Error('Load failed'));
      };

      img.src = url;
    });
  }

  /**
   * 更新统计
   */
  private updateStats(cdn: string, success: boolean, latency: number): void {
    const stats = this.cdnStats.get(cdn);
    if (!stats) return;

    if (success) {
      stats.successCount++;
      // 计算平均延迟
      stats.averageLatency =
        (stats.averageLatency * (stats.successCount - 1) + latency) / stats.successCount;
    } else {
      stats.failureCount++;
    }

    stats.lastUsed = Date.now();
  }

  /**
   * 预热CDN
   * 加载一个小文件测试所有CDN的可用性
   */
  public async warmup(testPath: string = 'favicon.ico'): Promise<void> {
    const allCDNs = [this.config.primary, ...this.config.fallbacks];

    const promises = allCDNs.map(async cdn => {
      const url = this.combineCDNPath(cdn, testPath);
      const startTime = performance.now();

      try {
        await this.testUrl(url);
        const latency = performance.now() - startTime;
        this.updateStats(cdn, true, latency);
      } catch (error) {
        this.updateStats(cdn, false, 0);
      }
    });

    await Promise.allSettled(promises);

    // 选择最佳CDN作为当前CDN
    if (this.config.enableAutoSwitch) {
      this.currentCDN = this.selectBestFallback() || this.config.primary;
    }
  }

  /**
   * 批量转换URL
   */
  public convertUrls(urls: string[]): string[] {
    return urls.map(url => this.getUrl(url));
  }

  /**
   * 获取CDN统计
   */
  public getStats(): CDNStats[] {
    return Array.from(this.cdnStats.values());
  }

  /**
   * 获取当前CDN
   */
  public getCurrentCDN(): string {
    return this.currentCDN;
  }

  /**
   * 手动切换CDN
   */
  public switchCDN(cdn: string): void {
    const allCDNs = [this.config.primary, ...this.config.fallbacks];
    if (allCDNs.includes(cdn)) {
      this.currentCDN = cdn;
    } else {
      throw new Error(`CDN not found: ${cdn}`);
    }
  }

  /**
   * 重置统计
   */
  public resetStats(): void {
    this.cdnStats.forEach(stats => {
      stats.successCount = 0;
      stats.failureCount = 0;
      stats.averageLatency = 0;
    });
    this.failedUrls.clear();
  }

  /**
   * 获取健康的CDN列表
   */
  public getHealthyCDNs(): string[] {
    return Array.from(this.cdnStats.values())
      .filter(stats => {
        const successRate = stats.successCount / (stats.successCount + stats.failureCount || 1);
        return successRate > 0.8 && stats.averageLatency < 5000;
      })
      .map(stats => stats.cdn);
  }

  /**
   * 生成报告
   */
  public generateReport(): string {
    const stats = this.getStats();
    const healthyCDNs = this.getHealthyCDNs();

    let report = `CDN Manager Report\n==================\n\n`;
    report += `Current CDN: ${this.currentCDN}\n`;
    report += `Healthy CDNs: ${healthyCDNs.length}/${stats.length}\n\n`;

    report += `Statistics:\n`;
    stats.forEach(stat => {
      const total = stat.successCount + stat.failureCount;
      const successRate = total > 0 ? (stat.successCount / total * 100).toFixed(1) : 0;

      report += `\n${stat.cdn}:\n`;
      report += `  Success: ${stat.successCount} / ${total} (${successRate}%)\n`;
      report += `  Avg Latency: ${stat.averageLatency.toFixed(0)}ms\n`;
      report += `  Last Used: ${stat.lastUsed ? new Date(stat.lastUsed).toLocaleString() : 'Never'}\n`;
    });

    return report;
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<CDNConfig>): void {
    Object.assign(this.config, config);
    this.initStats();
  }
}

// 使用示例：
// const cdnManager = CDNManager.getInstance({
//   primary: 'https://cdn1.example.com',
//   fallbacks: ['https://cdn2.example.com', 'https://cdn3.example.com'],
//   pathPrefix: 'panorama',
//   enableAutoSwitch: true,
// });

