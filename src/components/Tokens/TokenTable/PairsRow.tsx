import { Trans } from '@lingui/macro'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { LMT_PER_USD_PER_DAY, LMT_PER_USD_PER_DAY_USDC, LMT_PER_USD_PER_DAY_NZT } from 'constants/misc'
import { TokenStatus, TokenStatusKey } from 'constants/newOrHot'
import { SparklineMap } from 'graphql/data/TopTokens'
import { useEstimatedAPR, usePool, usePoolV2 } from 'hooks/usePools'
import { useAtomValue } from 'jotai'
import { ForwardedRef, forwardRef, useMemo, useState } from 'react'
import { CSSProperties, ReactNode } from 'react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentPool, useSetCurrentPool } from 'state/user/hooks'
import styled, { css } from 'styled-components/macro'
import { ClickableStyle, ThemedText } from 'theme'
import { PoolKey } from 'types/lmtv2position'
import { formatDollar, formatDollarAmount } from 'utils/formatNumbers'
import { getPoolId } from 'utils/lmtSDK/LmtIds'

import { useCurrency } from '../../../hooks/Tokens'
import { SmallButtonPrimary } from '../../Button'
import {
  LARGE_MEDIA_BREAKPOINT,
  MAX_WIDTH_MEDIA_BREAKPOINT,
  MEDIUM_MEDIA_BREAKPOINT,
  SMALL_MEDIA_BREAKPOINT,
} from '../constants'
import { LoadingBubble } from '../loading'
import { filterStringAtom } from '../state'
import { DeltaText } from '../TokenDetails/PriceChart'
import ZapModal from './ZapModal/ZapModal'

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
  // grid-template-columns: 4fr 4fr 3.5fr 4.5fr 4fr 4fr 2fr 5fr;
  grid-template-columns: 4fr 4fr 3.5fr 4.5fr 4fr 4fr 3fr 4fr;
  padding-left: 1rem;
  padding-right: 1rem;
  /* max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT}; */
  // max-width: 1480px;
  min-width: 390px;

  ${({ first, last }) => css`
    height: 5rem;
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
    /* grid-template-columns: 4fr 4fr 4fr 4fr 4fr 4fr 2fr 5fr; */
    grid-template-columns: 4fr 4fr 4fr 4fr;
  }

  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    /* grid-template-columns: 1fr 10fr 5fr 5fr 1.2fr; */
    grid-template-columns: 4fr 4fr 4fr;
  }

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    grid-template-columns: 2fr 1fr;
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
  color: ${({ theme, rate }) => (!rate ? theme.textSecondary : rate >= 0 ? '#10CC83' : '#FA3C58')};
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
export const ClickableRate = styled(ClickableContent)`
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

/* const ListNumberCell = styled(Cell)<{ header: boolean }>`
  color: ${({ theme }) => theme.textPrimary};
  min-width: 32px;

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    display: none;
  }
` */
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
  margin-left: 8px;
  /* gap: 8px; */
`
const PriceCell = styled(DataCell)`
  display: flex;
  flex-direction; column;
  /* @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    display: none;
  } */
  /* padding-right: 8px; */
`

const PriceChangeCell = styled(DataCell)`
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    display: none;
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

const TokenInfoCell = styled(Cell)`
  position: relative;
  gap: 10px;
  line-height: 24px;
  max-width: inherit;
  /* overflow: hidden; */
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
  gap: 10px;
  justify-content: end;
  @media only screen and (max-width: ${LARGE_MEDIA_BREAKPOINT}) {
    display: none;
  }
`

const LongLoadingBubble = styled(LoadingBubble)`
  width: 90%;
`

const NewOrHotStatusText = styled(ThemedText.BodySmall)`
  color: ${({ theme }) => theme.newOrHot};
`

const HotStatusText = styled(ThemedText.BodySmall)`
  padding-bottom: 13px;
  font-size: 13px;
  color: ${({ theme }) => theme.newOrHot};
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

interface Position {
  currentPrice: number
  token0PriceUSD: number
  token1PriceUSD: number
  token0Decimals: number
  token1Decimals: number
  lower: number
  upper: number
  amount: number
  fee: number
}

/* Token Row: skeleton row component */
export function TokenRow({
  header,
  listNumber,
  tokenInfo,
  price,
  loading,
  // percentChange,
  tvl,
  volume,
  APR,
  dailyLMT,
  sparkLine,
  currency0,
  currency1,
  fee,
  priceChange,
  buttons,
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
  dailyLMT: ReactNode
  currency0?: string
  currency1?: string
  last?: boolean
  style?: CSSProperties
  fee?: number
  buttons: ReactNode
}) {
  const rowCells = (
    <>
      <NameCell data-testid="name-cell">{tokenInfo}</NameCell>
      <PriceCell data-testid="price-cell" sortable={header}>
        {price}
      </PriceCell>
      <PriceChangeCell data-testid="price-change-cell" sortable={header}>
        {priceChange}
      </PriceChangeCell>
      <VolumeCell data-testid="volume-cell" sortable={header}>
        {APR}
      </VolumeCell>
      <VolumeCell data-testid="volume-cell" sortable={header}>
        {dailyLMT}
      </VolumeCell>
      <TvlCell data-testid="tvl-cell" sortable={header}>
        {tvl}
      </TvlCell>
      <VolumeCell data-testid="volume-cell" sortable={header}>
        {volume}
      </VolumeCell>
      {!header && loading ? (
        <ButtonCell data-testid="volume-cell" sortable={header}>
          <LoadingBubble />
        </ButtonCell>
      ) : (
        !header && (
          <ButtonCell data-testid="volume-cell" sortable={header}>
            {buttons}
          </ButtonCell>
        )
      )}
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
  poolKey: PoolKey
  poolOHLC: any
  //token: NonNullable<TopToken>
  sparklineMap?: SparklineMap
  sortRank?: number
  fee: number
  tvl?: number
  volume?: number
  price?: number
  // pricesUSD?: any
  usdPriceData?: any
  delta?: number
  apr?: number
  dailyLMT?: number
}

/* Loaded State: row component with token information */
export const PLoadedRow = forwardRef((props: LoadedRowProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { tokenListIndex, tokenListLength, tokenA, tokenB, tvl, volume, fee, apr, poolKey, usdPriceData, poolOHLC } =
    props

  const currencyIda = useCurrency(tokenA)

  const setCurrentPool = useSetCurrentPool()

  const navigate = useNavigate()
  const currentPool = useCurrentPool()

  const currentPoolId = currentPool?.poolId

  const token0Address = tokenA && tokenB ? (tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenA : tokenB) : null
  const token1Address = tokenA && tokenB ? (tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenB : tokenA) : null
  const token0 = useCurrency(token0Address)
  const token1 = useCurrency(token1Address)

  const [, pool, tickSpacing] = usePoolV2(token0 ?? undefined, token1 ?? undefined, fee ?? undefined)

  const baseCurrency = poolOHLC ? (poolOHLC.token0IsBase ? token0 : token1) : null
  const quoteCurrency = poolOHLC ? (poolOHLC.token0IsBase ? token1 : token0) : null

  const poolId = getPoolId(tokenA, tokenB, fee)

  const handleCurrencySelect = useCallback(() => {
    if (currentPoolId !== poolId && token0?.symbol && token1?.symbol && poolOHLC) {
      setCurrentPool(poolId, !poolOHLC.token0IsBase, poolOHLC.token0IsBase, token0.symbol, token1.symbol)
    }
  }, [setCurrentPool, currentPoolId, poolId, poolOHLC, token0, token1])

  const [price, delta] = useMemo(() => {
    if (poolOHLC) {
      return [poolOHLC.priceNow, poolOHLC.delta24h]
    }
    return [undefined, undefined]
  }, [poolOHLC])

  const depositAmountUSD = 1000

  const priceUSD = useMemo(() => {
    if (Object.entries(usdPriceData).length > 0 && baseCurrency) {
      return usdPriceData[baseCurrency.wrapped.address.toLowerCase()].usdPrice
    } else return '0'
  }, [usdPriceData, baseCurrency])

  const priceInverted = poolOHLC?.token0IsBase ? price : price ? 1 / price : 0

  const [token0Range, token1Range] = useMemo(() => {
    if (token0?.symbol === 'USDC' || token1?.symbol === 'USDC') {
      return [0.95, 1.05]
    } else {
      return [undefined, undefined]
    }
  }, [token0, token1])

  const rawEstimatedAPR = useEstimatedAPR(
    token0,
    token1,
    pool,
    tickSpacing,
    priceInverted,
    depositAmountUSD,
    token0Range,
    token1Range,
    usdPriceData
  )


  const estimatedAPR = useMemo(() => {
    if (Boolean(!token0 || !token1 || !rawEstimatedAPR)) return undefined
    if (token0?.symbol === 'USDC' || token1?.symbol === 'USDC') {
      return rawEstimatedAPR / 3
    } else {
      return rawEstimatedAPR
    }
  }, [token0, token1, rawEstimatedAPR])

  const filterString = useAtomValue(filterStringAtom)

  const filtered = useMemo(() => {
    if (token0 && token1 && filterString) {
      const includesToken0 = (token0?.symbol?.toLowerCase() ?? '').includes(filterString.toLowerCase())
      const includesToken1 = (token1?.symbol?.toLowerCase() ?? '').includes(filterString.toLowerCase())

      return includesToken0 || includesToken1
    } else {
      return true
    }
  }, [filterString, token0, token1])

  const [showModal, setShowModal] = useState(false)
  const handleCloseModal = useCallback(() => {
    setShowModal(false)
  }, [])

  const handleProvide = useCallback(
    (e: any) => {
      e.stopPropagation()
      if (token0Address && token1Address && fee) {
        navigate('/add/' + token0Address + '/' + token1Address + '/' + `${fee}`, {
          state: { token0Address, token1Address },
        })
      }
    },
    [fee, navigate, token0Address, token1Address]
  )

  const handleZap = useCallback(
    (e: any) => {
      e.stopPropagation()
      setShowModal(true)
    },
    [setShowModal]
  )


  return filtered ? (
    <RowWrapper
      ref={ref}
      onClick={() => {
        handleCurrencySelect()
        navigate({
          pathname: '/trade',
        })
      }}
      data-testid={`token-table-row-${currencyIda?.symbol}`}
    >
      {' '}
      {showModal && (
        <ZapModal
          isOpen={showModal}
          onClose={handleCloseModal}
          apr={(apr !== undefined && estimatedAPR !== undefined) ? apr + estimatedAPR : undefined}
          tvl={tvl}
          token0={token0}
          token1={token1}
          poolKey={poolKey}
        />
      )}
      <TokenRow
        fee={poolKey?.fee}
        header={false}
        tokenInfo={
          <ClickableName>
            <TokenInfoCell>
              <DoubleCurrencyLogo currency0={baseCurrency} currency1={quoteCurrency} size={20} margin={true} />
              <TokenName data-cy="token-name">
                <span>{token0?.symbol}</span>
                <span>{token1?.symbol}</span>
              </TokenName>
              {token0?.symbol &&
                token1?.symbol && (
                  <NewOrHotStatusText
                    fontWeight={600}
                    paddingBottom={TokenStatus[token0.symbol as TokenStatusKey] === '🔥' || TokenStatus[token1.symbol as TokenStatusKey] === '🔥' ? "16px" : "9px"}
                    fontSize={TokenStatus[token0.symbol as TokenStatusKey] === '🔥' || TokenStatus[token1.symbol as TokenStatusKey] === '🔥' ? undefined : "14px"}>
                    {TokenStatus[token0.symbol as TokenStatusKey] || TokenStatus[token1.symbol as TokenStatusKey]}
                  </NewOrHotStatusText>
                )}
            </TokenInfoCell>
          </ClickableName>
        }
        price={
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <ClickableContent>
              <PriceInfoCell>
                {/* <Price>{price}</Price> */}
                <Price>{formatDollarAmount({ num: price, long: true })}</Price>
                <span>{baseCurrency && quoteCurrency ? baseCurrency.symbol + '/' + quoteCurrency.symbol : null}</span>
              </PriceInfoCell>
            </ClickableContent>
            <ClickableContent style={{ marginTop: '0.3rem' }}>
              <PriceInfoCell>
                <Price>${formatDollarAmount({ num: priceUSD, long: true })}</Price>
              </PriceInfoCell>
            </ClickableContent>
          </div>
        }
        priceChange={
          <ClickableContent>
            <PriceInfoCell>
              <DeltaText delta={delta}>{delta ? delta.toFixed(2) + '%' : '-'}</DeltaText>
            </PriceInfoCell>
          </ClickableContent>
        }
        tvl={<ClickableContent>{formatDollar({ num: tvl, digits: 1 })}</ClickableContent>}
        volume={<ClickableContent>{formatDollar({ num: volume, digits: 1 })}</ClickableContent>}
        APR={
          estimatedAPR === undefined ? (
            <LoadingBubble />
          ) : (
            <>
              <ClickableRate rate={(apr ?? 0) + (estimatedAPR ?? 0)}>
                {apr !== undefined
                  ? `${new Intl.NumberFormat().format(Number((apr + estimatedAPR ?? 0).toFixed(4)))} %`
                  : '-'}
              </ClickableRate>
            </>
          )
        }
        dailyLMT={
          <ClickableRate
            rate={
              (token0?.symbol === 'USDC' && token1?.symbol === 'WETH') ||
              (token0?.symbol === 'WETH' && token1?.symbol === 'USDC')
                ? LMT_PER_USD_PER_DAY_USDC
                : (token0?.symbol === 'NZT' && token1?.symbol === 'WETH') ||
                (token0?.symbol === 'WETH' && token1?.symbol === 'NZT')
                ? LMT_PER_USD_PER_DAY_NZT
                : LMT_PER_USD_PER_DAY
            }
          >
            {(token0?.symbol === 'USDC' && token1?.symbol === 'WETH') ||
            (token0?.symbol === 'WETH' && token1?.symbol === 'USDC')
              ? `${LMT_PER_USD_PER_DAY_USDC} LMT/USD`
              : (token0?.symbol === 'NZT' && token1?.symbol === 'WETH') ||
              (token0?.symbol === 'WETH' && token1?.symbol === 'NZT')
              ? `${LMT_PER_USD_PER_DAY_NZT} LMT/USD`
              : `${LMT_PER_USD_PER_DAY} LMT/USD`}
          </ClickableRate>
        }
        first={tokenListIndex === 0}
        last={tokenListIndex === tokenListLength - 1}
        // @ts-ignore
        currency0={token0?.address}
        // @ts-ignore
        currency1={token1?.address}
        buttons={
          <>
            <SmallButtonPrimary onClick={handleProvide}>
              <Trans>Provide</Trans>
            </SmallButtonPrimary>
            <SmallButtonPrimary style={{ whiteSpace: 'nowrap' }} onClick={handleZap}>
              <Trans>Zap In</Trans>
            </SmallButtonPrimary>
          </>
        }
      />
    </RowWrapper>
  ) : null
})

PLoadedRow.displayName = 'LoadedRow'

const Price = styled.span`
  font-weight: 700;
`

const RowWrapper = styled.div`
  border-top: 1px solid;
  border-color: ${({ theme }) => theme.backgroundOutline};
  cursor: pointer;
`
