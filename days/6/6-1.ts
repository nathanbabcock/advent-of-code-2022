import chalk from 'chalk'
import { readFileSync } from 'fs'

function bufStart(buf: string, start = 0): number {
  const maybeMarker = buf.slice(start, start + 4)
  const chars = new Set([...maybeMarker.split('')])
  // console.log({ buf, start, maybeMarker, chars })
  if (chars.size === 4) return start + 4
  else return bufStart(buf, start + 1)
}

console.log(chalk.bgGreen(' Test input '))
console.log(bufStart('mjqjpqmgbljsphdztnvjfqwrcgsmlb'))
console.log(bufStart('bvwbjplbgvbhsrlpgdmjqwftvncz'))
console.log(bufStart('nppdvjthqldpwncqszvftbrmjlhg'))
console.log(bufStart('nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg'))
console.log(bufStart('zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw'))
console.log()

const realInput = readFileSync('days/6/6.txt').toString()
console.log(chalk.bgGreen(' Real input '))
console.log(bufStart(realInput))
