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

function getFilesImperative(lines: string[]): File[] {
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
  return files
}

function getDirsImperative(files: File[]): Dir[] {
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
  return dirs
}

function solvePart1Imperative(dirs: Dir[]): number {
  // This sort is unneccessary, but this could be a starting point for a recursive solution
  dirs.sort((a, b) => a.path.length - b.path.length)
  const mapped = dirs.map(dir => getSize(dir.path, dirs))
  const filtered = mapped.filter(size => size <= 100000)
  const sum = filtered.reduce((acc, size) => acc + size, 0)
  return sum
}

function solvePart2Imperative(dirs: Dir[], files: File[]): number {
  const totalSpace = 70_000_000
  const requiredSpace = 30_000_000
  const usedSpace = files.reduce((acc, file) => acc + file.size, 0)
  const freeSpace = totalSpace - usedSpace
  const spaceToFree = requiredSpace - freeSpace
  return dirs.map(dir => ({ path: dir.path, size: getSize(dir.path, dirs) }))
    .filter(dir => dir.size >= spaceToFree)
    .sort((a, b) => a.size - b.size)[0].size
}

function solveImperative(input: string) {
  const lines = input.split(/\r?\n/)
  const files = getFilesImperative(lines)
  const dirs = getDirsImperative(files)
  const part1 = solvePart1Imperative(dirs)
  const part2 = solvePart2Imperative(dirs, files)
  console.log({ part1, part2 })
}

/// Declarative solution -----

// because one-liners are turing-complete, and why not 🎉
const getFilesFunctional = (lines: string[], files: File[] = [], curPath: string[] = []): File[] =>
  lines.length === 0
    ? files // base case
    : ((line: string, otherLines: string[]) => line.startsWith('$ cd ') // recursive case, using IIFE to avoid repeating "lines[0]"
      ? ((newPath: string) => newPath === '..' // iffy IIFE again
        ? getFilesFunctional(otherLines, files, curPath.slice(0, -1))
        : newPath === '/'
          ? getFilesFunctional(otherLines, files, ['/'])
          : getFilesFunctional(otherLines, files, [...curPath, newPath]))(line.slice(5))
      : !Number.isNaN(parseInt(line.charAt(0)))
        ? ((parts: [string, string]) => getFilesFunctional(otherLines, [...files, { path: [...curPath], name: parts[1], size: parseInt(parts[0]) }], curPath))(line.split(' ') as [string, string])
        : getFilesFunctional(otherLines, files, curPath))(lines[0], lines.slice(1)) // ...(head(lines), tail(lines))

const getDirsFunctional = (files: File[], dirs: Dir[] = []): Dir[] => files.length === 0
  ? dirs // base case
  : ((file: File, remainingFiles: File[]) =>
    getDirsFunctional(
      remainingFiles,
      ((existingDir: Dir): Dir[] => [ // add file size to dir
        { path: existingDir.path, size: existingDir.size + file.size },
        ...dirs.filter(dir => dir !== existingDir),
      ])( // find existing dir or create it
        dirs.find(dir =>
          dir.path.every((p, i) =>
            p === file.path[i]
          ) && dir.path.length === file.path.length
        ) ?? { path: [...file.path], size: 0 }))
  )(files[0], files.slice(1))

const addEmptyDirs = (dirs: Dir[], allDirs = dirs): Dir[] =>
  dirs.length === 0
    ? allDirs // base case
    : ((dir, remainingDirs) => // loop over dirs
      addEmptyDirs(remainingDirs, // (top-level) recursion
        // get all subpaths
        ((subPathFn: any) => subPathFn(dir.path, allDirs, subPathFn)) // insanity; calling a function with a ref to itself
          ((subPath: string[], dirs: Dir[], subPathFn: (subPath: string[], dirs: Dir[], subPathFn: any) => Dir[]) =>
            subPath.length === 0
              ? dirs // base case
              : dirs.some(dir => dir.path.every((p, i) => p === subPath[i]) && dir.path.length === subPath.length)
                ? subPathFn(subPath.slice(0, -1), dirs, subPathFn) // already have a dir for this path
                : subPathFn(subPath.slice(0, -1), [...dirs, { path: [...subPath], size: 0 }], subPathFn) // missing dir; add one
          )
      )
    )(dirs[0], dirs.slice(1))

// !!! Edge case that worked for test input, but not real input:
// Folders with no files inside them (only nested folders)
// The above block doesn't count any of these (since they have "intrisic" size 0)
// But they should be included in the whole list.
// We add them here:

// for (const dir of dirs) {
//   for (let i = 0; i < dir.path.length; i++) {
//     const subPath = dir.path.slice(0, i)
//     if (!dirs.some(dir => dir.path.every((p, i) => p === subPath[i]) && dir.path.length === subPath.length))
//       dirs.push({ path: [...subPath], size: 0 })
//   }
// }

function solveFunctional(input: string) {
  const files = getFilesFunctional(input.split(/\r?\n/))

  // bootstrap with imperative modules the rest of the way
  const dirs = addEmptyDirs(getDirsFunctional(files))

  // console.log(dirs)
  const part1 = solvePart1Imperative(dirs)
  const part2 = solvePart2Imperative(dirs, files)
  console.log({ part1, part2 })
}

const solve = solveFunctional

console.log(chalk.bgGreen(' Test input (both parts) '))
solve(testInput)
console.log()

const realInput = readFileSync('days/7/7.txt').toString()
console.log(chalk.bgGreen(' Real input (both parts) '))
solve(realInput)
console.log()
