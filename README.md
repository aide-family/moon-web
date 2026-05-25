# Moon Web

> Frontend for the Moon monitoring platform — a micro-frontend multi-app management console

<p align="center">
  <a href="./README.zh-CN.md">中文</a>
</p>

---

### Introduction

**Moon Web** is the frontend for the **Moon Monitoring Platform**. It uses a **micro-frontend** architecture that splits system management, messaging, strategy/alerting, and node probing into independent sub-applications, orchestrated by a main shell app that handles navigation, authentication, theming, and internationalization.

### Modules

| Sub-app       | Description         | Key Features                                                                 |
| ------------- | ------------------- | ---------------------------------------------------------------------------- |
| **main**      | Shell application   | Login, layout, menu, OAuth, token refresh, sub-app loading                   |
| **goddess**   | System management   | Namespaces, users, members, profile                                          |
| **rabbit**    | Messaging           | Templates, emails, webhooks, message logs, message sending                   |
| **marksman**  | Strategy management | Real-time alerts, datasources, strategies, alert levels, notification groups |
| **jade_tree** | Node probing        | SSH commands, audit records, probe tasks, machine info                       |

### Tech Stack

| Category       | Technology                                                     |
| -------------- | -------------------------------------------------------------- |
| Framework      | React 19 + TypeScript 5                                        |
| Build          | Vite 7                                                         |
| UI             | Ant Design 6 + Tailwind CSS 4                                  |
| Routing        | React Router 7                                                 |
| Micro-frontend | [@micro-zoe/micro-app](https://micro-zoe.github.io/micro-app/) |
| HTTP           | Axios                                                          |
| Utilities      | ahooks, dayjs, Monaco Editor                                   |

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   main (Shell Application)               │
│  Login · Layout · Menu · Auth · Theme · i18n · NS      │
└──────────┬──────────┬──────────┬──────────┬───────────────┘
           │          │          │          │
     ┌─────▼────┐ ┌───▼───┐ ┌───▼────┐ ┌──▼──────┐ ┌──────────┐
     │ goddess  │ │ rabbit│ │marksman│ │jade_tree│ │Standalone│
     │ System   │ │Message│ │Strategy│ │  Probe  │ │  Access  │
     └──────────┘ └───────┘ └────────┘ └─────────┘ └──────────┘
```

- The **shell app** embeds sub-app pages via iframe using `SubAppContainer`.
- Each sub-app can be **developed, built, and deployed independently**, or accessed standalone without the shell.
- Sub-apps communicate route, locale, and theme changes through `micro-app`'s `setData` / `addDataListener`.

### Prerequisites

- **Node.js** ≥ 18 (20 LTS recommended)
- **pnpm** ≥ 8

### Quick Start

```bash
# Clone the repository
git clone git@github.com:aide-family/moon-web.git
cd moon-web

# Install dependencies
pnpm install

# Start all sub-apps (development)
pnpm dev
```

Access URLs:

| App       | Dev URL               | Notes                    |
| --------- | --------------------- | ------------------------ |
| main      | http://localhost:5172 | Main entry (recommended) |
| goddess   | http://localhost:5174 | System management        |
| rabbit    | http://localhost:5175 | Messaging                |
| marksman  | http://localhost:5176 | Strategy management      |
| jade_tree | http://localhost:5177 | Node probing             |

> When using the shell app, **all sub-apps must be running** for embedded micro-frontend pages to load.

### Scripts

| Command              | Description                                    |
| -------------------- | ---------------------------------------------- |
| `pnpm dev`           | Start all 5 sub-apps in parallel               |
| `pnpm dev:main`      | Start shell app only                           |
| `pnpm dev:goddess`   | Start goddess sub-app only                     |
| `pnpm dev:rabbit`    | Start rabbit sub-app only                      |
| `pnpm dev:marksman`  | Start marksman sub-app only                    |
| `pnpm dev:jade_tree` | Start jade_tree sub-app only                   |
| `pnpm build`         | Build all sub-apps                             |
| `pnpm build:main`    | Build shell app only (same pattern for others) |
| `pnpm preview`       | Preview all build outputs                      |
| `pnpm lint`          | Run ESLint                                     |
| `pnpm format`        | Format code with Prettier                      |
| `pnpm format:check`  | Check formatting (for CI)                      |
| `pnpm typecheck`     | Run TypeScript type check                      |

### Environment Variables

Development config: `.env.development`. Production config: `.env.production`. Each sub-app is identified by the `APP_NAME` env var; Vite proxies `/v1`, `/oauth2`, and `/health` to the corresponding backend.

| Variable                | Description           | Dev Default             |
| ----------------------- | --------------------- | ----------------------- |
| `VITE_V1_MAIN_API`      | Shell / auth API      | `http://localhost:8000` |
| `VITE_V1_GODDESS_API`   | System management API | `http://localhost:8000` |
| `VITE_V1_RABBIT_API`    | Messaging API         | `http://localhost:8001` |
| `VITE_V1_MARKSMAN_API`  | Strategy API          | `http://localhost:8003` |
| `VITE_V1_JADE_TREE_API` | Node probe API        | `http://localhost:8004` |
| `VITE_HEALTH_*_API`     | Health check API      | Per-service address     |

Ensure the corresponding backend services are running locally, otherwise API requests will fail.

### Project Structure

```
moon-web/
├── src/
│   ├── apps/                  # Sub-app entry points
│   │   ├── main/              # Shell + menu config
│   │   ├── goddess/
│   │   ├── rabbit/
│   │   ├── marksman/
│   │   └── jade_tree/
│   ├── pages/                 # Page components (by module)
│   │   ├── goddess/           # Namespaces, users, members, profile
│   │   ├── rabbit/            # Templates, emails, webhooks, messages
│   │   ├── marksman/          # Alerts, datasources, strategies
│   │   ├── jade_tree/         # SSH, audits, probes, machines
│   │   └── main/              # Login page
│   ├── api/                   # API layer
│   │   ├── common/            # Axios instance, shared types
│   │   ├── account/           # Auth, users, namespaces
│   │   ├── marksman/          # Strategy & datasources
│   │   ├── rabbit/            # Messaging
│   │   └── jade_tree/         # Node probing
│   ├── components/            # Shared components
│   ├── contexts/              # React Context (theme, locale, namespace)
│   ├── locales/               # i18n resources (zh/en)
│   ├── config/                # Shared config
│   ├── utils/                 # Utilities & hooks
│   └── styles/                # Global styles
├── .env.development
├── .env.production
├── vite.config.ts
├── tsconfig.app.json
└── package.json
```

### API Conventions

- All HTTP requests go through the `http` wrapper in `src/api/common/request.ts` with baseURL `/v1`.
- Requests automatically include `Authorization: Bearer <token>` and `X-Namespace` headers.
- Page components must **not** call `http` or `axios` directly — use functions from `src/api/**`.
- API modules are organized by backend service; each submodule has:
  - `index.ts` — request functions
  - `types.ts` — TypeScript type definitions
- Backend OpenAPI spec: `{service base URL}/doc/swagger/openapi.yaml`. When APIs change, update `src/api/` and all consuming pages.

### Internationalization (i18n)

- Supports **Chinese (zh-CN)** and **English (en-US)**; switchable from the header.
- All user-facing text must use the `t()` function from `useLocale()` — no hardcoded strings.
- Translation files live in `src/locales/`, split by module; each file exports both `zhCN` and `enUS`.
- See [src/locales/README.md](./src/locales/README.md) for details.

### Development Guidelines

- **Components**: Functional components + Hooks; use `useMemo` for derived state, `useCallback` for handlers.
- **Ant Design v6**: Use `open` on Modal (not `visible`); use `menu={{ items }}` on Dropdown; always set `rowKey` on Table.
- **Data fetching**: Handle `loading` state; complete `try/catch/finally`; avoid setState after unmount.
- **Path alias**: `@/` maps to `src/`.
- **Formatting**: Prettier (`prettier.config.js`); run `pnpm format` before commit or use format-on-save (see `.vscode/settings.json`).
- Page conventions: `.cursor/rules/moon-web-pages-conventions.mdc`.

### Build & Deploy

```bash
# Build all sub-apps
pnpm build

# Output directories
dist/
├── main/
├── goddess/
├── rabbit/
├── marksman/
└── jade_tree/
```

Each sub-app output is independent and can be deployed to separate paths or domains. Configure CORS and SPA fallback on your web server or CDN for production.

Preview ports:

| App       | Preview URL           |
| --------- | --------------------- |
| main      | http://localhost:4172 |
| goddess   | http://localhost:4174 |
| rabbit    | http://localhost:4175 |
| marksman  | http://localhost:4176 |
| jade_tree | http://localhost:4177 |

### Contributing

1. Fork the repo and create a feature branch
2. Follow existing code style and i18n conventions
3. Run `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` before submitting
4. Open a Pull Request

---

## License

Private project — see repository owner for licensing terms.
