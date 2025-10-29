export class WatermarkSystem {
    constructor(container, options = {}) {
        this.watermarkElement = null;
        this.container = container;
        this.options = {
            text: options.text || '',
            imageUrl: options.imageUrl || '',
            position: options.position || 'bottom-right',
            opacity: options.opacity ?? 0.7,
            fontSize: options.fontSize || 14,
            color: options.color || '#ffffff',
            offset: options.offset || { x: 20, y: 20 },
        };
    }
    /**
     * Show watermark
     */
    show() {
        if (this.watermarkElement) {
            this.watermarkElement.style.display = 'block';
            return;
        }
        this.watermarkElement = document.createElement('div');
        this.watermarkElement.className = 'panorama-watermark';
        this.updateStyles();
        this.updateContent();
        this.container.appendChild(this.watermarkElement);
    }
    /**
     * Hide watermark
     */
    hide() {
        if (this.watermarkElement) {
            this.watermarkElement.style.display = 'none';
        }
    }
    /**
     * Update watermark content
     */
    updateContent() {
        if (!this.watermarkElement)
            return;
        if (this.options.imageUrl) {
            const img = document.createElement('img');
            img.src = this.options.imageUrl;
            img.style.maxWidth = '200px';
            img.style.maxHeight = '50px';
            this.watermarkElement.innerHTML = '';
            this.watermarkElement.appendChild(img);
        }
        else if (this.options.text) {
            this.watermarkElement.textContent = this.options.text;
        }
    }
    /**
     * Update watermark styles
     */
    updateStyles() {
        if (!this.watermarkElement)
            return;
        const { position, opacity, fontSize, color, offset } = this.options;
        let baseStyle = `
      position: absolute;
      opacity: ${opacity};
      font-size: ${fontSize}px;
      color: ${color};
      pointer-events: none;
      z-index: 1000;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
      user-select: none;
    `;
        // Position-specific styles
        switch (position) {
            case 'top-left':
                baseStyle += `top: ${offset.y}px; left: ${offset.x}px;`;
                break;
            case 'top-right':
                baseStyle += `top: ${offset.y}px; right: ${offset.x}px;`;
                break;
            case 'bottom-left':
                baseStyle += `bottom: ${offset.y}px; left: ${offset.x}px;`;
                break;
            case 'bottom-right':
                baseStyle += `bottom: ${offset.y}px; right: ${offset.x}px;`;
                break;
            case 'center':
                baseStyle += `
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        `;
                break;
        }
        this.watermarkElement.style.cssText = baseStyle;
    }
    /**
     * Update watermark options
     */
    updateOptions(options) {
        Object.assign(this.options, options);
        if (this.watermarkElement) {
            this.updateStyles();
            this.updateContent();
        }
    }
    /**
     * Dispose watermark
     */
    dispose() {
        if (this.watermarkElement && this.container.contains(this.watermarkElement)) {
            this.container.removeChild(this.watermarkElement);
            this.watermarkElement = null;
        }
    }
}
//# sourceMappingURL=WatermarkSystem.js.map