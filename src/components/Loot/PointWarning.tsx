import { Row } from 'nft/components/Flex'
import { AlertTriangle } from 'react-feather'
import { useTheme } from 'styled-components'
import { ThemedText } from 'theme'

interface IPointWarningProps  {
  isInsufficient: boolean, 
  isInConcatenatedAddresses: boolean, 
  isClaimed: boolean, 
  isNoBoxes:boolean, 
  point: number
}

const PointWarning = ({isInsufficient, isInConcatenatedAddresses, isClaimed, point, isNoBoxes} : IPointWarningProps) => {
  const theme = useTheme()

  return (
    isNoBoxes ? 
    <Row marginLeft="48" gap="8">
      <AlertTriangle size={18} color={theme.accentWarning} />
      <ThemedText.BodyPrimary color="accentWarning">
        Earn LMT to get more boxes. New boxes are airdropped every day
      </ThemedText.BodyPrimary>
    </Row> 
    :
    (isInsufficient && !(isInConcatenatedAddresses && !isClaimed) ? (
    <Row marginLeft="48" gap="8">
      <AlertTriangle size={18} color={theme.accentWarning} />
      <ThemedText.BodyPrimary color="accentWarning">
        Need &apos;{point}&apos; LMT to unlock this box
      </ThemedText.BodyPrimary>
    </Row>
    ) : (
      <Row marginLeft="48" gap="8">
      {/* <AlertTriangle size={18} color={theme.accentSuccess} /> */}
      <ThemedText.BodyPrimary color="accentSuccess">
        Congrats! You are eligible for 20 boxes
      </ThemedText.BodyPrimary>
    </Row>
    ))
  )
}

export default PointWarning