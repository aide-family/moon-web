import type { ConfigProviderProps } from 'antd'

/** 全局 Modal：最大 80vh，禁止横向滚动，header/footer 固定，body 纵向滚动（详见 styles/index.css） */
export const antdModalProviderConfig: NonNullable<
  ConfigProviderProps['modal']
> = {
  styles: {
    container: {
      maxHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      minWidth: 0,
    },
    header: {
      flexShrink: 0,
    },
    body: {
      overflowX: 'hidden',
      minWidth: 0,
    },
    footer: {
      flexShrink: 0,
    },
  },
}
