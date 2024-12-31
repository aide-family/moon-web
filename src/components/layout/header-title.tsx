import logoIcon from '@/assets/images/logo.svg'
import { GlobalContext } from '@/utils/context'
import { type FC, useContext } from 'react'

const HeaderTitle: FC = () => {
  const { title = 'Moon', collapsed } = useContext(GlobalContext)

  return (
    <div className='flex items-center gap-2 w-full h-full'>
      <img src={logoIcon} alt='' className='w-8 h-8' />
      {!collapsed && <h2 className='text-lg font-bold whitespace-nowrap flex-1'>{title}</h2>}
    </div>
  )
}

export default HeaderTitle
