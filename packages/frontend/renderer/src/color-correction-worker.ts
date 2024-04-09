import { Tick } from "@startcoding/types"
// @ts-ignore
//import skmeans from "skmeans"
// @ts-ignore
//import colorSpace from 'color-space'
import "./global_buffer"
// @ts-ignore
import RgbQuant from 'rgbquant'
import { solveLp } from 'lpsolver/src/index'

const correctionMatrices = {
  None: [
    [1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Protanopia: [
    [0.567, 0.433, 0, 0, 0],
    [0.558, 0.442, 0, 0, 0],
    [0, 0.242, 0.758, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Protanomaly: [
    [0.817, 0.183, 0, 0, 0],
    [0.333, 0.667, 0, 0, 0],
    [0, 0.125, 0.875, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Deuteranopia: [
    [0.625, 0.375, 0, 0, 0],
    [0.7, 0.3, 0, 0, 0],
    [0, 0.3, 0.7, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Deuteranomaly: [
    [0.8, 0.2, 0, 0, 0],
    [0.258, 0.742, 0, 0, 0],
    [0, 0.142, 0.858, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Tritanopia: [
    [0.95, 0.05, 0, 0, 0],
    [0, 0.433, 0.567, 0, 0],
    [0, 0.475, 0.525, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Tritanomaly: [
    [0.967, 0.033, 0, 0, 0],
    [0, 0.733, 0.267, 0, 0],
    [0, 0.183, 0.817, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Achromatopsia: [
    [0.299, 0.587, 0.114, 0, 0],
    [0.299, 0.587, 0.114, 0, 0],
    [0.299, 0.587, 0.114, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Achromatomaly: [
    [0.618, 0.32, 0.062, 0, 0],
    [0.163, 0.775, 0.062, 0, 0],
    [0.163, 0.32, 0.516, 0, 0],
    [0, 0, 0, 1, 0]
  ],
}

const copyMatrix = (matrix: typeof lastMatrix) => {
  return matrix.map(row => row.slice())
}

let lastMatrix = copyMatrix(correctionMatrices["None"])
let colorCorrection: keyof typeof correctionMatrices = 'None'

const applyMatrix = (pixel: readonly [number, number, number, number], matrix: typeof lastMatrix) => {
  const tr = matrix[0]
  const tg = matrix[1]
  const tb = matrix[2]

  const [r1, g1, b1, a1] = pixel

  return [
    tr[0] * r1 + tr[1] * g1 + tr[2] * b1 + tr[3] * a1 + tr[4],
    tg[0] * r1 + tg[1] * g1 + tg[2] * b1 + tg[3] * a1 + tg[4],
    tb[0] * r1 + tb[1] * g1 + tb[2] * b1 + tb[3] * a1 + tb[4],
    a1
  ] as const
}

const randomizeMatrix = (orig: number[][], row: number) => {
  const mat = copyMatrix(orig)
  mat[row] = []
  for (let j = 0; j < 3; j++) {
    mat[row][j] = Math.random()
  }
  mat[row][3] = 0
  mat[row][4] = 0
  return mat
}

// const LABAToRGBA = (lab) => {
//   return [...colorSpace.lab.rgb(lab.slice(0, 3)), lab[3]]
// }

// const RGBAtoLABA = (rgb) => {
//   return [...colorSpace.rgb.lab(rgb.slice(0, 3)), rgb[3]]
// }

const RGBAtoRelativeLuminanceComponents = (rgb: readonly [number, number, number, number]) => {
  const [r, g, b, a] = rgb
  const [R, G, B] = [r, g, b]//.map(val => 255 - a * (255 - val))
  return [0.2126 * R, 0.7152 * G, 0.0722 * B]
}

const calculateStatistics = (arr: number[]) => {

  // Creating the mean with Array.reduce
  let mean = arr.reduce((acc, curr) => {
    return acc + curr
  }, 0) / arr.length;

  // Assigning (value - mean) ^ 2 to
  // every array item
  arr = arr.map((k) => {
    return (k - mean) ** 2
  });

  // Calculating the sum of updated array 
  let sum = arr.reduce((acc, curr) => acc + curr, 0);

  let length = arr.length
  // Calculating the variance
  let variance = sum / length

  // Returning the standard deviation
  const stdDev = Math.sqrt(variance)

  return {
    stdDev,
    mean,
    variance,
    sum,
    length
  }
}

const sum = (components: readonly number[]) => {
  return components.reduce((sum, component) => sum + component, 0)
}
const getDifferenceStats = (centroids: Array<readonly [number, number, number, number]>, shiftedCentroids: Array<readonly [number, number, number, number]>, changedMatrix: number[][]) => {
  let changedDistanceDifferences: number[] = []
  let componentDerivatives: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  for (let kIndex1 = 0; kIndex1 < shiftedCentroids.length; kIndex1++) {
    for (let kIndex2 = 0; kIndex2 < shiftedCentroids.length; kIndex2++) {
      if (kIndex1 === kIndex2) {
        continue;
      }

      const changed1 = applyMatrix(shiftedCentroids[kIndex1], changedMatrix)
      const changed2 = applyMatrix(shiftedCentroids[kIndex2], changedMatrix)
      const originalDistance = vectorDistance(centroids[kIndex1], centroids[kIndex2])
      const changedDistance = vectorDistance(changed1, changed2)
      changedDistanceDifferences.push(Math.abs(originalDistance - changedDistance))

      for (let i = 0; i < 12; i++) {
        if (i % 4 === 0) {
          componentDerivatives[i] = (componentDerivatives[i] + changed1[0] - changed2[0]) / 2
        } else if (i % 3 === 0) {
          componentDerivatives[i] += 0
        } else if (i % 2 === 0) {
          componentDerivatives[i] = (componentDerivatives[i] + changed1[2] - changed2[2]) / 2
        } else {
          componentDerivatives[i] = (componentDerivatives[i] + changed1[1] - changed2[1]) / 2
        }
      }
    }
  }
  return {
    ...calculateStatistics(changedDistanceDifferences),
    componentDerivatives
  }
}

const vectorDistance = (v1: readonly number[], v2: readonly number[]) => {
  let total = 0

  for (let i = 0; i < v1.length; i++) {
    total += (v1[i] - v2[i]) ** 2
  }

  return Math.sqrt(total)
}

const doColorCorrection = async (frames: Array<[index: number, frame: ImageBitmap]>, tick: Tick) => {
  const correctionCanvas = new OffscreenCanvas(tick.globals.height, tick.globals.width)
  const correctionContext = correctionCanvas.getContext('2d')!
  frames.sort(([aIndex], [bIndex]) => aIndex - bIndex).forEach(([_, frame]) => {
    correctionContext.drawImage(frame, 0, 0)
  })
  //const imageData = correctionContext.getImageData(0, 0, tick.globals.width, tick.globals.height)
  //const origPixels = new Set<readonly [number, number, number, number]>()

  const correctionMatrix = correctionMatrices[colorCorrection]

  const q = new RgbQuant({
    colors: 256
  })

  q.sample(correctionContext.getImageData(0, 0, tick.globals.width, tick.globals.height))


  const palette: [number, number, number][] = q.palette(true)

  const correctedPalette: [number, number, number][] = palette.map(color => {
    // @ts-ignore
    return applyMatrix([...color, 1], correctionMatrix).slice(0, 3) as [number, number, number]
  })

  const coefficients: [number, number, number][] = []
  const constants: [number, number, number][] = []

  for (let i = 0, l = 0; i < correctedPalette.length; i++) {
    for (let j = i + 1; j < correctedPalette.length; j++, l++) {
      coefficients[l] = [0, 0, 0]
      constants[l] = [0, 0, 0]
      for (let k = 0; k < 3; k++) {
        coefficients[l][k] = correctedPalette[i][k] - correctedPalette[j][k]
        constants[l][k] = palette[i][k] - palette[j][k]
      }
    }
  }

  const solutionMatrix: number[][] = []
  const solutions: Promise<[number, number, number, number]>[] = []

  for (let i = 0; i < 3; i++) {
    //   const lp = 
    //   `Maximize
    //      obj: ${coefficients[0]} * t1 + ${coefficients[1]} * t2 + ${coefficients[2]} * t3 + t4
    //    Subject To:
    //      ${coefficients[0]} * t1 + ${coefficients[1]} * t2 + ${coefficients[2]} * t3 + t4 <= ${coefficients[i]}
    //      ${
    //        correctedPalette.map(([r, g, b], i) => `cons${i}: ${r} * t1 + ${g} * t2 + ${b} * t3 + t4 <= 255`).join('\n')
    //      }
    //    End
    //   `
    //   const solution = highs.solve(lp)

    //   console.log(solution)
    const A = [...coefficients.map(eff => [...eff, 1]), ...correctedPalette.map(([r, g, b]) => [r, g, b, 1]), ...correctedPalette.map(([r, g, b]) => [-r, -g, -b, -1])]
    const b = [...constants.map(c => c[i]), ...(new Array(correctedPalette.length).fill(0)), ...(new Array(correctedPalette.length).fill(-255))]
    const c = [1, 1, 1, 1]

    const solution = solveLp(A, b, c)
    console.log(solution)
    const { variables } = solution
    solutionMatrix.push([...variables.slice(0, 3), 0, variables[3]])
  }

  // const rows = await Promise.all(solutions)



  // for (let i = 0; i < 3; i++) {
  //   const [t1, t2, t3, t4] = rows[i]
  //   lastMatrix.push([t1, t2, t3, 0, t4])
  // }

  solutionMatrix.push([0, 0, 0, 1, 0])

  postMessage(['updateColorCorrectionMatrix', solutionMatrix])

  // const k = 12

  // const {centroids}: { centroids: Array<readonly [number, number, number, number]>} = skmeans(Array.from(origPixels.values()), k)

  // const convertedCentroids = centroids.filter(centroid => !isNaN(centroid[0])).map(centroid => LABAToRGBA(centroid)) as unknown as Array<readonly [number, number, number, number]> 

  // const shiftedCentroids = convertedCentroids.map(centroid => 
  //   applyMatrix(
  //     // @ts-ignore
  //     centroid,
  //     // @ts-ignore
  //     correctionMatrix
  //   )
  // )
  // if (shiftedCentroids.length < 2) {
  //   return;
  // }

  // await nlopt.ready

  // const opt = new nlopt.Optimize(nlopt.Algorithm.LD_SLSQP, 12)

  // opt.setMinObjective((x, grad) => {
  //   const mat: number[][] = []

  //   for (let i = 0, row = 0; i < x.length; i += 4, row++) {
  //     mat[row] = [...x.slice(i, i + 3), 0, x[i + 3]]
  //   }

  //   mat.push([0,0,0,1,0])

  //   const { mean, componentDerivatives } = getDifferenceStats(convertedCentroids, shiftedCentroids, mat)

  //   if (grad) {
  //     for (let i = 0; i < 12; i++) {
  //       grad[i] = componentDerivatives[i]
  //     }
  //   }
  //   return mean
  // }, 0.01)

  // // opt.addEqualityMConstraint((x, grad) => {
  // //   console.log(grad)
  // //   const mat: number[][] = []

  // //   for (let i = 0, row = 0; i < x.length; i += 4, row++) {
  // //     mat[row] = [...x.slice(i, i + 3), 0, x[i + 3]]
  // //   }

  // //   mat.push([0,0,0,1,0])

  // //   const ret = [0,0,0,0]

  // //   for (let k = 0; k < shiftedCentroids.length; k++) {
  // //     const changed = applyMatrix(shiftedCentroids[k], mat)
  // //     for (const index in changed) {
  // //       ret[index] += Math.floor(changed[index] / 255)
  // //     }
  // //   }

  // //   return ret
  // // }, [0,0,0,0])

  // //opt.setUpperBounds([1,1,1,1,1,1,1,1,1,1,1,1])
  // //opt.setLowerBounds([0,0,0,0,0,0,0,0,0,0,0,0])

  // opt.setMaxtime(25000)

  // const flattenedMatrix = lastMatrix.slice(0, 3).reduce((acc, row) => [...acc, ...row.slice(0,3), row[4]], [])

  // const { x, value } = opt.optimize(flattenedMatrix)

  // const { mean } = getDifferenceStats(convertedCentroids, shiftedCentroids, lastMatrix)

  // if (value < mean) {
  //   console.log(`Choosing new matrix, ${value} < ${mean} `)

  //   const mat: number[][] = []

  //   for (let i = 0, row = 0; i < x.length; i += 4, row++) {
  //     mat[row] = [...x.slice(i, i + 3), 0, x[i + 3]]
  //   }

  //   mat.push([0,0,0,1,0])

  //   postMessage(['updateColorCorrectionMatrix', mat])
  //   lastMatrix = mat
  // } else {
  //   console.log(`Choosing current matrix, ${value} > ${mean} `)
  // }

  // nlopt.GC.flush();
}

let counter = 0

addEventListener(
  "message",
  async (
    message: MessageEvent<[action: "doColorCorrection", correction: keyof typeof correctionMatrices, frames: Array<[index: number, frame: ImageBitmap]>, tick: Tick]>
  ) => {
    const [action] = message.data;

    if (action === 'doColorCorrection') {
      const [_, correction, frames, tick] = message.data
      colorCorrection = correction
      if (correction !== 'None') {
        lastMatrix = copyMatrix(correctionMatrices['None'])
        doColorCorrection(frames, tick)
      }
    }
  }
);