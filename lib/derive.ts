import { ASST } from './asst'
import { Op } from './op'

export type Program = ASST[] // Could be specified further that the output of every function is first input of next function

/** Deep equality for arrays, objects, and primitives */
export const eq = (a: any, b: any) => {
  if (a instanceof Array) return a.every((x, i) => eq(x, b[i]))
  return a === b
}

export function deriveProgram(input: any, output: any, library: Op[], types: any): Program {
  const queue: ASST[] = []
  const root = ASST.root(input)
  queue.push(root)

  let nodesChecked = 0
  const limit = 1000
  let solutionNode: ASST | undefined
  while (queue.length > 0 && ++nodesChecked < limit && !solutionNode) {
    const cur = queue.shift()!
    cur.generateChildren(library, types)
    for (const child of cur.children) {
      console.log(`got ${JSON.stringify(child.value)}, looking for ${JSON.stringify(output)}`)
      if (eq(child.value, output)) {
        solutionNode = child
        break
      }
      queue.push(child)
    }
  }
  if (!solutionNode) {
    if (queue.length === 0) console.error(`Queue is empty after ${nodesChecked} nodes checked`)
    else if (nodesChecked >= limit) console.error(`Limit of ${limit} nodes checked (queue length ${queue.length})`)
    throw new Error('No solution found')
  }
  return solutionNode.trace()
}
