import styled from 'styled-components/macro'

import BTCButtons from './BTCButtons'
import { SubTitle } from './Overview'

const SceduleWrapper = styled.div`
  height: 344px;
  background: ${({ theme }) => theme.accentTextDarkPrimary};
  min-width: 1000px;
  padding: 16px;
  border-radius: 12px;
`

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-right: 10px;
`

const ArrowBtnWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 80px;
`
const ArrowBtn = styled.div`
  font-size: 20px;
  font-weight: 600;
  line-height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`

const Schedule = () => {
  return (
    <SceduleWrapper>
      <SubTitle>Options Exposure Schedule</SubTitle>
      <ButtonWrapper>
        <BTCButtons />
        <ArrowBtnWrapper>
          <ArrowBtn>{'<'}</ArrowBtn>
          <ArrowBtn>{'>'}</ArrowBtn>
        </ArrowBtnWrapper>
      </ButtonWrapper>
    </SceduleWrapper>
  )
}

export default Schedule
