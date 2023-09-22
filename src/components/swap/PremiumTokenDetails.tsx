import React from 'react'
import { OutlineCard } from 'components/Card'
import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { StyledTokenName } from 'components/BaseSwapPanel'
import { Currency } from '@uniswap/sdk-core'

const StyledInput = styled.input`
margin:0;
background:#0e1724;
border:none;
color:#b8c0dc;
font-size:28px;
&:focus {
  outline: none;
}
::-webkit-outer-spin-button,
::-webkit-inner-spin-button {
   -webkit-appearance: none;
}
`
interface ValueInterface{
  value: number | string,
  setValue: (value: number) => void,
  currency0: Currency | null,
}

const PremiumTokenDetails: React.FC<ValueInterface> = ({value, setValue, currency0}) => {
  console.log(currency0)
  return (
    <div style={{marginLeft:'1.2vw', marginRight:'1.2vw'}}>
      <OutlineCard>
        <div style={{display:'flex', justifyContent:'space-between'}}>
          <div style={{ width:'50%', display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
            <div style={{display:'flex'}}>
            <CurrencyLogo hideL2Icon currency={currency0} />
            <StyledTokenName className="pair-name-container">
              {currency0?.symbol}
            </StyledTokenName>
            </div>
            <StyledInput 
              type='number'
              onChange={(e) => setValue(parseFloat(e.target.value))} 
              value={value} 
              placeholder='0'
              />
          </div>
          <div style={{ fontSize: '12px', display:'flex', flexDirection:'column'}}>
            <div style={{margin:'.5vh'}}>
              <Trans>
                Wallet Balance:
              </Trans>
            </div>
            <div style={{margin:'.5vh'}}>
              <Trans>
                Margin Balance:
              </Trans>
            </div>
            <div style={{margin:'.5vh'}}>
              <Trans>
                Available Balance:
              </Trans>
            </div>
            <div style={{margin:'.5vh'}}>
              <Trans>
                Margin Usage:
              </Trans>
            </div>
          </div>
        </div>
      </OutlineCard>
    </div>
  )
}

export default PremiumTokenDetails