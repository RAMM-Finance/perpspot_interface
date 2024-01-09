import 'react-step-progress-bar/styles.css'

import { useState } from 'react'
//@ts-ignore
import { ProgressBar, Step } from 'react-step-progress-bar'
import { ThemedText } from 'theme'

import star from './star_616489.png'

const TierBar = () => {
  const [accomplished, setAccomplished] = useState(true)

  return (
    <ProgressBar percent={75} filledBackground="linear-gradient(to right, #fefb72, #f0bb31)">
      <Step transition="scale">
        {({ accomplished }: { accomplished: boolean }) => (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '5px' }}>
            <img style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }} width="25" src={star} />
            <ThemedText.BodySmall>Tier 1</ThemedText.BodySmall>
          </div>
        )}
      </Step>
      <Step transition="scale">
        {({ accomplished }: { accomplished: boolean }) => (
          <img style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }} width="25" src={star} />
        )}
      </Step>
      <Step transition="scale">
        {({ accomplished }: { accomplished: boolean }) => (
          <img style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }} width="25" src={star} />
        )}
      </Step>
    </ProgressBar>
  )
}

export default TierBar
