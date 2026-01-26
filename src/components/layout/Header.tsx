// 头部组件
import React, { useState, useEffect, useRef } from 'react';
import { Select, Avatar, Dropdown, message, Switch } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import { getNamespaceList, type NamespaceItemSelect } from '@/api/namespace/index';
import { useTheme } from '@/contexts/ThemeContext';

const Header: React.FC = () => {
  // 主题管理
  const { themeMode, toggleTheme } = useTheme();

  // 命名空间管理
  const [namespace, setNamespace] = useState<string>(() => {
    return localStorage.getItem('namespace') || 'test';
  });

  // 命名空间选项列表
  const [namespaceOptions, setNamespaceOptions] = useState<NamespaceItemSelect[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 用于防止重复请求
  const hasFetchedRef = useRef(false);

  // 用户信息（可以从 API 或 context 获取）
  const [userInfo] = useState<{ name: string; avatar?: string }>(() => {
    // 可以从 localStorage 或 API 获取用户信息
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return { name: '用户' };
      }
    }
    return { name: '用户' };
  });

  // 获取命名空间列表
  useEffect(() => {
    // 防止重复请求（StrictMode 在开发环境下会执行两次）
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;

    const fetchNamespaceList = async () => {
      setLoading(true);
      try {
        const response = await getNamespaceList();
        if (response?.items) {
          setNamespaceOptions(response.items);
          // 如果当前选中的命名空间不在列表中，且列表不为空，则选择第一个
          if (response.items.length > 0) {
            const currentNamespace = localStorage.getItem('namespace');
            const exists = response.items.some(item => item.value === currentNamespace);
            if (!exists && !currentNamespace) {
              const firstNamespace = response.items[0].value;
              setNamespace(firstNamespace);
              localStorage.setItem('namespace', firstNamespace);
            }
          }
        }
      } catch {
        // 失败时使用默认选项
        setNamespaceOptions([
          { label: 'test', value: 'test' },
          { label: 'dev', value: 'dev' },
          { label: 'prod', value: 'prod' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNamespaceList();
  }, []);

  // 处理命名空间切换
  const handleNamespaceChange = (value: string) => {
    setNamespace(value);
    localStorage.setItem('namespace', value);
    // 可以触发页面刷新或重新加载数据
    window.location.reload();
  };

  // 处理退出登录
  const handleLogout = () => {
    // 清除 token
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    // 清除用户信息
    localStorage.removeItem('userInfo');
    // 提示信息
    message.success('已退出登录');
    // 跳转到登录页（如果有）或刷新页面
    // navigate('/login');
    window.location.href = '/login';
  };

  // 用户下拉菜单项
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      label: '退出登录',
    //   icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <div className='flex items-center gap-4 mr-4 h-5'>
      {/* 主题切换 */}
      <div className='flex items-center gap-2'>
        <Switch
          checked={themeMode === 'dark'}
          onChange={toggleTheme}
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
        />
      </div>
      {/* 命名空间选择 */}
      <Select
        value={namespace}
        onChange={handleNamespaceChange}
        options={namespaceOptions}
        className='w-30'
        loading={loading}
        placeholder="选择命名空间"
      />
      <Dropdown 
        menu={{ items: userMenuItems }} 
        trigger={['click']}
      >
        <div className='flex h-8 items-center gap-2 cursor-pointer'>
          <Avatar 
            size="small" 
            icon={<UserOutlined />} 
            src={userInfo.avatar}
          />
          <span>{userInfo.name}</span>
        </div>
      </Dropdown>
    </div>
  )
}

export default Header;
