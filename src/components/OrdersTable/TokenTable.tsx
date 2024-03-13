import { Trans } from '@lingui/macro'
import { Token } from '@uniswap/sdk-core'
import { PAGE_SIZE } from 'graphql/data/TopTokens'
import { useResetAtom } from 'jotai/utils'
import { ReactNode, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'
import { MarginLimitOrder } from 'types/lmtv2position'

import { TokenDataContainer } from './comonStyle'
import { MAX_WIDTH_MEDIA_BREAKPOINT } from './constants'
import { filterStringAtom } from './state'
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

// function useFilteredOrders(orders: MarginOrderDetails[] | undefined) {
//   const filterString = useAtomValue(filterStringAtom)
//   const lowercaseFilterString = useMemo(() => filterString.toLowerCase(), [filterString])
//   const tokens = useDefaultActiveTokens()

//   return useMemo(() => {
//     if (!orders) return undefined
//     let returnOrders = orders
//     if (lowercaseFilterString) {
//       returnOrders = returnOrders?.filter((order) => {
//         const token0 = findCurrency(order?.poolKey.token0Address, tokens)
//         const token1 = findCurrency(order?.poolKey.token1Address, tokens)
//         const addressIncludesFilterString = order?.poolKey.token0Address?.toLowerCase().includes(lowercaseFilterString)
//         const name0IncludesFilterString = token0?.name?.toLowerCase().includes(lowercaseFilterString)
//         const symbol0IncludesFilterString = token0?.symbol?.toLowerCase().includes(lowercaseFilterString)
//         const name1IncludesFilterString = token1?.name?.toLowerCase().includes(lowercaseFilterString)
//         const symbol1IncludesFilterString = token1?.symbol?.toLowerCase().includes(lowercaseFilterString)
//         return (
//           name0IncludesFilterString ||
//           symbol0IncludesFilterString ||
//           addressIncludesFilterString ||
//           name1IncludesFilterString ||
//           symbol1IncludesFilterString
//         )
//       })
//     }
//     return returnOrders
//   }, [orders, lowercaseFilterString, tokens])
// }

// function useSelectOrders(orders?: MarginOrderDetails[]) {
//   // const sortedPositions = useSortedPositions(positions)

//   // const filteredPositions = useFilteredPositions(sortedPositions)
//   return { filteredOrders: orders }
// }

export function OrdersTable({ orders, loading }: { orders?: MarginLimitOrder[]; loading?: boolean }) {
  // const chainName = validateUrlChainParam(useParams<{ chainName?: string }>().chainName)

  const resetFilterString = useResetAtom(filterStringAtom)
  const location = useLocation()
  // const { filteredOrders } = useSelectOrders(orders)
  const filteredOrders = orders
  useEffect(() => {
    resetFilterString()
  }, [location, resetFilterString])
  // const { tokens, tokenSortRank, loadingTokens, sparklines } = useTopTokens(chainName)

  /* loading and error state */
  if (loading) {
    return <LoadingTokenTable rowCount={1} />
  } else if (!filteredOrders || filteredOrders?.length == 0) {
    return <NoTokensState message={<Trans>No orders found</Trans>} />
  } else {
    return (
      <GridContainer>
        <HeaderRow />
        <TokenDataContainer>
          {filteredOrders?.map((order) => (
            <LoadedRow
              key={
                order.key.token0 +
                '-' +
                order.key.token1 +
                '-' +
                order.key.fee.toString() +
                '-' +
                order.positionIsToken0
              }
              order={order}
            />
          ))}
        </TokenDataContainer>
      </GridContainer>
    )
  }
}
