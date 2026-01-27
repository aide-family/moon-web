// 这是一个示例文件，展示如何在新页面中使用国际化
// 实际使用时，请根据实际需求修改

import React from 'react'
import { Button, Card, Space } from 'antd'
import { useLocale } from '@/contexts/LocaleContext'

/**
 * 使用国际化的示例组件
 * 
 * 步骤：
 * 1. 导入 useLocale hook
 * 2. 使用 t() 函数获取翻译文本
 * 3. 所有用户可见的文本都使用 t() 函数
 */
export default function Template1Example() {
  // 获取翻译函数
  const { t } = useLocale()

  return (
    <div className="p-4">
      <Card title={t('template.page.title')}>
        <p>{t('template.page.subtitle')}</p>
        
        <Space>
          {/* 使用通用翻译键 */}
          <Button type="primary">{t('common.add')}</Button>
          <Button>{t('common.edit')}</Button>
          <Button danger>{t('common.delete')}</Button>
          
          {/* 使用模块特定翻译键 */}
          <Button>{t('template.action.view')}</Button>
        </Space>
        
        {/* 带参数翻译示例 */}
        <div className="mt-4">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </Card>
    </div>
  )
}

/**
 * 注意事项：
 * 
 * 1. 优先使用 common.ts 中的通用翻译键
 *   例如：t('common.add') 而不是 t('template.action.add')
 * 
 * 2. 只在需要特定含义时才使用模块特定翻译键
 *   例如：t('template.action.create') 表示"创建模板"
 * 
 * 3. 保持翻译键命名一致性
 *   - 操作：module.action.xxx
 *   - 表单：module.form.xxx
 *   - 表格：module.table.xxx
 *   - 消息：module.message.xxx
 * 
 * 4. 避免硬编码文本
 *   ❌ <Button>添加</Button>
 *   ✅ <Button>{t('common.add')}</Button>
 */
