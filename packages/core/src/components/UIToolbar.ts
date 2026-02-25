/**
 * UI Toolbar - 统一管理右侧工具栏的布局
 * 避免组件重叠，提供统一的样式
 */
export interface UIToolbarOptions {
  position?: 'left' | 'right'
  margin?: number
  gap?: number
  backgroundColor?: string
}

const DEFAULT_OPTIONS: Required<UIToolbarOptions> = {
  position: 'right',
  margin: 16,
  gap: 8,
  backgroundColor: 'transparent',
}

export class UIToolbar {
  private container: HTMLElement
  private element: HTMLElement
  private options: Required<UIToolbarOptions>
  private slots: Map<string, HTMLElement> = new Map()

  constructor(container: HTMLElement, options?: UIToolbarOptions) {
    this.container = container
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.element = this.createElement()
    this.container.appendChild(this.element)
  }

  private createElement(): HTMLElement {
    const el = document.createElement('div')
    const { position, margin, gap } = this.options

    el.style.cssText = `
      position: absolute;
      ${position}: ${margin}px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: ${gap}px;
      z-index: 1000;
      pointer-events: none;
    `
    el.className = 'panorama-ui-toolbar'

    return el
  }

  /**
   * 添加一个槽位用于放置组件
   */
  public addSlot(id: string, order: number = 0): HTMLElement {
    const slot = document.createElement('div')
    slot.style.cssText = `
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
    `
    slot.dataset.order = String(order)
    slot.dataset.slotId = id

    // 按 order 排序插入
    const slots = Array.from(this.element.children) as HTMLElement[]
    const insertIndex = slots.findIndex(s => {
      const sOrder = parseInt(s.dataset.order || '0', 10)
      return sOrder > order
    })

    if (insertIndex === -1) {
      this.element.appendChild(slot)
    } else {
      this.element.insertBefore(slot, slots[insertIndex])
    }

    this.slots.set(id, slot)
    return slot
  }

  /**
   * 获取槽位
   */
  public getSlot(id: string): HTMLElement | undefined {
    return this.slots.get(id)
  }

  /**
   * 移除槽位
   */
  public removeSlot(id: string): void {
    const slot = this.slots.get(id)
    if (slot && this.element.contains(slot)) {
      this.element.removeChild(slot)
      this.slots.delete(id)
    }
  }

  /**
   * 显示工具栏
   */
  public show(): void {
    this.element.style.display = 'flex'
  }

  /**
   * 隐藏工具栏
   */
  public hide(): void {
    this.element.style.display = 'none'
  }

  /**
   * 获取工具栏元素
   */
  public getElement(): HTMLElement {
    return this.element
  }

  public dispose(): void {
    this.slots.clear()
    if (this.container.contains(this.element)) {
      this.container.removeChild(this.element)
    }
  }
}
