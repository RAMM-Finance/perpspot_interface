import { defaultAbiCoder } from '@ethersproject/abi'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { ButtonPrimary } from 'components/Button'
import Card from 'components/Card'
import { ReferralModal } from 'components/Modal'
import { useToggleWalletDrawer } from 'components/WalletDropdown'
import { useReferralContract } from 'hooks/useContract'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

const ModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 15px;
`

const ModalHeader = styled.div`
  display: flex;
  gap: 5px;
`

const ActionsWrapper = styled.div`
  display: flex;
  gap: 10px;
`

const Actions = styled(Card)<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  background-color: ${({ theme }) => theme.surface1};
  gap: 20px;
  opacity: ${(props) => (props.active ? '100%' : '25%')};
`

const Status = styled.div`
  background-color: ${({ theme }) => theme.accentActiveSoft};
  border-radius: 50%;
  width: 30px;
  height: 30px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
`

export default function JoinModal() {
  const [showModal, setShowModal] = useState(true)
  const navigate = useNavigate()

  const location = useLocation()
  const path = location.pathname.substring(6)

  const [codeExists, setCodeExists] = useState(true)

  const { chainId, account, provider } = useWeb3React()

  const walletConnected = useMemo(() => {
    if (chainId && account && provider) {
      return true
    } else {
      return false
    }
  }, [chainId, account, provider])

  const toggleWalletDrawer = useToggleWalletDrawer()

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    navigate('/swap')
  }, [])

  const referralContract = useReferralContract()
  const [activeCodes, setActiveCodes] = useState<string>()
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()
  const addTransaction = useTransactionAdder()
  const [txHash, setTxHash] = useState<string>()

  console.log(activeCodes)

  useEffect(() => {
    const code = path ? defaultAbiCoder.encode(['uint256'], [path]).toString() : undefined
    if (!code || !referralContract) return

    const call = async () => {
      try {
        const result = await referralContract.codeOwners(code)
        console.log('owner', result)
        setCodeExists(result != '0x0000000000000000000000000000000000000000')
      } catch (error) {
        console.log('codeowner err', error)
      }
    }
    call()
  }, [referralContract, path, account, codeExists])
  console.log('code exists', codeExists)

  useEffect(() => {
    if (!account || !referralContract) return

    const call = async () => {
      try {
        const result = await referralContract.codesByOwners(account, 0)
        const decoded = defaultAbiCoder.decode(['uint256'], result)
        setActiveCodes(decoded.toString())
      } catch (error) {
        setActiveCodes(undefined)
        console.log('codebyowners err')
      }
    }

    call()
  }, [account])

  const useCodeCallback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      const bytes32 = defaultAbiCoder.encode(['uint256'], [path]).toString()
      const response = await referralContract?.setReferralCodeByUser(bytes32)
      return response as TransactionResponse
    } catch (err) {
      console.log('referr', err)
      throw new Error('reff')
    }
  }, [account, chainId, provider, path])

  const handleUseCode = useCallback(() => {
    if (!path || !account || !referralContract || !chainId || !provider) {
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
  }, [useCodeCallback, account, referralContract, chainId, provider, path, txHash, attemptingTxn, errorMessage])

  return (
    <ReferralModal isOpen={showModal} maxHeight={750} maxWidth={800} $scrollOverlay={true} onDismiss={handleCloseModal}>
      <ModalWrapper>
        <ModalHeader>
          {codeExists ? (
            <>
              <ThemedText.SubHeader>You're invited to Limitless from the referral code:</ThemedText.SubHeader>
              <ThemedText.SubHeader color="accentActive">{path}</ThemedText.SubHeader>
            </>
          ) : (
            <>
              <ThemedText.SubHeader>Referral code</ThemedText.SubHeader>
              <ThemedText.SubHeader color="accentActive">{path}</ThemedText.SubHeader>
              <ThemedText.SubHeader>is either no longer active or invalid</ThemedText.SubHeader>
            </>
          )}
        </ModalHeader>
        <ActionsWrapper>
          <Actions active={codeExists && !walletConnected}>
            <Status>
              <ThemedText.BodySmall fontWeight={800}> {!walletConnected ? '1' : '✓'}</ThemedText.BodySmall>
            </Status>
            {!walletConnected ? (
              <>
                {' '}
                <ThemedText.SubHeader>Connect</ThemedText.SubHeader>
                <ButtonPrimary
                  style={{ marginTop: '37px', fontSize: '14px', borderRadius: '10px' }}
                  width="14"
                  padding=".5rem"
                  onClick={toggleWalletDrawer}
                  fontWeight={600}
                >
                  <Trans>Connect Wallet to Arbitrum</Trans>
                </ButtonPrimary>
              </>
            ) : (
              <ThemedText.SubHeader>Connected</ThemedText.SubHeader>
            )}
          </Actions>
          <Actions active={codeExists && walletConnected}>
            <Status>
              <ThemedText.BodySmall fontWeight={800}>2</ThemedText.BodySmall>
            </Status>
            <ThemedText.SubHeader>Join</ThemedText.SubHeader>
            <ThemedText.BodyPrimary>Save 4% by using this code</ThemedText.BodyPrimary>
            {walletConnected ? (
              <ButtonPrimary
                style={{ fontSize: '14px', borderRadius: '10px' }}
                width="14"
                padding=".5rem"
                onClick={handleUseCode}
                fontWeight={600}
              >
                <Trans>Join with code: {path}</Trans>
              </ButtonPrimary>
            ) : (
              <ButtonPrimary
                style={{ fontSize: '14px', borderRadius: '10px' }}
                width="14"
                padding=".5rem"
                fontWeight={600}
                altDisabledStyle={walletConnected}
              >
                <Trans>Join with code: {path}</Trans>
              </ButtonPrimary>
            )}
          </Actions>
        </ActionsWrapper>
      </ModalWrapper>
    </ReferralModal>
  )
}
