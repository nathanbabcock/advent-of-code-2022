import { z } from 'zod'
import { Char, Map, Max, Op, Parse, Program, Split, Sum } from '../lib/op'

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
  Split, Parse, Sum, Max, Map
]

function deriveProgram(input: z.ZodLiteral<z.ZodAny>, output: z.ZodLiteral<z.ZodAny>): Program {
  throw new Error('TODO: write program')
  // - breadth-first search from input to input
  // - choose options based on compatible type signatures
  // - (later) heuristics to guide search
  // - recurse if no solution yet
}

function main() {
  deriveProgram(steps[0], steps[1])
}

main()
