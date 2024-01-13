import { Currency } from '@uniswap/sdk-core'
import { TokenInfo } from '@uniswap/token-lists'

import { ReactComponent as Logo } from '../../assets/svg/Limitless_Logo_Black.svg'
import AssetLogo, { AssetLogoBaseProps } from './AssetLogo'

export default function CurrencyLogo(
  props: AssetLogoBaseProps & {
    currency?: Currency | null
  }
) {
  if (props.currency?.symbol === 'LLP') {
    return (
      <>
        <Logo style={{ marginRight: '10px' }} width={12} fill="#fff" />
      </>
    )
  }
  return (
    <AssetLogo
      isNative={props.currency?.isNative}
      chainId={props.currency?.chainId}
      address={props.currency?.wrapped.address}
      symbol={props.symbol ?? props.currency?.symbol}
      backupImg={(props.currency as TokenInfo)?.logoURI}
      hideL2Icon={props.hideL2Icon ?? true}
      {...props}
    />
  )
}
