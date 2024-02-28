import { t } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { LoadingBubble } from 'components/Tokens/loading'
import { useWalletDrawer } from 'components/WalletDropdown'
import { getYear, isSameDay, isSameMonth, isSameWeek, isSameYear } from 'date-fns'
import { TransactionStatus, useTransactionListQuery } from 'graphql/data/__generated__/types-and-hooks'
import { PollingInterval } from 'graphql/data/util'
import { useDefaultActiveTokens } from 'hooks/Tokens'
import { useHistoryData } from 'hooks/useAccountHistory'
import { tokenDecimal } from 'hooks/useContract'
import { atom, useAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import styled from 'styled-components/macro'

import { PortfolioSkeleton, PortfolioTabWrapper } from '../PortfolioRow'
import { parseRemoteActivities } from './parseRemote'
import { Activity, ActivityMap } from './types'
import { ActivitiesHeaderRow } from 'components/ActivitiesTable/ActivitesRow'
import HistoryTable from 'components/ActivitiesTable/HistoryTable'

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

function getDescriptor(entry: any, tokens: any) {
  const token0Name = tokens[entry.token0]?.symbol ?? tokens[entry.token0]?.name
  const token1Name = tokens[entry.token1]?.symbol ?? tokens[entry.token1]?.name
  const token0Decimal = tokenDecimal[entry.token0]
  const token1Decimal = tokenDecimal[entry.token1]

  if (entry.actionType == 'Add Order') {
    if (entry.positionIsToken0) return 'Added order for ' + token0Name + ' with ' + token1Name
    else return 'Added order for ' + token1Name + ' with' + token0Name
  } else if (entry.actionType == 'Cancel Order') {
    if (entry.positionIsToken0) return 'Canceled order for ' + token0Name + ' with ' + token1Name
    else return 'Canceled order for ' + token1Name + ' with' + token0Name
  } else if (entry.actionType == 'Add Position') {
    if (entry.positionIsToken0)
      return (
        'Added ' + String(Number(entry.addedAmount) / 10 ** token0Decimal) + token0Name + ' long with ' + token1Name
      )
    else
      return (
        'Added ' + String(Number(entry.addedAmount) / 10 ** token1Decimal) + token1Name + ' long with ' + token0Name
      )
  } else if (entry.actionType == 'Force Closed') {
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
        ' for ' +
        token0Name +
        '/' +
        token1Name
      )
  } else if (entry.actionType == 'Reduce Position') {
    if (entry.positionIsToken0)
      return (
        'Reduced ' +
        String(Number(entry.reduceAmount) / 10 ** token0Decimal) +
        token0Name +
        ' for ' +
        token0Name +
        '/' +
        token1Name
      )
    else
      return (
        'Reduced ' +
        String(Number(entry.reduceAmount) / 10 ** token1Decimal) +
        token1Name +
        ' for ' +
        token0Name +
        '/' +
        token1Name
      )
  } else {
    return ' '
  }
}
export function LimitActivityTab({ account }: { account: string }) {
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
  const historyToShow = useMemo(() => {
    if (!history) return

    const processedHistory: any[] = []
    history?.forEach((entry: any) => {
      const descriptor = getDescriptor(entry, tokens)
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
    return processedHistory
  }, [history])

  console.log('historyData', history, historyToShow)

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

  const activityGroups = useMemo(() => {
    const remoteMap = parseRemoteActivities(data?.portfolios?.[0].assetActivities)
    const allActivities = combineActivities(localMap, remoteMap)
    return createGroups(allActivities)
  }, [data?.portfolios, localMap])

  if (!data && loading)
    return (
      <>
        <LoadingBubble height="16px" width="80px" margin="16px 16px 8px" />
        <PortfolioSkeleton shrinkRight />
      </>
    )
  else {
    // return <EmptyWalletModule type="activity" onNavigateClick={toggleWalletDrawer} />
    return (
      <GridContainer>
        <ActivitiesHeaderRow />
        <HistoryTable historyToShow={historyToShow}/>
      </GridContainer>
    )
  }
}
