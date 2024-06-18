import { Trans } from '@lingui/macro'
import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, SwapEventName } from '@uniswap/analytics-events'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { BigNumber as BN } from 'bignumber.js'
import { OutlineCard } from 'components/Card'
import { LoadingRows } from 'components/Loader/styled'
import { DEFAULT_ERC20_DECIMALS } from 'constants/tokens'
import { useCurrency } from 'hooks/Tokens'
import { useBorrowManagerContract } from 'hooks/useContract'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { convertBNToNum } from 'hooks/useV3Positions'
import { useCurrencyBalances } from 'lib/hooks/useCurrencyBalance'
import { formatPercentNumber, getTokenAddress } from 'lib/utils/analytics'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { ChevronDown, Info } from 'react-feather'
import { Text } from 'rebass'
import { AddMarginTrade } from 'state/marginTrading/hooks'
import { InterfaceTrade } from 'state/routing/types'
import { BorrowCreationDetails } from 'state/swap/hooks'
import { useClientSideRouter, useUserSlippageTolerance } from 'state/user/hooks'
import styled, { keyframes } from 'styled-components/macro'
import { LimitlessPositionDetails } from 'types/leveragePosition'
import { useAccount } from 'wagmi'

import { ButtonError } from '../Button'
import Row, { AutoRow, RowBetween } from '../Row'
import { SwapCallbackError } from './styleds'
import { getTokenPath, RoutingDiagramEntry } from './SwapRoute'

// const StyledNumericalInput = styled(NumericalInput)`
//   width: 70%;
//   text-align: left;
//   padding: 10px;
//   background-color: ${({ theme }) => theme.backgroundFloating};
//   border-radius: 10px;
//   font-size: 20px;
// `

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

enum DerivedInfoState {
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
  const account = useAccount().address

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

export function LeverageModalFooter({
  // trade,
  // allowedSlippage,
  // hash,
  onConfirm,
  // swapErrorMessage,
  disabledConfirm,
  tradeErrorMessage,
}: // swapQuoteReceivedDate,
// fiatValueInput,
// fiatValueOutput,
{
  // trade: InterfaceTrade<Currency, Currency, TradeType>
  trade: AddMarginTrade
  hash: string | undefined
  allowedSlippage: Percent
  onConfirm: () => void
  // swapErrorMessage: ReactNode | undefined
  tradeErrorMessage: ReactNode | undefined
  disabledConfirm: boolean
  // swapQuoteReceivedDate: Date | undefined
  // fiatValueInput: { data?: number; isLoading: boolean }
  // fiatValueOutput: { data?: number; isLoading: boolean }
}) {
  // const transactionDeadlineSecondsSinceEpoch = useTransactionDeadline()?.toNumber() // in seconds since epoch
  // const isAutoSlippage = useUserSlippageTolerance()[0] === 'auto'
  // const [clientSideRouter] = useClientSideRouter()
  // const routes = getTokenPath(trade)
  // console.log("disabledConfirm", disabledConfirm)
  return (
    <>
      <AutoRow justify="center">
        <ButtonError
          onClick={onConfirm}
          disabled={disabledConfirm}
          style={{ margin: '10px 0 0 0', width: 'fit-content', borderRadius: '10px' }}
          id={InterfaceElementName.CONFIRM_SWAP_BUTTON}
        >
          <Text fontSize={14} fontWeight={500}>
            <Trans>Confirm Position</Trans>
          </Text>
        </ButtonError>
        {tradeErrorMessage ? <SwapCallbackError error={tradeErrorMessage} /> : null}
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
