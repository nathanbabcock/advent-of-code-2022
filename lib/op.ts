import { z } from 'zod'
import { Combinator } from './combinator'

// Op types
export type Op = {
  name: string
  type: z.ZodFunction<z.ZodTuple<[z.ZodTypeAny, ...z.ZodTypeAny[]], z.ZodUnknown>, z.ZodTypeAny>
  impl: (...[args]: any[]) => any
  parents?: [Combinator, Op]
  children?: Op[]

  /**
   * Given the input (first parameter) recommend a list of values for
   * subsequent parameters.
   * 
   * `paramHints[0](input)` corresponds to the first *free* (non-input) parameter,
   * and returns an array of possible recommended values.
   */
  paramHints?: ((input: any) => any[])[]
}

// TODO
export type HigherOrderOp = (input: z.ZodTypeAny, output: z.ZodTypeAny) => Op

export const Split: Op = {
  name: 'split',
  type: z.function().args(z.string(), z.string()).returns(z.array(z.string())),
  impl: (input: string, delimiter: string) => input.split(delimiter),
  paramHints: [
    // ~~todo smarter hint (common substrings)~~
    // ~~Somehow handle regexes?!?~~
    // Automatically determine good delimiter from most common substrings
    (_input: string) => ['\r\n\r\n', '\r\n'] // unique characters
  ],
}

export const Parse: Op = {
  name: 'parse',
  type: z.function().args(z.string()).returns(z.number()),
  impl: (input: string) => parseInt(input),
}

export const Sum: Op = {
  name: 'sum',
  type: z.function().args(z.array(z.number())).returns(z.number()),
  impl: (input: number[]) => input.reduce((a, b) => a + b, 0),
}

export const Max: Op = {
  name: 'max',
  type: z.function().args(z.array(z.number())).returns(z.number()),
  impl: (input: number[]) => Math.max(...input),
}

// TODO make Op a real Class
export function opToString(op: Op): string {
  throw new Error('TODO')
}
