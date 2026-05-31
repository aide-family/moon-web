import type { DatasourceItem } from '@/api/marksman/datasource/types'
import type { DatasourceFilter } from '@/api/marksman/strategyMetric/types'
import { useLocale } from '@/contexts/LocaleContext'
import { Space, Tag, Typography } from 'antd'
import React, { useMemo } from 'react'
import {
  formatLabelRecord,
  isDatasourceFilterEmpty,
} from '../utils/datasourceFilter'

interface DatasourceFilterDisplayProps {
  filter?: DatasourceFilter
  /** 正选数据源详情（接口返回） */
  includeDatasources?: DatasourceItem[]
  /** 反选数据源详情（接口返回） */
  excludeDatasources?: DatasourceItem[]
}

function DatasourceUidTags({
  uids,
  datasources,
  nameMap,
  levelMap,
  color,
}: {
  uids: string[]
  datasources?: DatasourceItem[]
  nameMap?: Record<string, string>
  levelMap?: Record<string, string>
  color: 'success' | 'error'
}) {
  const dsMap = useMemo(() => {
    const map = new Map<string, DatasourceItem>()
    datasources?.forEach((ds) => {
      if (ds.uid) map.set(ds.uid, ds)
    })
    return map
  }, [datasources])

  return (
    <Space size={[8, 8]} wrap>
      {uids.map((uid) => {
        const ds = dsMap.get(uid)
        const name = ds?.name ?? nameMap?.[uid] ?? uid
        const levelName = ds?.level?.name ?? levelMap?.[uid]
        return (
          <Tag key={uid} color={color}>
            <Space size={4}>
              <span>{name}</span>
              {levelName ? (
                <Typography.Text
                  type='secondary'
                  className='text-xs'
                  style={ds?.level?.bgColor ? { color: ds.level.bgColor } : undefined}
                >
                  {levelName}
                </Typography.Text>
              ) : null}
            </Space>
          </Tag>
        )
      })}
    </Space>
  )
}

const DatasourceFilterDisplay: React.FC<DatasourceFilterDisplayProps> = ({
  filter,
  includeDatasources,
  excludeDatasources,
}) => {
  const { t } = useLocale()

  if (isDatasourceFilterEmpty(filter)) {
    return (
      <Typography.Text type='secondary'>
        {t('strategy.ruleDetail.datasourceFilter.all')}
      </Typography.Text>
    )
  }

  return (
    <div className='flex flex-col gap-3'>
      {!!filter?.datasourceUids?.length && (
        <div>
          <Typography.Text type='secondary' className='text-xs block mb-1'>
            {t('strategy.ruleDetail.datasourceFilter.includeUids')}
          </Typography.Text>
          <DatasourceUidTags
            uids={filter.datasourceUids}
            datasources={includeDatasources}
            color='success'
          />
        </div>
      )}
      {!!filter?.excludeDatasourceUids?.length && (
        <div>
          <Typography.Text type='secondary' className='text-xs block mb-1'>
            {t('strategy.ruleDetail.datasourceFilter.excludeUids')}
          </Typography.Text>
          <DatasourceUidTags
            uids={filter.excludeDatasourceUids}
            datasources={excludeDatasources}
            color='error'
          />
        </div>
      )}
      {!!Object.keys(filter?.datasourceLabels ?? {}).length && (
        <div>
          <Typography.Text type='secondary' className='text-xs block mb-1'>
            {t('strategy.ruleDetail.datasourceFilter.includeLabels')}
          </Typography.Text>
          <Typography.Text className='font-mono text-sm'>
            {formatLabelRecord(filter?.datasourceLabels)}
          </Typography.Text>
        </div>
      )}
      {!!Object.keys(filter?.excludeDatasourceLabels ?? {}).length && (
        <div>
          <Typography.Text type='secondary' className='text-xs block mb-1'>
            {t('strategy.ruleDetail.datasourceFilter.excludeLabels')}
          </Typography.Text>
          <Typography.Text className='font-mono text-sm'>
            {formatLabelRecord(filter?.excludeDatasourceLabels)}
          </Typography.Text>
        </div>
      )}
    </div>
  )
}

export default DatasourceFilterDisplay
