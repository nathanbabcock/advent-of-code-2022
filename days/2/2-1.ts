import chalk from 'chalk'
import { Combinator, Map } from '../../lib/combinator'
import { Library } from '../../lib/library'
import { Op, Parse, Split, Sum } from '../../lib/op'
import { deriveProgramV2 } from '../../lib/program-v2'
import { Table } from '../../lib/table'

// Construct intermediate steps to help guide program synthesis
const steps: any[] = []

// example input
steps.push('A Y\r\nB X\r\nC Z')

// split(\r\n)
steps.push(['A Y', 'B X', 'C Z'])

// map(split(' '))
steps.push([['A', 'Y'], ['B', 'X'], ['C', 'Z']])

// TODO...

// ...then sum those
steps.push([[2, 6], [1, 0], [3, 3]])

// ???
steps.push([8, 1, 6])

// sum
steps.push(15) // example output

// First solve a subproblem: determine who wins a single game of RPS
// Build a table of inputs and outputs for this subproblem
const getWinnerTable = new Table()
getWinnerTable.rows.push({ inputs: ['r', 'r'], output: 'draw' })
getWinnerTable.rows.push({ inputs: ['p', 'p'], output: 'draw' })
getWinnerTable.rows.push({ inputs: ['s', 's'], output: 'draw' })
getWinnerTable.rows.push({ inputs: ['r', 'p'], output: 'win' })
getWinnerTable.rows.push({ inputs: ['p', 's'], output: 'win' })
getWinnerTable.rows.push({ inputs: ['s', 'r'], output: 'win' })
getWinnerTable.rows.push({ inputs: ['p', 'r'], output: 'lose' })
getWinnerTable.rows.push({ inputs: ['s', 'p'], output: 'lose' })
getWinnerTable.rows.push({ inputs: ['r', 's'], output: 'lose' })

// Even a simple function implementation to this table is a bit complex.
// It involves either nested branching, or a dictionary & modulo.
// It could take a while to "blindly" try every combination of branch
// condition, true case, false case, and then nested branches.
// Instead, we'll do some analysis on the table to help guide synthesis.

// Try combinations of predicates (one applied to input, one to output)
// that map to corresponding subsets

// Two parallel ASST trees;
// - search inputs for next eligible predicate
// - apply that predicate to all previously found output predicates (array of
//   points into output predicate ASST)
// - if the subsets match, record the predicates & the subset
// - repeat for outputs (search outputs for next eligible predicate, apply to
//   all previously found input predicates, record if subsets match)
// - keep going until there's enough predicates to cover the entire table

// Needed changes:
// - ASST node needs to be able to take multiple parameters (binary ops)
// - callback in ASST tree search (look for a boolean value instead of a
//   specific output... or just look for either TRUE or FALSE)
// - Recommend free param bindings from the full set of inputs or outputs

// But first, start with an even simpler table
// const simpleTable = new Table()
// simpleTable.rows.push({ inputs: [-1], output: 1 })
// simpleTable.rows.push({ inputs: [-2], output: 2 })
// simpleTable.rows.push({ inputs: [1], output: -1 })
// simpleTable.rows.push({ inputs: [2], output: -2 })
// simpleTable.rows.push({ inputs: [0], output: 0 })

// Minimal library of functions to use
const ops: Op[] = [Split, Parse, Sum]
const combinators: Combinator[] = [Map]
const library = new Library(ops, combinators)

// Pre-seed the library with augmented types
for (let i = 0; i < combinators.length * ops.length * 1; i++)
  library.deriveNextOp()
console.log(library.toString())

// const program = deriveProgramV2('1\r\n2\r\n3', 6, library)
// console.log(chalk.white('program length:', program?.length))
