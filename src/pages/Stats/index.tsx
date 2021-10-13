import React, { useEffect, useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import { RowBetween, AutoRow } from '../../components/Row'
import { CardBGImage, CardNoise, CardSection, DataCard } from '../../components/earn/styled'
import { useActiveWeb3React } from '../../hooks'
import logo from '../../assets/images/pawth-logo-transparent.png'
import strayCat from '../../assets/images/strayCat.png'
import kitten from '../../assets/images/kitten.png'
import dwarfCat from '../../assets/images/dwarfCat.png'
import maineCoon from '../../assets/images/maineCoon.png'
import abbysinian from '../../assets/images/abbysinian.png'
import siamese from '../../assets/images/siamese.png'
import sandCat from '../../assets/images/sandCat.png'
import serval from '../../assets/images/serval.png'
import puma from '../../assets/images/puma.png'
import jaguar from '../../assets/images/jaguar.png'
import blackPanther from '../../assets/images/blackPanther.png'
import tiger from '../../assets/images/tiger.png'
import lion from '../../assets/images/lion.png'

const PageWrapper = styled(AutoColumn)``

const TopSection = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const InfoCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`

const WrapSmall = styled(RowBetween)`
  margin-bottom: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
  `};
`

const MainContentWrapper = styled.main`
  background-color: ${({ theme }) => theme.bg0};
  padding: 32px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
`
const PaddedAutoColumn = styled(AutoColumn)`
  padding: 12px;
`

const ethescanApiKey = 'SZYGYXBA7K6ECH7DHB3QX2MR7GJZQK2M8P'
const ethplorerApiKey = 'freekey'
const grumpyContractAddress = '0xaecc217a749c2405b5ebc9857a16d58bdc1c367f'

export default function Stats() {
  const { account } = useActiveWeb3React()

  const [grumpyBalance, setGrumpyBalance] = useState(0)
  const [pawthRank, setPawthRank] = useState({ name: '', img: '' })
  const [grumpyBalanceWithoutRedistribution, setGrumpyBalanceWithoutRedistribution] = useState(0)
  const [redistributedAmount, setRedistributedAmount] = useState(0)
  const [totalIn, setTotalIn] = useState(0)
  const [totalOut, setTotalOut] = useState(0)
  const [price, setPrice] = useState('-')
  const [marketCap, setMarketCap] = useState('-')
  const [grumpyUsdValue, setGrumpyUsdValue] = useState('-')

  function formatPrice(price: number) {
    if (price > 0) {
      const priceString = (price / 1000000000).toLocaleString('en-US', {
        maximumFractionDigits: 0,
      })

      return priceString
    }

    return price.toString()
  }

  function formatPriceUsd(price: number) {
    if (price > 0) {
      return (price / 1000000000).toLocaleString('en-US', {
        maximumFractionDigits: 0,
      })
    }

    return price.toString()
  }

  async function getGrumpyStats(balance: number) {
    const stats_api = new URL('https://api.ethplorer.io/getTokenInfo/0xaecc217a749c2405b5ebc9857a16d58bdc1c367f')
    stats_api.searchParams.append('apiKey', ethplorerApiKey)

    const statsReq = await fetch(stats_api.href)
    const statsRes = await statsReq.json()

    if (!statsRes.hasOwnProperty('error')) {
      const price = statsRes.price
      const userGrumpyValueInUsd = balance * price.rate

      setPrice(price.rate ? '$' + price.rate.toFixed(11) : '-')
      setMarketCap(
        price.rate 
        ?
          '$' +
            price.marketCapUsd.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })
        :
          '-'
      )
      setGrumpyUsdValue(
        isNaN(userGrumpyValueInUsd) 
        ?
          '-'
        :
          '$' + formatPriceUsd(userGrumpyValueInUsd)
      )
    }
  }

  async function getWallet() {
    if (account) {
      const balance = await getGrumpyBalance(account) + 2000
      const tx = await getGrumpyTransaction(account, balance)
      const rank = await getPawthRank(balance)
      getGrumpyStats(balance)

      setGrumpyBalance(balance)
      setPawthRank(rank)

      setTotalIn(tx.totalIn)
      setTotalOut(tx.totalOut)
      setRedistributedAmount(tx.redistribution)
      setGrumpyBalanceWithoutRedistribution(tx.balanceWithoutRedistribution)
    }
  }

  async function getGrumpyBalance(account: string) {
    const balance_api = new URL('https://api.etherscan.io/api')

    balance_api.searchParams.append('module', 'account')
    balance_api.searchParams.append('action', 'tokenbalance')
    balance_api.searchParams.append('contractaddress', grumpyContractAddress)
    balance_api.searchParams.append('address', account)
    balance_api.searchParams.append('tag', 'latest')
    balance_api.searchParams.append('apikey', ethescanApiKey)

    const balanceReq = await fetch(balance_api.href)
    const balanceRes = await balanceReq.json()
    const balance = parseFloat(balanceRes.result)
    console.log('balance', balance)

    return balance
  }

  async function getGrumpyTransaction(account: string, balance: number) {
    const transactions_api = new URL('https://api.etherscan.io/api')

    transactions_api.searchParams.append('module', 'account')
    transactions_api.searchParams.append('action', 'tokentx')
    transactions_api.searchParams.append('contractaddress', grumpyContractAddress)
    transactions_api.searchParams.append('address', account)
    transactions_api.searchParams.append('page', '1')
    transactions_api.searchParams.append('offset', '10000')
    transactions_api.searchParams.append('apikey', ethescanApiKey)

    const transactionReq = await fetch(transactions_api.href)
    const transactionRes = await transactionReq.json()
    const transaction = transactionRes.result

    let totalIn = 0.0
    let totalOut = 0.0

    for (const item of transaction) {
      if (item.to === account.toLowerCase()) {
        totalIn += parseFloat(item.value)
      } else {
        totalOut += parseFloat(item.value)
      }
    }

    const balanceWithoutRedistribution = totalIn - totalOut
    const redistribution = balance - balanceWithoutRedistribution

    return { totalIn, totalOut, redistribution, balanceWithoutRedistribution }
  }

  async function getPawthRank(balance: number) {
    return (balance <= 1000) ? { name: 'Stray Cat', img: strayCat }
    : (balance <= 5000) ? { name: 'Kitten', img: kitten }
    : (balance <= 10000) ? { name: 'Dwarf Cat', img: dwarfCat }
    : (balance <= 25000) ? { name: 'Maine Coon', img: maineCoon }
    : (balance <= 50000) ? { name: 'Abbysinian', img: abbysinian }
    : (balance <= 100000) ? { name: 'Siamese', img: siamese }
    : (balance <= 250000) ? { name: 'Sand Cat', img: sandCat }
    : (balance <= 500000) ? { name: 'Serval', img: serval }
    : (balance <= 1000000) ? { name: 'Puma', img: puma }
    : (balance <= 2500000) ? { name: 'Jaguar', img: jaguar }
    : (balance <= 5000000) ? { name: 'Black Panther', img: blackPanther }
    : (balance <= 10000000) ? { name: 'Tiger', img: tiger }
    : { name: 'Lion', img: lion }
  }

  useEffect(() => {
    getWallet()
  }, [account])

  return (
    <PageWrapper gap="lg" justify="center">
      <TopSection gap="md">
        <InfoCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>Information</TYPE.white>
              </RowBetween>
              <RowBetween>
                <TYPE.white fontSize={14}>
                  Pawthereum is a decentralized community-run charity cryptocurrency that aims to help animal charities and shelters all over the world.
                </TYPE.white>
              </RowBetween>
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </InfoCard>
      </TopSection>

      {account ? (
        <TopSection gap="md">
          <TopSection gap="2px">
            <WrapSmall>
              <TYPE.mediumHeader style={{ margin: '0.5rem 0.5rem 0.5rem 0', flexShrink: 0 }}>Wallet</TYPE.mediumHeader>
            </WrapSmall>
            <MainContentWrapper>
              <AutoColumn gap="lg">
                <AutoColumn gap="md" justify="center">
                  <img src={logo} alt="Logo" style={{ width: 100, height: 100 }} />
                </AutoColumn>
                <AutoColumn gap="sm">
                  <TYPE.body textAlign="center">Your $PAWTH Balance</TYPE.body>
                  <TYPE.largeHeader textAlign="center">{formatPrice(grumpyBalance)}</TYPE.largeHeader>
                </AutoColumn>
                <AutoColumn gap="sm">
                  <TYPE.body textAlign="center">Your $PAWTH USD Value</TYPE.body>
                  <TYPE.largeHeader textAlign="center">{grumpyUsdValue}</TYPE.largeHeader>
                </AutoColumn>
                { grumpyBalance ? (
                  <AutoColumn gap="sm">
                    <TYPE.body textAlign="center">Your $PAWTH Rank</TYPE.body>
                    <TYPE.body textAlign="center">
                      <img src={pawthRank.img} alt="Logo" style={{ width: 100, height: 100 }} />
                    </TYPE.body>
                    <TYPE.largeHeader textAlign="center">{pawthRank.name}</TYPE.largeHeader>
                  </AutoColumn>
                ) : '' }
                <AutoColumn gap="sm">
                  <AutoRow justify="center">
                    <PaddedAutoColumn gap="sm">
                      <TYPE.body textAlign="center">Price</TYPE.body>
                      <TYPE.largeHeader textAlign="center">{price}</TYPE.largeHeader>
                    </PaddedAutoColumn>

                    <PaddedAutoColumn gap="sm">
                      <TYPE.body textAlign="center">Market Cap</TYPE.body>
                      <TYPE.largeHeader textAlign="center">{marketCap}</TYPE.largeHeader>
                    </PaddedAutoColumn>
                  </AutoRow>
                </AutoColumn>
              </AutoColumn>
            </MainContentWrapper>
          </TopSection>

          <TopSection gap="2px">
            <WrapSmall>
              <TYPE.mediumHeader style={{ margin: '0.5rem 0.5rem 0.5rem 0', flexShrink: 0 }}>
                Activity
              </TYPE.mediumHeader>
            </WrapSmall>
            <MainContentWrapper>
              <AutoColumn gap="lg">
                <AutoRow justify="center">
                  <PaddedAutoColumn gap="sm">
                    <TYPE.body textAlign="center">Total $PAWTH In</TYPE.body>
                    <TYPE.largeHeader textAlign="center">{formatPrice(totalIn)}</TYPE.largeHeader>
                  </PaddedAutoColumn>

                  <PaddedAutoColumn gap="sm">
                    <TYPE.body textAlign="center">Total $PAWTH Out</TYPE.body>
                    <TYPE.largeHeader textAlign="center">{formatPrice(totalOut)}</TYPE.largeHeader>
                  </PaddedAutoColumn>
                </AutoRow>

                <AutoColumn gap="sm">
                  <TYPE.body textAlign="center">$PAWTH Reflections Earned</TYPE.body>
                  <TYPE.largeHeader textAlign="center">{formatPrice(redistributedAmount)}</TYPE.largeHeader>
                </AutoColumn>

                <AutoColumn gap="sm">
                  <TYPE.body textAlign="center">$PAWTH Balance without Reflections</TYPE.body>
                  <TYPE.largeHeader textAlign="center">
                    {formatPrice(grumpyBalanceWithoutRedistribution)}
                  </TYPE.largeHeader>
                </AutoColumn>
              </AutoColumn>
            </MainContentWrapper>
          </TopSection>
        </TopSection>
      ) : (
        <TopSection gap="2px">
          <WrapSmall>
            <TYPE.mediumHeader style={{ margin: '0.5rem 0.5rem 0.5rem 0', flexShrink: 0 }}>Wallet</TYPE.mediumHeader>
          </WrapSmall>
          <MainContentWrapper>
            <AutoColumn gap="lg" justify="center">
              <img src={logo} alt="Logo" style={{ width: 100, height: 100, padding: 20 }} />
            </AutoColumn>
            <AutoColumn gap="sm">
              <TYPE.body textAlign="center">Connect your wallet to see your $PAWTH stats</TYPE.body>
            </AutoColumn>
          </MainContentWrapper>
        </TopSection>
      )}
    </PageWrapper>
  )
}
