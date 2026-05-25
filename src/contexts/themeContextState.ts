import { createContext } from 'react'
import type { ThemeConfig } from 'antd'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ActualThemeMode = 'light' | 'dark'

export interface ThemeContextType {
  themeMode: ThemeMode
  actualThemeMode: ActualThemeMode
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
  themeConfig: ThemeConfig
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
)
