import type { TransactionResponse } from '@ethersproject/providers'
import { Trans } from '@lingui/macro'
import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, InterfaceEventName } from '@uniswap/analytics-events'
import { NumberType } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { PoolSelector } from 'components/addLiquidity/PoolSelector'
import { sendEvent } from 'components/analytics'
import LiquidityChartRangeInput from 'components/LiquidityChartRangeInput'
import { TextWithLoadingPlaceholder } from 'components/modalFooters/common'
import RateToggle from 'components/RateToggle'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { useToggleWalletDrawer } from 'components/WalletDropdown'
import { useRateAndUtil } from 'hooks/useLMTV2Positions'
import { useEstimatedAPR } from 'hooks/usePools'
import usePrevious from 'hooks/usePrevious'
import { useUSDPriceBN } from 'hooks/useUSDPrice'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle } from 'react-feather'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Text } from 'rebass'
import {
  useDerivedLmtMintInfo,
  useRangeHopCallbacks,
  useV3MintActionHandlers,
  useV3MintState,
} from 'state/mint/v3/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { NFPM_SDK } from 'utils/lmtSDK/NFPMV2'
import { useAccount, useChainId } from 'wagmi'
import { useEthersProvider, useEthersSigner } from 'wagmi-lib/adapters'

import CurrencyInputPanel from '../../components/BaseSwapPanel'
import { ButtonPrimary, ButtonText } from '../../components/Button'
import { BlueCard, OutlineCard, YellowCard } from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import HoverInlineText from '../../components/HoverInlineText'
import { AddRemoveTabs } from '../../components/NavigationTabs'
import RangeSelector from '../../components/RangeSelector'
import { PresetsButtons } from '../../components/RangeSelector/PresetsButtons'
import Row, { RowBetween, RowFixed } from '../../components/Row'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import { LMT_NFPM_V2 } from '../../constants/addresses'
import {
  LMT_PER_USD_PER_DAY,
  LMT_PER_USD_PER_DAY_NZT,
  LMT_PER_USD_PER_DAY_USDC,
  ZERO_PERCENT,
} from '../../constants/misc'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useIsSwapUnsupported } from '../../hooks/useIsSwapUnsupported'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { Bound, Field } from '../../state/mint/v3/actions'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { TransactionType } from '../../state/transactions/types'
import { useIsExpertMode, useUserSlippageToleranceWithDefault } from '../../state/user/hooks'
import { ThemedText } from '../../theme'
import { calculateGasMargin } from '../../utils/calculateGasMargin'
import { currencyId } from '../../utils/currencyId'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { Dots } from '../LP/styleds'
import { Review } from './Review'
import {
  DynamicSection,
  LeftSection,
  MediumOnly,
  PageWrapper,
  PresetButtonsRow,
  RightContainer,
  RightSection,
  ScrollablePage,
  SectionWrapper,
  StackedContainer,
  StackedItem,
  StyledButtonError,
  StyledButtonPrimary,
  StyledInput,
  Wrapper,
} from './styled'

const PriceAndToggleWrapper = styled(RowBetween)`
  flex-wrap: wrap;
  row-gap: 1rem;
`

const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

export default function AddLiquidity() {
  const [selectPair, setSelectPair] = useState(false)
  const navigate = useNavigate()
  const {
    currencyIdA,
    currencyIdB,
    feeAmount: feeAmountFromUrl,
    tokenId,
  } = useParams<{ currencyIdA?: string; currencyIdB?: string; feeAmount?: string; tokenId?: string }>()

  const account = useAccount().address
  const chainId = useChainId()
  const provider = useEthersProvider({ chainId })
  const signer = useEthersSigner({ chainId })
  const theme = useTheme()

  const toggleWalletDrawer = useToggleWalletDrawer() // toggle wallet when disconnected
  const expertMode = useIsExpertMode()
  const addTransaction = useTransactionAdder()

  // fee selection from url 577, 583   ===  65,129,133
  const feeAmount: FeeAmount | undefined =
    feeAmountFromUrl && Object.values(FeeAmount).includes(parseFloat(feeAmountFromUrl))
      ? parseFloat(feeAmountFromUrl)
      : undefined

  const baseCurrency = useCurrency(currencyIdA)

  const currencyB = useCurrency(currencyIdB)

  // prevent an error if they input ETH/WETH
  const quoteCurrency =
    baseCurrency && currencyB && baseCurrency.wrapped.equals(currencyB.wrapped) ? undefined : currencyB

  // mint state
  const { independentField, typedValue, startPriceTypedValue } = useV3MintState()

  const {
    pool,
    ticks,
    dependentField,
    price,
    pricesAtTicks,
    pricesAtLimit,
    parsedAmounts,
    currencyBalances,
    position,
    noLiquidity,
    currencies,
    errorMessage,
    invalidPool,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    invertPrice,
    ticksAtLimit,
    contractErrorMessage,
  } = useDerivedLmtMintInfo(
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined
  )

  const { onFieldAInput, onFieldBInput, onLeftRangeInput, onRightRangeInput, onStartPriceInput } =
    useV3MintActionHandlers(noLiquidity)

  const isValid = !errorMessage && !invalidRange && !contractErrorMessage

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // txn values
  const deadline = useTransactionDeadline() // custom from users settings

  const [txHash, setTxHash] = useState<string>('')

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const [bnA, bnB] = useMemo(() => {
    const [amountA, amountB] = [parsedAmounts[Field.CURRENCY_A], parsedAmounts[Field.CURRENCY_B]]
    return [
      amountA?.toExact() ? new BN(amountA.toExact()) : undefined,
      amountB?.toExact() ? new BN(amountB.toExact()) : undefined,
    ]
  }, [parsedAmounts])
  const currencyAFiatState = useUSDPriceBN(bnA, currencies[Field.CURRENCY_A])
  const currencyBFiatState = useUSDPriceBN(bnB, currencies[Field.CURRENCY_B])

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field]),
      }
    },
    {}
  )

  const atMaxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
      }
    },
    {}
  )

  const [approvalAmountA, approvalAmountB] = useMemo(() => {
    return [parsedAmounts[Field.CURRENCY_A], parsedAmounts[Field.CURRENCY_B]]
  }, [parsedAmounts])

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(approvalAmountA, chainId ? LMT_NFPM_V2[chainId] : undefined)

  const [approvalB, approveBCallback] = useApproveCallback(approvalAmountB, chainId ? LMT_NFPM_V2[chainId] : undefined)

  const handleApproveA = useCallback(() => {
    try {
      approveACallback()
    } catch (err) {
      console.log('handleApproveA', err)
    }
  }, [approveACallback])
  const handleApproveB = useCallback(() => {
    try {
      approveBCallback()
    } catch (err) {
      console.log('handleApproveB', err)
    }
  }, [approveBCallback])

  const allowedSlippage = useUserSlippageToleranceWithDefault(
    outOfRange ? ZERO_PERCENT : DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE
  )

  async function onAdd() {
    if (!chainId || !provider || !account || !signer || !baseCurrency || !quoteCurrency || !pool) return

    if (position && account && deadline) {
      const { calldata, value } = NFPM_SDK.addCallParameters(position, {
        slippageTolerance: allowedSlippage,
        recipient: account,
        deadline: Math.floor(new Date().getTime() / 1000 + 20 * 60).toString(),
      })

      const txn: { to: string; data: string; value: string } = {
        to: LMT_NFPM_V2[chainId],
        data: calldata,
        value,
      }

      setAttemptingTxn(true)

      signer
        .estimateGas(txn)
        .then((estimate) => {
          const newTxn = {
            ...txn,
            gasLimit: calculateGasMargin(estimate),
          }

          return signer.sendTransaction(newTxn).then((response: TransactionResponse) => {
            setAttemptingTxn(false)
            addTransaction(response, {
              type: TransactionType.ADD_LMT_LIQUIDITY,
              baseCurrencyId: currencyId(baseCurrency),
              quoteCurrencyId: currencyId(quoteCurrency),
              expectedAmountBaseRaw: parsedAmounts[Field.CURRENCY_A]?.quotient?.toString() ?? '0',
              expectedAmountQuoteRaw: parsedAmounts[Field.CURRENCY_B]?.quotient?.toString() ?? '0',
            })
            setTxHash(response.hash)
            sendEvent({
              category: 'Liquidity',
              action: 'Add',
              label: [currencies[Field.CURRENCY_A]?.symbol, currencies[Field.CURRENCY_B]?.symbol].join('/'),
            })
          })
        })
        .catch((error) => {
          console.error('Failed to send transaction', error)
          setAttemptingTxn(false)
          // we only care if the error is something _other_ than the user rejected the tx
          if (error?.code !== 4001) {
            console.error(error)
          }
        })
    } else {
      return
    }
  }

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
      // dont jump to pool page if creating
      navigate('/pools')
    }
    setTxHash('')
  }, [navigate, onFieldAInput, txHash])

  const addIsUnsupported = useIsSwapUnsupported(currencies?.CURRENCY_A, currencies?.CURRENCY_B)

  const clearAll = useCallback(() => {
    onFieldAInput('')
    onFieldBInput('')
    onLeftRangeInput('')
    onRightRangeInput('')
    navigate(`/add/`)
    setSelectPair(true)
  }, [navigate, onFieldAInput, onFieldBInput, onLeftRangeInput, onRightRangeInput, setSelectPair])

  useEffect(() => {
    if (currencyIdA === undefined) {
      setSelectPair(() => true)
    }
    if ((chainId && baseCurrency) || selectPair) {
      if (baseCurrency?.symbol === 'UNKNOWN') {
        clearAll()
      }
    }
  }, [clearAll, chainId, baseCurrency, currencyIdA, selectPair])

  // get value and prices at ticks
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks

  const { result: aprUtil, loading: rateAndUtilLoading } = useRateAndUtil(
    pool?.token0.address,
    pool?.token1.address,
    pool?.fee,
    tickLower,
    tickUpper
  )

  const rateLoading = rateAndUtilLoading || !aprUtil

  const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper } = useRangeHopCallbacks(
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    tickLower,
    tickUpper,
    pool
  )

  // we need an existence check on parsed amounts for single-asset deposits
  const showApprovalA = approvalA !== ApprovalState.APPROVED && !!parsedAmounts[Field.CURRENCY_A]
  const showApprovalB = approvalB !== ApprovalState.APPROVED && !!parsedAmounts[Field.CURRENCY_B]

  const pendingText = `Supplying ${!depositADisabled ? parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) : ''} ${
    !depositADisabled ? currencies[Field.CURRENCY_A]?.symbol : ''
  } ${!outOfRange ? 'and' : ''} ${!depositBDisabled ? parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) : ''} ${
    !depositBDisabled ? currencies[Field.CURRENCY_B]?.symbol : ''
  }`

  const [searchParams, setSearchParams] = useSearchParams()

  const handleSetRecommendedRange = useCallback(
    (leftRange: any, rightRange: any) => {
      const minPrice = pricesAtLimit[Bound.LOWER]
      if (minPrice) {
        onLeftRangeInput(
          (Number(invertPrice ? price?.invert().toSignificant(6) : price?.toSignificant(6)) * leftRange)
            .toFixed(12)
            .toString()
        )
      }
      const maxPrice = pricesAtLimit[Bound.UPPER]
      if (maxPrice) {
        onRightRangeInput(
          (Number(invertPrice ? price?.invert().toSignificant(6) : price?.toSignificant(6)) * rightRange)
            .toFixed(12)
            .toString()
        )
      }
      setSearchParams(searchParams)

      sendEvent({
        category: 'Liquidity',
        action: 'Recommended Range Clicked',
      })
    },
    [pricesAtLimit, searchParams, setSearchParams, invertPrice, price, onLeftRangeInput, onRightRangeInput]
  )

  // START: sync values with query string
  const oldSearchParams = usePrevious(searchParams)

  // use query string as an input to onInput handlers
  useEffect(() => {
    const minPrice = searchParams.get('minPrice')
    const oldMinPrice = oldSearchParams?.get('minPrice')
    if (
      minPrice &&
      typeof minPrice === 'string' &&
      !isNaN(minPrice as any) &&
      (!oldMinPrice || oldMinPrice !== minPrice)
    ) {
      onLeftRangeInput(minPrice)
    }
    // disable eslint rule because this hook only cares about the url->input state data flow
    // input state -> url updates are handled in the input handlers
    // eslint-disable-next-line react-hooks/exhaustive-dep
  }, [searchParams, oldSearchParams, onLeftRangeInput])

  useEffect(() => {
    const maxPrice = searchParams.get('maxPrice')
    const oldMaxPrice = oldSearchParams?.get('maxPrice')

    if (
      maxPrice &&
      typeof maxPrice === 'string' &&
      !isNaN(maxPrice as any) &&
      (!oldMaxPrice || oldMaxPrice !== maxPrice)
    ) {
      onRightRangeInput(maxPrice)
    }
    // disable eslint rule because this hook only cares about the url->input state data flow
    // input state -> url updates are handled in the input handlers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])
  // END: sync values with query string

  const Buttons = () =>
    addIsUnsupported ? (
      <StyledButtonPrimary disabled={true} $borderRadius="10px" padding="6px">
        <ThemedText.DeprecatedMain mb="4px">
          <Trans>Unsupported Asset</Trans>
        </ThemedText.DeprecatedMain>
      </StyledButtonPrimary>
    ) : !account ? (
      <TraceEvent
        events={[BrowserEvent.onClick]}
        name={InterfaceEventName.CONNECT_WALLET_BUTTON_CLICKED}
        properties={{ received_swap_quote: false }}
        element={InterfaceElementName.CONNECT_WALLET_BUTTON}
      >
        <StyledButtonPrimary onClick={toggleWalletDrawer} $borderRadius="10px" padding="6px">
          <Trans>Connect Wallet</Trans>
        </StyledButtonPrimary>
      </TraceEvent>
    ) : (
      <AutoColumn gap="md">
        <div></div>
        {(approvalA === ApprovalState.NOT_APPROVED ||
          approvalA === ApprovalState.PENDING ||
          approvalB === ApprovalState.NOT_APPROVED ||
          approvalB === ApprovalState.PENDING) &&
        isValid ? (
          <RowBetween>
            {showApprovalA && (
              <StyledButtonPrimary
                onClick={handleApproveA}
                disabled={approvalA === ApprovalState.PENDING}
                width={showApprovalB ? '48%' : '100%'}
              >
                {approvalA === ApprovalState.PENDING ? (
                  <Dots>
                    <Trans>Approving {currencies[Field.CURRENCY_A]?.symbol}</Trans>
                  </Dots>
                ) : (
                  <Trans>Approve {currencies[Field.CURRENCY_A]?.symbol}</Trans>
                )}
              </StyledButtonPrimary>
            )}
            {showApprovalB && (
              <StyledButtonPrimary
                onClick={handleApproveB}
                disabled={approvalB === ApprovalState.PENDING}
                width={showApprovalA ? '48%' : '100%'}
              >
                {approvalB === ApprovalState.PENDING ? (
                  <Dots>
                    <Trans>Approving {currencies[Field.CURRENCY_B]?.symbol}</Trans>
                  </Dots>
                ) : (
                  <Trans>Approve {currencies[Field.CURRENCY_B]?.symbol}</Trans>
                )}
              </StyledButtonPrimary>
            )}
          </RowBetween>
        ) : (
          <StyledButtonError
            onClick={() => {
              expertMode ? onAdd() : setShowConfirm(true)
            }}
            disabled={
              !isValid ||
              (approvalA !== ApprovalState.APPROVED && !depositADisabled) ||
              (approvalB !== ApprovalState.APPROVED && !depositBDisabled)
            }
            error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
          >
            <Text fontWeight={500}>
              {contractErrorMessage ? contractErrorMessage : errorMessage ? errorMessage : <Trans>Preview</Trans>}
            </Text>
          </StyledButtonError>
        )}
      </AutoColumn>
    )

  const onPoolSwitch = useCallback(() => {
    onFieldAInput('')
    onFieldBInput('')
    onLeftRangeInput('')
    onRightRangeInput('')
    navigate(`/add/`)
  }, [navigate, onFieldAInput, onFieldBInput, onLeftRangeInput, onRightRangeInput])

  const priceForEst = invertPrice
    ? parseFloat(price?.invert()?.toSignificant(6) ?? '0')
    : parseFloat(price?.toSignificant(6) ?? '0')
  const amountUSD = (currencyAFiatState.data ?? 0) + (currencyBFiatState.data ?? 0)
  const token0Range = invertPrice
    ? parseFloat(priceUpper && price ? priceUpper.divide(price).invert().toSignificant(6) : '0')
    : parseFloat(priceLower && price ? priceLower.divide(price).toSignificant(6) : '0')
  const token1Range = invertPrice
    ? parseFloat(priceLower && price ? priceLower.divide(price).invert().toSignificant(6) : '0')
    : parseFloat(priceUpper && price ? priceUpper.divide(price).toSignificant(6) : '0')

  const { apr: estimatedAPR } = useEstimatedAPR(
    baseCurrency,
    quoteCurrency,
    pool ?? null,
    pool?.tickSpacing ?? null,
    priceForEst,
    amountUSD,
    token0Range,
    token1Range
  )

  const LmtPerDay: string | undefined = useMemo(() => {
    if (quoteCurrency && baseCurrency) {
      if (!currencyAFiatState || !currencyBFiatState) return 'Enter amount'
      return (
        ((currencyAFiatState?.data ?? 0) + (currencyBFiatState?.data ?? 0)) *
        ((baseCurrency?.symbol === 'USDC' && quoteCurrency?.symbol === 'WETH') ||
        (baseCurrency?.symbol === 'WETH' && quoteCurrency?.symbol === 'USDC')
          ? LMT_PER_USD_PER_DAY_USDC
          : (baseCurrency?.symbol === 'NZT' && quoteCurrency?.symbol === 'WETH') ||
            (baseCurrency?.symbol === 'WETH' && quoteCurrency?.symbol === 'NZT')
          ? LMT_PER_USD_PER_DAY_NZT
          : LMT_PER_USD_PER_DAY)
      ).toString()
    } else {
      return 'Enter amount'
    }
  }, [baseCurrency, quoteCurrency, currencyBFiatState, currencyAFiatState])

  return (
    <>
      <ScrollablePage>
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={handleDismissConfirmation}
          attemptingTxn={attemptingTxn}
          hash={txHash}
          content={() => (
            <ConfirmationModalContent
              title={<Trans>Confirm Add Liquidity</Trans>}
              onDismiss={handleDismissConfirmation}
              topContent={() => (
                <Review
                  parsedAmounts={parsedAmounts}
                  position={position}
                  priceLower={priceLower}
                  priceUpper={priceUpper}
                  outOfRange={outOfRange}
                  ticksAtLimit={ticksAtLimit}
                  fiatA={currencyAFiatState}
                  fiatB={currencyBFiatState}
                />
              )}
              bottomContent={() => (
                <ButtonPrimary style={{ marginTop: '1rem' }} onClick={onAdd}>
                  <Text fontWeight={500} fontSize={20}>
                    <Trans>Add</Trans>
                  </Text>
                </ButtonPrimary>
              )}
            />
          )}
          pendingText={pendingText}
        />
        <PageWrapper wide={true}>
          <AddRemoveTabs
            isV2={true}
            creating={false}
            adding={true}
            positionID={tokenId}
            defaultSlippage={DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE}
            showBackLink={true}
          >
            <Row justifyContent="flex-end" style={{ width: 'fit-content', minWidth: 'fit-content' }}>
              <MediumOnly>
                <ButtonText onClick={clearAll} margin="0 15px 0 0">
                  <ThemedText.DeprecatedWhite fontSize="12px">
                    <Trans>Reset</Trans>
                  </ThemedText.DeprecatedWhite>
                </ButtonText>
              </MediumOnly>
            </Row>
          </AddRemoveTabs>
          <Wrapper>
            <SectionWrapper>
              <LeftSection>
                <AutoColumn gap="lg">
                  <>
                    <AutoColumn style={{ paddingBottom: '15px' }} gap="md">
                      <RowBetween justify="start" gap="0px">
                        <PoolSelector
                          selectPair={selectPair}
                          setSelectPair={setSelectPair}
                          bg={true}
                          largeWidth={true}
                          inputCurrencyId={currencyIdB}
                          outputCurrencyId={currencyIdA}
                          fee={feeAmount}
                          onPoolSwitch={onPoolSwitch}
                        />
                      </RowBetween>
                    </AutoColumn>{' '}
                  </>
                </AutoColumn>
                <div>
                  <>
                    <RightContainer gap="lg">
                      <DynamicSection gap="md" disabled={!feeAmount || invalidPool} style={{ marginTop: '5px' }}>
                        {!noLiquidity ? (
                          <>
                            <RowBetween>
                              <ThemedText.BodySecondary>
                                <Trans>Select Price Range</Trans>
                              </ThemedText.BodySecondary>
                            </RowBetween>
                            <PriceAndToggleWrapper>
                              {price && baseCurrency && quoteCurrency && !noLiquidity && (
                                <Trans>
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'start',
                                      alignItems: 'end',
                                      gap: '5px',
                                    }}
                                  >
                                    <ThemedText.DeprecatedMain
                                      fontWeight={500}
                                      textAlign="start"
                                      fontSize={12}
                                      color="text"
                                    >
                                      Current Price:
                                    </ThemedText.DeprecatedMain>
                                    <ThemedText.DeprecatedBody
                                      fontWeight={500}
                                      textAlign="start"
                                      fontSize={14}
                                      color="textSecondary"
                                    >
                                      <HoverInlineText
                                        maxCharacters={20}
                                        text={invertPrice ? price.invert().toSignificant(6) : price.toSignificant(6)}
                                      />
                                    </ThemedText.DeprecatedBody>
                                    <ThemedText.DeprecatedBody textAlign="start" color="textSecondary" fontSize={11}>
                                      {quoteCurrency?.symbol} per {baseCurrency.symbol}
                                    </ThemedText.DeprecatedBody>
                                  </div>
                                </Trans>
                              )}
                              {baseCurrency && quoteCurrency ? (
                                <RateToggle
                                  currencyA={baseCurrency}
                                  currencyB={quoteCurrency}
                                  handleRateToggle={() => {
                                    if (!ticksAtLimit[Bound.LOWER] && !ticksAtLimit[Bound.UPPER]) {
                                      onLeftRangeInput(
                                        (invertPrice ? priceLower : priceUpper?.invert())?.toSignificant(6) ?? ''
                                      )
                                      onRightRangeInput(
                                        (invertPrice ? priceUpper : priceLower?.invert())?.toSignificant(6) ?? ''
                                      )
                                      onFieldAInput(formattedAmounts[Field.CURRENCY_B] ?? '')
                                    }
                                    navigate(
                                      `/add/${currencyIdB as string}/${currencyIdA as string}${
                                        feeAmount ? '/' + feeAmount : ''
                                      }`
                                    )
                                  }}
                                />
                              ) : null}
                            </PriceAndToggleWrapper>
                            <PresetButtonsRow>
                              {!noLiquidity && (
                                <>
                                  <PresetsButtons
                                    btnName="-10% ~ +10% narrow"
                                    onSetRecommendedRange={() => handleSetRecommendedRange(0.9, 1.1)}
                                  />
                                  <PresetsButtons
                                    btnName="-20% ~ +20% middle"
                                    onSetRecommendedRange={() => handleSetRecommendedRange(0.8, 1.2)}
                                  />
                                  <PresetsButtons
                                    btnName="-30% ~ +30% wide"
                                    onSetRecommendedRange={() => handleSetRecommendedRange(0.7, 1.3)}
                                    isRecommended={true}
                                  />
                                  <PresetsButtons
                                    btnName={`-20% ~ -10% ${quoteCurrency ? quoteCurrency?.symbol : ''} only`}
                                    onSetRecommendedRange={() => handleSetRecommendedRange(0.8, 0.9)}
                                  />
                                  <PresetsButtons
                                    btnName={`+10% ~ +20% ${baseCurrency ? baseCurrency?.symbol : ''} only`}
                                    onSetRecommendedRange={() => handleSetRecommendedRange(1.1, 1.2)}
                                  />
                                </>
                              )}
                            </PresetButtonsRow>
                            <LiquidityChartRangeInput
                              currencyA={baseCurrency ?? undefined}
                              currencyB={quoteCurrency ?? undefined}
                              feeAmount={feeAmount}
                              ticksAtLimit={ticksAtLimit}
                              price={
                                price ? parseFloat((invertPrice ? price.invert() : price).toSignificant(8)) : undefined
                              }
                              priceLower={priceLower}
                              priceUpper={priceUpper}
                              onLeftRangeInput={onLeftRangeInput}
                              onRightRangeInput={onRightRangeInput}
                              interactive={true}
                            />
                          </>
                        ) : (
                          <AutoColumn gap="md">
                            <RowBetween>
                              <ThemedText.DeprecatedLabel>
                                <Trans>Set Starting Price</Trans>
                              </ThemedText.DeprecatedLabel>
                            </RowBetween>
                            {noLiquidity && (
                              <BlueCard
                                style={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  padding: '1rem 1rem',
                                }}
                              >
                                <Text
                                  fontSize={14}
                                  style={{ fontWeight: 500 }}
                                  textAlign="left"
                                  color={theme.textSecondary}
                                >
                                  <Trans>
                                    This pool must be initialized before you can add liquidity. To initialize, select a
                                    starting price for the pool.
                                  </Trans>
                                </Text>
                              </BlueCard>
                            )}
                            <OutlineCard padding="12px">
                              <StyledInput
                                className="start-price-input"
                                value={startPriceTypedValue}
                                onUserInput={onStartPriceInput}
                              />
                            </OutlineCard>
                            <RowBetween
                              style={{ backgroundColor: theme.deprecated_bg1, padding: '12px', borderRadius: '12px' }}
                            >
                              <ThemedText.DeprecatedMain>
                                <Trans>Current {baseCurrency?.symbol} Price:</Trans>
                              </ThemedText.DeprecatedMain>
                              <ThemedText.DeprecatedMain>
                                {price ? (
                                  <ThemedText.DeprecatedMain>
                                    <RowFixed>
                                      <HoverInlineText
                                        maxCharacters={20}
                                        text={invertPrice ? price?.invert()?.toSignificant(5) : price?.toSignificant(5)}
                                      />{' '}
                                      <span style={{ marginLeft: '4px' }}>{quoteCurrency?.symbol}</span>
                                    </RowFixed>
                                  </ThemedText.DeprecatedMain>
                                ) : (
                                  '-'
                                )}
                              </ThemedText.DeprecatedMain>
                            </RowBetween>
                          </AutoColumn>
                        )}
                      </DynamicSection>

                      <DynamicSection
                        gap="md"
                        disabled={!feeAmount || invalidPool || (noLiquidity && !startPriceTypedValue)}
                      >
                        <StackedContainer>
                          <StackedItem>
                            <AutoColumn gap="md">
                              {noLiquidity && (
                                <RowBetween>
                                  <ThemedText.DeprecatedLabel>
                                    <Trans>Set Price Range</Trans>
                                  </ThemedText.DeprecatedLabel>
                                </RowBetween>
                              )}
                              <RangeSelector
                                priceLower={priceLower}
                                priceUpper={priceUpper}
                                getDecrementLower={getDecrementLower}
                                getIncrementLower={getIncrementLower}
                                getDecrementUpper={getDecrementUpper}
                                getIncrementUpper={getIncrementUpper}
                                onLeftRangeInput={onLeftRangeInput}
                                onRightRangeInput={onRightRangeInput}
                                currencyA={baseCurrency}
                                currencyB={quoteCurrency}
                                feeAmount={feeAmount}
                                ticksAtLimit={ticksAtLimit}
                              />
                            </AutoColumn>
                          </StackedItem>
                        </StackedContainer>

                        <YellowCard padding="8px 12px" $borderRadius="12px">
                          <RowBetween>
                            {/*<AlertTriangle stroke={theme.deprecated_primary2} size="16px" />*/}
                            <ThemedText.DeprecatedLabel ml="12px" fontSize="12px">
                              <Trans>
                                The recommended range is the range that optimizes the IL risk adjusted yield,
                                considering utilization rates and current liquidity conditions.
                              </Trans>
                            </ThemedText.DeprecatedLabel>
                          </RowBetween>
                        </YellowCard>

                        {outOfRange ? (
                          <YellowCard padding="8px 12px" $borderRadius="12px">
                            <RowBetween>
                              {/*<AlertTriangle stroke={theme.deprecated_primary2} size="16px" />*/}
                              <ThemedText.DeprecatedLabel ml="12px" fontSize="12px">
                                <Trans>
                                  Your position will earn only interests when out of range, but trading fees as well
                                  when in range.
                                </Trans>
                              </ThemedText.DeprecatedLabel>
                            </RowBetween>
                          </YellowCard>
                        ) : null}

                        {Number(priceUpper?.toSignificant()) / Number(priceLower?.toSignificant()) > 2 ? (
                          <YellowCard padding="8px 12px" $borderRadius="12px">
                            <RowBetween>
                              <ThemedText.DeprecatedLabel ml="12px" fontSize="12px">
                                <Trans>
                                  Range is too wide, consider narrowing down to reduce gas costs or tx reverts
                                </Trans>
                              </ThemedText.DeprecatedLabel>
                            </RowBetween>
                          </YellowCard>
                        ) : null}

                        {invalidRange ? (
                          <YellowCard padding="8px 12px" $borderRadius="12px">
                            <Row>
                              <AlertTriangle stroke={theme.deprecated_yellow3} size="16px" />
                              <ThemedText.DeprecatedYellow ml="12px" fontSize="12px">
                                <Trans>Invalid range selected. The min price must be lower than the max price.</Trans>
                              </ThemedText.DeprecatedYellow>
                            </Row>
                          </YellowCard>
                        ) : null}
                      </DynamicSection>
                    </RightContainer>
                  </>
                </div>
              </LeftSection>
              <RightSection>
                <div>
                  <>
                    <RightContainer gap="lg">
                      <DynamicSection
                        gap="md"
                        disabled={!feeAmount || invalidPool || (noLiquidity && !startPriceTypedValue)}
                      >
                        <ThemedText.BodySecondary style={{ marginBottom: '10px', marginTop: '10px' }}>
                          <Trans>Deposit Amounts</Trans>
                        </ThemedText.BodySecondary>

                        <CurrencyInputPanel
                          value={formattedAmounts[Field.CURRENCY_A]}
                          onUserInput={onFieldAInput}
                          onMax={() => {
                            onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                          }}
                          showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                          currency={currencies[Field.CURRENCY_A] ?? null}
                          id="add-liquidity-input-tokena"
                          fiatValue={currencyAFiatState}
                          showCommonBases
                          locked={depositADisabled}
                        />

                        <CurrencyInputPanel
                          value={formattedAmounts[Field.CURRENCY_B]}
                          onUserInput={onFieldBInput}
                          onMax={() => {
                            onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
                          }}
                          showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
                          fiatValue={currencyBFiatState}
                          currency={currencies[Field.CURRENCY_B] ?? null}
                          id="add-liquidity-input-tokenb"
                          showCommonBases
                          locked={depositBDisabled}
                        />
                      </DynamicSection>
                      <AutoColumn gap="16px">
                        <DynamicSection
                          disabled={!feeAmount || invalidPool || (noLiquidity && !startPriceTypedValue)}
                          gap="md"
                        >
                          {' '}
                          <ThemedText.BodySecondary style={{ marginBottom: '5px' }}>Details</ThemedText.BodySecondary>
                          <OutlineCard>
                            <RowBetween style={{ marginBottom: '6px' }}>
                              <ThemedText.BodySmall>Estimated APR:</ThemedText.BodySmall>
                              <TextWithLoadingPlaceholder syncing={rateLoading} width={100} height="14px">
                                <ThemedText.BodySmall>
                                  {amountUSD
                                    ? aprUtil && estimatedAPR !== undefined
                                      ? `${formatBNToString(aprUtil.apr.plus(estimatedAPR), NumberType.TokenNonTx)} %`
                                      : '-'
                                    : 'Enter amount'}
                                </ThemedText.BodySmall>
                              </TextWithLoadingPlaceholder>
                            </RowBetween>
                            <RowBetween style={{ marginBottom: '6px' }}>
                              <ThemedText.BodySmall>Utilization Rate:</ThemedText.BodySmall>
                              <TextWithLoadingPlaceholder syncing={rateLoading} width={80} height="14px">
                                <ThemedText.BodySmall>
                                  {`${formatBNToString(aprUtil?.util, NumberType.TokenNonTx)} %`}
                                </ThemedText.BodySmall>
                              </TextWithLoadingPlaceholder>
                            </RowBetween>
                            <RowBetween>
                              <ThemedText.BodySmall>LMT Per Day:</ThemedText.BodySmall>
                              <TextWithLoadingPlaceholder syncing={rateLoading} width={80} height="14px">
                                <ThemedText.BodySmall>
                                  {LmtPerDay ? parseFloat(LmtPerDay).toFixed(6) : '-'}
                                </ThemedText.BodySmall>
                              </TextWithLoadingPlaceholder>
                            </RowBetween>
                          </OutlineCard>
                        </DynamicSection>
                      </AutoColumn>

                      <MediumOnly>
                        <Buttons />
                      </MediumOnly>
                    </RightContainer>
                  </>
                </div>
              </RightSection>
            </SectionWrapper>
          </Wrapper>
        </PageWrapper>
        {/* {showOwnershipWarning && <OwnershipWarning ownerAddress={owner} />} */}
        {addIsUnsupported && (
          <UnsupportedCurrencyFooter
            show={addIsUnsupported}
            currencies={[currencies.CURRENCY_A, currencies.CURRENCY_B]}
          />
        )}
      </ScrollablePage>
    </>
  )
}
