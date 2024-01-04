import { Currency, Token } from '@uniswap/sdk-core'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { NavDropdown } from 'components/NavBar/NavDropdown'
import { SearchInput } from 'components/SearchModal/styleds'
import { client } from 'graphql/limitlessGraph/limitlessClients'
import { PoolAddedQuery } from 'graphql/limitlessGraph/queries'
import { useCurrency, useDefaultActiveTokens } from 'hooks/Tokens'
import useDebounce from 'hooks/useDebounce'
import { usePoolsData } from 'hooks/useLMTPools'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { getTokenFilter } from 'lib/hooks/useTokenList/filtering'
import { tokenComparator, useSortTokensByQuery } from 'lib/hooks/useTokenList/sorting'
import { Box } from 'nft/components/Box'
import { Portal } from 'nft/components/common/Portal'
import { Column, Row } from 'nft/components/Flex'
import { useIsMobile } from 'nft/hooks'
import { ChangeEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dispatch, SetStateAction } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { useLocation, useNavigate } from 'react-router-dom'
import { FixedSizeList } from 'react-window'
import { useAllTokenBalances } from 'state/connection/hooks'
import { Field } from 'state/swap/actions'
import { useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { UserAddedToken } from 'types/tokens'

import * as styles from './PoolSelector.css'
import PoolSelectorRow from './PoolSelectorRow'

const PoolListHeader = styled.h4`
  font-size: 12px;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
`
const PoolListContainer = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 0.5fr;
  width: 375px;
  padding-left: 1vw;
`

const SelectorRow = styled(Row)``

export const PoolSelector = ({
  largeWidth,
  bg,
  selectPair,
  setSelectPair,
}: {
  largeWidth: boolean
  bg?: boolean
  selectPair?: boolean
  setSelectPair?: Dispatch<SetStateAction<boolean>>
}) => {
  const onlyShowCurrenciesWithBalance = false
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const { onCurrencySelection } = useSwapActionHandlers()

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

  const location = useLocation()
  const navigate = useNavigate()

  if (location.pathname !== '/add/' && setSelectPair) {
    setSelectPair(false)
  }

  const handleCurrencySelect = useCallback((currencyIn: Currency, currencyOut: Currency, fee: number) => {
    onCurrencySelection(Field.INPUT, currencyIn)
    onCurrencySelection(Field.OUTPUT, currencyOut)
    if (location.pathname !== '/swap') {
      navigate(`/add/${currencyOut?.wrapped.address}/${currencyIn?.wrapped?.address}/${fee}`)
    }
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

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const isMobile = useIsMobile()

  const theme = useTheme()

  const ref = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setIsOpen(false), [modalRef])

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
      return data.data?.poolAddeds.map((val: Pool) => {
        return { token0: val.token0, token1: val.token1, fee: val.fee }
      })
    } else {
      return undefined
    }
  }, [data])

  const poolData = usePoolsData()

  const dataInfo = useMemo(() => {
    if (poolData && data) {
      const lowerCasePool = Object.fromEntries(Object.entries(poolData).map(([k, v]) => [k.toLowerCase(), v]))

      return availablePools.map((pool: any) => {
        if (
          Object.keys(lowerCasePool).find(
            (pair: any) => `${pool?.token0?.address}-${pool?.token1?.address}-${pool?.fee}`
          )
        ) {
          return {
            ...pool,
            tvl: lowerCasePool[`${pool.token0}-${pool.token1}-${pool.fee}`]?.totalValueLocked,
            volume: lowerCasePool[`${pool.token0}-${pool.token1}-${pool.fee}`]?.volume,
          }
        } else {
          return pool
        }
      })
    } else {
      return null
    }
  }, [poolData, data])

  const dropdown = (
    <NavDropdown
      ref={modalRef}
      style={
        largeWidth
          ? { position: 'absolute', height: 'fit-content', zIndex: '3', marginRight: '1vw' }
          : { position: 'absolute', height: 'fit-content', zIndex: '3' }
      }
    >
      <Row flexDirection="column">
        <SearchInput
          type="text"
          id="token-search-input"
          placeholder="Search name or paste address"
          autoComplete="off"
          value={searchQuery}
          ref={inputRef as RefObject<HTMLInputElement>}
          onChange={handleInput}
        />
        <PoolListContainer>
          <PoolListHeader>Pool (fee)</PoolListHeader>
          <PoolListHeader>TVL</PoolListHeader>
          <PoolListHeader>Vol</PoolListHeader>
          <PoolListHeader></PoolListHeader>
        </PoolListContainer>
      </Row>
      <Row>
        <Column paddingX="8">
          {dataInfo &&
            dataInfo.map((curr: any) => {
              return (
                <PoolSelectorRow
                  currencyId={[curr.token0, curr.token1]}
                  onCurrencySelect={handleCurrencySelect}
                  key={`${curr.token0}-${curr.token1}-${curr.fee}`}
                  fee={curr?.fee}
                  setIsOpen={setIsOpen}
                  setSelectPair={setSelectPair}
                  selectPair={selectPair}
                  tvl={curr.tvl}
                  volume={curr.volume}
                />
              )
            })}
        </Column>
      </Row>
    </NavDropdown>
  )

  const chevronProps = {
    height: 15,
    width: 15,
    color: theme.textSecondary,
  }

  return largeWidth ? (
    <Box position="relative" ref={ref}>
      <Row
        as="button"
        gap="8"
        className={styles.ChainSelector}
        background="accentActiveSoft"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px',
          height: 'fit-content',
          width: '325px',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        {selectPair ? (
          <>
            <Row style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }} gap="8">
              <ThemedText.BodySmall fontSize={largeWidth ? '16px' : ''} color="secondary">
                Select a Pair
              </ThemedText.BodySmall>
              <Row gap="8">{isOpen ? <ChevronUp {...chevronProps} /> : <ChevronDown {...chevronProps} />}</Row>
            </Row>
          </>
        ) : (
          <>
            <Row style={{ paddingLeft: '10px' }} gap="8">
              <DoubleCurrencyLogo
                currency0={inputCurrency as Currency}
                currency1={outputCurrency as Currency}
                size={20}
              />
              <ThemedText.BodySmall
                fontSize={largeWidth ? '16px' : ''}
                color="secondary"
              >{`${inputCurrency?.symbol} - ${outputCurrency?.symbol}`}</ThemedText.BodySmall>
            </Row>
            <Row gap="8">
              <ThemedText.BodySmall>All Markets</ThemedText.BodySmall>
              {isOpen ? <ChevronUp {...chevronProps} /> : <ChevronDown {...chevronProps} />}
            </Row>
          </>
        )}
      </Row>
      {isOpen && (isMobile ? <Portal>{dropdown}</Portal> : <>{dropdown}</>)}
    </Box>
  ) : (
    <Box position="relative" ref={ref}>
      <Row
        as="button"
        gap="8"
        className={styles.ChainSelector}
        background={isOpen ? 'accentActiveSoft' : 'none'}
        onClick={() => setIsOpen(!isOpen)}
        style={{ padding: '5px', width: '255px', display: 'flex', justifyContent: 'space-around' }}
      >
        <Row gap="8">
          <DoubleCurrencyLogo currency0={inputCurrency as Currency} currency1={outputCurrency as Currency} size={20} />
          <ThemedText.BodySmall
            fontSize={largeWidth ? '16px' : ''}
            color="secondary"
          >{`${inputCurrency?.symbol} - ${outputCurrency?.symbol}`}</ThemedText.BodySmall>
        </Row>
        <Row gap="8">
          <ThemedText.BodySmall>All Markets</ThemedText.BodySmall>
          {isOpen ? <ChevronUp {...chevronProps} /> : <ChevronDown {...chevronProps} />}
        </Row>
      </Row>
      {isOpen && (isMobile ? <Portal>{dropdown}</Portal> : <>{dropdown}</>)}
    </Box>
  )
}
