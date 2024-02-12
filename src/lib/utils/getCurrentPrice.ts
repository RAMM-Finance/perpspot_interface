import { abi as PoolAbi } from 'abis_v2/UniswapV3Pool.json'
import { BigNumber as BN } from 'bignumber.js'
import { ethers } from 'ethers'

const provider = new ethers.providers.InfuraProvider('arbitrum', process.env.REACT_APP_INFURA_KEY)
const Q96 = new BN(2).exponentiatedBy(96) // JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96))

export default async function getToken0Price(address: string, token0Decimals: number, token1Decimals: number) {
  const sameDecimals = token0Decimals === token1Decimals
  const poolContract = new ethers.Contract(address, PoolAbi, provider)

  const slot0 = await poolContract.callStatic.slot0()

  const sqrtPriceX96 = new BN(slot0.sqrtPriceX96.toString())
  const rawPrice = sqrtPriceX96.div(Q96).exponentiatedBy(2)
  if (sameDecimals) {
    return rawPrice
  } else {
    if (token0Decimals > token1Decimals) {
      return rawPrice.shiftedBy(token0Decimals - token1Decimals)
    } else {
      return rawPrice.shiftedBy(token0Decimals - token1Decimals)
    }
  }
}
