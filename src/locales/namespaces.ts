// 命名空间模块翻译
// 中英文翻译写在一个文件中，便于管理和维护

export const zhCN = {
  // 表格相关（命名空间模块特定）
  'namespace.table.uid': 'UID',
  'namespace.table.name': '名称',
  'namespace.table.createdAt': '创建时间',
  'namespace.table.updatedAt': '更新时间',
  // 确认对话框
  'namespace.confirm.delete.title': '确定要删除吗？',
  'namespace.confirm.delete.content': '删除命名空间 "{name}"',
  'namespace.confirm.status.title': '确定要{action}吗？',
  'namespace.confirm.status.content': '{action}命名空间 "{name}"',
  // 弹窗相关
  'namespace.modal.create.title': '新增命名空间',
  'namespace.modal.edit.title': '编辑命名空间',
  'namespace.modal.detail.title': '命名空间详情',
  // 表单相关
  'namespace.form.name.label': '名称',
  'namespace.form.name.placeholder': '请输入命名空间名称',
  'namespace.form.name.maxLength': '名称长度不能超过100个字符',
  'namespace.form.name.required': '请输入名称',
  'namespace.form.metadata.label': '元数据',
  'namespace.form.metadata.placeholder': '请输入JSON格式的元数据，例如：{"description": "描述信息", "owner": "所有者"}',
  'namespace.form.metadata.invalid': '请输入有效的JSON格式',
  'namespace.form.metadata.help': '元数据为JSON格式，可以为空',
  // 详情相关
  'namespace.detail.uid': 'UID',
  'namespace.detail.name': '名称',
  'namespace.detail.createdAt': '创建时间',
  'namespace.detail.updatedAt': '更新时间',
  'namespace.detail.metadata': '元数据',
} as const;

export const enUS = {
  // Table related (Namespace module specific)
  'namespace.table.uid': 'UID',
  'namespace.table.name': 'Name',
  'namespace.table.createdAt': 'Created At',
  'namespace.table.updatedAt': 'Updated At',
  // Confirm dialog
  'namespace.confirm.delete.title': 'Are you sure to delete?',
  'namespace.confirm.delete.content': 'Delete namespace "{name}"',
  'namespace.confirm.status.title': 'Are you sure to {action}?',
  'namespace.confirm.status.content': '{action} namespace "{name}"',
  // Modal related
  'namespace.modal.create.title': 'Create Namespace',
  'namespace.modal.edit.title': 'Edit Namespace',
  'namespace.modal.detail.title': 'Namespace Detail',
  // Form related
  'namespace.form.name.label': 'Name',
  'namespace.form.name.placeholder': 'Please enter namespace name',
  'namespace.form.name.maxLength': 'Name cannot exceed 100 characters',
  'namespace.form.name.required': 'Please enter name',
  'namespace.form.metadata.label': 'Metadata',
  'namespace.form.metadata.placeholder': 'Please enter metadata in JSON format, e.g.: {"description": "Description", "owner": "Owner"}',
  'namespace.form.metadata.invalid': 'Please enter valid JSON format',
  'namespace.form.metadata.help': 'Metadata is in JSON format and can be empty',
  // Detail related
  'namespace.detail.uid': 'UID',
  'namespace.detail.name': 'Name',
  'namespace.detail.createdAt': 'Created At',
  'namespace.detail.updatedAt': 'Updated At',
  'namespace.detail.metadata': 'Metadata',
} as const;
