/**
 * 分享插件示例
 * 提供截图分享功能
 */
import type { Plugin } from '../PluginManager';
export interface SharePluginOptions {
    /** 分享按钮位置 */
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    /** 支持的平台 */
    platforms?: Array<'twitter' | 'facebook' | 'wechat' | 'download'>;
    /** 自定义样式 */
    customStyle?: Partial<CSSStyleDeclaration>;
}
export declare const SharePlugin: Plugin;
//# sourceMappingURL=SharePlugin.d.ts.map