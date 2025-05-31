import { isNumberic } from '@/utils/validateType'

export function addZeros(value: number, zeros: number) {
  let valueStr = value.toString()
  while (valueStr.length < zeros) {
    valueStr = '0' + value
  }

  return valueStr
}

export function addUnit(value: string | number | undefined) {
  if (value !== null && value !== undefined) {
    return isNumberic(value) ? `${value}px` : value
  }
  return undefined
}
