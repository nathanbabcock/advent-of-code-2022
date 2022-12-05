import chalk from 'chalk'
import { Arrow, MakeChildrenCallback, Value } from './digraph'
import { Library } from './library'
import { eq } from './util'

/**
 * A program is a (minimal, unique) subgraph from a single input Value to a
 * single output Value (possible branching and re-merging in between).
 */
export type ProgramV2 = Value

/**
 * Search an Abstract Syntax Digraph for a mapping from a concrete input to a
 * concrete output, given a library of functions
 */
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

  // 1. Get subgraph for unique derivation root -> answer
  // 2. (probably) clone it
  // 3. Have a method to reassign Value at the root, and propagate changes to
  //    all descendants
  return answer.getDerivationSubgraph()
}

/**
 * Feed a new input value through a previously derived series of function
 * compositions, returning the corresponding generated output.
 */
export function runProgramV2(program: ProgramV2, input: any) {
  if (program.length === 0) return input
  // return program[0].
}