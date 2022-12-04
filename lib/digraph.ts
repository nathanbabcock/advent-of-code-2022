import { Library } from './library'
import { Op } from './op'
import { combinations } from './util'

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

  /**
   * Traverse up to the root of the tree.
   * ⚠ Warning: Graph may be cyclic
   */
  getRoot(): Value {
    let cur: Value = this
    while (cur.inArrows) cur = cur.inArrows[0].inputs[0]
    return cur
  }

  /** Depth-first in-order traversal of the sub-graph. ⚠ Beware of cycles. */
  traverse(callback: (node: Value) => void) {
    callback(this)
    for (const arrow of this.outArrows)
      arrow.output.traverse(callback)
  }

  /** Returns a list of every Value discovered in this Digraph */
  collectValues(): Set<Value> {
    const values = new Set<Value>()
    this.getRoot().traverse(node => values.add(node))
    return values
  }

  /**
   * Check if the current node has an outgoing Arrow with the exact same Op and
   * binding positions.
   * 
   * ⚠ Warning: Copilot helped write this function 🥽
   */
  hasOutArrow(op: Op, bindings: Value[]): boolean {
    for (const arrow of this.outArrows) {
      if (arrow.op !== op) continue // ❕ comparison by reference
      if (arrow.inputs.length !== bindings.length) continue
      if (arrow.inputs.every((input, i) => input === bindings[i])) return true
    }
    return false
  }

  /**
   * Creates a new "generation" of derived Values by applying Op in the
   * Library, with every combination of parameter bindings, and adding Arrows
   * to connect the results.
   */
  makeChildren(library: Library, callback: (value: Value, arrow: Arrow, novel: boolean) => void | true) {
    const ops = library.getOps()
    for (const op of ops) {
      // Find all compatible values in the graph
      const parameterBindings = op.type.parameters().items.map(param => {
        const possibleBindings: Value[] = []
        this.getRoot().traverse(node =>
          param.safeParse(node.value).success && possibleBindings.push(node)
        )
        // TODO optimization: enforce that at least one parameter in the binding
        // is currently a leaf node (otherwise, it's redundant and will probably
        // trigger the warning case in `hasOutArrow`)
        return possibleBindings
      })

      // Then try every combination of bindings for them
      const bindings: Value[][] = combinations(parameterBindings)
      for (const binding of bindings) {
        // To be extra safe, check for pre-existing Arrow with this binding
        if (binding[0].hasOutArrow(op, binding)) {
          console.warn(`Attempted to create duplicate arrow: ${op.name}(${binding.map(b => b.value).join(', ')})`)
          continue
        }

        // Determine output and (al)locate a Value node for it
        const output = op.impl(...binding.map(b => b.value))
        let outputValue: Value | undefined
        let novel = false
        this.getRoot().traverse(node => node.value === output && (outputValue = node))
        if (!outputValue) {
          outputValue = new Value(output)
          novel = true
        }
        const newArrow = new Arrow(op, binding, outputValue)

        // Connect the new Arrow to the graph
        binding.forEach(input => input.outArrows.push(newArrow))

        // Callback
        if (callback?.(outputValue, newArrow, novel)) return
      }
    }
  }
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
