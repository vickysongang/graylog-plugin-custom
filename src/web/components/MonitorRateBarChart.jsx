import React from 'react';
import ReactEcharts from 'echarts-for-react';
import PropTypes from 'prop-types';
import { macarons } from 'utils/Theme';
import echarts from 'echarts';
import Reflux from 'reflux';
import { MonitorActions, MonitorStore } from 'stores/MonitorStore';

const MonitorRateBarChart = React.createClass({
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
            console.log("60s刷新数据...");
            this.loadDatas()
        }, 60000);
    },

    componentWillUnmount() {
        this.timer && clearInterval(this.timer);
    },

    loadDatas() {
        let keyword = this.props.keyword || '1 day ago';
        let uniqueKey = this.props.pod + "_" + keyword.replace(/ /g, "_") + "_request";
        const promise = MonitorActions.getMonitorDatas('rate',keyword, 'app_name', 'pod: ' + this.props.pod, uniqueKey);
        promise.catch(() => {
            console.log('load data error');
        });
    },

    getOption() {
        let monitorDatas = this.state.monitorDatas;
        let keyword = this.props.keyword || '1 day ago';
        let key = this.props.pod + "_" + keyword.replace(/ /g, "_") + "_request";
        let appNames = [], rataDatas = [];
        if (monitorDatas[key]) {
            Object.keys(monitorDatas[key][0].terms).forEach((appName) => {
                appNames.push(appName);
                let allCount = monitorDatas[key][0].terms[appName] || 1;
                let unnormalCount = monitorDatas[key][1].terms[appName] || 0;
                rataDatas.push(unnormalCount / allCount);
            })
        }
        let link = '/monitor/request?pod=' + this.props.pod  + '&keyword=' + keyword ;
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
                    let text = params[0].name +'<br/>';
                    let percentValue = (params[0].value * 100).toFixed(2) + '%';
                    text = text + params[0].seriesName + ' : ' + percentValue;
                    return text;
                }
            },
            legend: {
                selectedMode: false,
                data:['Error&Timeout Req占比']
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
                        interval: 0,
                        rotate: 60,
                        clickable: true
                        // formatter:function(value) {
                        //     return value.split("").join("\n");
                        // }
                    }
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    boundaryGap: [0, 0.1],
                    axisLabel: {
                        show: true,
                        interval: 'auto',
                        formatter: function (value) {
                            let yValue = value * 100;
                            return yValue.toFixed(0) + '%';
                        }
                    }
                }
            ],
            series : [
                {
                    name:'Error&Timeout Req占比',
                    type:'bar',
                    stack: 'sum',
                    barCategoryGap: '50%',
                    itemStyle: {
                        normal: {
                            color: function (params) {
                                if (params.data > 0.1) {
                                    return 'red';
                                }
                                return '#7B68EE';
                            },
                            barBorderRadius:0,
                            label : {
                                show: false,
                                position: 'top',
                                textStyle: {
                                    color: 'black'
                                },
                                formatter: function (params){
                                    return (params.value * 100).toFixed(2) + '%';
                                }
                            }
                        }
                    },
                    data: rataDatas
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
            chart.hideLoading();
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

export default MonitorRateBarChart;