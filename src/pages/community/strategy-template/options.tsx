import { StatusData } from '@/api/global'
import { DataFromItem } from '@/components/data/form'

export const searchItems: DataFromItem[] = [
  {
    name: 'keyword',
    label: '模板名称',
    type: 'input',
    props: {
      placeholder: '请输入模板名称',
      allowClear: true,
    },
  },
  {
    name: 'status',
    label: '状态',
    type: 'radio-group',
    props: {
      options: Object.entries(StatusData).map(([key, value]) => {
        return {
          label: value.text,
          value: Number(key),
        }
      }),
      optionType: 'button',
    },
  },
]
