import { OrdersTable } from 'components/OrdersTable/TokenTable'
import { default as LeverageSearchBar } from 'components/PositionTable/LeveragePositionTable/SearchBar'
import LeveragePositionsTable from 'components/PositionTable/LeveragePositionTable/TokenTable'
import { TabContent, TabNavItem } from 'components/Tabs'
import { ActivityTab } from 'components/WalletDropdown/MiniPortfolio/Activity/ActivityTab'
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: ${({ theme }) => theme.textPrimary};
  font-size: 16px;
  font-weight: 500;
  border-radius: 0;
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
}: {
  account?: string
  orders?: MarginLimitOrder[]
  loadingOrders?: boolean
  positions?: MarginPositionDetails[]
  loadingPositions?: boolean
}) {
  const [activePositionTable, setActiveTable] = useState(1)

  return (
    <>
      <TableHeader>
        <TabsWrapper>
          <TabNavItem id={1} activeTab={activePositionTable} setActiveTab={setActiveTable} first={true}>
            Leverage Positions
          </TabNavItem>
          <TabNavItem id={2} activeTab={activePositionTable} setActiveTab={setActiveTable}>
            Orders
          </TabNavItem>
          <TabNavItem id={3} activeTab={activePositionTable} setActiveTab={setActiveTable} last={true}>
            History
          </TabNavItem>
        </TabsWrapper>
        {activePositionTable === 1 && <LeverageSearchBar />}
      </TableHeader>
      <TabContent id={1} activeTab={activePositionTable}>
        <LeveragePositionsTable positions={positions} loading={loadingPositions} />
      </TabContent>
      <TabContent id={2} activeTab={activePositionTable}>
        <OrdersTable orders={orders} loading={loadingOrders} />
      </TabContent>
      <TabContent id={3} activeTab={activePositionTable}>
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
      </TabContent>
    </>
  )
}
