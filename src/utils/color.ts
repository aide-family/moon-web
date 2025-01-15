/**
 * 将 RAB 格式字符串 "rab(r, g, b, x)" 转换为 HEX 的方法
 * @param input 字符串，格式为 "rab(r, g, b, [x])"
 * @returns HEX 格式的颜色字符串（#RRGGBB）
 */
export function rabStringToHex(input: string): string {
  console.log('input', input)
  // 正则匹配 RAB 格式，x 参数是可选的
  const rabRegex = /^rab\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([^()]+)\s*)?\)$/i
  const match = input.match(rabRegex)

  if (!match) {
    throw new Error('Invalid RAB format. Expected format: rab(r, g, b, [x])')
  }

  // 提取 R, G, B 值
  const r = parseInt(match[1], 10)
  const g = parseInt(match[2], 10)
  const b = parseInt(match[3], 10)
  const x = match[4]?.trim() // 可选参数 x

  // 验证 RGB 值是否在合法范围内
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    throw new Error('RGB values must be integers between 0 and 255.')
  }

  // 转换为 HEX 格式
  const toHex = (value: number): string => value.toString(16).padStart(2, '0')
  const hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`

  // 如果需要对 x 做额外处理，可以在这里操作
  if (x) {
    console.log(`Additional parameter (x): ${x}`)
  }

  return hexColor
}
