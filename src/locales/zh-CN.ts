// 中文语言资源（兼容旧版本，已迁移到模块化结构）
// 新代码请使用模块化的翻译文件（common.ts, namespaces.ts 等）
import { zhCN as commonZh } from './common';
import { zhCN as namespacesZh } from './namespaces';

export default {
  ...commonZh,
  ...namespacesZh,
} as const;
