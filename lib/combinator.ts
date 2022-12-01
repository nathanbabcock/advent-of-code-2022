import { z } from 'zod'
import { Op } from './op'

export type Combinator = (value: z.ZodTypeAny, op: Op) => Op

export const Map: Combinator = (value, op) => ({
  name: `map(${op.name})`,
  type: z.function().args(z.array(op.type.parameters().items[0])).returns(z.array(op.type.returnType())),
  impl: (input: any[]) => input.map(op.impl),
})
