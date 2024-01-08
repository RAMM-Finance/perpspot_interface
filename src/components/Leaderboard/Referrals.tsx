import { defaultAbiCoder } from '@ethersproject/abi'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { useWeb3React } from '@web3-react/core'
import { SmallButtonPrimary } from 'components/Button'
import { ethers } from 'ethers'
import { useReferralContract } from 'hooks/useContract'
import { InputSection } from 'pages/Swap'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { usePointsData } from './data'
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  margin-top: 10px;
  padding: 10px;
`

const InputWrapper = styled(InputSection)`
  background: none;
  border: none;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  &:focus-within {
    border: none;
  }
`

const Input = styled.input`
  margin-bottom: 10px;
  max-width: 400px;
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

const Filter = styled.div`
  display: flex;
  align-items: end;
  width: fit-content;
  gap: 10px;
`

const FilterWrapper = styled.div`
  display: flex;
`

const StyledSelectorText = styled.div<{ active: boolean }>`
  font-size: 14px;
  color: ${({ theme, active }) => (active ? theme.textSecondary : theme.textPrimary)};
  font-weight: ${({ active }) => (active ? '600' : '300')};
`

const Selector = styled.div<{ active: boolean }>`
  margin-bottom: -1px;
  z-index: 3;
  font-color: ${({ active, theme }) => (active ? theme.background : 'none')};
  border-radius: 10px 10px 0 0;
  border-top: 1px solid ${({ active, theme }) => (active ? theme.backgroundOutline : 'none')};
  border-right: 1px solid ${({ active, theme }) => (active ? theme.backgroundOutline : 'none')};
  border-left: 1px solid ${({ active, theme }) => (active ? theme.backgroundOutline : 'none')};

  padding: 8px 12px 8px 12px;
  background-color: ${({ active, theme }) => (active ? theme.surface1 : 'none')};
  cursor: pointer;
  &:hover {
    opacity: ${({ theme }) => theme.opacity.hover};
  }
`

const Referrals = () => {
  const { refereeActivity, tradeProcessedByTrader, lpPositionsByUniqueLps } = usePointsData()
  console.log('refereeActivity', refereeActivity, tradeProcessedByTrader, lpPositionsByUniqueLps)

  const [referral, setReferral] = useState<boolean>(false)
  //generate code
  const [createReferralCode, setCreateReferralCode] = useState<HTMLInputElement | string>()
  //referral code value
  const [referralCode, setReferralCode] = useState<HTMLInputElement | string>()
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState<string>()
  const [errorMessage, setErrorMessage] = useState<string>()
  const addTransaction = useTransactionAdder()
  const { account, chainId, provider } = useWeb3React()

  console.log('createReferralCode', createReferralCode)
  console.log('referralCode', referralCode)

  const acceptedCreate = useMemo(() => {
    if (createReferralCode) {
      return true
    } else {
      return false
    }
  }, [createReferralCode])

  const acceptedCode = useMemo(() => {
    if (referralCode && Number(referralCode) > 0) {
      return true
    } else {
      return false
    }
  }, [referralCode])

  const userRef = useRef<HTMLInputElement>(null)
  const referralRef = useRef<HTMLInputElement>(null)

  const [refGen, setRefGen] = useState('0')
  const [ref, setRef] = useState('0')

  const handleUserRefChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRefGen(event.target.value)
  }

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRef(event.target.value)
  }

  const onButtonClick = () => {
    if (referral) {
      setCreateReferralCode(() => userRef?.current?.value)
    } else {
      setReferralCode(() => referralRef?.current?.value)
    }
  }

  const referralContract = useReferralContract()
  const [activeCodes, setActiveCodes] = useState<string>()

  useEffect(() => {
    if (!account || !referralContract) return

    const call = async () => {
      try {
        const result = await referralContract.codesByOwners(account, 0)
        const decoded = defaultAbiCoder.decode(['uint256'], result)
        setActiveCodes(decoded.toString())
        setCreateReferralCode(() => decoded.toString())
      } catch (error) {
        setActiveCodes(undefined)
        setCreateReferralCode(undefined)
        console.log('codebyowners err')
      }
    }

    call()
  }, [account])

  console.log('active codes', activeCodes)

  const [codeExists, setCodeExists] = useState(false)

  useEffect(() => {
    const code = referral
      ? ref
        ? defaultAbiCoder.encode(['uint256'], [ref]).toString()
        : undefined
      : refGen
      ? defaultAbiCoder.encode(['uint256'], [refGen]).toString()
      : undefined
    if (!account || !code || !referralContract) return

    const call = async () => {
      try {
        console.log('code', code, referral ? refGen : ref)
        const result = await referralContract.codeOwners(code)
        console.log('owner', result)
        setCodeExists(result != '0x0000000000000000000000000000000000000000')
      } catch (error) {
        console.log('codeowner err', error)
      }
    }

    call()
  }, [refGen, ref, account])
  console.log('code exists', codeExists)

  const [codeUsing, setCodeUsing] = useState(false)

  useEffect(() => {
    if (!account || !referralContract) return

    const call = async () => {
      try {
        const result = await referralContract.userReferralCodes(account)
        setCodeUsing(result != ethers.constants.HashZero)
        setReferralCode(() => defaultAbiCoder.decode(['uint256'], result).toString())
      } catch (error) {
        console.log('codeowner err')
      }
    }

    call()
  }, [account])

  const callback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      console.log('what', refGen)
      const bytes32 = defaultAbiCoder.encode(['uint256'], [refGen]).toString()
      const response = await referralContract?.registerCode(bytes32)
      return response as TransactionResponse
    } catch (err) {
      throw new Error('reff')
    }
  }, [account, chainId, referral, provider, refGen])

  const useCodeCallback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      const bytes32 = defaultAbiCoder.encode(['uint256'], [ref]).toString()
      const response = await referralContract?.setReferralCodeByUser(bytes32)
      return response as TransactionResponse
    } catch (err) {
      console.log('referr', err)
      throw new Error('reff')
    }
  }, [account, chainId, referral, provider, ref])

  console.log('CREATE REF CODE', createReferralCode)

  const handleCreateReferral = useCallback(() => {
    if (!refGen || !account || !referralContract || !chainId || !provider) {
      return
    }

    setAttemptingTxn(true)

    callback()
      .then((response) => {
        console.log('RES', response)
        setAttemptingTxn(false)
        setTxHash(response?.hash)
        setErrorMessage(undefined)
        addTransaction(response, {
          type: TransactionType.CREATE_REFERRAL,
          inputCurrencyId: '',
          outputCurrencyId: '',
        })
        return response.hash
      })
      .catch((error) => {
        console.error('referrr', error)
        setAttemptingTxn(false)
        setTxHash(undefined)
        setErrorMessage(error.message)
      })
  }, [callback, account, referralContract, chainId, provider, userRef, txHash, attemptingTxn, errorMessage])

  const handleUseCode = useCallback(() => {
    if (!ref || !account || !referralContract || !chainId || !provider) {
      return
    }
    setAttemptingTxn(true)
    useCodeCallback()
      .then((response) => {
        setAttemptingTxn(false)
        setTxHash(response?.hash)
        setErrorMessage(undefined)
        addTransaction(response, {
          type: TransactionType.USE_REFERRAL,
          inputCurrencyId: '',
          outputCurrencyId: '',
        })
        return response.hash
      })
      .catch((error) => {
        console.error('referrr', error)
        setAttemptingTxn(false)
        setTxHash(undefined)
        setErrorMessage(error.message)
      })
  }, [useCodeCallback, account, referralContract, chainId, provider, ref, txHash, attemptingTxn, errorMessage])

  const totalCollected = useMemo(() => {
    if (!account || !lpPositionsByUniqueLps) return 0
    let totalAmount = 0
    lpPositionsByUniqueLps?.[account]?.forEach((entry: any) => {
      totalAmount += entry.amount0Collected
      totalAmount += entry.amount1Collected
    })
    return totalAmount
  }, [lpPositionsByUniqueLps, account])

  const tradingVolume = useMemo(() => {
    if (!account || !tradeProcessedByTrader) return 0
    if (!tradeProcessedByTrader[account]) return 0
    else return tradeProcessedByTrader[account].amount
  }, [tradeProcessedByTrader, account])

  return (
    <Wrapper>
      <FilterWrapper>
        <Filter onClick={() => setReferral(!referral)}>
          <Selector active={referral}>
            <StyledSelectorText active={referral}>User</StyledSelectorText>
          </Selector>
          <Selector active={!referral}>
            <StyledSelectorText active={!referral}>Referrer</StyledSelectorText>
          </Selector>
        </Filter>
      </FilterWrapper>
      <ContentWrapper active={referral}>
        {!referral && !acceptedCode && (
          <InputWrapper>
            <ThemedText.BodySecondary
              style={{ textAlign: 'center', paddingTop: '5px', paddingBottom: '15px' }}
              fontSize={16}
              fontWeight={800}
            >
              Generate Referral Code
            </ThemedText.BodySecondary>
            <ThemedText.BodyPrimary style={{ paddingBottom: '15px', paddingLeft: '30px', paddingRight: '30px' }}>
              Looks like you don't have a referral code to share. Create a new one and start earning rebates!
            </ThemedText.BodyPrimary>
            <Input
              placeholder="Create referral code"
              id="refferal-code"
              ref={referralRef}
              onChange={handleUserRefChange}
            ></Input>
            {codeExists && <SmallButtonPrimary>Code taken</SmallButtonPrimary>}
            {!codeExists && <SmallButtonPrimary onClick={handleCreateReferral}>Generate Code</SmallButtonPrimary>}
          </InputWrapper>
        )}{' '}
        {referral && !acceptedCode && (
          <InputWrapper>
            <ThemedText.BodySecondary
              style={{ textAlign: 'center', paddingTop: '5px', paddingBottom: '15px' }}
              fontSize={16}
              fontWeight={800}
            >
              Enter Referral Code
            </ThemedText.BodySecondary>
            <ThemedText.BodyPrimary style={{ paddingBottom: '15px' }}>
              Enter a referral code to benefit from fee discounts.
            </ThemedText.BodyPrimary>
            <Input
              placeholder=" Enter referral code"
              id="refferal-code"
              ref={userRef}
              onChange={handleCodeChange}
            ></Input>
            {codeExists ? (
              <SmallButtonPrimary onClick={handleUseCode}>Use Code</SmallButtonPrimary>
            ) : (
              <SmallButtonPrimary altDisabledStyle={true}>Code does not exist</SmallButtonPrimary>
            )}
          </InputWrapper>
        )}
        {!referral && acceptedCreate && (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '10px', padding: '40px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'start',
                paddingBottom: '10px',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <ThemedText.BodySecondary fontSize={16}>Tier: </ThemedText.BodySecondary>
              <ThemedText.BodyPrimary fontSize={16} color="accentActive">
                Tier {refereeActivity && account && refereeActivity[account]?.tier.toString()}
              </ThemedText.BodyPrimary>{' '}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr ', gap: '10px' }}>
              <StyledCard>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '15px',
                  }}
                >
                  <ThemedText.BodySecondary>Users Referred</ThemedText.BodySecondary>
                  <ThemedText.BodyPrimary fontSize={16} color="accentActive">
                    {refereeActivity && account && refereeActivity[account]?.usersReferred}
                  </ThemedText.BodyPrimary>
                </div>
              </StyledCard>
              <StyledCard>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '15px',
                  }}
                >
                  <ThemedText.BodySecondary>Volume by Referees </ThemedText.BodySecondary>
                  <ThemedText.BodyPrimary fontSize={16} color="accentActive">
                    ${refereeActivity && account && refereeActivity[account]?.tradeVolume}
                  </ThemedText.BodyPrimary>
                </div>
              </StyledCard>
              <StyledCard>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '15px',
                  }}
                >
                  <ThemedText.BodySecondary>My Total Referral Points</ThemedText.BodySecondary>
                  <ThemedText.BodyPrimary fontSize={16} color="accentActive">
                    {refereeActivity && account && refereeActivity[account]?.point}
                  </ThemedText.BodyPrimary>
                </div>
              </StyledCard>
              <StyledCard>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '15px',
                  }}
                >
                  <ThemedText.BodySecondary>Fees earned by Referees</ThemedText.BodySecondary>
                  <ThemedText.BodyPrimary fontSize={16} color="accentActive">
                    ${refereeActivity && account && refereeActivity[account]?.lpAmount}
                  </ThemedText.BodyPrimary>
                </div>
              </StyledCard>
              <StyledCard>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '15px',
                  }}
                >
                  <ThemedText.BodySecondary> Rebates</ThemedText.BodySecondary>
                  <ThemedText.BodyPrimary fontSize={16} color="accentActive">
                    $0.00
                  </ThemedText.BodyPrimary>
                </div>
              </StyledCard>
              <StyledCard>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '15px',
                  }}
                >
                  <ThemedText.BodySecondary>Claimable Rebates</ThemedText.BodySecondary>
                  <ThemedText.BodyPrimary fontSize={16} color="accentActive">
                    $0.0000
                  </ThemedText.BodyPrimary>
                </div>
              </StyledCard>{' '}
            </div>
            {/* <StyledCard style={{ padding: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
              <div style={{ display: 'flex', gap: '5px', justifyContent: 'start', padding: '10px' }}>
                <ThemedText.BodySmall>Referral Code:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">{activeCodes}</ThemedText.BodySmall>
              </div>
              <div style={{ display: 'flex', gap: '5px', justifyContent: 'start', padding: '10px' }}>
                <ThemedText.BodySmall>Total Referee Volume:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">12431-341341</ThemedText.BodySmall>
              </div>
              <div style={{ display: 'flex', gap: '5px', justifyContent: 'start', padding: '10px' }}>
                <ThemedText.BodySmall>Traders Referred:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">12431-341341</ThemedText.BodySmall>
              </div>
              <div style={{ display: 'flex', gap: '5px', justifyContent: 'start', padding: '10px' }}>
                <ThemedText.BodySmall>Fees from referees:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">12431-341341</ThemedText.BodySmall>
              </div>
              <div style={{ display: 'flex', gap: '5px', justifyContent: 'start', padding: '10px' }}>
                <ThemedText.BodySmall>LPs Referred:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">12431-341341</ThemedText.BodySmall>
              </div>

              <div style={{ display: 'flex', gap: '5px', justifyContent: 'start', padding: '10px' }}>
                <ThemedText.BodySmall>Total Rebates:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">12431-341341</ThemedText.BodySmall>
              </div>
            </div>
            </StyledCard> */}
            <StyledCard style={{ display: 'flex', justifyContent: 'center', padding: '25px', marginTop: '50px' }}>
              <ThemedText.BodySmall>No rebates distribution history yet.</ThemedText.BodySmall>
            </StyledCard>
          </div>
        )}
        {referral && acceptedCode && (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '10px', padding: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <StyledCard>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '15px',
                  }}
                >
                  <ThemedText.BodySecondary>Active Referral Code</ThemedText.BodySecondary>
                  <ThemedText.BodyPrimary fontSize={16} color="accentActive">
                    {referralCode?.toString()}
                  </ThemedText.BodyPrimary>
                </div>
              </StyledCard>
              <StyledCard>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '15px',
                  }}
                >
                  <ThemedText.BodySecondary>Trading Volume</ThemedText.BodySecondary>
                  <ThemedText.BodyPrimary fontSize={16} color="accentActive">
                    ${tradingVolume?.toString()}
                  </ThemedText.BodyPrimary>
                </div>
              </StyledCard>
              <StyledCard>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '15px',
                  }}
                >
                  <ThemedText.BodySecondary>LP Fee Collected</ThemedText.BodySecondary>
                  <ThemedText.BodyPrimary fontSize={16} color="accentActive">
                    ${totalCollected}
                  </ThemedText.BodyPrimary>
                </div>
              </StyledCard>

              <StyledCard>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '15px',
                  }}
                >
                  <ThemedText.BodySecondary>Rebates(this week)</ThemedText.BodySecondary>
                  <ThemedText.BodyPrimary fontSize={16} color="accentActive">
                    $0.00
                  </ThemedText.BodyPrimary>
                </div>
              </StyledCard>
            </div>
            <ThemedText.BodySmall style={{ paddingLeft: '10px' }}>Rebates Distribution History</ThemedText.BodySmall>{' '}
            <StyledCard style={{ padding: '15px' }}>
              <div style={{ display: 'flex', padding: '10px' }}>
                <div style={{ display: 'flex', gap: '5px', justifyContent: 'start', padding: '10px' }}>
                  <ThemedText.BodySmall>Date:</ThemedText.BodySmall>
                  <ThemedText.BodySmall color="textSecondary">{Date.now()}</ThemedText.BodySmall>
                </div>
                {/*<div style={{ display: 'flex', gap: '5px', justifyContent: 'start', padding: '10px' }}>
                <ThemedText.BodySmall>Type:</ThemedText.BodySmall>
                <ThemedText.BodySmall color="textSecondary">V1 Airdrop</ThemedText.BodySmall>
              </div>*/}
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
      </ContentWrapper>
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
const ContentWrapper = styled.div<{ active: boolean }>`
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: ${({ active, theme }) => (active ? ' 0 10px 10px 10px' : '10px')};
`
