import { useState } from 'react'
import styled from 'styled-components/macro'

const ButtonWrapper = styled.div`
  display: flex;
  padding: 5px;
`

const BTCButton = styled.button<{ isActive?: boolean }>`
  height: 32px;
  border: none;
  border-radius: 20px;
  color: ${({ isActive, theme }) => (isActive ? theme.accentActive : theme.accentTextLightTertiary)};
  border: ${({ isActive, theme }) => (isActive ? '1px solid ' + theme.accentActive : 'none')};
  background: ${({ theme }) => theme.accentTextDarkPrimary};
  padding: 8px;
  white-space: nowrap;
  transition: all 0.2s ease-in-out 0s;
  font-size: 13px;
  font-weight: 500;
  width: 50px;
  justify-content: center;
  display: flex;
  align-items: center;
  margin-right: 15px;
  cursor: pointer;
`

const BTCButtons = () => {
  const [activeBTC, setActiveBTC] = useState(false)
  const [activeETC, setActiveETC] = useState(true)

  return (
    <ButtonWrapper>
      <BTCButton
        isActive={activeETC}
        onClick={() => {
          if (activeETC) return;
          setActiveETC(!activeETC)
          if (activeBTC) setActiveBTC(!activeBTC)
        }}
      >
        ETC
      </BTCButton>
      <BTCButton
        isActive={activeBTC}
        onClick={() => {
          if (activeBTC) return;
          setActiveBTC(!activeBTC)
          if (activeETC) setActiveETC(!activeETC)
        }}
      >
        BTC
      </BTCButton>
    </ButtonWrapper>
  )
}

export default BTCButtons
