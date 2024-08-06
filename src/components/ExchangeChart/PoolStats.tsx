import { Trans } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { POOL_INIT_CODE_HASH } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { AutoRow } from 'components/Row'
import { LoadingBubble } from 'components/Tokens/loading'
import { ArrowCell, DeltaText, getDeltaArrow } from 'components/Tokens/TokenDetails/PriceChart'
import { MouseoverTooltip } from 'components/Tooltip'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { USDC_MAP, WBTC_ARBITRUM_ONE, WETH_MAP } from 'constants/tokens'
import { defaultAbiCoder, getCreate2Address, solidityKeccak256 } from 'ethers/lib/utils'
import { usePoolsTVLandVolume, useStatsLiquidities } from 'hooks/useLMTPools'
import usePoolVolumeAndLiquidity from 'hooks/usePoolVolumeAndLiquidity'
import { useCurrentTokenPriceData, usePoolPriceData } from 'hooks/useUserPriceData'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { ReactNode, useMemo } from 'react'
import styled from 'styled-components/macro'
import { BREAKPOINTS, ThemedText } from 'theme'
import { textFadeIn } from 'theme/styles'
import { formatDollar, formatDollarAmount } from 'utils/formatNumbers'
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
  // }
`

export function PoolStatsSection({
  address0,
  address1,
  fee,
}: // invertPrice,
{
  address0?: string
  address1?: string
  fee?: number
  chainId?: number
}) {
  const chainId = useChainId()
  const poolAddress = useMemo(() => {
    if (!address0 || !address1 || !fee || !chainId) return null
    return getAddress(address0, address1, fee, chainId)
  }, [chainId, address0, address1, fee])

  console.log('add0', address0)
  console.log('add1', address1)

  const { data: token0UsdPrice } = useCurrentTokenPriceData(address0)
  const { data: token1UsdPrice } = useCurrentTokenPriceData(address1)
  const usdPrice = useMemo(() => {
    if (chainId) {
      if (address0 && address0.toLowerCase() === USDC_MAP[chainId].toLowerCase()) {
        return token1UsdPrice?.usdPrice ? new BN(token1UsdPrice?.usdPrice) : undefined
      }
      if (address1 && address1.toLowerCase() === USDC_MAP[chainId].toLowerCase()) {
        return token0UsdPrice?.usdPrice ? new BN(token0UsdPrice?.usdPrice) : undefined
      } else if (
        (address0 && address0.toLowerCase() === WETH_MAP[chainId].toLowerCase() && address1) ||
        (address0 && address0.toLowerCase() === WBTC_ARBITRUM_ONE.address.toLowerCase() && address1)
      ) {
        // WBTC arbitrum)
        return token1UsdPrice?.usdPrice ? new BN(token1UsdPrice?.usdPrice) : undefined
      } else if (address1 && address1.toLowerCase() === WETH_MAP[chainId].toLowerCase() && address0) {
        return token0UsdPrice?.usdPrice ? new BN(token0UsdPrice?.usdPrice) : undefined
      }
    }
    return undefined
  }, [chainId, token0UsdPrice, token1UsdPrice, address0, address1])

  const { data: poolOHLC } = usePoolPriceData(address0, address1, fee)

  const [currentPrice, delta24h] = useMemo(() => {
    if (!poolOHLC) return [null, null]
    return [new BN(poolOHLC.priceNow), new BN(poolOHLC.delta24h)]
  }, [poolOHLC])

  const { result: poolData, loading: poolDataLoading } = usePoolsTVLandVolume()

  const { result: liqData, loading: liqDataLoading } = useStatsLiquidities(poolAddress)

  // const [longableLiq, shortableLiq] = useMemo(() => {
  //   if (
  //     poolData &&
  //     address0 &&
  //     address1 &&
  //     fee &&
  //     Object.keys(poolData).find((pair: any) => pair === getPoolId(address0, address1, fee)) !== undefined
  //   ) {
  //     return [
  //       new BN(poolData[getPoolId(address0, address1, fee)]?.longableLiquidity),
  //       new BN(poolData[getPoolId(address0, address1, fee)]?.shortableLiquidity),
  //     ]
  //   } else {
  //     return [new BN(0), new BN(0)]
  //   }
  // }, [poolData, address0, address1, fee])

  const [longableLiq, shortableLiq] = useMemo(() => {
    if (liqData && address0 && address1 && fee) {
      return [new BN(liqData?.longableLiquidity), new BN(liqData?.shortableLiquidity)]
    } else {
      return [new BN(0), new BN(0)]
    }
  }, [liqData, address0, address1, fee])

  // console.log("LONGABLELIQ", longableLiq.toNumber(), longableLiq2.toNumber())
  // console.log("SHORTABLELIQ", shortableLiq.toNumber(), shortableLiq2.toNumber())

  // const { data, loading: poolLoading } = usePoolTokenAmounts(address0, address1, fee)
  // const [longableLiq1, shortableLiq1] = useMemo(() => {
  //   if (!data || !token0UsdPrice || !token1UsdPrice) {
  //     return [new BN(0), new BN(0)]
  //   }
  //   const [token0Above, token1Below] = data
  //   return [token1Below.times(token1UsdPrice.usdPrice), token0Above.times(token0UsdPrice.usdPrice)]
  // }, [token0UsdPrice, token1UsdPrice, data])

  const { data: liqAndVol, loading: liqAndVolLoading } = usePoolVolumeAndLiquidity(poolAddress ?? undefined)

  // useEffect(() => {
  //   if (address0 && address1 && fee && poolData) {
  //     console.log("tvl amount0, amount1:", longableLiq1.toNumber(), shortableLiq1.toNumber())
  //     console.log('useLMTPools tvl', poolData?.[getPoolId(address0, address1, fee)])
  //   }
  // }, [address0, address1, fee, poolData])

  const liquidity = liqAndVol?.liquidity
  const volume24h = liqAndVol?.volume

  const loading =
    !currentPrice ||
    currentPrice?.isZero() ||
    !delta24h ||
    // delta24h?.isZero() ||
    liqAndVolLoading ||
    !liquidity ||
    !volume24h ||
    !usdPrice ||
    usdPrice?.isZero()

  //     console.log('!currentPrice:', !currentPrice);
  // console.log('currentPrice?.isZero():', currentPrice?.isZero());
  // console.log('!delta24h:', !delta24h);
  // console.log('delta24h?.isZero():', delta24h?.isZero());
  // console.log('poolLoading:', poolLoading);
  // console.log('liqAndVolLoading:', liqAndVolLoading);
  // console.log('!liquidity:', !liquidity);
  // console.log('!volume24h:', !volume24h);
  // console.log('!usdPrice:', !usdPrice);
  // console.log('usdPrice?.isZero():', usdPrice?.isZero());

  // console.log(
  //   'zeke:',
  //   !!currentPrice,
  //   !!usdPrice,
  //   !!delta24h,
  //   !!liquidity,
  //   !!volume24h,
  //   !!longableLiq,
  //   !!shortableLiq,
  //   loading,
  //   !!poolData
  // )

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
      <Stat
        dataCy="liq-below"
        value={liquidity}
        dollar={true}
        title={
          <ThemedText.StatLabel>
            <Trans>Uniswap Liquidity</Trans>
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
          </ThemedText.StatLabel>
        }
        loading={liqDataLoading}
      />
      <Stat
        dataCy="liq-short"
        value={shortableLiq}
        dollar={true}
        title={
          <ThemedText.StatLabel>
            <Trans>Shortable Liquidity</Trans>
          </ThemedText.StatLabel>
        }
        loading={liqDataLoading}
      />
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
          <ThemedText.BodySmall color="textSecondary">
            ${formatDollarAmount({ num: Number(value), long: true })}
          </ThemedText.BodySmall>
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
            <ThemedText.BodySmall color="textSecondary">
              {formatDollarAmount({ num: Number(value), long: true })}
            </ThemedText.BodySmall>
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
