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
          // <div style={style}>
          <ActivityGroupWrapper style={style}>
            <Column style={{ marginBottom: '12px' }}>
              <h1>INDEX {index}</h1>
              <ActivityRow key={historyToShow[index].hash} activity={historyToShow[index]} />
            </Column>
          </ActivityGroupWrapper>
          // </div>
          
        )
      }
      return null
      
  }, [historyToShow])

  // console.log("AR", emptyArray.length)

  // const emptyArray = useMemo(() => {
  //   if (historyToShow?.length) {
  //     return new Array(historyToShow.length).fill(null)
  //   } 
  //   return []
  // }, [historyToShow])

  // const Row2 = useCallback(
  //   ({index, style}: { index: number; style: any }) => (
  //     <h1 style={style}>{index}</h1>
  //   ) 
  // , [])

  // const Row2 = memo(({ index, style, data }: { index: number; style: any; data: any }) => (
  //   <h1 style={style}>{index}</h1>
  // ))

  return (
    <HistoryContainer>
      <List
        overscanCount={10}
        height={400}
        itemCount={historyToShow?.length}
        itemSize={150}
        width='100%'
        // itemData={historyToShow}
      >
        {Row}
      </List>
      {/* <List
        overscanCount={15}
        height={400}
        itemCount={emptyArray?.length}
        itemSize={50}
        width='100%'
        itemData={emptyArray}
        style={{ marginTop: '20px' }}
      >
        {Row2}
      </List> */}
      {/* {historyToShow?.map((history: any, index: number) => (
        <ActivityGroupWrapper key={index}>
          <Column style={{ marginBottom: '12px' }}>
            <ActivityRow key={history.hash} activity={history} />
          </Column>
        </ActivityGroupWrapper>
      ))} */}
    </HistoryContainer>
  )
}

export default HistoryTable
