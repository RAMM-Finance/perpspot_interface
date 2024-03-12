import { Currency } from '@uniswap/sdk-core'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { NavDropdown } from 'components/NavBar/NavDropdown'
import { getPoolId } from 'components/PositionTable/LeveragePositionTable/TokenRow'
import { client } from 'graphql/limitlessGraph/limitlessClients'
import { PoolAddedQuery } from 'graphql/limitlessGraph/queries'
import { useCurrency } from 'hooks/Tokens'
import { usePoolsData } from 'hooks/useLMTPools'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { Box } from 'nft/components/Box'
import { Portal } from 'nft/components/common/Portal'
import { Column, Row } from 'nft/components/Flex'
import { useIsMobile } from 'nft/hooks'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dispatch, SetStateAction } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { useLocation, useNavigate } from 'react-router-dom'
import { Field } from 'state/swap/actions'
import { useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'

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

const SelectorScrollBox = styled.div`
  overflow: auto;
  max-height: 400px;
`

export const PoolSelector = ({
  largeWidth,
  bg,
  selectPair,
  setSelectPair,
  fee,
}: {
  largeWidth: boolean
  bg?: boolean
  selectPair?: boolean
  setSelectPair?: Dispatch<SetStateAction<boolean>>
  fee?: number
}) => {
  const {
    poolKey,
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const { onPoolSelection } = useSwapActionHandlers()

  const outputCurrency = useCurrency(outputCurrencyId)
  const inputCurrency = useCurrency(
    outputCurrencyId?.toLowerCase() === poolKey?.token0 ? poolKey?.token1 : poolKey?.token0
  )

  const [tokenLoaderTimerElapsed, setTokenLoaderTimerElapsed] = useState(false)

  // Timeout token loader after 3 seconds to avoid hanging in a loading state.
  useEffect(() => {
    const tokenLoaderTimer = setTimeout(() => {
      setTokenLoaderTimerElapsed(true)
    }, 3000)
    return () => clearTimeout(tokenLoaderTimer)
  }, [])

  const location = useLocation()
  const navigate = useNavigate()

  if (location.pathname !== '/add/' && setSelectPair) {
    setSelectPair(false)
  }
  const id = getPoolId(poolKey?.token0, poolKey?.token1, poolKey?.fee) //`${inputCurrency?.wrapped.address}-${outputCurrency?.wrapped.address}-${fee}`
  const { poolId } = useSwapState()
  const handleCurrencySelect = useCallback(
    (currencyIn: Currency, currencyOut: Currency, fee: number) => {
      if (id && poolId !== id) {
        if (
          (currencyIn.symbol === 'LINK' && currencyOut.symbol === 'WETH') ||
          (currencyIn.symbol === 'WETH' && currencyOut.symbol === 'wBTC') ||
          (currencyIn.symbol === 'ARB' && currencyOut.symbol === 'WETH') ||
          (currencyIn.symbol === 'GMX' && currencyOut.symbol === 'WETH')
        ) {
          navigate(`/add/${currencyIn.wrapped.address}/${currencyOut.wrapped.address}/${fee}`)
          const token0 = currencyIn.wrapped.sortsBefore(currencyOut.wrapped) ? currencyIn : currencyOut
          const token1 = currencyIn.wrapped.sortsBefore(currencyOut.wrapped) ? currencyOut : currencyIn
          onPoolSelection(currencyIn, currencyOut, {
            token0: token0.wrapped.address,
            token1: token1.wrapped.address,
            fee,
          })
        } else {
          navigate(`/add/${currencyOut?.wrapped.address}/${currencyIn?.wrapped?.address}/${fee}`)
        }
      }
    },
    [onPoolSelection, navigate, id, poolId]
  )
  // Search needs to be refactored to handle pools instead of single currency - will refactor once datapipeline for pool
  // list is created/connected
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

  const { result: poolData } = usePoolsData()

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

  const dropdown = (
    <NavDropdown
      ref={modalRef}
      style={
        largeWidth
          ? { position: 'absolute', height: 'fit-content', zIndex: '3', marginRight: '1vw' }
          : { position: 'absolute', height: 'fit-content', zIndex: '3' }
      }
    >
      <SelectorScrollBox>
        <Row flexDirection="column">
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
      </SelectorScrollBox>
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
              {/*<ThemedText.BodySmall>All Markets</ThemedText.BodySmall>*/}
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
        gap="8"
        background={isOpen ? 'accentActiveSoft' : 'none'}
        style={{ padding: '5px', width: '200px', display: 'flex', justifyContent: 'space-around' }}
      >
        <Row gap="4">
          <DoubleCurrencyLogo currency0={inputCurrency as Currency} currency1={outputCurrency as Currency} size={20} />
          <ThemedText.BodySmall fontWeight={800} fontSize={largeWidth ? '14px' : ''} color="textSecondary">
            {inputCurrency?.symbol}
          </ThemedText.BodySmall>
          <ThemedText.BodySmall
            fontSize={largeWidth ? '14px' : ''}
            fontWeight={800}
            color="textPrimary"
          >{`/ ${outputCurrency?.symbol}`}</ThemedText.BodySmall>
          <ThemedText.BodySmall>({fee && fee / 10000 + '%'})</ThemedText.BodySmall>
        </Row>
        <Row gap="8">{/*<ThemedText.BodySmall>All Markets</ThemedText.BodySmall>*/}</Row>
      </Row>
    </Box>
  )
}
