import { EChartsOption, init } from "echarts"

/**
 * @author: lipeng
 * @description: 获取单条柱状图
 * @param id 获取dom的id
 * @param color 柱状图颜色
 * @param yAxisTitle y轴说明标题
 * @param xDate x轴数据
 * @param ydate y轴数据
 * @param rotate x周倾斜角度
 */
export function barChartBySingle(id: string, color: string, yAxisTitle: string, xDate: string[] = [], ydate: string[] | number[] = [], xRotate: number) {
  // 获取dom，断言HTMLElement类型，否则会报错
  const chartEle: HTMLElement = document.getElementById(id) as HTMLElement
  const chart = init(chartEle)
  const option: EChartsOption = {
    color: [color],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    xAxis: {
      type: "category",
      axisTick: {
        alignWithLabel: true
      },
      axisLabel: {
        // interval: 1,
        rotate: xRotate
      },
      data: xDate
    },
    yAxis: {
      type: "value",
      name: yAxisTitle
    },
    series: [
      {
        data: ydate,
        type: "bar",
        itemStyle: {
          borderRadius: [13, 13, 0, 0]
        }
      }
    ]
  }
  option && chart.setOption(option)

  window.addEventListener("resize", function () {
    chart.resize()
  })
}

/**
 * @author: lipeng
 * @description: 获取多条柱状图
 * @param id 获取dom的id
 * @param color 柱状图颜色
 * @param yAxisTitle y轴说明标题
 * @param xDate x轴数据
 * @param ydate y轴数据
 */
export function barChartByGroups(id: string, colors: string[] = [], yAxisTitle: string, xDate: string[] = [], seriess: any[]) {
  // 获取dom，断言HTMLElement类型，否则会报错
  const chartEle: HTMLElement = document.getElementById(id) as HTMLElement
  const chart = init(chartEle)
  const option: EChartsOption = {
    color: colors,
    legend: {},
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    // dataset: {
    //     source: [
    //         ['product', '鉴权系统', '主数据', '加密系统'],
    //         ['鉴权系统', 1000, 1200, 1300],
    //         ['主数据', 1500, 1000, 1200],
    //         ['加密系统', 1200, 1500, 1200]
    //     ]
    // },
    xAxis: {
      type: "category",
      data: xDate
    },
    yAxis: {
      type: "value",
      name: yAxisTitle
    },
    series: seriess
    // series: [
    //     {
    //         name: '鉴权系统',
    //         type: 'bar',
    //         data: [
    //             2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3
    //         ],
    //         markPoint: {
    //             data: [
    //                 {type: 'max', name: 'Max'},
    //                 {type: 'min', name: 'Min'}
    //             ]
    //         },
    //         markLine: {
    //             data: [{type: 'average', name: 'Avg'}]
    //         }
    //     },
    //     {
    //         name: '主数据',
    //         type: 'bar',
    //         data: [
    //             2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3
    //         ],
    //         markPoint: {
    //             data: [
    //                 {name: 'Max', value: 182.2, xAxis: 7, yAxis: 183},
    //                 {name: 'Min', value: 2.3, xAxis: 11, yAxis: 3}
    //             ]
    //         },
    //         markLine: {
    //             data: [{type: 'average', name: 'Avg'}]
    //         }
    //     },
    //     {
    //         name: '加密系统',
    //         type: 'bar',
    //         data: [
    //             2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3
    //         ],
    //         markPoint: {
    //             data: [
    //                 {name: 'Max', value: 182.2, xAxis: 7, yAxis: 183},
    //                 {name: 'Min', value: 2.3, xAxis: 11, yAxis: 3}
    //             ]
    //         },
    //         markLine: {
    //             data: [{type: 'average', name: 'Avg'}]
    //         }
    //     }
    // ]
  }
  option && chart.setOption(option)

  window.addEventListener("resize", function () {
    chart.resize()
  })
}

/**
 * @author: lipeng
 * @param id 获取dom的id
 * @param name 图例名称
 * @param fontSize 标题字体大小
 * @param data  数据
 */
export function doughnutChart(id: string, name: string, fontSize: number = 14, data: { value: number; name: string }[] = []) {
  // 获取dom，断言HTMLElement类型，否则会报错
  const chartEle: HTMLElement = document.getElementById(id) as HTMLElement
  const chart = init(chartEle)
  const option: EChartsOption = {
    // color: [color],
    // 配置提示框组件（鼠标悬停时显示的信息）
    tooltip: {
      trigger: "item" // 触发类型为 'item'，表示鼠标悬停在图表的具体数据项上时触发提示
      // formatter: "{a} <br/>{b}: {c} ({d}%)" // 提示框显示完整信息
    },
    // 配置图例组件（图表的说明标签）
    // legend: {
    //   top: "5%", // 图例距离顶部的距离为 5%
    //   left: "center" // 图例水平居中显示
    // },
    // 配置图例组件（图表的说明标签）
    legend: {
      orient: "vertical", // 图例垂直排列
      right: 10, // 图例距离容器右侧10px
      top: "center", // 图例垂直居中
      textStyle: {
        width: 120, // 限制图例文字宽度为120px
        overflow: "truncate" // 超出部分显示省略号
      },
      type: "scroll", // 图例过多时可滚动
      pageIconSize: 10, // 翻页按钮大小
      pageButtonItemGap: 5 // 翻页按钮之间的间距
    },
    series: [
      {
        name: name, // 系列名称，用于 tooltip 的显示和图例的标识
        type: "pie", // 图表类型为饼图
        radius: ["40%", "70%"], // 饼图的半径范围，内半径 40%，外半径 70%，形成环形图
        center: ["35%", "50%"], // 图表向左偏移，给右侧标签留出空间
        avoidLabelOverlap: false, // 关闭标签重叠避免策略（允许标签重叠）
        // 配置饼图扇区的标签（非强调状态）
        label: {
          show: false, // 不显示标签
          position: "center" // 如果显示，标签位置在中心
        },

        // 配置鼠标 hover 时的强调样式
        emphasis: {
          label: {
            show: true, // 显示标签
            fontSize: fontSize, // 字体大小为 40
            fontWeight: "bold" // 字体加粗
          }
        },
        // 配置标签与扇区之间的连接线
        labelLine: {
          show: false // 不显示连接线
        },
        // 图表的具体数据
        data: data
        // data: [
        //   { value: 1048, name: "Search Engine" },
        //   { value: 735, name: "Direct" },
        //   { value: 580, name: "Email" },
        //   { value: 484, name: "Union Ads" },
        //   { value: 300, name: "Video Ads" }
        // ]
      }
    ]
  }
  option && chart.setOption(option)

  window.addEventListener("resize", function () {
    chart.resize()
  })
}
