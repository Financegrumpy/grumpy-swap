import React, { useEffect, useState } from 'react'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import styled from 'styled-components'
import { ExternalLink, TYPE } from '../../theme'
import { RowBetween, RowFixed, AutoRow } from '../../components/Row'
import { CardBGImage, CardNoise, CardSection, DataCard } from '../../components/earn/styled'
import {
  useUserDelegatee,
} from '../../state/governance/hooks'
import DelegateModal from '../../components/vote/DelegateModal'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import { UNI, ZERO_ADDRESS } from '../../constants'
import { TokenAmount, ChainId, Token } from '@uniswap/sdk-core'
import { JSBI } from '@uniswap/v2-sdk'
import { useModalOpen, useToggleDelegateModal } from '../../state/application/hooks'
import { ApplicationModal } from '../../state/application/actions'
import useUSDCPrice from '../../hooks/useUSDCPrice'

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
  padding: 10px;
`

const grumpyContractAddress = '0x93b2fff814fcaeffb01406e80b4ecd89ca6a021b';

export default function Vote() {
  const { account, chainId } = useActiveWeb3React()

  //
  const [grumpyBalance, setGrumpyBalance] = useState('-')
  const [grumpyBalanceWithoutRedistribution, setGrumpyBalanceWithoutRedistribution] = useState('-')
  const [redistributedAmount, setRedistributedAmount] = useState('-')
  const [totalIn, setTotalIn] = useState('-')
  const [totalOut, setTotalOut] = useState('-')
  //

  function formatPrice(price: number) {
    if (price > 0) {
      return (price / 1000000).toLocaleString().slice(0, -4)
    }

    return price.toString()
  }

  async function getGrumpyBalance(account: string) {
    const balance_api = new URL("https://api.etherscan.io/api")

    balance_api.searchParams.append("module", "account")
    balance_api.searchParams.append("action", "tokenbalance")
    balance_api.searchParams.append("contractaddress", grumpyContractAddress)
    balance_api.searchParams.append("address", account)
    balance_api.searchParams.append("tag", "latest")
    balance_api.searchParams.append("apikey", "SZYGYXBA7K6ECH7DHB3QX2MR7GJZQK2M8P")

    const balanceReq = await fetch(balance_api.href)
    const balanceRes = await balanceReq.json()
    const balance = parseFloat(balanceRes.result)
    console.log('Your grumpy balance is: ', balance)
    setGrumpyBalance(formatPrice(balance))

    //
    const transactions_api = new URL("https://api.etherscan.io/api")
    transactions_api.searchParams.append("module", "account")
    transactions_api.searchParams.append("action", "tokentx")
    transactions_api.searchParams.append("contractaddress", grumpyContractAddress)
    transactions_api.searchParams.append("address", account)
    transactions_api.searchParams.append("page", "1")
    transactions_api.searchParams.append("offset", "10000")

    const transactionReq = await fetch(transactions_api.href)
    const transactionRes = await transactionReq.json()
    const transaction = transactionRes.result

    let totalIn = 0.0
    let totalOut = 0.0

    for (const item of transaction) {
      // console.log('item:', item)

      if (item.to === account.toLowerCase()) {
        totalIn += parseFloat(item.value)
      }
      else {
        totalOut += parseFloat(item.value)
      }
    }

    const balanceWithoutRedistribution = totalIn - totalOut
    const redistribution = (balance - balanceWithoutRedistribution);

    setTotalIn(formatPrice(totalIn))
    setTotalOut(formatPrice(totalOut))
    setRedistributedAmount(formatPrice(redistribution))
    setGrumpyBalanceWithoutRedistribution(formatPrice(balanceWithoutRedistribution))

    // return fetch(etherscan_url.href);
  }

  useEffect(() => {
    getGrumpyBalance((account) ? account : '')
  }, [])

  // toggle for showing delegation modal
  const showDelegateModal = useModalOpen(ApplicationModal.DELEGATE)
  const toggleDelegateModal = useToggleDelegateModal()

  // user data
  const uniBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, chainId ? UNI[chainId] : undefined)
  const userDelegatee: string | undefined = useUserDelegatee()

  // show delegation option if they have have a balance, but have not delegated
  const showUnlockVoting = Boolean(
    uniBalance && JSBI.notEqual(uniBalance.raw, JSBI.BigInt(0)) && userDelegatee === ZERO_ADDRESS
  )

  return (
    <PageWrapper gap="lg" justify="center">
      <DelegateModal
        isOpen={showDelegateModal}
        onDismiss={toggleDelegateModal}
        title={showUnlockVoting ? 'Unlock Votes' : 'Update Delegation'}
      />
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
                  $GRUMPY charges a 1% transaction fee which is then shared proportionally among $GRUMPY holders! Sit back and passively earn on your investment. Awful, right?
                </TYPE.white>
              </RowBetween>
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </InfoCard>
      </TopSection>

      <TopSection gap="2px">
        <WrapSmall>
          <TYPE.mediumHeader style={{ margin: '0.5rem 0.5rem 0.5rem 0', flexShrink: 0 }}>Wallet</TYPE.mediumHeader>
        </WrapSmall>
        <MainContentWrapper>
          <AutoColumn gap="sm">
            <TYPE.body textAlign="center">Your $GRUMPY Balance</TYPE.body>
            <TYPE.largeHeader textAlign="center">{grumpyBalance}</TYPE.largeHeader>
          </AutoColumn>
        </MainContentWrapper>
      </TopSection>

      <TopSection gap="2px">
        <WrapSmall>
          <TYPE.mediumHeader style={{ margin: '0.5rem 0.5rem 0.5rem 0', flexShrink: 0 }}>Activity</TYPE.mediumHeader>
        </WrapSmall>
        <MainContentWrapper>
          <AutoColumn gap="lg">
            <AutoRow justify="center">
              <PaddedAutoColumn gap="sm">
                <TYPE.body textAlign="center">Total $GRUMPY In</TYPE.body>
                <TYPE.largeHeader textAlign="center">{totalIn}</TYPE.largeHeader>
              </PaddedAutoColumn>

              <PaddedAutoColumn gap="sm">
                <TYPE.body textAlign="center">Total $GRUMPY Out</TYPE.body>
                <TYPE.largeHeader textAlign="center">{totalOut}</TYPE.largeHeader>
              </PaddedAutoColumn>
            </AutoRow>

            <AutoColumn gap="sm">
              <TYPE.body textAlign="center">Redistributed $GRUMPY</TYPE.body>
              <TYPE.largeHeader textAlign="center">{redistributedAmount}</TYPE.largeHeader>
            </AutoColumn>

            <AutoColumn gap="sm">
              <TYPE.body textAlign="center">$GRUMPY Balance without Redistribution</TYPE.body>
              <TYPE.largeHeader textAlign="center">{grumpyBalanceWithoutRedistribution}</TYPE.largeHeader>
            </AutoColumn>
          </AutoColumn>
        </MainContentWrapper>
      </TopSection>
      {/* <TYPE.subHeader color="text3">
        A minimum threshhold of 1% of the total UNI supply is required to submit proposals
      </TYPE.subHeader> */}
    </PageWrapper>
  )
}
