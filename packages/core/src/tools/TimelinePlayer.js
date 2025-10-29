/**
 * 时间轴播放器
 * 播放时间序列全景，支持时间刻度控制
 */
export class TimelinePlayer {
    constructor(container, config, onFrameChange) {
        this.currentIndex = 0;
        this.isPlaying = false;
        this.startTime = 0;
        this.pauseTime = 0;
        this.controlsElement = null;
        this.container = container;
        this.onFrameChange = onFrameChange;
        this.config = {
            frames: config.frames || [],
            loop: config.loop ?? false,
            autoPlay: config.autoPlay ?? false,
            playbackSpeed: config.playbackSpeed ?? 1.0,
            showControls: config.showControls ?? true,
        };
        if (this.config.showControls) {
            this.createControls();
        }
        if (this.config.autoPlay) {
            this.play();
        }
    }
    /**
     * 创建控制面板
     */
    createControls() {
        this.controlsElement = document.createElement('div');
        this.controlsElement.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-family: Arial, sans-serif;
      z-index: 1000;
      min-width: 300px;
    `;
        this.controlsElement.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
        <button id="timeline-play" style="padding: 5px 15px; cursor: pointer;">▶ 播放</button>
        <button id="timeline-pause" style="padding: 5px 15px; cursor: pointer;">⏸ 暂停</button>
        <button id="timeline-prev" style="padding: 5px 10px; cursor: pointer;">◀</button>
        <button id="timeline-next" style="padding: 5px 10px; cursor: pointer;">▶</button>
      </div>
      <div>
        <input type="range" id="timeline-slider" min="0" max="${this.config.frames.length - 1}" value="0" style="width: 100%;">
      </div>
      <div style="margin-top: 5px; font-size: 12px; display: flex; justify-content: space-between;">
        <span id="timeline-current">帧 0</span>
        <span id="timeline-label"></span>
        <span id="timeline-total">共 ${this.config.frames.length} 帧</span>
      </div>
    `;
        this.container.appendChild(this.controlsElement);
        // 绑定事件
        this.controlsElement.querySelector('#timeline-play')?.addEventListener('click', () => this.play());
        this.controlsElement.querySelector('#timeline-pause')?.addEventListener('click', () => this.pause());
        this.controlsElement.querySelector('#timeline-prev')?.addEventListener('click', () => this.previous());
        this.controlsElement.querySelector('#timeline-next')?.addEventListener('click', () => this.next());
        const slider = this.controlsElement.querySelector('#timeline-slider');
        slider?.addEventListener('input', (e) => {
            const index = Number.parseInt(e.target.value);
            this.seekTo(index);
        });
    }
    /**
     * 更新控制面板
     */
    updateControls() {
        if (!this.controlsElement)
            return;
        const currentSpan = this.controlsElement.querySelector('#timeline-current');
        const labelSpan = this.controlsElement.querySelector('#timeline-label');
        const slider = this.controlsElement.querySelector('#timeline-slider');
        if (currentSpan) {
            currentSpan.textContent = `帧 ${this.currentIndex}`;
        }
        if (labelSpan && this.config.frames[this.currentIndex]?.label) {
            labelSpan.textContent = this.config.frames[this.currentIndex].label;
        }
        if (slider) {
            slider.value = String(this.currentIndex);
        }
    }
    /**
     * 播放
     */
    play() {
        if (this.isPlaying)
            return;
        this.isPlaying = true;
        this.startTime = Date.now() - this.pauseTime;
        this.animate();
    }
    /**
     * 暂停
     */
    pause() {
        if (!this.isPlaying)
            return;
        this.isPlaying = false;
        this.pauseTime = Date.now() - this.startTime;
    }
    /**
     * 停止
     */
    stop() {
        this.isPlaying = false;
        this.currentIndex = 0;
        this.pauseTime = 0;
        this.updateFrame();
    }
    /**
     * 动画循环
     */
    animate() {
        if (!this.isPlaying)
            return;
        const elapsed = (Date.now() - this.startTime) * this.config.playbackSpeed;
        // 计算当前应该显示的帧
        const frames = this.config.frames;
        if (frames.length === 0)
            return;
        // 简化：基于索引播放
        const targetIndex = Math.floor(elapsed / 1000) % frames.length;
        if (targetIndex !== this.currentIndex) {
            this.currentIndex = targetIndex;
            this.updateFrame();
            // 检查是否到达结尾
            if (this.currentIndex >= frames.length - 1 && !this.config.loop) {
                this.pause();
                return;
            }
        }
        requestAnimationFrame(() => this.animate());
    }
    /**
     * 更新帧
     */
    updateFrame() {
        const frame = this.config.frames[this.currentIndex];
        if (!frame)
            return;
        if (this.onFrameChange) {
            this.onFrameChange(frame, this.currentIndex);
        }
        this.updateControls();
    }
    /**
     * 跳转到指定帧
     */
    seekTo(index) {
        this.currentIndex = Math.max(0, Math.min(index, this.config.frames.length - 1));
        this.updateFrame();
    }
    /**
     * 下一帧
     */
    next() {
        if (this.currentIndex < this.config.frames.length - 1) {
            this.currentIndex++;
        }
        else if (this.config.loop) {
            this.currentIndex = 0;
        }
        this.updateFrame();
    }
    /**
     * 上一帧
     */
    previous() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
        }
        else if (this.config.loop) {
            this.currentIndex = this.config.frames.length - 1;
        }
        this.updateFrame();
    }
    /**
     * 设置播放速度
     */
    setPlaybackSpeed(speed) {
        this.config.playbackSpeed = Math.max(0.1, Math.min(speed, 10));
    }
    /**
     * 添加帧
     */
    addFrame(frame) {
        this.config.frames.push(frame);
        this.updateControls();
    }
    /**
     * 移除帧
     */
    removeFrame(index) {
        if (index >= 0 && index < this.config.frames.length) {
            this.config.frames.splice(index, 1);
            if (this.currentIndex >= this.config.frames.length) {
                this.currentIndex = Math.max(0, this.config.frames.length - 1);
            }
            this.updateControls();
        }
    }
    /**
     * 清理资源
     */
    dispose() {
        this.pause();
        if (this.controlsElement) {
            this.controlsElement.remove();
        }
    }
}
//# sourceMappingURL=TimelinePlayer.js.map