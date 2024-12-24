import { Status, StorageType } from '@/api/enum'
import type { DataFromItem } from '@/components/data/form'
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
    {
      label: '存储器类型',
      name: 'storageType',
      type: 'radio-group',
      formProps: {
        rules: [{ required: true, message: '请选择类型' }]
      },
      props: {
        optionType: 'button',
        options: [
          {
            label: (
              <Space>
                <Kafka width={15} height={15} />
                Kafka
              </Space>
            ),
            value: StorageType.StorageTypeKafka
          },
          {
            label: (
              <Space>
                <RocketMQ width={15} height={15} />
                RocketMQ
              </Space>
            ),
            value: StorageType.StorageTypeRocketmq
          },
          {
            label: (
              <Space>
                <RabbitMQ width={15} height={15} />
                RabbitMQ
              </Space>
            ),
            value: StorageType.StorageTypeRabbitmq
          },
          {
            label: (
              <Space>
                <MQTT width={15} height={15} />
                MQTT
              </Space>
            ),
            value: StorageType.StorageTypeMQTT
          }
        ]
      }
    },
    [
      {
        label: '端点',
        name: 'endpoints',
        type: 'select',
        formProps: {
          rules: [
            {
              required: true,
              message: '请输入端点',
              type: 'regexp',
              pattern: /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/
            }
          ],
          tooltip: 'endpoints'
        },
        props: {
          placeholder: '请输入端点',
          mode: 'tags',
          tokenSeparators: [',', ' ']
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
export function kafkaFormOptions(saslEnable?: 'true' | 'false'): (DataFromItem | DataFromItem[])[] {
  // {"groupName":"example-group","strategy":"roundrobin","saslEnable":"false","version":"3.8.1"}
  return [
    {
      label: '组名(groupName)',
      name: 'groupName',
      type: 'input',
      props: { placeholder: '请输入组名', autoComplete: 'off' }
    },
    [
      {
        label: '策略(strategy)',
        name: 'strategy',
        type: 'radio-group',
        props: {
          options: [
            { label: '轮询(roundrobin)', value: 'roundrobin' },
            { label: '随机(random)', value: 'random' },
            { label: '粘性(sticky)', value: 'sticky' }
          ]
        }
      },
      {
        label: 'SASL是否启用(saslEnable)',
        name: 'saslEnable',
        type: 'radio-group',
        props: {
          options: [
            { label: '是', value: 'true' },
            { label: '否', value: 'false' }
          ]
        }
      }
    ],
    [
      saslEnable === 'true'
        ? {
            label: '密码(password)',
            name: 'password',
            type: 'input',
            props: { placeholder: '请输入密码', autoComplete: 'off' }
          }
        : null,
      {
        label: '版本(version)',
        name: 'version',
        type: 'input',
        props: { placeholder: '请输入版本', autoComplete: 'off' }
      }
    ]
  ]
}

/**
 * rocketmq 数据源表单配置
 * @returns DataFromItem[]
 */
export function rocketmqFormOptions(): (DataFromItem | DataFromItem[])[] {
  return [
    {
      label: '命名空间',
      name: 'namespace',
      type: 'input',
      formProps: {
        tooltip: 'namespace'
      },
      props: { placeholder: '请输入命名空间', autoComplete: 'off' }
    },
    [
      {
        label: '组名',
        name: 'groupName',
        type: 'input',
        formProps: {
          tooltip: 'groupName'
        },
        props: { placeholder: '请输入组名', autoComplete: 'off' }
      },
      {
        label: '区域',
        name: 'region',
        type: 'input',
        formProps: {
          tooltip: 'region'
        },
        props: { placeholder: '请输入区域', autoComplete: 'off' }
      }
    ],
    [
      {
        label: '访问密钥',
        name: 'accessKey',
        type: 'input',
        formProps: {
          tooltip: 'accessKey'
        },
        props: { placeholder: '请输入访问密钥', autoComplete: 'off' }
      },
      {
        label: '秘密密钥',
        name: 'secretKey',
        type: 'input',
        formProps: {
          tooltip: 'secretKey'
        },
        props: { placeholder: '请输入秘密密钥', autoComplete: 'off' }
      }
    ]
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
  // {"broker":"tcp://broker.emqx.io:1883","username":"","password":"","autoReconnect":"true","qos":"1"}
  return [
    [
      {
        label: '用户名(username)',
        name: 'username',
        type: 'input',
        props: { placeholder: '请输入用户名' }
      },
      {
        label: '密码(password)',
        name: 'password',
        type: 'input',
        props: { placeholder: '请输入密码' }
      }
    ],
    [
      {
        label: '是否自动重连(autoReconnect)',
        name: 'autoReconnect',
        type: 'radio-group',
        props: {
          options: [
            { label: '是', value: true },
            { label: '否', value: false }
          ]
        }
      },
      {
        label: '消息质量(qos)',
        name: 'qos',
        type: 'radio-group',
        props: {
          options: [
            { label: '最多一次(0)', value: 0 },
            { label: '至少一次(1)', value: 1 },
            { label: '恰好一次(2)', value: 2 }
          ]
        }
      }
    ]
  ]
}
