import {EChartsOption, init} from "echarts";

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
    const chartEle: HTMLElement = document.getElementById(id) as HTMLElement;
    const chart = init(chartEle);
    const option: EChartsOption = {
        color: [
            color
        ],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        xAxis: {
            type: 'category',
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
            type: 'value',
            name: yAxisTitle,
        },
        series: [
            {
                data: ydate,
                type: 'bar',
                itemStyle: {
                    borderRadius: [13, 13, 0, 0],
                },
            }
        ]
    };
    option && chart.setOption(option);

    window.addEventListener('resize', function () {
        chart.resize();
    });
};


/**
 * @author: lipeng
 * @description: 获取单条柱状图
 * @param id 获取dom的id
 * @param color 柱状图颜色
 * @param yAxisTitle y轴说明标题
 * @param xDate x轴数据
 * @param ydate y轴数据
 */
export function barChartByGroups(id: string, colors: string[] = [], yAxisTitle: string, xDate: string[] = [], seriess: any[]) {
    // 获取dom，断言HTMLElement类型，否则会报错
    const chartEle: HTMLElement = document.getElementById(id) as HTMLElement;
    const chart = init(chartEle);
    const option: EChartsOption = {
        color: colors,
        legend: {},
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
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
            type: 'category',
            data: xDate
        },
        yAxis: {
            type: 'value',
            name: yAxisTitle,
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
    };
    option && chart.setOption(option);

    window.addEventListener('resize', function () {
        chart.resize();
    });
};