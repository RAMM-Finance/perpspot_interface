import { defaultAbiCoder } from '@ethersproject/abi'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { SmallButtonPrimary } from 'components/Button'
import Modal from 'components/Modal'
import { ethers } from 'ethers'
import { useBRP, useLimweth, useReferralContract } from 'hooks/useContract'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { InputSection } from 'pages/Trade'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Copy } from 'react-feather'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import styled from 'styled-components/macro'
import { useTheme } from 'styled-components/macro'
import { CopyToClipboard, ThemedText } from 'theme'
import { useAccount, useChainId } from 'wagmi'
import { useEthersProvider } from 'wagmi-lib/adapters'
import { LoadingBubble } from 'components/Tokens/loading'
import { MouseoverTooltip } from 'components/Tooltip'
import { formatDollar } from 'utils/formatNumbers'

import { CollectMultipler, usePointsData } from './data'
import { useLastClaimedPoints, useRefereeLimwethDeposit } from './hooks'
import TierBar from './TierBar'


const formatWallet = (wallet: string) => {
  return `${wallet.slice(0, 8)}...${wallet.slice(wallet.length - 8, wallet.length)}`
}
const Dropdown = styled.div`
  display: none;
  position: absolute;
   color: white
  background-color: black;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  padding: 8px;
  z-index: 1;

  &.show {
    display: block;
  }
`;

const WalletAddress = styled.div`
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

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
  margin-left: 20px;
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
  border-bottom: 1px solid ${({ active, theme }) => (active ? theme.surface1 : 'none')};
  padding: 8px 12px 8px 12px;
  background-color: ${({ active, theme }) => (active ? theme.surface1 : 'none')};
  cursor: pointer;
  &:hover {
    opacity: ${({ theme }) => theme.opacity.hover};
  }
`
// function decodeResult(result: any) {
//   try {
//     // Try decoding as uint256
//     const decodedAsUint256 = defaultAbiCoder.decode(['uint256'], result);
//     return decodedAsUint256.toString();
//   } catch (errorUint) {
//     try {
//       // If the above fails, try decoding as string
//       const decodedAsString = defaultAbiCoder.decode(['string'], result);
//       return decodedAsString.toString();
//     } catch (errorString) {
//       // If both fail, handle the error (e.g., log it or return a default value)
//       console.error('Decoding failed for both uint256 and string:', errorString);
//       return ''; // or any appropriate default/fallback value
//     }
//   }
// }
function canRefer(address: any) {
  if (ethers.utils.getAddress(address) == ethers.utils.getAddress('0x817A10B23332573e1D1f1D04Aa24aCe7e72318ba'))
    return true
  else if (ethers.utils.getAddress(address) == ethers.utils.getAddress('0xd16E596d6F9556e0fC79A15DD26c22349912B4dA'))
    return true
  else if (ethers.utils.getAddress(address) == ethers.utils.getAddress('0x95e46c08d802a24aC2357217FFdceBa17FcCa082'))
    return true
  else if (ethers.utils.getAddress(address) == ethers.utils.getAddress('0xFc2Dc5e8D28cA4974010bdA2222045A43803A888'))
    return true
  else if (ethers.utils.getAddress(address) == ethers.utils.getAddress('0x5455d09d5a5B962eEdD8C0C9451eabe8cD0e61FF'))
    return true
  else return true
}
function decodeResult(result: any) {
  try {
    // First, try decoding as string
    const decodedAsString = ethers.utils.parseBytes32String(result)
    return decodedAsString.toString()
  } catch (errorString) {
    try {
      // If string decoding fails, try decoding as uint256
      const decodedAsUint256 = defaultAbiCoder.decode(['uint256'], result)
      return decodedAsUint256.toString()
    } catch (errorUint) {
      // If both fail, handle the error (e.g., log it or return a default value)
      console.error('Decoding failed for both string and uint256:', errorUint)
      return '' // or any appropriate default/fallback value
    }
  }
}

const useMaxData = (account: any, referralContract: any) => {
  const [maxNumber, setMaxNumber] = useState<any>()

  if (!referralContract || !account) return

  useEffect(() => {
    const getMaxCode = async () => {
      try {
        const result = await referralContract.getMaxValues()
        // console.log('getting maxxxxx', result)
        setMaxNumber(result[1])
      } catch (error) {
        console.log('max errr', error)
      }
    }
    getMaxCode()
  }, [account, referralContract])
  return maxNumber
}

const useCheckCodes = (account: any, referralContract: any, refGens: any) => {
  const [codesExist, setCodesExist] = useState<boolean[]>([])
  if (!referralContract || !account) return

  useEffect(() => {
    const checkCodeExistence = async () => {
      try {
        const checks = refGens.map((refGen: any) => {
          if (refGen) {
            const code = ethers.utils.formatBytes32String(refGen.toString())
            return referralContract
              .codeOwners(code)
              .then((owner: any) => owner !== '0x0000000000000000000000000000000000000000')
              .catch(() => false)
          }
          return Promise.resolve(false)
        })
        const results = await Promise.all(checks)
        setCodesExist(results)
      } catch (error) {
        console.error('Error checking code existence', error)
        setCodesExist(refGens.map(() => false))
      }
    }

    if (account && referralContract) {
      checkCodeExistence()
    }
  }, [account, referralContract, refGens])

  return codesExist
}



function LoadingRow() {
  return (
    <>
      <LoadedCellWrapper>
        <IconLoadingBubble />
        <LongLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
      </LoadedCellWrapper>
      <LoadedCellWrapper>
        <IconLoadingBubble />
        <LongLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
      </LoadedCellWrapper>
      <LoadedCellWrapper>
        <IconLoadingBubble />
        <LongLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
      </LoadedCellWrapper>
      <LoadedCellWrapper>
        <IconLoadingBubble />
        <LongLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
      </LoadedCellWrapper>
      <LoadedCellWrapper>
        <IconLoadingBubble />
        <LongLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
      </LoadedCellWrapper>
    </>
  )
}

const MediumLoadingBubble = styled(LoadingBubble)`
  width: 65%;
`
const LongLoadingBubble = styled(LoadingBubble)`
  width: 90%;
`
const IconLoadingBubble = styled(LoadingBubble)`
  border-radius: 50%;
  width: 24px;
`

const LoadedCell = styled.div`
  padding-bottom: 10px;
`

const LoadedCellWrapper = styled.div`
  display: grid;
  grid-template-columns: 0.75fr 3fr 3fr 3fr 3fr 3fr;
  padding: 10px;
  border-radius: 10px;
  :hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  justify-content: center;
`

const LoadedRows = styled.div`
  overflow-y: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
  max-height: 500px;
`

const HeaderCell = styled.div``
const HeaderCellWrapper = styled.div`
  position: sticky;
  overflow-y: hidden;
  overflow-x: hidden;
  display: grid;
  grid-template-columns: 0.75fr 3fr 3fr 3fr 3fr 3fr;
  border-bottom: 1px solid ${({ theme }) => theme.backgroundOutline};
  padding: 10px;
`


function LeaderboardHeader() {
  return (
    <HeaderCellWrapper>
      <HeaderCell>
        <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
          Rank
        </ThemedText.SubHeaderSmall>
      </HeaderCell>
      <HeaderCell>
        <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
          User
        </ThemedText.SubHeaderSmall>
      </HeaderCell>
      <HeaderCell>
        <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
          Trade LMT
        </ThemedText.SubHeaderSmall>
      </HeaderCell>
      <HeaderCell>
        <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
          LP LMT
        </ThemedText.SubHeaderSmall>
      </HeaderCell>
      <HeaderCell>
        <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
          Referral LMT
        </ThemedText.SubHeaderSmall>
      </HeaderCell>
      <HeaderCell>
        <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
          Total LMT
        </ThemedText.SubHeaderSmall>
      </HeaderCell>
    </HeaderCellWrapper>
  )
}



const Referrals = () => {
  // const { refereeActivity, tradeProcessedByTrader, lpPositionsByUniqueLps } = usePointsData()
  console.log("Referral PAGE")
  // console.log("REFEREE, TRADE, LP", refereeActivity, tradeProcessedByTrader, lpPositionsByUniqueLps)
  const theme = useTheme()
  const [showModal, setShowModal] = useState(false)
  const blockNumber = useBlockNumber()

  const [referral, setReferral] = useState<boolean>(true)
  //generate code
  const [createReferralCode, setCreateReferralCode] = useState<HTMLInputElement | string>()
  //referral code value
  const [referralCode, setReferralCode] = useState<HTMLInputElement | string>()
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState<string>()
  const [txResponse, setTxResponse] = useState<any>()

  const [errorMessage, setErrorMessage] = useState<string>()
  const addTransaction = useTransactionAdder()
  const account = useAccount().address
  const chainId = useChainId()
  const provider = useEthersProvider({ chainId })


  const BRP = useBRP()

  const limweth = useLimweth()

  const [limwethBalance, setLimwethBalance] = useState<number>()

  useEffect(() => {
    if (!account || !limweth) return

    const call = async () => {
      const res = await limweth.balanceOf(account)
      // console.log("RRRRRR", typeof ethers.utils.formatEther(res))
      // const balance = (await limweth.balanceOf(account)).toNumber()
      // const decimals = await limweth.decimals()
      // const limwethBal = balance / 10 ** decimals
      const limwethBal = ethers.utils.formatEther(res)
      setLimwethBalance(parseFloat(limwethBal))
    }

    call()
  }, [account, limweth])

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
  }, [])

  const acceptedCreate = createReferralCode != null && createReferralCode != undefined
  // const acceptedCreate = useMemo(() => {
  //   if (createReferralCode) {
  //     return true
  //   } else {
  //     return false
  //   }
  // }, [createReferralCode, txHash])

  const acceptedCode = useMemo(() => {
    if (referralCode) {
      return true
    } else {
      return false
    }
  }, [referralCode, txHash])

  const userRef = useRef<HTMLInputElement>(null)
  const referralRef = useRef<HTMLInputElement>(null)
  const referralRef2 = useRef<HTMLInputElement>(null)
  const referralRef3 = useRef<HTMLInputElement>(null)
  const referralRef4 = useRef<HTMLInputElement>(null)
  const referralRef5 = useRef<HTMLInputElement>(null)

  const [refGen, setRefGen] = useState('0')
  const [refGen2, setRefGen2] = useState('0')
  const [refGen3, setRefGen3] = useState('0')
  const [refGen4, setRefGen4] = useState('0')
  const [refGen5, setRefGen5] = useState('0')

  const [ref, setRef] = useState('0')

  const handleUserRefChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRefGen(event.target.value)
  }
  const handleUserRefChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRefGen2(event.target.value)
  }
  const handleUserRefChange3 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRefGen3(event.target.value)
  }
  const handleUserRefChange4 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRefGen4(event.target.value)
  }
  const handleUserRefChange5 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRefGen5(event.target.value)
  }
  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRef(event.target.value)
  }
  const codesNonZero = useMemo(() => {
    if (
      refGen != '0'
      //&& refGen2!= '0'&&refGen3!= '0'&&refGen4!= '0'&&refGen5!= '0'
    )
      return true
    else return false
  }, [refGen, refGen2, refGen3, refGen4, refGen5])

  const onButtonClick = () => {
    if (referral) {
      setCreateReferralCode(() => userRef?.current?.value)
    } else {
      setReferralCode(() => referralRef?.current?.value)
    }
  }

  // const [simulatedRewards, setSimulatedRewards] = useState<string>()
  // const [lastClaimedPoints, setLastClaimedPoints] = useState<string>()
  const lastClaimedPoints = useLastClaimedPoints()
  // console.log('zeke:', lastClaimedPoints, lastClaimedPoints2)
  // const [lastRecordedPoints, setLastRecordedPoints] = useState<string>()

  const referralContract = useReferralContract()

  // const [refereesLimwethDeposit, setRefereesLimwethDeposit] = useState<number>()

  const { referees, refereeActivity: refereeActivities,loading,  referredCount, refereesLimwethDeposit } = useRefereeLimwethDeposit()

  const refereeActivityTotalRanked = useMemo(() => {
    if (!refereeActivities) return null;

    // Convert the object to an array of entries
    const refereeActivityArray = Object.entries(refereeActivities).map(([referee, activity] : [any, any]) => ({
      referee,
      tradePoints: Number(activity.tradePoints),
      lpPoints: Number(activity.lpPoints),
      referralPoints: Number(activity.referralPoints),
    }));

    // Calculate total points for each referee
    const refereeActivityTotal = refereeActivityArray.map((totalUser: any) => ({
      ...totalUser,
      totalPoints: totalUser.lpPoints + totalUser.referralPoints + totalUser.tradePoints,
    }));

    // Sort the array by total points in descending order
    const sortedArr = refereeActivityTotal.sort((a: any, b: any) => b.totalPoints - a.totalPoints);

    // Assign ranks based on the sorted order
    const refereeActivityTotalRanked = sortedArr.map((user: any, index: number) => ({
      ...user,
      rank: index + 1,
    }));

    return refereeActivityTotalRanked;
  }, [refereeActivities])

  // const loading = false
  console.log('referees', referees, refereeActivities, refereeActivityTotalRanked)
  const [activeCodes, setActiveCodes] = useState<string>()

  useEffect(() => {
    if (!account || !referralContract) return

    const call = async () => {
      try {
        const result = await referralContract.codesByOwners(account, 0)
        const decoded = decodeResult(result)
        setActiveCodes(decoded.toString())
        setCreateReferralCode(() => decoded.toString())
      } catch (error) {
        setActiveCodes(undefined)
        setCreateReferralCode(undefined)
      }
    }

    call()
  }, [account, referralContract, txHash, blockNumber])

  const [codeExists, setCodeExists] = useState(false)

  useEffect(() => {
    const code = referral
      ? ref
        ? ethers.utils.formatBytes32String(ref.toString())
        : undefined
      : refGen
      ? ethers.utils.formatBytes32String(refGen.toString())
      : undefined
    if (!account || !code || !referralContract) return

    const call = async () => {
      try {
        // console.log('code', code, referral ? refGen : ref)
        const result = await referralContract.codeOwners(code)
        // console.log('ownerownerowner', result)
        setCodeExists(result != '0x0000000000000000000000000000000000000000' && result != account)
      } catch (error) {
        console.log('codeowner err', error)
      }
    }

    call()
  }, [refGen, ref, account])

  const refGens = useMemo(() => {
    return [
      refGen,
      //, refGen2, refGen3, refGen4, refGen5
    ]
  }, [refGen, refGen2, refGen3, refGen4, refGen5])

  const refCodesExist = useCheckCodes(account, referralContract, refGens)
  const maxCodeUsage = useMaxData(account, referralContract)

  // console.log('txHashes', txHash, txResponse)

  const [codeUsing, setCodeUsing] = useState(false)

  useEffect(() => {
    if (!account || !referralContract) return

    const call = async () => {
      try {
        const result = await referralContract.userReferralCodes(account)
        setCodeUsing(result != ethers.constants.HashZero)
        setReferralCode(() => decodeResult(result).toString())
      } catch (error) {
        console.log('codeowner err')
      }
    }

    call()
  }, [account, blockNumber])

  const claimRewardsCallback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      const response = await BRP?.claimRewards()
      return response as TransactionResponse
    } catch (err) {
      console.log('referr', err)
      throw new Error('reff')
    }
  }, [account, chainId, BRP, provider])

  const handleClaimRewards = useCallback(() => {
    if (!refGens || !account || !BRP || !chainId || !provider) {
      return
    }

    setAttemptingTxn(true)

    claimRewardsCallback()
      .then((response) => {
        setAttemptingTxn(false)
        setTxHash(response?.hash)
        setErrorMessage(undefined)
        addTransaction(response, {
          type: TransactionType.COLLECT_FEES,
          currencyId0: 'USDC',
          currencyId1: 'Rewards',
          expectedCurrencyOwed0: '',
          expectedCurrencyOwed1: '',
        })
        setTxResponse(response?.hash)
        return response.hash
      })
      .catch((error) => {
        console.error('referrr', error)
        setAttemptingTxn(false)
        setTxHash(undefined)
        setErrorMessage(error.message)
      })
  }, [claimRewardsCallback, account, BRP, chainId, provider, txHash, attemptingTxn, errorMessage])

  const callback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      const codes = refGens.map((code) => {
        const paddedCode = ethers.utils.formatBytes32String(code)
        return paddedCode
      })

      const response = await referralContract?.registerCodes(codes)
      return response as TransactionResponse
    } catch (err) {
      console.log('referr', err)
      throw new Error('reff')
    }
  }, [account, chainId, referral, provider, refGens])

  const useCodeCallback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      const bytes32 = ethers.utils.formatBytes32String(ref.toString())
      // console.log('?wtfwtwfwfwefewfwfew',bytes32, ref.toString() )
      // const bytes32 = defaultAbiCoder.encode(['string'], [ref.toString()]).toString()
      const response = await referralContract?.setReferralCodeByUser(bytes32)
      return response as TransactionResponse
    } catch (err) {
      console.log('referr', err)
      throw new Error('reff')
    }
  }, [account, chainId, referral, provider, ref])

  const handleCreateReferral = useCallback(() => {
    if (!refGens || !account || !referralContract || !chainId || !provider) {
      return
    }

    setAttemptingTxn(true)

    callback()
      .then((response) => {
        setAttemptingTxn(false)
        setTxHash(response?.hash)
        setErrorMessage(undefined)
        setShowModal(!showModal)
        addTransaction(response, {
          type: TransactionType.CREATE_REFERRAL,
          inputCurrencyId: '',
          outputCurrencyId: '',
        })
        setTxResponse(response?.hash)
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

  // const totalCollected = useMemo(() => {
  //   if (!account || !lpPositionsByUniqueLps) return 0
  //   let totalAmount = 0
  //   lpPositionsByUniqueLps?.[account]?.forEach((entry: any) => {
  //     totalAmount += entry.amount0Collected
  //     totalAmount += entry.amount1Collected
  //   })
  //   return totalAmount
  // }, [lpPositionsByUniqueLps, account])

  // const tradingVolume = useMemo(() => {
  //   if (!account || !tradeProcessedByTrader) return 0
  //   if (!tradeProcessedByTrader[account]) return 0
  //   else {
  //     let totalAmount = 0
  //     tradeProcessedByTrader[account].forEach((entry: any) => {
  //       totalAmount += entry.amount
  //     })
  //     return totalAmount
  //   }
  // }, [tradeProcessedByTrader, account])

  const referralLink = useMemo(() => {
    return `${window.location.href.substring(0, window.location.href.length - 11)}/#join/${activeCodes}`
  }, [activeCodes])

  // console.log('maxcode', maxCodeUsage)
  const accountCanRefer = useMemo(() => {
    return canRefer(account)
  }, [account])

  const [dropdownIndex, setDropdownIndex] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // const toggleDropdown = (index:any) => {
  //   setDropdownIndex(dropdownIndex === index ? null : index);
  // };
  const toggleDropdown = (index:any, event:any) => {
    if (dropdownIndex === index) {
      setDropdownIndex(null);
    } else {
      const rect = event.target.getBoundingClientRect();
      setDropdownPosition({
        top: rect.top + window.scrollY + rect.height,
        left: rect.left + window.scrollX
      });
      setDropdownIndex(index);
    }
  };

  return (
    <Wrapper>
      <FilterWrapper>
        <Filter onClick={() => setReferral(!referral)}>
          {/*<Filter>*/}
          <Selector active={referral}>
            <StyledSelectorText active={referral}>User</StyledSelectorText>
          </Selector>
          <Selector active={!referral}>
            <StyledSelectorText active={!referral}>Referrer</StyledSelectorText>
          </Selector>
        </Filter>
      </FilterWrapper>
      <ContentWrapper active={referral}>
        {!referral && !acceptedCreate && (
          <InputWrapper>
            <ThemedText.BodySecondary
              style={{ textAlign: 'center', paddingTop: '5px', paddingBottom: '15px' }}
              fontSize={16}
              fontWeight={800}
            >
              Generate Referral Code
            </ThemedText.BodySecondary>
            <ThemedText.BodyPrimary style={{ paddingBottom: '15px', paddingLeft: '30px', paddingRight: '30px' }}>
              Looks like you don't have a referral code to share. Create new referral codes and start earning LMT and
              rebates!
            </ThemedText.BodyPrimary>
            <Input
              placeholder={!accountCanRefer ? 'Coming soon' : 'Create Referral Code'}
              id="refferal-code"
              ref={referralRef}
              disabled={!accountCanRefer}
              onChange={handleUserRefChange}
            ></Input>
            {/*<Input
              placeholder="Enter referral code 2"
              id="refferal-code"
              ref={referralRef2}
              disabled={false}
              onChange={handleUserRefChange2}
            ></Input>
            <Input
              placeholder="Enter referral code 3"
              id="refferal-code"
              ref={referralRef3}
              disabled={false}
              onChange={handleUserRefChange3}
            ></Input>
            <Input
              placeholder="Enter referral code 4"
              id="refferal-code"
              ref={referralRef4}
              disabled={false}
              onChange={handleUserRefChange4}
            ></Input>
            <Input
              placeholder="Enter referral code 5"
              id="refferal-code"
              ref={referralRef5}
              disabled={false}
              onChange={handleUserRefChange5}
            ></Input>*/}

            {refGens.map((refGen, index) => (
              <div key={index}>
                {refCodesExist?.[index] && (
                  <ThemedText.BodySecondary>{`Code ${refGen} taken`}</ThemedText.BodySecondary>
                )}
              </div>
            ))}

            {/*codeExists && <SmallButtonPrimary>Code taken</SmallButtonPrimary>*/}
            {codesNonZero ? (
              //codeUsing
              true ? (
                <SmallButtonPrimary disabled={refCodesExist?.[0]} onClick={handleCreateReferral}>
                  Generate Code
                </SmallButtonPrimary>
              ) : (
                <SmallButtonPrimary disabled={true}>Need to be using code</SmallButtonPrimary>
              )
            ) : (
              <SmallButtonPrimary>Fill out code</SmallButtonPrimary>
            )}
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
              Use referral code to get 2x more LMT
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
          <ActiveWrapper>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'end', marginBottom: '15px' }}>
              <SmallButtonPrimary onClick={() => setShowModal(!showModal)}>Generate Referral Link</SmallButtonPrimary>
            </div>
            <Modal maxWidth={400} onDismiss={handleCloseModal} isOpen={showModal}>
              <div
                style={{
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: '400px',
                  minHeight: '150px',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <StyledCard
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                  }}
                >
                  <ThemedText.SubHeader>Share the link below to begin earning rewards</ThemedText.SubHeader>
                  <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                    <ThemedText.BodySecondary>{referralLink}</ThemedText.BodySecondary>
                    <CopyToClipboard toCopy={referralLink}>
                      <Copy size={14} />
                    </CopyToClipboard>
                  </div>
                </StyledCard>
              </div>
            </Modal>
            <TierWrapper>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  alignItems: 'start',
                  marginBottom: '20px',
                }}
              >
                {/* <ThemedText.BodySecondary color="gold" fontSize={16} fontWeight={800}>
                  Tier {refereeActivity && account && refereeActivity[account]?.tier?.toString()}
                </ThemedText.BodySecondary>{' '} */}
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', justifyContent: 'end' }}>
                  <ThemedText.BodyPrimary>Referral Code:</ThemedText.BodyPrimary>{' '}
                  <ThemedText.BodySecondary fontWeight={800} fontSize={16} color="accentActive">
                    {activeCodes && activeCodes}
                  </ThemedText.BodySecondary>{' '}
                </div>
              </div>

              {/*<div style={{ width: '85%', marginLeft: '50px' }}>
                <TierBar tier={refereeActivity ? (account ? Number(refereeActivity[account]?.tier) : 0) : 0} />
              </div>*/}
            </TierWrapper>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr ', gap: '10px' }}>
              <StyledCard>
                <CardWrapper>
                  <ThemedText.SubHeader fontSize={15}># Users Referred</ThemedText.SubHeader>
                  <ThemedText.BodySecondary fontSize={16}>
                    {referredCount ? referredCount : '-'}
                    {/* {refereeActivity && account ? refereeActivity[account]?.usersReferred || 0 : '-'} */}
                  </ThemedText.BodySecondary>
                </CardWrapper>
              </StyledCard>
              {/*<StyledCard>
                <CardWrapper>
                  <ThemedText.SubHeader fontSize={15}>Current Maximum Code Users</ThemedText.SubHeader>
                  <ThemedText.BodySecondary fontSize={16}>{maxCodeUsage?.toString()}</ThemedText.BodySecondary>
                </CardWrapper>
              </StyledCard>*/}
              {/*<StyledCard>
                <CardWrapper>
                  <ThemedText.SubHeader fontSize={15}>Volume by Referees </ThemedText.SubHeader>
                  <ThemedText.BodySecondary fontSize={16}>
                    {refereeActivity && account ? '$' + (refereeActivity[account]?.tradeVolume.toFixed(6) || 0) : '-'}
                  </ThemedText.BodySecondary>
                </CardWrapper>
              </StyledCard>*/}
              {/*<StyledCard>
                <CardWrapper>
                  <ThemedText.SubHeader fontSize={15}>Liquidity Provided by Referees</ThemedText.SubHeader>
                  <ThemedText.BodySecondary fontSize={16}>
                    {refereeActivity && account && CollectMultipler
                      ? '$' +
                          (
                            (refereeActivity[account]?.lpAmount - refereeActivity[account]?.timeWeightedDeposits) /
                            CollectMultipler
                          )?.toFixed(10) || 0
                      : '-'}
                  </ThemedText.BodySecondary>
                </CardWrapper>
              </StyledCard>*/}
              <StyledCard>
                <CardWrapper>
                  <ThemedText.SubHeader fontSize={15}>Total LMT earned by referees</ThemedText.SubHeader>
                  <ThemedText.BodySecondary fontSize={16}>
                    {refereesLimwethDeposit ? refereesLimwethDeposit : '-'}
                  </ThemedText.BodySecondary>
                </CardWrapper>
              </StyledCard>
              {/*<StyledCard>
                <CardWrapper>
                  <ThemedText.SubHeader fontSize={15}>Referral LMT Last Claim</ThemedText.SubHeader>
                  <ThemedText.BodySecondary fontSize={16}>
                    {refereeActivity && account ? lastClaimedPoints || 0 : '-'}
                  </ThemedText.BodySecondary>
                </CardWrapper>
              </StyledCard>*/}
              {/*<StyledCard>
                <CardWrapper>
                  <ThemedText.SubHeader fontSize={15}>Recently Updated Referral LMT</ThemedText.SubHeader>
                  <ThemedText.BodySecondary fontSize={16}>
                    {refereeActivity && account && lastRecordedPoints}
                  </ThemedText.BodySecondary>
                </CardWrapper>
              </StyledCard>*/}
              {/*<StyledCard>
                <CardWrapper>
                  <ThemedText.SubHeader fontSize={15}>Claimable Rewards</ThemedText.SubHeader>
                  <ThemedText.BodySecondary fontSize={16}>{simulatedRewards + ' USDC'}</ThemedText.BodySecondary>
                  <SmallButtonPrimary onClick={handleClaimRewards}>Collect</SmallButtonPrimary>
                </CardWrapper>
              </StyledCard>{' '}*/}
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
            {
            <>
            <ThemedText.BodySmall>Referee Activity</ThemedText.BodySmall>
            <LeaderboardHeader />
            <LoadedRows>
              {loading ? (
                <LoadingRow />
              ) : (
                refereeActivityTotalRanked?.map((user: any, index:any) => {
                  return (
                    <LoadedCellWrapper key={user.referee}>
                      <LoadedCell>
                        <ThemedText.BodySecondary>{user.rank}</ThemedText.BodySecondary>
                      </LoadedCell>
                      <LoadedCell>
                 <WalletAddress onClick={(e) => toggleDropdown(index, e)}>
                  <ThemedText.BodySecondary>
                    {user && formatWallet(user.referee)}
                  </ThemedText.BodySecondary>
                </WalletAddress>
                {dropdownIndex === index && (
                  <Dropdown
                    className="show"
                    style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
                  >
                    {user.referee}
                  </Dropdown>
                )}      
                      {/*<MouseoverTooltip text={user.referee}>
                          <ThemedText.BodySecondary>{user && formatWallet(user.referee)}</ThemedText.BodySecondary>
                      </MouseoverTooltip>*/}
                      </LoadedCell>
                      <LoadedCell>
                        <ThemedText.BodySecondary>
                          {formatDollar({ num: user.tradePoints, dollarSign: false })}
                        </ThemedText.BodySecondary>
                      </LoadedCell>
                      <LoadedCell>
                        <ThemedText.BodySecondary>
                          {formatDollar({ num: user.lpPoints, dollarSign: false })}
                        </ThemedText.BodySecondary>
                      </LoadedCell>
                      <LoadedCell>
                        <ThemedText.BodySecondary>
                          {formatDollar({ num: user.referralPoints, dollarSign: false })}
                        </ThemedText.BodySecondary>
                      </LoadedCell>
                      <LoadedCell>
                        <ThemedText.BodySecondary>
                          {formatDollar({ num: user.totalPoints, dollarSign: false })}
                        </ThemedText.BodySecondary>
                      </LoadedCell>
                    </LoadedCellWrapper>
                  )
                })
              )}
            </LoadedRows>
            </>
    

            }
           
            </ActiveWrapper>
        )}
        {referral && acceptedCode && (
          <ActiveWrapper style={{ paddingTop: '40px' }}>
            <ReferralAcceptContainer>
              <StyledCard>
                <CardWrapper>
                  <ThemedText.BodyPrimary>Active Referral Code</ThemedText.BodyPrimary>
                  <ThemedText.BodySecondary fontSize={16}>
                    {referralCode ? referralCode?.toString() : '-'}
                  </ThemedText.BodySecondary>
                </CardWrapper>
              </StyledCard>
              {/* <StyledCard>
                <CardWrapper>
                  <ThemedText.BodyPrimary>Trading Volume</ThemedText.BodyPrimary>
                  <ThemedText.BodySecondary fontSize={16}>
                    ${tradingVolume ? tradingVolume?.toFixed(4) : '-'}
                  </ThemedText.BodySecondary>
                </CardWrapper>
              </StyledCard> */}
              <StyledCard>
                <CardWrapper>
                  <ThemedText.BodyPrimary>LimWeth Deposits</ThemedText.BodyPrimary>
                  <ThemedText.BodySecondary fontSize={16}>
                    {limwethBalance
                      ? limwethBalance?.toFixed(6) !== '0.000000'
                        ? limwethBalance.toFixed(6)
                        : ' < .000001' + ' LimWeth'
                      : '-'}
                    {/* ${limwethDeposits ? limwethDeposits?.toFixed(8) : '-'} */}
                  </ThemedText.BodySecondary>
                </CardWrapper>
              </StyledCard>
              {/* <StyledCard>
                <CardWrapper>
                  <ThemedText.BodyPrimary>Advanced LP Fee Collected</ThemedText.BodyPrimary>
                  <ThemedText.BodySecondary fontSize={16}>
                    $
                    {totalCollected
                      ? totalCollected.toFixed(4) !== '0.0000'
                        ? totalCollected.toFixed(4)
                        : ' < 0.0001'
                      : '-'}
                  </ThemedText.BodySecondary>
                </CardWrapper>
              </StyledCard> */}
              <StyledCard>
                <CardWrapper>
                  <ThemedText.BodyPrimary>My LMT Multiplier</ThemedText.BodyPrimary>
                  <ThemedText.BodySecondary fontSize={16}>2.00</ThemedText.BodySecondary>
                </CardWrapper>
              </StyledCard>
            </ReferralAcceptContainer>
            <ThemedText.BodySmall style={{ paddingLeft: '10px' }}>Rebates Distribution History</ThemedText.BodySmall>{' '}
            {/*<StyledCard style={{ padding: '15px' }}>
              <div style={{ display: 'flex', padding: '10px' }}>
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
            </StyledCard>*/}
            <ReferralAcceptBtnBox>
              <ThemedText.BodySmall>No rebates distribution history yet.</ThemedText.BodySmall>
            </ReferralAcceptBtnBox>
          </ActiveWrapper>
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
  padding: 10px;
`
const ReferralAcceptContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.lg}px`}) {
    display: flex;
    flex-direction: column;
    & > div {
      height: 100px;
    }
  }
`
const ReferralAcceptBtnBox = styled(StyledCard)`
  justify-content: center;
  padding: 25px;
  margin-top: 50px;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.lg}px`}) {
    margin-top: 0;
  }
`
const ContentWrapper = styled.div<{ active: boolean }>`
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  background-color: ${({ theme }) => theme.backgroundSurface};
`

const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  alignitems: center;
  gap: 20px;
  padding: 15px;
`

const TierWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  gap: 30px;
  margin-bottom: 30px;
`

const ActiveWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
  padding: 40px;
  padding-top: 20px;
  background-color: ${({ theme }) => theme.backgroundSurface};
`

const ShareWrapper = styled.div`
  &:hover {
    cursor: pointer;
  }
`
