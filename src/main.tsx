import React from "react"
import ReactDOM from "react-dom/client"
import App from "./pages"
import "./index.css"
import "@/utils/rem"
import { px2remTransformer, StyleProvider } from "@ant-design/cssinjs"

const px2rem = px2remTransformer({
  rootValue: 32, // 32px = 1rem; @default 16
})

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <StyleProvider transformers={[px2rem]} layer>
    <App />
  </StyleProvider>
  // </React.StrictMode>
)
