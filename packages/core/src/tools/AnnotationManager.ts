/**
 * 标注管理器
 * 在全景中添加文字、图形标注，支持编辑和导入导出
 */

import * as THREE from 'three'
import { EventBus } from '../core/EventBus'

export type AnnotationType = 'text' | 'arrow' | 'rectangle' | 'circle' | 'polygon' | 'line'

export interface Annotation {
  id: string
  type: AnnotationType
  position: { theta: number, phi: number }
  content?: string
  style?: AnnotationStyle
  points?: { theta: number, phi: number }[] // 用于多边形、线条
  interactive?: boolean
  visible?: boolean
  data?: Record<string, any>
}

export interface AnnotationStyle {
  color?: string
  backgroundColor?: string
  fontSize?: number
  fontFamily?: string
  lineWidth?: number
  opacity?: number
  strokeColor?: string
  fillColor?: string
  padding?: number
}

export class AnnotationManager {
  private annotations: Map<string, Annotation> = new Map()
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private container: HTMLElement
  private camera: THREE.PerspectiveCamera
  private eventBus: EventBus

  // 编辑状态
  private isEditing = false
  private editingId: string | null = null
  private selectedId: string | null = null

  private defaultStyle: AnnotationStyle = {
    color: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    fontSize: 14,
    fontFamily: 'Arial, sans-serif',
    lineWidth: 2,
    opacity: 1,
    strokeColor: '#ffffff',
    fillColor: 'rgba(255, 255, 255, 0.3)',
    padding: 8,
  }

  constructor(container: HTMLElement, camera: THREE.PerspectiveCamera, eventBus?: EventBus) {
    this.container = container
    this.camera = camera
    this.eventBus = eventBus || new EventBus()

    // 创建画布
    this.canvas = document.createElement('canvas')
    this.canvas.style.position = 'absolute'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.pointerEvents = 'none'
    this.canvas.style.zIndex = '10'

    this.ctx = this.canvas.getContext('2d')!
    this.container.appendChild(this.canvas)

    // 设置画布大小
    this.resize()

    // 监听窗口大小变化
    window.addEventListener('resize', () => this.resize())

    // 设置交互
    this.setupInteraction()
  }

  /**
   * 调整画布大小
   */
  private resize(): void {
    const rect = this.container.getBoundingClientRect()
    this.canvas.width = rect.width
    this.canvas.height = rect.height
    this.render()
  }

  /**
   * 设置交互
   */
  private setupInteraction(): void {
    this.canvas.style.pointerEvents = 'auto'

    this.canvas.addEventListener('click', (e) => {
      const annotation = this.getAnnotationAtPosition(e.clientX, e.clientY)
      if (annotation) {
        this.selectAnnotation(annotation.id)
        this.eventBus.emit('annotation:click', { annotation })
      }
    })

    this.canvas.addEventListener('mousemove', (e) => {
      const annotation = this.getAnnotationAtPosition(e.clientX, e.clientY)
      this.canvas.style.cursor = annotation ? 'pointer' : 'default'
    })
  }

  /**
   * 添加标注
   */
  public addAnnotation(annotation: Annotation): void {
    // 合并默认样式
    annotation.style = { ...this.defaultStyle, ...annotation.style }

    if (annotation.visible === undefined) {
      annotation.visible = true
    }

    this.annotations.set(annotation.id, annotation)
    this.render()

    this.eventBus.emit('annotation:added', { annotation })
  }

  /**
   * 移除标注
   */
  public removeAnnotation(id: string): void {
    const annotation = this.annotations.get(id)
    if (annotation) {
      this.annotations.delete(id)
      this.render()
      this.eventBus.emit('annotation:removed', { id, annotation })
    }
  }

  /**
   * 更新标注
   */
  public updateAnnotation(id: string, updates: Partial<Annotation>): void {
    const annotation = this.annotations.get(id)
    if (annotation) {
      Object.assign(annotation, updates)
      if (updates.style) {
        annotation.style = { ...annotation.style, ...updates.style }
      }
      this.render()
      this.eventBus.emit('annotation:updated', { annotation })
    }
  }

  /**
   * 获取标注
   */
  public getAnnotation(id: string): Annotation | undefined {
    return this.annotations.get(id)
  }

  /**
   * 获取所有标注
   */
  public getAllAnnotations(): Annotation[] {
    return Array.from(this.annotations.values())
  }

  /**
   * 选择标注
   */
  public selectAnnotation(id: string): void {
    this.selectedId = id
    this.render()
  }

  /**
   * 取消选择
   */
  public deselectAnnotation(): void {
    this.selectedId = null
    this.render()
  }

  /**
   * 将球面坐标转换为屏幕坐标
   */
  private sphericalToScreen(theta: number, phi: number): { x: number, y: number, z: number } {
    // 球面坐标转笛卡尔坐标
    const radius = 10
    const x = radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.cos(phi)
    const z = radius * Math.sin(phi) * Math.sin(theta)

    // 创建3D点
    const vector = new THREE.Vector3(x, y, z)

    // 投影到屏幕
    vector.project(this.camera)

    // 转换到屏幕坐标
    const screenX = (vector.x * 0.5 + 0.5) * this.canvas.width
    const screenY = (-(vector.y) * 0.5 + 0.5) * this.canvas.height

    return { x: screenX, y: screenY, z: vector.z }
  }

  /**
   * 渲染所有标注
   */
  public render(): void {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // 渲染每个标注
    this.annotations.forEach((annotation) => {
      if (!annotation.visible)
        return

      const screenPos = this.sphericalToScreen(annotation.position.theta, annotation.position.phi)

      // 检查是否在视野内
      if (screenPos.z > 1)
        return // 在相机后面

      // 根据类型渲染
      switch (annotation.type) {
        case 'text':
          this.renderText(annotation, screenPos.x, screenPos.y)
          break
        case 'arrow':
          this.renderArrow(annotation, screenPos.x, screenPos.y)
          break
        case 'rectangle':
          this.renderRectangle(annotation, screenPos.x, screenPos.y)
          break
        case 'circle':
          this.renderCircle(annotation, screenPos.x, screenPos.y)
          break
        case 'polygon':
          this.renderPolygon(annotation)
          break
        case 'line':
          this.renderLine(annotation)
          break
      }

      // 高亮选中的标注
      if (annotation.id === this.selectedId) {
        this.highlightAnnotation(screenPos.x, screenPos.y)
      }
    })
  }

  /**
   * 渲染文字标注
   */
  private renderText(annotation: Annotation, x: number, y: number): void {
    if (!annotation.content || !annotation.style)
      return

    const ctx = this.ctx
    const style = annotation.style

    // 设置字体
    ctx.font = `${style.fontSize}px ${style.fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // 测量文字
    const metrics = ctx.measureText(annotation.content)
    const textWidth = metrics.width
    const textHeight = style.fontSize!
    const padding = style.padding || 8

    // 绘制背景
    if (style.backgroundColor) {
      ctx.fillStyle = style.backgroundColor
      ctx.fillRect(
        x - textWidth / 2 - padding,
        y - textHeight / 2 - padding,
        textWidth + padding * 2,
        textHeight + padding * 2,
      )
    }

    // 绘制文字
    ctx.fillStyle = style.color!
    ctx.globalAlpha = style.opacity!
    ctx.fillText(annotation.content, x, y)
    ctx.globalAlpha = 1
  }

  /**
   * 渲染箭头标注
   */
  private renderArrow(annotation: Annotation, x: number, y: number): void {
    const ctx = this.ctx
    const style = annotation.style!
    const length = 50
    const headLength = 15
    const angle = Math.PI / 6

    ctx.strokeStyle = style.strokeColor!
    ctx.lineWidth = style.lineWidth!
    ctx.globalAlpha = style.opacity!

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x, y - length)

    // 箭头头部
    ctx.lineTo(x - headLength * Math.sin(angle), y - length + headLength * Math.cos(angle))
    ctx.moveTo(x, y - length)
    ctx.lineTo(x + headLength * Math.sin(angle), y - length + headLength * Math.cos(angle))

    ctx.stroke()
    ctx.globalAlpha = 1
  }

  /**
   * 渲染矩形标注
   */
  private renderRectangle(annotation: Annotation, x: number, y: number): void {
    const ctx = this.ctx
    const style = annotation.style!
    const width = 100
    const height = 60

    ctx.globalAlpha = style.opacity!

    // 填充
    if (style.fillColor) {
      ctx.fillStyle = style.fillColor
      ctx.fillRect(x - width / 2, y - height / 2, width, height)
    }

    // 边框
    if (style.strokeColor) {
      ctx.strokeStyle = style.strokeColor
      ctx.lineWidth = style.lineWidth!
      ctx.strokeRect(x - width / 2, y - height / 2, width, height)
    }

    ctx.globalAlpha = 1
  }

  /**
   * 渲染圆形标注
   */
  private renderCircle(annotation: Annotation, x: number, y: number): void {
    const ctx = this.ctx
    const style = annotation.style!
    const radius = 30

    ctx.globalAlpha = style.opacity!
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)

    // 填充
    if (style.fillColor) {
      ctx.fillStyle = style.fillColor
      ctx.fill()
    }

    // 边框
    if (style.strokeColor) {
      ctx.strokeStyle = style.strokeColor
      ctx.lineWidth = style.lineWidth!
      ctx.stroke()
    }

    ctx.globalAlpha = 1
  }

  /**
   * 渲染多边形标注
   */
  private renderPolygon(annotation: Annotation): void {
    if (!annotation.points || annotation.points.length < 3)
      return

    const ctx = this.ctx
    const style = annotation.style!

    ctx.globalAlpha = style.opacity!
    ctx.beginPath()

    annotation.points.forEach((point, index) => {
      const screenPos = this.sphericalToScreen(point.theta, point.phi)
      if (index === 0) {
        ctx.moveTo(screenPos.x, screenPos.y)
      }
      else {
        ctx.lineTo(screenPos.x, screenPos.y)
      }
    })

    ctx.closePath()

    // 填充
    if (style.fillColor) {
      ctx.fillStyle = style.fillColor
      ctx.fill()
    }

    // 边框
    if (style.strokeColor) {
      ctx.strokeStyle = style.strokeColor
      ctx.lineWidth = style.lineWidth!
      ctx.stroke()
    }

    ctx.globalAlpha = 1
  }

  /**
   * 渲染线条标注
   */
  private renderLine(annotation: Annotation): void {
    if (!annotation.points || annotation.points.length < 2)
      return

    const ctx = this.ctx
    const style = annotation.style!

    ctx.strokeStyle = style.strokeColor!
    ctx.lineWidth = style.lineWidth!
    ctx.globalAlpha = style.opacity!

    ctx.beginPath()

    annotation.points.forEach((point, index) => {
      const screenPos = this.sphericalToScreen(point.theta, point.phi)
      if (index === 0) {
        ctx.moveTo(screenPos.x, screenPos.y)
      }
      else {
        ctx.lineTo(screenPos.x, screenPos.y)
      }
    })

    ctx.stroke()
    ctx.globalAlpha = 1
  }

  /**
   * 高亮标注
   */
  private highlightAnnotation(x: number, y: number): void {
    const ctx = this.ctx
    const radius = 40

    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 3
    ctx.setLineDash([5, 5])

    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.stroke()

    ctx.setLineDash([])
  }

  /**
   * 获取指定位置的标注
   */
  private getAnnotationAtPosition(clientX: number, clientY: number): Annotation | null {
    const rect = this.canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    // 检查每个标注
    for (const annotation of this.annotations.values()) {
      if (!annotation.visible || !annotation.interactive)
        continue

      const screenPos = this.sphericalToScreen(annotation.position.theta, annotation.position.phi)
      const distance = Math.sqrt((x - screenPos.x) ** 2 + (y - screenPos.y) ** 2)

      if (distance < 40) { // 点击容差
        return annotation
      }
    }

    return null
  }

  /**
   * 导出标注数据
   */
  public exportAnnotations(): Annotation[] {
    return Array.from(this.annotations.values())
  }

  /**
   * 导入标注数据
   */
  public importAnnotations(annotations: Annotation[]): void {
    this.annotations.clear()
    annotations.forEach(annotation => this.addAnnotation(annotation))
  }

  /**
   * 清除所有标注
   */
  public clear(): void {
    this.annotations.clear()
    this.render()
  }

  /**
   * 显示/隐藏标注
   */
  public setVisible(id: string, visible: boolean): void {
    const annotation = this.annotations.get(id)
    if (annotation) {
      annotation.visible = visible
      this.render()
    }
  }

  /**
   * 显示/隐藏所有标注
   */
  public setAllVisible(visible: boolean): void {
    this.annotations.forEach((annotation) => {
      annotation.visible = visible
    })
    this.render()
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    this.canvas.remove()
    this.annotations.clear()
  }
}
