import { Carousel } from 'antd'
import React, { useContext } from 'react'
import logoIcon from '@/assets/images/logo.svg'
import { GlobalContext } from '@/utils/context'
export interface BannerProps {}

const Banner: React.FC<BannerProps> = () => {
  const { title = 'Moon' } = useContext(GlobalContext)

  const data = [
    {
      title: '支持prometheus监控',
      content: '告警规则，规则组管理, 告警通知等',
      src: '/src/assets/images/banner.png'
    },
    {
      title: '内置了常见问题的解决方案',
      content: '设备管理，节点管理等应有尽有',
      src: '/src/assets/images/banner.png'
    },
    {
      title: '接入可视化增强工具Grafana',
      content: '实现灵活的区块式组合',
      src: '/src/assets/images/banner.png'
    },
    {
      title: '支持prometheus监控',
      content: '告警规则，规则组管理, 告警通知等',
      src: '/src/assets/images/banner.png'
    },
    {
      title: '内置了常见问题的解决方案',
      content: '设备管理，节点管理等应有尽有',
      src: '/src/assets/images/banner.png'
    }
  ]
  return (
    <div className='login-banner '>
      <div className='login-banner-logo'>
        <img src={logoIcon} className='login-banner-logo-img' />
        {title}
      </div>
      <Carousel className='login-banner-carousel' autoplay dots={false}>
        {data.map((item, index) => (
          <div key={index}>
            <div className='login-banner-carousel-title'>{item.title}</div>
            <div>{item.content}</div>
            <img src={item.src} alt={item.title} className='login-banner-carousel-img' />
          </div>
        ))}
      </Carousel>
    </div>
  )
}

export default Banner
