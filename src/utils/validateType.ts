/**
 * 判断这个值是不是数字
 * @param value
 * @returns Boolean
 */
export function isNumberic(value: number | string) {
  return typeof value === 'number' || /^\d+(\.\d+)?$/.test(value)
}

export function isString(value: unknown) {
  return typeof value === 'string'
}

export function isBoolean(value: unknown) {
  return typeof value === 'boolean'
}

export function isNumber(value: unknown) {
  return typeof value === 'number'
}

export function isPx(value: unknown) {
  return (isString(value) && value.endsWith('px')) || isNumber(value)
}

export function isVw(value: unknown) {
  return isString(value) && value.endsWith('vw')
}
