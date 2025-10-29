/**
 * 数据导出系统
 * 导出配置、场景快照、分析数据等
 */
export class DataExporter {
    constructor() { }
    static getInstance() {
        if (!DataExporter.instance) {
            DataExporter.instance = new DataExporter();
        }
        return DataExporter.instance;
    }
    /**
     * 导出数据
     */
    export(data, config = {}) {
        const format = config.format || 'json';
        switch (format) {
            case 'json':
                return this.exportJSON(data, config);
            case 'csv':
                return this.exportCSV(data, config);
            case 'xml':
                return this.exportXML(data, config);
            default:
                return this.exportJSON(data, config);
        }
    }
    /**
     * 导出为 JSON
     */
    exportJSON(data, config) {
        const filtered = this.filterData(data, config);
        return JSON.stringify(filtered, null, 2);
    }
    /**
     * 导出为 CSV
     */
    exportCSV(data, config) {
        const filtered = this.filterData(data, config);
        let csv = '';
        // 场景
        if (filtered.scenes && filtered.scenes.length > 0) {
            csv += 'SCENES\n';
            csv += 'ID,Name,URL\n';
            filtered.scenes.forEach((scene) => {
                csv += `${scene.id},${scene.name},${scene.url}\n`;
            });
            csv += '\n';
        }
        // 热点
        if (filtered.hotspots && filtered.hotspots.length > 0) {
            csv += 'HOTSPOTS\n';
            csv += 'ID,Label,Theta,Phi\n';
            filtered.hotspots.forEach((hotspot) => {
                csv += `${hotspot.id},${hotspot.label},${hotspot.position.theta},${hotspot.position.phi}\n`;
            });
            csv += '\n';
        }
        return csv;
    }
    /**
     * 导出为 XML
     */
    exportXML(data, config) {
        const filtered = this.filterData(data, config);
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<panorama-viewer-export>\n';
        xml += `  <version>${filtered.version}</version>\n`;
        xml += `  <timestamp>${filtered.timestamp}</timestamp>\n`;
        // 场景
        if (filtered.scenes && filtered.scenes.length > 0) {
            xml += '  <scenes>\n';
            filtered.scenes.forEach((scene) => {
                xml += `    <scene id="${scene.id}" name="${scene.name}" url="${scene.url}"/>\n`;
            });
            xml += '  </scenes>\n';
        }
        xml += '</panorama-viewer-export>';
        return xml;
    }
    /**
     * 过滤数据
     */
    filterData(data, config) {
        const filtered = {
            version: data.version,
            timestamp: data.timestamp,
        };
        if (config.includeScenes !== false && data.scenes) {
            filtered.scenes = data.scenes;
        }
        if (config.includeHotspots !== false && data.hotspots) {
            filtered.hotspots = data.hotspots;
        }
        if (config.includeAnnotations !== false && data.annotations) {
            filtered.annotations = data.annotations;
        }
        if (config.includeRegions !== false && data.regions) {
            filtered.regions = data.regions;
        }
        if (config.includePaths !== false && data.paths) {
            filtered.paths = data.paths;
        }
        if (config.includeSettings !== false && data.settings) {
            filtered.settings = data.settings;
        }
        if (config.includeAnalytics !== false && data.analytics) {
            filtered.analytics = data.analytics;
        }
        return filtered;
    }
    /**
     * 下载文件
     */
    download(content, filename, mimeType = 'application/json') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }
    /**
     * 导入数据
     */
    import(content, format = 'json') {
        switch (format) {
            case 'json':
                return JSON.parse(content);
            case 'csv':
                return this.importCSV(content);
            case 'xml':
                return this.importXML(content);
            default:
                return JSON.parse(content);
        }
    }
    /**
     * 从 CSV 导入
     */
    importCSV(_content) {
        // 简化实现
        return {
            version: '2.1',
            timestamp: Date.now(),
        };
    }
    /**
     * 从 XML 导入
     */
    importXML(_content) {
        // 简化实现
        return {
            version: '2.1',
            timestamp: Date.now(),
        };
    }
    /**
     * 从文件读取
     */
    async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result;
                    const ext = file.name.split('.').pop()?.toLowerCase();
                    const format = ext === 'csv' ? 'csv' : ext === 'xml' ? 'xml' : 'json';
                    const data = this.import(content, format);
                    resolve(data);
                }
                catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }
    /**
     * 导出完整项目
     */
    exportProject(data, filename = 'panorama-project') {
        const content = this.export(data, {
            includeScenes: true,
            includeHotspots: true,
            includeAnnotations: true,
            includeRegions: true,
            includePaths: true,
            includeSettings: true,
            includeAnalytics: true,
        });
        this.download(content, `${filename}.json`);
    }
    /**
     * 导出快照（仅配置，不含数据）
     */
    exportSnapshot(data, filename = 'panorama-snapshot') {
        const content = this.export(data, {
            includeScenes: true,
            includeHotspots: true,
            includeAnnotations: true,
            includeSettings: true,
            includeAnalytics: false,
        });
        this.download(content, `${filename}.json`);
    }
}
// 导出单例
export const dataExporter = DataExporter.getInstance();
//# sourceMappingURL=DataExporter.js.map