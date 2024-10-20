import { SelectType, StatusData } from '@/api/global'

import SearchForm from '@/components/data/search-form'
import { Badge, Button, Flex, Form, Space, Table, Tag, theme } from 'antd'
import { ColumnsType } from 'antd/es/table'
import React, { useEffect, useState } from 'react'
import { searchItems } from './options'

import { Status } from '@/api/enum'
import { StrategyTemplateItem, UserItem } from '@/api/model-types'
import {
  createTemplateStrategy,
  CreateTemplateStrategyRequest,
  listTemplateStrategy,
  ListTemplateStrategyRequest,
  updateTemplateStrategy
} from '@/api/strategy/template'
import './index.scss'
import { TemplateEditModal, TemplateEditModalData } from './template-edit-modal'

export interface StrategyTemplateProps {}

const { useToken } = theme

const defaultSearchParams: ListTemplateStrategyRequest = {
  pagination: {
    pageNum: 1,
    pageSize: 10
  }
}

let searchTimeout: NodeJS.Timeout | null = null
const StrategyTemplate: React.FC<StrategyTemplateProps> = () => {
  const [form] = Form.useForm()
  const { token } = useToken()
  const [datasource, setDatasource] = useState<StrategyTemplateItem[]>([])
  const [searchParams, setSearchParams] = useState<ListTemplateStrategyRequest>(defaultSearchParams)
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [total, setTotal] = useState(0)
  const [openTemplateEditModal, setOpenTemplateEditModal] = useState(false)
  const [editTemplateId, setEditTemplateId] = useState<number>()
  const [disabledEditTemplateModal, setDisabledEditTemplateModal] = useState(false)
  const handleOpenTemplateEditModal = (editId?: number) => {
    setEditTemplateId(editId)
    setOpenTemplateEditModal(true)
  }

  const handleCloseTemplateEditModal = () => {
    setOpenTemplateEditModal(false)
    setEditTemplateId(0)
    setDisabledEditTemplateModal(false)
  }

  function onRefresh() {
    setRefresh(!refresh)
  }

  function fetchData() {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    searchTimeout = setTimeout(() => {
      setLoading(true)
      listTemplateStrategy(searchParams)
        .then(({ list, pagination }) => {
          setDatasource(list || [])
          setTotal(pagination?.total || 0)
        })
        .finally(() => setLoading(false))
    }, 500)
  }

  const columns: ColumnsType<StrategyTemplateItem> = [
    {
      title: '模板名称',
      dataIndex: 'alert',
      key: 'alert',
      render: (text, record) => (
        <Button type='link' onClick={() => showDetail(record.id)}>
          {text}
        </Button>
      )
    },
    {
      title: '类型',
      dataIndex: 'categories',
      key: 'categories',
      width: 200,
      render: (categories?: SelectType[]) => (
        <>
          {categories?.map((item, index) => {
            const { label, extend } = item
            return (
              <Tag key={index} color={extend?.color}>
                {label}
              </Tag>
            )
          })}
        </>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 100,
      render: (status: Status) => {
        const { text, color } = StatusData[status]
        return <Badge color={color} text={text} />
      }
    },
    {
      title: '模板描述',
      dataIndex: 'remark',
      key: 'remark'
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 200,
      render: (creator?: UserItem) => {
        if (!creator) {
          return '-'
        }
        const { name, nickname } = creator
        return <a>{`${name}(${nickname})`}</a>
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size={8}>
          <Button size='small' type='link' onClick={() => onEdit(record.id)}>
            编辑
          </Button>
          <Button size='small' type='link' danger onClick={() => onDelete(record.id)}>
            删除
          </Button>
        </Space>
      )
    }
  ]
  function showDetail(id: number) {
    setEditTemplateId(id)
    setDisabledEditTemplateModal(true)
    setOpenTemplateEditModal(true)
  }

  function onEdit(id: number) {
    handleOpenTemplateEditModal(id)
  }

  function onDelete(id: number) {
    console.log(id)
  }

  function handleTemplateEditModalSubmit(data: TemplateEditModalData) {
    const { alert, expr, remark, labels, annotations, level, categoriesIds } = data
    const params: CreateTemplateStrategyRequest = {
      alert: alert,
      expr: expr,
      remark: remark,
      labels: labels,
      annotations: annotations,
      categoriesIds: categoriesIds,
      levels: level
    }
    const call = () => {
      if (!editTemplateId) {
        return createTemplateStrategy(params)
      } else {
        return updateTemplateStrategy({ ...params, id: editTemplateId })
      }
    }
    return call().then(() => {
      handleCloseTemplateEditModal()
      onRefresh()
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onValuesChange(_: any, allValues: any) {
    setSearchParams((prev) => {
      return {
        ...prev,
        ...allValues
      }
    })
  }

  useEffect(() => {
    onRefresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh])

  return (
    <div className='box'>
      <TemplateEditModal
        title={editTemplateId ? (disabledEditTemplateModal ? '模版详情' : '编辑模板') : '新建模板'}
        width='60%'
        style={{ minWidth: 504 }}
        open={openTemplateEditModal}
        onCancel={handleCloseTemplateEditModal}
        submit={handleTemplateEditModalSubmit}
        templateId={editTemplateId}
        disabled={disabledEditTemplateModal}
      />
      <div
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius
        }}
      >
        <SearchForm
          initialValues={defaultSearchParams}
          items={searchItems}
          form={form}
          layout='inline'
          className='search'
          onValuesChange={onValuesChange}
        />

        <Flex justify='space-between' align='center' gap={12} className='op'>
          <Button type='primary' onClick={() => handleOpenTemplateEditModal()}>
            新建模板
          </Button>
          <Space size={8}>
            <Button color='default' variant='filled' onClick={onRefresh}>
              刷新
            </Button>
            <Button>导出</Button>
          </Space>
        </Flex>
      </div>
      <Table
        size='middle'
        className='table'
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius
        }}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={datasource}
        loading={loading}
        scroll={{ x: 'auto', y: 'calc(100vh - 400px)' }}
        pagination={{
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => {
            setSearchParams({
              ...searchParams,
              pagination: {
                pageNum: page,
                pageSize: pageSize
              }
            })
          }
        }}
      />
    </div>
  )
}

export default StrategyTemplate
