/* eslint-disable @typescript-eslint/no-explicit-any */
export function JsonStringify(obj: any) {
  try {
    return JSON.stringify(obj)
  } catch (e) {
    return `${e}`
  }
}

export const validateJson = (jsonString: string): { isValid: boolean; error?: string } => {
  try {
    JSON.parse(jsonString)
    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: (error as Error).message
    }
  }
}

export const processEnvVariables = (jsonString: string): string => {
  return jsonString.replace(/\${([^}]+)}/g, (match, key) => {
    return process.env[key] || match
  })
}
