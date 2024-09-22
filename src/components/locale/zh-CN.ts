const zhCNI18n = {
  APP: 'Moon 监控系统',
  Login: {
    welcome: {
      title: '欢迎来到我们的应用程序',
      subtitle: '登录以访问所有功能。',
    },
    form: {
      title: '登录您的账户',
      username: '用户名',
      password: '密码',
      captcha: '验证码',
      login: '登录',
      forgetPassword: '忘记密码？',
      register: '注册',
      registerFooter: '已有账户？',
      loginFooter: '没有账户？',
      registerLink: '去注册',
      loginLink: '去登录',
      rememberMe: '记住账号密码',
      captchaPlaceholder: '请输入验证码',
      usernamePlaceholder: '请输入用户名',
      passwordPlaceholder: '请输入密码',
      error: {
        usernameMin: '用户名不能为空',
        usernameMax: '用户名不能超过20个字符',
        passwordMin: '密码不能为空',
        passwordMax: '密码长度不能超过20个字符',
        captchamMin: '验证码不能为空',
        captchaMax: '验证码长度不能超过10个字符',
      },
    },
    locale: {
      'en-US': '英文',
      'zh-CN': '中文',
    },
    mode: {
      dark: '深色模式',
      light: '浅色模式',
      system: '跟随系统',
    },
  },
  Layout: {
    menu: {
      monitor: '实时监控',
      monitorDashboard: '数据大盘',
      monitorAlarm: '实时告警',
      datasource: '数据源',
      datasourceMetric: '指标',
      datasourceLog: '日志',
      datasourceTrace: '链路',
      strategy: '策略管理',
      strategyGroup: '策略组',
      strategyList: '策略列表',
    },
    my: {
      title: '我的账号',
      profile: '个人资料',
      logout: '退出登录',
      settings: '设置',
      team: '团队',
      newTeam: '新建团队',
      inviteUsers: {
        title: '邀请用户',
        email: '邮箱',
        phone: '手机号',
      },
      KeyboardShortcuts: '快捷键',
    },
    team: {
      create: '创建团队',
      cancel: '取消',
      confirm: '确定',
      form: {
        name: {
          error: {
            required: '团队名称不能为空',
            max: '团队名称不能超过20个字符',
          },
          label: '团队名称',
          placeholder: '请输入团队名称',
        },
        logo: {
          error: {
            required: '团队logo不能为空',
            max: '团队logo不能超过255个字符',
          },
          label: '团队logo',
          placeholder: '请输入团队logo',
        },
        remark: {
          error: {
            required: '团队描述不能为空',
            max: '团队描述不能超过255个字符',
          },
          label: '团队描述',
          placeholder: '请输入团队描述',
        },
      },
    },
    strategy: {
      group: {
        edit: {
          create: '创建策略组',
          edit: '编辑策略组',
          delete: '删除策略组',
          cancel: '取消',
          confirm: '确定',
          form: {
            name: {
              error: {
                required: '策略组名称不能为空',
                max: '策略组名称不能超过20个字符',
              },
              label: '策略组名称',
              placeholder: '请输入策略组名称',
            },
            remark: {
              error: {
                required: '策略组描述不能为空',
                max: '策略组描述不能超过255个字符',
              },
              label: '策略组描述',
              placeholder: '请输入策略组描述',
            },
            categoriesIds: {
              error: {
                required: '策略组分类不能为空',
              },
              label: '策略组分类',
              placeholder: '请选择策略组分类',
            },
          },
        },
      },
    },
  },
  AutoTable: {
    operation: '操作',
  },
  HookModal: {
    cancel: '取消',
    confirm: '确定',
  },
}

export default zhCNI18n
