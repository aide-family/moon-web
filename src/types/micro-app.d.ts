// declare module '@micro-zoe/micro-app' {
//   interface MicroApp {
//     start(): void
//     setData(appName: string, data: Record<string, unknown>): void
//     getData(appName: string): Record<string, unknown> | null
//     addDataListener(appName: string, callback: (data: Record<string, unknown>) => void): void
//     removeDataListener(appName: string, callback: (data: Record<string, unknown>) => void): void
//   }

//   const microApp: MicroApp
//   export default microApp
// }

// // 扩展 JSX 命名空间以支持 micro-app 元素
// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       'micro-app': React.DetailedHTMLProps<
//         React.HTMLAttributes<HTMLElement> & {
//           name: string
//           url: string
//           baseroute?: string
//           'disable-scopecss'?: boolean
//           'disable-sandbox'?: boolean
//           iframe?: boolean
//         },
//         HTMLElement
//       >
//     }
//   }
// }

