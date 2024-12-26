import type React from 'react'
import { Outlet } from 'react-router-dom'

export interface StrategyProps {
  children?: React.ReactNode
}

const Strategy: React.FC<StrategyProps> = () => {
  return <Outlet />
}

export default Strategy
