import { z } from 'zod'

// Primitive types
export const Char = z.string().length(1)

// Op types
export type Op = z.ZodFunction<any, any> | HigherOrderOp
export type HigherOrderOp = (input: z.ZodTypeAny, output: z.ZodTypeAny) => Op

export const Split: Op = z.function().args(z.string(), Char).returns(z.array(z.string()))
export const Parse: Op = z.function().args(z.string()).returns(z.number())
export const Sum: Op = z.function().args(z.array(z.number())).returns(z.number())
export const Max: Op = z.function().args(z.array(z.number())).returns(z.number())

export const Map: HigherOrderOp = (inputType, outputType) =>
  z.function().args(z.array(inputType), z.function().args(inputType).returns(outputType)).returns(z.array(outputType))

export type Program = Op[] // Could be specified further that the output of every function is first input of next function
