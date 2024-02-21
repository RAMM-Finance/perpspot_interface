import { useState } from 'react'
import { NavLink } from 'react-router-dom'
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
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`

const TableHeader = styled.th`
  width: 100%;
  padding: 10px;
  font-size: 12px;
  font-weight: 300;
  color: ${({ theme }) => theme.accentTextLightSecondary};
`

const TableText = styled.div<{ textAlign?: string }>`
  text-align: ${({ textAlign }) => (textAlign ? textAlign : 'left')};
`

const TableData = styled.td<{ isPlus?: boolean }>`
  width: 100%;
  height: 100%;
  padding: 12px;
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
  border-radius: 12px;
  color: ${({ isInfo, theme }) => isInfo && theme.accentTextDarkPrimary};
  height: ${({ isInfo }) => (isInfo ? '12px' : '26px')};
  width: ${({ isInfo }) => (isInfo ? '12px' : '26px')};
  margin-left: ${({ isInfo }) => isInfo && '5px'};
  margin-right: 12px;
  border: none;
  cursor: ${({ isInfo }) => isInfo && 'pointer'};
`

const IconWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  gap: 3px;
  margin-left: -25px;
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

const NavBtn = styled(NavLink)`
  width: 100%;
`

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 3px;
  width: 100%;
`

type TCollateral = {
  asset: { isIcon?: boolean; icon: any; title: string; desc?: string }
  balance?: string
  composition: string | { isIcon: boolean; src: string[] }
  apy?: string
  value: { dollar: any; percent: string | null }
  actions: string
  price: number
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
      <TableHead>
        <TableRow isHeader={true}>
          {Object.keys(collateral[0]).map((key) => (
            <TableHeader key={key} colSpan={1}>
              {key === 'actions' ? <TableText textAlign="right">{key}</TableText> : <TableText>{key}</TableText>}
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
                      {value.isIcon === false ? value.icon : <StyledIcon src={value.icon} alt="icon" />}
                      <TableText>{value.title}</TableText>
                      {/* BTC info icon 필요 */}
                      {value.desc && (
                        <StyledIcon
                          isInfo={true}
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                          alt="info_icon"
                        />
                      )}
                      {value.desc && isModalOpen && <Modal>{value.desc}</Modal>}
                    </AssetBox>
                  </TableData>
                )
              if (key === 'apy')
                return (
                  <TableData key={key} isPlus={true}>
                    <TableText>{value}</TableText>
                  </TableData>
                )
              if (key === 'value')
                return (
                  <TableData key={key}>
                    {value.percent ? (
                      <TableText textAlign="left">
                        {value.dollar}
                        {value.percent && (
                          <PlusText>
                            <br /> {value.percent}
                          </PlusText>
                        )}
                      </TableText>
                    ) : (
                      <TableText textAlign="center">{value.dollar}</TableText>
                    )}
                  </TableData>
                )
              if (key === 'actions')
                return (
                  <TableData key={key} style={{ display: 'flex', justifyContent: 'center' }}>
                    {value === 'saving' && (
                      <NavBtn to="/pools">
                        <TableButton disabled={false} marginRight="10px" text="Earn" />
                      </NavBtn>
                    )}
                    {value === 'token' && (
                      <ButtonWrapper>
                        <TableButton disabled={false} marginRight="10px" text="Deposit" />
                        <TableButton disabled={true} marginRight="10px" text="Withdraw" />
                        <TableButton disabled={true} marginRight="10px" text="Tansfer" />
                        <TableButton disabled={true} marginRight="10px" text="Convert" />
                      </ButtonWrapper>
                    )}
                  </TableData>
                )
              if (key === 'price')
                return (
                  <TableData key={key}>
                    <TableText textAlign="left">{Number(value).toFixed(4)}</TableText>
                  </TableData>
                )
              if (key === 'composition' && value.isIcon)
                return (
                  <TableData key={key} style={{ display: 'flex', justifyContent: 'center' }}>
                    <IconWrapper>
                      {value.src.map((icon: string) => (
                        <StyledIcon key={icon} src={icon} alt="info_icon" />
                      ))}
                    </IconWrapper>
                  </TableData>
                )
              return (
                <TableData key={key}>
                  <TableText textAlign="center">{value}</TableText>
                </TableData>
              )
            })}
          </TableRow>
        ))}
      </tbody>
    </Table>
  )
}

export default CollateralTable
