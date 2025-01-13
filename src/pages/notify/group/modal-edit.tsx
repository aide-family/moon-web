import { Status } from '@/api/enum'
import type { AlarmNoticeGroupItem, NoticeItem } from '@/api/model-types'
import {
  type CreateAlarmGroupRequest,
  createAlarmGroup,
  getAlarmGroup,
  updateAlarmGroup
} from '@/api/notify/alarm-group'
import { DataFrom } from '@/components/data/form'
import { useRequest } from 'ahooks'
import { Form, Modal, type ModalProps, message } from 'antd'
import type React from 'react'
import { useEffect, useState } from 'react'
import { MemberSelect } from './member-select'
import { editModalFormItems } from './options'

export interface GroupEditModalProps extends ModalProps {
  groupId?: number
  disabled?: boolean
  onOk?: () => void
}

export const GroupEditModal: React.FC<GroupEditModalProps> = (props) => {
  const { onCancel, onOk, open, title, groupId, disabled } = props
  const [form] = Form.useForm<CreateAlarmGroupRequest & { noticeMember: NoticeItem[] }>()
  const [groupDetail, setGroupDetail] = useState<AlarmNoticeGroupItem>()

  const { run: initGroupDetail, loading: initGroupDetailLoading } = useRequest(getAlarmGroup, {
    manual: true,
    onSuccess: (data) => {
      setGroupDetail(data.detail)
    }
  })

  const { runAsync: addGroup, loading: addGroupLoading } = useRequest(createAlarmGroup, {
    manual: true,
    onSuccess: () => {
      message.success('新建告警组成功')
      onOk?.()
    }
  })

  const { runAsync: editGroup, loading: editGroupLoading } = useRequest(updateAlarmGroup, {
    manual: true,
    onSuccess: () => {
      message.success('编辑告警组成功')
      onOk?.()
    }
  })

  useEffect(() => {
    if (groupId) {
      initGroupDetail({ id: groupId })
    }
  }, [groupId, initGroupDetail])

  useEffect(() => {
    if (open && form && groupDetail) {
      form?.setFieldsValue({
        ...groupDetail,
        hookIds: groupDetail?.hooks?.map((item) => item.id),
        noticeMember: groupDetail?.noticeUsers,
        timeEngines: groupDetail?.timeEngines?.map((item) => item.id),
        templates: groupDetail?.templates?.map((item) => item.id)
      })
      return
    }
    form?.resetFields()
  }, [groupDetail, open, form])

  const handleOnCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    form?.resetFields()
    setGroupDetail(undefined)
    onCancel?.(e)
  }

  const handleOnOk = () => {
    form?.validateFields().then((formValues) => {
      const data = {
        ...formValues,
        status: Status.StatusEnable,
        id: groupId,
        noticeMember: formValues.noticeMember?.map((item: NoticeItem) => ({
          memberId: item.member.id,
          notifyType: item.notifyType
        }))
      }
      if (groupId) {
        editGroup({ update: data, id: groupId })
      } else {
        addGroup(data)
      }
    })
  }

  return (
    <>
      <Modal
        {...props}
        title={title}
        open={open}
        onCancel={handleOnCancel}
        loading={initGroupDetailLoading}
        onOk={handleOnOk}
        confirmLoading={addGroupLoading || editGroupLoading}
      >
        <DataFrom
          items={editModalFormItems}
          props={{
            form,
            layout: 'vertical',
            autoComplete: 'off',
            disabled: disabled || initGroupDetailLoading || addGroupLoading || editGroupLoading
          }}
        >
          <Form.Item label='成员列表' name='noticeMember'>
            <MemberSelect />
          </Form.Item>
        </DataFrom>
      </Modal>
    </>
  )
}
