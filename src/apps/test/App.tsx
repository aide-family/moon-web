import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import Test1 from '@/pages/test/test1'
import Test2 from '@/pages/test/test2'

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: { colorPrimary: '#6c34e6' },
      }}
    >
      <BrowserRouter>
        <div>
          <Link to='/test1'>Test1</Link>
          <Link to='/test2'>Test2</Link>
        </div>
        <Routes>
          <Route path='/test1' element={<Test1 />} />
          <Route path='/test2' element={<Test2 />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
