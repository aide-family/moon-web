import { useContext } from 'react'
import {
  NamespaceContext,
  type NamespaceContextType,
} from './namespaceContextState'

export function useNamespace(): NamespaceContextType {
  const context = useContext(NamespaceContext)
  if (context === undefined) {
    throw new Error('useNamespace must be used within a NamespaceProvider')
  }
  return context
}
