import { CreateDictRequest, getDict } from '@/api/dict'
import { Status } from '@/api/enum'
import { DictItem } from '@/api/model-types'
import { DataFrom } from '@/components/data/form'
import { Form, Modal, ModalProps } from 'antd'
import React, { useEffect, useState } from 'react'
import { ColorType, CreateDictFormType, editModalFormItems } from './options'

export interface GroupEditModalProps extends ModalProps {
  groupId?: number
  disabled?: boolean
  submit?: (data: CreateDictRequest & { id?: number }) => Promise<void>
}

export const GroupEditModal: React.FC<GroupEditModalProps> = (props) => {
  const { onCancel, submit, open, title, groupId, disabled } = props
  const [form] = Form.useForm<CreateDictFormType>()
  const [loading, setLoading] = useState(false)
  const [grounpDetail, setGroupDetail] = useState<DictItem>()
  const colorType = Form.useWatch<ColorType>('colorType', form)

  const getGroupDetail = async () => {
    if (groupId) {
      setLoading(true)
      getDict({ id: groupId })
        .then(({ detail }) => {
          setGroupDetail(detail)
        })
        .finally(() => setLoading(false))
    }
  }

  useEffect(() => {
    if (!groupId) {
      setGroupDetail(undefined)
    }
    getGroupDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId])

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

  const getCssClass = (formValues: CreateDictFormType): string => {
    const cssClass = formValues.cssClass
    if (typeof cssClass === 'string') {
      return cssClass
    }
    switch (colorType) {
      case 'hex':
        return cssClass.toHexString()
      case 'rgb':
        return cssClass.toRgbString()
      case 'hsb':
        return cssClass.toHsbString()
      default:
        return ''
    }
  }

  const handleOnOk = () => {
    form?.validateFields().then((formValues) => {
      setLoading(true)
      submit?.({
        ...formValues,
        cssClass: getCssClass(formValues),
        status: Status.StatusEnable,
        id: groupId
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
      <Modal {...props} title={title} open={open} onCancel={handleOnCancel} onOk={handleOnOk} confirmLoading={loading}>
        <DataFrom
          items={editModalFormItems(colorType)}
          props={{ form, layout: 'vertical', autoComplete: 'off', disabled: disabled || loading }}
        />
      </Modal>
    </>
  )
}
