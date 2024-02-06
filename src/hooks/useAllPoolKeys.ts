import { ethers } from 'ethers'
import { client } from 'graphql/limitlessGraph/limitlessClients'
import { PoolAddedQuery } from 'graphql/limitlessGraph/queries'
import { useMemo } from 'react'
import { useQuery } from 'react-query'

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

const useAllPoolKeys = () => {
  const { data, isLoading, isError } = useQuery(['allPoolKeys'], {
    queryFn: async () => {
      const poolQueryData = await client.query(PoolAddedQuery, {}).toPromise()
      return poolQueryData.data.poolAddeds
        .filter(
          (val: Pool) =>
            val.token0 !== '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1' &&
            val.token1 !== '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1' &&
            ethers.utils.getAddress(val.token0) !== '0x4Cb9a7AE498CEDcBb5EAe9f25736aE7d428C9D66' &&
            ethers.utils.getAddress(val.token1) !== '0x4Cb9a7AE498CEDcBb5EAe9f25736aE7d428C9D66'
        )
        .map((val: Pool) => {
          return { token0: val.token0, token1: val.token1, fee: val.fee }
        })
    },
    keepPreviousData: true,
  })

  return useMemo(() => {
    return {
      poolKeys: data,
      isLoading,
      isError,
    }
  }, [data, isLoading, isError])
}

export default useAllPoolKeys
