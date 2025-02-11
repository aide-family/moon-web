import { dictSelectList } from '@/api/dict'
import { DictType } from '@/api/enum'
import { defaultPaginationReq } from '@/api/global'
import type { SelectItem, StrategyGroupItem } from '@/api/model-types'
import { createStrategyGroup, getStrategyGroup, updateStrategyGroup } from '@/api/strategy'
import { useRequest } from 'ahooks'
import { Form, Input, Modal, type ModalProps, Select, Tag } from 'antd'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { GroupEditModalFormData } from './options'

export type GroupEditModalData = {
  id?: number
  // 规则组名称
  name: string
  // 规则组描述
  remark: string
  // 规则分类类型
  categoriesIds: number[]
}

export interface GroupEditModalProps extends ModalProps {
  groupId?: number
  disabled?: boolean
  onOk?: () => void
}

export const GroupEditModal: React.FC<GroupEditModalProps> = (props) => {
  const { onCancel, onOk, open, title, groupId, disabled } = props

  const [form] = Form.useForm<GroupEditModalFormData>()

  const [grounpDetail, setGroupDetail] = useState<StrategyGroupItem>()
  const [strategyCategoryList, setStrategyCategoryList] = useState<SelectItem[]>([])

  const { run: initStrategyCategoryList, loading: strategyCategoryListLoading } = useRequest(dictSelectList, {
    manual: true,
    onSuccess: (data) => {
      setStrategyCategoryList(data?.list || [])
    }
  })

  const { run: initDetail, loading: detailLoading } = useRequest(getStrategyGroup, {
    manual: true,
    onSuccess: (data) => {
      setGroupDetail(data.detail)
    }
  })

  const { runAsync: editStrategyGroup, loading: editStrategyGroupLoading } = useRequest(updateStrategyGroup, {
    manual: true
  })

  const { runAsync: addStrategyGroup, loading: addStrategyGroupLoading } = useRequest(createStrategyGroup, {
    manual: true
  })

  const initFormDeps = useCallback(() => {
    initStrategyCategoryList({
      pagination: defaultPaginationReq,
      dictType: DictType.DictTypeStrategyGroupCategory
    })
    if (groupId) {
      initDetail({ id: groupId })
    }
  }, [initStrategyCategoryList, initDetail, groupId])

  useEffect(() => {
    if (open && grounpDetail) {
      form?.setFieldsValue({
        ...grounpDetail,
        categoriesIds: grounpDetail.categories?.map((item) => item.id) || []
      })
      return
    }
    form?.resetFields()
  }, [grounpDetail, open, form])

  useEffect(() => {
    if (open) {
      initFormDeps()
    }
  }, [open, initFormDeps])

  const handleOnCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    onCancel?.(e)
    form?.resetFields()
    setGroupDetail(undefined)
  }

  const handleOnOk = () => {
    form?.validateFields().then((formValues) => {
      const { name, remark, categoriesIds } = formValues
      const data = {
        id: groupId,
        name,
        remark,
        categoriesIds
      }
      Promise.all([groupId ? editStrategyGroup({ id: groupId, update: data }) : addStrategyGroup(data)]).then(() => {
        onOk?.()
      })
    })
  }

  return (
    <>
      <Modal
        {...props}
        title={title}
        loading={detailLoading}
        open={open}
        onCancel={handleOnCancel}
        onOk={handleOnOk}
        confirmLoading={editStrategyGroupLoading || addStrategyGroupLoading}
      >
        <Form
          form={form}
          layout='vertical'
          autoComplete='off'
          disabled={disabled || editStrategyGroupLoading || addStrategyGroupLoading}
        >
          <Form.Item label='规则组名称' name='name' rules={[{ required: true, message: '请输入规则组名称' }]}>
            <Input placeholder='请输入规则组名称' allowClear />
          </Form.Item>
          <Form.Item label='规则组分类' name='categoriesIds' rules={[{ required: true, message: '请选择规则组分类' }]}>
            <Select
              placeholder='请选择策略组类型'
              allowClear
              mode='multiple'
              loading={strategyCategoryListLoading}
              options={strategyCategoryList.map((item) => ({
                label: (
                  <Tag bordered={false} color={item.extend?.color}>
                    {item.label}
                  </Tag>
                ),
                value: item.value,
                disabled: item.disabled
              }))}
            />
          </Form.Item>
          <Form.Item label='规则组描述' name='remark'>
            <Input.TextArea placeholder='请输入200字以内的规则组描述' allowClear maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
