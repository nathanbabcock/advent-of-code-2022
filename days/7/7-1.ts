import chalk from 'chalk'
import { readFileSync } from 'fs'

const testInput = `$ cd /
$ ls
dir a
14848514 b.txt
8504156 c.dat
dir d
$ cd a
$ ls
dir e
29116 f
2557 g
62596 h.lst
$ cd e
$ ls
584 i
$ cd ..
$ cd ..
$ cd d
$ ls
4060174 j
8033020 d.log
5626152 d.ext
7214296 k`

type File = {
  path: string[]
  name: string
  size: number
}

type Dir = {
  path: string[]
  size: number
}

const trace: string[][] = []

/** Return intrisic size of a given direction + size of all its descendants */
function getSize(path: string[], dirs: Dir[]): number {
  return dirs
    .filter(dir => path.every((p, i) => p === dir.path[i]))
    .reduce((acc, dir) => acc + dir.size, 0)
}

function solveImperative(input: string): number {
  const lines = input.split(/\r?\n/)
  const files: File[] = []
  let curPath: string[] = []

  for (const line of lines) {
    if (line.startsWith('$ cd ')) {
      const newPath = line.slice(5)
      if (newPath === '..') {
        if (curPath.length === 1) console.warn('Cannot go up from root')
        curPath.pop()
      }
      else if (newPath === '/')
        curPath = ['/']
      else
        curPath.push(newPath)
    } else if (!Number.isNaN(parseInt(line[0]))) {
      const [size, name] = line.split(' ')
      files.push({ path: [...curPath], name, size: parseInt(size) })
    } else {
      // ignoring all '$ ls' and `dir` lines (irrelevant)
    }
    trace.push([...curPath])
  }

  // console.log(files.map(f => f.path.join('/').slice(1) + '/' + f.name))

  const dirs: Dir[] = []
  for (const file of files) {
    let dir = dirs.find(dir => dir.path.every((p, i) => p === file.path[i]) && dir.path.length === file.path.length)
    if (!dir) {
      dir = { path: [...file.path], size: 0 }
      dirs.push(dir)
    }
    dir.size += file.size
  }

  // !!! Edge case that worked for test input, but not real input:
  // Folders with no files inside them (only nested folders)
  // The above block doesn't count any of these (since they have "intrisic" size 0)
  // But they should be included in the whole list.
  // We add them here:
  for (const dir of dirs) {
    for (let i = 0; i < dir.path.length; i++) {
      const subPath = dir.path.slice(0, i)
      if (!dirs.some(dir => dir.path.every((p, i) => p === subPath[i]) && dir.path.length === subPath.length))
        dirs.push({ path: [...subPath], size: 0 })
    }
  }


  // This sort is unneccessary, but this could be a starting point for a recursive solution
  dirs.sort((a, b) => a.path.length - b.path.length)
  const mapped = dirs.map(dir => getSize(dir.path, dirs))
  const filtered = mapped.filter(size => size <= 100000)
  const sum = filtered.reduce((acc, size) => acc + size, 0)

  // Part 1 Answer:
  // return sum

  // Part 2 Answer:
  const totalSpace = 70_000_000
  const requiredSpace = 30_000_000
  const usedSpace = files.reduce((acc, file) => acc + file.size, 0)
  const freeSpace = totalSpace - usedSpace
  const spaceToFree = requiredSpace - freeSpace
  return dirs.map(dir => ({ path: dir.path, size: getSize(dir.path, dirs) }))
    .filter(dir => dir.size >= spaceToFree)
    .sort((a, b) => a.size - b.size)[0].size
}

function getFilesFunctional(lines: string[], files: File[] = [], curPath: string[] = []): File[] {
  return lines.length === 0
    ? files // base case
    : lines[0].startsWith('$ cd ') // recursive case
      ? lines[0].slice(5) === '..'
        ? getFilesFunctional(lines.slice(1), files, curPath.slice(0, -1))
        : lines[0].slice(5) === '/'
          ? getFilesFunctional(lines.slice(1), files, ['/'])
          : getFilesFunctional(lines.slice(1), files, [...curPath, lines[0].slice(5)])
      : !Number.isNaN(parseInt(lines[0].split(' ')[0]))
        ? getFilesFunctional(lines.slice(1), [...files, { path: [...curPath], name: lines[0].split(' ')[1], size: parseInt(lines[0].split(' ')[0]) }], curPath)
        : getFilesFunctional(lines.slice(1), files, curPath)
}

function solveFunctional(input: string): number {
  const files = getFilesFunctional(input.split(/\r?\n/))

  const dirs: Dir[] = []
  for (const file of files) {
    let dir = dirs.find(dir => dir.path.every((p, i) => p === file.path[i]) && dir.path.length === file.path.length)
    if (!dir) {
      dir = { path: [...file.path], size: 0 }
      dirs.push(dir)
    }
    dir.size += file.size
  }

  // !!! Edge case that worked for test input, but not real input:
  // Folders with no files inside them (only nested folders)
  // The above block doesn't count any of these (since they have "intrisic" size 0)
  // But they should be included in the whole list.
  // We add them here:
  for (const dir of dirs) {
    for (let i = 0; i < dir.path.length; i++) {
      const subPath = dir.path.slice(0, i)
      if (!dirs.some(dir => dir.path.every((p, i) => p === subPath[i]) && dir.path.length === subPath.length))
        dirs.push({ path: [...subPath], size: 0 })
    }
  }


  // This sort is unneccessary, but this could be a starting point for a recursive solution
  dirs.sort((a, b) => a.path.length - b.path.length)
  const mapped = dirs.map(dir => getSize(dir.path, dirs))
  const filtered = mapped.filter(size => size <= 100000)
  const sum = filtered.reduce((acc, size) => acc + size, 0)

  // Part 1 Answer:
  // return sum

  // Part 2 Answer:
  const totalSpace = 70_000_000
  const requiredSpace = 30_000_000
  const usedSpace = files.reduce((acc, file) => acc + file.size, 0)
  const freeSpace = totalSpace - usedSpace
  const spaceToFree = requiredSpace - freeSpace
  return dirs.map(dir => ({ path: dir.path, size: getSize(dir.path, dirs) }))
    .filter(dir => dir.size >= spaceToFree)
    .sort((a, b) => a.size - b.size)[0].size
}

const solve = solveFunctional

console.log(chalk.bgGreen(' Part 1 test input '))
console.log(solve(testInput))
console.log()

const realInput = readFileSync('days/7/7.txt').toString()
console.log(chalk.bgGreen(' Part 1 real input '))
console.log(solve(realInput))
console.log()
