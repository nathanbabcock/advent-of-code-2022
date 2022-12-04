import { ASST } from './asst'
import { Library } from './library'
import { eq } from './util'

export type Program = ASST[] // Could be specified further that the output of every function is first input of next function

export function deriveProgram(input: any, output: any, library: Library, limit = 10000): Program {
  const queue: ASST[] = []
  const root = ASST.root(input)
  queue.push(root)

  let nodesChecked = 0
  let solutionNode: ASST | undefined
  console.log(`looking for ${JSON.stringify(output)}`)
  while (queue.length > 0 && ++nodesChecked < limit && !solutionNode) {
    const cur = queue.shift()!
    cur.generateChildren(library)
    for (const child of cur.children) {
      console.log(`${child.op?.name} => ${JSON.stringify(child.value)}`)
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
  console.log(`Solution found after ${nodesChecked} nodes checked`)
  return solutionNode.trace()
}

export function runProgram(program: Program, input: any): any {
  let output = input
  // console.log(`Running program on ${JSON.stringify(input)}`)
  for (const asst of program) {
    if (!asst.parent) continue // skip the root (no op)
    output = asst.op!.impl(output, ...asst.additionalParams)
    // console.log(`  ${asst.op?.name ?? '🌱'} => ${JSON.stringify(output)}`)
  }
  return output
}

export function concatPrograms(program1: Program, program2: Program): Program {
  let secondHalf = program2.slice(1) // clip off the root
  secondHalf[0].parent = program1.at(-1) // splice it to the output of the first program
  program1.at(-1)!.children = [secondHalf[0], ...(program1.at(-1)!.children ?? [])]
  return [...program1, ...secondHalf]
}