import React, { useEffect, useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, ModalProps, Row, Select, Space, theme } from 'antd'
import { GroupEditModalFormData } from './options'
import { getStrategyGroup } from '@/api/strategy'
import { StrategyGroupItemType } from '@/api/strategy/types'
import styles from './index.module.scss'

const { useToken } = theme
export type GroupEditModalData = {
  id?: number
  // 规则组名称
  name: string
  // 规则组描述
  remark: string
  // 规则分类类型
  creatorId: number[]
}

export interface GroupEditModalProps extends ModalProps {
  GroupId?: number
  disabled?: boolean
  submit?: (data: GroupEditModalData) => Promise<void>
}

let summaryTimeout: NodeJS.Timeout | null = null
let descriptionTimeout: NodeJS.Timeout | null = null
export const GroupEditModal: React.FC<GroupEditModalProps> = (props) => {
  const { onCancel, submit, open, title, GroupId, disabled } = props
  const { token } = useToken()
  const [form] = Form.useForm<GroupEditModalFormData>()
  const datasource = Form.useWatch('datasource', form)
  const [loading, setLoading] = useState(false)
  const [grounpDetail, setGroupDetail] = useState<GroupEditModalFormData>()

  const getGroupDetail = async () => {
    if (GroupId) {
      setLoading(true)
      const res = await getStrategyGroup(GroupId)
      const { name, remark, creatorId } = res
      setGroupDetail({
        name,
        remark,
        creatorId
      })
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!GroupId) {
      setGroupDetail(undefined)
    }
    getGroupDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [GroupId])

  useEffect(() => {
    if (open && form && grounpDetail) {
      form?.setFieldsValue(grounpDetail)
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
      const { name, remark, categoriesIds } = formValues
      setLoading(true)
      submit?.({
        id: GroupId,
        name,
        remark,
        categoriesIds
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
          <Form form={form} layout='vertical' autoComplete='off' disabled={disabled || loading}>
            <Form.Item label='规则组名称' name='name' rules={[{ required: true, message: '请输入规则组名称' }]}>
              <Input placeholder='请输入规则组名称' allowClear />
            </Form.Item>
            <Form.Item label='规则分类' name='categoriesIds' rules={[{ required: true, message: '请选择规则分类' }]}>
              <Select mode='multiple' allowClear placeholder='请选择规则分类'>
                <Select.Option value={1}>类目一</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label='规则组描述' name='remark'>
              <Input.TextArea placeholder='请输入200字以内的规则组描述' allowClear maxLength={200} showCount />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  )
}
