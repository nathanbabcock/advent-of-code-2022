import { edge_detection, gaussian_blur, padding_uniform, PhotonImage, resize, Rgba, SamplingFilter, sharpen } from '@silvia-odwyer/photon-node'
import chalk from 'chalk'
import { writeFileSync, readFileSync } from 'fs'
import Tesseract from 'tesseract.js'

const testInput = `noop
addx 3
addx -5`

const testInput2 = readFileSync('days/10/10-test.txt', 'utf-8').toString()

const realInput = readFileSync('days/10/10.txt', 'utf-8').toString()

const signals = realInput
  .split(/\r?\n/)
  .reduce((acc, op, i) => {
    const parts = op.split(' ')
    const opName = parts[0]
    const prev = acc.at(-1)!
    if (opName === 'noop')
      return [...acc, prev]
    else {
      const num = parseInt(parts[1])
      return [...acc, prev, prev + num]
    }
  }, [1])

const outputPart1 = signals
  .filter((_, i) => i + 1 === 20 || (i + 1 + 20) % 40 === 0)
  .map((x, i) => (20 + i * 40) * x)
  .slice(0, 6)
  .reduce((acc, x) => acc + x, 0)

const outputPart2 = Array.from(Array(6).keys())
  .map(i => signals
    .slice(i * 40, (i + 1) * 40 - 1) // off by one? (end of clock cycle vs beginning?)
    .map((x, j) => Math.abs(x - j) <= 1 ? chalk.bold(chalk.blue('#')) : chalk.gray('.'))
    .join('')
  ).join('\n')

console.log(outputPart2)

function saveImage(img: PhotonImage, outputImageName: string) {
  let outputBase64 = img.get_base64()
  var outputData = outputBase64.replace(/^data:image\/\w+;base64,/, '')
  writeFileSync(outputImageName, outputData, { encoding: 'base64' })
  console.log(`Wrote ${outputImageName}`)
}

// convert to image
const rawPixels = Array.from(Array(6).keys())
  .flatMap(i => signals
    .slice(i * 40, (i + 1) * 40 - 1) // off by one? (end of clock cycle vs beginning?)
    .flatMap((x, j) => Math.abs(x - j) <= 1 ? [0, 0, 0, 255] : [255, 255, 255, 255])
  )
const uint8 = new Uint8Array(rawPixels)
let img = new PhotonImage(uint8, 39, 6)
img = padding_uniform(img, 2, new Rgba(255, 255, 255, 255))
img = resize(img, img.get_width() * 10, img.get_height() * 10, SamplingFilter.Nearest)
saveImage(img, 'days/10/10-sharp.png')

// Post-process to improve recognition
gaussian_blur(img, 4)
saveImage(img, 'days/10/10-blurred.png')

// Run tesseract
console.log('Detecting text with Tesseract...')
Tesseract.recognize('days/10/10-blurred.png')
  .then(x => console.log(chalk.green(x.data.text)))
