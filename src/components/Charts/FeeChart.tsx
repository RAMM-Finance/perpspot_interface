import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import styled from 'styled-components/macro'

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

const startDate = new Date('2022-04-01')
const endDate = new Date('2022-05-30')

const data: any[] = []

let line = 0

for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
  const formattedDate = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })
  const uv = Math.floor(Math.random() * 1000)
  const pv = Math.floor(Math.random() * 1000)
  const amt = Math.floor(Math.random() * 1000)
  line += Math.floor(Math.random() * 1000)

  data.push({ timestamp: formattedDate, uv, pv, amt, line })
}

const VolumeChart = () => {
  return (
    <ChartContainer>
      <ChartHeader>Fee</ChartHeader>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
          syncId="syncA"
        >
          <CartesianGrid strokeDasharray="5 5" stroke="#808080" />
          <XAxis tick={{ fontSize: 12 }} dataKey="timestamp" />
          <YAxis tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} orientation="right" yAxisId="right" />
          <Tooltip />
          <Legend />
          <Bar type="monotone" dataKey="uv" barSize={16} stackId="a" fill="#413ea0" name="uv" />
          <Bar type="monotone" dataKey="pv" barSize={16} stackId="a" fill="#c43a31" name="pv" />
          <Bar type="monotone" dataKey="amt" barSize={16} stackId="a" fill="#82ca9d" name="amt" />
          <Line
            type="monotone"
            dataKey="line"
            stroke="#ff7300"
            strokeWidth={3}
            dot={false}
            yAxisId="right"
            name="Cumulative"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export default VolumeChart
