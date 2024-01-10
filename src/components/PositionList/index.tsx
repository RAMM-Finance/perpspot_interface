import { Trans } from '@lingui/macro'
import { ButtonPrimary } from 'components/Button'
import PositionListItem from 'components/PositionListItem'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'
import { MEDIA_WIDTHS, ThemedText } from 'theme'
import { PositionDetails } from 'types/position'

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

const ToggleWrap = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const ToggleLabel = styled.button`
  cursor: pointer;
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.textPrimary};
  font-size: 1rem;
`

type PositionListProps = React.PropsWithChildren<{
  positions: PositionDetails[]
  setUserHideClosedPositions: any
  userHideClosedPositions: boolean
}>

export default function PositionList({
  positions,
  setUserHideClosedPositions,
  userHideClosedPositions,
}: PositionListProps) {
  return (
    <>
      <DesktopHeader>
        <div>
          <Trans>Your positions</Trans>
          {positions && ' (' + positions.length + ')'}
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
          to="/add/"
        >
          <Trans>Add New Position</Trans>
        </ButtonPrimary>
        <ToggleLabel
          id="desktop-hide-closed-positions"
          onClick={() => {
            setUserHideClosedPositions(!userHideClosedPositions)
          }}
        >
          {userHideClosedPositions ? (
            <ThemedText.BodyPrimary>
              <Trans>Show closed positions</Trans>
            </ThemedText.BodyPrimary>
          ) : (
            <ThemedText.BodyPrimary>
              <Trans>Hide closed positions</Trans>
            </ThemedText.BodyPrimary>
          )}
        </ToggleLabel>
      </DesktopHeader>
      <MobileHeader>
        <Trans>Your positions</Trans>
        <ToggleWrap>
          <ToggleLabel
            onClick={() => {
              setUserHideClosedPositions(!userHideClosedPositions)
            }}
          >
            {userHideClosedPositions ? (
              <ThemedText.BodyPrimary>
                <Trans>Show closed positions</Trans>
              </ThemedText.BodyPrimary>
            ) : (
              <ThemedText.BodyPrimary>
                <Trans>Hide closed positions</Trans>
              </ThemedText.BodyPrimary>
            )}
          </ToggleLabel>
        </ToggleWrap>
      </MobileHeader>
      {positions.map((p) => (
        <PositionListItem key={p.tokenId.toString()} {...p} />
      ))}
    </>
  )
}
