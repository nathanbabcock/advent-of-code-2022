import { Arrow } from './arrow'
import { eq } from './util'
import { Value } from './value'

/**
 * A global state for the Digraph, for better ergonomics when **traversing**
 * the graph, or **collecting** values or arrows. The cyclic nature of the graph
 * makes it difficult and confusing to do this without a global state.
 * 
 * The only downside is that every Value and Arrow holds a pointer to this
 * shared global Digraph (a negligible memory cost).
 */
export class Digraph {
  /** The input parameter for this entire graph */
  public root: Value

  constructor(
    public seed: any,
    public values: Value[] = [],
    public arrows: Arrow[] = [],
  ) {
    this.root = this.allocateValue(seed)
  }

  /**
   * Obtains an existing node for a given value, or creates one if needed.
   * 
   * If the value is created, it is added to the `values` list of the graph, but
   * it is not automatically connected to any arrows (in or out) -- that should
   * be done manually after obtaining the Value node.
   */
  allocateValue(value: any): Value {
    for (const existingValue of this.values)
      if (eq(existingValue.value, value))
        return existingValue
    const newValue = new Value(value, this)
    this.values.push(value)
    return newValue
  }

  /** Returns not just the root Value, but also any constants or literals used */
  getRoots(): Value[] {
    return this.values.filter(v => v.inArrows.length === 0)
  }

  /** Returns Values that have not been used to derive any others */
  getLeaves(): Value[] {
    return this.values.filter(v => v.outArrows.length === 0)
  }
}
