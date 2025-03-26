/** 枚举类型 */
export enum Status {
  /** 全部 */
  StatusAll = 0,

  /** 启用 */
  StatusEnable = 1,

  /** 禁用 */
  StatusDisable = 2
}

/** 性别 */
export enum Gender {
  /** 全部 */
  GenderAll = 0,

  /** 男 */
  GenderMale = 1,

  /** 女 */
  GenderFemale = 2
}

/** 系统全局默认角色，区别于空间下自定义角色类型 */
export enum Role {
  /** 全部 / 未知 */
  RoleAll = 0,

  /** 管理员 */
  RoleSupperAdmin = 1,

  /** 普通管理员 */
  RoleAdmin = 2,

  /** 普通用户 */
  RoleUser = 3
}

/** 数据来源 */
export enum DataSource {
  /** 全部 */
  DataSourceAll = 0,

  /** 本地 */
  DataSourceLocal = 1,

  /** 远程 */
  DataSourceRemote = 2
}

/** 验证码类型 */
export enum CaptchaType {
  /** 图片验证码 */
  CaptchaTypeImage = 0,

  /** 音频验证码 */
  CaptchaTypeAudio = 1
}

/** 领域类型枚举 */
export enum DomainType {
  /** 未知领域类型 */
  DomainTypeUnknown = 0,

  /** 系统领域 */
  DomainTypeSystem = 1,

  /** 监控领域 */
  DomainTypeMonitor = 2
}

/** 模块类型枚举 */
export enum ModuleType {
  /** 未知模块类型 */
  ModuleTypeUnknown = 0,

  /** 接口模块 */
  ModelTypeApi = 1,

  /** 菜单模块 */
  ModelTypeMenu = 2,

  /** 角色模块 */
  ModelTypeRole = 3,

  /** 用户模块 */
  ModelTypeUser = 4,

  /** 字典模块 */
  ModelTypeDict = 5,

  /** 配置模块 */
  ModelTypeConfig = 6,

  /** 日志模块 */
  ModelTypeLog = 7,

  /** 任务模块 */
  ModelTypeJob = 8,

  /** 通知模块 */
  ModelTypeNotify = 9,

  /** 系统模块 */
  ModelTypeSystem = 10,

  /** 监控模块 */
  ModelTypeMonitor = 11
}

/** 数据源类型 */
export enum DatasourceType {
  /** 未知数据源类型 */
  DatasourceTypeUnknown = 0,

  /** Metric */
  DatasourceTypeMetric = 1,

  /** Trace */
  DatasourceTypeTrace = 2,

  /** Log */
  DatasourceTypeLog = 3,

  /** Event */
  DatasourceTypeEvent = 4
}

/** 存储器类型 prometheus、victoriametrics等 */
export enum StorageType {
  /** 未知存储器类型 */
  StorageTypeUnknown = 0,

  /** Prometheus */
  StorageTypePrometheus = 1,

  /** VictoriaMetrics */
  StorageTypeVictoriaMetrics = 2,

  /** StorageTypeElasticsearch */
  StorageTypeElasticsearch = 3,

  /** StorageTypeLoki */
  StorageTypeLoki = 4,

  /** StorageAliYunSLS */
  StorageAliYunSLS = 5,

  /** Kafka */
  StorageTypeKafka = 10,

  /** Rocketmq */
  StorageTypeRocketmq = 11,

  /** Rabbitmq */
  StorageTypeRabbitmq = 12,

  /** Mqtt */
  StorageTypeMQTT = 13
}

/** 指标类型 */
export enum MetricType {
  /** 未知指标类型 */
  MetricTypeUnknown = 0,

  /** Counter */
  MetricTypeCounter = 1,

  /** Gauge */
  MetricTypeGauge = 2,

  /** Histogram */
  MetricTypeHistogram = 3,

  /** Summary */
  MetricTypeSummary = 4
}

/** 持续类型 */
export enum SustainType {
  /** 未知持续类型 */
  SustainTypeUnknown = 0,

  /** m时间内出现n次 */
  SustainTypeFor = 1,

  /** m时间内最多出现n次 */
  SustainTypeMax = 2,

  /** m时间内最少出现n次 */
  SustainTypeMin = 3
}

/** 多数据源持续类型 */
export enum MultiDatasourceSustainType {
  /** 未知持续类型 */
  MultiDatasourceSustainTypeUnknown = 0,

  /** 同时满足 所有数据告警集合一致 */
  MultiDatasourceSustainTypeAnd = 1,

  /** 其中一个满足 数据告警集合其中一个完全满足 */
  MultiDatasourceSustainTypeOr = 2,

  /** 共同满足 所有数据告警集合合并起来后满足 */
  MultiDatasourceSustainTypeAndOr = 3
}

/** 分类, 区分字典中的各个模块数据 */
export enum DictType {
  /** 未知, 用于默认值 */
  DictTypeUnknown = 0,

  /** DictTypeStrategyCategory 策略类目 */
  DictTypeStrategyCategory = 1,

  /** DictTypeStrategyGroupCategory 策略组类目 */
  DictTypeStrategyGroupCategory = 2,

  /** DictTypeAlarmLevel 告警级别 */
  DictTypeAlarmLevel = 3,

  /** DictTypeAlarmPage 告警页面 */
  DictTypeAlarmPage = 4
}

/** 菜单类型 */
export enum MenuType {
  /** 未知 */
  MenuTypeUnknown = 0,

  /** 菜单 */
  MenuTypeMenu = 1,

  /** 按钮 */
  MenuTypeButton = 2,

  /** 文件夹 */
  MenuTypeDir = 3
}

/** 判断条件 */
export enum Condition {
  /** 未知 */
  ConditionUnknown = 0,

  /** 等于 */
  ConditionEQ = 1,

  /** 不等于 */
  ConditionNE = 2,

  /** 大于 */
  ConditionGT = 3,

  /** 大于等于 */
  ConditionGTE = 4,

  /** 小于 */
  ConditionLT = 5,

  /** 小于等于 */
  ConditionLTE = 6
}

/** 模板来源类型 */
export enum TemplateSourceType {
  /** 未知 */
  TemplateSourceTypeUnknown = 0,

  /** 系统 */
  TemplateSourceTypeSystem = 1,

  /** 团队 */
  TemplateSourceTypeTeam = 2
}

/** 告警状态 */
export enum AlertStatus {
  /** UNKNOWN 未知 */
  ALERT_STATUS_UNKNOWN = 0,

  /** 告警中 */
  ALERT_STATUS_FIRING = 1,

  /** 告警已恢复 */
  ALERT_STATUS_RESOLVED = 2,

  /** 告警已静音 */
  ALERT_STATUS_Silenced = 3
}

/** 通知类型 */
export enum NotifyType {
  /** UNKNOWN 未知 */
  NOTIFY_UNKNOWN = 0,

  /** 手机 */
  NOTIFY_PHONE = 1,

  /** 短信 */
  NOTIFY_SMS = 2,

  /** 邮箱 */
  NOTIFY_EMAIL = 4
}

/** 应用挂钩类型 */
export enum HookApp {
  /** UNKNOWN 未知 */
  HOOK_APP_UNKNOWN = 0,

  /** 自定义 */
  HOOK_APP_WEB_HOOK = 1,

  /** 钉钉 */
  HOOK_APP_DING_TALK = 2,

  /** 企业微信 */
  HOOK_APP_WE_CHAT = 3,

  /** 飞书 */
  HOOK_APP_FEI_SHU = 4
}

/** 告警通知模板类型 */
export enum AlarmSendType {
  /** 未知 */
  StrategyTypeUnknown = 0,

  /** 邮件 */
  AlarmSendTypeEmail = 1,

  /** 短信 */
  AlarmSendTypeSMS = 2,

  /** 钉钉 */
  AlarmSendTypeDingTalk = 3,

  /** 飞书 */
  AlarmSendTypeFeiShu = 4,

  /** 企业微信 */
  AlarmSendTypeWeChat = 5,

  /** 自定义 */
  AlarmSendTypeCustom = 6
}

/** 策略类型 */
export enum StrategyType {
  /** 未知 */
  StrategyTypeUnknown = 0,

  /** Metric */
  StrategyTypeMetric = 1,

  /** DomainCertificate */
  StrategyTypeDomainCertificate = 2,

  /** DomainPort */
  StrategyTypeDomainPort = 3,

  /** Ping */
  StrategyTypePing = 4,

  /** HTTP */
  StrategyTypeHTTP = 5,

  /** Event */
  StrategyTypeEvent = 6,

  /** Log */
  StrategyTypeLog = 7
}

// MQ判断条件
export enum MQCondition {
  /** 未知 */
  MQConditionUnknown = 0,

  /** 等于 */
  MQConditionEQ = 1,

  /** 不等于 */
  MQConditionNE = 2,

  /** 大于等于 */
  MQConditionGTE = 4,

  /** 小于 */
  MQConditionLT = 5,

  /** 小于等于 */
  MQConditionLTE = 6,

  /** 包含 */
  MQConditionContain = 7,

  /** 前缀 */
  MQConditionPrefix = 8,

  /** 后缀 */
  MQConditionSuffix = 9,

  /** 正则 */
  MQConditionRegular = 10
}

/** MQ数据类型 */
export enum EventDataType {
  /** 未知 */
  EventDataTypeUnknown = 0,

  /** string */
  EventDataTypeString = 1,

  /** number */
  EventDataTypeNumber = 2,

  /** object */
  EventDataTypeObject = 3
}

/** HTTP请求方式 */
export enum HTTPMethod {
  /** 未知 */
  HTTPMethodUnknown = '',

  /** GET */
  HTTPMethodGET = 'GET',

  /** POST */
  HTTPMethodPOST = 'POST',

  /** PUT */
  HTTPMethodPUT = 'PUT',

  /** DELETE */
  HTTPMethodDELETE = 'DELETE',

  /** PATCH */
  HTTPMethodPATCH = 'PATCH',

  /** HEAD */
  HTTPMethodHEAD = 'HEAD',

  /** OPTIONS */
  HTTPMethodOPTIONS = 'OPTIONS'
}

/** 状态码判断条件 */
export enum StatusCodeCondition {
  /** 未知 */
  StatusCodeConditionUnknown = 0,

  /** 等于 */
  StatusCodeConditionEQ = 1,

  /** 不等于 */
  StatusCodeConditionNE = 2
}

/** 时间引擎规则类型 */
export enum TimeEngineRuleType {
  /** 未知 */
  TimeEngineRuleTypeUnknown = 0,

  /** 小时范围 */
  TimeEngineRuleTypeHourRange = 1,

  /** 星期 */
  TimeEngineRuleTypeDaysOfWeek = 2,

  /** 日期 */
  TimeEngineRuleTypeDaysOfMonth = 3,

  /** 月份 */
  TimeEngineRuleTypeMonths = 4
}

/** 告警介入动作 */
export enum AlarmInterventionAction {
  /** 介入 */
  Mark = 1,

  /** 删除 */
  Delete = 2,

  /** 抑制 */
  Silence = 3,

  /** 升级 */
  Upgrade = 4
}

export enum LogModuleType {
  /* 字典 */
  DICT = 0
}
export enum LogActionType {
  /* 新增 */
  ADD = 0,
  /* 修改 */
  MODIFY = 1,
  /* 删除 */
  DELETE = 2,
  /* 修改状态 */
  MODIFY_STATUS = 3
}
