import { Trans } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { BigNumber as BN } from 'bignumber.js'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { getPoolId } from 'components/PositionTable/LeveragePositionTable/TokenRow'
import { SparklineMap } from 'graphql/data/TopTokens'
import { useRateAndUtil } from 'hooks/useLMTV2Positions'
import { usePool } from 'hooks/usePools'
import { useAtomValue } from 'jotai/utils'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { ForwardedRef, forwardRef, useMemo } from 'react'
import { CSSProperties, ReactNode } from 'react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppPoolOHLC } from 'state/application/hooks'
import { useTickDiscretization } from 'state/mint/v3/hooks'
import { useCurrentPool, useSetCurrentPool } from 'state/user/hooks'
import styled, { css } from 'styled-components/macro'
import { ClickableStyle } from 'theme'
import { formatDollar, formatDollarAmount } from 'utils/formatNumbers'
import { roundToBin } from 'utils/roundToBin'

import { useCurrency } from '../../../hooks/Tokens'
import { ButtonPrimary } from '../../Button'
import {
  LARGE_MEDIA_BREAKPOINT,
  MAX_WIDTH_MEDIA_BREAKPOINT,
  MEDIUM_MEDIA_BREAKPOINT,
  SMALL_MEDIA_BREAKPOINT,
} from '../constants'
import { LoadingBubble } from '../loading'
import { filterStringAtom } from '../state'
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
  /* gap: 8px; */
`
const PriceCell = styled(DataCell)`
  /* padding-right: 8px; */
`
/* const PercentChangeInfoCell = styled(Cell)`
  display: none;

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    display: flex;
    justify-content: flex-end;
    color: ${({ theme }) => theme.textPrimary};
    line-height: 16px;
  }
` */
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

const LongLoadingBubble = styled(LoadingBubble)`
  width: 90%;
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
  loading,
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
  const setCurrentPool = useSetCurrentPool()
  const token0 = useCurrency(currency0)
  const token1 = useCurrency(currency1)
  const currentPool = useCurrentPool()
  const currentPoolId = currentPool?.poolId
  const [, pool] = usePool(token0 ?? undefined, token1 ?? undefined, fee)
  const poolId = useMemo(() => {
    if (token0 && token1 && fee) {
      return getPoolId(token0.wrapped.address, token1.wrapped.address, fee)
    } else {
      return undefined
    }
  }, [token0, token1, fee])

  const poolOHLCDatas = useAppPoolOHLC()

  const token0IsBase = useMemo(() => {
    if (pool && poolOHLCDatas && poolId) {
      const priceData = poolOHLCDatas[poolId]
      const token0Price = new BN(pool.token0Price.toFixed(18))
      const d1 = token0Price.minus(priceData.price24hAgo).abs()
      const d2 = new BN(1).div(token0Price).minus(priceData.price24hAgo).abs()
      if (d1.lt(d2)) {
        return true
      }
      return false
    }
    return null
  }, [pool, poolOHLCDatas, poolId])

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation()
      if (
        currency0 &&
        currency1 &&
        token0 &&
        token1 &&
        fee &&
        token0IsBase !== null &&
        token0.symbol &&
        token1.symbol
      ) {
        const id = getPoolId(currency0, currency1, fee)
        if (id && currentPoolId !== id) {
          setCurrentPool(id, true, token0IsBase, token0.symbol, token1.symbol)
          navigate('/add/' + currency0 + '/' + currency1 + '/' + `${fee}`, {
            state: { currency0, currency1 },
          })
        }
      }
    },
    [token0, token1, fee, currency0, currency1, token0IsBase, currentPoolId, setCurrentPool, navigate]
  )

  const rowCells = (
    <>
      <NameCell data-testid="name-cell">{tokenInfo}</NameCell>
      <PriceCell data-testid="price-cell" sortable={header}>
        {price}
      </PriceCell>
      <PriceCell data-testid="price-change-cell" sortable={header}>
        {priceChange}
      </PriceCell>
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
      {!header && loading ? (
        <ButtonCell data-testid="volume-cell" sortable={header}>
          <LoadingBubble />
        </ButtonCell>
      ) : (
        !header && (
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
              onClick={handleClick}
            >
              <Trans>Provide</Trans>
            </ButtonPrimary>
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

  // const filterNetwork = validateUrlChainParam(useParams<{ chainName?: string }>().chainName?.toUpperCase())
  // const chainId = CHAIN_NAME_TO_CHAIN_ID[filterNetwork]

  const currencyIda = useCurrency(tokenA)
  const currencyIdb = useCurrency(tokenB)

  const setCurrentPool = useSetCurrentPool()

  const navigate = useNavigate()
  const currentPool = useCurrentPool()

  const currentPoolId = currentPool?.poolId
  const baseCurrency = useCurrency(tokenA)
  const quoteCurrency = useCurrency(tokenB)

  const [token0, token1] =
    baseCurrency && quoteCurrency && quoteCurrency?.wrapped.sortsBefore(baseCurrency?.wrapped)
      ? [baseCurrency, quoteCurrency]
      : [quoteCurrency, baseCurrency]

  const [, pool] = usePool(token0 ?? undefined, token1 ?? undefined, fee ?? undefined)
  const poolOHLCDatas = useAppPoolOHLC()
  const poolId = getPoolId(tokenA, tokenB, fee)

  const token0IsBase = useMemo(() => {
    if (pool && poolOHLCDatas && poolId) {
      const priceData = poolOHLCDatas[poolId]
      const token0Price = new BN(pool.token0Price.toFixed(18))
      const d1 = token0Price.minus(priceData.price24hAgo).abs()
      const d2 = new BN(1).div(token0Price).minus(priceData.price24hAgo).abs()
      if (d1.lt(d2)) {
        return true
      }
      return false
    }
    return null
  }, [pool, poolOHLCDatas, poolId])

  const handleCurrencySelect = useCallback(() => {
    if (currentPoolId !== poolId && token0IsBase !== null && token0?.symbol && token1?.symbol) {
      setCurrentPool(poolId, true, token0IsBase, token0.symbol, token1.symbol)
    }
  }, [setCurrentPool, currentPoolId, poolId, token0IsBase, token0, token1])

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

  const { result: rateUtilData } = useRateAndUtil(
    pool?.token0.address,
    pool?.token1.address,
    pool?.fee,
    tickLower,
    tickUpper
  )

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
        first={tokenListIndex === 0}
        last={tokenListIndex === tokenListLength - 1}
        // @ts-ignore
        currency0={token0?.address}
        // @ts-ignore
        currency1={token1?.address}
      />

      {/*</ClickableContent> */}
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
