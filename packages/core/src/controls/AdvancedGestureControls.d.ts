/**
 * Advanced gesture recognition
 * Supports double-tap, long-press, pinch-rotate, and more
 */
export type GestureType = 'tap' | 'doubletap' | 'longpress' | 'swipe' | 'pinchrotate';
export interface GestureEvent {
    type: GestureType;
    x: number;
    y: number;
    deltaX?: number;
    deltaY?: number;
    rotation?: number;
    scale?: number;
}
export declare class AdvancedGestureControls {
    private element;
    private enabled;
    private onGesture?;
    private touches;
    private lastTapTime;
    private longPressTimer;
    private longPressDelay;
    private lastPinchAngle;
    private lastPinchDistance;
    private boundTouchStart;
    private boundTouchMove;
    private boundTouchEnd;
    constructor(element: HTMLElement, onGesture?: (event: GestureEvent) => void);
    private bindEvents;
    private onTouchStart;
    private onTouchMove;
    private onTouchEnd;
    private getDistance;
    private getAngle;
    setEnabled(enabled: boolean): void;
    dispose(): void;
}
//# sourceMappingURL=AdvancedGestureControls.d.ts.map