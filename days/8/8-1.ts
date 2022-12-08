// const trees =
//   `30373
// 25512
// 65332
// 33549

import { readFileSync } from 'fs'

// 35390`
const trees = readFileSync('days/8/8.txt').toString()
  .split(/\r?\n/)
  .map(x => x.split('').map(x => ({ height: parseInt(x), visible: false })))

let prevHighest = -1

// left
for (let r = 0; r < trees.length; r++) {
  for (let c = 0; c < trees[r].length; c++) {
    if (c === 0) {
      trees[r][c].visible = true
      prevHighest = trees[r][c].height
      continue
    }
    if (trees[r][c].height > prevHighest) {
      trees[r][c].visible = true
      prevHighest = trees[r][c].height
      continue
    }
  }
}

// right
for (let r = 0; r < trees.length; r++) {
  for (let c = trees[r].length - 1; c >= 0; c--) {
    if (c === trees[r].length - 1) {
      trees[r][c].visible = true
      prevHighest = trees[r][c].height
      continue
    }
    if (trees[r][c].height > prevHighest) {
      trees[r][c].visible = true
      prevHighest = trees[r][c].height
      continue
    }
  }
}

// top
for (let c = 0; c < trees[0].length; c++) {
  for (let r = 0; r < trees.length; r++) {
    if (r === 0) {
      trees[r][c].visible = true
      prevHighest = trees[r][c].height
      continue
    }
    if (prevHighest < trees[r][c].height) {
      trees[r][c].visible = true
      prevHighest = trees[r][c].height
      continue
    }
  }
}

// bottom
for (let c = 0; c < trees[0].length; c++) {
  for (let r = trees.length - 1; r > 0; r--) {
    if (r === trees[0].length - 1) {
      trees[r][c].visible = true
      prevHighest = trees[r][c].height
      continue
    }
    if (prevHighest < trees[r][c].height) {
      trees[r][c].visible = true
      prevHighest = trees[r][c].height
      continue
    }
  }
}

let visible = 0
for (let r = 0; r < trees.length; r++) {
  console.log(trees[r].map(tree => tree.visible ? '1' : '0').join(''))
  for (let c = 0; c < trees[r].length; c++)
    if (trees[r][c].visible) visible++
}

console.log({ visible })
