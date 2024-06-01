import { FC, useContext } from "react"

import logoIcon from "@/assets/images/logo.svg"
import { GlobalContext } from "@/utils/context"

const HeaderTitle: FC = () => {
  const { title = "Moon" } = useContext(GlobalContext)

  return (
    <div className='center gap8'>
      <img src={logoIcon} alt='' className='header-title-logo' />
      <h2>{title}</h2>
    </div>
  )
}

export default HeaderTitle
