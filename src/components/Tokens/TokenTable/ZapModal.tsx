import { Currency } from '@uniswap/sdk-core'
import CurrencyInputPanel from 'components/BaseSwapPanel'
import { SmallButtonPrimary } from 'components/Button'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { LmtModal } from 'components/Modal'
import { ArrowWrapper } from 'components/swap/styleds'
import { ArrowContainer } from 'pages/Trade'
import React, { useMemo, useState } from 'react'
import { ChevronDown } from 'react-feather'
import styled from 'styled-components'
import { ThemedText } from 'theme'

const Wrapper = styled.div`
  padding: 20px;
  display: grid;
  grid-template-rows: 80px 120px 15px 100px 110px 40px;
`
const Header = styled.div`
  padding: 20px;
  display: grid;
  grid-template-columns: 40px 120px 110px 110px;
  align-items: center;
`
const InputWrapper = styled.div`
  width: 100%;
  height: 100%;
`

interface ZapModalProps {
  isOpen: boolean
  onClose: () => void
  apr: number | undefined
  tvl: number | undefined
  token0: Currency | undefined | null
  token1: Currency | undefined | null
}

const ZapModal = (props: ZapModalProps) => {
  const { isOpen, onClose, apr, tvl, token0, token1 } = props
  const [inputIsToken0, setInputIsToken0] = useState(true)

  const inputCurrency = useMemo(() => {
    if (!token0 || !token1) return undefined
    if (inputIsToken0) {
      return token0
    } else {
      return token1
    }
  }, [token0, token1, inputIsToken0])

  return (
    <LmtModal isOpen={isOpen} maxHeight={750} maxWidth={460} $scrollOverlay={true} onDismiss={onClose}>
      <Wrapper>
        <Header>
          <DoubleCurrencyLogo size={26} currency0={token1} currency1={token0} />
          <ThemedText.SubHeader>
            {token0?.symbol}-{token1?.symbol}
          </ThemedText.SubHeader>
          <ThemedText.DeprecatedLabel fontSize={14} fontWeight={400}>
            APR: {apr?.toPrecision(4)}%
          </ThemedText.DeprecatedLabel>
          <ThemedText.DeprecatedLabel fontSize={14} fontWeight={400}>
            TVL: ${tvl?.toFixed(2)}
          </ThemedText.DeprecatedLabel>
        </Header>
        <InputWrapper>
          <CurrencyInputPanel
            value="-"
            onUserInput={(val: string) => val}
            showMaxButton={true}
            fiatValue={{ data: 1, isLoading: false }}
            id="1"
            currency={inputCurrency}
            onCurrencySelect={(currency: Currency) => currency}
          />
        </InputWrapper>
        <ArrowWrapper clickable={false}>
          <ArrowContainer style={{ rotate: '0deg' }} color="white">
            <ChevronDown size="11" />
          </ArrowContainer>
        </ArrowWrapper>
        <InputWrapper>
          <CurrencyInputPanel
            value="-"
            onUserInput={(val: string) => val}
            showMaxButton={true}
            fiatValue={{ data: 1, isLoading: false }}
            id="2"
            currency={token1}
          />
        </InputWrapper>
        <InputWrapper>
          <CurrencyInputPanel
            value="-"
            onUserInput={(val: string) => val}
            showMaxButton={true}
            fiatValue={{ data: 1, isLoading: false }}
            id="3"
            currency={token0}
          />
        </InputWrapper>
        <SmallButtonPrimary>Deposit</SmallButtonPrimary>
      </Wrapper>
    </LmtModal>
  )
}

export default ZapModal
