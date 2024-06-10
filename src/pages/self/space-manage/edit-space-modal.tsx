import { StatusData } from '@/api/global'
import { NullObject } from '@/api/request'
import team from '@/api/team'
import { CreateTeamRequest, TeamItemType } from '@/api/team/types'
import { DataFrom, DataFromItem } from '@/components/data/form'
import { Modal, ModalProps } from 'antd'
import { useForm } from 'antd/es/form/Form'
import React, { useEffect } from 'react'

export interface EditSpaceModalProps extends ModalProps {
  spaceId?: number
}

const items = (op: 'add' | 'update'): (DataFromItem | DataFromItem[])[] => [
  [
    {
      label: '团队名称',
      name: 'name',
      type: 'input',
      props: {
        placeholder: '请输入团队名称',
        maxLength: 20,
      },
      formProps: {
        rules: [
          {
            required: true,
            message: '请输入团队名称',
          },
        ],
      },
    },
    {
      label: '是否启用',
      name: 'status',
      type: 'radio-group',
      props: {
        options: Object.entries(StatusData).map(([key, value]) => ({
          label: value.text,
          value: Number(key),
        })),
        optionType: 'button',
        disabled: op === 'update',
      },
      formProps: {
        rules: [
          {
            required: true,
            message: '请选择状态',
          },
        ],
      },
    },
  ],
  {
    label: 'LOGO',
    name: 'logo',
    type: 'input',
    props: {
      placeholder: '请输入团队LOGO',
      maxLength: 200,
      disabled: op === 'update',
    },
  },
  {
    label: '团队描述',
    name: 'remark',
    type: 'textarea',
    props: {
      placeholder: '请输入团队描述',
      maxLength: 100,
      showCount: true,
      autoSize: {
        minRows: 2,
        maxRows: 4,
      },
    },
  },
]

export const EditSpaceModal: React.FC<EditSpaceModalProps> = (props) => {
  const { spaceId, open, onOk, onCancel } = props
  const [form] = useForm<CreateTeamRequest>()
  const [detail, setDetail] = React.useState<TeamItemType>()

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
        id: spaceId,
        name: params.name,
        remark: params.remark,
      })
    } else {
      // TODO: 创建团队
      return team.createTeamApi(params)
    }
  }

  const hendleOnOK = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    form
      .validateFields()
      .then((values) => {
        save(values)
        onOk?.(e)
        return values
      })
      .then(() => {
        onCancel?.(e)
      })
  }

  useEffect(() => {
    if (!form || !detail) return
    form?.setFieldsValue({
      name: detail?.name,
      remark: detail?.remark,
      logo: detail?.logo,
      status: detail?.status,
    })
  }, [detail, form])
  return (
    <Modal
      title={spaceId ? '编辑团队信息' : '创建团队信息'}
      open={open}
      onOk={hendleOnOK}
      onCancel={onCancel}
    >
      <DataFrom
        items={items(spaceId ? 'update' : 'add')}
        props={{ layout: 'vertical', form }}
      />
    </Modal>
  )
}
