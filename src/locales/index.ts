import { zhCN as commonZh, enUS as commonEn } from './common';
import { zhCN as namespacesZh, enUS as namespacesEn } from './namespaces';
import { zhCN as rabbitZh, enUS as rabbitEn } from './rabbit/template';
import { zhCN as emailZh, enUS as emailEn } from './rabbit/email';
import { zhCN as webhookZh, enUS as webhookEn } from './rabbit/webhook';
import type { LocaleType } from '@/contexts/LocaleContext';

// 合并所有模块的翻译资源
const mergeResources = (...modules: Array<Record<string, string>>): Record<string, string> => {
  return Object.assign({}, ...modules);
};

// 中文资源（合并所有模块）
const zhCN = mergeResources(commonZh, namespacesZh, rabbitZh, emailZh, webhookZh);

// 英文资源（合并所有模块）
const enUS = mergeResources(commonEn, namespacesEn, rabbitEn, emailEn, webhookEn);

// 语言资源映射
export const resources: Record<LocaleType, Record<string, string>> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

// 导出所有语言资源（兼容旧版本）
export { default as zhCN } from './zh-CN';
export { default as enUS } from './en-US';
export { zhCN as commonZh, enUS as commonEn } from './common';
export { zhCN as namespacesZh, enUS as namespacesEn } from './namespaces';
export { zhCN as rabbitZh, enUS as rabbitEn } from './rabbit/template';
export { zhCN as emailZh, enUS as emailEn } from './rabbit/email';
export { zhCN as webhookZh, enUS as webhookEn } from './rabbit/webhook';
