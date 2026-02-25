# 国际化配置指南

## 目录结构

```
src/locales/
├── common.ts          # 通用翻译（中英文在一个文件）
├── namespaces.ts      # 命名空间模块翻译（中英文在一个文件）
├── index.ts           # 统一导出和合并
└── README.md          # 本文件
```

## 添加新页面/模块的国际化

### 步骤 1: 创建翻译文件

为你的模块创建一个翻译文件，中英文写在一起：

- `模块名.ts` - 包含 `zhCN` 和 `enUS` 两个导出

例如，为"用户管理"模块创建 `users.ts`：

```typescript
// src/locales/users.ts
export const zhCN = {
  "users.title": "用户管理",
  "users.action.add": "添加用户",
  // ... 更多中文翻译
} as const;

export const enUS = {
  "users.title": "User Management",
  "users.action.add": "Add User",
  // ... 更多英文翻译
} as const;
```

### 步骤 2: 在 index.ts 中导入并合并

```typescript
// src/locales/index.ts
import { zhCN as usersZh, enUS as usersEn } from "./users";

// 在 mergeResources 中添加
const zhCN = mergeResources(commonZh, namespacesZh, usersZh);
const enUS = mergeResources(commonEn, namespacesEn, usersEn);
```

### 步骤 3: 在组件中使用

```typescript
import { useLocale } from '@/contexts/LocaleContext';

const MyComponent = () => {
  const { t } = useLocale();

  return (
    <div>
      <h1>{t('users.title')}</h1>
      <Button>{t('common.add')}</Button>  {/* 使用通用翻译 */}
      <Button>{t('users.action.add')}</Button>  {/* 使用模块特定翻译 */}
    </div>
  );
};
```

## 文件格式示例

每个模块的翻译文件格式如下：

```typescript
// src/locales/users.ts
export const zhCN = {
  // 中文翻译
  "users.title": "用户管理",
  "users.action.add": "添加用户",
  // ...
} as const;

export const enUS = {
  // 英文翻译
  "users.title": "User Management",
  "users.action.add": "Add User",
  // ...
} as const;
```

**注意**：

- 每个文件必须同时导出 `zhCN` 和 `enUS`
- 两个对象中的键必须完全一致
- 使用 `as const` 确保类型安全

## 翻译键命名规范

### 命名规则

- 使用点分隔的层级结构：`模块.功能.具体项`
- 使用小写字母和点号
- 保持语义清晰

### 示例

```typescript
// 模块级别
'users.title': '用户管理'
'users.list': '用户列表'

// 功能级别
'users.form.name': '姓名'
'users.form.email': '邮箱'

// 操作级别
'users.action.add': '添加用户'
'users.action.edit': '编辑用户'
'users.action.delete': '删除用户'

// 消息级别
'users.message.create.success': '创建用户成功'
'users.message.update.success': '更新用户成功'
```

## 通用翻译键

以下翻译键已在 `common.ts` 中定义，所有页面可以直接使用：

### 通用操作

- `common.ok` - 确定
- `common.cancel` - 取消
- `common.close` - 关闭
- `common.submit` - 提交
- `common.search` - 搜索
- `common.reset` - 重置
- `common.add` - 新增
- `common.edit` - 编辑
- `common.delete` - 删除
- `common.detail` - 详情
- `common.more` - 更多
- `common.export` - 导出
- `common.save` - 保存
- `common.back` - 返回
- `common.confirm` - 确认
- `common.loading` - 加载中...
- `common.noData` - 暂无数据

### 表格通用（所有表格页面共用）

- `table.status` - 状态
- `table.action` - 操作
- `table.enable` - 启用
- `table.disable` - 禁用
- `table.unknown` - 未知
- `table.search.placeholder` - 请输入
- `table.search.all` - 全部
- `table.search.enabled` - 启用
- `table.search.disabled` - 禁用
- `table.total` - 共 {total} 条

## 参数替换

支持在翻译文本中使用参数：

```typescript
// 翻译文件
'welcome.message': '欢迎，{name}！今天是 {date}'

// 使用
t('welcome.message', { name: '张三', date: '2026-01-27' })
// 输出: "欢迎，张三！今天是 2026-01-27"
```

## 最佳实践

1. **复用通用翻译**：优先使用 `common.ts` 中的通用翻译键
2. **模块化组织**：按功能模块拆分翻译文件，便于维护
3. **命名一致性**：保持翻译键命名风格一致
4. **及时更新**：添加新功能时，同步添加翻译
5. **避免硬编码**：所有用户可见的文本都应使用 `t()` 函数

## 检查清单

添加新页面国际化时，确保：

- [ ] 创建了翻译文件（包含 `zhCN` 和 `enUS` 两个导出）
- [ ] 在 `index.ts` 中导入并合并
- [ ] 所有用户可见文本都使用了 `t()` 函数
- [ ] 翻译键命名符合规范
- [ ] `zhCN` 和 `enUS` 中的键完全一致
- [ ] 复用了通用翻译键（如适用）
- [ ] 测试了中英文切换功能

## 文件格式说明

每个模块的翻译文件必须包含两个导出：

- `export const zhCN = { ... }` - 中文翻译
- `export const enUS = { ... }` - 英文翻译

**重要**：两个对象中的键必须完全一致，否则可能导致某些翻译键缺失。
