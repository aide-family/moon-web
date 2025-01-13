import {
  type CreateDatasourceRequestFormData,
  createDatasource,
  datasourceHealth,
  getDatasource,
  updateDatasource
} from '@/api/datasource'
import { DatasourceType, Status, StorageType } from '@/api/enum'
import { StatusData } from '@/api/global'
import { DataFrom, type DataFromItem } from '@/components/data/form'
import { Prometheus, VictoriaMetrics } from '@/components/icon'
import { CheckCircleTwoTone, CloseCircleTwoTone, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { Button, Col, Form, Input, Modal, type ModalProps, Radio, Row, Space, message, theme } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'

export interface EditModalProps extends ModalProps {
  datasourceId?: number
  onOk?: () => void
}

const { useToken } = theme

export const EditModal: React.FC<EditModalProps> = (props) => {
  const { token } = useToken()
  const { onCancel, onOk, open, datasourceId } = props
  const [form] = Form.useForm<CreateDatasourceRequestFormData>()
  const [loading, setLoading] = React.useState(false)
  const [dataSourceHealthStatus, setDataSourceHealth] = useState(false)

  const { run: getDatasourceDetail, loading: getDatasourceDetailLoading } = useRequest(getDatasource, {
    manual: true,
    onSuccess: ({ detail }) => {
      let config: Record<string, string> = {}
      try {
        config = JSON.parse(detail.config)
      } catch (error) {
        message.error('数据源配置解析失败，请检查配置')
      }
      form.setFieldsValue({ ...detail, config })
    }
  })

  const { run: updateDatasourceDetail, loading: updateDatasourceDetailLoading } = useRequest(updateDatasource, {
    manual: true,
    onSuccess: () => {
      form.resetFields()
      onOk?.()
    }
  })

  const { run: createDatasourceDetail, loading: createDatasourceDetailLoading } = useRequest(createDatasource, {
    manual: true,
    onSuccess: () => {
      form.resetFields()
      onOk?.()
    }
  })

  const handleOnOk = () => {
    form.validateFields().then((values) => {
      const newValues = {
        ...values,
        datasourceType: DatasourceType.DatasourceTypeMetric
      }
      setLoading(true)
      if (datasourceId) {
        updateDatasourceDetail({ ...newValues, id: datasourceId, config: JSON.stringify(values.config) })
        return
      }
      if (!dataSourceHealthStatus) {
        message.error('数据源地址测试失败，请检查配置')
        setLoading(false)
        return
      }
      createDatasourceDetail({ ...newValues, config: JSON.stringify(values.config) })
      return values
    })
  }

  const handleGetDatasource = useCallback(() => {
    if (!datasourceId) return
    getDatasourceDetail({ id: datasourceId })
  }, [datasourceId, getDatasourceDetail])

  useEffect(() => {
    if (open) {
      handleGetDatasource()
    }
  }, [open, handleGetDatasource])

  const handleOnCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    form.resetFields()
    onCancel?.(e)
  }

  const formItems: (DataFromItem | DataFromItem[])[] = [
    [
      {
        label: '数据源名称',
        name: 'name',
        type: 'input',
        props: {
          placeholder: '请输入数据源名称'
        },
        formProps: {
          rules: [{ required: true, message: '请输入数据源名称' }]
        }
      },
      {
        label: '状态',
        name: 'status',
        type: 'radio-group',
        props: {
          options: Object.entries(StatusData)
            .filter((item) => {
              return +item[0] !== Status.StatusAll
            })
            .map((item) => {
              return {
                label: item[1].text,
                value: +item[0]
              }
            })
        },
        formProps: {
          rules: [{ required: true, message: '请选择状态' }]
        }
      }
    ],
    [
      {
        label: '存储器类型',
        name: 'storageType',
        type: 'radio-group',
        props: {
          optionType: 'button',
          options: [
            {
              label: (
                <Space>
                  <Prometheus width={15} height={15} />
                  Prometheus
                </Space>
              ),
              value: StorageType.StorageTypePrometheus
            },
            {
              label: (
                <Space>
                  <VictoriaMetrics width={15} height={15} />
                  VictoriaMetrics
                </Space>
              ),
              value: StorageType.StorageTypeVictoriaMetrics
            }
          ]
        },
        formProps: {
          rules: [{ required: true, message: '请选择存储器类型' }]
        }
      }
    ],
    {
      label: '数据源地址',
      name: 'endpoint',
      type: 'button-input',
      onChange: () => {
        setDataSourceHealth(false)
      },
      props: {
        placeholder: '请输入数据源地址',
        enterButton: '连接测试',
        onSearch: async (value: string) => {
          setDataSourceHealth(false)
          datasourceHealth({
            url: value,
            type: form.getFieldValue('storageType')
          }).then(() => {
            setDataSourceHealth(true)
          })
        },
        suffix: dataSourceHealthStatus ? (
          <CheckCircleTwoTone twoToneColor='#52c41a' />
        ) : (
          <CloseCircleTwoTone twoToneColor='#f5222d' />
        )
      },
      formProps: {
        rules: [{ required: true, message: '请输入数据源地址' }]
      }
    },
    {
      label: '说明信息',
      name: 'remark',
      type: 'textarea',
      props: {
        placeholder: '请输入数据源说明信息',
        maxLength: 200,
        showCount: true
      }
    }
  ]

  return (
    <Modal
      {...props}
      title='新建数据源'
      open={open}
      onCancel={handleOnCancel}
      onOk={handleOnOk}
      confirmLoading={loading || updateDatasourceDetailLoading || createDatasourceDetailLoading}
      loading={getDatasourceDetailLoading}
    >
      <DataFrom props={{ form, layout: 'vertical' }} items={formItems}>
        <Form.Item label='请求头'>
          <Form.List name={['config', 'headers']}>
            {(fields, { add, remove }) => {
              return (
                <div key={fields.length} className='w-full'>
                  {fields.map(({ key, name, ...restField }) => {
                    return (
                      <Row gutter={12}>
                        <Col span={12} key={key}>
                          <Form.Item {...restField} name={[name, 'key']} label={['headers', name, 'key'].join('.')}>
                            <Input placeholder='请输入请求头KEY' />
                          </Form.Item>
                        </Col>
                        <Col span={11} key={key}>
                          <Form.Item {...restField} name={[name, 'value']} label={['headers', name, 'value'].join('.')}>
                            <Input placeholder='请输入请求头VALUE' />
                          </Form.Item>
                        </Col>
                        <Col span={1} className='flex items-center justify-center'>
                          <MinusCircleOutlined onClick={() => remove(name)} style={{ color: token.colorError }} />
                        </Col>
                      </Row>
                    )
                  })}
                  <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                    添加新请求头
                  </Button>
                </div>
              )
            }}
          </Form.List>
        </Form.Item>
        <Form.Item label='请求参数'>
          <Form.List name={['config', 'params']}>
            {(fields, { add, remove }) => {
              return (
                <div key={fields.length}>
                  {fields.map(({ key, name, ...restField }) => {
                    return (
                      <Row gutter={12}>
                        <Col span={12} key={key}>
                          <Form.Item {...restField} name={[name, 'key']} label={['params', name, 'key'].join('.')}>
                            <Input placeholder='请输入请求参数KEY' />
                          </Form.Item>
                        </Col>
                        <Col span={11} key={key}>
                          <Form.Item {...restField} name={[name, 'value']} label={['params', name, 'value'].join('.')}>
                            <Input placeholder='请输入请求参数VALUE' />
                          </Form.Item>
                        </Col>
                        <Col span={1} className='flex items-center justify-center'>
                          <MinusCircleOutlined onClick={() => remove(name)} style={{ color: token.colorError }} />
                        </Col>
                      </Row>
                    )
                  })}
                  <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                    添加新请求参数
                  </Button>
                </div>
              )
            }}
          </Form.List>
        </Form.Item>
        <Form.Item label='基础认证配置'>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name={['config', 'username']} label='用户名'>
                <Input placeholder='请输入用户名' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={['config', 'password']} label='密码'>
                <Input placeholder='请输入密码' />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>
        <Form.Item name={['config', 'selfCACert']} label='自签证书'>
          <Input placeholder='请输入自签证书' />
        </Form.Item>
        <Form.Item label='TLS'>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name={['config', 'serverName']} label='服务名'>
                <Input placeholder='请输入服务名' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={['config', 'skipVerify']} label='跳过验证'>
                <Radio.Group
                  options={[
                    { label: '是', value: true },
                    { label: '否', value: false }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={['config', 'clientCert']} label='客户端证书'>
                <Input placeholder='请输入客户端证书' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={['config', 'clientKey']} label='客户端密钥'>
                <Input placeholder='请输入客户端密钥' />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>
      </DataFrom>
    </Modal>
  )
}
