import { Trans } from '@lingui/macro'
import { InterfaceElementName } from '@uniswap/analytics-events'
import { formatNumber, NumberType } from '@uniswap/conedison/format'
import { useWeb3React } from '@web3-react/core'
// import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import AnimatedDropdown from 'components/AnimatedDropdown'
import CurrencyInputPanel from 'components/BaseSwapPanel'
import { DarkCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { LoadingOpacityContainer } from 'components/Loader/styled'
import Slider from 'components/Slider'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { MouseoverTooltip } from 'components/Tooltip'
import { DEFAULT_ERC20_DECIMALS } from 'constants/tokens'
import { useCurrency, useToken } from 'hooks/Tokens'
import { useLeverageManagerContract } from 'hooks/useContract'
import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
// import { Info } from 'react-feather'
// import Loader from 'components/Icons/LoadingSpinner'
import { usePool } from 'hooks/usePools'
import { convertBNToNum, useLimitlessPositionFromTokenId } from 'hooks/useV3Positions'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
// import { useCurrencyBalances } from 'lib/hooks/useCurrencyBalance'
import moment from 'moment'
import { SmallMaxButton } from 'pages/RemoveLiquidity/styled'
import { useEffect, useMemo, useState } from 'react'
import { Text } from 'rebass'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import { useTheme } from 'styled-components/macro'
import { HideSmall, Separator, ThemedText } from 'theme'
import { LimitlessPositionDetails } from 'types/leveragePosition'
import { currencyId } from 'utils/currencyId'

import { ButtonError } from '../Button'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import {
  DerivedInfoState,
  RotatingArrow,
  SliderText,
  Spinner,
  StyledCard,
  StyledHeaderRow,
  StyledInfoIcon,
  StyledPolling,
  StyledPollingDot,
  TextWithLoadingPlaceholder,
  TransactionDetails,
  TruncatedText,
  Wrapper,
} from './common'
// import { useSingleCallResult } from 'lib/hooks/multicall'
// import { QuoterV2 } from 'types/v3'
// import { MouseoverValueLabel } from 'components/swap/AdvancedSwapDetails'

function useDerivedLeverageReduceInfo(
  leverageManager: string | undefined,
  trader: string | undefined,
  tokenId: string | undefined,
  allowedSlippage: string,
  position: LimitlessPositionDetails | undefined,
  reduceAmount: string | undefined,
  //newTotalPosition: string | undefined,
  setState: (state: DerivedInfoState) => void
  // approvalState: ApprovalState,
  // setPremium: (premium: number) => void
): {
  transactionInfo:
    | {
        token0Amount: number
        token1Amount: number
        pnl: number
        returnedAmount: number
        unusedPremium: number
        premium: number
        currentPrice: number
        entryPrice: number
        quoteBaseSymbol: string
        newTotalPosition: number
      }
    | undefined
  userError: React.ReactNode | undefined
} {
  const leverageManagerContract = useLeverageManagerContract(leverageManager)

  const [contractResult, setContractResult] = useState<{
    reducePositionResult: any
  }>()

  // const { account } = useWeb3React()
  const currency0 = useCurrency(position?.token0Address)
  const currency1 = useCurrency(position?.token1Address)

  // const relevantTokenBalances = useCurrencyBalances(
  //   account ?? undefined,
  //   useMemo(() => [currency0 ?? undefined, currency1 ?? undefined], [currency0, currency1])
  // )
  const userError = useMemo(() => {
    let error
    if (!reduceAmount || Number(reduceAmount) <= 0) {
      error = <Trans>Invalid Amount</Trans>
    }
    return error
  }, [reduceAmount])

  useEffect(() => {
    const laggedfxn = async () => {
      if (
        !leverageManagerContract ||
        !tokenId ||
        !trader ||
        (parseFloat(allowedSlippage) <= 0 && !position) ||
        !position ||
        Number(reduceAmount) <= 0 ||
        !reduceAmount
      ) {
        setState(DerivedInfoState.INVALID)
        return
      }

      const formattedSlippage = new BN(allowedSlippage).plus(100).shiftedBy(16).toFixed(0)

      const formattedReduceAmount = new BN(reduceAmount).shiftedBy(18).toFixed(0)
      console.log('formattedReduceAmount', formattedReduceAmount)
      // Math.abs(Number(reduceAmount) - position.totalPosition) < 1e-12
      //   ? new BN(position.totalPosition).shiftedBy(DEFAULT_ERC20_DECIMALS).toFixed(0)
      //   : new BN(reduceAmount).shiftedBy(18).toFixed(0)

      // const inputReduceAmount =
      //   Math.abs(Number(position.totalPosition) - Number(formattedReduceAmount)) < 1e12
      //     ? // Number(position.totalPositionRaw) <= Number(formattedReduceAmount)
      //       position.totalPositionRaw
      //     : formattedReduceAmount

      setState(DerivedInfoState.LOADING)

      try {
        // console.log('reducePositionArgs', Math.abs(Number(position.totalPositionRaw) - Number(formattedReduceAmount)), position, position.isToken0, position.totalPosition, position.totalPositionRaw, formattedSlippage, inputReduceAmount)
        const reducePositionResult = await leverageManagerContract.callStatic.reducePosition(
          position?.isToken0,
          formattedSlippage,
          formattedReduceAmount
        )
        console.log('reducePositionResult', reducePositionResult)
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

    !userError && laggedfxn()
  }, [
    userError,
    leverageManager,
    trader,
    tokenId,
    allowedSlippage,
    reduceAmount,
    leverageManagerContract,
    position,
    setState,
  ])

  const [poolState, pool] = usePool(currency0 ?? undefined, currency1 ?? undefined, position?.poolFee)

  const [entryPrice, currentPrice, quoteBaseSymbol] = useMemo(() => {
    if (
      pool?.token0Price &&
      pool?.token1Price &&
      // position.creationPrice &&
      position &&
      currency0 &&
      currency1
    ) {
      // const curPrice = position.isToken0
      //   ? new BN(pool.token1Price.toFixed(DEFAULT_ERC20_DECIMALS))
      //   : new BN(pool.token0Price.toFixed(DEFAULT_ERC20_DECIMALS))

      // entryPrice if isToken0, output is in token0. so entry price would be in input token / output token
      const _entryPrice = new BN(position.initialCollateral)
        .plus(position.totalDebtInput)
        .dividedBy(position.totalPosition)

      // use token0 as quote, token1 as base
      // pnl will be in output token
      // entry price will be in quote token.

      if (pool.token0Price.greaterThan(1)) {
        // entry price = token1 / token0 (token0 is quote and token1 is base)
        return [
          position.isToken0 ? _entryPrice.toNumber() : new BN(1).dividedBy(_entryPrice).toNumber(),
          new BN(pool.token0Price.toFixed(DEFAULT_ERC20_DECIMALS)).toNumber(),
          `${currency0.symbol}/${currency1.symbol}`,
        ]
      } else {
        // entry price = token0 / token1 (token1 is quote and token0 is base)
        return [
          position.isToken0 ? new BN(1).dividedBy(_entryPrice).toNumber() : _entryPrice.toNumber(),
          new BN(pool.token1Price.toFixed(DEFAULT_ERC20_DECIMALS)).toNumber(),
          `${currency1.symbol}/${currency0.symbol}`,
        ]
      }
    }
    return [undefined, undefined, undefined]
  }, [position, pool?.token0Price, pool?.token1Price, currency0, currency1])

  const transactionInfo = useMemo(() => {
    if (contractResult && entryPrice && currentPrice && quoteBaseSymbol && position && reduceAmount) {
      const { reducePositionResult } = contractResult
      const token0Amount = convertBNToNum(reducePositionResult[0], DEFAULT_ERC20_DECIMALS)
      const token1Amount = convertBNToNum(reducePositionResult[1], DEFAULT_ERC20_DECIMALS)
      const pnl = convertBNToNum(reducePositionResult[2], DEFAULT_ERC20_DECIMALS)
      const returnedAmount = convertBNToNum(reducePositionResult[3], DEFAULT_ERC20_DECIMALS)
      const unusedPremium = convertBNToNum(reducePositionResult[4], DEFAULT_ERC20_DECIMALS)
      const premium = convertBNToNum(reducePositionResult[5], DEFAULT_ERC20_DECIMALS)
      const formattedReduceAmount = new BN(reduceAmount).shiftedBy(18).toFixed(0)

      return {
        token0Amount,
        token1Amount,
        pnl,
        returnedAmount,
        unusedPremium,
        premium,
        entryPrice,
        currentPrice,
        quoteBaseSymbol,
        newTotalPosition: position.totalPosition.toNumber() - Number(formattedReduceAmount),
      }
    } else {
      return undefined
    }
  }, [contractResult, currentPrice, entryPrice, quoteBaseSymbol, position, reduceAmount])

  return {
    transactionInfo,
    userError,
  }
}

export function ReduceLeverageModalFooter({
  leverageManagerAddress,
  tokenId,
  trader,
  setAttemptingTxn,
  setTxHash,
}: // setPositionData
{
  leverageManagerAddress: string | undefined
  tokenId: string | undefined
  trader: string | undefined
  setAttemptingTxn: (attemptingTxn: boolean) => void
  setTxHash: (txHash: string) => void
  // setPositionData: (positionData: TransactionPositionDetails) => void
}) {
  // const [nonce, setNonce] = useState(0)
  const { error, position } = useLimitlessPositionFromTokenId(tokenId)

  const [slippage, setSlippage] = useState('1')
  // const [newPosition, setNewPosition] = useState("")
  const [reduceAmount, setReduceAmount] = useState('')
  // const [premium, setPremium ] = useState(0)

  const leverageManagerContract = useLeverageManagerContract(leverageManagerAddress, true)
  const addTransaction = useTransactionAdder()
  const token0 = useToken(position?.token0Address)
  const token1 = useToken(position?.token1Address)

  const inputIsToken0 = !position?.isToken0

  const [derivedState, setDerivedState] = useState<DerivedInfoState>(DerivedInfoState.INVALID)
  const [showDetails, setShowDetails] = useState(true)
  const theme = useTheme()

  // const [, pool] = usePool(token0 ?? undefined, token1 ?? undefined, position?.poolFee)

  const [debouncedSlippage, setDebouncedSlippage] = useDebouncedChangeHandler(slippage, setSlippage)
  const [debouncedReduceAmount, setDebouncedReduceAmount] = useDebouncedChangeHandler(reduceAmount, setReduceAmount)

  const { transactionInfo, userError } = useDerivedLeverageReduceInfo(
    leverageManagerAddress,
    trader,
    tokenId,
    debouncedSlippage,
    position,
    debouncedReduceAmount,
    setDerivedState
  )

  useEffect(() => {
    ;(!!userError || !transactionInfo) && showDetails && setShowDetails(false)
  }, [userError, transactionInfo, showDetails])

  const loading = useMemo(() => derivedState === DerivedInfoState.LOADING, [derivedState])

  const { account, provider } = useWeb3React()

  const handleReducePosition = useMemo(() => {
    return () => {
      if (!account) throw Error('missing account')
      if (!provider) throw Error('missing provider')
      if (!leverageManagerContract) throw Error('missing contract')
      if (!transactionInfo) throw Error('missing transaction info')
      if (!token0 || !token1) throw Error('missing tokens')
      if (!position) throw Error('missing position')
      const formattedSlippage = new BN(slippage).plus(100).shiftedBy(16).toFixed(0)
      const formattedReduceAmount = new BN(reduceAmount).shiftedBy(18).toFixed(0)

      setAttemptingTxn(true)

      return leverageManagerContract
        .reducePosition(position?.isToken0, formattedSlippage, formattedReduceAmount)
        .then((response: any) => {
          // amount0, amount1
          console.log('reduceResponse', response)
          addTransaction(response, {
            type: TransactionType.REDUCE_LEVERAGE,
            reduceAmount: Number(reduceAmount),
            pnl: Number(transactionInfo.pnl),
            initialCollateral: position.initialCollateral.toNumber(),
            leverageFactor: position.totalDebtInput
              .plus(position.initialCollateral)
              .div(position.initialCollateral)
              .toNumber(),
            inputCurrencyId: inputIsToken0 ? currencyId(token0) : currencyId(token1),
            outputCurrencyId: !inputIsToken0 ? currencyId(token0) : currencyId(token1),
            entryPrice: transactionInfo.entryPrice,
            markPrice: transactionInfo.currentPrice,
            quoteBaseSymbol: transactionInfo.quoteBaseSymbol,
            timestamp: moment().format('YYYY-MM-DD'),
            newTotalPosition: position.totalPosition.minus(reduceAmount).toNumber(),
          })
          setTxHash(response.hash)
          setAttemptingTxn(false)
        })
        .catch((err: any) => {
          setAttemptingTxn(false)
          console.log('error closing position: ', err)
        })
    }
  }, [
    slippage,
    position,
    reduceAmount,
    token0,
    token1,
    inputIsToken0,
    transactionInfo,
    leverageManagerContract,
    addTransaction,
    setTxHash,
    setAttemptingTxn,
    account,
    provider,
  ])

  const disabled = !!userError || !transactionInfo
  // const debt = position?.totalDebtInput;
  const initCollateral = position?.initialCollateral

  return (
    <AutoRow>
      <DarkCard marginTop="5px" padding="5px">
        <AutoColumn gap="4px">
          <RowBetween>
            <ThemedText.DeprecatedMain fontWeight={400}>
              <Trans>Allowed Slippage</Trans>
            </ThemedText.DeprecatedMain>
          </RowBetween>
          <>
            <RowBetween>
              <SliderText>
                <Trans>{debouncedSlippage}%</Trans>
              </SliderText>
              <AutoRow gap="4px" justify="flex-end">
                <SmallMaxButton onClick={() => setSlippage('0.5')} width="20%">
                  <Trans>0.5</Trans>
                </SmallMaxButton>
                <SmallMaxButton onClick={() => setSlippage('1')} width="20%">
                  <Trans>1</Trans>
                </SmallMaxButton>
                <SmallMaxButton onClick={() => setSlippage('3')} width="20%">
                  <Trans>3</Trans>
                </SmallMaxButton>
                <SmallMaxButton onClick={() => setSlippage('5')} width="20%">
                  <Trans>Max</Trans>
                </SmallMaxButton>
              </AutoRow>
            </RowBetween>
            <Slider
              value={parseFloat(debouncedSlippage)}
              onChange={(val) => setDebouncedSlippage(String(val))}
              min={0.5}
              max={5.0}
              step={0.1}
              size={20}
              float={true}
            />
          </>
        </AutoColumn>
      </DarkCard>
      <DarkCard padding="5px">
        <AutoColumn gap="md">
          <>
            <RowBetween>
              <ThemedText.DeprecatedMain fontWeight={400}>
                <Trans>
                  Reduce Amount (
                  {`${
                    position?.totalPosition
                      ? formatNumber(
                          (Number(reduceAmount) / Number(position?.totalPosition)) * 100,
                          NumberType.SwapTradeAmount
                        )
                      : '-'
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
                  if (position?.totalPosition) {
                    if (str === '') {
                      setDebouncedReduceAmount('')
                    } else if (new BN(str).isGreaterThan(new BN(position?.totalPosition))) {
                      return
                    } else {
                      setDebouncedReduceAmount(str)
                    }
                  }
                }}
                showMaxButton={true}
                onMax={() => {
                  setDebouncedReduceAmount(position?.totalPosition ? position?.totalPosition.toString(10) : '')
                }}
                hideBalance={true}
                currency={inputIsToken0 ? token1 : token0}
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
                    <StyledInfoIcon color={leverageManagerAddress ? theme.textTertiary : theme.deprecated_bg3} />
                  </HideSmall>
                )}
                {leverageManagerAddress ? (
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
                  open={Boolean(showDetails)}
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
                            <ThemedText.LabelSmall>
                              <Trans>Position to close</Trans>
                            </ThemedText.LabelSmall>
                          </MouseoverTooltip>
                        </RowFixed>
                        <TextWithLoadingPlaceholder syncing={loading} width={65}>
                          <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                            <TruncatedText>
                              {`${
                                inputIsToken0
                                  ? new BN(reduceAmount).abs().toString()
                                  : new BN(reduceAmount).abs().toString()
                              }  ${!inputIsToken0 ? token0?.symbol : token1?.symbol}`}
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
                            <ThemedText.LabelSmall>
                              <Trans>Exp. Output</Trans>
                            </ThemedText.LabelSmall>
                          </MouseoverTooltip>
                        </RowFixed>
                        <TextWithLoadingPlaceholder syncing={loading} width={65}>
                          <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                            <TruncatedText>
                              {`${
                                inputIsToken0
                                  ? new BN(transactionInfo?.token0Amount).abs().toString()
                                  : new BN(transactionInfo?.token1Amount).abs().toString()
                              }  ${inputIsToken0 ? token0?.symbol : token1?.symbol}`}
                            </TruncatedText>
                          </ThemedText.DeprecatedBlack>
                        </TextWithLoadingPlaceholder>
                      </RowBetween>
                      <RowBetween>
                        <RowFixed>
                          <MouseoverTooltip
                            text={
                              <Trans>
                                Premium remaining from last payment returned. The amount returned is inversely
                                proportional to how long the position was opened.
                              </Trans>
                            }
                          >
                            <ThemedText.LabelSmall>
                              <Trans>Premium Returned</Trans>
                            </ThemedText.LabelSmall>
                          </MouseoverTooltip>
                        </RowFixed>
                        <TextWithLoadingPlaceholder syncing={loading} width={65}>
                          <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                            <TruncatedText>
                              {`${formatNumber(Number(transactionInfo.unusedPremium), NumberType.SwapTradeAmount)}  ${
                                inputIsToken0 ? token0?.symbol : token1?.symbol
                              }`}
                            </TruncatedText>
                          </ThemedText.DeprecatedBlack>
                        </TextWithLoadingPlaceholder>
                      </RowBetween>
                      <RowBetween>
                        <RowFixed>
                          <MouseoverTooltip
                            text={
                              <Trans>
                                May be positive when price moves against you, where some portion of your margin will be
                                converted to trade output asset.
                              </Trans>
                            }
                          >
                            <ThemedText.LabelSmall>
                              <Trans>Returned Amount</Trans>
                            </ThemedText.LabelSmall>
                          </MouseoverTooltip>
                        </RowFixed>
                        <TextWithLoadingPlaceholder syncing={loading} width={65}>
                          <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                            <TruncatedText>
                              {`${Number(transactionInfo?.returnedAmount)}  ${
                                inputIsToken0 ? token1?.symbol : token0?.symbol
                              }`}
                            </TruncatedText>
                          </ThemedText.DeprecatedBlack>
                        </TextWithLoadingPlaceholder>
                      </RowBetween>
                      <RowBetween>
                        <RowFixed>
                          <MouseoverTooltip
                            text={
                              <Trans>
                                Expected PnL in relation to your collateral. Does NOT account for paid premiums
                              </Trans>
                            }
                          >
                            <ThemedText.LabelSmall>
                              <Trans>Expected PnL</Trans>
                            </ThemedText.LabelSmall>
                          </MouseoverTooltip>
                        </RowFixed>
                        <TextWithLoadingPlaceholder syncing={loading} width={65}>
                          <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                            <TruncatedText>
                              {`${formatNumber(Number(transactionInfo.pnl), NumberType.SwapTradeAmount)}  ${
                                inputIsToken0 ? token0?.symbol : token1?.symbol
                              }`}
                            </TruncatedText>
                            <DeltaText delta={Number(transactionInfo.pnl)}>
                              {formatBNToString(
                                new BN(transactionInfo.pnl).div(position?.initialCollateral ?? 1).multipliedBy(100),
                                NumberType.SwapTradeAmount
                              )}{' '}
                              %
                            </DeltaText>
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
        style={{ margin: '0px 0 0 0' }}
        id={InterfaceElementName.CONFIRM_SWAP_BUTTON}
      >
        {userError ? (
          userError
        ) : transactionInfo ? (
          <Text fontSize={18} fontWeight={500}>
            <Trans>Reduce Position</Trans>
          </Text>
        ) : (
          <Text fontSize={18} fontWeight={500}>
            <Trans>Invalid</Trans>
          </Text>
        )}
      </ButtonError>
    </AutoRow>
  )
}
