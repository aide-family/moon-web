// 模板页面翻译示例
// 中英文翻译写在一个文件中，便于管理和维护

export const zhCN = {
  // 页面标题
  'template.page.title': '模板页面',
  'template.page.subtitle': '这是一个模板页面示例',
  
  // 操作按钮
  'template.action.create': '创建模板',
  'template.action.edit': '编辑模板',
  'template.action.delete': '删除模板',
  'template.action.view': '查看详情',
  
  // 表单字段
  'template.form.name.label': '模板名称',
  'template.form.name.placeholder': '请输入模板名称',
  'template.form.name.required': '请输入模板名称',
  'template.form.description.label': '描述',
  'template.form.description.placeholder': '请输入描述信息',
  
  // 表格列
  'template.table.id': 'ID',
  'template.table.name': '名称',
  'template.table.status': '状态',
  'template.table.createdAt': '创建时间',
  
  // 状态
  'template.status.active': '激活',
  'template.status.inactive': '未激活',
  
  // 消息提示
  'template.message.create.success': '创建模板成功',
  'template.message.update.success': '更新模板成功',
  'template.message.delete.success': '删除模板成功',
  
  // 确认对话框
  'template.confirm.delete.title': '确定要删除模板吗？',
  'template.confirm.delete.content': '删除后无法恢复，确定要继续吗？',
} as const;

export const enUS = {
  // Page title
  'template.page.title': 'Template Page',
  'template.page.subtitle': 'This is a template page example',
  
  // Action buttons
  'template.action.create': 'Create Template',
  'template.action.edit': 'Edit Template',
  'template.action.delete': 'Delete Template',
  'template.action.view': 'View Details',
  
  // Form fields
  'template.form.name.label': 'Template Name',
  'template.form.name.placeholder': 'Please enter template name',
  'template.form.name.required': 'Please enter template name',
  'template.form.description.label': 'Description',
  'template.form.description.placeholder': 'Please enter description',
  
  // Table columns
  'template.table.id': 'ID',
  'template.table.name': 'Name',
  'template.table.status': 'Status',
  'template.table.createdAt': 'Created At',
  
  // Status
  'template.status.active': 'Active',
  'template.status.inactive': 'Inactive',
  
  // Messages
  'template.message.create.success': 'Template created successfully',
  'template.message.update.success': 'Template updated successfully',
  'template.message.delete.success': 'Template deleted successfully',
  
  // Confirm dialogs
  'template.confirm.delete.title': 'Are you sure to delete the template?',
  'template.confirm.delete.content': 'This action cannot be undone. Are you sure to continue?',
} as const;
