/**
 * A Table represents a set of inputs and outputs for a single function.
 * For example, the table for `add` would be:
 * 
 * ```md
 * | a | b | out |
 * |---|---|-----|
 * | 0 | 0 | 0   |
 * | 0 | 1 | 1   |
 * | 1 | 0 | 1   |
 * | 1 | 1 | 2   |
 * ... 
 * ```
 */
export class Table {
  public rows: Row[] = []

  generateInputPredicates(): Predicate[] {
    throw new Error('todo')
  }

  generateOutputPredicates(): Predicate[] {
    throw new Error('todo')
  }

  /** returns an array of indices for rows whose inputs match the given predicate */
  filterInputsByPredicate(predicate: Predicate): number[] {
    const matchingRows: number[] = []
    this.rows.forEach((row, i) => predicate(row.inputs) && matchingRows.push(i))
    return matchingRows
  }

  /** returns an array of indices for rows whose output matches the given predicate */
  filterOutputsByPredicate(predicate: Predicate): number[] {
    const matchingRows: number[] = []
    this.rows.forEach((row, i) => predicate(row.output) && matchingRows.push(i))
    return matchingRows
  }

  /**
   * If we find a pair of predicates which filter input and output to the same
   * subset, we are onto something.
   */
  static rowSubsetsMatch(inputs: number[], outputs: number[]): boolean {
    return inputs.every((i, idx) => outputs[idx] === i) && inputs.length === outputs.length
  }

  // Search:
  // - generate predicates for inputs and outputs
  // - try every pair/combination of applying these predicates
  // - if the subsets match, record the predicates & the subset
  // - stop when there's enough predicates to cover the entire table
  // - list (all) the pairs of predicates, and the rows they pick out

  addRow(row: Row) {
    this.rows.push(row)
  }
}

export type Row = {
  inputs: any[]
  output: any
}

export type Predicate = (input: any) => boolean