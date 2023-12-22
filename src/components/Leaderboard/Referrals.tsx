import { SmallButtonPrimary } from 'components/Button'
import { InputSection } from 'pages/Swap'
import { Filter, FilterWrapper, Selector, StyledSelectorText } from 'pages/Swap/tradeModal'
import { useMemo, useRef, useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 10px;
  padding: 10px;
`

const InputWrapper = styled(InputSection)`
  width: 95%;
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
  //generate code
  const [createReferralCode, setCreateReferralCode] = useState<HTMLInputElement | string>()
  //referral code value
  const [referralCode, setReferralCode] = useState<HTMLInputElement | string>()

  console.log('createReferralCode', createReferralCode)
  console.log('referralCode', referralCode)

  const acceptedCreate = useMemo(() => {
    if (createReferralCode === 'limitless') {
      return true
    } else {
      return false
    }
  }, [createReferralCode])

  const acceptedCode = useMemo(() => {
    if (referralCode === 'limitless') {
      return true
    } else {
      return false
    }
  }, [referralCode])

  const userRef = useRef<HTMLInputElement>(null)
  const referralRef = useRef<HTMLInputElement>(null)

  const onButtonClick = () => {
    if (referral) {
      setCreateReferralCode(() => userRef?.current?.value)
    } else {
      setReferralCode(() => referralRef?.current?.value)
    }
  }

  return (
    <Wrapper>
      <FilterWrapper>
        <Filter onClick={() => setReferral(!referral)}>
          <Selector active={referral}>
            <StyledSelectorText lineHeight="20px" active={referral}>
              User
            </StyledSelectorText>
          </Selector>
          <Selector active={!referral}>
            <StyledSelectorText lineHeight="20px" active={!referral}>
              Referrer
            </StyledSelectorText>
          </Selector>
        </Filter>
      </FilterWrapper>
      {referral && !acceptedCreate && (
        <InputWrapper>
          <ThemedText.BodyPrimary
            style={{ textAlign: 'center', paddingTop: '5px', paddingBottom: '15px' }}
            fontSize={16}
            fontWeight={800}
          >
            Generate Referral Code
          </ThemedText.BodyPrimary>
          <ThemedText.BodyPrimary style={{ paddingBottom: '15px', paddingLeft: '30px', paddingRight: '30px' }}>
            Looks like you don't have a referral code to share. Create a new one and start earning rebates!
          </ThemedText.BodyPrimary>
          <Input placeholder="Create referral code" id="refferal-code" ref={userRef}></Input>
          <SmallButtonPrimary onClick={onButtonClick}>Enter Code</SmallButtonPrimary>
        </InputWrapper>
      )}{' '}
      {!referral && !acceptedCode && (
        <InputWrapper>
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
          <Input placeholder=" Enter referral code" id="refferal-code" ref={referralRef}></Input>
          <SmallButtonPrimary onClick={onButtonClick}>Enter Code</SmallButtonPrimary>
        </InputWrapper>
      )}
      {referral && acceptedCreate && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr ', gap: '10px' }}>
            <StyledCard>
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '15px' }}
              >
                <ThemedText.BodySmall>Traders Referred</ThemedText.BodySmall>
                <ThemedText.BodyPrimary>0</ThemedText.BodyPrimary>
              </div>
            </StyledCard>
            <StyledCard>
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '15px' }}
              >
                <ThemedText.BodySmall> Trading Volume</ThemedText.BodySmall>
                <ThemedText.BodyPrimary>$0.00</ThemedText.BodyPrimary>
              </div>
            </StyledCard>
            <StyledCard>
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '15px' }}
              >
                <ThemedText.BodySmall> Rebates</ThemedText.BodySmall>
                <ThemedText.BodyPrimary>$0.00</ThemedText.BodyPrimary>
              </div>
            </StyledCard>
            <StyledCard>
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '15px' }}
              >
                <ThemedText.BodySmall>Claimable Rebates</ThemedText.BodySmall>
                <ThemedText.BodyPrimary>$0.0000</ThemedText.BodyPrimary>
              </div>
            </StyledCard>{' '}
          </div>
          <StyledCard style={{ padding: '15px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: 'solid 1px gray',
                paddingBottom: '10px',
                alignItems: 'center',
              }}
            >
              <ThemedText.BodySmall>Referral Codes: Tier 1 (5% Rebate)</ThemedText.BodySmall>{' '}
              <SmallButtonPrimary>Create</SmallButtonPrimary>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
              <div style={{ display: 'flex', gap: '5px', justifyContent: 'start', padding: '10px' }}>
                <ThemedText.BodySmall>Referral Code:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">12431-341341</ThemedText.BodySmall>
              </div>
              <div style={{ display: 'flex', gap: '5px', justifyContent: 'start', padding: '10px' }}>
                <ThemedText.BodySmall>Total Volume:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">12431-341341</ThemedText.BodySmall>
              </div>
              <div style={{ display: 'flex', gap: '5px', justifyContent: 'start', padding: '10px' }}>
                <ThemedText.BodySmall>Traders Referred:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">12431-341341</ThemedText.BodySmall>
              </div>
              <div style={{ display: 'flex', gap: '5px', justifyContent: 'start', padding: '10px' }}>
                <ThemedText.BodySmall>Total Rebates:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">12431-341341</ThemedText.BodySmall>
              </div>
            </div>
          </StyledCard>
          <StyledCard style={{ display: 'flex', justifyContent: 'center', padding: '25px' }}>
            <ThemedText.BodySmall>No rebates distribution history yet.</ThemedText.BodySmall>
          </StyledCard>
        </div>
      )}
      {!referral && acceptedCode && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr ', gap: '10px' }}>
            <StyledCard>
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '15px' }}
              >
                <ThemedText.BodySmall>Active Referral Code</ThemedText.BodySmall>
                <ThemedText.BodyPrimary>12314-134dd-1244</ThemedText.BodyPrimary>
              </div>
            </StyledCard>
            <StyledCard>
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '15px' }}
              >
                <ThemedText.BodySmall> Trading Volume</ThemedText.BodySmall>
                <ThemedText.BodyPrimary>$0.00</ThemedText.BodyPrimary>
              </div>
            </StyledCard>
            <StyledCard>
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '15px' }}
              >
                <ThemedText.BodySmall> Rebates</ThemedText.BodySmall>
                <ThemedText.BodyPrimary>$0.00</ThemedText.BodyPrimary>
              </div>
            </StyledCard>
          </div>
          <StyledCard style={{ padding: '15px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'start',
                borderBottom: 'solid 1px gray',
                paddingBottom: '10px',
                paddingLeft: '10px',
                alignItems: 'center',
              }}
            >
              <ThemedText.BodySmall>Rebates Distribution History</ThemedText.BodySmall>{' '}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
              <div style={{ display: 'flex', gap: '5px', justifyContent: 'start', padding: '10px' }}>
                <ThemedText.BodySmall>Date:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">{Date.now()}</ThemedText.BodySmall>
              </div>
              <div style={{ display: 'flex', gap: '5px', justifyContent: 'start', padding: '10px' }}>
                <ThemedText.BodySmall>Type:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">V1 Airdrop</ThemedText.BodySmall>
              </div>
              <div style={{ display: 'flex', gap: '5px', justifyContent: 'start', padding: '10px' }}>
                <ThemedText.BodySmall>Amount:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">$5.12</ThemedText.BodySmall>
              </div>
              <div style={{ display: 'flex', gap: '5px', justifyContent: 'start', padding: '10px' }}>
                <ThemedText.BodySmall>Transaction:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">0x233143514313</ThemedText.BodySmall>
              </div>
            </div>
          </StyledCard>
        </div>
      )}
    </Wrapper>
  )
}

export default Referrals

const UserActiveWrapper = styled.div``

const ReferrerActiveWrapper = styled.div``

const StyledCard = styled.div`
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.surface1};
  border-radius: 10px;
`
