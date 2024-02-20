import styled from 'styled-components/macro'

import darkArrowImgSrc from '../About/images/aboutArrowDark.png'
import DetailSection from './DetailSection'

const PageWrapper = styled.div`
  // padding: 10px 14px 0px;
  /* max-width: 1700px; */
  /* display: grid;
  grid-template-columns: 2fr 0.6fr; */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  /* border: solid ${({ theme }) => theme.backgroundOutline};
  border-width: 0 0 1px 0; */
  width: 99.5%;
  height: 100%;
  margin-right: 0.125rem;
  margin-left: 0.125rem;
`

const RightContainer = styled.div`
  grid-row: 1 / 3;
  grid-column: 2;
  height: fit-content;
  position: relative;
  left: 350px;
  scrollbar-width: none;
`
const MainWrapper = styled.article`
  width: 100%;
  height: calc(-88px + 100vh);
  display: flex;
  margin-top: 20px;
`
const LeftTabWrapper = styled.main`
  position: fixed;
  min-width: 340px;
  max-width: 340px;
  height: 100vh;
  flex-flow: row nowrap;
  align-items: space-evenly;
  margin-bottom: 0.5rem;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  background-color: ${({ theme }) => theme.backgroundSurface};
  padding: 16px;
  border: none;
  border-radius: 10px;
`

const LeftTabContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0px;
  background: transparent;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
`

const TabElement = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 6px 8px;
  justify-content: flex-start;
  height: 100%;
  border: none;
  border-radius: 10px;
  color: ${({ theme }) => theme.accentTextLightSecondary};
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.2s ease-in-out 0s;
  :hover {
    user-select: initial;
    color: ${({ theme }) => theme.textSecondary};
    background-color: ${({ theme }) => theme.accentActionSoft};
  }
`
const StyledIcon = styled.img`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(24, 24, 30);
  border-radius: 12px;
  height: 40px;
  width: 40px;
  margin-right: 10px;
  border: none;
`

const TabList = [
  {
    id: 1,
    title: 'Overview',
    // color : '',
    icon: darkArrowImgSrc,
  },
  {
    id: 2,
    title: 'Positions',
    // color : '',
    icon: darkArrowImgSrc,
  },
  {
    id: 3,
    title: 'Open Orders',
    //color :,
    icon: darkArrowImgSrc,
  },
  {
    id: 4,
    title: 'Open History',
    //color :,
    icon: darkArrowImgSrc,
  },
  {
    id: 5,
    title: 'Trade History',
    //color :
    icon: darkArrowImgSrc,
  },
  {
    id: 6,
    title: 'Funding History',
    //color :
    icon: darkArrowImgSrc,
  },
  {
    id: 7,
    title: 'Transfres and Rewards',
    //color :
    icon: darkArrowImgSrc,
  },
]

const ScaffoldingAccount = () => {
  return (
    <PageWrapper>
      <MainWrapper>
        {/* Left Tab */}
        <LeftTabWrapper>
          <LeftTabContent>
            {TabList.map((tab) => (
              <TabElement key={tab.id}>
                {/* icon 삽입해야함 */}
                <StyledIcon src={tab.icon} alt="icon" />
                <p>{tab.title}</p>
              </TabElement>
            ))}
          </LeftTabContent>
        </LeftTabWrapper>
        {/* MainContainer */}
        <RightContainer>
          <DetailSection />
        </RightContainer>
      </MainWrapper>
    </PageWrapper>
  )
}

export default ScaffoldingAccount
