import { z } from 'zod'
import { Op } from './op'

export type Combinator = (value: z.ZodTypeAny, op: Op) => Op

export const Map: Combinator = (value, op) => ({
  name: `map(${op.name})`,
  type: z.function()
    .args(
      z.array(op.type.parameters().items[0]),
      ...op.type.parameters().items.slice(1), // include any additional free parameters
    )
    .returns(z.array(op.type.returnType())),
  impl: (input: any[], ...params) => input.map(x => op.impl(x, ...params)),

  // since this combinator changes the input type,
  // and paramHints take input as a parameter,
  // wrap each paramHint in an adapter function that maps from the new input
  // type to the old one
  paramHints: op.paramHints?.map(paramHintFn => (input: any[]) => [...new Set(...input.map(paramHintFn))]) // 🤯
})
