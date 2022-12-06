import chalk from 'chalk'
import { Op } from './op'
import { Value } from './value'

/**
 * Represents a function (of one or more parameters) acting on a Value,
 * transforming it to another Value (or back to itself).
 * 
 * It's an directed edge in the Digraph, but with a twist: it can connect to one
 * or more inputs at the same time, combining them to connect to a single output.
 */
export class Arrow {
  constructor(
    /** The function to be applied to the inputs in order to produce the output */
    public op: Op,

    /** One or more Values to use as inputs for the ops */
    public inputs: Value[],

    /** A single Value, resulting from calling the Op with the inputs */
    public output: Value,
  ) { }

  /** Example: `add(0, 1) = 1` */
  toStringShallow() {
    return `${chalk.magenta(this.op.name)}(${this.inputs.map(i => i.toStringShallow()).join(', ')}) = ${this.output.toStringShallow()}`
  }

  /** Example: `add(input1(0), input2(1)) = 1` */
  toString() {
    return `${chalk.magenta(this.op.name)}(${this.inputs.map(i => {
      if (this.inputs.includes(i) || this.output === i)
        return i.toStringShallow()
      return i.toStringDerivation()
    }).join(', ')})`
  }
}