/**
 * 占位页面（菜单项暂未配置子应用或本地组件时使用）
 * 主应用与子系统统一使用
 */
export function PlaceholderPage({ label, path }: { label: string; path: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">{label}</h2>
        <p className="text-gray-500">路径: {path}</p>
        <p className="text-gray-400 mt-2">该菜单项暂未配置子应用</p>
      </div>
    </div>
  )
}
