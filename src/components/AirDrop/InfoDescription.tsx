import { NZT } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { BigNumber } from 'ethers'
import { useTokenContract } from 'hooks/useContract'
import { useSingleCallResult } from 'lib/hooks/multicall'
import { Box } from 'nft/components/Box'
import { Column, Row } from 'nft/components/Flex'
import { TBRPData } from 'pages/AirDrop'
import { useMemo, useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { useAccount, useChainId } from 'wagmi'

import bluePill from '../../assets/images/bluePill.jpg'
import InfoItemStats from './InfoItemStats'

const BluePillImg = styled.img`
  position: absolute;
  width: 155px;
  height: 65px;
  background-color: transparent;
  transform: scale(1.3);
  opacity: 0.8;
  right: -130px;
  bottom: -24px;
  z-index: -999;
`

const DescriptionText = styled(ThemedText.CellName)`
  word-spacing: -0.5px;
`

const TitleDescriptionText = styled(ThemedText.HeadlineMedium)<{ spacing?: number }>`
  word-spacing: ${({ spacing }) => spacing && `${spacing}px`};
  white-space: nowrap;
`

const ProgressBar = styled.progress`
  width: 300px;
`

export const InfoDescription = ({
  title,
  description,
  color,
  fontSize,
  spacing,
}: {
  title?: boolean
  description: string
  color?: string
  fontSize?: number
  spacing?: number
}) => {
  return (
    <Box display="flex" justifyContent="center" position="relative" flexDirection="column">
      <Box>
        {title ? (
          <TitleDescriptionText
            color={color ? color : 'textSecondary'}
            fontSize={fontSize}
            fontWeight={600}
            spacing={spacing}
          >
            {description}
          </TitleDescriptionText>
        ) : (
          <DescriptionText color={color ? color : 'textTertiary'} fontSize={fontSize} marginTop="5px">
            {description}
          </DescriptionText>
        )}
      </Box>
    </Box>
  )
}

const InfoDescriptionSection = ({
  description,
  brpData,
  loading,
}: {
  description: string
  brpData: TBRPData
  loading: boolean
}) => {
  const account = useAccount().address
  const chainId = useChainId()
  const nztContract = useTokenContract(NZT[SupportedChainId.BASE])
  const { result: result, loading: isLoading } = useSingleCallResult(nztContract, 'balanceOf', [
    '0x31EA2dD90Bd140d565726531f402D461E25A5f60' ?? undefined,
  ])
  const { result: result2, loading: isLoading2 } = useSingleCallResult(nztContract, 'balanceOf', [account ?? undefined])
  const [nztPercentage, setNztPercentage] = useState('')

  useMemo(() => {
    if (account && nztContract && chainId === SupportedChainId.BASE && !isLoading && result) {
      const divisor = BigNumber.from(10).pow(18)
      const balance = result?.balance?.div(divisor)
      const baseAmount = BigNumber.from(6942000000)
      const percentage = 100 * ((6942000000 - balance.toNumber()) / 1000000000)
      setNztPercentage(percentage.toString())
    } else {
      setNztPercentage('-')
    }
  }, [result, isLoading, account, chainId])

  const nztBalance: string = useMemo(() => {
    if (account && nztContract && chainId === SupportedChainId.BASE && !isLoading2) {
      const divisor = BigNumber.from(10).pow(18)
      const bal = result2?.balance?.div(divisor).toString()
      return bal
    } else {
      return '-'
    }
  }, [result2, isLoading2, account, chainId])

  return (
    <Column marginTop="40" marginBottom="28" gap="18" marginX="24" flexWrap="wrap">
      <InfoDescription description={description} fontSize={18} />
      <Row alignItems="center">
        <Row position="relative" gap="8" alignItems="center" marginTop="8">
          <ThemedText.CellName fontSize="14px" fontWeight={600} width="min">
            My NZT balance
          </ThemedText.CellName>
          <ThemedText.SubHeader color="textSecondary">{nztBalance}</ThemedText.SubHeader>
          <BluePillImg src={bluePill} />
        </Row>
      </Row>
      <Row gap={'10'} alignItems={'center'}>
        <ThemedText.BodySmall>Total NZT Claimed</ThemedText.BodySmall>
        <ProgressBar value={nztPercentage} max={100} />
        <ThemedText.BodySmall fontSize={12}>{nztPercentage}%</ThemedText.BodySmall>
      </Row>
      <InfoItemStats brpData={brpData} loading={loading} />
    </Column>
  )
}

export default InfoDescriptionSection
