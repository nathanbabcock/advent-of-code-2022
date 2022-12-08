const input = `1000
2000
3000

4000

5000
6000

7000
8000
9000

10000`

// Split the input string into an array of lines
const lines = input.split('\n')

// Initialize an array to store the groups of numbers
const groups = []

// Initialize a variable to track the current group of numbers
let currentGroup = []

// Iterate over the lines in the input
for (const line of lines) {
  // If the line is empty, add the current group of numbers to the array
  // of groups and reset the current group
  if (line === '') {
    groups.push(currentGroup)
    currentGroup = []
  } else {
    // Convert the line to a number and add it to the current group of numbers
    currentGroup.push(Number(line))
  }
}

// Add the final group of numbers to the array of groups
groups.push(currentGroup)

console.log(`The input is grouped into ${groups.length} groups:`)
for (const group of groups) {
  // Sum the numbers in the group
  const sum = group.reduce((total, num) => total + num, 0)

  console.log(`The sum of the numbers in group ${groups.indexOf(group) + 1} is ${sum}.`)
}

// Calculate the group with the highest sum
const maxSum = Math.max(...groups.map(group => group.reduce((total, num) => total + num, 0)))
const maxSumGroup = groups.find(group => group.reduce((total, num) => total + num, 0) === maxSum)

console.log(`The group with the highest sum is group ${groups.indexOf(maxSumGroup) + 1} with a sum of ${maxSum}.`)