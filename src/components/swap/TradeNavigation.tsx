import { ArrowRight } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import airdrop from '../../assets/images/airdrop.png'
import treasure from '../../assets/images/treasure.png'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`
const Arrow = styled(ArrowRight)`
  color: ${({ theme }) => theme.accentActive};
`
const Icon = styled.img`
  height: 30px;
  width: 30px;
  color: ${({ theme }) => theme.accentActive};
`
const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const TitleWrapper = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`
const Title = styled(ThemedText.DeprecatedLabel)`
  color: ${({ theme }) => theme.accentActive};
  font-size: 18px;
`

const Element = styled.div`
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: solid 1px ${({ theme }) => theme.backgroundOutline};
  padding: 10px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  :hover {
    ${Arrow} {
      transform: scale(1.3, 1.3);
    }
    ${Icon} {
      transform: scale(1.2, 1.2);
    }
    ${Title} {
      transform: scale(1.2, 1.2);
    }
  }
  :active: {
    border: solid 1px ${({ theme }) => theme.accentActive};
  }
`

const TradeNavigation = () => {
  const navigate = useNavigate()
  return (
    <Wrapper>
      <Element onClick={() => navigate('/leaderboard')}>
        <TextWrapper>
          <TitleWrapper>
            <Icon src={airdrop} />
            <Title>LMT</Title>
          </TitleWrapper>
          <ThemedText.BodySmall>Learn more about earning LMT from trading </ThemedText.BodySmall>
        </TextWrapper>
        <Arrow />
      </Element>
      <Element onClick={() => navigate('/airdrop')}>
        <TextWrapper>
          <TitleWrapper>
            <Icon src={treasure} />
            <Title>Airdrop</Title>
          </TitleWrapper>
          <ThemedText.BodySmall>Learn more about the AirDrop program </ThemedText.BodySmall>
        </TextWrapper>
        <Arrow />
      </Element>
    </Wrapper>
  )
}

export default TradeNavigation
