/**
 * 区域选择器
 * 在全景中定义和管理矩形、圆形、多边形区域
 */

import * as THREE from 'three'
import { EventBus } from '../core/EventBus'

export type RegionType = 'rectangle' | 'circle' | 'polygon'

export interface Region {
  id: string
  type: RegionType
  points: Array<{ theta: number, phi: number }>
  name?: string
  color?: string
  fillOpacity?: number
  strokeWidth?: number
  data?: Record<string, any>
}

export class RegionSelector {
  private regions: Map<string, Region> = new Map()
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private container: HTMLElement
  private camera: THREE.PerspectiveCamera
  private eventBus: EventBus

  // 选择状态
  private isSelecting = false
  private currentRegion: Region | null = null
  private selectionType: RegionType = 'rectangle'
  private tempPoints: Array<{ theta: number, phi: number }> = []

  // 交互状态
  private selectedId: string | null = null
  private hoveredId: string | null = null

  constructor(
    container: HTMLElement,
    camera: THREE.PerspectiveCamera,
    eventBus?: EventBus,
  ) {
    this.container = container
    this.camera = camera
    this.eventBus = eventBus || new EventBus()

    // 创建画布
    this.canvas = document.createElement('canvas')
    this.canvas.style.position = 'absolute'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.pointerEvents = 'auto'
    this.canvas.style.zIndex = '8'
    this.canvas.style.cursor = 'crosshair'

    this.ctx = this.canvas.getContext('2d')!
    this.container.appendChild(this.canvas)

    this.resize()
    this.setupEventListeners()
  }

  /**
   * 调整大小
   */
  private resize(): void {
    const rect = this.container.getBoundingClientRect()
    this.canvas.width = rect.width
    this.canvas.height = rect.height
    this.render()
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    this.canvas.addEventListener('mousedown', e => this.onMouseDown(e))
    this.canvas.addEventListener('mousemove', e => this.onMouseMove(e))
    this.canvas.addEventListener('mouseup', e => this.onMouseUp(e))
    this.canvas.addEventListener('click', e => this.onClick(e))
    window.addEventListener('resize', () => this.resize())
  }

  /**
   * 鼠标按下
   */
  private onMouseDown(event: MouseEvent): void {
    if (!this.isSelecting)
      return

    const { theta, phi } = this.getSphericalFromMouse(event)
    this.tempPoints.push({ theta, phi })
  }

  /**
   * 鼠标移动
   */
  private onMouseMove(event: MouseEvent): void {
    if (!this.isSelecting) {
      // 检测悬停
      const region = this.getRegionAtMouse(event)
      if (region) {
        this.hoveredId = region.id
        this.canvas.style.cursor = 'pointer'
      }
      else {
        this.hoveredId = null
        this.canvas.style.cursor = this.isSelecting ? 'crosshair' : 'default'
      }
      this.render()
      return
    }

    if (this.tempPoints.length > 0) {
      const { theta, phi } = this.getSphericalFromMouse(event)

      if (this.selectionType === 'rectangle' && this.tempPoints.length === 1) {
        // 实时更新矩形
        this.render()
        this.renderTempRegion([this.tempPoints[0], { theta, phi }])
      }
      else if (this.selectionType === 'circle' && this.tempPoints.length === 1) {
        // 实时更新圆形
        this.render()
        this.renderTempCircle(this.tempPoints[0], { theta, phi })
      }
    }
  }

  /**
   * 鼠标抬起
   */
  private onMouseUp(event: MouseEvent): void {
    if (!this.isSelecting)
      return

    const { theta, phi } = this.getSphericalFromMouse(event)

    if (this.selectionType === 'rectangle' || this.selectionType === 'circle') {
      if (this.tempPoints.length === 1) {
        this.tempPoints.push({ theta, phi })
        this.finishSelection()
      }
    }
  }

  /**
   * 点击
   */
  private onClick(event: MouseEvent): void {
    if (!this.isSelecting) {
      // 选择区域
      const region = this.getRegionAtMouse(event)
      if (region) {
        this.selectRegion(region.id)
      }
      return
    }

    if (this.selectionType === 'polygon') {
      const { theta, phi } = this.getSphericalFromMouse(event)

      // 双击完成多边形
      if (this.tempPoints.length > 0) {
        const lastPoint = this.tempPoints[this.tempPoints.length - 1]
        const distance = Math.sqrt(
          (theta - lastPoint.theta) ** 2 + (phi - lastPoint.phi) ** 2,
        )

        if (distance < 0.1) {
          this.finishSelection()
          return
        }
      }

      this.tempPoints.push({ theta, phi })
      this.render()
    }
  }

  /**
   * 从鼠标获取球面坐标
   */
  private getSphericalFromMouse(event: MouseEvent): { theta: number, phi: number } {
    const rect = this.canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera)

    const direction = raycaster.ray.direction
    const spherical = new THREE.Spherical()
    spherical.setFromVector3(direction)

    return { theta: spherical.theta, phi: spherical.phi }
  }

  /**
   * 开始选择
   */
  public startSelection(type: RegionType): void {
    this.isSelecting = true
    this.selectionType = type
    this.tempPoints = []
    this.canvas.style.cursor = 'crosshair'
    this.eventBus.emit('region:selection-started', { type })
  }

  /**
   * 完成选择
   */
  private finishSelection(): void {
    if (this.tempPoints.length < 2)
      return

    const region: Region = {
      id: `region-${Date.now()}`,
      type: this.selectionType,
      points: [...this.tempPoints],
      color: '#00ff00',
      fillOpacity: 0.3,
      strokeWidth: 2,
    }

    this.addRegion(region)

    this.isSelecting = false
    this.tempPoints = []
    this.canvas.style.cursor = 'default'

    this.eventBus.emit('region:selection-finished', { region })
  }

  /**
   * 取消选择
   */
  public cancelSelection(): void {
    this.isSelecting = false
    this.tempPoints = []
    this.canvas.style.cursor = 'default'
    this.render()
    this.eventBus.emit('region:selection-cancelled', {})
  }

  /**
   * 添加区域
   */
  public addRegion(region: Region): void {
    this.regions.set(region.id, region)
    this.render()
    this.eventBus.emit('region:added', { region })
  }

  /**
   * 移除区域
   */
  public removeRegion(id: string): void {
    const region = this.regions.get(id)
    if (region) {
      this.regions.delete(id)
      this.render()
      this.eventBus.emit('region:removed', { id, region })
    }
  }

  /**
   * 获取所有区域
   */
  public getRegions(): Region[] {
    return Array.from(this.regions.values())
  }

  /**
   * 选择区域
   */
  public selectRegion(id: string): void {
    this.selectedId = id
    this.render()
    const region = this.regions.get(id)
    if (region) {
      this.eventBus.emit('region:selected', { region })
    }
  }

  /**
   * 检查点是否在区域内
   */
  public isPointInRegion(
    point: { theta: number, phi: number },
    regionId: string,
  ): boolean {
    const region = this.regions.get(regionId)
    if (!region)
      return false

    switch (region.type) {
      case 'rectangle':
        return this.isPointInRectangle(point, region.points)
      case 'circle':
        return this.isPointInCircle(point, region.points)
      case 'polygon':
        return this.isPointInPolygon(point, region.points)
    }
  }

  /**
   * 点在矩形内判断
   */
  private isPointInRectangle(
    point: { theta: number, phi: number },
    points: Array<{ theta: number, phi: number }>,
  ): boolean {
    if (points.length < 2)
      return false

    const minTheta = Math.min(points[0].theta, points[1].theta)
    const maxTheta = Math.max(points[0].theta, points[1].theta)
    const minPhi = Math.min(points[0].phi, points[1].phi)
    const maxPhi = Math.max(points[0].phi, points[1].phi)

    return point.theta >= minTheta && point.theta <= maxTheta
      && point.phi >= minPhi && point.phi <= maxPhi
  }

  /**
   * 点在圆形内判断
   */
  private isPointInCircle(
    point: { theta: number, phi: number },
    points: Array<{ theta: number, phi: number }>,
  ): boolean {
    if (points.length < 2)
      return false

    const center = points[0]
    const edge = points[1]

    const radius = Math.sqrt(
      (edge.theta - center.theta) ** 2 + (edge.phi - center.phi) ** 2,
    )

    const distance = Math.sqrt(
      (point.theta - center.theta) ** 2 + (point.phi - center.phi) ** 2,
    )

    return distance <= radius
  }

  /**
   * 点在多边形内判断（射线法）
   */
  private isPointInPolygon(
    point: { theta: number, phi: number },
    points: Array<{ theta: number, phi: number }>,
  ): boolean {
    if (points.length < 3)
      return false

    let inside = false

    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].theta
      const yi = points[i].phi
      const xj = points[j].theta
      const yj = points[j].phi

      const intersect = ((yi > point.phi) !== (yj > point.phi))
        && (point.theta < (xj - xi) * (point.phi - yi) / (yj - yi) + xi)

      if (intersect)
        inside = !inside
    }

    return inside
  }

  /**
   * 获取鼠标位置的区域
   */
  private getRegionAtMouse(event: MouseEvent): Region | null {
    const { theta, phi } = this.getSphericalFromMouse(event)

    for (const region of this.regions.values()) {
      if (this.isPointInRegion({ theta, phi }, region.id)) {
        return region
      }
    }

    return null
  }

  /**
   * 球面坐标转画布坐标
   */
  private sphericalToCanvas(theta: number, phi: number): { x: number, y: number } {
    const x = ((theta / (Math.PI * 2) + 0.5) % 1) * this.canvas.width
    const y = (phi / Math.PI) * this.canvas.height
    return { x, y }
  }

  /**
   * 渲染所有区域
   */
  public render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // 渲染所有区域
    this.regions.forEach((region) => {
      this.renderRegion(region)
    })

    // 高亮选中的区域
    if (this.selectedId) {
      const region = this.regions.get(this.selectedId)
      if (region) {
        this.highlightRegion(region)
      }
    }
  }

  /**
   * 渲染区域
   */
  private renderRegion(region: Region): void {
    if (region.points.length === 0)
      return

    const ctx = this.ctx
    const color = region.color || '#00ff00'
    const opacity = region.fillOpacity ?? 0.3
    const strokeWidth = region.strokeWidth || 2

    ctx.globalAlpha = opacity

    switch (region.type) {
      case 'rectangle':
        this.renderRectangle(region.points, color, strokeWidth)
        break
      case 'circle':
        this.renderCircle(region.points, color, strokeWidth)
        break
      case 'polygon':
        this.renderPolygon(region.points, color, strokeWidth)
        break
    }

    ctx.globalAlpha = 1
  }

  /**
   * 渲染矩形
   */
  private renderRectangle(
    points: Array<{ theta: number, phi: number }>,
    color: string,
    strokeWidth: number,
  ): void {
    if (points.length < 2)
      return

    const p1 = this.sphericalToCanvas(points[0].theta, points[0].phi)
    const p2 = this.sphericalToCanvas(points[1].theta, points[1].phi)

    const x = Math.min(p1.x, p2.x)
    const y = Math.min(p1.y, p2.y)
    const width = Math.abs(p2.x - p1.x)
    const height = Math.abs(p2.y - p1.y)

    // 填充
    this.ctx.fillStyle = color
    this.ctx.fillRect(x, y, width, height)

    // 边框
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = strokeWidth
    this.ctx.strokeRect(x, y, width, height)
  }

  /**
   * 渲染圆形
   */
  private renderCircle(
    points: Array<{ theta: number, phi: number }>,
    color: string,
    strokeWidth: number,
  ): void {
    if (points.length < 2)
      return

    const center = this.sphericalToCanvas(points[0].theta, points[0].phi)
    const edge = this.sphericalToCanvas(points[1].theta, points[1].phi)

    const radius = Math.sqrt(
      (edge.x - center.x) ** 2 + (edge.y - center.y) ** 2,
    )

    this.ctx.beginPath()
    this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)

    // 填充
    this.ctx.fillStyle = color
    this.ctx.fill()

    // 边框
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = strokeWidth
    this.ctx.stroke()
  }

  /**
   * 渲染多边形
   */
  private renderPolygon(
    points: Array<{ theta: number, phi: number }>,
    color: string,
    strokeWidth: number,
  ): void {
    if (points.length < 3)
      return

    this.ctx.beginPath()

    points.forEach((point, index) => {
      const { x, y } = this.sphericalToCanvas(point.theta, point.phi)

      if (index === 0) {
        this.ctx.moveTo(x, y)
      }
      else {
        this.ctx.lineTo(x, y)
      }
    })

    this.ctx.closePath()

    // 填充
    this.ctx.fillStyle = color
    this.ctx.fill()

    // 边框
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = strokeWidth
    this.ctx.stroke()
  }

  /**
   * 渲染临时区域
   */
  private renderTempRegion(points: Array<{ theta: number, phi: number }>): void {
    this.renderRectangle(points, '#ffff00', 2)
  }

  /**
   * 渲染临时圆形
   */
  private renderTempCircle(
    center: { theta: number, phi: number },
    edge: { theta: number, phi: number },
  ): void {
    this.renderCircle([center, edge], '#ffff00', 2)
  }

  /**
   * 高亮区域
   */
  private highlightRegion(region: Region): void {
    const points = region.points.map(p => this.sphericalToCanvas(p.theta, p.phi))

    this.ctx.strokeStyle = '#ff0000'
    this.ctx.lineWidth = 4
    this.ctx.setLineDash([5, 5])

    if (region.type === 'rectangle' && points.length >= 2) {
      const x = Math.min(points[0].x, points[1].x)
      const y = Math.min(points[0].y, points[1].y)
      const width = Math.abs(points[1].x - points[0].x)
      const height = Math.abs(points[1].y - points[0].y)
      this.ctx.strokeRect(x, y, width, height)
    }
    else if (region.type === 'circle' && points.length >= 2) {
      const radius = Math.sqrt(
        (points[1].x - points[0].x) ** 2 + (points[1].y - points[0].y) ** 2,
      )
      this.ctx.beginPath()
      this.ctx.arc(points[0].x, points[0].y, radius, 0, Math.PI * 2)
      this.ctx.stroke()
    }
    else if (region.type === 'polygon') {
      this.ctx.beginPath()
      points.forEach((p, i) => {
        if (i === 0)
          this.ctx.moveTo(p.x, p.y)
        else this.ctx.lineTo(p.x, p.y)
      })
      this.ctx.closePath()
      this.ctx.stroke()
    }

    this.ctx.setLineDash([])
  }

  /**
   * 获取指定点的所有区域
   */
  public getRegionsAtPoint(point: { theta: number, phi: number }): Region[] {
    const regions: Region[] = []

    this.regions.forEach((region) => {
      if (this.isPointInRegion(point, region.id)) {
        regions.push(region)
      }
    })

    return regions
  }

  /**
   * 导出区域
   */
  public exportRegions(): Region[] {
    return Array.from(this.regions.values())
  }

  /**
   * 导入区域
   */
  public importRegions(regions: Region[]): void {
    this.regions.clear()
    regions.forEach(region => this.addRegion(region))
  }

  /**
   * 清除所有区域
   */
  public clear(): void {
    this.regions.clear()
    this.render()
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    this.canvas.remove()
    this.regions.clear()
  }
}
