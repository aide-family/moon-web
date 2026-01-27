import React, { createContext, useContext, useState, ReactNode } from 'react';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import type { Locale } from 'antd/es/locale';
import { resources } from '@/locales';

export type LocaleType = 'zh-CN' | 'en-US';

interface LocaleContextType {
  locale: LocaleType;
  antdLocale: Locale;
  setLocale: (locale: LocaleType) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'app-locale';

// 获取默认语言（从localStorage或浏览器偏好）
const getDefaultLocale = (): LocaleType => {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as LocaleType;
  if (stored === 'zh-CN' || stored === 'en-US') {
    return stored;
  }
  // 检查浏览器语言偏好
  const browserLang = navigator.language || (navigator as unknown as { userLanguage?: string }).userLanguage || 'en-US';
  if (browserLang.startsWith('zh')) {
    return 'zh-CN';
  }
  return 'en-US';
};

interface LocaleProviderProps {
  children: ReactNode;
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  const [locale, setLocaleState] = useState<LocaleType>(getDefaultLocale);

  // 设置语言
  const setLocale = (newLocale: LocaleType) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  };

  // 获取 Ant Design 的 locale
  const antdLocale = locale === 'zh-CN' ? zhCN : enUS;

  // 翻译函数（支持参数替换）
  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = resources[locale][key] || key;
    if (params) {
      Object.keys(params).forEach(paramKey => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(params[paramKey]));
      });
    }
    return text;
  };

  return (
    <LocaleContext.Provider value={{ locale, antdLocale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
