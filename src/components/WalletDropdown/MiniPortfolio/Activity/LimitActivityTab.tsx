import { t } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import HistoryTable, { Column, HistoryContainer } from 'components/ActivitiesTable/HistoryTable'
import { AutoColumn } from 'components/Column'
import Row from 'components/Row'
import { LoadingBubble } from 'components/Tokens/loading'
import { useWalletDrawer } from 'components/WalletDropdown'
import { getYear, isSameDay, isSameMonth, isSameWeek, isSameYear } from 'date-fns'
import { TransactionStatus, useTransactionListQuery } from 'graphql/data/__generated__/types-and-hooks'
import { PollingInterval } from 'graphql/data/util'
import { useDefaultActiveTokens } from 'hooks/Tokens'
import { useHistoryData } from 'hooks/useAccountHistory'
import { tokenDecimal } from 'hooks/useContract'
import { atom, useAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components/macro'

import PortfolioRow from '../PortfolioRow'
import { ActivityTableRow } from './LimitActivityRow'
import { Activity, ActivityDescriptionType, ActivityMap } from './types'
import { getDecimalAndUsdValueData } from 'hooks/useUSDPrice'
import { SupportedChainId } from 'constants/chains'
import { entropyToMnemonic } from 'ethers/lib/utils'

const LoadingContainer = styled(HistoryContainer)`
  margin-top: 12px;
  border-bottom: 1px solid;
  border-color: ${({ theme }) => theme.tableBorder};
`

const ActivityGroupWrapper = styled(Column)`
  margin-top: 16px;
  gap: 8px;
  border-bottom: 1px solid;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 10px;
  border-color: ${({ theme }) => theme.backgroundOutline};
  :last-child {
    border: none;
  }
`

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: ${({ theme }) => theme.backgroundSurface};
  justify-content: flex-start;
  align-items: flex-start;
`

const ActivitiesDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  height: 100%;
  width: 100%;
`

interface ActivityGroup {
  title: string
  transactions: Array<Activity>
}

const sortActivities = (a: Activity, b: Activity) => b.timestamp - a.timestamp

const createGroups = (activities?: Array<Activity>) => {
  if (!activities || !activities.length) return []
  const now = Date.now()

  const pending: Array<Activity> = []
  const today: Array<Activity> = []
  const currentWeek: Array<Activity> = []
  const last30Days: Array<Activity> = []
  const currentYear: Array<Activity> = []
  const yearMap: { [key: string]: Array<Activity> } = {}

  // TODO(cartcrom): create different time bucket system for activities to fall in based on design wants
  activities.forEach((activity) => {
    if (activity.status === TransactionStatus.Pending) {
      pending.push(activity)
      return
    }
    const addedTime = activity.timestamp * 1000

    if (isSameDay(now, addedTime)) {
      today.push(activity)
    } else if (isSameWeek(addedTime, now)) {
      currentWeek.push(activity)
    } else if (isSameMonth(addedTime, now)) {
      last30Days.push(activity)
    } else if (isSameYear(addedTime, now)) {
      currentYear.push(activity)
    } else {
      const year = getYear(addedTime)

      if (!yearMap[year]) {
        yearMap[year] = [activity]
      } else {
        yearMap[year].push(activity)
      }
    }
  })
  const sortedYears = Object.keys(yearMap)
    .sort((a, b) => parseInt(b) - parseInt(a))
    .map((year) => ({ title: year, transactions: yearMap[year] }))

  const transactionGroups: Array<ActivityGroup> = [
    { title: t`Pending`, transactions: pending.sort(sortActivities) },
    { title: t`Today`, transactions: today.sort(sortActivities) },
    { title: t`This week`, transactions: currentWeek.sort(sortActivities) },
    { title: t`This month`, transactions: last30Days.sort(sortActivities) },
    { title: t`This year`, transactions: currentYear.sort(sortActivities) },
    ...sortedYears,
  ]

  return transactionGroups.filter((transactionInformation) => transactionInformation.transactions.length > 0)
}

function combineActivities(localMap: ActivityMap = {}, remoteMap: ActivityMap = {}): Array<Activity> {
  const txHashes = [...new Set([...Object.keys(localMap), ...Object.keys(remoteMap)])]

  // Merges local and remote activities w/ same hash, preferring remote data
  return txHashes.reduce((acc: Array<Activity>, hash) => {
    const localActivity = localMap?.[hash] ?? {}
    const remoteActivity = remoteMap?.[hash] ?? {}
    // TODO(cartcrom): determine best logic for which fields to prefer from which sources, i.e. prefer remote exact swap output instead of local estimated output
    acc.push({ ...remoteActivity, ...localActivity } as Activity)
    return acc
  }, [])
}

const lastFetchedAtom = atom<number | undefined>(0)

async function getDescriptor(chainId: number | undefined, entry: any, tokens: any) {
  const token0Name = tokens[entry.token0]?.symbol ?? tokens[entry.token0]?.name
  const token1Name = tokens[entry.token1]?.symbol ?? tokens[entry.token1]?.name

  let networkIdForGeckoApi = 'arbitrum-one'
  if (SupportedChainId.ARBITRUM_ONE === chainId) {
    networkIdForGeckoApi = 'arbitrum-one'
  } else if (SupportedChainId.BASE === chainId) {
    networkIdForGeckoApi = 'base'
  } 

  
  // const token0Decimal = tokenDecimal[entry.token0]
  // const token1Decimal = tokenDecimal[entry.token1]
  
  const token0Decimal = (await getDecimalAndUsdValueData(chainId, entry.token0))?.decimals
  const token1Decimal = (await getDecimalAndUsdValueData(chainId, entry.token1))?.decimals
  
  // console.log('------getDescriptor token name', tokens[entry.token0]?.name, token0Name, token1Name)
  // console.log('------getDescriptor entry', entry);
  // console.log("entry actionType", entry.actionType)
  if (entry.actionType == ActivityDescriptionType.ADD_ORDER) {
    const price = entry.marginIsPosToken
      ? entry.positionisToken0
        ? token0Decimal / entry.startoutput
        : token1Decimal / entry.startoutput
      : entry.positionIsToken0
      ? token1Decimal / entry.inputAmount
      : token0Decimal / entry.inputAmount
    if (entry.positionIsToken0)
      return (
        'Added order for ' +
        token0Name +
        ' with ' +
        token1Name +
        `, Pair: ${token0Name}/${token1Name}` +
        `, Price: ${price}`
      )
    else
      return (
        'Added order for ' +
        token1Name +
        ' with' +
        token0Name +
        `, Pair: ${token0Name}/${token1Name}` +
        `, Price: ${price}`
      )
  } else if (entry.actionType == ActivityDescriptionType.CANCLE_ORDER) {
    if (entry.positionIsToken0)
      return 'Canceled order for ' + token0Name + ' with ' + token1Name + `, Pair: ${token0Name}/${token1Name}`
    else return 'Canceled order for ' + token1Name + ' with' + token0Name
  } else if (entry.actionType == ActivityDescriptionType.ADD_POSITION) {
    console.log("ADD POSITION ENTRY", entry)
    const price = entry.marginIsPosToken
      ? entry.positionIsToken0
        ? Number(entry.addedAmount) / 10 ** token0Decimal / (Number(entry.borrowAmount) / 10 ** token1Decimal)
        : Number(entry.addedAmount) / 10 ** token1Decimal / (Number(entry.borrowAmount) / 10 ** token0Decimal)
      : entry.positionIsToken0
      ? Number(entry.addedAmount) /
        10 ** token0Decimal /
        ((Number(entry.marginAmount) + Number(entry.borrowAmount)) / 10 ** token1Decimal)
      : Number(entry.addedAmount) /
        10 ** token1Decimal /
        ((Number(entry.marginAmount) + Number(entry.borrowAmount)) / 10 ** token0Decimal)
    const margin = entry.marginIsPosToken
      ? entry.positionIsToken0
        ? Number(entry.marginAmount / 10 ** token0Decimal)
        : Number(entry.marginAmount / 10 ** token1Decimal)
      : entry.positionIsToken0
      ? Number(entry.marginAmount / 10 ** token1Decimal)
      : Number(entry.marginAmount / 10 ** token0Decimal)
    if (entry.positionIsToken0)
      return (
        'Added ' +
        String(Number(entry.addedAmount) / 10 ** token0Decimal) + ' ' +
        token0Name +
        '  with ' +
        String(margin) + ' ' +
        (entry.marginIsPosToken ? token0Name : token1Name) +
        `, Pair: ${token0Name}/${token1Name}` +
        `, Price: ${price.toFixed(7)}`
      )
    else
      return (
        'Added ' +
        String(Number(entry.addedAmount) / 10 ** token1Decimal) + ' ' +
        token1Name +
        '  with ' +
        String(margin) + ' ' +
        (entry.marginIsPosToken ? token1Name : token0Name) + 
        `, Pair: ${token0Name}/${token1Name}` +
        `, Price: ${price.toFixed(7)}`
      )
  } else if (entry.actionType == ActivityDescriptionType.FORCE_CLOSED) {
    if (entry.positionIsToken0)
      return (
        'Force Closed ' +
        String(Number(entry.forcedClosedAmount) / 10 ** token0Decimal) +
        token0Name +
        ' for ' +
        token0Name +
        '/' +
        token1Name
      )
    else
      return (
        'Force Closed ' +
        String(Number(entry.forcedClosedAmount) / 10 ** token1Decimal) +
        token1Name +
        ' from ' +
        token0Name +
        '/' +
        token1Name
      )
  } else if (entry.actionType == ActivityDescriptionType.REDUCE_POSITION) {
    const price = String(-(Number(entry.amount0) / 10 ** token0Decimal) / (Number(entry.amount1) / 10 ** token1Decimal))
    const PnL = entry.marginIsPosToken
      ? entry.positionIsToken0
        ? Number(entry.PnL) / 10 ** token0Decimal
        : Number(entry.PnL) / 10 ** token1Decimal
      : entry.positionIsToken0
      ? Number(entry.PnL) / 10 ** token1Decimal
      : Number(entry.PnL) / 10 ** token0Decimal
    const marginToken = entry.marginIsPosToken ? token0Name : token1Name
    if (entry.positionIsToken0)
      return (
        'Reduced ' +
        String(Number(entry.reduceAmount) / 10 ** token0Decimal) + ' ' +
        token0Name +
        ' from ' +
        token0Name +
        '/' +
        token1Name +
        `, Pair: ${token0Name}/${token1Name}` +
        `, Price: ${Number(price).toFixed(7)}` +
        ` Pnl: ${PnL.toFixed(8)} ${marginToken}`
      )
    else
      return (
        'Reduced ' +
        String(Number(entry.reduceAmount) / 10 ** token1Decimal) + ' ' +
        token1Name +
        ' for ' +
        token0Name +
        '/' +
        token1Name +
        `, Pair: ${token0Name}/${token1Name}` +
        `, Price:  ${Number(price).toFixed(7)}` +
        ` Pnl: ${PnL.toFixed(9)} ${marginToken}`
      )
  } else {
    return ' '
  }
}

function LoadingRow() {
  return (
    <PortfolioRow
      isGrow={false}
      left={<LoadingBubble round={true} width="32px" height="30px" />}
      title={
        <ActivityTableRow>
          <AutoColumn gap="10px">
            <Row gap="5px">
              <LoadingBubble width="120px" />
              <LoadingBubble width="100px" />
            </Row>
            <Row gap="10px">
              <LoadingBubble width="120px" />
              |
              <LoadingBubble width="150px" />
            </Row>
            <LoadingBubble width="80px" />
          </AutoColumn>
        </ActivityTableRow>
      }
    />
  )
}
function LoadingTokenTable() {
  return (
    <GridContainer>
      <LoadingContainer>
        <LoadingRow />
      </LoadingContainer>
      <LoadingContainer>
        <LoadingRow />
      </LoadingContainer>
    </GridContainer>
  )
}

export const LimitActivityTab = ({ account }: { account: string }) => {
  const [drawerOpen, toggleWalletDrawer] = useWalletDrawer()
  const [lastFetched, setLastFetched] = useAtom(lastFetchedAtom)
  const { chainId } = useWeb3React()
  const tokens = useDefaultActiveTokens()

  const localMap = undefined //useLocalActivities()

  const { data, loading, refetch } = useTransactionListQuery({
    variables: { account },
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
  })

  //{ chainId, status, title, descriptor, logos, otherAccount, currencies, timestamp, hash }

  const history = useHistoryData(account)
  // const historyToShow = useMemo(() => {
  //   if (!history) return
  //   const processedHistory: any[] = []
  //   history?.forEach((entry: any) => {
  //     const descriptor = getDescriptor(chainId, entry, tokens)

  //     // console.log(descriptor, '--------descriptor----------')
  //     processedHistory.push({
  //       chainId,
  //       status: undefined,
  //       timestamp: Number(entry.blockTimestamp),
  //       title: entry.actionType,
  //       descriptor: descriptor ?? ' ',
  //       logos: undefined,
  //       currencies: [entry.token0, entry.token1],
  //       hash: entry.transactionHash,
  //       isOrder: entry.actionType == 'Reduce Position' ? (entry.trader != entry.filler ? true : false) : false,
  //     })
  //   })
  //   console.log("HISTORY TO SHOW - processedHistory", processedHistory)
  //   return processedHistory
  // }, [history])

  const [historyToShow, setHistoryToShow] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!history) return
        const processedHistory: any[] = []
        const promises = history?.map(async (entry: any) => {
          const descriptor = await getDescriptor(chainId, entry, tokens)
          processedHistory.push({
            chainId,
            status: undefined,
            timestamp: Number(entry.blockTimestamp),
            title: entry.actionType,
            descriptor: descriptor ?? ' ',
            logos: undefined,
            currencies: [entry.token0, entry.token1],
            hash: entry.transactionHash,
            isOrder: entry.actionType == 'Reduce Position' ? (entry.trader != entry.filler ? true : false) : false,
          })
        })
        const promiseRes = await Promise.all(promises)
        console.log('TEST = processedHistory ', processedHistory)
        setHistoryToShow(processedHistory)
        return Promise.resolve()
      } catch(err) {
        console.error('failed to call getDescriptor')
        return Promise.reject(err)
      }
    }
    fetchData()
  }, [history])

  // We only refetch remote activity if the user renavigates to the activity tab by changing tabs or opening the drawer
  useEffect(() => {
    const currentTime = Date.now()
    if (!lastFetched) {
      setLastFetched(currentTime)
    } else if (drawerOpen && lastFetched && currentTime - lastFetched > PollingInterval.Slow) {
      refetch()
      setLastFetched(currentTime)
    }
  }, [drawerOpen, lastFetched, refetch, setLastFetched])

  // const activityGroups = useMemo(() => {
  //   const remoteMap = parseRemoteActivities(data?.portfolios?.[0].assetActivities)
  //   const allActivities = combineActivities(localMap, remoteMap)
  //   return createGroups(allActivities)
  // }, [data?.portfolios, localMap])

  if (!data && loading) return <LoadingTokenTable />
  else {
    // return <EmptyWalletModule type="activity" onNavigateClick={toggleWalletDrawer} />
    return (
      <GridContainer>
        <HistoryTable historyToShow={historyToShow} />
      </GridContainer>
    )
  }
}
