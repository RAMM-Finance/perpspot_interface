import { t } from '@lingui/macro'
import Column from 'components/Column'
import { LoadingBubble } from 'components/Tokens/loading'
import { useWalletDrawer } from 'components/WalletDropdown'
import { getYear, isSameDay, isSameMonth, isSameWeek, isSameYear } from 'date-fns'
import { TransactionStatus, useTransactionListQuery } from 'graphql/data/__generated__/types-and-hooks'
import { PollingInterval } from 'graphql/data/util'
import { atom, useAtom } from 'jotai'
import { EmptyWalletModule } from 'nft/components/profile/view/EmptyWalletContent'
import { useEffect, useMemo } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { PortfolioSkeleton, PortfolioTabWrapper } from '../PortfolioRow'
import { ActivityRow } from './ActivityRow'
import { useLocalActivities } from './parseLocal'
import { parseRemoteActivities } from './parseRemote'
import { Activity, ActivityMap } from './types'

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

const ActivityGroupWrapper = styled(Column)`
  margin-top: 16px;
  gap: 8px;
  border-bottom: 1px solid;
  border-color: ${({ theme }) => theme.backgroundOutline};
  :last-child {
    border: none;
  }
`

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

export function ActivityTab({ account }: { account: string }) {
  const [drawerOpen, toggleWalletDrawer] = useWalletDrawer()
  const [lastFetched, setLastFetched] = useAtom(lastFetchedAtom)

  const localMap = useLocalActivities()

  const { data, loading, refetch } = useTransactionListQuery({
    variables: { account },
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
  })

  // console.log('activityTab', localMap)

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
  else if (activityGroups.length === 0) {
    return <EmptyWalletModule type="activity" onNavigateClick={toggleWalletDrawer} />
  } else {
    return (
      <PortfolioTabWrapper>
        {activityGroups.map((activityGroup) => (
          <ActivityGroupWrapper key={activityGroup.title}>
            <ThemedText.SubHeader color="textSecondary" fontWeight={500}>
              {activityGroup.title}
            </ThemedText.SubHeader>
            <Column style={{ marginBottom: '12px' }}>
              {activityGroup.transactions.map((activity) => (
                <ActivityRow key={activity.hash} activity={activity} />
              ))}
            </Column>
          </ActivityGroupWrapper>
        ))}
      </PortfolioTabWrapper>
    )
  }
}
