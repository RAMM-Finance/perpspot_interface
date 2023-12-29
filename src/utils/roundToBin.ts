export function roundToBin(tick: number, binSize: number, roundDown: boolean): number {
  const bin = Math.floor(tick / binSize) * binSize
  if (roundDown) {
    return bin
  } else {
    return bin + binSize
  }
}
