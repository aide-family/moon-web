import { DatasourceType, Status, StorageType } from '../enum'
import { UserItem } from '../model-types'

export interface EventDatasource {
  id: number
  name: string
  endpoint: string
  datasourceType: DatasourceType
  storageType: StorageType
  status: Status
  remark: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any
  creator?: UserItem
  createdAt?: string
  updatedAt?: string
}
