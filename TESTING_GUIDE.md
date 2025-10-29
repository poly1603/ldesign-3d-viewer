# Testing Guide

## 📋 Overview

This guide explains how to write and run tests for the 3D Viewer project.

## 🧪 Test Types

### 1. Unit Tests
Test individual functions and components in isolation.

**Location**: `packages/*/(__tests__|src)/**/*.test.ts`

**Example**:
```typescript
import { describe, it, expect } from 'vitest'
import { PanoramaViewer } from '../src/PanoramaViewer'

describe('PanoramaViewer', () => {
  it('should create instance', () => {
    const viewer = new PanoramaViewer({ /* options */ })
    expect(viewer).toBeDefined()
  })
})
```

### 2. Performance Benchmarks
Measure performance of critical operations.

**Location**: `packages/*/(__tests__|src)/**/*.bench.ts`

**Example**:
```typescript
import { bench, describe } from 'vitest'

describe('Performance', () => {
  bench('operation', () => {
    // Code to benchmark
  })
})
```

### 3. Integration Tests
Test interactions between components.

**Location**: `packages/*/(__tests__|src)/**/*.integration.test.ts`

### 4. E2E Tests (Future)
Test complete user workflows using Playwright.

**Location**: `tests/e2e/**/*.spec.ts`

## 🚀 Running Tests

### Run All Tests
```bash
pnpm test
```

### Run Tests for Specific Package
```bash
# Core package
cd packages/core
pnpm test

# Framework packages
cd packages/vue
pnpm test
```

### Run Tests in Watch Mode
```bash
pnpm test --watch
```

### Run with Coverage
```bash
pnpm test --coverage
```

### Run Performance Benchmarks
```bash
pnpm test --run --reporter=verbose performance.bench
```

## 📝 Writing Tests

### Basic Unit Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { YourComponent } from '../src/YourComponent'

describe('YourComponent', () => {
  let component: YourComponent
  
  beforeEach(() => {
    // Setup before each test
    component = new YourComponent()
  })
  
  afterEach(() => {
    // Cleanup after each test
    component.dispose()
  })
  
  describe('feature name', () => {
    it('should do something', () => {
      // Arrange
      const input = 'test'
      
      // Act
      const result = component.doSomething(input)
      
      // Assert
      expect(result).toBe('expected')
    })
  })
})
```

### Testing Viewer Components

```typescript
describe('PanoramaViewer', () => {
  let container: HTMLDivElement
  let viewer: PanoramaViewer | null = null
  
  beforeEach(() => {
    container = document.createElement('div')
    container.style.width = '800px'
    container.style.height = '600px'
    document.body.appendChild(container)
  })
  
  afterEach(() => {
    if (viewer) {
      viewer.dispose()
      viewer = null
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })
  
  it('should initialize', () => {
    viewer = new PanoramaViewer({
      container,
      image: '/test.jpg',
    })
    
    expect(viewer).toBeDefined()
  })
})
```

### Testing Async Operations

```typescript
it('should load image', async () => {
  viewer = new PanoramaViewer({
    container,
    image: '/test.jpg',
  })
  
  await viewer.loadImage('/new-image.jpg')
  
  expect(viewer).toBeDefined()
  // Add more assertions
})
```

### Testing Error Cases

```typescript
it('should throw error for invalid input', () => {
  expect(() => {
    new PanoramaViewer({
      container: null as any,
      image: '/test.jpg',
    })
  }).toThrow('Invalid container')
})
```

### Mocking WebGL

WebGL is automatically mocked in the test setup:

```typescript
// tests/setup.ts already includes this
HTMLCanvasElement.prototype.getContext = function (contextId: string) {
  if (contextId === 'webgl' || contextId === 'webgl2') {
    return {
      getExtension: () => null,
      getParameter: () => null,
      // Add more mocks as needed
    }
  }
  return null
}
```

### Testing Memory Leaks

```typescript
import { describe, it, expect } from 'vitest'

describe('Memory Management', () => {
  it('should cleanup resources', () => {
    const viewer = new PanoramaViewer({ /* options */ })
    
    // Use the viewer
    viewer.addHotspot({ id: '1', position: { theta: 0, phi: 0 } })
    
    // Dispose should not throw
    expect(() => viewer.dispose()).not.toThrow()
    
    // Double dispose should be safe
    expect(() => viewer.dispose()).not.toThrow()
  })
  
  it('should not leak memory after disposal', () => {
    const viewers: PanoramaViewer[] = []
    
    // Create multiple viewers
    for (let i = 0; i < 100; i++) {
      viewers.push(new PanoramaViewer({ /* options */ }))
    }
    
    // Dispose all
    viewers.forEach(v => v.dispose())
    
    // Check memory (manual verification in browser DevTools)
    expect(viewers.length).toBe(100)
  })
})
```

## 📊 Coverage Goals

| Type | Target | Current |
|------|--------|---------|
| Statements | 80% | TBD |
| Branches | 75% | TBD |
| Functions | 80% | TBD |
| Lines | 80% | TBD |

## 🎯 Test Checklist

### Core Package
- [ ] PanoramaViewer initialization
- [ ] Camera controls (get/set rotation, reset)
- [ ] Auto rotation (enable/disable)
- [ ] Hotspots (add/remove/get)
- [ ] Image loading
- [ ] Screenshot generation
- [ ] Resource disposal
- [ ] Memory leak prevention
- [ ] Event system
- [ ] Error handling

### Framework Packages
- [ ] Component rendering
- [ ] Props/Input handling
- [ ] Event emission
- [ ] Lifecycle hooks
- [ ] Memory cleanup
- [ ] TypeScript types
- [ ] Integration with core

### Utilities
- [ ] ObjectPool (get/release)
- [ ] TextureCache
- [ ] DeviceCapability
- [ ] PowerManager
- [ ] PerformanceMonitor

## 🔧 Debugging Tests

### Run Single Test
```bash
pnpm test -t "test name"
```

### Run Single File
```bash
pnpm test PanoramaViewer.test
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["test", "--run"],
  "console": "integratedTerminal"
}
```

### View Coverage Report
```bash
pnpm test --coverage
# Open coverage/index.html in browser
```

## 📚 Best Practices

### 1. Test Naming
```typescript
// Good
it('should add hotspot when valid position provided')
it('should throw error when container is null')

// Bad
it('test 1')
it('works')
```

### 2. Arrange-Act-Assert Pattern
```typescript
it('should update rotation', () => {
  // Arrange
  const viewer = new PanoramaViewer({ /* */ })
  const newRotation = { x: 1, y: 2, z: 3 }
  
  // Act
  viewer.setRotation(newRotation.x, newRotation.y, newRotation.z)
  
  // Assert
  const rotation = viewer.getRotation()
  expect(rotation.x).toBeCloseTo(newRotation.x)
})
```

### 3. One Assertion Per Test (Preferred)
```typescript
// Good - focused test
it('should set x rotation', () => {
  viewer.setRotation(1, 0, 0)
  expect(viewer.getRotation().x).toBe(1)
})

// Acceptable - related assertions
it('should set all rotation axes', () => {
  viewer.setRotation(1, 2, 3)
  const rotation = viewer.getRotation()
  expect(rotation.x).toBe(1)
  expect(rotation.y).toBe(2)
  expect(rotation.z).toBe(3)
})
```

### 4. Always Cleanup
```typescript
afterEach(() => {
  // Dispose viewers
  if (viewer) {
    viewer.dispose()
  }
  
  // Remove DOM elements
  if (container && container.parentNode) {
    container.parentNode.removeChild(container)
  }
})
```

### 5. Test Edge Cases
```typescript
describe('Edge Cases', () => {
  it('should handle null image', () => {
    expect(() => {
      new PanoramaViewer({
        container,
        image: null as any,
      })
    }).toThrow()
  })
  
  it('should handle very large fov', () => {
    const viewer = new PanoramaViewer({
      container,
      image: '/test.jpg',
      fov: 179, // Nearly 180 degrees
    })
    expect(viewer).toBeDefined()
  })
})
```

## 🐛 Common Issues

### Issue: Tests hang or timeout
**Solution**: Ensure all async operations complete and viewers are disposed.

### Issue: WebGL errors
**Solution**: Check that WebGL mocks are properly set up in tests/setup.ts

### Issue: Memory leaks in tests
**Solution**: Always call `dispose()` in `afterEach` hooks

### Issue: Flaky tests
**Solution**: 
- Avoid time-dependent assertions
- Use `waitFor` for async operations
- Ensure proper cleanup

## 📖 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Three.js Testing Guide](https://threejs.org/docs/#manual/en/introduction/Testing)

## 🎯 Next Steps

1. **Week 1**: Write basic unit tests for core package
2. **Week 2**: Add integration tests for framework packages
3. **Week 3**: Implement E2E tests with Playwright
4. **Week 4**: Achieve 80% code coverage

---

**Happy Testing! 🧪**
