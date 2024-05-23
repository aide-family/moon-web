import { DataFrom, DataFromItem } from "@/components/data/form"
import { Form, Modal, ModalProps } from "antd"
import React, { useEffect } from "react"

export interface EditSpaceModalProps extends ModalProps {
  spaceId?: string
}

const items: (DataFromItem | DataFromItem[])[] = [
  {
    label: "团队名称",
    name: "name",
    type: "input",
    props: {
      placeholder: "请输入团队名称",
      maxLength: 20,
    },
  },
  {
    label: "团队描述",
    name: "remark",
    type: "textarea",
    props: {
      placeholder: "请输入团队描述",
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
  const [form] = Form.useForm()
  const [detail, setDetail] = React.useState<unknown>({})
  useEffect(() => {
    if (spaceId) {
      // TODO: 获取团队详情
      setDetail({
        name: "Moon监控团队",
        remark: "Moon监控团队是Moon监控的默认团队，用于管理Moon监控的资源。",
      })
    }
  }, [spaceId])

  useEffect(() => {
    form?.setFieldsValue(detail)
  }, [detail, form])
  return (
    <Modal title='编辑团队信息' open={open} onOk={onOk} onCancel={onCancel}>
      <DataFrom items={items} form={form} props={{ layout: "vertical" }} />
    </Modal>
  )
}
