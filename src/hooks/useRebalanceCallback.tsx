import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { useSingleContractWithCallData } from 'lib/hooks/multicall'
import { useCallback, useMemo } from 'react'
import { usePoolKeyList } from 'state/application/hooks'
import { PoolManagerSDK } from 'utils/lmtSDK/PoolManager'
import { useChainId } from 'wagmi'

import { useLmtPoolManagerContract, useLpManager2 } from './useContract'
import { getPoolAddress } from './usePoolsOHLC'

type PricesMap = { [address: string]: number[] }
const strikes: PricesMap = {
  // eth-usdc
  '0xd0b53d9277642d899df5c87a3966a349a798f224': [800, 500, 200000000000000000, 250], // tickoter, innter, util, threshold

  // degen
  '0xc9034c3e7f58003e6ae0c8438e7c8f4598d5acaa': [4500, 3900, 100000000000000000, 500],

  // brett
  '0xba3f945812a83471d709bce9c3ca699a19fb46f7': [4500, 3500, 0, 0],

  // toshi
  '0x4b0aaf3ebb163dd45f663b38b6d93f6093ebc2d3': [4500, 3500, 50000000000000000, 500],

  // aero
  '0x3d5d143381916280ff91407febeb52f2b60f33cf': [4500, 3500, 100000000000000000, 500],

  // okayeg
  '0x58342c302dd4df0531f60dd3c0eabb0c95ac08cb': [4500, 3500, 100000000000000000, 500],

  // spec
  '0x8055e6de251e414e8393b20adab096afb3cf8399': [4500, 3500, 200000000000000000, 500],

  // build
  '0x0f082a7870908f8cebbb2cd27a42a9225c19f898': [4500, 3500, 30000000000000000, 500],

  // higher
  '0xcc28456d4ff980cee3457ca809a257e52cd9cdb0': [4500, 3500, 30000000000000000, 500],
}

const Strikes = new Proxy<PricesMap>(strikes, {
  get: (target, address: string) => (address in target ? target[address] : [5000, 2500, 0, 500]),
})

function delay(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000)
  })
}

// async function runLimTokenRebalanceBase() {
//   const poolList = await poolManager_b.getPoolList()
//   const poolkeys = await Promise.all(
//     Array.from(poolList).map(async (address) => {
//       return await dataProvider_b.getPoolkeys(address)
//     })
//   )

//   const i = 0
//   for (const poolKey of poolkeys) {
//     const params = await poolManager_b.getParams(poolKey)
//     const tickDiscretization = params[1]

//     const strike = Strikes[poolList[i]]

//     if (strike[2] == 0) continue

//     const tickOuter = Math.round(strike[0] / tickDiscretization)
//     const tickInner = Math.round(strike[1] / tickDiscretization)

//     let rebalanceReturn
//     try {
//       rebalanceReturn = await lpmanager2_b
//         .connect(wallet)
//         .callStatic.rebalanceAroundCurrentPrice(
//           poolKey,
//           tickOuter,
//           tickInner,
//           strike[2].toString(),
//           strike[3].toString(),
//           {
//             gasLimit: 50000000,
//           }
//         )
//     } catch (err) {}
//   }
// }

export const useRebalanceCallback = () => {
  const chainId = useChainId()

  const lpmanager2 = useLpManager2(true)
  const poolManager = useLmtPoolManagerContract()
  const { poolList: poolKeyList } = usePoolKeyList()
  const poolManagerCalldatas = useMemo(() => {
    if (poolKeyList) {
      return poolKeyList.map((i) => {
        return PoolManagerSDK.INTERFACE.encodeFunctionData('getParams', [
          {
            token0: i.token0,
            token1: i.token1,
            fee: i.fee,
          },
        ])
      })
    }
    return []
  }, [poolKeyList])
  const paramsCallStates = useSingleContractWithCallData(poolManager, poolManagerCalldatas)

  const loading = useMemo(() => {
    return paramsCallStates.some((i) => {
      return i.loading
    })
  }, [paramsCallStates])
  const error = useMemo(() => {
    return paramsCallStates.some((i) => {
      return i.error || !i.result
    })
  }, [paramsCallStates])

  const poolParams = useMemo(() => {
    if (loading || error) return []

    return paramsCallStates.map((i: any) => i.result)
  }, [paramsCallStates, loading, error])

  return useCallback(async () => {
    // const poolList = await poolManager_b.getPoolList()
    // const poolkeys = await Promise.all(
    //   Array.from(poolList).map(async (address) => {
    //     return await dataProvider_b.getPoolkeys(address)
    //   })
    // )
    // console.log('poolKeylist', poolKeyList)
    if (poolKeyList && poolParams.length > 0 && chainId === SupportedChainId.BASE && lpmanager2) {
      poolKeyList.forEach(async (info, i) => {
        const tickDiscretization = poolParams[i].tickDiscretization
        const poolAddress = getPoolAddress(
          info.token0,
          info.token1,
          info.fee,
          V3_CORE_FACTORY_ADDRESSES[SupportedChainId.BASE]
        )
        const strike = Strikes[poolAddress.toLowerCase()]
        // if(!strike) strike = Strikes[poolAddress]
        if (strike[2] == 0) return

        const tickOuter = Math.round(strike[0] / tickDiscretization)
        const tickInner = Math.round(strike[1] / tickDiscretization)

        let rebalanceReturn
        try {
          rebalanceReturn = await lpmanager2.rebalanceAroundCurrentPrice(
            {
              token0: info.token0,
              token1: info.token1,
              fee: info.fee,
            },
            tickOuter,
            tickInner,
            strike[2].toString(),
            strike[3].toString(),
            {
              gasLimit: 10_000_000,
            }
          )
        } catch (err) {
          console.log('rebalance error', err)
        }
      })
    }
  }, [chainId, lpmanager2, poolKeyList, poolParams])
}
