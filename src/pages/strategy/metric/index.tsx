import { SelectType, Status, StatusData } from '@/api/global'
import {
  createStrategyTemplate,
  getStrategyTemplateList,
  updateStrategyTemplate,
} from '@/api/template'
import {
  GetStrategyTemplateListRequest,
  StrategyTemplateItemType,
} from '@/api/template/types'
import datasourceapi, {
  DatasourceItemType,
  DatasourceListRequest,
} from '@/api/datasource'
import { Flex, Button, Form, Table, Space, Badge, theme, Tag } from 'antd'
import { ColumnsType } from 'antd/es/table'
import React, { useEffect, useState, useRef } from 'react'
import SearchForm from '@/components/data/search-form'
import SearchBox from '@/components/data/search-box'

import { searchItems, formList  } from './options'
import { UserItem } from '@/api/authorization/user'

import styles from './index.module.scss'
import { TemplateEditModal, TemplateEditModalData } from './template-edit-modal'

export interface StrategyTemplateProps { }

const { useToken } = theme

const defaultSearchDatasourceParams: DatasourceListRequest = {
  pagination: {
    pageNum: 1,
    pageSize: 100,
  },
}
const defaultSearchParams: GetStrategyTemplateListRequest = {
  pagination: {
    pageNum: 1,
    pageSize: 10,
  },
  keyword: '',
  status: Status.ALL,
}

let searchTimeout: NodeJS.Timeout | null = null
const StrategyMetric: React.FC<StrategyTemplateProps> = () => {
  const [form] = Form.useForm()
  const { token } = useToken()
  const [datasource, setDatasource] = useState<StrategyTemplateItemType[]>([])
  const [searchPrams, setSearchPrams] =
    useState<GetStrategyTemplateListRequest>(defaultSearchParams)
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [total, setTotal] = useState(0)
  const [openTemplateEditModal, setOpenTemplateEditModal] = useState(false)
  const [editTemplateId, setEditTemplateId] = useState<number>()
  const searchRef = useRef(null)
  const [disabledEditTemplateModal, setDisabledEditTemplateModal] =
    useState(false)
    const [searchDatasourceParams, setSearchDatasourceParams] =
    React.useState<DatasourceListRequest>(defaultSearchDatasourceParams)
  const handleOpenTemplateEditModal = (editId?: number) => {
    setEditTemplateId(editId)
    datasourceapi.getDatasourceList(searchDatasourceParams).then((res) => {
      setDatasource(res?.list || [])
    })
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
      getStrategyTemplateList(searchPrams)
        .then(({ list, pagination }) => {
          setDatasource(list)
          setTotal(pagination.total)
        })
        .finally(() => setLoading(false))
    }, 500)
  }

  const columns: ColumnsType<StrategyTemplateItemType> = [
    {
      title: '模板名称',
      dataIndex: 'alert',
      align: "center",
      key: 'alert',
      ellipsis: true,
      width: '15%',
      render: (text, record) => (
        <Button type='link' onClick={() => showDetail(record.id)}>
          {text}
        </Button>
      ),
    },
    {
      title: '类型',
      dataIndex: 'categories',
      key: 'categories',
      align: "center",
      ellipsis: true,
      width: '10%',
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
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      ellipsis: true,
      width: '10%',
      render: (status: Status) => {
        const { text, color } = StatusData[status]
        return <Badge color={color} text={text} />
      },
    },
    {
      title: '模板描述',
      dataIndex: 'remark',
      key: 'remark',
      align: "center",
      ellipsis: true,
      width: '15%',
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      align: "center",
      ellipsis: true,
      width: '10%',
      render: (creator?: UserItem) => {
        if (!creator) {
          return '-'
        }
        const { name, nickname } = creator
        return <a>{`${name}(${nickname})`}</a>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: "center",
      ellipsis: true,
      width: '10%',
    },
    {
      title: '操作',
      key: 'action',
      align: "center",
      ellipsis: true,
      width: '10%',
      render: (_, record) => (
        <Space size={8}>
          <Button size='small' type='link' onClick={() => onEdit(record.id)}>
            编辑
          </Button>
          <Button
            size='small'
            type='link'
            danger
            onClick={() => onDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
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
    const { alert, expr, remark, labels, annotations, level, categoriesIds } =
      data
    const params = {
      alert: alert,
      expr: expr,
      remark: remark,
      labels: labels,
      annotations: annotations,
      level: level,
      categoriesIds: categoriesIds,
    }
    const call = () => {
      if (!editTemplateId) {
        return createStrategyTemplate(params)
      } else {
        return updateStrategyTemplate(editTemplateId, params)
      }
    }
    return call().then(() => {
      handleCloseTemplateEditModal()
      onRefresh()
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onValuesChange(_: any, allValues: any) {
    setSearchPrams((prev) => {
      return {
        ...prev,
        ...allValues,
      }
    })
  }

  useEffect(() => {
    onRefresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchPrams])

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh])

  const onSearch = () => {
  }

  const addTask = () => {

  }

  return (
    <div className={styles.box}>
      <TemplateEditModal
        title={
          editTemplateId
            ? disabledEditTemplateModal
              ? '策略详情'
              : '编辑策略'
            : '新建策略'
        }
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
          borderRadius: token.borderRadius,
        }}
      >
       <SearchBox
          formList={formList}
          onSearch={onSearch}
        ></SearchBox>
      </div>
      <Table
        size='middle'
        className={styles.table}
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius,
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
            setSearchPrams({
              ...searchPrams,
              pagination: {
                pageNum: page,
                pageSize: pageSize,
              },
            })
          },
        }}
      />
    </div>
  )
}

export default StrategyMetric
