import { Trans } from '@lingui/macro'
import { Token } from '@uniswap/sdk-core'
import { PAGE_SIZE } from 'graphql/data/TopTokens'
import { useDefaultActiveTokens } from 'hooks/Tokens'
import { useAtomValue, useResetAtom } from 'jotai/utils'
import moment from 'moment'
import { ReactNode, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'
import { LimitlessPositionDetails } from 'types/leveragePosition'

import { TokenDataContainer } from '../comonStyle'
import { MAX_WIDTH_MEDIA_BREAKPOINT } from './constants'
import { filterStringAtom, PositionSortMethod, sortAscendingAtom, sortMethodAtom } from './state'
import { HeaderRow, LoadedRow, LoadingRow } from './TokenRow'

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  /* max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT}; */
  background-color: ${({ theme }) => theme.backgroundSurface};
  justify-content: flex-start;
  align-items: flex-start;
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
      <HeaderRow />
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

function useSortedPositions(positions: LimitlessPositionDetails[] | undefined) {
  const sortMethod = useAtomValue(sortMethodAtom)
  const sortAscending = useAtomValue(sortAscendingAtom)

  return useMemo(() => {
    if (!positions) return undefined
    let returnedPositions = positions
    switch (sortMethod) {
      case PositionSortMethod.REPAYTIME:
        returnedPositions = positions.sort((a, b) => b.repayTime - a.repayTime)
        break
      case PositionSortMethod.REMAINING:
        returnedPositions = positions.sort((a, b) => {
          const now = moment()
          const timeLeftB = moment.duration(moment.unix(Number(b.repayTime)).add(1, 'days').diff(now))

          const premiumB =
            b.unusedPremium.multipliedBy(timeLeftB.asSeconds() / 86400).toNumber() < 0
              ? 0
              : b.unusedPremium.multipliedBy(timeLeftB.asSeconds() / 86400).toNumber()

          const timeLeftA = moment.duration(moment.unix(Number(a.repayTime)).add(1, 'days').diff(now))
          const premiumA =
            a.unusedPremium.multipliedBy(timeLeftA.asSeconds() / 86400).toNumber() < 0
              ? 0
              : a.unusedPremium.multipliedBy(timeLeftA.asSeconds() / 86400).toNumber()

          return premiumB - premiumA
        })
        break
    }

    return sortAscending ? returnedPositions : returnedPositions.reverse()
  }, [positions, sortMethod, sortAscending])
}

function findCurrency(address: string | undefined, tokens: { [address: string]: Token } | undefined) {
  if (!address || !tokens) return undefined
  return tokens[address]
}

function useFilteredPositions(positions: LimitlessPositionDetails[] | undefined) {
  const filterString = useAtomValue(filterStringAtom)
  const lowercaseFilterString = useMemo(() => filterString.toLowerCase(), [filterString])
  const tokens = useDefaultActiveTokens()

  return useMemo(() => {
    if (!positions) return undefined
    let returnPositions = positions
    if (lowercaseFilterString) {
      returnPositions = returnPositions?.filter((position) => {
        const token0 = findCurrency(position?.token0Address, tokens)
        const token1 = findCurrency(position?.token1Address, tokens)
        const addressIncludesFilterString = position?.token0Address?.toLowerCase().includes(lowercaseFilterString)
        const name0IncludesFilterString = token0?.name?.toLowerCase().includes(lowercaseFilterString)
        const symbol0IncludesFilterString = token0?.symbol?.toLowerCase().includes(lowercaseFilterString)
        const name1IncludesFilterString = token1?.name?.toLowerCase().includes(lowercaseFilterString)
        const symbol1IncludesFilterString = token1?.symbol?.toLowerCase().includes(lowercaseFilterString)
        return (
          name0IncludesFilterString ||
          symbol0IncludesFilterString ||
          addressIncludesFilterString ||
          name1IncludesFilterString ||
          symbol1IncludesFilterString
        )
      })
    }
    return returnPositions
  }, [positions, lowercaseFilterString, tokens])
}

function useSelectPositions(positions?: LimitlessPositionDetails[]) {
  const sortedPositions = useSortedPositions(positions)

  const filteredPositions = useFilteredPositions(sortedPositions)
  return { filteredPositions }
}

export default function PositionsTable({
  positions,
  loading,
}: {
  positions?: LimitlessPositionDetails[]
  loading: boolean
}) {
  // const chainName = validateUrlChainParam(useParams<{ chainName?: string }>().chainName)

  const resetFilterString = useResetAtom(filterStringAtom)
  const location = useLocation()

  const { filteredPositions } = useSelectPositions(positions)

  useEffect(() => {
    resetFilterString()
  }, [location, resetFilterString])
  // const { tokens, tokenSortRank, loadingTokens, sparklines } = useTopTokens(chainName)

  /* loading and error state */
  if (loading) {
    return <LoadingTokenTable rowCount={1} />
  } else if (!filteredPositions || filteredPositions?.length == 0) {
    return <NoTokensState message={<Trans>No positions found</Trans>} />
  } else {
    return (
      <GridContainer>
        <HeaderRow />
        <TokenDataContainer>
          {filteredPositions?.map(
            (position, index) => position?.tokenId && <LoadedRow key={position.tokenId} position={position} />
          )}
        </TokenDataContainer>
      </GridContainer>
    )
  }
}
