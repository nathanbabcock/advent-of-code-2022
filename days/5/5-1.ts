import { readFileSync } from 'fs'

const realInput = readFileSync('days/5/5.txt').toString()

const parts = realInput.split('\r\n\r\n')

const diagram = parts[0].split('\r\n').slice(0, -1)

let moves: any[] = parts[1]
  .split('\r\n')
  .map(move => move.split('move')[1])
  .map(move => move.split('from'))

moves.forEach(move => {
  const a = move[1].split('to')
  move[1] = a[0]
  move[2] = a[1]

  move[0] = parseInt(move[0])
  move[1] = parseInt(move[1])
  move[2] = parseInt(move[2])
})

moves = moves.map(move => ({
  move: move[0],
  from: move[1],
  to: move[2],
}))

console.log(moves)
console.log(diagram)

const stacks = [
  ['P', 'G', 'R', 'N'],
  ['C', 'D', 'G', 'F', 'L', 'B', 'T', 'J'],
  ['V', 'S', 'M'],
  ['P', 'Z', 'C', 'R', 'S', 'L'],
  ['Q', 'D', 'W', 'C', 'V', 'L', 'S', 'P'],
  ['S', 'M', 'D', 'W', 'N', 'T', 'C'],
  ['P', 'W', 'G', 'D', 'H'],
  ['V', 'M', 'C', 'S', 'H', 'P', 'L', 'Z'],
  ['Z', 'G', 'W', 'L', 'F', 'P', 'R']
]

for (const move of moves)
  for (let i = 0; i < move.move; i++)
    stacks[move.to - 1].unshift(stacks[move.from - 1].shift()!)

let msg = ''
for (const stack of stacks)
  msg += stack[0]

console.log(msg)