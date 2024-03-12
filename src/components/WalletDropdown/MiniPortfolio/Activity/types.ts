import { Currency } from '@uniswap/sdk-core'
import { SupportedChainId } from 'constants/chains'
import { AssetActivityPartsFragment, TransactionStatus } from 'graphql/data/__generated__/types-and-hooks'
import { ReactNode } from 'react'

type Receipt = AssetActivityPartsFragment['transaction']

export enum ActivityDescriptionType {
  ADD_ORDER = 'Add Order',
  CANCLE_ORDER = 'Cancel Order',
  ADD_POSITION = 'Add Position',
  FORCE_CLOSED = 'Force Closed',
  REDUCE_POSITION = 'Reduce Position',
}

export type Activity = {
  hash: string
  chainId: SupportedChainId
  status: TransactionStatus
  timestamp: number
  title: string
  descriptor?: string | ReactNode
  logos?: Array<string | undefined>
  currencies?: Array<Currency | undefined>
  otherAccount?: string
  receipt?: Receipt
}

export type ActivityMap = { [hash: string]: Activity | undefined }
