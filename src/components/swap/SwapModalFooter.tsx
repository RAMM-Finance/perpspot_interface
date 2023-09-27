import { Trans } from '@lingui/macro'
import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, SwapEventName } from '@uniswap/analytics-events'
import { formatNumber } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import AnimatedDropdown from 'components/AnimatedDropdown'
import CurrencyInputPanel from 'components/BaseSwapPanel'
import Card, { DarkCard, OutlineCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import Loader from 'components/Icons/LoadingSpinner'
import { LoadingRows } from 'components/Loader/styled'
import { LoadingOpacityContainer } from 'components/Loader/styled'
import { MouseoverTooltip } from 'components/Tooltip'
import { DEFAULT_ERC20_DECIMALS } from 'constants/tokens'
import { useCurrency, useToken } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useBorrowManagerContract, useLiquidityManagerContract } from 'hooks/useContract'
import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { convertBNToNum, useLimitlessPositionFromTokenId } from 'hooks/useV3Positions'
import { useCurrencyBalances } from 'lib/hooks/useCurrencyBalance'
import {
  formatPercentInBasisPointsNumber,
  formatPercentNumber,
  formatToDecimal,
  getDurationFromDateMilliseconds,
  getDurationUntilTimestampSeconds,
  getTokenAddress,
} from 'lib/utils/analytics'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { Checkbox } from 'nft/components/layout/Checkbox'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, Info } from 'react-feather'
import { Text } from 'rebass'
import { InterfaceTrade } from 'state/routing/types'
import { BorrowCreationDetails } from 'state/swap/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import { useClientSideRouter, useUserSlippageTolerance } from 'state/user/hooks'
import styled, { keyframes, useTheme } from 'styled-components/macro'
import { HideSmall, Separator, ThemedText } from 'theme'
import { LimitlessPositionDetails } from 'types/leveragePosition'
import { currencyId } from 'utils/currencyId'
import { computeRealizedPriceImpact } from 'utils/prices'

import { ButtonError, ButtonPrimary } from '../Button'
import Row, { AutoRow, RowBetween, RowFixed } from '../Row'
import { MouseoverValueLabel, ValueLabel } from './AdvancedSwapDetails'
import { SwapCallbackError, TruncatedText } from './styleds'
import { getTokenPath, RoutingDiagramEntry } from './SwapRoute'

// const StyledNumericalInput = styled(NumericalInput)`
//   width: 70%;
//   text-align: left;
//   padding: 10px;
//   background-color: ${({ theme }) => theme.backgroundFloating};
//   border-radius: 10px;
//   font-size: 20px;
// `

interface AnalyticsEventProps {
  trade: InterfaceTrade<Currency, Currency, TradeType>
  hash: string | undefined
  allowedSlippage: Percent
  transactionDeadlineSecondsSinceEpoch: number | undefined
  isAutoSlippage: boolean
  isAutoRouterApi: boolean
  swapQuoteReceivedDate: Date | undefined
  routes: RoutingDiagramEntry[]
  fiatValueInput?: number
  fiatValueOutput?: number
}

const formatRoutesEventProperties = (routes: RoutingDiagramEntry[]) => {
  const routesEventProperties: Record<string, any[]> = {
    routes_percentages: [],
    routes_protocols: [],
  }

  routes.forEach((route, index) => {
    routesEventProperties['routes_percentages'].push(formatPercentNumber(route.percent))
    routesEventProperties['routes_protocols'].push(route.protocol)
    routesEventProperties[`route_${index}_input_currency_symbols`] = route.path.map(
      (pathStep) => pathStep[0].symbol ?? ''
    )
    routesEventProperties[`route_${index}_output_currency_symbols`] = route.path.map(
      (pathStep) => pathStep[1].symbol ?? ''
    )
    routesEventProperties[`route_${index}_input_currency_addresses`] = route.path.map((pathStep) =>
      getTokenAddress(pathStep[0])
    )
    routesEventProperties[`route_${index}_output_currency_addresses`] = route.path.map((pathStep) =>
      getTokenAddress(pathStep[1])
    )
    routesEventProperties[`route_${index}_fee_amounts_hundredths_of_bps`] = route.path.map((pathStep) => pathStep[2])
  })

  return routesEventProperties
}

const formatAnalyticsEventProperties = ({
  trade,
  hash,
  allowedSlippage,
  transactionDeadlineSecondsSinceEpoch,
  isAutoSlippage,
  isAutoRouterApi,
  swapQuoteReceivedDate,
  routes,
  fiatValueInput,
  fiatValueOutput,
}: AnalyticsEventProps) => ({
  estimated_network_fee_usd: trade.gasUseEstimateUSD ? formatToDecimal(trade.gasUseEstimateUSD, 2) : undefined,
  transaction_hash: hash,
  transaction_deadline_seconds: getDurationUntilTimestampSeconds(transactionDeadlineSecondsSinceEpoch),
  token_in_address: getTokenAddress(trade.inputAmount.currency),
  token_out_address: getTokenAddress(trade.outputAmount.currency),
  token_in_symbol: trade.inputAmount.currency.symbol,
  token_out_symbol: trade.outputAmount.currency.symbol,
  token_in_amount: formatToDecimal(trade.inputAmount, trade.inputAmount.currency.decimals),
  token_out_amount: formatToDecimal(trade.outputAmount, trade.outputAmount.currency.decimals),
  token_in_amount_usd: fiatValueInput,
  token_out_amount_usd: fiatValueOutput,
  price_impact_basis_points: formatPercentInBasisPointsNumber(computeRealizedPriceImpact(trade)),
  allowed_slippage_basis_points: formatPercentInBasisPointsNumber(allowedSlippage),
  is_auto_router_api: isAutoRouterApi,
  is_auto_slippage: isAutoSlippage,
  chain_id:
    trade.inputAmount.currency.chainId === trade.outputAmount.currency.chainId
      ? trade.inputAmount.currency.chainId
      : undefined,
  duration_from_first_quote_to_swap_submission_milliseconds: swapQuoteReceivedDate
    ? getDurationFromDateMilliseconds(swapQuoteReceivedDate)
    : undefined,
  swap_quote_block_number: trade.blockNumber,
  ...formatRoutesEventProperties(routes),
})

export default function SwapModalFooter({
  trade,
  allowedSlippage,
  hash,
  onConfirm,
  swapErrorMessage,
  disabledConfirm,
  swapQuoteReceivedDate,
  fiatValueInput,
  fiatValueOutput,
}: {
  trade: InterfaceTrade<Currency, Currency, TradeType>
  hash: string | undefined
  allowedSlippage: Percent
  onConfirm: () => void
  swapErrorMessage: ReactNode | undefined
  disabledConfirm: boolean
  swapQuoteReceivedDate: Date | undefined
  fiatValueInput: { data?: number; isLoading: boolean }
  fiatValueOutput: { data?: number; isLoading: boolean }
}) {
  const transactionDeadlineSecondsSinceEpoch = useTransactionDeadline()?.toNumber() // in seconds since epoch
  const isAutoSlippage = useUserSlippageTolerance()[0] === 'auto'
  const [clientSideRouter] = useClientSideRouter()
  const routes = getTokenPath(trade)

  return (
    <>
      <AutoRow>
        <TraceEvent
          events={[BrowserEvent.onClick]}
          element={InterfaceElementName.CONFIRM_SWAP_BUTTON}
          name={SwapEventName.SWAP_SUBMITTED_BUTTON_CLICKED}
          properties={formatAnalyticsEventProperties({
            trade,
            hash,
            allowedSlippage,
            transactionDeadlineSecondsSinceEpoch,
            isAutoSlippage,
            isAutoRouterApi: !clientSideRouter,
            swapQuoteReceivedDate,
            routes,
            fiatValueInput: fiatValueInput.data,
            fiatValueOutput: fiatValueOutput.data,
          })}
        >
          <ButtonError
            onClick={onConfirm}
            disabled={disabledConfirm}
            style={{ margin: '10px 0 0 0' }}
            id={InterfaceElementName.CONFIRM_SWAP_BUTTON}
          >
            <Text fontSize={20} fontWeight={500}>
              <Trans>Confirm Swap</Trans>
            </Text>
          </ButtonError>
        </TraceEvent>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}

const TransactionDetails = styled.div`
  position: relative;
  width: 100%;
`
const Wrapper = styled(Row)`
  width: 100%;
  justify-content: center;
  border-radius: inherit;
  padding: 8px 12px;
  margin-top: 0;
  min-height: 32px;
`

const StyledInfoIcon = styled(Info)`
  height: 16px;
  width: 16px;
  margin-right: 4px;
  color: ${({ theme }) => theme.textTertiary};
`

const StyledCard = styled(OutlineCard)`
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
`

const StyledHeaderRow = styled(RowBetween)<{ disabled: boolean; open: boolean }>`
  padding: 0;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? 'initial' : 'pointer')};
`

const RotatingArrow = styled(ChevronDown)<{ open?: boolean }>`
  transform: ${({ open }) => (open ? 'rotate(180deg)' : 'none')};
  transition: transform 0.1s linear;
`

const StyledBalanceMax = styled.button<{ disabled?: boolean }>`
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.accentAction};
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  padding: 4px 6px;
  pointer-events: ${({ disabled }) => (!disabled ? 'initial' : 'none')};

  :hover {
    opacity: ${({ disabled }) => (!disabled ? 0.8 : 0.4)};
  }

  :focus {
    outline: none;
  }
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

const StyledPriceContainer = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  grid-template-columns: 1fr auto;
  grid-gap: 0.25rem;
  display: flex;
  flex-direction: row;
  text-align: left;
  flex-wrap: wrap;
  padding: 8px 0;
  user-select: text;
`

const SliderText = styled(Text)`
  font-size: 25px;
  font-weight: 500;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
     font-size: 24px
  `};
`

export enum DerivedInfoState {
  LOADING,
  VALID,
  INVALID,
}
// (vars.amount0, vars.amount1)

function useDerivedBorrowReduceCollateralInfo(
  trader: string | undefined,
  tokenId: string | undefined,
  position: LimitlessPositionDetails | undefined,
  reduceAmount: string | undefined,
  recieveCollateral: boolean,
  setState: (state: DerivedInfoState) => void
  // approvalState: ApprovalState
): {
  transactionInfo:
    | {
        token0Amount: number
        token1Amount: number
        pnl: number
        returnedAmount: number
        unusedPremium: number
        premium: number
      }
    | undefined
  userError: React.ReactNode | undefined
} {
  const borrowManagerContract = useBorrowManagerContract(position?.borrowManagerAddress)

  const [contractResult, setContractResult] = useState<{
    reducePositionResult: any
  }>()
  const { account } = useWeb3React()
  const currency0 = useCurrency(position?.token0Address)
  const currency1 = useCurrency(position?.token1Address)
  const relevantTokenBalances = useCurrencyBalances(
    account ?? undefined,
    useMemo(() => [currency0 ?? undefined, currency1 ?? undefined], [currency0, currency1])
  )

  // console.log('useDerivedBorrowReduceDebtlInfo', position?.borrowManagerAddress, borrowManagerContract)

  useEffect(() => {
    const laggedfxn = async () => {
      if (
        !borrowManagerContract ||
        !tokenId ||
        (!trader && !position) ||
        !position?.totalDebtInput ||
        Number(reduceAmount) <= 0 ||
        !reduceAmount
      ) {
        setState(DerivedInfoState.INVALID)
        return
      }

      const formattedReduceAmount = new BN(reduceAmount).shiftedBy(18).toFixed(0)
      setState(DerivedInfoState.LOADING)

      try {
        // console.log('reducePositionArgsss', position, position.isToken0, position.totalPosition, formattedReduceAmount)
        const reducePositionResult = await borrowManagerContract.callStatic.reduceBorrowPosition(
          position?.isToken0,
          true,
          recieveCollateral,
          formattedReduceAmount
        )
        // console.log('reducePosition', reducePositionResult, tokenId);
        setContractResult({
          reducePositionResult,
        })
        setState(DerivedInfoState.VALID)
      } catch (error) {
        console.error('Failed to get reduce info', error)
        setState(DerivedInfoState.INVALID)
        setContractResult(undefined)
      }
    }

    laggedfxn()
  }, [position, setState, borrowManagerContract, trader, tokenId, recieveCollateral, reduceAmount])

  const transactionInfo = useMemo(() => {
    if (contractResult) {
      const { reducePositionResult } = contractResult

      const token0Amount = convertBNToNum(reducePositionResult[0], DEFAULT_ERC20_DECIMALS)
      const token1Amount = convertBNToNum(reducePositionResult[1], DEFAULT_ERC20_DECIMALS)
      const pnl = convertBNToNum(reducePositionResult[2], DEFAULT_ERC20_DECIMALS)
      const returnedAmount = convertBNToNum(reducePositionResult[3], DEFAULT_ERC20_DECIMALS)
      const unusedPremium = convertBNToNum(reducePositionResult[4], DEFAULT_ERC20_DECIMALS)
      const premium = convertBNToNum(reducePositionResult[5], DEFAULT_ERC20_DECIMALS)

      return {
        token0Amount,
        token1Amount,
        pnl,
        returnedAmount,
        unusedPremium,
        premium,
      }
    }
    return undefined
  }, [contractResult])

  const userError = useMemo(() => {
    let error

    if (position) {
      if (!reduceAmount) {
        error = <Trans>Enter a valid amount</Trans>
      }

      if (relevantTokenBalances?.length === 2 && relevantTokenBalances[1] && relevantTokenBalances[0]) {
        const tokenBalance = position.isToken0 ? relevantTokenBalances[1] : relevantTokenBalances[0]
        if (new BN(tokenBalance.toExact()).lt(position.totalDebtInput.multipliedBy(0.002))) {
          error = <Trans>Insufficient {position.isToken0 ? currency1?.symbol : currency0?.symbol} balance</Trans>
        }
      }
    }
    return error
  }, [relevantTokenBalances, position, reduceAmount, currency0, currency1])

  return {
    transactionInfo,
    userError,
  }
}

function useDerivedBorrowReduceDebtInfo(
  trader: string | undefined,
  tokenId: string | undefined,
  position: LimitlessPositionDetails | undefined,
  reduceAmount: string | undefined,
  recieveCollateral: boolean,
  setState: (state: DerivedInfoState) => void
): {
  transactionInfo:
    | {
        token0Amount: number
        token1Amount: number
        pnl: number
        returnedAmount: number
        unusedPremium: number
        premium: number
      }
    | undefined
  userError: React.ReactNode | undefined
} {
  const borrowManagerContract = useBorrowManagerContract(position?.borrowManagerAddress)

  const [contractResult, setContractResult] = useState<{
    reducePositionResult: any
  }>()

  useEffect(() => {
    const laggedfxn = async () => {
      if (
        !borrowManagerContract ||
        !tokenId ||
        (!trader && !position) ||
        !position?.totalDebtInput ||
        Number(reduceAmount) <= 0 ||
        !reduceAmount
      ) {
        setState(DerivedInfoState.INVALID)
        return
      }

      const formattedReduceAmount = new BN(reduceAmount).shiftedBy(DEFAULT_ERC20_DECIMALS).toFixed(0)

      setState(DerivedInfoState.LOADING)

      try {
        // console.log('formattedReduceAmount', formattedReduceAmount)
        const reducePositionResult = await borrowManagerContract.callStatic.reduceBorrowPosition(
          position?.isToken0,
          false,
          recieveCollateral,
          formattedReduceAmount
        )
        setContractResult({
          reducePositionResult,
        })
        setState(DerivedInfoState.VALID)
      } catch (error) {
        console.error('Failed to get reduce info', error)
        setState(DerivedInfoState.INVALID)
        setContractResult(undefined)
      }
    }

    laggedfxn()
  }, [borrowManagerContract, trader, tokenId, recieveCollateral, reduceAmount, position, setState])

  const transactionInfo = useMemo(() => {
    if (contractResult) {
      const { reducePositionResult } = contractResult
      const token0Amount = convertBNToNum(reducePositionResult[0], DEFAULT_ERC20_DECIMALS)

      const token1Amount = convertBNToNum(reducePositionResult[1], DEFAULT_ERC20_DECIMALS)
      const pnl = convertBNToNum(reducePositionResult[2], DEFAULT_ERC20_DECIMALS)
      const returnedAmount = convertBNToNum(reducePositionResult[3], DEFAULT_ERC20_DECIMALS)
      const unusedPremium = convertBNToNum(reducePositionResult[4], DEFAULT_ERC20_DECIMALS)
      const premium = convertBNToNum(reducePositionResult[5], DEFAULT_ERC20_DECIMALS)
      // console.log("premium: ", premium)
      return {
        token0Amount,
        token1Amount,
        pnl,
        returnedAmount,
        unusedPremium,
        premium,
      }
    }
    return undefined
  }, [contractResult])

  const userError = useMemo(() => {
    let error
    if (!reduceAmount) {
      error = <Trans>Invalid Amount</Trans>
    }

    return error
  }, [reduceAmount])

  return {
    transactionInfo,
    userError,
  }
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

function useDerivedAddLeveragePremiumInfo(
  liquidityManagerAddress: string | undefined,
  trader: string | undefined,
  tokenId: string | undefined,
  isToken0: boolean | undefined,
  setState: (state: DerivedInfoState) => void,
  approvalState: ApprovalState,
  premium: BN | undefined
): {
  tradeInfo:
    | {
        remainingPremium: number
        totalPremium: number
      }
    | undefined
  inputError: React.ReactNode | undefined
} {
  const liquidityManagerContract = useLiquidityManagerContract(liquidityManagerAddress)
  const [contractResult, setContractResult] = useState<{
    addPremiumResult: any
  }>()
  const { position } = useLimitlessPositionFromTokenId(tokenId)

  const { account } = useWeb3React()
  const currency0 = useCurrency(position?.token0Address)
  const currency1 = useCurrency(position?.token1Address)

  const relevantTokenBalances = useCurrencyBalances(
    account ?? undefined,
    useMemo(() => [currency0 ?? undefined, currency1 ?? undefined], [currency0, currency1])
  )

  const inputError = useMemo(() => {
    if (
      position &&
      premium &&
      relevantTokenBalances.length === 2 &&
      relevantTokenBalances[0] &&
      relevantTokenBalances[1]
    ) {
      const isToken0 = position.isToken0
      const token0Balance = relevantTokenBalances[0]
      const token1Balance = relevantTokenBalances[1]
      let inputError
      if (isToken0 && new BN(token1Balance?.toExact()).lt(premium)) {
        inputError = <Trans>Insufficient {currency1?.symbol} balance</Trans>
      } else if (!isToken0 && new BN(token0Balance?.toExact()).lt(premium)) {
        inputError = <Trans>Insufficient {currency0?.symbol} balance</Trans>
      }
      return inputError
    }
    return undefined
  }, [relevantTokenBalances, position, currency0, currency1, premium])

  useEffect(() => {
    const laggedfxn = async () => {
      if (!liquidityManagerContract || !tokenId || !trader) {
        setState(DerivedInfoState.INVALID)
        return
      }
      setState(DerivedInfoState.LOADING)

      try {
        // const position = await leverageManagerContract.callStatic.getPosition(trader, tokenId)
        // payPremium(address trader, bool isBorrow, bool isToken0)
        const addPremiumResult = await liquidityManagerContract.callStatic.payPremium(trader, false, isToken0)
        console.log(
          'addPosition:',
          addPremiumResult,
          new BN(addPremiumResult[0]).shiftedBy(-18).toString(),
          addPremiumResult[1].toString()
        )

        setContractResult({
          addPremiumResult,
        })
        setState(DerivedInfoState.VALID)
      } catch (error) {
        console.error('Failed to get addPremium info', error)
        setState(DerivedInfoState.INVALID)
      }
    }

    !inputError && laggedfxn()
  }, [liquidityManagerContract, trader, tokenId, isToken0, approvalState, inputError, setState])

  const info = useMemo(() => {
    if (contractResult) {
      const addPremiumResult = contractResult.addPremiumResult
      return {
        totalPremium: Number(addPremiumResult[0].toString()) / 1e18,
        remainingPremium: Number(addPremiumResult[1].toString()) / 1e18,
        // remainingPremium: Number(new BN(addPremiumResult[1]).shiftedBy(-18).toString())
      }
    } else {
      return undefined
    }
  }, [contractResult])

  return { tradeInfo: info, inputError }
}

function useDerivedAddBorrowPremiumInfo(
  liquidityManagerAddress: string | undefined,
  trader: string | undefined,
  tokenId: string | undefined,
  isToken0: boolean | undefined,
  setState: (state: DerivedInfoState) => void,
  approvalState: ApprovalState,
  premium?: BN
): {
  tradeInfo:
    | {
        // rate: string,
        totalPremium: number
        remainingPremium: number
      }
    | undefined
  inputError: React.ReactNode | undefined
} {
  const liquidityManagerContract = useLiquidityManagerContract(liquidityManagerAddress)
  const [contractResult, setContractResult] = useState<{
    addPremiumResult: any
  }>()

  const { position } = useLimitlessPositionFromTokenId(tokenId)

  const { account } = useWeb3React()
  const currency0 = useCurrency(position?.token0Address)
  const currency1 = useCurrency(position?.token1Address)

  const relevantTokenBalances = useCurrencyBalances(
    account ?? undefined,
    useMemo(() => [currency0 ?? undefined, currency1 ?? undefined], [currency0, currency1])
  )

  const inputError = useMemo(() => {
    if (
      position &&
      premium &&
      currency1 &&
      currency0 &&
      relevantTokenBalances.length === 2 &&
      relevantTokenBalances[0] &&
      relevantTokenBalances[1]
    ) {
      const isToken0 = position.isToken0
      const token0Balance = relevantTokenBalances[0]
      const token1Balance = relevantTokenBalances[1]
      let inputError
      if (isToken0 && new BN(token1Balance?.toExact()).lt(premium)) {
        inputError = <Trans>Insufficient {currency1?.symbol} balance</Trans>
      } else if (!isToken0 && new BN(token0Balance?.toExact()).lt(premium)) {
        inputError = <Trans>Insufficient {currency0?.symbol} balance</Trans>
      }

      return inputError
    }
    return undefined
  }, [relevantTokenBalances, position, premium, currency0, currency1])

  useEffect(() => {
    const laggedfxn = async () => {
      if (!liquidityManagerContract || !tokenId || !trader) {
        setState(DerivedInfoState.INVALID)
        return
      }
      setState(DerivedInfoState.LOADING)

      try {
        // const position = await leverageManagerContract.callStatic.getPosition(trader, tokenId)

        const addPremiumResult = await liquidityManagerContract.callStatic.payPremium(trader, true, isToken0)
        setContractResult({
          addPremiumResult,
        })
        setState(DerivedInfoState.VALID)
        // console.log("addPosition:", addPremiumResult)
      } catch (error) {
        console.error('Failed to get reduceBorrowCollateral info', error)
        setState(DerivedInfoState.INVALID)
      }
    }

    !inputError && laggedfxn()
  }, [liquidityManagerContract, trader, tokenId, isToken0, approvalState, inputError, setState])

  const info = useMemo(() => {
    // console.log("addPosition2:", contractResult)

    if (contractResult) {
      const addPremiumResult = contractResult.addPremiumResult
      return {
        // rate: (Number(contractResult.addPremiumResult) / (1e16)).toString()//.shiftedBy(-18).toFixed(12)
        remainingPremium: new BN(addPremiumResult[1].toString()).shiftedBy(-18).toNumber(),
        totalPremium: new BN(addPremiumResult[0].toString()).shiftedBy(-18).toNumber(),
      }
    } else {
      return undefined
    }
  }, [contractResult])

  return {
    tradeInfo: info,
    inputError,
  }
}

export function AddPremiumLeverageModalFooter({
  tokenId,
  trader,
  setAttemptingTxn,
  setTxHash,
}: {
  tokenId: string | undefined
  trader: string | undefined
  setAttemptingTxn: (attemptingTxn: boolean) => void
  setTxHash: (txHash: string) => void
}) {
  const [derivedState, setDerivedState] = useState<DerivedInfoState>(DerivedInfoState.INVALID)
  const [showDetails, setShowDetails] = useState(false)
  const theme = useTheme()

  const { error, position } = useLimitlessPositionFromTokenId(tokenId)
  const liquidityManagerAddress = position?.liquidityManagerAddress
  const liquidityManager = useLiquidityManagerContract(position?.liquidityManagerAddress, true)

  const addTransaction = useTransactionAdder()
  const token0 = useToken(position?.token0Address)
  const token1 = useToken(position?.token1Address)
  const inputCurrency = useCurrency(position?.isToken0 ? position?.token1Address : position?.token0Address)
  const outputCurrency = useCurrency(position?.isToken0 ? position?.token0Address : position?.token1Address)
  const premium = useMemo(() => {
    return position?.totalDebtInput ? position.totalDebtInput.multipliedBy(0.002) : undefined
  }, [position])

  const [leverageApprovalState, approveLeverageManager] = useApproveCallback(
    inputCurrency ? CurrencyAmount.fromRawAmount(inputCurrency, premium?.shiftedBy(18).toFixed(0) ?? 0) : undefined,
    position?.leverageManagerAddress ?? undefined
  )
  const { tradeInfo, inputError } = useDerivedAddLeveragePremiumInfo(
    liquidityManagerAddress,
    trader,
    tokenId,
    position?.isToken0,
    setDerivedState,
    leverageApprovalState,
    premium
  )
  const inputIsToken0 = !position?.isToken0

  // const { loading, error, position } = useLimitlessPositionFromTokenId(tokenId)

  const { account, provider } = useWeb3React()

  const handleAddPremium = useMemo(() => {
    return () => {
      if (!account) throw new Error('Wallet must be connected')
      if (!liquidityManager) throw new Error('Liquidity Manager must be connected')
      if (!provider) throw new Error('Provider must be connected')
      if (!tradeInfo || !inputCurrency || !outputCurrency) throw new Error('Trade info must be valid')

      setAttemptingTxn(true)

      liquidityManager
        .payPremium(trader, false, position?.isToken0)
        .then((hash: any) => {
          addTransaction(hash, {
            type: TransactionType.PREMIUM_LEVERAGE,
            inputCurrencyId: currencyId(inputCurrency),
            outputCurrencyId: currencyId(outputCurrency),
          })
          setAttemptingTxn(false)
          setTxHash(hash)
          console.log('add premium hash: ', hash)
        })
        .catch((err: any) => {
          setAttemptingTxn(false)
          console.log('error adding premium: ', err)
        })
    }
  }, [
    account,
    addTransaction,
    inputCurrency,
    outputCurrency,
    tradeInfo,
    liquidityManager,
    provider,
    position,
    setTxHash,
    setAttemptingTxn,
    trader,
  ])
  // console.log("tradeInfo: ", tradeInfo);

  const updateLeverageAllowance = useCallback(async () => {
    try {
      await approveLeverageManager()
    } catch (err) {
      console.log('approveLeverageManager err: ', err)
    }
  }, [approveLeverageManager]) // add input to deps.

  const loading = derivedState === DerivedInfoState.LOADING
  const valid = derivedState === DerivedInfoState.VALID

  useEffect(() => {
    ;(!tradeInfo || !!inputError || leverageApprovalState !== ApprovalState.APPROVED) &&
      showDetails &&
      setShowDetails(false)
  }, [leverageApprovalState, tradeInfo, inputError, showDetails])

  const premiumSymbol = inputIsToken0 ? token0?.symbol : token1?.symbol
  // console.log("lmt", inputError, leverageApprovalState, tradeInfo)
  return (
    <AutoRow>
      <Card padding="0" marginTop="0" marginBottom="10px">
        <MouseoverValueLabel
          value={formatBNToString(premium)}
          label="Expected Premium Payment"
          description="expected premium payment"
          syncing={false}
          appendSymbol={position?.isToken0 ? token1?.symbol : token0?.symbol}
        />
      </Card>
      <TransactionDetails>
        <Wrapper style={{ marginTop: '0' }}>
          <AutoColumn gap="sm" style={{ width: '100%', marginBottom: '-8px' }}>
            <StyledHeaderRow
              onClick={() => {
                if (!tradeInfo || !!inputError || leverageApprovalState !== ApprovalState.APPROVED) {
                  return
                }
                setShowDetails(!showDetails)
              }}
              disabled={true}
              open={showDetails}
            >
              <RowFixed style={{ position: 'relative' }}>
                {loading ? (
                  <StyledPolling>
                    <StyledPollingDot>
                      <Spinner />
                    </StyledPollingDot>
                  </StyledPolling>
                ) : (
                  <HideSmall>
                    <StyledInfoIcon color={liquidityManagerAddress ? theme.textTertiary : theme.deprecated_bg3} />
                  </HideSmall>
                )}
                {liquidityManagerAddress ? (
                  loading ? (
                    <ThemedText.DeprecatedMain fontSize={14}>
                      <Trans>Fetching expected payment...</Trans>
                    </ThemedText.DeprecatedMain>
                  ) : (
                    <LoadingOpacityContainer $loading={loading}>Premium Payment Details</LoadingOpacityContainer>
                  )
                ) : null}
              </RowFixed>
              <RowFixed>
                <RotatingArrow stroke={theme.textTertiary} open={Boolean(showDetails)} />
              </RowFixed>
            </StyledHeaderRow>
            <AnimatedDropdown open={showDetails}>
              <AutoColumn gap="sm" style={{ padding: '0', paddingBottom: '8px' }}>
                {!loading ? (
                  <StyledCard>
                    <AutoColumn gap="sm">
                      <RowBetween>
                        <RowFixed>
                          <MouseoverTooltip text={<Trans>Expected Total Premium</Trans>}>
                            <ThemedText.DeprecatedSubHeader color={theme.textPrimary}>
                              <Trans>Premium To Pay</Trans>
                            </ThemedText.DeprecatedSubHeader>
                          </MouseoverTooltip>
                        </RowFixed>
                        <TextWithLoadingPlaceholder syncing={loading} width={65}>
                          <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                            {`${tradeInfo ? formatNumber(tradeInfo.totalPremium) : '-'}` + inputCurrency?.symbol}
                          </ThemedText.DeprecatedBlack>
                        </TextWithLoadingPlaceholder>
                      </RowBetween>
                      <RowBetween>
                        <RowFixed>
                          <MouseoverTooltip text={<Trans>Expected Returned Premium</Trans>}>
                            <ThemedText.DeprecatedSubHeader color={theme.textPrimary}>
                              <Trans>Returned Premium</Trans>
                            </ThemedText.DeprecatedSubHeader>
                          </MouseoverTooltip>
                        </RowFixed>
                        <TextWithLoadingPlaceholder syncing={loading} width={65}>
                          <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                            {`${tradeInfo ? formatNumber(tradeInfo.remainingPremium) : '-'}` + inputCurrency?.symbol}
                          </ThemedText.DeprecatedBlack>
                        </TextWithLoadingPlaceholder>
                      </RowBetween>
                    </AutoColumn>
                  </StyledCard>
                ) : null}
              </AutoColumn>
            </AnimatedDropdown>
          </AutoColumn>
        </Wrapper>
      </TransactionDetails>
      {!inputError && leverageApprovalState !== ApprovalState.APPROVED ? (
        <ButtonPrimary
          onClick={updateLeverageAllowance}
          disabled={leverageApprovalState === ApprovalState.PENDING}
          style={{ gap: 14 }}
        >
          {leverageApprovalState === ApprovalState.PENDING ? (
            <>
              <Loader size="20px" />
              <Trans>Approve pending</Trans>
            </>
          ) : (
            <>
              <MouseoverTooltip
                text={
                  <Trans>
                    Permission is required for Limitless to use each token.{' '}
                    {premium && premiumSymbol
                      ? `Allowance of ${formatBNToString(premium)} ${premiumSymbol} required.`
                      : null}
                  </Trans>
                }
              >
                <RowBetween>
                  <Info size={20} />
                  <Trans>Approve use of {premiumSymbol}</Trans>
                </RowBetween>
              </MouseoverTooltip>
            </>
            // <>

            //   <div style={{ height: 20 }}>
            //     <MouseoverTooltip
            //       text={
            //         <Trans>
            //           Permission is required.
            //         </Trans>
            //       }
            //     >
            //       <Info size={20} />
            //     </MouseoverTooltip>
            //   </div>
            //   <Trans>Approval needed for {inputIsToken0 ? token0?.symbol : token1?.symbol} premium payment</Trans>
            // </>
          )}
        </ButtonPrimary>
      ) : (
        <ButtonError
          onClick={handleAddPremium}
          disabled={!!inputError || derivedState !== DerivedInfoState.VALID}
          style={{ margin: '10px 0 0 0' }}
          id={InterfaceElementName.CONFIRM_SWAP_BUTTON}
        >
          {inputError ? (
            inputError
          ) : derivedState !== DerivedInfoState.VALID ? (
            <Trans>Invalid Transaction</Trans>
          ) : (
            <Text fontSize={20} fontWeight={500}>
              <Trans>Add Premium</Trans>
            </Text>
          )}
        </ButtonError>
      )}
    </AutoRow>
  )
}

export function AddPremiumBorrowModalFooter({
  tokenId,
  trader,
  setTxHash,
  setAttemptingTxn,
}: // handleAddPremium,
{
  tokenId: string | undefined
  trader: string | undefined
  setTxHash: (txHash: string) => void
  setAttemptingTxn: (attemptingTxn: boolean) => void
}) {
  const [derivedState, setDerivedState] = useState<DerivedInfoState>(DerivedInfoState.INVALID)
  const [showDetails, setShowDetails] = useState(false)
  const { error, loading: positionLoading, position } = useLimitlessPositionFromTokenId(tokenId)

  const liquidityManagerAddress = position?.liquidityManagerAddress
  const liquidityManager = useLiquidityManagerContract(liquidityManagerAddress, true)
  const addTransaction = useTransactionAdder()
  const theme = useTheme()
  const inputCurrency = useCurrency(position?.isToken0 ? position?.token0Address : position?.token1Address)
  const outputCurrency = useCurrency(position?.isToken0 ? position?.token1Address : position?.token0Address)
  const premium = useMemo(() => {
    if (position) {
      return position.totalDebtInput.multipliedBy(0.002)
    }
    return undefined
  }, [position])

  const [approvalState, approveManager] = useApproveCallback(
    outputCurrency ? CurrencyAmount.fromRawAmount(outputCurrency, premium?.shiftedBy(18).toFixed(0) ?? 0) : undefined,
    position?.borrowManagerAddress ?? undefined
  )
  const token0 = useCurrency(position?.token0Address)
  const token1 = useCurrency(position?.token1Address)

  const { tradeInfo, inputError } = useDerivedAddBorrowPremiumInfo(
    liquidityManagerAddress,
    trader,
    tokenId,
    position?.isToken0,
    setDerivedState,
    approvalState,
    premium
  )
  const inputIsToken0 = position?.isToken0

  const { account, provider } = useWeb3React()

  const handleAddPremium = useMemo(() => {
    return () => {
      if (!account) throw new Error('Wallet must be connected')
      if (!liquidityManager) throw new Error('Liquidity Manager must be connected')
      if (!provider) throw new Error('Provider must be connected')
      if (!tradeInfo || !inputCurrency || !outputCurrency) throw new Error('Trade info must be valid')

      setAttemptingTxn(true)

      liquidityManager
        .payPremium(trader, true, position?.isToken0)
        .then((hash: any) => {
          addTransaction(hash, {
            type: TransactionType.PREMIUM_BORROW,
            inputCurrencyId: currencyId(inputCurrency),
            outputCurrencyId: currencyId(outputCurrency),
          })
          setAttemptingTxn(false)
          setTxHash(hash)
          console.log('add premium hash: ', hash)
        })
        .catch((err: any) => {
          setAttemptingTxn(false)
          console.log('error adding premium: ', err)
        })
    }
  }, [
    account,
    addTransaction,
    inputCurrency,
    outputCurrency,
    tradeInfo,
    liquidityManager,
    provider,
    position,
    setTxHash,
    setAttemptingTxn,
    trader,
  ])

  // const outputCurrency = useCurrency(position?.isToken0 ? position?.token1Address : position?.token0Address)

  const updateAllowance = useCallback(async () => {
    try {
      await approveManager()
    } catch (err) {
      console.log('approveLeverageManager err: ', err)
    }
  }, [approveManager]) // add input to deps.

  const loading = derivedState === DerivedInfoState.LOADING

  const premiumSymbol = inputIsToken0 ? token1?.symbol : token0?.symbol

  useEffect(() => {
    ;(!tradeInfo || !!inputError || approvalState !== ApprovalState.APPROVED) && showDetails && setShowDetails(false)
  }, [tradeInfo, inputError, approvalState, showDetails])
  const disabled = !tradeInfo || !!inputError || approvalState !== ApprovalState.APPROVED

  return (
    <AutoRow>
      <ValueLabel
        label="Premium Payment"
        description="Premium Payment Amount"
        value={formatBNToString(premium)}
        syncing={false}
        symbolAppend={position?.isToken0 ? token1?.symbol : token0?.symbol}
      />
      <TransactionDetails>
        <Wrapper style={{ marginTop: '0' }}>
          <AutoColumn gap="sm" style={{ width: '100%', marginBottom: '-8px' }}>
            <StyledHeaderRow
              onClick={() => {
                if (disabled) {
                  return
                }
                setShowDetails(!showDetails)
              }}
              disabled={disabled}
              open={showDetails}
            >
              <RowFixed style={{ position: 'relative' }}>
                {loading ? (
                  <StyledPolling>
                    <StyledPollingDot>
                      <Spinner />
                    </StyledPollingDot>
                  </StyledPolling>
                ) : (
                  <HideSmall>
                    <StyledInfoIcon color={theme.textTertiary} />
                  </HideSmall>
                )}
                {liquidityManagerAddress ? (
                  loading || positionLoading ? (
                    <ThemedText.DeprecatedMain fontSize={14}>
                      <Trans>Fetching expected payment...</Trans>
                    </ThemedText.DeprecatedMain>
                  ) : (
                    <LoadingOpacityContainer $loading={loading || positionLoading}>
                      Premium Payment Details
                    </LoadingOpacityContainer>
                  )
                ) : null}
              </RowFixed>
              <RowFixed>
                <RotatingArrow stroke={theme.textTertiary} open={Boolean(showDetails)} />
              </RowFixed>
            </StyledHeaderRow>
            <AnimatedDropdown open={showDetails}>
              <AutoColumn gap="sm">
                <RowBetween>
                  <RowFixed>
                    <MouseoverTooltip text={<Trans>Expected Total Premium</Trans>}>
                      <ThemedText.DeprecatedSubHeader color={theme.textPrimary}>
                        <Trans>Premium To Pay</Trans>
                      </ThemedText.DeprecatedSubHeader>
                    </MouseoverTooltip>
                  </RowFixed>
                  <TextWithLoadingPlaceholder syncing={loading || positionLoading} width={65}>
                    <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                      {`${tradeInfo ? new BN(tradeInfo.totalPremium).toString() : '-'}` + outputCurrency?.symbol}
                    </ThemedText.DeprecatedBlack>
                  </TextWithLoadingPlaceholder>
                </RowBetween>
                <RowBetween>
                  <RowFixed>
                    <MouseoverTooltip text={<Trans>Expected Remaining Premium</Trans>}>
                      <ThemedText.DeprecatedSubHeader color={theme.textPrimary}>
                        <Trans>Returned Premium</Trans>
                      </ThemedText.DeprecatedSubHeader>
                    </MouseoverTooltip>
                  </RowFixed>
                  <TextWithLoadingPlaceholder syncing={loading || positionLoading} width={65}>
                    <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                      {`${tradeInfo ? new BN(tradeInfo.remainingPremium).toString() : '-'}` + outputCurrency?.symbol}
                    </ThemedText.DeprecatedBlack>
                  </TextWithLoadingPlaceholder>
                </RowBetween>
              </AutoColumn>
            </AnimatedDropdown>
          </AutoColumn>
        </Wrapper>
      </TransactionDetails>
      {approvalState !== ApprovalState.APPROVED ? (
        <ButtonPrimary
          onClick={updateAllowance}
          disabled={!!inputError || approvalState === ApprovalState.PENDING}
          style={{ gap: 14 }}
        >
          {inputError ? (
            <Trans>{inputError}</Trans>
          ) : approvalState === ApprovalState.PENDING ? (
            <>
              <Loader size="20px" />
              <Trans>Approve pending</Trans>
            </>
          ) : (
            <>
              <MouseoverTooltip
                text={
                  <Trans>
                    Permission is required for Limitless to use each token.{' '}
                    {premium && premiumSymbol ? `Allowance of ${premium} ${premiumSymbol} required.` : null}
                  </Trans>
                }
              >
                <RowBetween>
                  <Info size={20} />
                  <Trans>Approve use of {premiumSymbol}</Trans>
                </RowBetween>
              </MouseoverTooltip>
            </>
          )}
        </ButtonPrimary>
      ) : (
        <ButtonError
          onClick={handleAddPremium}
          disabled={!!inputError || !tradeInfo}
          style={{ margin: '10px 0 0 0' }}
          id={InterfaceElementName.CONFIRM_SWAP_BUTTON}
        >
          {inputError ? (
            inputError
          ) : tradeInfo ? (
            <Text fontSize={20} fontWeight={500}>
              <Trans>Add Premium</Trans>
            </Text>
          ) : (
            <Text fontSize={20} fontWeight={500}>
              <Trans>Invalid</Trans>
            </Text>
          )}
        </ButtonError>
      )}
    </AutoRow>
  )
}

export function LeverageModalFooter({
  trade,
  allowedSlippage,
  hash,
  onConfirm,
  swapErrorMessage,
  disabledConfirm,
  swapQuoteReceivedDate,
  fiatValueInput,
  fiatValueOutput,
}: {
  trade: InterfaceTrade<Currency, Currency, TradeType>
  hash: string | undefined
  allowedSlippage: Percent
  onConfirm: () => void
  swapErrorMessage: ReactNode | undefined
  disabledConfirm: boolean
  swapQuoteReceivedDate: Date | undefined
  fiatValueInput: { data?: number; isLoading: boolean }
  fiatValueOutput: { data?: number; isLoading: boolean }
}) {
  const transactionDeadlineSecondsSinceEpoch = useTransactionDeadline()?.toNumber() // in seconds since epoch
  const isAutoSlippage = useUserSlippageTolerance()[0] === 'auto'
  const [clientSideRouter] = useClientSideRouter()
  const routes = getTokenPath(trade)
  // console.log("disabledConfirm", disabledConfirm)
  return (
    <>
      <AutoRow>
        <TraceEvent
          events={[BrowserEvent.onClick]}
          element={InterfaceElementName.CONFIRM_SWAP_BUTTON}
          name={SwapEventName.SWAP_SUBMITTED_BUTTON_CLICKED}
          properties={formatAnalyticsEventProperties({
            trade,
            hash,
            allowedSlippage,
            transactionDeadlineSecondsSinceEpoch,
            isAutoSlippage,
            isAutoRouterApi: !clientSideRouter,
            swapQuoteReceivedDate,
            routes,
            fiatValueInput: fiatValueInput.data,
            fiatValueOutput: fiatValueOutput.data,
          })}
        >
          <ButtonError
            onClick={onConfirm}
            disabled={disabledConfirm}
            style={{ margin: '10px 0 0 0' }}
            id={InterfaceElementName.CONFIRM_SWAP_BUTTON}
          >
            <Text fontSize={20} fontWeight={500}>
              <Trans>Confirm Position</Trans>
            </Text>
          </ButtonError>
        </TraceEvent>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}

export function BorrowModalFooter({
  borrowTrade,
  // allowedSlippage,
  // hash,
  onConfirm,
  errorMessage,
  disabledConfirm,
}: {
  borrowTrade: BorrowCreationDetails | undefined
  // hash: string | undefined
  // allowedSlippage: Percent
  onConfirm: () => void
  errorMessage: ReactNode | undefined
  disabledConfirm: boolean
}) {
  return (
    <>
      <AutoRow>
        <ButtonError
          onClick={onConfirm}
          disabled={disabledConfirm}
          style={{ margin: '10px 0 0 0' }}
          id={InterfaceElementName.CONFIRM_SWAP_BUTTON}
        >
          <Text fontSize={20} fontWeight={500}>
            <Trans>Confirm Borrow</Trans>
          </Text>
        </ButtonError>

        {errorMessage ? <SwapCallbackError error={errorMessage} /> : null}
      </AutoRow>
    </>
  )
}

export function BorrowReduceCollateralModalFooter({
  tokenId,
  trader,
  setAttemptingTxn,
  setTxHash,
}: {
  tokenId: string | undefined
  trader: string | undefined
  setAttemptingTxn: (attemptingTxn: boolean) => void
  setTxHash: (txHash: string) => void
}) {
  // const [nonce, setNonce] = useState(0)
  const { error, position } = useLimitlessPositionFromTokenId(tokenId)

  const [recieveCollateral, setRecieveCollateral] = useState(true)
  // const [newPosition, setNewPosition] = useState("")
  const [reduceAmount, setReduceAmount] = useState('')

  const borrowManagerContract = useBorrowManagerContract(position?.borrowManagerAddress, true)
  const addTransaction = useTransactionAdder()

  const token0 = useCurrency(position?.token0Address)
  const token1 = useCurrency(position?.token1Address)
  const inputIsToken0 = position?.isToken0

  const { account, provider } = useWeb3React()
  const [derivedState, setDerivedState] = useState<DerivedInfoState>(DerivedInfoState.INVALID)
  const [showDetails, setShowDetails] = useState(false)
  const theme = useTheme()

  // what do we need for the simulation

  const [debouncedReduceAmount, setDebouncedReduceAmount] = useDebouncedChangeHandler(reduceAmount, setReduceAmount)

  const { transactionInfo, userError } = useDerivedBorrowReduceCollateralInfo(
    trader,
    tokenId,
    position,
    debouncedReduceAmount,
    recieveCollateral,
    setDerivedState
  )

  const handleReducePosition = useMemo(() => {
    return () => {
      if (!account) throw new Error('Wallet must be connected')
      if (!provider) throw new Error('Provider must be connected')
      if (!borrowManagerContract) throw new Error('Borrow Manager Contract must be connected')
      if (!position) throw new Error('Position must be connected')
      if (!token0 || !token1) throw new Error('Tokens must be connected')
      if (!transactionInfo) throw new Error('Transaction Info must be connected')
      if (!reduceAmount) return null
      const formattedReduceAmount = new BN(reduceAmount).shiftedBy(18).toFixed(0)

      setAttemptingTxn(true)
      return borrowManagerContract
        .reduceBorrowPosition(position?.isToken0, true, recieveCollateral, formattedReduceAmount)
        .then((hash: any) => {
          addTransaction(hash, {
            type: TransactionType.REDUCE_BORROW_COLLATERAL,
            reduceAmount: Number(reduceAmount),
            inputCurrencyId: inputIsToken0 ? currencyId(token1) : currencyId(token0),
            outputCurrencyId: !inputIsToken0 ? currencyId(token1) : currencyId(token0),
            newExpectedCollateral: position.initialCollateral.minus(reduceAmount).toNumber(),
            recieveCollateral,
            expectedReturnedAmount: transactionInfo.returnedAmount,
          })

          setTxHash(hash)
          setAttemptingTxn(false)
        })
        .catch((err: any) => {
          setAttemptingTxn(false)
          console.log('error closing position: ', err)
        })
    }
  }, [
    recieveCollateral,
    position,
    reduceAmount,
    borrowManagerContract,
    addTransaction,
    inputIsToken0,
    setAttemptingTxn,
    setTxHash,
    token0,
    token1,
    transactionInfo,
    account,
    provider,
  ])

  const loading = useMemo(() => derivedState === DerivedInfoState.LOADING, [derivedState])
  // console.log("here: ", token0Amount, token1Amount

  const debt = position?.totalDebtInput

  useEffect(() => {
    ;(!transactionInfo || !!userError) && showDetails && setShowDetails(false)
  }, [transactionInfo, userError, showDetails])

  const disabled = !transactionInfo || !!userError

  console.log('lmt', position?.initialCollateral, reduceAmount)
  // const initCollateral = position?.initialCollateral;
  // const received = inputIsToken0 ? (Math.abs(Number(token0Amount)) - Number(debt))
  //   : (Math.abs(Number(token1Amount)) - Number(debt))

  return (
    <AutoRow>
      <DarkCard marginTop="5px" padding="5px">
        <AutoColumn gap="4px">
          <RowBetween>
            <ThemedText.DeprecatedMain fontWeight={400}>
              <Trans>Recieve Collateral</Trans>
            </ThemedText.DeprecatedMain>
            <Checkbox
              hovered={false}
              checked={recieveCollateral}
              onClick={() => {
                setRecieveCollateral(!recieveCollateral)
              }}
            >
              <div></div>
            </Checkbox>
          </RowBetween>
        </AutoColumn>
      </DarkCard>
      <DarkCard padding="5px">
        <AutoColumn gap="md">
          <>
            <RowBetween>
              <ThemedText.DeprecatedMain fontWeight={400}>
                <Trans>
                  Collateral Reduce Amount (
                  {`${
                    position?.initialCollateral && reduceAmount !== ''
                      ? formatBNToString(new BN(reduceAmount).div(position.initialCollateral).times(100))
                      : '0'
                  }% Reduction`}
                  )
                </Trans>
              </ThemedText.DeprecatedMain>
            </RowBetween>
            <AutoColumn>
              <CurrencyInputPanel
                value={debouncedReduceAmount}
                id="reduce-position-input"
                onUserInput={(str: string) => {
                  if (position?.initialCollateral) {
                    if (str === '') {
                      setDebouncedReduceAmount('')
                    } else if (new BN(str).isGreaterThan(new BN(position?.initialCollateral))) {
                      return
                    } else {
                      setDebouncedReduceAmount(str)
                    }
                  }
                }}
                showMaxButton={true}
                onMax={() => {
                  setDebouncedReduceAmount(position?.initialCollateral ? position?.initialCollateral.toString(10) : '')
                }}
                hideBalance={true}
                currency={inputIsToken0 ? token0 : token1}
              />
            </AutoColumn>
          </>
        </AutoColumn>
      </DarkCard>
      <TransactionDetails>
        <Wrapper style={{ marginTop: '0' }}>
          <AutoColumn gap="sm" style={{ width: '100%', marginBottom: '-8px' }}>
            <StyledHeaderRow
              onClick={() => !disabled && setShowDetails(!showDetails)}
              disabled={disabled}
              open={showDetails}
            >
              <RowFixed style={{ position: 'relative' }}>
                {loading ? (
                  <StyledPolling>
                    <StyledPollingDot>
                      <Spinner />
                    </StyledPollingDot>
                  </StyledPolling>
                ) : (
                  <HideSmall>
                    <StyledInfoIcon color={theme.deprecated_bg3} />
                  </HideSmall>
                )}
                {position?.borrowManagerAddress ? (
                  loading ? (
                    <ThemedText.DeprecatedMain fontSize={14}>
                      <Trans>Fetching returns...</Trans>
                    </ThemedText.DeprecatedMain>
                  ) : (
                    <LoadingOpacityContainer $loading={loading}>Trade Details</LoadingOpacityContainer>
                  )
                ) : null}
              </RowFixed>
              <RowFixed>
                <RotatingArrow
                  stroke={position?.token0Address ? theme.textTertiary : theme.deprecated_bg3}
                  open={Boolean(position?.token0Address && showDetails)}
                />
              </RowFixed>
            </StyledHeaderRow>
            <AnimatedDropdown open={showDetails}>
              <AutoColumn gap="sm" style={{ padding: '0', paddingBottom: '8px' }}>
                {!loading && transactionInfo ? (
                  <StyledCard>
                    <AutoColumn gap="sm">
                      <RowBetween>
                        <RowFixed>
                          <MouseoverTooltip text={<Trans>The amount of position you are closing</Trans>}>
                            <ThemedText.DeprecatedSubHeader color={theme.textPrimary}>
                              <Trans>Position to close</Trans>
                            </ThemedText.DeprecatedSubHeader>
                          </MouseoverTooltip>
                        </RowFixed>
                        <TextWithLoadingPlaceholder syncing={loading} width={65}>
                          <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                            <TruncatedText>
                              {`${
                                inputIsToken0
                                  ? new BN(transactionInfo.token1Amount).abs().toString()
                                  : new BN(transactionInfo.token0Amount).abs().toString()
                              }  ${inputIsToken0 ? token1?.symbol : token0?.symbol}`}
                            </TruncatedText>
                          </ThemedText.DeprecatedBlack>
                        </TextWithLoadingPlaceholder>
                      </RowBetween>
                      <Separator />
                      <RowBetween>
                        <RowFixed>
                          <MouseoverTooltip
                            text={
                              <Trans>
                                The amount entire position swaps to at the current market price. May receive less or
                                more if the market price changes while your transaction is pending.
                              </Trans>
                            }
                          >
                            <ThemedText.DeprecatedSubHeader color={theme.textPrimary}>
                              <Trans>Output</Trans>
                            </ThemedText.DeprecatedSubHeader>
                          </MouseoverTooltip>
                        </RowFixed>
                        <TextWithLoadingPlaceholder syncing={loading} width={65}>
                          <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                            <TruncatedText>
                              {`${
                                inputIsToken0
                                  ? new BN(transactionInfo.token0Amount).abs().toString()
                                  : new BN(transactionInfo.token1Amount).abs().toString()
                              }  ${inputIsToken0 ? token0?.symbol : token1?.symbol}`}
                            </TruncatedText>
                          </ThemedText.DeprecatedBlack>
                        </TextWithLoadingPlaceholder>
                      </RowBetween>
                      <RowBetween>
                        <RowFixed>
                          <MouseoverTooltip text={<Trans>The amount of debt automatically repaid when closing</Trans>}>
                            <ThemedText.DeprecatedSubHeader color={theme.textPrimary}>
                              <Trans>Premium Returned</Trans>
                            </ThemedText.DeprecatedSubHeader>
                          </MouseoverTooltip>
                        </RowFixed>
                        <TextWithLoadingPlaceholder syncing={loading} width={65}>
                          <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                            <TruncatedText>
                              {`${Number(transactionInfo.unusedPremium)}  ${
                                inputIsToken0 ? token1?.symbol : token0?.symbol
                              }`}
                            </TruncatedText>
                          </ThemedText.DeprecatedBlack>
                        </TextWithLoadingPlaceholder>
                      </RowBetween>
                      <RowBetween>
                        <RowFixed>
                          <MouseoverTooltip text={<Trans>The amount of debt automatically repaid when closing</Trans>}>
                            <ThemedText.DeprecatedSubHeader color={theme.textPrimary}>
                              <Trans>Premium To Pay</Trans>
                            </ThemedText.DeprecatedSubHeader>
                          </MouseoverTooltip>
                        </RowFixed>
                        <TextWithLoadingPlaceholder syncing={loading} width={65}>
                          <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                            <TruncatedText>
                              {`${Number(transactionInfo.premium)}  ${inputIsToken0 ? token0?.symbol : token1?.symbol}`}
                            </TruncatedText>
                          </ThemedText.DeprecatedBlack>
                        </TextWithLoadingPlaceholder>
                      </RowBetween>
                      <RowBetween>
                        <RowFixed>
                          <MouseoverTooltip text={<Trans>Expected PnL from what you originally paid</Trans>}>
                            <ThemedText.DeprecatedSubHeader color={theme.textPrimary}>
                              <Trans>Expected PnL</Trans>
                            </ThemedText.DeprecatedSubHeader>
                          </MouseoverTooltip>
                        </RowFixed>
                        <TextWithLoadingPlaceholder syncing={loading} width={65}>
                          <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                            <TruncatedText>
                              {`${Number(transactionInfo.pnl)}  ${inputIsToken0 ? token0?.symbol : token1?.symbol}`}
                            </TruncatedText>
                          </ThemedText.DeprecatedBlack>
                        </TextWithLoadingPlaceholder>
                      </RowBetween>
                    </AutoColumn>
                  </StyledCard>
                ) : null}
              </AutoColumn>
            </AnimatedDropdown>
          </AutoColumn>
        </Wrapper>
      </TransactionDetails>

      <ButtonError
        onClick={handleReducePosition}
        disabled={!!userError || !transactionInfo}
        style={{ margin: '10px 0 0 0' }}
        id={InterfaceElementName.CONFIRM_SWAP_BUTTON}
      >
        {userError ? (
          userError
        ) : transactionInfo ? (
          <Text fontSize={20} fontWeight={500}>
            <Trans>Reduce Position</Trans>
          </Text>
        ) : (
          <Text fontSize={20} fontWeight={500}>
            <Trans>Invalid</Trans>
          </Text>
        )}
      </ButtonError>
    </AutoRow>
  )
}

export function BorrowReduceDebtModalFooter({
  tokenId,
  trader,
  setAttemptingTxn,
  setTxHash,
}: {
  tokenId: string | undefined
  trader: string | undefined
  setAttemptingTxn: (attemptingTxn: boolean) => void
  setTxHash: (txHash: string) => void
}) {
  // const [nonce, setNonce] = useState(0)
  const { error, position } = useLimitlessPositionFromTokenId(tokenId)

  const [recieveCollateral, setRecieveCollateral] = useState(true)
  // const [newPosition, setNewPosition] = useState("")
  const [reduceAmount, setReduceAmount] = useState('')

  const borrowManagerContract = useBorrowManagerContract(position?.borrowManagerAddress, true)
  const addTransaction = useTransactionAdder()

  const token0 = useCurrency(position?.token0Address)
  const token1 = useCurrency(position?.token1Address)
  const inputIsToken0 = position?.isToken0

  const { account, provider } = useWeb3React()

  const [derivedState, setDerivedState] = useState<DerivedInfoState>(DerivedInfoState.INVALID)
  const [showDetails, setShowDetails] = useState(false)
  const theme = useTheme()

  const [debouncedReduceAmount, setDebouncedReduceAmount] = useDebouncedChangeHandler(reduceAmount, setReduceAmount)

  const { transactionInfo, userError } = useDerivedBorrowReduceDebtInfo(
    trader,
    tokenId,
    position,
    debouncedReduceAmount,
    recieveCollateral,
    setDerivedState
  )

  const handleReducePosition = useMemo(() => {
    return () => {
      if (!account) throw new Error('Wallet must be connected')
      if (!provider) throw new Error('Provider must be connected')
      if (!borrowManagerContract) throw new Error('BorrowManagerContract must be connected')
      if (!transactionInfo) throw new Error('Transaction invalid')
      if (!position || !token0 || !token1) return null

      const formattedReduceAmount = new BN(reduceAmount).shiftedBy(DEFAULT_ERC20_DECIMALS).toFixed(0)

      setAttemptingTxn(true)

      return borrowManagerContract
        .reduceBorrowPosition(position?.isToken0, false, recieveCollateral, formattedReduceAmount)
        .then((hash: any) => {
          addTransaction(hash, {
            type: TransactionType.REDUCE_BORROW_DEBT,
            inputCurrencyId: inputIsToken0 ? currencyId(token0) : currencyId(token1),
            outputCurrencyId: !inputIsToken0 ? currencyId(token0) : currencyId(token1),
            reduceAmount: Number(reduceAmount),
            recieveCollateral,
            newTotalPosition: position.totalDebtInput.minus(reduceAmount).toNumber(),
            expectedReturnedAmount: transactionInfo.returnedAmount,
          })
          setTxHash(hash)
          setAttemptingTxn(false)
        })
        .catch((err: any) => {
          setAttemptingTxn(false)
          console.log('error closing position: ', err)
        })
    }
  }, [
    recieveCollateral,
    borrowManagerContract,
    addTransaction,
    inputIsToken0,
    setTxHash,
    setAttemptingTxn,
    position,
    reduceAmount,
    token0,
    token1,
    account,
    provider,
    transactionInfo,
  ])

  // console.log('debt', position?.totalDebtInput.toString(10), reduceAmount)

  const loading = useMemo(() => derivedState === DerivedInfoState.LOADING, [derivedState])

  return (
    <AutoRow>
      <DarkCard marginTop="5px" padding="5px">
        <AutoColumn gap="4px">
          <RowBetween>
            <ThemedText.DeprecatedMain fontWeight={400}>
              <Trans>Recieve Collateral</Trans>
            </ThemedText.DeprecatedMain>
            <Checkbox
              hovered={false}
              checked={recieveCollateral}
              onClick={() => {
                setRecieveCollateral(!recieveCollateral)
              }}
            >
              <div></div>
            </Checkbox>
          </RowBetween>
        </AutoColumn>
      </DarkCard>
      <DarkCard padding="5px">
        <AutoColumn gap="md">
          <>
            <RowBetween>
              <ThemedText.DeprecatedMain fontWeight={400}>
                <Trans>
                  Debt Reduce Amount (
                  {`${
                    position?.totalDebtInput && reduceAmount !== ''
                      ? formatBNToString(new BN(reduceAmount).div(position?.totalDebtInput).times(100))
                      : '0'
                  }% Reduction`}
                  )
                </Trans>
              </ThemedText.DeprecatedMain>
            </RowBetween>
            <AutoColumn>
              <CurrencyInputPanel
                value={debouncedReduceAmount}
                id="reduce-position-input"
                onUserInput={(str: string) => {
                  if (position?.totalDebtInput) {
                    if (str === '') {
                      setDebouncedReduceAmount('')
                    } else if (new BN(str).isGreaterThan(new BN(position?.totalDebtInput))) {
                      return
                    } else {
                      setDebouncedReduceAmount(str)
                    }
                  }
                }}
                showMaxButton={true}
                onMax={() => {
                  setDebouncedReduceAmount(position?.totalDebtInput ? position?.totalDebtInput.toString(10) : '')
                }}
                hideBalance={true}
                currency={!inputIsToken0 ? token0 : token1}
              />
            </AutoColumn>
          </>
        </AutoColumn>
      </DarkCard>
      <TransactionDetails>
        <Wrapper style={{ marginTop: '0' }}>
          <AutoColumn gap="sm" style={{ width: '100%', marginBottom: '-8px' }}>
            <StyledHeaderRow onClick={() => setShowDetails(!showDetails)} disabled={false} open={showDetails}>
              <RowFixed style={{ position: 'relative' }}>
                {loading ? (
                  <StyledPolling>
                    <StyledPollingDot>
                      <Spinner />
                    </StyledPollingDot>
                  </StyledPolling>
                ) : (
                  <HideSmall>
                    <StyledInfoIcon color={theme.deprecated_bg3} />
                  </HideSmall>
                )}
                {position?.borrowManagerAddress ? (
                  loading ? (
                    <ThemedText.DeprecatedMain fontSize={14}>
                      <Trans>Fetching details...</Trans>
                    </ThemedText.DeprecatedMain>
                  ) : (
                    <LoadingOpacityContainer $loading={loading}>Trade Details</LoadingOpacityContainer>
                  )
                ) : null}
              </RowFixed>
              <RowFixed>
                <RotatingArrow
                  stroke={position?.token0Address ? theme.textTertiary : theme.deprecated_bg3}
                  open={Boolean(position?.token0Address && showDetails)}
                />
              </RowFixed>
            </StyledHeaderRow>
            <AnimatedDropdown open={showDetails}>
              <AutoColumn gap="sm" style={{ padding: '0', paddingBottom: '8px' }}>
                {!loading && transactionInfo ? (
                  <StyledCard>
                    <AutoColumn gap="sm">
                      <RowBetween>
                        <RowFixed>
                          <MouseoverTooltip text={<Trans>Amount of Collateral Returned</Trans>}>
                            <ThemedText.DeprecatedSubHeader color={theme.textPrimary}>
                              <Trans>Collateral Returned</Trans>
                            </ThemedText.DeprecatedSubHeader>
                          </MouseoverTooltip>
                        </RowFixed>
                        <TextWithLoadingPlaceholder syncing={loading} width={65}>
                          <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                            <TruncatedText>
                              {transactionInfo &&
                                `${Number(transactionInfo?.returnedAmount)}  ${
                                  inputIsToken0 ? token0?.symbol : token1?.symbol
                                }`}
                            </TruncatedText>
                          </ThemedText.DeprecatedBlack>
                        </TextWithLoadingPlaceholder>
                      </RowBetween>
                      <RowBetween>
                        <RowFixed>
                          <MouseoverTooltip text={<Trans>The amount of premiums returned</Trans>}>
                            <ThemedText.DeprecatedSubHeader color={theme.textPrimary}>
                              <Trans>Premium Returned</Trans>
                            </ThemedText.DeprecatedSubHeader>
                          </MouseoverTooltip>
                        </RowFixed>
                        <TextWithLoadingPlaceholder syncing={loading} width={65}>
                          <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                            <TruncatedText>
                              {transactionInfo &&
                                `${Number(transactionInfo?.unusedPremium)}  ${
                                  inputIsToken0 ? token1?.symbol : token0?.symbol
                                }`}
                            </TruncatedText>
                          </ThemedText.DeprecatedBlack>
                        </TextWithLoadingPlaceholder>
                      </RowBetween>
                    </AutoColumn>
                  </StyledCard>
                ) : null}
              </AutoColumn>
            </AnimatedDropdown>
          </AutoColumn>
        </Wrapper>
      </TransactionDetails>
      <ButtonError
        onClick={handleReducePosition}
        disabled={!!userError || !transactionInfo}
        style={{ margin: '10px 0 0 0' }}
        id={InterfaceElementName.CONFIRM_SWAP_BUTTON}
      >
        {userError ? (
          userError
        ) : transactionInfo ? (
          <Text fontSize={20} fontWeight={500}>
            <Trans>Reduce Position</Trans>
          </Text>
        ) : (
          <Text fontSize={20} fontWeight={500}>
            <Trans>Invalid</Trans>
          </Text>
        )}
      </ButtonError>
    </AutoRow>
  )
}
