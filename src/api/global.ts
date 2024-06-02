import { BadgeProps } from 'antd'

export interface Pagination {
  pageNum: number
  pageSize: number
}

export enum Status {
  ALL = 0,
  ENABLE = 1,
  DISABLE = 2,
}

export const StatusData: Record<Status, BadgeProps> = {
  [Status.ALL]: {
    color: 'blue',
    text: '全部',
  },
  [Status.ENABLE]: {
    color: 'green',
    text: '启用',
  },
  [Status.DISABLE]: {
    color: 'red',
    text: '禁用',
  },
}

export enum Gender {
  ALL = 0,
  MALE = 1,
  FEMALE = 2,
}

export const GenderData: Record<Gender, string> = {
  [Gender.ALL]: '全部',
  [Gender.MALE]: '男',
  [Gender.FEMALE]: '女',
}

export enum SystemRole {
  // 全部 / 未知
  ROLE_ALL = 0,
  // 管理员
  ROLE_SUPPER_ADMIN = 1,
  // 普通管理员
  ROLE_ADMIN = 2,
  // 普通用户
  ROLE_USER = 3,
}

export const SystemRoleData: Record<SystemRole, string> = {
  [SystemRole.ROLE_ALL]: '全部',
  [SystemRole.ROLE_SUPPER_ADMIN]: '超级管理员',
  [SystemRole.ROLE_ADMIN]: '管理员',
  [SystemRole.ROLE_USER]: '普通用户',
}
