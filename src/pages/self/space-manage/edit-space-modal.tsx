import { StatusData } from '@/api/global'
import type { TeamItem } from '@/api/model-types'
import { ErrorResponse } from '@/api/request'
import { type CreateTeamReply, type CreateTeamRequest, createTeam, getTeam, updateTeam } from '@/api/team'
import { DataFrom, type DataFromItem } from '@/components/data/form'
import { handleFormError } from '@/utils'
import { useRequest } from 'ahooks'
import { Modal, type ModalProps } from 'antd'
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
  const [detail, setDetail] = React.useState<TeamItem>()

  const { run: initTeamDetail, loading: initTeamDetailLoading } = useRequest(getTeam, {
    manual: true,
    onSuccess: (res) => {
      setDetail(res?.detail)
    }
  })

  const { runAsync: addTeam, loading: addTeamLoading } = useRequest(createTeam, {
    manual: true
  })

  const { runAsync: editTeam, loading: editTeamLoading } = useRequest(updateTeam, {
    manual: true
  })

  useEffect(() => {
    if (spaceId) {
      initTeamDetail({ id: spaceId })
    }
  }, [initTeamDetail, spaceId])

  const save = (params: CreateTeamRequest): Promise<null | CreateTeamReply> => {
    return spaceId ? editTeam({ ...params, id: spaceId }) : addTeam(params)
  }

  const hendleOnOK = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    form.validateFields().then((values) => {
      save(values)
        .then(() => {
          form.resetFields()
          onOk?.(e)
        })
        .catch((err: ErrorResponse) => {
          handleFormError(form, err)
        })
      return values
    })
  }

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    form.resetFields()
    onCancel?.(e)
  }

  useEffect(() => {
    if (!form || !detail) return
    form.setFieldsValue(detail)
  }, [detail, form])

  return (
    <Modal
      title={spaceId ? '编辑团队信息' : '创建团队信息'}
      open={open}
      onOk={hendleOnOK}
      loading={initTeamDetailLoading}
      onCancel={handleCancel}
      confirmLoading={addTeamLoading || editTeamLoading}
    >
      <DataFrom items={items} props={{ layout: 'vertical', form }} />
    </Modal>
  )
}
