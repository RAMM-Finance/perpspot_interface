import styled from 'styled-components/macro'

import { SubTitle } from './Overview'

const MarginHealthWrapper = styled.div`
  min-width: 500px;
  border-radius: 12px;
  padding: 14px;
  margin: 0px;
  height: 288px;
  background: ${({ theme }) => theme.accentTextDarkPrimary};
`

const MarginInfoWrapper = styled.div`
  margin-top: 24px;
`

const MarginInfoBox = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: ${({ theme }) => theme.accentTextLightSecondary};
  margin-bottom: 16px;
`

const UtilizationText = styled.span`
  font-size: 13px;
  font-weight: 300;
  color: rgb(106, 106, 109);
`

const UtilizationLine = styled.hr`
  width: 100%;
  height: 8px;
  border: none;
  border-top: 3px solid rgb(22, 22, 23);
`

const UtilizationBox = styled.div`
  display: flex;
  justify-content: space-between;
`

const Dotted = styled.span`
  font-size: 16px;
  line-height: 16px;
  color: rgb(76, 215, 244);
`

const MarginHealth = () => {
  return (
    <MarginHealthWrapper>
      <SubTitle>Margin Health</SubTitle>
      <UtilizationBox>
        <UtilizationText>IM Utilization</UtilizationText>
        <Dotted>---</Dotted>
      </UtilizationBox>
      <UtilizationLine />
      <UtilizationBox>
        <UtilizationText>MM Utilization</UtilizationText>
        <Dotted>---</Dotted>
      </UtilizationBox>
      <UtilizationLine />
      <MarginInfoWrapper>
        <MarginInfoBox>
          <span>Initial Margin Used</span>
          <span>$0.00</span>
        </MarginInfoBox>
        <MarginInfoBox>
          <span>Maintenance Margin Used</span>
          <span>$0.00</span>
        </MarginInfoBox>
        <MarginInfoBox>
          <span>Equity Balance</span>
          <span>$0.00</span>
        </MarginInfoBox>
        <MarginInfoBox>
          <span>Available Balance</span>
          <span>$0.00</span>
        </MarginInfoBox>
      </MarginInfoWrapper>
    </MarginHealthWrapper>
  )
}

export default MarginHealth
