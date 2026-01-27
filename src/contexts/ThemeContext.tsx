import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeConfig, theme } from 'antd';

type ThemeMode = 'light' | 'dark' | 'system';
type ActualThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  actualThemeMode: ActualThemeMode; // 实际应用的主题（当 themeMode 为 'system' 时，根据系统偏好计算）
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void; // 保留兼容性
  themeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme-mode';

// 获取系统主题偏好
const getSystemTheme = (): ActualThemeMode => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

// 获取默认主题（从localStorage或系统偏好）
const getDefaultTheme = (): ThemeMode => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system'; // 默认跟随系统
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getDefaultTheme);
  const [actualThemeMode, setActualThemeMode] = useState<ActualThemeMode>(() => {
    const mode = getDefaultTheme();
    if (mode === 'system') {
      return getSystemTheme();
    }
    return mode;
  });

  // 计算实际应用的主题
  useEffect(() => {
    if (themeMode === 'system') {
      const systemTheme = getSystemTheme();
      setActualThemeMode(systemTheme);
    } else {
      setActualThemeMode(themeMode);
    }
  }, [themeMode]);

  // 监听系统主题变化（仅在 themeMode 为 'system' 时）
  useEffect(() => {
    if (themeMode !== 'system') {
      return;
    }
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setActualThemeMode(e.matches ? 'dark' : 'light');
    };
    
    // 初始化时设置一次
    setActualThemeMode(getSystemTheme());
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  // 根据实际主题模式设置 data-theme 属性，用于 CSS 样式
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', actualThemeMode);
    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, [actualThemeMode]);

  // 设置主题模式
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  // 切换主题（保留兼容性，在 light 和 dark 之间切换）
  const toggleTheme = () => {
    const currentActual = themeMode === 'system' ? actualThemeMode : themeMode;
    const newTheme: ThemeMode = currentActual === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
  };

  // 根据实际主题模式生成Ant Design主题配置
  const themeConfig: ThemeConfig = {
    token: {
      colorPrimary: '#6c34e6',
    },
    algorithm: actualThemeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
  };

  return (
    <ThemeContext.Provider value={{ themeMode, actualThemeMode, setThemeMode, toggleTheme, themeConfig }}>
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
