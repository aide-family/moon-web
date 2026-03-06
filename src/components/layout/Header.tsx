// 头部组件
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Avatar, Dropdown, message, Modal, Form, Input } from "antd";
import type { MenuProps } from "antd";
import {
  UserOutlined,
  SunOutlined,
  MoonOutlined,
  DesktopOutlined,
  BgColorsOutlined,
  GlobalOutlined,
  MailOutlined,
  PictureOutlined,
  LogoutOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useNamespace } from "@/contexts/NamespaceContext";
import DetailForm from "@/pages/goddess/namespaces/components/DetailForm";
import { getSelfInfo, changeEmail, changeAvatar } from "@/api/self";

const Header: React.FC = () => {
  const navigate = useNavigate();
  // 主题管理
  const { themeMode, setThemeMode } = useTheme();
  // 国际化管理
  const { locale, setLocale, t } = useLocale();

  // 命名空间列表由 Context 统一管理，当前选中也由 Context 提供以便新建后立即同步
  const { namespaceOptions, loading, refreshNamespaceList, currentNamespace, setCurrentNamespace } = useNamespace();
  // 添加命名空间弹窗（列表为空时自动弹出）
  const [addNamespaceModalOpen, setAddNamespaceModalOpen] = useState(false);
  // 修改邮箱 / 头像弹窗
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [emailForm] = Form.useForm();
  const [avatarForm] = Form.useForm();
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [avatarSubmitting, setAvatarSubmitting] = useState(false);

  // 用户信息：通过 GET /v1/self/info 获取，修改头像/邮箱后同步
  const [userInfo, setUserInfo] = useState<{ name: string; avatar?: string }>(() => {
    const stored = localStorage.getItem("userInfo");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { name?: string; avatar?: string };
        return { name: parsed.name ?? "用户", avatar: parsed.avatar };
      } catch {
        return { name: "用户" };
      }
    }
    return { name: "用户" };
  });

  // 拉取个人信息并更新展示（有 token 时请求）
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;
    getSelfInfo()
      .then((data) => {
        const name = data.name ?? data.nickname ?? t("user.defaultName");
        const avatar = data.avatar;
        setUserInfo((prev) => ({ ...prev, name, avatar }));
        const stored = localStorage.getItem("userInfo");
        try {
          const parsed = (stored ? JSON.parse(stored) : {}) as Record<string, unknown>;
          localStorage.setItem("userInfo", JSON.stringify({ ...parsed, name, avatar }));
        } catch {
          localStorage.setItem("userInfo", JSON.stringify({ name, avatar }));
        }
      })
      .catch(() => {
        // 未登录或接口失败时保留现有展示
      });
  }, [t]);

  // 打开头像弹窗时预填当前头像
  useEffect(() => {
    if (avatarModalOpen) {
      avatarForm.setFieldsValue({ avatar: userInfo.avatar ?? "" });
    }
  }, [avatarModalOpen, userInfo.avatar, avatarForm]);

  // 列表为空时弹出添加弹窗；有数据时若当前未选或当前值不在列表中且为空则选第一个（有值则保留，如刚新建尚未在接口返回中）
  useEffect(() => {
    if (loading) return;

    const validNamespaceOptions = namespaceOptions.filter(
      (item) => !item.disabled,
    );
    if (validNamespaceOptions.length === 0) {
      queueMicrotask(() => setAddNamespaceModalOpen(true));
    } else {
      const exists = validNamespaceOptions.some(
        (item) => item.value === currentNamespace,
      );
      if (exists) return;
      if (currentNamespace) return; // 保留当前选中（如新建的），不覆盖为第一个
      const first = validNamespaceOptions[0].value;
      queueMicrotask(() => setCurrentNamespace(first));
    }
  }, [loading, namespaceOptions, currentNamespace, setCurrentNamespace]);

  // 处理命名空间切换
  const handleNamespaceChange = (value: string) => {
    setCurrentNamespace(value);
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

  // 修改邮箱提交
  const handleEmailSubmit = async () => {
    try {
      const values = await emailForm.validateFields();
      setEmailSubmitting(true);
      await changeEmail({ email: values.email });
      message.success(t("message.success"));
      setEmailModalOpen(false);
      emailForm.resetFields();
    } catch (e) {
      if (e && typeof e === "object" && "errorFields" in e) return;
    } finally {
      setEmailSubmitting(false);
    }
  };

  // 修改头像提交
  const handleAvatarSubmit = async () => {
    try {
      const values = await avatarForm.validateFields();
      setAvatarSubmitting(true);
      await changeAvatar({ avatar: values.avatar ?? "" });
      message.success(t("message.success"));
      const newAvatar = values.avatar?.trim() || undefined;
      setUserInfo((prev) => ({ ...prev, avatar: newAvatar }));
      const stored = localStorage.getItem("userInfo");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as { name?: string; avatar?: string };
          localStorage.setItem("userInfo", JSON.stringify({ ...parsed, avatar: newAvatar }));
        } catch {
          // ignore
        }
      }
      setAvatarModalOpen(false);
      avatarForm.resetFields();
    } catch (e) {
      if (e && typeof e === "object" && "errorFields" in e) return;
    } finally {
      setAvatarSubmitting(false);
    }
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
      key: "profile",
      label: t("user.profile"),
      icon: <IdcardOutlined />,
      onClick: () => navigate("/profile"),
    },
    {
      key: "changeEmail",
      label: t("user.changeEmail"),
      icon: <MailOutlined />,
      onClick: () => setEmailModalOpen(true),
    },
    {
      key: "changeAvatar",
      label: t("user.changeAvatar"),
      icon: <PictureOutlined />,
      onClick: () => setAvatarModalOpen(true),
    },
    {
      key: "logout",
      label: t("user.logout"),
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-4 mr-2 md:mr-4 h-8 shrink-0 flex-wrap justify-end">
      {/* 命名空间选择：选项与选中均展示 logo */}
      <Select
        value={currentNamespace}
        onChange={(value: string) => handleNamespaceChange(value)}
        options={namespaceOptions.map((opt) => ({
          value: opt.value,
          label: (
            <span className="flex items-center gap-2">
              {opt.logo ? (
                <Avatar src={opt.logo} size={20} shape="square" />
              ) : (
                <Avatar size={20} shape="square" icon={<GlobalOutlined />} />
              )}
              <span>{opt.label}</span>
            </span>
          ),
          searchLabel: opt.label,
          disabled: opt.disabled,
        }))}
        className="w-20 sm:w-28 md:w-32"
        loading={loading}
        placeholder={t("namespace.select")}
        size="small"
        popupMatchSelectWidth={false}
        showSearch={{ optionFilterProp: "searchLabel" }}
      />
      <DetailForm
        open={addNamespaceModalOpen}
        mode="create"
        closable={false}
        onCancel={() => setAddNamespaceModalOpen(false)}
        onSuccess={(created) => {
          setAddNamespaceModalOpen(false);
          if (created) {
            setCurrentNamespace(created.uid);
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
      <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} >
        <div className="flex h-8 items-center gap-1.5 cursor-pointer min-w-0 pr-2">
          <Avatar size="small" icon={<UserOutlined />} src={userInfo.avatar} />
          <span className="hidden sm:inline truncate max-w-[80px] md:max-w-[120px]">
            {userInfo.name}
          </span>
        </div>
      </Dropdown>

      {/* 修改邮箱弹窗 */}
      <Modal
        title={t("user.changeEmail")}
        open={emailModalOpen}
        onCancel={() => {
          setEmailModalOpen(false);
          emailForm.resetFields();
        }}
        onOk={handleEmailSubmit}
        confirmLoading={emailSubmitting}
        destroyOnHidden
        okText={t("common.ok")}
        cancelText={t("common.cancel")}
      >
        <Form form={emailForm} layout="vertical" className="mt-4">
          <Form.Item
            name="email"
            label={t("self.email")}
            rules={[{ required: true, message: t("self.emailPlaceholder") }]}
          >
            <Input placeholder={t("self.emailPlaceholder")} allowClear />
          </Form.Item>
        </Form>
      </Modal>

      {/* 修改头像弹窗 */}
      <Modal
        title={t("user.changeAvatar")}
        open={avatarModalOpen}
        onCancel={() => {
          setAvatarModalOpen(false);
          avatarForm.resetFields();
        }}
        onOk={handleAvatarSubmit}
        confirmLoading={avatarSubmitting}
        destroyOnHidden
        okText={t("common.ok")}
        cancelText={t("common.cancel")}
      >
        <Form form={avatarForm} layout="vertical" className="mt-4">
          <Form.Item name="avatar" label={t("self.avatar")}>
            <Input placeholder={t("self.avatarPlaceholder")} allowClear />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Header;
