import React from 'react';
import ReactEcharts from 'echarts-for-react';
import PropTypes from 'prop-types';
import { macarons } from 'utils/Theme';
import echarts from 'echarts';
import Reflux from 'reflux';
import { ChartActions, ChartStore } from 'stores/ChartStore';

const ChartVisualization = React.createClass({
    mixins: [Reflux.connect(ChartStore)],

    propTypes : {
        chartDatas: PropTypes.object,
    },

    getInitialState() {
       return {
           chartKey: new Date().valueOf(),
       }
    },

    componentWillMount() {
        echarts.registerTheme('macarons', macarons);
    },

    componentDidMount() {
        let chartDatas = this.props.chartDatas || this.state.chartDatas;
        if (!chartDatas) {
            ChartActions.getChartDatas(
                this.props.config.query,
                this.props.config.field,
                this.props.config.rangeType,
                this.props.config.rangeParams,
                this.props.config.streamId,
                this.props.config.dimension || 'count'
            );
        }
    },

    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
            this.setState({
                chartKey: new Date().valueOf()
            });
        }
    },

    getOption(chartDatas) {
        let options = {
            title : {
                text: ''
            },
            tooltip : {
                trigger: 'axis'
            },
            legend: {
                data:['访问量']
            },
            toolbox: {
                show : true,
                feature : {
                    mark : {show: true},
                    magicType : {show: true, type: ['line', 'bar']},
                    restore : {show: true},
                }
            },
            calculable : true,
            xAxis : [
                {
                    type : 'category',
                    data : chartDatas.xAxisDatas,
                    axisLabel: {
                        interval:0,
                    }
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series : [
                {
                    name:'访问量',
                    type:'bar',
                    data: chartDatas.yAxisDatas,
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                position: 'inside',
                            }
                        }
                    }
                }
            ]
        };
        if (chartDatas.dimension === 'ratio') {
            options = {
                title : {
                    text: ''
                },
                tooltip : {
                    trigger: 'axis',
                    formatter: '{b}:{c}%'
                },
                legend: {
                    data:[]
                },
                toolbox: {
                    show : true,
                    feature : {
                        mark : {show: true},
                        magicType : {show: true, type: ['line', 'bar']},
                        restore : {show: true},
                    }
                },
                calculable : true,
                xAxis : [
                    {
                        type : 'category',
                        data : chartDatas.xAxisDatas,
                        axisLabel: {
                            interval:0,
                        }
                    }
                ],
                yAxis : [
                    {
                        type : 'value',
                        axisLabel: {
                            formatter: '{value} %'
                        }
                    }
                ],
                series : [
                    {
                        name:'访问量',
                        type:'bar',
                        data: chartDatas.yAxisDatas,
                        itemStyle: {
                            normal: {
                                label: {
                                    show: true,
                                    position: 'inside',
                                    formatter: '{c}%',
                                }
                            }
                        }
                    }
                ]
            }
        }
        return options;
    },

    render() {
        let chartDatas = this.props.chartDatas || this.state.chartDatas;
        if (!chartDatas) {
            return <div/>;
        }
        return (
          <div>
              <ReactEcharts
                  key={this.state.chartKey}
                  option={this.getOption(chartDatas)}
                  theme={"macarons"}
                  style={{height: '250px', width: '100%'}}
                  className='react_for_echarts' />
          </div>
        );
    }
});

export default ChartVisualization;