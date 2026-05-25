# Moon Web

> Moon 监控系统前端 — 基于微前端架构的多子应用管理平台

<p align="center">
  <a href="./README.md">English</a>
</p>

---

### 简介

**Moon Web** 是 [Moon 监控系统](https://github.com/aide-family/moon-web) 的前端工程，采用 **微前端（Micro-Frontend）** 架构，将系统管理、消息通知、策略告警、节点探针等业务拆分为独立子应用，由主应用（Shell）统一编排导航、鉴权、主题与国际化。

### 功能模块

| 子应用        | 说明            | 主要功能                                        |
| ------------- | --------------- | ----------------------------------------------- |
| **main**      | 主应用（Shell） | 登录、布局、菜单、OAuth、Token 刷新、子应用加载 |
| **goddess**   | 系统管理        | 命名空间、用户管理、成员管理、个人中心          |
| **rabbit**    | 消息管理        | 消息模板、邮件、Webhook、消息日志、消息发送     |
| **marksman**  | 策略管理        | 实时告警、数据源、策略列表、告警等级、通知组    |
| **jade_tree** | 节点探针        | SSH 命令、审核记录、探测任务、机器信息          |

### 技术栈

| 类别   | 技术                                                           |
| ------ | -------------------------------------------------------------- |
| 框架   | React 19 + TypeScript 5                                        |
| 构建   | Vite 7                                                         |
| UI     | Ant Design 6 + Tailwind CSS 4                                  |
| 路由   | React Router 7                                                 |
| 微前端 | [@micro-zoe/micro-app](https://micro-zoe.github.io/micro-app/) |
| HTTP   | Axios                                                          |
| 工具库 | ahooks、dayjs、Monaco Editor                                   |

### 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                    main（主应用 Shell）                   │
│  登录 · 布局 · 菜单 · 鉴权 · 主题 · i18n · 命名空间       │
└──────────┬──────────┬──────────┬──────────┬───────────────┘
           │          │          │          │
     ┌─────▼────┐ ┌───▼───┐ ┌───▼────┐ ┌──▼──────┐ ┌──────────┐
     │ goddess  │ │ rabbit│ │marksman│ │jade_tree│ │  独立访问  │
     │ 系统管理  │ │消息管理│ │策略管理 │ │ 节点探针 │ │  各子应用  │
     └──────────┘ └───────┘ └────────┘ └─────────┘ └──────────┘
```

- **主应用**通过 `SubAppContainer` 以 iframe 方式嵌入子应用页面。
- 各子应用可**独立开发、独立构建、独立部署**，也可单独访问（不经过主应用 Shell）。
- 子应用之间通过 `micro-app` 的 `setData` / `addDataListener` 同步路由、语言与主题。

### 环境要求

- **Node.js** ≥ 18（推荐 20 LTS）
- **pnpm** ≥ 8（项目使用 pnpm 管理依赖）

### 快速开始

```bash
# 克隆仓库
git clone git@github.com:aide-family/moon-web.git
cd moon-web

# 安装依赖
pnpm install

# 启动全部子应用（开发模式）
pnpm dev
```

启动后访问：

| 应用      | 开发地址              | 说明               |
| --------- | --------------------- | ------------------ |
| main      | http://localhost:5172 | 主应用入口（推荐） |
| goddess   | http://localhost:5174 | 系统管理           |
| rabbit    | http://localhost:5175 | 消息管理           |
| marksman  | http://localhost:5176 | 策略管理           |
| jade_tree | http://localhost:5177 | 节点探针           |

> 使用主应用时需**同时启动所有子应用**，否则微前端嵌入页面无法加载。

### 常用脚本

| 命令                 | 说明                           |
| -------------------- | ------------------------------ |
| `pnpm dev`           | 并行启动全部 5 个子应用        |
| `pnpm dev:main`      | 仅启动主应用                   |
| `pnpm dev:goddess`   | 仅启动 goddess 子应用          |
| `pnpm dev:rabbit`    | 仅启动 rabbit 子应用           |
| `pnpm dev:marksman`  | 仅启动 marksman 子应用         |
| `pnpm dev:jade_tree` | 仅启动 jade_tree 子应用        |
| `pnpm build`         | 构建全部子应用                 |
| `pnpm build:main`    | 仅构建主应用（其他子应用同理） |
| `pnpm preview`       | 预览全部构建产物               |
| `pnpm lint`          | ESLint 检查                    |
| `pnpm format`        | Prettier 格式化项目代码        |
| `pnpm format:check`  | 检查代码格式（CI 可用）        |
| `pnpm typecheck`     | TypeScript 类型检查            |

### 环境变量

开发环境配置见 `.env.development`，生产环境见 `.env.production`。各子应用通过 `APP_NAME` 环境变量区分，Vite 代理将 `/v1`、`/oauth2`、`/health` 转发至对应后端。

| 变量                    | 说明              | 开发默认值              |
| ----------------------- | ----------------- | ----------------------- |
| `VITE_V1_MAIN_API`      | 主应用 / 认证 API | `http://localhost:8000` |
| `VITE_V1_GODDESS_API`   | 系统管理 API      | `http://localhost:8000` |
| `VITE_V1_RABBIT_API`    | 消息服务 API      | `http://localhost:8001` |
| `VITE_V1_MARKSMAN_API`  | 策略服务 API      | `http://localhost:8003` |
| `VITE_V1_JADE_TREE_API` | 节点探针 API      | `http://localhost:8004` |
| `VITE_HEALTH_*_API`     | 健康检查 API      | 各服务对应地址          |

本地开发时需确保对应后端服务已启动，否则 API 请求将失败。

### 项目结构

```
moon-web/
├── src/
│   ├── apps/                  # 各子应用入口
│   │   ├── main/              # 主应用（Shell + 菜单配置）
│   │   ├── goddess/
│   │   ├── rabbit/
│   │   ├── marksman/
│   │   └── jade_tree/
│   ├── pages/                 # 页面组件（按业务模块划分）
│   │   ├── goddess/           # 命名空间、用户、成员、个人中心
│   │   ├── rabbit/            # 模板、邮件、Webhook、消息、发送
│   │   ├── marksman/          # 告警、数据源、策略、等级、通知组
│   │   ├── jade_tree/         # SSH、审核、探测、机器
│   │   └── main/              # 登录页
│   ├── api/                   # API 请求封装
│   │   ├── common/            # Axios 实例、公共类型
│   │   ├── account/           # 认证、用户、命名空间
│   │   ├── marksman/          # 策略与数据源
│   │   ├── rabbit/            # 消息与发送
│   │   └── jade_tree/         # 节点探针
│   ├── components/            # 通用组件（Layout、AuthGuard 等）
│   ├── contexts/              # React Context（主题、语言、命名空间）
│   ├── locales/               # 国际化资源（中/英）
│   ├── config/                # 共享配置
│   ├── utils/                 # 工具函数与 Hooks
│   └── styles/                # 全局样式
├── .env.development           # 开发环境变量
├── .env.production            # 生产环境变量
├── vite.config.ts             # Vite 多应用构建配置
├── tsconfig.app.json          # TypeScript 配置
└── package.json
```

### API 规范

- 所有 HTTP 请求统一通过 `src/api/common/request.ts` 封装的 `http` 对象发起，baseURL 为 `/v1`。
- 请求自动携带 `Authorization: Bearer <token>` 与 `X-Namespace` 请求头。
- 页面组件**禁止**直接使用底层 `http` 或 `axios`，应调用 `src/api/**` 下的封装函数。
- API 模块按后端服务划分，每个子模块包含：
  - `index.ts` — 请求函数
  - `types.ts` — TypeScript 类型定义
- 后端 OpenAPI 文档地址：`{服务 base URL}/doc/swagger/openapi.yaml`。API 变更时需同步更新 `src/api/` 及所有引用页面。

### 国际化（i18n）

- 支持**中文（zh-CN）**与**英文（en-US）**，可在界面右上角切换。
- 所有用户可见文案必须通过 `useLocale()` 的 `t()` 函数获取，禁止硬编码。
- 翻译文件位于 `src/locales/`，按模块拆分，每个文件同时导出 `zhCN` 与 `enUS`。
- 详细规范见 [src/locales/README.md](./src/locales/README.md)。

### 开发规范

- **组件**：函数式组件 + Hooks；派生状态用 `useMemo`，事件处理用 `useCallback`。
- **Ant Design v6**：Modal 使用 `open`（非 `visible`）；Dropdown 使用 `menu={{ items }}`；Table 必须设置 `rowKey`。
- **数据请求**：必须处理 `loading` 状态；`try/catch/finally` 闭环；组件卸载时避免 setState。
- **路径别名**：`@/` 指向 `src/` 目录。
- **代码格式**：使用 Prettier（`prettier.config.js`）；提交前建议执行 `pnpm format` 或开启编辑器保存时格式化。
- 页面级规范详见 `.cursor/rules/moon-web-pages-conventions.mdc`。

### 构建与部署

```bash
# 构建全部子应用
pnpm build

# 构建产物目录
dist/
├── main/
├── goddess/
├── rabbit/
├── marksman/
└── jade_tree/
```

各子应用产物独立，可按需分别部署至不同静态资源路径或域名。生产环境需在 Web 服务器或 CDN 中配置 CORS 与路由回退（SPA fallback）。

Preview 端口：

| 应用      | Preview 地址          |
| --------- | --------------------- |
| main      | http://localhost:4172 |
| goddess   | http://localhost:4174 |
| rabbit    | http://localhost:4175 |
| marksman  | http://localhost:4176 |
| jade_tree | http://localhost:4177 |

### 贡献

1. Fork 本仓库并创建功能分支
2. 遵循现有代码风格与 i18n 规范
3. 提交前运行 `pnpm format:check`、`pnpm lint` 与 `pnpm typecheck`
4. 发起 Pull Request

---

## License

本项目采用 [MIT License](./LICENSE) 开源协议。
