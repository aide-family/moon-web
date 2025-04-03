import type {
  AlarmSendType,
  AlertStatus,
  Condition,
  DatasourceType,
  DictType,
  DomainType,
  EventDataType,
  Gender,
  HTTPMethod,
  HookApp,
  MQCondition,
  MenuType,
  MetricType,
  ModuleType,
  NotifyType,
  Role,
  Status,
  StatusCodeCondition,
  StorageType,
  StrategyType,
  SustainType,
  TemplateSourceType,
  TimeEngineRuleType
} from './enum'

/** 下拉选择扩展数据 */
export interface SelectExtend {
  /** 图标 */
  icon: string
  /** 颜色 */
  color: string
  /** 描述 */
  remark: string
  /** 图片URL */
  image: string
}

/** 下拉选择基础数据 */
export interface SelectItem {
  /** 数据值 */
  value: number
  /** 数据label */
  label: string
  /** 子级数据, 针对级联选择 */
  children?: SelectItem[]
  /** 是否禁用 */
  disabled: boolean
  /** 针对有图标类型的配置项(可选，默认为null) */
  extend?: SelectExtend
}

/** 用户模块 */
export interface UserItem {
  /** 用户id */
  id: number
  /** 用户名 */
  name: string
  /** 昵称 */
  nickname: string
  /** 邮箱 */
  email: string
  /** 手机 */
  phone: string
  /** 状态 */
  status: Status
  /** 性别 */
  gender: Gender
  /** 角色 */
  role: Role
  /** 头像 */
  avatar: string
  /** 个人说明 */
  remark: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/** 系统API资源模块 */
export interface ResourceItem {
  /** 接口ID */
  id: number
  /** 接口名称 */
  name: string
  /** 接口路径 */
  path: string
  /** 接口状态 */
  status: Status
  /** 备注 */
  remark: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 所属模块 */
  module: ModuleType
  /** 所属领域 */
  domain: DomainType
}

/** 系统菜单模块 */
export interface MenuItem {
  /** 菜单ID */
  id: number
  /** 菜单名称 */
  label: string
  /** 菜单路径 */
  key: string
  /** 菜单图标 */
  icon: string
  /** 菜单状态 */
  status: Status
  /** 父级菜单 */
  parentId: number
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 菜单层级 */
  level: number
  /** 菜单类型 */
  menuType: MenuType
  /** 组件路径 */
  component: string
  /** 权限 */
  permission: string
  /** 排序 */
  sort: number
  /** 英文名称 */
  enName: string
}

/** 系统菜单树 */
export interface MenuTree extends MenuItem {
  /** 菜单子级数据 */
  children?: MenuTree[]
}

/** 团队成员 */
export interface TeamMemberItem {
  /** 用户ID */
  userId: number
  /** 成员ID */
  id: number
  /** 角色 */
  role: Role
  /** 状态 */
  status: Status
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 用户明细 */
  user: UserItem
}

/** 团队模块 */
export interface TeamItem {
  /** 团队ID */
  id: number
  /** 团队名称 */
  name: string
  /** 团队状态 */
  status: Status
  /** 团队描述 */
  remark: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 负责人 */
  leader?: UserItem
  /** 创建者 */
  creator?: UserItem
  /** 团队LOGO */
  logo: string
  /** 管理员（不包含创建者，因为创建者不一定是管理员，但是包含负责人） */
  admins?: TeamMemberItem[]
}

/** 团队角色模块 */
export interface TeamRole {
  /** 角色ID */
  id: number
  /** 角色名称 */
  name: string
  /** 角色描述 */
  remark: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 状态 */
  status: Status
  /** 资源列表 */
  resources: ResourceItem[]
}

/** 数据源模块 */
export interface DatasourceItem {
  /** 数据源ID */
  id: number
  /** 数据源名称 */
  name: string
  /** 数据源类型 */
  datasourceType: DatasourceType
  /** 数据源地址 */
  endpoint: string
  /** 状态 */
  status: Status
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 配置信息 */
  config: string
  /** 描述 */
  remark: string
  /** 存储器类型 */
  storageType: StorageType
  /** 创建者 */
  creator?: UserItem
}

/** 查询到的数据详情，用于元数据构建 */
export interface MetricItem {
  /** 指标名称 */
  name: string
  /** 帮助信息 */
  help: string
  /** 类型 */
  type: MetricType
  /** 标签集合 */
  labels: MetricLabelItem[]
  /** 指标单位 */
  unit: string
  /** ID */
  id: number
}

/** 指标数据标签 */
export interface MetricLabelItem {
  /** 标签名称 */
  name: string
  /** 标签值 */
  values: string[]
  /** ID */
  id: number
}

/** 字典项 */
export interface DictItem {
  /** ID */
  id: number
  /** 字典名称 */
  name: string
  /** 字典类型 */
  dictType: DictType
  /** 颜色类型 */
  colorType: string
  /** CSS样式 */
  cssClass: string
  /** 字典值 */
  value: string
  /** 图标 */
  icon: string
  /** 图片URL */
  imageUrl: string
  /** 状态 */
  status: Status
  /** 语言 */
  languageCode: string
  /** 字典备注 */
  remark: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/** 策略等级项 */
export interface StrategyMetricLevelItem {
  /** 策略持续时间 */
  duration: number
  /** 持续次数 */
  count: number
  /** 持续的类型 */
  sustainType: SustainType
  /** 告警等级明细 */
  level: SelectItem
  /** 告警页面 */
  alarmPages: SelectItem[]
  /** 阈值 */
  threshold: number
  /** 所属策略 */
  strategyId: number
  /** 条件 */
  condition: Condition
  /** 告警分组 */
  alarmGroups: AlarmNoticeGroupItem[]
  /** label匹配的告警通知组 */
  labelNotices: LabelNoticeItem[]
}

/** 事件策略等级项 */
export interface StrategyEventLevelItem {
  /** 事件策略值 */
  threshold: string
  /** 事件策略条件 */
  condition: MQCondition
  /** 事件策略数据类型 */
  dataType: EventDataType
  /** 事件策略告警等级 */
  level: SelectItem
  /** 事件策略告警页面 */
  alarmPages: SelectItem[]
  /** 事件策略所属策略 */
  strategyId: number
  /** 事件策略告警分组 */
  alarmGroups: AlarmNoticeGroupItem[]
  /** 事件策略创建人 */
  creator: UserItem
  /** 对象状态下的数据KEY */
  pathKey: string
  /** labelNotices  */
  labelNotices: LabelNoticeItem[]
}

/** 域名策略等级项 */
export interface StrategyDomainLevelItem {
  /** 告警等级明细 */
  level: SelectItem
  /** 告警页面 */
  alarmPages: SelectItem[]
  /** 告警组 */
  alarmGroups: AlarmNoticeGroupItem[]
  /** 策略Labels */
  labelNotices: LabelNoticeItem[]
  /** 阈值 */
  threshold: number
  /** 判断条件 */
  condition: Condition
}

/** 端口策略等级项 */
export interface StrategyPortLevelItem {
  /** 告警等级明细 */
  level: SelectItem
  /** 告警页面 */
  alarmPages: SelectItem[]
  /** 告警组 */
  alarmGroups: AlarmNoticeGroupItem[]
  /** 策略Labels */
  labelNotices: LabelNoticeItem[]
  /** 阈值 */
  threshold: number
  /** 端口 */
  port: number
}

/** 日志策略等级项 */
export interface StrategyLogLevelItem {
  /** 告警等级明细 */
  level: SelectItem
  /** 告警页面 */
  alarmPages: SelectItem[]
  /** 告警组 */
  alarmGroups: AlarmNoticeGroupItem[]
  /** 策略Labels */
  labelNotices: LabelNoticeItem[]
  /** 日志总数 */
  count: number
}

/** http策略等级项 */
export interface StrategyHTTPLevelItem {
  /** 告警等级明细 */
  level: SelectItem
  /** 告警页面 */
  alarmPages: SelectItem[]
  /** 告警组 */
  alarmGroups: AlarmNoticeGroupItem[]
  /** 策略Labels */
  labelNotices: LabelNoticeItem[]
  /** 状态码 */
  statusCode: number
  /** 响应时间 */
  responseTime: number
  /** 请求头 */
  headers: { [key: string]: string }
  /** 请求体 */
  body: string
  /** 查询参数 */
  queryParams: string
  /** 请求方式 */
  method: HTTPMethod
  /** 状态码判断条件 */
  statusCodeCondition: StatusCodeCondition
  /** 响应时间判断条件 */
  responseTimeCondition: Condition
}

/** 策略项 */
export interface StrategyItem {
  /** 策略名称 */
  name: string
  /** 策略语句 */
  expr: string
  /** 根据策略等级配置的详细策略， key为策略等级ID */
  metricLevels: StrategyMetricLevelItem[]
  /** 事件策略 */
  eventLevels: StrategyEventLevelItem[]
  /** 域名策略 */
  domainLevels: StrategyDomainLevelItem[]
  /** 端口策略 */
  portLevels: StrategyPortLevelItem[]
  /** http策略 */
  httpLevels: StrategyHTTPLevelItem[]
  /** log策略 */
  logLevels: StrategyLogLevelItem[]
  /** 策略标签 */
  labels: { [key: string]: string }
  /** 策略注解 */
  annotations: { [key: string]: string }
  /** 数据源 */
  datasource: DatasourceItem[]
  /** 策略ID */
  id: number
  /** 策略状态 */
  status: Status
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 策略说明信息 */
  remark: string
  /** 所属策略组 */
  groupId: number
  /** 策略组信息 */
  group: StrategyGroupItem
  /** 模板id */
  templateId: number
  /** 模板来源 */
  templateSource: TemplateSourceType
  /** 策略类型 */
  categories: DictItem[]
  /** 告警分组 */
  alarmNoticeGroups: AlarmNoticeGroupItem[]
  /** 策略类型 */
  strategyType: StrategyType
  /** 模板来源 */
  sourceType: TemplateSourceType
}

/** 策略组项 */
export interface StrategyGroupItem {
  /** 策略组ID */
  id: number
  /** 策略组名称 */
  name: string
  /** 策略组状态 */
  status: Status
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 策略组说明信息 */
  remark: string
  /** 策略组创建人 */
  creator: UserItem
  /** 创建者ID */
  creatorId: number
  /** 策略列表 */
  strategies: StrategyItem[]
  /** 策略总数 */
  strategyCount: number
  /** 策略开启总数 */
  enableStrategyCount: number
  /** 分组类型 */
  categories: DictItem[]
}

/** 策略等级模板项 */
export interface StrategyLevelTemplateItem {
  /** ID */
  id: number
  /** 持续时间 */
  duration: string
  /** 持续次数 */
  count: number
  /** 持续类型 */
  sustainType: SustainType
  /** 状态 */
  status: Status
  /** 告警等级ID */
  levelId: number
  /** 告警等级 */
  level: SelectItem
  /** 阈值 */
  threshold: number
  /** 条件 */
  condition: Condition
  /** 所属策略 */
  strategyId: number
}

/** 策略模板项 */
export interface StrategyTemplateItem {
  /** 策略模板ID */
  id: number
  /** 策略模板名称 */
  alert: string
  /** 策略语句 */
  expr: string
  /** 根据策略等级配置的详细策略 */
  levels: StrategyLevelTemplateItem[]
  /** 策略标签 */
  labels: { [key: string]: string }
  /** 策略注解 */
  annotations: { [key: string]: string }
  /** 策略模板状态 */
  status: Status
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 策略模板说明信息 */
  remark: string
  /** 创建人 */
  creator: UserItem
  /** 模板类型 */
  categories: SelectItem[]
}

/** 策略告警等级 */
export interface StrategyAlarmLevel {
  /** ID */
  id: number
  /** 告警等级名称 */
  name: string
  /** 告警等级颜色 */
  color: string
  /** 状态 */
  status: Status
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 等级 */
  level: number
}

/** 仪表板项 */
export interface DashboardItem {
  /** 仪表板ID */
  id: number
  /** 仪表板名称 */
  title: string
  /** 仪表板说明 */
  remark: string
  /** 仪表板创建时间, unix时间戳 */
  createdAt: string
  /** 仪表板更新时间, unix时间戳 */
  updatedAt: string
  /** 仪表板颜色 */
  color: string
  /** 图表列表 */
  charts: ChartItem[]
  /** 仪表板状态 */
  status: Status
  /** 关联策略组 */
  groups: StrategyGroupItem[]
}

/** 图表项 */
export interface ChartItem {
  /** 图表ID */
  id: number
  /** 图表标题 */
  title: string
  /** 图表说明 */
  remark: string
  /** 图表url */
  url: string
  /** 图表状态 */
  status: Status
  /** 宽度 */
  width: string
  /** 高度 */
  height: string
}

export interface ServerItem {
  version: string
  server: {
    name: string
    httpEndpoint: string
    grpcEndpoint: string
    network: string
    startTime: string
    upTime: string
  }
}

export interface RealtimeAlarmItem {
  id: number
  startsAt: string
  endsAt: string
  status: AlertStatus
  metricLevel?: StrategyMetricLevelItem
  portLevel?: StrategyPortLevelItem
  domainLevel?: StrategyDomainLevelItem
  httpLevel?: StrategyHTTPLevelItem
  eventLevel?: StrategyEventLevelItem
  logLevel?: StrategyLogLevelItem
  strategy: StrategyItem
  summary: string
  description: string
  expr: string
  datasource: DatasourceItem
  fingerprint: string
  duration: string
  rawInfo: string
}
/** 我的告警页面明细 */
export interface SelfAlarmPageItem {
  /** ID */
  id: number
  /** 告警页面名称 */
  name: string
  /** 颜色类型 */
  colorType: string
  /** CSS样式 */
  cssClass: string
  /** 告警页面值 */
  value: string
  /** 图标 */
  icon: string
  /** 图片URL */
  imageUrl: string
  /** 语言 */
  languageCode: string
  /** 告警页面备注 */
  remark: string
}

/** 告警通知组项 */
export interface AlarmNoticeGroupItem {
  /** 告警组ID */
  id: number
  /** 告警组名称 */
  name: string
  /** 告警组状态 */
  status: Status
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 告警组说明信息 */
  remark: string
  /** 告警组创建人 */
  creator: string
  /** 创建者ID */
  creatorId: number
  /** 通知人列表 */
  noticeUsers: NoticeItem[]
  /** hooks */
  hooks: AlarmHookItem[]
  /** 时间引擎 */
  timeEngines: TimeEngineItem[]
  /** 模板 */
  templates: SendTemplateItem[]
}

/** 通知人 */
export interface NoticeItem {
  /** 用户明细 */
  member: TeamMemberItem
  /** 通知类型 */
  notifyType: number
}

/** 策略标签 */
export interface LabelNoticeItem {
  /** 标签名 */
  name: string
  /** 标签值 */
  value: string
  /** 告警组 */
  alarmGroups: AlarmNoticeGroupItem[]
}

/** 策略订阅项 */
export interface StrategySubscriberItem {
  /** 订阅ID */
  id: number
  /** 用户明细 */
  user: UserItem
  /** 通知类型 */
  notifyType: NotifyType
}

/** hook 项 */
export interface AlarmHookItem {
  /** hookID */
  id: number
  /** hook名称 */
  name: string
  /** hook状态 */
  status: Status
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** hook说明信息 */
  remark: string
  /** hook创建人 */
  creator: UserItem
  /** hook应用类型 */
  hookApp: HookApp
  /** secret */
  secret: string
  /** url */
  url: string
}

/**
 * 指标标签值列表
 */
export interface MetricLabelValues {
  values: string[]
}

/**
 * 查询到的数据详情，用于元数据构建
 */
export interface MetricDetail {
  /**
   * 指标名称
   */
  name: string
  /**
   * 帮助信息
   */
  help?: string
  /**
   * 类型
   */
  type: MetricType
  /**
   * 标签集合
   */
  labels: { [key: string]: MetricLabelValues }
  /**
   * 指标单位
   */
  unit?: string
}

/**
 * Metric类型数据查询结果
 */
export interface MetricQueryResult {
  /**
   * 标签集合
   */
  labels: { [key: string]: string }
  /**
   * 结果类型
   */
  resultType: string
  /**
   * 结果值（图表）
   */
  values?: MetricQueryValue[]
  /**
   * 结果值（单数据）
   */
  value?: MetricQueryValue
}

/**
 * 查询到的数据值
 */
export interface MetricQueryValue {
  /**
   * 值
   */
  value: number
  /**
   * 时间戳
   */
  timestamp: number
}

/**
 * 主题
 */
export interface TopicItem {
  /**
   * 主题名称
   */
  name: string
  /**
   * 主题ID
   */
  id: number
  /**
   * 创建时间
   */
  createdAt: string
  /**
   * 更新时间
   */
  updatedAt: string
  /**
   * 主题备注
   */
  remark: string
  /**
   * 配置
   */
  config: { [key: string]: string }
}

/**
 * 时间引擎规则项
 */
export interface TimeEngineRuleItem {
  /** ID */
  id: number
  /** 名称 */
  name: string
  /** 类型 */
  category: TimeEngineRuleType
  /** 规则 */
  rules: number[]
  /** 状态 */
  status: Status
  /** 备注 */
  remark: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 创建者 */
  creator: UserItem
}

/**
 * 时间引擎
 */
export interface TimeEngineItem {
  /** ID */
  id: number
  /** 名称 */
  name: string
  /** 类型 */
  category: TimeEngineRuleType
  /** 规则 */
  rules: TimeEngineRuleItem[]
  /** 状态 */
  status: Status
  /** 备注 */
  remark: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 创建者 */
  creator: UserItem
}

/**
 * 邮箱配置
 */
export interface EmailConfigItem {
  /** 邮箱用户名 */
  user: string
  /** 邮箱密码 */
  pass: string
  /** 邮箱服务器 */
  host: string
  /** 邮箱端口 */
  port: string
}

/**
 * 对称加密配置
 */
export interface SymmetricEncryptionConfigItem {
  /** 密钥 */
  key: string
  /** 初始化向量 */
  iv: string
}

/**
 * 非对称加密配置
 */
export interface AsymmetricEncryptionConfigItem {
  /** 公钥 */
  publicKey: string
  /** 私钥 */
  privateKey: string
}

/**
 * 团队配置
 */
export interface TeamConfigItem {
  /** 邮箱配置 */
  emailConfig: EmailConfigItem
  /** 对称加密配置 */
  symmetricEncryptionConfig: SymmetricEncryptionConfigItem
  /** 非对称加密配置 */
  asymmetricEncryptionConfig: AsymmetricEncryptionConfigItem
}

/**
 * 告警通知模板
 */
export interface SendTemplateItem {
  /** 模板ID */
  id: number
  /** 模板名称 */
  name: string
  /** 模板内容 */
  content: string
  /** 模板发送类型 */
  sendType: AlarmSendType
  /** 模板状态 */
  status: Status
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 创建人 */
  creator: UserItem
  /** 备注 */
  remark: string
}

/**
 * 订阅策略
 */
export interface StrategySubscribeItem {
  /** 通知类型 */
  notifyType: NotifyType
  /** 策略 */
  strategy: StrategyItem
}
