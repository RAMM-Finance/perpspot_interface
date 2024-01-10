import 'react-step-progress-bar/styles.css'

import { useMemo } from 'react'
//@ts-ignore
import { ProgressBar, Step } from 'react-step-progress-bar'
import { ThemedText } from 'theme'

import star from './star_616489.png'

const TierBar = ({ tier }: { tier?: number }) => {
  const percentage = useMemo(() => {
    return tier === 1 ? 0 : tier === 2 ? 50 : tier === 3 ? 100 : 0
  }, [tier])
  return (
    <ProgressBar height={6} percent={percentage} filledBackground="linear-gradient(to right, #869EFF, #3783fd)">
      <Step transition="scale">
        {({ accomplished }: { accomplished: boolean }) => (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '5px',
              marginTop: '15px',
            }}
          >
            <img style={{ filter: `grayscale(${accomplished ? 0 : 90}%)` }} width="20" src={star} />
            <ThemedText.BodySmall>Tier 1</ThemedText.BodySmall>
          </div>
        )}
      </Step>
      <Step transition="scale">
        {({ accomplished }: { accomplished: boolean }) => (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '5px',
              marginTop: '15px',
            }}
          >
            <img style={{ filter: `grayscale(${accomplished ? 0 : 90}%)` }} width="20" src={star} />
            <ThemedText.BodySmall>Tier 2</ThemedText.BodySmall>
          </div>
        )}
      </Step>
      <Step transition="scale">
        {({ accomplished }: { accomplished: boolean }) => (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '35px',
              gap: '5px',
              marginTop: '15px',
            }}
          >
            <img style={{ filter: `grayscale(${accomplished ? 0 : 90}%)` }} width="20" src={star} />
            <ThemedText.BodySmall>Tier 3</ThemedText.BodySmall>
          </div>
        )}
      </Step>
    </ProgressBar>
  )
}

export default TierBar
