import { Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { SmallButtonPrimary } from 'components/Button'
import { LMT_V2_MARGIN_FACILITY } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { useFacilityContract } from 'hooks/useContract'
import React, { useCallback } from 'react'

interface TokenValueInterface {
  value: number | string
  setValue: (value: number) => void
  currency0: Token | null
}

const PremiumButtons: React.FC<TokenValueInterface> = ({ value, currency0 }) => {
  const { account, chainId } = useWeb3React()

  const marginFacilityContract = useFacilityContract(LMT_V2_MARGIN_FACILITY[chainId ?? SupportedChainId.SEPOLIA])

  const handleAddMargin = useCallback(async () => {
    if (!marginFacilityContract || !account) {
      return
    }
    try {
      const tokenAddress = currency0?.address
      console.log('Token Address: ', tokenAddress)
      const tx = await marginFacilityContract.depositPremium(tokenAddress, account, value)
      console.log('Transaction: ', tx)
    } catch (error) {
      console.error(error)
    }
  }, [marginFacilityContract, account])

  if (!account) {
    return null
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-evenly', marginTop: '1vh' }}>
      <SmallButtonPrimary
        onClick={handleAddMargin}
        style={{
          background: '#7fffd4',
          color: '#030a13',
          borderRadius: '1.6vw',
          width: '40%',
        }}
      >
        Add Margin
      </SmallButtonPrimary>
      <SmallButtonPrimary
        onClick={() => console.log(value)}
        style={{
          background: '#ff5f5f',
          color: '#030a13',
          borderRadius: '1.6vw',
          width: '40%',
        }}
      >
        Withdraw Margin
      </SmallButtonPrimary>
    </div>
  )
}

export default PremiumButtons
