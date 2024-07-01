import { Currency } from '@uniswap/sdk-core'
import { TokenInfo } from '@uniswap/token-lists'

import { ReactComponent as LimitlessLogo } from '../../assets/svg/Limitless_Logo_Black.svg'
import { ReactComponent as PenLogo } from '../../assets/svg/Pendle.svg'
import { ReactComponent as XPetLogo } from '../../assets/svg/xpet.svg'
import AssetLogo, { AssetLogoBaseProps } from './AssetLogo'

export default function CurrencyLogo(
  props: AssetLogoBaseProps & {
    currency?: Currency | null
  }
) {
  if (props.currency?.symbol === 'LLP' || props.currency?.symbol === 'limWETH') {
    return (
      <>
        <LimitlessLogo style={{ marginRight: '10px' }} width={12} fill="#fff" />
      </>
    )
  }
  if (props.currency?.symbol === 'PENDLE') {
    return (
      <>
        <PenLogo style={{ marginRight: '1px' }} width={10} fill="#fff" />
      </>
    )
  }
  if (props.currency?.symbol === 'XPET') {
    return (
      <>
        <XPetLogo style={{ marginRight: '10px' }} width={19} fill="#fff" />
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
