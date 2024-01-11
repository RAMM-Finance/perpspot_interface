import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import CurrencyInputPanel from 'components/BaseSwapPanel'
import { ButtonPrimary } from 'components/Button'
import { OutlineCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { RowBetween, RowStart } from 'components/Row'
import { PoolSelector } from 'components/swap/PoolSelector'
import { ArrowWrapper } from 'components/swap/styleds'
import { useToggleWalletDrawer } from 'components/WalletDropdown'
import { useCurrency } from 'hooks/Tokens'
import { useStablecoinValue } from 'hooks/useStablecoinPrice'
import { ArrowContainer } from 'pages/Swap'
import React, { useMemo } from 'react'
import { ArrowUpRight, Maximize2 } from 'react-feather'
import { useDerivedLmtMintInfo, useV3MintActionHandlers, useV3MintState } from 'state/mint/v3/hooks'
import { useDerivedSwapInfo } from 'state/swap/hooks'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { maxAmountSpend } from 'utils/maxAmountSpend'

import { Field as Fields } from '../../state/mint/v3/actions'
import { Field } from '../../state/swap/actions'

export default function SimplePool() {
  const { account, chainId, provider } = useWeb3React()
  const toggleWalletDrawer = useToggleWalletDrawer()

  const { currencies: tokens } = useDerivedSwapInfo()

  const [inputCurrency, outputCurrency] = useMemo(() => {
    return [tokens[Field.INPUT], tokens[Field.OUTPUT]]
  }, [tokens])

  const baseCurrency = inputCurrency

  const quoteCurrency =
    baseCurrency && outputCurrency && baseCurrency.wrapped.equals(outputCurrency.wrapped) ? undefined : outputCurrency
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
  const { independentField, typedValue, startPriceTypedValue } = useV3MintState()

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const { onFieldAInput, onFieldBInput, onLeftRangeInput, onRightRangeInput, onStartPriceInput } =
    useV3MintActionHandlers(noLiquidity)

  const usdcValues = {
    [Fields.CURRENCY_A]: useStablecoinValue(parsedAmounts[Fields.CURRENCY_A]),
    [Fields.CURRENCY_B]: useStablecoinValue(parsedAmounts[Fields.CURRENCY_B]),
  }

  const usdcValueCurrencyA = usdcValues[Fields.CURRENCY_A]
  const usdcValueCurrencyB = usdcValues[Fields.CURRENCY_B]
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

  const maxAmounts: { [field in Fields]?: CurrencyAmount<Currency> } = [Fields.CURRENCY_A, Fields.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field]),
      }
    },
    {}
  )

  const atMaxAmounts: { [field in Fields]?: CurrencyAmount<Currency> } = [Fields.CURRENCY_A, Fields.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
      }
    },
    {}
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
    },
    {
      name: 'WBTC',
      currency: useCurrency('0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f'),
      price: 123,
      pool: 230000,
      weight: '25.3% / 26%',
      util: 12,
    },
    {
      name: 'USDC',
      currency: useCurrency('0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'),

      price: 123,
      pool: 230000,
      weight: '25.3% / 26%',
      util: 12,
    },
  ]

  console.log(useCurrency('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'))

  return (
    <Wrapper>
      <AutoColumn>
        <RowStart style={{ marginBottom: '20px' }}>
          <AutoColumn gap="5px">
            <ThemedText.HeadlineMedium color="textSecondary">Buy / Sell</ThemedText.HeadlineMedium>
            <ThemedText.BodyPrimary>
              Purchase tokens to earn ETH fees from swaps and leverage trading.
            </ThemedText.BodyPrimary>
          </AutoColumn>
        </RowStart>
        <RowBetween align="start">
          <AutoColumn style={{ width: '50%' }} gap="40px">
            <PoolSelector largeWidth={true} />
            <DetailsCard>
              <RowBetween style={{ marginBottom: '6px' }}>
                <ThemedText.BodyPrimary>Price: </ThemedText.BodyPrimary>
                <ThemedText.BodySecondary>19.28</ThemedText.BodySecondary>
              </RowBetween>
              <RowBetween style={{ marginBottom: '6px' }}>
                <ThemedText.BodyPrimary>Wallet:</ThemedText.BodyPrimary>
                <ThemedText.BodySecondary>0.000 LLP ($0.00)</ThemedText.BodySecondary>
              </RowBetween>
              <RowBetween style={{ marginBottom: '20px' }}>
                <ThemedText.BodyPrimary>Staked: </ThemedText.BodyPrimary>
                <ThemedText.BodySecondary>0.000 LLP ($0.00)</ThemedText.BodySecondary>
              </RowBetween>
              <hr />
              <RowBetween style={{ marginTop: '20px', marginBottom: '6px' }}>
                <ThemedText.BodyPrimary>Estimated APR: </ThemedText.BodyPrimary>
                <ThemedText.BodySecondary>{`50 %` + `  + swap fees`}</ThemedText.BodySecondary>
              </RowBetween>
              <RowBetween style={{ marginBottom: '55px' }}>
                <ThemedText.BodyPrimary>Utilization Rate:</ThemedText.BodyPrimary>
                <ThemedText.BodySecondary>50 %</ThemedText.BodySecondary>
              </RowBetween>
            </DetailsCard>
          </AutoColumn>
          <div style={{ display: 'flex', flexDirection: 'column', width: '45%', gap: '5px' }}>
            <CurrencyInputPanel
              value={formattedAmounts[Fields.CURRENCY_A]}
              onUserInput={onFieldAInput}
              onMax={() => {
                onFieldAInput(maxAmounts[Fields.CURRENCY_A]?.toExact() ?? '')
              }}
              showMaxButton={!atMaxAmounts[Fields.CURRENCY_A]}
              currency={currencies[Fields.CURRENCY_A] ?? null}
              id="add-liquidity-input-tokena"
              fiatValue={currencyAFiat}
              showCommonBases
              label={
                <ThemedText.BodyPrimary style={{ marginTop: '15px', marginLeft: '15px' }}>Sell</ThemedText.BodyPrimary>
              }
            />
            <ArrowWrapper clickable={true}>
              <ArrowContainer color="white">
                <Maximize2 size="10" />
              </ArrowContainer>
            </ArrowWrapper>
            <CurrencyInputPanel
              value={formattedAmounts[Fields.CURRENCY_B]}
              onUserInput={onFieldBInput}
              onMax={() => {
                onFieldBInput(maxAmounts[Fields.CURRENCY_B]?.toExact() ?? '')
              }}
              showMaxButton={!atMaxAmounts[Fields.CURRENCY_B]}
              fiatValue={currencyBFiat}
              currency={currencies[Fields.CURRENCY_B] ?? null}
              id="add-liquidity-input-tokenb"
              showCommonBases
              label={
                <ThemedText.BodyPrimary style={{ marginTop: '15px', marginLeft: '15px' }}>Buy</ThemedText.BodyPrimary>
              }
            />
            {!account ? (
              <ButtonPrimary
                style={{ fontSize: '14px', borderRadius: '10px', background: '#3783fd' }}
                width="14"
                padding=".5rem"
                fontWeight={600}
                onClick={toggleWalletDrawer}
              >
                Connect Wallet
              </ButtonPrimary>
            ) : (
              <ButtonPrimary
                style={{ fontSize: '14px', borderRadius: '10px' }}
                width="14"
                padding=".5rem"
                fontWeight={600}
              >
                Buy
              </ButtonPrimary>
            )}
          </div>
        </RowBetween>
        <AutoColumn style={{ marginTop: '30px' }}>
          <ThemedText.BodySecondary>LPP Index Composition</ThemedText.BodySecondary>
          <IndexWrapper>
            <IndexHeader />

            {tokensList.map((tok: any) => {
              return (
                <LoadedCellWrapper key={tok.name}>
                  <LoadedCell>
                    <CurrencyLogo currency={tok.currency} />
                    <ThemedText.BodySecondary>{tok.name}</ThemedText.BodySecondary>
                  </LoadedCell>
                  <LoadedCell>
                    <ThemedText.BodySecondary>{tok.price}</ThemedText.BodySecondary>
                  </LoadedCell>
                  <LoadedCell>
                    <ThemedText.BodySecondary>{tok.pool}</ThemedText.BodySecondary>
                  </LoadedCell>
                  <LoadedCell>
                    <ThemedText.BodySecondary>{tok.weight}</ThemedText.BodySecondary>
                  </LoadedCell>
                  <LoadedCell>
                    <ThemedText.BodySecondary>{tok.util}</ThemedText.BodySecondary>
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
`

const DetailsCard = styled(OutlineCard)`
  background-color: ${({ theme }) => theme.surface1};
`

const LoadedCell = styled.div`
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
`

const LoadedCellWrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr 2fr 3fr 3fr;
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
  grid-template-columns: 3fr 2fr 2fr 3fr 3fr;
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
