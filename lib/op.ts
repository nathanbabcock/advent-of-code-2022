export type Op = {
  name: string
  inputs: any[]
  output: any
}

export type Type = {

}

export const Split: Op = {
  name: 'split',
  inputs: ['string', 'char'],
  output: 'string[]',
}
