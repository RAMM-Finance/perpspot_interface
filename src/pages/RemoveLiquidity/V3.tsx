import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import { CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { Position } from '@uniswap/v3-sdk'
import RangeBadge from 'components/Badge/RangeBadge'
import { ButtonConfirmed, ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { Break } from 'components/earn/styled'
import FormattedCurrencyAmount from 'components/FormattedCurrencyAmount'
import Loader from 'components/Icons/LoadingSpinner'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { AddRemoveTabs } from 'components/NavigationTabs'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import Slider from 'components/Slider'
import Toggle from 'components/Toggle'
import { LMT_NFT_POSITION_MANAGER } from 'constants/addresses'
import { useCurrency, useToken } from 'hooks/Tokens'
import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
import { usePool } from 'hooks/usePools'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useLmtLpPositionFromTokenId } from 'hooks/useV3Positions'
import JSBI from 'jsbi'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { DarkCardOutline } from 'pages/Pool/PositionPage'
import { useCallback, useMemo, useState } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { Text } from 'rebass'
import { useBurnV3ActionHandlers, useBurnV3State, useDerivedLmtBurnInfo } from 'state/burn/v3/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import { useUserSlippageToleranceWithDefault } from 'state/user/hooks'
import { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { currencyId } from 'utils/currencyId'
import { NonfungiblePositionManager as LmtNFTPositionManager } from 'utils/lmtSDK/NFTPositionManager'
import { useAccount, useChainId } from 'wagmi'
import { useEthersProvider, useEthersSigner } from 'wagmi-lib/adapters'

import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import { WRAPPED_NATIVE_CURRENCY } from '../../constants/tokens'
import AppBody from '../AppBody'
import { ResponsiveHeaderText, SmallMaxButton, Wrapper } from './styled'
const DEFAULT_REMOVE_V3_LIQUIDITY_SLIPPAGE_TOLERANCE = new Percent(5, 100)

// redirect invalid tokenIds
export default function RemoveLiquidityV3() {
  const { tokenId } = useParams<{ tokenId: string }>()
  const location = useLocation()
  const parsedTokenId = useMemo(() => {
    try {
      return BigNumber.from(tokenId)
    } catch {
      return null
    }
  }, [tokenId])

  if (parsedTokenId === null || parsedTokenId.eq(0)) {
    return <Navigate to={{ ...location, pathname: '/pools' }} replace />
  }

  return <Remove tokenId={parsedTokenId} />
}

function Remove({ tokenId }: { tokenId: BigNumber }) {
  const navigate = useNavigate()
  // const { position } = useV3PositionFromTokenId(tokenId)
  const { position: lmtPosition, loading } = useLmtLpPositionFromTokenId(tokenId)
  const theme = useTheme()
  const account = useAccount().address
  const chainId = useChainId()
  const provider = useEthersProvider({ chainId })
  const signer = useEthersSigner({ chainId })

  // flag for receiving WETH
  const [receiveWETH, setReceiveWETH] = useState(false)
  const nativeCurrency = useNativeCurrency()
  const nativeWrappedSymbol = nativeCurrency.wrapped.symbol

  // burn state
  const { percent } = useBurnV3State()
  const {
    position: positionSDK,
    liquidityPercentage,
    liquidityValue0,
    liquidityValue1,
    feeValue0,
    feeValue1,
    outOfRange,
    error,
    maxLiquidityToWithdraw,
  } = useDerivedLmtBurnInfo(lmtPosition, receiveWETH, loading)
  const { onPercentSelect } = useBurnV3ActionHandlers()

  const removed = lmtPosition?.liquidity?.eq(0)

  // boilerplate for the slider
  const [percentForSlider, onPercentSelectForSlider] = useDebouncedChangeHandler(percent, onPercentSelect)

  const deadline = useTransactionDeadline() // custom from users settings
  const allowedSlippage = useUserSlippageToleranceWithDefault(DEFAULT_REMOVE_V3_LIQUIDITY_SLIPPAGE_TOLERANCE) // custom from users

  const [showConfirm, setShowConfirm] = useState(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txnHash, setTxnHash] = useState<string | undefined>()
  const addTransaction = useTransactionAdder()

  const burn = useCallback(async () => {
    setAttemptingTxn(true)
    if (
      !liquidityValue0 ||
      !liquidityValue1 ||
      !deadline ||
      !account ||
      !chainId ||
      !positionSDK ||
      !liquidityPercentage ||
      !signer ||
      !maxLiquidityToWithdraw ||
      !tokenId
    ) {
      return
    }
    // position: Position,
    // options: RemoveLiquidityOptions,
    // account: string,
    // computedAmount0: JSBI,
    // computedAmount1: JSBI
    // we fall back to expecting 0 fees in case the fetch fails, which is safe in the
    // vast majority of cases
    const { calldata, value } = LmtNFTPositionManager.removeCallParameters(
      positionSDK,
      {
        tokenId: tokenId.toString(),
        liquidityPercentage,
        slippageTolerance: allowedSlippage,
        deadline: deadline.toString(),
        collectOptions: {
          expectedCurrencyOwed0: feeValue0 ?? CurrencyAmount.fromRawAmount(liquidityValue0.currency, 0),
          expectedCurrencyOwed1: feeValue1 ?? CurrencyAmount.fromRawAmount(liquidityValue1.currency, 0),
          recipient: account,
        },
      },
      account,
      liquidityValue0.quotient,
      liquidityValue1.quotient,
      JSBI.BigInt(maxLiquidityToWithdraw.toString())
    )

    const txn = {
      to: LMT_NFT_POSITION_MANAGER[chainId], // positionManager.address,
      data: calldata,
      value,
    }

    signer
      .estimateGas(txn)
      .then((estimate) => {
        const newTxn = {
          ...txn,
          gasLimit: calculateGasMargin(estimate),
        }

        return signer.sendTransaction(newTxn).then((response: TransactionResponse) => {
          setTxnHash(response.hash)
          setAttemptingTxn(false)
          addTransaction(response, {
            type: TransactionType.REMOVE_LMT_LIQUIDITY,
            baseCurrencyId: currencyId(liquidityValue0.currency),
            quoteCurrencyId: currencyId(liquidityValue1.currency),
            expectedAmountBaseRaw: liquidityValue0.quotient.toString(),
            expectedAmountQuoteRaw: liquidityValue1.quotient.toString(),
          })
          navigate('/pools')
        })
      })
      .catch((error) => {
        setAttemptingTxn(false)
        console.error('error?:', error)
      })
  }, [
    liquidityValue0,
    liquidityValue1,
    deadline,
    account,
    chainId,
    feeValue0,
    feeValue1,
    positionSDK,
    liquidityPercentage,
    navigate,
    signer,
    tokenId,
    allowedSlippage,
    addTransaction,
    maxLiquidityToWithdraw,
  ])

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txnHash) {
      onPercentSelectForSlider(0)
    }
    setAttemptingTxn(false)
    setTxnHash('')
  }, [onPercentSelectForSlider, txnHash])

  const pendingText = (
    <Trans>
      Removing {liquidityValue0?.toSignificant(6)} {liquidityValue0?.currency?.symbol} and{' '}
      {liquidityValue1?.toSignificant(6)} {liquidityValue1?.currency?.symbol}
    </Trans>
  )

  const { tokenId: tokenIdFromUrl } = useParams<{ tokenId?: string }>()

  const parsedTokenId = tokenIdFromUrl ? BigNumber.from(tokenIdFromUrl) : undefined
  // const { loading, position: positionDetails } = useV3PositionFromTokenId(parsedTokenId)
  const {
    loading: lmtPositionLoading,
    position: lmtPositionDetails,
    // maxWithdrawable: maxWithdrawableValue,
  } = useLmtLpPositionFromTokenId(parsedTokenId)
  // console.log('lmtPositionDetails', lmtPositionDetails)
  const {
    token0: token0Address,
    token1: token1Address,
    fee: feeAmount,
    liquidity,
    tickLower,
    tickUpper,
  } = lmtPositionDetails || {}

  const maxWithdrawableLiquidity = maxLiquidityToWithdraw?.toString()

  const token0 = useToken(token0Address)
  const token1 = useToken(token1Address)
  const currency0 = useCurrency(token0Address)
  const currency1 = useCurrency(token1Address)

  // construct Position from details returned
  const [poolState, pool] = usePool(token0 ?? undefined, token1 ?? undefined, feeAmount)
  const position = useMemo(() => {
    if (pool && liquidity && typeof tickLower === 'number' && typeof tickUpper === 'number' && !lmtPositionLoading) {
      return new Position({ pool, liquidity: liquidity.toString(), tickLower, tickUpper })
    }
    return undefined
  }, [liquidity, pool, tickLower, tickUpper, lmtPositionLoading])

  const maxWithdrawablePosition = useMemo(() => {
    if (pool && maxWithdrawableLiquidity && typeof tickLower === 'number' && typeof tickUpper === 'number') {
      return new Position({ pool, liquidity: maxWithdrawableLiquidity, tickLower, tickUpper })
    }
    return undefined
  }, [maxWithdrawableLiquidity, pool, tickLower, tickUpper])

  let maxWithdrawableToken0
  let maxWithdrawableToken1
  let maximumWithdrawablePercentage
  if (maxWithdrawablePosition && position) {
    if (Number(maxWithdrawableLiquidity) < Number(liquidity?.toString())) {
      maxWithdrawableToken0 = maxWithdrawablePosition.amount0.toSignificant(4)
      maxWithdrawableToken1 = maxWithdrawablePosition.amount1.toSignificant(4)
      maximumWithdrawablePercentage = Math.round(
        (100 * Number(maxWithdrawableLiquidity)) / Number(liquidity?.toString())
      )
    } else {
      maxWithdrawableToken0 = position.amount0.toSignificant(4)
      maxWithdrawableToken1 = position.amount1.toSignificant(4)
      maximumWithdrawablePercentage = 100
    }
  }

  function modalHeader() {
    return (
      <AutoColumn gap="sm" style={{ padding: '16px' }}>
        <RowBetween align="flex-end">
          <Text fontSize={16} fontWeight={500}>
            <Trans>Pooled {currency0?.symbol}:</Trans>
          </Text>
          <RowFixed>
            <Text fontSize={16} fontWeight={500} marginLeft="6px">
              {liquidityValue0 && <FormattedCurrencyAmount currencyAmount={liquidityValue0} />}
            </Text>
            <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency0} />
          </RowFixed>
        </RowBetween>
        <RowBetween align="flex-end">
          <Text fontSize={16} fontWeight={500}>
            <Trans>Pooled {currency1?.symbol}:</Trans>
          </Text>
          <RowFixed>
            <Text fontSize={16} fontWeight={500} marginLeft="6px">
              {liquidityValue1 && <FormattedCurrencyAmount currencyAmount={liquidityValue1} />}
            </Text>
            <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency1} />
          </RowFixed>
        </RowBetween>
        {feeValue0?.greaterThan(0) || feeValue1?.greaterThan(0) ? (
          <>
            <ThemedText.DeprecatedItalic fontSize={12} color={theme.textSecondary} textAlign="left" padding="8px 0 0 0">
              <Trans>You will also collect fees + premiums earned from this position.</Trans>
            </ThemedText.DeprecatedItalic>
            <RowBetween>
              <Text fontSize={16} fontWeight={500}>
                <Trans>{currency0?.symbol} Earned:</Trans>
              </Text>
              <RowFixed>
                <Text fontSize={16} fontWeight={500} marginLeft="6px">
                  {feeValue0 && <FormattedCurrencyAmount currencyAmount={feeValue0} />}
                </Text>
                <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency0} />
              </RowFixed>
            </RowBetween>
            <RowBetween>
              <Text fontSize={16} fontWeight={500}>
                <Trans>{currency1?.symbol} Earned:</Trans>
              </Text>
              <RowFixed>
                <Text fontSize={16} fontWeight={500} marginLeft="6px">
                  {feeValue1 && <FormattedCurrencyAmount currencyAmount={feeValue1} />}
                </Text>
                <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency1} />
              </RowFixed>
            </RowBetween>
          </>
        ) : null}
        <ButtonPrimary mt="16px" onClick={burn}>
          <Trans>Remove</Trans>
        </ButtonPrimary>
      </AutoColumn>
    )
  }

  const showCollectAsWeth = Boolean(
    liquidityValue0?.currency &&
      liquidityValue1?.currency &&
      (liquidityValue0.currency.isNative ||
        liquidityValue1.currency.isNative ||
        WRAPPED_NATIVE_CURRENCY[liquidityValue0.currency.chainId]?.equals(liquidityValue0.currency.wrapped) ||
        WRAPPED_NATIVE_CURRENCY[liquidityValue1.currency.chainId]?.equals(liquidityValue1.currency.wrapped))
  )
  return (
    <AutoColumn>
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={handleDismissConfirmation}
        attemptingTxn={attemptingTxn}
        hash={txnHash ?? ''}
        content={() => (
          <ConfirmationModalContent
            title={<Trans>Remove Liquidity</Trans>}
            onDismiss={handleDismissConfirmation}
            topContent={modalHeader}
          />
        )}
        pendingText={pendingText}
      />
      <AppBody $maxWidth="unset">
        <AddRemoveTabs
          creating={false}
          adding={false}
          positionID={tokenId.toString()}
          defaultSlippage={DEFAULT_REMOVE_V3_LIQUIDITY_SLIPPAGE_TOLERANCE}
        />
        <Wrapper>
          {lmtPosition ? (
            <AutoColumn gap="lg">
              <RowBetween>
                <RowFixed>
                  <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={16} margin={true} />
                  <ThemedText.DeprecatedLabel
                    fontSize="14px"
                    ml="8px"
                  >{`${token0?.symbol}/${token1?.symbol}`}</ThemedText.DeprecatedLabel>
                </RowFixed>
                <RangeBadge removed={removed} inRange={!outOfRange} />
              </RowBetween>
              <DarkCardOutline>
                <AutoColumn gap="md">
                  <ThemedText.DeprecatedMain fontWeight={400}>
                    <Trans>Amount</Trans>
                  </ThemedText.DeprecatedMain>
                  <RowBetween>
                    <ResponsiveHeaderText>
                      <Trans>{percentForSlider}%</Trans>
                    </ResponsiveHeaderText>
                    <AutoRow gap="4px" justify="flex-end">
                      <SmallMaxButton onClick={() => onPercentSelect(25)} width="20%">
                        <Trans>25%</Trans>
                      </SmallMaxButton>
                      <SmallMaxButton onClick={() => onPercentSelect(50)} width="20%">
                        <Trans>50%</Trans>
                      </SmallMaxButton>
                      <SmallMaxButton onClick={() => onPercentSelect(75)} width="20%">
                        <Trans>75%</Trans>
                      </SmallMaxButton>
                      <SmallMaxButton onClick={() => onPercentSelect(100)} width="20%">
                        <Trans>Max</Trans>
                      </SmallMaxButton>
                    </AutoRow>
                  </RowBetween>
                  <Slider max={100} value={percentForSlider} onChange={onPercentSelectForSlider} />
                </AutoColumn>
              </DarkCardOutline>
              <DarkCardOutline>
                <AutoColumn gap="md">
                  <RowBetween>
                    <Text fontSize={16} fontWeight={500}>
                      <Trans>Pooled {currency0?.symbol}:</Trans>
                    </Text>
                    <RowFixed>
                      <Text fontSize={16} fontWeight={500}>
                        {liquidityValue0 && <FormattedCurrencyAmount currencyAmount={liquidityValue0} />}
                      </Text>
                      <CurrencyLogo size="15px" style={{ marginLeft: '8px' }} currency={currency0} />
                    </RowFixed>
                  </RowBetween>
                  <RowBetween>
                    <Text fontSize={16} fontWeight={500}>
                      <Trans>Pooled {currency1?.symbol}:</Trans>
                    </Text>
                    <RowFixed>
                      <Text fontSize={16} fontWeight={500}>
                        {liquidityValue1 && <FormattedCurrencyAmount currencyAmount={liquidityValue1} />}
                      </Text>
                      <CurrencyLogo size="15px" style={{ marginLeft: '8px' }} currency={currency1} />
                    </RowFixed>
                  </RowBetween>
                  {feeValue0?.greaterThan(0) || feeValue1?.greaterThan(0) ? (
                    <>
                      <Break />
                      <RowBetween>
                        <Text fontSize={16} fontWeight={500}>
                          <Trans>{currency0?.symbol} Earned:</Trans>
                        </Text>
                        <RowFixed>
                          <Text fontSize={16} fontWeight={500} marginLeft="6px">
                            {feeValue0 && <FormattedCurrencyAmount currencyAmount={feeValue0} />}
                          </Text>
                          <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency0} />
                        </RowFixed>
                      </RowBetween>
                      <RowBetween>
                        <Text fontSize={16} fontWeight={500}>
                          <Trans>{currency1?.symbol} Earned:</Trans>
                        </Text>
                        <RowFixed>
                          <Text fontSize={16} fontWeight={500} marginLeft="6px">
                            {feeValue1 && <FormattedCurrencyAmount currencyAmount={feeValue1} />}
                          </Text>
                          <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency1} />
                        </RowFixed>
                      </RowBetween>
                    </>
                  ) : null}
                </AutoColumn>
              </DarkCardOutline>

              {false && showCollectAsWeth && (
                <RowBetween>
                  <ThemedText.DeprecatedMain>
                    <Trans>Collect as {nativeWrappedSymbol}</Trans>
                  </ThemedText.DeprecatedMain>
                  <Toggle
                    id="receive-as-weth"
                    isActive={receiveWETH}
                    toggle={() => setReceiveWETH((receiveWETH) => !receiveWETH)}
                  />
                </RowBetween>
              )}

              <div style={{ display: 'flex' }}>
                <AutoColumn justify="center" gap="md" style={{ flex: '1' }}>
                  <ButtonConfirmed
                    style={{ width: 'fit-content', borderRadius: '10px', height: '25px', fontSize: '14px' }}
                    confirmed={false}
                    disabled={removed || percent === 0 || !liquidityValue0}
                    onClick={() => setShowConfirm(true)}
                  >
                    {removed ? (
                      <ThemedText.BodyPrimary>
                        <Trans>Closed</Trans>
                      </ThemedText.BodyPrimary>
                    ) : (
                      error ?? (
                        <ThemedText.BodyPrimary>
                          <Trans>Remove</Trans>
                        </ThemedText.BodyPrimary>
                      )
                    )}
                  </ButtonConfirmed>
                </AutoColumn>
              </div>
            </AutoColumn>
          ) : (
            <Loader />
          )}
        </Wrapper>
      </AppBody>
    </AutoColumn>
  )
}
