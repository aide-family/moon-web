import type { UserItem } from '@/api/model-types'
import {
  type ResetUserPasswordBySelfRequest,
  type UpdateUserAvatarRequest,
  type UpdateUserBaseInfoRequest,
  type UpdateUserRequest,
  getUserBasic,
  resetUserPasswordBySelf,
  updateUserAvatar,
  updateUserEmail,
  updateUserPhone
} from '@/api/user'
import { DataFrom, type DataFromItem } from '@/components/data/form'
import { GlobalContext } from '@/utils/context'
import { hashMd5 } from '@/utils/hash'
import { EditOutlined } from '@ant-design/icons'
import type { DescriptionsProps } from 'antd'
import { Avatar, Button, Card, Descriptions, Form, Modal, Space, message, theme } from 'antd'
import type React from 'react'
import { useContext, useEffect, useState } from 'react'
import { BaseInfo } from './base-info'
import { MyTeam } from './my-team'
import { avatarOptions, emailOptions, passwordOptions, phoneOptions } from './options'

export interface SelfManageProps {
  children?: React.ReactNode
}

type TabType = 'basic' | 'team' | 'notify' | 'password'
const { useToken } = theme
const { confirm } = Modal

const SelfManage: React.FC<SelfManageProps> = (props) => {
  const { userInfo, setUserInfo } = useContext(GlobalContext)
  const { children } = props
  const [tab, setTab] = useState<TabType>('basic')
  const { token } = useToken()
  const [userDetail, setUserDetail] = useState<UserItem>({} as UserItem)
  const [form] = Form.useForm<UpdateUserRequest | UpdateUserBaseInfoRequest | UpdateUserAvatarRequest>()

  const showUpdateModal = (type: 'phone' | 'email' | 'avatar') => {
    let options: (DataFromItem | DataFromItem[])[]
    let title: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let update: (params: any) => Promise<null>

    switch (type) {
      case 'phone': {
        options = phoneOptions
        title = '修改手机号？'
        update = updateUserPhone
        break
      }
      case 'email': {
        options = emailOptions
        title = '修改邮箱号？'
        update = updateUserEmail
        break
      }
      case 'avatar': {
        options = avatarOptions
        title = '修改头像？'
        update = updateUserAvatar
      }
    }
    confirm({
      title: title,
      content: <DataFrom items={options} props={{ layout: 'vertical', form, initialValues: userDetail }} />,
      okText: '保存',
      onOk() {
        update(form.getFieldsValue()).then(() => {
          getUserInfo()
          message.success('修改成功')
        })
      }
    })
  }

  const items: DescriptionsProps['items'] = [
    {
      key: 'username',
      label: '用户',
      children: <b>{userDetail.name}</b>
    },
    {
      key: 'phone',
      label: '手机',
      children: (
        <Space size={4}>
          <div>{userDetail.phone || '-'}</div>
          <Button type='link' size='small' onClick={() => showUpdateModal('phone')}>
            修改
          </Button>
        </Space>
      )
    },
    {
      key: 'nikename',
      label: '昵称',
      children: userDetail.nickname
    },
    {
      key: 'email',
      label: '邮箱',
      children: (
        <Space size={4}>
          <div>{userDetail.email || '-'}</div>
          <Button type='link' size='small' onClick={() => showUpdateModal('email')}>
            修改
          </Button>
        </Space>
      )
    },
    {
      key: 'remark',
      label: '备注',
      children: userDetail.remark
    }
  ]

  const getUserInfo = () => {
    if (!userInfo) {
      return
    }
    getUserBasic().then((res) => {
      const { detail } = res
      localStorage.setItem('user', JSON.stringify(detail))
      setUserDetail(detail)
      setUserInfo?.(detail)
    })
  }

  const updatePassword = (val: ResetUserPasswordBySelfRequest) => {
    const params: ResetUserPasswordBySelfRequest = {
      oldPassword: hashMd5(val.oldPassword),
      newPassword: hashMd5(val.newPassword)
    }
    resetUserPasswordBySelf(params).then(() => {
      message.success('修改密码成功')
      form.resetFields()
    })
  }

  useEffect(() => {
    getUserInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showTab = (t: TabType) => {
    switch (t) {
      case 'team':
        return <MyTeam />
      case 'notify':
        return <div>通知历史</div>
      case 'password':
        return (
          <Space>
            <DataFrom
              items={passwordOptions}
              props={{
                layout: 'vertical',
                form,
                onFinish: updatePassword,
                autoComplete: 'off'
              }}
            >
              <Form.Item>
                <Button type='primary' htmlType='submit'>
                  保存
                </Button>
              </Form.Item>
            </DataFrom>
          </Space>
        )
      default:
        return <BaseInfo userInfo={userDetail} onOK={getUserInfo} />
    }
  }

  return (
    <div className='h-full flex flex-col gap-3 p-3' style={{ background: token.colorBgLayout }}>
      <Card style={{ background: token.colorBgContainer }}>
        <div className='p-5 flex justify-between items-center gap-14'>
          <div className='relative backdrop-blur-sm'>
            <Avatar className='w-[120px] h-[120px]' src={userDetail.avatar}></Avatar>
            <div className='absolute inset-0 flex justify-center items-center text-white bg-black/50 opacity-0 transition-opacity duration-slow rounded-full text-2xl cursor-pointer'>
              <EditOutlined onClick={() => showUpdateModal('avatar')} />
            </div>
          </div>
          <Descriptions className='flex-1' column={2} items={items} />
        </div>
      </Card>
      <Card className='flex-1' style={{ background: token.colorBgContainer }}>
        <div>
          <Space size={8}>
            <Button type={tab === 'basic' ? 'primary' : 'default'} onClick={() => setTab('basic')}>
              基本信息
            </Button>
            <Button type={tab === 'team' ? 'primary' : 'default'} onClick={() => setTab('team')}>
              我的团队
            </Button>
            <Button type={tab === 'notify' ? 'primary' : 'default'} onClick={() => setTab('notify')}>
              通知历史
            </Button>
            <Button type={tab === 'password' ? 'primary' : 'default'} onClick={() => setTab('password')}>
              修改密码
            </Button>
          </Space>
          <div className='pt-3'>{showTab(tab)}</div>
          {children}
        </div>
      </Card>
    </div>
  )
}

export default SelfManage
