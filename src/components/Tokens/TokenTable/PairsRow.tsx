import { Trans } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { Currency } from '@uniswap/sdk-core'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { getPoolId } from 'components/PositionTable/LeveragePositionTable/TokenRow'
import { SparklineMap } from 'graphql/data/TopTokens'
import { CHAIN_NAME_TO_CHAIN_ID, validateUrlChainParam } from 'graphql/data/util'
import { useRateAndUtil } from 'hooks/useLMTV2Positions'
import { usePool } from 'hooks/usePools'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { ForwardedRef, forwardRef, useMemo } from 'react'
import { CSSProperties, ReactNode } from 'react'
import {
  useCallback,
  //useEffect, useMemo, useState
} from 'react'
import { Link, useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useTickDiscretization } from 'state/mint/v3/hooks'
import styled, { css } from 'styled-components/macro'
import { ClickableStyle } from 'theme'
import { formatDollar, formatDollarAmount } from 'utils/formatNumbers'
import { roundToBin } from 'utils/roundToBin'

import { useCurrency, useToken } from '../../../hooks/Tokens'
import {
  useSwapActionHandlers,
  useSwapState,
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
import { DeltaText } from '../TokenDetails/PriceChart'

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
  font-size: 12px;
  grid-template-columns: 4fr 4fr 3.5fr 4.5fr 4fr 4fr 2fr 5fr;
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
    grid-template-columns: 4fr 4fr 4fr 4fr 4fr 4fr 2fr 5fr;
    font-size: 12px;
  }

  @media only screen and (max-width: ${LARGE_MEDIA_BREAKPOINT}) {
    grid-template-columns: 4fr 4fr 4fr 4fr 4fr 4fr 2fr 5fr;

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
  font-size: 13px;
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
    font-size: 13px;
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

export const HeaderCellWrapper = styled.span<{ onClick?: () => void }>`
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

export const InfoIconContainer = styled.div`
  margin-left: 2px;
  display: flex;
  align-items: center;
  cursor: help;
`

/* Token Row: skeleton row component */
export function TokenRow({
  header,
  listNumber,
  tokenInfo,
  price,
  // percentChange,
  tvl,
  volume,
  APR,
  UtilRate,
  sparkLine,
  currency0,
  currency1,
  fee,
  priceChange,
  ...rest
}: {
  first?: boolean
  header: boolean
  listNumber?: ReactNode
  loading?: boolean
  tvl: ReactNode
  price: ReactNode
  // percentChange: ReactNode
  sparkLine?: ReactNode
  tokenInfo: ReactNode
  volume: ReactNode
  priceChange: ReactNode
  APR: ReactNode
  UtilRate: ReactNode
  currency0?: string
  currency1?: string
  last?: boolean
  style?: CSSProperties
  fee?: number
}) {
  const navigate = useNavigate()
  // const { onCurrencySelection } = useSwapActionHandlers()
  const { onPoolSelection } = useSwapActionHandlers()
  const token0 = useCurrency(currency0)
  const token1 = useCurrency(currency1)
  const { poolId } = useSwapState()

  const rowCells = (
    <>
      {/* <ListNumberCell header={header}>{listNumber}</ListNumberCell> */}

      <NameCell data-testid="name-cell">{tokenInfo}</NameCell>

      <PriceCell data-testid="price-cell" sortable={header}>
        {price}
      </PriceCell>
      <PriceCell data-testid="price-change-cell" sortable={header}>
        {priceChange}
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
              padding: '.5rem',
              width: 'fit-content',
              fontSize: '0.7rem',
              borderRadius: '10px',
              height: '30px',
              lineHeight: '1',
            }}
            onClick={(e) => {
              const id = getPoolId(currency0, currency1, fee)
              e.stopPropagation()
              if (currency1 && currency0 && token0 && token1 && fee && id && poolId !== id) {
                onPoolSelection(token0, token1, {
                  token0: token0.wrapped.address,
                  token1: token1.wrapped.address,
                  fee,
                })
                navigate('/add/' + currency0 + '/' + currency1 + '/' + `${fee}`, {
                  state: { currency0, currency1 },
                })
              }
            }}
          >
            <Trans>Provide</Trans>
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

interface LoadedRowProps {
  tokenListIndex: number
  tokenListLength: number
  tokenA: string
  tokenB: string
  //token: NonNullable<TopToken>
  sparklineMap?: SparklineMap
  sortRank?: number
  fee: number
  tvl?: number
  volume?: number
  price?: number
  delta?: number
}

/* Loaded State: row component with token information */
export const PLoadedRow = forwardRef((props: LoadedRowProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { tokenListIndex, tokenListLength, tokenA, tokenB, sortRank, tvl, volume, fee, price, delta } = props

  const filterNetwork = validateUrlChainParam(useParams<{ chainName?: string }>().chainName?.toUpperCase())
  const chainId = CHAIN_NAME_TO_CHAIN_ID[filterNetwork]

  const currencyIda = useToken(tokenA)
  const currencyIdb = useToken(tokenB)

  const exploreTokenSelectedEventProperties = {
    chain_id: chainId,
    token_address: currencyIda?.address,
    token_symbol: currencyIda?.symbol,
    token_list_index: tokenListIndex,
    // token_list_rank: sortRank,
    token_list_length: tokenListLength,
    // time_frame: timePeriod,
    // search_token_address_input: filterString,
  }

  // TODO: currency logo sizing mobile (32px) vs. desktop (24px)
  const { onPoolSelection } = useSwapActionHandlers()

  const navigate = useNavigate()
  const { poolId } = useSwapState()
  const handleCurrencySelect = useCallback(
    (currencyIn: Currency, currencyOut: Currency, fee: number) => {
      const id = getPoolId(currencyIn?.wrapped.address, currencyOut?.wrapped.address, fee)
      if (currencyIn && currencyOut && id && poolId !== id) {
        onPoolSelection(currencyIn, currencyOut, {
          token0: currencyIn.wrapped.sortsBefore(currencyOut.wrapped)
            ? currencyIn.wrapped.address
            : currencyOut.wrapped.address,
          token1: currencyIn.wrapped.sortsBefore(currencyOut.wrapped)
            ? currencyOut.wrapped.address
            : currencyIn.wrapped.address,
          fee,
        })
      }
    },
    [onPoolSelection, poolId]
  )

  const baseCurrency = useCurrency(currencyIda?.address)
  const quoteCurrency = useCurrency(currencyIdb?.address)

  const [token0, token1] =
    baseCurrency && quoteCurrency && quoteCurrency?.wrapped.sortsBefore(baseCurrency?.wrapped)
      ? [baseCurrency, quoteCurrency]
      : [quoteCurrency, baseCurrency]

  const [, pool] = usePool(token0 ?? undefined, token1 ?? undefined, fee ?? undefined)

  const { tickDiscretization } = useTickDiscretization(pool?.token0.address, pool?.token1.address, pool?.fee)
  const [tickLower, tickUpper] = useMemo(() => {
    if (pool && tickDiscretization) {
      return [
        roundToBin(pool.tickCurrent - 1000, tickDiscretization, true),
        roundToBin(pool.tickCurrent + 1000, tickDiscretization, false),
      ]
    }
    return [undefined, undefined]
  }, [pool, tickDiscretization])
  // console.log("rateanduti????",token0, token1, pool,
  //   pool?.token0, pool?.token1, pool?.fee, tickLower, tickUpper
  //   )
  const { result: rateUtilData } = useRateAndUtil(
    pool?.token0.address,
    pool?.token1.address,
    pool?.fee,
    tickLower,
    tickUpper
  )

  return (
    <RowWrapper
      ref={ref}
      onClick={() => {
        if (token0 && token1 && pool) {
          navigate({
            pathname: '/swap',
          })
          handleCurrencySelect(token0, token1, pool.fee)
        }
      }}
      data-testid={`token-table-row-${currencyIda?.symbol}`}
    >
      <TokenRow
        fee={pool?.fee}
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
              <Price>{formatDollarAmount({ num: price, long: true })}</Price>
              <span>{token0?.symbol + '/' + token1?.symbol}</span>
            </PriceInfoCell>
          </ClickableContent>
        }
        priceChange={
          <ClickableContent>
            <PriceInfoCell>
              <DeltaText delta={delta}>{delta ? (delta * 100).toFixed(2) + '%' : '-'}</DeltaText>
            </PriceInfoCell>
          </ClickableContent>
        }
        // percentChange={
        //   <ClickableContent>
        //     <ArrowCell>{arrow}</ArrowCell>
        //     <DeltaText delta={delta}>{formattedDelta}</DeltaText>
        //   </ClickableContent>
        // }
        tvl={<ClickableContent>{formatDollar({ num: tvl, digits: 1 })}</ClickableContent>}
        volume={<ClickableContent>{formatDollar({ num: volume, digits: 1 })}</ClickableContent>}
        APR={
          <>
            <ClickableRate
              rate={Number(formatBNToString(rateUtilData?.apr.times(1), NumberType.TokenNonTx))}
            >{`${formatBNToString(rateUtilData?.apr.times(1), NumberType.TokenNonTx)} %`}</ClickableRate>
            <span style={{ paddingLeft: '.25rem', color: 'gray' }}>+ swap fees</span>
          </>
        }
        UtilRate={
          <ClickableRate rate={Number(formatBNToString(rateUtilData?.util.times(1)))}>{`${formatBNToString(
            rateUtilData?.util.times(1)
          )} %`}</ClickableRate>
        }
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
