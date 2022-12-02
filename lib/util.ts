export function prettyPrint(value: any): string {
  if (value instanceof RegExp)
    return value.toString()
  if (isNaN(value)) return 'NaN'
  return JSON.stringify(value)
}