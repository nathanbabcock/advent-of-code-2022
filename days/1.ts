import { z } from 'zod'
import { ASST } from '../lib/asst'
import { deriveProgram } from '../lib/derive'
import { Char, Max, Op, Parse, Split, Sum } from '../lib/op'

const steps: any[] = []

const input = `1000
2000
3000

4000

5000
6000

7000
8000
9000

10000`

const output = 24000

steps[0] = input

// STEP 1: `split`
steps[1] = [
  `1000
2000
3000`,
  `4000`,
  `5000
6000`,
  `7000
8000
9000`,
  `10000`
]

// STEP 2: `map(split)`
steps[2] = [
  ['1000', '2000', '3000'],
  ['4000'],
  ['5000', '6000'],
  ['7000', '8000', '9000'],
  ['10000'],
]

// STEP 3: `map(map(parse))`
steps[3] = [
  [1000, 2000, 3000],
  [4000],
  [5000, 6000],
  [7000, 8000, 9000],
  [10000],
]

// STEP 4: `map(sum)`
steps[4] = [6000, 4000, 11000, 24000, 10000]

// STEP 5: `max`
steps[5] = output // 24000

// Minimal set of "primitive" types (for binding to generic functions like `map`)
const types = [
  z.string(),
  z.number(),
  Char, // z.string().length(1)
  z.function(),
  z.array(z.any()),
]

// Minimal library of functions to use
const ops: Op[] = [
  Split, Parse, Sum, Max,
]

function main() {
  // const input = '100\n\n200'
  // const output = ['100', '200']
  const input = steps[1]
  const output = steps[2]
  const program = deriveProgram(input, output, ops, types)
  console.log(`Program (length ${program.length}):`)
  program.forEach(asst => console.log('  ' + asst.toString()))
}

main()
