# Moon Web Kubernetes 部署

CI 推送镜像格式：`ghcr.io/<org>/moon-web/<app>:<tag>`

| 镜像 | 说明 |
|---|---|
| `integrated` | 单一前端，nginx 多后端 API 路由 |
| `main` | 微前端主壳（goddess 内嵌） |
| `goddess` / `rabbit` / `marksman` / `jade_tree` | 独立子应用 |
| `all` | 微前端 all-in-one（`Dockerfile.all`，需本地构建） |

## 部署前修改

1. 镜像 tag：`v1.0.0` → 实际 release tag
2. 域名：`moon.example.com` 等
3. 后端 Service 地址：`moon-*-api.moon-api.svc.cluster.local` → 集群内真实 API Service
4. 私有镜像仓库：在 Deployment 中增加 `imagePullSecrets`

## 推荐部署模式

### 模式 A：单一前端（推荐生产）

一个 Deployment，页面全在 integrated bundle，API 由 nginx 按路径转发到各后端。

```bash
kubectl apply -k deploy/k8s/overlays/integrated
```

环境变量（Deployment 内已配置）：

| 变量 | 默认指向 |
|---|---|
| `API_UPSTREAM_MAIN` | main/goddess 后端 :8000 |
| `API_UPSTREAM_RABBIT` | rabbit 后端 :8001 |
| `API_UPSTREAM_MARKSMAN` | marksman 后端 :8003 |
| `API_UPSTREAM_JADE_TREE` | jade_tree 后端 :8004 |

### 模式 B：微前端 all-in-one

main + `/sub/rabbit|marksman|jade_tree` 静态资源在同一 Pod，与前端 `prodUrl: /sub/...` 一致。

```bash
# 先构建并推送 all 镜像（或改用本地 moon-web:all）
pnpm run docker:build:all:micro
kubectl apply -k deploy/k8s/overlays/micro-all
```

### 模式 C：微前端拆分（main + 子应用多 Pod）

```bash
kubectl apply -k deploy/k8s/overlays/micro-split
```

**注意**：CI 独立子应用镜像默认 `base: /`，无法直接挂载到 `/sub/rabbit/`。拆分部署需用 `build:all:micro` 方式构建子应用，或改用模式 B。

### 模式 D：各应用独立域名

每个子应用单独 Ingress，适合独立访问或联调。

```bash
kubectl apply -k deploy/k8s/overlays/standalone
```

独立子应用只需设置 `API_UPSTREAM`（`MOON_APP_NAME` 已在镜像内注入）。

## 目录结构

```
deploy/k8s/
├── namespace.yaml
├── integrated/          # 单一前端
├── main/                # 微前端主壳
├── goddess|rabbit|.../  # 独立子应用
├── micro-all/           # 微前端 all-in-one
├── micro-composed/      # 拆分微前端共用 Ingress
└── overlays/            # kustomize 组合
    ├── integrated/
    ├── micro-all/
    ├── micro-split/
    └── standalone/
```

## 单独应用

```bash
kubectl apply -f deploy/k8s/namespace.yaml
kubectl apply -f deploy/k8s/rabbit/
```

## 后端 API Service 示例

前端 nginx 通过 Cluster DNS 访问后端，请确保 `moon-api` 命名空间存在对应 Service，例如：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: moon-rabbit-api
  namespace: moon-api
spec:
  ports:
    - port: 8001
      targetPort: 8001
```

Deployment 中 `API_UPSTREAM_RABBIT=http://moon-rabbit-api.moon-api.svc.cluster.local:8001` 即指向该 Service。
