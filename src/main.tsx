import { createRoot } from 'react-dom/client'
import App from './pages'

import './index.css'

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
