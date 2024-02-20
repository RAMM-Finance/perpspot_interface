import styled from 'styled-components/macro'

import Overview from './Overview'

const Container = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  width: 80vw;
  max-width: 80vw;
  justify-content: flex-start;
  align-content: center;
  margin-left: 0.5rem;
`

const MiddleContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.backgroundSurface};
  padding: 32px;
  border-radius: 10px;
`

const RightSideContaier = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 0.25rem;
  width: 100%;
  height: 100%;
`

const DetailSection = () => {
  return (
    <Container>
      <MiddleContainer>
        <Overview />
      </MiddleContainer>

      <RightSideContaier>
        <div>오른쪽 사이드</div>
      </RightSideContaier>
    </Container>
  )
}

export default DetailSection
