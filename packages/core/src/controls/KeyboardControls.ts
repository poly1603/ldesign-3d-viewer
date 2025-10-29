import * as THREE from 'three'

export class KeyboardControls {
  private camera: THREE.PerspectiveCamera
  private enabled: boolean = true
  private rotationSpeed: number = 0.05
  private zoomSpeed: number = 2
  private keys: Set<string> = new Set()
  private boundKeyDown: (event: KeyboardEvent) => void
  private boundKeyUp: (event: KeyboardEvent) => void

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera
    this.boundKeyDown = this.onKeyDown.bind(this)
    this.boundKeyUp = this.onKeyUp.bind(this)
    this.bindEvents()
  }

  private bindEvents(): void {
    window.addEventListener('keydown', this.boundKeyDown)
    window.addEventListener('keyup', this.boundKeyUp)
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (!this.enabled)
      return
    this.keys.add(event.key)
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.keys.delete(event.key)
  }

  public update(): void {
    if (!this.enabled)
      return

    const euler = new THREE.Euler(0, 0, 0, 'YXZ')
    euler.setFromQuaternion(this.camera.quaternion)

    // Arrow keys for rotation
    if (this.keys.has('ArrowLeft')) {
      euler.y += this.rotationSpeed
    }
    if (this.keys.has('ArrowRight')) {
      euler.y -= this.rotationSpeed
    }
    if (this.keys.has('ArrowUp')) {
      euler.x -= this.rotationSpeed
      euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x))
    }
    if (this.keys.has('ArrowDown')) {
      euler.x += this.rotationSpeed
      euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x))
    }

    this.camera.quaternion.setFromEuler(euler)

    // + and - for zoom
    if (this.keys.has('+') || this.keys.has('=')) {
      this.camera.fov = Math.max(30, this.camera.fov - this.zoomSpeed)
      this.camera.updateProjectionMatrix()
    }
    if (this.keys.has('-') || this.keys.has('_')) {
      this.camera.fov = Math.min(100, this.camera.fov + this.zoomSpeed)
      this.camera.updateProjectionMatrix()
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (!enabled) {
      this.keys.clear()
    }
  }

  public dispose(): void {
    window.removeEventListener('keydown', this.boundKeyDown)
    window.removeEventListener('keyup', this.boundKeyUp)
    this.keys.clear()
    this.enabled = false
  }
}
