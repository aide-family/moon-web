import type { ChartItem } from '@/api/model-types'
import { createChart, getChart, updateChart } from '@/api/realtime/dashboard'
import { DataFrom } from '@/components/data/form'
import { handleFormError } from '@/utils'
import { useRequest } from 'ahooks'
import { Form, Modal, type ModalProps, message } from 'antd'
import { useEffect, useState } from 'react'
import { editChartItems } from './options'

export interface ModalEditProps extends ModalProps {
  dashboardId?: number
  chart?: ChartItem
  onOk: () => void
  onCancel: () => void
}

export const ModalEdit = (props: ModalEditProps) => {
  const { dashboardId = 0, chart, open, onCancel, onOk, ...reset } = props

  const [form] = Form.useForm()

  const [detail, setDetail] = useState<ChartItem>()

  const { run: fetchDetail, loading: fetchDetailLoading } = useRequest(getChart, {
    manual: true,
    onSuccess: (res) => {
      setDetail(res.detail)
      form.setFieldsValue(res.detail)
    },
    onError: () => {
      setDetail(chart)
    }
  })

  const { run: addChart, loading: addChartLoading } = useRequest(createChart, {
    manual: true,
    onSuccess: () => {
      onOk()
      message.success('添加成功')
    },
    onError: (err) => {
      handleFormError(form, err)
    }
  })
  const { run: editChart, loading: editChartLoading } = useRequest(updateChart, {
    manual: true,
    onSuccess: () => {
      onOk()
      message.success('编辑成功')
    },
    onError: (err) => {
      handleFormError(form, err)
    }
  })

  const onSubmit = () => {
    if (!dashboardId) {
      message.error('请先选择仪表盘')
      return
    }
    form.validateFields().then((values) => {
      const { width, height, ...rest } = values
      const params = {
        ...rest,
        dashboardId,
        width: width ? `${Math.floor(width)}` : undefined,
        height: height
      }
      if (detail?.id) {
        editChart({ chart: params, id: detail.id, dashboardId })
      } else {
        addChart({ ...params, dashboardId })
      }
    })
  }

  useEffect(() => {
    if (open && chart) {
      fetchDetail({ id: chart.id, dashboardId })
    }
  }, [open, chart, dashboardId, fetchDetail])

  return (
    <Modal
      {...reset}
      title={detail?.title}
      open={open}
      onCancel={onCancel}
      onClose={onCancel}
      onOk={onSubmit}
      loading={fetchDetailLoading}
      confirmLoading={addChartLoading || editChartLoading}
    >
      <DataFrom items={editChartItems()} props={{ form, layout: 'vertical', autoComplete: 'off' }} />
    </Modal>
  )
}
