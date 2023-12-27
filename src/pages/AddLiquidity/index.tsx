import { BigNumber } from '@ethersproject/bignumber'
import type { TransactionResponse } from '@ethersproject/providers'
import { Trans } from '@lingui/macro'
import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, InterfaceEventName } from '@uniswap/analytics-events'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import OwnershipWarning from 'components/addLiquidity/OwnershipWarning'
import { sendEvent } from 'components/analytics'
import FeeSelector from 'components/FeeSelector'
import LiquidityChartRangeInput from 'components/LiquidityChartRangeInput'
import { PositionPreview } from 'components/PositionPreview'
import { PoolSelector } from 'components/swap/PoolSelector'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { useToggleWalletDrawer } from 'components/WalletDropdown'
import { useLmtNFTPositionManager } from 'hooks/useContract'
import usePrevious from 'hooks/usePrevious'
import { useSingleCallResult } from 'lib/hooks/multicall'
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
import { useTheme } from 'styled-components/macro'
import { addressesAreEquivalent } from 'utils/addressesAreEquivalent'
import { NonfungiblePositionManager as LmtNFTPositionManager } from 'utils/lmtSDK/NFTPositionManager'

import CurrencyInputPanel from '../../components/BaseSwapPanel'
import { ButtonPrimary, ButtonText } from '../../components/Button'
import { BlueCard, OutlineCard, YellowCard } from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import HoverInlineText from '../../components/HoverInlineText'
import { AddRemoveTabs } from '../../components/NavigationTabs'
import RangeSelector from '../../components/RangeSelector'
import { PresetsButtons } from '../../components/RangeSelector/PresetsButtons'
import RateToggle from '../../components/RateToggle'
import Row, { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import { LMT_NFT_POSITION_MANAGER, NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from '../../constants/addresses'
import { ZERO_PERCENT } from '../../constants/misc'
import { WRAPPED_NATIVE_CURRENCY } from '../../constants/tokens'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useArgentWalletContract } from '../../hooks/useArgentWalletContract'
import { useDerivedPositionInfo } from '../../hooks/useDerivedPositionInfo'
import { useIsSwapUnsupported } from '../../hooks/useIsSwapUnsupported'
import { useStablecoinValue } from '../../hooks/useStablecoinPrice'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { useLmtLpPositionFromTokenId } from '../../hooks/useV3Positions'
import { Bound, Field } from '../../state/mint/v3/actions'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { TransactionType } from '../../state/transactions/types'
import { useIsExpertMode, useUserSlippageToleranceWithDefault } from '../../state/user/hooks'
import { ThemedText } from '../../theme'
import approveAmountCalldata from '../../utils/approveAmountCalldata'
import { calculateGasMargin } from '../../utils/calculateGasMargin'
import { currencyId } from '../../utils/currencyId'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { Dots } from '../Pool/styleds'
import { Review } from './Review'
import {
  DynamicSection,
  LeftSection,
  MediumOnly,
  PageWrapper,
  PositionPreviewWrapper,
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

const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

export default function AddLiquidity() {
  const navigate = useNavigate()
  const {
    currencyIdA,
    currencyIdB,
    feeAmount: feeAmountFromUrl,
    tokenId,
  } = useParams<{ currencyIdA?: string; currencyIdB?: string; feeAmount?: string; tokenId?: string }>()
  const { account, chainId, provider } = useWeb3React()
  const theme = useTheme()

  const toggleWalletDrawer = useToggleWalletDrawer() // toggle wallet when disconnected
  const expertMode = useIsExpertMode()
  const addTransaction = useTransactionAdder()
  // const positionManager = useV3NFTPositionManagerContract()
  const lmtPositionManager = useLmtNFTPositionManager()

  // check for existing position if tokenId in url
  const { position: existingPositionDetails, loading: positionLoading } = useLmtLpPositionFromTokenId(
    tokenId ? BigNumber.from(tokenId) : undefined
  )

  const hasExistingPosition = !!existingPositionDetails && !positionLoading
  const { position: existingPosition } = useDerivedPositionInfo(existingPositionDetails)

  // fee selection from url
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
  } = useDerivedLmtMintInfo(
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    baseCurrency ?? undefined,
    existingPosition
  )

  // console.log("baseCurrency: ", baseCurrency)
  // console.log("quoteCurrency: ", quoteCurrency)
  // console.log("pool1: ", usePool(baseCurrency?? undefined , quoteCurrency ?? undefined, feeAmount))
  // console.log('pool: ', pool)

  const { onFieldAInput, onFieldBInput, onLeftRangeInput, onRightRangeInput, onStartPriceInput } =
    useV3MintActionHandlers(noLiquidity)

  const isValid = !errorMessage && !invalidRange

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

  const usdcValues = {
    [Field.CURRENCY_A]: useStablecoinValue(parsedAmounts[Field.CURRENCY_A]),
    [Field.CURRENCY_B]: useStablecoinValue(parsedAmounts[Field.CURRENCY_B]),
  }

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

  const argentWalletContract = useArgentWalletContract()

  const [approvalAmountA, approvalAmountB] = useMemo(() => {
    if (baseCurrency && quoteCurrency) {
      return [
        parsedAmounts[Field.CURRENCY_A]?.add(CurrencyAmount.fromRawAmount(baseCurrency, '100')),
        parsedAmounts[Field.CURRENCY_B]?.add(CurrencyAmount.fromRawAmount(quoteCurrency, '100')),
      ]
    }
    return [undefined, undefined]
  }, [baseCurrency, quoteCurrency, parsedAmounts])

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    argentWalletContract ? undefined : approvalAmountA,
    chainId ? LMT_NFT_POSITION_MANAGER[chainId] : undefined
  )

  const [approvalB, approveBCallback] = useApproveCallback(
    argentWalletContract ? undefined : approvalAmountB,
    chainId ? LMT_NFT_POSITION_MANAGER[chainId] : undefined
  )

  const allowedSlippage = useUserSlippageToleranceWithDefault(
    outOfRange ? ZERO_PERCENT : DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE
  )

  async function onAdd() {
    if (!chainId || !provider || !account) return

    if (!lmtPositionManager || !baseCurrency || !quoteCurrency || !approvalAmountA || !approvalAmountB || !pool) {
      return
    }

    if (position && account && deadline) {
      const useNative = baseCurrency.isNative ? baseCurrency : quoteCurrency.isNative ? quoteCurrency : undefined

      const baseIsToken0 = baseCurrency.wrapped.sortsBefore(quoteCurrency.wrapped)
      const { calldata, value } =
        hasExistingPosition && tokenId
          ? LmtNFTPositionManager.addCallParameters(
              position,
              {
                tokenId,
                slippageTolerance: allowedSlippage,
                deadline: Math.floor(new Date().getTime() / 1000 + 20 * 60).toString(),
                useNative,
              },
              baseIsToken0 ? approvalAmountA.quotient : approvalAmountB.quotient,
              baseIsToken0 ? approvalAmountB.quotient : approvalAmountA.quotient
            )
          : LmtNFTPositionManager.addCallParameters(
              position,
              {
                slippageTolerance: allowedSlippage,
                recipient: account,
                deadline: Math.floor(new Date().getTime() / 1000 + 20 * 60).toString(),
                // useNative,
                // createPool: noLiquidity,
              },
              baseIsToken0 ? approvalAmountA.quotient : approvalAmountB.quotient,
              baseIsToken0 ? approvalAmountB.quotient : approvalAmountA.quotient
            )

      let txn: { to: string; data: string; value: string } = {
        to: LMT_NFT_POSITION_MANAGER[chainId],
        data: calldata,
        value,
      }

      if (argentWalletContract) {
        const amountA = parsedAmounts[Field.CURRENCY_A]
        const amountB = parsedAmounts[Field.CURRENCY_B]
        const batch = [
          ...(amountA && amountA.currency.isToken
            ? [approveAmountCalldata(amountA, NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId])]
            : []),
          ...(amountB && amountB.currency.isToken
            ? [approveAmountCalldata(amountB, NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId])]
            : []),
          {
            to: txn.to,
            data: txn.data,
            value: txn.value,
          },
        ]
        const data = argentWalletContract.interface.encodeFunctionData('wc_multiCall', [batch])
        txn = {
          to: argentWalletContract.address,
          data,
          value: '0x0',
        }
      }

      setAttemptingTxn(true)

      provider
        .getSigner()
        .estimateGas(txn)
        .then((estimate) => {
          const newTxn = {
            ...txn,
            gasLimit: calculateGasMargin(estimate),
          }

          return provider
            .getSigner()
            .sendTransaction(newTxn)
            .then((response: TransactionResponse) => {
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

  const handleCurrencySelect = useCallback(
    (currencyNew: Currency, currencyIdOther?: string): (string | undefined)[] => {
      const currencyIdNew = currencyId(currencyNew)

      if (currencyIdNew === currencyIdOther) {
        // not ideal, but for now clobber the other if the currency ids are equal
        return [currencyIdNew, undefined]
      } else {
        // prevent weth + eth
        const isETHOrWETHNew =
          currencyIdNew === 'ETH' ||
          (chainId !== undefined && currencyIdNew === WRAPPED_NATIVE_CURRENCY[chainId]?.address)
        const isETHOrWETHOther =
          currencyIdOther !== undefined &&
          (currencyIdOther === 'ETH' ||
            (chainId !== undefined && currencyIdOther === WRAPPED_NATIVE_CURRENCY[chainId]?.address))

        if (isETHOrWETHNew && isETHOrWETHOther) {
          return [currencyIdNew, undefined]
        } else {
          return [currencyIdNew, currencyIdOther]
        }
      }
    },
    [chainId]
  )

  const handleCurrencyASelect = useCallback(
    (currencyANew: Currency) => {
      const [idA, idB] = handleCurrencySelect(currencyANew, currencyIdB)
      if (idB === undefined) {
        navigate(`/add/${idA}`)
      } else {
        navigate(`/add/${idA}/${idB}/${500}`)
      }
    },
    [handleCurrencySelect, currencyIdB, navigate]
  )

  const handleCurrencyBSelect = useCallback(
    (currencyBNew: Currency) => {
      const [idB, idA] = handleCurrencySelect(currencyBNew, currencyIdA)
      if (idA === undefined) {
        navigate(`/add/${idB}`)
      } else {
        navigate(`/add/${idA}/${idB}/${500}`)
      }
    },
    [handleCurrencySelect, currencyIdA, navigate]
  )

  const handleFeePoolSelect = useCallback(
    (newFeeAmount: FeeAmount) => {
      onLeftRangeInput('')
      onRightRangeInput('')
      navigate(`/add/${currencyIdA}/${currencyIdB}/${newFeeAmount}`)
    },
    [currencyIdA, currencyIdB, navigate, onLeftRangeInput, onRightRangeInput]
  )

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
    navigate(`/add`)
  }, [navigate, onFieldAInput, onFieldBInput, onLeftRangeInput, onRightRangeInput])

  // get value and prices at ticks
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks

  // if(baseCurrency&& quoteCurrency){
  //   if ('address' in baseCurrency && 'address' in quoteCurrency){
  //   const baseIsToken0 = baseCurrency.wrapped.sortsBefore(quoteCurrency.wrapped)
  //   console.log('bae', baseCurrency)
  //   const data =  useRateAndUtil(
  //     baseIsToken0? baseCurrency?.address: quoteCurrency?.address,
  //     baseIsToken0? quoteCurrency?.address: baseCurrency?.address,
  //     feeAmount,
  //     tickLower,
  //     tickUpper
  //     )
  //   console.log('data', data?.apr.toString(), data?.utilTotal.toString())
  //   }

  // }

  const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper, getSetFullRange } =
    useRangeHopCallbacks(baseCurrency ?? undefined, quoteCurrency ?? undefined, feeAmount, tickLower, tickUpper, pool)

  // we need an existence check on parsed amounts for single-asset deposits
  const showApprovalA =
    !argentWalletContract && approvalA !== ApprovalState.APPROVED && !!parsedAmounts[Field.CURRENCY_A]
  const showApprovalB =
    !argentWalletContract && approvalB !== ApprovalState.APPROVED && !!parsedAmounts[Field.CURRENCY_B]

  const pendingText = `Supplying ${!depositADisabled ? parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) : ''} ${
    !depositADisabled ? currencies[Field.CURRENCY_A]?.symbol : ''
  } ${!outOfRange ? 'and' : ''} ${!depositBDisabled ? parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) : ''} ${
    !depositBDisabled ? currencies[Field.CURRENCY_B]?.symbol : ''
  }`

  const [searchParams, setSearchParams] = useSearchParams()

  const handleSetRecommendedRange = useCallback(() => {
    const minPrice = pricesAtLimit[Bound.LOWER]
    if (minPrice)
      onLeftRangeInput(
        (Number(invertPrice ? price?.invert().toSignificant(6) : price?.toSignificant(6)) * 0.9).toString()
      )
    const maxPrice = pricesAtLimit[Bound.UPPER]
    if (maxPrice)
      onRightRangeInput(
        (Number(invertPrice ? price?.invert().toSignificant(6) : price?.toSignificant(6)) * 1.1).toString()
      )
    setSearchParams(searchParams)

    sendEvent({
      category: 'Liquidity',
      action: 'Recommended Range Clicked',
    })
  }, [pricesAtLimit, searchParams, setSearchParams, invertPrice, price])

  const handleSetFullRange = useCallback(() => {
    getSetFullRange()

    const minPrice = pricesAtLimit[Bound.LOWER]
    if (minPrice) searchParams.set('minPrice', minPrice.toSignificant(5))
    const maxPrice = pricesAtLimit[Bound.UPPER]
    if (maxPrice) searchParams.set('maxPrice', maxPrice.toSignificant(5))
    setSearchParams(searchParams)

    sendEvent({
      category: 'Liquidity',
      action: 'Full Range Clicked',
    })
  }, [getSetFullRange, pricesAtLimit, searchParams, setSearchParams])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

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
          isValid && (
            <RowBetween>
              {showApprovalA && (
                <StyledButtonPrimary
                  onClick={approveACallback}
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
                  onClick={approveBCallback}
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
          )}
        <StyledButtonError
          onClick={() => {
            expertMode ? onAdd() : setShowConfirm(true)
          }}
          disabled={
            !isValid ||
            (!argentWalletContract && approvalA !== ApprovalState.APPROVED && !depositADisabled) ||
            (!argentWalletContract && approvalB !== ApprovalState.APPROVED && !depositBDisabled)
          }
          error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
        >
          <Text fontWeight={500}>{errorMessage ? errorMessage : <Trans>Preview</Trans>}</Text>
        </StyledButtonError>
      </AutoColumn>
    )

  const usdcValueCurrencyA = usdcValues[Field.CURRENCY_A]
  const usdcValueCurrencyB = usdcValues[Field.CURRENCY_B]
  const currencyAFiat = useMemo(
    () => ({
      data: usdcValueCurrencyA ? parseFloat(usdcValueCurrencyA.toSignificant()) : undefined,
      isLoading: false,
    }),
    [usdcValueCurrencyA]
  )
  const currencyBFiat = useMemo(
    () => ({
      data: usdcValueCurrencyB ? parseFloat(usdcValueCurrencyB.toSignificant()) : undefined,
      isLoading: false,
    }),
    [usdcValueCurrencyB]
  )

  const owner = useSingleCallResult(tokenId ? lmtPositionManager : null, 'ownerOf', [tokenId]).result?.[0]
  const ownsNFT =
    addressesAreEquivalent(owner, account) || addressesAreEquivalent(existingPositionDetails?.operator, account)
  const showOwnershipWarning = Boolean(hasExistingPosition && account && !ownsNFT)

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
                  existingPosition={existingPosition}
                  priceLower={priceLower}
                  priceUpper={priceUpper}
                  outOfRange={outOfRange}
                  ticksAtLimit={ticksAtLimit}
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
        <PageWrapper wide={!hasExistingPosition}>
          <AddRemoveTabs
            creating={false}
            adding={true}
            positionID={tokenId}
            defaultSlippage={DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE}
            showBackLink={!hasExistingPosition}
          >
            {!hasExistingPosition && (
              <Row justifyContent="flex-end" style={{ width: 'fit-content', minWidth: 'fit-content' }}>
                <MediumOnly>
                  <ButtonText onClick={clearAll} margin="0 15px 0 0">
                    <ThemedText.DeprecatedWhite fontSize="12px">
                      <Trans>Reset</Trans>
                    </ThemedText.DeprecatedWhite>
                  </ButtonText>
                </MediumOnly>
              </Row>
            )}
          </AddRemoveTabs>
          {hasExistingPosition && existingPosition && (
            <PositionPreviewWrapper>
              <PositionPreview
                position={existingPosition}
                title={<ThemedText.BodyPrimary fontWeight={700}>Selected Range</ThemedText.BodyPrimary>}
                inRange={!outOfRange}
                ticksAtLimit={ticksAtLimit}
              />

              <AutoColumn justify="center" gap="md">
                <div style={{ width: '90%' }}>
                  <ThemedText.BodyPrimary fontWeight={700} mb="10px">
                    {hasExistingPosition ? <Trans>Additional liquidity</Trans> : <Trans>Deposit Amounts</Trans>}
                  </ThemedText.BodyPrimary>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <CurrencyInputPanel
                      value={formattedAmounts[Field.CURRENCY_A]}
                      onUserInput={onFieldAInput}
                      onMax={() => {
                        onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                      }}
                      showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                      currency={currencies[Field.CURRENCY_A] ?? null}
                      id="add-liquidity-input-tokena"
                      fiatValue={currencyAFiat}
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
                      fiatValue={currencyBFiat}
                      currency={currencies[Field.CURRENCY_B] ?? null}
                      id="add-liquidity-input-tokenb"
                      showCommonBases
                      locked={depositBDisabled}
                    />
                  </div>
                </div>
              </AutoColumn>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <Buttons />
              </div>
            </PositionPreviewWrapper>
          )}
          <Wrapper>
            <SectionWrapper>
              <LeftSection>
                <AutoColumn gap="lg">
                  {!hasExistingPosition && (
                    <>
                      <AutoColumn gap="md">
                        <RowBetween paddingBottom="20px">
                          <ThemedText.BodyPrimary>
                            <Trans>Select Pair</Trans>
                          </ThemedText.BodyPrimary>
                        </RowBetween>
                        <RowBetween padding="1rem" justify="start" gap="0px">
                          {/* <CurrencyDropdown
                            value={formattedAmounts[Field.CURRENCY_A]}
                            onUserInput={onFieldAInput}
                            hideInput={true}
                            onMax={() => {
                              onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                            }}
                            onCurrencySelect={handleCurrencyASelect}
                            showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                            currency={currencies[Field.CURRENCY_A] ?? null}
                            id="add-liquidity-input-tokena"
                            showCommonBases
                          />
                          <CurrencyDropdown
                            value={formattedAmounts[Field.CURRENCY_B]}
                            hideInput={true}
                            onUserInput={onFieldBInput}
                            onCurrencySelect={handleCurrencyBSelect}
                            onMax={() => {
                              onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
                            }}
                            showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
                            currency={currencies[Field.CURRENCY_B] ?? null}
                            id="add-liquidity-input-tokenb"
                            showCommonBases
                          /> */}
                          <PoolSelector bg={true} largeWidth={true} />
                        </RowBetween>
                      </AutoColumn>{' '}
                    </>
                  )}
                </AutoColumn>
                <div>
                  {!hasExistingPosition ? (
                    <>
                      {/* <HideMedium>
                        <Buttons />
                      </HideMedium> */}
                      <RightContainer gap="lg">
                        <DynamicSection gap="md" disabled={!feeAmount || invalidPool}>
                          {!noLiquidity ? (
                            <>
                              <RowBetween></RowBetween>
                              <RowBetween style={{ marginBottom: '30px' }}>
                                <ThemedText.BodyPrimary>
                                  <Trans>Select Price Range</Trans>
                                </ThemedText.BodyPrimary>

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
                              </RowBetween>

                              {price && baseCurrency && quoteCurrency && !noLiquidity && (
                                <AutoRow gap="4px" justify="left" style={{ marginTop: '0.5rem' }}>
                                  <Trans>
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                      <ThemedText.DeprecatedMain
                                        fontWeight={500}
                                        textAlign="center"
                                        fontSize={12}
                                        color="text1"
                                      >
                                        Current Price:
                                      </ThemedText.DeprecatedMain>
                                      <ThemedText.DeprecatedBody
                                        fontWeight={500}
                                        textAlign="center"
                                        fontSize={12}
                                        color="text1"
                                      >
                                        <HoverInlineText
                                          maxCharacters={20}
                                          text={invertPrice ? price.invert().toSignificant(6) : price.toSignificant(6)}
                                        />
                                      </ThemedText.DeprecatedBody>
                                    </div>

                                    <ThemedText.DeprecatedBody color="text2" fontSize={11}>
                                      {quoteCurrency?.symbol} per {baseCurrency.symbol}
                                    </ThemedText.DeprecatedBody>
                                  </Trans>
                                  {!noLiquidity && <PresetsButtons onSetRecommendedRange={handleSetRecommendedRange} />}
                                </AutoRow>
                              )}

                              <LiquidityChartRangeInput
                                currencyA={baseCurrency ?? undefined}
                                currencyB={quoteCurrency ?? undefined}
                                feeAmount={feeAmount}
                                ticksAtLimit={ticksAtLimit}
                                price={
                                  price
                                    ? parseFloat((invertPrice ? price.invert() : price).toSignificant(8))
                                    : undefined
                                }
                                priceLower={priceLower}
                                priceUpper={priceUpper}
                                onLeftRangeInput={onLeftRangeInput}
                                onRightRangeInput={onRightRangeInput}
                                interactive={!hasExistingPosition}
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
                                      This pool must be initialized before you can add liquidity. To initialize, select
                                      a starting price for the pool.
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
                                          text={
                                            invertPrice ? price?.invert()?.toSignificant(5) : price?.toSignificant(5)
                                          }
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
                                {/*!noLiquidity && <PresetsButtons onSetFullRange={handleSetFullRange} />*/}
                                {/*!noLiquidity && <PresetsButtonsFull onSetFullRange={handleSetFullRange} />*/}
                              </AutoColumn>
                            </StackedItem>
                          </StackedContainer>

                          {outOfRange ? (
                            <YellowCard padding="8px 12px" $borderRadius="12px">
                              <RowBetween>
                                {/*<AlertTriangle stroke={theme.deprecated_primary2} size="16px" />*/}
                                <ThemedText.DeprecatedLabel ml="12px" fontSize="12px">
                                  <Trans>
                                    Your position will earn only premiums when out of range, but trading fees as well
                                    when in range.
                                  </Trans>
                                </ThemedText.DeprecatedLabel>
                              </RowBetween>
                            </YellowCard>
                          ) : null}

                          {Number(priceUpper?.toSignificant()) / Number(priceLower?.toSignificant()) > 2 ? (
                            <YellowCard padding="8px 12px" $borderRadius="12px">
                              <RowBetween>
                                {/*<AlertTriangle stroke={theme.deprecated_primary2} size="16px" />*/}
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
                              <RowBetween>
                                <AlertTriangle stroke={theme.deprecated_yellow3} size="16px" />
                                <ThemedText.DeprecatedYellow ml="12px" fontSize="12px">
                                  <Trans>Invalid range selected. The min price must be lower than the max price.</Trans>
                                </ThemedText.DeprecatedYellow>
                              </RowBetween>
                            </YellowCard>
                          ) : null}
                        </DynamicSection>
                      </RightContainer>
                    </>
                  ) : null}
                </div>

                {/*<DynamicSection
                  disabled={tickLower === undefined || tickUpper === undefined || invalidPool || invalidRange}
                >
                  <AutoColumn gap="md">
                    <ThemedText.DeprecatedLabel>
                      {hasExistingPosition ? <Trans>Add more liquidity</Trans> : <Trans>Deposit Amounts</Trans>}
                    </ThemedText.DeprecatedLabel>

                    <CurrencyInputPanel
                      value={formattedAmounts[Field.CURRENCY_A]}
                      onUserInput={onFieldAInput}
                      onMax={() => {
                        onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                      }}
                      showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                      currency={currencies[Field.CURRENCY_A] ?? null}
                      id="add-liquidity-input-tokena"
                      fiatValue={currencyAFiat}
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
                      fiatValue={currencyBFiat}
                      currency={currencies[Field.CURRENCY_B] ?? null}
                      id="add-liquidity-input-tokenb"
                      showCommonBases
                      locked={depositBDisabled}
                    />
                  </AutoColumn>
                </DynamicSection>*/}

                {/*  {!hasExistingPosition ? (
                <>
                  <HideMedium>
                    <Buttons />
                  </HideMedium>
                  <RightContainer gap="lg">
                    <DynamicSection gap="md" disabled={!feeAmount || invalidPool}>
                      {!noLiquidity ? (
                        <>
                          <RowBetween>
                            <ThemedText.DeprecatedLabel>
                              <Trans>Set Price Range</Trans>
                            </ThemedText.DeprecatedLabel>
                          </RowBetween>

                          {price && baseCurrency && quoteCurrency && !noLiquidity && (
                            <AutoRow gap="4px" justify="center" style={{ marginTop: '0.5rem' }}>
                              <Trans>
                                <ThemedText.DeprecatedMain
                                  fontWeight={500}
                                  textAlign="center"
                                  fontSize={12}
                                  color="text1"
                                >
                                  Current Price:
                                </ThemedText.DeprecatedMain>
                                <ThemedText.DeprecatedBody
                                  fontWeight={500}
                                  textAlign="center"
                                  fontSize={12}
                                  color="text1"
                                >
                                  <HoverInlineText
                                    maxCharacters={20}
                                    text={invertPrice ? price.invert().toSignificant(6) : price.toSignificant(6)}
                                  />
                                </ThemedText.DeprecatedBody>
                                <ThemedText.DeprecatedBody color="text2" fontSize={12}>
                                  {quoteCurrency?.symbol} per {baseCurrency.symbol}
                                </ThemedText.DeprecatedBody>
                              </Trans>
                            </AutoRow>
                          )}

                          {/*<LiquidityChartRangeInput
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
                            interactive={!hasExistingPosition}
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
                              <ThemedText.DeprecatedBody
                                fontSize={14}
                                style={{ fontWeight: 500 }}
                                textAlign="left"
                                color={theme.accentAction}
                              >
                                <Trans>
                                  This pool must be initialized before you can add liquidity. To initialize, select a
                                  starting price for the pool. Then, enter your liquidity price range and deposit
                                  amount. Gas fees will be higher than usual due to the initialization transaction.
                                </Trans>
                              </ThemedText.DeprecatedBody>
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
                            {!noLiquidity && <PresetsButtons onSetFullRange={handleSetFullRange} />}
                          </AutoColumn>
                        </StackedItem>
                      </StackedContainer>

                      {outOfRange ? (
                        <YellowCard padding="8px 12px" $borderRadius="12px">
                          <RowBetween>
                            <AlertTriangle stroke={theme.deprecated_yellow3} size="16px" />
                            <ThemedText.DeprecatedYellow ml="12px" fontSize="12px">
                              <Trans>
                                Your position will not earn fees or be used in trades until the market price moves into
                                your range.
                              </Trans>
                            </ThemedText.DeprecatedYellow>
                          </RowBetween>
                        </YellowCard>
                      ) : null}

                      {invalidRange ? (
                        <YellowCard padding="8px 12px" $borderRadius="12px">
                          <RowBetween>
                            <AlertTriangle stroke={theme.deprecated_yellow3} size="16px" />
                            <ThemedText.DeprecatedYellow ml="12px" fontSize="12px">
                              <Trans>Invalid range selected. The min price must be lower than the max price.</Trans>
                            </ThemedText.DeprecatedYellow>
                          </RowBetween>
                        </YellowCard>
                      ) : null}
                    </DynamicSection>

                    <MediumOnly>
                      <Buttons />
                    </MediumOnly>
                  </RightContainer>
                </>
              ) : (
                <Buttons />
              )}*/}
                {/*</ResponsiveTwoColumns>*/}
              </LeftSection>
              <RightSection>
                {!hasExistingPosition && (
                  <>
                    <FeeSelector
                      disabled={!quoteCurrency || !baseCurrency}
                      feeAmount={feeAmount}
                      handleFeePoolSelect={handleFeePoolSelect}
                      currencyA={baseCurrency ?? undefined}
                      currencyB={quoteCurrency ?? undefined}
                    />
                  </>
                )}
                <div>
                  {!hasExistingPosition ? (
                    <>
                      {/* <HideMedium>
                        <Buttons />
                      </HideMedium> */}
                      <RightContainer gap="lg">
                        <DynamicSection disabled={!feeAmount || invalidPool || (noLiquidity && !startPriceTypedValue)}>
                          <ThemedText.BodyPrimary style={{ marginBottom: '10px', marginTop: '10px' }}>
                            {hasExistingPosition ? <Trans>Add more liquidity</Trans> : <Trans>Deposit Amounts</Trans>}
                          </ThemedText.BodyPrimary>

                          <CurrencyInputPanel
                            value={formattedAmounts[Field.CURRENCY_A]}
                            onUserInput={onFieldAInput}
                            onMax={() => {
                              onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                            }}
                            showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                            currency={currencies[Field.CURRENCY_A] ?? null}
                            id="add-liquidity-input-tokena"
                            fiatValue={currencyAFiat}
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
                            fiatValue={currencyBFiat}
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
                            <ThemedText.BodyPrimary style={{ marginBottom: '5px' }}>Details</ThemedText.BodyPrimary>
                            <OutlineCard>
                              <RowBetween style={{ marginBottom: '6px' }}>
                                <ThemedText.BodySmall>APR:</ThemedText.BodySmall>
                              </RowBetween>
                              <RowBetween>
                                <ThemedText.BodySmall>Utilization Rate:</ThemedText.BodySmall>
                              </RowBetween>
                            </OutlineCard>
                          </DynamicSection>
                        </AutoColumn>

                        <MediumOnly>
                          <Buttons />
                        </MediumOnly>
                      </RightContainer>
                    </>
                  ) : null}
                </div>
              </RightSection>
            </SectionWrapper>
          </Wrapper>
        </PageWrapper>
        {showOwnershipWarning && <OwnershipWarning ownerAddress={owner} />}
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
