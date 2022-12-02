import { Program } from './program'
import { Library } from './library'
import { Op } from './op'
import { prettyPrint } from './util'

export const Never = Symbol("Never")

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
  /** Obtained by applying `this.op` to `parent.value` */
  value: any

  /** The function that derives `this.value` from `parent.value` */
  op?: Op

  /** 0-1 parent nodes */
  parent?: ASST

  /** 0+ child nodes  */
  children: ASST[]

  /**
   * additional arguments passed to `this.op`
   * (first argument is always the return value of the parent node)
   */
  additionalParams: any[]

  generateChildren(library: Library) {
    // Find compatible type signatures
    // console.log('1️⃣  finding compatible types')
    const compatibleOps = library.getOps().filter(childOp => {
      const childInput = childOp.type.parameters().items[0]
      const { success } = childInput.safeParse(this.value)
      // console.log(` - checking ${childOp.name}(${JSON.stringify(this.value)}) => ${success ? '✅' : '❌'}`)
      return success
    })

    for (const op of compatibleOps) {
      // Generate options for free parameters
      const numParams = op.type.parameters().items.length
      if (numParams === 1)
        this.addChild(op)
      else if (numParams === 2) {
        // console.log('2️⃣  finding free params')
        let hint = op.paramHints![numParams - 2]
        let freeParamPossibilities = hint(this.value)
        for (const freeParam of freeParamPossibilities) {
          // console.log(` - adding ${op.name}(${JSON.stringify(this.value)}, ${JSON.stringify(freeParam)})`)
          this.addChild(op, [freeParam])
        }

      } else
        throw new Error('Child generation does not handle more than one free param yet')
    }
  }

  /** Returns the traversal from root to successive children, ending in this node */
  trace(): Program {
    if (!this.parent) return [this]
    return [...this.parent.trace(), this]
  }

  toString(depth: number = 0): string {
    let str = ''

    // indent
    for (let i = 0; i < depth; i++)
      str += '  '

    // op type
    str += this.op?.name ?? '🌱' // indicate root

    // additional params
    if (this.additionalParams.length > 0)
      str += `(${this.additionalParams.map(prettyPrint).join(', ')})`

    // return type & value
    str += ` -> ${JSON.stringify(this.value)}`

    if (this.children.length === 0)
      str += ' 🍃' // indicate leaves

    return str
  }

  toStringDeep(depth: number = 0): string {
    let str = this.toString(depth)
    if (this.children.length > 0)
      str = [str, ...this.children.map(child => child.toStringDeep(depth + 1))].join('\n')
    return str
  }

  addChild(op: Op, boundParams?: any[]) {
    this.children.push(new ASST(op, this, undefined, boundParams))
  }

  static root(value: any) {
    return new ASST(undefined, undefined, value)
  }

  constructor(op?: Op, parent?: ASST, value?: any, boundParams?: any[]) {
    this.op = op
    this.parent = parent
    this.value = value
    this.children = []
    this.additionalParams = boundParams ?? []
    if (this.parent)
      this.value = this.op!.impl(this.parent.value, ...this.additionalParams)
    if (this.value === this.parent?.value) {
      // short-circuit an infinite loop/identity function
      // This op produced the same value as it's parent, e.g. sorting an already-sorted list
      this.value = Never
      // A value of Never won't match the signature of any other op, so it will never be used
    }
  }

  /** @todo */
  toGraphviz(): string {
    throw new Error('TODO')
  }
}
