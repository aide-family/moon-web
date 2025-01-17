import { ChartType, Status } from '@/api/enum'
import { ChartTypeData, StatusData } from '@/api/global'
import { DataFromItem } from '@/components/data/form'
import { Badge } from 'antd'

export const editChartItems = (): (DataFromItem | DataFromItem[])[] => [
  {
    label: '标题',
    name: 'title',
    type: 'input',
    formProps: {
      rules: [{ required: true, message: '请输入标题' }]
    },
    props: {
      placeholder: '请输入标题'
    }
  },
  {
    label: '图表链接',
    name: 'url',
    type: 'input',
    formProps: {
      rules: [
        { required: true, message: '请输入图表链接' },
        { type: 'url', message: '请输入正确的图表链接' }
      ]
    },
    props: {
      placeholder: '请输入图表链接'
    }
  },
  [
    {
      label: '图表类型',
      name: 'chartType',
      type: 'select',
      formProps: {
        rules: [{ required: true, message: '请选择图表类型' }]
      },
      props: {
        placeholder: '请选择图表类型',
        options: Object.entries(ChartTypeData)
          .filter(([key]) => +key !== ChartType.CHART_TYPE_UNKNOWN)
          .map(([key, value]) => ({
            label: value,
            value: +key
          }))
      }
    },
    {
      label: '状态',
      name: 'status',
      type: 'radio-group',
      formProps: {
        rules: [{ required: true, message: '请选择状态' }]
      },
      props: {
        options: Object.entries(StatusData)
          .filter(([key]) => +key !== Status.StatusAll)
          .map(([key, value]) => ({
            label: <Badge {...value} />,
            value: +key
          }))
      }
    }
  ],
  [
    {
      label: '宽度',
      name: 'width',
      type: 'input',
      props: {
        placeholder: '请输入宽度',
        suffix: 'px',
        type: 'number'
      }
    },
    {
      label: '高度',
      name: 'height',
      type: 'input',
      props: {
        placeholder: '请输入高度',
        suffix: 'px',
        type: 'number'
      }
    }
  ],
  {
    label: '描述',
    name: 'remark',
    type: 'textarea',
    props: {
      placeholder: '请输入描述',
      showCount: true,
      maxLength: 200
    }
  }
]
