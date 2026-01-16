import { useState } from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, theme } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  MailOutlined,
  ApiOutlined,
  FileTextOutlined,
  SendOutlined,
  HistoryOutlined,
  HeartOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = AntLayout;

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: <Link to="/">仪表盘</Link> },
    { key: '/namespaces', icon: <AppstoreOutlined />, label: <Link to="/namespaces">命名空间</Link> },
    { key: '/email/configs', icon: <MailOutlined />, label: <Link to="/email/configs">邮件配置</Link> },
    { key: '/webhook/configs', icon: <ApiOutlined />, label: <Link to="/webhook/configs">Webhook 配置</Link> },
    { key: '/templates', icon: <FileTextOutlined />, label: <Link to="/templates">模板管理</Link> },
    { key: '/sender', icon: <SendOutlined />, label: <Link to="/sender">发送测试</Link> },
    { key: '/message-logs', icon: <HistoryOutlined />, label: <Link to="/message-logs">消息日志</Link> },
    { key: '/health', icon: <HeartOutlined />, label: <Link to="/health">健康检查</Link> },
  ];

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 18 : 20,
          fontWeight: 600,
          padding: '0 16px',
        }}>
          {collapsed ? 'R' : 'Rabbit 通知中心'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <AntLayout style={{ marginLeft: collapsed ? 80 : 200 }}>
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
              <span>管理员</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: token.colorBgContainer, minHeight: 280 }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
