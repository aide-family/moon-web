import type { DataFromItem } from "@/components/data/form"

export const baseInfoOptions: (DataFromItem | DataFromItem[])[] = [
  [
    {
      label: "昵称",
      name: "nikename",
      type: "input",
      props: {
        placeholder: "请输入昵称",
      },
    },
    {
      label: "性别",
      name: "gender",
      type: "radio-group",
      props: {
        options: [
          {
            label: "男",
            value: 1,
          },
          {
            label: "女",
            value: 2,
          },
        ],
      },
    },
  ],
  {
    label: "备注",
    name: "remark",
    type: "textarea",
    props: {
      rows: 4,
      placeholder: "请输入备注",
      showCount: true,
      maxLength: 200,
    },
  },
]
