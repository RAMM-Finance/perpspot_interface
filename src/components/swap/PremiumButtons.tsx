import React from 'react'
import { SmallButtonPrimary } from 'components/Button'

interface ValueInterface{
  value: number | string,
  setValue: (value: number) => void,
}

const PremiumButtons: React.FC<ValueInterface> = ({value}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-evenly', marginTop: '1vh'}}>
      <SmallButtonPrimary 
        onClick={() => console.log(value)} 
        style={{ 
          background:'#7fffd4', 
          color:'#030a13', 
          borderRadius: '1.6vw',
          width:'40%',
         }}
          >Add Margin
      </SmallButtonPrimary>
      <SmallButtonPrimary 
        onClick={() => console.log(value)} 
      style={{ 
        background: '#ff5f5f', 
        color:'#030a13', 
        borderRadius: '1.6vw',
        width:'40%', 
      }}
        >Withdraw Margin
      </SmallButtonPrimary>
    </div>
  )
}

export default PremiumButtons