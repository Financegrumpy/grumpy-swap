import React, { useEffect, useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { Widget } from '@typeform/embed-react'

const PageWrapper = styled(AutoColumn)``

const TopSection = styled(AutoColumn)`
  max-width: 768px;
  min-width: 500px;
  width: 100%;
`

export default function Feedback () {
  return (
    <PageWrapper gap="lg" justify="center">
      <TopSection gap="md">
        <Widget id="wrFn178G" style={{ width:"100%", height:"550px" }}/>
      </TopSection>
    </PageWrapper>
  )
}
