import React from 'react'
import { Card } from 'antd'
import { useLocale } from '@/contexts/LocaleContext'

const TemplateManagement: React.FC = () => {
  const { t } = useLocale()

  return (
    <div className="p-4">
      <Card title={t('rabbit.templates.title')}>
        <p>{t('rabbit.templates.description')}</p>
        {/* 模板管理功能待实现 */}
      </Card>
    </div>
  )
}

export default TemplateManagement
