/**
 * Camera path animation system
 * Animate camera along predefined paths with easing
 */
import type * as THREE from 'three';
export interface PathPoint {
    position?: {
        x: number;
        y: number;
        z: number;
    };
    rotation?: {
        x: number;
        y: number;
        z: number;
    };
    fov?: number;
    duration: number;
    easing?: 'linear' | 'easeInOut' | 'easeIn' | 'easeOut';
}
export declare class CameraPathAnimation {
    private camera;
    private path;
    private currentIndex;
    private isPlaying;
    private startTime;
    private onComplete?;
    private onUpdate?;
    private animationFrame;
    constructor(camera: THREE.PerspectiveCamera);
    /**
     * Set animation path
     */
    setPath(path: PathPoint[]): void;
    /**
     * Start animation
     */
    play(onComplete?: () => void, onUpdate?: (progress: number) => void): void;
    /**
     * Pause animation
     */
    pause(): void;
    /**
     * Resume animation
     */
    resume(): void;
    /**
     * Stop and reset animation
     */
    stop(): void;
    /**
     * Animation loop
     */
    private animate;
    /**
     * Interpolate between two points
     */
    private interpolate;
    /**
     * Linear interpolation
     */
    private lerp;
    /**
     * Apply easing function
     */
    private applyEasing;
    /**
     * Complete animation
     */
    private complete;
    /**
     * Check if animation is playing
     */
    isAnimating(): boolean;
    /**
     * Get current progress (0-1)
     */
    getProgress(): number;
}
//# sourceMappingURL=CameraPathAnimation.d.ts.map