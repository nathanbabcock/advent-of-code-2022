import { z } from 'zod'
import { Op } from './op'

export type Combinator = (op: Op) => Op

export const Map: Combinator = op => ({
  name: `map(${op.name})`,
  type: z.function()
    .args(
      z.array(op.type.parameters().items[0]),
      ...op.type.parameters().items.slice(1), // include any additional free parameters
    )
    .returns(z.array(op.type.returnType())),
  impl: (input: any[], ...params) => input.map(x => op.impl(x, ...params)),

  // ⚠ `input` parameter stops working; this needs to be refactored out
  // into a Library helper function or solved in another way
  paramHints: op.paramHints,
})
