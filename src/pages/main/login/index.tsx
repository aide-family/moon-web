import { useState, useEffect, useRef, useCallback } from "react";
import {
  Carousel,
  Form,
  Input,
  Button,
  message,
  Dropdown,
  Modal,
} from "antd";
import type { MenuProps } from "antd";
import {
  MailOutlined,
  SunOutlined,
  MoonOutlined,
  DesktopOutlined,
  BgColorsOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useLocale } from "@/contexts/LocaleContext";
import { useTheme } from "@/contexts/ThemeContext";
import { sendEmailLoginCode, emailLogin } from "@/api/account/auth";
import { getCaptcha } from "@/api/account/captcha";
import { getOauth2Reports, type OAuth2ReportItem } from "@/api/account/oauth";
import { useNavigate } from "react-router-dom";
import banner1 from "@/assets/banner/banner1.svg";
import banner2 from "@/assets/banner/banner2.svg";
import banner3 from "@/assets/banner/banner3.svg";
import banner4 from "@/assets/banner/banner4.svg";
import banner5 from "@/assets/banner/banner5.svg";
// 简介轮播数据（使用 banner 文件夹图片）
const BANNER_IMAGES = [banner1, banner2, banner3, banner4, banner5];
const INTRO_SLIDES = [
  { titleKey: "login.intro.title1", descKey: "login.intro.desc1" },
  { titleKey: "login.intro.title2", descKey: "login.intro.desc2" },
  { titleKey: "login.intro.title3", descKey: "login.intro.desc3" },
  { titleKey: "login.intro.title1", descKey: "login.intro.desc1" },
  { titleKey: "login.intro.title2", descKey: "login.intro.desc2" },
];

export default function LoginPage() {
  const { t, locale, setLocale } = useLocale();
  const { themeMode, setThemeMode, actualThemeMode } = useTheme();
  const navigate = useNavigate();
  const isDark = actualThemeMode === "dark";
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [sendingCode, setSendingCode] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const codeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [captchaModalOpen, setCaptchaModalOpen] = useState(false);
  const [captchaModalForForm, setCaptchaModalForForm] = useState<"login" | "register" | null>(null);
  const [modalCaptchaId, setModalCaptchaId] = useState("");
  const [modalCaptchaB64s, setModalCaptchaB64s] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [captchaSubmitting, setCaptchaSubmitting] = useState(false);
  const [modalCaptchaInput, setModalCaptchaInput] = useState("");
  const [oauthOptions, setOauthOptions] = useState<OAuth2ReportItem[]>([]);
  const [loginLoading, setLoginLoading] = useState(false);

  const fetchCaptcha = useCallback(() => {
    setCaptchaLoading(true);
    getCaptcha()
      .then((res) => {
        setModalCaptchaId(res.captchaId ?? "");
        setModalCaptchaB64s(res.captchaB64s ?? "");
      })
      .catch(() => {
        setModalCaptchaId("");
        setModalCaptchaB64s("");
      })
      .finally(() => setCaptchaLoading(false));
  }, []);

  useEffect(() => {
    getOauth2Reports().then(setOauthOptions);
  }, []);

  const onLoginFinish = async (values: Record<string, string>) => {
    setLoginLoading(true);
    try {
      const res = await emailLogin({ email: values.email, code: values.emailCode });
      const token = res?.token;
      if (token) {
        localStorage.setItem("token", token);
        message.success(t("login.loginSuccess"));
        navigate("/", { replace: true });
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const onRegisterFinish = (values: Record<string, string>) => {
    message.info(t("login.registerSubmitHint"));
    console.log("Register", values);
  };

  const runCodeCountdown = () => {
    if (codeTimerRef.current) {
      clearInterval(codeTimerRef.current);
      codeTimerRef.current = null;
    }
    setSendingCode(true);
    setCodeCountdown(60);
    message.success(t("login.codeSent"));
    const timer = setInterval(() => {
      setCodeCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          codeTimerRef.current = null;
          setSendingCode(false);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    codeTimerRef.current = timer;
  };

  const resetCodeCountdown = () => {
    if (codeTimerRef.current) {
      clearInterval(codeTimerRef.current);
      codeTimerRef.current = null;
    }
    setSendingCode(false);
    setCodeCountdown(0);
  };

  const handleTabChange = (key: "login" | "register") => {
    resetCodeCountdown();
    // 切换时同步邮箱：从当前 Tab 的表单把邮箱同步到目标 Tab 的表单，避免重复输入
    const loginEmail = loginForm.getFieldValue("email");
    const registerEmail = registerForm.getFieldValue("email");
    if (key === "register" && loginEmail !== undefined) {
      registerForm.setFieldValue("email", loginEmail);
    }
    if (key === "login" && registerEmail !== undefined) {
      loginForm.setFieldValue("email", registerEmail);
    }
    setActiveTab(key);
  };

  const openCaptchaModal = (forForm: "login" | "register") => {
    const form = forForm === "login" ? loginForm : registerForm;
    form.validateFields(["email"]).then(
      () => {
        setCaptchaModalForForm(forForm);
        setModalCaptchaInput("");
        setCaptchaModalOpen(true);
        fetchCaptcha();
      },
      () => {
        // 校验失败不打开弹窗，表单项会展示错误
      },
    );
  };

  const handleCaptchaModalOk = async () => {
    if (!modalCaptchaInput.trim()) {
      message.warning(t("login.graphicCaptchaRequired"));
      return;
    }
    if (!captchaModalForForm) return;
    const form = captchaModalForForm === "login" ? loginForm : registerForm;
    const email = form.getFieldValue("email") as string;
    if (!email) {
      message.warning(t("login.emailRequired"));
      return;
    }
    setCaptchaSubmitting(true);
    try {
      await sendEmailLoginCode({
        email,
        captchaId: modalCaptchaId,
        captchaAnswer: modalCaptchaInput.trim(),
      });
      runCodeCountdown();
      setCaptchaModalOpen(false);
      setModalCaptchaInput("");
      setModalCaptchaId("");
      setModalCaptchaB64s("");
      setCaptchaModalForForm(null);
    } finally {
      setCaptchaSubmitting(false);
    }
  };

  const handleCaptchaModalCancel = () => {
    setCaptchaModalOpen(false);
    setModalCaptchaInput("");
    setModalCaptchaId("");
    setModalCaptchaB64s("");
    setCaptchaModalForForm(null);
  };

  const themeMenuItems: MenuProps["items"] = [
    {
      key: "light",
      label: t("theme.light"),
      icon: <SunOutlined />,
      onClick: () => setThemeMode("light"),
    },
    {
      key: "dark",
      label: t("theme.dark"),
      icon: <MoonOutlined />,
      onClick: () => setThemeMode("dark"),
    },
    {
      key: "system",
      label: t("theme.system"),
      icon: <DesktopOutlined />,
      onClick: () => setThemeMode("system"),
    },
  ];
  const localeMenuItems: MenuProps["items"] = [
    {
      key: "zh-CN",
      label: t("language.zh"),
      onClick: () => setLocale("zh-CN"),
    },
    {
      key: "en-US",
      label: t("language.en"),
      onClick: () => setLocale("en-US"),
    },
  ];

  const loginFormContent = (
    <Form
      form={loginForm}
      layout="vertical"
      onFinish={onLoginFinish}
      size="large"
      className="mt-6"
    >
      <Form.Item
        name="email"
        rules={[
          { required: true, message: t("login.emailRequired") },
          { type: "email", message: t("login.emailInvalid") },
        ]}
      >
        <Input
          prefix={<MailOutlined className="text-gray-400" />}
          placeholder={t("login.emailPlaceholder")}
        />
      </Form.Item>

      <Form.Item
        name="emailCode"
        rules={[{ required: true, message: t("login.emailCodeRequired") }]}
      >
        <div className="flex gap-2">
          <Input
            placeholder={t("login.emailCodePlaceholder")}
            className="flex-1"
          />
          <Button
            type="primary"
            onClick={() => openCaptchaModal("login")}
            disabled={sendingCode}
          >
            {sendingCode ? t("login.resendIn", { count: codeCountdown }) : t("login.sendCode")}
          </Button>
        </div>
      </Form.Item>

      <Form.Item className="mb-4">
        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={loginLoading}
        >
          {t("login.login")}
        </Button>
      </Form.Item>
    </Form>
  );

  const registerFormContent = (
    <Form
      form={registerForm}
      layout="vertical"
      onFinish={onRegisterFinish}
      size="large"
      className="mt-6"
    >
      <Form.Item
        name="email"
        rules={[
          { required: true, message: t("login.emailRequired") },
          { type: "email", message: t("login.emailInvalid") },
        ]}
      >
        <Input
          prefix={<MailOutlined className="text-gray-400" />}
          placeholder={t("login.emailPlaceholder")}
        />
      </Form.Item>
      <Form.Item
        name="emailCode"
        rules={[{ required: true, message: t("login.emailCodeRequired") }]}
      >
        <div className="flex gap-2">
          <Input
            placeholder={t("login.emailCodePlaceholder")}
            className="flex-1"
          />
          <Button
            type="primary"
            onClick={() => openCaptchaModal("register")}
            disabled={sendingCode}
          >
            {sendingCode ? t("login.resendIn", { count: codeCountdown }) : t("login.sendCode")}
          </Button>
        </div>
      </Form.Item>
      <Form.Item className="mb-4">
        <Button type="primary" htmlType="submit" block size="large">
          {t("login.register")}
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div
      className={`min-h-screen flex relative ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* 右上角：语言切换、主题切换 */}
      <div className="fixed top-4 right-4 z-10 flex items-center gap-2">
        <Dropdown
          menu={{ items: themeMenuItems, selectedKeys: [themeMode] }}
          trigger={["click"]}
        >
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center  rounded-full border border-gray-200 bg-white/90 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800/90 dark:hover:bg-gray-700"
            title={t("theme.light")}
          >
            <BgColorsOutlined className="text-lg" />
          </button>
        </Dropdown>
        <Dropdown
          menu={{ items: localeMenuItems, selectedKeys: [locale] }}
          trigger={["click"]}
        >
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800/90 dark:hover:bg-gray-700"
            title={t("language.zh")}
          >
            <GlobalOutlined className="text-lg" />
          </button>
        </Dropdown>
      </div>

      {/* 左侧：简介轮播。不用 w-0/min-h-0，避免整列宽度或高度被压成 0 */}
      <div className="hidden lg:block lg:w-[55%] lg:min-h-screen lg:shrink-0">
        <div className=" min-h-screen w-full">
          <Carousel autoplay className="w-full" style={{ height: "100vh" }}>
            {INTRO_SLIDES.map((slide, i) => (
              <div
                key={i}
                className={`min-h-screen bg-gradient-to-br ${isDark ? "from-slate-800 via-gray-800 to-indigo-900" : "from-sky-100 via-slate-100 to-indigo-100"}`}
              >
                <div className=" min-h-screen flex flex-col items-center justify-center gap-4">
                  <img
                    src={BANNER_IMAGES[i]}
                    alt=""
                    width={520}
                    height={380}
                    style={{ width: 520, height: 380, objectFit: "contain" }}
                    className="block shrink-0"
                  />
                  <h2 className={`text-3xl font-bold mb-4 drop-shadow-sm ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                    {t(slide.titleKey)}
                  </h2>
                  <p className={`text-lg max-w-md mx-auto ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    {t(slide.descKey)}
                  </p>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>

      {/* 右侧：操作表单 */}
      <div className="flex-1 min-w-0 flex flex-col justify-center px-8 py-12 sm:px-16 ">
        <div
          className={`w-full h-140 max-w-md flex flex-col justify-center mx-auto rounded-2xl shadow-lg p-8 ${isDark ? "bg-gray-800" : "bg-white"}`}
        >
          <h1
            className={`text-2xl font-semibold text-center mb-2 ${isDark ? "text-gray-100" : "text-gray-800"}`}
          >
            {activeTab === "login"
              ? t("login.welcomeBack")
              : t("login.createAccount")}
          </h1>
          <p
            className={`text-center text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {activeTab === "login"
              ? t("login.welcomeSub")
              : t("login.registerSub")}
          </p>

          {/* <Radio.Group
            value={activeTab}
            onChange={(e) => handleTabChange(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            className="w-full mb-4"
          >
            <Radio.Button value="login" className="w-1/2 text-center">
              {t("login.login")}
            </Radio.Button>
            <Radio.Button value="register" className="w-1/2 text-center">
              {t("login.register")}
            </Radio.Button>
          </Radio.Group> */}

          {activeTab === "login" ? loginFormContent : registerFormContent}

          {/* 其他登录方式 */}
          <div
            className={`mt-8 pt-6 border-t ${isDark ? "border-gray-600" : "border-gray-100"}`}
          >
            <p
              className={`text-center text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {t("login.otherWays")}
            </p>
            <div className="flex justify-center gap-4">
              {oauthOptions.map((opt) => {
                const labelKey = `login.other.${opt.app.toLowerCase()}`;
                const label = t(labelKey) !== labelKey ? t(labelKey) : opt.app;
                return (
                  <Button
                    key={opt.app}
                    color="primary"
                    variant="filled"
                    title={label}
                    onClick={() => {
                      if (opt.loginUrl) window.location.href = opt.loginUrl;
                    }}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 图形验证码弹窗：输入正确后发送邮箱验证码 */}
      <Modal
        title={t("login.captchaModalTitle")}
        open={captchaModalOpen}
        onOk={handleCaptchaModalOk}
        onCancel={handleCaptchaModalCancel}
        okText={t("login.sendCode")}
        cancelText={t("common.cancel")}
        confirmLoading={captchaSubmitting}
        destroyOnHidden
        maskClosable={false}
      >
        <div className="py-2 flex flex-col gap-4">
          <div className="flex gap-2 items-center">
            <Input
              value={modalCaptchaInput}
              onChange={(e) => setModalCaptchaInput(e.target.value)}
              placeholder={t("login.graphicCaptchaPlaceholder")}
              maxLength={6}
              className="flex-1"
            />
            <div className="shrink-0 w-[120px] h-10 flex items-center justify-center rounded border border-gray-200 bg-gray-50 overflow-hidden">
              {captchaLoading ? (
                <span className="text-gray-400 text-sm">加载中...</span>
              ) : modalCaptchaB64s ? (
                <img
                  src={
                    modalCaptchaB64s.startsWith("data:")
                      ? modalCaptchaB64s
                      : `data:image/png;base64,${modalCaptchaB64s}`
                  }
                  alt="验证码"
                  className="w-full h-full object-contain cursor-pointer select-none"
                  title="点击刷新"
                  onClick={fetchCaptcha}
                />
              ) : (
                <span className="text-gray-400 text-sm">点击刷新</span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {t("login.graphicCaptchaHint")}
          </p>
        </div>
      </Modal>
    </div>
  );
}
