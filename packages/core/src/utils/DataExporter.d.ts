/**
 * 数据导出系统
 * 导出配置、场景快照、分析数据等
 */
export interface ExportConfig {
    includeScenes?: boolean;
    includeHotspots?: boolean;
    includeAnnotations?: boolean;
    includeRegions?: boolean;
    includePaths?: boolean;
    includeSettings?: boolean;
    includeAnalytics?: boolean;
    format?: 'json' | 'csv' | 'xml';
}
export interface ExportData {
    version: string;
    timestamp: number;
    scenes?: any[];
    hotspots?: any[];
    annotations?: any[];
    regions?: any[];
    paths?: any[];
    settings?: any;
    analytics?: any;
}
export declare class DataExporter {
    private static instance;
    private constructor();
    static getInstance(): DataExporter;
    /**
     * 导出数据
     */
    export(data: ExportData, config?: ExportConfig): string;
    /**
     * 导出为 JSON
     */
    private exportJSON;
    /**
     * 导出为 CSV
     */
    private exportCSV;
    /**
     * 导出为 XML
     */
    private exportXML;
    /**
     * 过滤数据
     */
    private filterData;
    /**
     * 下载文件
     */
    download(content: string, filename: string, mimeType?: string): void;
    /**
     * 导入数据
     */
    import(content: string, format?: 'json' | 'csv' | 'xml'): ExportData;
    /**
     * 从 CSV 导入
     */
    private importCSV;
    /**
     * 从 XML 导入
     */
    private importXML;
    /**
     * 从文件读取
     */
    readFile(file: File): Promise<ExportData>;
    /**
     * 导出完整项目
     */
    exportProject(data: ExportData, filename?: string): void;
    /**
     * 导出快照（仅配置，不含数据）
     */
    exportSnapshot(data: ExportData, filename?: string): void;
}
export declare const dataExporter: DataExporter;
//# sourceMappingURL=DataExporter.d.ts.map