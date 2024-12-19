import { listDatasource, ListDatasourceRequest } from '@/api/datasource'
import { dictSelectList, ListDictRequest } from '@/api/dict'
import { DictType } from '@/api/enum'
import { listAlarmGroup, ListAlarmGroupRequest } from '@/api/notify/alarm-group'
import { listTimeEngineRule, ListTimeEngineRuleRequest } from '@/api/notify/rule'
import { listStrategyGroup, ListStrategyGroupRequest } from '@/api/strategy'
import { useRequest } from 'ahooks'

/**
 * 获取数据源列表
 * @param params
 * @returns { datasourceList: Datasource[], error, datasourceListLoading: boolean }
 */
export const useDatasourceList = (params: ListDatasourceRequest) => {
  const { data, loading, error } = useRequest(listDatasource, {
    defaultParams: [params]
  })
  return { datasourceList: data?.list || [], error, page: data?.pagination, datasourceListLoading: loading }
}

/**
 * 获取策略组列表
 * @param params
 * @returns { strategyGroupList: StrategyGroup[], error, page: PaginationReply, strategyGroupListLoading: boolean }
 */
export const useStrategyGroupList = (params: ListStrategyGroupRequest) => {
  const { data, loading, error } = useRequest(listStrategyGroup, {
    defaultParams: [params]
  })
  return { strategyGroupList: data?.list || [], error, page: data?.pagination, strategyGroupListLoading: loading }
}

/**
 * 获取策略分类列表
 * @param params
 * @returns { strategyCategoryList: DictItem[], error, strategyCategoryListLoading: boolean }
 */
export const useStrategyCategoryList = (params: ListDictRequest) => {
  const { data, loading, error } = useRequest(dictSelectList, {
    defaultParams: [{ ...params, dictType: DictType.DictTypeStrategyCategory }]
  })
  return { strategyCategoryList: data?.list || [], error, strategyCategoryListLoading: loading }
}

/**
 * 获取告警组列表
 * @param params
 * @returns { alarmGroupList: AlarmGroup[], error, alarmGroupListLoading: boolean }
 */
export const useAlarmNoticeGroupList = (params: ListAlarmGroupRequest) => {
  const { data, loading, error } = useRequest(listAlarmGroup, {
    defaultParams: [params]
  })
  return { alarmGroupList: data?.list || [], error, alarmGroupListLoading: loading }
}

/**
 * 获取告警页面列表
 * @param params
 * @returns { alarmPageList: AlarmPage[], error, alarmPageListLoading: boolean }
 */
export const useAlarmPageList = (params: ListDictRequest) => {
  const { data, loading, error } = useRequest(dictSelectList, {
    defaultParams: [{ ...params, dictType: DictType.DictTypeAlarmPage }]
  })
  return { alarmPageList: data?.list || [], error, alarmPageListLoading: loading }
}

/**
 * 获取告警等级列表
 * @param params
 * @returns { alarmLevelList: DictItem[], error, alarmLevelListLoading: boolean }
 */
export const useAlarmLevelList = (params: ListDictRequest) => {
  const { data, loading, error } = useRequest(dictSelectList, {
    defaultParams: [{ ...params, dictType: DictType.DictTypeAlarmLevel }]
  })
  return { alarmLevelList: data?.list || [], error, alarmLevelListLoading: loading }
}

/**
 * 获取时间引擎规则列表
 * @param params
 * @returns { timeEngineRuleList: TimeEngineRule[], error, timeEngineRuleListLoading: boolean }
 */
export const useTimeEngineRuleList = (params: ListTimeEngineRuleRequest) => {
  const { data, loading, error } = useRequest(listTimeEngineRule, {
    defaultParams: [params]
  })
  return { timeEngineRuleList: data?.list || [], error, timeEngineRuleListLoading: loading }
}
