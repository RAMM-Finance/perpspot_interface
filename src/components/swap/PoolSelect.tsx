import { NumberType } from '@uniswap/conedison/format'
import { Currency } from '@uniswap/sdk-core'
import { computePoolAddress } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { AutoColumn } from 'components/Column'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { NavDropdown } from 'components/NavBar/NavDropdown'
import { RowBetween } from 'components/Row'
import { LoadingBubble } from 'components/Tokens/loading'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { useCurrency } from 'hooks/Tokens'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { useLatestPoolPriceData } from 'hooks/usePoolPriceData'
import { usePool } from 'hooks/usePools'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { Box } from 'nft/components/Box'
import { Column, Row } from 'nft/components/Flex'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { useGetPoolsAndData } from 'state/application/hooks'
import { Field } from 'state/swap/actions'
import { useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'

import * as styles from './PoolSelector.css'
import PoolSelectRow from './PoolSelectRow'

const LOGO_SIZE = 20

const PoolListHeader = styled(ThemedText.BodySmall)`
  font-size: 12px;
  margin-top: 1rem;
  margin-bottom: 1rem;
`
const PoolListContainer = styled.div`
  display: grid;
  grid-template-columns: 2.4fr 0.8fr 1fr;
  width: 100%;
  padding-left: 0.5vw;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
`

const Label = styled.div`
  font-size: 12px;
  margin-left: 5px;
  width: 8rem;
`
const Status = styled.div`
  display: flex;
  align-items: center;
  width: ${LOGO_SIZE}px;
`

const ListWrapper = styled.div`
  overflow-y: auto;
  height: fit-content;
`

const Container = styled.button<{ disabled: boolean; active: boolean }>`
  background: ${({ theme, active }) => (active ? theme.accentActiveSoft : 'none')};
  border: none;
  border-radius: 5px;
  color: ${({ theme, active }) => (active ? theme.textSecondary : theme.textPrimary)};
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
  display: grid;
  grid-template-columns: 2.4fr 0.8fr 1fr;
  line-height: 10px;
  align-items: center;
  padding: 3px;

  margin-bottom: 5px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  text-align: left;
  transition: ${({ theme }) => theme.transition.duration.medium} ${({ theme }) => theme.transition.timing.ease}
    background-color;
  width: 100%;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    width: 100%;
  }

  &:hover {
    background-color: ${({ disabled, theme }) => (disabled ? 'none' : theme.backgroundOutline)};
  }
`

const Wrapper = styled.div`
  border: solid 1px ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.backgroundSurface};
  margin-bottom: 0.5rem;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  border-radius: 10px;
  width: 97%;
  padding: 0.25rem;
  height: fit-content;
`

const DropWrapper = styled.div`
  background-color: ${({ theme }) => theme.backgroundSurface};

  margin-bottom: 0.5rem;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  border-radius: 10px;
  width: 97%;
  padding: 0.25rem;
  height: fit-content;
`

export default function PoolSelect({
  detailsLoading,
  chainId,
  dropdown,
}: {
  detailsLoading: boolean
  chainId: number | undefined
  dropdown: boolean
}) {
  const theme = useTheme()

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const ref = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setIsOpen(false), [modalRef])

  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const { onCurrencySelection, onPairSelection } = useSwapActionHandlers()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const [tokenLoaderTimerElapsed, setTokenLoaderTimerElapsed] = useState(false)
  // Timeout token loader after 3 seconds to avoid hanging in a loading state.
  useEffect(() => {
    const tokenLoaderTimer = setTimeout(() => {
      setTokenLoaderTimerElapsed(true)
    }, 3000)
    return () => clearTimeout(tokenLoaderTimer)
  }, [])

  const isLoading = Boolean(!tokenLoaderTimerElapsed)

  const handleCurrencySelect = useCallback(
    (currencyIn: Currency, currencyOut: Currency) => {
      if (
        (currencyIn.symbol === 'LINK' && currencyOut.symbol === 'WETH') ||
        (currencyIn.symbol === 'WETH' && currencyOut.symbol === 'wBTC') ||
        (currencyIn.symbol === 'ARB' && currencyOut.symbol === 'WETH') ||
        (currencyIn.symbol === 'GMX' && currencyOut.symbol === 'WETH')
      ) {
        localStorage.setItem('currencyIn', JSON.stringify(currencyOut.wrapped.address))
        localStorage.setItem('currencyOut', JSON.stringify(currencyIn.wrapped.address))
        onCurrencySelection(Field.INPUT, currencyOut)
        onCurrencySelection(Field.OUTPUT, currencyIn)
      } else {
        localStorage.setItem('currencyIn', JSON.stringify(currencyIn.wrapped.address))
        localStorage.setItem('currencyOut', JSON.stringify(currencyOut.wrapped.address))
        onCurrencySelection(Field.INPUT, currencyIn)
        onCurrencySelection(Field.OUTPUT, currencyOut)
      }
      // onPairSelection(Field.INPUT, Field.OUTPUT, currencyIn, currencyOut)
    },
    [onCurrencySelection]
  )
  interface Pool {
    blockTimeStamp: string
    fee: number
    id: string
    pool: string
    tickDiscretization: number
    token0: string
    token1: string
    __typename: string
  }

  const availablePools = useGetPoolsAndData()

  const pair = useMemo(() => {
    if (!availablePools) {
      return undefined
    } else {
      return availablePools.find(
        (pool: Pool) =>
          (pool.token0 === inputCurrency?.wrapped.address && pool.token1 === outputCurrency?.wrapped.address) ||
          (pool.token1 === inputCurrency?.wrapped.address && pool.token0 === outputCurrency?.wrapped.address)
      )
    }
  }, [availablePools, inputCurrency, outputCurrency])

  const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, pair?.fee ?? undefined)

  const poolAddress = useMemo(() => {
    if (!pool || !chainId) return null
    return computePoolAddress({
      factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
      tokenA: pool.token0,
      tokenB: pool.token1,
      fee: pool.fee,
    })
  }, [chainId, pool])
  const { data: priceData } = useLatestPoolPriceData(poolAddress ?? undefined)

  const currentPricePool = useMemo(() => {
    if (!pool || priceData) return undefined
    const token0 = pool.token0
    const token1 = pool.token1
    let price = new BN(Number(pool.token0Price.quotient.toString()))
    if (price.toString() == '0') price = new BN(Number(pool.token1Price.quotient.toString()))
    if (token0?.wrapped.symbol === 'wBTC' && token1?.wrapped.symbol === 'WETH') {
      // return price.div( new BN( 10** (token1?.wrapped.decimals - token0?.wrapped.decimals)))
      return new BN(1).div(price.div(new BN(10 ** (token1?.wrapped.decimals - token0?.wrapped.decimals))))
    } else if (token0?.wrapped.symbol === 'WETH' && token1?.wrapped.symbol === 'USDC') {
      return new BN(1).div(price.div(new BN(10 ** (token0?.wrapped.decimals - token1?.wrapped.decimals))))
    } else if (token0?.wrapped.symbol === 'wBTC' && token1?.wrapped.symbol === 'USDC') {
      return price.div(new BN(10 ** (token1?.wrapped.decimals - token0?.wrapped.decimals)))
    } else if (token0?.wrapped.symbol === 'WETH' && token1?.wrapped.symbol === 'ARB') {
      return price
    } else if (token0?.wrapped.symbol === 'LDO' && token1?.wrapped.symbol === 'WETH') {
      return price.div(new BN(10 ** (token1?.wrapped.decimals - token0?.wrapped.decimals)))
    } else {
      return new BN(1).div(price.div(new BN(10 ** (token1?.wrapped.decimals - token0?.wrapped.decimals))))
    }
  }, [priceData, pool])

  const [currPrice, delta] = useMemo(() => {
    if (!priceData) return [undefined, undefined]
    let price = priceData.priceNow
    let invertPrice = price.lt(1)
    if (
      pool?.token0.address.toLowerCase() == '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f'.toLowerCase() &&
      pool?.token1.address.toLowerCase() == '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'.toLowerCase()
    )
      invertPrice = false

    let delt
    const price24hAgo = new BN(1).div(priceData.price24hAgo)
    if (invertPrice) {
      price = new BN(1).div(price)
      delt = price.minus(price24hAgo).div(price).times(100)
    } else {
      delt = price.minus(priceData.price24hAgo).div(price).times(100)
    }
    return [price, delt]
  }, [priceData, pool])

  const drop = (
    <NavDropdown
      ref={modalRef}
      style={{
        background: '#040609',
        position: 'absolute',
        height: 'fit-content',
        zIndex: '3',
        marginTop: '3px',
        width: '320px',
      }}
    >
      <DropWrapper>
        <Row flexDirection="column">
          <PoolListContainer>
            <PoolListHeader>Pool</PoolListHeader>

            <PoolListHeader>24h Δ</PoolListHeader>
            <PoolListHeader>Price</PoolListHeader>
          </PoolListContainer>
        </Row>
        <ListWrapper>
          {isLoading || detailsLoading ? (
            <AutoColumn gap="5px">
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
            </AutoColumn>
          ) : (
            <Column style={{ gap: '3px' }}>
              {availablePools &&
                availablePools.map((curr: any) => {
                  return (
                    <PoolSelectRow
                      closeModal={setIsOpen}
                      currencyId={[curr.token0, curr.token1]}
                      onCurrencySelect={handleCurrencySelect}
                      key={`${curr.token0}-${curr.token1}-${curr.fee}`}
                      fee={curr?.fee}
                      chainId={chainId}
                    />
                  )
                })}
            </Column>
          )}
        </ListWrapper>
      </DropWrapper>
    </NavDropdown>
  )

  const chevronProps = {
    height: 15,
    width: 15,
    color: theme.textSecondary,
  }

  return (
    <>
      {!dropdown ? (
        <Wrapper>
          <Row flexDirection="column">
            <PoolListContainer>
              <PoolListHeader>Pool</PoolListHeader>
              <PoolListHeader>24h Δ</PoolListHeader>
              <PoolListHeader>Price</PoolListHeader>
            </PoolListContainer>
          </Row>
          <ListWrapper>
            {isLoading || detailsLoading ? (
              <AutoColumn gap="5px">
                <LoadingRow />
                <LoadingRow />
                <LoadingRow />
              </AutoColumn>
            ) : (
              <Column style={{ gap: '3px' }}>
                {availablePools &&
                  availablePools.map((curr: any) => {
                    return (
                      <PoolSelectRow
                        currencyId={[curr.token0, curr.token1]}
                        onCurrencySelect={handleCurrencySelect}
                        key={`${curr.token0}-${curr.token1}-${curr.fee}`}
                        fee={curr?.fee}
                        chainId={chainId}
                      />
                    )
                  })}
              </Column>
            )}
          </ListWrapper>
        </Wrapper>
      ) : (
        <Box position="relative" ref={ref}>
          <Row
            as="button"
            gap="8"
            className={styles.ChainSelector}
            onClick={() => setIsOpen(!isOpen)}
            style={{
              padding: '10px',
              height: 'fit-content',
              width: '300px',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <>
              <RowBetween style={{ paddingLeft: '10px' }} gap="8">
                <Row>
                  <DoubleCurrencyLogo
                    currency0={inputCurrency as Currency}
                    currency1={outputCurrency as Currency}
                    size={20}
                  />
                  <Label style={{ display: 'flex', gap: '2px' }}>
                    <ThemedText.BodySmall color="textSecondary" fontSize={13} fontWeight={800}>
                      {inputCurrency?.symbol}
                    </ThemedText.BodySmall>
                    /
                    <ThemedText.BodySmall fontSize={13} fontWeight={800}>
                      {outputCurrency?.symbol}
                    </ThemedText.BodySmall>
                    <ThemedText.BodySmall fontSize="12px">({pair?.fee / 10000}%)</ThemedText.BodySmall>
                  </Label>
                </Row>
                <ThemedText.BodyPrimary fontSize="12px">
                  <DeltaText delta={delta?.toNumber()}>
                    {delta ? formatBNToString(delta?.abs() ?? undefined, NumberType.TokenNonTx) + '%' : '-'}
                  </DeltaText>{' '}
                </ThemedText.BodyPrimary>
                <ThemedText.BodyPrimary fontSize="12px">
                  {formatBNToString(currentPricePool ?? currentPricePool, NumberType.TokenNonTx)}
                </ThemedText.BodyPrimary>
              </RowBetween>
              <Row gap="8">{isOpen ? <ChevronUp {...chevronProps} /> : <ChevronDown {...chevronProps} />}</Row>
            </>
          </Row>
          {isOpen && <>{drop}</>}
        </Box>
      )}
    </>
  )
}

const LoadingRow = () => {
  return <LoadingSquare />
}
const LoadingSquare = styled(LoadingBubble)`
  width: 100%;
  height: 25px;

  border: none;
  border-radius: 5px;
  color: ${({ theme }) => theme.textPrimary};

  display: grid;
  grid-template-columns: 3fr 1fr 1fr;
  line-height: 10px;
  align-items: center;

  text-align: left;
  transition: ${({ theme }) => theme.transition.duration.medium} ${({ theme }) => theme.transition.timing.ease}
    background-color;
  width: 100%;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    width: 100%;
  }
`
