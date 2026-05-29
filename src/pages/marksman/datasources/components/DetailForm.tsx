import React, { useEffect, useMemo, useState } from 'react'
import { useRequest } from 'ahooks'
import { Modal, Form, Input, Select, Row, Col, message } from 'antd'
import type {
  CreateDatasourceParams,
  UpdateDatasourceParams,
  DatasourceItem,
} from '@/api/marksman/datasource/index'
import {
  createDatasource,
  updateDatasource,
  DatasourceType,
  DatasourceDriver,
} from '@/api/marksman/datasource/index'
import {
  getLevelSelectList,
  LevelType,
} from '@/api/marksman/level'
import { GlobalStatus } from '@/api'
import KeyValueEditor from '@/components/KeyValueEditor'
import {
  keyValueRowsToRecord,
  recordToKeyValueRows,
  type KeyValueRow,
} from '@/components/keyValueUtils'
import { useLocale } from '@/contexts/LocaleContext'

interface DatasourceFormValues {
  name?: string
  type?: DatasourceType
  driver?: DatasourceDriver
  levelUid?: string
  url?: string
  remark?: string
  metadataPairs?: KeyValueRow[]
}

interface DetailFormProps {
  open: boolean
  mode: 'create' | 'edit'
  initialData?: DatasourceItem | null
  onCancel: () => void
  onSuccess: (created?: DatasourceItem) => void
  closable?: boolean
}

const DetailForm: React.FC<DetailFormProps> = ({
  open,
  mode,
  initialData,
  onCancel,
  onSuccess,
  closable = true,
}) => {
  const { t } = useLocale()
  const [form] = Form.useForm<DatasourceFormValues>()
  const [loading, setLoading] = useState(false)

  const { data: levelSelectRes } = useRequest(
    () =>
      getLevelSelectList({
        limit: 100,
        status: GlobalStatus.ENABLED,
        type: LevelType.LEVEL_TYPE_DATASOURCE,
      }),
    { ready: open },
  )

  const levelSelectOptions = levelSelectRes?.items ?? []

  const typeOptions = useMemo(
    () =>
      Object.values(DatasourceType)
        .filter((v) => v !== DatasourceType.DatasourceType_UNKNOWN)
        .map((value) => ({ value, label: t(`datasource.type.${value}`) })),
    [t],
  )

  const driverOptions = useMemo(
    () =>
      Object.values(DatasourceDriver)
        .filter((v) => v !== DatasourceDriver.DatasourceDriver_UNKNOWN)
        .map((value) => ({ value, label: t(`datasource.driver.${value}`) })),
    [t],
  )

  useEffect(() => {
    if (open && mode === 'edit' && initialData) {
      form.setFieldsValue({
        name: initialData.name ?? '',
        type: initialData.type,
        driver: initialData.driver,
        levelUid: initialData.levelUid,
        url: initialData.url ?? '',
        remark: initialData.remark ?? '',
        metadataPairs: recordToKeyValueRows(initialData.metadata),
      })
    } else if (open && mode === 'create') {
      form.resetFields()
    }
  }, [open, mode, initialData, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const metadata = keyValueRowsToRecord(values.metadataPairs)

      if (mode === 'create') {
        const params: CreateDatasourceParams = {
          name: values.name?.trim() || undefined,
          type: values.type,
          driver: values.driver,
          levelUid: values.levelUid || undefined,
          url: values.url?.trim() || undefined,
          remark: values.remark?.trim() || undefined,
          metadata,
        }
        const created = await createDatasource(params)
        message.success(t('message.create.success'))
        onSuccess(created)
      } else if (mode === 'edit' && initialData?.uid) {
        const params: UpdateDatasourceParams = {
          name: values.name?.trim() || undefined,
          type: values.type,
          driver: values.driver,
          levelUid: values.levelUid || undefined,
          url: values.url?.trim() || undefined,
          remark: values.remark?.trim() || undefined,
          metadata,
        }
        await updateDatasource(initialData.uid, params)
        message.success(t('message.update.success'))
        onSuccess()
      } else {
        onSuccess()
      }
      onCancel()
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      console.error('提交失败:', err)
      message.error(t('message.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title={
        mode === 'create'
          ? t('datasource.modal.create.title')
          : t('datasource.modal.edit.title')
      }
      open={open}
      onOk={handleSubmit}
      onCancel={closable ? handleCancel : undefined}
      closable={closable}
      maskClosable={closable}
      destroyOnHidden
      confirmLoading={loading}
      okText={t('common.submit')}
      cancelButtonProps={closable ? undefined : { style: { display: 'none' } }}
      width='60vw'
    >
      <Form form={form} layout='vertical' preserve={false}>
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name='name'
              label={t('datasource.form.name.label')}
              rules={[
                {
                  required: true,
                  message: t('datasource.form.name.placeholder'),
                },
              ]}
            >
              <Input
                placeholder={t('datasource.form.name.placeholder')}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name='levelUid'
              label={t('datasource.form.levelUid.label')}
            >
              <Select
                placeholder={t('datasource.form.levelUid.placeholder')}
                allowClear
                showSearch={{
                  optionFilterProp: 'label',
                  filterOption: (input, opt) =>
                    (opt?.label ?? '')
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase()),
                }}
                options={levelSelectOptions.map((o) => ({
                  value: o.value,
                  label: o.label ?? o.value,
                  disabled: o.disabled,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='type'
              label={t('datasource.form.type.label')}
              rules={[
                {
                  required: true,
                  message: t('datasource.form.type.placeholder'),
                },
              ]}
            >
              <Select
                placeholder={t('datasource.form.type.placeholder')}
                options={typeOptions}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='driver'
              label={t('datasource.form.driver.label')}
              rules={[
                {
                  required: true,
                  message: t('datasource.form.driver.placeholder'),
                },
              ]}
            >
              <Select
                placeholder={t('datasource.form.driver.placeholder')}
                options={driverOptions}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name='url'
          label={t('datasource.form.url.label')}
          rules={[
            { required: true, message: t('datasource.form.url.placeholder') },
            {
              validator: (_, value) => {
                if (!value || typeof value !== 'string')
                  return Promise.resolve()
                const trimmed = value.trim()
                if (!trimmed)
                  return Promise.reject(
                    new Error(t('datasource.form.url.placeholder')),
                  )
                try {
                  const u = new URL(trimmed)
                  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
                    return Promise.reject(
                      new Error(t('datasource.form.url.invalid')),
                    )
                  }
                  return Promise.resolve()
                } catch {
                  return Promise.reject(
                    new Error(t('datasource.form.url.invalid')),
                  )
                }
              },
            },
          ]}
        >
          <Input
            placeholder={t('datasource.form.url.placeholder')}
            allowClear
          />
        </Form.Item>
        <Form.Item name='remark' label={t('datasource.form.remark.label')}>
          <Input.TextArea
            rows={2}
            placeholder={t('datasource.form.remark.placeholder')}
            allowClear
          />
        </Form.Item>
        <KeyValueEditor
          name='metadataPairs'
          label={t('datasource.form.metadata.label')}
          extra={t('datasource.form.metadata.help')}
          columnRatio={[1, 2]}
        />
      </Form>
    </Modal>
  )
}

export default DetailForm
