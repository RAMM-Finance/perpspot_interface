import { Trans } from '@lingui/macro'
import { formatPrice, NumberType } from '@uniswap/conedison/format'
import { Currency } from '@uniswap/sdk-core'
import { Pool, tickToPrice } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { BaseButton } from 'components/Button'
import Card, { LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { OpacityHoverState } from 'components/Common'
import { TextWrapper } from 'components/HoverInlineText'
import { LmtModal } from 'components/Modal'
import { TextWithLoadingPlaceholder } from 'components/modalFooters/common'
import { GreenText } from 'components/OrdersTable/TokenRow'
import Row, { RowBetween, RowFixed } from 'components/Row'
import { MouseoverTooltip } from 'components/Tooltip'
import { useCurrency, useToken } from 'hooks/Tokens'
import { BorrowedLiquidityRange, getLiquidityTicks, useBorrowedLiquidityRange } from 'hooks/useBorrowedLiquidityRange'
import useIsTickAtLimit from 'hooks/useIsTickAtLimit'
import { useMarginLMTPositionFromPositionId } from 'hooks/useLMTV2Positions'
import { useInstantaeneousRate } from 'hooks/useLMTV2Positions'
import { usePool } from 'hooks/usePools'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { ArrowRightIcon } from 'nft/components/icons'
import { ReactNode, useMemo, useState } from 'react'
import { useTickDiscretization } from 'state/mint/v3/hooks'
import styled from 'styled-components/macro'
import { CloseIcon, ThemedText } from 'theme'
import { textFadeIn } from 'theme/styles'
import { MarginPositionDetails, TraderPositionKey } from 'types/lmtv2position'
import { TokenBN } from 'utils/lmtSDK/internalConstants'
import { unwrappedToken } from 'utils/unwrappedToken'

import DecreasePositionContent from './DecreasePositionContent'
import IncreasePosition from './DecreasePositionContent/IncreasePosition'
import { DepositPremiumContent } from './DepositPremiumContent'
import { LoadingBubble } from './loading'
import { positionEntryPrice } from './TokenRow'
import { WithdrawPremiumContent } from './WithdrawPremiumContent'

interface TradeModalProps {
  marginInPosToken: boolean
  isOpen: boolean
  selectedTab: TradeModalActiveTab | undefined
  positionKey: TraderPositionKey | undefined
  onClose: () => void
  refetchLeveragePositions?: () => any
}

export enum TradeModalActiveTab {
  INCREASE_POSITION,
  DECREASE_POSITION,
  DEPOSIT_PREMIUM,
  WITHDRAW_PREMIUM,
}

interface DerivedDepositPremiumInfo {
  newDepositAmount: TokenBN
  amount: TokenBN
}

const TabElement = styled(BaseButton)<{ isActive: boolean; first?: boolean; last?: boolean }>`
  padding: 0;
  border: none;
  background: ${({ theme, isActive }) => (isActive ? theme.background : theme.backgroundSurface)};
  color: ${({ theme, isActive }) => (isActive ? theme.textSecondary : theme.textPrimary)};
  font-size: 13px;
  font-weight: ${({ isActive }) => (isActive ? '800' : '500')};
  line-height: 1.2;
  width: auto;
  cursor: pointer;
  padding: 0.5rem 0.35rem;
  margin-right: 0.25rem;
  margin: 0;
  outline: none;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.background};
  ${OpacityHoverState}
`

const TabsWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: row;
  margin-bottom: 0.5rem;
  border-radius: 10px;
  gap: 0.1rem;
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  // height: 100%;
  height: 590px;
  border-radius: 20px;
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-height: 450px;
  // border-right: 1px solid ${({ theme }) => theme.backgroundOutline};
`

const PositionInfoWrapper = styled(LightCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 20px;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  width: 100%;
  justify-content: flex-start;
  border: none;
  background: ${({ theme }) => theme.backgroundSurface};
  padding: 0.75rem;
`

const ActionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  align-items: center;
  justify-content: flex-start;
  border-right: 1px solid ${({ theme }) => theme.backgroundOutline};
`

export interface AlteredPositionProperties {
  totalPosition?: BN
  margin?: BN
  totalDebtOutput?: BN
  totalDebtInput?: BN
  repayTime?: number
  premiumOwed?: BN // how much premium is owed since last repayment
  premiumDeposit?: BN
  premiumLeft?: BN
  executionPrice?: BN
}

export function LeveragePositionModal(props: TradeModalProps) {
  const { isOpen, positionKey, onClose, refetchLeveragePositions } = props
  const [activeTab, setActiveTab] = useState<TradeModalActiveTab>(
    props.selectedTab ?? TradeModalActiveTab.DECREASE_POSITION
  )
  const [alteredPosition, setAlteredPosition] = useState<AlteredPositionProperties>({
    totalPosition: undefined,
    margin: undefined,
    totalDebtInput: undefined,
    totalDebtOutput: undefined,
    premiumDeposit: undefined,
    executionPrice: undefined,
  })
  const { position: existingPosition, loading: positionLoading } = useMarginLMTPositionFromPositionId(positionKey)
  const inputCurrency = useCurrency(
    existingPosition?.isToken0 ? positionKey?.poolKey.token1 : positionKey?.poolKey.token0
  )
  const outputCurrency = useCurrency(
    existingPosition?.isToken0 ? positionKey?.poolKey.token0 : positionKey?.poolKey.token1
  )

  // const dataLoading = positionLoading || !existingPosition || !inputCurrency || !outputCurrency

  const [alteredPremium, setAlteredPremium] = useState<BN | undefined>(undefined)

  const handleTxnInfo = (txnInfo: DerivedDepositPremiumInfo | undefined | null) => {
    setAlteredPremium(txnInfo?.newDepositAmount)
  }

  const displayedContent = useMemo(() => {
    if (!positionKey) return null
    return activeTab === TradeModalActiveTab.DECREASE_POSITION ? (
      <DecreasePositionContent
        marginInPosToken={props.marginInPosToken}
        positionKey={positionKey}
        onPositionChange={setAlteredPosition}
        inputCurrency={inputCurrency ?? undefined}
        outputCurrency={outputCurrency ?? undefined}
        positionData={{ position: existingPosition, loading: positionLoading }}
        onClose={onClose}
        refetchLeveragePositions={refetchLeveragePositions}
      />
    ) : activeTab === TradeModalActiveTab.INCREASE_POSITION ? (
      <IncreasePosition
        marginInPosToken={props.marginInPosToken}
        positionKey={positionKey}
        onPositionChange={setAlteredPosition}
        inputCurrency={inputCurrency ?? undefined}
        outputCurrency={outputCurrency ?? undefined}
        positionData={{ position: existingPosition, loading: positionLoading }}
        onClose={onClose}
        refetchLeveragePositions={refetchLeveragePositions}
      />
    ) : activeTab === TradeModalActiveTab.DEPOSIT_PREMIUM ? (
      <DepositPremiumContent
        positionKey={positionKey}
        onPositionChange={setAlteredPosition}
        inputCurrency={inputCurrency ?? undefined}
        outputCurrency={outputCurrency ?? undefined}
        positionData={{ position: existingPosition, loading: positionLoading }}
        handleTxnInfo={handleTxnInfo}
      />
    ) : activeTab === TradeModalActiveTab.WITHDRAW_PREMIUM ? (
      <WithdrawPremiumContent
        positionKey={positionKey}
        onPositionChange={setAlteredPosition}
        inputCurrency={inputCurrency ?? undefined}
        outputCurrency={outputCurrency ?? undefined}
        positionData={{ position: existingPosition, loading: positionLoading }}
      />
    ) : (
      <DecreasePositionContent
        marginInPosToken={props.marginInPosToken}
        positionKey={positionKey}
        onPositionChange={setAlteredPosition}
        inputCurrency={inputCurrency ?? undefined}
        outputCurrency={outputCurrency ?? undefined}
        positionData={{ position: existingPosition, loading: positionLoading }}
        onClose={onClose}
        refetchLeveragePositions={refetchLeveragePositions}
      />
    )
  }, [
    positionKey,
    activeTab,
    inputCurrency,
    outputCurrency,
    existingPosition,
    positionLoading,
    onClose,
    refetchLeveragePositions,
    props,
  ])

  const positionExists = useMemo(() => {
    if (!positionLoading && existingPosition?.openTime === 0) {
      return false
    } else {
      return true
    }
  }, [existingPosition, positionLoading])

  if (!positionExists) {
    return null
  }

  return positionKey ? (
    <LmtModal isOpen={isOpen} maxHeight={750} maxWidth={800} $scrollOverlay={true} onDismiss={() => onClose()}>
      <Wrapper>
        <ActionsWrapper>
          <TabsWrapper>
            <TabElement
              isActive={activeTab === TradeModalActiveTab.DECREASE_POSITION}
              onClick={() => setActiveTab(TradeModalActiveTab.DECREASE_POSITION)}
            >
              Decrease Position
            </TabElement>
            <TabElement
              isActive={activeTab === TradeModalActiveTab.INCREASE_POSITION}
              onClick={() => setActiveTab(TradeModalActiveTab.INCREASE_POSITION)}
            >
              Increase Position
            </TabElement>
            <TabElement
              isActive={activeTab === TradeModalActiveTab.DEPOSIT_PREMIUM}
              onClick={() => setActiveTab(TradeModalActiveTab.DEPOSIT_PREMIUM)}
            >
              Deposit Interest
            </TabElement>
            <TabElement
              last={true}
              isActive={activeTab === TradeModalActiveTab.WITHDRAW_PREMIUM}
              onClick={() => setActiveTab(TradeModalActiveTab.WITHDRAW_PREMIUM)}
            >
              Withdraw Interest
            </TabElement>
          </TabsWrapper>
          <ContentWrapper>{displayedContent}</ContentWrapper>
        </ActionsWrapper>
        <MarginPositionInfo
          position={existingPosition}
          alteredPosition={alteredPosition}
          loading={false}
          inputCurrency={inputCurrency ?? undefined}
          outputCurrency={outputCurrency ?? undefined}
          onClose={onClose}
          alteredPremium={alteredPremium ?? undefined}
        />
      </Wrapper>
    </LmtModal>
  ) : null
}

// const CloseWrapper = styled.div`
//   display: flex;
//   justify-content: end;
//   margin-top: 8px;
//   margin-right: 8px;
//   padding: 0px;
// `

const PositionInfoHeader = styled(TextWrapper)`
  font-size: 18px;
  font-weight: 800;
  line-height: 20px;
  padding-left: 1rem;
  color: ${({ theme }) => theme.textPrimary};
  ${textFadeIn}
`

const PositionValueWrapper = styled(LightCard)`
  background: ${({ theme }) => theme.surface1};
  margin-top: 15px;
  padding: 0.5rem 1rem;
  width: 95%;
`

const LoadingDisplayedContent = styled(LoadingBubble)`
  width: 100%;
  height: 100%;
`

const RedText = styled.span`
  color: ${({ theme }) => theme.accentFailure};
  letter-spacing: -0.8px;
  word-spacing: -1px;
  font-size: 11px;
`
function formatHours(hours: number) {
  const totalMinutes = hours * 60
  const days = Math.floor(hours / 24)
  const remainingHours = Math.floor(hours % 24)
  const minutes = Math.round(totalMinutes % 60)
  return `${days}d ${remainingHours}h ${minutes}m`
}

function checkPositionHealth(timeToClose: number) {
  if (timeToClose && timeToClose < 6) {
    return <RedText>Dangerous, need to deposit interest soon to avoid force closure</RedText>
  } else {
    return <GreenText>Healthy</GreenText>
  }
}

function MarginPositionInfo({
  position,
  alteredPosition,
  loading,
  inputCurrency,
  outputCurrency,
  onClose,
  alteredPremium,
}: // onClose,
{
  position: MarginPositionDetails | undefined
  alteredPosition: AlteredPositionProperties
  loading: boolean
  inputCurrency?: Currency | undefined
  outputCurrency?: Currency | undefined
  onClose: () => void
  alteredPremium?: BN | undefined
}) {
  const currency0 = useCurrency(position?.poolKey.token0)
  const currency1 = useCurrency(position?.poolKey.token1)
  const [, pool] = usePool(currency0 ?? undefined, currency1 ?? undefined, position?.poolKey.fee)
  const { account } = useWeb3React()

  const { result: rate } = useInstantaeneousRate(
    pool?.token0?.address,
    pool?.token1?.address,
    pool?.fee,
    account,
    position?.isToken0
  )

  const [entryPrice, currentPrice, baseToken, quoteToken] = useMemo(() => {
    if (pool && position) {
      const _entryPrice = positionEntryPrice(position)
      const _currentPrice = position.isToken0
        ? new BN(pool.token0Price.toFixed(18))
        : new BN(pool.token1Price.toFixed(18))

      return [
        _entryPrice,
        _currentPrice,
        position.isToken0 ? pool.token1 : pool.token0,
        position.isToken0 ? pool.token0 : pool.token1,
      ]
    } else {
      return [undefined, undefined, undefined]
    }
  }, [pool, position])

  const totalDebtInput = position?.totalDebtInput
  const premiumLeft = position?.premiumLeft

  // const totalDebtInputForAlt = alteredPosition?.totalDebtInput
  // const premiumLeftForAlt = alteredPosition?.premiumLeft
  const premiumLeftForAlt = alteredPremium

  const estimatedTimeToClose = useMemo(() => {
    if (!rate || !totalDebtInput) return undefined

    const ratePerHour = Number(rate) / 1e18 / (365 * 24)
    const premPerHour = Number(totalDebtInput) * ratePerHour

    const hours = Number(premiumLeft) / premPerHour
    return Math.round(hours * 100) / 100
  }, [rate, totalDebtInput, premiumLeft])

  const estimatedTimeToCloseForAlt = useMemo(() => {
    if (!rate || !totalDebtInput || !premiumLeftForAlt) return undefined

    const ratePerHour = Number(rate) / 1e18 / (365 * 24)
    const premPerHour = Number(totalDebtInput) * ratePerHour

    const hours = Number(premiumLeftForAlt) / premPerHour

    if (estimatedTimeToClose) return Math.round(hours * 100) / 100 + estimatedTimeToClose
    else return Math.round(hours * 100) / 100
  }, [rate, premiumLeftForAlt, totalDebtInput, estimatedTimeToClose])

  // console.log('Interest',alteredPosition.premiumLeft, alteredPremium )
  console.log('lifetime', estimatedTimeToClose, estimatedTimeToCloseForAlt)
  return (
    <PositionInfoWrapper>
      <RowBetween justify="center">
        <PositionInfoHeader margin={false}>Your Position</PositionInfoHeader>
        <CloseIcon style={{ width: '30px', marginRight: '10px' }} size="24px" onClick={onClose} />
      </RowBetween>

      <PositionValueWrapper>
        <PositionValueLabel
          title={<Trans>Total Position</Trans>}
          syncing={loading}
          value={position?.totalPosition}
          newValue={alteredPosition?.totalPosition}
          appendSymbol={outputCurrency?.symbol}
          type={NumberType.SwapTradeAmount}
        />
        <PositionValueLabel
          title={<Trans>Collateral</Trans>}
          syncing={loading}
          value={position?.margin}
          newValue={alteredPosition?.margin}
          appendSymbol={position?.marginInPosToken ? outputCurrency?.symbol : inputCurrency?.symbol}
          type={NumberType.SwapTradeAmount}
        />
        <PositionValueLabel
          title={<Trans>Total Debt</Trans>}
          description={<Trans>{`Total liquidity borrowed in ${inputCurrency?.symbol}`}</Trans>}
          syncing={loading}
          value={position?.totalDebtInput}
          newValue={alteredPosition?.totalDebtInput}
          appendSymbol={inputCurrency?.symbol}
          type={NumberType.SwapTradeAmount}
        />
        <PositionValueLabel
          title={<Trans>Execution Price</Trans>}
          description={<Trans>Current interest deposit remaining</Trans>}
          syncing={loading}
          value={entryPrice ? entryPrice : undefined}
          newValue={alteredPosition?.executionPrice ? alteredPosition.executionPrice : undefined}
          appendSymbol={`${outputCurrency?.symbol}/${inputCurrency?.symbol}`}
          type={NumberType.SwapTradeAmount}
        />
        <PositionValueLabel
          title={<Trans>Interest Deposit</Trans>}
          description={<Trans>Current interest deposit remaining</Trans>}
          syncing={loading}
          value={position?.premiumLeft ? (position?.premiumLeft.gt(0) ? position?.premiumLeft : new BN(0)) : undefined}
          newValue={alteredPremium ? (alteredPremium.gt(0) ? alteredPremium : new BN(0)) : undefined}
          appendSymbol={inputCurrency?.symbol}
          type={NumberType.SwapTradeAmount}
        />
        <PositionTimeLabel
          title={<Trans>Lifetime</Trans>}
          description={<Trans>Estimated Lifetime of Position</Trans>}
          syncing={loading}
          value={estimatedTimeToClose ? formatHours(estimatedTimeToClose) : undefined}
          newValue={estimatedTimeToCloseForAlt ? formatHours(estimatedTimeToCloseForAlt) : undefined}
        />
        <PositionValueLabelWrapper>
          <MouseoverTooltip text="Position Health">Position Health</MouseoverTooltip>
          <AutoColumn>
            <TextWithLoadingPlaceholder syncing={false} width={65}>
              <ValueWrapper margin={false}>
                {estimatedTimeToCloseForAlt !== undefined
                  ? checkPositionHealth(estimatedTimeToCloseForAlt)
                  : estimatedTimeToClose !== undefined && checkPositionHealth(estimatedTimeToClose)}
                {/* toggle between red and green once health status is available */}
              </ValueWrapper>
            </TextWithLoadingPlaceholder>
          </AutoColumn>
        </PositionValueLabelWrapper>
      </PositionValueWrapper>
      <BorrowLiquidityRangeSection position={position} pool={pool ?? undefined} />
    </PositionInfoWrapper>
  )
}

const MediumLoadingBubble = styled(LoadingBubble)`
  width: 30px;
  height: 30px;
`

const LoadingBorrowLiquidity = () => {
  return (
    <BorrowLiquidityWrapper>
      <AutoColumn gap="md">
        <AutoColumn gap="md">
          <RowBetween>
            <Label display="flex" style={{ marginRight: '12px' }}>
              <Trans>Position Borrowed Range</Trans>
            </Label>
          </RowBetween>
          <RowFixed></RowFixed>
        </AutoColumn>
        <RowBetween>
          <SecondLabel padding="12px" width="100%">
            <AutoColumn gap="sm" justify="center">
              <ExtentsText>
                <Trans>Min price</Trans>
              </ExtentsText>
              <TextWithLoadingPlaceholder syncing={true} width={65} height="px">
                <ThemedText.BodySecondary textAlign="center">{1.0}</ThemedText.BodySecondary>
              </TextWithLoadingPlaceholder>
            </AutoColumn>
          </SecondLabel>
          <DoubleArrow>⟷</DoubleArrow>
          <SecondLabel padding="12px" width="100%">
            <AutoColumn gap="sm" justify="center">
              <ExtentsText>
                <Trans>Max price</Trans>
              </ExtentsText>
              <TextWithLoadingPlaceholder syncing={true} width={65} height="px">
                <ThemedText.BodySecondary textAlign="center">{1.0}</ThemedText.BodySecondary>
              </TextWithLoadingPlaceholder>
            </AutoColumn>
          </SecondLabel>
        </RowBetween>
        <MediumLoadingBubble />
      </AutoColumn>
    </BorrowLiquidityWrapper>
  )
}

// disable the warning because we don't use the end prop, we just want to filter it out
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Label = styled(({ end, ...props }) => <ThemedText.DeprecatedLabel {...props} />)<{ end?: boolean }>`
  display: flex;
  font-size: 18px;
  font-weight: 300;
  justify-content: ${({ end }) => (end ? 'flex-end' : 'flex-start')};
  align-items: start;
  color: ${({ theme }) => theme.textPrimary};
`

const ExtentsText = styled.span`
  color: ${({ theme }) => theme.textPrimary};
  font-size: 12px;
  text-align: center;
  margin-right: 4px;
  font-weight: 535;
`

const DoubleArrow = styled.span`
  color: ${({ theme }) => theme.textPrimary};
  margin: 0 1rem;
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
  // const { formatPrice } = useFormatter()

  if (!pool || !currencyQuote || !currencyBase) {
    return null
  }

  return (
    <SecondLabel padding="12px">
      <AutoColumn gap="sm" justify="center">
        <ExtentsText>
          <Trans>Current price</Trans>
        </ExtentsText>
        <ThemedText.BodySecondary textAlign="center">
          {formatPrice(inverted ? pool.token1Price : pool.token0Price, NumberType.TokenTx)}
        </ThemedText.BodySecondary>
        <ExtentsText>
          <Trans>
            {currencyQuote?.symbol} per {currencyBase?.symbol}
          </Trans>
        </ExtentsText>
      </AutoColumn>
    </SecondLabel>
  )
}

const BorrowLiquidityWrapper = styled(LightCard)`
  border: 0;
  width: 100%;
  padding-top: 2rem;
  border-radius: 0px;
  border-bottom-right-radius: 10px;
  background-color: ${({ theme }) => theme.backgroundSurface};
`

const SecondLabel = styled(Card)`
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.surface1};
`

const BorrowLiquidityRangeSection = ({ position, pool }: { position?: MarginPositionDetails; pool?: Pool }) => {
  const [manuallyInverted, setManuallyInverted] = useState(false)

  const token0 = useToken(position?.poolKey.token0)
  const token1 = useToken(position?.poolKey.token1)

  const currency0 = token0 ? unwrappedToken(token0) : undefined
  const currency1 = token1 ? unwrappedToken(token1) : undefined

  const borrowLiquidityRange = useBorrowedLiquidityRange(position, pool)
  const { tickDiscretization } = useTickDiscretization(
    currency0?.wrapped.address,
    currency1?.wrapped.address,
    pool?.fee
  )

  const [tickLower, tickUpper] = useMemo(() => {
    if (position && tickDiscretization) {
      return getLiquidityTicks(position.borrowInfo, tickDiscretization)
    }

    return [undefined, undefined]
  }, [position, tickDiscretization])

  const tickAtLimit = useIsTickAtLimit(position?.poolKey.fee, tickLower, tickUpper)

  const baseCurrency = manuallyInverted ? currency0 : currency1
  const quoteCurrency = manuallyInverted ? currency1 : currency0

  const { inRange, priceUpper, priceLower } = useMemo(() => {
    if (baseCurrency && quoteCurrency && tickLower && tickUpper) {
      const pLower = tickToPrice(baseCurrency.wrapped, quoteCurrency.wrapped, tickLower)
      const pUpper = tickToPrice(baseCurrency.wrapped, quoteCurrency.wrapped, tickUpper)
      const inRange = borrowLiquidityRange === BorrowedLiquidityRange.IN_RANGE
      return {
        inRange,
        priceUpper: pUpper,
        priceLower: pLower,
      }
    }
    return {
      inRange: false,
      priceUpper: undefined,
      priceLower: undefined,
    }
  }, [baseCurrency, quoteCurrency, tickLower, tickUpper, borrowLiquidityRange])
  const removed = position?.totalPosition.isZero() ?? false
  return <></>
}

const PositionValueLabelWrapper = styled.div`
  color: ${({ theme }) => theme.textPrimary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  min-width: 168px;
  margin-bottom: 0.5rem;
  padding: 0.1rem;
`

const StyledArrow = styled(ArrowRightIcon)`
  color: ${({ theme }) => theme.textSecondary};
`

const ValueWrapper = styled(TextWrapper)`
  font-size: 12px;
  color: ${({ theme }) => theme.textSecondary};
  align-items: left;
  text-align: right;
`

function PositionValueLabel({
  value,
  newValue,
  title,
  description,
  appendSymbol,
  syncing,
  type,
}: {
  value?: BN
  newValue?: BN
  title: ReactNode
  description?: ReactNode
  type?: NumberType
  appendSymbol?: string
  syncing: boolean
}) {
  // const { formatNumber } = useFormatter()

  return (
    <PositionValueLabelWrapper>
      <MouseoverTooltip text={description}>{title}</MouseoverTooltip>
      <AutoColumn>
        <TextWithLoadingPlaceholder syncing={syncing} width={65}>
          <ValueWrapper margin={false}>
            <Row padding="5px" height="28px">
              {value ? `${formatBNToString(value, type)} ${appendSymbol ?? ''}` : '-'}
              {newValue ? <StyledArrow /> : null}
              {newValue ? `${formatBNToString(newValue, type)} ${appendSymbol ?? ''}` : null}
            </Row>
          </ValueWrapper>
        </TextWithLoadingPlaceholder>
      </AutoColumn>
    </PositionValueLabelWrapper>
  )
}

function PositionTimeLabel({
  value,
  newValue,
  title,
  description,
  syncing,
}: {
  value?: string
  newValue?: string
  title: ReactNode
  description?: ReactNode
  syncing: boolean
}) {
  return (
    <PositionValueLabelWrapper>
      <MouseoverTooltip text={description}>{title}</MouseoverTooltip>
      <AutoColumn>
        <TextWithLoadingPlaceholder syncing={syncing} width={65}>
          <ValueWrapper margin={false}>
            <Row padding="5px" height="28px">
              {value}
              {newValue ? <StyledArrow /> : null}
              {newValue}
            </Row>
          </ValueWrapper>
        </TextWithLoadingPlaceholder>
      </AutoColumn>
    </PositionValueLabelWrapper>
  )
}

export function PositionMissing() {
  return (
    <AutoColumn gap="lg" justify="center">
      <AutoColumn gap="md" style={{ width: '100%' }}>
        <TextWrapper margin={false}>
          <ThemedText.BodySecondary color="neutral2" textAlign="center">
            <Trans>Missing Position</Trans>
          </ThemedText.BodySecondary>
        </TextWrapper>
      </AutoColumn>
    </AutoColumn>
  )
}
