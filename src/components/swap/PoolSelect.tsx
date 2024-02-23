import { NumberType } from '@uniswap/conedison/format'
import { Currency } from '@uniswap/sdk-core'
import { computePoolAddress } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { AutoColumn } from 'components/Column'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { PoolStatsSection } from 'components/ExchangeChart/PoolStats'
import PoolSelectModal from 'components/Modal/poolModal'
import { NavDropdown } from 'components/NavBar/NavDropdown'
import { RowBetween } from 'components/Row'
import { LoadingBubble } from 'components/Tokens/loading'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { getInvertPrice, V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { useCurrency } from 'hooks/Tokens'
import { usePoolsData } from 'hooks/useLMTPools'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { useLatestPoolPriceData } from 'hooks/usePoolPriceData'
import { usePool } from 'hooks/usePools'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { Box } from 'nft/components/Box'
import { Column, Row } from 'nft/components/Flex'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { usePoolKeyList } from 'state/application/hooks'
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
  width: 100%;
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

const LabelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
`

const SelectPoolWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-evenly;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
`

const MainWrapper = styled.div`
  display: grid;
  grid-template-columns: 0.4fr 1fr;
  width: 100%;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.25rem;
  padding-bottom: 0.5rem;
  border: solid ${({ theme }) => theme.backgroundOutline};
  border-width: 1px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.backgroundSurface};
  margin-bottom: 0.2rem;
`

export function SelectPool() {
  const theme = useTheme()

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const ref = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setIsOpen(false), [modalRef])

  const { chainId } = useWeb3React()

  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    poolFee,
  } = useSwapState()

  const { onPoolSelection } = useSwapActionHandlers()
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
    (currencyIn: Currency, currencyOut: Currency, fee: number) => {
      if (
        (currencyIn.symbol === 'LINK' && currencyOut.symbol === 'WETH') ||
        (currencyIn.symbol === 'WETH' && currencyOut.symbol === 'wBTC') ||
        (currencyIn.symbol === 'ARB' && currencyOut.symbol === 'WETH') ||
        (currencyIn.symbol === 'GMX' && currencyOut.symbol === 'WETH')
      ) {
        onPoolSelection(currencyIn, currencyOut, fee)
      } else {
        onPoolSelection(currencyIn, currencyOut, fee)
      }
    },
    [onPoolSelection]
  )

  const { keyList: availablePools } = usePoolKeyList()

  const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, poolFee ?? undefined)

  const { result: poolData } = usePoolsData()

  const drop = (
    <DropWrapper>
      <Row flexDirection="column">
        <PoolListContainer>
          <PoolListHeader>Pool</PoolListHeader>

          <PoolListHeader>24h Δ</PoolListHeader>
          <PoolListHeader>Price</PoolListHeader>
        </PoolListContainer>
      </Row>
      <ListWrapper>
        {isLoading ? (
          <AutoColumn gap="5px">
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
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
  )

  const chevronProps = {
    height: 15,
    width: 15,
    color: theme.textSecondary,
  }

  return (
    <MainWrapper>
      <SelectPoolWrapper onClick={() => setIsOpen(!isOpen)}>
        <LabelWrapper>
          <Row>
            <DoubleCurrencyLogo
              currency0={inputCurrency as Currency}
              currency1={outputCurrency as Currency}
              size={20}
            />
            <ThemedText.HeadlineSmall>{`${inputCurrency?.symbol}/${outputCurrency?.symbol}`}</ThemedText.HeadlineSmall>
          </Row>
          <ThemedText.BodySmall fontSize="14px">({poolFee ? poolFee / 10000 : 0}%)</ThemedText.BodySmall>
        </LabelWrapper>
        <Row gap="8">{isOpen ? <ChevronUp {...chevronProps} /> : <ChevronDown {...chevronProps} />}</Row>
      </SelectPoolWrapper>
      <PoolStatsSection
        poolData={poolData}
        chainId={chainId}
        address0={pool?.token0.address}
        address1={pool?.token1.address}
        fee={pool?.fee}
      />
      <PoolSelectModal isOpen={isOpen} onDismiss={() => setIsOpen(false)}>
        {drop}
      </PoolSelectModal>
    </MainWrapper>
  )
}

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
    poolFee,
  } = useSwapState()

  const { onPoolSelection } = useSwapActionHandlers()
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
    (currencyIn: Currency, currencyOut: Currency, fee: number) => {
      if (
        (currencyIn.symbol === 'LINK' && currencyOut.symbol === 'WETH') ||
        (currencyIn.symbol === 'WETH' && currencyOut.symbol === 'wBTC') ||
        (currencyIn.symbol === 'ARB' && currencyOut.symbol === 'WETH') ||
        (currencyIn.symbol === 'GMX' && currencyOut.symbol === 'WETH')
      ) {
        onPoolSelection(currencyIn, currencyOut, fee)
      } else {
        onPoolSelection(currencyIn, currencyOut, fee)
      }
    },
    [onPoolSelection]
  )

  const { keyList: availablePools } = usePoolKeyList() //useGetPoolsAndData()

  const pair = useMemo(() => {
    if (!availablePools) {
      return undefined
    } else {
      return availablePools.find(
        (pool) =>
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

  const [currentPrice, delta] = useMemo(() => {
    if (!priceData || !pool) return [undefined, undefined]

    const invertPrice = getInvertPrice(pool.token0.address, pool.token1.address, chainId)
    const token0Price = new BN(pool.token0Price.toFixed(18))
    const price = invertPrice ? new BN(1).div(token0Price) : token0Price

    const price24hAgo = priceData.price24hAgo
    const delt = price.minus(price24hAgo).div(price).times(100)
    return [price, delt]
  }, [chainId, priceData, pool])

  const drop = (
    <NavDropdown ref={modalRef}>
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
                <LoadingRow />
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
                    <ThemedText.BodySmall fontSize="12px">({pair?.fee ? pair.fee / 10000 : 0}%)</ThemedText.BodySmall>
                  </Label>
                </Row>
                <ThemedText.BodyPrimary fontSize="12px">
                  <DeltaText delta={delta?.toNumber()}>
                    {delta ? formatBNToString(delta.abs() ?? undefined, NumberType.TokenNonTx) + '%' : '-'}
                  </DeltaText>{' '}
                </ThemedText.BodyPrimary>
                <ThemedText.BodyPrimary fontSize="12px">
                  {formatBNToString(currentPrice, NumberType.FiatTokenPrice, true)}
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
