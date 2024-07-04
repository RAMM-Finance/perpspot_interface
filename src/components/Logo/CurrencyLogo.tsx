import { Currency } from '@uniswap/sdk-core'
import { TokenInfo } from '@uniswap/token-lists'

import { ReactComponent as LimitlessLogo } from '../../assets/svg/Limitless_Logo_Black.svg'
import { ReactComponent as PenLogo } from '../../assets/svg/Pendle.svg'
import { ReactComponent as XPetLogo } from '../../assets/svg/xpet.svg'
import btcb from '../../assets/token_logos/btcb.png'
import Cosmic from '../../assets/token_logos/Cosmic.png'
import ihf from '../../assets/token_logos/ihf.png'
import normie from '../../assets/token_logos/normie.png'
import normus from '../../assets/token_logos/normus.png'
import nzt from '../../assets/token_logos/nzt.png'
import shog from '../../assets/token_logos/shog.png'
import zro from '../../assets/token_logos/zro.png'
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
  if (props.currency?.symbol === 'COSMIC') {
    return (
      <>
        <img src={Cosmic} style={{ marginRight: '10px', borderRadius: '50%' }} width={20} />
      </>
    )
  }
  if (props.currency?.symbol === 'BTCB') {
    return (
      <>
        <img src={btcb} style={{ marginRight: '10px', borderRadius: '50%' }} width={22} />
      </>
    )
  }
  if (props.currency?.symbol === 'IHF') {
    return (
      <>
        <img src={ihf} style={{ marginRight: '10px', borderRadius: '50%' }} width={20} />
      </>
    )
  }
  if (props.currency?.symbol === 'NORMIE') {
    return (
      <>
        <img src={normie} style={{ marginRight: '10px', borderRadius: '50%' }} width={20} />
      </>
    )
  }
  if (props.currency?.symbol === 'NORMUS') {
    return (
      <>
        <img src={normus} style={{ marginRight: '10px', borderRadius: '50%' }} width={20} />
      </>
    )
  }
  if (props.currency?.symbol === 'SHOG') {
    return (
      <>
        <img src={shog} style={{ marginRight: '10px', borderRadius: '50%' }} width={20} />
      </>
    )
  }
  if (props.currency?.symbol === 'ZRO') {
    return (
      <>
        <img src={zro} style={{ marginRight: '10px', borderRadius: '50%' }} width={22} />
      </>
    )
  }
  if (props.currency?.symbol === 'NZT') {
    return (
      <>
        <img src={nzt} style={{ marginRight: '10px', borderRadius: '50%' }} width={22} />
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
