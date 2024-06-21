import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import modalBG from '../About/images/AboutModalBG3.png'

export default function AboutModal() {
  return (
    <Wrapper>
      <img src={modalBG} width="600px" />
      <TextSection>
        <TextPoint>
          <ThemedText.DeprecatedLabel color="textSecondary">1. No Liquidations.</ThemedText.DeprecatedLabel>
          <ThemedText.SubHeaderSmall style={{ marginLeft: '18px' }}>
            No more forced price-based liquidations. No more maintenance margin. HODL ur levered position under any
            price action.
          </ThemedText.SubHeaderSmall>
        </TextPoint>
        <TextPoint>
          <ThemedText.DeprecatedLabel color="textSecondary">2. Limitless Pairs.</ThemedText.DeprecatedLabel>
          <ThemedText.SubHeaderSmall style={{ marginLeft: '18px' }}>
            Supports every possible assets/pairs with permissionless listing. Trade or leverage farm anything, including
            your favorite memecoins, with liquidation free leverage
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
            Free from oracle-based attacks, the largest attack vector in DeFi.{' '}
          </ThemedText.SubHeaderSmall>
        </TextPoint>
        <TextPoint>
          <ThemedText.DeprecatedLabel color="textSecondary">7. Positive sum dynamics.</ThemedText.DeprecatedLabel>
          <ThemedText.SubHeaderSmall style={{ marginLeft: '18px' }}>
            LPs are not trading against the trader. LPs earn yield regardless of the trader's PnL.
          </ThemedText.SubHeaderSmall>
        </TextPoint>
        <TextPoint>
          <ThemedText.DeprecatedLabel color="textSecondary">
            8. Extremely higher yields for LPs.
          </ThemedText.DeprecatedLabel>
          <ThemedText.SubHeaderSmall style={{ marginLeft: '18px' }}>
            We offer 5-10x more yield than Uniswap V3 from increased capital effiency.{' '}
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
