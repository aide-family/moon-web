import { StrategyType } from '@/api/enum'
import { StrategyTypeData } from '@/api/global'
import SelectFeature from '@/components/data/child/select-feature'
import { Form, Modal, ModalProps } from 'antd'

export interface StrategyTypeModalProps extends ModalProps {
  onSubmit: (data: StrategyType) => void
}

export default function StrategyTypeModal(props: StrategyTypeModalProps) {
  const { onSubmit, ...restProps } = props
  const [form] = Form.useForm<{ type: StrategyType }>()

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSubmit(values.type)
    })
  }

  return (
    <Modal {...restProps} onOk={handleSubmit} okText='确定' cancelText='取消'>
      <Form form={form} layout='vertical'>
        <Form.Item label='策略类型' name='type'>
          <SelectFeature
            options={Object.entries(StrategyTypeData)
              .filter(([key]) => +key !== StrategyType.StrategyTypeUnknown)
              .map(([key, value]) => ({
                label: value,
                value: +key
              }))}
            value={form.getFieldValue('type')}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
