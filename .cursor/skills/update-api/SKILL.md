---
name: update-api
description: Fetches the latest OpenAPI spec from a backend service at /doc/swagger/openapi.yaml and syncs frontend API modules under src/api/. When API docs change, all consuming modules and pages must be updated to stay globally consistent. Use when the user says "帮我更新 API" or "帮我更新 api", or when asked to update API requests to match the backend.
---

# 更新 API（Update API）

根据后端服务的 OpenAPI 文档，同步更新前端 `src/api/` 下的请求与类型。代码风格遵循 React 与 TypeScript 规范。

## 项目约定

- **API 目录**：`src/api/` 下每个一级目录对应一个后端服务：
  - `account` — 认证与用户
  - `marksman` — 策略与数据源
  - `rabbit` — 消息与发送
- **文档地址**：每个后端服务在根路径下提供 **`/doc/swagger/openapi.yaml`**，需从对应服务的 base URL 获取（如 `https://api.example.com/account/doc/swagger/openapi.yaml`）。
- **请求封装**：统一使用 `src/api/common/request.ts` 的 `http`（get/post/put/delete/patch），baseURL 为 `/v1`；路径写相对路径如 `/datasources`、`/user/${uid}`。
- **模块结构**：每个子模块（如 `marksman/datasource`）包含：
  - `index.ts` — 导出请求函数与 re-export 类型
  - `types.ts` — 请求/响应/枚举的 TypeScript 类型定义

## 工作流程

1. **确认目标服务与文档 URL**
   - 若用户未指定服务，询问要更新哪个服务（account / marksman / rabbit）或“全部”。
   - 确认该服务对应的 OpenAPI 文档完整 URL（例如 `{服务 base URL}/doc/swagger/openapi.yaml`）。若项目中有配置（如 `.env`、文档），优先使用；否则向用户确认。

2. **获取并解析 OpenAPI**
   - 使用 GET 请求或读取本地/网络文件获取 `openapi.yaml`（或 `openapi.json`）。
   - 解析 `paths` 与 `components.schemas`，得到接口路径、方法、请求体/查询参数、响应 schema。

3. **映射到前端路径**
   - 前端 baseURL 为 `/v1`，若 OpenAPI 中 path 已含 `/v1` 或前缀，生成请求路径时去掉重复前缀，只保留与 `/v1` 后一致的部分（如 `/v1/datasources` → 请求路径 `/datasources`）。
   - 按现有习惯：一个 OpenAPI tag 或资源名对应 `src/api/<服务>/<子模块>/` 一个目录；若已有对应目录则更新，没有则新建并补全 `index.ts`、`types.ts`。

4. **更新 types.ts**
   - 根据 `components.schemas` 生成 TypeScript 接口/类型；枚举与后端一致时使用 `export enum`，否则用 `string` 联合类型或 `string`。
   - 命名与现有风格一致：列表项 `XxxItem`、列表参数 `XxxListParams` 或 `ListXxxParams`、列表响应 `XxxListResponse` 或 `ListXxxResponse`、创建/更新参数 `CreateXxxParams`、`UpdateXxxParams` 等。
   - 所有字段可选用 `?`，除非业务上明确必填；与后端一致的注释可保留简短说明。

5. **更新 index.ts**
   - 从 `../../index` 或 `../../common/request` 引入 `http`（与现有模块一致，见 `src/api/marksman/datasource/index.ts`、`src/api/account/user/index.ts`）。
   - 每个 path + method 对应一个导出函数：使用 `http.get<T>()`、`http.post<T>()`、`http.put<T>()`、`http.delete<T>()`、`http.patch<T>()`，泛型 `T` 为响应类型。
   - 路径参数（如 `uid`）用模板字符串 `` `/path/${uid}` ``；query 作为第二参数传入；body 作为 post/put/patch 的第二参数。
   - 函数上方用 JSDoc 注释说明接口用途及路径，例如：`/** 获取数据源列表 GET /v1/datasources */`。
   - 文件末尾统一 `export type { ... } from './types'` 以及需要的 `export { EnumName } from './types'`，与现有模块一致。

6. **统一导出**
   - 若新增了子模块，在 `src/api/index.ts` 中增加对应 `export * from './<服务>/<子模块>/index'`。

7. **全局一致：同步更新使用方（必须）**
   - API 文档发生变更后，**必须**查找并更新所有使用到该 API 的模块与页面，保证全局统一。
   - 对每个变更的接口或类型：在仓库内搜索引用该 API 函数、类型或枚举的文件（如 `src/pages/`、`src/components/`、其他 `src/api/` 子模块等）。
   - 根据本次变更内容调整使用方：若路径/参数/响应结构、类型或枚举发生变更，须同步修改调用处、表单字段、表格列、类型引用等，避免遗留旧字段名、旧枚举值或废弃用法。
   - 若某接口或类型被移除或重命名：删除或替换所有引用，并更新导入路径与类型名。
   - 完成后再次全局搜索相关关键字，确认无遗漏引用。

## 代码风格（React + TS）

- **类型**：优先 `interface`，需要字面量联合时用 `type`；类型引用用 `import type`。
- **函数**：使用 `function` 或箭头函数均可，与同目录现有风格一致；参数与返回值显式类型标注。
- **命名**：小驼峰（函数、变量）；类型/接口/枚举大驼峰；常量/枚举成员与后端一致（如全大写下划线或 PascalCase 依后端）。
- **注释**：文件顶可保留简短模块说明；每个导出函数上方一行 JSDoc（路径 + 方法）；复杂类型可加单行注释。
- **不可改**：不修改 `src/api/common/request.ts` 的拦截器与 `http` 签名；不修改 `src/api/common/types.ts` 中已有公共类型（如 `ApiResponse`、`RequestConfig`），除非新增公共枚举等且与团队约定一致。

## 请求写法示例

```ts
// index.ts 中典型写法（与现有项目一致）
import { http } from '../../index'
import type { XxxItem, XxxListParams, XxxListResponse } from './types'

/** 获取列表 GET /v1/xxxs */
export const getXxxList = (params?: XxxListParams): Promise<XxxListResponse> => {
  return http.get<XxxListResponse>('/xxxs', params as unknown as Record<string, unknown>)
}

/** 获取详情 GET /v1/xxx/{uid} */
export const getXxxDetail = (uid: string): Promise<XxxItem> => {
  return http.get<XxxItem>(`/xxx/${uid}`)
}

/** 创建 POST /v1/xxx */
export const createXxx = (params?: CreateXxxParams): Promise<XxxItem> => {
  return http.post<XxxItem>('/xxx', params as Record<string, unknown>)
}

/** 更新 PUT /v1/xxx/{uid} */
export const updateXxx = (uid: string, params?: UpdateXxxParams): Promise<XxxItem> => {
  return http.put<XxxItem>(`/xxx/${uid}`, params as Record<string, unknown>)
}

/** 删除 DELETE /v1/xxx/{uid} */
export const deleteXxx = (uid: string): Promise<Record<string, never>> => {
  return http.delete<Record<string, never>>(`/xxx/${uid}`)
}

export type { XxxItem, XxxListParams, CreateXxxParams, UpdateXxxParams } from './types'
export { XxxStatus } from './types'
```

## 校验

- 更新后确认：所有新增/修改的接口在 `index.ts` 中有对应函数，且路径、方法、参数与 OpenAPI 一致。
- 类型：`types.ts` 中无未使用或错误引用；若后端有枚举，前端尽量用枚举或联合类型，避免裸 `string` 泛滥。
- **使用方已同步**：所有引用到本次变更 API/类型的页面与模块均已检查并完成调整，全局无遗留旧字段、旧枚举或废弃调用。
- 若项目有 ESLint/TypeScript 检查，运行通过后再结束。
