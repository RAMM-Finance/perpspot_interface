import { Row } from 'nft/components/Flex'
import { AlertTriangle } from 'react-feather'
import { useTheme } from 'styled-components'
import { ThemedText } from 'theme'

const PointWarning = ({point} : {point: number}) => {
  const theme = useTheme()

  return (
    <Row marginLeft="48" gap="8">
      <AlertTriangle size={18} color={theme.accentWarning} />
      <ThemedText.BodyPrimary color="accentWarning">
        Need &apos;{point}&apos; LMT to unlock this box
      </ThemedText.BodyPrimary>
    </Row>
  )
}

export default PointWarning