import { Trans } from '@lingui/macro'
import Menu from '@mui/material/Menu'
import { Currency } from '@uniswap/sdk-core'
import { BigNumber as BN } from 'bignumber.js'
import { StyledTokenName } from 'components/BaseSwapPanel'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { RowFixed } from 'components/Row'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import styled from 'styled-components'
import { ThemedText } from 'theme'

const Wrapper = styled.div`
  display: flex;
  gap: 5px;
`
export const StyledDropdown = styled(Menu)``
export const TokenItem = styled.div`
  background: transparent;
  &:hover {
    cursor: pointer;
  }
`
const ActiveWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`

const StyledRowFixed = styled(RowFixed)`
  display: flex;
  align-items: center;
  border-radius: 5px;
  &:hover {
    cursor: pointer;
    background: #141a2a;
  }
`
export function PremiumCurrencySelector({
  inputCurrency,
  outputCurrency,
  onPremiumCurrencyToggle,
  premiumInPosToken,
  premium,
}: {
  inputCurrency: Currency | null | undefined
  outputCurrency: Currency | null | undefined
  onPremiumCurrencyToggle: () => void
  premiumInPosToken: boolean
  premium: BN | undefined
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
      <ActiveWrapper>
        <ThemedText.LabelSmall fontSize={13} color="primary" fontWeight={500}>
          {/* {`Pay ${premium ? premium.toNumber().toFixed(5) : ''} interest with`} */}
          Pay interest with
        </ThemedText.LabelSmall>
        <StyledRowFixed onClick={handleClick}>
          <CurrencyLogo currency={currency} size="15px" />
          <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
            {(currency && currency.symbol && currency.symbol.length > 20
              ? currency.symbol.slice(0, 4) +
                '...' +
                currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
              : currency?.symbol) || <Trans>Select token</Trans>}
          </StyledTokenName>
          {open ? <ChevronUp style={{ width: '15px' }} /> : <ChevronDown style={{ width: '15px' }} />}
        </StyledRowFixed>
      </ActiveWrapper>
      <StyledDropdown
        slotProps={{
          paper: { sx: { paddingX: '5px', backgroundColor: '#141a2a', marginTop: '5px', marginLeft: '5px' } },
        }}
        MenuListProps={{
          sx: {
            color: 'white',
          },
        }}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
      >
        <TokenItem
          onClick={() => {
            onPremiumCurrencyToggle()
            handleClose()
          }}
        >
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
