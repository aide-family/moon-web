import { ErrorResponse } from '@/api/request'
import { FormInstance } from 'antd'

// 公共错误处理方法（支持泛型）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleFormError = <T extends Record<string, any>>(
  form: FormInstance<T>, // 可以使用 FormInstance<T> 替代 any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: ErrorResponse | any
) => {
  if (err.code === 400) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.keys(err?.metadata).forEach((key: any) => {
      form.setFields([{ name: key, errors: [err?.metadata?.[key]] }])
    })
  }
}
