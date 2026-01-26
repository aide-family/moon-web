import React, { useState, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Breadcrumb, theme } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import HeaderComponent from './Header';

const { Header, Sider, Content } = Layout;

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

const LayoutComponent: React.FC<LayoutProps> = ({ menuItems, header }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo h-10 w-full bg-red-500 " />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          items={menuItemsData}
          onClick={handleMenuClick}
          onOpenChange={handleOpenChange}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div className='flex items-center  ml-4 gap-4'>
            <div onClick={() => setCollapsed(!collapsed)} className='cursor-pointer'>
              {collapsed ? <i className='text-base'><MenuUnfoldOutlined /></i> : <i className='text-base'><MenuFoldOutlined /></i>}
            </div>
            <div className='flex-1 h-full flex items-center'>
              {header}
            </div>
            <HeaderComponent />
          </div>
        </Header>
          {breadcrumbData.length > 0 && (
            <div className='mt-4 ml-4'>
              <Breadcrumb items={breadcrumbData}/>
            </div>
          )}
        <Content
          className='p-4 h-full m-4'
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutComponent;