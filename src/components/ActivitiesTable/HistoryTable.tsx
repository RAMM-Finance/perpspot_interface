import { ActivityRow } from 'components/WalletDropdown/MiniPortfolio/Activity/LimitActivityRow'
import styled, { DefaultTheme } from 'styled-components/macro'
import { FixedSizeList as List } from 'react-window'
import { memo, useCallback, useMemo } from 'react'
interface HistoryTableProps {
  historyToShow: any
}

type Gap = keyof DefaultTheme['grids']

export const Column = styled.div<{
  gap?: Gap
}>`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: ${({ gap, theme }) => gap && theme.grids[gap]};
`

export const ActivityGroupWrapper = styled(Column)`
  margin-top: 16px;
  border-bottom: 1px solid;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 10px;
  border-color: ${({ theme }) => theme.backgroundOutline};
  :last-child {
    border: none;
  }
  overscrollBehavior: none;
`
export const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  height: 100%;
  width: 100%;
  margin-left: 8px;
`



const HistoryTable = ({ historyToShow }: HistoryTableProps) => {
  
  const Row = useCallback(
    ({ index, style }: { index: number; style: any }) => {
      if (historyToShow[index]) {
        return (
          <ActivityGroupWrapper style={style}>
            <Column style={{ marginBottom: '12px' }}>
              <ActivityRow key={historyToShow[index].hash} activity={historyToShow[index]} />
            </Column>
          </ActivityGroupWrapper>
        )
      }
      return null
      
  }, [historyToShow])


  return (
    <HistoryContainer>
      <List
        overscanCount={10}
        height={400}
        itemCount={historyToShow?.length}
        itemSize={100}
        width='100%'
      >
        {Row}
      </List>
    </HistoryContainer>
  )
}

export default HistoryTable
