import { Digraph } from './digraph'
import chalk from 'chalk'
import { Arrow } from './arrow'
import { Library } from './library'
import { Op } from './op'
import { eq, combinations, prettyPrint } from './util'

export const warn_duplicate = false

export type MakeChildrenCallback = (value: Value, arrow: Arrow, novel: boolean) => void | true

/**
 * A node in the graph, corresponding to exactly one unique value (of any type).
 * Connected to other specific Values by one or more directed Arrows.
 */
export class Value {
  constructor(
    public value: any,
    public graph: Digraph,
    public inArrows: Arrow[] = [],
    public outArrows: Arrow[] = [],
  ) { }

  // /**
  //  * Traverse up to the root of the tree.
  //  * ⚠ Warning: Graph may be cyclic
  //  */
  // getRoot(): Value {
  //   let cur: Value = this
  //   let visited = new Set<Value>() // don't get trapped in a cycle
  //   while (cur.inArrows.length > 0) {
  //     console.log('up one')
  //     const next = cur.inArrows[0].inputs.find(input => !visited.has(input))
  //     cur = next!
  //     visited.add(cur)
  //   }
  //   return cur
  // }

  // /** Depth-first in-order traversal of the sub-graph. ⚠ Beware of cycles. */
  // traverse(callback: (node: Value) => void) {
  //   callback(this)
  //   for (const arrow of this.outArrows) {
  //     if (arrow.inputs.includes(arrow.output)) continue
  //     // ⚠ Aborts shallow cycles
  //     // Indirect cycles can still happen!

  //     arrow.output.traverse(callback)
  //   }
  // }

  // /** Returns a list of every Value discovered in this Digraph */
  // collectValues(): Set<Value> {
  //   const values = new Set<Value>()
  //   this.getRoot().traverse(node => values.add(node))
  //   return values
  // }

  // /** Returns all Values and Arrows */
  // collect(): { values: Set<Value>, arrows: Set<Arrow> } {
  //   const set = { values: new Set<Value>(), arrows: new Set<Arrow>() }
  //   this.getRoot().traverse(node => set.values.add(node) && node.outArrows.forEach(a => set.arrows.add(a)))
  //   return set
  // }

  /**
   * Check if the current node has an outgoing Arrow with the exact same Op and
   * binding positions.
   * 
   * ⚠ Warning: Copilot helped write this function 🥽
   */
  getOutArrow(op: Op, bindings: Value[]): Arrow | undefined {
    for (const arrow of this.outArrows) {
      if (arrow.op !== op) continue // ❕ comparison by reference
      if (arrow.inputs.length !== bindings.length) continue
      if (arrow.inputs.every((input, i) => eq(input.value, bindings[i].value))) return arrow
    }
    return undefined
  }

  // /** Retrieves an existing Value node for the given value, or creates one if needed */
  // allocateValue(value: any): Value {
  //   let outputValue: Value | undefined
  //   this.getRoot().traverse(node => eq(node.value, value) && (outputValue = node))
  //   return outputValue ?? new Value(value)
  // }

  /**
   * Creates a new "generation" of derived Values by applying Op in the
   * Library, with every combination of parameter bindings, and adding Arrows
   * to connect the results.
   */
  makeChildren(library: Library, callback: MakeChildrenCallback) {
    const ops = library.getOps()

    // Only use Values that existed before this function was called
    let frozenValues = [...this.graph.values]
    // ❕ optimization: enforce that only leaf nodes are used in the binding 
    // (otherwise, it's redundant and will probably trigger the warning case
    // in `hasOutArrow`) This might have unintended consequences...

    for (const op of ops) {

      // Find all compatible values in the graph
      const parameterBindings = op.type.parameters().items.map((param, i) => {
        console.log('1')
        const possibleBindings: Value[] = []
        frozenValues.filter(node => param.safeParse(node.value).success)
          .forEach(value => possibleBindings.push(value))
        console.log('2')

        // Append any values recommended by `paramHints`
        const hints = op.paramHints?.[i]?.(undefined).map(v => this.graph.allocateValue(v)) ?? []
        console.log('3')
        possibleBindings.push(...hints)
        console.log('4')
        return possibleBindings
      })
      console.log('out')


      // Then try every combination of bindings for them
      const bindings: Value[][] = combinations(parameterBindings)
      for (const binding of bindings) {
        // To be extra safe, check for pre-existing Arrow with this binding
        let existingArrow = binding[0].getOutArrow(op, binding)
        if (existingArrow) {
          if (warn_duplicate) console.warn(chalk.gray(`Duplicate arrow: ${existingArrow.toString()}`))
          continue
        }

        // Determine output and (al)locate a Value node for it
        const output = op.impl(...binding.map(b => b.value))
        let outputValue = this.graph.allocateValue(output)
        let novel = outputValue.inArrows.length === 0
        const newArrow = new Arrow(op, binding, outputValue)

        // Connect the new Arrow to the graph
        binding.forEach(input => input.outArrows.push(newArrow))
        outputValue.inArrows.push(newArrow)

        // Callback
        if (callback?.(outputValue, newArrow, novel)) return
      }
    }
  }

  /**
   * Returns a unique derivation from the root Value to this Value,
   * to be used as a template Program for other input/output pairs.
   */
  getDerivationSubgraph(): Value {
    const clone = new Value(this.value, this.graph)

    // Base case (reached a root node)
    if (this.inArrows.length === 0) return clone

    // Choose a single derivation path to follow
    // 🚨 not cycle-safe (!)
    const arrow = this.inArrows[0]
    const clonedArrow = new Arrow(arrow.op, [], clone)
    clonedArrow.inputs = arrow.inputs.map(input => input.getDerivationSubgraph())
    clone.inArrows = [clonedArrow]
    clonedArrow.inputs.forEach(input => input.outArrows.push(clonedArrow))

    return clone
  }

  /**
   * Modify the value stored in this node, and propagate the changes to all
   * downstream/derived Values.
   * 
   * NB: After calling this function, it is no longer guaranteed that Value nodes
   * are unique (although they will still be correct, just possible redundant).
   */
  applyValue(value: any) {
    this.value = value
    for (const outArrow of this.outArrows) {
      const newOutputValue = outArrow.op.impl(
        ...outArrow.inputs.map(input => input.value)
        // one of these inputs is the value we just updated;
        // others are unchanged (or already derived from the updated one)
        // Independent inputs, like literals, remain unchanged by this application
      )
      outArrow.output.applyValue(newOutputValue)
    }
  }

  toStringShallow() {
    return chalk.yellow(prettyPrint(this.value))
  }

  toStringDerivation(): string {
    if (this.inArrows.length === 0) return this.toStringShallow()
    return this.inArrows.map(a => a.toString()).join(chalk.gray('\n  = '))
  }

  toString(): string {
    const isLeaf = this.outArrows.length === 0
    const isRoot = this.inArrows.length === 0
    let prefix = `${isRoot ? '🌱 ' : ''}${this.toStringShallow()}`
    if (isRoot) return prefix
    return `${prefix} ${chalk.gray('=')} ${this.toStringDerivation()}${isLeaf && !isRoot ? ' 🍃' : ''}`
  }
}