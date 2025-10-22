/**
 * 测量工具
 * 支持距离和角度测量
 */

import * as THREE from 'three';
import { logger } from '../core/Logger';
import { EventBus } from '../core/EventBus';

export interface MeasurePoint {
  position: THREE.Vector3;
  screenPosition: THREE.Vector2;
  id: string;
}

export interface Measurement {
  id: string;
  type: 'distance' | 'angle';
  points: MeasurePoint[];
  value: number;
  unit: string;
  label: HTMLElement;
}

export class MeasureTool {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private container: HTMLElement;
  private eventBus: EventBus | null;
  private measurements: Map<string, Measurement> = new Map();
  private isActive: boolean = false;
  private currentPoints: MeasurePoint[] = [];
  private measurementType: 'distance' | 'angle' = 'distance';
  private linesMaterial: THREE.LineBasicMaterial;
  private pointsMaterial: THREE.PointsMaterial;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;

  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    container: HTMLElement,
    eventBus?: EventBus
  ) {
    this.scene = scene;
    this.camera = camera;
    this.container = container;
    this.eventBus = eventBus || null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // 创建材质
    this.linesMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000,
      linewidth: 2,
    });

    this.pointsMaterial = new THREE.PointsMaterial({
      color: 0xff0000,
      size: 10,
      sizeAttenuation: false,
    });

    this.setupEventListeners();
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    this.container.addEventListener('click', this.onContainerClick.bind(this));
    this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  /**
   * 容器点击事件
   */
  private onContainerClick(event: MouseEvent): void {
    if (!this.isActive) return;

    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // 射线投射找到点击的 3D 点
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      this.addPoint(point, this.mouse.clone());
    }
  }

  /**
   * 鼠标移动事件
   */
  private onMouseMove(event: MouseEvent): void {
    if (!this.isActive) return;

    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // 可以添加预览线条
    this.updatePreview();
  }

  /**
   * 添加测量点
   */
  private addPoint(position: THREE.Vector3, screenPosition: THREE.Vector2): void {
    const point: MeasurePoint = {
      position: position.clone(),
      screenPosition: screenPosition.clone(),
      id: `point_${Date.now()}`,
    };

    this.currentPoints.push(point);

    // 根据测量类型决定何时完成测量
    if (this.measurementType === 'distance' && this.currentPoints.length === 2) {
      this.completeMeasurement();
    } else if (this.measurementType === 'angle' && this.currentPoints.length === 3) {
      this.completeMeasurement();
    }

    logger.debug(`Point added. Total points: ${this.currentPoints.length}`);
  }

  /**
   * 完成测量
   */
  private completeMeasurement(): void {
    const id = `measurement_${Date.now()}`;
    let value: number;
    let unit: string;

    if (this.measurementType === 'distance') {
      value = this.calculateDistance(
        this.currentPoints[0].position,
        this.currentPoints[1].position
      );
      unit = 'm';
    } else {
      value = this.calculateAngle(
        this.currentPoints[0].position,
        this.currentPoints[1].position,
        this.currentPoints[2].position
      );
      unit = '°';
    }

    const measurement: Measurement = {
      id,
      type: this.measurementType,
      points: [...this.currentPoints],
      value,
      unit,
      label: this.createLabel(value, unit),
    };

    this.measurements.set(id, measurement);
    this.drawMeasurement(measurement);

    // 重置当前点
    this.currentPoints = [];

    logger.info(`Measurement completed: ${value.toFixed(2)}${unit}`);
  }

  /**
   * 计算距离
   */
  private calculateDistance(p1: THREE.Vector3, p2: THREE.Vector3): number {
    return p1.distanceTo(p2);
  }

  /**
   * 计算角度
   */
  private calculateAngle(
    p1: THREE.Vector3,
    p2: THREE.Vector3,
    p3: THREE.Vector3
  ): number {
    const v1 = new THREE.Vector3().subVectors(p1, p2).normalize();
    const v2 = new THREE.Vector3().subVectors(p3, p2).normalize();
    const angle = Math.acos(v1.dot(v2));
    return THREE.MathUtils.radToDeg(angle);
  }

  /**
   * 绘制测量
   */
  private drawMeasurement(measurement: Measurement): void {
    const points = measurement.points.map((p) => p.position);

    // 创建线条
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, this.linesMaterial);
    line.userData.measurementId = measurement.id;
    this.scene.add(line);

    // 创建点
    const pointsGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const pointsMesh = new THREE.Points(pointsGeometry, this.pointsMaterial);
    pointsMesh.userData.measurementId = measurement.id;
    this.scene.add(pointsMesh);

    // 添加标签到容器
    this.container.appendChild(measurement.label);
    this.updateLabelPosition(measurement);
  }

  /**
   * 创建标签
   */
  private createLabel(value: number, unit: string): HTMLElement {
    const label = document.createElement('div');
    label.className = 'measurement-label';
    label.style.cssText = `
      position: absolute;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
      pointer-events: none;
      z-index: 1000;
      white-space: nowrap;
    `;
    label.textContent = `${value.toFixed(2)} ${unit}`;
    return label;
  }

  /**
   * 更新标签位置
   */
  private updateLabelPosition(measurement: Measurement): void {
    // 计算中心点
    const center = new THREE.Vector3();
    measurement.points.forEach((p) => center.add(p.position));
    center.divideScalar(measurement.points.length);

    // 投影到屏幕
    const screenPos = center.clone().project(this.camera);
    const x = (screenPos.x + 1) / 2 * this.container.clientWidth;
    const y = (-screenPos.y + 1) / 2 * this.container.clientHeight;

    measurement.label.style.left = `${x}px`;
    measurement.label.style.top = `${y}px`;
  }

  /**
   * 更新所有标签位置（在动画循环中调用）
   */
  public update(): void {
    if (!this.isActive) return;

    this.measurements.forEach((measurement) => {
      this.updateLabelPosition(measurement);
    });
  }

  /**
   * 更新预览
   */
  private updatePreview(): void {
    // TODO: 显示当前鼠标位置到最后一个点的预览线
  }

  /**
   * 激活工具
   */
  public activate(type: 'distance' | 'angle' = 'distance'): void {
    this.isActive = true;
    this.measurementType = type;
    this.currentPoints = [];
    logger.info(`Measure tool activated: ${type}`);
  }

  /**
   * 停用工具
   */
  public deactivate(): void {
    this.isActive = false;
    this.currentPoints = [];
    logger.info('Measure tool deactivated');
  }

  /**
   * 清除所有测量
   */
  public clearAll(): void {
    this.measurements.forEach((measurement) => {
      this.removeMeasurement(measurement.id);
    });
    logger.info('All measurements cleared');
  }

  /**
   * 移除测量
   */
  public removeMeasurement(id: string): void {
    const measurement = this.measurements.get(id);
    if (!measurement) return;

    // 移除场景中的对象
    const objectsToRemove: THREE.Object3D[] = [];
    this.scene.traverse((obj) => {
      if (obj.userData.measurementId === id) {
        objectsToRemove.push(obj);
      }
    });

    objectsToRemove.forEach((obj) => {
      this.scene.remove(obj);
      if (obj instanceof THREE.Line || obj instanceof THREE.Points) {
        obj.geometry.dispose();
      }
    });

    // 移除标签
    if (measurement.label.parentElement) {
      measurement.label.parentElement.removeChild(measurement.label);
    }

    this.measurements.delete(id);
    logger.debug(`Measurement removed: ${id}`);
  }

  /**
   * 获取所有测量
   */
  public getMeasurements(): Measurement[] {
    return Array.from(this.measurements.values());
  }

  /**
   * 导出测量数据
   */
  public exportData(): string {
    const data = this.getMeasurements().map((m) => ({
      id: m.id,
      type: m.type,
      value: m.value,
      unit: m.unit,
      points: m.points.map((p) => ({
        x: p.position.x,
        y: p.position.y,
        z: p.position.z,
      })),
    }));

    return JSON.stringify(data, null, 2);
  }

  /**
   * 销毁
   */
  public dispose(): void {
    this.clearAll();
    this.isActive = false;
    this.linesMaterial.dispose();
    this.pointsMaterial.dispose();
    logger.debug('MeasureTool disposed');
  }
}

