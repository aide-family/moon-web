import React from 'react'
import HouyiServer from './houyi_server'
import styles from './index.module.scss'
import './index.scss'
import RabbimtServer from './rabbit_server'
export interface LoginProps {}
const Server: React.FC<LoginProps> = () => {
  return (
    <div className={styles.box}>
      <HouyiServer />
      <RabbimtServer />
    </div>
  )
}

export default Server
