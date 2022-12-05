import chalk from 'chalk'
import { Arrow, MakeChildrenCallback, Value } from './digraph'
import { Library } from './library'
import { eq } from './util'

export type ProgramV2 = Arrow[]

export function deriveProgramV2(input: any, output: any, library: Library, maxGenerations = 10): ProgramV2 | undefined {
  const digraph = new Value(input)
  let answer: Value | undefined
  const callback: MakeChildrenCallback = node => {
    console.log(node.toString())
    if (eq(node.value, output)) {
      answer = node
      return true // stop the search when output is found
    }
  }

  console.log(chalk.bgGreen(' Generation 0 '))
  console.log(digraph.toString())
  console.log(chalk.green('1 values, 0 arrows'))

  for (let generation = 1; generation <= maxGenerations; generation++) {
    console.log()
    console.log(chalk.bgGreen(` Generation ${generation} `))
    digraph.makeChildren(library, callback)
    let { arrows, values } = digraph.collect()
    console.log(chalk.green(`${values.size} values, ${arrows.size} arrows`))

    if (answer) {
      console.log()
      console.log(chalk.bgCyan(' Answer ⭐ '))
      console.log(answer.toString())
      console.log()
      break
    }
  }

  if (!answer) {
    console.log()
    console.log(chalk.bgRed(' Search failed '))
    console.log(chalk.red('Could not find answer after ' + maxGenerations + ' generations'))
    console.log()
    return undefined
  }

  return answer.getDerivation()
}