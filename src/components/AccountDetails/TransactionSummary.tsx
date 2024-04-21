import { Trans } from '@lingui/macro'
import { Fraction, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { getDecimalAndUsdValueData } from 'hooks/useUSDPrice'
import JSBI from 'jsbi'
import { useEffect, useState } from 'react'

import { nativeOnChain } from '../../constants/tokens'
import { firestore } from '../../firebaseConfig'
import { useCurrency, useToken } from '../../hooks/Tokens'
import useENSName from '../../hooks/useENSName'
import {
  AddLiquidityV2PoolTransactionInfo,
  AddLiquidityV3PoolTransactionInfo,
  AddLmtLiquidityTransactionInfo,
  ApproveTransactionInfo,
  ClaimTransactionInfo,
  CollectFeesTransactionInfo,
  CreateV3PoolTransactionInfo,
  DelegateTransactionInfo,
  ExactInputSwapTransactionInfo,
  ExactOutputSwapTransactionInfo,
  ExecuteTransactionInfo,
  MigrateV2LiquidityToV3TransactionInfo,
  QueueTransactionInfo,
  RemoveLiquidityV3TransactionInfo,
  RemoveLmtLiquidityTransactionInfo,
  TransactionInfo,
  TransactionType,
  WrapTransactionInfo,
} from '../../state/transactions/types'

function formatAmount(amountRaw: string, decimals: number, sigFigs: number): string {
  return new Fraction(amountRaw, JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))).toSignificant(sigFigs)
}

function FormattedCurrencyAmount({
  rawAmount,
  symbol,
  decimals,
  sigFigs,
}: {
  rawAmount: string
  symbol: string
  decimals: number
  sigFigs: number
}) {
  return (
    <>
      {formatAmount(rawAmount, decimals, sigFigs)} {symbol}
    </>
  )
}

function FormattedCurrencyAmountManaged({
  rawAmount,
  currencyId,
  sigFigs = 6,
}: {
  rawAmount: string
  currencyId: string
  sigFigs: number
}) {
  const currency = useCurrency(currencyId)
  return currency ? (
    <FormattedCurrencyAmount
      rawAmount={rawAmount}
      decimals={currency.decimals}
      sigFigs={sigFigs}
      symbol={currency.symbol ?? '???'}
    />
  ) : null
}

function ClaimSummary({ info: { recipient, uniAmountRaw } }: { info: ClaimTransactionInfo }) {
  const { ENSName } = useENSName()
  return typeof uniAmountRaw === 'string' ? (
    <Trans>
      Claim <FormattedCurrencyAmount rawAmount={uniAmountRaw} symbol="UNI" decimals={18} sigFigs={4} /> for{' '}
      {ENSName ?? recipient}
    </Trans>
  ) : (
    <Trans>Claim UNI reward for {ENSName ?? recipient}</Trans>
  )
}

function SubmitProposalTransactionSummary() {
  return <Trans>Submit new proposal</Trans>
}

function ApprovalSummary({ info }: { info: ApproveTransactionInfo }) {
  const token = useToken(info.tokenAddress)

  return <Trans>Approve {token?.symbol}</Trans>
}

function QueueSummary({ info }: { info: QueueTransactionInfo }) {
  const proposalKey = `${info.governorAddress}/${info.proposalId}`
  return <Trans>Queue proposal {proposalKey}.</Trans>
}

function ExecuteSummary({ info }: { info: ExecuteTransactionInfo }) {
  const proposalKey = `${info.governorAddress}/${info.proposalId}`
  return <Trans>Execute proposal {proposalKey}.</Trans>
}

function DelegateSummary({ info: { delegatee } }: { info: DelegateTransactionInfo }) {
  const { ENSName } = useENSName(delegatee)
  return <Trans>Delegate voting power to {ENSName ?? delegatee}</Trans>
}

function WrapSummary({ info: { chainId, currencyAmountRaw, unwrapped } }: { info: WrapTransactionInfo }) {
  const native = chainId ? nativeOnChain(chainId) : undefined

  if (unwrapped) {
    return (
      <Trans>
        Unwrap{' '}
        <FormattedCurrencyAmount
          rawAmount={currencyAmountRaw}
          symbol={native?.wrapped?.symbol ?? 'WETH'}
          decimals={18}
          sigFigs={6}
        />{' '}
        to {native?.symbol ?? 'ETH'}
      </Trans>
    )
  } else {
    return (
      <Trans>
        Wrap{' '}
        <FormattedCurrencyAmount
          rawAmount={currencyAmountRaw}
          symbol={native?.symbol ?? 'ETH'}
          decimals={18}
          sigFigs={6}
        />{' '}
        to {native?.wrapped?.symbol ?? 'WETH'}
      </Trans>
    )
  }
}

function DepositLiquidityStakingSummary() {
  // not worth rendering the tokens since you can should no longer deposit liquidity in the staking contracts
  // todo: deprecate and delete the code paths that allow this, show user more information
  return <Trans>Deposit liquidity</Trans>
}

function WithdrawLiquidityStakingSummary() {
  return <Trans>Withdraw deposited liquidity</Trans>
}

function MigrateLiquidityToV3Summary({
  info: { baseCurrencyId, quoteCurrencyId },
}: {
  info: MigrateV2LiquidityToV3TransactionInfo
}) {
  const baseCurrency = useCurrency(baseCurrencyId)
  const quoteCurrency = useCurrency(quoteCurrencyId)

  return (
    <Trans>
      Migrate {baseCurrency?.symbol}/{quoteCurrency?.symbol} liquidity to V3
    </Trans>
  )
}

function CreateV3PoolSummary({ info: { quoteCurrencyId, baseCurrencyId } }: { info: CreateV3PoolTransactionInfo }) {
  const baseCurrency = useCurrency(baseCurrencyId)
  const quoteCurrency = useCurrency(quoteCurrencyId)

  return (
    <Trans>
      Create {baseCurrency?.symbol}/{quoteCurrency?.symbol} V3 pool
    </Trans>
  )
}

function CollectFeesSummary({ info: { currencyId0, currencyId1 } }: { info: CollectFeesTransactionInfo }) {
  const currency0 = useCurrency(currencyId0)
  const currency1 = useCurrency(currencyId1)

  return (
    <Trans>
      Collect {currency0?.symbol}/{currency1?.symbol} fees
    </Trans>
  )
}

function RemoveLiquidityV3Summary({
  info: { baseCurrencyId, quoteCurrencyId, expectedAmountBaseRaw, expectedAmountQuoteRaw },
}: {
  info: RemoveLiquidityV3TransactionInfo
}) {
  return (
    <Trans>
      Remove{' '}
      <FormattedCurrencyAmountManaged rawAmount={expectedAmountBaseRaw} currencyId={baseCurrencyId} sigFigs={3} /> and{' '}
      <FormattedCurrencyAmountManaged rawAmount={expectedAmountQuoteRaw} currencyId={quoteCurrencyId} sigFigs={3} />
    </Trans>
  )
}

function RemoveLmtLiquiditySummary({
  info: { baseCurrencyId, quoteCurrencyId, expectedAmountBaseRaw, expectedAmountQuoteRaw },
}: {
  info: RemoveLmtLiquidityTransactionInfo
}) {
  return (
    <Trans>
      Remove{' '}
      <FormattedCurrencyAmountManaged rawAmount={expectedAmountBaseRaw} currencyId={baseCurrencyId} sigFigs={3} /> and{' '}
      <FormattedCurrencyAmountManaged rawAmount={expectedAmountQuoteRaw} currencyId={quoteCurrencyId} sigFigs={3} />
    </Trans>
  )
}

function AddLiquidityV3PoolSummary({
  info: { createPool, quoteCurrencyId, baseCurrencyId },
}: {
  info: AddLiquidityV3PoolTransactionInfo
}) {
  const baseCurrency = useCurrency(baseCurrencyId)
  const quoteCurrency = useCurrency(quoteCurrencyId)

  return createPool ? (
    <Trans>
      Create pool and add {baseCurrency?.symbol}/{quoteCurrency?.symbol} V3 liquidity
    </Trans>
  ) : (
    <Trans>
      Add {baseCurrency?.symbol}/{quoteCurrency?.symbol} V3 liquidity
    </Trans>
  )
}

function AddLmtLiquiditySummary({
  info: { quoteCurrencyId, baseCurrencyId },
}: {
  info: AddLmtLiquidityTransactionInfo
}) {
  const baseCurrency = useCurrency(baseCurrencyId)
  const quoteCurrency = useCurrency(quoteCurrencyId)

  return (
    <Trans>
      Add {baseCurrency?.symbol}/{quoteCurrency?.symbol} LMT liquidity
    </Trans>
  )
}

function AddLiquidityV2PoolSummary({
  info: { quoteCurrencyId, expectedAmountBaseRaw, expectedAmountQuoteRaw, baseCurrencyId },
}: {
  info: AddLiquidityV2PoolTransactionInfo
}) {
  return (
    <Trans>
      Add <FormattedCurrencyAmountManaged rawAmount={expectedAmountBaseRaw} currencyId={baseCurrencyId} sigFigs={3} />{' '}
      and <FormattedCurrencyAmountManaged rawAmount={expectedAmountQuoteRaw} currencyId={quoteCurrencyId} sigFigs={3} />{' '}
      to Uniswap V2
    </Trans>
  )
}

function SwapSummary({ info }: { info: ExactInputSwapTransactionInfo | ExactOutputSwapTransactionInfo }) {
  const { account, chainId } = useWeb3React()
  const [SwapComplete, setSwapComplete] = useState(false)
  useEffect(() => {
    setSwapComplete(true)
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      let tokenInfoFromUniswap
      let tokenAmount
      if (info.tradeType === TradeType.EXACT_INPUT) {
        
        tokenInfoFromUniswap = await getDecimalAndUsdValueData(chainId, info.inputCurrencyId)
        tokenAmount = info.inputCurrencyAmountRaw
      } else {
        tokenInfoFromUniswap = await getDecimalAndUsdValueData(chainId, info.outputCurrencyId)
        tokenAmount = info.outputCurrencyAmountRaw
      }
      
      const tPoint = (tokenInfoFromUniswap?.lastPriceUSD * Number(tokenAmount)) / 10 ** tokenInfoFromUniswap.decimals

      const q = query(
        collection(firestore, 'swap-points'), 
        where('account', '==', account),
        where('chainId', '==', chainId)
      )

      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map((doc) => doc.data())

      if (!data || data.length === 0) {
        await addDoc(collection(firestore, 'swap-points'), {
          chainId: chainId,
          account: account,
          amount: tPoint
        })
      } else {
        const docRef = doc(firestore, 'swap-points', querySnapshot.docs[0].id)
        await updateDoc(docRef, {
          amount: data[0].amount + tPoint,
        })
      }
    }

    if (SwapComplete) {
      ;(async () => {
        await fetchUsers()
        setSwapComplete(false)
      })()
    }
  }, [SwapComplete])

  if (info.tradeType === TradeType.EXACT_INPUT) {
    return (
      <Trans>
        Swap exactly{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.inputCurrencyAmountRaw}
          currencyId={info.inputCurrencyId}
          sigFigs={6}
        />{' '}
        for{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.expectedOutputCurrencyAmountRaw}
          currencyId={info.outputCurrencyId}
          sigFigs={6}
        />
      </Trans>
    )
  } else {
    return (
      <Trans>
        Swap{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.expectedInputCurrencyAmountRaw}
          currencyId={info.inputCurrencyId}
          sigFigs={6}
        />{' '}
        for exactly{' '}
        <FormattedCurrencyAmountManaged
          rawAmount={info.outputCurrencyAmountRaw}
          currencyId={info.outputCurrencyId}
          sigFigs={6}
        />
      </Trans>
    )
  }
}

export function TransactionSummary({ info }: { info: TransactionInfo }) {
  switch (info.type) {
    case TransactionType.ADD_LIQUIDITY_V3_POOL:
      return <AddLiquidityV3PoolSummary info={info} />

    case TransactionType.ADD_LIQUIDITY_V2_POOL:
      return <AddLiquidityV2PoolSummary info={info} />

    case TransactionType.CLAIM:
      return <ClaimSummary info={info} />

    case TransactionType.DEPOSIT_LIQUIDITY_STAKING:
      return <DepositLiquidityStakingSummary />

    case TransactionType.WITHDRAW_LIQUIDITY_STAKING:
      return <WithdrawLiquidityStakingSummary />

    case TransactionType.SWAP:
      return <SwapSummary info={info} />

    case TransactionType.APPROVAL:
      return <ApprovalSummary info={info} />

    case TransactionType.DELEGATE:
      return <DelegateSummary info={info} />

    case TransactionType.WRAP:
      return <WrapSummary info={info} />

    case TransactionType.CREATE_V3_POOL:
      return <CreateV3PoolSummary info={info} />

    case TransactionType.MIGRATE_LIQUIDITY_V3:
      return <MigrateLiquidityToV3Summary info={info} />

    case TransactionType.COLLECT_FEES:
      return <CollectFeesSummary info={info} />

    case TransactionType.REMOVE_LIQUIDITY_V3:
      return <RemoveLiquidityV3Summary info={info} />
    case TransactionType.REMOVE_LMT_LIQUIDITY:
      return <RemoveLmtLiquiditySummary info={info} />
    case TransactionType.QUEUE:
      return <QueueSummary info={info} />
    case TransactionType.EXECUTE:
      return <ExecuteSummary info={info} />
    case TransactionType.SUBMIT_PROPOSAL:
      return <SubmitProposalTransactionSummary />
    case TransactionType.REDUCE_LEVERAGE:
      return <Trans>Reduce Leverage Summary</Trans>
    case TransactionType.ADD_LEVERAGE:
      return <Trans>Add Leverage Summary</Trans>
    case TransactionType.ADD_LMT_LIQUIDITY:
      return <AddLmtLiquiditySummary info={info} />
    case TransactionType.ADD_LIMIT_ORDER:
      return <Trans>Add Limit Order Summary</Trans>
    case TransactionType.REDUCE_LIMIT_ORDER:
      return <Trans>Reduce Limit Order Summary</Trans>
    case TransactionType.CREATE_REFERRAL:
      return <Trans>Created Referral Code</Trans>
    case TransactionType.USE_REFERRAL:
      return <Trans>Using Referral Code</Trans>
    case TransactionType.CANCEL_LIMIT_ORDER:
      return <Trans>Cancel Limit Order Summary</Trans>
    case TransactionType.PREMIUM_DEPOSIT:
      return <Trans>Deposit Interest Summary</Trans>
    case TransactionType.PREMIUM_WITHDRAW:
      return <Trans>Withdraw Interest Summary</Trans>
    case TransactionType.MINT_LLP:
      return <Trans>Mint LLP Summary</Trans>
    case TransactionType.REDEEM_LLP:
      return <Trans>Redeem LLP Summary</Trans>
    case TransactionType.MINT_limWETH:
      return <Trans>Mint limWETH Summary</Trans>
    case TransactionType.REDEEM_limWETH:
      return <Trans>Redeem limWETH Summary</Trans>
  }
}
