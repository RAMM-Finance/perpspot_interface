import { PremiumTable } from 'components/OrdersTable/PremiumTable'
import { OrdersTable } from 'components/OrdersTable/TokenTable'
import SearchBar from 'components/PositionTable/LeveragePositionTable/SearchBar'
import LeveragePositionsTable from 'components/PositionTable/LeveragePositionTable/TokenTable'
import { TabContent, TabNavItem } from 'components/Tabs'
import { LimitActivityTab } from 'components/WalletDropdown/MiniPortfolio/Activity/LimitActivityTab'
import { useState } from 'react'
import styled from 'styled-components/macro'
import { MarginLimitOrder, MarginPositionDetails } from 'types/lmtv2position'

const TableHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.backgroundOutline};
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  width: 100%;
  background-color: ${({ theme }) => theme.backgroundSurface};
`
const TabsWrapper = styled.div`
  display: flex;
`

const ActivityWrapper = styled.section`
  overflow: hidden;

  background-color: ${({ theme }) => theme.backgroundSurface};
`
const MissingHistoryWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 60px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 16px;
  font-weight: 500;
  align-items: center;
  padding: 0px 28px;
  gap: 8px;
`
const ActivityInnerWarpper = styled.div`
  padding: 20px 30px;
  max-height: 390px;
  overflow-y: auto;

  ::-webkit-scrollbar {
    background-color: transparent;
    width: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.background};
    border: none;
  }
  ::-webkit-scrollbar-track {
    background-color: transparent;
  }
`

export function PostionsContainer({
  account,
  orders,
  loadingOrders,
  positions,
  loadingPositions,
  refetchLeveragePositions,
}: {
  account?: string
  orders?: MarginLimitOrder[]
  loadingOrders?: boolean
  positions?: MarginPositionDetails[]
  loadingPositions?: boolean
  refetchLeveragePositions: () => any
}) {
  const [activePositionTable, setActiveTable] = useState(1)

  return (
    <>
      <TableHeader>
        <TabsWrapper>
          <TabNavItem id={1} activeTab={activePositionTable} setActiveTab={setActiveTable} first={true}>
            Leverage Positions
          </TabNavItem>
          {/* <TabNavItem id={2} activeTab={activePositionTable} setActiveTab={setActiveTable}>
            Orders
          </TabNavItem> */}
          {/*<TabNavItem id={3} activeTab={activePositionTable} setActiveTab={setActiveTable} last={true}>
            History
          </TabNavItem>*/}
          {/* <TabNavItem id={3} activeTab={activePositionTable} setActiveTab={setActiveTable}>
            Unclaimed Interests
          </TabNavItem> */}
          <TabNavItem id={4} activeTab={activePositionTable} setActiveTab={setActiveTable} last={true}>
            Activities
          </TabNavItem>
        </TabsWrapper>
        {activePositionTable === 1 && <SearchBar />}
      </TableHeader>
      <TabContent id={1} activeTab={activePositionTable}>
        <LeveragePositionsTable
          positions={positions}
          loading={loadingPositions}
          refetchLeveragePositions={refetchLeveragePositions}
        />
      </TabContent>
      <TabContent id={2} activeTab={activePositionTable}>
        <OrdersTable orders={orders} loading={loadingOrders} />
      </TabContent>
      <TabContent id={3} activeTab={activePositionTable}>
        <PremiumTable orders={orders} loading={loadingOrders} />
      </TabContent>
      {/*<TabContent id={3} activeTab={activePositionTable}>
        {!account ? (
          <ActivityWrapper>
            <MissingHistoryWrapper>None</MissingHistoryWrapper>
          </ActivityWrapper>
        ) : (
          <ActivityWrapper>
            <ActivityInnerWarpper>
              <ActivityTab account={account} />
            </ActivityInnerWarpper>
          </ActivityWrapper>
        )}
      </TabContent>*/}
      <TabContent id={4} activeTab={activePositionTable}>
        {!account ? (
          <ActivityWrapper>
            <MissingHistoryWrapper>No History Found</MissingHistoryWrapper>
          </ActivityWrapper>
        ) : (
          <ActivityWrapper>
            <LimitActivityTab account={account} />
          </ActivityWrapper>
        )}
      </TabContent>
    </>
  )
}
