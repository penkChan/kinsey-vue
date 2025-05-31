export function addZeros(value: number, zeros: number) {
  let valueStr = value.toString()
  while (valueStr.length < zeros) {
    valueStr = '0' + value
  }

  return valueStr
}
