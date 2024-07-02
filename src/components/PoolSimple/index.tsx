import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Trans } from '@lingui/macro'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { formatNumber, NumberType } from '@uniswap/conedison/format'
import { CurrencyAmount } from '@uniswap/sdk-core'
import CurrencyInputPanel from 'components/BaseSwapPanel'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import FAQBox from 'components/FAQ'
import Highlights from 'components/Highlights'
import Loader from 'components/Icons/LoadingSpinner'
import { RowBetween, RowStart } from 'components/Row'
import { ArrowWrapper } from 'components/swap/styleds'
import { MEDIUM_MEDIA_BREAKPOINT, MOBILE_MEDIA_BREAKPOINT, SMALL_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
import { LoadingBubble } from 'components/Tokens/loading'
import { MouseoverTooltip } from 'components/Tooltip'
import { LIM_WETH } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { LMT_PER_USD_PER_DAY_LIMWETH } from 'constants/misc'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useLimweth } from 'hooks/useContract'
import { useAllPoolAndTokenPriceData } from 'hooks/useUserPriceData'
import { useCurrencyBalances } from 'lib/hooks/useCurrencyBalance'
import { ArrowContainer } from 'pages/Trade'
import React, { ReactNode, useCallback, useMemo, useRef, useState } from 'react'
import { ArrowRight, Maximize2 } from 'react-feather'
import { Info } from 'react-feather'
import { parseBN } from 'state/marginTrading/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { formatDollarAmount } from 'utils/formatNumbers'
import { GasEstimationError, getErrorMessage } from 'utils/lmtSDK/errors'
import { LimWethSDK } from 'utils/lmtSDK/LimWeth'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { useAccount, useChainId } from 'wagmi'
import { useEthersProvider, useEthersSigner } from 'wagmi-lib/adapters'

import { ReactComponent as Logo } from '../../assets/svg/Limitless_Logo_Black.svg'
import Logo1 from '../PoolSimple/ABDK_logo.png'
import Logo2 from '../PoolSimple/OffsideLabs_logo.png'
import {
  useLimWethPrice,
  useLimWethStaticDeposit,
  useLimWethStaticRedeem,
  useLimWethTokenBalance,
  useLimWethTotalSupply,
  useLimWethUtilizedBalance,
} from './hooks'

const AddLiquidityRow = styled(RowBetween)`
  gap: 10px;
  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    display: grid;
    width: 100%;
    grid-template-rows: 0.9fr 1fr;
  }
`

const ThemedTextSubHeaderSmall = styled(ThemedText.SubHeaderSmall)<{ mobileFont?: string }>`
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    font-size: ${({ mobileFont }) => (mobileFont ? `${mobileFont} !important` : '9px !important')};
    text-align: center;
  }
`

const ThemedTextBodySmall = styled(ThemedText.BodySmall)`
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    font-size: 8px !important;
  }
`

export default function SimplePool() {
  const theme = useTheme()
  // const [liqError, setLiqError] = useState<boolean>(false)
  // const [buy, setBuy] = useState<boolean>(true)
  // const [value, setValue] = useState<number>(0)
  // const vaultContract = useVaultContract(true)
  const limWethContract = useLimweth(true)

  // const [attemptingTxn, setAttemptingTxn] = useState(false)
  // const [txHash, setTxHash] = useState<string>()
  // const [error, setError] = useState<string>()
  const addTransaction = useTransactionAdder()
  const ref = useRef<HTMLDivElement>(null)

  const account = useAccount().address
  const chainId = useChainId()
  const provider = useEthersProvider({ chainId })
  const { openConnectModal } = useConnectModal()

  // NEW STUFF HERE:
  const [isBuyLimweth, setIsBuyLimweth] = useState<boolean>(true)
  const limWeth = useCurrency(LIM_WETH[chainId ?? SupportedChainId.BASE])
  const weth = useCurrency(WRAPPED_NATIVE_CURRENCY[chainId ?? SupportedChainId.BASE]?.address)
  const [typedInput, setTypedInput] = useState<string>('')
  const [limwethBalance, wethBalance] = useCurrencyBalances(account, [limWeth ?? undefined, weth ?? undefined])
  const maxAmountInput = useMemo(() => {
    if (isBuyLimweth) {
      if (limwethBalance) {
        return maxAmountSpend(limwethBalance)
      }
    } else {
      if (wethBalance) {
        return maxAmountSpend(wethBalance)
      }
    }
    return undefined
  }, [limwethBalance, wethBalance])

  const inputCurrency = isBuyLimweth ? weth : limWeth
  const outputCurrency = isBuyLimweth ? limWeth : weth
  const { tokens } = useAllPoolAndTokenPriceData()
  const wethUsdPrice = useMemo(() => {
    if (tokens && Object.keys(tokens).length > 0 && weth) {
      return tokens[weth?.wrapped.address.toLowerCase()]?.usdPrice
    }
    return undefined
  }, [tokens, weth])
  const limwethSupply = useLimWethTotalSupply()
  const limwethBacking = useLimWethTokenBalance()
  const limwethUtilized = useLimWethUtilizedBalance()
  const limwethMaxWithdraw = limwethBacking - limwethUtilized
  const limWethUtilizationRate = useMemo(() => {
    if (limwethUtilized && limwethBacking) {
      return (limwethUtilized / limwethBacking) * 100
    } else {
      return undefined
    }
  }, [limwethUtilized, limwethBacking])
  const parsedTypedValue = useMemo(() => {
    return parseBN(typedInput)
  }, [typedInput])

  const limWETHPrice = useLimWethPrice() // price

  const limWethUsdPrice = useMemo(() => {
    if (wethUsdPrice && limWETHPrice) {
      return wethUsdPrice * limWETHPrice
    }
    return undefined
  }, [wethUsdPrice, limWETHPrice])
  const currencyAmountInput = useMemo(() => {
    if (parsedTypedValue && inputCurrency) {
      return CurrencyAmount.fromRawAmount(inputCurrency, parsedTypedValue.shiftedBy(18).toFixed(0))
    }
    return undefined
  }, [parsedTypedValue, inputCurrency])
  // allowance / approval
  const [vaultApprovalState, approveVault] = useApproveCallback(
    currencyAmountInput,
    LIM_WETH[chainId ?? SupportedChainId.ARBITRUM_ONE]
  )

  const inputError = useMemo(() => {
    let error: React.ReactNode | undefined
    if (!account) {
      error = <Trans>Connect Wallet</Trans>
    }
    if (!parsedTypedValue) {
      error = error ?? <ButtonError text={'Enter an amount'}></ButtonError>
    }
    // wallet balance check
    if (isBuyLimweth) {
      if (parsedTypedValue && wethBalance && parsedTypedValue.gt(wethBalance.toExact())) {
        error = <ButtonError text={'Insufficient balance'}></ButtonError>
      }
    } else {
      if (parsedTypedValue && limwethBalance && parsedTypedValue.gt(limwethBalance.toExact())) {
        error = <ButtonError text={'Insufficient balance'}></ButtonError>
      }
    }
    return error
  }, [account, parsedTypedValue])

  const staticDepositEnabled = Boolean(parsedTypedValue && limWeth && weth && isBuyLimweth)
  const staticRedeemEnabled = Boolean(parsedTypedValue && limWeth && weth && !isBuyLimweth)

  const { result: limWethStaticDepositValue, error: depositError } = useLimWethStaticDeposit(
    staticDepositEnabled,
    parsedTypedValue?.shiftedBy(18).toFixed(0),
    account,
    limWeth?.decimals
  )

  const { result: limWethStaticWithdrawValue, error: redeemError } = useLimWethStaticRedeem(
    !staticRedeemEnabled,
    parsedTypedValue?.shiftedBy(18).toFixed(0),
    account,
    weth?.decimals
  )

  const computedOutput = useMemo(() => {
    if (isBuyLimweth) {
      return limWethStaticDepositValue
    } else {
      return limWethStaticWithdrawValue
    }
  }, [limWethStaticDepositValue, limWethStaticWithdrawValue, isBuyLimweth])

  const signer = useEthersSigner({ chainId })
  const limWethMintCallback = useCallback(async (): Promise<TransactionResponse> => {
    if (!chainId || !parsedTypedValue || !account || !signer) {
      throw new Error('missing fields')
    }
    try {
      // let response
      const tx = {
        from: account,
        to: LIM_WETH[chainId],
        data: LimWethSDK.INTERFACE.encodeFunctionData('deposit', [parsedTypedValue.shiftedBy(18).toFixed(0), account]),
      }

      let gasEstimate: any

      try {
        gasEstimate = await signer.estimateGas(tx)
      } catch (gasError) {
        throw new GasEstimationError()
      }

      const gasLimit = calculateGasMargin(gasEstimate)
      const response = await signer.sendTransaction({ ...tx, gasLimit }).then((response: any) => {
        return response
      })

      // if (amountIn && account) response = await limWethContract?.deposit(amountIn, account)
      return response as TransactionResponse
    } catch (err) {
      console.log('zeke:error', err)
      throw new Error('reff')
    }
  }, [account, parsedTypedValue, chainId, signer])

  const handleLimWethDeposit = useCallback(() => {
    if (!parsedTypedValue || !account || !chainId || !signer) {
      return
    }

    console.log('zeke:deposit')

    limWethMintCallback()
      .then((response) => {
        addTransaction(response, {
          type: TransactionType.MINT_limWETH,
          inputCurrencyId: '',
          outputCurrencyId: '',
        })
        setTypedInput('')
        return response.hash
      })
      .catch((error) => {
        console.error('referrr', error)
        // setAttemptingTxn(false)
        // setTxHash(undefined)
        // setError(error.message)
      })
  }, [limWethMintCallback, account, chainId, signer, parsedTypedValue, addTransaction, setTypedInput])

  //limWethContract redeem

  const limWethWithdrawCallback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      if (!chainId || !parsedTypedValue || !account || !signer) {
        throw new Error('missing fields')
      }
      const tx = {
        from: account,
        to: LIM_WETH[chainId],
        data: LimWethSDK.INTERFACE.encodeFunctionData('redeem', [
          parsedTypedValue.shiftedBy(18).toFixed(0),
          account,
          account,
        ]),
      }

      let gasEstimate: any

      try {
        gasEstimate = await signer.estimateGas(tx)
      } catch (gasError) {
        throw new GasEstimationError()
      }

      const gasLimit = calculateGasMargin(gasEstimate)
      const response = await signer.sendTransaction({ ...tx, gasLimit }).then((response: any) => {
        return response
      })

      return response as TransactionResponse
    } catch (err) {
      throw new Error('reff')
    }
  }, [account, parsedTypedValue, signer, chainId])

  const handleLimWethRedeem = useCallback(() => {
    if (!parsedTypedValue || !account || !limWethContract || !chainId || !provider) {
      return
    }

    // setAttemptingTxn(true)

    limWethWithdrawCallback()
      .then((response) => {
        // setAttemptingTxn(false)
        // setTxHash(response?.hash)
        // setError(undefined)
        addTransaction(response, {
          type: TransactionType.REDEEM_limWETH,
          inputCurrencyId: '',
          outputCurrencyId: '',
        })
        setTypedInput('')
        return response.hash
      })
      .catch((error) => {
        console.error('referrr', error)
        // setAttemptingTxn(false)
        // setTxHash(undefined)
        // setError(error.message)
      })
  }, [
    limWethWithdrawCallback,
    setTypedInput,
    account,
    limWethContract,
    chainId,
    provider,
    parsedTypedValue,
    addTransaction,
  ])

  const contractError = useMemo(() => {
    let error: React.ReactNode | undefined

    if (isBuyLimweth) {
      if (depositError) {
        error = <ButtonError text={getErrorMessage(depositError)}></ButtonError>
      }
    } else {
      if (redeemError) {
        error = <ButtonError text={getErrorMessage(redeemError)}></ButtonError>
      }
    }
    return error
  }, [isBuyLimweth, depositError, redeemError])

  // const llpBalance = useLlpBalance(account)

  // const limWETHBalance = useLimWethBalance(account)

  // const llpPrice = useLlpPrice()

  // const activePrice = useMemo(() => {
  //   if (inputCurrency?.symbol === 'WETH' && WETHPrice.data) {
  //     return WETHPrice?.data
  //   } else if (inputCurrency?.symbol === 'wBTC' && WBTCPrice.data) {
  //     return WBTCPrice?.data
  //   } else {
  //     return 1
  //   }
  // }, [WETHPrice, WBTCPrice, inputCurrency])

  const inputFiatValue = useMemo(() => {
    if (isBuyLimweth && parsedTypedValue && wethUsdPrice) {
      return {
        data: parsedTypedValue.toNumber() * wethUsdPrice,
        isLoading: false,
      }
    } else if (!isBuyLimweth && parsedTypedValue && wethUsdPrice && limWETHPrice) {
      return {
        data: parsedTypedValue.toNumber() * wethUsdPrice * limWETHPrice,
        isLoading: false,
      }
    }
    return {
      data: undefined,
      isLoading: false,
    }
  }, [isBuyLimweth, parsedTypedValue, wethUsdPrice, limWETHPrice])

  const outputFiatValue = useMemo(() => {
    if (computedOutput) {
      if (isBuyLimweth && limWethUsdPrice) {
        return {
          data: computedOutput * limWethUsdPrice,
          isLoading: false,
        }
      } else if (!isBuyLimweth && wethUsdPrice) {
        return {
          data: computedOutput * wethUsdPrice,
          isLoading: false,
        }
      }
    }
    return {
      data: undefined,
      isLoading: false,
    }
  }, [isBuyLimweth, parsedTypedValue, wethUsdPrice, limWethUsdPrice, computedOutput])

  // note that LLP decimal is 18, weth is 18, btc is 8, usdc is 6. they are in the currency object

  // Total Supply is raw supply
  // Total Backing is rawbacking
  // Utilization rate is

  const DetailedRowStart = styled(RowStart)`
    margin-bottom: 20px;
    @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
      width: 40%;
    }
  `
  return (
    <Wrapper>
      <AutoColumn>
        <DetailedRowStart>
          <AutoColumn gap="10px">
            <ThemedText.DeprecatedMediumHeader color="textSecondary">
              Buy / Sell limWETH
            </ThemedText.DeprecatedMediumHeader>

            <>
              <div style={{ display: 'flex', gap: '10px' }}>
                <ArrowRight size={15} />
                <ThemedText.BodyPrimary fontSize={13} flexWrap="wrap">
                  limWETH allows LPs to earn from Limitless pools without active management
                </ThemedText.BodyPrimary>
              </div>
            </>
          </AutoColumn>
        </DetailedRowStart>
        <AddLiquidityRow align="start">
          <DetailsCard>
            <RowStart padding="5px">
              <Logo width={25} fill="#fff" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div ref={ref} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ThemedText.BodySecondary>{outputCurrency?.symbol}</ThemedText.BodySecondary>
                </div>
                <ThemedText.BodyPrimary fontSize={12}>{outputCurrency?.symbol}</ThemedText.BodyPrimary>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ThemedText.BodyPrimary fontSize={14}>Estimated APR:</ThemedText.BodyPrimary>
                <ThemedText.BodySecondary fontSize={13} style={{ color: theme.accentSuccess }}>
                  20~110%
                </ThemedText.BodySecondary>
              </div>
            </RowStart>

            <>
              <RowBetween style={{ paddingTop: '20px', borderTop: `1px solid ${theme.accentActiveSoft}` }}>
                <ThemedText.BodyPrimary fontSize={12}>Price: </ThemedText.BodyPrimary>
                {limWETHPrice !== 0 ? (
                  <ThemedText.BodySecondary fontSize={12}>
                    {`${limWETHPrice ? limWETHPrice.toFixed(4) : '-'} limWETH/ETH`}
                  </ThemedText.BodySecondary>
                ) : (
                  <LoadingBubble height="16px" />
                )}
              </RowBetween>
              <RowBetween>
                <ThemedText.BodyPrimary fontSize={12}>Total Supply (limWETH):</ThemedText.BodyPrimary>
                {limwethSupply !== 0 ? (
                  <ThemedText.BodySecondary fontSize={12}>{`${limwethSupply.toFixed(4)}`}</ThemedText.BodySecondary>
                ) : (
                  <LoadingBubble height="16px" />
                )}
              </RowBetween>
              <RowBetween
                style={{
                  marginBottom: '10px',
                  paddingBottom: '20px',
                  borderBottom: `1px solid ${theme.accentActiveSoft}`,
                }}
              >
                <ThemedText.BodyPrimary fontSize={12}>Total Backing (ETH): </ThemedText.BodyPrimary>
                {limwethBacking !== 0 ? (
                  <ThemedText.BodySecondary fontSize={12}>{`${limwethBacking.toFixed(4)}`}</ThemedText.BodySecondary>
                ) : (
                  <LoadingBubble height="16px" />
                )}
              </RowBetween>
              <RowBetween
                style={{
                  marginBottom: '10px',
                  paddingBottom: '20px',
                  borderBottom: `1px solid ${theme.accentActiveSoft}`,
                }}
              >
                <ThemedText.BodyPrimary fontSize={12}>Daily LMT rewards: </ThemedText.BodyPrimary>
                <ThemedText.BodySecondary fontSize={12}>
                  {LMT_PER_USD_PER_DAY_LIMWETH} LMT per USD
                </ThemedText.BodySecondary>
              </RowBetween>
              <RowBetween>
                <ThemedText.BodyPrimary fontSize={12}>14D Average APR: </ThemedText.BodyPrimary>
                <ThemedText.BodySecondary fontSize={12}>-</ThemedText.BodySecondary>
              </RowBetween>
              <RowBetween>
                <ThemedText.BodyPrimary fontSize={12}>14D Premiums + Fees Collected </ThemedText.BodyPrimary>
                <ThemedText.BodySecondary fontSize={12}>-</ThemedText.BodySecondary>
              </RowBetween>
              <RowBetween>
                <ThemedText.BodyPrimary fontSize={12}>Utilization Rate: </ThemedText.BodyPrimary>
                {limWethUtilizationRate ? (
                  <ThemedText.BodySecondary fontSize={12}>
                    {`${limWethUtilizationRate.toFixed(2)}%`}
                  </ThemedText.BodySecondary>
                ) : (
                  <LoadingBubble height="16px" />
                )}
              </RowBetween>
              <RowBetween>
                <ThemedText.BodyPrimary fontSize={12}>Fee Distribution:</ThemedText.BodyPrimary>
                <ThemedText.BodySecondary fontSize={12}>80% LPs, 20% Protocol</ThemedText.BodySecondary>
              </RowBetween>
              <RowBetween>
                <MouseoverTooltip text="Given current utilization rates, the maximum withdrawable is the amount that can be withdrawn until utilization rate is lowered">
                  <RowStart style={{ gap: '3px' }}>
                    <ThemedText.BodyPrimary fontSize={12}>Maximum Withdrawable:</ThemedText.BodyPrimary>
                    <Info size={14} />
                  </RowStart>
                </MouseoverTooltip>
                {limwethMaxWithdraw ? (
                  <ThemedText.BodySecondary fontSize={12}>
                    {`${formatDollarAmount({ num: Number(limwethMaxWithdraw), long: true })} ${weth?.symbol}`}
                  </ThemedText.BodySecondary>
                ) : (
                  <LoadingBubble height="16px" />
                )}
              </RowBetween>
            </>
          </DetailsCard>
          <CurrencyWrapper>
            <FilterWrapper>
              <Filter>
                <Selector
                  onClick={() => {
                    // setBuy(true)
                    setIsBuyLimweth(true)
                    setTypedInput('')
                  }}
                  active={isBuyLimweth}
                >
                  <StyledSelectorText active={isBuyLimweth}>Buy limWETH </StyledSelectorText>
                </Selector>
                <Selector
                  onClick={() => {
                    // setBuy(false)
                    setIsBuyLimweth(false)
                    setTypedInput('')
                    // setValue(0)
                  }}
                  active={!isBuyLimweth}
                >
                  <StyledSelectorText active={!isBuyLimweth}>Sell limWETH</StyledSelectorText>
                </Selector>
              </Filter>
            </FilterWrapper>
            <CurrencyInputPanel
              value={typedInput}
              onUserInput={setTypedInput}
              onMax={() => {
                setTypedInput(maxAmountInput?.toExact() ?? '')
              }}
              showMaxButton={true}
              currency={inputCurrency}
              id="add-liquidity-input-tokena"
              fiatValue={inputFiatValue}
              label={
                <ThemedText.BodyPrimary style={{ marginTop: '15px', marginLeft: '15px' }}>Sell</ThemedText.BodyPrimary>
              }
              isBuyLimWETH={isBuyLimweth}
            />
            <ArrowWrapper
              onClick={() => {
                // setBuy(!buy)
                setIsBuyLimweth((prev) => !prev)
                // setValue(0)
              }}
              clickable={true}
            >
              <ArrowContainer color="white">
                <Maximize2 size="10" />
              </ArrowContainer>
            </ArrowWrapper>
            <CurrencyInputPanel
              value={formatNumber(computedOutput, NumberType.SwapTradeAmount)}
              onUserInput={() => {}}
              showMaxButton={false}
              fiatValue={outputFiatValue}
              currency={outputCurrency}
              id="add-liquidity-input-tokenb"
              label={
                <ThemedText.BodyPrimary style={{ marginTop: '15px', marginLeft: '15px' }}>Buy</ThemedText.BodyPrimary>
              }
              isBuyLimWETH={isBuyLimweth}
            />
            {!account ? (
              <ButtonBlue onClick={openConnectModal} text="Connect Wallet" />
            ) : inputError ? (
              inputError
            ) : parsedTypedValue && vaultApprovalState !== ApprovalState.APPROVED ? (
              <ButtonError onClick={approveVault}>
                {vaultApprovalState === ApprovalState.PENDING ? (
                  <>
                    <Loader size="18px" />
                    <Trans>Approval pending</Trans>
                  </>
                ) : (
                  <>
                    <MouseoverTooltip
                      style={{ height: '25px', display: 'flex', alignItems: 'center' }}
                      text={<Trans>Permission is required for usage. </Trans>}
                    >
                      <Info size={18} />
                      <Trans>Approve use of {inputCurrency?.symbol}</Trans>
                    </MouseoverTooltip>
                  </>
                )}
              </ButtonError>
            ) : contractError ? (
              contractError
            ) : isBuyLimweth ? (
              <ButtonBlue onClick={handleLimWethDeposit} text={`Buy limWETH`}></ButtonBlue>
            ) : (
              <ButtonBlue onClick={handleLimWethRedeem} text={`Sell limWETH`}></ButtonBlue>
            )}
          </CurrencyWrapper>
        </AddLiquidityRow>
      </AutoColumn>
      <InfoSection>
        <LimWETHSource>
          <ThemedText.BodySecondary>Sources of yield for LimWETH</ThemedText.BodySecondary>
          <ThemedText.BodySmall> 1. Premiums collected from traders</ThemedText.BodySmall>
          <ThemedText.BodySmall>
            {' '}
            2. Loan origination fees from traders&#40;collected once when position is opened&#41;
          </ThemedText.BodySmall>
          <ThemedText.BodySmall>
            {' '}
            3. Profit share paid by leverage traders&#40;10% of profit generated by default&#41;
          </ThemedText.BodySmall>
          <ThemedText.BodySmall> 4. Spot exchange trading fees generated in Uniswap</ThemedText.BodySmall>
        </LimWETHSource>
        <Highlights />
      </InfoSection>

      <FAQ>
        <FaqWrapper style={{ paddingTop: '10px', width: '500px', height: '140px', gap: '25px' }}>
          <FAQBox />
        </FaqWrapper>
        <AuditedByWrapper>
          <ThemedText.BodySecondary fontSize={15} fontWeight={800}>
            Audited By
          </ThemedText.BodySecondary>
          <ImageWrapper>
            <LogoImg src={Logo1}></LogoImg>
            <LogoImg src={Logo2}></LogoImg>
          </ImageWrapper>
        </AuditedByWrapper>
      </FAQ>
    </Wrapper>
  )
}

const InfoSection = styled(RowBetween)`
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    flex-direction: column;
    gap: 20px;
    justify-content: start;
    align-items: start;
    width: 80%;
  }
`

const FAQ = styled(RowBetween)`
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    flex-direction: column;
    justify-content: start;
    align-items: start;
  }
`

const LimWETHSource = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 15px;
  padding-left: 25px;
  padding-bottom: 10px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  width: 57%;
  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    width: 100%;
  }
  height: 150px;
  overflow-y: scroll;
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    height: 200px;
  }
`

const Wrapper = styled.div`
  padding: 30px;
  padding-top: 0px;
  width: 100%;
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    padding: 5px;
  }
`

const DetailsCard = styled.div`
  background-color: ${({ theme }) => theme.backgroundSurface};
  display: flex;
  flex-direction: column;
  width: 57%;
  border-radius: 10px;
  padding: 20px;
  height: 400px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  gap: 10px;
  /* width: 100%; */
  /* min-width: 260px; */
  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    width: 100%;
    height: 99%;
  }
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    width: 100%;
  }
`

const LoadedCell = styled.div`
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    padding-left: 0 !important;
    flex-wrap: wrap;
  }
`

const LoadedCellWrapper = styled.div<{ isShort?: boolean }>`
  display: grid;
  grid-template-columns: ${({ isShort }) => (isShort ? '2fr 2fr 2fr 3fr' : '2fr 2fr 2fr 2fr 2fr 2fr 3fr')};
  padding: 10px;
  border-radius: 10px;
  gap: 10px;
  :hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  justify-content: center;
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    padding-left: 0px;
    grid-template-columns: ${({ isShort }) => (isShort ? '2fr 2fr 2fr 3fr' : '1fr 1fr 1fr 1fr 1fr 1fr 1fr')};
    gap: 7px;
  }
`

const HeaderCell = styled.div<{ isWrap?: boolean }>`
  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    max-width: ${({ isWrap }) => isWrap && '80px'};
    white-space: ${({ isWrap }) => (isWrap ? 'wrap' : 'nowrap')};
    /* text-align: ${({ isWrap }) => (isWrap ? 'center' : 'left')}; */
  }
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    padding-left: 0px !important;
  }
`
const HeaderCellWrapper = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 2fr 2fr 2fr 3fr;
  border-bottom: 1px solid ${({ theme }) => theme.backgroundOutline};
  padding: 10px;
  gap: 10px;
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    padding-right: 0;
    padding-left: 0;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    gap: 7px;
  }
`
const HeaderCellWrapperSmall = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 3fr;
  border-bottom: 1px solid ${({ theme }) => theme.backgroundOutline};
  padding: 10px;
  gap: 10px;
`

const IndexWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-radius: 10px;
  width: 100%;
  min-width: 330px;
  margin-right: 0.125rem;
  margin-top: 10px;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
`

const FaqWrapper = styled.div`
  margin-top: 50px;
  width: 55%;
  min-width: 260px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  @media only screen and (max-width: ${MOBILE_MEDIA_BREAKPOINT}) {
    width: 60%;
  }
`

const AuditedByWrapper = styled.div`
  margin-top: 50px;
  height: 140px;
  width: 55%;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  padding-top: 10px;
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    width: 100%;
    margin-top: 10px;
    transform-origin: left top;
    transform: scale(0.9);
  }
`

const ImageWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  gap: 10px;
`

const LogoImg = styled.img`
  height: 75px;
`

const CurrencyWrapper = styled.div`
  width: 42%;
  background-color: ${({ theme }) => theme.backgroundSurface};
  padding: 15px;
  border-radius: 10px;
  height: 400px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    width: 90vw;
    min-width: 500px;
  }
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    min-width: 150px;
    width: 100%;
  }
`

const Filter = styled.div`
  display: flex;
  align-items: start;
  width: 100%;
  gap: 5px;
`

const FilterWrapper = styled.div`
  display: flex;
  margin-bottom: 6px;
  width: 100%;
`

const TokenWrapper = styled.div<{ disabled: boolean }>`
  display: flex;
  gap: 10px;
  padding-left: 5px;
  padding-right: 5px;
  padding-top: 5px;
  padding-bottom: 5px;
  &:hover {
    background-color: ${({ theme, disabled }) => (disabled ? 'none' : theme.backgroundOutline)};
  }
  border-radius: 5px;
  cursor: pointer;
`

const DropWrapper = styled.div`
  background-color: ${({ theme }) => theme.backgroundSurface};

  border-radius: 10px;
  width: 100%;
  padding: 0.5rem;
  height: fit-content;
`

const StyledSelectorText = styled.div<{ active: boolean }>`
  font-size: 14px;
  color: ${({ theme, active }) => (active ? theme.textSecondary : theme.textPrimary)};
  font-weight: ${({ active }) => (active ? '600' : '300')};
  text-align: center;
  cursor: ${({ active }) => (active ? 'pointer' : 'default')};
`

const Selector = styled.div<{ active: boolean }>`
  color: ${({ active, theme }) => (active ? theme.background : 'none')};
  width: 100%;
  border-radius: 5px;
  padding: 8px;
  background-color: ${({ active, theme }) => (active ? theme.accentActive : theme.accentActiveSoft)};
  cursor: pointer;
  &:hover {
    opacity: 95%;
  }
`
const BlueButton = styled.button`
  font-size: 14px;
  background-color: ${({ theme }) => theme.accentActive};
  border-radius: 10px;
  height: 40px;
  border: none;
  &:hover {
    opacity: 95%;
  }
  cursor: pointer;
`

const ErrorButton = styled(ButtonPrimary)`
  font-size: 14px;
  border-radius: 10px;
  height: 40px;
  &:hover {
    opacity: 95%;
  }
  cursor: pointer;
`

const MediumLoadingBubble = styled(LoadingBubble)`
  width: 65%;
`
const LongLoadingBubble = styled(LoadingBubble)`
  width: 90%;
`
const IconLoadingBubble = styled(LoadingBubble)`
  border-radius: 50%;
  width: 24px;
`

function ButtonBlue({ text, onClick }: { text?: string; onClick?: React.MouseEventHandler<HTMLButtonElement> }) {
  return (
    <BlueButton onClick={onClick}>
      <ThemedText.BodySecondary fontWeight={600} fontSize={14}>
        {text}
      </ThemedText.BodySecondary>
    </BlueButton>
  )
}

function ButtonError({
  text,
  onClick,
  children,
}: {
  text?: any
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  children?: ReactNode
}) {
  return (
    <ErrorButton onClick={onClick}>
      <ThemedText.BodySecondary fontWeight={600} fontSize={14}>
        {text}
      </ThemedText.BodySecondary>
      {children}
    </ErrorButton>
  )
}
