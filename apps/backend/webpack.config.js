/**
 * NestJS Webpack 配置
 *
 * 解决 Prisma 7 生成的 .ts 文件内使用 .js 扩展名导入的模块解析问题。
 * Prisma 7 生成的 import 形如 './enums.js'，但实际文件是 './enums.ts'，
 * Webpack 需要知道 .js → .ts 的回落解析。
 */
module.exports = function (options, webpack) {
  return {
    ...options,
    resolve: {
      ...options.resolve,
      extensionAlias: {
        '.js': ['.ts', '.js'],
        '.jsx': ['.tsx', '.jsx'],
      },
    },
  };
};
