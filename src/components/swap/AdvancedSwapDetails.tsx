import { Trans } from '@lingui/macro'
import { formatCurrencyAmount, formatNumber, NumberType } from '@uniswap/conedison/format'
import { Currency, Percent, Price, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import Card from 'components/Card'
import { LoadingRows } from 'components/Loader/styled'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { SUPPORTED_GAS_ESTIMATE_CHAIN_IDS } from 'constants/chains'
import { DEFAULT_ERC20_DECIMALS } from 'constants/tokens'
import { useCurrency, useToken } from 'hooks/Tokens'
import { usePool } from 'hooks/usePools'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { useMemo } from 'react'
import { AddMarginTrade, PreTradeInfo } from 'state/marginTrading/hooks'
import { InterfaceTrade } from 'state/routing/types'
import { Field } from 'state/swap/actions'
import { BorrowCreationDetails, LeverageTrade, useSwapState } from 'state/swap/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { LimitlessPositionDetails } from 'types/leveragePosition'
import { MarginPositionDetails } from 'types/lmtv2position'

// import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { Separator, ThemedText } from '../../theme'
import { computeRealizedPriceImpact } from '../../utils/prices'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'
import { MouseoverTooltip } from '../Tooltip'
import FormattedPriceImpact from './FormattedPriceImpact'
import { TruncatedText } from './styleds'

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
}: {
  syncing: boolean
  width: number
  children: JSX.Element
}) {
  return syncing ? (
    <LoadingRows>
      <div style={{ height: '15px', width: `${width}px` }} />
    </LoadingRows>
  ) : (
    children
  )
}

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
          value={trade?.outputAmount.toFixed(3)}
          label={
            <Trans>
              <ThemedText.BodySmall>Output</ThemedText.BodySmall>
            </Trans>
          }
          appendSymbol={trade ? trade.outputAmount.currency.symbol : '-'}
        />
        <MouseoverValueLabel
          description="The impact your trade has on the market price of this pool."
          value={<FormattedPriceImpact priceImpact={priceImpact} />}
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
              ? '-'
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
          {value}
          {appendSymbol}
        </ThemedText.BodySmall>
      </TextWithLoadingPlaceholder>
    </RowBetween>
  )
}

export function ReduceLeveragePositionDetails({
  leverageTrade, // user defined slippage.
  loading,
}: {
  leverageTrade: LimitlessPositionDetails | undefined
  loading: boolean
}) {
  // const theme = useTheme()
  // const { chainId } = useWeb3React()
  // const nativeCurrency = useNativeCurrency()
  const token0 = useToken(leverageTrade?.token0Address)
  const token1 = useToken(leverageTrade?.token1Address)
  // console.log("leveragePositionClose", leverageTrade)

  const inputIsToken0 = !leverageTrade?.isToken0

  return (
    <Card padding="0" marginTop="10px">
      <AutoColumn gap="sm">
        <MouseoverValueLabel
          description="Total position size in the output token of the leverage trade"
          label={<Trans>Added Position</Trans>}
          syncing={loading}
          value={`${leverageTrade?.totalPosition ?? '-'}`}
          appendSymbol={inputIsToken0 ? token1?.symbol : token0?.symbol}
        />
        <MouseoverValueLabel
          description="Total debt of the position"
          label={<Trans>Debt</Trans>}
          value={`${formatBNToString(leverageTrade?.totalDebtInput) ?? '-'}`}
          appendSymbol={inputIsToken0 ? token0?.symbol : token1?.symbol}
          syncing={loading}
        />
        <MouseoverValueLabel
          description="Leverage Factor"
          label={<Trans>Leverage</Trans>}
          syncing={loading}
          value={
            leverageTrade?.totalDebtInput && leverageTrade?.initialCollateral
              ? `${formatBNToString(
                  (leverageTrade?.totalDebtInput)
                    .plus(leverageTrade.initialCollateral)
                    .div(leverageTrade?.initialCollateral)
                )}x`
              : '-'
          }
        />
        {/* <RowBetween>
          <RowFixed>
            <MouseoverTooltip
              text={
                <Trans>
                  Total position size in the output token of the leverage trade
                </Trans>
              }
            >
              <ThemedText.DeprecatedSubHeader color={theme.textPrimary}>
                <Trans>Total Output Position</Trans>
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={false} width={65}>
            <StyledText textAlign="right" fontSize={14}>

              <TruncatedText>
                {
                  `${leverageTrade?.totalPosition ?? "-"}`
                }
              </TruncatedText>
              {inputIsToken0 ? token1?.symbol : token0?.symbol}
            </StyledText>
          </TextWithLoadingPlaceholder>
        </RowBetween> */}
        {/* <RowBetween>
          <RowFixed>
            <MouseoverTooltip
              text={<Trans>Total debt of the position</Trans>}
            // disableHover={hideInfoTooltips}
            >
              <ThemedText.DeprecatedSubHeader color={theme.textPrimary}>
                <Trans>Original Debt</Trans>
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={false} width={50}>
            <StyledText textAlign="right" fontSize={14}>
              <TruncatedText>
                {`${Number(leverageTrade?.totalDebtInput) ?? "-"}  ${inputIsToken0 ? token0?.symbol : token1?.symbol}`}
              </TruncatedText>
            </StyledText>
          </TextWithLoadingPlaceholder>
        </RowBetween> */}
        {/* <RowBetween>
          <RowFixed>
            <MouseoverTooltip
              text={
                <Trans>
                  Leverage Factor
                </Trans>
              }
            >
              <ThemedText.DeprecatedSubHeader color={theme.textPrimary}>
                <Trans>Leverage</Trans>
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={false} width={65}>
            <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
              <TruncatedText>
                {leverageTrade?.totalDebtInput && leverageTrade?.initialCollateral
                  ? `${(Number(leverageTrade?.totalDebtInput) + Number(leverageTrade.initialCollateral)) / Number(leverageTrade?.initialCollateral)}x`
                  : '-'}
              </TruncatedText>

            </ThemedText.DeprecatedBlack>
          </TextWithLoadingPlaceholder>
        </RowBetween> */}
        <Separator />
      </AutoColumn>
    </Card>
  )
}

export function BorrowPremiumPositionDetails({
  position, // user defined slippage.
  loading,
}: {
  position: LimitlessPositionDetails | undefined
  loading: boolean
  // allowedSlippage: Percent | undefined
}) {
  // const theme = useTheme()
  // const { chainId } = useWeb3React()
  // const nativeCurrency = useNativeCurrency()
  const token0 = useToken(position?.token0Address)
  const token1 = useToken(position?.token1Address)
  // console.log("leveragePositionClose", leverageTrade)

  const inputIsToken0 = position?.isToken0

  const [poolState, pool] = usePool(token0 ?? undefined, token1 ?? undefined, position?.poolFee)

  const ltv = useMemo(() => {
    if (position) {
      const collateralIsToken0 = position.isToken0 // position.isToken0 === position.borrowBelow
      const price = collateralIsToken0
        ? pool?.token0Price.toFixed(DEFAULT_ERC20_DECIMALS)
        : pool?.token1Price.toFixed(DEFAULT_ERC20_DECIMALS)
      const ltv = new BN(position.totalDebtInput).div(
        new BN(position.initialCollateral).multipliedBy(new BN(price ?? '0'))
      )
      return ltv.toNumber()
    }
    return undefined
  }, [position, pool])

  return (
    <Card padding="0" marginTop="10px">
      <AutoColumn gap="sm">
        <MouseoverValueLabel
          description="Total collateral amount"
          label={<Trans>Total Collateral</Trans>}
          syncing={false}
          value={`${formatBNToString(position?.initialCollateral) ?? '-'}`}
          appendSymbol={inputIsToken0 ? token0?.symbol : token1?.symbol}
        />
        <MouseoverValueLabel
          description="Total debt of the position"
          label={<Trans>Debt</Trans>}
          syncing={false}
          value={`${formatBNToString(position?.totalDebtInput) ?? '-'} `}
          appendSymbol={inputIsToken0 ? token1?.symbol : token0?.symbol}
        />
        <MouseoverValueLabel
          description="Loan-to-Value"
          label={<Trans>LTV</Trans>}
          syncing={false}
          value={ltv ? `${formatBNToString(new BN(ltv * 100))}%` : '-'}
        />
        {/* <RowBetween>
          <RowFixed>
            <MouseoverTooltip
              text={
                <Trans>
                  Total collateral amount
                </Trans>
              }
            >
              <ThemedText.DeprecatedSubHeader color={theme.textPrimary}>
                <Trans>Total Collateral</Trans>
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={false} width={65}>
            <StyledText textAlign="right" fontSize={14}>

              <TruncatedText>
                {
                  `${position?.initialCollateral ?? "-"}`
                }
              </TruncatedText>
              {inputIsToken0 ? token0?.symbol : token1?.symbol}
            </StyledText>
          </TextWithLoadingPlaceholder>
        </RowBetween> */}
        {/* <RowBetween>
          <RowFixed>
            <MouseoverTooltip
              text={<Trans>Total debt of the position</Trans>}
            // disableHover={hideInfoTooltips}
            >
              <ThemedText.DeprecatedSubHeader color={theme.textPrimary}>
                <Trans>Debt</Trans>
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={false} width={50}>

            <StyledText textAlign="right" fontSize={14}>
              <TruncatedText>
                {`${Number(position?.totalDebtInput) ?? "-"} `}
              </TruncatedText>
              {inputIsToken0 ?  token1?.symbol : token0?.symbol}
            </StyledText>


          </TextWithLoadingPlaceholder>
        </RowBetween> */}
        {/* <RowBetween>
          <RowFixed>
            <MouseoverTooltip
              text={
                <Trans>
                  Loan-to-Value
                </Trans>
              }
            >
              <ThemedText.DeprecatedSubHeader color={theme.textPrimary}>
                <Trans>LTV</Trans>
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={false} width={65}>
            <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
              <TruncatedText>
                {ltv ? `${new BN(ltv*100).toString()}%` : '-'}
              </TruncatedText>

            </ThemedText.DeprecatedBlack>
          </TextWithLoadingPlaceholder>
        </RowBetween> */}
        <Separator />
      </AutoColumn>
    </Card>
  )
}

// function AddPremiumDetails({
//   leverageTrade // user defined slippage.
// }: {
//   leverageTrade: LimitlessPositionDetails | undefined,
//   // allowedSlippage: Percent | undefined
// }) {
//   const theme = useTheme()
//   const { chainId } = useWeb3React()
//   const nativeCurrency = useNativeCurrency()
//   const token0 = useToken(leverageTrade?.token0Address)
//   const token1 = useToken(leverageTrade?.token1Address)

//   // console.log("leveragePositionClose", leverageTrade)

//   const inputIsToken0 = !leverageTrade?.isToken0

//   return (
//     <StyledCard>
//       <AutoColumn gap="sm">
//         <RowBetween>
//           <RowFixed>
//             <MouseoverTooltip
//               text={
//                 <Trans>
//                   Total position size in the output token of the leverage trade
//                 </Trans>
//               }
//             // disableHover={hideInfoTooltips}
//             >
//               <ThemedText.DeprecatedSubHeader color={theme.textPrimary}>
//                 <Trans>Total Position</Trans>
//               </ThemedText.DeprecatedSubHeader>
//             </MouseoverTooltip>
//           </RowFixed>
//           <TextWithLoadingPlaceholder syncing={false} width={65}>
//             <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
//               {leverageTrade?.totalPosition
//                 ? `${leverageTrade?.totalPosition}  ${inputIsToken0 ? token1?.symbol : token0?.symbol}`
//                 : '-'}
//             </ThemedText.DeprecatedBlack>
//           </TextWithLoadingPlaceholder>
//         </RowBetween>
//         <RowBetween>
//           <RowFixed>
//             <MouseoverTooltip
//               text={<Trans>Total debt of the position</Trans>}
//             // disableHover={hideInfoTooltips}
//             >
//               <ThemedText.DeprecatedSubHeader color={theme.textPrimary}>
//                 <Trans>Total Debt</Trans>
//               </ThemedText.DeprecatedSubHeader>
//             </MouseoverTooltip>
//           </RowFixed>
//           <TextWithLoadingPlaceholder syncing={false} width={50}>
//             <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
//               {leverageTrade?.totalDebtInput
//                 ? `${leverageTrade?.totalDebtInput ?? ""}  ${inputIsToken0 ? token0?.symbol : token1?.symbol}`
//                 : '-'}
//             </ThemedText.DeprecatedBlack>
//           </TextWithLoadingPlaceholder>
//         </RowBetween>
//         <Separator />
//       </AutoColumn>
//     </StyledCard>
//   )
// }

export function ValueLabel({
  label,
  description,
  value,
  syncing,
  symbolAppend,
  hideInfoTooltips = false,
  delta,
}: {
  description: string
  label: string

  value?: number | string
  syncing: boolean
  symbolAppend?: string
  hideInfoTooltips?: boolean
  delta?: boolean
}) {
  // const theme = useTheme()

  return (
    <RowBetween padding="1px">
      <RowFixed>
        <MouseoverTooltip text={<Trans>{description}</Trans>} disableHover={hideInfoTooltips}>
          <ThemedText.BodySmall>{label}</ThemedText.BodySmall>
        </MouseoverTooltip>
      </RowFixed>

      <TextWithLoadingPlaceholder syncing={syncing} width={65}>
        {!delta ? (
          <ThemedText.BodySmall color="textSecondary" textAlign="right">
            {value ? `${value.toString()} ${symbolAppend ?? ''}` : '-'}
          </ThemedText.BodySmall>
        ) : (
          <ThemedText.BodySmall color="textSecondary" textAlign="right">
            <DeltaText delta={Number(value)}>
              {value ? `${Math.abs(Number(value)).toString()} ${symbolAppend ?? ''}` : '-'}
            </DeltaText>
          </ThemedText.BodySmall>
        )}
      </TextWithLoadingPlaceholder>
    </RowBetween>
  )
}

function lmtFormatPrice(price: Price<Currency, Currency> | undefined, placeholder = '-'): string {
  if (price) {
    if (price.greaterThan(1)) {
      const symbol = price.baseCurrency.symbol + '/' + price.quoteCurrency.symbol
      return `${formatNumber(Number(price.toFixed(18)), NumberType.SwapTradeAmount)} ${symbol} `
    } else {
      const symbol = price?.quoteCurrency.symbol + '/' + price?.baseCurrency.symbol
      return `${formatNumber(Number(price.invert().toFixed(18)), NumberType.SwapTradeAmount)} ${symbol}`
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
  // console.log('trade', trade, preTradeInfo)
  return (
    <StyledCard>
      <AutoColumn gap="sm">
        {/* <ValueLabel
          description="The premium you are expected to put down as a deposit to borrow the amount you are borrowing. 
          It will deplete at a faster rate when the prices are around your borrowed price range. This needs to be replenished(whether or not it has been utilized) every 48 hours or your position will be force closed."
          label="Additional premium to pay"
          value={formatCurrencyAmount(preTradeInfo?.premiumNecessary, NumberType.SwapTradeAmount)}
          syncing={syncing}
          symbolAppend={preTradeInfo?.premiumNecessary ? inputCurrency?.symbol : ''}
        /> */}

        {/*<ValueLabel
          description="The amount you expect to receive at the current market price. You may receive less or more if the market price changes while your transaction is pending."
          label={existingPosition && existingPosition?.openTime > 0 ? 'Added Position' : 'Exp. Output'}
          value={formatCurrencyAmount(trade?.swapOutput, NumberType.SwapTradeAmount)}
          syncing={syncing}
          symbolAppend={trade ? outputCurrency?.symbol : ''}
        />*/}
        <ValueLabel
          description="Amount In / Amount Out"
          label="Execution Price"
          value={lmtFormatPrice(trade?.executionPrice)}
          syncing={syncing}
        />
        <ValueLabel
          description="Initial Premium Deposit for this position, can be replenished in the position table. When deposit is depleted, your position will be force closed."
          label="Initial Premium deposit"
          value={formatCurrencyAmount(trade?.premium, NumberType.SwapTradeAmount)}
          syncing={syncing}
          symbolAppend={trade ? inputCurrency?.symbol : ''}
        />
        <ValueLabel
          description="Rate at which your premium deposit are depleted. Rate% * debt is rate of depletion  "
          label="Borrow Rate % per hour"
          value="0"
          syncing={syncing}
        />
        <ValueLabel
          description="The amount you borrow"
          label="Borrow Amount"
          value={formatCurrencyAmount(trade?.borrowAmount, NumberType.SwapTradeAmount)}
          syncing={syncing}
          symbolAppend={trade ? inputCurrency?.symbol : ''}
        />
        <ValueLabel
          description="Slippage from spot price"
          label="Slippage"
          value={trade?.allowedSlippage.toFixed(6)}
          symbolAppend="%"
          syncing={syncing}
        />
        <ValueLabel
          description="Swap fee + origination fee "
          label="Total Fees"
          value={formatCurrencyAmount(trade?.fees, NumberType.SwapTradeAmount)}
          syncing={syncing}
        />
        <Separator />
        <RowBetween>
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
                {`${formatCurrencyAmount(trade?.swapOutput, NumberType.SwapTradeAmount)}  ${
                  trade ? trade?.swapOutput?.currency.symbol : ''
                }`}
              </TruncatedText>
            </ThemedText.DeprecatedBlack>
          </TextWithLoadingPlaceholder>
        </RowBetween>
      </AutoColumn>
    </StyledCard>
  )
}

export function ReduceBorrowDetails({ position, loading }: { position?: LimitlessPositionDetails; loading: boolean }) {
  const currency0 = useCurrency(position?.token0Address)
  const currency1 = useCurrency(position?.token1Address)
  return position ? (
    <StyledCard marginTop="10px">
      <AutoColumn gap="md">
        <ValueLabel
          description="Existing collateral amount for this position."
          value={formatBNToString(position?.initialCollateral)}
          label="Current Collateral Amount"
          syncing={loading}
          symbolAppend={position?.isToken0 ? currency0?.symbol : currency1?.symbol}
        />
        <ValueLabel
          description="Existing borrowed amount for this position."
          value={formatBNToString(position?.totalDebtInput)}
          label="Current Borrowed Amount"
          syncing={loading}
          symbolAppend={position?.isToken0 ? currency1?.symbol : currency0?.symbol}
        />
      </AutoColumn>
    </StyledCard>
  ) : null
}

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
