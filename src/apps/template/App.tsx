import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import Template1 from '@/pages/template/template1'
import Template2 from '@/pages/template/template2'
import Test1 from '@/pages/test/test1'

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
          <Link to='/template1'>Template1</Link>
          <Link to='/template2'>Template2</Link>
          <Link to='/test1'>Test1</Link>
        </div>
        <Routes>
          <Route path='/template1' element={<Template1 />} />
          <Route path='/template2' element={<Template2 />} />
          <Route path='/test1' element={<Test1 />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
