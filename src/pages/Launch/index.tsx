import Column from 'components/Column'
import CreateCoinModal from 'components/Launch/CreateCoinModal'
import Row from 'components/Row'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components/macro'
import { BREAKPOINTS, ThemedText } from 'theme'

import ItemImg from '../../assets/images/newItem7.webp'
import banner from '../../components/Launch/launchBanner.png'

const BannerWrapper = styled.div`
  height: 100px;
  max-width: 100%;
  position: relative;
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.sm}px) {
    margin-top: 16px;
    margin-left: 20px;
    margin-right: 20px;
    height: 288px;
  }
  opacity: 70%;
`
const Banner = styled.div<{ src: string }>`
  height: 100%;
  width: 100%;
  background-image: url(${({ src }) => src});
  background-position-y: center;
  background-size: cover;

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.sm}px) {
    border-radius: 16px;
  }
  position: absolute;
`
const CollectionContainer = styled(Column)`
  width: 100%;
  align-self: start;
  will-change: width;
`

const BannerTextWrapper = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  margin-left: -5px;
`

const BannerText = styled.h1`
  font-size: 45px;
  letter-spacing: 4px;
  margin-bottom: 10px;
  white-space: nowrap;
  color: ${({ theme }) => theme.accentTextLightPrimary};
`

const BannerBtn = styled.button`
  background-color: ${({ theme }) => theme.accentActionSoft};
  color: ${({ theme }) => theme.accentTextLightPrimary};
  padding: 10px 20px;
  text-align: center;
  white-space: nowrap;
  border: none;
  cursor: pointer;
  width: 235px;
  font-size: 18px;
  border-radius: 12px;
  transition: 150ms ease background-color;
  &:hover {
    background-color: ${({ theme }) => theme.accentTextDarkPrimary};
  }
`

const BannerBtnWrapper = styled.div`
  margin-top: 15px;
  display: flex;
  gap: 25px;
`
const BannerInfoWrapper = styled.div`
  position: absolute;
  margin-top: 16px;
  height: 350px;
  margin: auto;
  width: 100%;
  border-radius: 12px;
  padding: 16px;
  background-position: center;
  background-size: cover;
  /* background-image: linear-gradient(to bottom, rgba(7, 7, 7, 0.5) 40%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0) 100%), url(${banner}); */
`

const Input = styled.input`
  margin-bottom: 10px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.surface1};
  border-radius: 10px;
  line-height: 25px;
  width: 300px;
  &:focus {
    outline: 1px solid ${({ theme }) => theme.accentActive};
  }
  color: white;
  padding-left: 5px;
`
const TableWrapper = styled.div<{ modalOpen: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-left: 150px;
  margin-right: 50px;
  margin-top: 20px;
  z-index: ${({ modalOpen }) => (modalOpen ? '10' : '1100')};
`
const LeadCoinWrapper = styled.div`
  width: 85%;
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;
  align-items: center;
  gap: 20px;
`
const CoinListWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 30px;
  width: 100%;
  margin-top: 30px;
  margin-right: 10px;
`

const CardDetailsWrapper = styled.div`
  position: relative;
  display: flex;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.backgroundSurface};
  overflow: hidden;
  box-shadow: 0px 0px 8px rgba(51, 53, 72, 0.04), 1px 2px 4px rgba(51, 53, 72, 0.12);
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  isolation: isolate;
  max-width: 400px;
`
const DetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 10px;
  margin-left: 10px;
`
const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const CoinBox = styled.div``

export const Launch = () => {
  const [showModal, setShowModal] = useState(false)
  const handleCloseModal = useCallback(() => {
    setShowModal(false)
  }, [])

  return (
    <>
      <CreateCoinModal isOpen={showModal} handleCloseModal={handleCloseModal} />
      <CollectionContainer>
        <BannerWrapper>
          <Banner src={banner} />
        </BannerWrapper>
        <BannerInfoWrapper>
          <BannerTextWrapper>
            <BannerText>Launch your very own coin</BannerText>
            <BannerBtnWrapper>
              <BannerBtn onClick={() => setShowModal(true)}>Create Coin</BannerBtn>
            </BannerBtnWrapper>
          </BannerTextWrapper>
        </BannerInfoWrapper>
      </CollectionContainer>
      <TableWrapper modalOpen={showModal}>
        <LeadCoinWrapper>
          <ThemedText.DeprecatedMediumHeader>King of the Hill</ThemedText.DeprecatedMediumHeader>
          <StyledCardContainerLead>
            <ItemImgContainer>
              <StyledMediaContainer>
                <StyledMediaImg src={ItemImg} />
              </StyledMediaContainer>
            </ItemImgContainer>
            <StyledDetailsRelativeContainer>
              <StyledDetailsContainer>
                <StyledInfoContainer>
                  <Row gap="8" justifyContent="space-between">
                    <StyledPrimaryDetails>
                      <PrimaryInfoContainer>Token A </PrimaryInfoContainer>
                    </StyledPrimaryDetails>
                  </Row>
                  <Row justifyContent="space-between"></Row>
                </StyledInfoContainer>
              </StyledDetailsContainer>
            </StyledDetailsRelativeContainer>
            <StyledActionButton> More Details</StyledActionButton>
          </StyledCardContainerLead>
        </LeadCoinWrapper>
        <Input placeholder="Search Coins" />
        <CoinListWrapper>
          <CardDetailsWrapper>
            <StyledCardContainer>
              <ItemImgContainer>
                <StyledMediaContainer>
                  <StyledMediaImg src={ItemImg} />
                </StyledMediaContainer>
              </ItemImgContainer>
              <StyledDetailsRelativeContainer>
                <StyledDetailsContainer>
                  <StyledInfoContainer>
                    <Row gap="8" justifyContent="space-between">
                      <StyledPrimaryDetails>
                        <PrimaryInfoContainer>Token B </PrimaryInfoContainer>
                      </StyledPrimaryDetails>
                    </Row>
                    <Row justifyContent="space-between"></Row>
                  </StyledInfoContainer>
                </StyledDetailsContainer>
              </StyledDetailsRelativeContainer>
              <StyledActionButton> More Details</StyledActionButton>
            </StyledCardContainer>
            <DetailsWrapper>
              <DetailSection>
                <ThemedText.BodySmall fontWeight={900}>Created By:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">0x2312310123243143</ThemedText.BodySmall>
              </DetailSection>
              <DetailSection>
                <ThemedText.BodySmall fontWeight={900}>Market Cap:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">12.6k</ThemedText.BodySmall>
              </DetailSection>
              <DetailSection>
                <ThemedText.BodySmall fontWeight={900}>Replies:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">375</ThemedText.BodySmall>
              </DetailSection>
            </DetailsWrapper>
          </CardDetailsWrapper>
          <CardDetailsWrapper>
            <StyledCardContainer>
              <ItemImgContainer>
                <StyledMediaContainer>
                  <StyledMediaImg src={ItemImg} />
                </StyledMediaContainer>
              </ItemImgContainer>
              <StyledDetailsRelativeContainer>
                <StyledDetailsContainer>
                  <StyledInfoContainer>
                    <Row gap="8" justifyContent="space-between">
                      <StyledPrimaryDetails>
                        <PrimaryInfoContainer>Token C </PrimaryInfoContainer>
                      </StyledPrimaryDetails>
                    </Row>
                    <Row justifyContent="space-between"></Row>
                  </StyledInfoContainer>
                </StyledDetailsContainer>
              </StyledDetailsRelativeContainer>
              <StyledActionButton> More Details</StyledActionButton>
            </StyledCardContainer>
            <DetailsWrapper>
              <DetailSection>
                <ThemedText.BodySmall fontWeight={900}>Created By:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">0x2312310123243143</ThemedText.BodySmall>
              </DetailSection>
              <DetailSection>
                <ThemedText.BodySmall fontWeight={900}>Market Cap:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">12.6k</ThemedText.BodySmall>
              </DetailSection>
              <DetailSection>
                <ThemedText.BodySmall fontWeight={900}>Replies:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">375</ThemedText.BodySmall>
              </DetailSection>
            </DetailsWrapper>
          </CardDetailsWrapper>
          <CardDetailsWrapper>
            <StyledCardContainer>
              <ItemImgContainer>
                <StyledMediaContainer>
                  <StyledMediaImg src={ItemImg} />
                </StyledMediaContainer>
              </ItemImgContainer>
              <StyledDetailsRelativeContainer>
                <StyledDetailsContainer>
                  <StyledInfoContainer>
                    <Row gap="8" justifyContent="space-between">
                      <StyledPrimaryDetails>
                        <PrimaryInfoContainer>Token D </PrimaryInfoContainer>
                      </StyledPrimaryDetails>
                    </Row>
                    <Row justifyContent="space-between"></Row>
                  </StyledInfoContainer>
                </StyledDetailsContainer>
              </StyledDetailsRelativeContainer>
              <StyledActionButton> More Details</StyledActionButton>
            </StyledCardContainer>
            <DetailsWrapper>
              <DetailSection>
                <ThemedText.BodySmall fontWeight={900}>Created By:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">0x2312310123243143</ThemedText.BodySmall>
              </DetailSection>
              <DetailSection>
                <ThemedText.BodySmall fontWeight={900}>Market Cap:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">12.6k</ThemedText.BodySmall>
              </DetailSection>
              <DetailSection>
                <ThemedText.BodySmall fontWeight={900}>Replies:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">375</ThemedText.BodySmall>
              </DetailSection>
            </DetailsWrapper>
          </CardDetailsWrapper>
        </CoinListWrapper>
      </TableWrapper>
    </>
  )
}

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

const StyledDetailsRelativeContainer = styled.div`
  position: relative;
  height: 50px;
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

const StyledCardContainerLead = styled.div`
  position: relative;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.backgroundSurface};
  overflow: hidden;
  box-shadow: 0px 0px 8px rgba(51, 53, 72, 0.04), 1px 2px 4px rgba(51, 53, 72, 0.12);
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  isolation: isolate;
  max-width: 150px;

  -webkit-box-shadow: 0 0 20px blue;
  -moz-box-shadow: 0 0 20px blue;
  box-shadow: 0 0 20px blue;

  :after {
    content: '';
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    border: 1px solid;
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
