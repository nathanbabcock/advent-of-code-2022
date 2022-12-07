const getDirsFunctional = (files, dirs = []) =>
  files.length === 0
    ? dirs // base case
    : ((file, remainingFiles) =>
      getDirsFunctional(
        remainingFiles,
        ((existingDir) => [ // add file size to dir
          { path: existingDir.path, size: existingDir.size + file.size },
          ...dirs.filter(dir => dir !== existingDir),
        ])( // find existing dir or create it
          dirs.find(dir =>
            dir.path.every((p, i) =>
              p === file.path[i]
            ) && dir.path.length === file.path.length
          ) ?? { path: [...file.path], size: 0 }))
    )(files[0], files.slice(1))

const addEmptyDirs = (dirs, allDirs = dirs) =>
  dirs.length === 0
    ? allDirs // base case
    : ((dir, remainingDirs) => // loop over dirs
      addEmptyDirs(remainingDirs, // (top-level) recursion
        // get all subpaths
        ((subPathFn) => subPathFn(dir.path, allDirs, subPathFn)) // insanity; a function that returns the invocation of its parameter *on itself*
          ((subPath, dirs, subPathFn) =>
            subPath.length === 0
              ? dirs // base case
              : dirs.some(dir => dir.path.every((p, i) => p === subPath[i]) && dir.path.length === subPath.length)
                ? subPathFn(subPath.slice(0, -1), dirs, subPathFn) // already have a dir for this path
                : subPathFn(subPath.slice(0, -1), [...dirs, { path: [...subPath], size: 0 }], subPathFn) // missing dir; add one
          )
      )
    )(dirs[0], dirs.slice(1))

  ////
  ; ((files) =>
    ((dirs) => ({
      part1: dirs
        .map(dir => dirs // getSize()
          .filter(fDir => dir.path.every((p, i) => p === fDir.path[i]))
          .reduce((acc, rDir) => acc + rDir.size, 0))
        .filter(size => size <= 100000)
        .reduce((acc, size) => acc + size, 0),
      part2: dirs.map(dir => ({
        path: dir.path, size: dirs // getSize()
          .filter(fDir => dir.path.every((p, i) => p === fDir.path[i]))
          .reduce((acc, rDir) => acc + rDir.size, 0)
      }))
        .filter(dir => dir.size >= 30_000_000 - (70_000_000 - files.reduce((acc, file) => acc + file.size, 0)))
        .sort((a, b) => a.size - b.size)[0].size,
    }))(addEmptyDirs(getDirsFunctional(files)))
  )(
    ((getFilesFunctional, lines) => getFilesFunctional(lines, [], [], getFilesFunctional))
      ((lines, files = [], curPath = []) =>
        lines.length === 0
          ? files // base case
          : ((line, otherLines) => line.startsWith('$ cd ') // recursive case, using IIFE to avoid repeating "lines[0]"
            ? ((newPath) => newPath === '..' // iffy IIFE again
              ? getFilesFunctional(otherLines, files, curPath.slice(0, -1))
              : newPath === '/'
                ? getFilesFunctional(otherLines, files, ['/'])
                : getFilesFunctional(otherLines, files, [...curPath, newPath]))(line.slice(5))
            : !Number.isNaN(parseInt(line.charAt(0)))
              ? ((parts) => getFilesFunctional(otherLines, [...files, { path: [...curPath], name: parts[1], size: parseInt(parts[0]) }], curPath))(line.split(' '))
              : getFilesFunctional(otherLines, files, curPath))(lines[0], lines.slice(1)) // ...(head(lines), tail(lines))
        , document.body.innerText.split(/\r?\n/)) // <- input goes here ;)
  )


