import { DatasourceType, Status, StorageType } from '../enum'

export interface EventDatasource {
  name: string
  endpoint: string
  datasourceType: DatasourceType
  storageType: StorageType
  status: Status
  remark: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any
}
