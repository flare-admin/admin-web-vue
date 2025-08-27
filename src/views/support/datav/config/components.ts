import type { ComponentCategory } from '@/types/datav';

// 组件模板配置
const componentTemplates: ComponentCategory[] = [
  {
    key: 'charts',
    title: '图表',
    children: [
      {
        type: 'line',
        name: '折线图',
        width: 400,
        height: 300,
        zIndex: 1,
        option: {
          backgroundColor: 'transparent',
          textStyle: {
            color: '#fff'
          },
          xAxis: {
            type: 'category',
            axisLine: {
              lineStyle: {
                color: '#666'
              }
            },
            axisLabel: {
              color: '#fff'
            },
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          },
          yAxis: {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: '#666'
              }
            },
            axisLabel: {
              color: '#fff'
            },
            splitLine: {
              lineStyle: {
                color: '#333'
              }
            }
          },
          series: [
            {
              data: [150, 230, 224, 218, 135, 147, 260],
              type: 'line',
              itemStyle: {
                color: '#165dff'
              }
            }
          ]
        }
      },
      {
        type: 'bar',
        name: '柱状图',
        width: 400,
        height: 300,
        zIndex: 1,
        option: {
          xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              data: [120, 200, 150, 80, 70, 110, 130],
              type: 'bar'
            }
          ]
        }
      },
      {
        type: 'pie',
        name: '饼图',
        width: 400,
        height: 300,
        zIndex: 1,
        option: {
          series: [
            {
              type: 'pie',
              radius: '50%',
              data: [
                { value: 1048, name: 'Search Engine' },
                { value: 735, name: 'Direct' },
                { value: 580, name: 'Email' },
                { value: 484, name: 'Union Ads' },
                { value: 300, name: 'Video Ads' }
              ]
            }
          ]
        }
      }
    ]
  }
];

export default componentTemplates;
