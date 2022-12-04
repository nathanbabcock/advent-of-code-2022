export function prettyPrint(value: any): string {
  if (value instanceof RegExp)
    return value.toString()
  if (Number.isNaN(value)) return 'NaN'
  return JSON.stringify(value)
}

/**
 * Given a 2D array, return an array with all possible combinations of the
 * sub-arrays. Sometimes called an ["n-fold Cartesian product"](https://en.wikipedia.org/wiki/Cartesian_product).
 * 
 * ```ts
 * // Input:
 * const array2D = [
 *   ['red', 'blue'],
 *   ['cotton','polyester','silk'],
 *   ['large','medium','small']
 * ]
 * 
 * // Output:
 * const combos = combinations(array2D) === [
 *   ['red', 'cotton', 'large'],
 *   ['red', 'cotton', 'medium'],
 *   ['red', 'cotton', 'small'],
 *   ['red', 'polyester', 'large'],
 *   // .
 *   // .
 *   // .
 * ] // === true
 * ```
 */
export function combinations(array2d: any[][], n = 0, result: any[][] = [], current: any[] = []) {
  if (n === array2d.length) result.push(current)
  else array2d[n].forEach(item => combinations(array2d, n + 1, result, [...current, item]))
  return result
}

/** Deep equality for arrays, objects, and primitives */
export const eq = (a: any, b: any): boolean => {
  if (a instanceof Array) return b instanceof Array ? a.every((x, i) => eq(x, b[i])) && b.every((x, i) => eq(x, a[i])) : false
  if (a instanceof Object) return b instanceof Object ? Object.keys(a).every(key => eq(a[key], b[key])) && Object.keys(b).every(key => eq(a[key], b[key])) : false
  if (a.equals) return a.equals(b)
  return a === b
}