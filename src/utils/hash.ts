import crypto from 'crypto-js'

const salt = '3c4d9a0a5a703938dd1d2d46e1c924f9'
export function hashMd5(password: string) {
  return crypto.MD5(password + salt).toString()
}
