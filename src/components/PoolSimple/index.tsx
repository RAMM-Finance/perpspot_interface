import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import CurrencyInputPanel from 'components/BaseSwapPanel'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import FAQBox from 'components/FAQ'
import Highlights from 'components/Highlights'
import Loader from 'components/Icons/LoadingSpinner'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { NavDropdown } from 'components/NavBar/NavDropdown'
import { RowBetween, RowStart } from 'components/Row'
import { ArrowWrapper } from 'components/swap/styleds'
import { MEDIUM_MEDIA_BREAKPOINT, MOBILE_MEDIA_BREAKPOINT, SMALL_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
import { LoadingBubble } from 'components/Tokens/loading'
import { MouseoverTooltip } from 'components/Tooltip'
import { useToggleWalletDrawer } from 'components/WalletDropdown'
import { LIM_WETH, LMT_VAULT } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { LMT_PER_USD_PER_DAY_LIMWETH } from 'constants/misc'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useLimweth, useVaultContract } from 'hooks/useContract'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { useStablecoinValue } from 'hooks/useStablecoinPrice'
import { useUSDPriceBNV2 } from 'hooks/useUSDPrice'
import { ArrowContainer } from 'pages/Trade'
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, ChevronDown, ChevronUp, Maximize2 } from 'react-feather'
import { Info } from 'react-feather'
import { useDerivedLmtMintInfo, useV3MintActionHandlers, useV3MintState } from 'state/mint/v3/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { computeFiatValuePriceImpact } from 'utils/computeFiatValuePriceImpact'
import { currencyId } from 'utils/currencyId'
import { formatDollarAmount } from 'utils/formatNumbers'
import { maxAmountSpend } from 'utils/maxAmountSpend'

import { ReactComponent as Logo } from '../../assets/svg/Limitless_Logo_Black.svg'
import { Field } from '../../state/mint/v3/actions'
import Logo1 from '../PoolSimple/ABDK_logo.png'
import Logo2 from '../PoolSimple/OffsideLabs_logo.png'
import {
  useLimWethBalance,
  useLimWethPrice,
  useLimWethStaticDeposit,
  useLimWethStaticRedeem,
  useLimWethTokenBalance,
  useLimWethTotalSupply,
  useLimWethUtilizedBalance,
  useLlpBalance,
  useLlpPrice,
  useMaxRedeemableInToken,
  useVaultData,
  useVaultStaticDepositAnyToken,
  useVaultStaticRedeemAnyToken,
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

// TransactionType.MINT_LLP
export default function SimplePool() {
  const theme = useTheme()
  const [liqError, setLiqError] = useState<boolean>(false)
  const [buy, setBuy] = useState<boolean>(true)
  // const [value, setValue] = useState<number>(0)
  const vaultContract = useVaultContract()
  const limweth = useLimweth()
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<string>()
  const addTransaction = useTransactionAdder()

  // const [data, setData] = useState<any>()
  // const [mW, setMW] = useState<any>()
  // const [llpPrice, setLlpPrice] = useState<any>()
  // const [limWETHPrice, setLimWETHPrice] = useState<any>()

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const ref = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setIsOpen(false), [modalRef])

  const { account, chainId, provider } = useWeb3React()
  const toggleWalletDrawer = useToggleWalletDrawer()

  const LLP = useCurrency('0x77475a8126AEF102899F67B7f2309eFB21Bb3c02')
  const limWETH = useCurrency(
    chainId === 8453 ? '0x845d629D2485555514B93F05Bdbe344cC2e4b0ce' : '0xdEe4326E0a8B5eF94E50a457F7c70d4821be9f4C'
  )

  const [input, setInput] = useState(
    chainId === 8453 ? '0x4200000000000000000000000000000000000006' : '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
  )

  useEffect(() => {
    chainId === 8453
      ? setInput('0x4200000000000000000000000000000000000006')
      : setInput('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1')
  }, [chainId])

  const output = useMemo(() => {
    return chainId === 8453
      ? '0x845d629D2485555514B93F05Bdbe344cC2e4b0ce'
      : '0x77475a8126AEF102899F67B7f2309eFB21Bb3c02'
  }, [chainId])
  const inputCurrency = useCurrency(input)
  const outputCurrency = useCurrency(output)

  const [baseCurrency, quoteCurrency] = useMemo(() => {
    if (outputCurrency?.symbol === 'limWETH') setInput('0x4200000000000000000000000000000000000006')
    return buy ? [inputCurrency, outputCurrency] : [outputCurrency, inputCurrency]
  }, [buy, inputCurrency, outputCurrency])

  const feeAmount = 500
  // BASE
  // USDC - 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
  // WETH - 0x4200000000000000000000000000000000000006
  // WBTC - 0x1a35EE4640b0A3B87705B0A4B45D227Ba60Ca2ad

  const existingPosition = undefined

  const { dependentField, parsedAmounts, currencyBalances, noLiquidity, currencies, errorMessage } =
    useDerivedLmtMintInfo(
      baseCurrency ?? undefined,
      quoteCurrency ?? undefined,
      feeAmount,
      baseCurrency ?? undefined,
      quoteCurrency ?? undefined,
      existingPosition
    )

  const { independentField, typedValue } = useV3MintState()

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(8) ?? '',
  }

  const { onFieldAInput, onFieldBInput } = useV3MintActionHandlers(noLiquidity)

  const usdcValues = {
    [Field.CURRENCY_A]: useStablecoinValue(parsedAmounts[Field.CURRENCY_A]),
    [Field.CURRENCY_B]: useStablecoinValue(parsedAmounts[Field.CURRENCY_B]),
  }

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
      data: usdcValueCurrencyB ? parseFloat(usdcValueCurrencyB.toFixed(2).toString()) : undefined,
      isLoading: false,
    }),
    [usdcValueCurrencyB]
  )

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

  const inputValue = useMemo(() => {
    if (parsedAmounts[Field.CURRENCY_A]?.quotient.toString() === undefined) {
      return undefined
    } else {
      return Number(parsedAmounts[Field.CURRENCY_A]?.quotient.toString())
    }
  }, [parsedAmounts])

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
        } else if (
          (chainId === 8453 && currencyIdNew === '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1') ||
          (chainId === 8453 && currencyIdNew === '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f') ||
          (chainId === 8453 && currencyIdNew === '0xaf88d065e77c8cC2239327C5EDb3A432268e5831') ||
          currencyIdNew === '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' ||
          currencyIdNew === '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f' ||
          currencyIdNew === '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
        ) {
          setInput(currencyIdNew)
          return [currencyIdNew, currencyIdOther]
        } else {
          return [currencyIdNew, currencyIdOther]
        }
      }
    },
    [chainId]
  )

  function IndexHeader() {
    return (
      <>
        {outputCurrency?.symbol === 'LLP' ? (
          <HeaderCellWrapper>
            <HeaderCell style={{ paddingLeft: '20px' }}>
              <ThemedTextSubHeaderSmall color="textPrimary" fontWeight={900} fontSize={13}>
                Token
              </ThemedTextSubHeaderSmall>
            </HeaderCell>
            <HeaderCell>
              <ThemedTextSubHeaderSmall color="textPrimary" fontWeight={900} fontSize={13}>
                Price
              </ThemedTextSubHeaderSmall>
            </HeaderCell>
            <HeaderCell>
              <ThemedTextSubHeaderSmall color="textPrimary" fontWeight={900} fontSize={13}>
                Pool
              </ThemedTextSubHeaderSmall>
            </HeaderCell>
            <HeaderCell>
              <ThemedTextSubHeaderSmall color="textPrimary" fontWeight={900} fontSize={13}>
                Weight
              </ThemedTextSubHeaderSmall>
            </HeaderCell>
            <HeaderCell isWrap={true}>
              <ThemedTextSubHeaderSmall color="textPrimary" fontWeight={900} fontSize={13}>
                Target Weight
              </ThemedTextSubHeaderSmall>
            </HeaderCell>
            <HeaderCell isWrap={true}>
              <ThemedTextSubHeaderSmall color="textPrimary" fontWeight={900} fontSize={13} mobileFont="7px">
                Utililzation
              </ThemedTextSubHeaderSmall>
            </HeaderCell>
            <HeaderCell isWrap={true}>
              <ThemedTextSubHeaderSmall color="textPrimary" fontWeight={900} fontSize={13}>
                Maximum Withdrawable
              </ThemedTextSubHeaderSmall>
            </HeaderCell>
          </HeaderCellWrapper>
        ) : (
          <HeaderCellWrapperSmall>
            <HeaderCell style={{ paddingLeft: '20px' }}>
              <ThemedText.SubHeaderSmall color="textPrimary" fontWeight={900} fontSize={13}>
                Token
              </ThemedText.SubHeaderSmall>
            </HeaderCell>
            <HeaderCell>
              <ThemedText.SubHeaderSmall color="textPrimary" fontWeight={900} fontSize={13}>
                Price
              </ThemedText.SubHeaderSmall>
            </HeaderCell>
            <HeaderCell>
              <ThemedText.SubHeaderSmall color="textPrimary" fontWeight={900} fontSize={13}>
                Utilized
              </ThemedText.SubHeaderSmall>
            </HeaderCell>
            <HeaderCell>
              <ThemedText.SubHeaderSmall color="textPrimary" fontWeight={900} fontSize={13}>
                Maximum Withdrawable
              </ThemedText.SubHeaderSmall>
            </HeaderCell>
          </HeaderCellWrapperSmall>
        )}
      </>
    )
  }

  const WETH = useCurrency(
    chainId === 8453 ? '0x4200000000000000000000000000000000000006' : '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
  )
  const WBTC = useCurrency(
    chainId === 8453 ? '0x1a35EE4640b0A3B87705B0A4B45D227Ba60Ca2ad' : '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f'
  )
  const USDC = useCurrency(
    chainId === 8453 ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' : '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
  )

  const WETHCurrencyAmount: BN | undefined = useMemo(() => {
    if (!WETH) return undefined
    return new BN(1)
  }, [WETH])

  const WBTCCurrencyAmount: BN | undefined = useMemo(() => {
    if (!WBTC) return undefined
    return new BN(1)
  }, [WBTC])

  // const USDCCurrencyAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
  //   if (!USDC) return undefined
  //   return CurrencyAmount.fromRawAmount(USDC, new BN(1).shiftedBy(USDC.decimals).toFixed(0))
  // }, [USDC])

  const WETHPrice = useUSDPriceBNV2(WETHCurrencyAmount, WETH !== null ? WETH : undefined)
  const WBTCPrice = useUSDPriceBNV2(WBTCCurrencyAmount, WBTC !== null ? WBTC : undefined)
  const USDCPrice = 1

  // allowance / approval
  const [vaultApprovalState, approveVault] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_A],
    outputCurrency?.symbol === 'LLP'
      ? LMT_VAULT[chainId ?? SupportedChainId.ARBITRUM_ONE]
      : LIM_WETH[chainId ?? SupportedChainId.ARBITRUM_ONE]
  )

  const vaultStaticDepositDisabled =
    !parsedAmounts?.[Field.CURRENCY_A] ||
    !account ||
    !vaultContract ||
    !chainId ||
    !provider ||
    !buy ||
    outputCurrency?.symbol !== 'LLP'
  const {
    result: vaultStaticDepositValue,
    loading: vaultStaticDepositLoading,
    error: vaultStaticDepositError,
  } = useVaultStaticDepositAnyToken(
    !vaultStaticDepositDisabled,
    baseCurrency?.wrapped.address,
    parsedAmounts[Field.CURRENCY_A]?.quotient.toString(),
    account
  )

  const limWethMintStaticDisabled =
    !parsedAmounts?.[Field.CURRENCY_A] ||
    !account ||
    !vaultContract ||
    !limweth ||
    !chainId ||
    !provider ||
    !buy ||
    outputCurrency?.symbol === 'LLP'

  const {
    result: limWethStaticDepositValue,
    loading: limWethStaticDepositLoading,
    error: limWethStaticDepositError,
  } = useLimWethStaticDeposit(
    !limWethMintStaticDisabled,
    parsedAmounts[Field.CURRENCY_A]?.quotient.toString(),
    account,
    quoteCurrency ?? undefined
  )

  const vaultStaticRedeemDisabled =
    !parsedAmounts?.[Field.CURRENCY_A] ||
    !account ||
    !vaultContract ||
    !chainId ||
    !provider ||
    buy ||
    outputCurrency?.symbol !== 'LLP'
  // call llp static redeem
  const {
    result: vaultStaticRedeemValue,
    loading: vaultStaticRedeemLoading,
    error: vaultStaticRedeemError,
  } = useVaultStaticRedeemAnyToken(
    !vaultStaticRedeemDisabled,
    quoteCurrency?.wrapped.address,
    parsedAmounts[Field.CURRENCY_A]?.quotient.toString(),
    account,
    quoteCurrency?.wrapped.decimals
  )

  console.log('quote', quoteCurrency)

  const limWethStaticWithdrawDisabled =
    !parsedAmounts?.[Field.CURRENCY_A] ||
    !account ||
    !limweth ||
    !chainId ||
    !provider ||
    buy ||
    outputCurrency?.symbol === 'LLP' ||
    !WETHPrice.data

  const {
    result: limWethStaticWithdrawValue,
    loading: limWethStaticWithdrawLoading,
    error: limWethStaticWithdrawError,
  } = useLimWethStaticRedeem(
    !limWethStaticWithdrawDisabled,
    parsedAmounts[Field.CURRENCY_A]?.quotient.toString(),
    account,
    quoteCurrency ?? undefined
  )

  const value = useMemo(() => {
    if (!limWethStaticWithdrawDisabled) {
      if (limWethStaticWithdrawValue !== undefined) {
        return limWethStaticWithdrawValue
      }
    } else if (!vaultStaticRedeemDisabled) {
      if (vaultStaticRedeemValue !== undefined) {
        return vaultStaticRedeemValue
      }
    } else if (!limWethMintStaticDisabled) {
      if (limWethStaticDepositValue !== undefined) {
        return limWethStaticDepositValue
      }
    } else if (!vaultStaticDepositDisabled) {
      if (vaultStaticDepositValue !== undefined) {
        return vaultStaticDepositValue
      }
    }
    return 0
  }, [
    limWethStaticWithdrawDisabled,
    limWethStaticWithdrawValue,
    vaultStaticRedeemDisabled,
    vaultStaticRedeemValue,
    limWethMintStaticDisabled,
    limWethStaticDepositValue,
    vaultStaticDepositDisabled,
    vaultStaticDepositValue,
  ])

  const liquidityError = useMemo(() => {
    if (!limWethStaticWithdrawDisabled) {
      if (limWethStaticWithdrawError?.error.includes('EXCEEDS AVAILABLE LIQUIDITY')) {
        return true
      }
    } else if (!vaultStaticRedeemDisabled) {
      if (vaultStaticRedeemError?.error.includes('EXCEEDS AVAILABLE LIQUIDITY')) {
        return true
      }
    }

    return false
  }, [limWethStaticWithdrawDisabled, limWethStaticWithdrawError, vaultStaticRedeemDisabled, vaultStaticRedeemError])

  //limWETH deposit

  const limWethMintCallback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      const amountIn = parsedAmounts[Field.CURRENCY_A]?.quotient.toString()
      let response
      console.log('input', baseCurrency?.wrapped.address, amountIn, account)
      if (amountIn && account) response = await limweth?.deposit(amountIn, account)
      return response as TransactionResponse
    } catch (err) {
      throw new Error('reff')
    }
  }, [account, limweth, parsedAmounts, baseCurrency])

  const handleLimWethDeposit = useCallback(() => {
    if (!parsedAmounts?.[Field.CURRENCY_A] || !account || !limweth || !chainId || !provider) {
      return
    }

    setAttemptingTxn(true)

    limWethMintCallback()
      .then((response) => {
        setAttemptingTxn(false)
        setTxHash(response?.hash)
        setError(undefined)
        addTransaction(response, {
          type: TransactionType.MINT_limWETH,
          inputCurrencyId: '',
          outputCurrencyId: '',
        })
        return response.hash
      })
      .catch((error) => {
        console.error('referrr', error)
        setAttemptingTxn(false)
        setTxHash(undefined)
        setError(error.message)
      })
  }, [limWethMintCallback, account, limweth, chainId, provider, parsedAmounts, addTransaction])

  //limweth redeem

  const limWethWithdrawCallback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      const amountIn = parsedAmounts[Field.CURRENCY_A]?.quotient.toString()
      let response
      console.log('zeke:4', amountIn, account)
      if (amountIn && account) response = await limweth?.redeem(amountIn, account, account)
      return response as TransactionResponse
    } catch (err) {
      throw new Error('reff')
    }
  }, [account, limweth, parsedAmounts])

  const handleLimWethRedeem = useCallback(() => {
    if (!parsedAmounts?.[Field.CURRENCY_A] || !account || !limweth || !chainId || !provider) {
      return
    }

    setAttemptingTxn(true)

    limWethWithdrawCallback()
      .then((response) => {
        setAttemptingTxn(false)
        setTxHash(response?.hash)
        setError(undefined)
        addTransaction(response, {
          type: TransactionType.REDEEM_limWETH,
          inputCurrencyId: '',
          outputCurrencyId: '',
        })
        return response.hash
      })
      .catch((error) => {
        console.error('referrr', error)
        setAttemptingTxn(false)
        setTxHash(undefined)
        setError(error.message)
      })
  }, [limWethWithdrawCallback, account, limweth, chainId, provider, parsedAmounts, addTransaction])

  // llp deposit

  const callback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      const amountIn = parsedAmounts[Field.CURRENCY_A]?.quotient.toString()
      let response
      console.log('input', baseCurrency?.wrapped.address, amountIn, account)
      if (baseCurrency && amountIn && account)
        response = await vaultContract?.depositAnyToken(baseCurrency?.wrapped.address, amountIn, account)
      return response as TransactionResponse
    } catch (err) {
      throw new Error('reff')
    }
  }, [account, vaultContract, parsedAmounts, baseCurrency])

  const handleDeposit = useCallback(() => {
    if (!parsedAmounts?.[Field.CURRENCY_A] || !account || !vaultContract || !chainId || !provider) {
      return
    }

    setAttemptingTxn(true)

    callback()
      .then((response) => {
        setAttemptingTxn(false)
        setTxHash(response?.hash)
        setError(undefined)
        addTransaction(response, {
          type: TransactionType.MINT_LLP,
          inputCurrencyId: '',
          outputCurrencyId: '',
        })
        return response.hash
      })
      .catch((error) => {
        console.error('referrr', error)
        setAttemptingTxn(false)
        setTxHash(undefined)
        setError(error.message)
      })
  }, [callback, account, vaultContract, chainId, provider, parsedAmounts, addTransaction])

  // llp redeem

  const redeemCallback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      const amountIn = parsedAmounts[Field.CURRENCY_A]?.quotient.toString()
      let response
      console.log('redeeminput', quoteCurrency?.wrapped.address, amountIn, account)
      if (quoteCurrency && amountIn && account)
        response = await vaultContract?.redeemToAnyToken(quoteCurrency?.wrapped.address, amountIn, account, account)
      return response as TransactionResponse
    } catch (err) {
      throw new Error('reff')
    }
  }, [account, quoteCurrency, vaultContract, parsedAmounts])

  // const [llpBalance, setLlpBalance] = useState<number>(0)
  // const [limWETHBalance, setlimWETHBalance] = useState<number>(0)

  const handleRedeem = useCallback(() => {
    console.log('?????', parsedAmounts?.[Field.CURRENCY_A], account, vaultContract, chainId, provider)
    if (!parsedAmounts?.[Field.CURRENCY_A] || !account || !vaultContract || !chainId || !provider) {
      return
    }
    setAttemptingTxn(true)
    redeemCallback()
      .then((response) => {
        setAttemptingTxn(false)
        setTxHash(response?.hash)
        setError(undefined)
        addTransaction(response, {
          type: TransactionType.REDEEM_LLP,
          inputCurrencyId: '',
          outputCurrencyId: '',
        })
        return response.hash
      })
      .catch((error) => {
        console.error('referrr', error)
        setAttemptingTxn(false)
        setTxHash(undefined)
        setError(error.message)
      })
  }, [redeemCallback, account, vaultContract, addTransaction, chainId, provider, parsedAmounts])

  const llpBalance = useLlpBalance(account)

  const limWETHBalance = useLimWethBalance(account)
  // useEffect(() => {
  //   if (!account || !provider || !vaultContract || !limweth) return

  //   if (outputCurrency?.symbol === 'LLP') {
  //     const call = async () => {
  //       try {
  //         const balance = await vaultContract.balanceOf(account)
  //         console.log('balance', balance.toString())
  //         setLlpBalance(() => Number(balance) / 1e18)
  //       } catch (error) {
  //         console.log('codebyowners err')
  //       }
  //     }
  //     call()
  //   }
  //   if (outputCurrency?.symbol !== 'LLP') {
  //     const call2 = async () => {
  //       try {
  //         const balance = await limweth.balanceOf(account)
  //         console.log('balance', balance.toString())
  //         setlimWETHBalance(() => Number(balance) / 1e18)
  //       } catch (error) {
  //         console.log('codebyowners err')
  //       }
  //     }
  //     call2()
  //   }
  // }, [account, provider, vaultContract, attemptingTxn, outputCurrency?.symbol, limweth])

  const limwethSupply = useLimWethTotalSupply()
  const limwethBacking = useLimWethTokenBalance()
  const limwethUtilized = useLimWethUtilizedBalance()
  const limwethMax = limwethBacking - limwethUtilized

  const limWETHPrice = useLimWethPrice()
  const llpPrice = useLlpPrice()
  const data = useVaultData()
  const redeemableTokens = useMemo(() => {
    if (!chainId) return undefined
    if (chainId === SupportedChainId.ARBITRUM_ONE) {
      return [
        '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
        '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      ]
    } else {
      return ['0x4200000000000000000000000000000000000006']
    }
  }, [chainId])
  const mW = useMaxRedeemableInToken(redeemableTokens)

  // useEffect(() => {
  //   if (!provider || !limweth) return
  //   const call = async () => {
  //     try {
  //       const price = await limweth.previewRedeem(`${1e18}`)
  //       setLimWETHPrice(price)

  //       // rawdata[0] is total supply
  //       // 1 is totalbacking
  //       // 2 is utilization rate, i.e 0.5*1e18 is 50%
  //       // 3 is each token balance in vault (pool column in table)
  //       // 4 is each token weight, i.e 0.5*1e18 is 50%
  //       // 5 is each token util, i.e 0.5*1e18 is 50%
  //     } catch (error) {
  //       console.log('codebyowners err')
  //     }
  //   }

  //   call()
  // }, [provider, limweth, chainId])

  // useEffect(() => {
  //   if (!provider || !vaultContract) return

  //   const call = async () => {
  //     try {
  //       const rawData = await vaultContract.getData()
  //       setData(rawData)

  //       const maxWithdrawableWETH = await vaultContract.maxRedeemableInToken(
  //         '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
  //       )
  //       const maxWithdrawableWBTC = await vaultContract.maxRedeemableInToken(
  //         '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f'
  //       )
  //       const maxWithdrawableUSDC = await vaultContract.maxRedeemableInToken(
  //         '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
  //       )
  //       setMW([maxWithdrawableWETH, maxWithdrawableWBTC, maxWithdrawableUSDC])

  //       const price = await vaultContract.previewRedeem(`${1e18}`)
  //       setLlpPrice(price)
  //       // rawdata[0] is total supply
  //       // 1 is totalbacking
  //       // 2 is utilization rate, i.e 0.5*1e18 is 50%
  //       // 3 is each token balance in vault (pool column in table)
  //       // 4 is each token weight, i.e 0.5*1e18 is 50%
  //       // 5 is each token util, i.e 0.5*1e18 is 50%
  //     } catch (error) {
  //       console.log('codebyowners err')
  //     }
  //   }
  //   call()
  // }, [provider, vaultContract, chainId])

  const indexData = useMemo(() => {
    if (WETH && WETHPrice && chainId === 8453 && limwethUtilized && limwethBacking && limwethMax) {
      return [
        {
          token: WETH,
          price: WETHPrice?.data,
          util: limwethUtilized,
          maxWith: limwethMax,
          backing: limwethBacking,
        },
      ]
    } else if (data && mW[0] && mW[1] && mW[2] && WETHPrice && WBTCPrice && chainId !== 8453) {
      return [
        {
          token: WETH,
          price: WETHPrice?.data,
          poolBal: data[3][0],
          weight: data[4][0],
          targetWeight: 50,
          util: data[5][0],
          maxWith: mW[0].maxShares,
        },
        {
          token: WBTC,
          price: WBTCPrice?.data,
          poolBal: data[3][1],
          weight: data[4][1],
          targetWeight: 20,
          util: data[5][1],
          maxWith: mW[1].maxShares,
        },
        {
          token: USDC,
          price: USDCPrice,
          poolBal: data[3][2],
          weight: data[4][2],
          targetWeight: 30,
          util: data[5][2],
          maxWith: mW[2].maxShares,
        },
      ]
    } else {
      return undefined
    }
  }, [
    data,
    mW,
    USDCPrice,
    WETHPrice,
    WBTCPrice,
    WETH,
    WBTC,
    USDC,
    chainId,
    limwethUtilized,
    limwethBacking,
    limwethMax,
  ])

  const activePrice = useMemo(() => {
    if (inputCurrency?.symbol === 'WETH' && WETHPrice.data) {
      return WETHPrice?.data
    } else if (inputCurrency?.symbol === 'wBTC' && WBTCPrice.data) {
      return WBTCPrice?.data
    } else {
      return 1
    }
  }, [WETHPrice, WBTCPrice, inputCurrency])

  // note that LLP decimal is 18, weth is 18, btc is 8, usdc is 6. they are in the currency object

  // Total Supply is raw supply
  // Total Backing is rawbacking
  // Utilization rate is

  const chevronProps = {
    height: 15,
    width: 15,
    color: theme.textSecondary,
    cursor: 'pointer',
  }

  const dropdown = (
    <NavDropdown
      onClick={() => {
        setIsOpen(false)
      }}
      ref={modalRef}
      style={{
        background: '#040609',
        position: 'absolute',
        height: 'fit-content',
        zIndex: '3',
        marginTop: '100px',
        marginLeft: '40px',
        width: 'fit-content',
      }}
    >
      <DropWrapper>
        <div style={{ display: 'flex', gap: '7px', flexDirection: 'column' }}>
          <TokenWrapper disabled={false}>
            <CurrencyLogo currency={chainId === 8453 ? limWETH : LLP} size="18" />
            <ThemedText.BodySmall>{chainId === 8453 ? 'limWETH' : 'LLP'}</ThemedText.BodySmall>
          </TokenWrapper>
          {/* <TokenWrapper disabled={true} onClick={() => setOutput('0xdEe4326E0a8B5eF94E50a457F7c70d4821be9f4C')}> */}
          {chainId !== 8453 && (
            <TokenWrapper disabled={true}>
              <CurrencyLogo currency={LLP} size="18" />
              <ThemedText.BodySmall>limWETH (Coming Soon)</ThemedText.BodySmall>
            </TokenWrapper>
          )}
        </div>
      </DropWrapper>
    </NavDropdown>
  )

  return (
    <Wrapper>
      <AutoColumn>
        <RowStart style={{ marginBottom: '20px' }}>
          <AutoColumn gap="10px">
            <ThemedText.DeprecatedMediumHeader color="textSecondary">
              Buy / Sell {chainId === 8453 ? 'limWETH' : 'LLP'}
            </ThemedText.DeprecatedMediumHeader>
            {chainId === 8453 ? (
              <>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <ArrowRight size={15} />
                  <ThemedText.BodyPrimary fontSize={13} flexWrap="wrap">
                    limWETH allows LPs to earn from Limitless pools without active management
                  </ThemedText.BodyPrimary>
                </div>
              </>
            ) : (
              <ThemedText.BodyPrimary flexWrap="wrap">
                By minting LLP you will gain index exposure to BTC, ETH, and USDC while earning fees from
                uniswap+premiums and points from Limitless.
              </ThemedText.BodyPrimary>
            )}
          </AutoColumn>
        </RowStart>
        <AddLiquidityRow align="start">
          <DetailsCard>
            <RowStart padding="5px">
              <Logo width={25} fill="#fff" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div ref={ref} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ThemedText.BodySecondary>{outputCurrency?.symbol}</ThemedText.BodySecondary>
                  {isOpen ? (
                    <ChevronUp onClick={() => setIsOpen(!isOpen)} {...chevronProps} />
                  ) : (
                    <ChevronDown onClick={() => setIsOpen(!isOpen)} {...chevronProps} />
                  )}
                </div>
                <ThemedText.BodyPrimary fontSize={12}>{outputCurrency?.symbol}</ThemedText.BodyPrimary>
              </div>
              {isOpen && <>{dropdown}</>}

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ThemedText.BodyPrimary fontSize={14}>Estimated APR:</ThemedText.BodyPrimary>
                <ThemedText.BodySecondary fontSize={13} style={{ color: theme.accentSuccess }}>
                  20~110%
                </ThemedText.BodySecondary>
              </div>
            </RowStart>
            {outputCurrency && outputCurrency.symbol === 'LLP' && (
              <>
                <RowBetween style={{ paddingTop: '20px', borderTop: `1px solid ${theme.accentActiveSoft}` }}>
                  <ThemedText.BodyPrimary fontSize={12}>Price: </ThemedText.BodyPrimary>
                  <ThemedText.BodySecondary fontSize={12}>{llpPrice && llpPrice.toFixed(2)}</ThemedText.BodySecondary>
                </RowBetween>
                <RowBetween>
                  <ThemedText.BodyPrimary fontSize={12}>Total Supply:</ThemedText.BodyPrimary>
                  <ThemedText.BodySecondary fontSize={12}>
                    {data && formatDollarAmount({ num: data[0] / 1e18, long: true })}
                  </ThemedText.BodySecondary>
                </RowBetween>
                <RowBetween>
                  <ThemedText.BodyPrimary fontSize={12}>Total Backing (USD): </ThemedText.BodyPrimary>
                  <ThemedText.BodySecondary fontSize={12}>
                    {data && `$${formatDollarAmount({ num: data[1] / 1e18, long: true })}`}
                  </ThemedText.BodySecondary>
                </RowBetween>
                <RowBetween>
                  <ThemedText.BodyPrimary fontSize={12}>14D Average APR: </ThemedText.BodyPrimary>
                  <ThemedText.BodySecondary fontSize={12}>-</ThemedText.BodySecondary>
                </RowBetween>
                <RowBetween>
                  <ThemedText.BodyPrimary fontSize={12}>14D Premiums + Fees Collected: </ThemedText.BodyPrimary>
                  <ThemedText.BodySecondary fontSize={12}>-</ThemedText.BodySecondary>
                </RowBetween>
                <RowBetween>
                  <ThemedText.BodyPrimary fontSize={12}>Fee Distribution: </ThemedText.BodyPrimary>
                  <ThemedText.BodySecondary fontSize={12}>80% LPs, 20% protocol</ThemedText.BodySecondary>
                </RowBetween>
                {buy ? (
                  <RowBetween
                    style={{ marginTop: '10px', paddingTop: '20px', borderTop: `1px solid ${theme.accentActiveSoft}` }}
                  >
                    <ThemedText.BodyPrimary fontSize={12}>Yield Source: </ThemedText.BodyPrimary>
                    <ThemedText.BodySecondary fontSize={12}>
                      {`Variable Interest Rates` + `  + Uniswap Swap Fees`}
                    </ThemedText.BodySecondary>
                  </RowBetween>
                ) : (
                  <>
                    <RowBetween
                      style={{
                        marginTop: '10px',
                        paddingTop: '20px',
                        borderTop: `1px solid ${theme.accentActiveSoft}`,
                      }}
                    >
                      <ThemedText.BodyPrimary fontSize={12}>Reserved: </ThemedText.BodyPrimary>
                      <ThemedText.BodySecondary fontSize={12}>0.000 LLP ($0.00)</ThemedText.BodySecondary>
                    </RowBetween>
                    <RowBetween>
                      <ThemedText.BodyPrimary fontSize={12}>Estimated APR: </ThemedText.BodyPrimary>
                      <ThemedText.BodySecondary fontSize={12}>{`50 %` + `  + swap fees`}</ThemedText.BodySecondary>
                    </RowBetween>
                  </>
                )}

                <RowBetween>
                  <ThemedText.BodyPrimary fontSize={12}>Utilization Rate:</ThemedText.BodyPrimary>
                  <ThemedText.BodySecondary fontSize={12}>
                    {data && ((data[2] / 1e18) * 100).toFixed(2)}%
                  </ThemedText.BodySecondary>
                </RowBetween>
              </>
            )}
            {outputCurrency && outputCurrency.symbol === 'limWETH' && (
              <>
                <RowBetween style={{ paddingTop: '20px', borderTop: `1px solid ${theme.accentActiveSoft}` }}>
                  <ThemedText.BodyPrimary fontSize={12}>Price: </ThemedText.BodyPrimary>
                  <ThemedText.BodySecondary fontSize={12}>
                    {`${limWETHPrice && limWETHPrice.toFixed(4)} limWETH/ETH`}
                  </ThemedText.BodySecondary>
                </RowBetween>
                <RowBetween>
                  <ThemedText.BodyPrimary fontSize={12}>Total Supply (limWETH):</ThemedText.BodyPrimary>
                  <ThemedText.BodySecondary fontSize={12}>{`${limwethSupply.toFixed(4)}`}</ThemedText.BodySecondary>
                </RowBetween>
                <RowBetween
                  style={{
                    marginBottom: '10px',
                    paddingBottom: '20px',
                    borderBottom: `1px solid ${theme.accentActiveSoft}`,
                  }}
                >
                  <ThemedText.BodyPrimary fontSize={12}>Total Backing (ETH): </ThemedText.BodyPrimary>
                  <ThemedText.BodySecondary fontSize={12}>{`${limwethBacking.toFixed(4)}`}</ThemedText.BodySecondary>
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
                  <ThemedText.BodySecondary fontSize={12}>
                    {`${((Number(limwethUtilized) / Number(limwethBacking)) * 100).toFixed(2)}%`}
                  </ThemedText.BodySecondary>
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
                  <ThemedText.BodySecondary fontSize={12}>
                    {indexData &&
                      `${formatDollarAmount({ num: Number(indexData[0].maxWith), long: true })} ${
                        indexData[0].token?.symbol
                      }`}
                  </ThemedText.BodySecondary>
                </RowBetween>
              </>
            )}
          </DetailsCard>
          <CurrencyWrapper>
            <FilterWrapper>
              <Filter>
                <Selector
                  onClick={() => {
                    setBuy(true)
                    // setValue(0)
                  }}
                  active={buy}
                >
                  <StyledSelectorText active={buy}>Buy {outputCurrency?.symbol} </StyledSelectorText>
                </Selector>
                <Selector
                  onClick={() => {
                    setBuy(false)
                    // setValue(0)
                  }}
                  active={!buy}
                >
                  <StyledSelectorText active={!buy}>Sell {outputCurrency?.symbol}</StyledSelectorText>
                </Selector>
              </Filter>
            </FilterWrapper>
            <CurrencyInputPanel
              value={formattedAmounts[Field.CURRENCY_A]}
              onUserInput={onFieldAInput}
              onMax={() => {
                !buy && chainId !== 8453 && llpBalance
                  ? onFieldAInput(llpBalance.toString())
                  : onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
              }}
              showMaxButton={true}
              currency={currencies[Field.CURRENCY_A] ?? null}
              id="add-liquidity-input-tokena"
              fiatValue={
                buy && chainId !== 8453
                  ? currencyAFiat
                  : buy && chainId === 8453
                  ? { data: inputValue && WETHPrice.data && (inputValue / 1e18) * WETHPrice?.data, isLoading: false }
                  : !buy && chainId === 8453 && WETHPrice.data
                  ? {
                      data: inputValue && (inputValue / 1e18) * limWETHPrice * WETHPrice.data,
                      isLoading: false,
                    }
                  : { data: inputValue && (inputValue / 1e18) * llpPrice, isLoading: false }
              }
              onCurrencySelect={buy && chainId !== 8453 ? handleCurrencySelect : undefined}
              llpBalance={!buy && chainId == 8453 ? limWETHBalance : !buy && chainId !== 8452 ? llpBalance : 0}
              label={
                <ThemedText.BodyPrimary style={{ marginTop: '15px', marginLeft: '15px' }}>Sell</ThemedText.BodyPrimary>
              }
              wethOnly={buy && outputCurrency?.symbol === 'limWETH'}
              buy={buy}
            />
            <ArrowWrapper
              onClick={() => {
                setBuy(!buy)
                // setValue(0)
              }}
              clickable={true}
            >
              <ArrowContainer color="white">
                <Maximize2 size="10" />
              </ArrowContainer>
            </ArrowWrapper>
            <CurrencyInputPanel
              value={
                chainId === 8453 && value
                  ? value.toPrecision(4)
                  : chainId !== 8453 && value
                  ? value.toPrecision(4)
                  : !value && chainId === 8453 && inputValue
                  ? (Number(inputValue) / 1e18).toString()
                  : currencyAFiat.data
                  ? formatDollarAmount({ num: currencyAFiat.data / llpPrice, long: true })
                  : '0'
              }
              onUserInput={
                buy
                  ? onFieldBInput
                  : () => {
                      null
                    }
              }
              showMaxButton={false}
              fiatValue={
                buy && chainId !== 8453 && value
                  ? { data: value * llpPrice, isLoading: false }
                  : buy && chainId === 8453 && WETHPrice.data && value
                  ? { data: value * limWETHPrice * WETHPrice.data, isLoading: false }
                  : !buy && value
                  ? { data: value * activePrice, isLoading: false }
                  : !buy && chainId === 8453 && !value && inputValue && WETHPrice.data
                  ? { data: (inputValue / 1e18) * WETHPrice.data, isLoading: false }
                  : !buy && chainId !== 8453 && !value && inputValue && WETHPrice.data
                  ? { data: (inputValue / 1e18) * activePrice, isLoading: false }
                  : buy && chainId === 8453 && !value && inputValue && WETHPrice.data
                  ? { data: (inputValue / 1e18) * WETHPrice.data, isLoading: false }
                  : buy && chainId !== 8453 && !value && inputValue && WETHPrice.data
                  ? { data: (inputValue / 1e18) * limWETHPrice * WETHPrice.data, isLoading: false }
                  : value
                  ? { data: value * activePrice, isLoading: false }
                  : { data: currencyAFiat.data, isLoading: false }
              }
              currency={currencies[Field.CURRENCY_B] ?? null}
              id="add-liquidity-input-tokenb"
              onCurrencySelect={!buy && chainId !== 8453 ? handleCurrencySelect : undefined}
              llpBalance={buy && chainId == 8453 ? limWETHBalance : buy && chainId !== 8453 ? llpBalance : 0}
              label={
                <ThemedText.BodyPrimary style={{ marginTop: '15px', marginLeft: '15px' }}>Buy</ThemedText.BodyPrimary>
              }
              wethOnly={!buy && outputCurrency?.symbol === 'limWETH'}
              priceImpact={
                buy && chainId === 8453 && WETHPrice.data
                  ? computeFiatValuePriceImpact(
                      inputValue && WETHPrice.data && (inputValue / 1e18) * WETHPrice?.data,
                      value * limWETHPrice * WETHPrice.data
                    )
                  : !buy && chainId === 8453 && WETHPrice.data
                  ? computeFiatValuePriceImpact(
                      inputValue && (inputValue / 1e18) * limWETHPrice * WETHPrice.data,
                      value * activePrice
                    )
                  : buy
                  ? computeFiatValuePriceImpact(currencyAFiat.data, value * llpPrice)
                  : computeFiatValuePriceImpact(inputValue && (inputValue / 1e18) * llpPrice, value * activePrice)
              }
              llp={true}
              buy={buy}
            />
            {!account ? (
              <ButtonBlue onClick={toggleWalletDrawer} text="Connect Wallet" />
            ) : liqError && chainId === 42161 ? (
              <ButtonError text="Not enough liquidity"></ButtonError>
            ) : liqError && chainId === 8453 && limWETHBalance > Number(formattedAmounts[Field.CURRENCY_A]) ? (
              <ButtonError text="Not enough liquidity"></ButtonError>
            ) : typedValue && vaultApprovalState !== ApprovalState.APPROVED ? (
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
                      <Trans>Approve use of {currencies?.[Field.CURRENCY_A]?.symbol}</Trans>
                    </MouseoverTooltip>
                  </>
                )}
              </ButtonError>
            ) : (errorMessage && llpBalance < Number(formattedAmounts[Field.CURRENCY_A]) && !value) ||
              (errorMessage && limWETHBalance < Number(formattedAmounts[Field.CURRENCY_A]) && !value) ? (
              <ButtonError text={errorMessage}></ButtonError>
            ) : buy ? (
              <ButtonBlue
                onClick={outputCurrency?.symbol === 'LLP' ? handleDeposit : handleLimWethDeposit}
                text={`Buy ${outputCurrency?.symbol}`}
              ></ButtonBlue>
            ) : (
              <ButtonBlue
                onClick={outputCurrency?.symbol === 'LLP' ? handleRedeem : handleLimWethRedeem}
                text={`Sell ${outputCurrency?.symbol}`}
              ></ButtonBlue>
            )}
          </CurrencyWrapper>
        </AddLiquidityRow>
        <AutoColumn style={{ marginTop: '30px' }}>
          {/* {outputCurrency?.symbol === 'limWETH' && (
            <>
              <div style={{ display: 'flex', gap: '5px' }}>
                <ThemedText.BodySecondary fontWeight={600}>WETH-limWETH LP: </ThemedText.BodySecondary>
                <ThemedText.BodyPrimary>Historical Performance </ThemedText.BodyPrimary>
              </div>
              <LineChartSimple />
            </>
          )} */}

          {chainId !== 8453 && (
            <>
              <ThemedText.BodySecondary>LLP Index Composition</ThemedText.BodySecondary>
              <IndexWrapper>
                <IndexHeader />
                {indexData &&
                  WETHPrice &&
                  WBTCPrice &&
                  outputCurrency?.symbol === 'LLP' &&
                  indexData.map((tok: any) => {
                    return (
                      <>
                        <LoadedCellWrapper key={tok.token.symbol}>
                          <LoadedCell style={{ paddingLeft: '20px' }}>
                            <CurrencyLogo currency={tok.token} size="20px" />
                            <ThemedTextBodySmall fontWeight={700} color="textSecondary">
                              {tok.token.symbol}
                            </ThemedTextBodySmall>
                          </LoadedCell>
                          <LoadedCell>
                            <ThemedTextBodySmall fontWeight={700} color="textSecondary">
                              {formatDollarAmount({ num: tok?.price, long: true })}
                            </ThemedTextBodySmall>
                          </LoadedCell>
                          <LoadedCell>
                            <ThemedTextBodySmall fontWeight={700} color="textSecondary">
                              {formatDollarAmount({
                                num: tok.poolBal / Number(`1e${tok.token.decimals}`),
                                long: true,
                              }) +
                                ' ' +
                                tok.token.symbol}
                            </ThemedTextBodySmall>
                          </LoadedCell>
                          <LoadedCell>
                            <ThemedTextBodySmall fontWeight={700} color="textSecondary">
                              {formatDollarAmount({
                                num: (Number(tok.weight) / Number(`1e${18}`)) * 100,
                                long: true,
                              })}
                              %
                            </ThemedTextBodySmall>
                          </LoadedCell>
                          <LoadedCell>
                            <ThemedTextBodySmall fontWeight={700} color="textSecondary">
                              {formatDollarAmount({
                                num: Number(tok.targetWeight),
                                long: true,
                              })}
                              %
                            </ThemedTextBodySmall>
                          </LoadedCell>

                          <LoadedCell>
                            <ThemedTextBodySmall fontWeight={700} color="textSecondary">
                              {formatDollarAmount({
                                num: (Number(tok.util) / Number(`1e${18}`)) * 100,
                                long: true,
                              })}
                              %
                            </ThemedTextBodySmall>
                          </LoadedCell>
                          <LoadedCell>
                            <ThemedTextBodySmall fontWeight={700} color="textSecondary">
                              {formatDollarAmount({
                                num:
                                  (Number(tok.poolBal) / Number(`1e${tok.token.decimals}`)) *
                                  (1 - Number(tok.util) / Number(`1e${18}`)),
                                long: true,
                              }) +
                                ' ' +
                                tok.token.symbol}
                            </ThemedTextBodySmall>
                          </LoadedCell>
                        </LoadedCellWrapper>
                      </>
                    )
                  })}
              </IndexWrapper>
            </>
          )}
        </AutoColumn>
      </AutoColumn>
      {chainId === 8453 && (
        <RowBetween>
          <LimWETHSource>
            <ThemedText.BodySecondary>Sources of yield for LimWETH</ThemedText.BodySecondary>
            <ThemedText.BodySmall> 1. Premiums collected from traders</ThemedText.BodySmall>
            <ThemedText.BodySmall>
              {' '}
              2. Loan origination fees from traders&#40;collected once when position is opened&#41;
            </ThemedText.BodySmall>
            <ThemedText.BodySmall>
              {' '}
              3. Profit share paid by leverage traders&#40;5% of profit generated by default&#41;
            </ThemedText.BodySmall>
            <ThemedText.BodySmall> 4. Spot exchange trading fees generated in Uniswap</ThemedText.BodySmall>
          </LimWETHSource>
          <Highlights />
        </RowBetween>
      )}
      <RowBetween>
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
      </RowBetween>
    </Wrapper>
  )
}

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
`

const Wrapper = styled.div`
  padding: 30px;
  padding-top: 0px;
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
    width: 100%;
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
  @media only screen and (max-width: ${MOBILE_MEDIA_BREAKPOINT}) {
    width: 100%;
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
