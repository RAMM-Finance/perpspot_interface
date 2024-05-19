import Column from 'components/Column'
import { formatWallet } from 'components/Leaderboard/LeaderboardTable'
import Row from 'components/Row'
import { CoinDetails } from 'pages/Launch'
import React, { Dispatch, SetStateAction, useCallback, useState } from 'react'
import styled from 'styled-components/macro'
import { BREAKPOINTS, ThemedText } from 'theme'
import { formatDollarAmount } from 'utils/formatNumbers'

import ItemImg from '../../assets/images/newItem7.webp'
import CoinDetailsModal from './CoinDetailsModal'

const CardDetailsWrapper = styled.div`
  position: relative;
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0px 0px 8px rgba(51, 53, 72, 0.04), 1px 2px 4px rgba(51, 53, 72, 0.12);
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  isolation: isolate;
  max-width: 400px;
`

const StyledActionButton = styled(ThemedText.BodySecondary)`
  position: absolute;
  display: flex;
  padding: 8px 0px;
  bottom: -32px;
  left: 8px;
  right: 8px;
  color: ${({ theme }) => theme.accentTextLightPrimary};
  background: ${({ theme }) => theme.accentAction};
  transition: ${({ theme }) =>
    `${theme.transition.duration.medium} ${theme.transition.timing.ease} bottom, ${theme.transition.duration.medium} ${theme.transition.timing.ease} visibility`};
  will-change: transform;
  border-radius: 8px;
  justify-content: center;
  font-weight: 600 !important;
  line-height: 16px;
  visibility: hidden;
  cursor: pointer;

  @media screen and (max-width: ${BREAKPOINTS.sm}px) {
    visibility: visible;
    bottom: 8px;
  }

  &:before {
    background-size: 100%;
    border-radius: inherit;

    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    content: '';
  }

  &:hover:before {
    background-color: ${({ theme }) => theme.stateOverlayHover};
  }

  &:active:before {
    background-color: ${({ theme }) => theme.stateOverlayPressed};
  }
`

const StyledDetailsContainer = styled(Column)`
  position: absolute;
  width: 100%;
  padding: 16px 8px 0px;
  justify-content: space-between;
  gap: 8px;
  height: 84px;
  background: ${({ theme }) => theme.backgroundSurface};
  will-change: transform;
  transition: ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.ease} transform`};

  @media screen and (max-width: ${BREAKPOINTS.sm}px) {
    height: 112px;
    transform: translateY(-28px);
  }
`

const StyledMediaImg = styled.img<{
  // imageLoading: boolean
  $aspectRatio?: string
  $hidden?: boolean
}>`
  width: 100%;
  /* aspect-ratio: ${({ $aspectRatio }) => $aspectRatio}; */
  aspect-ratio: 16/9;
  transition: ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.ease} transform`};
  will-change: transform;
  object-fit: contain;
  visibility: ${({ $hidden }) => ($hidden ? 'hidden' : 'visible')};
`

const StyledCardContainer = styled.div`
  position: relative;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.backgroundSurface};
  overflow: hidden;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  isolation: isolate;
  max-width: 250px;

  :after {
    content: '';
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    border-top: 1px solid;
    border-left: 1px solid;
    border-bottom: 1px solid;

    border-radius: 12px;
    border-color: ${({ theme }) => theme.backgroundOutline};
    pointer-events: none;
    transition: ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.ease} border`};
    will-change: border;
  }

  :hover {
    ${StyledActionButton} {
      visibility: visible;
      bottom: 8px;
    }

    ${StyledDetailsContainer} {
      height: 112px;
      transform: translateY(-28px);
    }
    ${StyledMediaImg} {
      transform: scale(1.15);
    }
  }
`

const ItemImgContainer = styled.div`
  position: relative;
  pointer-events: auto;
  &:hover {
    opacity: theme.opacity.enabled;
  }
  cursor: pointer;
`
const StyledMediaContainer = styled(Row)`
  overflow: hidden;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
`

const StyledDetailsRelativeContainer = styled.div`
  position: relative;
  height: 50px;
`

const StyledInfoContainer = styled(Column)`
  gap: 4px;
  overflow: hidden;
  width: 100%;
  padding: 0px 8px;
  height: 48px;
`

const StyledPrimaryDetails = styled(Row)`
  width: 100%;
  justify-content: space-between;
  /* justify-items: center; */
  overflow: hidden;
  white-space: nowrap;
  gap: 8px;
`

const PrimaryInfoContainer = styled(ThemedText.BodyPrimary)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: 600 !important;
  line-height: 20px;
`

const DetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  margin-left: 10px;
`
const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: 40px;
  overflow-y: scroll;
`
interface CoinBoxProps {
  coinDetails: CoinDetails | undefined
  setBlur: Dispatch<SetStateAction<boolean>>
}

const CoinBox = ({ coinDetails, setBlur }: CoinBoxProps) => {
  const [showModal, setShowModal] = useState(false)
  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setBlur(false)
  }, [])

  return (
    <>
      <CoinDetailsModal fakeCoin={coinDetails} isOpen={showModal} handleCloseModal={handleCloseModal} />
      <CardDetailsWrapper>
        <StyledCardContainer>
          <ItemImgContainer>
            <StyledMediaContainer>
              <StyledMediaImg src={typeof coinDetails?.image === 'string' ? coinDetails.image : ItemImg} />
            </StyledMediaContainer>
          </ItemImgContainer>
          <StyledDetailsRelativeContainer>
            <StyledDetailsContainer>
              <StyledInfoContainer>
                <Row gap="8" justifyContent="space-between">
                  <StyledPrimaryDetails>
                    <PrimaryInfoContainer>{`${coinDetails?.name}(ticker:${coinDetails?.ticker})`}</PrimaryInfoContainer>
                  </StyledPrimaryDetails>
                </Row>
                <Row justifyContent="space-between"></Row>
              </StyledInfoContainer>
            </StyledDetailsContainer>
          </StyledDetailsRelativeContainer>
          <StyledActionButton
            onClick={() => {
              setShowModal(true)
              setBlur(true)
            }}
          >
            More Details
          </StyledActionButton>
        </StyledCardContainer>
        <DetailsWrapper>
          <DetailSection>
            <ThemedText.BodySmall fontWeight={900}>Created By:</ThemedText.BodySmall>
            <ThemedText.BodySmall color="textSecondary">{formatWallet(coinDetails?.account)}</ThemedText.BodySmall>
          </DetailSection>
          <DetailSection>
            <ThemedText.BodySmall color="accentSuccess" fontWeight={900}>
              Market Cap:
            </ThemedText.BodySmall>
            <ThemedText.BodySmall color="accentSuccess">
              {formatDollarAmount({ num: coinDetails?.marketCap, long: false })}
            </ThemedText.BodySmall>
          </DetailSection>
          <DetailSection>
            <ThemedText.BodySmall fontWeight={900}>Replies:</ThemedText.BodySmall>
            <ThemedText.BodySmall color="textSecondary">{coinDetails?.replies}</ThemedText.BodySmall>
          </DetailSection>
          <DetailSection>
            <ThemedText.BodySmall color="textSecondary">{coinDetails?.description}</ThemedText.BodySmall>
          </DetailSection>
        </DetailsWrapper>
      </CardDetailsWrapper>
    </>
  )
}

export default CoinBox
