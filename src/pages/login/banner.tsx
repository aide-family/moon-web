import { Carousel } from 'antd'
import React from 'react'
export interface BannerProps {}

const Banner: React.FC<BannerProps> = () => {
  const data = [
    {
      title: '支持多种类型数据监控',
      content: 'Metric、 Log、 Event、 Trace 等',
      src: '/banner/banner1.svg'
    },
    {
      title: '内置了常见问题的解决方案',
      content: '告警规则、告警模板、 告警通知等',
      src: '/banner/banner2.svg'
    },
    {
      title: '接入可视化增强工具Grafana',
      content: '实现灵活的区块式组合',
      src: '/banner/banner3.svg'
    },
    {
      title: '适配多种类型数据源',
      content: 'Prometheus、Victoriametrics、InfluxDB、Loki、Elasticsearch、Jaeger',
      src: '/banner/banner4.svg'
    },
    {
      title: '种类繁多的通知方式',
      content: '电话、短信、邮件、微信、飞书、钉钉、Slack、Webhook 等',
      src: '/banner/banner5.svg'
    }
  ]
  return (
    <div className='relative top-1/2 translate-y-[-50%]'>
      <Carousel
        className='h-full p-8 flex justify-center items-center text-center text-white text-xl'
        autoplay
        dots={false}
      >
        {data.map((item, index) => (
          <div key={index}>
            <div className='text-2xl pb-5 text-white'>{item.title}</div>
            <div className='text-white'>{item.content}</div>
            <img
              src={item.src}
              alt={item.title}
              className='h-full w-full pointer-events-none cursor-default select-none'
            />
          </div>
        ))}
      </Carousel>
    </div>
  )
}

export default Banner
