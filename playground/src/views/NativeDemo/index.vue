<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PanoramaViewer, type TourScene } from '@ldesign/3d-viewer';
import DemoLayout from '@/components/DemoLayout.vue';
import { 
  RotateCcw, Maximize2, Play, Pause, Eye, EyeOff, Camera, 
  Mountain, Waves, TreePine, Sparkles, Building2, Car, Home, Church, Warehouse,
  Sun, Contrast, Droplets, SunDim, RotateCw, FlipHorizontal2,
  ZoomIn, ZoomOut, Compass, Download, PaintBucket, Sofa, Info, MapPin, Palette,
  Share2, HelpCircle, Smartphone, Navigation
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const containerRef = ref<HTMLElement | null>(null);
const viewer = ref<PanoramaViewer | null>(null);
const isAutoRotate = ref(false);
const showMiniMap = ref(true);
const showViewIndicator = ref(false);
const screenshotUrl = ref<string | null>(null);
const currentImageIndex = ref(0);
const isLoading = ref(false);
const showContent = ref(false);

// 动画配置
const animationEnabled = ref(true);
const animationDuration = ref(1200);
const initialPitch = ref(-10);
const initialYaw = ref(45);

// 从 URL 参数初始化场景
const initSceneFromUrl = () => {
  const sceneParam = route.query.scene as string;
  if (sceneParam) {
    const index = parseInt(sceneParam, 10);
    if (!isNaN(index) && index >= 0 && index < sampleImages.length) {
      currentImageIndex.value = index;
    }
  }
};

// 色彩调节
const brightness = ref(0);
const contrast = ref(0);
const saturation = ref(0);
const exposure = ref(0);

// 示例全景图列表 - 使用 Poly Haven 免费 HDR 全景图（等距柱状投影格式）
const sampleImages = [
  // 室内场景 - 商业空间
  {
    name: '汽车展厅',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/studio_small_09.jpg',
    icon: Car,
    category: '商业',
  },
  {
    name: '现代客厅',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/modern_buildings_2.jpg',
    icon: Sofa,
    category: '室内',
  },
  {
    name: '工业仓库',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/empty_warehouse_01.jpg',
    icon: Warehouse,
    category: '商业',
  },
  {
    name: '艺术画廊',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/brown_photostudio_02.jpg',
    icon: PaintBucket,
    category: '室内',
  },
  {
    name: '现代住宅',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/burnt_warehouse.jpg',
    icon: Home,
    category: '室内',
  },
  // 室外场景 - 自然风光
  {
    name: '山脉风光',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/kloofendal_48d_partly_cloudy_puresky.jpg',
    icon: Mountain,
    category: '自然',
  },
  {
    name: '海滨日出',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/kiara_1_dawn.jpg',
    icon: Waves,
    category: '自然',
  },
  {
    name: '秋季森林',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/autumn_forest_04.jpg',
    icon: TreePine,
    category: '自然',
  },
  // 建筑场景
  {
    name: '古老教堂',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/st_fagans_interior.jpg',
    icon: Church,
    category: '建筑',
  },
  {
    name: '晚霞天空',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/the_sky_is_on_fire.jpg',
    icon: Sparkles,
    category: '自然',
  },
  {
    name: '城市日落',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/industrial_sunset_02_puresky.jpg',
    icon: Building2,
    category: '城市',
  },
  {
    name: '停车场',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/parking_garage.jpg',
    icon: Car,
    category: '建筑',
  },
];

// 初始化场景索引
initSceneFromUrl();

const currentImage = () => sampleImages[currentImageIndex.value];

// 将场景列表转换为 TourScene 格式
const tourScenes: TourScene[] = sampleImages.map((img, index) => ({
  id: String(index),
  name: img.name,
  image: img.url,
}));

onMounted(() => {
  // 入场动画延迟
  setTimeout(() => {
    showContent.value = true;
  }, 100);

  if (containerRef.value) {
    // 通过配置初始化 PanoramaViewer，所有 UI 组件都通过配置启用
    viewer.value = new PanoramaViewer({
      container: containerRef.value,
      image: currentImage().url,
      fov: 75,
      autoRotate: false,
      gyroscope: false,
      keyboardControls: true,
      enablePerformanceMonitor: false,
      renderOnDemand: true,
      entranceAnimation: true,
      entranceAnimationDuration: 1200,
      initialRotation: { pitch: -10, yaw: 45 },
      // 罗盘配置
      compass: {
        enabled: true,
        style: 'modern',
        position: 'bottom-right',
        size: 100,
      },
      // 缩放指示器配置 - 通过配置启用，内部自动同步缩放
      zoomIndicator: {
        enabled: true,
      },
      // 帮助按钮配置
      helpOverlay: {
        enabled: true,
      },
      // 自动漫游配置
      autoTour: {
        enabled: true,
        interval: 5000,
        showProgress: true,
      },
      // 漫游场景列表
      tourScenes: tourScenes,
      // 场景切换回调
      onSceneChange: (index, scene) => {
        currentImageIndex.value = index;
        console.log('Scene changed to:', scene.name);
      },
      onProgress: (progress) => {
        console.log('Loading:', progress + '%');
      },
    });
  }
});

// 监听场景变化，更新 URL
watch(currentImageIndex, (newIndex) => {
  router.replace({
    query: { ...route.query, scene: String(newIndex) },
  });
});

const switchImage = async (index: number) => {
  if (!viewer.value || index === currentImageIndex.value) return;
  isLoading.value = true;
  currentImageIndex.value = index;
  try {
    // 使用 playAnimation=true 来启用加载动画
    await viewer.value.loadImage(sampleImages[index].url, false, true);
  } finally {
    isLoading.value = false;
  }
};

// 重新初始化 viewer 带动画
const reinitWithAnimation = () => {
  if (!containerRef.value || !viewer.value) return;
  
  // 销毁旧的 viewer
  viewer.value.dispose();
  
  // 创建新的 viewer，使用配置启用所有 UI 组件
  viewer.value = new PanoramaViewer({
    container: containerRef.value,
    image: currentImage().url,
    fov: 75,
    autoRotate: false,
    gyroscope: false,
    keyboardControls: true,
    enablePerformanceMonitor: false,
    renderOnDemand: true,
    entranceAnimation: animationEnabled.value,
    entranceAnimationDuration: animationDuration.value,
    initialRotation: { pitch: initialPitch.value, yaw: initialYaw.value },
    compass: {
      enabled: true,
      style: 'modern',
      position: 'bottom-right',
      size: 100,
    },
    zoomIndicator: { enabled: true },
    helpOverlay: { enabled: true },
    autoTour: { enabled: true, interval: 5000, showProgress: true },
    tourScenes: tourScenes,
    onSceneChange: (index, scene) => {
      currentImageIndex.value = index;
      console.log('Scene changed to:', scene.name);
    },
    onProgress: (progress) => {
      console.log('Loading:', progress + '%');
    },
  });
};

// 切换罗盘样式
const toggleCompassStyle = () => {
  if (!viewer.value) return;
  const current = viewer.value.getCompassOptions()?.style || 'modern';
  const styles = ['modern', 'minimal', 'classic'] as const;
  const nextIndex = (styles.indexOf(current) + 1) % styles.length;
  viewer.value.setCompassOptions({ style: styles[nextIndex] });
};

// 切换视角指示器
const toggleViewIndicator = () => {
  if (!viewer.value) return;
  showViewIndicator.value = !showViewIndicator.value;
  viewer.value.toggleViewIndicator();
};

// 添加示例标记点
const addDemoMarkers = () => {
  if (!viewer.value) return;
  
  // 添加几个示例标记点
  const markers = [
    {
      id: 'marker-1',
      position: { x: 100, y: 50, z: 200 },
      label: '兴趣点 1',
      icon: '🎯',
    },
    {
      id: 'marker-2',
      position: { x: -150, y: 0, z: 180 },
      label: '兴趣点 2',
      icon: '📍',
    },
    {
      id: 'marker-3',
      position: { x: 0, y: 100, z: -200 },
      label: '兴趣点 3',
      icon: '⭐',
    },
  ];

  markers.forEach(marker => {
    viewer.value?.addMarker(marker);
  });
};

// 色彩调节
const updateBrightness = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  brightness.value = value;
  viewer.value?.setBrightness(value);
};

const updateContrast = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  contrast.value = value;
  viewer.value?.setContrast(value);
};

const updateSaturation = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  saturation.value = value;
  viewer.value?.setSaturation(value);
};

const updateExposure = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  exposure.value = value;
  viewer.value?.setExposure(value);
};

const resetColorAdjustments = () => {
  brightness.value = 0;
  contrast.value = 0;
  saturation.value = 0;
  exposure.value = 0;
  viewer.value?.resetColorAdjustments();
};

// 通过 API 切换组件显示
const toggleZoomIndicator = () => {
  viewer.value?.toggleZoomIndicator();
};

const toggleAutoTourControl = () => {
  if (viewer.value) {
    // 使用 API 显示/隐藏
    viewer.value.showAutoTourControl();
  }
};

const toggleHelpOverlay = () => {
  viewer.value?.showHelpOverlay();
};

onUnmounted(() => {
  if (viewer.value) {
    viewer.value.dispose();
    viewer.value = null;
  }
});

const toggleAutoRotate = () => {
  if (!viewer.value) return;
  isAutoRotate.value = !isAutoRotate.value;
  if (isAutoRotate.value) {
    viewer.value.enableAutoRotate();
  } else {
    viewer.value.disableAutoRotate();
  }
};

const resetView = () => {
  if (viewer.value) {
    viewer.value.reset();
  }
};

const toggleFullscreen = async () => {
  if (!viewer.value) return;
  if (viewer.value.isFullscreen()) {
    viewer.value.exitFullscreen();
  } else {
    await viewer.value.enterFullscreen();
  }
};

const toggleMiniMap = () => {
  if (!viewer.value) return;
  showMiniMap.value = !showMiniMap.value;
  viewer.value.toggleMiniMap();
};

const takeScreenshot = () => {
  if (!viewer.value) return;
  screenshotUrl.value = viewer.value.screenshot(800, 600);
};

const downloadScreenshot = () => {
  if (!screenshotUrl.value) return;
  const link = document.createElement('a');
  link.href = screenshotUrl.value;
  link.download = 'panorama-screenshot.png';
  link.click();
};
</script>

<template>
  <DemoLayout 
    title="原生 JS 演示" 
    description="使用 @ldesign/3d-viewer 核心库"
    :class="{ 'fade-in': showContent }"
  >
    <template #viewer>
      <div 
        ref="containerRef" 
        class="viewer-container"
      >
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-spinner"></div>
        </div>
      </div>
    </template>

    <template #controls>
      <div class="controls">
        <h3>控制面板</h3>
        
        <div class="control-group">
          <h4>场景切换</h4>
          <div class="image-list">
            <button
              v-for="(img, index) in sampleImages"
              :key="index"
              @click="switchImage(index)"
              class="image-btn"
              :class="{ active: currentImageIndex === index }"
              :title="img.name"
            >
              <component :is="img.icon" :size="16" />
              <span class="image-name">{{ img.name }}</span>
            </button>
          </div>
        </div>

        <div class="control-group">
          <h4>视图控制</h4>
          <div class="button-row">
            <button @click="resetView" class="control-btn" title="重置视图">
              <RotateCcw :size="16" />
              <span>重置</span>
            </button>
            <button @click="toggleFullscreen" class="control-btn" title="全屏">
              <Maximize2 :size="16" />
              <span>全屏</span>
            </button>
            <button 
              @click="toggleAutoRotate" 
              class="control-btn"
              :class="{ active: isAutoRotate }"
              title="自动旋转"
            >
              <Play v-if="!isAutoRotate" :size="16" />
              <Pause v-else :size="16" />
              <span>{{ isAutoRotate ? '停止' : '旋转' }}</span>
            </button>
            <button 
              @click="toggleMiniMap" 
              class="control-btn"
              :class="{ active: showMiniMap }"
              title="罗盘"
            >
              <Compass :size="16" />
              <span>罗盘</span>
            </button>
            <button 
              @click="toggleViewIndicator" 
              class="control-btn"
              :class="{ active: showViewIndicator }"
              title="视角指示器"
            >
              <Info :size="16" />
              <span>视角</span>
            </button>
          </div>
        </div>

        <div class="control-group">
          <h4>交互元素</h4>
          <div class="button-row">
            <button @click="toggleCompassStyle" class="control-btn" title="切换罗盘样式">
              <Palette :size="16" />
              <span>罗盘样式</span>
            </button>
            <button @click="addDemoMarkers" class="control-btn" title="添加标记点">
              <MapPin :size="16" />
              <span>添加标记</span>
            </button>
          </div>
        </div>

        <div class="control-group">
          <h4>UI 组件控制</h4>
          <div class="button-row">
            <button 
              @click="toggleZoomIndicator" 
              class="control-btn"
              title="切换缩放指示器"
            >
              <ZoomIn :size="16" />
              <span>缩放</span>
            </button>
            <button 
              @click="toggleHelpOverlay" 
              class="control-btn"
              title="打开帮助"
            >
              <HelpCircle :size="16" />
              <span>帮助</span>
            </button>
          </div>
          <p class="hint">缩放指示器、帮助按钮、自动漫游控件已通过配置自动启用</p>
        </div>

        <div class="control-group">
          <h4>色彩调节</h4>
          <div class="slider-group">
            <div class="slider-row">
              <label><Sun :size="14" /> 亮度</label>
              <input type="range" min="-1" max="1" step="0.1" :value="brightness" @input="updateBrightness" />
              <span class="slider-value">{{ brightness.toFixed(1) }}</span>
            </div>
            <div class="slider-row">
              <label><Contrast :size="14" /> 对比度</label>
              <input type="range" min="-1" max="1" step="0.1" :value="contrast" @input="updateContrast" />
              <span class="slider-value">{{ contrast.toFixed(1) }}</span>
            </div>
            <div class="slider-row">
              <label><Droplets :size="14" /> 饱和度</label>
              <input type="range" min="-1" max="1" step="0.1" :value="saturation" @input="updateSaturation" />
              <span class="slider-value">{{ saturation.toFixed(1) }}</span>
            </div>
            <div class="slider-row">
              <label><SunDim :size="14" /> 曝光</label>
              <input type="range" min="-2" max="2" step="0.1" :value="exposure" @input="updateExposure" />
              <span class="slider-value">{{ exposure.toFixed(1) }}</span>
            </div>
          </div>
          <button @click="resetColorAdjustments" class="control-btn reset-btn">
            <RotateCcw :size="14" />
            <span>重置色彩</span>
          </button>
        </div>

        <div class="control-group">
          <h4>开场动画配置</h4>
          <div class="slider-group">
            <div class="checkbox-row">
              <label>
                <input type="checkbox" v-model="animationEnabled" />
                <span>启用入场动画</span>
              </label>
            </div>
            <div class="slider-row">
              <label>动画时长</label>
              <input type="range" min="300" max="3000" step="100" v-model="animationDuration" />
              <span class="slider-value">{{ animationDuration }}ms</span>
            </div>
            <div class="slider-row">
              <label>俯角</label>
              <input type="range" min="-90" max="90" step="5" v-model="initialPitch" />
              <span class="slider-value">{{ initialPitch }}°</span>
            </div>
            <div class="slider-row">
              <label>方位</label>
              <input type="range" min="-180" max="180" step="5" v-model="initialYaw" />
              <span class="slider-value">{{ initialYaw }}°</span>
            </div>
          </div>
          <button @click="reinitWithAnimation" class="control-btn reset-btn">
            <Play :size="14" />
            <span>预览动画</span>
          </button>
        </div>

        <div class="control-group">
          <h4>截图导出</h4>
          <div class="button-row">
            <button @click="takeScreenshot" class="control-btn" title="截图">
              <Camera :size="16" />
              <span>截图</span>
            </button>
          </div>
          <div v-if="screenshotUrl" class="screenshot-preview">
            <img :src="screenshotUrl" alt="Screenshot" />
            <button @click="downloadScreenshot" class="download-btn">
              <Download :size="14" />
              下载截图
            </button>
          </div>
        </div>

        <div class="control-group">
          <h4>操作提示</h4>
          <ul class="tips">
            <li><RotateCw :size="12" /> 鼠标拖拽：旋转视角</li>
            <li><ZoomIn :size="12" /> 滚轮缩放：调整视野</li>
            <li><Compass :size="12" /> 方向键：微调视角</li>
            <li><FlipHorizontal2 :size="12" /> 支持触屏手势</li>
          </ul>
        </div>
      </div>
    </template>
  </DemoLayout>
</template>

<style scoped>
/* 入场动画 */
.fade-in {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.viewer-container {
  flex: 1;
  width: 100%;
  min-height: 0;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.controls h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group h4 {
  font-size: 12px;
  margin: 0;
  color: #888;
  font-weight: 500;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 12px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #ebebeb;
  border-color: #d0d0d0;
}

.control-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: #fff;
}

.screenshot-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.screenshot-preview img {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.download-btn {
  padding: 8px 16px;
  background: #667eea;
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.download-btn:hover {
  background: #5568d9;
}

.tips {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
  color: #666;
}

.tips li {
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

.tips li:last-child {
  border-bottom: none;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 12px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.image-btn:hover {
  background: #ebebeb;
  border-color: #d0d0d0;
}

.image-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: #fff;
}

.image-name {
  font-size: 12px;
}

.slider-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.slider-row label {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #666;
  min-width: 60px;
}

.slider-row input[type="range"] {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  background: #e0e0e0;
  border-radius: 2px;
  cursor: pointer;
}

.slider-row input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  background: #667eea;
  border-radius: 50%;
  cursor: pointer;
}

.slider-value {
  font-size: 11px;
  color: #999;
  min-width: 30px;
  text-align: right;
}

.checkbox-row {
  padding: 8px 0;
}

.checkbox-row label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
}

.checkbox-row input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.reset-btn {
  margin-top: 8px;
  width: 100%;
  justify-content: center;
}

.download-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.tips li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hint {
  font-size: 11px;
  color: #999;
  margin: 4px 0 0 0;
  font-style: italic;
}
</style>
