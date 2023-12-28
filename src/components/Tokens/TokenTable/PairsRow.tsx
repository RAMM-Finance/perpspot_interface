import { Trans } from '@lingui/macro'
import { formatNumber, NumberType } from '@uniswap/conedison/format'
import { Currency } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { MouseoverTooltip } from 'components/Tooltip'
import { SparklineMap } from 'graphql/data/TopTokens'
import { CHAIN_NAME_TO_CHAIN_ID, validateUrlChainParam } from 'graphql/data/util'
import { TimePeriod } from 'graphql/data/util'
import { useRateAndUtil } from 'hooks/useLMTV2Positions'
import { usePool } from 'hooks/usePools'
import { atom, useAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { atomWithReset } from 'jotai/utils'
import { ForwardedRef, forwardRef } from 'react'
import { CSSProperties, ReactNode } from 'react'
import {
  useCallback,
  //useEffect, useMemo, useState
} from 'react'
import { ArrowDown, ArrowUp, Info } from 'react-feather'
import { Link, useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import styled, { css, useTheme } from 'styled-components/macro'
import { ClickableStyle } from 'theme'

import { useCurrency, useToken } from '../../../hooks/Tokens'
import { Field } from '../../../state/swap/actions'
import {
  useSwapActionHandlers,
  // useSwapState,
} from '../../../state/swap/hooks'
import { ButtonPrimary } from '../../Button'
import {
  LARGE_MEDIA_BREAKPOINT,
  MAX_WIDTH_MEDIA_BREAKPOINT,
  MEDIUM_MEDIA_BREAKPOINT,
  SMALL_MEDIA_BREAKPOINT,
} from '../constants'
import { LoadingBubble } from '../loading'
import { ArrowCell, DeltaText, formatDelta, getDeltaArrow } from '../TokenDetails/PriceChart'

const Cell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`
const StyledTokenRow = styled.div<{
  first?: boolean
  last?: boolean
  loading?: boolean
}>`
  background-color: ${({ theme }) => theme.backgroundSurface};
  display: grid;
  font-size: 0.75rem;
  grid-template-columns: 4fr 4fr 4fr 4fr 4fr 4fr 8fr;
  padding-left: 1rem;
  padding-right: 1rem;
  /* max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT}; */
  // max-width: 1480px;
  min-width: 390px;

  ${({ first, last }) => css`
    height: 4.5rem;
    padding-top: ${first ? '14px' : '0px'};
    padding-bottom: ${last ? '14px' : '0px'};
  `}
  /* padding-left: 20px;
  padding-right: 20px; */
  transition: ${({
    theme: {
      transition: { duration, timing },
    },
  }) => css`background-color ${duration.medium} ${timing.ease}`};
  width: 100%;
  transition-duration: ${({ theme }) => theme.transition.duration.fast};

  &:hover {
    ${({ loading, theme }) =>
      !loading &&
      css`
        background-color: ${theme.stateOverlayHover};
      `}
    ${({ last }) =>
      last &&
      css`
        border-radius: 0px 0px 8px 8px;
      `}
  }

  @media only screen and (max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT}) {
    //grid-template-columns: 1fr 6.5fr 4.5fr 4.5fr 4.5fr 4.5fr 1.7fr;
    grid-template-columns: 5fr 5fr 4fr 3fr 6fr 6fr 6fr;
    font-size: 0.75rem;
  }

  @media only screen and (max-width: ${LARGE_MEDIA_BREAKPOINT}) {
    grid-template-columns: 1fr 7.5fr 4.5fr 4.5fr 4.5fr 1.7fr;
  }

  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    grid-template-columns: 1fr 10fr 5fr 5fr 1.2fr;
  }

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    grid-template-columns: 2fr 3fr;
    min-width: unset;
    border-bottom: 0.5px solid ${({ theme }) => theme.backgroundModule};

    :last-of-type {
      border-bottom: none;
    }
  }
`

const ClickableContent = styled.div<{ rate?: number }>`
  display: flex;
  text-decoration: none;
  color: ${({ theme, rate }) => (!rate ? theme.textSecondary : rate > 0 ? '#10CC83' : '#FA3C58')};
  align-items: center;
  cursor: pointer;

  &:hover {
    background-color: transparent;
  }
`
const ClickableName = styled(ClickableContent)`
  gap: 8px;
  max-width: 100%;
`
const ClickableRate = styled(ClickableContent)`
  font-weight: 700;
`

const StyledHeaderRow = styled(StyledTokenRow)`
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-color: ${({ theme }) => theme.backgroundOutline};
  border-radius: 8px 8px 0px 0px;
  color: ${({ theme }) => theme.textPrimary};
  font-size: 0.8rem;
  font-weight: 900;
  height: 2rem;
  line-height: 16px;
  /* margin-bottom: 15px;
  padding: 0px 12px;
  height: 64px;
   */
  width: 100%;
  justify-content: center;

  &:hover {
    background-color: transparent;
  }

  @media only screen and (max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT}) {
    font-size: 0.8rem;
  }

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    justify-content: space-between;
  }
`

const ListNumberCell = styled(Cell)<{ header: boolean }>`
  color: ${({ theme }) => theme.textPrimary};
  min-width: 32px;

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    display: none;
  }
`
const DataCell = styled(Cell)<{ sortable: boolean }>`
  justify-content: flex-start;
  min-width: 80px;
  user-select: ${({ sortable }) => (sortable ? 'none' : 'unset')};
  transition: ${({
    theme: {
      transition: { duration, timing },
    },
  }) => css`background-color ${duration.medium} ${timing.ease}`};
`
const TvlCell = styled(DataCell)`
  /* padding-right: 8px; */
  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    display: none;
  }
`
const NameCell = styled(Cell)`
  justify-content: flex-start;
  /* gap: 8px; */
`
const PriceCell = styled(DataCell)`
  /* padding-right: 8px; */
`
const PercentChangeCell = styled(DataCell)`
  /* padding-right: 8px; */
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    display: none;
  }
`
const PercentChangeInfoCell = styled(Cell)`
  display: none;

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    display: flex;
    justify-content: flex-end;
    color: ${({ theme }) => theme.textPrimary};
    line-height: 16px;
  }
`
const PriceInfoCell = styled(Cell)`
  justify-content: flex-start;
  display: flex;
  line-height: 18px;
  flex-direction: column;
  align-items: flex-start;
  /* margin-left: 16px; */
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const HeaderCellWrapper = styled.span<{ onClick?: () => void }>`
  align-items: center;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'unset')};
  display: flex;
  gap: 4px;
  justify-content: flex-start;
  width: 100%;

  &:hover {
    ${ClickableStyle}
  }
`
const SparkLineCell = styled(Cell)`
  padding: 0px 24px;
  min-width: 120px;

  @media only screen and (max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT}) {
    display: none;
  }
`
const SparkLine = styled(Cell)`
  width: 124px;
  height: 42px;
`
const StyledLink = styled(Link)`
  text-decoration: none;
`
const TokenInfoCell = styled(Cell)`
  gap: 10px;
  line-height: 24px;
  max-width: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    justify-content: flex-start;
    gap: 8px;
    width: max-content;
    font-weight: 500;
  }
`
const TokenName = styled.div`
  justify-content: flex-start;
  display: flex;
  line-height: 18px;
  flex-direction: column;
  align-items: flex-start;
  /* margin-left: 16px; */
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    flex-direction: column;
    align-items: flex-start;
  }
`
const TokenSymbol = styled(Cell)`
  color: ${({ theme }) => theme.textTertiary};
  text-transform: uppercase;

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    height: 16px;
    justify-content: flex-start;
    width: 100%;
  }
`
const VolumeCell = styled(DataCell)`
  /* padding-right: 8px; */
  @media only screen and (max-width: ${LARGE_MEDIA_BREAKPOINT}) {
    display: none;
  }
`
const ButtonCell = styled(DataCell)`
  /* padding-right: 8px; */
  display: flex;
  justify-content: end;
  @media only screen and (max-width: ${LARGE_MEDIA_BREAKPOINT}) {
    display: none;
  }
`

const SmallLoadingBubble = styled(LoadingBubble)`
  width: 25%;
`
const MediumLoadingBubble = styled(LoadingBubble)`
  width: 65%;
`
const LongLoadingBubble = styled(LoadingBubble)`
  width: 90%;
`
const IconLoadingBubble = styled(LoadingBubble)`
  border-radius: 50%;
  width: 24px;
`
export const SparkLineLoadingBubble = styled(LongLoadingBubble)`
  height: 4px;
`

const InfoIconContainer = styled.div`
  margin-left: 2px;
  display: flex;
  align-items: center;
  cursor: help;
`
enum TokenSortMethod {
  PRICE = 'Price',
  PERCENT_CHANGE = 'Change',
  TOTAL_VALUE_LOCKED = 'TVL',
  VOLUME = 'Volume',
  APR = 'Est APR',
  URate = 'Util Rate',
}

export const filterStringAtom = atomWithReset<string>('')
export const filterTimeAtom = atom<TimePeriod>(TimePeriod.DAY)
export const sortMethodAtom = atom<TokenSortMethod>(TokenSortMethod.VOLUME)
export const sortAscendingAtom = atom<boolean>(false)

/* keep track of sort category for token table */
export function useSetSortMethod(newSortMethod: TokenSortMethod) {
  const [sortMethod, setSortMethod] = useAtom(sortMethodAtom)
  const [sortAscending, setSortAscending] = useAtom(sortAscendingAtom)

  return useCallback(() => {
    if (sortMethod === newSortMethod) {
      setSortAscending(!sortAscending)
    } else {
      setSortMethod(newSortMethod)
      setSortAscending(false)
    }
  }, [sortMethod, setSortMethod, setSortAscending, sortAscending, newSortMethod])
}

export const HEADER_DESCRIPTIONS: Record<TokenSortMethod, ReactNode | undefined> = {
  [TokenSortMethod.PRICE]: undefined,
  [TokenSortMethod.PERCENT_CHANGE]: undefined,
  [TokenSortMethod.TOTAL_VALUE_LOCKED]: (
    <Trans>Total value locked (TVL) is the aggregate amount of the asset available in this liquidity pool.</Trans>
  ),
  [TokenSortMethod.VOLUME]: (
    <Trans>Volume is the amount of the asset that has been traded on Limitless during the selected time frame.</Trans>
  ),
  [TokenSortMethod.APR]: (
    <Trans>
      Estimated APR is the expected APR, with the given volume and utilization rate, the return as an LP for providing
      liquidity between 50% and 200% of current price
    </Trans>
  ),
  [TokenSortMethod.URate]: (
    <Trans>
      Utilization rate is the averaged utilization rate across all ticks of the pool. The higher it is, the higher the
      APR.
    </Trans>
  ),
}

// price, TVL, volume, util rate, expected apr

/* Get singular header cell for header row */
function HeaderCell({
  category,
}: {
  category: TokenSortMethod // TODO: change this to make it work for trans
}) {
  const theme = useTheme()
  const sortAscending = useAtomValue(sortAscendingAtom)
  const handleSortCategory = useSetSortMethod(category)
  const sortMethod = useAtomValue(sortMethodAtom)

  const description = HEADER_DESCRIPTIONS[category]

  return (
    <HeaderCellWrapper onClick={handleSortCategory}>
      {sortMethod === category && (
        <>
          {sortAscending ? (
            <ArrowUp size={12} strokeWidth={1.8} color={theme.accentActive} />
          ) : (
            <ArrowDown size={12} strokeWidth={1.8} color={theme.accentActive} />
          )}
        </>
      )}
      {category}
      {description && (
        <MouseoverTooltip text={description} placement="right">
          <InfoIconContainer>
            <Info size={14} />
          </InfoIconContainer>
        </MouseoverTooltip>
      )}
    </HeaderCellWrapper>
  )
}

/* Token Row: skeleton row component */
function TokenRow({
  header,
  listNumber,
  tokenInfo,
  price,
  percentChange,
  tvl,
  volume,
  APR,
  UtilRate,
  sparkLine,
  currency0,
  currency1,
  ...rest
}: {
  first?: boolean
  header: boolean
  listNumber?: ReactNode
  loading?: boolean
  tvl: ReactNode
  price: ReactNode
  percentChange: ReactNode
  sparkLine?: ReactNode
  tokenInfo: ReactNode
  volume: ReactNode
  APR: ReactNode
  UtilRate: ReactNode
  currency0?: string
  currency1?: string
  last?: boolean
  style?: CSSProperties
}) {
  const navigate = useNavigate()

  const rowCells = (
    <>
      {/* <ListNumberCell header={header}>{listNumber}</ListNumberCell> */}

      <NameCell data-testid="name-cell">{tokenInfo}</NameCell>

      <PriceCell data-testid="price-cell" sortable={header}>
        {price}
      </PriceCell>
      {/*<PercentChangeCell data-testid="percent-change-cell" sortable={header}>
        {percentChange}
      </PercentChangeCell> */}
      <VolumeCell data-testid="volume-cell" sortable={header}>
        {APR}
      </VolumeCell>
      <TvlCell data-testid="tvl-cell" sortable={header}>
        {tvl}
      </TvlCell>
      <VolumeCell data-testid="volume-cell" sortable={header}>
        {volume}
      </VolumeCell>
      <VolumeCell data-testid="volume-cell" sortable={header}>
        {UtilRate}
      </VolumeCell>
      {!header && (
        <ButtonCell data-testid="volume-cell" sortable={header}>
          <ButtonPrimary
            style={{
              marginLeft: '20px',
              padding: '.5rem',
              width: 'fit-content',
              fontSize: '0.7rem',
              borderRadius: '10px',
              height: '30px',
              lineHeight: '1',
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (currency1 && currency0) {
                navigate('/add/' + currency0 + '/' + currency1 + '/' + '500', {
                  state: { currency0, currency1 },
                })
              }
            }}
          >
            <Trans>Provide</Trans>
          </ButtonPrimary>
          <ButtonPrimary
            style={{
              marginLeft: '20px',
              padding: '.5rem',
              width: 'fit-content',
              fontSize: '0.7rem',
              borderRadius: '10px',
              height: '30px',
              lineHeight: '1',
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (currency1 && currency0) {
                navigate('/add/' + currency0 + '/' + currency1 + '/' + '500', {
                  state: { currency0, currency1 },
                })
              }
            }}
          >
            <Trans>Withdraw</Trans>
          </ButtonPrimary>
        </ButtonCell>
      )}
      {/*
        !header && 
      <ButtonPrimary
        style={{ marginLeft: '20px', padding: '.3rem', width: 'fit-content', fontSize: '0.825rem', borderRadius: '12px' }}
        onClick={() =>{if(currency1&&currency0){
            navigate('/swap', {state: {currency0:currency0, currency1: currency1 }})}}
        } >
        <Trans>Go to pair</Trans>
      </ButtonPrimary>
      */}

      {/*<SparkLineCell>{sparkLine}</SparkLineCell> */}
    </>
  )
  if (header) return <StyledHeaderRow data-testid="header-row">{rowCells}</StyledHeaderRow>
  return <StyledTokenRow {...rest}>{rowCells}</StyledTokenRow>
}

/* Header Row: top header row component for table */
export function PHeaderRow() {
  return (
    <TokenRow
      header={true}
      listNumber=""
      tokenInfo={<Trans>Pair</Trans>}
      price={<HeaderCell category={TokenSortMethod.PRICE} />}
      percentChange={<HeaderCell category={TokenSortMethod.PERCENT_CHANGE} />}
      tvl={<HeaderCell category={TokenSortMethod.TOTAL_VALUE_LOCKED} />}
      volume={<HeaderCell category={TokenSortMethod.VOLUME} />}
      APR={<HeaderCell category={TokenSortMethod.APR} />}
      UtilRate={<HeaderCell category={TokenSortMethod.URate} />}
      // volume={<HeaderCell category={""} />}

      sparkLine={null}
    />
  )
}

/* Loading State: row component with loading bubbles */
export function PLoadingRow(props: { first?: boolean; last?: boolean }) {
  return (
    <TokenRow
      header={false}
      listNumber={<SmallLoadingBubble />}
      loading
      tokenInfo={
        <>
          <IconLoadingBubble />
          <MediumLoadingBubble />
        </>
      }
      price={<MediumLoadingBubble />}
      percentChange={<LoadingBubble />}
      tvl={<LoadingBubble />}
      volume={<LoadingBubble />}
      APR={<LoadingBubble />}
      UtilRate={<LoadingBubble />}
      sparkLine={<SparkLineLoadingBubble />}
      {...props}
    />
  )
}

interface LoadedRowProps {
  tokenListIndex: number
  tokenListLength: number
  tokenA: string
  tokenB: string
  //token: NonNullable<TopToken>
  sparklineMap?: SparklineMap
  sortRank?: number
}

/* Loaded State: row component with token information */
export const PLoadedRow = forwardRef((props: LoadedRowProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { tokenListIndex, tokenListLength, tokenA, tokenB, sortRank } = props
  const filterString = useAtomValue(filterStringAtom)

  const filterNetwork = validateUrlChainParam(useParams<{ chainName?: string }>().chainName?.toUpperCase())
  const chainId = CHAIN_NAME_TO_CHAIN_ID[filterNetwork]
  const timePeriod = useAtomValue(filterTimeAtom)
  const delta = 0 //token.market?.pricePercentChange?.value
  const arrow = getDeltaArrow(delta)
  const smallArrow = getDeltaArrow(delta, 14)
  const formattedDelta = formatDelta(delta)

  const currencyIda = useToken(tokenA)
  const currencyIdb = useToken(tokenB)

  const exploreTokenSelectedEventProperties = {
    chain_id: chainId,
    token_address: currencyIda?.address,
    token_symbol: currencyIda?.symbol,
    token_list_index: tokenListIndex,
    // token_list_rank: sortRank,
    token_list_length: tokenListLength,
    time_frame: timePeriod,
    search_token_address_input: filterString,
  }
  //   <MenuItem href="/swap" isActive={pathname.startsWith('/swap')}>
  //   <Trans>Swap</Trans>
  // </MenuItem>
  // logo, tokenname, price, tvl,
  // go to swap page
  // TODO: currency logo sizing mobile (32px) vs. desktop (24px)
  const {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
    onLeverageFactorChange,
    onHideClosedLeveragePositions,
    onLeverageChange,
    onLeverageManagerAddress,
  } = useSwapActionHandlers()
  // const handleInputSelect = useCallback(
  //   (inputCurrency: Currency) => {
  //     onCurrencySelection(Field.INPUT, inputCurrency)
  //   },
  //   [onCurrencySelection]
  // )
  const navigate = useNavigate()
  const handleInputSelect = (inputCurrency: Currency) => {
    onCurrencySelection(Field.INPUT, inputCurrency)
  }

  const handleOutputSelect = useCallback(
    (outputCurrency: Currency) => onCurrencySelection(Field.OUTPUT, outputCurrency),
    [onCurrencySelection]
  )
  //   const {
  //   // trade: { state: tradeState, trade },
  //   // allowedSlippage,
  //   // currencyBalances,
  //   // parsedAmount,
  //   currencies,
  //   // inputError: swapInputError,
  // } = useDerivedSwapInfo()
  const baseCurrency = useCurrency(currencyIda?.address)
  const quoteCurrency = useCurrency(currencyIdb?.address)

  const [token0, token1] =
    baseCurrency && quoteCurrency && quoteCurrency?.wrapped.sortsBefore(baseCurrency?.wrapped)
      ? [baseCurrency, quoteCurrency]
      : [quoteCurrency, baseCurrency]

  const [poolState, pool] = usePool(token0 ?? undefined, token1 ?? undefined, FeeAmount.LOW)
  // console.log('pools', token0.address, token1.address, pool)
  const currentPrice = pool?.token0Price.toSignificant(6)
  const priceRounded =
    currencyIdb?.address == '0xf24Ce4A61c1894219576f652cDF781BBB257Ec8F'
      ? ((Math.round(1 / Number(currentPrice)) * 1000000) / 1000000).toString()
      : (Math.round(Number(currentPrice) * 1000000) / 1000000).toString()
  const fomatter = new Intl.NumberFormat(navigator.language)

  const tickLow = Number((Number(pool?.token0Price.toSignificant(6)) * 0.9).toFixed(0))
  const tickHigh = Number((Number(pool?.token0Price.toSignificant(6)) * 1.1).toFixed(0))

  const data = useRateAndUtil(pool?.token0.address, pool?.token1.address, pool?.fee, tickLow, tickHigh)
  console.log(data)

  let tvl_
  let volume_
  let estimatedapr_
  let urate_

  if (
    currencyIda?.address == '0x569f3140FDc0f3B9Fc2E4919C35f35D39dd2B01A' &&
    currencyIdb?.address == '0x4E3F175b38098326a34F2C8B2D07AF5fFdfc6fA9'
  ) {
    tvl_ = 2313000000
    volume_ = 1300000
    estimatedapr_ = 23.5
    urate_ = 42.32
  } else if (
    currencyIda?.address == '0x569f3140FDc0f3B9Fc2E4919C35f35D39dd2B01A' &&
    currencyIdb?.address == '0xf24Ce4A61c1894219576f652cDF781BBB257Ec8F'
  ) {
    tvl_ = 1530000000
    volume_ = 210000
    estimatedapr_ = 32.1
    urate_ = 77.6
  } else {
    tvl_ = 3212000000
    volume_ = 2830000
    estimatedapr_ = 25.7
    urate_ = 56.3
  }
  return (
    <RowWrapper
      ref={ref}
      onClick={() => {
        if (token0 && token1) {
          navigate({
            pathname: '/swap',
            search: `?inputCurrency=${(token0 as any)?.address}&outputCurrency=${(token1 as any)?.address}`,
          })
        }
      }}
      data-testid={`token-table-row-${currencyIda?.symbol}`}
    >
      <TokenRow
        header={false}
        // listNumber={sortRank}
        currency0={token0}
        currency1={token1}
        tokenInfo={
          <ClickableName>
            {/* <QueryTokenLogo token={token} /> */}
            <TokenInfoCell>
              <DoubleCurrencyLogo currency0={token0} currency1={token1} size={20} margin={true} />
              <TokenName data-cy="token-name">
                <span>{token0?.symbol}</span>
                <span>{token1?.symbol}</span>
              </TokenName>
              {/* <TokenSymbol>{token0.symbol}</TokenSymbol> */}
            </TokenInfoCell>
          </ClickableName>
        }
        price={
          <ClickableContent>
            <PriceInfoCell>
              <Price>{currentPrice && fomatter.format(Number(priceRounded))}</Price>
              <span>{token0?.symbol + '/' + token1?.symbol}</span>
              {/* {currentPrice && priceRounded + ' ' + token0.symbol + '/' + token1.symbol} */}
              {/*<PercentChangeInfoCell>
                  <ArrowCell>{smallArrow}</ArrowCell>
                  <DeltaText delta={delta}>{formattedDelta}</DeltaText>
                </PercentChangeInfoCell>*/}
            </PriceInfoCell>
          </ClickableContent>
        }
        percentChange={
          <ClickableContent>
            <ArrowCell>{arrow}</ArrowCell>
            <DeltaText delta={delta}>{formattedDelta}</DeltaText>
          </ClickableContent>
        }
        tvl={
          <ClickableContent>
            {formatNumber(tvl_, NumberType.FiatTokenStats)}
            <span style={{ paddingLeft: '.25rem', color: 'gray' }}>usd</span>
          </ClickableContent>
        }
        volume={
          <ClickableContent>
            {formatNumber(volume_, NumberType.FiatTokenStats)}{' '}
            <span style={{ paddingLeft: '.25rem', color: 'gray' }}>usd</span>
          </ClickableContent>
        }
        APR={<ClickableRate rate={estimatedapr_}>{Number(data?.apr) / 1e18 + '%'}</ClickableRate>}
        UtilRate={<ClickableRate rate={urate_}>{Number(data?.utilTotal) / 1e18 + '%'}</ClickableRate>}
        // sparkLine={
        //   <SparkLine>
        //     <ParentSize>
        //       {({ width, height }) =>
        //         props.sparklineMap && (
        //           <SparklineChart
        //             width={width}
        //             height={height}
        //             tokenData={token}
        //             pricePercentChange={token.market?.pricePercentChange?.value}
        //             sparklineMap={props.sparklineMap}
        //           />
        //         )
        //       }
        //     </ParentSize>
        //   </SparkLine>
        // }
        first={tokenListIndex === 0}
        last={tokenListIndex === tokenListLength - 1}
        // @ts-ignore
        currency0={token0?.address}
        // @ts-ignore
        currency1={token1?.address}
      />

      {/*</ClickableContent> */}
    </RowWrapper>
  )
})

PLoadedRow.displayName = 'LoadedRow'

const Price = styled.span`
  font-weight: 700;
`

const Symbol = styled.span`
  color: ;
`
const RowWrapper = styled.div`
  border-top: 1px solid;
  border-color: ${({ theme }) => theme.backgroundOutline};
  cursor: pointer;
`
