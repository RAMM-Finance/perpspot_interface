import { BigNumber } from '@ethersproject/bignumber'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { client } from 'graphql/limitlessGraph/limitlessClients'
import {
  AddQuery,
  CollectQuery,
  DecreaseLiquidityQuery,
  DepositVaultQuery,
  IncreaseLiquidityQuery,
  ReduceQuery,
  RegisterQuery,
  WithdrawVaultQuery,
} from 'graphql/limitlessGraph/queries'
import { tokenDecimal, usdValue, useBRP, useDataProviderContract, useReferralContract } from 'hooks/useContract'
import { useLmtLpPositionsFromTokenIds } from 'hooks/useV3Positions'
import { useEffect, useMemo, useState } from 'react'
import { firestore } from '../../firebaseConfig'
import { collection, getDocs, addDoc, doc, updateDoc, where, query } from 'firebase/firestore'

interface AddPositionData {
  trader: string
}

export const NewAddQuery = `
  query {
    marginPositionIncreaseds(where: { blockTimestamp_gte: 1707318334 }) {
      pool
      positionIsToken0
      trader
      addedAmount      
      blockTimestamp
    }
  }
`

export const CollectMultipler = 250
export const VaultDivisor = 200000
export const referralDivisor = 3

function calculateTimeWeightedDeposits(vaultDataByAddress: any) {
  if (!vaultDataByAddress) return undefined

  const timeWeightedDepositsByTrader: { [key: string]: any } = {}

  Object.keys(vaultDataByAddress).forEach((trader) => {
    const transactions = vaultDataByAddress[trader]

    // Sort transactions by timestamp
    transactions.sort((a: any, b: any) => a.blockTimestamp - b.blockTimestamp)

    let timeWeightedDeposit = 0
    let currentAmount = 0
    let lastTimestamp = Number(transactions[0].blockTimestamp)

    transactions.forEach((transaction: any) => {
      // Time since last transaction
      const timeDelta = Number(transaction.blockTimestamp) - lastTimestamp
      lastTimestamp = Number(transaction.blockTimestamp)
      timeWeightedDeposit += timeDelta * currentAmount

      // Update current amount based on deposit or withdrawal
      if (transaction.type === 'deposit') {
        currentAmount += Number(transaction.shares) / 1e18
      } else if (transaction.type === 'withdraw') {
        currentAmount -= Number(transaction.shares) / 1e18
        if (currentAmount < 0) currentAmount = 0
      }

      // current amount = 0* 0 300* 26
      // 150, 150*
    })

    const lastTimeDelta = Date.now() / 1000 - lastTimestamp

    timeWeightedDeposit += lastTimeDelta * currentAmount

    // Save the final calculated value for the trader
    timeWeightedDepositsByTrader[trader] = {
      timeWeighted: timeWeightedDeposit / VaultDivisor,
      currentAmount,
    }
  })

  return timeWeightedDepositsByTrader
}

const addresses = [
  ethers.utils.getAddress('0x69f8d754c5f4f73aad00f3c22eafb77aa57ff1bc'),
  ethers.utils.getAddress('0xef7f2e81ea14538858d962df34eb1bfda83da395'),
  ethers.utils.getAddress('0x15175d508dd136a6d8cf0b0edec191cccbfef8ca'),
  ethers.utils.getAddress('0x5e46f0d1b3e1cf21d584fb557f98eb3ea4a19059'),
  ethers.utils.getAddress('0x5d47e5d242a8f66a6286b0a2353868875f5d6068'),
  ethers.utils.getAddress('0xeca622a39c03ab4cb191bc09c9cc0dadb216eadd'),
  ethers.utils.getAddress('0x420f5a4a8ea8905f9e00dbf4c7a13f568b183fea'),
  ethers.utils.getAddress('0xc74ab274e594fdc1b5dbd32479f5a25ab7fd8f66'),
  ethers.utils.getAddress('0xf9107317b0ff77ed5b7adea15e50514a3564002b'),
  ethers.utils.getAddress('0x3d1d397acd3b0989d9e633d6dbf7e6f8f5c03a2d'),
  ethers.utils.getAddress('0xf3bdf46dd9036eae38373bb4b98c144e3f3b67c2'),
  ethers.utils.getAddress('0x03894d4ac41dd6c4c2f524ed4417c90fa46972c6'),
  ethers.utils.getAddress('0x3e3672b23eb22946a31263d2d178bf0fb1f4bbfd'),
  ethers.utils.getAddress('0x43a996fa50d2f378d707aca9ddcde1c30cb68f63'),
  ethers.utils.getAddress('0xd0a0584ca19068cdcc08b7834d8f8df969d67bd5'),
  ethers.utils.getAddress('0x64da461ecbaa3fec3625f21b74a8c74394d501c9'),
  ethers.utils.getAddress('0x489d69939b4aca357f630055e351a81f1fbb7fb6'),
]

const traders = [
  '0x0C5567DDB9eEA6A66365D55Bc5302567B288b978',
  '0x3A0AEa3511918412CFE2B779E8C8Ac0E378580Db',
  '0x5A4B09693CcaA2c3218592D0bAFa7788A01F4600',
  '0x5C87aA10cd753Ebf828AD352aef786e289065A57',
  '0x6ED0B92553d2be567d0b1245aE4e66cBd1ADe51f',
  '0x64dA461ECbAa3FEC3625F21b74a8c74394d501c9',
  '0x69f8D754C5f4F73aad00f3C22EaFB77Aa57Ff1BC',
  '0x489D69939b4Aca357f630055e351A81F1Fbb7Fb6',
  '0x03894d4ac41Dd6C4c2f524eD4417C90fA46972c6',
  '0x6799e4fb8bEc9eaB7496c98B4668DDef146Ef6E0',
  '0xA576c23C77E4bc1c33aAFbC53E4d030d904F8Db3',
  '0xBC02E19F1272216b3D2EDDf1b4Ef30eEA1B170eB',
  '0xCD129EED8079258CFA9aBB2C653BB736b2277419',
  '0xD0A0584Ca19068CdCc08b7834d8f8DF969D67bd5',
  '0xF3b7dfDE0C8184adA828E7F7F3Cb02472C40105B',
  '0xFdbBfB0Fe2986672af97Eca0e797D76A0bbF35c9',
  '0xaB888291F4127352B655fd476F64AC2ebfb8fe76',
  '0xb92505a3364B7C7E333c05B44cE1E55377fC43cA',
]
// const tradesPrev{
//   340,
//   2392.202,
//   1300,
//   700,
//   0.5,
//   12000,
//   140,
//   2000,
// }

const sharesPrev = [
  52000463060652438154582, 10656463060652438154582, 9920046306065243815458, 2130046306065243815458,
  1225046306065243815458, 528004630606524381545, 507004630606524381545, 123004630606524381545, 119004630606524381545,
  107004630606524381545, 53104630606524381545, 28104630606524381545, 24404630606524381545, 11904630606524381545,
  10670463060652438154, 0, 0,
]
function getPrevVaultPoints(timeWeightedDepositsByTrader: any) {
  const timeWeightedDeposits = [
    200000, 80000, 35000, 15000, 5000, 5000, 2000, 1000, 500, 500, 500, 500, 500, 500, 500, 500, 500,
  ]
  let i = 0

  addresses.forEach((address: any) => {
    if (timeWeightedDepositsByTrader[address]?.timeWeighted > 0) {
      timeWeightedDepositsByTrader[address].timeWeighted += timeWeightedDeposits[i]
    } else {
      timeWeightedDepositsByTrader[address] = {
        timeWeighted: timeWeightedDeposits[i],
        currentAmount: 0,
      }
    }

    if (address == '0xD0A0584Ca19068CdCc08b7834d8f8DF969D67bd5') {
      timeWeightedDepositsByTrader[address].timeWeighted = 0
    }
    i++
  })

  return timeWeightedDepositsByTrader

  // vault current amount
  // tw deposits for new
}

function getPrevLPPoints(LlpPositionsByUniqueLps: any) {}

function getPrevTradePoints(tradeProcessedByTrader: any) {
  traders.forEach((trader: any) => {
    if (!tradeProcessedByTrader[trader]) {
      tradeProcessedByTrader[trader] = []
    }
    tradeProcessedByTrader[trader].push({
      token: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
      amount: 3000,
      trader,
    })
  })
  return tradeProcessedByTrader
}

export function useStoredData(addresses: any) {
  const { chainId } = useWeb3React()
  const brp = useBRP()

  const [pointsData, setPointsData] = useState<any>()

  useEffect(() => {
    if (!brp) return

    const call = async () => {
      try {
        const addresses = await brp.getUsers()
        const [tradePoints, lpPoints_, referralPoints] = await brp.getData(addresses)

        const dataPromises = addresses.map(async (address: any, index: any) => {
          // Convert BigNumber to number. Adjust precision as needed.
          let tPoints = tradePoints[index].toNumber()

          const q = query(
            collection(firestore, 'swap-points'), 
            where('account', '==', address),
            where('chainId', '==', chainId)
          )

          const querySnapshot = await getDocs(q)
          const data = querySnapshot.docs.map(doc => doc.data())
          
          if (data[0] && data[0].amount) {
            tPoints += data[0].amount
          }

          const lpPoints = lpPoints_[index].toNumber()
          const rPoints = referralPoints[index].toNumber()
          const totalPoints = tPoints + lpPoints + rPoints

          return { lpPoints, rPoints, tPoints, totalPoints, trader: address }
        })

        const data = await Promise.all(dataPromises)

        // Rank the data based on totalPoints
        const rankedData = data.map((item: any, index: any, arr: any) => {
          // Determine rank based on totalPoints
          const rank =
            arr
              .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
              .findIndex((sortedItem: any) => sortedItem.trader === item.trader) + 1
          return { ...item, rank }
        })

        setPointsData(rankedData)
      } catch (err) {
        console.log('prev data errr', err)
      }
    }
    call()
  }, [brp, addresses])

  return pointsData
}

export function usePointsData() {
  const [uniqueTokenIds, setUniqueTokenIds] = useState<BigNumber[]>([])
  const [uniquePools, setUniquePools] = useState<any>([])
  const [uniqueTokens, setUniqueTokens] = useState<any>()
  const { account, chainId } = useWeb3React()
  const [addData, setAddData] = useState<any>()
  const [reduceData, setReduceData] = useState<any>()
  const [addLiqData, setAddLiqData] = useState<any>()
  const [decreaseLiqData, setDecreaseLiqData] = useState<any>()
  const [codeUsers, setCodeUsers] = useState<any>([])
  const [uniqueReferrers, setUniqueReferrers] = useState<any>([])
  const [collectData, setCollectData] = useState<any>()
  const [codeUserPerReferrer, setCodeUserPerReferrer] = useState<any>()
  const [referralMultipliers, setReferralMultipliers] = useState<any>()
  const [vaultDataByAddress, setVaultByAddress] = useState<any>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()
  // const nfpm = useLmtNFTPositionManager()
  const dataProvider = useDataProviderContract()
  const referralContract = useReferralContract()

  const { positions: lpPositions, loading: lpPositionsLoading } = useLmtLpPositionsFromTokenIds(uniqueTokenIds)

  const uniqueLps = new Set<string>()
  lpPositions?.forEach((entry: any) => {
    if (!uniqueLps.has(ethers.utils.getAddress(entry.operator))) {
      uniqueLps.add(ethers.utils.getAddress(entry.operator))
    }
  })

  useEffect(() => {
    if (!client || !AddQuery || loading || error || !referralContract) return
    const call = async () => {
      try {
        setLoading(true)
        const AddQueryData = await client.query(AddQuery, {}).toPromise()
        const ReduceQueryData = await client.query(ReduceQuery, {}).toPromise()
        const AddLiqQueryData = await client.query(IncreaseLiquidityQuery, {}).toPromise()
        const CollectQueryData = await client.query(CollectQuery, {}).toPromise()
        const DecreaseLiquidityData = await client.query(DecreaseLiquidityQuery, {}).toPromise()
        const DepositQuery = await client.query(DepositVaultQuery, {}).toPromise()
        const WithdrawQuery = await client.query(WithdrawVaultQuery, {}).toPromise()
        const registerQueryData = await client.query(RegisterQuery, {}).toPromise()
        console.log('DepositQuery', DepositQuery?.data?.deposits, WithdrawQuery?.data?.withdraws)

        const vaultDataByAddress: { [key: string]: any } = {}
        DepositQuery?.data?.deposits.forEach((entry: any) => {
          const lp = ethers.utils.getAddress(entry.owner)
          if (!vaultDataByAddress[lp]) {
            vaultDataByAddress[lp] = []
          }
          const newEntry = {
            blockTimestamp: entry.blockTimestamp,
            shares: entry.shares,
            type: 'deposit',
          }
          vaultDataByAddress[lp].push(newEntry)
        })
        const i = 0
        // addresses.forEach((address:any)=>{
        //   if (!vaultDataByAddress[address]) {
        //     vaultDataByAddress[address] = []
        //   }
        //   vaultDataByAddress[address].push({
        //       blockTimestamp: "1707349156",
        //       shares: sharesPrev[i],
        //       type:'deposit'
        //     })
        //   i++
        // })
        // "1707349156"
        WithdrawQuery?.data?.withdraws.forEach((entry: any) => {
          const lp = ethers.utils.getAddress(entry.owner)
          if (vaultDataByAddress[lp]) {
            const newEntry = {
              blockTimestamp: entry.blockTimestamp,
              shares: entry.shares,
              type: 'withdraw',
            }
            vaultDataByAddress[lp].push(newEntry)
          }
        })
        setVaultByAddress(vaultDataByAddress)

        const uniqueTokenIds = new Set<string>()
        const uniqueTraders = new Set<string>()

        AddLiqQueryData?.data?.increaseLiquidities.forEach((entry: any) => {
          if (!uniqueTokenIds.has(entry.tokenId)) {
            uniqueTokenIds.add(entry.tokenId)
          }
        })

        const pools = new Set<string>()
        AddQueryData?.data?.marginPositionIncreaseds.forEach((entry: any) => {
          // const poolContract = usePoolContract(entry.pool)
          if (!pools.has(entry.pool)) {
            pools.add(entry.pool)
          }
          const trader = ethers.utils.getAddress(entry.trader)
          if (!uniqueTraders.has(trader)) {
            uniqueTraders.add(trader)
          }
        })

        let codeUsers
        if (account) {
          try {
            codeUsers = await referralContract?.getReferees(account)
          } catch (err) {}
        }

        const uniquePools = Array.from(pools)
        const uniqueTokens_ = new Map<string, any>()
        try {
          const tokens = await Promise.all(
            Array.from(pools).map(async (pool: any) => {
              const token = await dataProvider?.getPoolkeys(pool)
              if (token) {
                if (!uniqueTokens_.has(pool)) {
                  uniqueTokens_.set(pool, [token[0], token[1]])
                }
                return { pool: (token[0], token[1]) }
              } else return null
            })
          )
          setUniqueTokens(uniqueTokens_)
        } catch (err) {
          console.log('tokens fetching ', err)
        }

        const codesUsers: { [key: string]: any } = {}
        const referralMultipliers: { [key: string]: any } = {}

        registerQueryData?.data.registerCodes.forEach((entry: any) => {
          const referrer = ethers.utils.getAddress(entry.account)
          if (!uniqueTraders.has(referrer)) {
            uniqueTraders.add(referrer)
          }
        })
        const uniqueReferrers = Array.from(uniqueTraders).concat(['0xD0A0584Ca19068CdCc08b7834d8f8DF969D67bd5'])

        try {
          await Promise.all(
            uniqueReferrers.map(async (referrer: any) => {
              let codeUsers
              let referralMultiplier
              try {
                codeUsers = await referralContract?.getReferees(referrer)
                referralMultiplier = await referralContract?.referralMultipliers(referrer)
              } catch (err) {}
              if (codeUsers) {
                if (!codesUsers[referrer]) codesUsers[referrer] = []
                codeUsers.forEach((user: string) => {
                  if (!codesUsers[referrer].includes(user)) {
                    codesUsers[referrer].push(user)
                  }
                })
              }
              if (referralMultiplier) {
                referralMultipliers[referrer] = referralMultiplier.toNumber() + 1
              }
            })
          )
          setCodeUserPerReferrer(codesUsers)
          setReferralMultipliers(referralMultipliers)
        } catch (err) {
          console.log('codeusererr', err)
        }

        setCodeUsers(codeUsers)
        const bigNumberTokenIds = Array.from(uniqueTokenIds).map((id) => BigNumber.from(id))
        setUniqueTokenIds(bigNumberTokenIds)
        setUniqueReferrers(uniqueReferrers)
        setUniquePools(uniquePools)
        setAddData(AddQueryData.data.marginPositionIncreaseds)
        setReduceData(ReduceQueryData.data.marginPositionReduceds)
        setAddLiqData(AddLiqQueryData.data.increaseLiquidities)
        setDecreaseLiqData(DecreaseLiquidityData.data.decreaseLiquidities)
        setCollectData(CollectQueryData.data.collects)
        setLoading(false)
      } catch (error) {
        setError(error)
        setLoading(false)
      }
    }
    call()
  }, [account, referralContract])

  // console.log('lpPositions',lpPositions, collectData )

  const PointsData = useMemo(() => {
    const addDataProcessed = addData?.map((entry: any) => ({
      token: entry.positionIsToken0 ? uniqueTokens?.get(entry.pool)?.[0] : uniqueTokens?.get(entry.pool)?.[1],
      trader: entry.trader,
      amount: entry.addedAmount,
    }))
    const reduceDataProcessed = reduceData?.map((entry: any) => ({
      token: entry.positionIsToken0 ? uniqueTokens?.get(entry.pool)?.[0] : uniqueTokens?.get(entry.pool)?.[1],
      trader: entry.trader,
      amount: entry.reduceAmount,
    }))

    let tradeProcessedByTrader: { [key: string]: any } = {}
    tradeProcessedByTrader = getPrevTradePoints(tradeProcessedByTrader)
    addDataProcessed?.forEach((entry: any) => {
      const trader = ethers.utils.getAddress(entry.trader)
      if (!tradeProcessedByTrader[trader]) {
        tradeProcessedByTrader[trader] = []
      }
      const newEntry = entry
      newEntry.amount = (usdValue[entry.token] * entry.amount) / 10 ** tokenDecimal[entry.token]
      tradeProcessedByTrader[trader].push(newEntry)
    })
    reduceDataProcessed?.forEach((entry: any) => {
      const trader = ethers.utils.getAddress(entry.trader)

      if (!tradeProcessedByTrader[trader]) {
        tradeProcessedByTrader[trader] = []
      }
      const newEntry = entry
      newEntry.amount = (usdValue[entry.token] * entry.amount) / 10 ** tokenDecimal[entry.token]

      tradeProcessedByTrader[trader].push(newEntry)
    })

    const lpPositionsByUniqueLps: { [key: string]: any } = {}
    lpPositions?.forEach((entry: any) => {
      const sameTokenIdCollects = collectData.filter((collect: any) => {
        if (collect.tokenId == entry.tokenId.toString()) {
          return true
        }
        return false
      })

      const sameTokenIdDecreases = decreaseLiqData.filter((decrease: any) => {
        if (decrease.tokenId == entry.tokenId.toString()) {
          return true
        }
        return false
      })

      let amount0Collected = 0
      let amount1Collected = 0
      for (let i = 0; i < sameTokenIdCollects.length; i++) {
        amount0Collected = amount0Collected + Number(sameTokenIdCollects[i].amount0)
        amount1Collected = amount1Collected + Number(sameTokenIdCollects[i].amount1)
      }
      for (let i = 0; i < sameTokenIdDecreases.length; i++) {
        amount0Collected = amount0Collected - Number(sameTokenIdDecreases[i].amount0)
        amount1Collected = amount1Collected - Number(sameTokenIdDecreases[i].amount1)
      }
      amount0Collected = amount0Collected > 0 ? amount0Collected : 0
      amount1Collected = amount1Collected > 0 ? amount1Collected : 0

      let lpAddress = ethers.utils.getAddress(entry.operator)
      if (sameTokenIdCollects.length > 0 || lpAddress == '0x0000000000000000000000000000000000000000')
        lpAddress = ethers.utils.getAddress(sameTokenIdCollects[0].recipient)
      if (!lpPositionsByUniqueLps[lpAddress]) {
        lpPositionsByUniqueLps[lpAddress] = []
      }

      lpPositionsByUniqueLps[lpAddress].push({
        token0: entry.token0,
        token1: entry.token1,
        tokenId: entry.tokenId.toString(),
        amount0Collected: (usdValue[entry.token0] * amount0Collected) / 10 ** tokenDecimal[entry.token0],
        amount1Collected: (usdValue[entry.token1] * amount1Collected) / 10 ** tokenDecimal[entry.token1],
      })
    })

    let timeWeightedDeposits = calculateTimeWeightedDeposits(vaultDataByAddress)
    if (vaultDataByAddress && timeWeightedDeposits) {
      timeWeightedDeposits = getPrevVaultPoints(timeWeightedDeposits)

      addresses.forEach((address: string) => {
        if (!lpPositionsByUniqueLps[address]) {
          lpPositionsByUniqueLps[address] = []
        }
      })

      Object.keys(vaultDataByAddress).forEach((address: string) => {
        if (!lpPositionsByUniqueLps[address]) {
          lpPositionsByUniqueLps[address] = []
        }
      })
    }

    return {
      tradeProcessedByTrader,
      lpPositionsByUniqueLps,
      timeWeightedDeposits,
    }
  }, [
    account,
    uniqueLps,
    uniqueTokens,
    addData,
    reduceData,
    addLiqData,
    lpPositions,
    decreaseLiqData,
    collectData,
    codeUsers,
    codeUserPerReferrer,
    referralMultipliers,
    vaultDataByAddress,
  ])

  const tradeProcessedByTrader = PointsData.tradeProcessedByTrader
  const lpPositionsByUniqueLps = PointsData.lpPositionsByUniqueLps
  const timeWeightedDeposits = PointsData.timeWeightedDeposits
  const refereeActivity = useMemo(() => {
    if (!codeUserPerReferrer) return
    const result: { [key: string]: any } = {}
    uniqueReferrers.forEach((referrer: string) => {
      const codeUsers = codeUserPerReferrer[referrer]
      let collectAmount = 0
      let tradeAmount = 0
      let vaultAmount = 0
      let totalVaultDeposits = 0
      codeUsers?.forEach((address: any) => {
        if (address != referrer)
          lpPositionsByUniqueLps?.[address]?.forEach((position: any) => {
            collectAmount += Number(position.amount0Collected) * CollectMultipler // TODO use position.token0 and get prices
            collectAmount += Number(position.amount1Collected) * CollectMultipler // TODO use position.token1 and get prices
          })
      })

      codeUsers?.forEach((address: any) => {
        tradeProcessedByTrader?.[address]?.forEach((trade: any) => {
          if (ethers.utils.getAddress(trade.trader) != referrer) tradeAmount += Number(trade.amount) // TODO use trade.token and get prices
        })
      })

      codeUsers?.forEach((address: any) => {
        if (timeWeightedDeposits?.[address]) {
          vaultAmount += timeWeightedDeposits?.[address].timeWeighted
          totalVaultDeposits += timeWeightedDeposits?.[address].currentAmount
        }
      })

      result[referrer] = {
        lpAmount: collectAmount + vaultAmount,
        tradeVolume: tradeAmount,
        usersReferred: codeUsers && codeUsers.length,
        point: referralMultipliers[referrer] * (tradeAmount + collectAmount + vaultAmount),
        tier: referralMultipliers[referrer],
        vaultDeposits: totalVaultDeposits,
        timeWeightedDeposits: vaultAmount,
      }
    })

    return result
  }, [account, codeUsers, uniqueReferrers, lpPositionsByUniqueLps, tradeProcessedByTrader])

  console.log('collectData', tradeProcessedByTrader, lpPositionsByUniqueLps, refereeActivity)
  return useMemo(() => {
    return {
      tradeProcessedByTrader,
      lpPositionsByUniqueLps,
      refereeActivity,
      timeWeightedDeposits,
    }
  }, [account, addData, addLiqData, reduceData, collectData, lpPositions, loading, error])
}
