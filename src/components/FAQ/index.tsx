import { useWeb3React } from '@web3-react/core'
import { ArrowUpRight } from 'react-feather'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

export const FaqWrapper = styled.div`
  margin: 50px auto;
  width: 48%;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  max-width: 500px;
`

export const FaqElement = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  :hover {
    cursor: pointer;
    opacity: 75%;
  }
`

const FAQBox = () => {
  const { chainId } = useWeb3React()
  return (
    <>
      {chainId === 8453 ? (
        <>
          <FaqElement>
            <a href="https://limitless.gitbook.io/limitless/intro/limweth" target="_blank" rel="noopener noreferrer">
              <ThemedText.BodySecondary fontSize={15} fontWeight={800}>
                Earning with limWETH
              </ThemedText.BodySecondary>
            </a>
            <ArrowUpRight size="20" />
          </FaqElement>{' '}
          <ThemedText.BodyPrimary fontSize={15} fontWeight={800}>
            Read our limWETH documentation to better understand how to earn.
          </ThemedText.BodyPrimary>
        </>
      ) : (
        <>
          <FaqElement>
            <a
              href="https://limitless.gitbook.io/limitless/intro/limitless-lp-token-llp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ThemedText.BodySecondary fontSize={15} fontWeight={800}>
                Earning with LLP
              </ThemedText.BodySecondary>
            </a>
            <ArrowUpRight size="20" />
          </FaqElement>{' '}
          <ThemedText.BodyPrimary fontSize={15} fontWeight={800}>
            Read our LLP documentation to better understand how to earn.
          </ThemedText.BodyPrimary>
        </>
      )}
    </>
  )
}

export default FAQBox
