/**
 * 热点管理性能基准测试
 */

import { describe, bench, beforeEach, afterEach } from 'vitest'
import * as THREE from 'three'
import { HotspotManager } from '../../src/hotspots/HotspotManager'

describe('Hotspot Performance', () => {
  let scene: THREE.Scene
  let camera: THREE.PerspectiveCamera
  let manager: HotspotManager

  beforeEach(() => {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    manager = new HotspotManager(scene, camera)
  })

  afterEach(() => {
    manager.dispose()
  })

  bench('add single hotspot', () => {
    const id = `hotspot-${Math.random()}`
    manager.addHotspot({
      id,
      type: 'info',
      position: { x: Math.random() * 10, y: Math.random() * 10, z: Math.random() * 10 },
      title: 'Test Hotspot',
    })
    manager.removeHotspot(id)
  })

  bench('add 100 hotspots', () => {
    const ids: string[] = []
    for (let i = 0; i < 100; i++) {
      const id = `hotspot-${i}-${Math.random()}`
      ids.push(id)
      manager.addHotspot({
        id,
        type: 'info',
        position: { x: Math.random() * 10, y: Math.random() * 10, z: Math.random() * 10 },
        title: `Hotspot ${i}`,
      })
    }
    ids.forEach(id => manager.removeHotspot(id))
  })

  bench('update hotspot', () => {
    const id = 'benchmark-hotspot'
    manager.addHotspot({
      id,
      type: 'info',
      position: { x: 0, y: 0, z: 5 },
      title: 'Benchmark',
    })

    manager.updateHotspot(id, {
      position: { x: Math.random() * 10, y: Math.random() * 10, z: Math.random() * 10 },
    })

    manager.removeHotspot(id)
  })

  bench('get all hotspots (100 items)', () => {
    for (let i = 0; i < 100; i++) {
      manager.addHotspot({
        id: `hotspot-${i}`,
        type: 'info',
        position: { x: i, y: 0, z: 0 },
        title: `Hotspot ${i}`,
      })
    }

    manager.getAllHotspots()
  })

  bench('raycast with 50 hotspots', () => {
    for (let i = 0; i < 50; i++) {
      manager.addHotspot({
        id: `hotspot-${i}`,
        type: 'info',
        position: { x: Math.random() * 10 - 5, y: Math.random() * 10 - 5, z: -5 },
        title: `Hotspot ${i}`,
      })
    }

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(0, 0)
    raycaster.setFromCamera(mouse, camera)
    
    const objects = scene.children.filter(child => child.userData.isHotspot)
    raycaster.intersectObjects(objects, true)
  })
})
