import { ComposedChart, ResponsiveContainer, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import styled from 'styled-components/macro'
import { StatsData } from 'hooks/useStatsData'
import { CombinedDataByDay } from 'hooks/useStatsData'

const ChartHeader = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
`

const ChartContainer = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const startDate = new Date('2022-04-01');
const endDate = new Date('2022-05-30');

const data: any[] = [];

let line = 0

for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
  const formattedDate = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })
  const tvl = Math.floor(Math.random() * 1000)
  line += tvl

  data.push({ timestamp: formattedDate, tvl, line })
}



const TVLChart = (props: any) => {

  let line2 = 0;
  const formattedData = props?.combinedDataByDay?.map((item: any) => {
    const date = new Date(item.timestamp * 1000);
    const formattedDate = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
    line2 += item.tvl;
    return { 
      timestamp: formattedDate, 
      tvl: item.tvl, 
      line: line2 };
  });

  console.log("STATS DATAA", props.combinedDataByDay)
  console.log("DATAA", data)
  console.log("FORMATTED DATAA", formattedData)
  return (
    <ChartContainer>
      <ChartHeader>TVL</ChartHeader>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={formattedData}
          margin={{
            top: 20, right: 20, bottom: 20, left: 20,
          }}
          syncId="syncA"
        >
          <CartesianGrid strokeDasharray="5 5" stroke="#808080" />
          <XAxis tick={{ fontSize: 12 }} dataKey="timestamp" />
          <YAxis tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} orientation="right" yAxisId="right" />
          <Tooltip />
          <Legend />
          <Bar type="monotone" dataKey="tvl" barSize={16} stackId="a" fill="#413ea0" name="TVL" />
          <Line type="monotone" dataKey="line" stroke="#ff7300" strokeWidth={3} dot={false} yAxisId="right" name="Cumulative" />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export default TVLChart