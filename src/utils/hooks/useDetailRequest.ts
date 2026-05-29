import { useRequest } from 'ahooks'

export function useDetailRequest<TData>(
  service: (uid: string) => Promise<TData>,
  uid?: string,
  open = false,
) {
  return useRequest(() => service(uid!), {
    ready: Boolean(uid) && open,
    refreshDeps: [uid],
  })
}
