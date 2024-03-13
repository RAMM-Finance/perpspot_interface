import { Trans } from '@lingui/macro'
import Menu from '@mui/material/Menu'
import { Currency } from '@uniswap/sdk-core'
import { StyledTokenName } from 'components/BaseSwapPanel'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { RowFixed } from 'components/Row'
import { useState } from 'react'
import styled from 'styled-components'
import { ThemedText } from 'theme'

const Wrapper = styled.div``
const StyledDropdown = styled(Menu)``
const TokenItem = styled.div``

export function PremiumCurrencySelector({
  inputCurrency,
  outputCurrency,
  onPremiumCurrencyToggle,
  premiumInPosToken,
}: {
  inputCurrency: Currency | null | undefined
  outputCurrency: Currency | null | undefined
  onPremiumCurrencyToggle: () => void
  premiumInPosToken: boolean
}) {
  const currency = premiumInPosToken ? outputCurrency : inputCurrency
  const otherCurrency = premiumInPosToken ? inputCurrency : outputCurrency
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  return (
    <Wrapper>
      <ThemedText.LabelSmall>Premium Currency</ThemedText.LabelSmall>
      <RowFixed onClick={handleClick}>
        <CurrencyLogo currency={currency} size="15px" />
        <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
          {(currency && currency.symbol && currency.symbol.length > 20
            ? currency.symbol.slice(0, 4) +
              '...' +
              currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
            : currency?.symbol) || <Trans>Select token</Trans>}
        </StyledTokenName>
      </RowFixed>
      <StyledDropdown open={open} anchorEl={anchorEl} onClose={handleClose}>
        <TokenItem onClick={onPremiumCurrencyToggle}>
          <RowFixed>
            <CurrencyLogo currency={otherCurrency} size="15px" />
            <StyledTokenName className="token-symbol-container" active={Boolean(otherCurrency && otherCurrency.symbol)}>
              {otherCurrency && otherCurrency.symbol && otherCurrency.symbol.length > 20
                ? otherCurrency.symbol.slice(0, 4) +
                  '...' +
                  otherCurrency.symbol.slice(otherCurrency.symbol.length - 5, otherCurrency.symbol.length)
                : otherCurrency?.symbol}
            </StyledTokenName>
          </RowFixed>
        </TokenItem>
      </StyledDropdown>
    </Wrapper>
  )
}
