import type React from 'react'
import { Outlet } from 'react-router-dom'

export interface SelfProps {
  children?: React.ReactNode
}

const Self: React.FC<SelfProps> = () => {
  return <Outlet />
}

export default Self
