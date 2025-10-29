/**
 * 分享插件示例
 * 提供截图分享功能
 */
import { definePlugin } from '../PluginManager';
import { logger } from '../../core/Logger';
export const SharePlugin = definePlugin({
    metadata: {
        name: 'share',
        version: '1.0.0',
        author: 'PanoramaViewer Team',
        description: 'Share panorama screenshots to social media',
    },
    install(context) {
        logger.info('SharePlugin installing...');
        const options = {
            position: 'top-right',
            platforms: ['twitter', 'facebook', 'download'],
        };
        // 创建分享按钮
        const shareButton = this.createShareButton(options);
        context.container.appendChild(shareButton);
        // 创建分享面板
        const sharePanel = this.createSharePanel(options, context);
        context.container.appendChild(sharePanel);
        // 绑定事件
        shareButton.addEventListener('click', () => {
            sharePanel.style.display = sharePanel.style.display === 'none' ? 'block' : 'none';
        });
        // 存储引用以便卸载
        this.shareButton = shareButton;
        this.sharePanel = sharePanel;
        this.context = context;
        logger.info('SharePlugin installed');
    },
    uninstall() {
        const shareButton = this.shareButton;
        const sharePanel = this.sharePanel;
        const context = this.context;
        if (shareButton && context.container.contains(shareButton)) {
            context.container.removeChild(shareButton);
        }
        if (sharePanel && context.container.contains(sharePanel)) {
            context.container.removeChild(sharePanel);
        }
        logger.info('SharePlugin uninstalled');
    },
    createShareButton(options) {
        const button = document.createElement('button');
        button.className = 'share-button';
        button.innerHTML = '📤';
        const positions = {
            'top-left': 'top: 10px; left: 10px;',
            'top-right': 'top: 10px; right: 10px;',
            'bottom-left': 'bottom: 10px; left: 10px;',
            'bottom-right': 'bottom: 10px; right: 10px;',
        };
        button.style.cssText = `
      position: absolute;
      ${positions[options.position || 'top-right']}
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      font-size: 20px;
      cursor: pointer;
      z-index: 1000;
      transition: background 0.3s;
    `;
        button.addEventListener('mouseenter', () => {
            button.style.background = 'rgba(0, 0, 0, 0.9)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = 'rgba(0, 0, 0, 0.7)';
        });
        return button;
    },
    createSharePanel(options, context) {
        const panel = document.createElement('div');
        panel.className = 'share-panel';
        panel.style.cssText = `
      position: absolute;
      top: 60px;
      right: 10px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 16px;
      z-index: 1001;
      display: none;
      min-width: 200px;
    `;
        // 标题
        const title = document.createElement('h3');
        title.textContent = 'Share';
        title.style.cssText = 'margin: 0 0 12px 0; font-size: 16px;';
        panel.appendChild(title);
        // 平台按钮
        const platforms = options.platforms || ['twitter', 'facebook', 'download'];
        platforms.forEach((platform) => {
            const btn = document.createElement('button');
            btn.style.cssText = `
        width: 100%;
        padding: 8px 12px;
        margin-bottom: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        text-align: left;
        font-size: 14px;
        transition: background 0.2s;
      `;
            switch (platform) {
                case 'twitter':
                    btn.textContent = '🐦 Share on Twitter';
                    btn.addEventListener('click', () => this.shareToTwitter(context));
                    break;
                case 'facebook':
                    btn.textContent = '📘 Share on Facebook';
                    btn.addEventListener('click', () => this.shareToFacebook(context));
                    break;
                case 'wechat':
                    btn.textContent = '💬 Share to WeChat';
                    btn.addEventListener('click', () => this.shareToWeChat(context));
                    break;
                case 'download':
                    btn.textContent = '💾 Download Screenshot';
                    btn.addEventListener('click', () => this.downloadScreenshot(context));
                    break;
            }
            btn.addEventListener('mouseenter', () => {
                btn.style.background = '#f5f5f5';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'white';
            });
            panel.appendChild(btn);
        });
        return panel;
    },
    async shareToTwitter(context) {
        const _screenshot = context.viewer.screenshot();
        const text = 'Check out this amazing panorama!';
        const url = window.location.href;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank');
        logger.info('Shared to Twitter');
    },
    async shareToFacebook(_context) {
        const url = window.location.href;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(facebookUrl, '_blank');
        logger.info('Shared to Facebook');
    },
    async shareToWeChat(_context) {
        // 生成二维码逻辑
        logger.warn('Scan QR code with WeChat to share');
        logger.info('Shared to WeChat');
    },
    downloadScreenshot(context) {
        const dataUrl = context.viewer.screenshot();
        const link = document.createElement('a');
        link.download = `panorama_${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        logger.info('Screenshot downloaded');
    },
});
//# sourceMappingURL=SharePlugin.js.map