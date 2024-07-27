import { ConditionData, SustainTypeData } from '@/api/global'
import PromQLInput from '@/components/data/child/prom-ql'
import {
  MinusCircleOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  ModalProps,
  Popover,
  Row,
  Select,
  Space,
  theme,
  Typography,
} from 'antd'
import React, { useEffect, useState } from 'react'
import {  GroupEditModalFormData } from './options'

import {
  getStrategyGroup,
} from "@/api/strategy"
import {
  StrategyGroupItemType,
} from "@/api/strategy/types"
import { AnnotationsEditor } from '@/components/data/child/annotation-editor'
import styles from "./index.module.scss"
const { useToken } = theme

export type GroupEditModalData = {
  id?: number
  // 策略名称
  alert: string
  // 策略表达式
  expr: string
  // 策略说明信息
  remark: string
  // 标签
  labels: Record<string, string>
  // 注解
  annotations: Record<string, string>
  // 策略等级
  level: Record<StrategyLevelIDType, MutationStrategyLevelGroupType>
  // 策略模板类型
  categoriesIds: number[]
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

  const summary = Form.useWatch(['annotations', 'summary'], form)
  const description = Form.useWatch(['annotations', 'description'], form)
  const [summaryOkInfo, setSummaryOkInfo] = useState<{
    info: string
    labels?: string[]
  }>({
    info: '',
  })
  const [descriptionOkInfo, setDescriptionOkInfo] = useState<{
    info: string
    labels?: string[]
  }>({
    info: '',
  })

  const [loading, setLoading] = useState(false)

  const [grounpDetail, setGroupDetail] =
    useState<GroupEditModalFormData>()

  const getGroupDetail = async () => {
    if (GroupId) {
      setLoading(true)
      const res = await getStrategyGroup(GroupId)
      const { name, remark, creatorId  } =
        res
      setGroupDetail({
        name,
        remark,
          creatorId, 
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
      form.setFieldsValue(grounpDetail)
      return
    }
    form.resetFields()
  }, [grounpDetail, open, form])

  const handleOnCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    onCancel?.(e)
    form.resetFields()
    setGroupDetail(undefined)
  }


  const handleOnOk = () => {
    form.validateFields().then((formValues) => {
      const {
        name,
        remark,
        categoriesIds,
      } = formValues
      setLoading(true)
      submit?.({
        id: GroupId,
        name,
        remark,
        categoriesIds,
      }).then(() => {
        setLoading(false)
        form?.resetFields()
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
        <div  className={styles.edit_content}>
          <Form
            form={form}
            layout='vertical'
            autoComplete='off'
            disabled={disabled || loading}
          >
            <Form.Item
              label='规则组名称'
              name='name'
              rules={[{ required: true, message: '请输入规则组名称' }]}
            >
              <Input placeholder='请输入规则组名称' allowClear />
            </Form.Item>
            <Form.Item
              label='规则分类'
              name='categoriesIds'
              rules={[{ required: true, message: '请选择规则分类' }]}
            >
              <Select mode='multiple' allowClear placeholder='请选择规则分类'>
                <Select.Option value={1}>类目一</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label='规则组描述' name='remark'>
              <Input.TextArea
                placeholder='请输入200字以内的规则组描述'
                allowClear
                maxLength={200}
                showCount
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  )
}
