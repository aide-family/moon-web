import { createContext } from 'react'
import type { NamespaceItemSelect } from '@/api/account/namespace/index'

export interface NamespaceContextType {
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

export const NamespaceContext = createContext<NamespaceContextType | undefined>(
  undefined,
)
