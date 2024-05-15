import Column from 'components/Column'
import CreateCoinModal from 'components/Launch/CreateCoinModal'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components/macro'

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
const TableWrapper = styled.div`
  width: 100%;
  margin-left: 150px;
  margin-right: 50px;
  margin-top: 20px;
`

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
      <TableWrapper>
        <Input placeholder="Search Coins" />
      </TableWrapper>
    </>
  )
}
