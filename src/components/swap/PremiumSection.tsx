import React,{useState} from 'react'
import PremiumButtons from './PremiumButtons'
import PremiumTokenDetails from './PremiumTokenDetails'
import { Token } from '@uniswap/sdk-core'

interface TokenInterface{
  currency0: Token | null,
}

const PremiumSection: React.FC<TokenInterface> = ({currency0}) => {
  const [value, setValue] = useState<number | string>('')
  return (
    <>
    <h4 style={{paddingLeft:'1vw'}}>Margin Station</h4>
    <PremiumTokenDetails currency0={currency0} value={value} setValue={setValue}/>
    <PremiumButtons value={value} setValue={setValue} currency0={currency0}/>
    </>
  )
}

export default PremiumSection