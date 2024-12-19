import { Status } from '@/api/enum'
import { AlarmNoticeGroupItem, NoticeItem } from '@/api/model-types'
import { CreateAlarmGroupRequest, getAlarmGroup } from '@/api/notify/alarm-group'
import { DataFrom } from '@/components/data/form'
import { Form, Modal, ModalProps } from 'antd'
import React, { useEffect, useState } from 'react'
import { MemberSelect } from './member-select'
import { editModalFormItems } from './options'

export interface GroupEditModalProps extends ModalProps {
  groupId?: number
  disabled?: boolean
  submit?: (data: CreateAlarmGroupRequest & { id?: number }) => Promise<void>
}

export const GroupEditModal: React.FC<GroupEditModalProps> = (props) => {
  const { onCancel, submit, open, title, groupId, disabled } = props
  const [form] = Form.useForm<CreateAlarmGroupRequest & { noticeMember: NoticeItem[] }>()
  const [loading, setLoading] = useState(false)
  const [groupDetail, setGroupDetail] = useState<AlarmNoticeGroupItem>()

  const getGroupDetail = async () => {
    if (groupId) {
      setLoading(true)
      getAlarmGroup({ id: groupId })
        .then(({ detail }) => {
          setGroupDetail(detail)
        })
        .finally(() => setLoading(false))
    }
  }

  useEffect(() => {
    if (!groupId) {
      setGroupDetail(undefined)
    }
    getGroupDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId])

  useEffect(() => {
    if (open && form && groupDetail) {
      form?.setFieldsValue({
        ...groupDetail,
        hookIds: groupDetail?.hooks?.map((item) => item.id),
        noticeMember: groupDetail?.noticeUsers,
        timeEngines: groupDetail?.timeEngines?.map((item) => item.id)
      })
      return
    }
    form?.resetFields()
  }, [groupDetail, open, form])

  const handleOnCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    onCancel?.(e)
    form?.resetFields()
    setGroupDetail(undefined)
  }

  const handleOnOk = () => {
    form?.validateFields().then((formValues) => {
      setLoading(true)
      submit?.({
        ...formValues,
        status: Status.StatusEnable,
        id: groupId,
        noticeMember: formValues.noticeMember?.map((item: NoticeItem) => ({
          memberId: item.member.id,
          notifyType: item.notifyType
        }))
      })
        .then(() => {
          form?.resetFields()
        })
        .finally(() => {
          setLoading(false)
        })
    })
  }

  return (
    <>
      <Modal {...props} title={title} open={open} onCancel={handleOnCancel} onOk={handleOnOk} confirmLoading={loading}>
        <DataFrom
          items={editModalFormItems}
          props={{ form, layout: 'vertical', autoComplete: 'off', disabled: disabled || loading }}
        >
          <Form.Item label='成员列表' name='noticeMember'>
            <MemberSelect />
          </Form.Item>
        </DataFrom>
      </Modal>
    </>
  )
}
