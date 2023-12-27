import { Trans } from '@lingui/macro'
import { formatPrice, NumberType } from '@uniswap/conedison/format'
import { Currency } from '@uniswap/sdk-core'
import { Pool, tickToPrice } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { LmtBorrowRangeBadge } from 'components/Badge/RangeBadge'
import Card, { LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { TextWrapper } from 'components/HoverInlineText'
import { LmtModal } from 'components/Modal'
import { TextWithLoadingPlaceholder } from 'components/modalFooters/common'
import { DarkRateToggle } from 'components/RateToggle'
import Row, { RowBetween, RowFixed } from 'components/Row'
import { MouseoverTooltip } from 'components/Tooltip'
import { useCurrency, useToken } from 'hooks/Tokens'
import { BorrowedLiquidityRange, getLiquidityTicks, useBorrowedLiquidityRange } from 'hooks/useBorrowedLiquidityRange'
import useIsTickAtLimit from 'hooks/useIsTickAtLimit'
import { useMarginLMTPositionFromPositionId } from 'hooks/useLMTV2Positions'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { usePool } from 'hooks/usePools'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { ArrowRightIcon } from 'nft/components/icons'
import { ReactNode, useMemo, useRef, useState } from 'react'
import { Bound } from 'state/mint/v3/actions'
import { useTickDiscretization } from 'state/mint/v3/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { CloseIcon, HideExtraSmall, ThemedText } from 'theme'
import { textFadeIn } from 'theme/styles'
import { MarginPositionDetails, TraderPositionKey } from 'types/lmtv2position'
import { formatTickPrice } from 'utils/formatTickPrice'
import { unwrappedToken } from 'utils/unwrappedToken'

import DecreasePositionContent from './DecreasePositionContent'
import { DepositPremiumContent } from './DepositPremiumContent'
import { WithdrawPremiumContent } from './WithdrawPremiumContent'

interface TradeModalProps {
  isOpen: boolean
  selectedTab: TradeModalActiveTab | undefined
  positionKey: TraderPositionKey | undefined
  onClose: () => void
}

export enum TradeModalActiveTab {
  INCREASE_POSITION,
  DECREASE_POSITION,
  DEPOSIT_PREMIUM,
  WITHDRAW_PREMIUM,
}

const TabElement = styled.button<{ isActive: boolean; first?: boolean; last?: boolean }>`
  padding: 0;
  border: none;
  background: ${({ isActive, theme }) => (isActive ? theme.backgroundInteractive : theme.background)};
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  cursor: pointer;
  padding: 0.25rem 0.25rem;
  outline: none;
  border: ${({ isActive, theme }) => `1px solid ${theme.backgroundOutline}`};
`

const TabsWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  margin: 20px;
  margin-top: 10px;
  flex-direction: row;
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.backgroundSurface};
  border-radius: 20px;
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
`
const ModalWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
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
  border-left: 1px solid ${({ theme }) => theme.backgroundOutline};
  padding: 0;
`

const ActionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  align-items: center;
  justify-content: flex-start;
  min-width: 440px;
`

const Hr = styled.hr`
  background-color: ${({ theme }) => theme.backgroundOutline};
  border: none;
  height: 0.25px;
  width: 80%;
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
}

export function LeveragePositionModal(props: TradeModalProps) {
  const { isOpen, positionKey, onClose } = props
  const [activeTab, setActiveTab] = useState<TradeModalActiveTab>(
    props.selectedTab ?? TradeModalActiveTab.DECREASE_POSITION
  )
  const [alteredPosition, setAlteredPosition] = useState<AlteredPositionProperties>({
    totalPosition: undefined,
    margin: undefined,
    totalDebtInput: undefined,
    totalDebtOutput: undefined,
    premiumDeposit: undefined,
  })
  const { position: existingPosition, loading: positionLoading } = useMarginLMTPositionFromPositionId(positionKey)
  // console.log('existingPosition', existingPosition?.premiumDeposit.toString())
  const inputCurrency = useCurrency(
    existingPosition?.isToken0 ? positionKey?.poolKey.token1Address : positionKey?.poolKey.token0Address
  )
  const outputCurrency = useCurrency(
    existingPosition?.isToken0 ? positionKey?.poolKey.token0Address : positionKey?.poolKey.token1Address
  )

  const displayedContent = useMemo(() => {
    if (!positionKey) return null
    return activeTab === TradeModalActiveTab.DECREASE_POSITION ? (
      <DecreasePositionContent positionKey={positionKey} onPositionChange={setAlteredPosition} />
    ) : activeTab === TradeModalActiveTab.DEPOSIT_PREMIUM ? (
      <DepositPremiumContent positionKey={positionKey} onPositionChange={setAlteredPosition} />
    ) : activeTab === TradeModalActiveTab.WITHDRAW_PREMIUM ? (
      <WithdrawPremiumContent positionKey={positionKey} onPositionChange={setAlteredPosition} />
    ) : (
      <DecreasePositionContent positionKey={positionKey} onPositionChange={setAlteredPosition} />
      // <IncreasePositionContent positionKey={positionKey} />
    )
  }, [positionKey, activeTab])

  const ref = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => onClose(), [modalRef])

  return positionKey ? (
    <LmtModal isOpen={isOpen} maxHeight={750} maxWidth={1500} $scrollOverlay={true}>
      <Wrapper ref={modalRef}>
        <ActionsWrapper>
          <TabsWrapper>
            <TabElement
              isActive={activeTab === TradeModalActiveTab.DECREASE_POSITION}
              onClick={() => setActiveTab(TradeModalActiveTab.DECREASE_POSITION)}
            >
              Decrease Position
            </TabElement>
            <TabElement
              isActive={activeTab === TradeModalActiveTab.DEPOSIT_PREMIUM}
              onClick={() => setActiveTab(TradeModalActiveTab.DEPOSIT_PREMIUM)}
            >
              Deposit Premium
            </TabElement>
            <TabElement
              last={true}
              isActive={activeTab === TradeModalActiveTab.WITHDRAW_PREMIUM}
              onClick={() => setActiveTab(TradeModalActiveTab.WITHDRAW_PREMIUM)}
            >
              Withdraw Premium
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
        />
      </Wrapper>
    </LmtModal>
  ) : null
}

const PositionInfoHeader = styled(TextWrapper)`
  font-size: 18px;
  font-weight: 700;
  line-height: 20px;
  padding-top: 0.5rem;
  align-self: center;
  justify-self: center;
  margin: 0 auto;
  color: ${({ theme }) => theme.textSecondary};
  ${textFadeIn}
`
function MarginPositionInfo({
  position,
  alteredPosition,
  loading,
  inputCurrency,
  outputCurrency,
  onClose,
}: {
  position: MarginPositionDetails | undefined
  alteredPosition: AlteredPositionProperties
  loading: boolean
  inputCurrency?: Currency | undefined
  outputCurrency?: Currency | undefined
  onClose: () => void
}) {
  const currency0 = useCurrency(position?.poolKey.token0Address)
  const currency1 = useCurrency(position?.poolKey.token1Address)
  const [, pool] = usePool(currency0 ?? undefined, currency1 ?? undefined, position?.poolKey.fee)
  return (
    <PositionInfoWrapper>
      <Row style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <PositionInfoHeader margin={false}>Your Position</PositionInfoHeader>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginRight: '20px' }}>
          <CloseIcon style={{ width: '12px' }} onClick={onClose} />
        </div>
      </Row>
      <Hr />
      <PositionValueLabel
        title={<Trans>Total Position</Trans>}
        syncing={loading}
        value={position?.totalPosition}
        newValue={alteredPosition?.totalPosition}
        appendSymbol={outputCurrency?.symbol}
        type={NumberType.TokenNonTx}
      />
      <PositionValueLabel
        title={<Trans>Collateral</Trans>}
        syncing={loading}
        value={position?.margin}
        newValue={alteredPosition?.margin}
        appendSymbol={inputCurrency?.symbol}
        type={NumberType.TokenNonTx}
      />
      <PositionValueLabel
        title={<Trans>Total Debt (Input)</Trans>}
        description={<Trans>{`Total liquidity borrowed in ${inputCurrency?.symbol}`}</Trans>}
        syncing={loading}
        value={position?.totalDebtInput}
        newValue={alteredPosition?.totalDebtInput}
        appendSymbol={inputCurrency?.symbol}
        type={NumberType.TokenNonTx}
      />
      <PositionValueLabel
        title={<Trans>Total Debt (Output)</Trans>}
        description={<Trans>{`Total liquidity borrowed in ${outputCurrency?.symbol}`}</Trans>}
        syncing={loading}
        value={position?.totalDebtOutput}
        newValue={alteredPosition?.totalDebtOutput}
        appendSymbol={outputCurrency?.symbol}
        type={NumberType.TokenNonTx}
      />
      <PositionValueLabel
        title={<Trans>Premium Deposit</Trans>}
        description={<Trans>Current premium deposit remaining</Trans>}
        syncing={loading}
        value={position?.premiumLeft && position?.premiumLeft.gt(0) ? position?.premiumLeft : new BN(0)}
        newValue={alteredPosition?.premiumLeft}
        appendSymbol={inputCurrency?.symbol}
        type={NumberType.SwapTradeAmount}
      />
      <PositionValueLabelWrapper>
        <MouseoverTooltip text="Position Health">Position Health</MouseoverTooltip>
        <AutoColumn>
          <TextWithLoadingPlaceholder syncing={false} width={65}>
            <ValueWrapper margin={false}>HEALTHY</ValueWrapper>
          </TextWithLoadingPlaceholder>
        </AutoColumn>
      </PositionValueLabelWrapper>
      <BorrowLiquidityRangeSection position={position} pool={pool ?? undefined} />
    </PositionInfoWrapper>
  )
}

// disable the warning because we don't use the end prop, we just want to filter it out
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Label = styled(({ end, ...props }) => <ThemedText.DeprecatedLabel {...props} />)<{ end?: boolean }>`
  display: flex;
  font-size: 16px;
  justify-content: ${({ end }) => (end ? 'flex-end' : 'flex-start')};
  align-items: center;
  color: ${({ theme }) => theme.textSecondary};
`

const ExtentsText = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
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
        <ThemedText.DeprecatedMediumHeader textAlign="center">
          {formatPrice(inverted ? pool.token1Price : pool.token0Price, NumberType.TokenTx)}
        </ThemedText.DeprecatedMediumHeader>
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
  border-top: 1px solid ${({ theme }) => theme.backgroundOutline};
  width: 100%;
  border-radius: 0px;
  border-bottom-right-radius: 10px;
  padding: 1rem;
`

const SecondLabel = styled(Card)`
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.deprecated_bg1};
`

const BorrowLiquidityRangeSection = ({ position, pool }: { position?: MarginPositionDetails; pool?: Pool }) => {
  const [manuallyInverted, setManuallyInverted] = useState(false)

  const token0 = useToken(position?.poolKey.token0Address)
  const token1 = useToken(position?.poolKey.token1Address)

  const currency0 = token0 ? unwrappedToken(token0) : undefined
  const currency1 = token1 ? unwrappedToken(token1) : undefined
  const theme = useTheme()

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
  const inverted = token1 ? baseCurrency?.equals(token1) : undefined
  const currencyQuote = inverted ? currency0 : currency1
  const currencyBase = inverted ? currency1 : currency0
  return (
    <BorrowLiquidityWrapper>
      <AutoColumn gap="md">
        <AutoColumn gap="md">
          <RowFixed>
            <Label display="flex" style={{ marginRight: '12px' }}>
              <Trans>Position Liquidity Range</Trans>
            </Label>
            <HideExtraSmall>
              <>
                <LmtBorrowRangeBadge removed={removed} inRange={inRange} />
                <span style={{ width: '8px' }} />
              </>
            </HideExtraSmall>
          </RowFixed>
          <RowFixed>
            {currencyBase && currencyQuote && (
              <DarkRateToggle
                currencyA={currencyBase}
                currencyB={currencyQuote}
                handleRateToggle={() => setManuallyInverted(!manuallyInverted)}
              />
            )}
          </RowFixed>
        </AutoColumn>
        <RowBetween>
          <SecondLabel padding="12px" width="100%">
            <AutoColumn gap="sm" justify="center">
              <ExtentsText>
                <Trans>Min price</Trans>
              </ExtentsText>
              <ThemedText.DeprecatedMediumHeader textAlign="center">
                {formatTickPrice({
                  price: priceLower,
                  atLimit: tickAtLimit,
                  direction: Bound.LOWER,
                  numberType: NumberType.TokenTx,
                })}
              </ThemedText.DeprecatedMediumHeader>
              <ExtentsText>
                {' '}
                <Trans>
                  {currencyQuote?.symbol} per {currencyBase?.symbol}
                </Trans>
              </ExtentsText>

              {inRange && (
                <ThemedText.DeprecatedSmall color={theme.textSecondary}>
                  <Trans>Your position will be 100% {currencyBase?.symbol} at this price.</Trans>
                </ThemedText.DeprecatedSmall>
              )}
            </AutoColumn>
          </SecondLabel>

          <DoubleArrow>⟷</DoubleArrow>
          <SecondLabel padding="12px" width="100%">
            <AutoColumn gap="sm" justify="center">
              <ExtentsText>
                <Trans>Max price</Trans>
              </ExtentsText>
              <ThemedText.DeprecatedMediumHeader textAlign="center">
                {formatTickPrice({
                  price: priceUpper,
                  atLimit: tickAtLimit,
                  direction: Bound.UPPER,
                  numberType: NumberType.TokenTx,
                })}
              </ThemedText.DeprecatedMediumHeader>
              <ExtentsText>
                {' '}
                <Trans>
                  {currencyQuote?.symbol} per {currencyBase?.symbol}
                </Trans>
              </ExtentsText>

              {inRange && (
                <ThemedText.DeprecatedSmall color={theme.textPrimary}>
                  <Trans>Your position will be 100% {currencyQuote?.symbol} at this price.</Trans>
                </ThemedText.DeprecatedSmall>
              )}
            </AutoColumn>
          </SecondLabel>
        </RowBetween>
        <CurrentPriceCard inverted={inverted} pool={pool} currencyQuote={currencyQuote} currencyBase={currencyBase} />
      </AutoColumn>
    </BorrowLiquidityWrapper>
  )
}

const PositionValueLabelWrapper = styled.div`
  color: ${({ theme }) => theme.textTertiary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  font-size: 14px;
  min-width: 168px;
  margin-bottom: 0.5rem;
  height: 40px;
`

const StyledArrow = styled(ArrowRightIcon)`
  color: ${({ theme }) => theme.textSecondary};
`

const ValueWrapper = styled(TextWrapper)`
  font-size: 20px;
  color: ${({ theme }) => theme.textSecondary};
  align-items: right;
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
        <TextWithLoadingPlaceholder height="20px" syncing={syncing} width={65}>
          <ValueWrapper margin={false}>
            <Row>
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
