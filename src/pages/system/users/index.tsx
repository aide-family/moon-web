import React, { useEffect, useState } from 'react'

import { useForm } from 'antd/es/form/Form'
import { searchDataFormItem, usersColumns } from './option'
import { SearchUsersParams, UserItem } from '@/api/authorization/user'
import { Gender, Status, SystemRole } from '@/api/global'
import SearchForm from '@/components/data/search-form'

import './index.scss'
import { AutoTable } from '@/components/table'

export interface UsersProps {}

const defaultSearchParams: SearchUsersParams = {
  pagination: {
    pageNum: 1,
    pageSize: 10,
  },
  keyword: '',
  status: Status.ENABLE,
  gender: Gender.ALL,
  role: SystemRole.ROLE_ALL,
}

const Users: React.FC<UsersProps> = () => {
  const [searchForm] = useForm<SearchUsersParams>()
  const [users, setUsers] = useState<UserItem[]>([])
  useEffect(() => {
    setUsers([
      {
        id: 1,
        name: '张三',
        gender: Gender.MALE,
        role: SystemRole.ROLE_ADMIN,
        status: Status.ENABLE,
        email: 'zhangsan@163.com',
        phone: '12345678901',
        createdAt: '2023-01-01 00:00:00',
        nickname: '',
        avatar: '',
        remark: '',
        updatedAt: '',
      },
    ])
  }, [])

  return (
    <div className='userBox'>
      <SearchForm
        items={searchDataFormItem}
        props={{
          form: searchForm,
          initialValues: defaultSearchParams,
        }}
      />
      <AutoTable dataSource={users} columns={usersColumns} />
    </div>
  )
}

export default Users
