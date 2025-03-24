import { createDatasource, getDatasource, updateDatasource } from '@/api/datasource'
import { DatasourceType, StorageType } from '@/api/enum'
import { DataSourceTypeData, StatusData, StorageTypeData } from '@/api/global'
import type { DatasourceItem } from '@/api/model-types'
import { DataFrom, type DataFromItem } from '@/components/data/form'
import { GlobalContext } from '@/utils/context'
import { useRequest } from 'ahooks'
import {
  theme as AntdTheme,
  Button,
  Descriptions,
  Form,
  Modal,
  type ModalProps,
  Space,
  Steps,
  Tag,
  message
} from 'antd'
import { useContext, useEffect, useState } from 'react'
import ReactJson from 'react-json-view'
import {
  basicFormOptions,
  kafkaFormOptions,
  mqttFormOptions,
  rabbitmqFormOptions,
  rocketmqFormOptions
} from './options'

export interface EditModalProps extends ModalProps {
  datasourceId?: number
  onFinish?: () => void
}

const { useToken } = AntdTheme

const formOptions = (t: StorageType, saslEnable?: 'true' | 'false') => {
  if (t === StorageType.StorageTypeKafka) {
    return kafkaFormOptions(saslEnable)
  }
  if (t === StorageType.StorageTypeRocketmq) {
    return rocketmqFormOptions()
  }
  if (t === StorageType.StorageTypeRabbitmq) {
    return rabbitmqFormOptions()
  }
  if (t === StorageType.StorageTypeMQTT) {
    return mqttFormOptions()
  }
  return []
}

export const EditModal: React.FC<EditModalProps> = (props) => {
  const { datasourceId, onFinish: finish, onClose, ...rest } = props
  const { theme } = useContext(GlobalContext)
  const { token } = useToken()

  const [basicForm] = Form.useForm()
  const [datasourceForm] = Form.useForm()
  const saslEnable = Form.useWatch('saslEnable', datasourceForm)

  const [current, setCurrent] = useState(0)
  const [options, setOptions] = useState<(DataFromItem | DataFromItem[])[]>([])
  const [editDatasource, setEditDatasource] = useState<DatasourceItem>({
    datasourceType: DatasourceType.DatasourceTypeEvent
  } as DatasourceItem)
  // 数据源类型
  const [datasourceType, setDatasourceType] = useState<StorageType>(StorageType.StorageTypeUnknown)
  const [datasourceDetail, setDatasourceDetail] = useState<DatasourceItem>()

  const { run: fetchDatasourceDetail, loading } = useRequest(getDatasource, {
    manual: true,
    onSuccess: (res) => {
      setDatasourceDetail(res.detail)
    }
  })

  const init = () => {
    setEditDatasource({
      datasourceType: DatasourceType.DatasourceTypeEvent
    } as DatasourceItem)
    setCurrent(0)
    setOptions(formOptions(datasourceType, saslEnable))
    setDatasourceType(StorageType.StorageTypeUnknown)
    basicForm.resetFields()
    datasourceForm.resetFields()
  }

  const next = () => {
    // 表单校验
    if (current === 0) {
      basicForm.validateFields().then((values) => {
        setDatasourceType(values.storageType)
        setEditDatasource({
          ...editDatasource,
          ...values,
          endpoint: values.endpoints.join(',')
        })
        setCurrent(current + 1)
      })
    }
    if (current === 1) {
      datasourceForm.validateFields().then((values) => {
        setEditDatasource({
          ...editDatasource,
          config: JSON.stringify(values)
        })
        setCurrent(current + 1)
      })
    }
  }

  const prev = () => {
    setCurrent(current - 1)
  }

  const onFinish = () => {
    if (datasourceId) {
      updateDatasource({
        id: datasourceId,
        name: editDatasource.name,
        endpoint: editDatasource.endpoint,
        datasourceType: editDatasource.datasourceType,
        storageType: editDatasource.storageType,
        config: editDatasource.config,
        remark: editDatasource.remark,
        status: editDatasource.status
      }).then(() => {
        message.success('更新成功')
        finish?.()
      })
    } else {
      createDatasource({
        name: editDatasource.name,
        endpoint: editDatasource.endpoint,
        datasourceType: editDatasource.datasourceType,
        storageType: editDatasource.storageType,
        config: editDatasource.config,
        remark: editDatasource.remark,
        status: editDatasource.status
      }).then(() => {
        message.success('创建成功')
        finish?.()
      })
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (props.open) {
      init()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open])

  useEffect(() => {
    setOptions(formOptions(datasourceType, saslEnable))
  }, [datasourceType, saslEnable])

  useEffect(() => {
    datasourceId && fetchDatasourceDetail({ id: datasourceId })
  }, [fetchDatasourceDetail, datasourceId])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (datasourceDetail) {
      basicForm.setFieldsValue({
        ...datasourceDetail,
        endpoints: datasourceDetail.endpoint.split(',')
      })
      datasourceForm.setFieldsValue(JSON.parse(datasourceDetail.config || '{}'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasourceDetail])

  return (
    <Modal
      {...rest}
      loading={loading}
      closable={false}
      footer={
        <Space>
          <Button type='dashed' onClick={onClose}>
            取消
          </Button>
          <Button type='primary' disabled={current === 0} onClick={prev}>
            上一步
          </Button>
          <Button type='primary' disabled={current === 2} onClick={next}>
            下一步
          </Button>
          <Button type='primary' disabled={current !== 2} onClick={onFinish}>
            完成
          </Button>
        </Space>
      }
    >
      <Steps
        size='small'
        current={current}
        className='mb-3'
        items={[
          {
            title: '基础信息'
          },
          {
            title: '数据源配置'
          },
          {
            title: '确认信息'
          }
        ]}
      />
      {current === 0 && <DataFrom props={{ form: basicForm, layout: 'vertical' }} items={basicFormOptions()} />}
      {current === 1 && <DataFrom props={{ form: datasourceForm, layout: 'vertical' }} items={options} />}
      {current === 2 && (
        <Descriptions
          // title='确认信息'
          layout='vertical'
          column={2}
          bordered
          items={[
            {
              key: 'name',
              label: '名称',
              children: (
                <div className='flex flex-row items-center gap-2'>
                  {editDatasource?.name}
                  <Tag color={StatusData[editDatasource?.status]?.color}>
                    {StatusData[editDatasource?.status]?.text}
                  </Tag>
                </div>
              )
            },
            {
              key: 'datasourceType',
              label: '数据源类型',
              children: (
                <div className='flex flex-row items-center gap-2'>
                  <Tag color='blue'>{DataSourceTypeData[editDatasource?.datasourceType]}</Tag>
                  <Tag color='pink'>{StorageTypeData[editDatasource?.storageType]}</Tag>
                </div>
              )
            },
            {
              key: 'endpoint',
              label: '端点',
              span: 2,
              children: editDatasource?.endpoint?.split(',').map((item) => (
                <Tag color={token.colorPrimary} key={item}>
                  {item}
                </Tag>
              ))
            },
            {
              key: 'config',
              label: '配置',
              span: 2,
              children: (
                <ReactJson
                  style={{ width: '100%' }}
                  src={editDatasource?.config ? JSON.parse(editDatasource?.config) : {}}
                  displayDataTypes={false}
                  name={false}
                  iconStyle='square'
                  theme={theme === 'dark' ? 'railscasts' : 'rjv-default'}
                />
              )
            },
            {
              key: 'remark',
              label: '备注',
              span: 2,
              children: <div>{editDatasource?.remark}</div>
            }
          ]}
        />
      )}
    </Modal>
  )
}
