# 3D Viewer Setup Verification Script
# This script verifies that all required files are in place

Write-Host "🔍 Verifying 3D Viewer Setup..." -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()
$success = 0

function Test-FileExists {
    param($path, $description)
    if (Test-Path $path) {
        Write-Host "✅ $description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $description - NOT FOUND" -ForegroundColor Red
        $script:errors += "Missing: $path"
        return $false
    }
}

# Check Root Files
Write-Host "📋 Checking Root Configuration..." -ForegroundColor Yellow
Test-FileExists "package.json" "Root package.json"
Test-FileExists "pnpm-workspace.yaml" "Workspace config"
Test-FileExists "tsconfig.base.json" "Base TypeScript config"
Test-FileExists "eslint.config.js" "Root ESLint config"
Test-FileExists "vitest.config.ts" "Vitest config"
Write-Host ""

# Check Angular Package
Write-Host "🏗️ Checking Angular Package..." -ForegroundColor Yellow
Test-FileExists "packages/angular/package.json" "Angular package.json"
Test-FileExists "packages/angular/tsconfig.json" "Angular tsconfig"
Test-FileExists "packages/angular/eslint.config.js" "Angular eslint"
Test-FileExists "packages/angular/.ldesign/builder.config.ts" "Angular builder config"
Test-FileExists "packages/angular/src/index.ts" "Angular index"
Test-FileExists "packages/angular/src/panorama-viewer.component.ts" "Angular component"
Write-Host ""

# Check Solid Package
Write-Host "⚡ Checking Solid.js Package..." -ForegroundColor Yellow
Test-FileExists "packages/solid/package.json" "Solid package.json"
Test-FileExists "packages/solid/tsconfig.json" "Solid tsconfig"
Test-FileExists "packages/solid/eslint.config.js" "Solid eslint"
Test-FileExists "packages/solid/.ldesign/builder.config.ts" "Solid builder config"
Test-FileExists "packages/solid/src/index.ts" "Solid index"
Test-FileExists "packages/solid/src/PanoramaViewer.tsx" "Solid component"
Write-Host ""

# Check Svelte Package
Write-Host "🎨 Checking Svelte Package..." -ForegroundColor Yellow
Test-FileExists "packages/svelte/package.json" "Svelte package.json"
Test-FileExists "packages/svelte/tsconfig.json" "Svelte tsconfig"
Test-FileExists "packages/svelte/eslint.config.js" "Svelte eslint"
Test-FileExists "packages/svelte/.ldesign/builder.config.ts" "Svelte builder config"
Test-FileExists "packages/svelte/src/index.ts" "Svelte index"
Test-FileExists "packages/svelte/src/PanoramaViewer.svelte" "Svelte component"
Write-Host ""

# Check Qwik Package
Write-Host "⚙️ Checking Qwik Package..." -ForegroundColor Yellow
Test-FileExists "packages/qwik/package.json" "Qwik package.json"
Test-FileExists "packages/qwik/tsconfig.json" "Qwik tsconfig"
Test-FileExists "packages/qwik/eslint.config.js" "Qwik eslint"
Test-FileExists "packages/qwik/.ldesign/builder.config.ts" "Qwik builder config"
Test-FileExists "packages/qwik/src/index.ts" "Qwik index"
Test-FileExists "packages/qwik/src/PanoramaViewer.tsx" "Qwik component"
Write-Host ""

# Check Tests
Write-Host "🧪 Checking Test Files..." -ForegroundColor Yellow
Test-FileExists "tests/setup.ts" "Test setup"
Test-FileExists "packages/core/__tests__/PanoramaViewer.basic.test.ts" "Basic tests"
Test-FileExists "packages/core/__tests__/performance.bench.ts" "Performance benchmarks"
Write-Host ""

# Check Documentation
Write-Host "📚 Checking Documentation..." -ForegroundColor Yellow
Test-FileExists "README_V3.md" "New README"
Test-FileExists "NEXT_STEPS.md" "Next steps guide"
Test-FileExists "BUILD_GUIDE.md" "Build guide"
Test-FileExists "TESTING_GUIDE.md" "Testing guide"
Test-FileExists "IMPLEMENTATION_COMPLETE.md" "Implementation summary"
Test-FileExists "FILES_CREATED.md" "File manifest"
Write-Host ""

# Summary
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📊 Verification Summary" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

if ($errors.Count -eq 0) {
    Write-Host "✅ All files verified successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Run: pnpm install" -ForegroundColor White
    Write-Host "  2. Run: pnpm build:core" -ForegroundColor White
    Write-Host "  3. Run: pnpm build:angular" -ForegroundColor White
    Write-Host "  4. Run: pnpm build:solid" -ForegroundColor White
    Write-Host "  5. Run: pnpm build:svelte" -ForegroundColor White
    Write-Host "  6. Run: pnpm build:qwik" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 See NEXT_STEPS.md for detailed instructions" -ForegroundColor Cyan
} else {
    Write-Host "❌ Found $($errors.Count) error(s):" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "   - $error" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Please create the missing files before proceeding." -ForegroundColor Yellow
}

Write-Host ""
