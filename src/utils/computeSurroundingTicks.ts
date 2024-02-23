import { Token } from '@uniswap/sdk-core'
import { tickToPrice } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { TickProcessed } from 'hooks/usePoolTickData'
import JSBI from 'jsbi'

import { Ticks } from '../graphql/thegraph/AllV3TicksQuery'

const PRICE_FIXED_DIGITS = 8


function safeParseToBigInt(liquidityNet:any) {
  if (isNaN(liquidityNet) || liquidityNet === undefined || liquidityNet === null) {
    // Handle the invalid case, perhaps log an error or set a default value
    console.error("Invalid liquidityNet value:", liquidityNet)
    return JSBI.BigInt(0); // Default value or throw an error
  } else {
    // It's safe to parse
    return JSBI.BigInt(new BN(liquidityNet).toFixed(0))
  }
}

// Computes the numSurroundingTicks above or below the active tick.
export default function computeSurroundingTicks(
  token0: Token,
  token1: Token,
  activeTickProcessed: TickProcessed,
  sortedTickData: Ticks,
  pivot: number,
  ascending: boolean
): TickProcessed[] {
  let previousTickProcessed: TickProcessed = {
    ...activeTickProcessed,
  }

  // Iterate outwards (either up or down depending on direction) from the active tick,
  // building active liquidity for every tick.
  let processedTicks: TickProcessed[] = []
  for (let i = pivot + (ascending ? 1 : -1); ascending ? i < sortedTickData.length : i >= 0; ascending ? i++ : i--) {
    const tick = Number(sortedTickData[i].tick)
    // console.log('liquidityNet', sortedTickData[i].liquidityNet, new BN(sortedTickData[i].liquidityNet).toFixed(0))

    // const tickData = JSBI.BigInt(new BN(sortedTickData[i].liquidityNet).toFixed(0))
    const tickData = safeParseToBigInt(sortedTickData[i].liquidityNet)
    const currentTickProcessed: TickProcessed = {
      liquidityActive: previousTickProcessed.liquidityActive,
      tick,
      liquidityNet: tickData,
      price0: tickToPrice(token0, token1, tick).toFixed(PRICE_FIXED_DIGITS),
    }

    // Update the active liquidity.
    // If we are iterating ascending and we found an initialized tick we immediately apply
    // it to the current processed tick we are building.
    // If we are iterating descending, we don't want to apply the net liquidity until the following tick.
    if (ascending) {
      currentTickProcessed.liquidityActive = JSBI.add(previousTickProcessed.liquidityActive, tickData)
    } else if (!ascending && JSBI.notEqual(previousTickProcessed.liquidityNet, JSBI.BigInt(0))) {
      // We are iterating descending, so look at the previous tick and apply any net liquidity.
      currentTickProcessed.liquidityActive = JSBI.subtract(
        previousTickProcessed.liquidityActive,
        previousTickProcessed.liquidityNet
      )
    }

    processedTicks.push(currentTickProcessed)
    previousTickProcessed = currentTickProcessed
  }

  if (!ascending) {
    processedTicks = processedTicks.reverse()
  }

  return processedTicks
}
