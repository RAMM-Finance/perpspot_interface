import { Trans } from '@lingui/macro'
import { formatCurrencyAmount, formatNumber, NumberType } from '@uniswap/conedison/format'
import { Currency, Percent, Price, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import Card from 'components/Card'
import { LoadingRows } from 'components/Loader/styled'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { SUPPORTED_GAS_ESTIMATE_CHAIN_IDS } from 'constants/chains'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { ReversedArrowsIcon } from 'nft/components/icons'
import { ReactNode, useCallback, useMemo, useState } from 'react'
import { AddMarginTrade, MarginTradeApprovalInfo } from 'state/marginTrading/hooks'
import { InterfaceTrade } from 'state/routing/types'
import { useCurrentInputCurrency, useCurrentOutputCurrency } from 'state/user/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { MarginPositionDetails } from 'types/lmtv2position'

// import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { Separator, ThemedText } from '../../theme'
import { computeRealizedPriceImpact } from '../../utils/prices'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'
import { MouseoverTooltip } from '../Tooltip'

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
  const { chainId } = useWeb3React()
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
    </RowBetween>
  )
}

function lmtFormatPrice(price: Price<Currency, Currency> | undefined, placeholder = '-'): string {
  if (price) {
    if (price.greaterThan(1)) {
      const symbol = price.quoteCurrency.symbol + '/' + price.baseCurrency.symbol
      return `${formatBNToString(new BN(price.toFixed(18)), NumberType.FiatTokenPrice, true)} ${symbol} `
    } else {
      const symbol = price?.baseCurrency.symbol + '/' + price?.quoteCurrency.symbol
      return `${formatBNToString(new BN(price.invert().toFixed(18)), NumberType.FiatTokenPrice, true)} ${symbol}`
    }
  } else {
    return placeholder
  }
}

function lmtFormatInvPrice(price: Price<Currency, Currency> | undefined, placeholder = '-'): string {
  if (price) {
    if (price.greaterThan(1)) {
      const symbol = price?.baseCurrency.symbol + '/' + price?.quoteCurrency.symbol
      return `${formatBNToString(new BN(price.invert().toFixed(18)), NumberType.FiatTokenPrice, true)} ${symbol}`
    } else {
      const symbol = price.quoteCurrency.symbol + '/' + price.baseCurrency.symbol
      return `${formatBNToString(new BN(price.toFixed(18)), NumberType.FiatTokenPrice, true)} ${symbol}`
    }
  } else {
    return placeholder
  }
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

  const estimatedTimeToClose = useMemo(() => {
    if (!trade) return undefined

    let rate
    if (trade.premiumInPosToken) {
      if (Number(trade.executionPrice.toFixed(8)) == 0) return undefined
      rate = trade.premium.div(trade.executionPrice.toFixed(8)).div(trade?.borrowAmount).toNumber() * 100
    } else rate = trade?.premium?.div(trade?.borrowAmount).toNumber() * 100
    return new BN(rate / trade?.borrowRate?.toNumber())
  }, [trade])

  const handleInvert = useCallback(() => setInverted(!inverted), [inverted])

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
          value={inverted ? lmtFormatInvPrice(trade?.executionPrice) : lmtFormatPrice(trade?.executionPrice)}
          syncing={syncing}
        />
        <ValueLabel
          description="Initial Interest Deposit for this position, which can be replenished on the position table. When your deposit is depleted, your position will be force closed."
          label="Initial Interest deposit"
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
        <ValueLabel
          description="If no more premiums are deposited, the estimated time until position is force closed based on current rate and borrow amount.
           You can increase this by depositing more premiums on the settings section(top right of the trade panel). "
          label="Estimated Position Duration"
          value={formatBNToString(estimatedTimeToClose, NumberType.SwapTradeAmount)}
          syncing={syncing}
          symbolAppend="hrs"
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
