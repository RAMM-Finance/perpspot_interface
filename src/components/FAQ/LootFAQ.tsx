import { ArrowUpRight } from 'react-feather'
import { ThemedText } from 'theme'

import { FaqElement } from '.'

const LootFAQ = () => {
  return (
    <>
      <FaqElement>
        <a
          href="https://limitless.gitbook.io/limitless/tokenomics-and-roadmap/use-and-loot"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ThemedText.BodySecondary fontSize={15} fontWeight={800}>
            Use and Loot
          </ThemedText.BodySecondary>
        </a>
        <ArrowUpRight size="20" />
      </FaqElement>{' '}
      <ThemedText.BodyPrimary fontSize={15} fontWeight={800}>
        To better understand how to take advantage of this program please read our documentation.
      </ThemedText.BodyPrimary>
    </>
  )
}

export default LootFAQ
