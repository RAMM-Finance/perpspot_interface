import { Trans } from '@lingui/macro'
import { Token } from '@uniswap/sdk-core'
import { TickMath } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { unsupportedChain } from 'components/NavBar/ChainSelector'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { useDefaultActiveTokens } from 'hooks/Tokens'
import { getPoolAddress } from 'hooks/usePoolsOHLC'
import { useAllPoolAndTokenPriceData } from 'hooks/useUserPriceData'
import { useAtomValue } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import JSBI from 'jsbi'
import { ReactNode, useCallback, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { usePoolKeyList } from 'state/application/hooks'
import { useMarginTradingActionHandlers } from 'state/marginTrading/hooks'
import { useCurrentPool, useSetCurrentPool } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { MarginPositionDetails, PoolKey } from 'types/lmtv2position'
import { Q192 } from 'utils/lmtSDK/internalConstants'
import { getPoolId } from 'utils/lmtSDK/LmtIds'
import { useAccount, useChainId } from 'wagmi'

import { TokenDataContainer } from '../comonStyle'
import { filterStringAtom, PositionSortMethod, sortAscendingAtom, sortMethodAtom } from './state'
import { HeaderRow, LoadedRow, positionEntryPrice, PositionRowProps } from './TokenRow'
const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: scroll;
  background-color: ${({ theme }) => theme.backgroundSurface};
  justify-content: flex-start;
  align-items: flex-start;
  /* min-width: 700px; */
`

const NoTokenDisplay = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 60px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 16px;
  font-weight: 500;
  align-items: center;
  padding: 0px 28px;
  gap: 8px;
`

function NoTokensState({ message }: { message: ReactNode }) {
  return (
    <GridContainer>
      <NoTokenDisplay>{message}</NoTokenDisplay>
    </GridContainer>
  )
}

function findCurrency(address: string | undefined, tokens: { [address: string]: Token } | undefined) {
  if (!address || !tokens) return undefined
  return tokens[address]
}

function useFilteredPositions(positions: MarginPositionDetails[] | undefined) {
  const filterString = useAtomValue(filterStringAtom)
  const lowercaseFilterString = useMemo(() => filterString.toLowerCase(), [filterString])
  const tokens = useDefaultActiveTokens()

  return useMemo(() => {
    if (!positions) return undefined
    let returnPositions = positions
    if (lowercaseFilterString) {
      returnPositions = returnPositions?.filter((position) => {
        const token0 = findCurrency(position?.poolKey.token0, tokens)
        const token1 = findCurrency(position?.poolKey.token1, tokens)

        const token0Symbol = token0?.symbol ? token0?.symbol?.toLowerCase() : ''
        const token1Symbol = token1?.symbol ? token1?.symbol?.toLowerCase() : ''

        const pair = token0Symbol + token1Symbol

        const pairString = lowercaseFilterString.replace(/\/|-| /g, '')
        const pairIncludesFilterString = pair?.includes(pairString)

        const addressIncludesFilterString = position?.poolKey.token0?.toLowerCase().includes(lowercaseFilterString)
        const name0IncludesFilterString = token0?.name?.toLowerCase().includes(lowercaseFilterString)
        const symbol0IncludesFilterString = token0?.symbol?.toLowerCase().includes(lowercaseFilterString)
        const name1IncludesFilterString = token1?.name?.toLowerCase().includes(lowercaseFilterString)
        const symbol1IncludesFilterString = token1?.symbol?.toLowerCase().includes(lowercaseFilterString)
        return (
          name0IncludesFilterString ||
          symbol0IncludesFilterString ||
          addressIncludesFilterString ||
          name1IncludesFilterString ||
          symbol1IncludesFilterString ||
          pairIncludesFilterString
        )
      })
    }
    return returnPositions
  }, [positions, lowercaseFilterString, tokens])
}

function useSortedPositions(positions: MarginPositionDetails[] | undefined) {
  const sortMethod = useAtomValue(sortMethodAtom)
  const sortAscending = useAtomValue(sortAscendingAtom)
  const { pools: poolPriceData } = useAllPoolAndTokenPriceData()
  const chainId = useChainId()
  return useMemo(() => {
    if (!positions || !chainId || !poolPriceData) return undefined
    if (sortMethod === PositionSortMethod.VALUE) {
      if (sortAscending) {
        return positions.sort((a, b) => b.totalPosition.toNumber() - a.totalPosition.toNumber())
      } else {
        return positions.sort((a, b) => a.totalPosition.toNumber() - b.totalPosition.toNumber())
      }
    } else if (sortMethod === PositionSortMethod.COLLATERAL) {
      if (sortAscending) {
        return positions.sort((a, b) => b.totalDebtInput.toNumber() - a.totalDebtInput.toNumber())
      } else {
        return positions.sort((a, b) => a.totalDebtInput.toNumber() - b.totalDebtInput.toNumber())
      }
    } else if (sortMethod === PositionSortMethod.PNL) {
      if (sortAscending) {
        return positions.sort((a, b) => {
          const aEntry = positionEntryPrice(a)
          const bEntry = positionEntryPrice(b)
          const poolPriceDataA =
            poolPriceData[
              getPoolAddress(a.poolKey.token0, a.poolKey.token1, a.poolKey.fee, V3_CORE_FACTORY_ADDRESSES[chainId])
            ]
          if (!poolPriceDataA) return 0
          const { priceNow: aPriceNow, token0IsBase: aToken0IsBase } = poolPriceDataA
          const poolPriceDataB =
            poolPriceData[
              getPoolAddress(b.poolKey.token0, b.poolKey.token1, b.poolKey.fee, V3_CORE_FACTORY_ADDRESSES[chainId])
            ]
          if (!poolPriceDataB) return 0
          const { priceNow: bPriceNow, token0IsBase: bToken0IsBase } = poolPriceDataB

          const aToken0Price = aToken0IsBase ? aPriceNow : 1 / aPriceNow
          const bToken0Price = bToken0IsBase ? bPriceNow : 1 / bPriceNow
          const aPrice = a.isToken0 ? aToken0Price : 1 / aToken0Price
          const bPrice = b.isToken0 ? bToken0Price : 1 / bToken0Price

          const aPnl = a.totalPosition.toNumber() * (aPrice - aEntry.toNumber())
          const bPnl = b.totalPosition.toNumber() * (bPrice - bEntry.toNumber())

          return bPnl - aPnl
        })
      } else {
        return positions.sort((a, b) => {
          const aEntry = positionEntryPrice(a)
          const bEntry = positionEntryPrice(b)
          const poolPriceDataA =
            poolPriceData[
              getPoolAddress(a.poolKey.token0, a.poolKey.token1, a.poolKey.fee, V3_CORE_FACTORY_ADDRESSES[chainId])
            ]
          if (!poolPriceDataA) return 0
          const { priceNow: aPriceNow, token0IsBase: aToken0IsBase } = poolPriceDataA
          const poolPriceDataB =
            poolPriceData[
              getPoolAddress(b.poolKey.token0, b.poolKey.token1, b.poolKey.fee, V3_CORE_FACTORY_ADDRESSES[chainId])
            ]
          if (!poolPriceDataB) return 0
          const { priceNow: bPriceNow, token0IsBase: bToken0IsBase } = poolPriceDataB
          const aToken0Price = aToken0IsBase ? aPriceNow : 1 / aPriceNow
          const bToken0Price = bToken0IsBase ? bPriceNow : 1 / bPriceNow
          const aPrice = a.isToken0 ? aToken0Price : 1 / aToken0Price
          const bPrice = b.isToken0 ? bToken0Price : 1 / bToken0Price

          const aPnl = a.totalPosition.toNumber() * (aPrice - aEntry.toNumber())
          const bPnl = b.totalPosition.toNumber() * (bPrice - bEntry.toNumber())

          return aPnl - bPnl
        })
      }
    } else if (sortMethod === PositionSortMethod.RATE) {
      if (sortAscending) {
        return positions.sort((a, b) => b.apr.toNumber() - a.apr.toNumber())
      } else {
        return positions.sort((a, b) => a.apr.toNumber() - b.apr.toNumber())
      }
    }
    return positions
  }, [sortMethod, sortAscending, positions, chainId, poolPriceData])
}

function useSelectPositions(positions?: MarginPositionDetails[]) {
  const filteredPositions = useFilteredPositions(positions)
  const sortedPositions = useSortedPositions(filteredPositions)
  return { sortedPositions }
}

function computePrice(tick: number, decimals0: number, decimals1: number) {
  const sqrtPrice = TickMath.getSqrtRatioAtTick(tick)
  const price = JSBI.multiply(sqrtPrice, sqrtPrice)
  const priceBN = new BN(price.toString()).div(Q192.toString())
  return priceBN.shiftedBy(decimals0 - decimals1)
}

export default function LeveragePositionsTable({
  positions,
  loading,
}: {
  positions?: MarginPositionDetails[]
  loading?: boolean
}) {
  const chainId = useChainId()
  const account = useAccount().address
  const resetFilterString = useResetAtom(filterStringAtom)
  const location = useLocation()
  const { sortedPositions } = useSelectPositions(positions)
  useEffect(() => {
    resetFilterString()
  }, [location, resetFilterString])
  const { poolMap } = usePoolKeyList()
  // console.log("TICK IN TOKEN TABLE", poolMap?.['0x4200000000000000000000000000000000000006-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913-500'].tick)
  const { pools: poolPrices, tokens, loading: priceLoading } = useAllPoolAndTokenPriceData()
  const currentPool = useCurrentPool()
  const setCurrentPool = useSetCurrentPool()
  const poolId = currentPool?.poolId
  const { onPremiumCurrencyToggle, onMarginChange, onLeverageFactorChange, onSetMarginInPosToken, onSetIsSwap } =
    useMarginTradingActionHandlers()
  const handlePoolSelect = useCallback(
    (poolKey: PoolKey, symbol0: string, symbol1: string, token0IsBase: boolean, isToken0: boolean) => {
      return (e: any) => {
        e.stopPropagation()
        const id = getPoolId(poolKey.token0, poolKey.token1, poolKey.fee)
        if (poolId !== id && id) {
          localStorage.removeItem('defaultInputToken')
          onMarginChange('')
          onSetIsSwap(false)
          onPremiumCurrencyToggle(false)
          onSetMarginInPosToken(false)
          onLeverageFactorChange('')
          setCurrentPool(id, isToken0, token0IsBase, symbol0, symbol1)
        }
      }
    },
    [
      setCurrentPool,
      poolId,
      onMarginChange,
      onPremiumCurrencyToggle,
      onLeverageFactorChange,
      onSetIsSwap,
      onSetMarginInPosToken,
    ]
  )

  const details: PositionRowProps[] = useMemo(() => {
    if (
      !sortedPositions ||
      !poolMap ||
      !tokens ||
      !poolPrices ||
      priceLoading ||
      !Object.keys(tokens).length ||
      !Object.keys(poolMap).length ||
      !account
    ) {
      return []
    }

    /**
     * PnL, PnLPercentage, PnLUsd, handlePoolSelect
     */
    const result = sortedPositions.map((position) => {
      try {
        const poolId = getPoolId(position.poolKey.token0, position.poolKey.token1, position.poolKey.fee)

        if (!poolPrices[poolId] || !poolMap[poolId]) {
          throw new Error('missing data')
        }

        const { token0IsBase } = poolPrices[poolId]
        const {
          marginInPosToken,
          totalPosition,
          margin,
          totalDebtInput,
          premiumOwed,
          apr,
          premiumLeft,
          premiumDeposit,
        } = position
        const { symbol0, symbol1, tick, decimals0, decimals1 } = poolMap[poolId]

        const token0Price = computePrice(tick, decimals0, decimals1)
        const currentPrice = position.isToken0 ? new BN(token0Price) : new BN(1).div(token0Price)
        const inputToken = position.isToken0 ? position.poolKey.token1 : position.poolKey.token0
        const outputToken = position.isToken0 ? position.poolKey.token0 : position.poolKey.token1
        const outputCurrencySymbol = position.isToken0 ? symbol0 : symbol1
        const inputCurrencySymbol = position.isToken0 ? symbol1 : symbol0
        const inputTokenUsdPrice = new BN(tokens[inputToken.toLowerCase()].usdPrice)
        const outputTokenUsdPrice = new BN(tokens[outputToken.toLowerCase()].usdPrice)
        const entryPrice = positionEntryPrice(position)
        const isWethUsdc =
          (symbol0.toLowerCase() === 'weth' && symbol1.toLowerCase() === 'usdc') ||
          (symbol1.toLowerCase() === 'usdc' && symbol0.toLowerCase() === 'weth')

        const leverageFactor = marginInPosToken ? totalPosition.div(margin) : margin.plus(totalDebtInput).div(margin)
        const ratePerHour = Number(apr.toNumber()) / 365 / 24
        const premPerHour = Number(totalDebtInput) * ratePerHour

        const hours = Number(premiumLeft) / premPerHour

        const estimatedTimeToClose = Math.round(hours * 100) / 100

        // PnL computation
        let pnlPercentage
        let pnlUsd
        let pnlPremiumsUsd
        let premiumsPaid
        let pnLWithPremiums
        let pnl
        if (marginInPosToken) {
          const initialPnL = totalPosition.minus(totalDebtInput.div(currentPrice)).minus(margin)
          if (!isWethUsdc) {
            pnlPercentage = initialPnL.times(0.9).div(margin).times(100).toFixed(2)
          } else {
            pnlPercentage = initialPnL.div(margin).times(100).toFixed(2)
          }
          pnl =
            new BN(1).div(currentPrice).times(initialPnL).isGreaterThan(0) && !isWethUsdc
              ? initialPnL.times(0.9)
              : initialPnL
          pnLWithPremiums =
            new BN(1).div(currentPrice).times(initialPnL).isGreaterThan(0) && !isWethUsdc
              ? initialPnL.minus(premiumOwed.times(new BN(1).div(currentPrice))).times(0.9)
              : initialPnL.minus(premiumOwed.times(new BN(1).div(currentPrice)))
          pnlUsd = pnl.times(outputTokenUsdPrice)
          pnlPremiumsUsd = pnLWithPremiums.times(outputTokenUsdPrice)
          premiumsPaid = premiumOwed.times(inputTokenUsdPrice)
        } else {
          const initialPnL = totalPosition.times(currentPrice.minus(entryPrice))
          if (!isWethUsdc) {
            pnlPercentage = initialPnL.times(0.9).div(margin).times(100).toFixed(2)
          } else {
            pnlPercentage = initialPnL.div(margin).times(100).toFixed(2)
          }

          pnl = initialPnL.isGreaterThan(0) && !isWethUsdc ? initialPnL.times(0.9) : initialPnL
          pnLWithPremiums =
            initialPnL.isGreaterThan(0) && !isWethUsdc
              ? initialPnL.minus(premiumOwed).times(0.9)
              : initialPnL.minus(premiumOwed)
          pnlUsd = pnl.times(inputTokenUsdPrice)
          pnlPremiumsUsd = pnLWithPremiums.times(inputTokenUsdPrice)
          premiumsPaid = premiumOwed.times(inputTokenUsdPrice)
        }

        return {
          positionKey: {
            poolKey: position.poolKey,
            isToken0: position.isToken0,
            isBorrow: false,
            trader: account,
          },
          entryPrice: positionEntryPrice(position),
          currentPrice: new BN(currentPrice),
          totalPosition: position.totalPosition,
          totalDebt: position.margin,
          inputTokenUsdPrice,
          outputTokenUsdPrice,
          pnlUsd,
          pnlPremiumsUsd,
          pnlPercentage,
          leverageFactor,
          marginInPosToken,
          outputCurrencySymbol,
          inputCurrencySymbol,
          margin,
          apr,
          estimatedTimeToClose,
          premiumsPaid,
          premiumLeft,
          pnLWithPremiums,
          premiumDeposited: premiumDeposit,
          handlePoolSelect: handlePoolSelect(position.poolKey, symbol0, symbol1, token0IsBase, position.isToken0),
          pnl,
        }
      } catch (err) {
        console.log('zeke:', err)
        return undefined
      }
    })
    return result.filter((x) => x !== undefined) as PositionRowProps[]
  }, [tokens, poolMap, poolPrices, sortedPositions, account])

  if (!chainId || unsupportedChain(chainId) || loading) {
    return <NoTokensState message={<Trans>No positions found</Trans>} />
  }

  if (!positions || !sortedPositions || sortedPositions?.length == 0) {
    return <NoTokensState message={<Trans>No positions found</Trans>} />
  } else {
    return (
      <GridContainer>
        <HeaderRow />
        <TokenDataContainer>
          {details?.map((position) => {
            const { token0, token1, fee } = position.positionKey.poolKey

            return (
              <LoadedRow key={`${getPoolId(token0, token1, fee)}-${position.positionKey.isToken0}`} {...position} />
            )
          })}
        </TokenDataContainer>
      </GridContainer>
    )
  }
}
