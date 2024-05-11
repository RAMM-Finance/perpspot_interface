import { ArrowUpRight } from 'react-feather'
import { ThemedText } from 'theme'

import { FaqElement } from '.'

const LMTFAQ = () => {
  return (
    <>
      <FaqElement>
        <a
          href="https://limitless.gitbook.io/limitless/tokenomics-and-roadmap/lmt"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ThemedText.BodySecondary fontSize={15} fontWeight={800}>
            Earning with LMT
          </ThemedText.BodySecondary>
        </a>
        <ArrowUpRight size="20" />
      </FaqElement>{' '}
      <FaqElement>
        <a
          href="https://limitless.gitbook.io/limitless/incentives-and-tokenomics/usdnzt"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ThemedText.BodySecondary fontSize={15} fontWeight={800}>
            Learn more about $NZT tokens 
          </ThemedText.BodySecondary>
        </a>
        <ArrowUpRight size="20" />
      </FaqElement>{' '}
      <ThemedText.BodyPrimary fontSize={15} fontWeight={800}>
        To better understand how to earn with LMT, please read our documentation.
      </ThemedText.BodyPrimary>
    </>
  )
}

export default LMTFAQ
