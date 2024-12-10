import logoIcon from '@/assets/images/logo.svg'
import { GlobalContext } from '@/utils/context'
import { FC, useContext } from 'react'

const HeaderTitle: FC = () => {
  const { title = 'Moon', collapsed } = useContext(GlobalContext)

  return (
    <div
      className='center gap8 header-title'
      style={{
        width: '100%',
        height: '100%'
      }}
    >
      <img
        src={logoIcon}
        alt=''
        className='header-title-logo'
        style={{
          width: '32px',
          height: '32px'
        }}
      />
      {!collapsed && (
        <h2 className='header-title-info' style={{ whiteSpace: 'nowrap', flex: 1 }}>
          {title}
        </h2>
      )}
    </div>
  )
}

export default HeaderTitle
