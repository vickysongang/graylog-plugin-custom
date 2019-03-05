import React from 'react';
import ReactEcharts from 'echarts-for-react';
import PropTypes from 'prop-types';
import { macarons } from 'utils/Theme';
import echarts from 'echarts';
import Reflux from 'reflux';
import { MonitorActions, MonitorStore } from 'stores/MonitorStore';

const MonitorBarChart = React.createClass({
    mixins: [Reflux.connect(MonitorStore)],

    propTypes : {
        text: PropTypes.string,
        subtext: PropTypes.string,
        pod: PropTypes.string,
        rangeType: PropTypes.string
    },

    componentWillMount() {
        echarts.registerTheme('macarons', macarons);
    },

    componentDidMount() {
        this.loadDatas();
        this.timer = setInterval(() => {
            console.log("10s刷新数据...");
            this.loadDatas()
        }, 100000);
    },

    componentWillUnmount() {
        this.timer && clearInterval(this.timer);
    },

    loadDatas() {
        let keyword = this.props.keyword || '1 day ago';
        let uniqueKey = this.props.pod + "_" + keyword.replace(/ /g, "_");
        const promise = MonitorActions.getMonitorDatas('count',keyword, 'app_name', 'pod: ' + this.props.pod, uniqueKey);
        promise.catch(() => {
            console.log('load data error');
        });
    },

    getOption() {
        let monitorDatas = this.state.monitorDatas;
        let keyword = this.props.keyword || '1 day ago';
        let key = this.props.pod + "_" + keyword.replace(/ /g, "_");
        let appNames = [], normalDatas = [], errorDatas = [], timeoutDatas = [];
        if (monitorDatas[key]) {
            Object.keys(monitorDatas[key][0].terms).forEach((appName) => {
                appNames.push(appName);
                let allCount = monitorDatas[key][0].terms[appName] || 0;
                let errorCount = monitorDatas[key][1].terms[appName] || 0;
                let timeoutCount = monitorDatas[key][2].terms[appName] || 0
                normalDatas.push(allCount - errorCount - timeoutCount);
                errorDatas.push(errorCount);
                timeoutDatas.push(timeoutCount);
            })
        }
        let link = '/monitor/request?pod=' + this.props.pod + '&keyword=' + keyword ;
        let option = {
            title : {
                text: this.props.text,
                link: link,
                subtext: this.props.subtext,
                sublink: link
            },
            tooltip : {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: function (params){
                    let text = '';
                    if (params[0] && params[0] && params[2]) {
                        text = text + params[0].name + ' : ' + (params[0].value + params[1].value + params[2].value) +'<br/>';
                    }
                    if (params[0]) {
                        text = text  + params[0].seriesName + ' : ' + params[0].value + '<br/>';
                    }
                    if (params[1]) {
                        text = text + params[1].seriesName + ' : ' + params[1].value + '<br/>';
                    }
                    if (params[2]) {
                        text = text + params[2].seriesName + ' : ' + params[2].value;
                    }
                    return text;
                }
            },
            legend: {
                selectedMode: true,
                data:['Normal', 'Error(402-5xx)', 'Timeout(耗时>2s)']
            },
            toolbox: {
                show : false,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            calculable : true,
            xAxis : [
                {
                    type : 'category',
                    data : appNames,
                    axisLabel: {
                        rotate: 60
                    }
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    boundaryGap: [0, 0.1]
                }
            ],
            series : [
                {
                    name:'Normal',
                    type:'bar',
                    stack: 'sum',
                    barCategoryGap: '50%',
                    itemStyle: {
                        normal: {
                            color: '#7B68EE',
                            barBorderRadius:0,
                            label : {
                                show: false,
                                position: 'left',
                                textStyle: {
                                    color: 'black'
                                }
                            }
                        }
                    },
                    data: normalDatas
                },
                {
                    name:'Error(402-5xx)',
                    type:'bar',
                    stack: 'sum',
                    itemStyle: {
                        normal: {
                            color: 'red',
                            barBorderRadius:0,
                            label : {
                                show: false,
                                position: 'insideBottom',
                                textStyle: {
                                    color: 'black'
                                }
                            }
                        }
                    },
                    data: errorDatas
                },
                {
                    name:'Timeout(耗时>2s)',
                    type:'bar',
                    stack: 'sum',
                    itemStyle: {
                        normal: {
                            color: 'yellow',
                            barBorderRadius:0,
                            label : {
                                show: false,
                                position: 'top',
                                formatter: function (params) {
                                    for (let i = 0, l = option.xAxis[0].data.length; i < l; i++) {
                                        if (option.xAxis[0].data[i] == params.name) {
                                            return option.series[0].data[i] + option.series[1].data[i] + params.value;
                                        }
                                    }
                                },
                                textStyle: {
                                    color: '#000'
                                }
                            }
                        }
                    },
                    data: timeoutDatas
                }
            ]
        };
        return option;
    },

    onChartClick(e) {
        let keyword = this.props.keyword || '1 day ago';
        let url = '/monitor/request?pod=' + this.props.pod + '&app_name='+ e.name + '&keyword=' + keyword ;
        window.open(url,'_blank')
    },

    onChartReady(chart) {
        if (this.state.monitorDatas) {
            console.log('chart is::::', chart)
         //   chart.hideLoading();
        }
    },

    getLoadingOption() {
        return {
            text: '加载中...',
            color: '#4413c2',
            textColor: '#270240',
            maskColor: 'rgba(194, 88, 86, 0.3)',
            zlevel: 0
        };
    },

    render() {
        let onEvents = {
                'click': this.onChartClick,
        }
        return (
            <ReactEcharts
                notMerge={true}
                option={this.getOption()}
                theme={"macarons"}
                style={{height: '250px', width: this.props.width || '50%'}}
                onEvents={onEvents}
                showLoading={false}
                loadingOption={this.getLoadingOption()}
                onChartReady={(chart) => {
                    //this.onChartReady(chart)
                }}
                className='react_for_echarts' />
        );
    }
});

export default MonitorBarChart;