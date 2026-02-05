// Rabbit 应用翻译
// 中英文翻译写在一个文件中，便于管理和维护

export const zhCN = {
  // 菜单标题
  'rabbit.templates.title': '模板管理',
  // 表格相关（模板模块特定）
  'template.table.uid': '模板ID',
  'template.table.name': '名称',
  'template.table.app': '应用',
  'template.table.createdAt': '创建时间',
  'template.table.updatedAt': '更新时间',
  // 确认对话框
  'template.confirm.delete.title': '确定要删除吗？',
  'template.confirm.delete.content': '删除模板 "{name}"',
  'template.confirm.status.title': '确定要{action}吗？',
  'template.confirm.status.content': '{action}模板 "{name}"',
  // 弹窗相关
  'template.modal.create.title': '新增模板',
  'template.modal.edit.title': '编辑模板',
  'template.modal.detail.title': '模板详情',
  // 表单相关
  'template.form.name.label': '名称',
  'template.form.name.placeholder': '请输入模板名称',
  'template.form.name.maxLength': '名称长度不能超过100个字符',
  'template.form.name.required': '请输入名称',
  'template.form.app.label': '应用',
  'template.form.app.placeholder': '请选择应用',
  'template.form.app.required': '请选择应用',
  'template.form.jsonData.label': 'JSON数据',
  'template.form.jsonData.placeholder': '请输入JSON格式的数据，例如：{"subject": "邮件主题", "body": "邮件内容"}',
  'template.form.jsonData.invalid': '请输入有效的JSON格式',
  'template.form.jsonData.help': 'JSON数据为JSON格式，可以为空。支持邮件、短信、Webhook等不同类型的模板数据结构',
  // 详情相关
  'template.detail.uid': '模板ID',
  'template.detail.name': '名称',
  'template.detail.app': '应用',
  'template.detail.createdAt': '创建时间',
  'template.detail.updatedAt': '更新时间',
  'template.detail.jsonData': 'JSON数据',
  // 搜索相关
  'template.search.app.placeholder': '应用',
} as const;

export const enUS = {
  // Menu title
  'rabbit.templates.title': 'Template Management',
  // Table related (Template module specific)
  'template.table.uid': 'Template ID',
  'template.table.name': 'Name',
  'template.table.app': 'App',
  'template.table.createdAt': 'Created At',
  'template.table.updatedAt': 'Updated At',
  // Confirm dialog
  'template.confirm.delete.title': 'Are you sure to delete?',
  'template.confirm.delete.content': 'Delete template "{name}"',
  'template.confirm.status.title': 'Are you sure to {action}?',
  'template.confirm.status.content': '{action} template "{name}"',
  // Modal related
  'template.modal.create.title': 'Create Template',
  'template.modal.edit.title': 'Edit Template',
  'template.modal.detail.title': 'Template Detail',
  // Form related
  'template.form.name.label': 'Name',
  'template.form.name.placeholder': 'Please enter template name',
  'template.form.name.maxLength': 'Name cannot exceed 100 characters',
  'template.form.name.required': 'Please enter name',
  'template.form.app.label': 'App',
  'template.form.app.placeholder': 'Please select app',
  'template.form.app.required': 'Please select app',
  'template.form.jsonData.label': 'JSON Data',
  'template.form.jsonData.placeholder': 'Please enter JSON data, e.g.: {"subject": "Email Subject", "body": "Email Body"}',
  'template.form.jsonData.invalid': 'Please enter valid JSON format',
  'template.form.jsonData.help': 'JSON data is in JSON format and can be empty. Supports different template data structures for Email, SMS, Webhook, etc.',
  // Detail related
  'template.detail.uid': 'Template ID',
  'template.detail.name': 'Name',
  'template.detail.app': 'App',
  'template.detail.createdAt': 'Created At',
  'template.detail.updatedAt': 'Updated At',
  'template.detail.jsonData': 'JSON Data',
  // Search related
  'template.search.app.placeholder': 'App',
} as const;
