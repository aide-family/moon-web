import KeyValueEditor from '@/components/KeyValueEditor'
import { useLocale } from '@/contexts/LocaleContext'
import { Divider, Form, Select } from 'antd'
import React from 'react'

interface DatasourceFilterFormProps {
  datasourceOptions: { value: string; label: string }[]
}

const DatasourceFilterForm: React.FC<DatasourceFilterFormProps> = ({
  datasourceOptions,
}) => {
  const { t } = useLocale()

  return (
    <>
      <Divider titlePlacement='left' plain className='my-2!'>
        {t('strategy.ruleDetail.datasourceFilter.title')}
      </Divider>
      <Form.Item
        name={['datasourceFilter', 'datasourceUids']}
        label={t('strategy.ruleDetail.datasourceFilter.includeUids')}
      >
        <Select
          mode='multiple'
          allowClear
          placeholder={t(
            'strategy.ruleDetail.datasourceFilter.includeUids.placeholder',
          )}
          options={datasourceOptions}
          showSearch={{ optionFilterProp: 'label' }}
        />
      </Form.Item>
      <Form.Item
        name={['datasourceFilter', 'excludeDatasourceUids']}
        label={t('strategy.ruleDetail.datasourceFilter.excludeUids')}
      >
        <Select
          mode='multiple'
          allowClear
          placeholder={t(
            'strategy.ruleDetail.datasourceFilter.excludeUids.placeholder',
          )}
          options={datasourceOptions}
          showSearch={{ optionFilterProp: 'label' }}
        />
      </Form.Item>
      <KeyValueEditor
        name={['datasourceFilter', 'datasourceLabels']}
        label={t('strategy.ruleDetail.datasourceFilter.includeLabels')}
        extra={t('strategy.ruleDetail.datasourceFilter.labelsHelp')}
        keyPlaceholder={t('common.kv.keyPlaceholder')}
        valuePlaceholder={t('common.kv.valuePlaceholder')}
        addLabel={t('common.kv.add')}
      />
      <KeyValueEditor
        name={['datasourceFilter', 'excludeDatasourceLabels']}
        label={t('strategy.ruleDetail.datasourceFilter.excludeLabels')}
        extra={t('strategy.ruleDetail.datasourceFilter.labelsHelp')}
        keyPlaceholder={t('common.kv.keyPlaceholder')}
        valuePlaceholder={t('common.kv.valuePlaceholder')}
        addLabel={t('common.kv.add')}
      />
    </>
  )
}

export default DatasourceFilterForm
