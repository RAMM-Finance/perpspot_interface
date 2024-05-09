import { Row } from 'nft/components/Flex'
import { AlertTriangle } from 'react-feather'
import { useTheme } from 'styled-components'
import { ThemedText } from 'theme'

const PointWarning = ({isInsufficient, point} : {isInsufficient: boolean, point: number}) => {
  const theme = useTheme()

  return (
    isInsufficient ? (
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
    )
    
  )
}

export default PointWarning