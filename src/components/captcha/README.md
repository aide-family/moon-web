# Moon Captcha 验证码组件

基于 [go-captcha-react](https://github.com/wenlng/go-captcha-react) 封装的验证码组件，支持点击、滑动、旋转三种验证模式，完全对接后端API，遵循项目API规范。

## 功能特性

- ✅ 支持三种验证码模式：点击、滑动、旋转
- ✅ 根据API返回的 `captchaType` 自动选择对应组件
- ✅ 返回标准化的验证码校验数据，可直接用于登录
- ✅ 遵循项目API请求规范，使用统一的request模块
- ✅ 可自定义配置（尺寸、主题、样式等）
- ✅ 提供成功/失败回调函数
- ✅ 支持刷新和关闭操作
- ✅ 响应式设计，适配不同屏幕
- ✅ TypeScript 类型支持
- ✅ 保持项目代码风格

## API 接口

### 获取验证码
```
GET /api/auth/captcha
```

返回格式：
```json
{
  "captchaId": "4788f8a3-167c-43e0-9395-b4e7357bf885",
  "masterImageBase64": "data:image/png;base64,iVBORw0xxxx",
  "expiredSeconds": 0,
  "thumbImageBase64": "data:image/png;base64,iVBORw0KGg",
  "thumbSize": 160,
  "tileWidth": 0,
  "tileHeight": 0,
  "captchaType": 3  // 1:点击 2:滑动 3:旋转
}
```

### 验证码类型
- `captchaType: 1` - 点击验证码
- `captchaType: 2` - 滑动验证码  
- `captchaType: 3` - 旋转验证码

## API 模块

验证码API已集成到项目的API模块中：

```typescript
// src/api/authorization/captcha.ts
import { getCaptcha, type CaptchaResponse, type CaptchaVerifyData } from '@/api/authorization/captcha'

// 获取验证码
const captchaData = await getCaptcha()
```

## 使用方法

### 1. 智能验证码（推荐）

```tsx
import React, { useState } from 'react'
import { SmartCaptcha } from '@/components/captcha'

const LoginForm = () => {
  const [visible, setVisible] = useState(false)
  const [captchaData, setCaptchaData] = useState(null)

  const handleCaptchaSuccess = (data) => {
    setCaptchaData(data)
    setVisible(false)
  }

  const handleLogin = async (formData) => {
    const loginData = {
      email: formData.email,
      password: formData.password,
      captcha: captchaData // 直接使用验证码返回的数据
    }
    
    // 发送登录请求
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    })
  }

  return (
    <div>
      <button onClick={() => setVisible(true)}>
        显示验证码
      </button>
      
      <SmartCaptcha
        visible={visible}
        onSuccess={handleCaptchaSuccess}
        onError={(error) => console.error(error)}
        onClose={() => setVisible(false)}
      />
    </div>
  )
}
```

### 2. 指定类型验证码

```tsx
import { ClickCaptcha, SlideCaptcha, RotateCaptcha } from '@/components/captcha'

// 点击验证码
<ClickCaptcha 
  visible={visible} 
  onSuccess={handleSuccess} 
/>

// 滑动验证码
<SlideCaptcha 
  visible={visible} 
  onSuccess={handleSuccess} 
/>

// 旋转验证码
<RotateCaptcha 
  visible={visible} 
  onSuccess={handleSuccess} 
/>
```

### 3. 按钮组件

```tsx
import { CaptchaButton } from '@/components/captcha'

<CaptchaButton
  captchaType="smart"
  onSuccess={handleSuccess}
  onError={handleError}
>
  智能验证
</CaptchaButton>
```

## 验证码数据格式

验证码组件成功后会返回标准化的校验数据，可直接用于登录：

```typescript
interface CaptchaVerifyData {
  captchaId: string
  angle?: number    // 旋转验证码
  sx?: number       // 滑动验证码 X坐标
  sy?: number       // 滑动验证码 Y坐标  
  dots?: string     // 点击验证码 点击点数据
}
```

### 登录请求格式

```json
{
  "email": "user@example.com",
  "password": "password123",
  "captcha": {
    "captchaId": "4788f8a3-167c-43e0-9395-b4e7357bf885",
    "angle": 0,           // 旋转验证码
    "sx": 0,              // 滑动验证码 X坐标
    "sy": 0,              // 滑动验证码 Y坐标
    "dots": "string"      // 点击验证码 点击点数据
  }
}
```

## API 文档

### SmartCaptcha Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `boolean` | `false` | 是否显示验证码弹窗 |
| `title` | `string` | `'验证码'` | 弹窗标题 |
| `onSuccess` | `(data: CaptchaVerifyData) => void` | - | 验证成功回调 |
| `onError` | `(error: string) => void` | - | 验证失败回调 |
| `onClose` | `() => void` | - | 关闭弹窗回调 |

### ClickCaptcha/SlideCaptcha/RotateCaptcha Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `config` | `CaptchaConfig` | `{}` | 验证码配置 |
| `visible` | `boolean` | `false` | 是否显示验证码弹窗 |
| `title` | `string` | `'验证码'` | 弹窗标题 |
| `onSuccess` | `(data: CaptchaVerifyData) => void` | - | 验证成功回调 |
| `onError` | `(error: string) => void` | - | 验证失败回调 |
| `onClose` | `() => void` | - | 关闭弹窗回调 |

### CaptchaButton Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `captchaType` | `'smart' \| 'click' \| 'slide' \| 'rotate'` | `'smart'` | 验证码类型 |
| `onSuccess` | `(data: CaptchaVerifyData) => void` | - | 验证成功回调 |
| `onError` | `(error: string) => void` | - | 验证失败回调 |
| `children` | `React.ReactNode` | `'验证码'` | 按钮文本 |

### CaptchaConfig

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `width` | `number` | `300` | 验证码宽度 |
| `height` | `number` | `220` | 验证码高度 |
| `thumbWidth` | `number` | `60` | 缩略图宽度 |
| `thumbHeight` | `number` | `60` | 缩略图高度 |
| `verticalPadding` | `number` | `20` | 垂直内边距 |
| `horizontalPadding` | `number` | `20` | 水平内边距 |
| `showTheme` | `boolean` | `true` | 是否显示主题 |
| `title` | `string` | - | 标题 |
| `buttonText` | `string` | `'验证'` | 按钮文本 |
| `iconSize` | `number` | `20` | 图标大小 |
| `dotSize` | `number` | `24` | 点击点大小 |
| `scope` | `boolean` | `true` | 是否显示范围 |

## 验证码类型说明

### 1. 点击验证 (captchaType: 1)
用户需要点击图片中的特定位置来完成验证。

### 2. 滑动验证 (captchaType: 2)
用户需要滑动滑块到正确位置来完成验证。

### 3. 旋转验证 (captchaType: 3)
用户需要旋转图片到正确角度来完成验证。

## 完整登录示例

```tsx
import React, { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { SmartCaptcha } from '@/components/captcha'

const LoginForm = () => {
  const [form] = Form.useForm()
  const [captchaVisible, setCaptchaVisible] = useState(false)
  const [captchaData, setCaptchaData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleCaptchaSuccess = (data) => {
    setCaptchaData(data)
    message.success('验证码验证成功')
  }

  const handleCaptchaError = (error) => {
    message.error(`验证码验证失败: ${error}`)
  }

  const handleSubmit = async (values) => {
    if (!captchaData) {
      message.error('请先完成验证码验证')
      return
    }

    setLoading(true)
    try {
      const loginData = {
        email: values.email,
        password: values.password,
        captcha: captchaData
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })

      if (response.ok) {
        message.success('登录成功')
        // 处理登录成功逻辑
      } else {
        message.error('登录失败')
      }
    } catch (error) {
      message.error('登录出错')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        label="邮箱"
        name="email"
        rules={[{ required: true, message: '请输入邮箱' }]}
      >
        <Input placeholder="请输入邮箱" />
      </Form.Item>

      <Form.Item
        label="密码"
        name="password"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password placeholder="请输入密码" />
      </Form.Item>

      <Form.Item label="验证码">
        <Button 
          onClick={() => setCaptchaVisible(true)}
          disabled={!!captchaData}
        >
          {captchaData ? '已验证' : '点击验证'}
        </Button>
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          disabled={!captchaData}
          block
        >
          登录
        </Button>
      </Form.Item>

      <SmartCaptcha
        visible={captchaVisible}
        onSuccess={handleCaptchaSuccess}
        onError={handleCaptchaError}
        onClose={() => setCaptchaVisible(false)}
      />
    </Form>
  )
}

export default LoginForm
```

## 项目集成

验证码组件已完全集成到项目的API规范中：

```typescript
// 使用项目的API模块
import { getCaptcha } from '@/api/authorization/captcha'

// 使用验证码组件
import { SmartCaptcha } from '@/components/captcha'
```

## 注意事项

1. 确保后端API接口 `/api/auth/captcha` 正常工作
2. 验证码数据会包含 `captchaId`，用于后端验证
3. 不同验证码类型返回的数据格式不同，但都符合登录接口要求
4. 建议使用 `SmartCaptcha` 组件，它会根据API返回类型自动选择对应组件
5. 验证码成功后返回的数据可直接用于登录请求的 `captcha` 字段
6. API请求遵循项目的统一规范，使用 `request` 模块

## 更新日志

- v2.1.0: 集成项目API规范，使用统一的request模块
- v2.0.0: 重构为API驱动，支持标准化验证码数据格式
- v1.0.0: 初始版本，支持三种验证码模式

## 安装依赖

项目已安装 `go-captcha-react` 依赖：

```bash
npm install go-captcha-react
# 或
yarn add go-captcha-react
```

## 示例

查看 `demo.tsx` 文件获取完整的使用示例。 