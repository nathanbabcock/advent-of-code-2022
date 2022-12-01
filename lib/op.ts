import { z } from 'zod'

// Primitive types
export const Char = z.string().length(1)

// Op types
export type Op = {
  name: string
  type: z.ZodFunction<z.ZodTuple<[z.ZodTypeAny, ...z.ZodTypeAny[]], z.ZodUnknown>, z.ZodTypeAny>
  impl: (...[args]: any[]) => any

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
    // todo smarter hint (common substrings)
    (input: string) => ['\n\n', ...new Set(input.split(''))] // unique characters
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

// export const Map: HigherOrderOp = (inputType, outputType) =>
//   z.function().args(z.array(inputType), z.function().args(inputType).returns(outputType)).returns(z.array(outputType))

