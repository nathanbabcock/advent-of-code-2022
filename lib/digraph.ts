import { Op } from './op'

/**
 * A node in the graph, corresponding to exactly one unique value (of any type).
 * Connected to other specific Values by one or more directed Arrows.
 */
export class Value {
  constructor(
    public value: any,
    public inArrows: Arrow[] = [],
    public outArrows: Arrow[] = [],
  ) { }
}

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
}
