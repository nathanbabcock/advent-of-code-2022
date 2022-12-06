import chalk from 'chalk'
import { readFileSync } from 'fs'

function bufStartImperative(buf: string, markerLen = 4, start = 0): number {
  const maybeMarker = buf.slice(start, start + markerLen)
  const chars = new Set([...maybeMarker.split('')])
  // console.log({ buf, start, maybeMarker, chars })
  if (chars.size === markerLen) return start + markerLen
  else return bufStart(buf, markerLen, start + 1)
}

/** Ugly, but isomorphic, functional implementation */
function bufStartFunctional(buf: string, markerLen = 4, start = 0): number {
  return new Set([...buf.slice(start, start + markerLen).split('')]).size === markerLen ? start + markerLen : bufStart(buf, markerLen, start + 1)
}

// /**
//  * A more formal function composition solution, if we had all the helper
//  * functions defined.
//  * 
//  * A solution derived by an AST search would look more similar to this (if it
//  * was able to safely discover recursion w/ a base case)
//  */
// function bufStartComposed(buf: string, markerLen = 4, start = 0): number {
//   return branch(eq(size(makeSet(split(slice(buf, start, start + markerLen), ''))), markerLen), start + markerLen, bufStart(buf, markerLen, start + 1))
// }

const bufStart = bufStartFunctional

console.log(chalk.bgGreen(' Part 1 test input '))
console.log(bufStart('mjqjpqmgbljsphdztnvjfqwrcgsmlb'))
console.log(bufStart('bvwbjplbgvbhsrlpgdmjqwftvncz'))
console.log(bufStart('nppdvjthqldpwncqszvftbrmjlhg'))
console.log(bufStart('nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg'))
console.log(bufStart('zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw'))
console.log()

const realInput = readFileSync('days/6/6.txt').toString()
console.log(chalk.bgGreen(' Part 1 real input '))
console.log(bufStart(realInput))
console.log()

console.log(chalk.bgGreen(' Part 2 test input '))
console.log(bufStart('mjqjpqmgbljsphdztnvjfqwrcgsmlb', 14))
console.log(bufStart('bvwbjplbgvbhsrlpgdmjqwftvncz', 14))
console.log(bufStart('nppdvjthqldpwncqszvftbrmjlhg', 14))
console.log(bufStart('nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg', 14))
console.log(bufStart('zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw', 14))
console.log()

console.log(chalk.bgGreen(' Part 2 real input '))
console.log(bufStart(realInput, 14))
console.log()
console.log('⭐⭐')