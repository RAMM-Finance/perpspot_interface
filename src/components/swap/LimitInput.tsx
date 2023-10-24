import { Trans } from '@lingui/macro'
import { Currency } from '@uniswap/sdk-core'
import { StyledTokenName } from 'components/BaseSwapPanel'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import React from 'react'
import styled from 'styled-components/macro'

const StyledInput = styled.input`
  background: #0d1421;
  border: none;
  color: #b8c0dc;
  width: 10vw;
  font-size: 15px;
  &:focus {
    outline: none;
  }
  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
`
interface ValueInterface {
  value: number | string
  setValue: (value: number) => void
  currency0: Currency | null
}

const PremiumTokenDetails: React.FC<ValueInterface> = ({ value, setValue, currency0 }) => {
  return (
    <div style={{ padding: '1rem', fontWeight: 'bold', color: '#fff' }}>
      <Trans>Limit</Trans>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1rem',
        }}
      >
        <StyledInput
          type="number"
          onChange={(e) => setValue(parseFloat(e.target.value))}
          value={value}
          placeholder="0"
        />
        <div style={{ display: 'flex', paddingRight: '1vw', alignItems: 'center', gap: '5px' }}>
          <CurrencyLogo size="18px" hideL2Icon currency={currency0} />
          <StyledTokenName style={{ fontSize: '12px' }} className="pair-name-container">
            {currency0?.symbol}
          </StyledTokenName>
        </div>
      </div>
    </div>
  )
}

export default PremiumTokenDetails
