import { Status, StorageType } from '@/api/enum'
import { DataFromItem } from '@/components/data/form'
import { Kafka, MQTT, RabbitMQ, RocketMQ } from '@/components/icon'
import { Space } from 'antd'

/**
 * 基础信息表单配置
 * @returns DataFromItem[]
 */
export function basicFormOptions(): (DataFromItem | DataFromItem[])[] {
  return [
    [
      {
        label: '名称',
        name: 'name',
        type: 'input',
        formProps: {
          rules: [{ required: true, message: '请输入名称' }]
        },
        props: { placeholder: '请输入名称' }
      },
      {
        label: '类型',
        name: 'storageType',
        type: 'select',
        formProps: {
          rules: [{ required: true, message: '请选择类型' }]
        },
        props: {
          allowClear: false,
          placeholder: '请选择类型',
          options: [
            {
              label: (
                <Space>
                  <Kafka />
                  Kafka
                </Space>
              ),
              value: StorageType.StorageTypeKafka
            },
            {
              label: (
                <Space>
                  <RocketMQ />
                  RocketMQ
                </Space>
              ),
              value: StorageType.StorageTypeRocketmq
            },
            {
              label: (
                <Space>
                  <RabbitMQ />
                  RabbitMQ
                </Space>
              ),
              value: StorageType.StorageTypeRabbitmq
            },
            {
              label: (
                <Space>
                  <MQTT />
                  MQTT
                </Space>
              ),
              value: StorageType.StorageTypeMQTT
            }
          ]
        }
      }
    ],
    [
      {
        label: '端点',
        name: 'endpoint',
        type: 'input',
        formProps: {
          rules: [{ required: true, message: '请输入端点', type: 'url' }],
          tooltip: 'endpoint'
        },
        props: { placeholder: '请输入端点' }
      },
      {
        label: '状态',
        name: 'status',
        type: 'radio-group',
        formProps: {
          rules: [{ required: true, message: '请选择状态' }]
        },
        props: {
          options: [
            { label: '启用', value: Status.StatusEnable },
            { label: '禁用', value: Status.StatusDisable }
          ]
        }
      }
    ],
    [
      {
        label: '备注',
        name: 'remark',
        type: 'textarea',
        props: { placeholder: '请输入备注', showCount: true, maxLength: 200 }
      }
    ]
  ]
}

/**
 * kafka 数据源表单配置
 * @returns DataFromItem[]
 */
export function kafkaFormOptions(): (DataFromItem | DataFromItem[])[] {
  return []
}

/**
 * rocketmq 数据源表单配置
 * @returns DataFromItem[]
 */
export function rocketmqFormOptions(): (DataFromItem | DataFromItem[])[] {
  return [
    {
      label: '组名',
      name: 'groupName',
      type: 'input',
      formProps: {
        tooltip: 'groupName'
      },
      props: { placeholder: '请输入组名' }
    },
    {
      label: '区域',
      name: 'region',
      type: 'input',
      formProps: {
        tooltip: 'region'
      },
      props: { placeholder: '请输入区域' }
    },
    {
      label: '访问密钥',
      name: 'accessKey',
      type: 'input',
      formProps: {
        tooltip: 'accessKey'
      },
      props: { placeholder: '请输入访问密钥' }
    },
    {
      label: '秘密密钥',
      name: 'secretKey',
      type: 'input',
      formProps: {
        tooltip: 'secretKey'
      },
      props: { placeholder: '请输入秘密密钥' }
    },
    {
      label: '命名空间',
      name: 'namespace',
      type: 'input',
      formProps: {
        tooltip: 'namespace'
      },
      props: { placeholder: '请输入命名空间' }
    }
  ]
}

/**
 * rabbitmq 数据源表单配置
 * @returns DataFromItem[]
 */
export function rabbitmqFormOptions(): (DataFromItem | DataFromItem[])[] {
  return []
}

/**
 * mqtt 数据源表单配置
 * @returns DataFromItem[]
 */
export function mqttFormOptions(): (DataFromItem | DataFromItem[])[] {
  return []
}
