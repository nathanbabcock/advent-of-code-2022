import { z } from 'zod'
import { Combinator } from './combinator'

export type OpParams = [z.ZodTypeAny, ...z.ZodTypeAny[]]

// Op types
export type Op = {
  name: string
  type: z.ZodFunction<z.ZodTuple<OpParams, z.ZodUnknown>, z.ZodTypeAny>
  impl: (...args: any) => any
  parents?: [Combinator, Op]
  children?: Op[]

  /** Recommend a set of literal values to use for each parameter. */
  paramHints?: (((input: any) => any[]) | undefined)[]
}

// TODO
export type HigherOrderOp = (input: z.ZodTypeAny, output: z.ZodTypeAny) => Op

export const Split: Op = {
  name: 'split',
  type: z.function().args(z.string(), z.string()).returns(z.array(z.string())),
  impl: (input: string, delimiter: string) => input.split(delimiter),
  paramHints: [
    undefined, // first param should be bound to the input
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

export const Slice: Op = {
  name: 'slice',
  type: z.function().args(z.array(z.any()), z.number()).returns(z.array(z.any())),
  impl: (input: any[], limit: number) => input.slice(0, limit),
  paramHints: [
    (input: any[]) => Array.from({ length: input.length }, (_, i) => i) // [0..input.length]
  ],
}

export const SortNum: Op = {
  name: 'sort',
  type: z.function().args(z.array(z.any())).returns(z.array(z.any())),
  impl: (input: any[]) => [...input].sort((a, b) => b - a),
}

// TODO make Op a real Class
export function opToString(op: Op): string {
  throw new Error('TODO')
}
