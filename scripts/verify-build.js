/**
 * 构建产物验证脚本
 * 验证所有包的构建产物是否完整
 */

const fs = require('fs');
const path = require('path');

const packages = ['core', 'vue', 'react', 'lit'];

console.log('🔍 开始验证构建产物...\n');

let allPassed = true;
const results = [];

packages.forEach(pkg => {
  console.log(`📦 验证 @panorama-viewer/${pkg}`);
  
  const distPath = path.join(__dirname, '../packages', pkg, 'dist');
  const result = {
    package: pkg,
    distExists: false,
    files: {},
    totalSize: 0,
  };
  
  // 检查目录是否存在
  if (!fs.existsSync(distPath)) {
    console.log(`  ❌ dist 目录不存在`);
    allPassed = false;
    results.push(result);
    return;
  }
  
  result.distExists = true;
  
  // 检查文件
  const requiredFiles = {
    esm: 'index.esm.js',
    cjs: 'index.cjs.js',
    dts: 'index.d.ts',
  };
  
  // Vue 特殊：有 CSS 文件
  if (pkg === 'vue') {
    requiredFiles.css = 'style.css';
  }
  
  Object.entries(requiredFiles).forEach(([type, file]) => {
    const filePath = path.join(distPath, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      result.files[type] = {
        exists: true,
        size: stats.size,
        sizeKB: sizeKB,
      };
      result.totalSize += stats.size;
      console.log(`  ✓ ${file} (${sizeKB} KB)`);
    } else {
      result.files[type] = { exists: false };
      console.log(`  ❌ ${file} 不存在`);
      allPassed = false;
    }
  });
  
  console.log(`  📊 总大小: ${(result.totalSize / 1024).toFixed(2)} KB\n`);
  results.push(result);
});

// 输出总结
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 构建验证总结\n');

const totalSize = results.reduce((sum, r) => sum + r.totalSize, 0);
console.log(`总包数: ${packages.length}`);
console.log(`验证通过: ${results.filter(r => r.distExists).length}`);
console.log(`总大小: ${(totalSize / 1024).toFixed(2)} KB (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);

if (allPassed) {
  console.log('\n✅ 所有构建产物验证通过！');
  process.exit(0);
} else {
  console.log('\n❌ 构建产物验证失败！');
  process.exit(1);
}

