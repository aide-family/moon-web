import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { getSelfNamespaces } from '@/api/account/namespace/index'
import { GlobalStatus } from '@/api/common/types'
import type { NamespaceItemSelect } from '@/api/account/namespace/index'

interface NamespaceContextType {
  /** 命名空间下拉选项列表 */
  namespaceOptions: NamespaceItemSelect[]
  /** 是否正在加载 */
  loading: boolean
  /** 当前选中的命名空间（与 localStorage 同步，新建后设为此值头部会立即更新） */
  currentNamespace: string
  /** 设置当前命名空间（会写入 localStorage） */
  setCurrentNamespace: (uid: string) => void
  /** 刷新列表（创建/编辑/删除命名空间后调用，头部下拉会同步更新） */
  refreshNamespaceList: () => Promise<void>
}

const NamespaceContext = createContext<NamespaceContextType | undefined>(undefined)

interface NamespaceProviderProps {
  children: ReactNode
}

/** 微服务环境下使用：不请求接口，仅提供空列表与 no-op 刷新，避免子组件 useNamespace 报错 */
export const NoopNamespaceProvider: React.FC<NamespaceProviderProps> = ({ children }) => {
  const value: NamespaceContextType = {
    namespaceOptions: [],
    loading: false,
    currentNamespace: '',
    setCurrentNamespace: () => {},
    refreshNamespaceList: async () => {},
  }
  return (
    <NamespaceContext.Provider value={value}>
      {children}
    </NamespaceContext.Provider>
  )
}

export const NamespaceProvider: React.FC<NamespaceProviderProps> = ({ children }) => {
  const [namespaceOptions, setNamespaceOptions] = useState<NamespaceItemSelect[]>([])
  // 初始为 true，避免刷新时首帧「空列表 + 未加载」被误判为「已加载且为空」导致误弹新建弹窗
  const [loading, setLoading] = useState(true)
  const hasFetchedRef = useRef(false)
  const [currentNamespace, setCurrentNamespaceState] = useState<string>(
    () => (typeof window !== 'undefined' ? localStorage.getItem('namespace') || '' : '')
  )

  const setCurrentNamespace = (uid: string) => {
    setCurrentNamespaceState(uid)
    if (typeof window !== 'undefined') {
      localStorage.setItem('namespace', uid)
    }
  }

  const refreshNamespaceList = async () => {
    setLoading(true)
    try {
      const response = await getSelfNamespaces()
      if (response?.namespaces?.length) {
        setNamespaceOptions(
          response.namespaces.map((ns) => ({
            value: ns.uid,
            label: ns.name ?? ns.uid,
            disabled: ns.status !== GlobalStatus.ENABLED,
            logo: ns.logo,
          }))
        )
      } else {
        setNamespaceOptions([])
      }
    } catch {
      setNamespaceOptions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    refreshNamespaceList()
  }, [])

  const value: NamespaceContextType = {
    namespaceOptions,
    loading,
    currentNamespace,
    setCurrentNamespace,
    refreshNamespaceList,
  }

  return (
    <NamespaceContext.Provider value={value}>
      {children}
    </NamespaceContext.Provider>
  )
}

export function useNamespace(): NamespaceContextType {
  const context = useContext(NamespaceContext)
  if (context === undefined) {
    throw new Error('useNamespace must be used within a NamespaceProvider')
  }
  return context
}
