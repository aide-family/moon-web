import { ResourceItem, TeamRole } from '@/api/model-types'
import { listResource, ListResourceRequest } from '@/api/resource'
import { CreateRoleRequest, getRole } from '@/api/team/role'
import { DataFrom } from '@/components/data/form'
import { Form, Modal, ModalProps, TransferProps } from 'antd'
import FormItem from 'antd/es/form/FormItem'
import { TransferKey } from 'antd/es/transfer/interface'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
import styles from './index.module.scss'
import { editModalFormItems } from './options'
import { filterOption, TableTransfer, TableTransferProps } from './table-transfer'

export interface GroupEditModalProps extends ModalProps {
  groupId?: number
  disabled?: boolean
  submit?: (data: CreateRoleRequest & { id?: number }) => Promise<void>
}

export const GroupEditModal: React.FC<GroupEditModalProps> = (props) => {
  const { onCancel, submit, open, title, groupId, disabled } = props
  const [form] = Form.useForm<CreateRoleRequest>()
  const [loading, setLoading] = useState(false)
  const [grounpDetail, setGroupDetail] = useState<TeamRole>()
  const [targetKeys, setTargetKeys] = useState<TransferProps['targetKeys']>([])
  const [resourceList, setResourceList] = useState<ResourceItem[]>([])

  const getGroupDetail = async () => {
    if (groupId) {
      setLoading(true)
      getRole({ id: groupId })
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
  }, [grounpDetail, open, form])

  const handleOnCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    onCancel?.(e)
    form?.resetFields()
    setGroupDetail(undefined)
    setTargetKeys([])
    setResourceList([])
  }

  const handleOnOk = () => {
    form?.validateFields().then((formValues) => {
      setLoading(true)
      submit?.({
        ...formValues,
        id: groupId
      })
        .then(() => {
          form?.resetFields()
          setGroupDetail(undefined)
          setTargetKeys([])
          setResourceList([])
        })
        .finally(() => {
          setLoading(false)
        })
    })
  }

  const fetchData = useCallback(
    debounce(async (params: ListResourceRequest) => {
      listResource(params).then(({ list }) => {
        setResourceList(list || [])
      })
    }, 500),
    []
  )

  useEffect(() => {
    const permissions = grounpDetail?.resources || []
    setTargetKeys(resourceList?.map((item) => item.id).filter((id) => permissions.some((p) => p.id === id)) || [])
  }, [grounpDetail, resourceList])

  useEffect(() => {
    if (!open) return
    fetchData({ pagination: { pageNum: 1, pageSize: 999 } })
  }, [fetchData, open])

  const onChange: TableTransferProps['onChange'] = (targetKeys: TransferKey[]) => {
    setTargetKeys(targetKeys)
  }

  return (
    <>
      <Modal
        className={styles.modal}
        {...props}
        title={title}
        open={open}
        onCancel={handleOnCancel}
        onOk={handleOnOk}
        confirmLoading={loading}
      >
        <div className={styles.edit_content}>
          <DataFrom
            items={editModalFormItems}
            props={{ form, layout: 'vertical', autoComplete: 'off', disabled: disabled || loading }}
          >
            <FormItem label='权限列表' name='permissions'>
              <TableTransfer
                targetKeys={targetKeys}
                onChange={onChange}
                filterOption={filterOption}
                disabled={disabled}
                showSearch
                showSelectAll={false}
                dataSource={resourceList.map((item) => ({ ...item, key: item.id }))}
              />
            </FormItem>
          </DataFrom>
        </div>
      </Modal>
    </>
  )
}
