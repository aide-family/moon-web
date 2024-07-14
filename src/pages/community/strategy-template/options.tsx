import { Condition, StatusData, SustainType } from '@/api/global'
import { DataFromItem } from '@/components/data/form'

export type TemplateEditModalFormData = {
  alert: string
  datasource: string
  expr: string
  labelsItems: {
    key: string
    value: string
  }[]
  annotations: {
    summary: string
    description: string
  }
  levelItems: {
    condition: Condition
    count: number
    duration: number
    levelId: number
    sustainType: SustainType
    threshold: 1
  }[]
  remark: string
}

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
