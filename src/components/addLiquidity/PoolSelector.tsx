import { Currency } from '@uniswap/sdk-core'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { NavDropdown } from 'components/NavBar/NavDropdown'
import { getInputOutputCurrencies } from 'constants/pools'
import { useCurrency } from 'hooks/Tokens'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { Box } from 'nft/components/Box'
import { Portal } from 'nft/components/common/Portal'
import { Column, Row } from 'nft/components/Flex'
import { useIsMobile } from 'nft/hooks'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dispatch, SetStateAction } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { usePoolKeyList, usePoolOHLCs } from 'state/application/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { getPoolId } from 'utils/lmtSDK/LmtIds'

import * as styles from './PoolSelector.css'
import PoolSelectorRow from './PoolSelectorRow'

const PoolListHeader = styled.h4`
  font-size: 12px;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
`
const PoolListContainer = styled.div`
  display: grid;
  grid-template-columns: 3.5fr 2fr 0.5fr 0.5fr;
  width: 425px;
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
  inputCurrencyId,
  outputCurrencyId,
  onPoolSwitch,
}: {
  largeWidth: boolean
  bg?: boolean
  selectPair?: boolean
  setSelectPair?: Dispatch<SetStateAction<boolean>>
  fee?: number
  inputCurrencyId?: string // current input id
  outputCurrencyId?: string // current output id
  onPoolSwitch?: () => void
}) => {
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

  const navigate = useNavigate()

  // if (location.pathname !== '/add/' && setSelectPair) {
  //   setSelectPair(false)
  // }
  const currentId = useMemo(() => {
    if (inputCurrencyId && outputCurrencyId && fee) {
      return getPoolId(inputCurrencyId, outputCurrencyId, fee)
    }
    return undefined
  }, [inputCurrencyId, outputCurrencyId, fee])

  const handlePoolSelect = useCallback(
    (currency0: Currency, currency1: Currency, fee: number) => {
      if (onPoolSwitch) {
        onPoolSwitch()
        const poolId = getPoolId(currency0.wrapped.address, currency1.wrapped.address, fee)
        if ((currentId && poolId !== currentId) || (selectPair && !currentId)) {
          const [currencyIn, currencyOut] = getInputOutputCurrencies(currency0, currency1)
          navigate(`/add/${currencyIn?.wrapped.address}/${currencyOut?.wrapped?.address}/${fee}`)
        }
      }
    },
    [navigate, currentId, selectPair, onPoolSwitch]
  )
  // Search needs to be refactored to handle pools instead of single currency - will refactor once datapipeline for pool
  // list is created/connected
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const isMobile = useIsMobile()
  const theme = useTheme()
  const ref = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setIsOpen(false), [modalRef])

  const { poolList } = usePoolKeyList()

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
            <PoolListHeader>Price</PoolListHeader>
            <PoolListHeader>24h</PoolListHeader>
            <PoolListHeader></PoolListHeader>
          </PoolListContainer>
        </Row>
        <Row>
          <Column paddingX="8">
            {poolList?.map((curr: any) => {
              const id = getPoolId(curr.token0, curr.token1, curr.fee)
              return (
                <PoolSelectorRow
                  currencyId={[curr.token0, curr.token1]}
                  onPoolSelect={handlePoolSelect}
                  key={`${curr.token0}-${curr.token1}-${curr.fee}`}
                  fee={curr.fee}
                  setIsOpen={setIsOpen}
                  setSelectPair={setSelectPair}
                  active={currentId === id}
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
              <ThemedText.BodySmall fontSize={largeWidth ? '16px' : ''} color="secondary">{`${
                inputCurrency ? inputCurrency.symbol : ''
              } - ${outputCurrency ? outputCurrency.symbol : ''}`}</ThemedText.BodySmall>
            </Row>
            <Row gap="8">{isOpen ? <ChevronUp {...chevronProps} /> : <ChevronDown {...chevronProps} />}</Row>
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
