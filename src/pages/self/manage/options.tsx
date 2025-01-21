import type { DataFromItem } from '@/components/data/form'

export const baseInfoOptions: (DataFromItem | DataFromItem[])[] = [
  [
    {
      label: '昵称',
      name: 'nickname',
      type: 'input',
      props: {
        placeholder: '请输入昵称'
      }
    },
    {
      label: '性别',
      name: 'gender',
      type: 'radio-group',
      props: {
        options: [
          {
            label: '男',
            value: 1
          },
          {
            label: '女',
            value: 2
          }
        ]
      },
      formProps: {
        rules: [{ required: true, message: '必选' }]
      }
    }
  ],
  {
    label: '备注',
    name: 'remark',
    type: 'textarea',
    props: {
      rows: 4,
      placeholder: '请输入备注',
      showCount: true,
      maxLength: 200
    }
  }
]

export const phoneOptions: (DataFromItem | DataFromItem[])[] = [
  {
    label: '',
    name: 'phone',
    type: 'input',
    props: {
      placeholder: '请输入手机号'
    },
    formProps: {
      rules: [
        { required: true, message: '必填!' },
        {
          pattern: /^1\d{10}$/,
          message: '手机号格式不正确!'
        }
      ]
    }
  }
]

export const emailOptions: (DataFromItem | DataFromItem[])[] = [
  {
    label: '',
    name: 'email',
    type: 'input',
    props: {
      placeholder: '请输入邮箱号'
    },
    formProps: {
      rules: [
        { required: true, message: '必填!' },
        { type: 'email', message: '邮箱格式不正确!' }
      ]
    }
  }
]

export const passwordOptions: (DataFromItem | DataFromItem[])[] = [
  {
    label: '旧密码',
    name: 'oldPassword',
    type: 'password',
    props: {
      placeholder: '请输入旧密码',
      autoComplete: 'off'
    },
    formProps: {
      rules: [
        { required: true, message: '必填!' },
        { min: 6, message: '密码不能小于6位' }
      ]
    }
  },
  {
    label: '新密码',
    name: 'newPassword',
    type: 'password',
    props: {
      placeholder: '请输入新密码',
      autoComplete: 'off'
    },
    formProps: {
      rules: [
        { required: true, message: '必填' },
        { min: 6, message: '密码不能小于6位' }
      ]
    }
  }
]

export const avatarOptions: (DataFromItem | DataFromItem[])[] = [
  {
    label: '',
    name: 'avatar',
    type: 'textarea',
    props: {
      placeholder: '请输入头像地址'
    },
    formProps: {
      rules: [{ required: true, message: '必填!' }]
    }
  }
]
