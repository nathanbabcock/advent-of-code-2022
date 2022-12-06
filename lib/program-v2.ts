import chalk from 'chalk'
import { Digraph } from './digraph'
import { Library } from './library'
import { eq } from './util'
import { Value, MakeChildrenCallback as OnChildCreated } from './value'

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
  const digraph = new Digraph(input)
  let answer: Value | undefined
  const callback: OnChildCreated = node => {
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
    digraph.root.makeChildren(library, callback)
    console.log(chalk.green(`${digraph.values.length} values, ${digraph.arrows.length} arrows`))

    if (answer) break
  }

  if (!answer) {
    console.log()
    console.log(chalk.bgRed(' Search failed '))
    console.log(chalk.red('Could not find answer after ' + maxGenerations + ' generations'))
    console.log()
    return undefined
  }

  console.log()
  console.log(chalk.bgCyan(' Derivation output ⭐ '))
  console.log(answer.toString())

  const program = answer.getDerivationSubgraph().getRoot()
  console.log()
  console.log(chalk.bgGreen(' Program '))
  program.values.forEach(value => console.log(value.toString()))
  console.log()

  return program
}

/**
 * Feed a new input value through a previously derived series of function
 * compositions, returning the corresponding generated output.
 */
export function runProgramV2(program: ProgramV2, input: any): any {
  // console.log(chalk.bgWhite(' Run program '), chalk.white(`input=${input}`))
  console.log(chalk.bgGreen(' Run program '))
  console.log('...')

  program.applyValue(input)

  let output: Value | undefined
  program.traverse(node => {
    // console.log(node.toString()) // way too much output
    if (node.outArrows.length === 0)
      output = node // ❕ assumes a single leaf node
  })

  if (!output) {
    console.log()
    console.log(chalk.bgRed(' Error '))
    console.log(chalk.red('Could not find output'))
    console.log()
    return undefined
  }

  console.log()
  console.log(chalk.bgCyan(' Answer ⭐ '))
  console.log(output.toStringShallow())
  console.log()

  return output.value
}