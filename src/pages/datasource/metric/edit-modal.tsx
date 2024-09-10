import { createDatasource, CreateDatasourceRequest } from '@/api/datasource'
import { DatasourceType, Status, StorageType } from '@/api/enum'
import { DataSourceTypeData, StatusData, StorageTypeData } from '@/api/global'
import { DataFrom, DataFromItem } from '@/components/data/form'
import { Form, Modal, ModalProps } from 'antd'
import React from 'react'

export interface EditModalProps extends ModalProps {}

export const EditModal: React.FC<EditModalProps> = (props) => {
  const { onCancel, onOk, open } = props
  const [form] = Form.useForm<CreateDatasourceRequest>()
  const [loading, setLoading] = React.useState(false)
  const handleOnOk = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    form.validateFields().then((values) => {
      setLoading(true)
      createDatasource(values)
        .then(() => {
          form.resetFields()
          onOk?.(e)
        })
        .finally(() => setLoading(false))
      return values
    })
  }

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
        label: '数据源类型',
        name: 'datasourceType',
        type: 'radio-group',
        props: {
          options: Object.entries(DataSourceTypeData)
            .filter((item) => {
              return +item[0] !== DatasourceType.DatasourceTypeUnknown
            })
            .map((item) => {
              return {
                label: item[1],
                value: +item[0],
                disabled: +item[0] !== DatasourceType.DatasourceTypeMetric
              }
            }),
          optionType: 'button'
        },
        formProps: {
          initialValue: DatasourceType.DatasourceTypeMetric,
          rules: [{ required: true, message: '请选择数据源类型' }]
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
          options: Object.entries(StorageTypeData)
            .filter((item) => {
              return +item[0] !== StorageType.StorageTypeUnknown
            })
            .map((item) => {
              return {
                label: item[1],
                value: +item[0]
              }
            })
        },
        formProps: {
          rules: [{ required: true, message: '请选择存储器类型' }]
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
    {
      label: '数据源地址',
      name: 'endpoint',
      type: 'input',
      props: {
        placeholder: '请输入数据源地址'
      },
      formProps: {
        rules: [{ required: true, message: '请输入数据源地址' }]
      }
    },
    {
      label: '数据源配置',
      name: 'configStr',
      type: 'textarea',
      props: {
        placeholder: '请输入数据源认证json',
        maxLength: 200,
        showCount: true
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
      confirmLoading={loading}
    >
      <DataFrom props={{ form, layout: 'vertical' }} items={formItems} />
    </Modal>
  )
}
