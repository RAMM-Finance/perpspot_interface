import Column from 'components/Column'
import { MOBILE_MEDIA_BREAKPOINT, SMALL_MEDIA_BREAKPOINT, XLARGE_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
// import { getSortDropdownOptions } from 'nft/components/collection/CollectionNfts'
import { Row } from 'nft/components/Flex'
import { ArrowUpRight } from 'react-feather'
import { useLocation, useNavigate } from 'react-router-dom'
import styled, { css } from 'styled-components/macro'
import { ThemedText } from 'theme'

import ItemImg from '../../assets/images/newItem.png'
import ItemImg2 from '../../assets/images/newItem2.webp'
import ItemImg3 from '../../assets/images/newItem3.webp'
import ItemImg4 from '../../assets/images/newItem4.webp'
import ItemImg5 from '../../assets/images/newItem5.webp'
import ItemImg6 from '../../assets/images/newItem6.webp'
import banner from '../../components/Leaderboard/banner.png'
import { CardContainer } from './CardContainer'
import InfoDescriptionSection from './InfoDescription'
import { useBRP } from 'hooks/useContract'
import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useState } from 'react'
import { BigNumber } from 'ethers'
import { isAddress } from 'ethers/lib/utils'


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

const InfiniteScrollWrapperCss = css`
  margin: 0 16px;
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(calc(50% - 8px), 1fr));

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.sm}px) {
    gap: 8px;
    margin: 0 20px;
  }
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    grid-template-columns: repeat(auto-fill, minmax(calc(33.33333% - 8px), 1fr));
    gap: 12px;
    margin: 0 26px;
  }
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.lg}px) {
    gap: 16px;
    margin: 0 48px;
    grid-template-columns: repeat(auto-fill, minmax(calc(33.33333% - 12px), 1fr));
  }

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.xl}px) {
    gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(calc(25% - 16px), 1fr));
  }
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.xxl}px) {
    gap: 22px;
    grid-template-columns: repeat(auto-fill, minmax(calc(20% - 16px), 1fr));
  }

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.xxxl}px) {
    grid-template-columns: repeat(auto-fill, minmax(calc(20% - 50px), 1fr));
  }
`
const InfiniteScrollWrapper = styled.div`
  ${InfiniteScrollWrapperCss}
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

// const ActionsContainer = styled.div`
//   display: flex;
//   flex: 1 1 auto;
//   gap: 10px;
//   justify-content: space-between;

//   ${InfiniteScrollWrapperCss}
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

  // const [brpData, setBRPData] = useState({
  //   totalBoxes: null,
  //   totalUnlockableBoxes: null,
  //   MTRequiredPerUnlock: null,
  // });
  const [totalLMT, setTotalLMT] = useState('')
   // const totalBoxes = brp.numBoxes(account)
  // const totalUnlockableBoxes = brp.claimableBoxes(account)
  // const MTRequiredPerUnlock = brp.pointPerUnlocks()
  // const TotalLMT = brp.lastRecordedTradePoints(account)+ 
  // brp.lastRecordedLpPoints(account)+ brp.lastRecordedPoints(account)

  const itemData = [
    {
      id: '#111',
      img: ItemImg,
      info: 'Limitless test1',
      selected: false,
      isDisabled: false,
      isLocked: false
    },
    {
      id: '#222',
      img: ItemImg2,
      info: 'Limitless test2',
      selected: false,
      isDisabled: false,
      isLocked: true
    },
    {
      id: '#333',
      img: ItemImg3,
      info: 'Limitless test3',
      selected: false,
      isDisabled: false,
      isLocked: false
    },
    {
      id: '#444',
      img: ItemImg4,
      info: 'Limitless test4',
      selected: false,
      isDisabled: false,
      isLocked: true
    },
    {
      id: '#555',
      img: ItemImg5,
      info: 'Limitless test5',
      selected: false,
      isDisabled: false,
      isLocked: true
    },
    {
      id: '#666',
      img: ItemImg6,
      info: 'Limitless test6',
      selected: false,
      isDisabled: false,
      isLocked: false
    },
    {
      id: '#777',
      img: ItemImg,
      info: 'Limitless test7',
      selected: false,
      isDisabled: false,
      isLocked: false
    },
    {
      id: '#888',
      img: ItemImg2,
      info: 'Limitless test8',
      selected: false,
      isDisabled: false,
      isLocked: true
    },
    {
      id: '#999',
      img: ItemImg4,
      info: 'Limitless test9',
      selected: false,
      isDisabled: false,
      isLocked: true
    },
    {
      id: '#1010',
      img: ItemImg6,
      info: 'Limitless test1010',
      selected: false,
      isDisabled: false,
      isLocked: true
    },
    {
      id: '#1212',
      img: ItemImg5,
      info: 'Limitless test 1212',
      selected: false,
      isDisabled: false,
      isLocked: false
    },
  ]

  const { pathname } = useLocation()

  useEffect(() => {
    if (brp && account){
      console.log('check' ,brp, account);
      const call = async () => {
        try {
          // const totalBoxes = await brp.numBoxes(account)
          // const totalUnlockableBoxes = await brp.claimableBoxes(account)
          // const lmtRequiredPerUnlock = await brp.pointPerUnlocks()

          const lastRecordedTradePoints = await brp.lastRecordedTradePoints(account)
          const lastRecordedLpPoints = await brp.lastRecordedLpPoints(account)
          const lastRecordedPoints = await brp.lastRecordedPoints(account)

          const totalLMT = lastRecordedTradePoints.add(lastRecordedLpPoints).add(lastRecordedPoints)
          const totalLMTString = totalLMT.toString()

          setTotalLMT(totalLMTString)
          // console.log('total value call',  lastRecordedTradePoints.toString(), lastRecordedLpPoints.toString(), lastRecordedPoints.toString())
          // console.log('total',  totalBoxes, totalUnlockableBoxes,lmtRequiredPerUnlock )
          // setBRPData({
          //   totalBoxes,
          //   totalUnlockableBoxes,
          //   MTRequiredPerUnlock
          // });
        } catch (error) {
          console.log(error, 'get brp data error')
        }
      }
      call()
    }
  }, [brp, account])


  const handleUnlockBox = useCallback(async() => {
    if (brp && account) {
      try {
        const gasLimit = 1000000
        const tx = await brp.unlockBox({
          gasLimit,
          from: account 
        })
        const receipt = await tx.wait()
        console.log('Unlock successful:', receipt)
      } catch(error) {
        console.error(error, 'BRP instance is not available')
      }
    }
  }, [brp, account])

  // toggle item or Activity
  // const isActivityToggled = pathname.includes('/activity')
  // const navigate = useNavigate()

  // //TODO: Add query string parameter to the URL in the ("?")following format
  // const toggleActivity = () => {
  //   isActivityToggled ? navigate(`/new`) : navigate(`/new/?/activity`)
  // }
  // const setSortBy = useCollectionFilters((state) => state.setSortBy)

  // const sortDropDownOptions: DropDownOption[] = useMemo(() => getSortDropdownOptions(setSortBy, false), [setSortBy])
  return (
    <CollectionContainer>
      {/* Banner, Info title description section */}
      <BannerWrapper>
        <Banner src={banner} />
      </BannerWrapper>
      <CollectionDescriptionSection>
        <Row gap="16">
          {/* <InfoImg src={Logo} alt="Logo" /> */}
          <InfoDescriptionSection
            title="LimitLess"
            description="Milady Maker is a collection of 10,000 generative pfpNFT's in a neochibi aesthetic inspired by street style tribes."
            stats={totalLMT}
          />
        </Row>
        {/* <ItemStats /> */}
        {/* {collectionStats && <CollectionStats sta  ts={collectionStats} isMobile={flase} />} */}
        <div id="nft-anchor" />
        {/* <ActivitySwitcher
          showActivity={isActivityToggled}
          toggleActivity={() => {
            toggleActivity()
            //isFiltersExpanded && setFiltersExpanded(false)
          }}
        /> */}
      </CollectionDescriptionSection>
      {/* Filter , ListItem section */}
      <CollectionDisplaySection>
        {/* todo : add filters */}
        <CollectionAssetsContainer hideUnderneath={false}>
          {/* <ActionsContainer>
            <ActionsSubContainer>
              <TraceEvent
                events={[BrowserEvent.onClick]}
                element={InterfaceElementName.NFT_FILTER_BUTTON}
                name={NFTEventName.NFT_FILTER_OPENED}
                shouldLogImpression={false}
                properties={{ collection_address: undefined, chain_id: undefined }}
              >
                <FilterButton
                  isMobile={false}
                  isFiltersExpanded={false}
                  // collectionCount={}
                  onClick={() => {
                    // if (bagExpanded && !screenSize['xl']) toggleBag()
                    // setFiltersExpanded(!isFiltersExpanded)
                  }}
                />
              </TraceEvent>
              <SortDropdownContainer isFiltersExpanded={false}>
                <SortDropdown dropDownOptions={sortDropDownOptions} />
              </SortDropdownContainer>
              <CollectionSearch />
            </ActionsSubContainer>
            {/* {!hasErc1155s && }
            <SweepButton
              toggled={false}
              disabled={false}
              onClick={() => {
                console.log('sweepbutton click')
              }}
              data-testid="nft-sweep-button"
            >
              <SweepIcon viewBox="0 0 24 24" width="20px" height="20px" />
              <ThemedText.BodySecondary fontWeight={600} color="currentColor" lineHeight="20px">
                Sweep
              </ThemedText.BodySecondary>
            </SweepButton>
          </ActionsContainer> */}
          <InfiniteScrollWrapper>
            {/* The filter chips are displayed based on whether the filters are expanded */}
            {/* <InfiniteScroll
              next={() => {console.log("")}}
              hasMore={false}
              loader={false}
              dataLength={20}
              style={{ overflow: 'unset', height: '100%' }}
              > */}
            {itemData.map(({ id, img, info, selected, isDisabled, isLocked }) => (
              <CardContainer
                key={id}
                id={id}
                img={img}
                info={info}
                selected={selected}
                isDisabled={isDisabled}
                isLocked={isLocked}
                handleUnlockBox={handleUnlockBox}
              />
            ))}
            {/* </InfiniteScroll> */}
          </InfiniteScrollWrapper>
        </CollectionAssetsContainer>
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
