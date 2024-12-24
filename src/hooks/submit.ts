import { useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useSubmit = <TData, CParams extends object, UParams extends object>(
  update: (params: UParams) => Promise<TData>,
  create: (params: CParams) => Promise<TData>,
  id?: number
) => {
  const [loading, setLoading] = useState(false)
  const submit = (params: CParams | UParams) => {
    setLoading(true)
    if (id) {
      return update({ ...params, id } as UParams).finally(() => {
        setLoading(false)
      })
    } else {
      return create(params as CParams).finally(() => {
        setLoading(false)
      })
    }
  }
  return { submit, loading }
}
