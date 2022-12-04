import { z } from 'zod'
import { Combinator } from './combinator'
import { Op } from './op'

/**
 * An extensible set of core Ops and Combinators,
 * which can be combined (if possible) to produce unlimited nested Ops.
 */
export class Library {
  /** Core set of functions in value space (value => value) */
  ops: Op[]

  /** Higher-order functions which take a value + op to produce a new op */
  combinators: Combinator[]

  /** Ops derived from a combinator */
  derivedOps: Op[]

  getOps(): Op[] {
    return [...this.ops, ...this.derivedOps]
  }

  getOpsThatReturn(type: z.ZodTypeAny): Op[] {
    return this.getOps().filter(op => op.type.returnType() === type)
  }

  getOpsCompatibleWith(value: any): Op[] {
    return this.getOps().filter(op => op.type.safeParse(value).success)
  }

  /**
   * Matches an Op and a Combinator to fall in love and produce a child 💖
   * The Op itself may have been derived from a previous pairing.
   */
  deriveNextOp(): Op {
    for (const op of [...this.ops, ...this.derivedOps]) {
      for (const combinator of this.combinators) {
        if (op.children?.find(child => child.parents?.includes(combinator))) // not the most efficient but that's ok
          continue // already derived
        const derivedOp = combinator(op)
        derivedOp.parents = [combinator, op]
        op.children = [...(op.children || []), derivedOp]
        this.derivedOps.push(derivedOp)
        return derivedOp
      }
    }
    throw new Error('Could not derive another Op')
  }

  constructor(ops: Op[], combinators: Combinator[] = []) {
    this.ops = ops
    this.combinators = combinators
    this.derivedOps = []
  }
}
