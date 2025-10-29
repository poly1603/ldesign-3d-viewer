/**
 * WebWorker for loading textures in background thread
 * Prevents blocking main thread during image loading
 */
globalThis.onmessage = async (e) => {
    const { type, url, id } = e.data;
    if (type === 'load') {
        try {
            // Fetch image
            const response = await fetch(url);
            const blob = await response.blob();
            // Create ImageBitmap (GPU-accelerated)
            const imageBitmap = await createImageBitmap(blob, {
                premultiplyAlpha: 'none',
                colorSpaceConversion: 'none',
            });
            // Send back to main thread
            const message = {
                type: 'loaded',
                id,
                imageData: imageBitmap,
                width: imageBitmap.width,
                height: imageBitmap.height,
            };
            globalThis.postMessage(message, [imageBitmap]);
        }
        catch (error) {
            const errorMessage = {
                type: 'error',
                id,
                error: error instanceof Error ? error.message : String(error),
            };
            globalThis.postMessage(errorMessage);
        }
    }
};
export {};
//# sourceMappingURL=TextureLoader.worker.js.map