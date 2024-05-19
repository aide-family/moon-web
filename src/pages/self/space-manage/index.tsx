import React from "react"

export interface SpaceManageProps {
  children?: React.ReactNode
}

const SpaceManage: React.FC<SpaceManageProps> = (props) => {
  const { children } = props

  return <div>{children}</div>
}

export default SpaceManage
