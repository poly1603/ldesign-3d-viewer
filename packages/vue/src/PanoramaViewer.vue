<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import {
  PanoramaViewer as CoreViewer,
  type CubemapImages,
  EventBus,
  type Hotspot,
  type PerformanceStats,
  type ViewLimits,
  type ViewerOptions,
} from '@panorama-viewer/core'

export interface PanoramaViewerProps {
  image: string | CubemapImages
  format?: 'equirectangular' | 'cubemap'
  fov?: number
  minFov?: number
  maxFov?: number
  autoRotate?: boolean
  autoRotateSpeed?: number
  gyroscope?: boolean
  width?: string
  height?: string
  viewLimits?: ViewLimits | null
  keyboardControls?: boolean
  renderOnDemand?: boolean
  showMiniMap?: boolean
}

const props = withDefaults(defineProps<PanoramaViewerProps>(), {
  format: 'equirectangular',
  fov: 75,
  minFov: 30,
  maxFov: 100,
  autoRotate: false,
  autoRotateSpeed: 0.5,
  gyroscope: true,
  width: '100%',
  height: '500px',
  viewLimits: null,
  keyboardControls: true,
  renderOnDemand: true,
  showMiniMap: true,
})

const emit = defineEmits<{
  ready: []
  error: [error: Error]
  progress: [progress: number]
  hotspotClick: [hotspot: Hotspot]
}>()

const containerRef = ref<HTMLElement>()
const viewerInstance = ref<CoreViewer | null>(null)
const eventBus = new EventBus()
const isLoading = ref(false)
const loadingProgress = ref(0)
const error = ref<Error | null>(null)
const performanceStats = ref<PerformanceStats | null>(null)

const containerStyle = computed(() => ({
  width: props.width,
  height: props.height,
}))

// 提供给子组件
provide('panoramaViewer', viewerInstance)
provide('eventBus', eventBus)

onMounted(() => {
  if (!containerRef.value)
    return

  try {
    const options: ViewerOptions = {
      container: containerRef.value,
      image: props.image,
      format: props.format,
      fov: props.fov,
      minFov: props.minFov,
      maxFov: props.maxFov,
      autoRotate: props.autoRotate,
      autoRotateSpeed: props.autoRotateSpeed,
      gyroscope: props.gyroscope,
      viewLimits: props.viewLimits,
      keyboardControls: props.keyboardControls,
      renderOnDemand: props.renderOnDemand,
      enablePerformanceMonitor: true,
    }

    viewerInstance.value = new CoreViewer(options)

    // 订阅事件
    eventBus.on('image:loading', ({ progress }) => {
      isLoading.value = true
      loadingProgress.value = progress
      emit('progress', progress)
    })

    eventBus.on('image:loaded', () => {
      isLoading.value = false
      error.value = null
    })

    eventBus.on('image:error', ({ error: err }) => {
      isLoading.value = false
      error.value = err
      emit('error', err)
    })

    eventBus.on('hotspot:click', ({ id, data }) => {
      emit('hotspotClick', { id, data } as Hotspot)
    })

    eventBus.on('performance:stats', (stats) => {
      performanceStats.value = stats as PerformanceStats
    })

    // Set initial minimap visibility
    if (!props.showMiniMap && viewerInstance.value) {
      viewerInstance.value.hideMiniMap()
    }

    emit('ready')
  }
  catch (err) {
    error.value = err as Error
    emit('error', err as Error)
  }
})

onBeforeUnmount(() => {
  if (viewerInstance.value) {
    viewerInstance.value.dispose()
    viewerInstance.value = null
  }
  eventBus.dispose()
})

// Watch for image changes
watch(
  () => props.image,
  async (newImage) => {
    if (viewerInstance.value) {
      try {
        await viewerInstance.value.loadImage(newImage, true)
      }
      catch (error) {
        emit('error', error as Error)
      }
    }
  },
)

// Watch for autoRotate changes
watch(
  () => props.autoRotate,
  (newValue) => {
    if (viewerInstance.value) {
      if (newValue) {
        viewerInstance.value.enableAutoRotate()
      }
      else {
        viewerInstance.value.disableAutoRotate()
      }
    }
  },
)

// Watch for viewLimits changes
watch(
  () => props.viewLimits,
  (newLimits) => {
    if (viewerInstance.value) {
      viewerInstance.value.setViewLimits(newLimits)
    }
  },
)

// Watch for minimap visibility
watch(
  () => props.showMiniMap,
  (newValue) => {
    if (viewerInstance.value) {
      if (newValue) {
        viewerInstance.value.showMiniMap()
      }
      else {
        viewerInstance.value.hideMiniMap()
      }
    }
  },
)

// Expose methods to parent component
async function loadImage(url: string | CubemapImages, transition = false): Promise<void> {
  if (viewerInstance.value) {
    await viewerInstance.value.loadImage(url, transition)
  }
}

function reset(): void {
  if (viewerInstance.value) {
    viewerInstance.value.reset()
  }
}

function enableAutoRotate(): void {
  if (viewerInstance.value) {
    viewerInstance.value.enableAutoRotate()
  }
}

function disableAutoRotate(): void {
  if (viewerInstance.value) {
    viewerInstance.value.disableAutoRotate()
  }
}

async function enableGyroscope(): Promise<boolean> {
  if (viewerInstance.value) {
    return await viewerInstance.value.enableGyroscope()
  }
  return false
}

function disableGyroscope(): void {
  if (viewerInstance.value) {
    viewerInstance.value.disableGyroscope()
  }
}

function getRotation() {
  if (viewerInstance.value) {
    return viewerInstance.value.getRotation()
  }
  return { x: 0, y: 0, z: 0 }
}

function setRotation(x: number, y: number, z: number): void {
  if (viewerInstance.value) {
    viewerInstance.value.setRotation(x, y, z)
  }
}

function addHotspot(hotspot: Hotspot): void {
  if (viewerInstance.value) {
    viewerInstance.value.addHotspot(hotspot)
  }
}

function removeHotspot(id: string): void {
  if (viewerInstance.value) {
    viewerInstance.value.removeHotspot(id)
  }
}

function getHotspots(): Hotspot[] {
  if (viewerInstance.value) {
    return viewerInstance.value.getHotspots()
  }
  return []
}

async function enterFullscreen(): Promise<void> {
  if (viewerInstance.value) {
    await viewerInstance.value.enterFullscreen()
  }
}

function exitFullscreen(): void {
  if (viewerInstance.value) {
    viewerInstance.value.exitFullscreen()
  }
}

function isFullscreen(): boolean {
  if (viewerInstance.value) {
    return viewerInstance.value.isFullscreen()
  }
  return false
}

function screenshot(width?: number, height?: number): string {
  if (viewerInstance.value) {
    return viewerInstance.value.screenshot(width, height)
  }
  return ''
}

function setViewLimits(limits: ViewLimits | null): void {
  if (viewerInstance.value) {
    viewerInstance.value.setViewLimits(limits)
  }
}

function showMiniMap(): void {
  if (viewerInstance.value) {
    viewerInstance.value.showMiniMap()
  }
}

function hideMiniMap(): void {
  if (viewerInstance.value) {
    viewerInstance.value.hideMiniMap()
  }
}

function toggleMiniMap(): void {
  if (viewerInstance.value) {
    viewerInstance.value.toggleMiniMap()
  }
}

// 暴露的方法对象
const exposedMethods = {
  loadImage,
  reset,
  enableAutoRotate,
  disableAutoRotate,
  enableGyroscope,
  disableGyroscope,
  getRotation,
  setRotation,
  addHotspot,
  removeHotspot,
  getHotspots,
  enterFullscreen,
  exitFullscreen,
  isFullscreen,
  screenshot,
  setViewLimits,
  showMiniMap,
  hideMiniMap,
  toggleMiniMap,
  getViewer: () => viewerInstance.value,
  getEventBus: () => eventBus,
}

defineExpose(exposedMethods)
</script>

<template>
  <div ref="containerRef" class="panorama-viewer" :style="containerStyle">
    <!-- 默认插槽 - 用于自定义UI叠加层 -->
    <slot />

    <!-- 加载插槽 -->
    <slot v-if="isLoading" name="loading" :progress="loadingProgress">
      <div class="default-loading">
        <div class="loading-spinner" />
        <div class="loading-text">
          {{ loadingProgress.toFixed(0) }}%
        </div>
      </div>
    </slot>

    <!-- 错误插槽 -->
    <slot v-if="error" name="error" :error="error">
      <div class="default-error">
        <p>{{ error.message }}</p>
      </div>
    </slot>

    <!-- 控制器插槽 -->
    <slot name="controls" :viewer="viewerInstance" :methods="exposedMethods" />

    <!-- 信息插槽 -->
    <slot name="info" :stats="performanceStats" />
  </div>
</template>

<style scoped>
.panorama-viewer {
  position: relative;
  overflow: hidden;
}

.default-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 1000;
  color: white;
  background: rgba(0, 0, 0, 0.8);
  padding: 20px 30px;
  border-radius: 8px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 10px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 18px;
  font-weight: bold;
}

.default-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(244, 67, 54, 0.9);
  color: white;
  padding: 20px;
  border-radius: 8px;
  z-index: 1000;
}
</style>
