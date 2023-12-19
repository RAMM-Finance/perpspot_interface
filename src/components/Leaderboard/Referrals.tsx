import { SmallButtonPrimary } from 'components/Button'
import { InputSection } from 'pages/Swap'
import { OpacityHoverState } from 'pages/Swap/tradeModal'
import { useRef, useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

const Wrapper = styled.div`
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 10px;
  padding: 10px;
  height: 100%;
`
const FilterWrapper = styled.div`
  display: flex;
  align-items: start;
  margin-bottom: 6px;
`
const Filter = styled.div`
  display: flex;
  align-items: start;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  width: fit-content;
`
const Selector = styled.div<{ active: boolean }>`
  padding: 5px 7px;
  border-radius: 10px;
  background: ${({ active, theme }) => (active ? theme.background : 'none')};
  cursor: pointer;

  ${OpacityHoverState}
`

const StyledSelectorText = styled(ThemedText.BodySmall)<{ active: boolean }>`
  color: ${({ theme, active }) => (active ? theme.textSecondary : theme.textPrimary)};
`
const InputWrapper = styled(InputSection)`
  width: 95%;
  height: 750%;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  &:focus-within {
    border: 1px solid ${({ theme }) => theme.backgroundOutline};
  }
`

const Input = styled.input`
  margin-bottom: 10px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.surface1};
  border-radius: 10px;
  line-height: 25px;
  width: 80%;
  &:focus {
    outline: 1px solid ${({ theme }) => theme.accentActive};
  }
  color: white;
`

const Referrals = () => {
  const [referral, setReferral] = useState<boolean>(false)
  //referral code value
  const [referralCode, setReferralCode] = useState<HTMLInputElement | string>()
  //generate code
  const [createReferralCode, setCreateReferralCode] = useState<HTMLInputElement | string>()

  console.log('referralCode', referralCode)
  console.log('createReferralCode', createReferralCode)

  const userRef = useRef<HTMLInputElement>(null)
  const referralRef = useRef<HTMLInputElement>(null)

  const onButtonClick = () => {
    if (referral) {
      setReferralCode(() => userRef?.current?.value)
    } else {
      setCreateReferralCode(() => referralRef?.current?.value)
    }
  }

  return (
    <Wrapper>
      <FilterWrapper>
        <Filter onClick={() => setReferral(!referral)}>
          <Selector active={!referral}>
            <StyledSelectorText lineHeight="20px" active={!referral}>
              User
            </StyledSelectorText>
          </Selector>
          <Selector active={referral}>
            <StyledSelectorText lineHeight="20px" active={referral}>
              Referrer
            </StyledSelectorText>
          </Selector>
        </Filter>
      </FilterWrapper>
      <InputWrapper>
        {referral ? (
          <>
            <ThemedText.BodyPrimary
              style={{ textAlign: 'center', paddingTop: '5px', paddingBottom: '15px' }}
              fontSize={16}
              fontWeight={800}
            >
              Enter Referral Code
            </ThemedText.BodyPrimary>
            <ThemedText.BodyPrimary style={{ paddingBottom: '15px' }}>
              Please input referral code to benefit from fee discounts.
            </ThemedText.BodyPrimary>
            <Input placeholder=" Enter referral code" id="refferal-code" ref={userRef}></Input>
            <SmallButtonPrimary onClick={onButtonClick}>Enter Code</SmallButtonPrimary>
          </>
        ) : (
          <>
            <ThemedText.BodyPrimary
              style={{ textAlign: 'center', paddingTop: '5px', paddingBottom: '15px' }}
              fontSize={16}
              fontWeight={800}
            >
              Generate Referral Code
            </ThemedText.BodyPrimary>
            <ThemedText.BodyPrimary style={{ paddingBottom: '15px' }}>
              Looks like you don't have a referral code to share. Create a new one and start earning rebates!
            </ThemedText.BodyPrimary>
            <Input placeholder=" Enter referral code" id="refferal-code" ref={referralRef}></Input>
            <SmallButtonPrimary onClick={onButtonClick}>Enter Code</SmallButtonPrimary>
          </>
        )}
      </InputWrapper>
    </Wrapper>
  )
}

export default Referrals
