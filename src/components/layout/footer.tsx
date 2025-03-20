import { CopyrightOutlined } from '@ant-design/icons'

const actionList = [
  {
    img: 'https://img.shields.io/github/license/aide-family/moon.svg?style=flat',
    url: 'https://github.com/aide-family/moon?tab=MIT-1-ov-file'
  },
  {
    img: 'https://img.shields.io/github/v/release/aide-family/moon?style=flat',
    url: 'https://github.com/aide-family/moon/releases'
  },
  {
    img: 'https://img.shields.io/github/stars/aide-family/moon?style=flat',
    url: 'https://github.com/aide-family/moon'
  },
  {
    img: 'https://img.shields.io/github/forks/aide-family/moon?style=flat',
    url: 'https://github.com/aide-family/moon/fork'
  }
]

export default function LayoutFooter() {
  return (
    <div className='ml-2 flex flex-col items-center gap-2'>
      <div className='flex items-center gap-2 text-sm '>
        <CopyrightOutlined />
        {window.location.host}
        <a href='https://beian.miit.gov.cn/' target='_blank' rel='noreferrer' className='text-blue-600'>
          黔ICP备2023006024号
        </a>
      </div>
      <div className='flex items-center gap-2'>
        {actionList.map((item, index) => (
          <a
            className='flex justify-center items-center h-[20px]'
            href={item.url}
            target='_blank'
            key={`${index}-${item.url}`}
            rel='noreferrer'
          >
            {!!item.img && <img src={item.img} alt='' />}
          </a>
        ))}
      </div>
    </div>
  )
}
