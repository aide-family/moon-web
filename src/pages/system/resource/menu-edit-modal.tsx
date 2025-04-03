import { MenuType } from '@/api/enum'
import { ActionKey } from '@/api/global'
import { createMenu, updateMenu } from '@/api/menu'
import { MenuItem } from '@/api/model-types'
import { DataFrom, DataFromItem } from '@/components/data/form'
import { getMenu } from '@/mocks'
import { useRequest } from 'ahooks'
import { Form, Modal, type ModalProps } from 'antd'
import React, { useEffect, useState } from 'react'
import { menuEditModalFormItems } from './options'

// const { Option } = Select

interface MenuEditModalProps extends ModalProps {
  menuId?: number
  disabled?: boolean
  action?: ActionKey
  onOk?: () => void
}

const MenuEditModal: React.FC<MenuEditModalProps> = (props) => {
  const { open, onCancel, menuId, title, disabled, onOk, action } = props
  const [form] = Form.useForm()
  const [menuDetail, setMenuDetail] = useState<MenuItem>()
  const [formItems, setFormItems] = useState<(DataFromItem | DataFromItem[])[]>([])
  const menuTypeValue = Form.useWatch('menuType', form)

  const { run: initMenuDetail, loading: initMenuDetailLoading } = useRequest(getMenu, {
    manual: true,
    onSuccess: (data) => {
      console.log('data', data)
      setMenuDetail(data.menu)
    }
  })
  useEffect(() => {
    if (menuId && open && action !== ActionKey.ADD) {
      console.log('menuId', menuId)
      // 在这里根据 menuId 发起请求获取菜单详情数据
      initMenuDetail({ id: menuId })
    }
  }, [menuId, form, open, action, initMenuDetail])

  useEffect(() => {
    if (open && form && menuDetail) {
      form?.setFieldsValue(menuDetail)
      return
    }
    form?.resetFields()
  }, [menuDetail, open, form])
  useEffect(() => {
    if (open && form) {
      setFormItems(menuEditModalFormItems(form.getFieldsValue()))
    }
  }, [menuTypeValue, form, open])
  const handleOnCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    onCancel?.(e)
    form?.resetFields()
    setMenuDetail(undefined)
  }
  const { run: updateMenuDetail, loading: updateMenuDetailLoading } = useRequest(updateMenu, {
    manual: true,
    onSuccess: () => {
      form.resetFields()
      onOk?.()
    }
  })
  const { run: createMenuDetail, loading: createMenuDetailLoading } = useRequest(createMenu, {
    manual: true,
    onSuccess: () => {
      form.resetFields()
      onOk?.()
    }
  })

  const handleOnOk = () => {
    form?.validateFields().then((formValues) => {
      //   const data = {
      //     ...menuDetail,
      //     ...formValues
      //   }
      //   console.log('data', data)
      if (action === ActionKey.ADD) {
        if (menuId) {
          formValues.parentId = menuId
        } else {
          formValues.parentId = 0
        }
        const data: MenuItem = {
          ...formValues
        }
        console.log('data', data)
        createMenuDetail(data)
      } else {
        const data = {
          ...menuDetail,
          ...formValues
        }
        console.log('data', data)
        menuId && updateMenuDetail({ id: menuId, data })
      }
    })
  }

  return (
    <Modal
      {...props}
      title={title}
      open={open}
      onCancel={handleOnCancel}
      onOk={handleOnOk}
      confirmLoading={updateMenuDetailLoading || createMenuDetailLoading}
    >
      <DataFrom
        items={formItems}
        props={{
          form,
          layout: 'vertical',
          autoComplete: 'off',
          disabled: disabled || initMenuDetailLoading,
          initialValues: {
            menuType: MenuType.MenuTypeMenu
          }
        }}
      />
    </Modal>
  )
}

export default MenuEditModal
