import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import CurrencyInputPanel from 'components/BaseSwapPanel'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import Loader from 'components/Icons/LoadingSpinner'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { RowBetween, RowStart } from 'components/Row'
import { ArrowWrapper } from 'components/swap/styleds'
import { MouseoverTooltip } from 'components/Tooltip'
import { useToggleWalletDrawer } from 'components/WalletDropdown'
import { LMT_VAULT } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { BigNumber } from 'ethers'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useVaultContract } from 'hooks/useContract'
import { useStablecoinValue } from 'hooks/useStablecoinPrice'
import { ArrowContainer } from 'pages/Swap'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, ChevronDown, Maximize2 } from 'react-feather'
import { Info } from 'react-feather'
import { useDerivedLmtMintInfo, useV3MintActionHandlers, useV3MintState } from 'state/mint/v3/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { currencyId } from 'utils/currencyId'
import { maxAmountSpend } from 'utils/maxAmountSpend'

import { ReactComponent as Logo } from '../../assets/svg/Limitless_Logo_Black.svg'
import { Field } from '../../state/mint/v3/actions'
import * as styles from '../NavBar/style.css'
// TransactionType.MINT_LLP
export default function SimplePool({ codeActive }: { codeActive: boolean }) {
  const theme = useTheme()
  const [buy, setBuy] = useState(true)
  const [value, setValue] = useState<number>(0)
  const vaultContract = useVaultContract()
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<string>()
  const addTransaction = useTransactionAdder()

  const { account, chainId, provider } = useWeb3React()
  const toggleWalletDrawer = useToggleWalletDrawer()

  const [input, setInput] = useState('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1')

  const LLP = useCurrency('0x77475a8126AEF102899F67B7f2309eFB21Bb3c02')

  const inputCurrency = useCurrency(input)
  const outputCurrency = LLP

  const [baseCurrency, quoteCurrency] = useMemo(() => {
    return buy ? [inputCurrency, outputCurrency] : [outputCurrency, inputCurrency]
  }, [buy, inputCurrency, outputCurrency])

  const feeAmount = 500

  const existingPosition = undefined

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
    quoteCurrency ?? undefined,
    existingPosition
  )

  const { independentField, typedValue } = useV3MintState()

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const { onFieldAInput, onFieldBInput } = useV3MintActionHandlers(noLiquidity)

  const usdcValues = {
    [Field.CURRENCY_A]: useStablecoinValue(parsedAmounts[Field.CURRENCY_A]),
    [Field.CURRENCY_B]: useStablecoinValue(parsedAmounts[Field.CURRENCY_B]),
  }

  const usdcValueCurrencyA = usdcValues[Field.CURRENCY_A]
  const usdcValueCurrencyB = value

  const currencyAFiat = useMemo(
    () => ({
      data: usdcValueCurrencyA ? parseFloat(usdcValueCurrencyA.toSignificant()) : undefined,
      isLoading: false,
    }),
    [usdcValueCurrencyA]
  )
  const currencyBFiat = useMemo(
    () => ({
      data: usdcValueCurrencyB ? parseFloat(value.toFixed(2).toString()) : undefined,
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
      <HeaderCellWrapper>
        <HeaderCell>
          <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
            Token
          </ThemedText.SubHeaderSmall>
        </HeaderCell>
        <HeaderCell>
          <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
            Price
          </ThemedText.SubHeaderSmall>
        </HeaderCell>
        <HeaderCell>
          <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
            Pool
          </ThemedText.SubHeaderSmall>
        </HeaderCell>
        <HeaderCell>
          <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
            Weight
          </ThemedText.SubHeaderSmall>
        </HeaderCell>
        <HeaderCell>
          <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
            Utililzation
          </ThemedText.SubHeaderSmall>
        </HeaderCell>
        <HeaderCell>
          <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
            Maxiumum Withdrawable
          </ThemedText.SubHeaderSmall>
        </HeaderCell>
      </HeaderCellWrapper>
    )
  }

  const tokensList = [
    {
      name: 'WETH',
      currency: useCurrency('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'),
      price: 123,
      pool: 230000,
      weight: '25.3% / 26%',
      util: 12,
      maxWithdrawable: 12,
    },
    {
      name: 'WBTC',
      currency: useCurrency('0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f'),
      price: 123,
      pool: 230000,
      weight: '25.3% / 26%',
      util: 12,
      maxWithdrawable: 12,
    },
    {
      name: 'USDC',
      currency: useCurrency('0xaf88d065e77c8cC2239327C5EDb3A432268e5831'),
      price: 123,
      pool: 230000,
      weight: '25.3% / 26%',
      util: 12,
      maxWithdrawable: 12,
    },
  ]

  // allowance / approval
  const [vaultApprovalState, approveVault] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_A],
    LMT_VAULT[chainId ?? SupportedChainId.ARBITRUM_ONE]
  )

  //callStatic for deposit
  const cb = useCallback(async (): Promise<BigNumber> => {
    try {
      const amountIn = parsedAmounts[Field.CURRENCY_A]?.quotient.toString()
      let response
      console.log('input', baseCurrency?.wrapped.address, amountIn, account)
      if (baseCurrency && amountIn && account)
        response = await vaultContract?.callStatic.depositAnyToken(baseCurrency?.wrapped.address, amountIn, account)
      return response as BigNumber
    } catch (err) {
      throw new Error('reff')
    }
  }, [account, chainId, vaultContract, provider, parsedAmounts, baseCurrency])

  useEffect(() => {
    if (!parsedAmounts?.[Field.CURRENCY_A] || !account || !vaultContract || !chainId || !provider || !buy) {
      return
    }

    cb()
      .then((response) => {
        console.log(response)
        setValue(Number(response) / 1e18)
      })
      .catch((error) => {
        console.log(error)
        setValue(0)
      })
  }, [vaultContract, parsedAmounts, cb, account, chainId, provider, buy])

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
  }, [account, chainId, vaultContract, provider, parsedAmounts, baseCurrency])

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
  }, [callback, account, vaultContract, chainId, provider, parsedAmounts, txHash, attemptingTxn, error, addTransaction])

  //call static for redeem

  const cbredeem = useCallback(async (): Promise<BigNumber> => {
    try {
      const amountIn = parsedAmounts[Field.CURRENCY_A]?.quotient.toString()
      let response
      console.log('redeeminput', quoteCurrency?.wrapped.address, amountIn, account)
      if (quoteCurrency && amountIn && account)
        response = await vaultContract?.callStatic.redeemToAnyToken(
          quoteCurrency?.wrapped.address,
          amountIn,
          account,
          account
        )
      return response as BigNumber
    } catch (err) {
      throw new Error('reff')
    }
  }, [account, chainId, vaultContract, provider, parsedAmounts])

  useEffect(() => {
    if (!parsedAmounts?.[Field.CURRENCY_A] || !account || !vaultContract || !chainId || !provider || buy) {
      return
    }
    setAttemptingTxn(true)

    cbredeem()
      .then((response) => {
        console.log(response)
        setValue(Number(response) / 1e18)
      })
      .catch((error) => {
        console.error('referrr', error)
      })
  }, [account, vaultContract, chainId, provider, parsedAmounts, txHash, attemptingTxn, error, buy, cbredeem])

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
  }, [account, chainId, vaultContract, provider, parsedAmounts])

  const [llpBalance, setLlpBalance] = useState<number>(0)

  const handleRedeem = useCallback(() => {
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
  }, [redeemCallback, account, vaultContract, chainId, provider, parsedAmounts, txHash, attemptingTxn, error])

  useEffect(() => {
    if (!account || !provider || !vaultContract) return

    const call = async () => {
      try {
        const balance = await vaultContract.balanceOf(account)
        console.log('balance', balance.toString())
        setLlpBalance(() => Number(balance) / 1e18)
      } catch (error) {
        console.log('codebyowners err')
      }
    }
    call()
  }, [account, provider, vaultContract, attemptingTxn])

  const [data, setData] = useState<any>()
  const [mW, setMW] = useState<any>()
  const [llpPrice, setLlpPrice] = useState<any>()

  useEffect(() => {
    if (!provider || !vaultContract) return

    const call = async () => {
      try {
        const rawData = await vaultContract.getData()
        setData(rawData)

        const maxWithdrawableWETH = await vaultContract.maxRedeemableInToken(
          '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
        )
        const maxWithdrawableWBTC = await vaultContract.maxRedeemableInToken(
          '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f'
        )
        const maxWithdrawableUSDC = await vaultContract.maxRedeemableInToken(
          '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
        )
        setMW([maxWithdrawableWETH, maxWithdrawableWBTC, maxWithdrawableUSDC])

        const price = await vaultContract.previewRedeem(`${1e18}`)
        setLlpPrice(price)

        // rawdata[0] is total supply
        // 1 is totalbacking
        // 2 is utilization rate, i.e 0.5*1e18 is 50%
        // 3 is each token balance in vault (pool column in table)
        // 4 is each token weight, i.e 0.5*1e18 is 50%
        // 5 is each token util, i.e 0.5*1e18 is 50%
      } catch (error) {
        console.log('codebyowners err')
      }
    }

    call()
  }, [provider, vaultContract])

  // Pool currently unavailable for price values
  const WETH = useCurrency('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1')
  const WBTC = useCurrency('0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f')
  const USDC = useCurrency('0xaf88d065e77c8cC2239327C5EDb3A432268e5831')

  console.log(formattedAmounts[Field.CURRENCY_A])
  const indexData = useMemo(() => {
    if (data && mW) {
      return [
        {
          token: WETH,
          price: 12,
          poolBal: data[3][0],
          weight: data[4][0],
          util: data[4][0],
          maxWith: mW[0][0],
        },
        {
          token: WBTC,
          price: 12,
          poolBal: data[3][1],
          weight: data[4][1],
          util: data[4][1],
          maxWith: mW[1][0],
        },
        {
          token: USDC,
          price: 12,
          poolBal: data[3][2],
          weight: data[4][2],
          util: data[4][2],
          maxWith: mW[2][0],
        },
      ]
    } else {
      return undefined
    }
  }, [data, mW])

  // note that LLP decimal is 18, weth is 18, btc is 8, usdc is 6. they are in the currency object

  // Total Supply is raw supply
  // Total Backing is rawbacking
  // Utilization rate is

  return (
    <Wrapper>
      <AutoColumn>
        <RowStart style={{ marginBottom: '20px' }}>
          <AutoColumn gap="5px">
            <ThemedText.DeprecatedMediumHeader color="textSecondary">Buy / Sell LLP</ThemedText.DeprecatedMediumHeader>
            <ThemedText.BodyPrimary>Purchase or Sell LLP Tokens.</ThemedText.BodyPrimary>
          </AutoColumn>
        </RowStart>
        <RowBetween align="start">
          {/*<PoolSelector largeWidth={true} />*/}
          <DetailsCard>
            <RowStart padding="5px">
              <Logo width={25} fill="#fff" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ThemedText.BodySecondary>LLP</ThemedText.BodySecondary>
                  <ChevronDown width={16} />
                </div>
                <ThemedText.BodyPrimary fontSize={12}>LLP</ThemedText.BodyPrimary>
              </div>
            </RowStart>
            <RowBetween style={{ paddingTop: '20px', borderTop: `1px solid ${theme.accentActiveSoft}` }}>
              <ThemedText.BodyPrimary>Price: </ThemedText.BodyPrimary>
              <ThemedText.BodySecondary>{llpPrice && (llpPrice / 1e18).toFixed(2)}</ThemedText.BodySecondary>
            </RowBetween>
            <RowBetween>
              <ThemedText.BodyPrimary>Total Supply:</ThemedText.BodyPrimary>
              <ThemedText.BodySecondary>{data && (data[0] / 1e18).toFixed(2)}</ThemedText.BodySecondary>
            </RowBetween>
            <RowBetween>
              <ThemedText.BodyPrimary>Total Backing(USD) </ThemedText.BodyPrimary>
              <ThemedText.BodySecondary>{data && '$' + `${(data[1] / 1e18).toFixed(2)}`}</ThemedText.BodySecondary>
            </RowBetween>
            {buy ? (
              <RowBetween
                style={{ marginTop: '10px', paddingTop: '20px', borderTop: `1px solid ${theme.accentActiveSoft}` }}
              >
                <ThemedText.BodyPrimary>Estimated APR: </ThemedText.BodyPrimary>
                <ThemedText.BodySecondary>{`50 %` + `  + swap fees`}</ThemedText.BodySecondary>
              </RowBetween>
            ) : (
              <>
                <RowBetween
                  style={{ marginTop: '10px', paddingTop: '20px', borderTop: `1px solid ${theme.accentActiveSoft}` }}
                >
                  <ThemedText.BodyPrimary>Reserved: </ThemedText.BodyPrimary>
                  <ThemedText.BodySecondary>0.000 LLP ($0.00)</ThemedText.BodySecondary>
                </RowBetween>
                <RowBetween>
                  <ThemedText.BodyPrimary>Estimated APR: </ThemedText.BodyPrimary>
                  <ThemedText.BodySecondary>{`50 %` + `  + swap fees`}</ThemedText.BodySecondary>
                </RowBetween>
              </>
            )}

            <RowBetween>
              <ThemedText.BodyPrimary>Utilization Rate:</ThemedText.BodyPrimary>
              <ThemedText.BodySecondary>{data && data[2] / 1e18}%</ThemedText.BodySecondary>
            </RowBetween>
          </DetailsCard>
          <CurrencyWrapper>
            <FilterWrapper>
              <Filter>
                <Selector
                  onClick={() => {
                    setBuy(true)
                    setValue(0)
                  }}
                  active={buy}
                >
                  <StyledSelectorText active={buy}>Buy LLP</StyledSelectorText>
                </Selector>
                <Selector
                  onClick={() => {
                    setBuy(false)
                    setValue(0)
                  }}
                  active={!buy}
                >
                  <StyledSelectorText active={!buy}>Sell LLP</StyledSelectorText>
                </Selector>
              </Filter>
            </FilterWrapper>
            <CurrencyInputPanel
              value={formattedAmounts[Field.CURRENCY_A]}
              onUserInput={onFieldAInput}
              onMax={() => {
                !buy
                  ? onFieldAInput(llpBalance.toString())
                  : onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
              }}
              showMaxButton={true}
              currency={currencies[Field.CURRENCY_A] ?? null}
              id="add-liquidity-input-tokena"
              fiatValue={currencyAFiat}
              onCurrencySelect={buy ? handleCurrencySelect : undefined}
              llpBalance={!buy ? llpBalance : 0}
              label={
                <ThemedText.BodyPrimary style={{ marginTop: '15px', marginLeft: '15px' }}>Sell</ThemedText.BodyPrimary>
              }
            />
            <ArrowWrapper
              onClick={() => {
                setBuy(!buy)
                setValue(0)
              }}
              clickable={true}
            >
              <ArrowContainer color="white">
                <Maximize2 size="10" />
              </ArrowContainer>
            </ArrowWrapper>
            <CurrencyInputPanel
              value={value.toString()}
              onUserInput={
                buy
                  ? onFieldBInput
                  : () => {
                      null
                    }
              }
              showMaxButton={false}
              fiatValue={currencyBFiat}
              currency={currencies[Field.CURRENCY_B] ?? null}
              id="add-liquidity-input-tokenb"
              onCurrencySelect={!buy ? handleCurrencySelect : undefined}
              llpBalance={buy ? llpBalance : 0}
              label={
                <ThemedText.BodyPrimary style={{ marginTop: '15px', marginLeft: '15px' }}>Buy</ThemedText.BodyPrimary>
              }
            />
            {!account ? (
              <ButtonPrimary
                className={styles.blueButton}
                style={{ fontSize: '14px', borderRadius: '10px', background: '#3783fd' }}
                width="14"
                padding=".5rem"
                fontWeight={600}
                onClick={toggleWalletDrawer}
              >
                Connect Wallet
              </ButtonPrimary>
            ) : !codeActive ? (
              <ButtonPrimary
                className={styles.blueButton}
                style={{ fontSize: '16px', borderRadius: '10px', background: '#3783fd', height: '40px' }}
                width="14"
                padding=".5rem"
                fontWeight={600}
              >
                Not using code
              </ButtonPrimary>
            ) : typedValue && vaultApprovalState !== ApprovalState.APPROVED ? (
              <ButtonPrimary
                onClick={approveVault}
                style={{
                  fontSize: '16px',
                  borderRadius: '10px',
                  height: '40px',
                }}
                width="14"
                padding=".5rem"
                disabled={vaultApprovalState === ApprovalState.PENDING}
              >
                {vaultApprovalState === ApprovalState.PENDING ? (
                  <>
                    <Loader size="18px" />
                    <Trans>Approval pending</Trans>
                  </>
                ) : (
                  <>
                    <MouseoverTooltip
                      style={{ height: '25px', display: 'flex', alignItems: 'center' }}
                      text={<Trans>Permission is required to deposit and mint LLP. </Trans>}
                    >
                      <Info size={18} />
                      <Trans>Approve use of {currencies?.[Field.CURRENCY_A]?.symbol}</Trans>
                    </MouseoverTooltip>
                  </>
                )}
              </ButtonPrimary>
            ) : (errorMessage && llpBalance < Number(formattedAmounts[Field.CURRENCY_A])) || !value ? (
              <ButtonPrimary
                style={{ fontSize: '16px', borderRadius: '10px', height: '40px' }}
                width="14"
                padding=".5rem"
                fontWeight={600}
                onClick={handleDeposit}
              >
                {errorMessage}
              </ButtonPrimary>
            ) : buy ? (
              <ButtonPrimary
                className={styles.blueButton}
                style={{ fontSize: '16px', borderRadius: '10px', background: '#3783fd', height: '40px' }}
                width="14"
                padding=".5rem"
                fontWeight={600}
                onClick={handleDeposit}
              >
                Buy LLP
              </ButtonPrimary>
            ) : (
              <ButtonPrimary
                className={styles.blueButton}
                style={{ fontSize: '16px', borderRadius: '10px', background: '#3783fd', height: '40px' }}
                width="14"
                padding=".5rem"
                fontWeight={600}
                onClick={handleRedeem}
              >
                <Trans>Sell</Trans> LLP
              </ButtonPrimary>
            )}
          </CurrencyWrapper>
        </RowBetween>
        <AutoColumn style={{ marginTop: '30px' }}>
          <ThemedText.BodySecondary>LLP Index Composition</ThemedText.BodySecondary>
          <IndexWrapper>
            <IndexHeader />

            {indexData &&
              indexData.map((tok: any) => {
                return (
                  <LoadedCellWrapper key={tok.token.symbol}>
                    <LoadedCell>
                      <CurrencyLogo currency={tok.token} />
                      <ThemedText.BodySecondary>{tok.token.symbol}</ThemedText.BodySecondary>
                    </LoadedCell>
                    <LoadedCell>
                      <ThemedText.BodySecondary>{tok.price}</ThemedText.BodySecondary>
                    </LoadedCell>
                    <LoadedCell>
                      <ThemedText.BodySecondary>{`${
                        tok.poolBal / Number(`1e${tok.token.decimals}`)
                      }`}</ThemedText.BodySecondary>
                    </LoadedCell>
                    <LoadedCell>
                      <ThemedText.BodySecondary>
                        {`${(tok.weight / Number(`1e${tok.token.decimals}`)) * 100}`}%
                      </ThemedText.BodySecondary>
                    </LoadedCell>
                    <LoadedCell>
                      <ThemedText.BodySecondary>
                        {`${(tok.util / Number(`1e${tok.token.decimals}`)) * 100}`}%
                      </ThemedText.BodySecondary>
                    </LoadedCell>
                    <LoadedCell>
                      <ThemedText.BodySecondary>
                        {`${(tok.maxWith / Number(`1e${tok.token.decimals}`)) * 100}`}
                      </ThemedText.BodySecondary>
                    </LoadedCell>
                  </LoadedCellWrapper>
                )
              })}
          </IndexWrapper>
        </AutoColumn>
        <RowBetween>
          <FaqWrapper>
            <FaqElement>
              <ThemedText.BodySecondary fontSize={15} fontWeight={800}>
                Learn about providing liquidity
              </ThemedText.BodySecondary>
              <ArrowUpRight size="20" />
            </FaqElement>{' '}
            <ThemedText.BodyPrimary fontSize={15} fontWeight={800}>
              Check out our v3 LP walkthrough and migration guidelines.
            </ThemedText.BodyPrimary>
          </FaqWrapper>
          <FaqWrapper>
            <FaqElement>
              {' '}
              <ThemedText.BodySecondary fontSize={15} fontWeight={800}>
                Top Pools
              </ThemedText.BodySecondary>
              <ArrowUpRight size="20" />
            </FaqElement>{' '}
            <ThemedText.BodyPrimary fontSize={15} fontWeight={800}>
              Explore Limitless Analytics
            </ThemedText.BodyPrimary>
          </FaqWrapper>
        </RowBetween>
      </AutoColumn>
    </Wrapper>
  )
}

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
  height: 381px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  gap: 10px;
`

const LoadedCell = styled.div`
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
`

const LoadedCellWrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr 2fr 2fr 2fr 2fr;
  padding: 10px;
  border-radius: 10px;
  :hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  justify-content: center;
`

const HeaderCell = styled.div``
const HeaderCellWrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr 2fr 2fr 2fr 2fr;
  border-bottom: 1px solid ${({ theme }) => theme.backgroundOutline};
  padding: 10px;
`

const IndexWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-radius: 10px;
  width: 100%;
  margin-right: 0.125rem;
  margin-top: 10px;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
`

const FaqWrapper = styled.div`
  margin-top: 50px;
  width: 48%;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
`

const FaqElement = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  :hover {
    cursor: pointer;
    opacity: 75%;
  }
`

const CurrencyWrapper = styled.div`
  width: 42%;
  background-color: ${({ theme }) => theme.backgroundSurface};
  padding: 15px;
  border-radius: 10px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 5px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
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

const StyledSelectorText = styled.div<{ active: boolean }>`
  font-size: 16px;
  color: ${({ theme, active }) => (active ? theme.textSecondary : theme.textPrimary)};
  font-weight: ${({ active }) => (active ? '600' : '300')};
  text-align: center;
`

const Selector = styled.div<{ active: boolean }>`
  font-color: ${({ active, theme }) => (active ? theme.background : 'none')};
  width: 100%;
  border-radius: 5px;
  padding: 8px;
  background-color: ${({ active, theme }) => (active ? '#3783fd' : theme.accentActiveSoft)};
  cursor: pointer;
  &:hover {
    opacity: 95%;
  }
`
