import React from 'react'
import { Button, Card, Descriptions, Divider, Modal, Space, Tag } from 'antd'
import { useLocale } from '@/contexts/LocaleContext'
import type { MachineInfoItem } from '@/api'

interface MachineDetailModalProps {
  open: boolean
  data?: MachineInfoItem
  onCancel: () => void
}

const textOrDash = (value?: string | number) =>
  value === undefined || value === null || value === '' ? '-' : String(value)

const formatBytes = (
  value?: string | number,
  base: 1000 | 1024 = 1024,
): string => {
  if (value === undefined || value === null || value === '') return '-'
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return String(value)
  if (num === 0) return '0 B'
  const units =
    base === 1024
      ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
      : ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const idx = Math.min(
    Math.floor(Math.log(Math.abs(num)) / Math.log(base)),
    units.length - 1,
  )
  const formatted = num / base ** idx
  return `${formatted.toFixed(formatted >= 100 ? 0 : formatted >= 10 ? 1 : 2)} ${units[idx]}`
}

const MachineDetailModal: React.FC<MachineDetailModalProps> = ({
  open,
  data,
  onCancel,
}) => {
  const { t } = useLocale()

  return (
    <Modal
      title={t('jadeTree.machine.detailTitle')}
      open={open}
      onCancel={onCancel}
      footer={
        <Space>
          <Button onClick={onCancel}>{t('common.close')}</Button>
        </Space>
      }
      width={860}
      destroyOnHidden
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      {data ? (
        <Space direction='vertical' size='middle' style={{ width: '100%' }}>
          <Descriptions
            column={2}
            bordered
            size='small'
            styles={{ label: { width: 140, minWidth: 140 } }}
          >
            <Descriptions.Item label={t('jadeTree.machine.hostName')}>
              {textOrDash(data.host?.hostName)}
            </Descriptions.Item>
            <Descriptions.Item label={t('jadeTree.machine.machineUuid')}>
              {textOrDash(data.host?.machineUuid)}
            </Descriptions.Item>
            <Descriptions.Item label={t('jadeTree.machine.localIp')}>
              {textOrDash(data.network?.localIp)}
            </Descriptions.Item>
            <Descriptions.Item label={t('jadeTree.machine.outboundIp')}>
              {textOrDash(data.network?.outboundIp)}
            </Descriptions.Item>
            <Descriptions.Item label={t('jadeTree.machine.cidr')}>
              {textOrDash(data.network?.cidr)}
            </Descriptions.Item>
            <Descriptions.Item label={t('jadeTree.machine.nics')}>
              {data.network?.nics?.length
                ? data.network.nics.map((nic) => (
                    <Tag key={nic} style={{ marginBottom: 4 }}>
                      {nic}
                    </Tag>
                  ))
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('jadeTree.machine.dnsServers')}>
              {data.network?.dnsServers?.length
                ? data.network.dnsServers.map((dns) => (
                    <Tag key={dns} style={{ marginBottom: 4 }}>
                      {dns}
                    </Tag>
                  ))
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('jadeTree.machine.totalRxBytes')}>
              {formatBytes(data.network?.totalRxBytes, 1000)}
            </Descriptions.Item>
            <Descriptions.Item label={t('jadeTree.machine.totalTxBytes')}>
              {formatBytes(data.network?.totalTxBytes, 1000)}
            </Descriptions.Item>
            <Descriptions.Item label={t('jadeTree.machine.os')}>
              {textOrDash(data.system?.os)}
            </Descriptions.Item>
            <Descriptions.Item label={t('jadeTree.machine.version')}>
              {textOrDash(data.system?.version)}
            </Descriptions.Item>
            <Descriptions.Item label={t('jadeTree.machine.arch')}>
              {textOrDash(data.system?.arch)}
            </Descriptions.Item>
            <Descriptions.Item label={t('jadeTree.machine.kernel')}>
              {textOrDash(data.system?.kernel)}
            </Descriptions.Item>
          </Descriptions>
          <Divider style={{ margin: '8px 0' }}>
            {t('jadeTree.machine.cpu')}
          </Divider>
          <Descriptions
            column={2}
            bordered
            size='small'
            styles={{ label: { width: 140, minWidth: 140 } }}
          >
            <Descriptions.Item label={t('jadeTree.machine.totalCores')}>
              {textOrDash(data.cpu?.totalCores)}
            </Descriptions.Item>
            <Descriptions.Item
              label={t('jadeTree.machine.totalHardwareThreads')}
            >
              {textOrDash(data.cpu?.totalHardwareThreads)}
            </Descriptions.Item>
          </Descriptions>
          {data.cpu?.processors?.map((processor, idx) => (
            <Card
              key={`${processor.id ?? idx}`}
              size='small'
              title={`${t('jadeTree.machine.cpuProcessor')} #${idx + 1}`}
            >
              <Descriptions column={2} size='small'>
                <Descriptions.Item label='ID'>
                  {textOrDash(processor.id)}
                </Descriptions.Item>
                <Descriptions.Item label={t('jadeTree.machine.vendor')}>
                  {textOrDash(processor.vendor)}
                </Descriptions.Item>
                <Descriptions.Item label={t('jadeTree.machine.model')}>
                  {textOrDash(processor.model)}
                </Descriptions.Item>
                <Descriptions.Item label={t('jadeTree.machine.totalCores')}>
                  {textOrDash(processor.totalCores)}
                </Descriptions.Item>
                <Descriptions.Item
                  label={t('jadeTree.machine.totalHardwareThreads')}
                >
                  {textOrDash(processor.totalHardwareThreads)}
                </Descriptions.Item>
                <Descriptions.Item label={t('jadeTree.machine.capabilities')}>
                  {processor.capabilities?.length
                    ? processor.capabilities.join(', ')
                    : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          ))}
          <Divider style={{ margin: '8px 0' }}>
            {t('jadeTree.machine.memory')}
          </Divider>
          <Descriptions
            column={2}
            bordered
            size='small'
            styles={{ label: { width: 140, minWidth: 140 } }}
          >
            <Descriptions.Item label={t('jadeTree.machine.totalPhysicalBytes')}>
              {formatBytes(data.memory?.totalPhysicalBytes, 1024)}
            </Descriptions.Item>
            <Descriptions.Item label={t('jadeTree.machine.totalUsableBytes')}>
              {formatBytes(data.memory?.totalUsableBytes, 1024)}
            </Descriptions.Item>
            <Descriptions.Item label={t('jadeTree.machine.usedBytes')}>
              {formatBytes(data.memory?.usedBytes, 1024)}
            </Descriptions.Item>
            <Descriptions.Item label={t('jadeTree.machine.freeBytes')}>
              {formatBytes(data.memory?.freeBytes, 1024)}
            </Descriptions.Item>
            <Descriptions.Item label={t('jadeTree.machine.availableBytes')}>
              {formatBytes(data.memory?.availableBytes, 1024)}
            </Descriptions.Item>
            <Descriptions.Item label={t('jadeTree.machine.swapUsedBytes')}>
              {formatBytes(data.memory?.swapUsedBytes, 1024)}
            </Descriptions.Item>
          </Descriptions>
          <Divider style={{ margin: '8px 0' }}>
            {t('jadeTree.machine.disks')}
          </Divider>
          {data.disks?.length ? (
            data.disks.map((disk, diskIdx) => (
              <Card
                key={`${disk.name ?? diskIdx}`}
                size='small'
                title={`${t('jadeTree.machine.disk')} #${diskIdx + 1}`}
              >
                <Descriptions column={2} size='small'>
                  <Descriptions.Item label={t('jadeTree.machine.name')}>
                    {textOrDash(disk.name)}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('table.search.type')}>
                    {textOrDash(disk.type)}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('jadeTree.machine.sizeBytes')}>
                    {formatBytes(disk.sizeBytes, 1024)}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('jadeTree.machine.vendor')}>
                    {textOrDash(disk.vendor)}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('jadeTree.machine.model')}>
                    {textOrDash(disk.model)}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('jadeTree.machine.serialNumber')}>
                    {textOrDash(disk.serialNumber)}
                  </Descriptions.Item>
                  <Descriptions.Item label='WWN'>
                    {textOrDash(disk.wwn)}
                  </Descriptions.Item>
                </Descriptions>
                {disk.mounts?.length ? (
                  <div style={{ marginTop: 12 }}>
                    {disk.mounts.map((mount, mountIdx) => (
                      <Card
                        key={`${mount.mountPoint ?? mountIdx}`}
                        size='small'
                        style={{ marginBottom: 8 }}
                        title={`${t('jadeTree.machine.mount')} #${mountIdx + 1}`}
                      >
                        <Descriptions column={2} size='small'>
                          <Descriptions.Item
                            label={t('jadeTree.machine.mountPoint')}
                          >
                            {textOrDash(mount.mountPoint)}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={t('jadeTree.machine.fsType')}
                          >
                            {textOrDash(mount.fsType)}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={t('jadeTree.machine.totalBytes')}
                          >
                            {formatBytes(mount.totalBytes, 1024)}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={t('jadeTree.machine.usedBytes')}
                          >
                            {formatBytes(mount.usedBytes, 1024)}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={t('jadeTree.machine.freeBytes')}
                          >
                            {formatBytes(mount.freeBytes, 1024)}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={t('jadeTree.machine.freeRate')}
                          >
                            {mount.freeRate == null
                              ? '-'
                              : `${(mount.freeRate * 100).toFixed(2)}%`}
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    ))}
                  </div>
                ) : null}
              </Card>
            ))
          ) : (
            <div>{t('common.noData')}</div>
          )}
        </Space>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          {t('common.noData')}
        </div>
      )}
    </Modal>
  )
}

export default MachineDetailModal
