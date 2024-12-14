// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useSubmit = <TData, CParams extends object, UParams extends object>(
  update: (params: UParams) => Promise<TData>,
  create: (params: CParams) => Promise<TData>,
  id?: number
) => {
  const submit = (params: CParams | UParams) => {
    if (id) {
      return update({ ...params, id } as UParams)
    } else {
      return create(params as CParams)
    }
  }
  return { submit }
}
