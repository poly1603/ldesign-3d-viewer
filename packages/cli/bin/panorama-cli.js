#!/usr/bin/env node

/**
 * Panorama Viewer CLI Tool
 */

const { program } = require('commander');
const packageJson = require('../package.json');

program
  .name('panorama-cli')
  .description('CLI tools for 3D Panorama Viewer')
  .version(packageJson.version);

// 创建新项目
program
  .command('create <project-name>')
  .description('Create a new panorama viewer project')
  .option('-t, --template <template>', 'Project template (vue|react|vanilla)', 'vanilla')
  .action(async (projectName, options) => {
    const { createProject } = require('../dist/commands/create');
    await createProject(projectName, options);
  });

// 图像预处理
program
  .command('optimize <input>')
  .description('Optimize panorama image')
  .option('-o, --output <output>', 'Output file path')
  .option('-w, --width <width>', 'Target width', '4096')
  .option('-q, --quality <quality>', 'Quality (0-100)', '85')
  .option('-f, --format <format>', 'Output format (jpg|webp|avif)', 'jpg')
  .action(async (input, options) => {
    const { optimizeImage } = require('../dist/commands/optimize');
    await optimizeImage(input, options);
  });

// 生成瓦片
program
  .command('tiles <input>')
  .description('Generate tiles from panorama image')
  .option('-o, --output <dir>', 'Output directory', './tiles')
  .option('-l, --levels <levels>', 'Number of levels', '5')
  .option('-s, --size <size>', 'Tile size', '512')
  .option('-f, --format <format>', 'Tile format (google|marzipano)', 'google')
  .action(async (input, options) => {
    const { generateTiles } = require('../dist/commands/tiles');
    await generateTiles(input, options);
  });

// 性能分析
program
  .command('analyze <url>')
  .description('Analyze panorama viewer performance')
  .option('-d, --duration <seconds>', 'Analysis duration in seconds', '30')
  .option('-o, --output <file>', 'Output report file')
  .action(async (url, options) => {
    const { analyzePerformance } = require('../dist/commands/analyze');
    await analyzePerformance(url, options);
  });

program.parse();

