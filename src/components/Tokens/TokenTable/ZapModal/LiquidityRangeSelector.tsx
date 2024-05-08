import { Trans } from '@lingui/macro'
import { formatPrice, NumberType } from '@uniswap/conedison/format'
import { Currency, Price, Token } from '@uniswap/sdk-core'
import { Pool } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { BaseButton } from 'components/Button'
import Card, { LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { OpacityHoverState } from 'components/Common'
import { TextWrapper } from 'components/HoverInlineText'
import { TextWithLoadingPlaceholder } from 'components/modalFooters/common'
import Row, { RowBetween, RowFixed } from 'components/Row'
import { LoadingBubble } from 'components/Tokens/loading'
import { MouseoverTooltip } from 'components/Tooltip'
import useIsTickAtLimit from 'hooks/useIsTickAtLimit'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { ArrowRightIcon } from 'nft/components/icons'
import { ReactNode } from 'react'
import { Bound } from 'state/mint/v3/actions'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { textFadeIn } from 'theme/styles'
import { PoolKey, TraderPositionKey } from 'types/lmtv2position'
import { formatTickPrice } from 'utils/formatTickPrice'

// import { LoadingBubble } from './loading'

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
  height: 100%;
  border-radius: 20px;
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  // border-right: 1px solid ${({ theme }) => theme.backgroundOutline};
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
  background: ${({ theme }) => theme.backgroundSurface};
  // border-left: 1px solid ${({ theme }) => theme.backgroundOutline};
  padding: 0.75rem;
  padding-top: 1.5rem;
`

const ActionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  align-items: center;
  justify-content: flex-start;
  border-right: 1px solid ${({ theme }) => theme.backgroundOutline};
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

const SmallLoadingBubble = styled(LoadingBubble)`
  width: 10px;
  height: 10px;
`
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
  // padding-top: 2rem;
  border-radius: 0px;
  border-bottom-right-radius: 10px;
  background-color: ${({ theme }) => theme.backgroundSurface};
`

const SecondLabel = styled(Card)`
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.surface1};
`

export const LiquidityRangeSelector = ({
  poolKey,
  tickLower,
  tickUpper,
  pool,
  baseCurrency,
  quoteCurrency,
  priceLower,
  priceUpper,
  inverted,
}: {
  poolKey: PoolKey | undefined
  tickLower: number | undefined
  tickUpper: number | undefined
  pool: Pool | null
  baseCurrency: Currency | undefined
  quoteCurrency: Currency | undefined
  priceLower: Price<Token, Token> | undefined
  priceUpper: Price<Token, Token> | undefined
  inverted: boolean
}) => {
  const tickAtLimit = useIsTickAtLimit(poolKey?.fee, tickLower, tickUpper)

  return (
    <BorrowLiquidityWrapper>
      <AutoColumn gap="md">
        <AutoColumn gap="md">
          <RowBetween>
            <Label display="flex" style={{ marginRight: '12px' }}>
              <Trans>Liquidity Range</Trans>
            </Label>
          </RowBetween>
          {/* <RowFixed>
            {currencyBase && currencyQuote && (
              <DarkRateToggle
                currencyA={currencyBase}
                currencyB={currencyQuote}
                handleRateToggle={() => setManuallyInverted(!manuallyInverted)}
              />
            )}
          </RowFixed> */}
        </AutoColumn>
        <RowBetween>
          <SecondLabel padding="12px" width="100%">
            <AutoColumn gap="sm" justify="center">
              <ExtentsText>
                <Trans>Min price</Trans>
              </ExtentsText>
              <ThemedText.BodySecondary textAlign="center">
                {formatTickPrice({
                  price: inverted ? priceUpper?.invert() : priceLower,
                  atLimit: tickAtLimit,
                  direction: Bound.LOWER,
                  numberType: NumberType.TokenTx,
                })}
              </ThemedText.BodySecondary>
              <ExtentsText>
                {' '}
                <Trans>
                  {quoteCurrency?.symbol} per {baseCurrency?.symbol}
                </Trans>
              </ExtentsText>

              {/* {inRange && (
                <ThemedText.DeprecatedSmall color={theme.textSecondary}>
                  <Trans>Your position will be 100% {currencyBase?.symbol} at this price.</Trans>
                </ThemedText.DeprecatedSmall>
              )} */}
            </AutoColumn>
          </SecondLabel>
          <DoubleArrow>⟷</DoubleArrow>
          <SecondLabel padding="12px" width="100%">
            <AutoColumn gap="sm" justify="center">
              <ExtentsText>
                <Trans>Max price</Trans>
              </ExtentsText>
              <ThemedText.BodySecondary textAlign="center">
                {formatTickPrice({
                  price: inverted ? priceLower?.invert() : priceUpper,
                  atLimit: tickAtLimit,
                  direction: Bound.UPPER,
                  numberType: NumberType.TokenTx,
                })}
              </ThemedText.BodySecondary>
              <ExtentsText>
                {' '}
                <Trans>
                  {quoteCurrency?.symbol} per {baseCurrency?.symbol}
                </Trans>
              </ExtentsText>

              {/* {inRange && (
                <ThemedText.DeprecatedSmall color={theme.textPrimary}>
                  <Trans>Your position will be 100% {currencyQuote?.symbol} at this price.</Trans>
                </ThemedText.DeprecatedSmall>
              )} */}
            </AutoColumn>
          </SecondLabel>
        </RowBetween>
        <CurrentPriceCard inverted={inverted} pool={pool} currencyQuote={quoteCurrency} currencyBase={baseCurrency} />
      </AutoColumn>
    </BorrowLiquidityWrapper>
  )
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
`

function LoadingPositionValueLabel({ title, description }: { title: ReactNode; description?: ReactNode }) {
  return (
    <PositionValueLabelWrapper>
      <MouseoverTooltip text={description}>{title}</MouseoverTooltip>
      <TextWithLoadingPlaceholder syncing={true} width={80}>
        <ValueWrapper margin={false}>
          <Row padding="5px" height="28px" width="65px"></Row>
        </ValueWrapper>
      </TextWithLoadingPlaceholder>
    </PositionValueLabelWrapper>
  )
}

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
