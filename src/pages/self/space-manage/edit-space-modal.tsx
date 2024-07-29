import { StatusData } from '@/api/global'
import { ErrorResponse, NullObject } from '@/api/request'
import team from '@/api/team'
import { CreateTeamRequest, TeamItemType } from '@/api/team/types'
import { DataFrom, DataFromItem, ValidateType } from '@/components/data/form'
import { Modal, ModalProps } from 'antd'
import { useForm } from 'antd/es/form/Form'
import React, { useEffect } from 'react'

export interface EditSpaceModalProps extends ModalProps {
  spaceId?: number
}

const items: (DataFromItem | DataFromItem[])[] = [
  [
    {
      label: '团队名称',
      name: 'name',
      type: 'input',
      props: {
        placeholder: '请输入团队名称',
        maxLength: 20
      },
      formProps: {
        rules: [
          {
            required: true,
            message: '请输入团队名称'
          }
        ]
      }
    },
    {
      label: '是否启用',
      name: 'status',
      type: 'radio-group',
      props: {
        options: Object.entries(StatusData).map(([key, value]) => ({
          label: value.text,
          value: Number(key)
        })),
        optionType: 'button'
        // disabled: op === 'update',
      },
      formProps: {
        rules: [
          {
            required: true,
            message: '请选择状态'
          }
        ]
      }
    }
  ],
  {
    label: 'LOGO',
    name: 'logo',
    type: 'input',
    props: {
      placeholder: '请输入团队LOGO',
      maxLength: 200
      // disabled: op === 'update',
    }
  },
  {
    label: '团队描述',
    name: 'remark',
    type: 'textarea',
    props: {
      placeholder: '请输入团队描述',
      maxLength: 200,
      showCount: true,
      autoSize: {
        minRows: 2,
        maxRows: 4
      }
    }
  }
]

export const EditSpaceModal: React.FC<EditSpaceModalProps> = (props) => {
  const { spaceId, open, onOk, onCancel } = props
  const [form] = useForm<CreateTeamRequest>()
  const [detail, setDetail] = React.useState<TeamItemType>()
  const [validates, setValidates] = React.useState<Record<string, ValidateType>>()

  const handleGetTeamDetail = (id?: number) => {
    if (id) {
      team.getTeamApi(id).then((res) => {
        setDetail(res?.team)
      })
    }
  }

  useEffect(() => {
    handleGetTeamDetail(spaceId)
  }, [spaceId])

  const save = (params: CreateTeamRequest): Promise<NullObject> => {
    if (spaceId) {
      // TODO: 更新团队
      return team.updateTeamApi({
        ...params,
        id: spaceId
      })
    } else {
      // TODO: 创建团队
      return team.createTeamApi(params)
    }
  }

  const hendleOnOK = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    form.validateFields().then((values) => {
      save(values)
        .then(() => {
          form.resetFields()
          setValidates(undefined)
          onOk?.(e)
        })
        .catch((err: ErrorResponse) => {
          Object.keys(err.metadata).map((key) => {
            setValidates({
              [key]: {
                validateStatus: 'error',
                help: err.metadata[key]
              }
            })
          })
        })
      return values
    })
  }

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    form.resetFields()
    setValidates(undefined)
    onCancel?.(e)
  }

  useEffect(() => {
    if (!form || !detail) return
    form?.setFieldsValue({
      ...detail
    })
  }, [detail])
  return (
    <Modal title={spaceId ? '编辑团队信息' : '创建团队信息'} open={open} onOk={hendleOnOK} onCancel={handleCancel}>
      <DataFrom items={items} props={{ layout: 'vertical', form }} validates={validates} />
    </Modal>
  )
}
