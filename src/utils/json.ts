/* eslint-disable @typescript-eslint/no-explicit-any */
export function JsonStringify(obj: any) {
  try {
    return JSON.stringify(obj)
  } catch (e) {
    return `${e}`
  }
}
