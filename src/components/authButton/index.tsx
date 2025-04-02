import { GlobalContext, PermissionType } from '@/utils/context'
import React, { useContext } from 'react'

interface AuthButtonProps {
  requiredPermissions: PermissionType[]
  mode?: 'any' | 'all'
  children?: React.ReactNode
}

const AuthButton: React.FC<AuthButtonProps> = ({ requiredPermissions, mode = 'any', children, ...props }) => {
  const { authData } = useContext(GlobalContext)
  const permissions = authData?.permissions || []
  /**
   * 检查当前用户是否具有指定的权限
   * @param requiredPermissions - 需要检查的权限列表
   * @param mode - 检查模式，any 表示满足其中一个权限即可，all 表示满足所有权限
   * @returns {boolean} - 当前用户是否具有指定的权限
   */
  const hasPermission = (requiredPermissions: PermissionType[], mode: 'any' | 'all' = 'any'): boolean => {
    if (!requiredPermissions.length) return true
    return mode === 'any'
      ? requiredPermissions.some((perm) => permissions.includes(perm))
      : requiredPermissions.every((perm) => permissions.includes(perm))
  }

  const hasAccess = hasPermission(requiredPermissions, mode)

  return hasAccess ? <div {...props}>{children}</div> : null
}

export default AuthButton
