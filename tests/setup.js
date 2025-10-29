import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/vue';
// Extend Vitest matchers
expect.extend({
// Custom matchers can be added here
});
// Cleanup after each test
afterEach(() => {
    cleanup();
});
// Mock WebGL context for testing
HTMLCanvasElement.prototype.getContext = function (contextId) {
    if (contextId === 'webgl' || contextId === 'webgl2') {
        return {
            getExtension: () => null,
            getParameter: () => null,
            // Add more WebGL context mocks as needed
        };
    }
    return null;
};
// Mock device orientation for gyroscope tests
if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'DeviceOrientationEvent', {
        value: class MockDeviceOrientationEvent extends Event {
            constructor() {
                super(...arguments);
                this.alpha = 0;
                this.beta = 0;
                this.gamma = 0;
                this.absolute = false;
            }
        },
    });
}
//# sourceMappingURL=setup.js.map