import React from "react";
import { theme } from "antd";

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 单个页面内容容器：背景、圆角、内边距、overflow。
 * 由各页面自行包裹，Layout 不再统一设置内容区背景。
 */
const PageContent: React.FC<PageContentProps> = ({ children, className = "" }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <div
      className={`p-2 md:p-4 h-full flex flex-col min-h-0 ${className}`.trim()}
      style={{
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
        overflow: "auto",
      }}
    >
      {children}
    </div>
  );
};

export default PageContent;
