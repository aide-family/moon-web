import { Status } from '@/api/enum'
import { AlarmNoticeGroupItem } from '@/api/model-types'
import { CreateAlarmGroupRequest, getAlarmGroup } from '@/api/notify/alarm-group'
import { DataFrom } from '@/components/data/form'
import { Form, Modal, ModalProps } from 'antd'
import React, { useEffect, useState } from 'react'
import styles from './index.module.scss'
import { editModalFormItems } from './options'

export interface GroupEditModalProps extends ModalProps {
  groupId?: number
  disabled?: boolean
  submit?: (data: CreateAlarmGroupRequest & { id?: number }) => Promise<void>
}

export const GroupEditModal: React.FC<GroupEditModalProps> = (props) => {
  const { onCancel, submit, open, title, groupId, disabled } = props
  const [form] = Form.useForm<CreateAlarmGroupRequest>()
  const [loading, setLoading] = useState(false)
  const [grounpDetail, setGroupDetail] = useState<AlarmNoticeGroupItem>()

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
    if (open && form && grounpDetail) {
      form?.setFieldsValue({
        ...grounpDetail,
        hookIds: grounpDetail?.hooks?.map((item) => item.id)
      })
      return
    }
    form?.resetFields()
  }, [grounpDetail, open, form])

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
        noticeMember: []
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
      <Modal
        className={styles.modal}
        {...props}
        title={title}
        open={open}
        onCancel={handleOnCancel}
        onOk={handleOnOk}
        confirmLoading={loading}
      >
        <div className={styles.edit_content}>
          <DataFrom
            items={editModalFormItems}
            props={{ form, layout: 'vertical', autoComplete: 'off', disabled: disabled || loading }}
          />
        </div>
      </Modal>
    </>
  )
}
