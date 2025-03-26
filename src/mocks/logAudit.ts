import { LogItem } from '@/api/log'
import Mock from 'mockjs'

// 生成符合 LogEntry 类型的模拟数据
export const generateMockLogs = (count: number): LogItem[] => {
  return Mock.mock({
    [`data|${count}`]: [
      {
        'id|+1': 1,
        module: '@integer(0, 2)',
        dataID: '@guid',
        operateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        operator: {
          id: Mock.Random.natural(1, 100),
          name: '@cname',
          nickname: '@cname',
          email: '@email',
          phone: '@phone',
          status: '@integer(0, 1)',
          role: '@integer(0, 2)',
          avatar: '@image'
        },
        'action|1': [0, 1, 2, 3],
        remark: Mock.Random.csentence(5, 10),
        before: JSON.stringify({
          field: Mock.Random.word(),
          oldValue: Mock.Random.csentence(),
          newValue: Mock.Random.csentence(),
          after: Mock.Random.csentence(),
          before: Mock.Random.csentence(),
          beforeValue: Mock.Random.csentence(),
          beforeContent: Mock.Random.csentence(),
          afterContent: Mock.Random.csentence(),
          beforeStatus: Mock.Random.csentence(),
          afterStatus: Mock.Random.csentence()
        }),
        after: JSON.stringify({
          field: Mock.Random.word(),
          oldValue: Mock.Random.csentence(),
          newValue: Mock.Random.csentence(),
          after: Mock.Random.csentence(),
          before: Mock.Random.csentence(),
          beforeValue: Mock.Random.csentence(),
          beforeContent: Mock.Random.csentence(),
          afterContent: Mock.Random.csentence(),
          beforeStatus: Mock.Random.csentence(),
          afterStatus: Mock.Random.csentence(),
          beforeRemark: Mock.Random.csentence(),
          afterRemark: Mock.Random.csentence(),
          beforeLanguageCode: Mock.Random.csentence(),
          afterLanguageCode: Mock.Random.csentence(),
          beforeDictType: Mock.Random.csentence(),
          afterDictType: Mock.Random.csentence(),
          beforeColorType: Mock.Random.csentence(),
          afterColorType: Mock.Random.csentence(),
          beforeCssClass: Mock.Random.csentence(),
          afterCssClass: Mock.Random.csentence(),
          beforeIcon: Mock.Random.csentence(),
          afterIcon: Mock.Random.csentence()
        })
      }
    ]
  }).data as LogItem[] // 类型断言
}
