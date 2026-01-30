import React, { useState, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Breadcrumb, theme, Grid } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import HeaderComponent from './Header';
import { useLocale } from '@/contexts/LocaleContext';

const { Header, Sider, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

export interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  label: string;
  path?: string; // 有子菜单时，path 可以为空
  children?: MenuItem[];
}

interface LayoutProps {
  menuItems: MenuItem[];
  header?: React.ReactNode;
}

// 递归查找菜单项（包括子菜单）
const findMenuItemByPath = (items: MenuItem[], path: string): MenuItem | null => {
  for (const item of items) {
    if (item.path === path) {
      return item;
    }
    if (item.children) {
      const found = findMenuItemByPath(item.children, path);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

// 递归查找菜单项（通过 key）
const findMenuItemByKey = (items: MenuItem[], key: string): MenuItem | null => {
  for (const item of items) {
    if (item.key === key) {
      return item;
    }
    if (item.children) {
      const found = findMenuItemByKey(item.children, key);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

// 递归获取所有父菜单的 key（用于展开）
const getParentKeys = (items: MenuItem[], targetKey: string, parentKeys: string[] = []): string[] => {
  for (const item of items) {
    const currentPath = [...parentKeys, item.key];
    if (item.key === targetKey) {
      return parentKeys;
    }
    if (item.children) {
      const found = getParentKeys(item.children, targetKey, currentPath);
      if (found.length > 0) {
        return found;
      }
    }
  }
  return [];
};

// 递归获取面包屑路径
const getBreadcrumbItems = (items: MenuItem[], targetPath: string, parents: MenuItem[] = []): MenuItem[] => {
  for (const item of items) {
    const currentPath = [...parents, item];
    if (item.path === targetPath) {
      return currentPath;
    }
    if (item.children) {
      const found = getBreadcrumbItems(item.children, targetPath, currentPath);
      if (found.length > 0) {
        return found;
      }
    }
  }
  return [];
};

// Ant Design lg 断点为 1024px
const LG_BREAKPOINT = 1024;

const LayoutComponent: React.FC<LayoutProps> = ({ menuItems, header }) => {
  const screens = useBreakpoint();
  const isDesktop = screens.lg === true; // lg 及以上为桌面，以下为平板/手机
  // 大屏默认展开、小屏默认收起（用 window 初始化避免 useBreakpoint 首帧为空对象）
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < LG_BREAKPOINT : true
  );
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocale();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 随断点同步：大屏默认展开，平板/手机默认收起
  useEffect(() => {
    if (isDesktop) {
      setCollapsed(false);
    } else {
      setCollapsed(true);
    }
  }, [isDesktop]);

  // 根据当前路径设置选中的菜单项
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    const currentPath = location.pathname;
    const currentItem = findMenuItemByPath(menuItems, currentPath);
    if (currentItem) {
      setSelectedKeys([currentItem.key]);
      // 展开父菜单
      const parentKeys = getParentKeys(menuItems, currentItem.key);
      if (parentKeys.length > 0) {
        setOpenKeys(parentKeys);
      }
    }
  }, [location.pathname, menuItems]);

  // 处理菜单点击
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    const menuItem = findMenuItemByKey(menuItems, e.key);
    if (menuItem && menuItem.path) {
      navigate(menuItem.path);
    }
  };

  // 处理子菜单展开/收起
  const handleOpenChange: MenuProps['onOpenChange'] = (keys) => {
    setOpenKeys(keys);
  };

  // 递归转换菜单项格式
  const convertMenuItems = (items: MenuItem[]): MenuProps['items'] => {
    return items.map(item => ({
      key: item.key,
      icon: item.icon,
      label: item.label,
      children: item.children ? convertMenuItems(item.children) : undefined,
    }));
  };

  const menuItemsData: MenuProps['items'] = convertMenuItems(menuItems);

  // 生成面包屑数据
  const breadcrumbItems = getBreadcrumbItems(menuItems, location.pathname);
  const breadcrumbData = breadcrumbItems.map((item) => ({
    title: <span>{item.label}</span>,
  }));

  return (
    <Layout className="h-full w-full">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth={isDesktop ? 80 : 0}
        onBreakpoint={(broken) => {
          if (broken) setCollapsed(true);
        }}
      >
        <div className="logo h-16 w-full text-center flex items-center justify-center text-white bg-blue-400 shrink-0">LOGO</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          items={menuItemsData}
          onClick={(e) => {
            handleMenuClick(e);
            if (!isDesktop) setCollapsed(true);
          }}
          onOpenChange={handleOpenChange}
        />
      </Sider>
      <Layout>
        <Header className="h-14 md:h-16" style={{ padding: 0, background: colorBgContainer }}>
          <div className="flex items-center ml-2 md:ml-4 gap-2 md:gap-4 flex-wrap min-w-0">
            <div
              onClick={() => setCollapsed(!collapsed)}
              className="cursor-pointer shrink-0 p-2 -ml-1"
              aria-label={collapsed ? '展开菜单' : '收起菜单'}
            >
              {collapsed ? <MenuUnfoldOutlined className="text-base" /> : <MenuFoldOutlined className="text-base" />}
            </div>
            {breadcrumbData.length > 0 && (
              <div className="min-w-0 overflow-hidden">
                <Breadcrumb
                  items={breadcrumbData}
                  className="text-xs md:text-sm"
                />
              </div>
            )}
            <div className="flex-1 min-w-0 h-full flex items-center">
              {header}
            </div>
            <HeaderComponent />
          </div>
        </Header>

        <Content
          className="p-2 m-2 md:p-4 md:m-4"
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
        <Footer className="h-10 md:h-12 flex items-center justify-center px-2" style={{ background: colorBgContainer }}>
          <div className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm text-gray-500 flex-wrap">
            <div>{t('footer.copyright', { year: new Date().getFullYear() })}</div>
            <div>{t('footer.icp')}</div>
          </div>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default LayoutComponent;