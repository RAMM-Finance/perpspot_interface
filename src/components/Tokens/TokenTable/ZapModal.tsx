import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Trans } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { Currency, Percent } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { ZapTokenPanel } from 'components/BaseSwapPanel/BaseSwapPanel'
import { SmallButtonPrimary } from 'components/Button'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import Loader from 'components/Icons/LoadingSpinner'
import { LmtModal } from 'components/Modal'
import { RowBetween } from 'components/Row'
import { LmtSettingsTab } from 'components/Settings'
import { ArrowWrapper } from 'components/swap/styleds'
import { MouseoverTooltip } from 'components/Tooltip'
import { LMT_NFT_POSITION_MANAGER } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { BigNumber } from 'ethers'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useContractCallV2 } from 'hooks/useContractCall'
import { useUSDPriceBNV2 } from 'hooks/useUSDPrice'
import JSBI from 'jsbi'
import { useCurrencyBalances } from 'lib/hooks/useCurrencyBalance'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { ArrowContainer } from 'pages/Trade'
import React, { ReactNode, useCallback, useMemo, useState } from 'react'
import { ChevronDown, Info } from 'react-feather'
import { BnToCurrencyAmount, parseBN } from 'state/marginTrading/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import { useUserSlippageTolerance } from 'state/user/hooks'
import styled from 'styled-components'
import { ThemedText } from 'theme'
import { PoolKey } from 'types/lmtv2position'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { getErrorMessage, parseContractError } from 'utils/lmtSDK/errors'
import { NonfungiblePositionManager } from 'utils/lmtSDK/NFTPositionManager'

const Wrapper = styled.div`
  padding: 25px;
  display: grid;
  grid-template-rows: 50px 120px 15px 100px 110px 40px;
`
const Header = styled.div`
  padding-top: 15px;
  padding-bottom: 15px;
  display: grid;
  grid-template-columns: 40px 120px 110px 110px 30px;
  align-items: center;
`
const InputWrapper = styled.div`
  background-color: ${({ theme }) => theme.surface1};
  margin-bottom: 10px;
  padding: 10px;
  margin-top: 5px;
  &:focus-within {
    border: 1px solid ${({ theme }) => theme.accentActive};
  }
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  color: ${({ theme }) => theme.textSecondary};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
`

interface ZapModalProps {
  isOpen: boolean
  onClose: () => void
  apr: number | undefined
  tvl: number | undefined
  token0: Currency | undefined | null
  token1: Currency | undefined | null
  poolKey: PoolKey | undefined
}

enum ZapDerivedInfoState {
  LOADING,
  VALID,
  INVALID,
  SYNCING, // syncing means already loaded valid info, but updating to newest info
}

interface ZapTxnInfo {
  token0Out: BN
  token1Out: BN
  liquidity: BN
  poolKey: PoolKey
  inputAmount: BN
  inputIsToken0: boolean
  lowerDelta: number
  upperDelta: number
  maxSlippageTick: number
}

interface DerivedZapInfo {
  txnInfo: ZapTxnInfo | undefined
  userError: ReactNode | undefined
  contractError: ReactNode | undefined
  tradeState: ZapDerivedInfoState
  allowedSlippage: Percent
}

// need to do approvals
const useDerivedZapInfo = (
  inputAmount: string,
  inputIsToken0: boolean,
  poolKey: PoolKey | undefined,
  token0: Currency | undefined,
  token1: Currency | undefined,
  inputApprovalState: ApprovalState
): DerivedZapInfo => {
  const parsedAmount = useMemo(() => {
    return parseBN(inputAmount)
  }, [inputAmount])

  const { account } = useWeb3React()

  const inputCurrency = inputIsToken0 ? token0 : token1

  const relevantTokenBalances = useCurrencyBalances(
    account ?? undefined,
    useMemo(() => [token0 ?? undefined, token1 ?? undefined], [token0, token1])
  )

  const userError: ReactNode | undefined = useMemo(() => {
    let inputError: ReactNode | undefined

    if (!account) {
      inputError = <Trans>Connect Wallet</Trans>
    }

    if (!parsedAmount || parsedAmount.isZero()) {
      inputError = inputError ?? <Trans>Enter a margin amount</Trans>
    }

    const inputBalance = inputIsToken0 ? relevantTokenBalances[0] : relevantTokenBalances[1]
    if (inputBalance && parsedAmount && token0 && token1) {
      const parsedCurrencyAmount = BnToCurrencyAmount(parsedAmount, inputIsToken0 ? token0 : token1)
      if (parsedCurrencyAmount.greaterThan(inputBalance)) {
        inputError = inputError ?? <Trans>Insufficient {inputBalance.currency.symbol}</Trans>
      }
    }
    return inputError
  }, [parsedAmount, relevantTokenBalances, inputIsToken0, token0, token1, account])

  const [userSlippageTolerance] = useUserSlippageTolerance()

  const allowedSlippage = useMemo(() => {
    if (userSlippageTolerance === 'auto') return new Percent(JSBI.BigInt(3), JSBI.BigInt(100))
    else return userSlippageTolerance
  }, [userSlippageTolerance])

  const maxSlippageTick = useMemo(() => {
    const percent = parseFloat(allowedSlippage.toFixed(18))
    // 10 as 0.1%
    const tick = percent * 1000
    return tick
  }, [allowedSlippage])

  const [lowerTick, upperTick] = useMemo(() => {
    return [3000, 3000]
  }, [])

  const queryEnabled = useMemo(() => {
    return !userError && inputApprovalState === ApprovalState.APPROVED
  }, [inputApprovalState, userError])

  const calldata = useMemo(() => {
    if (
      !parsedAmount ||
      !poolKey ||
      !account ||
      !queryEnabled ||
      !inputCurrency ||
      lowerTick === undefined ||
      upperTick === undefined
    )
      return undefined
    // console.log('zeke:calldata', [
    //   {
    //     token0: poolKey.token0,
    //     token1: poolKey.token1,
    //     fee: poolKey.fee,
    //   },
    //   inputIsToken0 ? poolKey.token0 : poolKey.token1,
    //   parsedAmount.shiftedBy(inputCurrency.decimals).toFixed(0),
    //   lowerTick,
    //   upperTick,
    //   maxSlippageTick,
    // ])
    return NonfungiblePositionManager.INTERFACE.encodeFunctionData('zapAndMint', [
      {
        token0: poolKey.token0,
        token1: poolKey.token1,
        fee: poolKey.fee,
      },
      inputIsToken0 ? poolKey.token0 : poolKey.token1,
      parsedAmount.shiftedBy(inputCurrency.decimals).toFixed(0),
      lowerTick,
      upperTick,
      maxSlippageTick,
    ])
  }, [
    inputIsToken0,
    poolKey,
    inputCurrency,
    parsedAmount,
    account,
    queryEnabled,
    maxSlippageTick,
    upperTick,
    lowerTick,
  ])

  const { result, error, loading } = useContractCallV2(
    LMT_NFT_POSITION_MANAGER,
    calldata,
    ['derivedZapInfo'],
    true,
    queryEnabled,
    (data: string) => {
      return NonfungiblePositionManager.INTERFACE.decodeFunctionResult('zapAndMint', data)
    }
  )

  const tradeState = useMemo(() => {
    if (loading) return ZapDerivedInfoState.LOADING
    if (error) return ZapDerivedInfoState.INVALID
    if (result) return ZapDerivedInfoState.VALID
    return ZapDerivedInfoState.INVALID
  }, [loading, error, result])

  const txnInfo: ZapTxnInfo | undefined = useMemo(() => {
    if (!result || !token0 || !token1 || !poolKey || !parsedAmount || !result[0].amount0In || !result[0].amount1In)
      return undefined
    return {
      token0Out: new BN(result[0].amount0In.toString()).shiftedBy(-token0.decimals),
      token1Out: new BN(result[0].amount1In.toString()).shiftedBy(-token1.decimals),
      liquidity: new BN(result[0].liquidity.toString()),
      poolKey,
      inputIsToken0,
      inputAmount: parsedAmount,
      lowerDelta: lowerTick,
      upperDelta: upperTick,
      maxSlippageTick,
    }
  }, [result, token0, token1, inputIsToken0, poolKey, parsedAmount, lowerTick, upperTick, maxSlippageTick])

  const contractError = useMemo(() => {
    let _error: ReactNode | undefined
    if (error) {
      _error = <Trans>{getErrorMessage(error)}</Trans>
    }

    return _error
  }, [error])

  return useMemo(() => {
    return {
      txnInfo,
      contractError,
      userError,
      tradeState,
      allowedSlippage,
    }
  }, [txnInfo, tradeState, contractError, userError, allowedSlippage])
}

const useZapCallback = (
  txnInfo: ZapTxnInfo | undefined,
  tradeState: ZapDerivedInfoState,
  token0: Currency | undefined,
  token1: Currency | undefined
) => {
  const { account, chainId, provider } = useWeb3React()

  return useCallback(async (): Promise<TransactionResponse> => {
    try {
      if (!account) throw new Error('no account')
      if (!provider) throw new Error('no provider')
      if (!chainId) throw new Error('no chainId')
      if (tradeState !== ZapDerivedInfoState.VALID) throw new Error('invalid trade')
      if (!txnInfo || !token0 || !token1) throw new Error('no txnInfo')
      const calldata = NonfungiblePositionManager.INTERFACE.encodeFunctionData('zapAndMint', [
        txnInfo.poolKey,
        txnInfo.inputIsToken0 ? txnInfo.poolKey.token0 : txnInfo.poolKey.token1,
        txnInfo.inputAmount.shiftedBy(txnInfo.inputIsToken0 ? token0.decimals : token1.decimals).toFixed(0),
        txnInfo.lowerDelta,
        txnInfo.upperDelta,
        txnInfo.maxSlippageTick,
      ])

      const tx = {
        from: account,
        to: LMT_NFT_POSITION_MANAGER[chainId],
        data: calldata,
      }

      let gasEstimate: BigNumber

      try {
        gasEstimate = await provider.estimateGas(tx)
      } catch (gasError) {
        throw Error('cannot estimate gas')
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
      throw new Error(getErrorMessage(parseContractError(err)))
    }
  }, [account, chainId, provider, txnInfo, token0, token1, tradeState])
}

const ZapModal = (props: ZapModalProps) => {
  const { isOpen, onClose, apr, tvl, token0, token1, poolKey } = props
  const [inputIsToken0, setInputIsToken0] = useState(true)
  const [inputAmount, setInputAmount] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const onToggle = useCallback(() => {
    setShowSettings(!showSettings)
  }, [showSettings])
  const { account } = useWeb3React()

  const inputCurrency = useMemo(() => {
    if (!token0 || !token1) return undefined
    if (inputIsToken0) {
      return token0
    } else {
      return token1
    }
  }, [token0, token1, inputIsToken0])

  const parsedAmount = useMemo(() => {
    return parseBN(inputAmount)
  }, [inputAmount])

  const { chainId } = useWeb3React()

  const [inputApprovalState, approveInputCurrency] = useApproveCallback(
    parsedAmount && inputCurrency ? BnToCurrencyAmount(parsedAmount, inputCurrency) : undefined,
    LMT_NFT_POSITION_MANAGER[chainId ?? SupportedChainId.ARBITRUM_ONE]
  )

  const { txnInfo, userError, contractError, tradeState, allowedSlippage } = useDerivedZapInfo(
    inputAmount,
    inputIsToken0,
    poolKey,
    token0 ?? undefined,
    token1 ?? undefined,
    inputApprovalState
  )

  const callback = useZapCallback(txnInfo, tradeState, token0 ?? undefined, token1 ?? undefined)
  const addTransaction = useTransactionAdder()

  const handleZap = useCallback(() => {
    if (!callback) return
    callback()
      .then((response) => {
        addTransaction(response, {
          type: TransactionType.ZAP_AND_MINT,
          inputCurrencyId: token0?.wrapped.address ?? '',
          outputCurrencyId: token1?.wrapped.address ?? '',
        })
      })
      .catch((error) => {
        console.error(error)
      })
  }, [callback, token0, token1, addTransaction])

  const inputAmountFiat = useUSDPriceBNV2(parsedAmount, inputCurrency)
  const token0OutputFiat = useUSDPriceBNV2(txnInfo?.token0Out, token0 ?? undefined)
  const token1OutputFiat = useUSDPriceBNV2(txnInfo?.token1Out, token1 ?? undefined)
  const inputNotApproved = inputApprovalState !== ApprovalState.APPROVED
  const invalidTrade = tradeState === ZapDerivedInfoState.INVALID
  const loadingTrade = tradeState === ZapDerivedInfoState.LOADING

  return (
    <LmtModal isOpen={isOpen} maxHeight={750} maxWidth={460} $scrollOverlay={true} onDismiss={onClose}>
      <Wrapper>
        <Header>
          <DoubleCurrencyLogo size={26} currency0={token1} currency1={token0} />
          <ThemedText.SubHeader>
            {token0?.symbol}-{token1?.symbol}
          </ThemedText.SubHeader>
          <ThemedText.DeprecatedLabel fontSize={14} fontWeight={400}>
            APR: {apr?.toPrecision(4)}%
          </ThemedText.DeprecatedLabel>
          <ThemedText.DeprecatedLabel fontSize={14} fontWeight={400}>
            TVL: ${tvl?.toFixed(2)}
          </ThemedText.DeprecatedLabel>
          <LmtSettingsTab
            isOpen={showSettings}
            onToggle={onToggle}
            allowedSlippage={allowedSlippage}
            isLimitOrder={false}
          />
        </Header>
        <InputWrapper>
          <ZapTokenPanel
            value={inputAmount}
            onUserInput={(val: string) => setInputAmount(val)}
            showMaxButton={true}
            fiatValue={inputAmountFiat}
            id="1"
            currency={inputCurrency}
            otherCurrency={inputIsToken0 ? token1 : token0}
            onInputTokenChange={(currency: Currency) => {
              if (currency.wrapped.address.toLowerCase() === token0?.wrapped.address.toLowerCase()) {
                setInputIsToken0(true)
              } else {
                setInputIsToken0(false)
              }
            }}
          />
        </InputWrapper>
        <ArrowWrapper clickable={false}>
          <ArrowContainer style={{ rotate: '0deg' }} color="white">
            <ChevronDown size="11" />
          </ArrowContainer>
        </ArrowWrapper>
        <InputWrapper>
          <ZapTokenPanel
            value={txnInfo?.token0Out ? formatBNToString(txnInfo.token0Out, NumberType.SwapTradeAmount) : '-'}
            onUserInput={(val: string) => {}}
            showMaxButton={true}
            fiatValue={token0OutputFiat}
            id="2"
            currency={token0}
            disabled={true}
          />
        </InputWrapper>
        <InputWrapper>
          <ZapTokenPanel
            value={txnInfo?.token1Out ? formatBNToString(txnInfo.token1Out, NumberType.SwapTradeAmount) : '-'}
            onUserInput={(val: string) => {}}
            showMaxButton={true}
            fiatValue={token1OutputFiat}
            currency={token1}
            id="3"
            disabled={true}
          />
        </InputWrapper>
        {!account ? (
          <SmallButtonPrimary>Connect Wallet</SmallButtonPrimary>
        ) : !userError && inputNotApproved ? (
          <SmallButtonPrimary onClick={approveInputCurrency} disabled={inputApprovalState === ApprovalState.PENDING}>
            {inputApprovalState === ApprovalState.PENDING ? (
              <>
                <Loader size="20px" />
                <Trans>Approval pending</Trans>
              </>
            ) : (
              <>
                <MouseoverTooltip
                  text={
                    <Trans>
                      Permission is required for Limitless to use each token.{' '}
                      {inputCurrency ? `Allowance of ${inputAmount} ${inputCurrency?.symbol} required.` : null}
                    </Trans>
                  }
                >
                  <RowBetween>
                    <Info size={20} /> <Trans> Approve use of {inputCurrency?.symbol}</Trans>
                  </RowBetween>
                </MouseoverTooltip>
              </>
            )}
          </SmallButtonPrimary>
        ) : (
          <SmallButtonPrimary onClick={handleZap} disabled={invalidTrade || !txnInfo}>
            {userError ? (
              userError
            ) : contractError ? (
              contractError
            ) : invalidTrade ? (
              <Trans>Invalid Trade</Trans>
            ) : loadingTrade ? (
              <>
                <Loader size="20px" />
                <Trans>Finding Best Price ...</Trans>
              </>
            ) : (
              <Trans>Execute</Trans>
            )}
          </SmallButtonPrimary>
        )}
      </Wrapper>
    </LmtModal>
  )
}

export default ZapModal
