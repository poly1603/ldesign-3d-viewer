/**
 * 数据导出系统
 * 导出配置、场景快照、分析数据等
 */

export interface ExportConfig {
  includeScenes?: boolean
  includeHotspots?: boolean
  includeAnnotations?: boolean
  includeRegions?: boolean
  includePaths?: boolean
  includeSettings?: boolean
  includeAnalytics?: boolean
  format?: 'json' | 'csv' | 'xml'
}

export interface ExportData {
  version: string
  timestamp: number
  scenes?: any[]
  hotspots?: any[]
  annotations?: any[]
  regions?: any[]
  paths?: any[]
  settings?: any
  analytics?: any
}

export class DataExporter {
  private static instance: DataExporter

  private constructor() { }

  public static getInstance(): DataExporter {
    if (!DataExporter.instance) {
      DataExporter.instance = new DataExporter()
    }
    return DataExporter.instance
  }

  /**
   * 导出数据
   */
  public export(data: ExportData, config: ExportConfig = {}): string {
    const format = config.format || 'json'

    switch (format) {
      case 'json':
        return this.exportJSON(data, config)
      case 'csv':
        return this.exportCSV(data, config)
      case 'xml':
        return this.exportXML(data, config)
      default:
        return this.exportJSON(data, config)
    }
  }

  /**
   * 导出为 JSON
   */
  private exportJSON(data: ExportData, config: ExportConfig): string {
    const filtered = this.filterData(data, config)
    return JSON.stringify(filtered, null, 2)
  }

  /**
   * 导出为 CSV
   */
  private exportCSV(data: ExportData, config: ExportConfig): string {
    const filtered = this.filterData(data, config)
    let csv = ''

    // 场景
    if (filtered.scenes && filtered.scenes.length > 0) {
      csv += 'SCENES\n'
      csv += 'ID,Name,URL\n'
      filtered.scenes.forEach((scene: any) => {
        csv += `${scene.id},${scene.name},${scene.url}\n`
      })
      csv += '\n'
    }

    // 热点
    if (filtered.hotspots && filtered.hotspots.length > 0) {
      csv += 'HOTSPOTS\n'
      csv += 'ID,Label,Theta,Phi\n'
      filtered.hotspots.forEach((hotspot: any) => {
        csv += `${hotspot.id},${hotspot.label},${hotspot.position.theta},${hotspot.position.phi}\n`
      })
      csv += '\n'
    }

    return csv
  }

  /**
   * 导出为 XML
   */
  private exportXML(data: ExportData, config: ExportConfig): string {
    const filtered = this.filterData(data, config)
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<panorama-viewer-export>\n'
    xml += `  <version>${filtered.version}</version>\n`
    xml += `  <timestamp>${filtered.timestamp}</timestamp>\n`

    // 场景
    if (filtered.scenes && filtered.scenes.length > 0) {
      xml += '  <scenes>\n'
      filtered.scenes.forEach((scene: any) => {
        xml += `    <scene id="${scene.id}" name="${scene.name}" url="${scene.url}"/>\n`
      })
      xml += '  </scenes>\n'
    }

    xml += '</panorama-viewer-export>'
    return xml
  }

  /**
   * 过滤数据
   */
  private filterData(data: ExportData, config: ExportConfig): ExportData {
    const filtered: ExportData = {
      version: data.version,
      timestamp: data.timestamp,
    }

    if (config.includeScenes !== false && data.scenes) {
      filtered.scenes = data.scenes
    }

    if (config.includeHotspots !== false && data.hotspots) {
      filtered.hotspots = data.hotspots
    }

    if (config.includeAnnotations !== false && data.annotations) {
      filtered.annotations = data.annotations
    }

    if (config.includeRegions !== false && data.regions) {
      filtered.regions = data.regions
    }

    if (config.includePaths !== false && data.paths) {
      filtered.paths = data.paths
    }

    if (config.includeSettings !== false && data.settings) {
      filtered.settings = data.settings
    }

    if (config.includeAnalytics !== false && data.analytics) {
      filtered.analytics = data.analytics
    }

    return filtered
  }

  /**
   * 下载文件
   */
  public download(content: string, filename: string, mimeType: string = 'application/json'): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    URL.revokeObjectURL(url)
  }

  /**
   * 导入数据
   */
  public import(content: string, format: 'json' | 'csv' | 'xml' = 'json'): ExportData {
    switch (format) {
      case 'json':
        return JSON.parse(content)
      case 'csv':
        return this.importCSV(content)
      case 'xml':
        return this.importXML(content)
      default:
        return JSON.parse(content)
    }
  }

  /**
   * 从 CSV 导入
   */
  private importCSV(_content: string): ExportData {
    // 简化实现
    return {
      version: '2.1',
      timestamp: Date.now(),
    }
  }

  /**
   * 从 XML 导入
   */
  private importXML(_content: string): ExportData {
    // 简化实现
    return {
      version: '2.1',
      timestamp: Date.now(),
    }
  }

  /**
   * 从文件读取
   */
  public async readFile(file: File): Promise<ExportData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const ext = file.name.split('.').pop()?.toLowerCase()
          const format = ext === 'csv' ? 'csv' : ext === 'xml' ? 'xml' : 'json'
          const data = this.import(content, format)
          resolve(data)
        }
        catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }

  /**
   * 导出完整项目
   */
  public exportProject(data: ExportData, filename: string = 'panorama-project'): void {
    const content = this.export(data, {
      includeScenes: true,
      includeHotspots: true,
      includeAnnotations: true,
      includeRegions: true,
      includePaths: true,
      includeSettings: true,
      includeAnalytics: true,
    })

    this.download(content, `${filename}.json`)
  }

  /**
   * 导出快照（仅配置，不含数据）
   */
  public exportSnapshot(data: ExportData, filename: string = 'panorama-snapshot'): void {
    const content = this.export(data, {
      includeScenes: true,
      includeHotspots: true,
      includeAnnotations: true,
      includeSettings: true,
      includeAnalytics: false,
    })

    this.download(content, `${filename}.json`)
  }
}

// 导出单例
export const dataExporter = DataExporter.getInstance()
