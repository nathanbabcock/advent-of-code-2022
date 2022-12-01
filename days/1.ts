import { Op, Split } from '../lib/op'

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
steps[5] = 24000 // === output

const ops: Op[] = [
  Split, // ...
]
