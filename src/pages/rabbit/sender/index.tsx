import React from 'react'
import { useLocale } from '@/contexts/LocaleContext'

export default function SenderManagement() {
  const { t } = useLocale()

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 shrink-0">
        <h2 className="text-lg font-medium">{t('rabbit.sender.title')}</h2>
      </div>
      <div className="flex-1 flex items-center justify-center text-gray-500">
        {t('common.noData')}
      </div>
    </div>
  )
}
