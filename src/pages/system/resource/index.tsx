import React, { useState } from 'react'

import MenuList from './menu-list'
import ResourceList from './resource-list'

const Rule: React.FC = () => {
  const [switchMenuList, setSwitchMenuList] = useState(true)

  const handleSwitchMenuList = () => {
    setSwitchMenuList(!switchMenuList)
  }

  return (
    <>
      {switchMenuList ? (
        <MenuList switchMenuList={handleSwitchMenuList} />
      ) : (
        <ResourceList switchMenuList={handleSwitchMenuList} />
      )}
    </>
  )
}

export default Rule
