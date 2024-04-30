import { TransactionResponse } from '@ethersproject/abstract-provider'
import { useWeb3React } from '@web3-react/core'
import Column from 'components/Column'
import FAQBox, { FaqWrapper } from 'components/FAQ'
import { MOBILE_MEDIA_BREAKPOINT, SMALL_MEDIA_BREAKPOINT, XLARGE_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
import { useBRP } from 'hooks/useContract'
import useBlockNumber from 'lib/hooks/useBlockNumber'
// import { getSortDropdownOptions } from 'nft/components/collection/CollectionNfts'
import { Row } from 'nft/components/Flex'
import { useCallback, useEffect, useState } from 'react'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import styled from 'styled-components/macro'

import banner from '../../components/Leaderboard/banner.png'
import BoxesContainr, { TBRPData } from '../../components/NewItems/BoxesContainr'
import InfoDescriptionSection from '../../components/NewItems/InfoDescription'

// const SortDropdownContainer = styled.div<{ isFiltersExpanded: boolean }>`
//   width: max-content;
//   height: 44px;
//   @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.lg}px`}) {
//     ${({ isFiltersExpanded }) => isFiltersExpanded && `display: none;`}
//   }
//   @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
//     display: none;
//   }
// `

// const SweepButton = styled.div<{ toggled: boolean; disabled?: boolean }>`
//   display: flex;
//   gap: 8px;
//   border: none;
//   border-radius: 12px;
//   padding: 12px 18px 12px 12px;
//   cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
//   color: ${({ toggled, disabled, theme }) => (toggled && !disabled ? theme.accentTextLightPrimary : theme.textPrimary)};
//   background: ${({ theme, toggled, disabled }) =>
//     !disabled && toggled
//       ? 'radial-gradient(101.8% 4091.31% at 0% 0%, #4673FA 0%, #9646FA 100%)'
//       : theme.backgroundInteractive};
//   opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
//   :hover {
//     background-color: ${({ theme }) => theme.hoverState};
//     transition: ${({
//       theme: {
//         transition: { duration, timing },
//       },
//     }) => `${duration.fast} background-color ${timing.in}`};
//   }

//   @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
//     padding: 12px 12px 12px 12px;
//   }
// `
// const ActionsSubContainer = styled.div`
//   display: flex;
//   gap: 12px;
//   flex: 1;
//   min-width: 0px;
//   @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
//     gap: 10px;
//   }
// `

const CollectionContainer = styled(Column)`
  width: 100%;
  align-self: start;
  will-change: width;
`

const CollectionDisplaySection = styled(Row)`
  width: 100%;
  padding: 1rem;
  align-items: flex-start;
  position: relative;
`

const BannerWrapper = styled.div`
  height: 100px;
  max-width: 100%;
  position: relative;
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.sm}px) {
    margin-top: 16px;
    margin-left: 20px;
    margin-right: 20px;
    height: 288px;
  }
`
const Banner = styled.div<{ src: string }>`
  height: 100%;
  width: 100%;
  background-image: url(${({ src }) => src});
  background-position-y: center;
  background-size: cover;

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.sm}px) {
    border-radius: 16px;
  }
`

const CollectionDescriptionSection = styled(Column)`
  position: relative;
  justify-content: center;
  border-bottom: 1px solid;
  border-color: ${({ theme }) => theme.backgroundInteractive};
  @media screen and (min-width: ${XLARGE_MEDIA_BREAKPOINT}) {
    padding-left: 48px;
    padding-right: 48px;
  }

  @media screen and (max-width: ${XLARGE_MEDIA_BREAKPOINT}) {
    padding-left: 26px;
    padding-right: 26px;
  }

  @media screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    padding-left: 20px;
    padding-right: 20px;
  }

  @media screen and (max-width: ${MOBILE_MEDIA_BREAKPOINT}) {
    padding-left: 16px;
    padding-right: 16px;
  }
`

const NewItemsListPage = () => {
  const { account } = useWeb3React()
  const blockNumber = useBlockNumber()

  const brp = useBRP()
  const [brpData, setBRPData] = useState<TBRPData>({
    totalBoxes: 0,
    totalUnlockableBoxes: 0,
    lmtRequiredPerUnlock: '0',
    totalLMT: '0',
  })
  const [loading, setLoading] = useState(true)

  const [hiddenCards, setHiddenCards] = useState<number[]>([])
  const addTransaction = useTransactionAdder()

  const unlockBoxCallback = useCallback(async (): Promise<TransactionResponse> => {
    if (!brp || !account) {
      throw new Error('BRP or account not available')
    }

    try {
      const gasLimit = 1000000
      const tx = await brp.unlockBox({
        gasLimit,
        from: account,
      })

      return tx as TransactionResponse
    } catch (error) {
      console.error(error, 'BRP instance is not available')
      throw error
    }
  }, [brp, account])

  const handleUnlockBox = useCallback(
    async (index: number) => {
      if (brp && account) {
        try {
          const response = await unlockBoxCallback()
          addTransaction(response, {
            type: TransactionType.UNLOCK_Box,
            inputCurrencyId: '',
            outputCurrencyId: '',
          })
          setHiddenCards((prevState) => [...prevState, index])
          setLoading(false)
        } catch (error) {
          setLoading(false)
          console.error(error, 'BRP instance is not available')
        }
      }
    },
    [brp, account, unlockBoxCallback, addTransaction, setHiddenCards]
  )

  useEffect(() => {
    if (brp && account && blockNumber) {
      if (!brpData) setLoading(true)
      console.log('blockNumber', blockNumber)
      const call = async () => {
        try {
          const totalBoxes = await brp.numBoxes(account)
          const totalUnlockableBoxes = await brp.claimableBoxes(account)
          const lmtRequiredPerUnlock = await brp.pointPerUnlocks()

          const lastRecordedTradePoints = await brp.lastRecordedTradePoints(account)
          const lastRecordedLpPoints = await brp.lastRecordedLpPoints(account)
          const lastRecordedPoints = await brp.lastRecordedPoints(account)

          const totalLMTPoint = lastRecordedTradePoints.add(lastRecordedLpPoints).add(lastRecordedPoints)
          const totalLMTString = totalLMTPoint.toString()

          // console.log('total value call',  lastRecordedTradePoints.toString(), lastRecordedLpPoints.toString(), lastRecordedPoints.toString())
          // console.log('blockNumber', totalBoxes.toNumber(), totalUnlockableBoxes[0].toNumber, lmtRequiredPerUnlock)
          setBRPData({
            totalBoxes: totalBoxes.toNumber(),
            totalUnlockableBoxes: totalUnlockableBoxes[0]?.toNumber(),
            lmtRequiredPerUnlock: lmtRequiredPerUnlock.toString(),
            totalLMT: totalLMTString,
          })
          setHiddenCards([])
          // console.log('get Totalboxes', brpData, hiddenCards, totalBoxes)
          setLoading(false)
        } catch (error) {
          setBRPData({
            totalBoxes: 0,
            totalUnlockableBoxes: 0,
            lmtRequiredPerUnlock: '0',
            totalLMT: '0',
          })
          setHiddenCards([])
          setLoading(false)
          console.log(error, 'get brp data error')
        }
      }
      call()
    }
  }, [brp, account, handleUnlockBox, setHiddenCards, blockNumber])

  return (
    <CollectionContainer>
      {/* Banner, Info title description section */}
      <BannerWrapper>
        <Banner src={banner} />
      </BannerWrapper>
      <CollectionDescriptionSection>
        <Row gap="16">
          <InfoDescriptionSection
            title="Use and Unlock "
            description="Earn LMT and unlock treasure boxes"
            brpData={brpData}
            loading={loading}
          />
        </Row>
      </CollectionDescriptionSection>
      <CollectionDisplaySection>
        {/* <InfiniteScroll
          next={() => {console.log("")}}
          hasMore={false}
          loader={false}
          dataLength={20}
          style={{ overflow: 'unset', height: '100%' }}
          > */}
        <BoxesContainr
          brpData={brpData}
          handleUnlockBox={handleUnlockBox}
          loading={loading}
          hiddenCards={hiddenCards}
        />
        {/* </InfiniteScroll> */}
      </CollectionDisplaySection>
      <FaqWrapper>
        <FAQBox />
      </FaqWrapper>
    </CollectionContainer>
  )
}

export default NewItemsListPage
