import { Trans } from '@lingui/macro'
import { formatCurrencyAmount, NumberType } from '@uniswap/conedison/format'
import { Currency, Percent, Price, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import Card from 'components/Card'
import { LoadingRows } from 'components/Loader/styled'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { SUPPORTED_GAS_ESTIMATE_CHAIN_IDS } from 'constants/chains'
import { useCurrency } from 'hooks/Tokens'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { useMemo } from 'react'
import { AddMarginTrade, PreTradeInfo } from 'state/marginTrading/hooks'
import { InterfaceTrade } from 'state/routing/types'
import { Field } from 'state/swap/actions'
import { BorrowCreationDetails, LeverageTrade, useSwapState } from 'state/swap/hooks'
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

const StyledText = styled(ThemedText.DeprecatedBlack)`
  display: flex;
  flex-direction: row;
`

interface AdvancedAddLeverageDetailsProps {
  trade?: InterfaceTrade<Currency, Currency, TradeType>
  allowedSlippage: Percent
  syncing?: boolean
  hideInfoTooltips?: boolean
  leverageFactor?: number
  leverageTrade?: LeverageTrade
}

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

  const { expectedOutputAmount, priceImpact } = useMemo(() => {
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
        {/* <RowBetween>
          <RowFixed style={{ marginRight: '20px' }}>
            <MouseoverTooltip
              text={
                <Trans>
                  The minimum amount you are guaranteed to receive. If the price slips any further, your transaction
                  will revert.
                </Trans>
              }
              disableHover={hideInfoTooltips}
            >
              <ThemedText.DeprecatedSubHeader color={theme.textTertiary}>
                {trade.tradeType === TradeType.EXACT_INPUT ? (
                  <Trans>Minimum received</Trans>
                ) : (
                  <Trans>Maximum sent</Trans>
                )}{' '}
                <Trans>after slippage</Trans> ({allowedSlippage.toFixed(2)}%)
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={syncing} width={70}>

            <ThemedText.DeprecatedBlack textAlign="right" fontSize={14} color={theme.textTertiary}>
              <TruncatedText>
                {trade.tradeType === TradeType.EXACT_INPUT
                  ? `${trade.minimumAmountOut(allowedSlippage).toSignificant(6)} ${trade.outputAmount.currency.symbol}`
                  : `${trade.maximumAmountIn(allowedSlippage).toSignificant(6)} ${trade.inputAmount.currency.symbol}`}
              </TruncatedText>
            </ThemedText.DeprecatedBlack>

          </TextWithLoadingPlaceholder>
        </RowBetween> */}
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
                ~${trade.gasUseEstimateUSD.toFixed(2)}
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
}: {
  description: string
  label: string
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
}) {
  // const theme = useTheme()

  return (
    <RowBetween>
      <RowFixed>
        <MouseoverTooltip text={<Trans>{description}</Trans>} disableHover={hideInfoTooltips}>
          <ThemedText.BodySmall fontSize={labelSize}>{label}</ThemedText.BodySmall>
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

export function AdvancedMarginTradeDetails({
  allowedSlippage,
  syncing = false,
  trade,
  preTradeInfo,
  existingPosition,
}: // hideInfoTooltips = false,
{
  trade?: AddMarginTrade
  preTradeInfo?: PreTradeInfo
  existingPosition?: MarginPositionDetails
  syncing?: boolean
  allowedSlippage?: Percent
}) {
  const theme = useTheme()

  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  // const estimatedTimeToClose = useMemo(()=>{
  //   if(!trade) return undefined

  //   const depletePerHour = trade?.borrowAmount.multiply(trade?.borrowRate.toNumber()*0.01).divide(trade?.premium)
  //   trade.premium.divide(depletePerHour)

  // },[trade])
  return (
    <StyledCard>
      <AutoColumn gap="sm">
        <ValueLabel
          description="Amount In / Amount Out"
          label="Execution Price"
          value={lmtFormatPrice(trade?.executionPrice)}
          syncing={syncing}
        />
        <ValueLabel
          description="Initial Premium Deposit for this position, which can be replenished in the position table. When your deposit is depleted, your position will be force closed."
          label="Initial Premium deposit"
          value={formatBNToString(trade?.premium, NumberType.SwapTradeAmount)}
          syncing={syncing}
          symbolAppend={trade ? inputCurrency?.symbol : ''}
        />
        <ValueLabel
          description="Rate at which your premium deposit are depleted. Rate% * borrow amount is the rate at which your premium is depleted. "
          label="Hourly Borrow Rate"
          value={formatBNToString(trade?.borrowRate, NumberType.SwapTradeAmount)}
          syncing={syncing}
          symbolAppend="%"
          valueDescription=""
        />
        <ValueLabel
          description="The amount you borrow from Limitless"
          label="Borrow Amount"
          value={formatBNToString(trade?.borrowAmount, NumberType.SwapTradeAmount)}
          syncing={syncing}
          symbolAppend={trade ? inputCurrency?.symbol : ''}
        />
        {/*<ValueLabel
          description="Slippage from spot price"
          label="Slippage"
          value={
            trade ? formatBNToString(new BN(trade.allowedSlippage.toFixed(18)), NumberType.SwapTradeAmount) : undefined
          }
          symbolAppend="%"
          syncing={syncing}
        />*/}
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
          description="The minimum amount you are guaranteed to receive. If the price slips any further, your transaction will revert."
          label={`Minimum output after slippage ${allowedSlippage ? `(${allowedSlippage.toFixed(2)})` : ''}`}
          value={formatBNToString(trade?.minimumOutput, NumberType.SwapTradeAmount)}
          syncing={syncing}
          symbolAppend={trade ? outputCurrency?.symbol : ''}
        />
        {/* <RowBetween>
          <RowFixed style={{ marginRight: '20px' }}>
            <MouseoverTooltip
              text={
                <Trans>
                  The minimum amount you are guaranteed to receive. If the price slips any further, your transaction
                  will revert.
                </Trans>
              }
              disableHover={false}
            >
              <ThemedText.DeprecatedSubHeader color={theme.textTertiary}>
                <Trans>Minimum output</Trans> <Trans>after slippage</Trans> ({allowedSlippage?.toFixed(2)}%)
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={syncing} width={70}>
            <ThemedText.DeprecatedBlack textAlign="right" fontSize={14} color={theme.textTertiary}>
              <TruncatedText>
                {`${formatBNToString(trade?.minimumOutput, NumberType.SwapTradeAmount)}  ${
                  trade ? trade?.swapOutput?.tokenSymbol : ''
                }`}
              </TruncatedText>
            </ThemedText.DeprecatedBlack>
          </TextWithLoadingPlaceholder>
        </RowBetween> */}
      </AutoColumn>
    </StyledCard>
  )
}

// export function ReduceBorrowDetails({ position, loading }: { position?: LimitlessPositionDetails; loading: boolean }) {
//   const currency0 = useCurrency(position?.token0Address)
//   const currency1 = useCurrency(position?.token1Address)
//   return position ? (
//     <StyledCard marginTop="10px">
//       <AutoColumn gap="md">
//         <ValueLabel
//           description="Existing collateral amount for this position."
//           value={formatBNToString(position?.initialCollateral)}
//           label="Current Collateral Amount"
//           syncing={loading}
//           symbolAppend={position?.isToken0 ? currency0?.symbol : currency1?.symbol}
//         />
//         <ValueLabel
//           description="Existing borrowed amount for this position."
//           value={formatBNToString(position?.totalDebtInput)}
//           label="Current Borrowed Amount"
//           syncing={loading}
//           symbolAppend={position?.isToken0 ? currency1?.symbol : currency0?.symbol}
//         />
//       </AutoColumn>
//     </StyledCard>
//   ) : null
// }

// export const DefaultBorrowDetails: BorrowCreationDetails = {
//   collateralAmount: undefined,
//   borrowedAmount: undefined,
//   quotedPremium: undefined,
//   unusedPremium: undefined,
//   priceImpact: undefined,
//   ltv: undefined,
//   state: TradeState.INVALID,
//   existingPosition: false,
//   existingTotalDebtInput: undefined,
//   existingCollateral: undefined,
// }

// collateralAmount: number | undefined// CurrencyAmount<Currency> | undefined
// borrowedAmount: number | undefined // totalDebtInput
// quotedPremium: number | undefined
// unusedPremium: number | undefined
// priceImpact: Percent | undefined
// ltv: number | undefined
// state: TradeState
// existingPosition: boolean | undefined
// existingTotalDebtInput: number | undefined
// existingCollateral: number | undefined

export function AdvancedBorrowSwapDetails({
  borrowTrade,
  syncing = false,
}: {
  borrowTrade?: BorrowCreationDetails
  syncing: boolean
}) {
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    // leverageManagerAddress
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  // const theme = useTheme()

  const displayValues = useMemo(() => {
    let additionalCollateral
    let totalExistingCollateral
    let totalExistingBorrowed
    let _borrowedAmount
    if (borrowTrade) {
      const { collateralAmount, borrowedAmount, existingCollateral, existingTotalDebtInput } = borrowTrade
      if (collateralAmount && borrowedAmount) {
        totalExistingCollateral = existingCollateral
        totalExistingBorrowed = existingTotalDebtInput
        additionalCollateral = collateralAmount
        _borrowedAmount = borrowedAmount
      }
    }
    return {
      additionalCollateral,
      totalExistingCollateral,
      totalExistingBorrowed,
      borrowedAmount: _borrowedAmount,
    }
  }, [borrowTrade])

  // console.log("quotedPremium: ", borrowTrade?.quotedPremium)
  return (
    <StyledCard>
      <AutoColumn gap="sm">
        <ValueLabel
          description={
            borrowTrade?.existingPosition ? 'Collateral Added to Position' : 'Net collateral for the transaction'
          }
          label={borrowTrade?.existingPosition ? 'Additonal Collateral' : 'Total Collateral'}
          value={formatBNToString(displayValues.additionalCollateral)}
          syncing={syncing}
          symbolAppend={inputCurrency?.symbol}
        />
        <ValueLabel
          description={
            borrowTrade?.existingPosition
              ? 'Total Borrow Position, added to your previous position'
              : 'The borrowed amount you expect to receive at the current market price.'
          }
          label="Total Borrow Amount"
          value={formatBNToString(displayValues.borrowedAmount)}
          syncing={syncing}
          symbolAppend={outputCurrency?.symbol}
        />
        <Separator />
        <ValueLabel
          description="The premium you are expected to pay, which depletes in 48hrs(after which your position will be force closed)."
          label="Premium to deposit"
          value={formatBNToString(borrowTrade?.quotedPremium)}
          syncing={syncing}
          symbolAppend={outputCurrency?.symbol}
        />
        {/* <ValueLabel 
          description="The remaining premium returned."
          label="Returned Premium"
          value={borrowTrade?.unusedPremium?borrowTrade?.unusedPremium:0 }
          syncing={syncing}
          symbolAppend={outputCurrency?.symbol}
          width={"100px"}
        /> */}
      </AutoColumn>
    </StyledCard>
  )
}
