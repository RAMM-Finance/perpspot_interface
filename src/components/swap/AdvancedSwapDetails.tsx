import { Trans } from '@lingui/macro'
import { formatCurrencyAmount, formatPrice, NumberType } from '@uniswap/conedison/format'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import Card from 'components/Card'
import { LoadingRows } from 'components/Loader/styled'
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
    /* !trade ? null :  */ <StyledCard>
      <AutoColumn gap="sm">
        <MouseoverValueLabel
          description="The amount you expect to receive at the current market price. You may receive less or more if the market price changes while your transaction is pending."
          value={trade?.outputAmount.toFixed(3)}
          label={<Trans>Output</Trans>}
          appendSymbol={trade ? trade.outputAmount.currency.symbol : '-'}
        />
        <MouseoverValueLabel
          description="The impact your trade has on the market price of this pool."
          value={<FormattedPriceImpact priceImpact={priceImpact} />}
          label={<Trans>Price Impact</Trans>}
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
  const theme = useTheme()

  return (
    <RowBetween>
      <RowFixed>
        <MouseoverTooltip text={<Trans>{description}</Trans>} disableHover={false}>
          <ThemedText.DeprecatedSubHeader color={theme.textSecondary}>{label}</ThemedText.DeprecatedSubHeader>
        </MouseoverTooltip>
      </RowFixed>
      <TextWithLoadingPlaceholder syncing={syncing ?? false} width={65}>
        <StyledText textAlign="right" fontSize={14}>
          <TruncatedText>{value}</TruncatedText>
          {appendSymbol}
        </StyledText>
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
  width = '',
}: {
  description: string
  label: string

  value?: number | string
  syncing: boolean
  symbolAppend?: string
  hideInfoTooltips?: boolean
  width?: string
}) {
  // const theme = useTheme()

  return (
    <RowBetween>
      <RowFixed>
        <MouseoverTooltip text={<Trans>{description}</Trans>} disableHover={hideInfoTooltips}>
          <ThemedText.BodySecondary fontSize={13}>{label}</ThemedText.BodySecondary>
        </MouseoverTooltip>
      </RowFixed>

      <TextWithLoadingPlaceholder syncing={syncing} width={65}>
        <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
          {value ? `${value.toString()} ${symbolAppend}` : '-'}
        </ThemedText.DeprecatedBlack>
      </TextWithLoadingPlaceholder>
    </RowBetween>
  )
}

// export const DefaultLeverageTrade: LeverageTrade = {
//   inputAmount:  undefined,
//   borrowedAmount:  undefined,
//   state: LeverageTradeState.INVALID,
//   expectedOutput: undefined, // new output. i.e. new position - existing position.
//   strikePrice:  undefined,
//   quotedPremium:  undefined,
//   priceImpact:  undefined,
//   remainingPremium:  undefined,
//   effectiveLeverage:  undefined,
//   existingPosition: undefined,
//   existingTotalDebtInput:  undefined,
//   existingTotalPosition: undefined,
//   tokenId: undefined,
//   existingCollateral: undefined
// }

// export function AdvancedLeverageSwapDetails({
//   allowedSlippage,
//   syncing = false,
//   hideInfoTooltips = false,
//   // leverageFactor,
//   trade,
//   leverageTrade,
// }: AdvancedAddLeverageDetailsProps) {
//   const theme = useTheme()

//   const {
//     [Field.INPUT]: { currencyId: inputCurrencyId },
//     [Field.OUTPUT]: { currencyId: outputCurrencyId },
//   } = useSwapState()

//   const inputCurrency = useCurrency(inputCurrencyId)
//   const outputCurrency = useCurrency(outputCurrencyId)
//   // const {
//   //   existingTotalPosition,
//   //   existingPosition,
//   //   existingTotalDebtInput,
//   //   existingCollateral,
//   //   expectedOutput,
//   //   borrowedAmount,
//   //   inputAmount
//   // } = leverageTrade;
//   const [price, fees, addedOutput] = useMemo(() => {
//     let _price
//     let _fees
//     let _addedOutput
//     if (leverageTrade) {
//       if (leverageTrade.existingPosition) {
//         _price = leverageTrade?.expectedTotalPosition
//           .minus(leverageTrade?.existingTotalPosition)
//           .div(leverageTrade?.borrowedAmount?.toExact())
//         _fees = new BN(leverageTrade?.borrowedAmount?.toExact())
//           .minus(leverageTrade?.existingTotalDebtInput)
//           .plus(leverageTrade?.inputAmount?.toExact())
//           .times(0.0005)
//         _addedOutput = leverageTrade?.expectedTotalPosition.minus(leverageTrade?.existingTotalPosition)
//       } else {
//         _price = leverageTrade?.expectedTotalPosition.div(
//           new BN(leverageTrade?.borrowedAmount?.toExact()).plus(leverageTrade?.inputAmount?.toExact())
//         )
//         _fees = new BN(leverageTrade?.borrowedAmount?.toExact())
//           .plus(leverageTrade?.inputAmount?.toExact())
//           .times(0.0005)
//         _addedOutput = leverageTrade?.expectedTotalPosition
//       }
//     }

//     return [_price, _fees, _addedOutput]
//   }, [leverageTrade])

//   return (
//     <StyledCard>
//       <AutoColumn gap="sm">
//         <ValueLabel
//           description="The amount you expect to receive at the current market price. You may receive less or more if the market price changes while your transaction is pending."
//           label={leverageTrade?.existingPosition ? 'Added Position' : 'Exp. Output'}
//           value={formatBNToString(addedOutput)}
//           syncing={syncing}
//           symbolAppend={outputCurrency?.symbol}
//         />
//         <ValueLabel
//           description="Amount In / Amount Out"
//           label="Quoted Price"
//           value={formatBNToString(price)}
//           syncing={syncing}
//           symbolAppend={price ? '/' + formatBNToString(new BN(1).div(price)) : '/-'}
//         />
//         <ValueLabel
//           description="The premium payment required to open this position. It depletes at a constant rate for 24 hours, and when you close your position early, you will regain the remaining amount."
//           label="Quoted Premium"
//           value={formatBNToString(leverageTrade?.quotedPremium)}
//           syncing={syncing}
//           symbolAppend={inputCurrency?.symbol}
//         />
//         {leverageTrade?.existingPosition && (
//           <ValueLabel
//             description="The premium refunded from your old payment"
//             label="Returned premium"
//             value={formatBNToString(leverageTrade?.remainingPremium)}
//             syncing={syncing}
//             symbolAppend={inputCurrency?.symbol}
//           />
//         )}
//         <ValueLabel
//           description="The maximum loss you can incur is capped by which UniswapV3 ticks you borrow from. The highest value it can take is your margin.
//           The exact value depends on the ticks you borrow from, if you borrow closer to the current market price(where you borrow depends on the pool's liquidity condition), the more expensive the premium, but the less maximum loss. This value does not account for premiums."
//           label="Maximum Loss"
//           value={formatBNToString(
//             leverageTrade?.inputAmount ? new BN(leverageTrade?.inputAmount?.toExact()) : undefined
//           )}
//           syncing={syncing}
//           symbolAppend={inputCurrency?.symbol}
//         />
//         <ValueLabel
//           description="Fees paid for trade "
//           label="Fees"
//           value={formatBNToString(fees)}
//           syncing={syncing}
//           symbolAppend={inputCurrency?.symbol}
//         />

//         <Separator />
//         <RowBetween>
//           <RowFixed style={{ marginRight: '20px' }}>
//             <MouseoverTooltip
//               text={
//                 <Trans>
//                   The minimum amount you are guaranteed to receive. If the price slips any further, your transaction
//                   will revert.
//                 </Trans>
//               }
//               disableHover={hideInfoTooltips}
//             >
//               <ThemedText.DeprecatedSubHeader color={theme.textTertiary}>
//                 <Trans>Minimum output</Trans> <Trans>after slippage</Trans> ({allowedSlippage.toFixed(2)}%)
//               </ThemedText.DeprecatedSubHeader>
//             </MouseoverTooltip>
//           </RowFixed>
//           <TextWithLoadingPlaceholder syncing={syncing} width={70}>
//             <ThemedText.DeprecatedBlack textAlign="right" fontSize={14} color={theme.textTertiary}>
//               <TruncatedText>
//                 {trade?.tradeType === TradeType.EXACT_INPUT
//                   ? `${formatBNToString(addedOutput) ?? '-'}  ${trade?.outputAmount.currency.symbol}`
//                   : '-'}
//               </TruncatedText>
//             </ThemedText.DeprecatedBlack>
//           </TextWithLoadingPlaceholder>
//         </RowBetween>
//         {/* {!trade?.gasUseEstimateUSD || !chainId || !SUPPORTED_GAS_ESTIMATE_CHAIN_IDS.includes(chainId) ? null : (
//           <RowBetween>
//             <MouseoverTooltip
//               text={
//                 <Trans>
//                   The fee paid to miners who process your transaction. This must be paid in {nativeCurrency.symbol}.
//                 </Trans>
//               }
//               disableHover={hideInfoTooltips}
//             >
//               <ThemedText.DeprecatedSubHeader color={theme.textTertiary}>
//                 <Trans>Network Fee</Trans>
//               </ThemedText.DeprecatedSubHeader>
//             </MouseoverTooltip>
//             <TextWithLoadingPlaceholder syncing={syncing} width={50}>
//               <ThemedText.DeprecatedBlack textAlign="right" fontSize={14} color={theme.textTertiary}>
//                 ~${trade.gasUseEstimateUSD.toFixed(2)}
//               </ThemedText.DeprecatedBlack>
//             </TextWithLoadingPlaceholder>
//           </RowBetween>
//         )} */}
//       </AutoColumn>
//     </StyledCard>
//   )
// }

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

  return (
    <StyledCard>
      <AutoColumn gap="sm">
        <ValueLabel
          description="The premium payment required to open this position. It depletes at a constant rate for 24 hours, and when you close your position early, you will regain the remaining amount."
          label="Quoted Premium"
          value={formatCurrencyAmount(preTradeInfo?.premiumNecessary, NumberType.SwapTradeAmount)}
          syncing={syncing}
          symbolAppend={preTradeInfo?.premiumNecessary ? inputCurrency?.symbol : ''}
        />
        <ValueLabel
          description="Current premium deposit for this position"
          label="Existing Premium Deposit"
          value={formatCurrencyAmount(preTradeInfo?.premiumDeposit, NumberType.SwapTradeAmount)}
          syncing={syncing}
          symbolAppend={preTradeInfo?.premiumDeposit ? inputCurrency?.symbol : ''}
        />

        <ValueLabel
          description="The amount you expect to receive at the current market price. You may receive less or more if the market price changes while your transaction is pending."
          label={existingPosition && existingPosition?.openTime > 0 ? 'Added Position' : 'Exp. Output'}
          value={formatCurrencyAmount(trade?.swapOutput, NumberType.SwapTradeAmount)}
          syncing={syncing}
          symbolAppend={trade ? outputCurrency?.symbol : ''}
        />
        <ValueLabel
          description="Amount In / Amount Out"
          label="Execution Price"
          value={formatPrice(trade?.executionPrice)}
          syncing={syncing}
          symbolAppend={
            trade ? trade?.executionPrice?.baseCurrency.symbol + '/' + trade?.executionPrice?.quoteCurrency.symbol : ''
          }
        />
        <ValueLabel
          description="The maximum loss you can incur is capped by which UniswapV3 ticks you borrow from. The highest value it can take is your margin.  
          The exact value depends on the ticks you borrow from, if you borrow closer to the current market price(where you borrow depends on the pool's liquidity condition), the more expensive the premium, but the less maximum loss. This value does not account for premiums."
          label="Maximum Loss"
          value={formatCurrencyAmount(trade?.margin, NumberType.SwapTradeAmount)}
          syncing={syncing}
          symbolAppend={trade ? inputCurrency?.symbol : ''}
        />
        {/* <ValueLabel
          description="Fees paid for trade "
          label="Fees"
          value={formatBNToString(fees)}
          syncing={syncing}
          symbolAppend={inputCurrency?.symbol}
        /> */}

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
          width="100px"
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
          width="100px"
        />
        <Separator />
        <ValueLabel
          description="The quoted premium you are expected to pay, which depletes in 24hrs."
          label="Quoted Premium"
          value={formatBNToString(borrowTrade?.quotedPremium)}
          syncing={syncing}
          symbolAppend={outputCurrency?.symbol}
          width="100px"
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
