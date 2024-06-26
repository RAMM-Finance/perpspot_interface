import { formatEther } from '@ethersproject/units'
import { useQuery } from '@tanstack/react-query'
import { GenieAsset } from 'nft/types'

export enum Currency {
  ETH = 'ETH',
  LOOKS = 'LOOKS',
  MATIC = 'MATIC',
}

export const fetchPrice = async (currency: Currency = Currency.ETH): Promise<number | undefined> => {
  try {
    const response = await fetch(`https://api.coinbase.com/v2/exchange-rates?currency=${currency}`)
    return response.json().then((j) => j.data.rates.USD)
  } catch (e) {
    console.error(e)
    return
  }
}

export function useUsdPrice(asset: GenieAsset): string | undefined {
  const { data: fetchedPriceData } = useQuery({ queryKey: ['fetchPrice', {}], queryFn: () => fetchPrice() })

  return fetchedPriceData && asset?.priceInfo?.ETHPrice
    ? (parseFloat(formatEther(asset?.priceInfo?.ETHPrice)) * fetchedPriceData).toString()
    : ''
}
