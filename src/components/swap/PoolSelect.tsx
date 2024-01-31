import { NumberType } from '@uniswap/conedison/format'
import { Currency, Token } from '@uniswap/sdk-core'
import { computePoolAddress } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { AutoColumn } from 'components/Column'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { NavDropdown } from 'components/NavBar/NavDropdown'
import { RowBetween } from 'components/Row'
import { LoadingBubble } from 'components/Tokens/loading'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { ethers } from 'ethers'
import { client } from 'graphql/limitlessGraph/limitlessClients'
import { PoolAddedQuery } from 'graphql/limitlessGraph/queries'
import { useCurrency, useDefaultActiveTokens } from 'hooks/Tokens'
import useDebounce from 'hooks/useDebounce'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { useLatestPoolPriceData } from 'hooks/usePoolPriceData'
import { usePool } from 'hooks/usePools'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { getTokenFilter } from 'lib/hooks/useTokenList/filtering'
import { tokenComparator, useSortTokensByQuery } from 'lib/hooks/useTokenList/sorting'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { Box } from 'nft/components/Box'
import { Column, Row } from 'nft/components/Flex'
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { FixedSizeList } from 'react-window'
import { useAllTokenBalances } from 'state/connection/hooks'
import { Field } from 'state/swap/actions'
import { useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { UserAddedToken } from 'types/tokens'

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
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const ref = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setIsOpen(false), [modalRef])

  const onlyShowCurrenciesWithBalance = false
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const { onCurrencySelection, onPairSelection } = useSwapActionHandlers()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  // const {chainId} = useWeb3React()
  const [searchQuery, setSearchQuery] = useState<string>('')

  const debouncedQuery = useDebounce(searchQuery, 200)
  const defaultTokens = useDefaultActiveTokens()

  const [tokenLoaderTimerElapsed, setTokenLoaderTimerElapsed] = useState(false)
  // Timeout token loader after 3 seconds to avoid hanging in a loading state.
  useEffect(() => {
    const tokenLoaderTimer = setTimeout(() => {
      setTokenLoaderTimerElapsed(true)
    }, 3000)
    return () => clearTimeout(tokenLoaderTimer)
  }, [])

  const filteredTokens: Token[] = useMemo(() => {
    return Object.values(defaultTokens).filter(getTokenFilter(debouncedQuery))
  }, [defaultTokens, debouncedQuery])

  const [balances, balancesAreLoading] = useAllTokenBalances()

  const sortedTokens: Token[] = useMemo(
    () =>
      !balancesAreLoading
        ? filteredTokens
            .filter((token) => {
              if (onlyShowCurrenciesWithBalance) {
                return balances[token.address]?.greaterThan(0)
              }

              // If there is no query, filter out unselected user-added tokens with no balance.
              if (!debouncedQuery && token instanceof UserAddedToken) {
                if (inputCurrency?.equals(token) || outputCurrency?.equals(token)) return true
                return balances[token.address]?.greaterThan(0)
              }
              return true
            })
            .sort(tokenComparator.bind(null, balances))
        : [],
    [
      balances,
      balancesAreLoading,
      debouncedQuery,
      filteredTokens,
      inputCurrency,
      outputCurrency,
      onlyShowCurrenciesWithBalance,
    ]
  )

  const isLoading = Boolean(balancesAreLoading && !tokenLoaderTimerElapsed)

  const filteredSortedTokens = useSortTokensByQuery(debouncedQuery, sortedTokens)

  const fixedList = useRef<FixedSizeList>()

  const native = useNativeCurrency()
  const wrapped = native.wrapped

  const searchCurrencies: Currency[] = useMemo(() => {
    const s = debouncedQuery.toLowerCase().trim()

    const tokens = filteredSortedTokens.filter((t) => !(t.equals(wrapped) || t.isNative))
    const shouldShowWrapped =
      !onlyShowCurrenciesWithBalance || (!balancesAreLoading && balances[wrapped.address]?.greaterThan(0))
    const natives = (native.equals(wrapped) ? [wrapped] : shouldShowWrapped ? [native, wrapped] : [native]).filter(
      (n) => n.symbol?.toLowerCase()?.indexOf(s) !== -1 || n.name?.toLowerCase()?.indexOf(s) !== -1
    )

    return [...natives, ...tokens]
  }, [
    debouncedQuery,
    filteredSortedTokens,
    onlyShowCurrenciesWithBalance,
    balancesAreLoading,
    balances,
    wrapped,
    native,
  ])

  const handleCurrencySelect = useCallback((currencyIn: Currency, currencyOut: Currency) => {
    if (
      (currencyIn.symbol === 'WETH' && currencyOut.symbol === 'LDO') ||
      (currencyIn.symbol === 'WETH' && currencyOut.symbol === 'wBTC')
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
  }, [])

  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value
    setSearchQuery(input)
  }, [])

  // Search needs to be refactored to handle pools instead of single currency - will refactor once datapipeline for pool
  // list is created/connected

  // const inputRef = useRef<HTMLInputElement>()
  // const handleInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
  //   const input = event.target.value
  //   const checksummedInput = isAddress(input)
  //   setSearchQuery(checksummedInput || input)
  //   fixedList.current?.scrollTo(0)
  // }, [])

  // const handleEnter = useCallback(
  //   (e: KeyboardEvent<HTMLInputElement>) => {
  //     if (e.key === 'Enter') {
  //       const s = debouncedQuery.toLowerCase().trim()
  //       if (s === native?.symbol?.toLowerCase()) {
  //         handleCurrencySelect(native)
  //       } else if (searchCurrencies.length > 0) {
  //         if (
  //           searchCurrencies[0].symbol?.toLowerCase() === debouncedQuery.trim().toLowerCase() ||
  //           searchCurrencies.length === 1
  //         ) {
  //           handleCurrencySelect(searchCurrencies[0])
  //         }
  //       }
  //     }
  //   },
  //   [debouncedQuery, native, searchCurrencies, handleCurrencySelect]
  // )

  const theme = useTheme()

  const [data, setData] = useState<any>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()

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

  useEffect(() => {
    // if (!trader || loading || !blockNumber || (lastBlockNumber && lastBlockNumber + 2 > blockNumber)) return
    if (!client || !PoolAddedQuery || loading || error) return
    const call = async () => {
      try {
        setLoading(true)

        const poolQueryData = await client.query(PoolAddedQuery, {}).toPromise()

        setData(poolQueryData)

        setLoading(false)
      } catch (error) {
        setError(error)
        setLoading(false)
      }
    }
    call()
  }, [error, loading])

  const availablePools = useMemo(() => {
    if (data) {
      return data.data?.poolAddeds
        .filter(
          (val: Pool) =>
            val.token0 !== '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1' &&
            val.token1 !== '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1' &&
            // ethers.utils.getAddress(val.token0) !== '0x539bdE0d7Dbd336b79148AA742883198BBF60342' &&
            // ethers.utils.getAddress(val.token1) !== '0x539bdE0d7Dbd336b79148AA742883198BBF60342' &&
            // ethers.utils.getAddress(val.token0) !== '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4' &&
            // ethers.utils.getAddress(val.token1) !== '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4' &&
            // ethers.utils.getAddress(val.token0) !== '0x3082CC23568eA640225c2467653dB90e9250AaA0' &&
            // ethers.utils.getAddress(val.token1) !== '0x3082CC23568eA640225c2467653dB90e9250AaA0' &&
            ethers.utils.getAddress(val.token0) !== '0x4Cb9a7AE498CEDcBb5EAe9f25736aE7d428C9D66' &&
            ethers.utils.getAddress(val.token1) !== '0x4Cb9a7AE498CEDcBb5EAe9f25736aE7d428C9D66'
        )
        .map((val: Pool) => {
          return {
            token0: ethers.utils.getAddress(val.token0),
            token1: ethers.utils.getAddress(val.token1),
            fee: val.fee,
          }
        })
    } else {
      return undefined
    }
  }, [data])

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

  // console.log(pair)

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
      return price
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
          {/* <SearchInput
        type="text"
        id="token-search-input"
        placeholder="Search name or paste address"
        autoComplete="off"
        value={searchQuery}
        ref={inputRef as RefObject<HTMLInputElement>}
        onChange={handleInput}
      /> */}
          <PoolListContainer>
            <PoolListHeader>Pool</PoolListHeader>
            {/*<PoolListHeader>TVL</PoolListHeader>
        <PoolListHeader>Vol</PoolListHeader>*/}
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

  // const poolData = usePoolsData()

  // const dataInfo = useMemo(() => {
  //   if (poolData && data) {
  //     const lowerCasePool = Object.fromEntries(Object.entries(poolData).map(([k, v]) => [k.toLowerCase(), v]))

  //     return availablePools?.map((pool: any) => {
  //       if (
  //         Object.keys(lowerCasePool).find(
  //           (pair: any) => `${pool?.token0?.address}-${pool?.token1?.address}-${pool?.fee}`
  //         )
  //       ) {
  //         return {
  //           ...pool,
  //           tvl: lowerCasePool[`${pool.token0}-${pool.token1}-${pool.fee}`]?.totalValueLocked,
  //           volume: lowerCasePool[`${pool.token0}-${pool.token1}-${pool.fee}`]?.volume,
  //         }
  //       } else {
  //         return pool
  //       }
  //     })
  //   } else {
  //     return null
  //   }
  // }, [poolData, data, availablePools])
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
            {/* <SearchInput
          type="text"
          id="token-search-input"
          placeholder="Search name or paste address"
          autoComplete="off"
          value={searchQuery}
          ref={inputRef as RefObject<HTMLInputElement>}
          onChange={handleInput}
        /> */}
            <PoolListContainer>
              <PoolListHeader>Pool</PoolListHeader>
              {/*<PoolListHeader>TVL</PoolListHeader>
          <PoolListHeader>Vol</PoolListHeader>*/}
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
                    {/*/<ThemedText.BodySmall fontWeight={800}>{labelOut + `(${fee / 10000}%)`}</ThemedText.BodySmall>*/}
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
              <Row gap="8">
                {/*<ThemedText.BodySmall>All Markets</ThemedText.BodySmall>*/}
                {isOpen ? <ChevronUp {...chevronProps} /> : <ChevronDown {...chevronProps} />}
              </Row>
            </>
          </Row>
          {isOpen && <>{drop}</>}
        </Box>
      )}
    </>
  )
}

interface PoolSelectorRowProps {
  currencyId: string[]
  tvl?: number
  volume?: number
  onCurrencySelect: (currencyIn: Currency, currencyOut: Currency) => void
  fee: number
  chainId: number | undefined
}

function PoolSelectorRow({ onCurrencySelect, currencyId, fee, chainId }: PoolSelectorRowProps) {
  // const { chainId } = useWeb3React()
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const baseCurrency = useCurrency(currencyId[0])
  const quoteCurrency = useCurrency(currencyId[1])
  const [token0, token1] =
    baseCurrency && quoteCurrency && quoteCurrency?.wrapped.sortsBefore(baseCurrency?.wrapped)
      ? [baseCurrency, quoteCurrency]
      : [quoteCurrency, baseCurrency]
  const [, pool] = usePool(token0 ?? undefined, token1 ?? undefined, fee)
  // const decimal = useMemo(() => {
  //   if (token1?.wrapped.symbol === 'wBTC' && token0?.wrapped.symbol === 'WETH') {
  //     return 10
  //   } else if (token1?.wrapped.symbol === 'WETH' && token0?.wrapped.symbol === 'USDC') {
  //     return -12
  //   } else if (token1?.wrapped.symbol === 'wBTC' && token0?.wrapped.symbol === 'USDC') {
  //     return -2
  //   } else {
  //     return 0
  //   }
  // }, [token0, token1])
  // const currentPrice = (Number(pool?.sqrtRatioX96) ** 2 / 2 ** 192 / Number(`1e${decimal}`)).toFixed(1)
  const labelIn = token1?.symbol as string
  const labelOut = token0?.symbol as string
  const active = token0?.wrapped.address === inputCurrencyId && token1?.wrapped.address === outputCurrencyId
  const poolAddress = useMemo(() => {
    if (!pool || !chainId) return null
    return computePoolAddress({
      factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
      tokenA: pool.token0,
      tokenB: pool.token1,
      fee: pool.fee,
    })
  }, [chainId, pool])

  // const priceData = undefined as any
  // const priceLoading = false
  const { data: priceData } = useLatestPoolPriceData(poolAddress ?? undefined)

  // const currentPricePool = useMemo(() => {
  //   if (!pool || priceData) return undefined
  //   const token0 = pool.token0
  //   const token1 = pool.token1
  //   let price = new BN(Number(pool.token0Price.quotient.toString()))
  //   if (price.toString() == '0') price = new BN(Number(pool.token1Price.quotient.toString()))
  //   if (token0?.wrapped.symbol === 'wBTC' && token1?.wrapped.symbol === 'WETH') {
  //     // return price.div( new BN( 10** (token1?.wrapped.decimals - token0?.wrapped.decimals)))
  //     return new BN(1).div(price.div(new BN(10 ** (token1?.wrapped.decimals - token0?.wrapped.decimals))))
  //   } else if (token0?.wrapped.symbol === 'WETH' && token1?.wrapped.symbol === 'USDC') {
  //     return new BN(1).div(price.div(new BN(10 ** (token0?.wrapped.decimals - token1?.wrapped.decimals))))
  //   } else if (token0?.wrapped.symbol === 'wBTC' && token1?.wrapped.symbol === 'USDC') {
  //     return price.div(new BN(10 ** (token1?.wrapped.decimals - token0?.wrapped.decimals)))
  //   } else if (token0?.wrapped.symbol === 'WETH' && token1?.wrapped.symbol === 'ARB') {
  //     return price
  //   } else if (token0?.wrapped.symbol === 'LDO' && token1?.wrapped.symbol === 'WETH') {
  //     return price
  //   } else {
  //     return new BN(1).div(price.div(new BN(10 ** (token1?.wrapped.decimals - token0?.wrapped.decimals))))
  //   }
  // }, [priceData, pool])

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

  return (
    // <MouseoverTooltip
    //   text={
    //     <div style={{ display: 'flex', gap: '5px' }}>
    //       <ThemedText.BodySmall color="textPrimary">TVL:</ThemedText.BodySmall>
    //       <ThemedText.BodySmall color="textSecondary">{formatDollar({ num: tvl, digits: 0 })}</ThemedText.BodySmall>
    //       <ThemedText.BodySmall color="textPrimary">Volume:</ThemedText.BodySmall>
    //       <ThemedText.BodySmall color="textSecondary">
    //         {formatDollar({ num: volume, digits: 0 })}
    //       </ThemedText.BodySmall>
    //     </div>
    //   }
    // >
    <Container
      disabled={false}
      active={active}
      onClick={() => {
        token0 && token1 && onCurrencySelect(token0, token1)
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <DoubleCurrencyLogo currency0={token0 as Currency} currency1={token1 as Currency} size={20} margin />
        <Label style={{ display: 'flex', gap: '2px' }}>
          <ThemedText.BodySmall color="textSecondary" fontWeight={800}>
            {labelIn}
          </ThemedText.BodySmall>
          {/*/<ThemedText.BodySmall fontWeight={800}>{labelOut + `(${fee / 10000}%)`}</ThemedText.BodySmall>*/}/
          <ThemedText.BodySmall fontWeight={800}>{labelOut}</ThemedText.BodySmall>
          <ThemedText.BodySmall fontSize="10px">({fee / 10000}%)</ThemedText.BodySmall>
        </Label>
      </div>
      {/*<ThemedText.BodySmall>{formatDollar({ num: tvl, digits: 0 })}</ThemedText.BodySmall>
      <ThemedText.BodySmall>{formatDollar({ num: volume, digits: 0 })}</ThemedText.BodySmall>*/}
      <ThemedText.BodySmall>
        <DeltaText delta={delta?.toNumber()}>
          {delta ? formatBNToString(delta?.abs() ?? undefined, NumberType.TokenNonTx) + '%' : '-'}
        </DeltaText>
      </ThemedText.BodySmall>
      <ThemedText.BodySmall>{formatBNToString(currPrice, NumberType.TokenNonTx)}</ThemedText.BodySmall>
    </Container>
    // </MouseoverTooltip>
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
