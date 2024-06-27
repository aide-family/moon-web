import { MetricLabelType } from '@/api/datasource/metric'
import { Modal, ModalProps } from 'antd'
import React from 'react'

export interface LabelEditModalProps extends ModalProps {
  labelDetail?: MetricLabelType
}

export const LabelEditModal: React.FC<LabelEditModalProps> = (props) => {
  const { labelDetail } = props

  return <Modal {...props} title={labelDetail?.name}></Modal>
}
