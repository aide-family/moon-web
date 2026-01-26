import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeConfig, theme } from 'antd';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  themeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme-mode';

// 获取默认主题（从localStorage或系统偏好）
const getDefaultTheme = (): ThemeMode => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  // 检查系统偏好
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getDefaultTheme);

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // 只有在用户没有手动设置主题时才跟随系统
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        setThemeMode(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 根据主题模式设置 data-theme 属性，用于 CSS 样式
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, [themeMode]);

  // 切换主题
  const toggleTheme = () => {
    const newTheme: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  // 根据主题模式生成Ant Design主题配置
  const themeConfig: ThemeConfig = {
    token: {
      colorPrimary: '#6c34e6',
    },
    algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
  };

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, themeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
