import { BigNumber } from '@ethersproject/bignumber'
import type { TransactionResponse } from '@ethersproject/providers'
import { Trans } from '@lingui/macro'
import { Trace } from '@uniswap/analytics'
import { InterfacePageName } from '@uniswap/analytics-events'
import { formatPrice, NumberType } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount, Fraction, Percent, Price, Token } from '@uniswap/sdk-core'
import { NonfungiblePositionManager, Pool, Position } from '@uniswap/v3-sdk'
// import { SupportedChainId } from '@uniswap/widgets'
import { useWeb3React } from '@web3-react/core'
import { sendEvent } from 'components/analytics'
import Badge from 'components/Badge'
import { ButtonConfirmed, ButtonPrimary } from 'components/Button'
import { DarkCard, LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { RowBetween, RowFixed } from 'components/Row'
import { Dots } from 'components/swap/styleds'
import Toggle from 'components/Toggle'
import TransactionConfirmationModal, { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { CHAIN_IDS_TO_NAMES } from 'constants/chains'
import { isGqlSupportedChain } from 'graphql/data/util'
import { useToken } from 'hooks/Tokens'
import { useLmtNFTPositionManager, useV3NFTPositionManagerContract } from 'hooks/useContract'
import useIsTickAtLimit from 'hooks/useIsTickAtLimit'
import { useRateAndUtil } from 'hooks/useLMTV2Positions'
import { PoolState, useEstimatedAPR, usePool } from 'hooks/usePools'
import useStablecoinPrice from 'hooks/useStablecoinPrice'
import { useLMTPositionFees } from 'hooks/useV3PositionFees'
import { useLmtLpPositionFromTokenId } from 'hooks/useV3Positions'
import { useSingleCallResult } from 'lib/hooks/multicall'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMaxLiquidityToWithdraw } from 'state/burn/v3/hooks'
import { Bound } from 'state/mint/v3/actions'
import { useIsTransactionPending, useTransactionAdder } from 'state/transactions/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { ExternalLink, HideExtraSmall, HideSmall, ThemedText } from 'theme'
import { currencyId } from 'utils/currencyId'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { formatTickPrice } from 'utils/formatTickPrice'
import { unwrappedToken } from 'utils/unwrappedToken'

import RangeBadge from '../../components/Badge/RangeBadge'
import { SmallButtonPrimary } from '../../components/Button/index'
import { getPriceOrderingFromPositionForUI } from '../../components/PositionListItem'
import RateToggle from '../../components/RateToggle'
import { TransactionType } from '../../state/transactions/types'
import { calculateGasMargin } from '../../utils/calculateGasMargin'
import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink'
import { LoadingRows } from './styleds'

const getTokenLink = (chainId: any, address: string) => {
  if (isGqlSupportedChain(chainId)) {
    const chainName = CHAIN_IDS_TO_NAMES[chainId]
    return `${window.location.origin}/#/tokens/${chainName}/${address}`
  } else {
    return getExplorerLink(chainId, address, ExplorerDataType.TOKEN)
  }
}
const MainContentWrapper = styled.main`
  width: 100%;
  margin-right: auto;
  margin-left: auto;
  padding: 10px;
  padding-top: 20px;
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
`

export const DarkCardOutline = styled(DarkCard)`
  border: 1px solid ${({ theme }) => theme.backgroundOutline};

  border-radius: 10px;
`
const DetailedCard = styled(DarkCard)`
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.surface1};
`

const PositionPageButtonPrimary = styled(ButtonPrimary)`
  width: 228px;
  height: 40px;
  font-size: 16px;
  line-height: 20px;
  border-radius: 12px;
`

const PageWrapper = styled.div`
  padding: 40px 16px 16px 16px;

  min-width: 800px;
  max-width: 960px;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    min-width: 100%;
    padding: 16px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    min-width: 100%;
    padding: 16px;
  }
`

const BadgeText = styled.div`
  font-weight: 500;
  font-size: 10px;
`

// responsive text
// disable the warning because we don't use the end prop, we just want to filter it out
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Label = styled(({ end, ...props }) => <ThemedText.DeprecatedLabel {...props} />)<{ end?: boolean }>`
  display: flex;
  font-size: 14px;
  justify-content: ${({ end }) => (end ? 'flex-end' : 'flex-start')};
  align-items: center;
`

const ExtentsText = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  text-align: center;
  margin-right: 4px;
  font-weight: 500;
`

const HoverText = styled(ThemedText.DeprecatedMain)`
  text-decoration: none;
  color: ${({ theme }) => theme.textTertiary};
  :hover {
    color: ${({ theme }) => theme.textPrimary};
    text-decoration: none;
  }
  font-size: 14px;
`

const DoubleArrow = styled.span`
  color: ${({ theme }) => theme.textTertiary};
  margin: 0 1rem;
`
const ResponsiveRow = styled(RowBetween)`
  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    flex-direction: column;
    align-items: flex-start;
    row-gap: 16px;
    width: 100%;
  }
`

const ActionButtonResponsiveRow = styled(ResponsiveRow)`
  width: 50%;
  justify-content: flex-end;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    width: 100%;
    flex-direction: row;
    * {
      width: 100%;
    }
  }
`

const ResponsiveButtonConfirmed = styled(ButtonConfirmed)`
  border-radius: 12px;
  padding: 6px 8px;
  width: fit-content;
  font-size: 16px;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    width: fit-content;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    width: fit-content;
  }
`

const NFTGrid = styled.div`
  display: grid;
  grid-template: 'overlap';
  min-height: 400px;
`

const NFTCanvas = styled.canvas`
  grid-area: overlap;
`

const NFTImage = styled.img`
  grid-area: overlap;
  height: 400px;
  /* Ensures SVG appears on top of canvas. */
  z-index: 1;
`

function CurrentPriceCard({
  inverted,
  pool,
  currencyQuote,
  currencyBase,
}: {
  inverted?: boolean
  pool?: Pool | null
  currencyQuote?: Currency
  currencyBase?: Currency
}) {
  if (!pool || !currencyQuote || !currencyBase) {
    return null
  }

  return (
    <DetailedCard padding="12px">
      <AutoColumn gap="sm" justify="center">
        <ExtentsText>
          <ThemedText.BodySmall>
            <Trans>Current price</Trans>
          </ThemedText.BodySmall>
        </ExtentsText>
        <ThemedText.BodySecondary textAlign="center">
          {formatPrice(inverted ? pool.token1Price : pool.token0Price, NumberType.TokenTx)}
        </ThemedText.BodySecondary>
        <ExtentsText>
          <ThemedText.BodySmall>
            <Trans>
              {currencyQuote?.symbol} per {currencyBase?.symbol}
            </Trans>
          </ThemedText.BodySmall>
        </ExtentsText>
      </AutoColumn>
    </DetailedCard>
  )
}

function LinkedCurrency({ chainId, currency }: { chainId?: number; currency?: Currency }) {
  const address = (currency as Token)?.address

  if (typeof chainId === 'number' && address) {
    return (
      <ExternalLink href={getTokenLink(chainId, address)}>
        <RowFixed>
          <CurrencyLogo currency={currency} size="15px" style={{ marginRight: '0.25rem' }} />
          <ThemedText.BodySmall fontWeight={600}>{currency?.symbol} ↗</ThemedText.BodySmall>
        </RowFixed>
      </ExternalLink>
    )
  }

  return (
    <RowFixed>
      <CurrencyLogo currency={currency} size="15px" style={{ marginRight: '0.25rem' }} />
      <ThemedText.BodySmall fontWeight={600}>{currency?.symbol}</ThemedText.BodySmall>
    </RowFixed>
  )
}

function getRatio(
  lower: Price<Currency, Currency>,
  current: Price<Currency, Currency>,
  upper: Price<Currency, Currency>
) {
  try {
    if (!current.greaterThan(lower)) {
      return 100
    } else if (!current.lessThan(upper)) {
      return 0
    }

    const a = Number.parseFloat(lower.toSignificant(15))
    const b = Number.parseFloat(upper.toSignificant(15))
    const c = Number.parseFloat(current.toSignificant(15))

    const ratio = Math.floor((1 / ((Math.sqrt(a * b) - Math.sqrt(b * c)) / (c - Math.sqrt(b * c)) + 1)) * 100)

    if (ratio < 0 || ratio > 100) {
      throw Error('Out of range')
    }

    return ratio
  } catch {
    return undefined
  }
}

// snapshots a src img into a canvas
function getSnapshot(src: HTMLImageElement, canvas: HTMLCanvasElement, targetHeight: number) {
  const context = canvas.getContext('2d')

  if (context) {
    let { width, height } = src

    // src may be hidden and not have the target dimensions
    const ratio = width / height
    height = targetHeight
    width = Math.round(ratio * targetHeight)

    // Ensure crispness at high DPIs
    canvas.width = width * devicePixelRatio
    canvas.height = height * devicePixelRatio
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    context.scale(devicePixelRatio, devicePixelRatio)

    context.clearRect(0, 0, width, height)
    context.drawImage(src, 0, 0, width, height)
  }
}

function NFT({ image, height: targetHeight }: { image: string; height: number }) {
  const [animate, setAnimate] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  return (
    <NFTGrid
      onMouseEnter={() => {
        setAnimate(true)
      }}
      onMouseLeave={() => {
        // snapshot the current frame so the transition to the canvas is smooth
        if (imageRef.current && canvasRef.current) {
          getSnapshot(imageRef.current, canvasRef.current, targetHeight)
        }
        setAnimate(false)
      }}
    >
      <NFTCanvas ref={canvasRef} />
      <NFTImage
        ref={imageRef}
        src={image}
        hidden={!animate}
        onLoad={() => {
          // snapshot for the canvas
          if (imageRef.current && canvasRef.current) {
            getSnapshot(imageRef.current, canvasRef.current, targetHeight)
          }
        }}
      />
    </NFTGrid>
  )
}

const useInverter = ({
  priceLower,
  priceUpper,
  quote,
  base,
  invert,
}: {
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  quote?: Token
  base?: Token
  invert?: boolean
}): {
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  quote?: Token
  base?: Token
} => {
  return {
    priceUpper: invert ? priceLower?.invert() : priceUpper,
    priceLower: invert ? priceUpper?.invert() : priceLower,
    quote: invert ? base : quote,
    base: invert ? quote : base,
  }
}

export function PositionPage() {
  const { tokenId: tokenIdFromUrl } = useParams<{ tokenId?: string }>()
  const { chainId, account, provider } = useWeb3React()
  const theme = useTheme()

  const parsedTokenId = tokenIdFromUrl ? BigNumber.from(tokenIdFromUrl) : undefined
  // const { loading, position: positionDetails } = useV3PositionFromTokenId(parsedTokenId)
  const {
    loading,
    position: lmtPositionDetails,
    // maxWithdrawable: maxWithdrawableValue,
  } = useLmtLpPositionFromTokenId(parsedTokenId)

  const {
    token0: token0Address,
    token1: token1Address,
    fee: feeAmount,
    liquidity,
    tickLower,
    tickUpper,
    tokenId,
  } = lmtPositionDetails || {}

  const maxWithdrawableValue = useMaxLiquidityToWithdraw(
    lmtPositionDetails,
    token0Address,
    token1Address,
    lmtPositionDetails?.fee
  )

  const maxWithdrawableLiquidity = maxWithdrawableValue?.toString()

  const removed = liquidity?.eq(0)

  // const metadata = usePositionTokenURI(parsedTokenId)

  const token0 = useToken(token0Address)
  const token1 = useToken(token1Address)

  const currency0 = token0 ? unwrappedToken(token0) : undefined
  const currency1 = token1 ? unwrappedToken(token1) : undefined

  // flag for receiving WETH
  const [receiveWETH, setReceiveWETH] = useState(true)
  const nativeCurrency = useNativeCurrency()
  const nativeWrappedSymbol = nativeCurrency.wrapped.symbol

  // construct Position from details returned
  const [poolState, pool] = usePool(token0 ?? undefined, token1 ?? undefined, feeAmount)
  const position = useMemo(() => {
    if (pool && liquidity && typeof tickLower === 'number' && typeof tickUpper === 'number') {
      return new Position({ pool, liquidity: liquidity.toString(), tickLower, tickUpper })
    }
    return undefined
  }, [liquidity, pool, tickLower, tickUpper])

  const { result: ratesData } = useRateAndUtil(
    pool?.token0.address,
    pool?.token1.address,
    pool?.fee,
    tickLower,
    tickUpper
  )

  // const price = pool?.token0Price
  // const priceLower = formatTickPrice({
  //   price: priceLower,
  //   atLimit: tickAtLimit,
  //   direction: Bound.LOWER,
  //   numberType: NumberType.TokenTx,
  // })
  // const priceUpper = formatTickPrice({
  //   price: priceUpper,
  //   atLimit: tickAtLimit,
  //   direction: Bound.UPPER,
  //   numberType: NumberType.TokenTx,
  // })
  // useEstimatedAPR()
  // const estimatedAPR = useEstimatedAPR(

  // )

  const maxWithdrawablePosition = useMemo(() => {
    if (pool && maxWithdrawableLiquidity && typeof tickLower === 'number' && typeof tickUpper === 'number') {
      return new Position({ pool, liquidity: maxWithdrawableLiquidity, tickLower, tickUpper })
    }
    return undefined
  }, [maxWithdrawableLiquidity, pool, tickLower, tickUpper])

  let maxWithdrawableToken0
  let maxWithdrawableToken1
  let maximumWithdrawablePercentage
  if (maxWithdrawablePosition && position) {
    if (Number(maxWithdrawableLiquidity) < Number(liquidity?.toString())) {
      maxWithdrawableToken0 = maxWithdrawablePosition.amount0.toSignificant(4)
      maxWithdrawableToken1 = maxWithdrawablePosition.amount1.toSignificant(4)
      maximumWithdrawablePercentage = Math.round(
        (100 * Number(maxWithdrawableLiquidity)) / Number(liquidity?.toString())
      )
    } else {
      maxWithdrawableToken0 = position.amount0.toSignificant(4)
      maxWithdrawableToken1 = position.amount1.toSignificant(4)
      maximumWithdrawablePercentage = 100
    }
  }
  // console.log(
  //   'maxWithdrawableposition',
  //   maxWithdrawablePosition,
  //   position,
  //   maxWithdrawableLiquidity,
  //   liquidity?.toString()
  // )

  const tickAtLimit = useIsTickAtLimit(feeAmount, tickLower, tickUpper)

  const pricesFromPosition = getPriceOrderingFromPositionForUI(position)
  const [manuallyInverted, setManuallyInverted] = useState(false)

  // handle manual inversion
  const { priceLower, priceUpper, base } = useInverter({
    priceLower: pricesFromPosition.priceLower,
    priceUpper: pricesFromPosition.priceUpper,
    quote: pricesFromPosition.quote,
    base: pricesFromPosition.base,
    invert: manuallyInverted,
  })

  const inverted = token1 ? base?.equals(token1) : undefined
  const currencyQuote = inverted ? currency0 : currency1
  const currencyBase = inverted ? currency1 : currency0

  const ratio = useMemo(() => {
    return priceLower && pool && priceUpper
      ? getRatio(
          inverted ? priceUpper.invert() : priceLower,
          pool.token0Price,
          inverted ? priceLower.invert() : priceUpper
        )
      : undefined
  }, [inverted, pool, priceLower, priceUpper])

  // fees
  // const [feeValue0, feeValue1] = useV3PositionFees(pool ?? undefined, lmtPositionDetails?.tokenId, receiveWETH)
  const [feeValue0, feeValue1] = useLMTPositionFees(pool ?? undefined, lmtPositionDetails?.tokenId, receiveWETH)

  // these currencies will match the feeValue{0,1} currencies for the purposes of fee collection
  const currency0ForFeeCollectionPurposes = pool ? (receiveWETH ? pool.token0 : unwrappedToken(pool.token0)) : undefined
  const currency1ForFeeCollectionPurposes = pool ? (receiveWETH ? pool.token1 : unwrappedToken(pool.token1)) : undefined

  const [collecting, setCollecting] = useState<boolean>(false)
  const [collectMigrationHash, setCollectMigrationHash] = useState<string | null>(null)
  const isCollectPending = useIsTransactionPending(collectMigrationHash ?? undefined)
  const [showConfirm, setShowConfirm] = useState(false)

  // usdc prices always in terms of tokens
  const price0 = useStablecoinPrice(token0 ?? undefined)
  const price1 = useStablecoinPrice(token1 ?? undefined)

  const fiatValueOfFees: CurrencyAmount<Currency> | null = useMemo(() => {
    if (!price0 || !price1 || !feeValue0 || !feeValue1) return null

    // we wrap because it doesn't matter, the quote returns a USDC amount
    const feeValue0Wrapped = feeValue0?.wrapped
    const feeValue1Wrapped = feeValue1?.wrapped

    if (!feeValue0Wrapped || !feeValue1Wrapped) return null

    const amount0 = price0.quote(feeValue0Wrapped)
    const amount1 = price1.quote(feeValue1Wrapped)
    return amount0.add(amount1)
  }, [price0, price1, feeValue0, feeValue1])

  const fiatValueOfLiquidity: CurrencyAmount<Token> | null = useMemo(() => {
    if (!price0 || !price1 || !position) return null
    const amount0 = price0.quote(position.amount0)
    const amount1 = price1.quote(position.amount1)
    return amount0.add(amount1)
  }, [price0, price1, position])

  const addTransaction = useTransactionAdder()
  const positionManager = useV3NFTPositionManagerContract()
  const lmtPositionManager = useLmtNFTPositionManager()

  const callback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      if (
        !account ||
        !currency0ForFeeCollectionPurposes ||
        !currency1ForFeeCollectionPurposes ||
        !chainId ||
        !lmtPositionManager ||
        !account ||
        !tokenId ||
        !provider
      )
        throw new Error('missing account')

      const response = await lmtPositionManager.collect(
        {
          tokenId: tokenId.toString(),
          recipient: account,
        },
        { gasLimit: 10000000 }
      )
      return response
    } catch (err) {
      console.log('collect order error', err)
      throw new Error('cancel order error')
    }
  }, [
    chainId,
    currency0ForFeeCollectionPurposes,
    currency1ForFeeCollectionPurposes,
    account,
    tokenId,
    provider,
    lmtPositionManager,
  ])

  const collectLMTFees = useCallback(() => {
    if (
      !currency0ForFeeCollectionPurposes ||
      !currency1ForFeeCollectionPurposes ||
      !chainId ||
      !lmtPositionManager ||
      !account ||
      !tokenId ||
      !provider ||
      !feeValue1 ||
      !feeValue0
    )
      return
    // setAttemptingTxn(true)

    callback()
      .then((response) => {
        // setAttemptingTxn(false)
        // setTxHash(response?.hash)
        // setErrorMessage(undefined)
        // addTransaction(response, {
        //   type: TransactionType.COLLECT_FEES,
        //   inputCurrencyId: inputCurrency.wrapped.address,
        //   outputCurrencyId: outputCurrency.wrapped.address,
        // })
        setCollectMigrationHash(response.hash)
        setCollecting(false)

        sendEvent({
          category: 'Liquidity',
          action: 'CollectV3',
          label: [currency0ForFeeCollectionPurposes.symbol, currency1ForFeeCollectionPurposes.symbol].join('/'),
        })

        addTransaction(response, {
          type: TransactionType.COLLECT_FEES,
          currencyId0: currencyId(currency0ForFeeCollectionPurposes),
          currencyId1: currencyId(currency1ForFeeCollectionPurposes),
          expectedCurrencyOwed0: feeValue0?.multiply(10 ** feeValue0?.currency.decimals).toExact(),
          expectedCurrencyOwed1: feeValue1?.multiply(10 ** feeValue1?.currency.decimals).toExact(),
        })

        return response.hash
      })
      .catch((error) => {
        console.error(error)
        setCollecting(false)

        // setAttemptingTxn(false)
        // setTxHash(undefined)
        // setErrorMessage(error.message)
      })
  }, [
    chainId,
    feeValue0,
    feeValue1,
    currency0ForFeeCollectionPurposes,
    currency1ForFeeCollectionPurposes,
    account,
    tokenId,
    addTransaction,
    provider,
    callback,
    lmtPositionManager,
  ])

  const collect = useCallback(() => {
    if (
      !currency0ForFeeCollectionPurposes ||
      !currency1ForFeeCollectionPurposes ||
      !chainId ||
      !positionManager ||
      !account ||
      !tokenId ||
      !provider ||
      !feeValue1 ||
      !feeValue0
    )
      return

    setCollecting(true)

    // we fall back to expecting 0 fees in case the fetch fails, which is safe in the
    // vast majority of cases
    const { calldata, value } = NonfungiblePositionManager.collectCallParameters({
      tokenId: tokenId.toString(),
      expectedCurrencyOwed0: feeValue0 ?? CurrencyAmount.fromRawAmount(currency0ForFeeCollectionPurposes, 0),
      expectedCurrencyOwed1: feeValue1 ?? CurrencyAmount.fromRawAmount(currency1ForFeeCollectionPurposes, 0),
      recipient: account,
    })

    const txn = {
      to: positionManager.address,
      data: calldata,
      value,
    }

    provider
      .getSigner()
      .estimateGas(txn)
      .then((estimate) => {
        const newTxn = {
          ...txn,
          gasLimit: calculateGasMargin(estimate),
        }

        return provider
          .getSigner()
          .sendTransaction(newTxn)
          .then((response: TransactionResponse) => {
            setCollectMigrationHash(response.hash)
            setCollecting(false)

            sendEvent({
              category: 'Liquidity',
              action: 'CollectV3',
              label: [currency0ForFeeCollectionPurposes.symbol, currency1ForFeeCollectionPurposes.symbol].join('/'),
            })

            addTransaction(response, {
              type: TransactionType.COLLECT_FEES,
              currencyId0: currencyId(currency0ForFeeCollectionPurposes),
              currencyId1: currencyId(currency1ForFeeCollectionPurposes),
              expectedCurrencyOwed0: feeValue0.toExact(),
              expectedCurrencyOwed1: feeValue1.toExact(),
            })
          })
      })
      .catch((error) => {
        setCollecting(false)
        console.error(error)
      })
  }, [
    chainId,
    feeValue0,
    feeValue1,
    currency0ForFeeCollectionPurposes,
    currency1ForFeeCollectionPurposes,
    positionManager,
    account,
    tokenId,
    addTransaction,
    provider,
  ])

  // const owner = useSingleCallResult(tokenId ? positionManager : null, 'ownerOf', [tokenId]).result?.[0]
  const owner = useSingleCallResult(tokenId ? lmtPositionManager : null, 'ownerOf', [tokenId]).result?.[0]

  const ownsNFT = owner === account || lmtPositionDetails?.operator === account
  // console.log('owner', ownsNFT, owner, account, lmtPositionDetails?.operator)
  const feeValueUpper = inverted ? feeValue0 : feeValue1
  const feeValueLower = inverted ? feeValue1 : feeValue0

  // check if price is within range
  const below = pool && typeof tickLower === 'number' ? pool.tickCurrent < tickLower : undefined
  const above = pool && typeof tickUpper === 'number' ? pool.tickCurrent >= tickUpper : undefined
  const inRange: boolean = typeof below === 'boolean' && typeof above === 'boolean' ? !below && !above : false

  function modalHeader() {
    return (
      <AutoColumn gap="md" style={{ marginTop: '20px' }}>
        <LightCard padding="12px 16px">
          <AutoColumn gap="md">
            <RowBetween>
              <RowFixed>
                <CurrencyLogo currency={feeValueUpper?.currency} size="14px" style={{ marginRight: '0.5rem' }} />
                <ThemedText.BodySmall color="textSecondary">
                  {feeValueUpper ? formatCurrencyAmount(feeValueUpper, 4) : '-'}
                </ThemedText.BodySmall>
              </RowFixed>
              <ThemedText.BodySmall color="textSecondary">{feeValueUpper?.currency?.symbol}</ThemedText.BodySmall>
            </RowBetween>
            <RowBetween>
              <RowFixed>
                <CurrencyLogo currency={feeValueLower?.currency} size="14px" style={{ marginRight: '0.5rem' }} />
                <ThemedText.BodySmall color="textSecondary">
                  {feeValueLower ? formatCurrencyAmount(feeValueLower, 4) : '-'}
                </ThemedText.BodySmall>
              </RowFixed>
              <ThemedText.BodySmall color="textSecondary">{feeValueLower?.currency?.symbol}</ThemedText.BodySmall>
            </RowBetween>
          </AutoColumn>
        </LightCard>
        <ThemedText.DeprecatedItalic>
          <Trans>Collecting fees will withdraw currently available fees for you.</Trans>
        </ThemedText.DeprecatedItalic>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ButtonPrimary
            padding="5px 6px"
            width="fit-content"
            style={{ marginRight: '8px', borderRadius: '10px' }}
            onClick={collectLMTFees}
          >
            <ThemedText.BodySmall fontWeight={600} color="textSecondary">
              <Trans>Collect</Trans>
            </ThemedText.BodySmall>
          </ButtonPrimary>
        </div>
      </AutoColumn>
    )
  }

  const showCollectAsWeth = Boolean(
    ownsNFT &&
      (feeValue0?.greaterThan(0) || feeValue1?.greaterThan(0)) &&
      currency0 &&
      currency1 &&
      (currency0.isNative || currency1.isNative) &&
      !collectMigrationHash
  )

  if (!lmtPositionDetails && !loading) {
    return (
      <PageWrapper>
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
          <ThemedText.HeadlineLarge style={{ marginBottom: '8px' }}>
            <Trans>Position unavailable</Trans>
          </ThemedText.HeadlineLarge>
          <ThemedText.BodyPrimary style={{ marginBottom: '32px' }}>
            <Trans>To view a position, you must be connected to the network it belongs to.</Trans>
          </ThemedText.BodyPrimary>
          <PositionPageButtonPrimary as={Link} to="/pools" width="fit-content">
            <Trans>Back to Pools</Trans>
          </PositionPageButtonPrimary>
        </div>
      </PageWrapper>
    )
  }

  return loading || poolState === PoolState.LOADING || !feeAmount ? (
    <LoadingRows>
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </LoadingRows>
  ) : (
    <Trace page={InterfacePageName.POOL_PAGE} shouldLogImpression>
      <>
        <PageWrapper>
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={() => setShowConfirm(false)}
            attemptingTxn={collecting}
            hash={collectMigrationHash ?? ''}
            content={() => (
              <ConfirmationModalContent
                title={<Trans>Claim fees</Trans>}
                onDismiss={() => setShowConfirm(false)}
                topContent={modalHeader}
              />
            )}
            pendingText={<Trans>Collecting fees</Trans>}
          />
          <AutoColumn gap="md">
            <AutoColumn gap="sm">
              <Link
                data-cy="visit-pool"
                style={{ textDecoration: 'none', width: 'fit-content', marginBottom: '0.5rem' }}
                to="/pools"
              >
                <HoverText>
                  <Trans>← Back to Pools</Trans>
                </HoverText>
              </Link>
            </AutoColumn>
            <MainContentWrapper>
              <AutoColumn gap="sm">
                <ResponsiveRow>
                  <RowFixed>
                    <DoubleCurrencyLogo currency0={currencyBase} currency1={currencyQuote} size={14} margin={true} />
                    <ThemedText.DeprecatedLabel fontSize="14px" mr="10px">
                      &nbsp;{currencyQuote?.symbol}/{currencyBase?.symbol}
                    </ThemedText.DeprecatedLabel>
                    <Badge style={{ marginRight: '8px' }}>
                      <BadgeText>
                        <Trans>{new Percent(feeAmount, 1_000_000).toSignificant()}%</Trans>
                      </BadgeText>
                    </Badge>
                  </RowFixed>
                </ResponsiveRow>
                <RowBetween></RowBetween>
              </AutoColumn>
              <ResponsiveRow align="flex-start">
                <HideSmall
                  style={{
                    marginRight: '12px',
                  }}
                ></HideSmall>
                <AutoColumn gap="sm" style={{ width: '100%', height: '100%' }}>
                  <DarkCard>
                    <AutoColumn gap="md" style={{ width: '100%' }}>
                      <RowBetween style={{ alignItems: 'flex-start' }}>
                        <AutoColumn gap="sm">
                          <Label>
                            <Trans>Liquidity</Trans>
                          </Label>

                          {fiatValueOfLiquidity?.greaterThan(new Fraction(1, 100)) ? (
                            <ThemedText.DeprecatedLargeHeader fontSize="12px" fontWeight={400}>
                              <Trans>${fiatValueOfLiquidity.toFixed(2, { groupSeparator: ',' })}</Trans>
                            </ThemedText.DeprecatedLargeHeader>
                          ) : (
                            <ThemedText.DeprecatedLargeHeader
                              color={theme.textPrimary}
                              fontSize="14px"
                              fontWeight={400}
                            >
                              {/*<Trans>$-</Trans>*/}
                            </ThemedText.DeprecatedLargeHeader>
                          )}
                        </AutoColumn>
                        {currency0 && currency1 && feeAmount && tokenId ? (
                          <SmallButtonPrimary
                            as={Link}
                            to={`/increase/${currencyId(currency0)}/${currencyId(currency1)}/${feeAmount}/${tokenId}`}
                            padding="5px 8px"
                            width="fit-content"
                            $borderRadius="10px"
                            style={{ marginRight: '8px' }}
                          >
                            <Trans>Increase Liquidity</Trans>
                          </SmallButtonPrimary>
                        ) : null}
                      </RowBetween>

                      <DarkCardOutline padding="12px 16px">
                        <AutoColumn gap="md">
                          <RowBetween>
                            <LinkedCurrency chainId={chainId} currency={currencyQuote} />
                            <RowFixed>
                              <ThemedText.BodySmall color="textSecondary">
                                {inverted ? position?.amount0.toSignificant(4) : position?.amount1.toSignificant(4)}
                              </ThemedText.BodySmall>
                              {typeof ratio === 'number' && !removed ? (
                                <Badge style={{ marginLeft: '10px' }}>
                                  <ThemedText.DeprecatedMain color={theme.textSecondary} fontSize={10}>
                                    <Trans>{inverted ? ratio : 100 - ratio}%</Trans>
                                  </ThemedText.DeprecatedMain>
                                </Badge>
                              ) : null}
                            </RowFixed>
                          </RowBetween>
                          <RowBetween>
                            <LinkedCurrency chainId={chainId} currency={currencyBase} />
                            <RowFixed>
                              <ThemedText.BodySmall color="textSecondary">
                                {inverted ? position?.amount1.toSignificant(4) : position?.amount0.toSignificant(4)}
                              </ThemedText.BodySmall>
                              {typeof ratio === 'number' && !removed ? (
                                <Badge style={{ marginLeft: '10px' }}>
                                  <ThemedText.DeprecatedMain color={theme.textSecondary} fontSize={10}>
                                    <Trans>{inverted ? 100 - ratio : ratio}%</Trans>
                                  </ThemedText.DeprecatedMain>
                                </Badge>
                              ) : null}
                            </RowFixed>
                          </RowBetween>
                        </AutoColumn>
                      </DarkCardOutline>
                    </AutoColumn>
                  </DarkCard>
                  <DarkCard>
                    <AutoColumn gap="md" style={{ width: '100%' }}>
                      <AutoColumn gap="md">
                        <RowBetween style={{ alignItems: 'flex-start' }}>
                          <AutoColumn gap="md">
                            <Label>
                              <Trans>Maximum Withdrawable </Trans>
                              <Badge style={{ marginLeft: '10px' }}>
                                <ThemedText.DeprecatedLargeHeader color={theme.accentWarning} fontSize={11}>
                                  <Trans>{maximumWithdrawablePercentage}%</Trans>
                                </ThemedText.DeprecatedLargeHeader>
                              </Badge>
                              {/*<RangeBadge removed={removed} inRange={inRange} />
                            <span style={{ width: '8px' }} /> */}
                            </Label>

                            {
                              //fiatValueOfFees?.greaterThan(new Fraction(1, 100))
                              false ? (
                                <ThemedText.DeprecatedLargeHeader
                                  color={theme.accentSuccess}
                                  fontSize="36px"
                                  fontWeight={500}
                                >
                                  <Trans>${fiatValueOfFees?.toFixed(2, { groupSeparator: ',' })}</Trans>
                                </ThemedText.DeprecatedLargeHeader>
                              ) : (
                                <ThemedText.DeprecatedLargeHeader
                                  color={theme.textPrimary}
                                  fontSize="36px"
                                  fontWeight={500}
                                >
                                  {/*<Trans>$-</Trans>*/}
                                </ThemedText.DeprecatedLargeHeader>
                              )
                            }
                          </AutoColumn>
                          {/* {ownsNFT && tokenId && !removed ? ( */}
                          {tokenId && !removed ? (
                            <SmallButtonPrimary
                              as={Link}
                              to={`/remove/${tokenId}`}
                              padding="5px 8px"
                              width="fit-content"
                              $borderRadius="10px"
                            >
                              <Trans>Remove Liquidity</Trans>
                            </SmallButtonPrimary>
                          ) : null}
                        </RowBetween>
                      </AutoColumn>
                      <DarkCardOutline padding="12px 16px">
                        <AutoColumn gap="md">
                          <RowBetween>
                            <LinkedCurrency chainId={chainId} currency={currencyQuote} />
                            <RowFixed>
                              <ThemedText.BodySmall color="textSecondary">
                                {inverted ? maxWithdrawableToken0 : maxWithdrawableToken1}
                              </ThemedText.BodySmall>
                              {/*typeof ratio === 'number' && !removed ? (
                              <Badge style={{ marginLeft: '10px' }}>
                                <ThemedText.DeprecatedMain color={theme.accentWarning} fontSize={11}>
                                  <Trans>{100}%</Trans>
                                </ThemedText.DeprecatedMain>
                              </Badge>
                            ) : null*/}
                            </RowFixed>
                          </RowBetween>
                          <RowBetween>
                            <LinkedCurrency chainId={chainId} currency={currencyBase} />
                            <RowFixed>
                              <ThemedText.BodySmall color="textSecondary">
                                {inverted ? maxWithdrawableToken1 : maxWithdrawableToken0}
                              </ThemedText.BodySmall>
                              {/*typeof ratio === 'number' && !removed ? (
                              <Badge style={{ marginLeft: '10px' }}>
                                <ThemedText.DeprecatedMain color={theme.accentWarning} fontSize={11}>
                                  <Trans>{100}%</Trans>
                                </ThemedText.DeprecatedMain>
                              </Badge>
                            ) : null*/}
                            </RowFixed>
                          </RowBetween>
                        </AutoColumn>
                      </DarkCardOutline>

                      {false && showCollectAsWeth && (
                        <AutoColumn gap="md">
                          <RowBetween>
                            <ThemedText.DeprecatedMain>
                              <Trans>Collect as {nativeWrappedSymbol}</Trans>
                            </ThemedText.DeprecatedMain>
                            <Toggle
                              id="receive-as-weth"
                              isActive={receiveWETH}
                              toggle={() => setReceiveWETH((receiveWETH) => !receiveWETH)}
                            />
                          </RowBetween>
                        </AutoColumn>
                      )}
                    </AutoColumn>
                  </DarkCard>

                  <DarkCard>
                    <AutoColumn gap="md" style={{ width: '100%' }}>
                      <AutoColumn gap="md">
                        <RowBetween style={{ alignItems: 'flex-start' }}>
                          <AutoColumn gap="md">
                            <Label>
                              <Trans>Unclaimed Fees + Interests</Trans>
                            </Label>
                            {fiatValueOfFees?.greaterThan(new Fraction(1, 100)) ? (
                              <ThemedText.DeprecatedLargeHeader
                                color={theme.accentSuccess}
                                fontSize="12px"
                                fontWeight={500}
                              >
                                <Trans>${fiatValueOfFees?.toFixed(2, { groupSeparator: ',' })}</Trans>
                              </ThemedText.DeprecatedLargeHeader>
                            ) : (
                              <ThemedText.DeprecatedLargeHeader
                                color={theme.textPrimary}
                                fontSize="12px"
                                fontWeight={500}
                              >
                                {/*<Trans>$-</Trans>*/}
                              </ThemedText.DeprecatedLargeHeader>
                            )}
                          </AutoColumn>
                          {ownsNFT &&
                          (feeValue0?.greaterThan(0) || feeValue1?.greaterThan(0) || !!collectMigrationHash) ? (
                            <ResponsiveButtonConfirmed
                              disabled={collecting || !!collectMigrationHash}
                              confirmed={!!collectMigrationHash && !isCollectPending}
                              padding="5px 8px"
                              width="fit-content"
                              style={{ marginRight: '8px', borderRadius: '10px' }}
                              onClick={() => setShowConfirm(true)}
                            >
                              {!!collectMigrationHash && !isCollectPending ? (
                                <ThemedText.BodySmall fontWeight={600} color="textSecondary">
                                  <Trans> Collected</Trans>
                                </ThemedText.BodySmall>
                              ) : isCollectPending || collecting ? (
                                <ThemedText.BodySmall fontWeight={600} color="textSecondary">
                                  {' '}
                                  <Dots>
                                    <Trans>Collecting</Trans>
                                  </Dots>
                                </ThemedText.BodySmall>
                              ) : (
                                <>
                                  <ThemedText.BodySmall fontWeight={600} color="textSecondary">
                                    <Trans>Collect Fees + Interests</Trans>
                                  </ThemedText.BodySmall>
                                </>
                              )}
                            </ResponsiveButtonConfirmed>
                          ) : null}
                        </RowBetween>
                      </AutoColumn>
                      <DarkCardOutline padding="12px 16px">
                        <AutoColumn gap="md">
                          <RowBetween>
                            <LinkedCurrency chainId={chainId} currency={currencyQuote} />
                            <RowFixed>
                              <ThemedText.BodySmall color="textSecondary">
                                {feeValueUpper ? formatCurrencyAmount(feeValueUpper, 10) : '-'}
                              </ThemedText.BodySmall>
                            </RowFixed>
                          </RowBetween>
                          <RowBetween>
                            <RowFixed>
                              <LinkedCurrency chainId={chainId} currency={currencyBase} />
                            </RowFixed>
                            <RowFixed>
                              <ThemedText.BodySmall color="textSecondary">
                                {feeValueLower ? formatCurrencyAmount(feeValueLower, 10) : '-'}
                              </ThemedText.BodySmall>
                            </RowFixed>
                          </RowBetween>
                        </AutoColumn>
                      </DarkCardOutline>
                      <Label>
                        <ThemedText.DeprecatedLargeHeader color={theme.accentSuccess} fontSize="12px" fontWeight={500}>
                          <Trans>
                            Interest only APR (variable) : {ratesData ? formatBNToString(ratesData?.apr) + '%' : '-'}
                          </Trans>
                        </ThemedText.DeprecatedLargeHeader>
                      </Label>
                      {false && showCollectAsWeth && (
                        <AutoColumn gap="md">
                          <RowBetween>
                            <ThemedText.DeprecatedMain>
                              <Trans>Collect as {nativeWrappedSymbol}</Trans>
                            </ThemedText.DeprecatedMain>
                            <Toggle
                              id="receive-as-weth"
                              isActive={receiveWETH}
                              toggle={() => setReceiveWETH((receiveWETH) => !receiveWETH)}
                            />
                          </RowBetween>
                        </AutoColumn>
                      )}
                    </AutoColumn>
                  </DarkCard>
                </AutoColumn>
              </ResponsiveRow>
              <DarkCard>
                <AutoColumn gap="md">
                  <RowBetween>
                    <RowFixed>
                      <Label display="flex" style={{ marginRight: '12px' }}>
                        <Trans>Price range</Trans>
                      </Label>
                      <HideExtraSmall>
                        <>
                          <RangeBadge removed={removed} inRange={inRange} />
                          <span style={{ width: '8px' }} />
                        </>
                      </HideExtraSmall>
                    </RowFixed>
                    <RowFixed>
                      {currencyBase && currencyQuote && (
                        <RateToggle
                          currencyA={currencyBase}
                          currencyB={currencyQuote}
                          handleRateToggle={() => setManuallyInverted(!manuallyInverted)}
                        />
                      )}
                    </RowFixed>
                  </RowBetween>

                  <RowBetween>
                    <DarkCardOutline padding="12px" width="100%">
                      <AutoColumn gap="sm" justify="center">
                        <ExtentsText>
                          <ThemedText.BodySmall>
                            <Trans>Min Price</Trans>
                          </ThemedText.BodySmall>
                        </ExtentsText>
                        <ThemedText.BodySecondary textAlign="center">
                          {formatTickPrice({
                            price: priceLower,
                            atLimit: tickAtLimit,
                            direction: Bound.LOWER,
                            numberType: NumberType.TokenTx,
                          })}
                        </ThemedText.BodySecondary>
                        <ExtentsText>
                          {' '}
                          <ThemedText.BodySmall color="textSecondary">
                            <Trans>
                              {currencyQuote?.symbol} per {currencyBase?.symbol}
                            </Trans>
                          </ThemedText.BodySmall>
                        </ExtentsText>

                        {inRange && (
                          <ThemedText.DeprecatedSmall color={theme.textTertiary}>
                            <Trans>Your position will be 100% {currencyBase?.symbol} at this price.</Trans>
                          </ThemedText.DeprecatedSmall>
                        )}
                      </AutoColumn>
                    </DarkCardOutline>

                    <DoubleArrow>⟷</DoubleArrow>
                    <DarkCardOutline padding="12px" width="100%">
                      <AutoColumn gap="sm" justify="center">
                        <ThemedText.BodySmall>
                          <Trans>Max price</Trans>
                        </ThemedText.BodySmall>
                        <ThemedText.BodySecondary textAlign="center">
                          {formatTickPrice({
                            price: priceUpper,
                            atLimit: tickAtLimit,
                            direction: Bound.UPPER,
                            numberType: NumberType.TokenTx,
                          })}
                        </ThemedText.BodySecondary>
                        <ExtentsText>
                          {' '}
                          <ThemedText.BodySmall color="textSecondary">
                            <Trans>
                              {currencyQuote?.symbol} per {currencyBase?.symbol}
                            </Trans>
                          </ThemedText.BodySmall>
                        </ExtentsText>

                        {inRange && (
                          <ThemedText.DeprecatedSmall color={theme.textTertiary}>
                            <Trans>Your position will be 100% {currencyQuote?.symbol} at this price.</Trans>
                          </ThemedText.DeprecatedSmall>
                        )}
                      </AutoColumn>
                    </DarkCardOutline>
                  </RowBetween>
                  <CurrentPriceCard
                    inverted={inverted}
                    pool={pool}
                    currencyQuote={currencyQuote}
                    currencyBase={currencyBase}
                  />
                </AutoColumn>
              </DarkCard>
            </MainContentWrapper>
          </AutoColumn>
        </PageWrapper>
        {/*<SwitchLocaleLink /> */}
      </>
    </Trace>
  )
}
