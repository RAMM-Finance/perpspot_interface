import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, NFTEventName } from '@uniswap/analytics-events'
import Column from 'components/Column'
import { AnimatedBox } from 'nft/components/Box'
import { ActivitySwitcher, CollectionSearch, FilterButton } from 'nft/components/collection'
import { getSortDropdownOptions } from 'nft/components/collection/CollectionNfts'
import { SortDropdown } from 'nft/components/common/SortDropdown'
import { Row } from 'nft/components/Flex'
import { SweepIcon } from 'nft/components/icons'
import { useCollectionFilters } from 'nft/hooks'
import * as styles from 'nft/pages/collection/index.css'
import { DropDownOption } from 'nft/types'
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled, { css } from 'styled-components/macro'
import { ThemedText } from 'theme'

import InfoDescription from './InfoDescription'

const SortDropdownContainer = styled.div<{ isFiltersExpanded: boolean }>`
  width: max-content;
  height: 44px;
  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.lg}px`}) {
    ${({ isFiltersExpanded }) => isFiltersExpanded && `display: none;`}
  }
  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    display: none;
  }
`

const InfiniteScrollWrapperCss = css`
  margin: 0 16px;
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.sm}px) {
    margin: 0 20px;
  }
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    margin: 0 26px;
  }
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.lg}px) {
    margin: 0 48px;
  }
`

const InfiniteScrollWrapper = styled.div`
  ${InfiniteScrollWrapperCss}
`

const SweepButton = styled.div<{ toggled: boolean; disabled?: boolean }>`
  display: flex;
  gap: 8px;
  border: none;
  border-radius: 12px;
  padding: 12px 18px 12px 12px;
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
  color: ${({ toggled, disabled, theme }) => (toggled && !disabled ? theme.accentTextLightPrimary : theme.textPrimary)};
  background: ${({ theme, toggled, disabled }) =>
    !disabled && toggled
      ? 'radial-gradient(101.8% 4091.31% at 0% 0%, #4673FA 0%, #9646FA 100%)'
      : theme.backgroundInteractive};
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
  :hover {
    background-color: ${({ theme }) => theme.hoverState};
    transition: ${({
      theme: {
        transition: { duration, timing },
      },
    }) => `${duration.fast} background-color ${timing.in}`};
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding: 12px 12px 12px 12px;
  }
`
const ActionsSubContainer = styled.div`
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 0px;
  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    gap: 10px;
  }
`

const ActionsContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  gap: 10px;
  justify-content: space-between;

  ${InfiniteScrollWrapperCss}
`

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
  padding: 0;
  align-items: flex-start;
  position: relative;
`

const CollectionDescriptionSection = styled(Column)`
  ${styles.ScreenBreakpointsPaddings}
`

const FilterItems = () => {
  const { pathname } = useLocation()

  // toggle item or Activity
  const isActivityToggled = pathname.includes('/activity')
  const navigate = useNavigate()

  //TODO: Add query string parameter to the URL in the ("?")following format
  const toggleActivity = () => {
    isActivityToggled ? navigate(`/nft`) : navigate(`/nft/?/activity`)
  }
  const setSortBy = useCollectionFilters((state) => state.setSortBy)

  const sortDropDownOptions: DropDownOption[] = useMemo(() => getSortDropdownOptions(setSortBy, false), [setSortBy])
  return (
    <CollectionContainer>
      {/* Banner, Info title section */}
      <CollectionDescriptionSection>
        <AnimatedBox
          backgroundColor="backgroundBackdrop"
          position="sticky"
          top="72"
          width="full"
          zIndex="3"
          marginBottom={{ sm: '8', md: '20' }}
          paddingTop="16"
          paddingBottom="16"
          marginTop="40"
        >
          <InfoDescription title={true}/>
          <InfoDescription />
          {/* {collectionStats && <CollectionStats stats={collectionStats} isMobile={flase} />} */}
          <div id="nft-anchor" />
          <ActivitySwitcher
            showActivity={isActivityToggled}
            toggleActivity={() => {
              toggleActivity()
              //isFiltersExpanded && setFiltersExpanded(false)
            }}
          />
        </AnimatedBox>
      </CollectionDescriptionSection>
      {/* Filter , ListItem section */}
      <CollectionDisplaySection>
        {/* todo : add filters */}
        <CollectionAssetsContainer hideUnderneath={false}>
          <AnimatedBox
            backgroundColor="backgroundBackdrop"
            position="sticky"
            top="72"
            width="full"
            zIndex="3"
            marginBottom={{ sm: '8', md: '20' }}
            paddingTop="16"
            paddingBottom="16"
          >
            <ActionsContainer>
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
              {/* {!hasErc1155s && (*/}
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
              {/* )} */}
            </ActionsContainer>
            <InfiniteScrollWrapper>
              {/* The filter chips are displayed based on whether the filters are expanded */}
              {true && (
                <Row paddingTop="12" gap="8" flexWrap="wrap">
                  {/* {markets.map((market) => (
              <TraitChip
                key={market}
                value={
                  <MarketNameWrapper>
                    <MarketplaceLogo src={`/nft/svgs/marketplaces/${market.toLowerCase()}.svg`} />
                    {MARKETPLACE_ITEMS[market as keyof typeof MARKETPLACE_ITEMS]}
                  </MarketNameWrapper>
                }
                onClick={() => {
                  scrollToTop();
                  removeMarket(market);
                }}
              />
            ))}
            {traits.map((trait) => (
              <TraitChip
                key={trait.trait_value}
                value={
                  trait.trait_type === 'Number of traits'
                    ? `${trait.trait_value} trait${pluralize(Number(trait.trait_value))}`
                    : `${trait.trait_type}: ${trait.trait_value}`
                }
                onClick={() => {
                  scrollToTop();
                  removeTrait(trait);
                }}
              />
            ))}
            {minMaxPriceChipText && (
              <TraitChip
                value={minMaxPriceChipText}
                onClick={() => {
                  scrollToTop();
                  setMin('');
                  setMax('');
                  setPrevMinMax([0, 100]);
                }}
              />
            )} */}
                  {/* filter chip all remove button */}
                  {/* {Boolean(traits.length || markets.length || minMaxPriceChipText) && ( */}
                  {/* <ClearAllButton
                onClick={() => {
                  console.log('clear all')
                }}
              >
                Clear All
              </ClearAllButton> */}
                  {/* )} */}
                </Row>
              )}
            </InfiniteScrollWrapper>
          </AnimatedBox>
        </CollectionAssetsContainer>
      </CollectionDisplaySection>
    </CollectionContainer>
  )
}

export default FilterItems
