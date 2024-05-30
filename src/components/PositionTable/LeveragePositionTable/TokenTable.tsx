import { Trans } from '@lingui/macro'
import { Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { unsupportedChain } from 'components/NavBar/ChainSelector'
import { PAGE_SIZE } from 'graphql/data/TopTokens'
import { useDefaultActiveTokens } from 'hooks/Tokens'
import { useAtomValue, useResetAtom } from 'jotai/utils'
import { ReactNode, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppPoolOHLC } from 'state/application/hooks'
import styled from 'styled-components/macro'
import { MarginPositionDetails } from 'types/lmtv2position'

import { TokenDataContainer } from '../comonStyle'
import { MAX_WIDTH_MEDIA_BREAKPOINT } from './constants'
import { filterStringAtom, PositionSortMethod, sortAscendingAtom, sortMethodAtom } from './state'
import { getPoolId, HeaderRow, LoadedRow, LoadingRow, positionEntryPrice } from './TokenRow'

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  /* max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT}; */
  background-color: ${({ theme }) => theme.backgroundSurface};
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: nowrap;
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

const LoadingRows = ({ rowCount }: { rowCount: number }) => (
  <>
    {Array(rowCount)
      .fill(null)
      .map((_, index) => {
        return <LoadingRow key={index} first={index === 0} last={index === rowCount - 1} />
      })}
  </>
)

const FilterWrapper = styled.div`
  display: flex;
  margin: 8px 0;
`

function LoadingTokenTable({ rowCount = PAGE_SIZE }: { rowCount?: number }) {
  return (
    <GridContainer>
      <HeaderRow />
      <TokenDataContainer>
        <LoadingRows rowCount={rowCount} />
      </TokenDataContainer>
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
  const poolPriceData = useAppPoolOHLC()
  const { chainId } = useWeb3React()
  return useMemo(() => {
    if (!positions || !chainId) return undefined
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
          const poolPriceDataA = poolPriceData[chainId][getPoolId(a.poolKey.token0, a.poolKey.token1, a.poolKey.fee)]
          if (!poolPriceDataA) return 0
          const { priceNow: aPriceNow, token0IsBase: aToken0IsBase } = poolPriceDataA
          const poolPriceDataB = poolPriceData[chainId][getPoolId(b.poolKey.token0, b.poolKey.token1, b.poolKey.fee)]
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
          const poolPriceDataA = poolPriceData[chainId][getPoolId(a.poolKey.token0, a.poolKey.token1, a.poolKey.fee)]
          if (!poolPriceDataA) return 0
          const { priceNow: aPriceNow, token0IsBase: aToken0IsBase } = poolPriceDataA
          const poolPriceDataB = poolPriceData[chainId][getPoolId(b.poolKey.token0, b.poolKey.token1, b.poolKey.fee)]
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

export default function LeveragePositionsTable({
  positions,
  loading,
}: {
  positions?: MarginPositionDetails[]
  loading?: boolean
}) {
  const { chainId } = useWeb3React()
  // const chainName = validateUrlChainParam(useParams<{ chainName?: string }>().chainName)
  const resetFilterString = useResetAtom(filterStringAtom)
  const location = useLocation()
  // console.log('----posiitons---------', positions, loading)
  const { sortedPositions } = useSelectPositions(positions)
  useEffect(() => {
    resetFilterString()
  }, [location, resetFilterString])

  if (!chainId) {
    return null
  }

  if (unsupportedChain(chainId) || loading) {
    return <NoTokensState message={<Trans>No positions found</Trans>} />
  }

  if (!positions || !sortedPositions || sortedPositions?.length == 0) {
    return <NoTokensState message={<Trans>No positions found</Trans>} />
  } else {
    return (
      <GridContainer>
        <HeaderRow />
        <TokenDataContainer>
          {sortedPositions?.map((position) => (
            <LoadedRow
              key={
                position.poolKey.token0 +
                '-' +
                position.poolKey.token1 +
                '-' +
                position.poolKey.fee.toString() +
                '-' +
                position.isToken0
              }
              position={position}
            />
          ))}
        </TokenDataContainer>
      </GridContainer>
    )
  }
}
