import { DataFrom } from '@/components/data/form'
import { Form, Modal, ModalProps } from 'antd'
import { useEffect, useState } from 'react'

export interface EditModalProps extends ModalProps {
  datasourceId?: number
}

export const EditModal: React.FC<EditModalProps> = (props) => {
  const { datasourceId, ...rest } = props

  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const fetchDatasourceDetail = async () => {
    if (!datasourceId) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  useEffect(() => {
    fetchDatasourceDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasourceId])

  return (
    <Modal {...rest} loading={loading}>
      <DataFrom
        props={{ form, layout: 'vertical' }}
        items={[
          {
            label: '名称',
            name: 'name',
            type: 'input',
            props: {
              placeholder: '请输入名称'
            }
          }
        ]}
      />
    </Modal>
  )
}
