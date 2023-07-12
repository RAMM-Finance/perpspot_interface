import { Trans } from '@lingui/macro'
import { PAGE_SIZE } from 'graphql/data/TopTokens'
import { validateUrlChainParam } from 'graphql/data/util'
import { ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components/macro'
import { LimitlessPositionDetails } from 'types/leveragePosition'

import { MAX_WIDTH_MEDIA_BREAKPOINT } from './constants'
import { HeaderRow, LoadedRow, LoadingRow } from './TokenRow'

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  // margin-top: 8px;
  width:100%;
  /* max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT}; */
  background-color: ${({ theme }) => theme.backgroundSurface};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  /* margin-left: auto;
  margin-right: auto; */
  padding: 20px 0;
  border-radius: 12px;
  border-top-left-radius: 0;
  justify-content: center;
  align-items: center;
  // border: 1px solid ${({ theme }) => theme.backgroundOutline};
`

const TokenDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
  width: 100%;
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

function LoadingTokenTable({ rowCount = PAGE_SIZE }: { rowCount?: number }) {
  return (
    <GridContainer>
      <HeaderRow/>
      <TokenDataContainer>
        <LoadingRows rowCount={rowCount} />
      </TokenDataContainer>
    </GridContainer>
  )
}

export default function PositionsTable({positions, loading}: {positions?: LimitlessPositionDetails[], loading: boolean}) {
  const chainName = validateUrlChainParam(useParams<{ chainName?: string }>().chainName)
  // const { tokens, tokenSortRank, loadingTokens, sparklines } = useTopTokens(chainName)

  /* loading and error state */
  if (loading || !positions) {
    return <LoadingTokenTable rowCount={1} />
  } else if (positions?.length == 0) {
    return <NoTokensState message={<Trans>No positions found</Trans>} />
  } else {
    return (
      <GridContainer>
        <HeaderRow />
        <TokenDataContainer>
          {positions?.map(
            (position, index) =>
            position?.tokenId && (
                <LoadedRow
                  key={position.tokenId}
                  position={position}
                />
              )
          )}
        </TokenDataContainer>
      </GridContainer>
      
    )
  }
}
