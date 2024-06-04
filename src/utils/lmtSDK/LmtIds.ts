import { PoolKey } from 'types/lmtv2position'

export function getPoolId(tokenA: string, tokenB: string, fee: number) {
  const token0 = tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenA : tokenB
  const token1 = tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenB : tokenA
  return `${token0.toLowerCase()}-${token1.toLowerCase()}-${fee}`
}

export function getLeveragePositionId(poolKey: PoolKey, isToken0: boolean, trader: string): string {
  return `${getPoolId(poolKey.token0, poolKey.token1, poolKey.fee)}-${isToken0}-${trader}`
}
