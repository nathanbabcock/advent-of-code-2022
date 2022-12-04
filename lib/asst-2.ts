import { z } from 'zod'
import { Library } from './library'
import { Op } from './op'

/**
 * We need to expand the structure of the Abstract Syntax Search Tree
 * to include the possibility of multiple parameters.
 * 
 * In this version, values from LEAVES towards the ROOT -- the inverse of the
 * original approach. Rather than a sequential chains of transformations, this
 * more directly models nested compositions of functions. The root is the
 * outermost function call, and reading the tree from top to bottom (root ->
 * leaves) gives you the same ordering that you would write in code.
 * 
 * E.g.: `outer(nested(inner(value)))`
 * 
 * This gives the ability to bind arguments to the same parameter of the parent,
 * something that wasn't possible before, since it was a hardcoded pipeline that
 * always sent the output of the previous function to the first parameter of the next.
 * 
 * It should also be able to model more classes of functions, such as identity
 * functions, constant functions, and possibly later, recursion.
 */
export class ASST2 { // 🍑☕2️⃣
  /**
   * The Op describes the type signature and implementation of this node. This
   * includes the list of parameters (which is also the maximum number of
   * children when this level of the subtree is fully expanded).
   * 
   * The root node and all intermediate nodes have an Op, while leaf nodes have
   * a `value` instead (see below) */
  op?: Op

  /**
   * Values are stored in the leaf nodes at the "bottom" of the tree. The
   * either refer to a top-level param of the entire Program scope, or to a
   * literal constant/hardcoded value.
   */
  value?: {
    type: 'param'
    /** index of this parameter (a top-level parameter for the whole Program) */
    boundParam: number
  } | {
    type: 'literal'
    value: any
  }

  /** All nodes are connected the graph by a single parent, except the root */
  parent?: ASST2

  /**
   * A list of parameters taken by this Node, containing the subtree of all their
   * possible bindings (once it has been fully expanded). The number of children should match the arity of the Op function.
   */
  params: { children: ASST2[] }[] = []

  // /**
  //  * The index of this node in its parent's parameters array
  //  * ...however, if subtrees are shared/re-used as an optimization,
  //  * this may not be accurate.
  //  */
  // argPos: number

  /** Traverse up to the root of the tree, for example to get the available parameters */
  getRoot(): ASST2 {
    let cur: ASST2 = this
    while (cur.parent) cur = cur.parent
    return cur
  }

  // /**
  //  * If a subtree for the given type already exists anywhere in the tree,
  //  * return a reference to it for re-use.
  //  * 
  //  * This optimization helps parallelize the search, by sharing information
  //  * about subtrees between disparate branches of the search tree.
  //  */
  // getSubtree(type: z.ZodTypeAny) {
  //   const root = this.getRoot()
  //   let subtree: ASST2 | undefined
  //   root.traverse(node => {
  //     if (node.op?.type.returnType() === type) 
  //       subtree = node
  //   })
  //   return subtree
  // }

  makeChild(op?: Op, value?: ASST2['value']): ASST2 {
    const child = new ASST2()
    child.parent = this
    child.op = op
    child.value = child.value = value
    return child
  }

  /** Generate all possible children for this node, including leaf nodes */
  makeChildren(library: Library) {
    if (!this.op) throw new Error('cannot make children for a leaf (terminal) node')

    // for each parameter...
    for (let i = 0; i < this.op.type.parameters().items.length; i++) {
      let paramChildren: ASST2[] = []

      // 1. bind to global params (terminal)
      const globalParams = this.getRoot().op!.type.parameters().items
      for (let i = 0; i < globalParams.length; i++)
        paramChildren.push(this.makeChild(undefined, { type: 'param', boundParam: i }))

      // 2. bind to literals (terminal)
      let possibleLiterals = this.op.paramHints?.[i]?.(undefined) ?? [] // TODO input value is out of scope to pass here
      for (const literal of possibleLiterals)
        paramChildren.push(this.makeChild(undefined, { type: 'literal', value: literal }))

      // 3. bind to nested ops
      let localParam = this.op.type.parameters().items[i]
      const ops = library.getOpsThatReturn(localParam)
      for (const op of ops) paramChildren.push(this.makeChild(op))

      this.params.push({ children: paramChildren })
    }
  }

  static makeRoot(...params: any): ASST2 {
    const root = new ASST2()
    root.op = {
      name: 'root',
      type: z.function().args(params).returns(z.any()),
      impl: () => { throw new Error('root node implementation is derived from a traversal of the subtree') },
    }
    return root
    // root.op = 
  }
}
