import { createDatasource, getDatasource, updateDatasource } from '@/api/datasource'
import { DatasourceType, StorageType } from '@/api/enum'
import { DataSourceTypeData, StatusData, StorageTypeData } from '@/api/global'
import { DatasourceItem } from '@/api/model-types'
import { DataFrom, DataFromItem } from '@/components/data/form'
import { GlobalContext } from '@/utils/context'
import { Button, Descriptions, Form, message, Modal, ModalProps, Space, Steps, Tag } from 'antd'
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
}

const formOptions = (t: StorageType) => {
  if (t === StorageType.StorageTypeKafka) {
    return kafkaFormOptions()
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

let timer: NodeJS.Timeout | null = null
export const EditModal: React.FC<EditModalProps> = (props) => {
  const { datasourceId, onClose, ...rest } = props
  const { theme } = useContext(GlobalContext)

  const [basicForm] = Form.useForm()
  const [datasourceForm] = Form.useForm()
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<(DataFromItem | DataFromItem[])[]>([])
  const [editDatasource, setEditDatasource] = useState<DatasourceItem>({
    datasourceType: DatasourceType.DatasourceTypeMQ
  } as DatasourceItem)
  // 数据源类型
  const [datasourceType, setDatasourceType] = useState<StorageType>(StorageType.StorageTypeUnknown)
  const [datasourceDetail, setDatasourceDetail] = useState<DatasourceItem>()

  const init = () => {
    setEditDatasource({
      datasourceType: DatasourceType.DatasourceTypeMQ
    } as DatasourceItem)
    setCurrent(0)
    setOptions(formOptions(datasourceType))
    setDatasourceType(StorageType.StorageTypeUnknown)
    setLoading(false)
    basicForm.resetFields()
    datasourceForm.resetFields()
  }

  const fetchDatasourceDetail = async () => {
    if (!datasourceId) return
    setLoading(true)
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      getDatasource({ id: datasourceId }).then(({ detail }) => {
        setDatasourceDetail(detail)
        setLoading(false)
      })
    }, 500)
  }

  const next = () => {
    // 表单校验
    if (current === 0) {
      basicForm.validateFields().then((values) => {
        setDatasourceType(values.storageType)
        setEditDatasource({
          ...editDatasource,
          ...values
        })
        setCurrent(current + 1)
      })
    }
    if (current === 1) {
      datasourceForm.validateFields().then((values) => {
        setEditDatasource({
          ...editDatasource,
          config: values
        })
        setCurrent(current + 1)
      })
    }
  }

  const prev = () => {
    setCurrent(current - 1)
  }

  const onFinish = (e: React.MouseEvent<HTMLButtonElement>) => {
    // console.log(editDatasource)
    if (editDatasource.id) {
      updateDatasource({
        id: editDatasource.id,
        name: editDatasource.name,
        endpoint: editDatasource.endpoint,
        datasourceType: editDatasource.datasourceType,
        storageType: editDatasource.storageType,
        configValue: JSON.stringify(editDatasource.config),
        remark: editDatasource.remark,
        status: editDatasource.status
      })
    } else {
      createDatasource({
        name: editDatasource.name,
        endpoint: editDatasource.endpoint,
        datasourceType: editDatasource.datasourceType,
        storageType: editDatasource.storageType,
        configValue: JSON.stringify(editDatasource.config),
        remark: editDatasource.remark,
        status: editDatasource.status
      }).then(() => {
        message.success('创建成功')
        onClose?.(e)
      })
    }
  }

  useEffect(() => {
    if (props.open) {
      init()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open])

  useEffect(() => {
    setOptions(formOptions(datasourceType))
  }, [datasourceType])

  useEffect(() => {
    fetchDatasourceDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasourceId])

  useEffect(() => {
    if (datasourceDetail) {
      basicForm.setFieldsValue(datasourceDetail)
      datasourceForm.setFieldsValue(datasourceDetail.config)
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
              key: 'endpoint',
              label: '端点',
              span: 2,
              children: <Button type='link'>{editDatasource?.endpoint}</Button>
            },
            {
              key: 'datasourceType',
              label: '数据源类型',
              children: <div>{DataSourceTypeData[editDatasource?.datasourceType]}</div>
            },
            {
              key: 'storageType',
              label: '存储类型',
              children: <div>{StorageTypeData[editDatasource?.storageType]}</div>
            },
            {
              key: 'config',
              label: '配置',
              span: 2,
              children: (
                <ReactJson
                  style={{ width: '100%' }}
                  src={editDatasource?.config}
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
