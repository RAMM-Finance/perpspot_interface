import styled from 'styled-components/macro'

import dollarIcon from '../About/images/aboutDollarDark.png'
import BTCButtons from './BTCButtons'
import { SubTitle } from './Overview'

const GreeksWrapper = styled.div`
  min-width: 500px;
  border-radius: 12px;
  padding: 14px;
  margin: 0px;
  height: 288px;
  background: ${({ theme }) => theme.accentTextDarkPrimary};
  flex-wrap: nowrap;
  overflow: hidden;
`

const BTCOptionWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 15px;
`

const BTCOptionBox = styled.div`
  display: flex;
  background-color: rgb(30, 30, 36);
  border-radius: 12px;
  height: 48px;
  padding: 0px 8px;
  width: 200px;
  align-items: center;
`

const BTCIcon = styled.img`
  background-color: rgba(255, 255, 255, 0.04);
  width: 16px;
  height: 16px;
  text-align: center;
  border-radius: 8px;
  display: flex;
  color: rgb(165, 165, 168);
  justify-content: center;
  margin-right: 8px;
`
const BTCLabel = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 5px;
  font-size: 12px;
  /* color: ${({ theme }) => theme.accentTextLightPrimary}; */
`

const Dotted = styled.span`
  font-size: 24px;
  line-height: 16px;
  color: ${({ theme }) => theme.accentTextLightPrimary}; ;
`

const Greeks = () => {
  return (
    <GreeksWrapper>
      <SubTitle>Greeks</SubTitle>
      <BTCButtons />
      <BTCOptionWrapper>
        <BTCOptionBox>
          <BTCIcon src={dollarIcon} alt="BTCIcon" />
          <BTCLabel>
            <span>Delta</span>
            <Dotted>---</Dotted>
          </BTCLabel>
        </BTCOptionBox>
        <BTCOptionBox>
          <BTCIcon src={dollarIcon} alt="BTCIcon" />
          <BTCLabel>
            <span>Vega</span>
            <Dotted>---</Dotted>
          </BTCLabel>
        </BTCOptionBox>
        <BTCOptionBox>
          <BTCIcon src={dollarIcon} alt="BTCIcon" />
          <BTCLabel>
            <span>Gamma</span>
            <Dotted>---</Dotted>
          </BTCLabel>
        </BTCOptionBox>
        <BTCOptionBox>
          <BTCIcon src={dollarIcon} alt="BTCIcon" />
          <BTCLabel>
            <span>Rho</span>
            <Dotted>---</Dotted>
          </BTCLabel>
        </BTCOptionBox>
        <BTCOptionBox>
          <BTCIcon src={dollarIcon} alt="BTCIcon" />
          <BTCLabel>
            <span>Theta</span>
            <Dotted>---</Dotted>
          </BTCLabel>
        </BTCOptionBox>
      </BTCOptionWrapper>
    </GreeksWrapper>
  )
}

export default Greeks
