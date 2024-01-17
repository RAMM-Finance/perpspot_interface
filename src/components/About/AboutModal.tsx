import React, { useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import modalBG from '../About/images/AboutModalBG2.png'

const StyledTabIndicator = styled.div<{ tabCount: any; offset: any; duration: any }>`
  position: absolute;
  width: ${({ tabCount }) => 100 / tabCount}%;
  top: 100%;
  left: 0;

  transform: translate(${({ offset }) => offset}, -100%);

  transition: transform ${({ duration }) => duration}ms;

  border-top-style: solid;
  border-top-width: 1px;
`

const StyledTab = styled.li<{ isFocused: any }>`
  flex: 1;
  height: 100%;

  button {
    cursor: pointer;
    transition: color 0.3s;
    color: ${({ isFocused }) => (isFocused ? '#000' : '#777')};
    border: none;
    width: 100%;
    height: 100%;

    background-color: rgba(0, 0, 0, 0);
  }
`

const Tab = ({ title, onClick, isFocused }: { title?: any; onClick?: () => void; isFocused?: any }) => {
  return (
    <StyledTab onClick={onClick} isFocused={isFocused}>
      <button>{title}</button>
    </StyledTab>
  )
}

const StyledTabs = styled.div`
  position: relative;
  list-style: none;
  height: 30px;
  display: flex;
  width: 100%;
`

const Tabs = ({
  focusedIdx,
  children,
  onChange,
  duration = 300,
}: {
  focusedIdx: any
  children: any
  onChange: (i: any) => void
  duration?: any
}) => {
  return (
    <StyledTabs>
      {React.Children.map(children, (child, i) =>
        React.cloneElement(child, {
          key: i,
          isFocused: focusedIdx === i,
          onClick: (e: any) => {
            onChange(i)
          },
        })
      )}
      <StyledTabIndicator duration={duration} tabCount={children.length} offset={`${100 * focusedIdx}%`} />
    </StyledTabs>
  )
}
const StyledOuterSliders = styled.div`
  overflow: hidden;
`
const StyledSliders = styled.div<{ offset: any; duration: any }>`
  display: flex;
  flex-wrap: no-wrap;
  width: 100%;

  transform: translateX(${({ offset }) => `${offset}%`});
  transition: transform ${({ duration }) => duration}ms;

  div {
    flex-shrink: 0;
    width: 100%;
  }
`

const Sliders = ({ focusedIdx, children, duration = 300 }: { focusedIdx: any; children?: any; duration?: any }) => {
  const offset = -100 * focusedIdx

  return (
    <StyledOuterSliders>
      <StyledSliders offset={offset} duration={duration}>
        {children}
      </StyledSliders>
    </StyledOuterSliders>
  )
}

const Pane1 = () => {
  return <div style={{ textAlign: 'center' }}>1</div>
}
const Pane2 = () => {
  return <div>2</div>
}
const Pane3 = () => {
  return <div>3</div>
}

export default function AboutModal() {
  const [focusedIdx, setFocusedIdx] = useState(0)

  // return (
  //   <div style={{ width: '100%', padding: '30px' }}>
  //     <Sliders focusedIdx={focusedIdx}>
  //       <Pane1 />
  //       <Pane2 />
  //       <Pane3 />
  //     </Sliders>
  //     <Tabs focusedIdx={focusedIdx} onChange={setFocusedIdx}>
  //       <Tab title={<ThemedText.BodySecondary>Tab 1</ThemedText.BodySecondary>} />
  //       <Tab title={<ThemedText.BodySecondary>Tab 2</ThemedText.BodySecondary>} />
  //       <Tab title={<ThemedText.BodySecondary>Tab 3</ThemedText.BodySecondary>} />
  //     </Tabs>
  //   </div>
  // )

  return (
    <Wrapper>
      <img src={modalBG} width="600px" />
      <TextSection>
        <TextPoint>
          <ThemedText.DeprecatedLabel color="textSecondary">1. No Liquidations.</ThemedText.DeprecatedLabel>
          <ThemedText.SubHeaderSmall style={{ marginLeft: '18px' }}>
            No more forced price-based liquidations. HODL ur levered position under any price action.
          </ThemedText.SubHeaderSmall>
        </TextPoint>
        <TextPoint>
          <ThemedText.DeprecatedLabel color="textSecondary">2. Limitless Pairs.</ThemedText.DeprecatedLabel>
          <ThemedText.SubHeaderSmall style={{ marginLeft: '18px' }}>
            Supports every possible asset on chain. Permissionless listing(coming soon).
          </ThemedText.SubHeaderSmall>
        </TextPoint>
        <TextPoint>
          <ThemedText.DeprecatedLabel color="textSecondary">3. Extremely high leverage.</ThemedText.DeprecatedLabel>
          <ThemedText.SubHeaderSmall style={{ marginLeft: '18px' }}>
            Up to 100x liquidation-free leverage on any pairs.
          </ThemedText.SubHeaderSmall>
        </TextPoint>
        <TextPoint>
          <ThemedText.DeprecatedLabel color="textSecondary">
            4. Leveraged limit orders for every pair.
          </ThemedText.DeprecatedLabel>
        </TextPoint>
        <TextPoint>
          <ThemedText.DeprecatedLabel color="textSecondary">5. Unlimited liquidity.</ThemedText.DeprecatedLabel>
          <ThemedText.SubHeaderSmall style={{ marginLeft: '18px' }}>
            Trade against the entire chain, not just one protocol, for best execution.{' '}
          </ThemedText.SubHeaderSmall>
        </TextPoint>
        <TextPoint>
          <ThemedText.DeprecatedLabel color="textSecondary">6. No oracles.</ThemedText.DeprecatedLabel>
          <ThemedText.SubHeaderSmall style={{ marginLeft: '18px' }}>
            Free from oracle-based attacks, which is the largest attack vector in DeFi.{' '}
          </ThemedText.SubHeaderSmall>
        </TextPoint>
        <TextPoint>
          <ThemedText.DeprecatedLabel color="textSecondary">7. Positive sum dynamics.</ThemedText.DeprecatedLabel>
          <ThemedText.SubHeaderSmall style={{ marginLeft: '18px' }}>
            LPs are not trading against the trader. LPs earn yield regardless of whether the trader is losing or
            winning.
          </ThemedText.SubHeaderSmall>
        </TextPoint>
        <TextPoint>
          <ThemedText.DeprecatedLabel color="textSecondary">
            8. Extremely higher yields for LPs.
          </ThemedText.DeprecatedLabel>
          <ThemedText.SubHeaderSmall style={{ marginLeft: '18px' }}>
            5-10x more yields than the same pair in Uniswap V3. Choose between simple and customized LPing.{' '}
          </ThemedText.SubHeaderSmall>
        </TextPoint>
      </TextSection>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  padding: 50px;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  background: #000;
`

const TextSection = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  width: 100%;
  margin-top: 20px;
  gap: 15px;
`

const TextPoint = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`
