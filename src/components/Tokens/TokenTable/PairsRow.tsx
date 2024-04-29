import { Trans } from '@lingui/macro'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { getPoolId } from 'components/PositionTable/LeveragePositionTable/TokenRow'
import { SparklineMap } from 'graphql/data/TopTokens'
import { computePoolAddress, usePool } from 'hooks/usePools'
import { useAtomValue } from 'jotai/utils'
import { ForwardedRef, forwardRef, useEffect, useMemo } from 'react'
import { CSSProperties, ReactNode } from 'react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePoolOHLC } from 'state/application/hooks'
import { useCurrentPool, useSetCurrentPool } from 'state/user/hooks'
import styled, { css } from 'styled-components/macro'
import { ClickableStyle } from 'theme'
import { formatDollar, formatDollarAmount } from 'utils/formatNumbers'

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
import { getDecimalAndUsdValueData } from 'hooks/useUSDPrice'
import { useWeb3React } from '@web3-react/core'
import JSBI from 'jsbi'
import { TickMath, nearestUsableTick } from '@uniswap/v3-sdk'
import { tryParseLmtTick } from 'state/mint/v3/utils'
import { getLiquidityTicks } from 'hooks/useBorrowedLiquidityRange'
import axios from 'axios'
import { SupportedChainId } from 'constants/chains'
import { Token } from '@uniswap/sdk-core'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { Pool24hVolumeQuery } from 'graphql/limitlessGraph/queries'
import { BigNumber as BN } from 'bignumber.js'

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
  /* @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    display: none;
  } */
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
  const poolOHLC = usePoolOHLC(token0?.wrapped.address, token1?.wrapped.address, fee)

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation()
      if (currency0 && currency1 && token0 && token1 && fee && token0.symbol && token1.symbol) {
        const id = getPoolId(currency0, currency1, fee)
        if (id && currentPoolId !== id && poolOHLC) {
          setCurrentPool(id, !poolOHLC.token0IsBase, poolOHLC.token0IsBase, token0.symbol, token1.symbol)
          navigate('/add/' + currency0 + '/' + currency1 + '/' + `${fee}`, {
            state: { currency0, currency1 },
          })
        }
      }
    },
    [token0, token1, fee, currency0, currency1, currentPoolId, setCurrentPool, navigate, poolOHLC]
  )

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
  apr?: number
  utilTotal?: number
}

/* Loaded State: row component with token information */
export const PLoadedRow = forwardRef((props: LoadedRowProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { tokenListIndex, tokenListLength, tokenA, tokenB, tvl, volume, fee, apr, utilTotal } = props

  const { chainId } = useWeb3React()

  const currencyIda = useCurrency(tokenA)

  const setCurrentPool = useSetCurrentPool()

  const navigate = useNavigate()
  const currentPool = useCurrentPool()

  const currentPoolId = currentPool?.poolId

  const token0Address = tokenA && tokenB ? (tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenA : tokenB) : null
  const token1Address = tokenA && tokenB ? (tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenB : tokenA) : null
  const token0 = useCurrency(token0Address)
  const token1 = useCurrency(token1Address)

  const [, pool, tickSpacing] = usePool(token0 ?? undefined, token1 ?? undefined, fee ?? undefined)
  
  // const poolOHLCDatas = useAppPoolOHLC()
  const poolOHLC = usePoolOHLC(tokenA, tokenB, fee)

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

  const _queryUniswap = async (query: string): Promise<any> => {
    const { data } = await axios({
      url: "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-arbitrum-one",
      method: "post",
      data: {
        query,
      },
    })
    const errors = data.errors;
    if (errors && errors.length > 0) {
      console.error("Uniswap Subgraph Errors", { errors, query });
      throw new Error(`Uniswap Subgraph Errors: ${JSON.stringify(errors)}`);
    }

    return data.data;
  }

  const sortTokens = (token0: Token, token1: Token): Token[] => {
    if (token0.address < token1.address) {
      return [token0, token1];
    }
    return [token1, token0];
  };

  const getPoolFromPair = async (
    token0: Token,
    token1: Token
  ): Promise<any[]> => {
    const sortedTokens = sortTokens(token0, token1);

    // let feeGrowthGlobal = `feeGrowthGlobal0X128\nfeeGrowthGlobal1X128`;
    // if (getCurrentNetwork().disabledTopPositions) {
    //   feeGrowthGlobal = "";
    // }

    console.log("SORTED TOKENS 0, 1", sortedTokens[0].address, sortedTokens[1].address)
  
    const res = await _queryUniswap(`{
      pools(orderBy: feeTier, where: {
          token0: "${sortedTokens[0].address}",
          token1: "${sortedTokens[1].address}"}) {
        id
        tick
        sqrtPrice
        feeTier
        liquidity
        token0Price
        token1Price
      }
    }`);
  
    return res
  };

  const _getPoolPositionsByPage = async (
    poolAddress: string,
    page: number
  ): Promise<any[]> => {
    try {
      const res = await _queryUniswap(`{
      positions(where: {
        pool: "${poolAddress}",
        liquidity_gt: 0,
      }, first: 1000, skip: ${page * 1000}) {
        id
        tickLower {
          tickIdx
          feeGrowthOutside0X128
          feeGrowthOutside1X128
        }
        tickUpper {
          tickIdx
          feeGrowthOutside0X128
          feeGrowthOutside1X128
        }
        depositedToken0
        depositedToken1
        liquidity
        collectedFeesToken0
        collectedFeesToken1
        feeGrowthInside0LastX128
        feeGrowthInside1LastX128
        transaction {
          timestamp
        }
      }
    }`)
  
      return res.positions;
    } catch (e) {
      return []
    }
  }

  const getPoolTicks = async (poolAddress: string, tickLower: number, tickUpper: number) => {
    let url = "https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-"
    if (chainId === SupportedChainId.BASE) {
      url += "base"
    } else {
      url += "arbitrum"
    }

    let query = `{
      ticks(first: 1000, where: { pool: "${poolAddress}" index_gte: "${tickLower}" index_lte: "${tickUpper}" }, orderBy: liquidityGross) {
        liquidityGross
      }
    }`
    // ticks(first: 1000, where: { pool: "${poolAddress}" index_gte: "${tickLower}" index_lte: "${tickUpper}" }, orderBy: liquidityGross) {
    //   index
    //   liquidityGross
    //   prices
    // }

    const { data } = await axios({
      url: url,
      method: "post",
      data: {
        query,
      },
    });
    // console.log("TICKS DATA", data)
    return data.data.ticks
  }

  const getAvgTradingVolume = async (poolAddress: string) => {
    
    const timestamp = Math.floor(Date.now() / 1000) - (86400 * 7)

    let url = "https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-"
    if (chainId === SupportedChainId.BASE) {
      url += "base"
    } else {
      url += "arbitrum"
    }

    const data = await axios({
      url: url,
      method: "post",
      data: {
        query: Pool24hVolumeQuery(poolAddress, timestamp)
      },
    });

    const volumes = data?.data?.data?.liquidityPool.dailySnapshots.map((ele: any) => Number(ele.dailyVolumeUSD) )
    const volume24h = volumes.reduce((acc: number, curr: number) => acc + curr, 0) / 7;
    
    return volume24h
  }

  const getLiquidityFromTick = (poolTicks: any[]) => {
    let liquidity = new BN(0)
    // liquidity = poolTicks.reduce((acc, curr) => acc + new BN(curr.liquidityGross), 0)
    for (let i = 0; i < poolTicks.length; i++) {
      liquidity = liquidity.plus(new BN(poolTicks[i].liquidityGross))
    }
    return liquidity
  }

  const initPair = async (poolAddress: string, tickLower: number, tickUpper: number, token0: Token, token1: Token) => {
    const [ poolTicks, volume24h ] = await Promise.all([
      getPoolTicks(poolAddress, tickLower, tickUpper),
      getAvgTradingVolume(poolAddress)
    ])
    return { poolTicks: poolTicks, volume24h: volume24h }

  }

  const aprDataPreperation = async (fee: number, tickLower: number, tickUpper: number, poolAddress: string, token0: Token, token1: Token) => {
    const { poolTicks, volume24h } = await initPair(poolAddress, tickLower, tickUpper, token0, token1)
    const liquidityGross = getLiquidityFromTick(poolTicks)

    return {
      poolTicks,
      volume24h,
      liquidityGross
    }
  }


  const getTokenAmountsFromDepositAmounts = (
    p: number, 
    pl: number, 
    pu: number, 
    token0PriceUSD: number, 
    token1PriceUSD: number, 
    depositAmountUSD: number
  ): { deltaX: number, deltaY: number } => {
    let deltaL = depositAmountUSD / ((Math.sqrt(p) - Math.sqrt(pl)) * token1PriceUSD + 
    (1 / Math.sqrt(p) - 1 / Math.sqrt(pu)) * token0PriceUSD)

    let deltaY = deltaL * (Math.sqrt(p) - Math.sqrt(pl))
    
    if (deltaY * token1PriceUSD < 0)
      deltaY = 0
    if (deltaY * token1PriceUSD > depositAmountUSD)
      deltaY = depositAmountUSD / token1PriceUSD

    let deltaX = deltaL * (1 / Math.sqrt(p) - 1 / Math.sqrt(pu))
    
    if (deltaX * token0PriceUSD < 0)
      deltaX = 0
    if (deltaX * token0PriceUSD > depositAmountUSD)
      deltaX = depositAmountUSD / token0PriceUSD

    return { deltaX, deltaY }
  }


  const calcLiquidityX96 = (
    p: number,
    pl: number,
    pu: number,
    deltaX: number,
    deltaY: number,
    token0Decimals: number,
    token1Decimals: number
  ): number => {
    // console.log("P, PL, PU, DELTAX, DELTAY, 0DEC, 1DEC", p, pl, pu, deltaX, deltaY, token0Decimals, token1Decimals)
    const q96 = 2**96
    const price_to_sqrtp = (p: number) => Math.sqrt(p) * q96

    const liquidity0 = (amount: number, pa: number, pb: number) => {
      if (pa > pb) {
        let tmp = pa
        pa = pb
        pb = tmp
      }
      return (amount * (pa * pb) / q96) / (pb - pa)
    }

    const liquidity1 = (amount: number, pa: number, pb: number) => {
      if (pa > pb) {
        let tmp = pa
        pa = pb
        pb = tmp
      }
      return amount * q96 / (pb - pa)
    }

    let decimal: number = 10 ** 18 // (token0Decimals - token1Decimals)
    // console.log("DECIMALLLL", decimal)
    let amount_0: number = deltaX * decimal
    let amount_1: number = deltaY * decimal
    let sqrtp_low: number = price_to_sqrtp(pl)
    let sqrtp_cur: number = price_to_sqrtp(p)
    let sqrtp_upp: number = price_to_sqrtp(pu)
    let liq0 = liquidity0(amount_0, sqrtp_cur, sqrtp_upp)
    let liq1 = liquidity1(amount_1, sqrtp_cur, sqrtp_low)
    // let liq = JSBI.BigInt(parseInt(Math.min(liq0, liq1).toString()))
    let liq = Math.min(liq0, liq1)
    return liq
  }

  const getEstimateFee = (
    liquidityDelta: number,
    liquidityGross: BN,
    volume24h: number,
    feeTierPercentage: number
  ): number => {
    const liquidityPercentage: number = liquidityDelta / (liquidityGross.toNumber() + liquidityDelta) //0.01 // 
    console.log("LIQUIDITY PERCENTAGE", liquidityPercentage)
    return feeTierPercentage * volume24h * liquidityPercentage
  }

  const feeAprEstimation = (
    position: Position,
    liquidityGross: BN,
    volume24h: number
    ): any => {

      const p: number = position.currentPrice
      const pl: number = position.lower
      const pu: number = position.upper
      const { deltaX, deltaY } = getTokenAmountsFromDepositAmounts(
        p,
        pl,
        pu,
        position.token0PriceUSD,
        position.token1PriceUSD,
        position.amount
      )
      const liquidityDelta: number = calcLiquidityX96(p, pl, pu, deltaX, deltaY, position.token0Decimals, position.token1Decimals)

      const feeTierPercentage: number = Number(position.fee) / 10000 / 100

      const estimatedFee: number = (p >= pl && p <= pu) ? getEstimateFee(liquidityDelta, liquidityGross, volume24h, feeTierPercentage) : 0

      console.log("LiquidityDelta", liquidityDelta)
      console.log("LiquidityGross", liquidityGross.toNumber())
      console.log("Volume24h", volume24h)
      console.log("feeTierPercentage", feeTierPercentage)
      return {
        estimatedFee,
        token0: { amount: deltaX, priceUSD: deltaX * position.token0PriceUSD },
        token1: { amount: deltaY, priceUSD: deltaY * position.token1PriceUSD }
      }
  }

  const estimateAPR = (
    position: Position, 
    poolTicks: any[],
    liquidityGross: BN, 
    volume24h: number,
    token0: string | undefined,
    token1: string | undefined
  ): any => {

    if (poolTicks.length === 0 || !liquidityGross) return
    // console.log("POSITION", position)

      const est_result = feeAprEstimation(
        position,
        liquidityGross,
        volume24h
      )
      console.log("EST_RESLT", est_result)
      console.log("TOKEN 0 TOKEN 1", token0, token1)
      
      const fee_est = est_result.estimatedFee
      const apy = (fee_est * 365 / position.amount) * 100
      const dailyIncome = apy / 365
      return { apy, dailyIncome }
    
  
  }

  useEffect(() => {
    const fetchData = async () => {
      if (token0 && token1 && pool && tickSpacing) {
        // console.log("POOOOOL", pool)
        const amount: number = 1000
        const base: number = 1.0001
        if (token0?.wrapped.address && token1?.wrapped.address) {

          const getPoolResult = await getPoolFromPair(token0?.wrapped, token1?.wrapped)
          console.log("GET POOL RESULT ", getPoolResult)

          const token0Res = await getDecimalAndUsdValueData(chainId, token0?.wrapped.address)
          const token1Res = await getDecimalAndUsdValueData(chainId, token1?.wrapped.address)
          
          const token0PriceUSD: number = token0Res.lastPriceUSD
          const token1PriceUSD: number = token1Res.lastPriceUSD

          const token0Decimals: number = token0Res.decimals
          const token1Decimals: number = token1Res.decimals

          // const price = token0Res.lastPriceUSD / token1Res.lastPriceUSD
          // const price2 = (JSBI.toNumber(pool.sqrtRatioX96) ** 2) / (2 ** 192) // (2 ** 192 * (10 ** (token1Decimals * 2))
          if (!price) return
          // console.log("PRICE2", price2)

          const lowerPrice = price * 0.8
          const upperPrice = price * 1.2


          const decimalDiff = token0Decimals - token1Decimals
          // const tickLower_f = Math.log(lowerPrice / 10 ** decimalDiff) / Math.log(base)
          // const tickUpper_f = Math.log(upperPrice / 10 ** decimalDiff) / Math.log(base)

          // console.log("TICKLOWERRRFFFFF", tickLower_f)
          // console.log("TICKUPPERRRFFFFF", tickUpper_f)
          // const tickLower = nearestUsableTick(parseInt(tickLower_f), tickSpacing)
          // const tickUpper = nearestUsableTick(parseInt(tickUpper_f), tickSpacing)

          const lowerTick = tryParseLmtTick(token0.wrapped, token1.wrapped, pool.fee, lowerPrice.toString(), tickSpacing)
          const upperTick = tryParseLmtTick(token0.wrapped, token1.wrapped, pool.fee, upperPrice.toString(), tickSpacing)
          // console.log("LLLLL TICKLOWER TICKUPPER", tickLower, tickUpper)
          // console.log("LOWERTICK1 UPPERTICK1", lowerTick, upperTick)
          // console.log(`PRICE FOR ${token0.symbol} / ${token1.symbol} IS ${price}`)//, AND PRICE2 IS ${price2}`)
          if (lowerTick && upperTick) {
            const position: Position = {
              currentPrice: price,
              token0PriceUSD: token0PriceUSD,
              token1PriceUSD: token1PriceUSD,
              token0Decimals: token0Decimals,
              token1Decimals: token1Decimals,
              lower: lowerPrice,
              upper: upperPrice,
              amount: amount,
              fee: parseInt(pool.fee.toString())
            }
            // console.log("---------------------------------")
            // console.log("POSITION BEFORE ESTIMATION0, position")
  
            const v3CoreFactoryAddress = chainId && V3_CORE_FACTORY_ADDRESSES[chainId]
            if (v3CoreFactoryAddress && lowerTick && upperTick) {
              const poolAddress = computePoolAddress({
                factoryAddress: v3CoreFactoryAddress, 
                tokenA: token0.wrapped, 
                tokenB: token1.wrapped, 
                fee: pool.fee
              })
              const res = await _getPoolPositionsByPage(poolAddress, 0)
              console.log("GET POOL POSITION", res)
              // const { poolTicks, volume24h, liquidityGross } = await aprDataPreperation(pool.fee, lowerTick, upperTick, poolAddress, token0.wrapped, token1.wrapped)
              // try {
              //   const { apy, dailyIncome } = estimateAPR(position, poolTicks, liquidityGross, volume24h, token0.symbol, token1.symbol)
                
              //   console.log("APY AND DAILY INCOME", {apy, dailyIncome}, token0.symbol, token1.symbol)
              //   console.log("*********************************")
                
              // } catch (err) {
              //   console.error(err, "POSITION" + position, "POOLTICKS" + poolTicks, "LIQUIDITY GROSS" + liquidityGross, "volume" + volume24h, token0.symbol, token1.symbol, "POOLADDRESS" + poolAddress)
              // }
              
              
              // console.log({ poolTicks, volume24h, liquidityGross })
              // try {

              // } catch(error) {
              //   console.error("ERRoR on ESTIMATE APR", error, token0.symbol, token1.symbol)
              // }
              
  
              
            }
          }
          
          



          // const upperTick1 = tryParseLmtTick(token)

          // const decimalDiff = token0Res.decimals - token1Res.decimals

          // let sqrtRatioX96 = JSBI.BigInt(pool?.sqrtRatioX96 || 0);
          // let price = (sqrtRatioX96 ** 2)/2**192* (10**(token1Res.decimals*2)); 
          // let price = JSBI.toNumber(JSBI.divide(JSBI.multiply(JSBI.exponentiate(sqrtRatioX96, JSBI.BigInt(2)), JSBI.BigInt(10**(token1Res.decimals*2))), JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(192))));
          // let price = JSBI.toNumber(JSBI.divide(JSBI.multiply(JSBI.exponentiate(sqrtRatioX96, JSBI.BigInt(2)), JSBI.BigInt(10**((token1Res.decimals || 0) * 2))), JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(192))));
          
          // let lower = (price > 0) ? price * 0.8 : 99999; // set the lower 
          // let upper = (price > 0) ? price * 1.2 : -99999; // set the upper
          // const position = {
          //   entryPrice: price,
          //   lower,
          //   upper,
          //   amount
          // }

          
          // if (TickMath.MIN_TICK > Math.log(lower/(10**decimalDiff)))
          //   console.log("LOWER !!!", TickMath.MIN_TICK, Math.log(lower/(10**decimalDiff)), Math.log(upper/(10**decimalDiff)))
          // if (TickMath.MAX_TICK < Math.log(upper/(10**decimalDiff)))
          //   console.log("UPPER !!!", TickMath.MAX_TICK, Math.log(lower/(10**decimalDiff)), Math.log(upper/(10**decimalDiff)))

          // let tickLower_f = Math.log(lower/(10**decimalDiff)) / Math.log(base)
          // let tickUpper_f = Math.log(upper/(10**decimalDiff)) / Math.log(base)



          // console.log("TICKLOWER_F TICKUPPER_F TICKCURRENT", tickLower_f, tickUpper_f, pool.tickCurrent)
          // let tickLower = nearestUsableTick(Math.round(tickLower_f), tickSpacing)
          // let tickUpper = nearestUsableTick(Math.round(tickUpper_f), tickSpacing)

          // console.log("TICKLOWERFFF, TICKUPPERFFF, TICKSPACING", tickLower_f, tickUpper_f, tickSpacing)
          // console.log("TICKLOWER, TICKUPPER", tickLower, tickUpper)
            // console.log("MINTICK", TickMath.MIN_TICK)
            // console.log("MAXTICK", TickMath.MAX_TICK)
        }
      }
    }
    fetchData()
    
  }, [token0, token1, pool, tickSpacing])

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
        tokenInfo={
          <ClickableName>
            <TokenInfoCell>
              <DoubleCurrencyLogo currency0={baseCurrency} currency1={quoteCurrency} size={20} margin={true} />
              <TokenName data-cy="token-name">
                <span>{token0?.symbol}</span>
                <span>{token1?.symbol}</span>
              </TokenName>
            </TokenInfoCell>
          </ClickableName>
        }
        price={
          <ClickableContent>
            <PriceInfoCell>
              <Price>{formatDollarAmount({ num: price, long: true })}</Price>
              <span>{baseCurrency && quoteCurrency ? baseCurrency.symbol + '/' + quoteCurrency.symbol : null}</span>
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
            <ClickableRate rate={apr}>{apr !== undefined ? `${apr?.toPrecision(4)} %` : '-'}</ClickableRate>
            {/* <span style={{ paddingLeft: '.25rem', color: 'gray' }}>+ swap fees</span> */}
          </>
        }
        UtilRate={
          <ClickableRate rate={utilTotal}>{utilTotal !== undefined ? `${utilTotal?.toFixed(4)} %` : '-'}</ClickableRate>
        }
        first={tokenListIndex === 0}
        last={tokenListIndex === tokenListLength - 1}
        // @ts-ignore
        currency0={token0?.address}
        // @ts-ignore
        currency1={token1?.address}
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
