import { t } from '@lingui/macro'
import { Currency, Token } from '@uniswap/sdk-core'
import { NavDropdown } from 'components/NavBar/NavDropdown'
import { SearchInput } from 'components/SearchModal/styleds'
import { useCurrency, useDefaultActiveTokens } from 'hooks/Tokens'
import useDebounce from 'hooks/useDebounce'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { getTokenFilter } from 'lib/hooks/useTokenList/filtering'
import { tokenComparator, useSortTokensByQuery } from 'lib/hooks/useTokenList/sorting'
import { Box } from 'nft/components/Box'
import { Portal } from 'nft/components/common/Portal'
import { Column, Row } from 'nft/components/Flex'
import { useIsMobile } from 'nft/hooks'
import { ChangeEvent, KeyboardEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { FixedSizeList } from 'react-window'
import { useAllTokenBalances } from 'state/connection/hooks'
import { Field } from 'state/swap/actions'
import { useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
import styled,{ useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { UserAddedToken } from 'types/tokens'
import { isAddress } from 'utils'
import { currencyId } from 'utils/currencyId'

import * as styles from './PoolSelector.css'
import PoolSelectorRow from './PoolSelectorRow'

const PoolListHeader = styled.h4`
font-size: .9rem;
`
const PoolListContainer = styled.div`
display:grid; 
grid-template-columns:5fr 1fr 2fr; 
width: 400px;
`
export const PoolSelector = () => {
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

  const handleCurrencySelect = useCallback(
    (currencyIn: Currency, currencyOut: Currency) => {
      onCurrencySelection(Field.INPUT, currencyIn)
      onCurrencySelection(Field.OUTPUT, currencyOut)
    },
    [inputCurrencyId, outputCurrencyId]
  )

  const filteredSearchCurrencies = searchCurrencies.filter((currency : any) =>  currency.symbol.toLowerCase().includes(searchQuery.toLowerCase()))

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

  const dropdown = (
    <NavDropdown top="56" ref={modalRef} style={{ overflowY: 'scroll', height: '600px'}}>
      <Row style={{flexDirection:'column'}}>
        <SearchInput
          type="text"
          id="token-search-input"
          placeholder={t`Search name or paste address`}
          autoComplete="off"
          value={searchQuery}
          ref={inputRef as RefObject<HTMLInputElement>}
          onChange={handleInput}
        />
        <PoolListContainer>
          <PoolListHeader>Pool</PoolListHeader>
          <PoolListHeader>TVL</PoolListHeader>
          <PoolListHeader>24h Vol</PoolListHeader>
        </PoolListContainer>
      </Row>
      <Column paddingX="8">
        {filteredSearchCurrencies.flatMap((currencyIn: Currency, i) => searchCurrencies.slice(i + 1).map((currencyOut: Currency) =>
          <PoolSelectorRow
            currencyId={[currencyId(currencyIn), currencyId(currencyOut)]}
            onCurrencySelect={handleCurrencySelect}
            key={`${currencyId(currencyIn)}-${currencyId(currencyOut)}`}
          />
        ))}
      </Column>
    </NavDropdown>
  )

  const chevronProps = {
    height: 20,
    width: 20,
    color: theme.textSecondary,
  }

  return (
    <Box position="relative" ref={ref}>
      <Row
        as="button"
        gap="8"
        className={styles.ChainSelector}
        background={isOpen ? 'accentActive' : 'none'}
        onClick={() => setIsOpen(!isOpen)}
        style={{ width:'11rem'}}
      >
        <ThemedText.LmtWhite style={{fontSize:'1.3rem'}}>{`${inputCurrency?.symbol} - ${outputCurrency?.symbol}`}</ThemedText.LmtWhite>
        {isOpen ? <ChevronUp {...chevronProps} /> : <ChevronDown {...chevronProps} />}
      </Row>
      {isOpen && (isMobile ? <Portal>{dropdown}</Portal> : <>{dropdown}</>)}
    </Box>
  )
}
