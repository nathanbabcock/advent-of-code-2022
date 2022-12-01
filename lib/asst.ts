import { z } from 'zod'
import { Op } from './op'

/**
 * Abstract Syntax Search Tree 🍑🌲
 * 
 * Derived programs are purely functional, so they are not so much of a
 * traditional AST as they are just a linear chain of function transformations
 * (a very deep and narrow tree, in other words). The search tree explores all
 * possible valid chains of these functions to find a solution. In other words,
 * a traversal of the ASST from root -> leaf describes a potential solution program.
 * 
 * The ASST is searched in breadth-first order, with possible moves generated
 * based on the type signatures of the functions in the library, and
 * later will be guided by heuristics.
 * 
 * @reference https://en.wikipedia.org/wiki/Abstract_syntax_tree
 */
export class ASST {
  /** Value obtained by applying every op from root to this node */
  value: any

  /** The function that derived this.value from parent.value */
  op?: Op

  /** 0-1 parent nodes */
  parent?: ASST

  /** 0+ child nodes  */
  children: ASST[]

  toString(depth: number = 0): string {
    let str = ''
    for (let i = 0; i < depth; i++) str += '  '
    str += `${this.op?.name ?? 'root'} -> ${JSON.stringify(this.value)}`
    return str
  }

  toStringDeep(depth: number = 0): string {
    let str = this.toString(depth)
    if (this.children.length > 0)
      str = [str, ...this.children.map(child => child.toStringDeep(depth + 1))].join('\n')
    return str
  }

  generateChildren(library: Op[], _types: z.ZodTypeAny[]) {
    // First, Ops with compatible type signatures
    const compatibleOps = library.filter(childOp => {
      const childInput = childOp.type.parameters().items[0]
      const { success } = childInput.safeParse(this.value)
      console.log(`checking ${childOp.name}(${this.value}) => ${success ? '✅' : '❌'}`)
      return success
    })

    // compatibleOps.forEach(this.addChild)
    for (const op of compatibleOps)
      this.addChild(op)
  }

  addChild(op: Op) {
    this.children.push(new ASST(op, this))
  }

  static root(value: any) {
    return new ASST(undefined, undefined, value)
  }

  constructor(op?: Op, parent?: ASST, value?: any) {
    this.op = op
    this.parent = parent
    this.value = value
    this.children = []
    if (this.parent)
      this.value = this.op!.impl(this.parent.value)
  }

  /** TODO */
  toGraphviz(): string {
    throw new Error('TODO')
  }
}
