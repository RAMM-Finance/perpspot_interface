import { ActivityRow } from 'components/WalletDropdown/MiniPortfolio/Activity/LimitActivityRow'
import styled, { DefaultTheme } from 'styled-components/macro'

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
  return (
    <HistoryContainer>
      {historyToShow?.map((history: any, index: number) => (
        <ActivityGroupWrapper key={index}>
          <Column style={{ marginBottom: '12px' }}>
            <ActivityRow key={history.hash} activity={history} />
          </Column>
        </ActivityGroupWrapper>
      ))}
    </HistoryContainer>
  )
}

export default HistoryTable
