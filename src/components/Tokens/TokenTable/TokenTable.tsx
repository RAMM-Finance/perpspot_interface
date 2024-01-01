import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { SupportedChainId } from 'constants/chains'
import { PAGE_SIZE, useTopTokens } from 'graphql/data/TopTokens'
import { validateUrlChainParam } from 'graphql/data/util'
import { client } from 'graphql/limitlessGraph/limitlessClients'
import { PoolAddedQuery,
  AddQuery,
  CollectQuery,
  DecreaseLiquidityQuery,
  IncreaseLiquidityQuery,
  ReduceQuery,
 } from 'graphql/limitlessGraph/queries'
import { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { AlertTriangle } from 'react-feather'
import { useParams } from 'react-router-dom'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

// import {useToken} from 'hooks/Tokens'
import { MAX_WIDTH_MEDIA_BREAKPOINT } from '../constants'
// import { PHeaderRow, PLoadedRow, PLoadingRow } from './PairsRow'
import { PHeaderRow, PLoadedRow } from './PairsRow'
import { HeaderRow, LoadingRow } from './TokenRow'
import {usdValue} from "hooks/useContract"
import {usePoolsData} from "hooks/useLMTPools"
const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  // max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT};
  /* max-width: 1480px; */
  /* background-color: ${({ theme }) => theme.background}; */
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.05), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  margin-left: auto;
  margin-right: auto;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
`

const TokenDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`

const NoTokenDisplay = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 60px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 16px;
  font-weight: 500;
  align-items: center;
  padding: 0px 28px;
  gap: 8px;
`

function NoTokensState({ message }: { message: ReactNode }) {
  return (
    <GridContainer>
      <HeaderRow />
      <NoTokenDisplay>{message}</NoTokenDisplay>
    </GridContainer>
  )
}

const LoadingRows = ({ rowCount }: { rowCount: number }) => (
  <>
    {Array(rowCount)
      .fill(null)
      .map((_, index) => {
        return <LoadingRow key={index} first={index === 0} last={index === rowCount - 1} />
      })}
  </>
)

// function LoadingTokenTable({ rowCount = PAGE_SIZE }: { rowCount?: number }) {
//   return (
//     <GridContainer>
//       <HeaderRow />
//       <TokenDataContainer>
//         <LoadingRows rowCount={rowCount} />
//       </TokenDataContainer>
//     </GridContainer>
//   )
// }

function LoadingTokenTable({ rowCount = PAGE_SIZE }: { rowCount?: number }) {
  return (
    <GridContainer>
      {/* <PHeaderRow /> */}
      <TokenDataContainer>
        <LoadingRows rowCount={rowCount} />
      </TokenDataContainer>
    </GridContainer>
  )
}

// export default function TokenTable() {
//   const chainName = validateUrlChainParam(useParams<{ chainName?: string }>().chainName)
//   const { tokens, tokenSortRank, loadingTokens, sparklines } = useTopTokens(chainName)

//   /* loading and error state */
//   if (loadingTokens && !tokens) {
//     return <LoadingTokenTable rowCount={PAGE_SIZE} />
//   } else if (!tokens) {
//     return (
//       <NoTokensState
//         message={
//           <>
//             <AlertTriangle size={16} />
//             <Trans>An error occurred loading tokens. Please try again.</Trans>
//           </>
//         }
//       />
//     )
//   } else if (tokens?.length === 0) {
//     return <NoTokensState message={<Trans>No tokens found</Trans>} />
//   } else {
//     return (
//       <GridContainer>
//         <HeaderRow />
//         <TokenDataContainer>
//           {tokens.map(
//             (token, index) =>
//               token?.address && (
//                 <LoadedRow
//                   key={token.address}
//                   tokenListIndex={index}
//                   tokenListLength={tokens.length}
//                   token={token}
//                   sparklineMap={sparklines}
//                   sortRank={tokenSortRank[token.address]}
//                 />
//               )
//           )}
//         </TokenDataContainer>
//       </GridContainer>
//     )
//   }
// }

export default function TokenTable() {
  const chainName = validateUrlChainParam(useParams<{ chainName?: string }>().chainName)
  const { tokens, tokenSortRank, loadingTokens, sparklines } = useTopTokens(chainName)

  const [data, setData] = useState<any>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()

  interface Pool {
    blockTimeStamp: string
    fee: number
    id: string
    pool: string
    tickDiscretization: number
    token0: string
    token1: string
    __typename: string
  }

  useEffect(() => {
    // if (!trader || loading || !blockNumber || (lastBlockNumber && lastBlockNumber + 2 > blockNumber)) return
    if (!client || !PoolAddedQuery || loading || error) return
    const call = async () => {
      try {
        setLoading(true)

        const poolQueryData = await client.query(PoolAddedQuery, {}).toPromise()

        setData(
          poolQueryData.data.poolAddeds.map((val: Pool) => {
            return [val.token0, val.token1, val.fee]
          })
        )
        setLoading(false)
      } catch (error) {
        setError(error)
        setLoading(false)
      }
    }
    call()
  }, [])

  const poolData = usePoolsData()
  console.log('poolData', poolData, data)

  const levManagerAddreses = ['0x184773ef390325BEbe7d49d8481A5914B35c6c4C']
  // const _tokens = levManagerAddreses.map((value: string)=>{
  //   const leverageManager = useLeverageManagerContract(value)
  //   const { result: token0_, loading, error } = useSingleCallResult(leverageManager, 'token0', [])
  //   const { result: token1_, loading: l, error:e } = useSingleCallResult(leverageManager, 'token1', [])
  //   const token0 = useToken(token0_?.toString())
  //   const token1 = useToken(token1_?.toString())
  //   // names, price, percentchange, tvl, volume
  //   // const token0_ = useTokenContract(token0);
  //   // const token1_ = useTokenContract(token1);

  //   // const{ result: name0, loading: l0, error:e0 } = useSingleCallResult(token0_, 'name', [])
  //   // const{ result: name1, loading: l1, error:e1 } = useSingleCallResult(token1_, 'name', [])

  //   return {token0, token1}
  // } )
  // const tokenAddresses = [
  //   ['0x569f3140FDc0f3B9Fc2E4919C35f35D39dd2B01A', '0x4E3F175b38098326a34F2C8B2D07AF5fFdfc6fA9'],
  //   ['0x569f3140FDc0f3B9Fc2E4919C35f35D39dd2B01A', '0xf24Ce4A61c1894219576f652cDF781BBB257Ec8F'],
  //   ['0x4E3F175b38098326a34F2C8B2D07AF5fFdfc6fA9', '0xf24Ce4A61c1894219576f652cDF781BBB257Ec8F'],
  // ]
  // const _tokens = tokenAddresses.map((value: string[]) => {
  //   const token0 = useToken(value[0])
  //   const token1 = useToken(value[1])
  //   return { token0, token1 }
  // })

  const { chainId, account, provider } = useWeb3React()

  /* loading and error state */
  if (chainId !== SupportedChainId.SEPOLIA || !account || !provider) {
    return (
      <GridContainer>
        <Trans>Connect Wallet to Sepolia</Trans>
      </GridContainer>
    )
  } else if (loadingTokens && !tokens) {
    return <LoadingTokenTable rowCount={PAGE_SIZE} />
  } else if (!tokens) {
    return (
      <NoTokensState
        message={
          <>
            <AlertTriangle size={16} />
            <Trans>An error occurred loading tokens. Please try again.</Trans>
          </>
        }
      />
    )
  } else if (tokens?.length === 0) {
    return <NoTokensState message={<Trans>No tokens found</Trans>} />
  } else {
    return (
      <>
        <PairInfoContainer>
          <TVLInfoContainer />
          <HowToDetails />
        </PairInfoContainer>
        <GridContainer>
          <PHeaderRow />
          <TokenDataContainer>
            {data &&
              data.map((dat: string[]) => (
                <PLoadedRow key={dat[0]} tokenListIndex={1} tokenListLength={1} tokenA={dat[0]} tokenB={dat[1]} />
              ))}
          </TokenDataContainer>
        </GridContainer>
      </>
    )
  }
}

const PairInfoContainer = styled.div`
  display: flex;
  margin-left: auto;
  margin-right: auto;
  // max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT};
  padding-bottom: 2rem;
  padding-top: 1rem;
  justify-content: space-between;
`

const TVLInfo = styled.div`
  width: 15rem;
  background-color: ${({ theme }) => theme.backgroundSurface};
  padding: 0.75rem;
  border-radius: 10px;
  font-size: 0.8rem;
  height: 2.5rem;
  border: solid 1px ${({ theme }) => theme.backgroundOutline};
`
const HowTo = styled.div`
  width: 35rem;
  background-color: ${({ theme }) => theme.backgroundSurface};
  padding: 0.75rem;
  border-radius: 10px;
  font-size: 0.8rem;
  margin-left: 1rem;
  border: solid 1px ${({ theme }) => theme.backgroundOutline};
`

function TVLInfoContainer() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <TVLInfo>
        <ThemedText.SubHeader fontSize={15}>TVL:</ThemedText.SubHeader>
      </TVLInfo>
      <TVLInfo>
        <ThemedText.SubHeader fontSize={15}> Total Debt:</ThemedText.SubHeader>
      </TVLInfo>
      <TVLInfo>
        <ThemedText.SubHeader fontSize={15}>Volume:</ThemedText.SubHeader>
      </TVLInfo>
    </div>
  )
}

function HowToDetails() {
  return (
    <HowTo>
      <ThemedText.HeadlineSmall>How It Works</ThemedText.HeadlineSmall>
      <p>
        Liquidity Providers (LPs) earn spot-trading fees while capital is lent out. They also earn fees in the form of
        premiums when capital is being utlized.
      </p>
      <p>LPs can deposit their existing Non-Fungible Token Position (NFT) or create a new LP Position</p>
    </HowTo>
  )
}
