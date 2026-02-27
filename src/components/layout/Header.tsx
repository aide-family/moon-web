// 头部组件
import React, { useState, useEffect } from "react";
import { Select, Avatar, Dropdown, message } from "antd";
import type { MenuProps } from "antd";
import {
  UserOutlined,
  SunOutlined,
  MoonOutlined,
  DesktopOutlined,
  BgColorsOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useNamespace } from "@/contexts/NamespaceContext";
import DetailForm from "@/pages/main/namespaces/components/DetailForm";

const Header: React.FC = () => {
  // 主题管理
  const { themeMode, setThemeMode } = useTheme();
  // 国际化管理
  const { locale, setLocale, t } = useLocale();

  // 命名空间列表由 Context 统一管理，创建/编辑后刷新会同步到头部
  const { namespaceOptions, loading, refreshNamespaceList } = useNamespace();

  // 当前选中的命名空间
  const [namespace, setNamespace] = useState<string>("");
  // 添加命名空间弹窗（列表为空时自动弹出）
  const [addNamespaceModalOpen, setAddNamespaceModalOpen] = useState(false);

  // 用户信息（可以从 API 或 context 获取）
  const [userInfo, setUserInfo] = useState<{ name: string; avatar?: string }>(
    () => {
      // 可以从 localStorage 或 API 获取用户信息
      const storedUser = localStorage.getItem("userInfo");
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch {
          return { name: "用户" }; // 使用硬编码的默认值，后续会通过 useEffect 更新
        }
      }
      return { name: "用户" }; // 使用硬编码的默认值，后续会通过 useEffect 更新
    },
  );

  // 当语言切换时更新用户默认名称
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (!storedUser) {
      queueMicrotask(() => setUserInfo({ name: t("user.defaultName") }));
    }
  }, [locale, t]);

  // 列表为空时弹出添加命名空间弹窗；列表有数据且当前未选则选第一个
  useEffect(() => {
    if (loading) return;

    const validNamespaceOptions = namespaceOptions.filter(
      (item) => !item.disabled,
    );
    if (validNamespaceOptions.length === 0) {
      queueMicrotask(() => setAddNamespaceModalOpen(true));
    } else {
      const currentNamespace = localStorage.getItem("namespace") || "";
      const exists = validNamespaceOptions.some(
        (item) => item.value === currentNamespace,
      );
      if (exists) {
        queueMicrotask(() => setNamespace(currentNamespace));
        return;
      }
      const first = validNamespaceOptions[0].value;
      queueMicrotask(() => setNamespace(first));
      localStorage.setItem("namespace", first);
    }
  }, [loading, namespaceOptions]);

  // 处理命名空间切换
  const handleNamespaceChange = (value: string) => {
    setNamespace(value);
    localStorage.setItem("namespace", value);
    // 可以触发页面刷新或重新加载数据
    window.location.reload();
  };

  // 处理退出登录
  const handleLogout = () => {
    // 清除 localStorage 和 sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    // 提示信息
    message.success(t("logout.success"));
    // 跳转到登录页（如果有）或刷新页面
    // navigate('/login');
    window.location.href = "/login";
  };

  // 处理语言切换
  const handleLocaleChange = (newLocale: "zh-CN" | "en-US") => {
    setLocale(newLocale);
  };

  // 处理主题切换
  const handleThemeChange = (mode: "light" | "dark" | "system") => {
    setThemeMode(mode);
  };

  // 主题下拉菜单项
  const themeMenuItems: MenuProps["items"] = [
    {
      key: "light",
      label: t("theme.light"),
      icon: <SunOutlined />,
      onClick: () => handleThemeChange("light"),
    },
    {
      key: "dark",
      label: t("theme.dark"),
      icon: <MoonOutlined />,
      onClick: () => handleThemeChange("dark"),
    },
    {
      key: "system",
      label: t("theme.system"),
      icon: <DesktopOutlined />,
      onClick: () => handleThemeChange("system"),
    },
  ];

  // 语言下拉菜单项
  const localeMenuItems: MenuProps["items"] = [
    {
      key: "zh-CN",
      label: t("language.zh"),
      onClick: () => handleLocaleChange("zh-CN"),
    },
    {
      key: "en-US",
      label: t("language.en"),
      onClick: () => handleLocaleChange("en-US"),
    },
  ];

  // 根据当前主题模式获取图标（使用 BgColorsOutlined 作为主图标，参考 Ant Design 官网）
  const getThemeIcon = () => {
    return <BgColorsOutlined />;
  };

  // 用户下拉菜单项
  const userMenuItems: MenuProps["items"] = [
    {
      key: "logout",
      label: t("user.logout"),
      //   icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  useEffect(() => {
    console.log("namespace", namespace);
  }, [namespace]);

  return (
    <div className="flex items-center gap-2 sm:gap-4 mr-2 md:mr-4 h-8 shrink-0 flex-wrap justify-end">
      {/* 命名空间选择：小屏缩小宽度 */}
      <Select
        value={namespace}
        onChange={(value: string) => handleNamespaceChange(value)}
        options={namespaceOptions}
        className="w-20 sm:w-28 md:w-32"
        loading={loading}
        placeholder={t("namespace.select")}
        size="small"
        popupMatchSelectWidth={false}
        showSearch={{ optionFilterProp: "label" }}
      />
      <DetailForm
        open={addNamespaceModalOpen}
        mode="create"
        closable={false}
        onCancel={() => setAddNamespaceModalOpen(false)}
        onSuccess={(created) => {
          setAddNamespaceModalOpen(false);
          if (created) {
            setNamespace(created.uid);
            localStorage.setItem("namespace", created.uid);
            refreshNamespaceList();
            window.location.reload();
            return;
          }
          refreshNamespaceList();
        }}
      />
      <div className="flex items-center">
        {/* 主题切换 */}
        <Dropdown
          menu={{
            items: themeMenuItems,
            selectedKeys: [themeMode],
          }}
          trigger={["click"]}
        >
          <div className="flex h-8 w-8 min-w-8 items-center justify-center cursor-pointer hover:opacity-80">
            {getThemeIcon()}
          </div>
        </Dropdown>
        {/* 语言切换 */}
        <Dropdown
          menu={{
            items: localeMenuItems,
            selectedKeys: [locale],
          }}
          trigger={["click"]}
        >
          <div className="flex h-8 w-8 min-w-8 items-center justify-center cursor-pointer hover:opacity-80">
            <GlobalOutlined />
          </div>
        </Dropdown>
      </div>
      <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
        <div className="flex h-8 items-center gap-1.5 cursor-pointer min-w-0">
          <Avatar size="small" icon={<UserOutlined />} src={userInfo.avatar} />
          <span className="hidden sm:inline truncate max-w-[80px] md:max-w-[120px]">
            {userInfo.name}
          </span>
        </div>
      </Dropdown>
    </div>
  );
};

export default Header;
