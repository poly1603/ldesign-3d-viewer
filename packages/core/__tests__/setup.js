/**
 * 测试环境设置
 */
import { vi } from 'vitest';
// Mock WebGL context with full WebGL API required by Three.js
const createWebGLContext = () => {
    const gl = {
        canvas: document.createElement('canvas'),
        drawingBufferWidth: 800,
        drawingBufferHeight: 600,
        // WebGL constants
        VENDOR: 7936,
        RENDERER: 7937,
        VERSION: 7938,
        SHADING_LANGUAGE_VERSION: 35724,
        MAX_VERTEX_ATTRIBS: 35661,
        MAX_TEXTURE_IMAGE_UNITS: 34076,
        MAX_TEXTURE_SIZE: 3379,
        MAX_VIEWPORT_DIMS: 34024,
        VERTEX_SHADER: 35633,
        FRAGMENT_SHADER: 35632,
        ARRAY_BUFFER: 34962,
        ELEMENT_ARRAY_BUFFER: 34963,
        FLOAT: 5126,
        UNSIGNED_SHORT: 5123,
        TRIANGLES: 4,
        RGBA: 6408,
        UNSIGNED_BYTE: 5121,
        TEXTURE_2D: 3553,
        COMPILE_STATUS: 35713,
        LINK_STATUS: 35714,
        // WebGL methods
        getParameter: vi.fn((param) => {
            const params = {
                7936: 'WebKit WebGL', // VENDOR
                7937: 'WebKit', // RENDERER
                7938: 'WebGL 2.0', // VERSION
                35724: 'WebGL GLSL ES 1.0', // SHADING_LANGUAGE_VERSION
                35661: 16, // MAX_VERTEX_ATTRIBS
                34076: 16, // MAX_TEXTURE_IMAGE_UNITS
                3379: 16384, // MAX_TEXTURE_SIZE
                34024: 4096, // MAX_VIEWPORT_DIMS
                3386: [4096, 4096], // MAX_VIEWPORT_DIMS array
            };
            return params[param] !== undefined ? params[param] : 0;
        }),
        getExtension: vi.fn((name) => {
            // Return mock extensions
            if (name === 'WEBGL_compressed_texture_s3tc')
                return {};
            if (name === 'EXT_texture_filter_anisotropic')
                return { MAX_TEXTURE_MAX_ANISOTROPY_EXT: 34047 };
            if (name === 'OES_texture_float')
                return {};
            if (name === 'OES_texture_float_linear')
                return {};
            if (name === 'OES_standard_derivatives')
                return {};
            return null;
        }),
        getSupportedExtensions: vi.fn(() => [
            'WEBGL_compressed_texture_s3tc',
            'EXT_texture_filter_anisotropic',
            'OES_texture_float',
        ]),
        createShader: vi.fn(() => ({})),
        shaderSource: vi.fn(),
        compileShader: vi.fn(),
        getShaderParameter: vi.fn(() => true),
        createProgram: vi.fn(() => ({})),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        getProgramParameter: vi.fn(() => true),
        useProgram: vi.fn(),
        createBuffer: vi.fn(() => ({})),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        createTexture: vi.fn(() => ({})),
        bindTexture: vi.fn(),
        texImage2D: vi.fn(),
        texParameteri: vi.fn(),
        createFramebuffer: vi.fn(() => ({})),
        bindFramebuffer: vi.fn(),
        createRenderbuffer: vi.fn(() => ({})),
        bindRenderbuffer: vi.fn(),
        viewport: vi.fn(),
        clear: vi.fn(),
        clearColor: vi.fn(),
        enable: vi.fn(),
        disable: vi.fn(),
        depthFunc: vi.fn(),
        blendFunc: vi.fn(),
        drawArrays: vi.fn(),
        drawElements: vi.fn(),
        getAttribLocation: vi.fn(() => 0),
        getUniformLocation: vi.fn(() => ({})),
        enableVertexAttribArray: vi.fn(),
        vertexAttribPointer: vi.fn(),
        uniform1i: vi.fn(),
        uniform1f: vi.fn(),
        uniform2f: vi.fn(),
        uniform3f: vi.fn(),
        uniform4f: vi.fn(),
        uniformMatrix4fv: vi.fn(),
        activeTexture: vi.fn(),
        pixelStorei: vi.fn(),
        generateMipmap: vi.fn(),
        getError: vi.fn(() => 0),
        deleteShader: vi.fn(),
        deleteProgram: vi.fn(),
        deleteBuffer: vi.fn(),
        deleteTexture: vi.fn(),
        deleteFramebuffer: vi.fn(),
        deleteRenderbuffer: vi.fn(),
    };
    return gl;
};
HTMLCanvasElement.prototype.getContext = vi.fn((contextId) => {
    if (contextId === 'webgl' || contextId === 'webgl2' || contextId === 'experimental-webgl') {
        return createWebGLContext();
    }
    if (contextId === '2d') {
        return {
            fillRect: vi.fn(),
            clearRect: vi.fn(),
            getImageData: vi.fn(),
            putImageData: vi.fn(),
            drawImage: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
        };
    }
    return null;
});
// Mock window.devicePixelRatio
Object.defineProperty(window, 'devicePixelRatio', {
    writable: true,
    value: 1,
});
// Mock navigator.userAgent
Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
});
// Mock performance.memory
Object.defineProperty(performance, 'memory', {
    writable: true,
    value: {
        usedJSHeapSize: 10000000,
        totalJSHeapSize: 20000000,
        jsHeapSizeLimit: 100000000,
    },
});
//# sourceMappingURL=setup.js.map