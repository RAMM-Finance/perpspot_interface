import Column from 'components/Column'
import { MOBILE_MEDIA_BREAKPOINT, SMALL_MEDIA_BREAKPOINT, XLARGE_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
import { ActivitySwitcher } from 'nft/components/collection'
// import { getSortDropdownOptions } from 'nft/components/collection/CollectionNfts'
import { Row } from 'nft/components/Flex'
import { useLocation, useNavigate } from 'react-router-dom'
import styled, { css } from 'styled-components/macro'

import ItemImg from '../../assets/images/newItem.png'
import ItemImg2 from '../../assets/images/newItem2.webp'
import ItemImg3 from '../../assets/images/newItem3.webp'
import ItemImg4 from '../../assets/images/newItem4.webp'
import ItemImg5 from '../../assets/images/newItem5.webp'
import ItemImg6 from '../../assets/images/newItem6.webp'
import Logo from '../../assets/svg/full_logo_black.svg'
import banner from '../../components/Leaderboard/banner.png'
import { CardContainer } from './CardContainer'
import InfoDescriptionSection from './InfoDescription'
import InfoItemStats from './InfoItemStats'

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
  const itemData = [
    {
      id: '#111',
      img: ItemImg,
      info: 'Limitless test1',
      secondInfo: '4.72WETH',
      selected: false,
      isDisabled: false,
    },
    {
      id: '#222',
      img: ItemImg2,
      info: 'Limitless test2',
      secondInfo: '4.72WETH',
      selected: false,
      isDisabled: false,
    },
    {
      id: '#333',
      img: ItemImg3,
      info: 'Limitless test3',
      secondInfo: '4.72WETH',
      selected: false,
      isDisabled: false,
    },
    {
      id: '#444',
      img: ItemImg4,
      info: 'Limitless test4',
      secondInfo: '4.72WETH',
      selected: false,
      isDisabled: false,
    },
    {
      id: '#555',
      img: ItemImg5,
      info: 'Limitless test5',
      secondInfo: '4.72WETH',
      selected: false,
      isDisabled: false,
    },
    {
      id: '#666',
      img: ItemImg6,
      info: 'Limitless test6',
      secondInfo: '4.72WETH',
      selected: false,
      isDisabled: false,
    },
    {
      id: '#777',
      img: ItemImg,
      info: 'Limitless test7',
      secondInfo: '4.72WETH',
      selected: false,
      isDisabled: false,
    },
    {
      id: '#888',
      img: ItemImg2,
      info: 'Limitless test8',
      secondInfo: '4.72WETH',
      selected: false,
      isDisabled: false,
    },
    {
      id: '#999',
      img: ItemImg4,
      info: 'Limitless test9',
      secondInfo: '4.72WETH',
      selected: false,
      isDisabled: false,
    },
    {
      id: '#1010',
      img: ItemImg6,
      info: 'Limitless test1010',
      secondInfo: '4.72WETH',
      selected: false,
      isDisabled: false,
    },
    {
      id: '#1212',
      img: ItemImg5,
      info: 'Limitless test 1212',
      secondInfo: '4.72WETH',
      selected: false,
      isDisabled: false,
    },
    {
      id: '#1313',
      img: ItemImg3,
      info: 'Limitless test1313',
      secondInfo: '4.72WETH',
      selected: false,
      isDisabled: false,
    },
    {
      id: '#1414',
      img: ItemImg,
      info: 'Limitless test1414',
      secondInfo: '4.72WETH',
      selected: false,
      isDisabled: false,
    },
  ]

  const { pathname } = useLocation()

  // toggle item or Activity
  const isActivityToggled = pathname.includes('/activity')
  const navigate = useNavigate()

  // //TODO: Add query string parameter to the URL in the ("?")following format
  const toggleActivity = () => {
    isActivityToggled ? navigate(`/new`) : navigate(`/new/?/activity`)
  }
  // const setSortBy = useCollectionFilters((state) => state.setSortBy)

  // const sortDropDownOptions: DropDownOption[] = useMemo(() => getSortDropdownOptions(setSortBy, false), [setSortBy])
  return (
    <CollectionContainer>
      {/* Banner, Info title description section */}
      <BannerWrapper>
        <Banner src={banner} />
      </BannerWrapper>
      <CollectionDescriptionSection>
        <Row margin="auto" gap="16">
          <InfoImg src={Logo} alt="Logo" />
          <InfoDescriptionSection
            title="LimitLess"
            description="Milady Maker is a collection of 10,000 generative pfpNFT's in a neochibi aesthetic inspired by street style tribes."
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
            {itemData.map(({ id, img, info, secondInfo, selected, isDisabled }) => (
              <CardContainer
                key={id}
                id={id}
                img={img}
                info={info}
                secondInfo={secondInfo}
                selected={selected}
                isDisabled={isDisabled}
              />
            ))}
            {/* </InfiniteScroll> */}
          </InfiniteScrollWrapper>
        </CollectionAssetsContainer>
      </CollectionDisplaySection>
    </CollectionContainer>
  )
}

export default NewItemsListPage
