import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as echarts from 'echarts'
import { Card, Row, Col, Statistic } from 'antd'
import { RiseOutlined, GroupOutlined, AimOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { getLeadsSnapshot } from '@/api/leadsApi'

export function EchartsDashboardPage() {
  const barChartRef = useRef<HTMLDivElement>(null)
  const pieChartRef = useRef<HTMLDivElement>(null)
  const lineChartRef = useRef<HTMLDivElement>(null)
  const radarChartRef = useRef<HTMLDivElement>(null)

  const { data: chartData = [] } = useQuery({
    queryKey: ['leads-chart-data'],
    queryFn: () => Promise.resolve(getLeadsSnapshot()),
  })

  useEffect(() => {
    const barChart = echarts.init(barChartRef.current)
    const statusCounts: { [key: string]: number } = {
      新线索: 0,
      跟进中: 0,
      已成交: 0,
      已关闭: 0,
    }
    chartData.forEach((item) => {
      const status = item.status as keyof typeof statusCounts
      if (Object.prototype.hasOwnProperty.call(statusCounts, status)) {
        statusCounts[status]++
      }
    })

    barChart.setOption({
      title: {
        text: '线索状态分布',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        textStyle: { color: '#333' },
        formatter: (params: Array<{ name: string; value: number }>) => {
          const first = params[0]
          if (!first) return ''
          return `${first.name}<br/>数量: <strong>${first.value}</strong> 条`
        },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['新线索', '跟进中', '已成交', '已关闭'],
        axisLine: { lineStyle: { color: '#e8e8e8' } },
        axisLabel: { color: '#666' },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
      },
      series: [
        {
          type: 'bar',
          data: [
            { value: statusCounts['新线索'], itemStyle: { color: '#ff4d4f', borderRadius: [4, 4, 0, 0] } },
            { value: statusCounts['跟进中'], itemStyle: { color: '#1890ff', borderRadius: [4, 4, 0, 0] } },
            { value: statusCounts['已成交'], itemStyle: { color: '#52c41a', borderRadius: [4, 4, 0, 0] } },
            { value: statusCounts['已关闭'], itemStyle: { color: '#bfbfbf', borderRadius: [4, 4, 0, 0] } },
          ],
          barWidth: '50%',
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
        },
      ],
    })

    return () => barChart.dispose()
  }, [chartData])

  useEffect(() => {
    const pieChart = echarts.init(pieChartRef.current)
    const channelCounts: { [key: string]: number } = {}
    chartData.forEach((item) => {
      channelCounts[item.channel] = (channelCounts[item.channel] || 0) + 1
    })

    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']

    pieChart.setOption({
      title: {
        text: '渠道来源分布',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e8e8e8',
        textStyle: { color: '#333' },
      },
      legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#666' } },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 16, fontWeight: 'bold', color: '#333' },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
          color: colors,
          data: Object.entries(channelCounts).map(([name, value]) => ({ name, value })),
        },
      ],
    })

    return () => pieChart.dispose()
  }, [chartData])

  useEffect(() => {
    const lineChart = echarts.init(lineChartRef.current)
    const ownerCounts: { [key: string]: number } = {}
    chartData.forEach((item) => {
      ownerCounts[item.owner] = (ownerCounts[item.owner] || 0) + 1
    })

    lineChart.setOption({
      title: {
        text: '负责人线索数量',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e8e8e8',
        textStyle: { color: '#333' },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: Object.keys(ownerCounts),
        axisLine: { lineStyle: { color: '#e8e8e8' } },
        axisLabel: { color: '#666' },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
      },
      series: [
        {
          name: '线索数量',
          type: 'line',
          data: Object.values(ownerCounts),
          smooth: true,
          lineStyle: { width: 3, color: '#667eea' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
              { offset: 1, color: 'rgba(102, 126, 234, 0.05)' },
            ]),
          },
          symbol: 'circle',
          symbolSize: 10,
          itemStyle: { color: '#667eea', borderWidth: 2, borderColor: '#fff' },
          emphasis: {
            scale: true,
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(102, 126, 234, 0.5)',
            },
          },
        },
      ],
    })

    return () => lineChart.dispose()
  }, [chartData])

  useEffect(() => {
    const radarChart = echarts.init(radarChartRef.current)

    const statusCounts: { [key: string]: number } = {
      新线索: 0,
      跟进中: 0,
      已成交: 0,
      已关闭: 0,
    }
    chartData.forEach((item) => {
      const status = item.status as keyof typeof statusCounts
      if (Object.prototype.hasOwnProperty.call(statusCounts, status)) {
        statusCounts[status]++
      }
    })

    const maxCount = Math.max(...Object.values(statusCounts), 1)

    radarChart.setOption({
      title: {
        text: '线索状态分析',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e8e8e8',
        textStyle: { color: '#333' },
      },
      legend: { data: ['当前分布'], textStyle: { color: '#666' } },
      radar: {
        indicator: [
          { name: '新线索', max: maxCount },
          { name: '跟进中', max: maxCount },
          { name: '已成交', max: maxCount },
          { name: '已关闭', max: maxCount },
        ],
        shape: 'polygon',
        splitNumber: 4,
        axisName: { color: '#666', fontSize: 12 },
        splitLine: { lineStyle: { color: '#e8e8e8' } },
        splitArea: { areaStyle: { color: ['#fafafa', '#fff'] } },
        axisLine: { lineStyle: { color: '#e8e8e8' } },
      },
      series: [
        {
          name: '线索分布',
          type: 'radar',
          data: [
            {
              value: [
                statusCounts['新线索'],
                statusCounts['跟进中'],
                statusCounts['已成交'],
                statusCounts['已关闭'],
              ],
              name: '当前分布',
              areaStyle: { color: 'rgba(102, 126, 234, 0.3)' },
              lineStyle: { color: '#667eea', width: 2 },
              itemStyle: { color: '#667eea' },
              symbol: 'circle',
              symbolSize: 6,
            },
          ],
        },
      ],
    })

    const handleResize = () => {
      radarChart.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      radarChart.dispose()
    }
  }, [chartData])

  const totalCount = chartData.length
  const dealRate =
    totalCount === 0
      ? 0
      : Math.round((chartData.filter((i) => i.status === '已成交').length / totalCount) * 100)
  const followCount = chartData.filter((i) => i.status === '跟进中').length
  const newCount = chartData.filter((i) => i.status === '新线索').length

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            variant="borderless"
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GroupOutlined style={{ fontSize: '24px', color: '#fff' }} />
              </div>
              <div>
                <Statistic
                  title="总线索数"
                  value={totalCount}
                  styles={{ content: { color: '#333', fontSize: '24px', fontWeight: 'bold' } }}
                />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            variant="borderless"
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RiseOutlined style={{ fontSize: '24px', color: '#fff' }} />
              </div>
              <div>
                <Statistic
                  title="成交率"
                  value={dealRate}
                  suffix="%"
                  styles={{ content: { color: '#52c41a', fontSize: '24px', fontWeight: 'bold' } }}
                />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            variant="borderless"
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AimOutlined style={{ fontSize: '24px', color: '#fff' }} />
              </div>
              <div>
                <Statistic
                  title="跟进中"
                  value={followCount}
                  styles={{ content: { color: '#faad14', fontSize: '24px', fontWeight: 'bold' } }}
                />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            variant="borderless"
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ClockCircleOutlined style={{ fontSize: '24px', color: '#fff' }} />
              </div>
              <div>
                <Statistic
                  title="新线索"
                  value={newCount}
                  styles={{ content: { color: '#ff4d4f', fontSize: '24px', fontWeight: 'bold' } }}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card
            title="状态分布柱状图"
            variant="borderless"
            style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}
          >
            <div ref={barChartRef} style={{ width: '100%', height: '320px' }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="渠道来源饼图"
            variant="borderless"
            style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}
          >
            <div ref={pieChartRef} style={{ width: '100%', height: '320px' }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="负责人统计折线图"
            variant="borderless"
            style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}
          >
            <div ref={lineChartRef} style={{ width: '100%', height: '320px' }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="状态雷达图"
            variant="borderless"
            style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}
          >
            <div ref={radarChartRef} style={{ width: '100%', height: '320px' }} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
