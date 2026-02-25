<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PanoramaViewer } from '@ldesign/3d-viewer-vue';
import DemoLayout from '@/components/DemoLayout.vue';
import { 
  RotateCcw, Maximize2, Play, Pause, Eye, EyeOff, Camera, MapPin,
  Mountain, Waves, TreePine, Sparkles, Building2, Car, Home, Church, Warehouse,
  Sun, Contrast, Droplets, SunDim, Compass, Download, Trash2,
  RotateCw, ZoomIn, FlipHorizontal2, MousePointer2, Layers, PaintBucket, Sofa
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

// 组件 ref
const viewerRef = ref<InstanceType<typeof PanoramaViewer> | null>(null);

// 状态
const isAutoRotate = ref(false);
const showMiniMap = ref(true);
const screenshotUrl = ref<string | null>(null);
const currentImageIndex = ref(0);
const isLoading = ref(false);

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
  },
  {
    name: '现代客厅',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/modern_buildings_2.jpg',
    icon: Sofa,
  },
  {
    name: '工业仓库',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/empty_warehouse_01.jpg',
    icon: Warehouse,
  },
  {
    name: '艺术画廊',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/brown_photostudio_02.jpg',
    icon: PaintBucket,
  },
  {
    name: '现代住宅',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/burnt_warehouse.jpg',
    icon: Home,
  },
  // 室外场景 - 自然风光
  {
    name: '山脉风光',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/kloofendal_48d_partly_cloudy_puresky.jpg',
    icon: Mountain,
  },
  {
    name: '海滨日出',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/kiara_1_dawn.jpg',
    icon: Waves,
  },
  {
    name: '秋季森林',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/autumn_forest_04.jpg',
    icon: TreePine,
  },
  // 建筑场景
  {
    name: '古老教堂',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/st_fagans_interior.jpg',
    icon: Church,
  },
  {
    name: '晚霞天空',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/the_sky_is_on_fire.jpg',
    icon: Sparkles,
  },
  {
    name: '城市日落',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/industrial_sunset_02_puresky.jpg',
    icon: Building2,
  },
  {
    name: '停车场',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/parking_garage.jpg',
    icon: Car,
  },
];

// 初始化场景索引
initSceneFromUrl();

const currentImage = () => sampleImages[currentImageIndex.value];

// 监听场景变化，更新 URL
watch(currentImageIndex, (newIndex) => {
  router.replace({
    query: { ...route.query, scene: String(newIndex) },
  });
});

// 热点数据
const hotspots = ref([
  {
    id: 'spot1',
    position: { theta: 0, phi: 0 },
    content: '山顶观景台',
    icon: '🏔️',
  },
  {
    id: 'spot2',
    position: { theta: Math.PI / 4, phi: 0.2 },
    content: '瀑布景点',
    icon: '💧',
  },
]);

// 事件处理
const onReady = () => {
  console.log('Viewer is ready');
  // 添加热点
  hotspots.value.forEach(spot => {
    viewerRef.value?.addHotspot(spot as any);
  });
};

const onError = (error: Error) => {
  console.error('Viewer error:', error);
};

const onProgress = (progress: number) => {
  console.log('Loading progress:', progress);
};

const onHotspotClick = (hotspot: any) => {
  console.log('Hotspot clicked:', hotspot);
  alert(`你点击了：${hotspot.data?.content || hotspot.id}`);
};

// 控制方法
const toggleAutoRotate = () => {
  if (!viewerRef.value) return;
  isAutoRotate.value = !isAutoRotate.value;
  if (isAutoRotate.value) {
    viewerRef.value.enableAutoRotate();
  } else {
    viewerRef.value.disableAutoRotate();
  }
};

const resetView = () => {
  viewerRef.value?.reset();
};

const toggleFullscreen = async () => {
  if (!viewerRef.value) return;
  if (viewerRef.value.isFullscreen()) {
    viewerRef.value.exitFullscreen();
  } else {
    await viewerRef.value.enterFullscreen();
  }
};

const toggleMiniMap = () => {
  if (!viewerRef.value) return;
  showMiniMap.value = !showMiniMap.value;
  viewerRef.value.toggleMiniMap();
};

const takeScreenshot = () => {
  if (!viewerRef.value) return;
  screenshotUrl.value = viewerRef.value.screenshot(800, 600);
};

const downloadScreenshot = () => {
  if (!screenshotUrl.value) return;
  const link = document.createElement('a');
  link.href = screenshotUrl.value;
  link.download = 'panorama-screenshot.png';
  link.click();
};

const addHotspot = () => {
  if (!viewerRef.value) return;
  const id = `spot${Date.now()}`;
  const rotation = viewerRef.value.getRotation();
  viewerRef.value.addHotspot({
    id,
    position: { theta: rotation.y, phi: rotation.x },
    content: `新热点 ${hotspots.value.length + 1}`,
    icon: '📍',
  } as any);
  hotspots.value.push({
    id,
    position: { theta: rotation.y, phi: rotation.x },
    content: `新热点 ${hotspots.value.length + 1}`,
    icon: '📍',
  });
};

const switchImage = async (index: number) => {
  if (!viewerRef.value || index === currentImageIndex.value) return;
  isLoading.value = true;
  currentImageIndex.value = index;
  try {
    await viewerRef.value.loadImage(sampleImages[index].url, true);
  } finally {
    isLoading.value = false;
  }
};

// 色彩调节
const updateBrightness = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  brightness.value = value;
  viewerRef.value?.getViewer()?.setBrightness(value);
};

const updateContrast = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  contrast.value = value;
  viewerRef.value?.getViewer()?.setContrast(value);
};

const updateSaturation = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  saturation.value = value;
  viewerRef.value?.getViewer()?.setSaturation(value);
};

const updateExposure = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value);
  exposure.value = value;
  viewerRef.value?.getViewer()?.setExposure(value);
};

const resetColorAdjustments = () => {
  brightness.value = 0;
  contrast.value = 0;
  saturation.value = 0;
  exposure.value = 0;
  viewerRef.value?.getViewer()?.resetColorAdjustments();
};

const clearHotspots = () => {
  hotspots.value.forEach(spot => {
    viewerRef.value?.removeHotspot(spot.id);
  });
  hotspots.value = [];
};
</script>

<template>
  <DemoLayout 
    title="Vue 组件演示" 
    description="使用 @ldesign/3d-viewer-vue 组件"
  >
    <template #viewer>
      <div class="viewer-wrapper">
        <PanoramaViewer
          ref="viewerRef"
          :image="currentImage().url"
          :fov="75"
          :auto-rotate="false"
          :gyroscope="true"
          :keyboard-controls="true"
          :show-mini-map="showMiniMap"
          width="100%"
          height="100%"
          @ready="onReady"
          @error="onError"
          @progress="onProgress"
          @hotspotClick="onHotspotClick"
        />
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
              title="小地图"
            >
              <Compass :size="16" />
              <span>地图</span>
            </button>
          </div>
        </div>

        <div class="control-group">
          <h4>热点管理</h4>
          <div class="button-row">
            <button @click="addHotspot" class="control-btn" title="在当前位置添加热点">
              <MapPin :size="16" />
              <span>添加</span>
            </button>
            <button @click="clearHotspots" class="control-btn" title="清除所有热点">
              <Trash2 :size="16" />
              <span>清除</span>
            </button>
          </div>
          <div v-if="hotspots.length" class="hotspot-list">
            <div v-for="spot in hotspots" :key="spot.id" class="hotspot-item">
              <MapPin :size="12" />
              <span>{{ spot.content }}</span>
            </div>
          </div>
          <div v-else class="empty-hint">暂无热点，点击上方添加</div>
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
          <h4>Vue 组件特性</h4>
          <ul class="tips">
            <li><Layers :size="12" /> 响应式 Props</li>
            <li><MousePointer2 :size="12" /> 自定义事件</li>
            <li><FlipHorizontal2 :size="12" /> Slots 插槽</li>
            <li><RotateCw :size="12" /> Composition API</li>
          </ul>
        </div>
      </div>
    </template>
  </DemoLayout>
</template>

<style scoped>
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

.hotspot-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hotspot-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
}

.empty-hint {
  font-size: 12px;
  color: #999;
  text-align: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
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

.viewer-wrapper {
  flex: 1;
  width: 100%;
  min-height: 0;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
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

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
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

.image-icon {
  font-size: 16px;
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
</style>
