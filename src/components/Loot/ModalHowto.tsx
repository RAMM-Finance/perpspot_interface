import { FaqElement } from 'components/FAQ'
import { ArrowUpRight } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components/macro'

import { InfoDescription } from './InfoDescription'

const ModalHowToWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  border-radius: 10px;
  font-size: 0.8rem;
  gap: 7px;
  /* border-top: 3px solid ${({ theme }) => theme.searchOutline}; */
`
enum Option {
  Trade = 'trade',
  Earn = 'earn',
  Pairs = 'pairs',
  Referral = 'referral'
}

const ModalHowto = () => {
  const navigate = useNavigate()

  const handleOptionClick = (option: Option) => {
    if (option === 'trade') {
      navigate('/trade')
    } else if (option === 'earn') {
      navigate('/pools')
    } else if (option === 'pairs') {
      navigate('/tokens/base')
    } else if (option === 'referral') {
      navigate('/referral')
    }
  }
  return (
    <ModalHowToWrapper>
      <InfoDescription title={true} description="How to earn LMT" fontSize={18} spacing={-0.8} />
      <FaqElement onClick={() => handleOptionClick(Option.Trade)}>
        <InfoDescription description="Option1 - " fontSize={16} spacing={-0.8} />
        <InfoDescription description="Trade" fontSize={14} spacing={-0.8} color="textPrimary" />
        <ArrowUpRight size="18" />
      </FaqElement>
      <FaqElement onClick={() => handleOptionClick(Option.Earn)}>
        <InfoDescription description="Option2 - " fontSize={16} spacing={-0.8} />
        <InfoDescription description="Buy and hold LimWeth" fontSize={14} spacing={-0.8} color="textPrimary" />
        <ArrowUpRight size="18" />
      </FaqElement>
      <FaqElement onClick={() => handleOptionClick(Option.Pairs)}>
        <InfoDescription description="Option3 - " fontSize={16} spacing={-0.8} />
        <InfoDescription description="Provide LP directly to pools" fontSize={14} spacing={-0.8} color="textPrimary" />
        <ArrowUpRight size="16" />
      </FaqElement>
      <FaqElement onClick={() => handleOptionClick(Option.Referral)}>
        <InfoDescription description="Option4 - " fontSize={16} spacing={-0.8} />
        <InfoDescription description="Referral others" fontSize={14} spacing={-0.8} color="textPrimary" />
        <ArrowUpRight size="16" />
      </FaqElement>
    </ModalHowToWrapper>
  )
}

export default ModalHowto
