import Modal from 'components/Modal'
import { useMemo, useState } from 'react'
import styled from 'styled-components/macro'
import { CloseIcon } from 'theme'
import { TraderPositionKey } from 'types/lmtv2position'

import DecreasePositionContent from './DecreasePositionContent'
import { DepositPremiumContent } from './DepositPremiumContent'
import { IncreasePositionContent } from './InreasePosition'
import { WithdrawPremiumContent } from './WithdrawPremiumContent'

interface TradeModalProps {
  isOpen: boolean
  selectedTab: TradeModalActiveTab | undefined
  positionKey: TraderPositionKey | undefined
  onClose: () => void
}

export enum TradeModalActiveTab {
  INCREASE_POSITION,
  DECREASE_POSITION,
  DEPOSIT_PREMIUM,
  WITHDRAW_PREMIUM,
}

const TabElement = styled.button<{ isActive: boolean; first?: boolean; last?: boolean }>`
  padding: 0;
  border: none;
  background: ${({ isActive, theme }) => (isActive ? theme.background : 'transparent')};
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  cursor: pointer;
  outline: none;
  border: ${({ theme }) => `1px solid ${theme.backgroundOutline}`};
  border-top-left-radius: ${({ first }) => (first ? '10px' : '0px')};
  border-bottom-left-radius: ${({ first }) => (first ? '10px' : '0px')};
  border-top-right-radius: ${({ last }) => (last ? '10px' : '0px')};
  border-bottom-right-radius: ${({ last }) => (last ? '10px' : '0px')};
`

const TabsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-direction: row;
`

const Wrapper = styled.div`
  padding: 1rem;
  padding-top: 0rem;
  background-color: ${({ theme }) => theme.backgroundSurface};
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`

export function LeveragePositionModal(props: TradeModalProps) {
  const { isOpen, positionKey, onClose } = props
  const [activeTab, setActiveTab] = useState<TradeModalActiveTab>(
    props.selectedTab ?? TradeModalActiveTab.INCREASE_POSITION
  )

  const displayedContent = useMemo(() => {
    if (!positionKey) return null
    return activeTab === TradeModalActiveTab.DECREASE_POSITION ? (
      <DecreasePositionContent positionKey={positionKey} />
    ) : activeTab === TradeModalActiveTab.DEPOSIT_PREMIUM ? (
      <DepositPremiumContent positionKey={positionKey} />
    ) : activeTab === TradeModalActiveTab.WITHDRAW_PREMIUM ? (
      <WithdrawPremiumContent positionKey={positionKey} />
    ) : (
      <DecreasePositionContent positionKey={positionKey} />
      // <IncreasePositionContent positionKey={positionKey} />
    )
  }, [positionKey, activeTab])

  return positionKey ? (
    <Modal isOpen={isOpen} maxHeight={1500} maxWidth={700} $scrollOverlay={true}>
      <CloseIcon onClick={onClose} />
      <Wrapper>
        <TabsWrapper>
          {/*<TabElement
            first={true}
            isActive={activeTab === TradeModalActiveTab.INCREASE_POSITION}
            onClick={() => setActiveTab(TradeModalActiveTab.INCREASE_POSITION)}
          >
            Increase Position
          </TabElement>*/}
          <TabElement
            isActive={activeTab === TradeModalActiveTab.DECREASE_POSITION}
            onClick={() => setActiveTab(TradeModalActiveTab.DECREASE_POSITION)}
          >
            Decrease Position
          </TabElement>
          <TabElement
            isActive={activeTab === TradeModalActiveTab.DEPOSIT_PREMIUM}
            onClick={() => setActiveTab(TradeModalActiveTab.DEPOSIT_PREMIUM)}
          >
            Deposit Premium
          </TabElement>
          <TabElement
            last={true}
            isActive={activeTab === TradeModalActiveTab.WITHDRAW_PREMIUM}
            onClick={() => setActiveTab(TradeModalActiveTab.WITHDRAW_PREMIUM)}
          >
            Withdraw Premium
          </TabElement>
        </TabsWrapper>
        <ContentWrapper>{displayedContent}</ContentWrapper>
      </Wrapper>
    </Modal>
  ) : null
}
