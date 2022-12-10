import chalk from 'chalk'
import { readFileSync } from 'fs'
const testInput = `noop
addx 3
addx -5`

const testInput2 = readFileSync('days/10/10-test.txt', 'utf-8').toString()

const realInput = readFileSync('days/10/10.txt', 'utf-8').toString()

const signals = realInput
  .split(/\r?\n/)
  .reduce((acc, op, i) => {
    const parts = op.split(' ')
    const opName = parts[0]
    const prev = acc.at(-1)!
    if (opName === 'noop')
      return [...acc, prev]
    else {
      const num = parseInt(parts[1])
      return [...acc, prev, prev + num]
    }
  }, [1])

const outputPart1 = signals
  .filter((_, i) => i + 1 === 20 || (i + 1 + 20) % 40 === 0)
  .map((x, i) => (20 + i * 40) * x)
  .slice(0, 6)
  .reduce((acc, x) => acc + x, 0)

const outputPart2 = Array.from(Array(6).keys())
  .map(i => signals
    .slice(i * 40, (i + 1) * 40 - 1) // off by one? (end of clock cycle vs beginning?)
    .map((x, j) => Math.abs(x - j) <= 1 ? chalk.bold(chalk.blue('#')) : chalk.gray('.'))
    .join('')
  ).join('\n')

// const test = Array.from(Array(6).keys())
//   .map(i => [i * 40, (i + 1) * 40 - 1])

console.log(outputPart2)
