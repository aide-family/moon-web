import { Status } from '@/api/enum'
import { defaultPaginationReq } from '@/api/global'
import { TimeEngineItem } from '@/api/model-types'
import { createTimeEngine, CreateTimeEngineRequest, getTimeEngine, updateTimeEngine } from '@/api/notify/time-engine'
import { ErrorResponse } from '@/api/request'
import { useTimeEngineRuleList } from '@/hooks/select'
import { handleFormError } from '@/utils'
import { useRequest } from 'ahooks'
import { Form, Input, Modal, Select } from 'antd'
import { useEffect, useState } from 'react'

export interface EditModalProps {
  open?: boolean
  engineId?: number
  onOk?: (engine: CreateTimeEngineRequest) => void
  onCancel?: () => void
}

export function EngineEditModal(props: EditModalProps) {
  const { open, engineId: Id, onOk, onCancel } = props

  const [form] = Form.useForm<CreateTimeEngineRequest>()

  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<TimeEngineItem>()
  const { timeEngineRuleList, timeEngineRuleListLoading } = useTimeEngineRuleList({
    pagination: defaultPaginationReq
  })

  const init = () => {
    setDetail(undefined)
    form.resetFields()
  }

  const handleOnOk = () => {
    form.validateFields().then((values) => {
      setLoading(true)
      if (Id) {
        updateTimeEngine({ id: Id, data: values })
          .then(() => {
            init()
            onOk?.(values)
          })
          .catch((err: ErrorResponse) => {
            handleFormError(form, err)
          })
          .finally(() => {
            setLoading(false)
          })
      } else {
        createTimeEngine({ ...values, status: Status.StatusEnable })
          .then(() => {
            init()
            onOk?.(values)
          })
          .catch((err: ErrorResponse) => {
            handleFormError(form, err)
          })
          .finally(() => {
            setLoading(false)
          })
      }
    })
  }

  const handleOnCancel = () => {
    onCancel?.()
  }

  const { run: handleGetDetail } = useRequest((id: number) => getTimeEngine(id), {
    manual: true, // 手动触发请求
    onSuccess: (res) => {
      setDetail(res.detail)
    }
  })

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        name: detail.name,
        rules: detail.rules.map((rule) => rule.id),
        remark: detail.remark
      })
    } else {
      form.resetFields()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail])

  useEffect(() => {
    init()
    if (Id && open) {
      handleGetDetail(Id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Id, open])

  return (
    <>
      <Modal
        title={`${Id ? '编辑' : '新增'}时间引擎`}
        open={open}
        onOk={handleOnOk}
        onCancel={handleOnCancel}
        loading={loading}
      >
        <Form form={form} layout='vertical' autoComplete='off'>
          <Form.Item label='名称' name='name' rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder='请输入名称' />
          </Form.Item>
          <Form.Item
            label='规则'
            name='rules'
            tooltip='规则是时间引擎的执行单元，他们之间是且的关系，也就是说，只有当所有规则都满足时，才表示满足条件'
          >
            <Select
              loading={timeEngineRuleListLoading}
              placeholder='请选择规则'
              mode='multiple'
              options={timeEngineRuleList.map((rule) => ({ label: rule.name, value: rule.id }))}
            />
          </Form.Item>
          <Form.Item label='备注' name='remark'>
            <Input.TextArea placeholder='请输入备注' showCount maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
