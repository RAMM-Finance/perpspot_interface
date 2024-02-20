import { useState } from 'react'
import styled from 'styled-components/macro'

import TableButton from './TableButton'

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  gap: 100px;
  border-collapse: separate;
  border-spacing: 0 6px;
`
const TableHead = styled.thead``

const TableRow = styled.tr<{ isHeader?: boolean }>`
  background-color: ${({ isHeader, theme }) => (isHeader ? 'transparent' : theme.accentTextDarkPrimary)};
  border: none;
  border-radius: 16px;
`

const TableHeader = styled.th`
  padding: 10px;
  font-size: 12px;
  font-weight: 300;
  color: ${({ theme }) => theme.accentTextLightSecondary};
`

const TableHeaderText = styled.div<{ isAction?: boolean }>`
  display: flex;
  align-items: center;
  text-align: right;
  justify-content: ${({ isAction }) => (isAction ? 'flex-end' : 'flex-start')};
`

const TableData = styled.td<{ isPlus?: boolean }>`
  height: 100%;
  padding: 12px;
  justify-content: center;
  color: ${({ isPlus, theme }) => isPlus && theme.accentSuccess};
`

const PlusText = styled.span`
  color: ${({ theme }) => theme.accentSuccess};
`
const StyledIcon = styled.img<{ isInfo?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(24, 24, 30);
  border-radius: 16px;
  color: ${({ isInfo, theme }) => isInfo && theme.accentTextDarkPrimary};
  height: ${({ isInfo }) => (isInfo ? '12px' : '28px')};
  width: ${({ isInfo }) => (isInfo ? '12px' : '28px')};
  margin-left: ${({ isInfo }) => isInfo && '5px'};
  margin-right: 12px;
  border: none;
  cursor: ${({ isInfo }) => isInfo && 'pointer'};
`

const AssetBox = styled.div`
  position: relative;
  display: flex;
  text-align: center;
  align-items: center;
`

const Modal = styled.div`
  position: absolute;
  top: 35px;
  right: 0px;
  background-color: rgb(24, 24, 30);
  border-radius: 12px;
  width: 200px;
  height: 65px;
  color: white;
  z-index: 99;
  text-align: 'center';
  font-size: 14px;
`

type TCollateral = {
  asset: { icon: any; title: string; desc?: string }
  Balance?: string
  apy?: string
  value: { dollar: string; percent: string | null }
  actions: string
}

interface ICollateralTableProps {
  collateral: TCollateral[]
}

const CollateralTable = ({ collateral }: ICollateralTableProps) => {
  const [isModalOpen, setModalOpen] = useState(false)

  const handleMouseEnter = () => {
    setModalOpen(true)
  }

  const handleMouseLeave = () => {
    setModalOpen(false)
  }

  return (
    <Table>
      <colgroup>
        <col style={{ width: '17%' }} />
        <col style={{ width: '17%' }} />
        <col style={{ width: '17%' }} />
        <col style={{ width: '17%' }} />
        <col style={{ width: '32%' }} />
      </colgroup>
      <TableHead>
        <TableRow isHeader={true}>
          {Object.keys(collateral[0]).map((key) => (
            <TableHeader key={key} colSpan={1}>
              {key === 'actions' ? (
                <TableHeaderText isAction={true}>{key}</TableHeaderText>
              ) : (
                <TableHeaderText>{key}</TableHeaderText>
              )}
            </TableHeader>
          ))}
        </TableRow>
      </TableHead>
      <tbody>
        {collateral.map((data, idx) => (
          <TableRow key={idx}>
            {Object.entries(data).map(([key, value]: [...any]) => {
              if (key === 'asset')
                return (
                  <TableData key={key}>
                    <AssetBox>
                      <StyledIcon src={value.icon} alt="icon" />
                      {value.title}
                      {/* BTC info icon 필요 */}
                      {value.desc && 
                        <StyledIcon
                          isInfo={true}
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                          alt="info_icon"
                        />
                      }
                      {value.desc && isModalOpen && <Modal>{value.desc}</Modal>}
                    </AssetBox>
                  </TableData>
                )
              if (key === 'apy')
                return (
                  <TableData key={key} isPlus={true}>
                    {value}
                  </TableData>
                )
              if (key === 'value')
                return (
                  <TableData key={key}>
                    {value.dollar} <br /> {value.percent && <PlusText>{value.percent}</PlusText>}
                  </TableData>
                )
              if (key === 'actions')
                return (
                  <TableData key={key} style={{ display: 'flex', justifyContent: 'center' }}>
                    {value === 'saving' && (
                      <>
                        <TableButton disabled={false} marginRight="10px" text="Earn" />
                        <TableButton disabled={true} text="Redeem" />
                      </>
                    )}
                    {value === 'token' && (
                      <>
                        <TableButton disabled={false} marginRight="10px" text="Deposit" />
                        <TableButton disabled={true} marginRight="10px" text="Withdraw" />
                        <TableButton disabled={true} marginRight="10px" text="Tansfer" />
                        <TableButton disabled={true} marginRight="10px" text="Convert" />
                      </>
                    )}
                  </TableData>
                )
              return <TableData key={key}>{value}</TableData>
            })}
          </TableRow>
        ))}
      </tbody>
    </Table>
  )
}

export default CollateralTable
