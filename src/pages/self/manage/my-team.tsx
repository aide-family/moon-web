import React from "react"

export interface MyTeamProps {
  children?: React.ReactNode
}

export const MyTeam: React.FC<MyTeamProps> = (props) => {
  const { children } = props

  return <div>{children}</div>
}
