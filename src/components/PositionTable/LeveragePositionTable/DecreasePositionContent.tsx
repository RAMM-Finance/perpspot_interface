import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import { Button } from '@mui/material'
import { NumberType } from '@uniswap/conedison/format'
import { Currency, Percent, Price } from '@uniswap/sdk-core'
import { computePoolAddress, Pool, priceToClosestTick } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import AnimatedDropdown from 'components/AnimatedDropdown'
import CurrencyInputPanel from 'components/BaseSwapPanel'
import { ButtonError } from 'components/Button'
import { DarkCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import HoverInlineText, { TextWrapper } from 'components/HoverInlineText'
import { LoadingOpacityContainer } from 'components/Loader/styled'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import {
  RotatingArrow,
  Spinner,
  StyledCard,
  StyledInfoIcon,
  StyledPolling,
  StyledPollingDot,
  TextWithLoadingPlaceholder,
  TransactionDetails,
} from 'components/modalFooters/common'
import { RowStart } from 'components/Row'
import { RowBetween, RowFixed } from 'components/Row'
import { LmtSettingsTab } from 'components/Settings'
import { PercentSlider } from 'components/Slider/MUISlider'
import { ValueLabel } from 'components/swap/AdvancedSwapDetails'
import { TruncatedText } from 'components/swap/styleds'
import { ToggleElement, ToggleWrapper } from 'components/Toggle/MultiToggle'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { MouseoverTooltip } from 'components/Tooltip'
import { LMT_MARGIN_FACILITY, V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { ethers } from 'ethers'
import { useCurrency } from 'hooks/Tokens'
import { useMarginFacilityContract } from 'hooks/useContract'
import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
import { useMarginLMTPositionFromPositionId } from 'hooks/useLMTV2Positions'
import { usePool } from 'hooks/usePools'
import useTransactionDeadline, { useLimitTransactionDeadline } from 'hooks/useTransactionDeadline'
import JSBI from 'jsbi'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { StyledNumericalInput } from 'pages/Swap'
import { DynamicSection } from 'pages/Swap/tradeModal'
import { PriceToggleSection } from 'pages/Swap/tradeModal'
import { LimitInputPrice, LimitInputRow, LimitInputWrapper } from 'pages/Swap/tradeModal'
import { Filter, FilterWrapper, Selector, StyledSelectorText } from 'pages/Swap/tradeModal'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { parseBN } from 'state/marginTrading/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import { useUserSlippageTolerance, useUserSlippedTickTolerance } from 'state/user/hooks'
import { useTheme } from 'styled-components/macro'
import styled from 'styled-components/macro'
import { HideSmall, ThemedText } from 'theme'
import { MarginPositionDetails, TraderPositionKey } from 'types/lmtv2position'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { LimitOrderOptions, MarginFacilitySDK } from 'utils/lmtSDK/MarginFacility'
import { MulticallSDK } from 'utils/lmtSDK/multicall'

import { BaseFooter } from './DepositPremiumContent'
import ConfirmModifyPositionModal from './TransactionModal'

interface DerivedReducePositionInfo {
  PnL: BN
  returnedAmount: BN
  premium: BN
  profitFee: BN
}

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.backgroundSurface};
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`

const StyledHeaderRow = styled(RowBetween)<{ disabled: boolean; open: boolean }>`
  padding: 0;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? 'initial' : 'pointer')};
`

enum DerivedInfoState {
  LOADING,
  VALID,
  INVALID,
  SYNCING, // syncing means already loaded valid info, but updating to newest info
}

function useDerivedReducePositionInfo(
  reduceAmount: string,
  positionKey: TraderPositionKey,
  position: MarginPositionDetails | undefined,
  allowedSlippedTick: Percent,
  allowedSlippage: Percent,
  setState: (state: DerivedInfoState) => void,
  inputCurrency?: Currency,
  outputCurrency?: Currency
): {
  txnInfo: DerivedReducePositionInfo | undefined
  inputError: ReactNode | undefined
} {
  const marginFacility = useMarginFacilityContract()

  const [txnInfo, setTxnInfo] = useState<DerivedReducePositionInfo>()
  const [contractError, setContractError] = useState<React.ReactNode>()
  const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)

  const parsedReduceAmount = useMemo(() => parseBN(reduceAmount), [reduceAmount])

  useEffect(() => {
    const lagged = async () => {
      if (
        !marginFacility ||
        !position ||
        !parsedReduceAmount ||
        parsedReduceAmount.isLessThanOrEqualTo(0) ||
        !pool ||
        !inputCurrency ||
        !outputCurrency
      ) {
        setState(DerivedInfoState.INVALID)
        setTxnInfo(undefined)
        return
      }

      setState(DerivedInfoState.LOADING)

      try {
        const reducePercent = parsedReduceAmount.div(position.totalPosition).shiftedBy(18).toFixed(0)
        const { slippedTickMin, slippedTickMax } = getSlippedTicks(pool, allowedSlippedTick)
        const price = !position.isToken0 ? pool.token1Price.toFixed(18) : pool.token0Price.toFixed(18)

        const minOutput = new BN(100)
          .minus(new BN(allowedSlippage.toFixed(18)))
          .div(100)
          .times(parsedReduceAmount)
          .times(price)

        //   struct ReduceReturn {
        //     int256 amount0;
        //     int256 amount1;
        //     int256 PnL;
        //     uint256 returnedAmount;
        //     uint256 repaidDebt0;
        //     uint256 repaidDebt1;
        //     uint256 premium;
        //     uint256 profitFee;
        // }
        const reduceParam = {
          positionIsToken0: position.isToken0,
          reducePercentage: reducePercent,
          minOutput: minOutput.shiftedBy(outputCurrency.decimals).toFixed(0),
          trader: position.trader,
          executionOption: 1,
          executionData: ethers.constants.HashZero,
          slippedTickMin,
          slippedTickMax,
          reduceAmount: 0,
        }

        // console.log('simulation reduce param', reduceParam, positionKey.poolKey)

        const result = await marginFacility.callStatic.reducePosition(
          {
            token0: positionKey.poolKey.token0Address,
            token1: positionKey.poolKey.token1Address,
            fee: positionKey.poolKey.fee,
          },
          reduceParam
        )

        const info: DerivedReducePositionInfo = {
          PnL: new BN(result.PnL.toString()).shiftedBy(-inputCurrency.decimals),
          returnedAmount: new BN(result.returnedAmount.toString()).shiftedBy(-outputCurrency.decimals),
          premium: new BN(result.premium.toString()).shiftedBy(-inputCurrency.decimals),
          profitFee: new BN(result.profitFee.toString()).shiftedBy(-inputCurrency.decimals),
        }

        setTxnInfo(info)
        setState(DerivedInfoState.VALID)
        setContractError(undefined)
      } catch (err) {
        console.log('reduce error', err)
        setState(DerivedInfoState.INVALID)
        setContractError(err)
        setTxnInfo(undefined)
      }
    }

    lagged()
  }, [
    setState,
    pool,
    marginFacility,
    parsedReduceAmount,
    position,
    positionKey,
    inputCurrency,
    outputCurrency,
    allowedSlippage,
    allowedSlippedTick,
  ])

  const inputError = useMemo(() => {
    let error: React.ReactNode | undefined

    if (!parsedReduceAmount || parsedReduceAmount.isLessThanOrEqualTo(0)) {
      error = <Trans>Enter an amount</Trans>
    }

    return error
  }, [parsedReduceAmount])

  return useMemo(() => {
    return {
      txnInfo,
      inputError,
    }
  }, [txnInfo, inputError])
}

function useDerivedReduceLimitPositionInfo(
  reduceAmount: string,
  limitPrice: string,
  positionKey: TraderPositionKey,
  // position: MarginPositionDetails | undefined,
  // allowedSlippedTick: Percent,
  // allowedSlippage: Percent,
  baseCurrencyIsInput: boolean,
  setState: (state: DerivedInfoState) => void,
  inputCurrency?: Currency,
  outputCurrency?: Currency
): {
  // txnInfo: DerivedReducePositionInfo | undefined
  inputError: ReactNode | undefined
} {
  const [txnInfo, setTxnInfo] = useState<DerivedReducePositionInfo>()
  const [contractError, setContractError] = useState<React.ReactNode>()
  // const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)

  const parsedAmount = useMemo(() => parseBN(reduceAmount), [reduceAmount])
  const parsedLimitPrice = useMemo(() => parseBN(limitPrice), [limitPrice])
  const inputError = useMemo(() => {
    let error: React.ReactNode | undefined

    if (!parsedAmount || parsedAmount.isLessThanOrEqualTo(0)) {
      error = error ?? <Trans>Enter an amount</Trans>
    }

    if (!parsedLimitPrice || parsedLimitPrice.isLessThanOrEqualTo(0)) {
      error = error ?? <Trans>Enter a limit price</Trans>
    }
    return error
  }, [parsedAmount, parsedLimitPrice])
  const { chainId } = useWeb3React()

  const deadline = useLimitTransactionDeadline()
  const marginFacility = useMarginFacilityContract(true)

  useEffect(() => {
    const lagged = async () => {
      if (
        inputError ||
        !parsedAmount ||
        !parsedLimitPrice ||
        !chainId ||
        !inputCurrency ||
        !outputCurrency ||
        !deadline ||
        !marginFacility
      ) {
        setState(DerivedInfoState.INVALID)
        setTxnInfo(undefined)
        return
      }

      setState(DerivedInfoState.LOADING)

      try {
        const price = baseCurrencyIsInput ? new BN(1).div(parsedLimitPrice) : parsedLimitPrice

        const startOutput = parsedAmount.times(price).shiftedBy(outputCurrency.decimals).toFixed(0)
        const params: LimitOrderOptions = {
          orderKey: {
            poolKey: positionKey.poolKey,
            trader: positionKey.trader,
            isToken0: positionKey.isToken0,
            isAdd: false,
          },
          margin: '0',
          pool: computePoolAddress({
            factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
            tokenA: inputCurrency.wrapped,
            tokenB: outputCurrency.wrapped,
            fee: positionKey.poolKey.fee,
          }),
          deadline: deadline?.toString(),
          inputAmount: parsedAmount.shiftedBy(inputCurrency.decimals).toFixed(0),
          startOutput,
          minOutput: startOutput,
          decayRate: '0',
          isAdd: false,
        }

        const calldata = MarginFacilitySDK.submitLimitOrder(params)

        await marginFacility.callStatic.multicall(calldata)
        // setTxnInfo()
        setState(DerivedInfoState.VALID)
        setContractError(undefined)
      } catch (err) {
        console.log('reduce error', err)
        setState(DerivedInfoState.INVALID)
        setContractError(err)
        setTxnInfo(undefined)
      }
    }

    lagged()
  }, [
    inputError,
    setState,
    parsedAmount,
    parsedLimitPrice,
    chainId,
    inputCurrency,
    outputCurrency,
    deadline,
    marginFacility,
    baseCurrencyIsInput,
    positionKey,
  ])

  return useMemo(() => {
    return {
      inputError,
    }
  }, [inputError])
}

export default function DecreasePositionContent({ positionKey }: { positionKey: TraderPositionKey }) {
  // state inputs, derived, handlers for trade confirmation
  const [reduceAmount, setReduceAmount] = useState('')
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState<string>()
  const [showDetails, setShowDetails] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [tradeState, setTradeState] = useState<DerivedInfoState>(DerivedInfoState.INVALID)
  const [lmtTradeState, setLmtTradeState] = useState<DerivedInfoState>(DerivedInfoState.INVALID)
  const { position } = useMarginLMTPositionFromPositionId(positionKey)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [showSettings, setShowSettings] = useState(false)
  const [isLimit, setIsLimit] = useState(false)
  const [baseCurrencyIsInput, setBaseCurrencyIsInput] = useState(false)
  const [limitPrice, setLimitPrice] = useState<string>('')

  const inputCurrency = useCurrency(
    position?.isToken0 ? position?.poolKey?.token1Address : position?.poolKey.token0Address
  )
  const outputCurrency = useCurrency(
    position?.isToken0 ? position?.poolKey?.token0Address : position?.poolKey.token1Address
  )

  const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)

  const [userSlippageTolerance] = useUserSlippageTolerance()
  const [userSlippedTickTolerance] = useUserSlippedTickTolerance()

  const allowedSlippage = useMemo(() => {
    if (userSlippageTolerance === 'auto') return new Percent(JSBI.BigInt(3), JSBI.BigInt(100))
    else return userSlippageTolerance
  }, [userSlippageTolerance])

  const allowedSlippedTick = useMemo(() => {
    if (userSlippedTickTolerance === 'auto') return new Percent(JSBI.BigInt(3), JSBI.BigInt(100))
    else return userSlippedTickTolerance
  }, [userSlippedTickTolerance])

  const onToggle = useCallback(() => {
    setShowSettings(!showSettings)
  }, [showSettings])

  const { txnInfo, inputError } = useDerivedReducePositionInfo(
    reduceAmount,
    positionKey,
    position,
    allowedSlippedTick,
    allowedSlippage,
    setTradeState,
    inputCurrency ?? undefined,
    outputCurrency ?? undefined
  )

  const { inputError: lmtInputError } = useDerivedReduceLimitPositionInfo(
    reduceAmount,
    limitPrice,
    positionKey,
    baseCurrencyIsInput,
    setLmtTradeState,
    inputCurrency ?? undefined,
    outputCurrency ?? undefined
  )
  const { position: existingPosition, loading: positionLoading } = useMarginLMTPositionFromPositionId(positionKey)

  const positionExists = useMemo(() => {
    if (!positionLoading && existingPosition?.openTime === 0) {
      return false
    } else {
      return true
    }
  }, [existingPosition, positionLoading])

  // const reductionPercent = useMemo(() => {
  //   return position?.totalPosition && reduceAmount !== ''
  //     ? formatBNToString(new BN(reduceAmount).div(position?.totalPosition).times(100))
  //     : '0'
  // }, [position, reduceAmount])

  // const marginFacility = useMarginFacilityContract(true)

  const addTransaction = useTransactionAdder()

  // callback
  const { account, provider, chainId } = useWeb3React()

  const deadline = useTransactionDeadline()
  const callback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      if (!account) throw new Error('missing account')
      if (!chainId) throw new Error('missing chainId')
      if (!provider) throw new Error('missing provider')
      if (!txnInfo) throw new Error('missing txn info')
      // if (!marginFacility) throw new Error('missing marginFacility contract')
      if (!position) throw new Error('missing position')
      if (!pool || !outputCurrency || !inputCurrency) throw new Error('missing pool')
      if (tradeState !== DerivedInfoState.VALID) throw new Error('invalid trade state')
      if (!deadline) throw new Error('missing deadline')

      // get reduce parameters
      const reducePercent = new BN(reduceAmount).div(position.totalPosition).shiftedBy(18).toFixed(0)
      const { slippedTickMin, slippedTickMax } = getSlippedTicks(pool, allowedSlippedTick)
      const price = !position.isToken0 ? pool.token1Price.toFixed(18) : pool.token0Price.toFixed(18)

      const minOutput = new BN(reduceAmount)
        .times(price)
        .times(new BN(1).minus(new BN(allowedSlippage.toFixed(18)).div(100)))

      const reduceParam = {
        positionIsToken0: position.isToken0,
        reducePercentage: reducePercent,
        minOutput: minOutput.shiftedBy(outputCurrency.decimals).toFixed(0),
        trader: position.trader,
        executionOption: 1,
        executionData: ethers.constants.HashZero,
        slippedTickMin,
        slippedTickMax,
        reduceAmount: 0,
        deadline,
      }

      const { calldata } = MarginFacilitySDK.reducePositionParameters({
        positionKey,
        ...reduceParam,
      })

      const tx = {
        from: account,
        to: LMT_MARGIN_FACILITY[chainId],
        data: MulticallSDK.encodeMulticall(calldata),
      }

      let gasEstimate: BigNumber

      try {
        gasEstimate = await provider.estimateGas(tx)
      } catch (gasError) {
        console.log('gasError', gasError)
        throw new Error('gasError')
      }

      const gasLimit = calculateGasMargin(gasEstimate)

      const response = await provider
        .getSigner()
        .sendTransaction({ ...tx, gasLimit })
        .then((response) => {
          return response
        })
      return response
    } catch (err) {
      console.log('reduce callback error', err)
      throw new Error('reduce callback error')
    }
  }, [
    account,
    inputCurrency,
    outputCurrency,
    pool,
    position,
    positionKey,
    txnInfo,
    tradeState,
    provider,
    chainId,
    // marginFacility,
    reduceAmount,
    allowedSlippage,
    allowedSlippedTick,
    deadline,
  ])

  const handleReducePosition = useCallback(() => {
    if (!callback || !position || !txnInfo || !inputCurrency || !outputCurrency) {
      return
    }
    setAttemptingTxn(true)

    callback()
      .then((response) => {
        setAttemptingTxn(false)
        setTxHash(response?.hash)
        setErrorMessage(undefined)
        addTransaction(response, {
          type: TransactionType.REDUCE_LEVERAGE,
          reduceAmount: Number(reduceAmount),
          inputCurrencyId: inputCurrency.wrapped.address,
          outputCurrencyId: outputCurrency.wrapped.address,
          pnl: Number(txnInfo.PnL),
          timestamp: new Date().getTime().toString(),
        })
        setReduceAmount('')
      })
      .catch((error) => {
        console.error(error)
        setAttemptingTxn(false)
        setTxHash(undefined)
        setErrorMessage(error.message)
        setReduceAmount('')
      })
  }, [
    callback,
    position,
    txnInfo,
    inputCurrency,
    outputCurrency,
    reduceAmount,
    addTransaction,
    setAttemptingTxn,
    setTxHash,
    setErrorMessage,
  ])

  const [debouncedReduceAmount, onDebouncedReduceAmount] = useDebouncedChangeHandler(
    reduceAmount ?? '',
    setReduceAmount
  )

  const theme = useTheme()

  const loading = useMemo(() => tradeState === DerivedInfoState.LOADING, [tradeState])

  const handleDismiss = useCallback(() => {
    setShowModal(false)
    setAttemptingTxn(false)
    setTxHash(undefined)
    setErrorMessage(undefined)
  }, [])

  // const { onChangeTradeType, onPriceToggle, onPriceInput } = useMarginTradingActionHandlers()

  // const { baseCurrencyIsInputToken, startingPrice } = useMarginTradingState()

  const currentPrice = useMemo(() => {
    if (pool && inputCurrency && outputCurrency) {
      const inputIsToken0 = inputCurrency.wrapped.sortsBefore(outputCurrency.wrapped)
      const baseIsToken0 = (baseCurrencyIsInput && inputIsToken0) || (!baseCurrencyIsInput && !inputIsToken0)
      if (baseIsToken0) {
        return formatBNToString(new BN(pool.token0Price.toFixed(18)))
      } else {
        return formatBNToString(new BN(pool.token1Price.toFixed(18)))
      }
    }
    return undefined
  }, [baseCurrencyIsInput, inputCurrency, pool, outputCurrency])

  const [baseCurrency, quoteCurrency] = useMemo(() => {
    return baseCurrencyIsInput ? [inputCurrency, outputCurrency] : [outputCurrency, inputCurrency]
  }, [baseCurrencyIsInput, inputCurrency, outputCurrency])

  if (!positionExists) {
    return <PositionMissing />
  }

  return (
    <DarkCard style={{ paddingTop: '0px' }}>
      {showModal && (
        <ConfirmModifyPositionModal
          onDismiss={handleDismiss}
          isOpen={showModal}
          attemptingTxn={attemptingTxn}
          txHash={txHash}
          header={<Trans>Position Details here</Trans>}
          bottom={
            <BaseFooter
              errorMessage={<Trans>{errorMessage}</Trans>}
              onConfirm={handleReducePosition}
              confirmText="Confirm Reduce Position"
              disabledConfirm={!!inputError || !txnInfo}
            />
          }
          pendingText={<Trans>Reducing Position ...</Trans>}
          currencyToAdd={outputCurrency ?? undefined}
          recipient={account ?? null}
          errorMessage={errorMessage ? <Trans>{errorMessage}</Trans> : undefined}
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '100px', alignItems: 'center' }}>
          <FilterWrapper>
            <Filter onClick={() => setIsLimit(!isLimit)}>
              <Selector active={!isLimit}>
                <StyledSelectorText lineHeight="20px" active={!isLimit}>
                  Market
                </StyledSelectorText>
              </Selector>
              <Selector active={isLimit}>
                <StyledSelectorText lineHeight="20px" active={isLimit}>
                  Limit
                </StyledSelectorText>
              </Selector>
            </Filter>
          </FilterWrapper>
          <ThemedText.BodySmall>Current Total Position:</ThemedText.BodySmall>
        </div>

        <LmtSettingsTab
          isOpen={showSettings}
          onToggle={onToggle}
          allowedSlippage={allowedSlippage}
          autoSlippedTick={allowedSlippedTick}
        />
      </div>
      <LimitInputWrapper style={{ width: '95%', marginLeft: '10px' }}>
        <AnimatedDropdown open={isLimit}>
          <DynamicSection justify="start" gap="md" disabled={false}>
            <RowStart>
              {Boolean(inputCurrency && outputCurrency) && (
                <PriceToggleSection>
                  <div
                    style={{ width: 'fit-content', display: 'flex', alignItems: 'center' }}
                    onClick={() => setBaseCurrencyIsInput(() => !baseCurrencyIsInput)}
                  >
                    <ToggleWrapper width="fit-content">
                      <ToggleElement isActive={!baseCurrencyIsInput}>
                        <CurrencyLogo currency={outputCurrency} size="15px" />
                      </ToggleElement>
                      <ToggleElement isActive={baseCurrencyIsInput}>
                        <CurrencyLogo currency={inputCurrency} size="15px" />
                      </ToggleElement>
                    </ToggleWrapper>
                  </div>
                </PriceToggleSection>
              )}
            </RowStart>
          </DynamicSection>
          <DynamicSection gap="md" disabled={false}>
            <AutoColumn gap="2px" style={{ marginTop: '0.5rem' }}>
              <Trans>
                <ThemedText.DeprecatedMain fontWeight={535} fontSize={12} color="text1">
                  Current Price:
                </ThemedText.DeprecatedMain>
                <ThemedText.DeprecatedBody fontWeight={535} fontSize={20} color="text1">
                  {currentPrice && <HoverInlineText maxCharacters={20} text={currentPrice} />}
                </ThemedText.DeprecatedBody>
                {baseCurrency && (
                  <ThemedText.DeprecatedBody color="text2" fontSize={12}>
                    {quoteCurrency?.symbol} per {baseCurrency.symbol}
                  </ThemedText.DeprecatedBody>
                )}
              </Trans>
            </AutoColumn>
            <LimitInputPrice>
              <Trans>
                <ThemedText.BodySecondary>Limit Price </ThemedText.BodySecondary>{' '}
              </Trans>
              <LimitInputRow>
                <StyledNumericalInput
                  onUserInput={setLimitPrice}
                  value={limitPrice ?? ''}
                  placeholder="0"
                  className="limit-amount-input"
                ></StyledNumericalInput>
                <RowFixed>
                  {inputCurrency && (
                    <Button
                      sx={{ textTransform: 'none' }}
                      onClick={() => setBaseCurrencyIsInput(() => !baseCurrencyIsInput)}
                    >
                      <ThemedText.BodySmall>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {quoteCurrency?.symbol} per {baseCurrency?.symbol}
                        </div>
                      </ThemedText.BodySmall>
                    </Button>
                  )}
                </RowFixed>
              </LimitInputRow>
            </LimitInputPrice>
          </DynamicSection>
        </AnimatedDropdown>
      </LimitInputWrapper>
      <AutoColumn gap="10px" style={{ width: '95%', marginLeft: '10px' }}>
        <Trans>
          <ThemedText.BodyPrimary fontWeight={400}>Debt Reduce Amount </ThemedText.BodyPrimary>
        </Trans>
        <CurrencyInputPanel
          value={reduceAmount}
          id="reduce-position-input"
          onUserInput={(str: string) => {
            if (position?.totalDebtInput) {
              if (str === '') {
                onDebouncedReduceAmount('')
              } else if (new BN(str).isGreaterThan(new BN(position?.totalPosition))) {
                return
              } else {
                setReduceAmount(str)
              }
            }
          }}
          showMaxButton={true}
          onMax={() => {
            setReduceAmount(position?.totalPosition ? position?.totalPosition.toString(10) : '')
          }}
          hideBalance={true}
          currency={outputCurrency}
          label={<Trans>Reduce Debt By:</Trans>}
        />
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <PercentSlider
            initialValue={
              position ? new BN(debouncedReduceAmount).div(position?.totalPosition).times(100).toNumber() : 0
            }
            onSlideChange={(val) =>
              position &&
              onDebouncedReduceAmount(new BN(val.toString()).div(100).times(position?.totalPosition).toString())
            }
            onInputChange={(val) =>
              position &&
              onDebouncedReduceAmount(new BN(val.toString()).div(100).times(position?.totalPosition).toString())
            }
          />
        </div>
        <AutoColumn justify="center" style={{ width: '100%', marginTop: '5px' }}>
          <TransactionDetails>
            <Wrapper>
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
                    {position ? (
                      loading ? (
                        <ThemedText.BodySmall>
                          <Trans>Fetching details...</Trans>
                        </ThemedText.BodySmall>
                      ) : isLimit ? (
                        <LoadingOpacityContainer $loading={loading}>
                          <ThemedText.BodySmall>Order Details </ThemedText.BodySmall>
                        </LoadingOpacityContainer>
                      ) : (
                        <LoadingOpacityContainer $loading={loading}>
                          <ThemedText.BodySmall>Trade Details </ThemedText.BodySmall>
                        </LoadingOpacityContainer>
                      )
                    ) : null}
                  </RowFixed>
                  <RowFixed>
                    <RotatingArrow stroke={theme.textTertiary} open={Boolean(showDetails)} />
                  </RowFixed>
                </StyledHeaderRow>
                <AnimatedDropdown open={showDetails}>
                  <AutoColumn gap="sm" style={{ padding: '0', paddingBottom: '8px' }}>
                    {!isLimit ? (
                      <StyledCard style={{ width: '100%' }}>
                        <AutoColumn gap="sm">
                          <ValueLabel
                            label="Premium Owed"
                            description="Current amount of premium owed"
                            value={formatBNToString(txnInfo?.premium, NumberType.SwapTradeAmount)}
                            symbolAppend={inputCurrency?.symbol}
                            syncing={loading}
                          />
                          <ValueLabel
                            label="Collateral Returned"
                            description="Amount of collateral returned"
                            value={formatBNToString(txnInfo?.returnedAmount, NumberType.SwapTradeAmount)}
                            symbolAppend={inputCurrency?.symbol}
                            syncing={loading}
                          />
                          <ValueLabel
                            label="PnL"
                            description="Profit and Loss"
                            value={formatBNToString(txnInfo?.PnL, NumberType.SwapTradeAmount)}
                            symbolAppend={inputCurrency?.symbol}
                            syncing={loading}
                            delta={true}
                          />
                        </AutoColumn>
                      </StyledCard>
                    ) : (
                      <StyledCard style={{ width: '100%' }}>
                        <AutoColumn gap="sm">
                          <RowBetween>
                            <RowFixed>
                              <MouseoverTooltip text={<Trans>Amount of position reduced</Trans>}>
                                <ThemedText.BodySmall color="textPrimary">
                                  <Trans>Reduced Position</Trans>
                                </ThemedText.BodySmall>
                              </MouseoverTooltip>
                            </RowFixed>
                            <TextWithLoadingPlaceholder syncing={loading} width={65}>
                              <ThemedText.BodySmall textAlign="right" color="textSecondary">
                                <TruncatedText>
                                  {txnInfo && `${Number(txnInfo?.returnedAmount)}  ${outputCurrency?.symbol}`}
                                </TruncatedText>
                              </ThemedText.BodySmall>
                            </TextWithLoadingPlaceholder>
                          </RowBetween>
                          <RowBetween>
                            <RowFixed>
                              <MouseoverTooltip text={<Trans>Your specified order price</Trans>}>
                                <ThemedText.BodySmall color="textPrimary">
                                  <Trans>Order Price</Trans>
                                </ThemedText.BodySmall>
                              </MouseoverTooltip>
                            </RowFixed>
                            <TextWithLoadingPlaceholder syncing={loading} width={65}>
                              <ThemedText.BodySmall textAlign="right">
                                <TruncatedText>
                                  <DeltaText delta={Number(txnInfo?.PnL)}>
                                    {txnInfo && `${Number(txnInfo?.PnL)}  ${inputCurrency?.symbol}`}
                                  </DeltaText>
                                </TruncatedText>
                              </ThemedText.BodySmall>
                            </TextWithLoadingPlaceholder>
                          </RowBetween>
                          <RowBetween>
                            <RowFixed>
                              <MouseoverTooltip
                                text={<Trans>Amount the reduced position converts to, given your order price </Trans>}
                              >
                                <ThemedText.BodySmall color="textPrimary">
                                  <Trans>Desired Output</Trans>
                                </ThemedText.BodySmall>
                              </MouseoverTooltip>
                            </RowFixed>
                            <TextWithLoadingPlaceholder syncing={loading} width={65}>
                              <ThemedText.BodySmall textAlign="right" color="textSecondary">
                                <TruncatedText>
                                  {txnInfo && `${Number(txnInfo?.premium)}  ${inputCurrency?.symbol}`}
                                </TruncatedText>
                              </ThemedText.BodySmall>
                            </TextWithLoadingPlaceholder>
                          </RowBetween>
                          <RowBetween>
                            <RowFixed>
                              <MouseoverTooltip
                                text={<Trans>Estimated PnL when position is closed at specified price</Trans>}
                              >
                                <ThemedText.BodySmall color="textPrimary">
                                  <Trans>Estimated PnL</Trans>
                                </ThemedText.BodySmall>
                              </MouseoverTooltip>
                            </RowFixed>
                            <TextWithLoadingPlaceholder syncing={loading} width={65}>
                              <ThemedText.BodySmall textAlign="right" color="textSecondary">
                                <TruncatedText>
                                  <DeltaText delta={Number(txnInfo?.PnL)}>
                                    {txnInfo && `${Number(txnInfo?.PnL)}  ${inputCurrency?.symbol}`}
                                  </DeltaText>{' '}
                                </TruncatedText>
                              </ThemedText.BodySmall>
                            </TextWithLoadingPlaceholder>
                          </RowBetween>
                        </AutoColumn>
                      </StyledCard>
                    )}
                  </AutoColumn>
                </AnimatedDropdown>
              </AutoColumn>
            </Wrapper>
          </TransactionDetails>
        </AutoColumn>
      </AutoColumn>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <ButtonError
          style={{
            fontSize: '12px',
            borderRadius: '10px',
            width: 'fit-content',
            height: '15px',
          }}
          padding=".25rem"
          onClick={() => {
            setShowModal(true)
          }}
          id="leverage-button"
          disabled={!!inputError || !txnInfo}
        >
          <ThemedText.BodySmall fontWeight={600}>
            {inputError ? (
              inputError
            ) : tradeState === DerivedInfoState.INVALID ? (
              <Trans>Invalid Trade</Trans>
            ) : isLimit ? (
              <Trans>Place Order</Trans>
            ) : (
              <Trans>Execute</Trans>
            )}
          </ThemedText.BodySmall>
        </ButtonError>
      </div>
    </DarkCard>
  )
}

export function getSlippedTicks(
  pool: Pool,
  slippedTickTolerance: Percent
): { slippedTickMin: number; slippedTickMax: number } {
  const pullUp = JSBI.BigInt(10_000 + Math.floor(Number(slippedTickTolerance.toFixed(18)) * 100))

  const pullDown = JSBI.BigInt(10_000 - Math.floor(Number(slippedTickTolerance.toFixed(18)) * 100))

  const minPrice = new Price(
    pool.token0,
    pool.token1,
    JSBI.multiply(pool.token0Price.denominator, JSBI.BigInt(10_000)),
    JSBI.multiply(pool.token0Price.numerator, pullDown)
  )

  const maxPrice = new Price(
    pool.token0,
    pool.token1,
    JSBI.multiply(pool.token0Price.denominator, JSBI.BigInt(10_000)),
    JSBI.multiply(pool.token0Price.numerator, pullUp)
  )

  // get slipped min/max tick
  const slippedTickMax = priceToClosestTick(maxPrice)
  const slippedTickMin = priceToClosestTick(minPrice)

  return {
    slippedTickMax,
    slippedTickMin,
  }
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
