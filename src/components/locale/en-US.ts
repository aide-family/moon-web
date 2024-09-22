import { I18nLocaleType } from '.'

const enUSI18n: I18nLocaleType = {
  APP: 'Moon Monitor',
  Login: {
    welcome: {
      title: 'Welcome to our App',
      subtitle: 'Sign in to access all the features.',
    },
    form: {
      title: 'Sign in to your account',
      username: 'Username',
      password: 'Password',
      captcha: 'Captcha',
      login: 'Login',
      forgetPassword: 'Forgot your password?',
      register: 'Register',
      registerFooter: 'Have an account?',
      loginFooter: "Don't have an account? ",
      registerLink: 'to register',
      loginLink: 'to login',
      rememberMe: 'Remember me',
      captchaPlaceholder: 'Please enter the captcha',
      usernamePlaceholder: 'Please enter the username',
      passwordPlaceholder: 'Please enter the password',
      error: {
        usernameMin: 'The username cannot be empty',
        usernameMax: 'The username cannot exceed 20 characters',
        passwordMin: 'The password cannot be empty',
        passwordMax: 'The password length cannot exceed 20 characters',
        captchamMin: 'Captcha cannot be empty',
        captchaMax: 'Captcha length cannot exceed 10 characters',
      },
    },
    locale: {
      'en-US': 'English',
      'zh-CN': 'Chinese',
    },
    mode: {
      dark: 'Dark Mode',
      light: 'Light Mode',
      system: 'Follow System',
    },
  },
  Layout: {
    menu: {
      monitor: 'Monitor',
      monitorDashboard: 'Dashboard',
      monitorAlarm: 'Alarm',
      datasource: 'Datasource',
      datasourceMetric: 'Metric',
      datasourceLog: 'Log',
      datasourceTrace: 'Trace',
      strategy: 'Strategy',
      strategyGroup: 'Group',
      strategyList: 'List',
    },
    my: {
      title: 'My Account',
      profile: 'Profile',
      logout: 'Logout',
      settings: 'Settings',
      team: 'Team',
      newTeam: 'New Team',
      inviteUsers: {
        title: 'Invite Users',
        email: 'Email',
        phone: 'Phone',
      },
      KeyboardShortcuts: 'Keyboard shortcuts',
    },
    team: {
      create: 'Create Team',
      cancel: 'Cancel',
      confirm: 'Confirm',
      form: {
        name: {
          error: {
            required: 'Team name cannot be empty',
            max: 'Team name cannot exceed 20 characters',
          },
          label: 'Name',
          placeholder: 'Please enter the team name',
        },
        logo: {
          error: {
            required: 'Team logo cannot be empty',
            max: 'Team logo cannot exceed 255 characters',
          },
          label: 'Logo',
          placeholder: 'Please enter the team logo',
        },
        remark: {
          error: {
            required: 'Team description cannot be empty',
            max: 'Team description cannot exceed 255 characters',
          },
          label: 'Description',
          placeholder: 'Please enter the team description',
        },
      },
    },
    strategy: {
      group: {
        edit: {
          create: 'Create Strategy Group',
          edit: 'Edit Strategy Group',
          delete: 'Delete Strategy Group',
          cancel: 'Cancel',
          confirm: 'Confirm',
          form: {
            name: {
              error: {
                required: 'Strategy group name cannot be empty',
                max: 'Strategy group name cannot exceed 20 characters',
              },
              label: 'Name',
              placeholder: 'Please enter the strategy group name',
            },
            remark: {
              error: {
                required: 'Strategy group description cannot be empty',
                max: 'Strategy group description cannot exceed 255 characters',
              },
              label: 'Description',
              placeholder: 'Please enter the strategy group description',
            },
            categoriesIds: {
              error: {
                required: 'Strategy group classification cannot be empty',
              },
              label: 'Classification',
              placeholder: 'Please select the strategy group classification',
            },
          },
        },
      },
    },
  },
  AutoTable: {
    operation: 'Operation',
  },
  HookModal: {
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
}

export default enUSI18n
