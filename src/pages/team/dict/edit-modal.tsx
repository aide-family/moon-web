import { createDict, getDict, updateDict } from '@/api/dict'
import { Status } from '@/api/enum'
import type { DictItem } from '@/api/model-types'
import { DataFrom } from '@/components/data/form'
import { useRequest } from 'ahooks'
import { Form, Modal, type ModalProps } from 'antd'
import type React from 'react'
import { useEffect, useState } from 'react'
import { type ColorType, type CreateDictFormType, editModalFormItems } from './options'

export interface GroupEditModalProps extends ModalProps {
  groupId?: number
  disabled?: boolean
  onOk?: () => void
}

export const GroupEditModal: React.FC<GroupEditModalProps> = (props) => {
  const { onCancel, open, title, groupId, disabled, onOk } = props
  const [form] = Form.useForm<CreateDictFormType>()
  const [grounpDetail, setGroupDetail] = useState<DictItem>()
  const colorType = Form.useWatch<ColorType>('colorType', form)

  const { run: getGroupDetail, loading: getGroupDetailLoading } = useRequest(getDict, {
    manual: true,
    onSuccess: (data) => {
      setGroupDetail(data.detail)
    }
  })

  const { run: addDict, loading: addDictLoading } = useRequest(createDict, {
    manual: true,
    onSuccess: () => {
      form?.resetFields()
    }
  })

  const { run: editDict, loading: editDictLoading } = useRequest(updateDict, {
    manual: true,
    onSuccess: () => {
      form?.resetFields()
      setGroupDetail(undefined)
      onOk?.()
    }
  })

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
    if (disabled) {
      return
    }
    form?.validateFields().then((formValues) => {
      const data = {
        ...formValues,
        cssClass: getCssClass(formValues),
        status: Status.StatusEnable
      }
      if (groupId) {
        editDict({ data, id: groupId })
      } else {
        addDict({ ...data })
      }
    })
  }

  useEffect(() => {
    if (open && form && grounpDetail) {
      form?.setFieldsValue(grounpDetail)
      return
    }
    form?.resetFields()
  }, [grounpDetail, open, form])

  useEffect(() => {
    if (groupId) {
      getGroupDetail({ id: groupId })
    }
  }, [getGroupDetail, groupId])

  return (
    <>
      <Modal
        {...props}
        title={title}
        open={open}
        loading={getGroupDetailLoading}
        onCancel={handleOnCancel}
        onOk={handleOnOk}
        confirmLoading={addDictLoading || editDictLoading}
      >
        <DataFrom
          items={editModalFormItems(colorType)}
          props={{
            form,
            layout: 'vertical',
            autoComplete: 'off',
            disabled: disabled || addDictLoading || editDictLoading
          }}
        />
      </Modal>
    </>
  )
}
