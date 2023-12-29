import { SmallButtonPrimary } from 'components/Button'
import { InputSection } from 'pages/Swap'
import { Filter, FilterWrapper, Selector, StyledSelectorText } from 'pages/Swap/tradeModal'
import { useMemo, useRef, useState,useCallback,useEffect } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { useWeb3React } from '@web3-react/core'
import { useReferralContract } from 'hooks/useContract'
import { keccak256 } from '@ethersproject/solidity'
import { defaultAbiCoder } from '@ethersproject/abi'
import { TransactionType } from 'state/transactions/types'
import {usePointExists} from 'hooks/usePointsInfo'
import { CallStateResult, useSingleCallResult, useSingleContractMultipleData } from 'lib/hooks/multicall'
import { ethers } from 'ethers'

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
    if (referralCode && Number(referralCode)  >0) {
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
    setRefGen(event.target.value);
  };

  const handleCodeChange =  (event: React.ChangeEvent<HTMLInputElement>) => {
    setRef(event.target.value);
  };

  const onButtonClick = () => {
    if (referral) {
      setCreateReferralCode(() => userRef?.current?.value)
    } else {
      setReferralCode(() => referralRef?.current?.value)
    }
  }

  const referralContract = useReferralContract()
  const [activeCodes, setActiveCodes] = useState<string>()

  useEffect(()=>{

    if(!account || !referralContract) return 

    const call = async()=>{
      try{
        const result = await referralContract.codesByOwners(account, 0)
        const decoded = defaultAbiCoder.decode(['uint256'], result)
        setActiveCodes(decoded.toString())
        setCreateReferralCode(() => decoded.toString())
      } catch(error){
        setActiveCodes(undefined)
        setCreateReferralCode(undefined)
        console.log('codebyowners err')
      }
    }

    call() 
  }, [account])

  console.log('active codes', activeCodes)


  const [codeExists, setCodeExists] = useState(false)

  useEffect(()=>{
    const code = referral
      ? refGen ? defaultAbiCoder.encode(['uint256'], [refGen]).toString() : undefined
      : ref ? defaultAbiCoder.encode(['uint256'], [ref]).toString() : undefined
    if(!account || !code || !referralContract) return 

    const call = async()=>{
      try{
        console.log('code', code,referral? refGen: ref)

        const result = await referralContract.codeOwners(code)
        console.log('owner', result)
        setCodeExists(result!= "0x0000000000000000000000000000000000000000")

      } catch(error){
        console.log('codeowner err',error)
      }
    }

    call() 
  }, [refGen, ref, account])
  console.log('code exists', codeExists)

  const [codeUsing, setCodeUsing] = useState(false)

  useEffect(()=>{

    if(!account || !referralContract) return 

    const call = async()=>{
      try{
        const result = await referralContract.userReferralCodes(account)
        setCodeUsing(result!= ethers.constants.HashZero)
        setReferralCode(() => defaultAbiCoder.decode(['uint256'], result).toString())

      } catch(error){
        console.log('codeowner err')

      }


      }
    

    call() 
  }, [ account])



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


  const handleCreateReferral = useCallback(()=>{
    if (!userRef?.current?.value || !account|| !referralContract || !chainId || !provider ) {
      return
    }

    setAttemptingTxn(true)

    callback().then((response)=>{
      setAttemptingTxn(false)
      setTxHash(response?.hash)
      setErrorMessage(undefined)
      addTransaction(response, {
        type: TransactionType.CREATE_REFERRAL,
        inputCurrencyId: "", 
        outputCurrencyId: ""
      })
      return response.hash
    })
    .catch((error) => {
      console.error('referrr',error)
      setAttemptingTxn(false)
      setTxHash(undefined)
      setErrorMessage(error.message)
    })

  }, [callback, account, referralContract, chainId, provider, userRef, txHash, attemptingTxn, errorMessage])


  const handleUseCode = useCallback(()=>{
    if(!ref || !account|| !referralContract || !chainId || !provider){
      return 
    }
    setAttemptingTxn(true)
    useCodeCallback().then((response)=>{
      setAttemptingTxn(false)
      setTxHash(response?.hash)
      setErrorMessage(undefined)
      addTransaction(response, {
        type: TransactionType.USE_REFERRAL,
        inputCurrencyId: "", 
        outputCurrencyId: ""
      })
      return response.hash
    })
    .catch((error) => {
      console.error('referrr',error)
      setAttemptingTxn(false)
      setTxHash(undefined)
      setErrorMessage(error.message)
    })

  }, [useCodeCallback, account, referralContract, chainId, provider, ref, txHash, attemptingTxn, errorMessage])

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
          <Input placeholder="Create referral code" id="refferal-code" ref={userRef} onChange={handleUserRefChange}></Input>
          {codeExists && (<ThemedText.BodyPrimary style={{ paddingBottom: '15px', paddingLeft: '30px', paddingRight: '30px' }}>
            Code taken
          </ThemedText.BodyPrimary>)}
          {!codeExists && (<SmallButtonPrimary onClick={handleCreateReferral}>Generate Code</SmallButtonPrimary>)}
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
          <Input placeholder=" Enter referral code" id="refferal-code" ref={referralRef} onChange = {handleCodeChange}></Input>
          {codeExists ? (<SmallButtonPrimary onClick={handleUseCode}>Use Code</SmallButtonPrimary>)
          :  (<ThemedText.BodyPrimary style={{ paddingBottom: '15px', paddingLeft: '30px', paddingRight: '30px' }}>
            Code does not exist
          </ThemedText.BodyPrimary>)
          }
        </InputWrapper>
      )}
      {referral && acceptedCreate && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr ', gap: '10px' }}>
            <StyledCard>
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '15px' }}
              >
                <ThemedText.BodySmall>Users Referred</ThemedText.BodySmall>
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
                <ThemedText.BodySmall>Referral Points</ThemedText.BodySmall>
                <ThemedText.BodyPrimary>0</ThemedText.BodyPrimary>
              </div>
            </StyledCard>
            <StyledCard>
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '15px' }}
              >
                <ThemedText.BodySmall>Fees generated by Referees</ThemedText.BodySmall>
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
          </StyledCard>
          <StyledCard style={{ display: 'flex', justifyContent: 'center', padding: '25px' }}>
            <ThemedText.BodySmall>No rebates distribution history yet.</ThemedText.BodySmall>
          </StyledCard>
        </div>
      )}
      {!referral && acceptedCode && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
            <StyledCard>
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '15px' }}
              >
                <ThemedText.BodySmall>Active Referral Code</ThemedText.BodySmall>
                <ThemedText.BodyPrimary>{referralCode?.toString()}</ThemedText.BodyPrimary>
              </div>
            </StyledCard>
            <StyledCard>
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '15px' }}
              >
                <ThemedText.BodySmall>Trading Volume(this week)</ThemedText.BodySmall>
                <ThemedText.BodyPrimary>$0.00</ThemedText.BodyPrimary>
              </div>
            </StyledCard>
            <StyledCard>
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '15px' }}
              >
                <ThemedText.BodySmall>LP Amount(this week)</ThemedText.BodySmall>
                <ThemedText.BodyPrimary>$0.00</ThemedText.BodyPrimary>
              </div>
            </StyledCard>

            <StyledCard>
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '15px' }}
              >
                <ThemedText.BodySmall>Rebates(this week)</ThemedText.BodySmall>
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
