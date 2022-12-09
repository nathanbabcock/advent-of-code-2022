import { readFileSync } from 'fs'
const testInput = `R 4
U 4
L 3
D 1
R 4
D 1
L 5
R 2`

const realInput = readFileSync('days/9/9.txt').toString()

const input = realInput

const output = input
  .split(/\r?\n/)
  .map(line => line.split(' '))
  .flatMap(line => { // expand each instruction to individual steps with a direction vector
    const direction = line[0]
    const times = parseInt(line[1])
    const delta =
      direction === 'U' ? [0, 1]
        : direction === 'D' ? [0, -1]
          : direction === 'L' ? [-1, 0]
            : [1, 0]
    return Array(times).fill(delta)
  })
  .reduce((acc, delta) => { // transform each step into head position
    acc.headPos[0] += delta[0]
    acc.headPos[1] += delta[1]

    const deltaX = acc.headPos[0] - acc.tailPos[0]
    const deltaY = acc.headPos[1] - acc.tailPos[1]
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)
    const gapX = absDeltaX > 1
    const gapY = absDeltaY > 1

    // console.log({ absDeltaX, absDeltaY })

    if ((absDeltaX > 1 && absDeltaY !== 0) || (absDeltaY > 1 && absDeltaX !== 0)) {
      console.log('big gap')
      if (absDeltaX > absDeltaY) {
        // snap Y to head.y, and drag X towards head
        acc.tailPos[1] = acc.headPos[1]
        acc.tailPos[0] += (acc.headPos[0] - Math.sign(acc.headPos[0] - acc.tailPos[0])) - acc.tailPos[0]
      } else {
        // snap X to head.x, and drag Y towards head
        acc.tailPos[0] = acc.headPos[0]
        acc.tailPos[1] += (acc.headPos[1] - Math.sign(acc.headPos[1] - acc.tailPos[1])) - acc.tailPos[1]
      }
    } else if (+gapX ^ +gapY) { // looks weird, but it's just an XOR
      // The + is only to satisfy typescript (unary conversion to number)
      // Javascript does this conversion automatically

      const dim = gapX ? 0 : 1
      // drag tail towards head
      acc.tailPos[dim] += (acc.headPos[dim] - Math.sign(acc.headPos[dim] - acc.tailPos[dim])) - acc.tailPos[dim]
    }

    if (!acc.tailHistory.some((pos: [number, number]) => pos[0] === acc.tailPos[0] && pos[1] === acc.tailPos[1]))
      acc.tailHistory.push([...acc.tailPos])

    // console.log(acc)

    return acc
  }, {
    headPos: [0, 0],
    tailPos: [0, 0],
    tailHistory: [[0, 0]],
  }).tailHistory.length

console.log(output)