import zhCN from './zh-CN';
import enUS from './en-US';
import type { LocaleType } from '@/contexts/LocaleContext';

// 语言资源映射
export const resources: Record<LocaleType, Record<string, string>> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

// 导出所有语言资源
export { default as zhCN } from './zh-CN';
export { default as enUS } from './en-US';
