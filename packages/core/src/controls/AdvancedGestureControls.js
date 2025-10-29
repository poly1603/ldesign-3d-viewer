export class AdvancedGestureControls {
    constructor(element, onGesture) {
        this.enabled = true;
        // Touch tracking
        this.touches = new Map();
        this.lastTapTime = 0;
        this.longPressTimer = null;
        this.longPressDelay = 500; // ms
        // Pinch-rotate tracking
        this.lastPinchAngle = 0;
        this.lastPinchDistance = 0;
        this.element = element;
        this.onGesture = onGesture;
        this.boundTouchStart = this.onTouchStart.bind(this);
        this.boundTouchMove = this.onTouchMove.bind(this);
        this.boundTouchEnd = this.onTouchEnd.bind(this);
        this.bindEvents();
    }
    bindEvents() {
        this.element.addEventListener('touchstart', this.boundTouchStart, { passive: false });
        this.element.addEventListener('touchmove', this.boundTouchMove, { passive: false });
        this.element.addEventListener('touchend', this.boundTouchEnd, { passive: false });
    }
    onTouchStart(event) {
        if (!this.enabled)
            return;
        event.preventDefault();
        const now = Date.now();
        // Store touch points
        for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
            this.touches.set(touch.identifier, {
                x: touch.clientX,
                y: touch.clientY,
                time: now,
            });
        }
        // Single touch
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            // Check for double-tap
            if (now - this.lastTapTime < 300) {
                this.onGesture?.({
                    type: 'doubletap',
                    x: touch.clientX,
                    y: touch.clientY,
                });
                this.lastTapTime = 0; // Reset to prevent triple-tap
            }
            else {
                this.lastTapTime = now;
            }
            // Clear any existing long-press timer
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
            }
            // Start long-press detection
            this.longPressTimer = window.setTimeout(() => {
                this.onGesture?.({
                    type: 'longpress',
                    x: touch.clientX,
                    y: touch.clientY,
                });
                this.longPressTimer = null;
            }, this.longPressDelay);
        }
        // Two touches - initialize pinch-rotate
        if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            // Calculate initial distance and angle
            this.lastPinchDistance = this.getDistance(touch1.clientX, touch1.clientY, touch2.clientX, touch2.clientY);
            this.lastPinchAngle = this.getAngle(touch1.clientX, touch1.clientY, touch2.clientX, touch2.clientY);
        }
    }
    onTouchMove(event) {
        if (!this.enabled)
            return;
        event.preventDefault();
        // Cancel long-press if finger moves
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        // Two-finger pinch-rotate
        if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const distance = this.getDistance(touch1.clientX, touch1.clientY, touch2.clientX, touch2.clientY);
            const angle = this.getAngle(touch1.clientX, touch1.clientY, touch2.clientX, touch2.clientY);
            if (this.lastPinchDistance > 0) {
                const scale = distance / this.lastPinchDistance;
                const rotation = angle - this.lastPinchAngle;
                // Detect significant rotation (> 5 degrees)
                if (Math.abs(rotation) > 5) {
                    this.onGesture?.({
                        type: 'pinchrotate',
                        x: (touch1.clientX + touch2.clientX) / 2,
                        y: (touch1.clientY + touch2.clientY) / 2,
                        rotation,
                        scale,
                    });
                }
            }
            this.lastPinchDistance = distance;
            this.lastPinchAngle = angle;
        }
    }
    onTouchEnd(event) {
        if (!this.enabled)
            return;
        // Cancel long-press
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        // Remove ended touches
        const changedTouches = Array.from(event.changedTouches);
        changedTouches.forEach((touch) => {
            const startTouch = this.touches.get(touch.identifier);
            if (startTouch) {
                const deltaX = touch.clientX - startTouch.x;
                const deltaY = touch.clientY - startTouch.y;
                const deltaTime = Date.now() - startTouch.time;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                // Detect swipe (fast movement > 50px)
                if (distance > 50 && deltaTime < 300) {
                    this.onGesture?.({
                        type: 'swipe',
                        x: touch.clientX,
                        y: touch.clientY,
                        deltaX,
                        deltaY,
                    });
                }
                // Detect tap (short touch, small movement)
                else if (distance < 10 && deltaTime < 300) {
                    this.onGesture?.({
                        type: 'tap',
                        x: touch.clientX,
                        y: touch.clientY,
                    });
                }
                this.touches.delete(touch.identifier);
            }
        });
        // Reset pinch-rotate state
        if (event.touches.length < 2) {
            this.lastPinchDistance = 0;
            this.lastPinchAngle = 0;
        }
    }
    getDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    getAngle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
    }
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    dispose() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        this.element.removeEventListener('touchstart', this.boundTouchStart);
        this.element.removeEventListener('touchmove', this.boundTouchMove);
        this.element.removeEventListener('touchend', this.boundTouchEnd);
        this.touches.clear();
        this.enabled = false;
    }
}
//# sourceMappingURL=AdvancedGestureControls.js.map