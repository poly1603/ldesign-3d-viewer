# 3D Viewer - Quick Start for All Frameworks

## 🎯 Overview
Enterprise-grade 3D Panorama Viewer supporting **7 major frameworks** with unified API.

## 📦 Available Packages

| Package | Framework | Version |
|---------|-----------|---------|
| `@panorama-viewer/core` | Vanilla JS/TS | ![npm](https://img.shields.io/npm/v/@panorama-viewer/core) |
| `@ldesign/3d-viewer-vue` | Vue 3 | ![npm](https://img.shields.io/npm/v/@ldesign/3d-viewer-vue) |
| `@ldesign/3d-viewer-react` | React 18+ | ![npm](https://img.shields.io/npm/v/@ldesign/3d-viewer-react) |
| `@ldesign/3d-viewer-angular` | Angular 16+ | ![npm](https://img.shields.io/npm/v/@ldesign/3d-viewer-angular) |
| `@ldesign/3d-viewer-solid` | Solid.js | ![npm](https://img.shields.io/npm/v/@ldesign/3d-viewer-solid) |
| `@ldesign/3d-viewer-svelte` | Svelte 4/5 | ![npm](https://img.shields.io/npm/v/@ldesign/3d-viewer-svelte) |
| `@ldesign/3d-viewer-qwik` | Qwik | ![npm](https://img.shields.io/npm/v/@ldesign/3d-viewer-qwik) |
| `@ldesign/3d-viewer-lit` | Lit | ![npm](https://img.shields.io/npm/v/@ldesign/3d-viewer-lit) |

## 🚀 Installation & Usage

### Vanilla JavaScript/TypeScript

```bash
npm install @panorama-viewer/core three
```

```typescript
import { PanoramaViewer } from '@panorama-viewer/core'

const viewer = new PanoramaViewer({
  container: document.getElementById('viewer')!,
  image: '/path/to/panorama.jpg',
  autoRotate: true,
  fov: 75,
})
```

### Vue 3

```bash
npm install @ldesign/3d-viewer-vue three
```

```vue
<script setup lang="ts">
import { PanoramaViewer } from '@ldesign/3d-viewer-vue'
import { ref } from 'vue'

const hotspots = ref([
  { id: '1', position: { theta: 0, phi: 0 }, label: 'Point A' }
])
</script>

<template>
  <PanoramaViewer
    image="/panorama.jpg"
    :auto-rotate="true"
    :hotspots="hotspots"
    width="100%"
    height="600px"
  />
</template>
```

### React

```bash
npm install @ldesign/3d-viewer-react three
```

```tsx
import { PanoramaViewer } from '@ldesign/3d-viewer-react'
import { useState } from 'react'

export function App() {
  const [hotspots] = useState([
    { id: '1', position: { theta: 0, phi: 0 }, label: 'Point A' }
  ])

  return (
    <PanoramaViewer
      image="/panorama.jpg"
      autoRotate
      hotspots={hotspots}
      width="100%"
      height="600px"
    />
  )
}
```

### Angular

```bash
npm install @ldesign/3d-viewer-angular three
```

```typescript
// app.component.ts
import { Component } from '@angular/core'
import { PanoramaViewerComponent } from '@ldesign/3d-viewer-angular'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PanoramaViewerComponent],
  template: `
    <lib-panorama-viewer
      [image]="'/panorama.jpg'"
      [autoRotate]="true"
      [hotspots]="hotspots"
      width="100%"
      height="600px"
      (viewerReady)="onReady($event)"
    />
  `
})
export class AppComponent {
  hotspots = [
    { id: '1', position: { theta: 0, phi: 0 }, label: 'Point A' }
  ]

  onReady(viewer: any) {
    console.log('Viewer ready:', viewer)
  }
}
```

### Solid.js

```bash
npm install @ldesign/3d-viewer-solid three
```

```tsx
import { PanoramaViewer } from '@ldesign/3d-viewer-solid'
import { createSignal } from 'solid-js'

export function App() {
  const [hotspots] = createSignal([
    { id: '1', position: { theta: 0, phi: 0 }, label: 'Point A' }
  ])

  return (
    <PanoramaViewer
      image="/panorama.jpg"
      autoRotate
      hotspots={hotspots()}
      width="100%"
      height="600px"
    />
  )
}
```

### Svelte

```bash
npm install @ldesign/3d-viewer-svelte three
```

```svelte
<script lang="ts">
  import { PanoramaViewer } from '@ldesign/3d-viewer-svelte'

  let hotspots = [
    { id: '1', position: { theta: 0, phi: 0 }, label: 'Point A' }
  ]
</script>

<PanoramaViewer
  image="/panorama.jpg"
  autoRotate={true}
  {hotspots}
  width="100%"
  height="600px"
/>
```

### Qwik

```bash
npm install @ldesign/3d-viewer-qwik three
```

```tsx
import { component$ } from '@builder.io/qwik'
import { PanoramaViewer } from '@ldesign/3d-viewer-qwik'

export default component$(() => {
  const hotspots = [
    { id: '1', position: { theta: 0, phi: 0 }, label: 'Point A' }
  ]

  return (
    <PanoramaViewer
      image="/panorama.jpg"
      autoRotate
      hotspots={hotspots}
      width="100%"
      height="600px"
    />
  )
})
```

### Lit

```bash
npm install @ldesign/3d-viewer-lit three
```

```html
<script type="module">
  import '@ldesign/3d-viewer-lit'
</script>

<panorama-viewer
  image="/panorama.jpg"
  auto-rotate
  width="100%"
  height="600px"
></panorama-viewer>
```

## ⚙️ Common Props/Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `image` | `string` | **required** | Panorama image URL |
| `fov` | `number` | `75` | Field of view (degrees) |
| `minFov` | `number` | `30` | Minimum FOV for zoom |
| `maxFov` | `number` | `100` | Maximum FOV for zoom |
| `autoRotate` | `boolean` | `false` | Enable auto rotation |
| `autoRotateSpeed` | `number` | `0.5` | Rotation speed |
| `gyroscope` | `boolean` | `true` | Enable gyroscope (mobile) |
| `hotspots` | `Hotspot[]` | `[]` | Hotspot markers |
| `viewLimits` | `ViewLimits` | `null` | Restrict camera movement |

## 🎨 Advanced Features

### Video Panorama
```typescript
import { VideoPanorama } from '@panorama-viewer/core'

const video = new VideoPanorama({
  container: el,
  sources: [
    { src: 'video-4k.mp4', quality: '4K' },
    { src: 'video-1080p.mp4', quality: '1080p' }
  ],
  adaptiveBitrate: true
})
```

### VR/AR Support
```typescript
viewer.enableVR()
viewer.enableAR()
```

### HDR Rendering
```typescript
import { HDRRenderer } from '@panorama-viewer/core'

const hdr = new HDRRenderer(viewer, {
  toneMapping: 'ACES',
  exposure: 1.0
})
```

### Spatial Audio
```typescript
import { SpatialAudio } from '@panorama-viewer/core'

const audio = new SpatialAudio(viewer, {
  sources: [
    { url: 'ambient.mp3', position: { x: 0, y: 0, z: 0 } }
  ]
})
```

## 📊 Performance Optimization

### Auto Device Detection
```typescript
import { deviceCapability } from '@panorama-viewer/core'

const settings = deviceCapability.getRecommendedSettings()
const viewer = new PanoramaViewer({ ...settings, image: '/panorama.jpg' })
```

### Preloading
```typescript
import { ResourcePreloader } from '@panorama-viewer/core'

await ResourcePreloader.preload([
  '/panorama1.jpg',
  '/panorama2.jpg'
])
```

### Power Management
```typescript
import { powerManager } from '@panorama-viewer/core'

powerManager.on('low-power', () => {
  viewer.setQuality('low')
})
```

## 🎯 Common Methods

```typescript
// Image control
await viewer.loadImage('/new-panorama.jpg')
viewer.reset()

// Camera control
viewer.getRotation()
viewer.setRotation(0, 0, 0)
viewer.animateCameraPath(pathPoints)

// Auto rotation
viewer.enableAutoRotate()
viewer.disableAutoRotate()

// Gyroscope (mobile)
await viewer.enableGyroscope()
viewer.disableGyroscope()

// Hotspots
viewer.addHotspot({ id: '1', position: { theta: 0, phi: 0 } })
viewer.removeHotspot('1')

// Fullscreen
await viewer.enterFullscreen()
viewer.exitFullscreen()

// Screenshot
const dataUrl = viewer.screenshot(1920, 1080)

// Cleanup
viewer.dispose()
```

## 🎪 Events

```typescript
viewer.on('ready', () => console.log('Ready'))
viewer.on('error', (error) => console.error(error))
viewer.on('rotation-change', ({ x, y, z }) => console.log(x, y, z))
viewer.on('hotspot-click', (hotspot) => console.log(hotspot))
```

## 🔧 TypeScript Support

All packages include complete TypeScript definitions:

```typescript
import type { 
  ViewerOptions,
  Hotspot,
  ViewLimits,
  PerformanceStats 
} from '@panorama-viewer/core'

const options: ViewerOptions = {
  container: el,
  image: '/panorama.jpg',
  fov: 75
}

const hotspot: Hotspot = {
  id: '1',
  position: { theta: 0, phi: 0 },
  label: 'Point A'
}
```

## 🌐 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (WebGL support)

## 📚 Documentation

- [Full API Reference](./docs/API_REFERENCE.md)
- [Performance Best Practices](./docs/PERFORMANCE_BEST_PRACTICES.md)
- [Migration Guide](./docs/MIGRATION_GUIDE.md)
- [Examples](./examples/)

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## 📄 License

MIT © 2025

---

**Built with ❤️ using [Three.js](https://threejs.org/) and [@ldesign/builder](https://github.com/ldesign/builder)**
