import { t, Trans } from '@lingui/macro'
import { formatCurrencyAmount, formatNumber, NumberType } from '@uniswap/conedison/format'
import { Currency, Percent, Price, TradeType } from '@uniswap/sdk-core'

import { BigNumber as BN } from 'bignumber.js'
import Card from 'components/Card'
import { LoadingRows } from 'components/Loader/styled'
import { UnderlineText } from 'components/PositionTable/LeveragePositionTable/TokenRow'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { SUPPORTED_GAS_ESTIMATE_CHAIN_IDS } from 'constants/chains'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { ReversedArrowsIcon } from 'nft/components/icons'
import { ReactNode, useCallback, useMemo, useState } from 'react'
import { Settings } from 'react-feather'
import { AddMarginTrade, MarginTradeApprovalInfo } from 'state/marginTrading/hooks'
import { InterfaceTrade } from 'state/routing/types'
import { useCurrentInputCurrency, useCurrentOutputCurrency } from 'state/user/hooks'
import styled, { keyframes, useTheme } from 'styled-components/macro'
import { MarginPositionDetails } from 'types/lmtv2position'
import { useChainId } from 'wagmi'

// import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { Separator, ThemedText } from '../../theme'
import { computeRealizedPriceImpact } from '../../utils/prices'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'
import { MouseoverTooltip } from '../Tooltip'
import ModifyPositionDurationSettings from './ModifyPositionDurationSettings'
import { RotatingArrow } from './SwapDetailsDropdown'

const StyledCard = styled(Card)`
  padding: 0;
`

interface AdvancedSwapDetailsProps {
  trade?: InterfaceTrade<Currency, Currency, TradeType>
  allowedSlippage: Percent
  syncing?: boolean
  hideInfoTooltips?: boolean
  leverageFactor?: number
  //leverageTrade: LeverageTrade
}

const ResponsiveFontSizeBox = styled.div<{ fontSize?: string }>`
  font-size: ${({ fontSize }) => fontSize || '12px'};
  box-sizing: border-box;
  margin: 0;
  min-width: 0;
  font-weight: 400;
  color: ${({ theme }) => theme.textPrimary};
  @media only screen and (max-width: 1480px) {
    font-size: 10px;
  }

  @media only screen and (max-width: 1400px) {
    font-size: 9px;
  }
`

const StyledMenuIcon = styled(Settings)`
  height: 13px;
  width: 13px;

  > * {
    stroke: ${({ theme }) => theme.textPrimary};
  }
`

const StyledMenuButton = styled.button<{ disabled: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;

  ${({ disabled }) =>
    !disabled &&
    `
    :hover,
    :focus {
      cursor: pointer;
      outline: none;
      opacity: 0.7;
    }
  `}
`

const StyledPolling = styled.div`
  display: flex;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-left: 10px;
  align-items: center;
  color: ${({ theme }) => theme.textPrimary};
  transition: 250ms ease color;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    display: none;
  `}
`

const StyledPollingDot = styled.div`
  width: 8px;
  height: 8px;
  min-height: 8px;
  min-width: 8px;
  border-radius: 50%;
  position: relative;
  background-color: ${({ theme }) => theme.backgroundInteractive};
  transition: 250ms ease background-color;
`

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const Spinner = styled.div`
  animation: ${rotate360} 1s cubic-bezier(0.83, 0, 0.17, 1) infinite;
  transform: translateZ(0);
  border-top: 1px solid transparent;
  border-right: 1px solid transparent;
  border-bottom: 1px solid transparent;
  border-left: 2px solid ${({ theme }) => theme.textPrimary};
  background: transparent;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  position: relative;
  transition: 250ms ease border-color;
  left: -3px;
  top: -3px;
`

function TextWithLoadingPlaceholder({
  syncing,
  width,
  children,
  height = '15px',
}: {
  syncing: boolean
  width: number
  children: JSX.Element
  height?: string
}) {
  return syncing ? (
    <LoadingRows>
      <div style={{ height, width: `${width}px` }} />
    </LoadingRows>
  ) : (
    children
  )
}

const formatPriceImpact = (priceImpact: Percent) => `${priceImpact.multiply(-1).toFixed(2)}%`

export function AdvancedSwapDetails({
  trade,
  allowedSlippage,
  syncing = false,
  hideInfoTooltips = false,
}: AdvancedSwapDetailsProps) {
  const theme = useTheme()
  const chainId = useChainId()
  const nativeCurrency = useNativeCurrency()

  const { priceImpact } = useMemo(() => {
    return {
      expectedOutputAmount: trade?.outputAmount,
      priceImpact: trade ? computeRealizedPriceImpact(trade) : undefined,
    }
  }, [trade])

  return (
    <StyledCard>
      <AutoColumn gap="sm">
        <MouseoverValueLabel
          description="The amount you expect to receive at the current market price. You may receive less or more if the market price changes while your transaction is pending."
          value={formatCurrencyAmount(trade?.outputAmount, NumberType.SwapTradeAmount)}
          label={
            <Trans>
              <ThemedText.BodySmall>Output</ThemedText.BodySmall>
            </Trans>
          }
          appendSymbol={trade?.outputAmount.currency.symbol}
        />
        <MouseoverValueLabel
          description="The impact your trade has on the market price of this pool."
          value={priceImpact && formatPriceImpact(priceImpact)}
          label={
            <Trans>
              <ThemedText.BodySmall>Price Impact</ThemedText.BodySmall>
            </Trans>
          }
        />
        <Separator />
        <MouseoverValueLabel
          description="The minimum amount you are guaranteed to receive. If the price slips any further, your transaction will revert."
          label={
            <>
              {!trade ? null : trade.tradeType === TradeType.EXACT_INPUT ? (
                <Trans>Minimum received</Trans>
              ) : (
                <Trans>Maximum sent</Trans>
              )}{' '}
              <Trans>after slippage</Trans> ({allowedSlippage.toFixed(2)}%)
            </>
          }
          syncing={syncing}
          value={
            !trade
              ? undefined
              : trade.tradeType === TradeType.EXACT_INPUT
              ? `${trade.minimumAmountOut(allowedSlippage).toSignificant(6)} ${trade.outputAmount.currency.symbol}`
              : `${trade.maximumAmountIn(allowedSlippage).toSignificant(6)} ${trade.inputAmount.currency.symbol}`
          }
        />
        {!trade?.gasUseEstimateUSD || !chainId || !SUPPORTED_GAS_ESTIMATE_CHAIN_IDS.includes(chainId) ? null : (
          <RowBetween>
            <MouseoverTooltip
              text={
                <Trans>
                  The fee paid to miners who process your transaction. This must be paid in {nativeCurrency.symbol}.
                </Trans>
              }
              disableHover={hideInfoTooltips}
            >
              <ThemedText.DeprecatedSubHeader color={theme.textTertiary}>
                <Trans>Network Fee</Trans>
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
            <TextWithLoadingPlaceholder syncing={syncing} width={50}>
              <ThemedText.DeprecatedBlack textAlign="right" fontSize={14} color={theme.textTertiary}>
                ~{formatNumber(Number(trade.gasUseEstimateUSD), NumberType.FiatTokenPrice)}
              </ThemedText.DeprecatedBlack>
            </TextWithLoadingPlaceholder>
          </RowBetween>
        )}
      </AutoColumn>
    </StyledCard>
  )
}

export function MouseoverValueLabel({
  description,
  label,
  value,
  appendSymbol,
  syncing,
}: {
  description: string
  label: React.ReactNode
  value: React.ReactNode | string
  appendSymbol?: string
  syncing?: boolean
}) {
  // const theme = useTheme()

  return (
    <RowBetween padding="1px">
      <RowFixed>
        <MouseoverTooltip text={<Trans>{description}</Trans>} disableHover={false}>
          <ThemedText.BodySmall color="textSecondary">{label}</ThemedText.BodySmall>
        </MouseoverTooltip>
      </RowFixed>
      <TextWithLoadingPlaceholder syncing={syncing ?? false} width={65}>
        <ThemedText.BodySmall color="textSecondary" textAlign="right">
          {`${value ?? '-'} ${appendSymbol ?? ''}`}
        </ThemedText.BodySmall>
      </TextWithLoadingPlaceholder>
    </RowBetween>
  )
}

export function ValueLabel({
  label,
  description,
  value,
  syncing,
  symbolAppend,
  hideInfoTooltips = false,
  delta,
  labelSize = '12px',
  valueSize = '12px',
  height = '14px',
  valueDescription = '',
  hideValueDescription = true,
  responsive = false,
  edit = false,
}: {
  description: string | ReactNode
  label: string | ReactNode
  value?: number | string | ReactNode
  syncing: boolean
  symbolAppend?: string
  hideInfoTooltips?: boolean
  delta?: boolean
  height?: string
  labelSize?: string
  valueSize?: string
  valueDescription?: string
  hideValueDescription?: boolean
  responsive?: boolean
  edit?: boolean
}) {
  return (
    <RowBetween>
      <RowFixed>
        <MouseoverTooltip text={<Trans>{description}</Trans>} disableHover={hideInfoTooltips}>
          {responsive ? (
            <ResponsiveFontSizeBox fontSize={labelSize}>{label}</ResponsiveFontSizeBox>
          ) : (
            <ThemedText.BodySmall fontSize={labelSize}>{label}</ThemedText.BodySmall>
          )}
        </MouseoverTooltip>
      </RowFixed>
      <RowFixed>
        <TextWithLoadingPlaceholder syncing={syncing} width={65} height={height}>
          <MouseoverTooltip text={<Trans>{valueDescription}</Trans>} disableHover={hideValueDescription}>
            {!delta ? (
              <ThemedText.BodySmall fontSize={valueSize} color="textSecondary" textAlign="right">
                {value ? `${value.toString()} ${symbolAppend ?? ''}` : '-'}
              </ThemedText.BodySmall>
            ) : (
              <ThemedText.BodySmall fontSize={valueSize} color="textSecondary" textAlign="right">
                <DeltaText delta={Number(value)}>
                  {value ? `${Math.abs(Number(value)).toString()} ${symbolAppend ?? ''}` : '-'}
                </DeltaText>
              </ThemedText.BodySmall>
            )}
          </MouseoverTooltip>
        </TextWithLoadingPlaceholder>
      </RowFixed>
    </RowBetween>
  )
}

function ValueLabelWithDropdown({
  label,
  description,
  value,
  syncing,
  symbolAppend,
  hideInfoTooltips = false,
  delta,
  labelSize = '12px',
  valueSize = '12px',
  height = '14px',
  valueDescription = '',
  hideValueDescription = true,
  responsive = false,
  edit = false,
  trade,
}: {
  description: string | ReactNode
  label: string | ReactNode
  value?: number | string
  syncing: boolean
  symbolAppend?: string
  hideInfoTooltips?: boolean
  delta?: boolean
  height?: string
  labelSize?: string
  valueSize?: string
  valueDescription?: string
  hideValueDescription?: boolean
  responsive?: boolean
  edit?: boolean
  trade?: AddMarginTrade
}) {
  const [open, setOpen] = useState(false)
  const theme = useTheme()

  // const { [MarginField.EST_DURATION]: selectedDuration } = useMarginTradingState()
  // const loading = useMemo(() => {
  //   if (!selectedDuration || !value) return false
  //   if (Number(selectedDuration) !== Number(value)) return true
  //   return false
  // }, [selectedDuration, value])

  return (
    <>
      <RowBetween>
        <RowFixed>
          <MouseoverTooltip text={<Trans>{description}</Trans>} disableHover={hideInfoTooltips}>
            {responsive ? (
              <ResponsiveFontSizeBox fontSize={labelSize}>{label}</ResponsiveFontSizeBox>
            ) : (
              <ThemedText.BodySmall fontSize={labelSize}>{label}</ThemedText.BodySmall>
            )}
          </MouseoverTooltip>
        </RowFixed>
        <RowFixed>
          <TextWithLoadingPlaceholder syncing={syncing} width={65} height={height}>
            <MouseoverTooltip text={<Trans>{valueDescription}</Trans>} disableHover={hideValueDescription}>
              {!delta ? (
                <ThemedText.BodySmall fontSize={valueSize} color="textSecondary" textAlign="right">
                  {value && edit ? (
                    <UnderlineText style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {value.toString()} {symbolAppend ?? ''}
                    </UnderlineText>
                  ) : (
                    '-'
                  )}
                </ThemedText.BodySmall>
              ) : (
                <ThemedText.BodySmall fontSize={valueSize} color="textSecondary" textAlign="right">
                  <DeltaText delta={Number(value)}>
                    {value && edit ? (
                      <UnderlineText style={{ cursor: 'pointer' }}>
                        {Math.abs(Number(value)).toString()} ${symbolAppend ?? ''}
                      </UnderlineText>
                    ) : (
                      '-'
                    )}
                  </DeltaText>
                </ThemedText.BodySmall>
              )}
            </MouseoverTooltip>
          </TextWithLoadingPlaceholder>
          {value && (
            <MouseoverTooltip text="Modify Duration" style={{ display: 'flex', alignItems: 'bottom' }}>
              <StyledMenuButton
                disabled={false}
                onClick={() => setOpen(!open)}
                id="open-position-duration-button"
                aria-label={t`Est Position Duration Slider`}
              >
                <RotatingArrow
                  style={{ width: '16px' }}
                  stroke={value ? theme.textTertiary : theme.deprecated_bg3}
                  open={Boolean(open)}
                />
              </StyledMenuButton>
            </MouseoverTooltip>
          )}
        </RowFixed>
      </RowBetween>

      {open && value && (
        <>
          <ModifyPositionDurationSettings estValue={value} trade={trade} />
        </>
      )}
    </>
  )
}

export function AdvancedMarginTradeDetails({
  allowedSlippage,
  syncing = false,
  trade,
}: {
  trade?: AddMarginTrade
  tradeApprovalInfo?: MarginTradeApprovalInfo
  existingPosition?: MarginPositionDetails
  syncing?: boolean
  allowedSlippage?: Percent
}) {
  // const theme = useTheme()
  const [inverted, setInverted] = useState<boolean>(false)

  const inputCurrency = useCurrentInputCurrency()
  const outputCurrency = useCurrentOutputCurrency()

  const lmtFormatPrice = useMemo(() => {
    if (!trade || !trade.executionPrice) return '-'
    if (trade.executionPrice) {
      if (trade.executionPrice.greaterThan(1)) {
        const symbol = trade.executionPrice.quoteCurrency.symbol + '/' + trade.executionPrice.baseCurrency.symbol
        return `${formatBNToString(new BN(trade.executionPrice.toSignificant()), NumberType.FiatTokenPrice).substring(
          1
        )} ${symbol} `
      } else {
        const symbol = trade.executionPrice?.baseCurrency.symbol + '/' + trade.executionPrice?.quoteCurrency.symbol
        return `${formatBNToString(
          new BN(trade.executionPrice.invert().toSignificant()),
          NumberType.FiatTokenPrice
        ).substring(1)} ${symbol}`
      }
    } else {
      return '-'
    }
  }, [trade])

  const lmtFormatInvPrice = useMemo(() => {
    if (!trade || !trade.executionPrice) return '-'
    if (trade.executionPrice) {
      if (trade.executionPrice.greaterThan(1)) {
        const symbol = trade.executionPrice?.baseCurrency.symbol + '/' + trade.executionPrice?.quoteCurrency.symbol
        return `${formatBNToString(
          new BN(trade.executionPrice.invert().toSignificant()),
          NumberType.FiatTokenPrice
        ).substring(1)} ${symbol}`
      } else {
        const symbol = trade.executionPrice.quoteCurrency.symbol + '/' + trade.executionPrice.baseCurrency.symbol
        return `${formatBNToString(new BN(trade.executionPrice.toSignificant()), NumberType.FiatTokenPrice).substring(
          1
        )} ${symbol}`
      }
    } else {
      return '-'
    }
  }, [trade])

  const estimatedTimeToClose = useMemo(() => {
    if (!trade) return undefined

    let rate = new BN(0)
    if (trade.premiumInPosToken) {
      if (Number(trade.executionPrice.toFixed(8)) == 0) return undefined
      rate = trade.premium.div(trade.executionPrice.toFixed(8)).div(trade?.borrowAmount).times(100)
    } else rate = trade?.premium?.div(trade?.borrowAmount).times(100)
    return rate.div(trade?.borrowRate)
  }, [trade])

  const handleInvert = useCallback(() => setInverted(!inverted), [inverted])

  console.log(
    'prem',
    formatBNToString(trade?.premium, NumberType.SwapTradeAmount),
    'borrow',
    formatBNToString(trade?.borrowAmount, NumberType.SwapTradeAmount)
  )

  const details = (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
      <div>Execution Price</div>
      <MouseoverTooltip text="invert" placement="right">
        <div onClick={handleInvert} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <ReversedArrowsIcon />
        </div>
      </MouseoverTooltip>
    </div>
  )

  return (
    <StyledCard>
      <AutoColumn gap="sm">
        <ValueLabel
          description=""
          hideInfoTooltips={true}
          label={details}
          value={inverted ? lmtFormatInvPrice : lmtFormatPrice}
          syncing={syncing}
        />
        <ValueLabel
          description="Initial Interest Deposit for this position, which can be replenished on the position table. When your deposit is depleted, your position will be force closed."
          label="Initial Interest Deposit"
          value={formatBNToString(trade?.premium, NumberType.SwapTradeAmount)}
          syncing={syncing}
          symbolAppend={trade ? (trade.premiumInPosToken ? outputCurrency?.symbol : inputCurrency?.symbol) : ''}
        />
        <ValueLabel
          description="Variable Interest Rate. Rate % * borrow amount is the hourly amount your interest deposit is depleted."
          label="Hourly Borrow Rate"
          value={formatBNToString(trade?.borrowRate, NumberType.SwapTradeAmount)}
          syncing={syncing}
          symbolAppend="%"
          valueDescription=""
        />
        <ValueLabel
          description="The amount you borrow from Limitless"
          label="Borrow Amount"
          value={
            trade?.marginInPosToken
              ? formatBNToString(
                  trade?.borrowAmount.times(new BN(trade?.executionPrice.toFixed(18))),
                  NumberType.SwapTradeAmount
                )
              : formatBNToString(trade?.borrowAmount, NumberType.SwapTradeAmount)
          }
          syncing={syncing}
          symbolAppend={trade?.marginInPosToken ? outputCurrency?.symbol : inputCurrency?.symbol}
        />
        <ValueLabelWithDropdown
          description="If no more premiums are deposited, the estimated time until position is force closed based on current rate and borrow amount.
           You can increase this by depositing more premiums on the settings section(top right of the trade panel). "
          label="Est. Position Duration"
          edit={true}
          value={formatBNToString(estimatedTimeToClose, NumberType.SwapTradeAmount)}
          syncing={syncing}
          symbolAppend="hrs"
          trade={trade}
        />
        <ValueLabel
          description="Swap fee + Origination fee "
          label="Total Fees"
          value={formatBNToString(trade?.fees.plus(trade?.swapFee), NumberType.SwapTradeAmount)}
          syncing={syncing}
          symbolAppend={trade ? inputCurrency?.symbol : ''}
          valueDescription={
            'Swap Fee: ' +
            formatBNToString(trade?.swapFee, NumberType.SwapTradeAmount) +
            ' ' +
            inputCurrency?.symbol +
            ' Origination Fee: ' +
            formatBNToString(trade?.fees, NumberType.SwapTradeAmount) +
            ' ' +
            inputCurrency?.symbol
          }
          hideValueDescription={false}
        />
        <Separator />
        <ValueLabel
          labelSize="11px"
          valueSize="11px"
          responsive={true}
          description="The minimum amount you are guaranteed to receive. If the price slips any further, your transaction will revert."
          label={`Minimum output after slippage ${
            allowedSlippage ? `(${allowedSlippage.toFixed(2)}%)  ${'\u00A0'}` : ''
          } `}
          value={formatBNToString(trade?.minimumOutput, NumberType.SwapTradeAmount)}
          syncing={syncing}
          symbolAppend={trade ? outputCurrency?.symbol : ''}
        />
      </AutoColumn>
    </StyledCard>
  )
}
