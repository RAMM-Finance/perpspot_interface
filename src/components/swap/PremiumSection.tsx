import React,{useState} from 'react'
import PremiumButtons from './PremiumButtons'
import PremiumTokenDetails from './PremiumTokenDetails'
import { Currency } from '@uniswap/sdk-core'

interface ValueInterface{
  currency0: Currency | null,
}

const PremiumSection: React.FC<ValueInterface> = ({currency0}) => {
  const [value, setValue] = useState<number | string>('')
  return (
    <>
    <h4 style={{paddingLeft:'1vw'}}>Margin Station</h4>
    <PremiumTokenDetails currency0={currency0} value={value} setValue={setValue}/>
    <PremiumButtons value={value} setValue={setValue}/>
    </>
  )
}

export default PremiumSection