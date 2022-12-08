const grid = ['30373', '25512', '65332', '33549', '35390']

// Find the height of the tallest tree in the grid
const maxTreeHeight = Math.max(...grid.map(row => Math.max(...row)))

// Initialize the count of visible trees to zero
let visibleTreeCount = 0

// Add the number of trees on the edges of the grid to the count of
// visible trees
visibleTreeCount += grid[0].length + grid.length - 2

// Scan the grid from left to right and from top to bottom, and count the
// number of trees that are visible from outside the grid
for (let row = 0; row < grid.length; row++) {
  for (let col = 0; col < grid[row].length; col++) {
    const treeHeight = Number(grid[row][col])

    // Skip trees that are not taller than the tallest tree in the grid
    if (treeHeight < maxTreeHeight) continue

    // Check if the tree is visible from outside the grid in each direction
    const isVisibleFromTop = row === 0 || grid[row - 1][col] < treeHeight
    const isVisibleFromBottom =
      row === grid.length - 1 || grid[row + 1][col] < treeHeight
    const isVisibleFromLeft = col === 0 || grid[row][col - 1] < treeHeight
    const isVisibleFromRight =
      col === grid[row].length - 1 || grid[row][col + 1] < treeHeight

    // If the tree is visible from any direction, increment the count of
    // visible trees
    if (isVisibleFromTop || isVisibleFromBottom || isVisibleFromLeft || isVisibleFromRight) {
      visibleTreeCount++
    }
  }
}

console.log(`${visibleTreeCount} trees are visible from outside the grid.`)
