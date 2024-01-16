import { Currency, Token } from '@uniswap/sdk-core'
import { AutoColumn } from 'components/Column'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { SearchInput } from 'components/SearchModal/styleds'
import { LoadingBubble } from 'components/Tokens/loading'
import { client } from 'graphql/limitlessGraph/limitlessClients'
import { PoolAddedQuery } from 'graphql/limitlessGraph/queries'
import { useCurrency, useDefaultActiveTokens } from 'hooks/Tokens'
import useDebounce from 'hooks/useDebounce'
import { usePoolsData } from 'hooks/useLMTPools'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { getTokenFilter } from 'lib/hooks/useTokenList/filtering'
import { tokenComparator, useSortTokensByQuery } from 'lib/hooks/useTokenList/sorting'
import { Column, Row } from 'nft/components/Flex'
import { ChangeEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FixedSizeList } from 'react-window'
import { useAllTokenBalances } from 'state/connection/hooks'
import { Field } from 'state/swap/actions'
import { useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { UserAddedToken } from 'types/tokens'
import { formatDollar } from 'utils/formatNumbers'

const LOGO_SIZE = 20

const PoolListHeader = styled.h4`
  font-size: 12px;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
`
const PoolListContainer = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr 1fr;
  width: 100%;
  padding-left: 1vw;
  height: 30px;
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
  height: 14vh;
`

const Container = styled.button<{ disabled: boolean; active: boolean }>`
  background: ${({ theme, active }) => (active ? theme.accentActiveSoft : 'none')};
  border: none;
  border-radius: 10px;
  color: ${({ theme, active }) => (active ? theme.textSecondary : theme.textPrimary)};
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
  display: grid;
  grid-template-columns: 3fr 1fr 1fr;
  line-height: 10px;
  align-items: center;
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

export default function PoolSelect({ detailsLoading }: { detailsLoading: boolean }) {
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

  const handleCurrencySelect = useCallback((currencyIn: Currency, currencyOut: Currency) => {
    onCurrencySelection(Field.INPUT, currencyIn)
    onCurrencySelection(Field.OUTPUT, currencyOut)
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
            val.token1 !== '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'
        )
        .map((val: Pool) => {
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

      return availablePools?.map((pool: any) => {
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
  }, [poolData, data, availablePools])

  interface PoolSelectorRowProps {
    currencyId: string[]
    tvl: number
    volume: number
    onCurrencySelect: (currencyIn: Currency, currencyOut: Currency) => void
    fee: number
  }

  function PoolSelectorRow({ onCurrencySelect, currencyId, fee, tvl, volume }: PoolSelectorRowProps) {
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
    const labelIn = token0?.symbol as string
    const labelOut = token1?.symbol as string
    const active = token0?.wrapped.address === inputCurrencyId && token1?.wrapped.address === outputCurrencyId

    const theme = useTheme()

    return (
      <Container
        disabled={false}
        active={active}
        onClick={() => {
          token0 && token1 && onCurrencySelect(token0, token1)
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <DoubleCurrencyLogo currency0={token0 as Currency} currency1={token1 as Currency} size={22} margin />
          <Label>{`${labelIn} - ${labelOut} (${fee / 10000}%)`}</Label>
        </div>
        <p>{formatDollar({ num: tvl, digits: 1 })}</p>
        <p>{formatDollar({ num: volume, digits: 1 })}</p>
      </Container>
    )
  }

  return (
    <Wrapper>
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
      <ListWrapper>
        {isLoading || detailsLoading ? (
          <AutoColumn>
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
          </AutoColumn>
        ) : (
          <Column style={{ gap: '3px' }}>
            {dataInfo &&
              dataInfo.map((curr: any) => {
                return (
                  <PoolSelectorRow
                    currencyId={[curr.token0, curr.token1]}
                    onCurrencySelect={handleCurrencySelect}
                    key={`${curr.token0}-${curr.token1}-${curr.fee}`}
                    fee={curr?.fee}
                    tvl={curr.tvl}
                    volume={curr.volume}
                  />
                )
              })}
          </Column>
        )}
      </ListWrapper>
    </Wrapper>
  )
}
const LoadingRow = () => {
  return <LoadingSquare />
}
const LoadingSquare = styled(LoadingBubble)`
  width: 100%;
  height: 38px;

  border: none;
  border-radius: 10px;
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
