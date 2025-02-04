import { Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { AutoColumn } from 'components/Column'
import { SupportedChainId } from 'constants/chains'
import { FakeTokens_MUMBAI, FakeTokens_SEPOLIA } from 'constants/fake-tokens'
import { useFaucetCallback } from 'hooks/useApproveCallback'
import { MaxButton } from 'pages/Pool/styleds'
import { useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

const PageWrapper = styled(AutoColumn)`
  padding: 68px 8px 0px;
  max-width: 870px;
  width: 100%;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    max-width: 800px;
  `};

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    max-width: 500px;
  `};

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding-top: 48px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding-top: 20px;
  }
`

const FaucetsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 20px;
  margin-top: 16px;
`

const GenesisAddressses = [
  '0x515c07dd7cd01496d4000e4998b4fd5acd2c09e1',
  '0x65f106ec944aF77914d6DF5EaC6488a147a5d054',
  '0xaEe294951f2B69b8C7720Eed7FF05DbB4B184a86',
  '0x565d380416a2889b817c6eb493f6deef029212aa',
  '0xc56bc1a93909508b0f6e57a32a5c2cc8b4940c08',
  '0x68f3f77ee50da27966f29fd55a7fd0ac79008ca7',
  '0x6c3C002d8d56A886995d0817C582db34C43B6838',
  '0xd24a9A9f594b038A6cFb91370BC8014D28201009',
  '0x77F1812f662F4b006a47173138fA8d63988E07C2',
  '0x81e0d167c507D0fA487B6c8E2a625C4c7F69355C',
  '0x4dD37c7c4a687E7378D5621e30802f7444d10203',
  '0xd309efbd1410d595Aeb610dDE0eb7A2E087B42Bc',
  '0xFE49F9193ef934f403455016A191e208dc2374E8',
  '0x4C83B45346cA7B7e88446cA7A856CFFD91fB7f5e',
  '0x97891BaD4d43DF73b658D6E16918D0D3dAD0cB5d',
  '0x8b5A8a28CbB06fe60E0Caa727efE03d796197c75',
  '0x1eef8295a36be966d845a040c610c502d41cc78b',
  '0xE9Fe5801b049494BedE09F2800CfE3bE09C81D9b',
  '0x37D34B424dC624a41fE412ab1460d1e0eBEfb8aF',
  '0x8b5A8a28CbB06fe60E0Caa727efE03d796197c75',
  '0x0C5567DDB9eEA6A66365D55Bc5302567B288b978',
  '0xe49D0d8CF01Ea366D804CC84738A768F0b8b175e',
  '0x48b576c87e788a762D6f95A456f2A39113b46950',
  '0xEead444F622Cb4F19Bb33c7D4DeF50FD99936A05',
  '0x4a875FcBc55cA3c85E572B94aFf88c316477c002',
  '0x83910f3e3e0064C15fF2fe043dD042855861D05d',
  '0x641b4f0a4A8fa3F497a4F7Db652e68853A39c3bA',
  '0x823CAc15b19c19D61BfB1938bfc25cA2728695e6',
  '0xb3334C3c7d2f7da1585dCa8dD20FF04076e4D943',
  '0x94535DE0Ee84f36343c539285183a98784f5257c',
  '0xF5B4C93a02B7264F5bCF6443cDC70728cEd257c8',
  '0x4E0f323765b291bdC5E8B76c59B8bd998cAfd4C8',
  '0x0df7565ea754b26653c1DE40A1371748bCADc6BC',
  '0x20BC83ED9B48b1AeedFd9789f268EbD4E1f22445',
  '0x55F5601357f6e0B10a3386914c93916c6C9A368A',
  '0xCa05CCfeFFF373D45207470c7aED4d6083502Bb9',
  '0x1B269FB63D9C9DC99575b910E9BC7d2Ef1af8B0C',
  '0xFAb738889b445D589f85727C05fCb16C935B19BE',
  '0x020bBD8Da240afe4B9E5144eefe71E4286a948Cc',
  '0x5881d9bfff787c8655a9b7f3484ae1a6f7a966e8',
  '0xD2a7D8EC1466Cb3C531EAC23819cA9Fc249F35D8',
  '0xd27bfA0BB69bd04cB869660b2EF97ACf0Ee3A707',
  '0x3bd51E640c0595EeF8a9Ff05341C4819a15e38EE',
  '0x204C6162ac3E56F57A976C509Ca0b347D564B483',
  '0xC74AB274E594fdC1b5dBD32479F5A25ab7FD8f66',
  '0x47866cB4ed65BFE68436B1174c060C58c09fFE56',
  '0xacF1Dea72FF8faE372BedE5f6Ee1A082B1f453E3',
  '0x0E99f7d366711f8cCf05Eaf871f72D37AbEC1937',
  '0x3AA667D05a6aa1115cF4A533C29Bb538ACD1300c',
  '0xcF1Cf25e5CD7aEA5f86D8400d600411BE1d85D90',
  '0x7eaA6946C99107C71090bDf52C45b0d5eAdd642D',
  '0xbb095b350EF47d17138AA3e85cD2503054cc6c51',
  '0x37D34B424dC624a41fE412ab1460d1e0eBEfb8aF',
  '0x637E72adc1b21A06FC3765f3a654f01BE60311f0',
  '0x82028A9A47ae3a9AF38FD249f84e587bd7Dbd1Fe',
  '0x48b576c87e788a762D6f95A456f2A39113b46950',
  '0xF467f1f46CAD3F1041c765765be2891245144F6E',
  '0x56140b52879D5b6D03449B912193c7b18210A7af',
  '0xd8dc994FE2b075c697e5051c89b713Bf15fa9294',
  '0x6ED0B92553d2be567d0b1245aE4e66cBd1ADe51f',
  '0x5c87aa10cd753ebf828ad352aef786e289065a57',
  '0x2C7Cb3cB22Ba9B322af60747017acb06deB10933',
  '0x64c714e37469878f2e6eaa9564727720Eb6B7094',
  '0x5fc026Ab7F7C6ac62c62e4382F7FF3d37e2C2a75',
]

export default function FaucetsPage() {
  const { account, provider, chainId } = useWeb3React()

  const [isHolder, setHolder] = useState<boolean>()

  const FakeTokens = chainId === SupportedChainId.SEPOLIA ? FakeTokens_SEPOLIA : FakeTokens_MUMBAI

  useEffect(() => {
    const getBeacon = async () => {
      if (account && provider && chainId === SupportedChainId.SEPOLIA) {
        try {
          const result = await fetch(`https://beacon.degenscore.com/v1/beacon/${account.toLowerCase()}`)
          setHolder(result.status === 200)
        } catch (err) {
          console.log(err)
        }
      }
    }
    if (account) {
      if (GenesisAddressses.find((val) => val.toLowerCase() === account.toLowerCase())) {
        setHolder(true)
      } else {
        getBeacon()
      }
    }
  }, [account, provider, chainId])

  return (
    <PageWrapper>
      <AutoColumn>
        <ThemedText.HeadlineLarge>Faucet</ThemedText.HeadlineLarge>
      </AutoColumn>
      <FaucetsContainer>
        {account &&
          provider &&
          isHolder &&
          chainId === SupportedChainId.SEPOLIA &&
          FakeTokens.map((token, i) => {
            return <Faucet key={i} token={token} />
          })}
        {!account || !provider ? (
          <ThemedText.DeprecatedLargeHeader>Connect Account</ThemedText.DeprecatedLargeHeader>
        ) : chainId !== SupportedChainId.SEPOLIA ? (
          <ThemedText.DeprecatedLargeHeader>Connect to Sepolia</ThemedText.DeprecatedLargeHeader>
        ) : isHolder === false ? (
          <ThemedText.DeprecatedLargeHeader>Must be Beacon Owner...</ThemedText.DeprecatedLargeHeader>
        ) : null}
      </FaucetsContainer>
    </PageWrapper>
  )
}

const Faucet = ({ token }: { token: Token }) => {
  const { account } = useWeb3React()
  const onClick = useFaucetCallback(token, account)
  return (
    <AutoColumn>
      <MaxButton width="100px" onClick={onClick}>
        Faucet {token.symbol}
      </MaxButton>
    </AutoColumn>
  )
}
