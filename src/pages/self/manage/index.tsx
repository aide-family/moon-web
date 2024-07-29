import { Avatar, Button, Card, Descriptions, Form, message, Modal, Space, theme } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import type { DescriptionsProps } from 'antd'
import './index.scss'
import { MyTeam } from './my-team'
import { BaseInfo } from './base-info'
import {
  getUser,
  updateUserAvatar,
  updateUserEmail,
  updateUserPassword,
  UpDateUserPasswordParams,
  updateUserPhone,
  UserItem
} from '@/api/authorization/user'
import { DataFrom } from '@/components/data/form'
import { avatarOptions, emailOptions, passwordOptions, phoneOptions } from './options'
import { AesEncrypt } from '@/utils/aes'
import { EditOutlined } from '@ant-design/icons'
import { GlobalContext } from '@/utils/context'

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
  const [form] = Form.useForm()

  const showUpdateModal = (type: 'phone' | 'email' | 'avatar') => {
    let options, title, update
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
          <div>{userDetail.phone}</div>
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
          <div>{userDetail.email}</div>
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
    const { id } = userInfo
    getUser(id).then((res) => {
      const { user } = res
      localStorage.setItem('user', JSON.stringify(user))
      setUserDetail(user)
      setUserInfo?.(user)
    })
  }

  const updatePassword = (val: UpDateUserPasswordParams) => {
    const params: UpDateUserPasswordParams = {
      oldPassword: AesEncrypt(val.oldPassword),
      newPassword: AesEncrypt(val.newPassword)
    }
    updateUserPassword(params).then(() => {
      message.success('修改密码成功')
      form.resetFields()
    })
  }

  useEffect(() => {
    getUserInfo()
  }, [])

  const showTab = (t: TabType) => {
    switch (t) {
      case 'team':
        return <MyTeam />
      case 'notify':
        return <div>通知历史</div>
      case 'password':
        return (
          <DataFrom items={passwordOptions} props={{ layout: 'vertical', form, onFinish: updatePassword }}>
            <Form.Item>
              <Button type='primary' htmlType='submit'>
                保存
              </Button>
            </Form.Item>
          </DataFrom>
        )
      default:
        return <BaseInfo userInfo={userDetail} onOK={getUserInfo} />
    }
  }

  return (
    <div
      className='manage'
      style={{
        background: token.colorBgLayout
      }}
    >
      <Card
        style={{
          background: token.colorBgContainer
        }}
      >
        <div className='manage-user'>
          <div className='manage-user-avatar ant-image-mask'>
            <Avatar className='manage-user-avatar-box' src={userDetail.avatar}></Avatar>
            <div className='manage-user-avatar-mask'>
              <EditOutlined onClick={() => showUpdateModal('avatar')} />
            </div>
          </div>
          <Descriptions className='manage-user-descriptions' column={2} items={items} />
        </div>
      </Card>
      <Card
        className='manage-content'
        style={{
          background: token.colorBgContainer
        }}
      >
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
          <div className='manage-content-detail'>{showTab(tab)}</div>
          {children}
        </div>
      </Card>
    </div>
  )
}

export default SelfManage
