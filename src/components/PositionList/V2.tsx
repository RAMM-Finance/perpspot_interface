import { Trans } from '@lingui/macro'
import { ButtonPrimary } from 'components/Button'
import PositionListItem from 'components/PositionListItem'
import { useAllPoolAndTokenPriceData } from 'hooks/useUserPriceData'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'
import { MEDIA_WIDTHS } from 'theme'
import { PositionDetails, V2PositionDetails } from 'types/position'

const DesktopHeader = styled.div`
  display: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.backgroundOutline};

  @media screen and (min-width: ${MEDIA_WIDTHS.deprecated_upToSmall}px) {
    align-items: center;
    display: flex;
    justify-content: space-between;
    & > div:last-child {
      text-align: right;
      margin-right: 12px;
    }
  }
`

const MobileHeader = styled.div`
  font-weight: medium;
  padding: 8px;
  font-weight: 500;
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.backgroundOutline};

  @media screen and (min-width: ${MEDIA_WIDTHS.deprecated_upToSmall}px) {
    display: none;
  }

  @media screen and (max-width: ${MEDIA_WIDTHS.deprecated_upToExtraSmall}px) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
`

type PositionListProps = React.PropsWithChildren<{
  v2positions: V2PositionDetails[]
  setUserHideClosedPositions: any
  userHideClosedPositions: boolean
}>

export default function V2PositionList({ v2positions }: PositionListProps) {
  const { tokens: usdPriceData } = useAllPoolAndTokenPriceData()

  return (
    <>
      <DesktopHeader>
        <div>
          <Trans>Your V2 positions</Trans>
          {v2positions && ' (' + v2positions.length + ')'}
        </div>
        <ButtonPrimary
          style={{
            marginLeft: '20px',
            padding: '.5rem',
            width: 'fit-content',
            fontSize: '0.8rem',
            borderRadius: '10px',
            height: '30px',
            lineHeight: '1',
          }}
          data-cy="join-pool-button"
          id="join-pool-button"
          as={Link}
          to="/add/v2"
        >
          <Trans>Add New Position</Trans>
        </ButtonPrimary>
      </DesktopHeader>
      <MobileHeader>
        <Trans>Your positions</Trans>
        <ButtonPrimary
          style={{
            marginLeft: '20px',
            padding: '.5rem',
            width: 'fit-content',
            fontSize: '0.8rem',
            borderRadius: '10px',
            height: '30px',
            lineHeight: '1',
          }}
          data-cy="join-pool-button"
          id="join-pool-button"
          as={Link}
          to="/add/v2"
        >
          <Trans>Add New Position</Trans>
        </ButtonPrimary>
      </MobileHeader>
      {v2positions.map((p) => (
        <PositionListItem
          key={p.tokenId.toString()}
          token0={p.token0}
          token1={p.token1}
          tokenId={p.tokenId}
          fee={p.fee}
          liquidity={p.liquidity}
          tickLower={p.tickLower}
          tickUpper={p.tickUpper}
          usdPriceData={usdPriceData ?? undefined}
          itemLink={`/lp/v2/${p.tokenId}`}
        />
      ))}
    </>
  )
}

export function V1PositionList({ positions }: { positions: PositionDetails[] }) {
  const { tokens: usdPriceData } = useAllPoolAndTokenPriceData()

  return (
    <>
      <DesktopHeader>
        <div>
          <Trans>Your V1 positions</Trans>
          {positions && ' (' + positions.length + ')'}
        </div>
      </DesktopHeader>
      <MobileHeader>
        <Trans>Your positions</Trans>
      </MobileHeader>
      {positions.map((p) => (
        <PositionListItem
          key={p.tokenId.toString()}
          token0={p.token0}
          token1={p.token1}
          tokenId={p.tokenId}
          fee={p.fee}
          liquidity={p.liquidity}
          tickLower={p.tickLower}
          tickUpper={p.tickUpper}
          usdPriceData={usdPriceData ?? undefined}
          itemLink={`/lp/v1/${p.tokenId}`}
        />
      ))}
    </>
  )
}
