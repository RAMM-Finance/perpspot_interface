import { Trans } from '@lingui/macro'
import { Token } from '@uniswap/sdk-core'
import { PAGE_SIZE } from 'graphql/data/TopTokens'
import { useDefaultActiveTokens } from 'hooks/Tokens'
import { useAtomValue, useResetAtom } from 'jotai/utils'
import { ReactNode, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'
import { MarginPositionDetails } from 'types/lmtv2position'

import { TokenDataContainer } from '../comonStyle'
import { MAX_WIDTH_MEDIA_BREAKPOINT } from './constants'
import { filterStringAtom } from './state'
import { HeaderRow, LoadedRow, LoadingRow } from './TokenRow'
import { BigNumber as BN } from 'bignumber.js'

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

// function useSortedPositions(positions: MarginPositionDetails[] | undefined) {
//   const sortMethod = useAtomValue(sortMethodAtom)
//   const sortAscending = useAtomValue(sortAscendingAtom)

//   return useMemo(() => {
//     if (!positions) return undefined
//     let returnedPositions = positions
//     switch (sortMethod) {
//       case PositionSortMethod.REPAYTIME:
//         returnedPositions = positions.sort((a, b) => b.repayTime - a.repayTime)
//         break
//       case PositionSortMethod.REMAINING:
//         returnedPositions = positions.sort((a, b) => {
//           const now = moment()
//           const timeLeftB = moment.duration(moment.unix(Number(b.repayTime)).add(1, 'days').diff(now))

//           const premiumB =
//             b.premiumLeft.times(timeLeftB.asSeconds() / 86400).toNumber() < 0
//               ? 0
//               : b.premiumLeft.times(timeLeftB.asSeconds() / 86400).toNumber()

//           const timeLeftA = moment.duration(moment.unix(Number(a.repayTime)).add(1, 'days').diff(now))
//           const premiumA =
//             a.premiumLeft.times(timeLeftA.asSeconds() / 86400).toNumber() < 0
//               ? 0
//               : a.premiumLeft.times(timeLeftA.asSeconds() / 86400).toNumber()

//           return premiumB - premiumA
//         })
//     }

//     return sortAscending ? returnedPositions : returnedPositions.reverse()
//   }, [positions, sortMethod, sortAscending])
// }

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
          symbol1IncludesFilterString
        )
      })
    }
    return returnPositions
  }, [positions, lowercaseFilterString, tokens])
}

function useSelectPositions(positions?: MarginPositionDetails[]) {
  // const sortedPositions = useSortedPositions(positions)

  const filteredPositions = useFilteredPositions(positions)

  
  // console.log("POSITIONS")
  // console.log(positions)
  console.log(filteredPositions)
  return { filteredPositions: filteredPositions }
  // return { filteredPositions: positions }
}

export default function LeveragePositionsTable({
  positions,
  loading,
}: {
  positions?: MarginPositionDetails[]
  loading?: boolean
}) {
  // const chainName = validateUrlChainParam(useParams<{ chainName?: string }>().chainName)
  const resetFilterString = useResetAtom(filterStringAtom)
  const location = useLocation()
  // console.log('----posiitons---------', positions, loading)
  const { filteredPositions } = useSelectPositions(positions)
  useEffect(() => {
    resetFilterString()
  }, [location, resetFilterString])
  /* loading and error state */

  // return (
  //   <GridContainer>
  //     <HeaderRow />
  //   </GridContainer>
  // )

  if (loading) {
    return <LoadingTokenTable rowCount={3} />
  } else if (!positions || !filteredPositions || filteredPositions?.length == 0) {
    return <NoTokensState message={<Trans>No positions found</Trans>} />
  } else {
    return (
      <GridContainer>
        <HeaderRow />
        <TokenDataContainer>
          {filteredPositions?.map((position) => (
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
