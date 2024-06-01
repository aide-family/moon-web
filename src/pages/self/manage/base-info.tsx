import { DataFrom } from "@/components/data/form"
import React from "react"
import { baseInfoOptions } from "./options"
import { Button, Form, Space } from "antd"

export interface BaseInfoProps {}

export const BaseInfo: React.FC<BaseInfoProps> = () => {
  const [form] = Form.useForm()
  return (
    <div>
      <DataFrom
        items={baseInfoOptions}
        form={form}
        props={{ layout: "vertical" }}
      >
        <Space size={8}>
          <Form.Item>
            <Button type='default' htmlType='reset'>
              重置
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              保存
            </Button>
          </Form.Item>
        </Space>
      </DataFrom>
    </div>
  )
}
