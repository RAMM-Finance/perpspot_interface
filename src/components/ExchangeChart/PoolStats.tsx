import { Trans } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { POOL_INIT_CODE_HASH } from '@uniswap/v3-sdk'
import axios from 'axios'
import { BigNumber as BN } from 'bignumber.js'
import { AutoRow } from 'components/Row'
import { LoadingBubble } from 'components/Tokens/loading'
import { ArrowCell, DeltaText, getDeltaArrow } from 'components/Tokens/TokenDetails/PriceChart'
import { MouseoverTooltip } from 'components/Tooltip'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { defaultAbiCoder, getCreate2Address, solidityKeccak256 } from 'ethers/lib/utils'
import { DefinedfiPairMetadataQuery } from 'graphql/limitlessGraph/queries'
import { useTokenContract } from 'hooks/useContract'
import { getDecimalAndUsdValueData, getMultipleUsdPriceData } from 'hooks/useUSDPrice'
import { useSingleCallResult } from 'lib/hooks/multicall'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { usePoolOHLC } from 'state/application/hooks'
import styled from 'styled-components/macro'
import { BREAKPOINTS, ThemedText } from 'theme'
import { textFadeIn } from 'theme/styles'
import { formatDollar } from 'utils/formatNumbers'
import { getPoolId } from 'utils/lmtSDK/LmtIds'
import { useChainId } from 'wagmi'

const StatsWrapper = styled.div`
  gap: 16px;
  ${textFadeIn}
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  width: 100%;
  white-space: nowrap;
  height: 35px;
  overflow-x: scroll;

  // @media only screen and (max-width: ${BREAKPOINTS.md}px) {
  //   display: grid;
  //   grid-template-columns: repeat(3, minmax(0, 1fr));
  //   height: 100%;
  }
`

export function PoolStatsSection({
  poolData,
  poolOHLC,
  address0,
  address1,
  fee,
  poolLoading,
}: // invertPrice,
{
  poolData: any
  poolOHLC: any
  address0?: string
  address1?: string
  fee?: number
  chainId?: number
  poolLoading: boolean
}) {
  const chainId = useChainId()
  const poolAddress = useMemo(() => {
    if (!address0 || !address1 || !fee || !chainId) return null
    return getAddress(address0, address1, fee, chainId)
  }, [chainId, address0, address1, fee])

  // const poolOHLC = usePoolOHLC(address0, address1, fee)

  // const contract0 = useTokenContract(address0)
  // const contract1 = useTokenContract(address1)

  const [usdPrice, setUsdPrice] = useState<BN>()

  useEffect(() => {
    const fetchData = async () => {
      let usdPrice
      if (chainId === SupportedChainId.BASE) {
        if (address0 && address0 === '0x4200000000000000000000000000000000000006' && address1) {
          usdPrice = (await getMultipleUsdPriceData(chainId, [address1]))?.[0]?.priceUsd
          setUsdPrice(new BN(usdPrice))
        } else if (address1 && address1 === '0x4200000000000000000000000000000000000006' && address0) {
          usdPrice = (await getMultipleUsdPriceData(chainId, [address0]))?.[0]?.priceUsd
          setUsdPrice(new BN(usdPrice))
        }
      } else if (chainId === SupportedChainId.ARBITRUM_ONE) {
        if (address0 && address0 === '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' && address1) {
          usdPrice = (await getMultipleUsdPriceData(chainId, [address1]))?.[0]?.priceUsd
          setUsdPrice(new BN(usdPrice))
        } else if (address1 && address1 === '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' && address0) {
          usdPrice = (await getMultipleUsdPriceData(chainId, [address0]))?.[0]?.priceUsd
          setUsdPrice(new BN(usdPrice))
        }
      }
    }
    // const intervalId = setInterval(fetchData, 3000)
    // return () => clearInterval(intervalId)
    fetchData()
  }, [address0, address1, chainId])

  // const { result: reserve0, loading: loading0 } = useSingleCallResult(contract0, 'balanceOf', [
  //   poolAddress ?? undefined,
  // ])

  // const { result: reserve1, loading: loading1 } = useSingleCallResult(contract1, 'balanceOf', [
  //   poolAddress ?? undefined,
  // ])

  const [currentPrice, low24h, high24h, delta24h] = useMemo(() => {
    if (!poolOHLC) return [null, null, null, null]
    return [
      new BN(poolOHLC.priceNow),
      new BN(poolOHLC.low24),
      new BN(poolOHLC.high24),
      new BN(poolOHLC.priceNow).minus(new BN(poolOHLC.price24hAgo)).div(new BN(poolOHLC.priceNow)).times(100),
    ]
  }, [poolOHLC])



  const [volume, tvl, longableLiq, shortableLiq] = useMemo(() => {
    if (
      poolData &&
      address0 &&
      address1 &&
      fee &&
      Object.keys(poolData).find((pair: any) => pair === getPoolId(address0, address1, fee)) !== undefined
    ) {
      return [
        new BN(poolData[getPoolId(address0, address1, fee)]?.volume),
        new BN(poolData[getPoolId(address0, address1, fee)]?.totalValueLocked),
        new BN(poolData[getPoolId(address0, address1, fee)]?.longableLiquidity),
        new BN(poolData[getPoolId(address0, address1, fee)]?.shortableLiquidity),
      ]
    } else {
      return [new BN(0), new BN(0)]
    }
  }, [poolData, address0, address1, fee])

  const [liquidity, setLiquidity] = useState<BN>()
  const [volume24h, setVolume24h] = useState<BN>()

  useEffect(() => {
    const fetchData = async () => {
      if (!poolAddress || !chainId) return
      const apiKeyV3 = process.env.REACT_APP_DEFINEDFI_KEY
      const query: string = DefinedfiPairMetadataQuery(poolAddress, chainId)

      const response = await axios.post(
        'https://graph.defined.fi/graphql',
        {
          query,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: apiKeyV3,
          },
        }
      )
      const liq = response?.data?.data?.pairMetadata?.liquidity
      const vol = response?.data?.data?.pairMetadata?.volume24
      setLiquidity(new BN(liq))
      setVolume24h(new BN(vol))
    }
    fetchData()
  }, [poolAddress, chainId])

  const loading =
    !currentPrice ||
    currentPrice?.isZero() ||
    // !low24h ||
    // low24h?.isZero() ||
    // !high24h ||
    // high24h?.isZero() ||
    !delta24h ||
    delta24h?.isZero() ||
    poolLoading ||
    !liquidity ||
    !volume24h ||
    !usdPrice ||
    usdPrice?.isZero()
    // console.log("-----------------------------")
    // console.log("currentPrice:", currentPrice, "isFalsy or isZero:", !currentPrice || currentPrice?.isZero());
    // console.log("poolLoading:", poolLoading);
    // console.log("liquidity:", liquidity, "isFalsy:", !liquidity);
    // console.log("usdPrice:", usdPrice, "isFalsy or isZero:", !usdPrice || usdPrice?.isZero());
    // console.log("-----------------------------")
  return (
    <StatsWrapper>
      <Stat
        dataCy="current-price"
        value={currentPrice}
        title={
          <ThemedText.StatLabel>
            <Trans>Price</Trans>
          </ThemedText.StatLabel>
        }
        loading={loading}
      />
      <Stat
        dataCy="usd-price"
        usdPrice={true}
        value={usdPrice}
        title={
          <ThemedText.StatLabel>
            <Trans>USD Price</Trans>
          </ThemedText.StatLabel>
        }
        loading={loading}
      />
      <Stat
        dataCy="delta-24h"
        value={delta24h}
        delta={true}
        title={
          <ThemedText.StatLabel>
            <Trans>24h Change</Trans>
          </ThemedText.StatLabel>
        }
        loading={loading}
      />
      {/* <Stat
        dataCy="24h-low"
        value={low24h}
        // baseQuoteSymbol={baseQuoteSymbol}
        title={
          <ThemedText.StatLabel>
            <Trans>24h low</Trans>
          </ThemedText.StatLabel>
        }
        loading={loading}
      />
      <Stat
        dataCy="24h-high"
        value={high24h}
        title={
          <ThemedText.StatLabel>
            <Trans>24h high</Trans>
          </ThemedText.StatLabel>
        }
        loading={loading}
      /> */}
      <Stat
        dataCy="liq-below"
        value={liquidity}
        dollar={true}
        title={
          <ThemedText.StatLabel>
            <Trans>Uniswap Liquidity</Trans>
            {/* <Trans>TVL</Trans> */}
          </ThemedText.StatLabel>
        }
        loading={loading}
      />
            <Stat
        dataCy="liq-below"
        value={volume24h}
        dollar={true}
        title={
          <ThemedText.StatLabel>
            <Trans>24h volume</Trans>
            {/* <Trans>TVL</Trans> */}
          </ThemedText.StatLabel>
        }
        loading={loading}
      />
      <Stat
        dataCy="liq-long"
        value={longableLiq}
        dollar={true}
        title={
          <ThemedText.StatLabel>
            <Trans>Longable Liquidity</Trans>
            {/* <Trans>TVL</Trans> */}
          </ThemedText.StatLabel>
        }
        loading={loading}
      />
      <Stat
        dataCy="liq-short"
        value={shortableLiq}
        dollar={true}
        title={
          <ThemedText.StatLabel>
            <Trans>Shortable Liquidity</Trans>
            {/* <Trans>TVL</Trans> */}
          </ThemedText.StatLabel>
        }
        loading={loading}
      />
            {/*  <Stat
        dataCy="liq-below"
        value={tvl}
        dollar={true}
        title={
          <ThemedText.StatLabel>
            <Trans>Borrowable Liquidity</Trans>
           <Trans>TVL</Trans> 
          </ThemedText.StatLabel>
        }
        loading={loading}
      />*/}
      {/*<Stat
        dataCy="liq-above"
        value={volume}
        dollar={true}
        title={
          <ThemedText.StatLabel>
            <Trans>Total Volume</Trans>
          </ThemedText.StatLabel>
        }
        loading={loading}
      />*/}
    </StatsWrapper>
  )
}

const StatSkeleton = ({ title }: { title: ReactNode }) => {
  return (
    <StatWrapper>
      <div>{title}</div>
      <StatPrice>
        <ThemedText.BodySmall color="textSecondary">-</ThemedText.BodySmall>
      </StatPrice>
    </StatWrapper>
  )
}

export const StatsSkeleton = () => {
  return (
    <StatsWrapper>
      <StatSkeleton
        title={
          <ThemedText.BodySmall color="textGrayPrimary">
            <Trans>Price</Trans>
          </ThemedText.BodySmall>
        }
      />
      <StatSkeleton
        title={
          <ThemedText.BodySmall color="textGrayPrimary">
            <Trans>USD Price</Trans>
          </ThemedText.BodySmall>
        }
      />
      <StatSkeleton
        title={
          <ThemedText.StatLabel>
            <Trans>24h Change</Trans>
          </ThemedText.StatLabel>
        }
      />
      <StatSkeleton
        title={
          <ThemedText.StatLabel>
            <Trans>24h low</Trans>
          </ThemedText.StatLabel>
        }
      />
      <StatSkeleton
        title={
          <ThemedText.StatLabel>
            <Trans>24h high</Trans>
          </ThemedText.StatLabel>
        }
      />
      <StatSkeleton
        title={
          <ThemedText.StatLabel>
            <Trans>Swap Liquidity</Trans>
            {/* <Trans>TVL</Trans> */}
          </ThemedText.StatLabel>
        }
      />
      <StatSkeleton
        title={
          <ThemedText.StatLabel>
            <Trans>Borrowable Liquidity</Trans>
            {/* <Trans>TVL</Trans> */}
          </ThemedText.StatLabel>
        }
      />
      <StatSkeleton
        title={
          <ThemedText.StatLabel>
            <Trans>Total Volume</Trans>
          </ThemedText.StatLabel>
        }
      />
    </StatsWrapper>
  )
}

const StatWrapper = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  font-weight: 900;
  border-rounded: 10px;
  margin-top: 0.3rem;
  margin-bottom: 0.3rem;
`

type NumericStat = BN | undefined | null

const StatPrice = styled.div`
  margin-top: 2px;
  font-size: 12px;
  color: ${({ theme }) => theme.textPrimary};
`

function Stat({
  dataCy,
  value,
  title,
  description,
  baseQuoteSymbol,
  dollar,
  usdPrice,
  loading,
  delta = false,
}: {
  dataCy: string
  value: NumericStat
  title: ReactNode
  description?: ReactNode
  baseQuoteSymbol?: string
  dollar?: boolean
  usdPrice?: boolean
  loading: boolean
  delta?: boolean
}) {
  let _value =
    value && value.toNumber() < 1 ? value.toNumber().toFixed(10) : (value && value.toNumber().toFixed(4)) ?? undefined
  const arrow = getDeltaArrow(value?.toNumber(), 14)
  if (value && baseQuoteSymbol) {
    _value = `${_value} ${baseQuoteSymbol}`
  }

  if (loading) {
    return (
      <StatWrapper data-cy={`${dataCy}`}>
        <MouseoverTooltip text={description}>{title}</MouseoverTooltip>
        <StatPrice>
          <LoadingBubble height="16px" />
        </StatPrice>
      </StatWrapper>
    )
  }
  if (dollar) {
    return (
      <StatWrapper data-cy={`${dataCy}`}>
        <MouseoverTooltip text={description}>{title}</MouseoverTooltip>
        <StatPrice>
          <ThemedText.BodySmall color="textSecondary">
            {formatDollar({ num: Number(value), digits: 0 })} {baseQuoteSymbol}
          </ThemedText.BodySmall>
        </StatPrice>
      </StatWrapper>
    )
  } else if (usdPrice) {
    return (
      <StatWrapper data-cy={`${dataCy}`}>
        <MouseoverTooltip text={description}>{title}</MouseoverTooltip>
        <StatPrice>
          <ThemedText.BodySmall color="textSecondary">${Number(value).toFixed(8)}</ThemedText.BodySmall>
        </StatPrice>
      </StatWrapper>
    )
  } else {
    return (
      <StatWrapper data-cy={`${dataCy}`}>
        <MouseoverTooltip text={description}>{title}</MouseoverTooltip>
        {delta ? (
          <StatPrice>
            <AutoRow>
              <ArrowCell>{arrow}</ArrowCell>
              <DeltaText delta={value?.toNumber()}>
                {formatBNToString(value?.abs() ?? undefined, NumberType.TokenNonTx)}%
              </DeltaText>
            </AutoRow>
          </StatPrice>
        ) : (
          <StatPrice>
            <ThemedText.BodySmall color="textSecondary">{_value}</ThemedText.BodySmall>
          </StatPrice>
        )}
      </StatWrapper>
    )
  }
}

export function getAddress(address0: string, address1: string, fee: number, chainId: number): string {
  return getCreate2Address(
    V3_CORE_FACTORY_ADDRESSES[chainId],
    solidityKeccak256(['bytes'], [defaultAbiCoder.encode(['address', 'address', 'uint24'], [address0, address1, fee])]),
    POOL_INIT_CODE_HASH
  )
}
