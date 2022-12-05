import { Combinator, Map } from '../../lib/combinator'
import { Library } from '../../lib/library'
import { Max, Op, Parse, Slice, SortNum, Split, Sum } from '../../lib/op'
import { deriveProgramV2 } from '../../lib/program-v2'

// Construct intermediate steps to help guide program synthesis
const steps: any[] = []

steps[0] = '1000\r\n2000\r\n3000\r\n\r\n4000\r\n\r\n5000\r\n6000\r\n\r\n7000\r\n8000\r\n9000\r\n\r\n10000'

// STEP 1: `split`
steps[1] = [
  '1000\r\n2000\r\n3000',
  `4000`,
  `5000\r\n6000`,
  `7000\r\n8000\r\n9000`,
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

// STEP 5: `sort` -- new additional steps for part 2
steps[5] = [24000, 11000, 10000, 6000, 4000]

// STEP 6: `slice`
steps[6] = [24000, 11000, 10000]

// STEP 7: `sum`
steps[7] = 45000

// Minimal library of functions to use
const ops: Op[] = [Split, Parse, Sum, Max, SortNum, Slice] // (last two added since part 1)
const combinators: Combinator[] = [Map]
const library = new Library(ops, combinators)

// Pre-seed the library with augmented types (2 levels deep)
for (let i = 0; i < combinators.length * ops.length * 2; i++)
  library.deriveNextOp()
console.log(library.toString())

// Training input/output (translated the problem description)
// This time a middle step was needed -- without it, a valid program was derived
// that coincidentally worked for the simple example, but didn't match the spec
const input = steps[0]
const checkpoint = steps[5]
// Failed with checkpoint at both 2 and 4 (!)
// The example spec being sorted in ascending order was a bit misleading for the algo
const output = steps.at(-1)
console.log({ input, checkpoint, output })

// Derive a program that solves the simplified example problem
const program1 = deriveProgramV2(input, steps[2], library)
// const program2 = deriveProgramV2(checkpoint, output, library)
// const program = concatProgramsV2(program1, program2)
// console.log(`Program (length ${program.length}):`)
// program.forEach(asst => console.log('  ' + asst.toString()))

// Run the derived program on the real problem input
// const realInput = readFileSync('days/1/1.txt').toString()
// const realAnswer = 204639
// const answer = runProgram(program, realInput)
// console.log(`Answer: ${answer} ${answer === realAnswer ? '⭐' : '💩'}`)