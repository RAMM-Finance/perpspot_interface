import { useWeb3React } from '@web3-react/core'
import Column from 'components/Column'
import { MOBILE_MEDIA_BREAKPOINT, SMALL_MEDIA_BREAKPOINT, XLARGE_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
import { useBRP } from 'hooks/useContract'
// import { getSortDropdownOptions } from 'nft/components/collection/CollectionNfts'
import { Row } from 'nft/components/Flex'
import { useCallback, useEffect, useState } from 'react'
import { ArrowUpRight } from 'react-feather'
import { useAddPopup } from 'state/application/hooks'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import banner from '../../components/Leaderboard/banner.png'
import BoxesContainr, { TBRPData } from './BoxesContainr'
import InfoDescriptionSection from './InfoDescription'

// const SortDropdownContainer = styled.div<{ isFiltersExpanded: boolean }>`
//   width: max-content;
//   height: 44px;
//   @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.lg}px`}) {
//     ${({ isFiltersExpanded }) => isFiltersExpanded && `display: none;`}
//   }
//   @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
//     display: none;
//   }
// `

const FaqWrapper = styled.div`
  margin: 50px auto;
  width: 48%;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
`

const FaqElement = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  :hover {
    cursor: pointer;
    opacity: 75%;
  }
`

// const SweepButton = styled.div<{ toggled: boolean; disabled?: boolean }>`
//   display: flex;
//   gap: 8px;
//   border: none;
//   border-radius: 12px;
//   padding: 12px 18px 12px 12px;
//   cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
//   color: ${({ toggled, disabled, theme }) => (toggled && !disabled ? theme.accentTextLightPrimary : theme.textPrimary)};
//   background: ${({ theme, toggled, disabled }) =>
//     !disabled && toggled
//       ? 'radial-gradient(101.8% 4091.31% at 0% 0%, #4673FA 0%, #9646FA 100%)'
//       : theme.backgroundInteractive};
//   opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
//   :hover {
//     background-color: ${({ theme }) => theme.hoverState};
//     transition: ${({
//       theme: {
//         transition: { duration, timing },
//       },
//     }) => `${duration.fast} background-color ${timing.in}`};
//   }

//   @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
//     padding: 12px 12px 12px 12px;
//   }
// `
// const ActionsSubContainer = styled.div`
//   display: flex;
//   gap: 12px;
//   flex: 1;
//   min-width: 0px;
//   @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
//     gap: 10px;
//   }
// `

const CollectionContainer = styled(Column)`
  width: 100%;
  align-self: start;
  will-change: width;
`

const CollectionAssetsContainer = styled.div<{ hideUnderneath: boolean }>`
  width: 100%;
  position: ${({ hideUnderneath }) => (hideUnderneath ? 'fixed' : 'static')};
`

const CollectionDisplaySection = styled(Row)`
  width: 100%;
  padding: 1rem;
  align-items: flex-start;
  position: relative;
`

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
`

const CollectionDescriptionSection = styled(Column)`
  position: relative;
  justify-content: center;
  border-bottom: 1px solid;
  border-color: ${({ theme }) => theme.backgroundInteractive};
  @media screen and (min-width: ${XLARGE_MEDIA_BREAKPOINT}) {
    padding-left: 48px;
    padding-right: 48px;
  }

  @media screen and (max-width: ${XLARGE_MEDIA_BREAKPOINT}) {
    padding-left: 26px;
    padding-right: 26px;
  }

  @media screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    padding-left: 20px;
    padding-right: 20px;
  }

  @media screen and (max-width: ${MOBILE_MEDIA_BREAKPOINT}) {
    padding-left: 16px;
    padding-right: 16px;
  }
`

const InfoImg = styled.img`
  /* position: absolute; */
  left: 45px;
  top: -110px;
  box-shadow: ${({ theme }) => theme.roundedImageShadow};
  height: 143px;
  vertical-align: top;
  width: 143px;
  border-style: solid;
  border-width: 3px;
  border-radius: 100%;
  border-color: ${({ theme }) => theme.white};
  /* background-color: #fff; */
  -webkit-tap-highlight-color: transparent;
  box-sizing: border-box;

  /* @media (max-width: 639px) {
    border-width: 2px;
    height: 100px;
    top: -32px;
    width: 100px;
  } */
`

// const FadeInColumn = styled(Column)`
//   ${portfolioFadeInAnimation}
// `

const NewItemsListPage = () => {
  const { account, chainId } = useWeb3React()
  const brp = useBRP()

  const [brpData, setBRPData] = useState<TBRPData>({
    totalBoxes: 0,
    totalUnlockableBoxes: '0',
    lmtRequiredPerUnlock: '0',
  })
  const [totalLMT, setTotalLMT] = useState('0')
  const [loading, setLoading] = useState(true)

  const addPopup = useAddPopup()

  const handleUnlockBox = useCallback(async () => {
    if (brp && account) {
      try {
        const gasLimit = 1000000
        const tx = await brp.unlockBox({
          gasLimit,
          from: account,
        })
        const receipt = await tx.wait()
        setLoading(true)
        // console.log('Unlock successful:', receipt)
        addPopup(
          { txn: { hash: receipt.transactionHash }, isUnlockBox: true },
          'unlock Success',
          Number.MAX_SAFE_INTEGER
        )
        setBRPData((prevData) => ({
          ...prevData,
          totalUnlockableBoxes: (parseInt(prevData.totalUnlockableBoxes) - 1).toString(),
        }))
        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.error(error, 'BRP instance is not available')
      }
    }
  }, [brp, account, addPopup])

  useEffect(() => {
    if (brp && account) {
      const call = async () => {
        try {
          setLoading(true)
          const totalBoxes = await brp.numBoxes(account)
          const totalUnlockableBoxes = await brp.claimableBoxes(account)
          const lmtRequiredPerUnlock = await brp.pointPerUnlocks()

          const lastRecordedTradePoints = await brp.lastRecordedTradePoints(account)
          const lastRecordedLpPoints = await brp.lastRecordedLpPoints(account)
          const lastRecordedPoints = await brp.lastRecordedPoints(account)

          const totalLMT = lastRecordedTradePoints.add(lastRecordedLpPoints).add(lastRecordedPoints)
          const totalLMTString = totalLMT.toString()

          setTotalLMT(totalLMTString)
          // console.log('total value call',  lastRecordedTradePoints.toString(), lastRecordedLpPoints.toString(), lastRecordedPoints.toString())
          // console.log('total boxes', totalBoxes, totalUnlockableBoxes, lmtRequiredPerUnlock)
          setBRPData({
            totalBoxes: totalBoxes.toNumber(),
            totalUnlockableBoxes: totalUnlockableBoxes[0]?.toString(),
            lmtRequiredPerUnlock: lmtRequiredPerUnlock.toString(),
          })
          setLoading(false)
        } catch (error) {
          setLoading(false)
          console.log(error, 'get brp data error')
        }
      }
      call()
    }
  }, [brp, account])

  // useEffect(() => {
  //   addPopup({ txn: { hash: '0xde0fea27570e870df0fe08fbe6ee021b61b54732590102b9893479295ff8f60d',}, isUnlockBox: true }, '0xde0fea27570e870df0fe08fbe6ee021b61b54732590102b9893479295ff8f60d',)
  // }, [addPopup])

  return (
    <CollectionContainer>
      {/* Banner, Info title description section */}
      <BannerWrapper>
        <Banner src={banner} />
      </BannerWrapper>
      <CollectionDescriptionSection>
        <Row gap="16">
          <InfoDescriptionSection
            title="Use and Unlock "
            description="Earn LMT and unlock treasure boxes"
            stats={totalLMT}
            brpData={brpData}
            loading={loading}
          />
        </Row>
      </CollectionDescriptionSection>
      <CollectionDisplaySection>
        {/* <InfiniteScroll
          next={() => {console.log("")}}
          hasMore={false}
          loader={false}
          dataLength={20}
          style={{ overflow: 'unset', height: '100%' }}
          > */}
        <BoxesContainr brpData={brpData} handleUnlockBox={handleUnlockBox} loading={loading} />
        {/* </InfiniteScroll> */}
      </CollectionDisplaySection>
      <FaqWrapper>
        <FaqElement>
          <a
            href="https://limitless.gitbook.io/limitless/intro/limitless-lp-token-llp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ThemedText.BodySecondary fontSize={15} fontWeight={800}>
              Earning with LLP
            </ThemedText.BodySecondary>
          </a>
          <ArrowUpRight size="20" />
        </FaqElement>{' '}
        <ThemedText.BodyPrimary fontSize={15} fontWeight={800}>
          Read our LLP documentation to better understand how to earn.
        </ThemedText.BodyPrimary>
      </FaqWrapper>
    </CollectionContainer>
  )
}

export default NewItemsListPage
